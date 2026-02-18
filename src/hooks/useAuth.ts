"use client";

import { useState, useEffect, useCallback, useMemo } from 'react';
import { createClient } from '@/lib/supabase';
import type { User, Session, AuthChangeEvent } from '@supabase/supabase-js';
import type { Profile } from '@/types/user';

interface AuthState {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

interface AuthActions {
  isAdmin: boolean;
  isSuperAdmin: boolean;
  signInWithEmail: (email: string) => Promise<{ error: Error | null }>;
  signInWithPhone: (phone: string) => Promise<{ error: Error | null }>;
  signInWithPassword: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUpWithPassword: (email: string, password: string, fullName?: string) => Promise<{ error: Error | null; requiresConfirmation?: boolean }>;
  verifyOtp: (phone: string, token: string) => Promise<{ error: Error | null }>;
  signInWithGoogle: () => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

export function useAuth(): AuthState & AuthActions {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const supabase = useMemo(() => createClient(), []);

  // Fetch profile data via server-side API (bypasses RLS)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const fetchProfile = useCallback(async (userId: string) => {
    try {
      const res = await fetch('/api/users/me');

      if (!res.ok) {
        console.error('[useAuth] Profile fetch failed:', res.status);
        return null;
      }

      const profile = await res.json();
      return profile as Profile;
    } catch (error) {
      console.error('[useAuth] Exception fetching profile:', error);
      return null;
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    if (user?.id) {
      const profileData = await fetchProfile(user.id);
      setProfile(profileData);
    }
  }, [user?.id, fetchProfile]);

  useEffect(() => {
    // Get initial session
    const getSession = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) {
          console.error('[useAuth] Session error:', sessionError);
          setIsLoading(false);
          return;
        }

        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          const profileData = await fetchProfile(session.user.id);
          setProfile(profileData);
        }
      } catch (error) {
        console.error('[useAuth] Error getting session:', error);
      } finally {
        setIsLoading(false);
      }
    };

    getSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, session: Session | null) => {
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          // Small delay to allow trigger to create profile
          if (event === 'SIGNED_IN') {
            await new Promise(resolve => setTimeout(resolve, 500));
          }
          const profileData = await fetchProfile(session.user.id);
          setProfile(profileData);
        } else {
          setProfile(null);
        }

        setIsLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase, fetchProfile]);

  const signInWithEmail = useCallback(async (email: string) => {
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      return { error: error as Error | null };
    } catch (error) {
      return { error: error as Error };
    }
  }, [supabase]);

  const signInWithPassword = useCallback(async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      return { error: error as Error | null };
    } catch (error) {
      return { error: error as Error };
    }
  }, [supabase]);

  const signUpWithPassword = useCallback(async (email: string, password: string, fullName?: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: fullName ? { full_name: fullName } : undefined,
        },
      });

      // Check if email confirmation is required
      const requiresConfirmation = data.user && !data.session;

      return { error: error as Error | null, requiresConfirmation };
    } catch (error) {
      return { error: error as Error, requiresConfirmation: false };
    }
  }, [supabase]);

  const signInWithPhone = useCallback(async (phone: string) => {
    try {
      const { error } = await supabase.auth.signInWithOtp({
        phone,
      });
      return { error: error as Error | null };
    } catch (error) {
      return { error: error as Error };
    }
  }, [supabase]);

  const verifyOtp = useCallback(async (phone: string, token: string) => {
    try {
      const { error } = await supabase.auth.verifyOtp({
        phone,
        token,
        type: 'sms',
      });
      return { error: error as Error | null };
    } catch (error) {
      return { error: error as Error };
    }
  }, [supabase]);

  const signInWithGoogle = useCallback(async () => {
    try {
      // Preserve the redirect param (set by middleware) so the callback
      // can send the user back to the page they originally requested
      const params = new URLSearchParams(window.location.search)
      const redirect = params.get('redirect')
      const callbackUrl = new URL('/auth/callback', window.location.origin)
      if (redirect) callbackUrl.searchParams.set('next', redirect)

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: callbackUrl.toString(),
        },
      });
      return { error: error as Error | null };
    } catch (error) {
      return { error: error as Error };
    }
  }, [supabase]);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setProfile(null);
  }, [supabase]);

  return {
    user,
    session,
    profile,
    isLoading,
    isAuthenticated: !!user,
    isAdmin: profile?.role === 'admin' || profile?.role === 'superadmin',
    isSuperAdmin: profile?.role === 'superadmin',
    signInWithEmail,
    signInWithPassword,
    signUpWithPassword,
    signInWithPhone,
    verifyOtp,
    signInWithGoogle,
    signOut,
    refreshProfile,
  };
}
