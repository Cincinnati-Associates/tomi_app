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

  // Fetch profile data (creates one if missing)
  const fetchProfile = useCallback(async (userId: string, userEmail?: string | null, userName?: string | null) => {
    console.log('[useAuth] fetchProfile called for:', userId);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      console.log('[useAuth] Profile query result:', { data, error });

      if (error) {
        // Profile doesn't exist - try to create one
        if (error.code === 'PGRST116') {
          console.log('[useAuth] Profile not found, creating one...');
          const { data: newProfile, error: insertError } = await supabase
            .from('profiles')
            .insert({
              id: userId,
              email: userEmail || null,
              full_name: userName || null,
            })
            .select()
            .single();

          if (insertError) {
            console.error('[useAuth] Error creating profile:', insertError);
            return null;
          }
          console.log('[useAuth] Created new profile:', newProfile);
          return newProfile as Profile;
        }
        console.error('[useAuth] Error fetching profile:', error);
        return null;
      }

      return data as Profile;
    } catch (error) {
      console.error('[useAuth] Exception fetching profile:', error);
      return null;
    }
  }, [supabase]);

  const refreshProfile = useCallback(async () => {
    if (user?.id) {
      const profileData = await fetchProfile(user.id);
      setProfile(profileData);
    }
  }, [user?.id, fetchProfile]);

  useEffect(() => {
    // Get initial session
    const getSession = async () => {
      console.log('[useAuth] Getting session...');
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) {
          console.error('[useAuth] Session error:', sessionError);
          setIsLoading(false);
          return;
        }

        console.log('[useAuth] Session:', session ? 'exists' : 'null');
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          console.log('[useAuth] Fetching profile for user:', session.user.id);
          const profileData = await fetchProfile(
            session.user.id,
            session.user.email,
            session.user.user_metadata?.full_name || session.user.user_metadata?.name
          );
          console.log('[useAuth] Profile:', profileData);
          setProfile(profileData);
        }
      } catch (error) {
        console.error('[useAuth] Error getting session:', error);
      } finally {
        console.log('[useAuth] Setting isLoading to false');
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
          const profileData = await fetchProfile(
            session.user.id,
            session.user.email,
            session.user.user_metadata?.full_name || session.user.user_metadata?.name
          );
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
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
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
