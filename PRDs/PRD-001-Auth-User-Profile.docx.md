# **PRD-001: Authentication & User Profile**

| Version | 1.0 |
| :---- | :---- |
| **Status** | Draft |
| **Author** | Tomi Product Team |
| **Date** | December 2024 |
| **Phase** | Phase 0 — Foundation |

# **1\. Overview**

This PRD defines the authentication and user profile management system for the Tomi platform. It establishes the foundation for user identity, enabling all subsequent features including personal journeys, group membership, and AI agent interactions.

## **1.1 Purpose**

Enable users to securely create accounts, authenticate, and manage their profile information. This system must support future migration to Clerk and maintain SOC2/ISO27001 compliance readiness from inception.

## **1.2 Success Criteria**

* Users can register with email/password in under 60 seconds  
* Authentication flow completes in under 2 seconds  
* Zero authentication-related security incidents  
* All auth events logged for audit compliance  
* Profile completion rate exceeds 80%

# **2\. User Stories**

1.  **Registration:** As a prospective co-buyer, I want to create an account so that I can begin my homeownership journey and save my progress.

2.  **Login:** As a returning user, I want to securely access my account so that I can continue where I left off.

3.  **Password Recovery:** As a user who forgot my password, I want to reset it securely so that I can regain access to my account.

4.  **Profile Setup:** As a new user, I want to provide basic profile information so that co-buyers can identify me and the platform can personalize my experience.

5.  **Profile Edit:** As a user, I want to update my profile information so that it remains current.

6.  **Session Management:** As a security-conscious user, I want to log out and view active sessions so that I can protect my account.

# **3\. Functional Requirements**

## **3.1 Registration**

1. System shall accept email address and password for registration  
2. System shall validate email format and uniqueness before account creation  
3. System shall enforce password requirements: minimum 12 characters, at least one uppercase, one lowercase, one number, one special character  
4. System shall send email verification link within 30 seconds of registration  
5. System shall prevent login until email is verified

## **3.2 Authentication**

6. System shall authenticate users via email and password  
7. System shall issue JWT access tokens (15 min expiry) and refresh tokens (7 day expiry)  
8. System shall implement rate limiting: 5 failed attempts triggers 15-minute lockout  
9. System shall invalidate all sessions on password change  
10. System shall support concurrent sessions across devices

## **3.3 Password Recovery**

11. System shall send password reset link to verified email address  
12. Reset links shall expire after 1 hour  
13. System shall invalidate reset link after single use

## **3.4 User Profile**

14. System shall collect and store: display name (required), avatar URL (optional), phone number (optional), timezone (default to browser)  
15. System shall allow users to update profile fields at any time  
16. System shall validate phone number format if provided

# **4\. Data Model**

The following tables support authentication and user profile functionality. Auth tables are managed by Supabase Auth; profile data resides in the public schema.

## **4.1 Users Table (public.users)**

| Column | Type | Description |
| :---- | :---- | :---- |
| id | UUID | Primary key, references auth.users |
| email | VARCHAR(255) | User email, unique, synced from auth |
| display\_name | VARCHAR(100) | User-facing name, required |
| avatar\_url | TEXT | Profile image URL, optional |
| phone | VARCHAR(20) | Phone number, optional |
| timezone | VARCHAR(50) | IANA timezone, default UTC |
| created\_at | TIMESTAMPTZ | Account creation timestamp |
| updated\_at | TIMESTAMPTZ | Last profile update timestamp |

## **4.2 Audit Log Entries (for auth events)**

| Event Type | Logged Data | Retention |
| :---- | :---- | :---- |
| user.registered | user\_id, email, IP | 7 years (compliance) |
| user.login | user\_id, IP, user\_agent | 90 days |
| user.logout | user\_id, session\_id | 90 days |
| user.password\_reset | user\_id, IP | 7 years |
| user.profile\_updated | user\_id, changed\_fields | 90 days |

# **5\. API Endpoints**

All endpoints use JSON request/response bodies. Authentication required unless noted.

| Method | Endpoint | Description |
| :---- | :---- | :---- |
| POST | /api/auth/register | Create new user account (public) |
| POST | /api/auth/login | Authenticate and receive tokens (public) |
| POST | /api/auth/logout | Invalidate current session |
| POST | /api/auth/refresh | Exchange refresh token for new access token |
| POST | /api/auth/forgot-password | Initiate password reset flow (public) |
| POST | /api/auth/reset-password | Complete password reset with token (public) |
| GET | /api/users/me | Get current user profile |
| PATCH | /api/users/me | Update current user profile |
| POST | /api/users/me/avatar | Upload avatar image |

# **6\. UI/UX Requirements**

## **6.1 Screens**

* **Registration Page:** Email input, password input with strength indicator, terms acceptance checkbox, submit button  
* **Login Page:** Email input, password input, "Forgot password?" link, submit button  
* **Email Verification:** Confirmation message, resend link option  
* **Password Reset:** Email entry form, new password form with confirmation  
* **Profile Settings:** Avatar upload, display name, phone, timezone selector, save button

## **6.2 Design Principles**

* Minimal friction: fewest possible fields for registration  
* Clear error states with actionable messages  
* Loading states for all async operations  
* Mobile-first responsive design

# **7\. Security Requirements**

These requirements support SOC2 Type II and ISO27001 compliance readiness.

## **7.1 Password Security**

* Passwords hashed using bcrypt with cost factor 12  
* Passwords checked against HaveIBeenPwned API during registration  
* No password hints or security questions

## **7.2 Session Security**

* Access tokens stored in memory only (not localStorage)  
* Refresh tokens stored in httpOnly, secure, sameSite cookies  
* All auth cookies scoped to domain with Secure flag

## **7.3 Transport Security**

* HTTPS required for all endpoints (HSTS enabled)  
* TLS 1.2 minimum  
* CSRF protection via Supabase Auth

# **8\. Out of Scope (MVP)**

* OAuth providers (Google, Apple) — deferred to Clerk migration  
* Multi-factor authentication — Phase 2  
* Magic link authentication — Phase 2  
* Account deletion self-service — manual process for MVP  
* Identity verification (KYC) — future financial features

# **9\. Dependencies**

* **Supabase Auth:** Handles auth primitives, token management, email sending  
* **Supabase Storage:** Avatar image storage  
* **Resend or Supabase Email:** Transactional emails (verification, password reset)  
* **Vercel:** Hosting and edge functions

# **10\. Open Questions**

1. Should we collect additional profile fields during onboarding (location, housing goals) or defer to journey exercises?  
2. Preferred email provider for transactional emails: Supabase native vs. Resend?  
3. Avatar requirements: file size limits, auto-cropping, default avatars?  
4. Session duration preferences: 7-day refresh token acceptable for alpha?

# **11\. Acceptance Criteria**

This PRD is considered complete when:

| Criterion | Validation Method |
| :---- | :---- |
| User can register with email/password | Manual test |
| Email verification flow works end-to-end | Manual test |
| Login returns valid JWT tokens | API test |
| Password reset flow works end-to-end | Manual test |
| Profile can be viewed and updated | API test |
| Rate limiting blocks brute force attempts | Load test |
| All auth events appear in audit log | DB query |
| Tokens expire correctly | API test |

# **Revision History**

| Version | Date | Changes |
| :---- | :---- | :---- |
| 1.0 | December 2024 | Initial draft |

