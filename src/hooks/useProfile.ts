"use client";

import { useState, useCallback, useMemo } from 'react';
import { createClient } from '@/lib/supabase';
import { useAuthContext } from '@/providers/AuthProvider';
import type { Profile, ProfileUpdate } from '@/types/user';

interface UseProfileReturn {
  profile: Profile | null;
  isLoading: boolean;
  updateProfile: (data: ProfileUpdate) => Promise<{ error: Error | null }>;
  uploadAvatar: (file: File) => Promise<{ url: string | null; error: Error | null }>;
}

export function useProfile(): UseProfileReturn {
  const { profile, refreshProfile, isLoading: authLoading } = useAuthContext();
  const [isUpdating, setIsUpdating] = useState(false);

  const supabase = useMemo(() => createClient(), []);

  const updateProfile = useCallback(async (data: ProfileUpdate) => {
    if (!profile?.id) {
      return { error: new Error('No profile to update') };
    }

    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update(data)
        .eq('id', profile.id);

      if (error) {
        return { error: error as Error };
      }

      // Refresh profile data in context
      await refreshProfile();
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    } finally {
      setIsUpdating(false);
    }
  }, [supabase, profile?.id, refreshProfile]);

  const uploadAvatar = useCallback(async (file: File) => {
    if (!profile?.id) {
      return { url: null, error: new Error('No profile to update') };
    }

    setIsUpdating(true);
    try {
      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${profile.id}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) {
        return { url: null, error: uploadError as Error };
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // Update profile with new avatar URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', profile.id);

      if (updateError) {
        return { url: null, error: updateError as Error };
      }

      await refreshProfile();
      return { url: publicUrl, error: null };
    } catch (error) {
      return { url: null, error: error as Error };
    } finally {
      setIsUpdating(false);
    }
  }, [supabase, profile?.id, refreshProfile]);

  return {
    profile,
    isLoading: authLoading || isUpdating,
    updateProfile,
    uploadAvatar,
  };
}
