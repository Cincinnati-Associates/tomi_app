/**
 * Simple in-memory rate limiter for API routes.
 *
 * Limits:
 * - Anonymous (IP-based): 20 requests/hour
 * - Authenticated (user-based): 50 requests/hour
 *
 * Uses a sliding window approach with automatic cleanup.
 */

interface RateLimitEntry {
  timestamps: number[];
}

const stores = new Map<string, Map<string, RateLimitEntry>>();

// Cleanup old entries every 10 minutes
let cleanupTimer: ReturnType<typeof setInterval> | null = null;

function ensureCleanup() {
  if (cleanupTimer) return;
  cleanupTimer = setInterval(() => {
    const now = Date.now();
    stores.forEach((store) => {
      store.forEach((entry, key) => {
        entry.timestamps = entry.timestamps.filter((t: number) => now - t < 3600_000);
        if (entry.timestamps.length === 0) {
          store.delete(key);
        }
      });
    });
  }, 600_000); // 10 min
}

interface RateLimitConfig {
  /** Unique name for this limiter (e.g. "chat", "leads") */
  name: string;
  /** Max requests per window for anonymous users */
  anonymousLimit?: number;
  /** Max requests per window for authenticated users */
  authenticatedLimit?: number;
  /** Window size in milliseconds (default: 1 hour) */
  windowMs?: number;
}

interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  resetMs: number;
}

export function createRateLimiter(config: RateLimitConfig) {
  const {
    name,
    anonymousLimit = 20,
    authenticatedLimit = 50,
    windowMs = 3600_000, // 1 hour
  } = config;

  if (!stores.has(name)) {
    stores.set(name, new Map());
  }
  const store = stores.get(name)!;
  ensureCleanup();

  return function checkRateLimit(opts: {
    /** Authenticated user ID, if available */
    userId?: string | null;
    /** Client IP address for anonymous users */
    ip: string;
  }): RateLimitResult {
    const now = Date.now();
    const isAuthenticated = !!opts.userId;
    const key = isAuthenticated ? `user:${opts.userId}` : `ip:${opts.ip}`;
    const limit = isAuthenticated ? authenticatedLimit : anonymousLimit;

    let entry = store.get(key);
    if (!entry) {
      entry = { timestamps: [] };
      store.set(key, entry);
    }

    // Remove timestamps outside the window
    entry.timestamps = entry.timestamps.filter((t) => now - t < windowMs);

    if (entry.timestamps.length >= limit) {
      // Rate limited
      const oldestInWindow = entry.timestamps[0];
      const resetMs = oldestInWindow + windowMs - now;

      return {
        success: false,
        limit,
        remaining: 0,
        resetMs,
      };
    }

    // Allow the request
    entry.timestamps.push(now);

    return {
      success: true,
      limit,
      remaining: limit - entry.timestamps.length,
      resetMs: windowMs,
    };
  };
}

/**
 * Extract client IP from a Next.js request.
 * Checks common proxy headers, falls back to "unknown".
 */
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  const realIp = request.headers.get("x-real-ip");
  if (realIp) {
    return realIp;
  }
  return "unknown";
}

/**
 * Build a standard 429 JSON response with rate limit headers.
 */
export function rateLimitResponse(result: RateLimitResult): Response {
  const retryAfter = Math.ceil(result.resetMs / 1000);

  return new Response(
    JSON.stringify({
      error: "Too many requests. Please slow down and try again later.",
      retryAfter,
    }),
    {
      status: 429,
      headers: {
        "Content-Type": "application/json",
        "Retry-After": String(retryAfter),
        "X-RateLimit-Limit": String(result.limit),
        "X-RateLimit-Remaining": "0",
      },
    }
  );
}
