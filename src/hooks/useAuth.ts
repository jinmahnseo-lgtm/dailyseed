"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import type { User, Session } from "@supabase/supabase-js";

export interface Profile {
  id: string;
  role: "student" | "parent";
  display_name: string | null;
  created_at: string;
}

interface AuthState {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    profile: null,
    loading: true,
  });

  const fetchProfile = useCallback(async (userId: string) => {
    if (!supabase) return null;
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();
    return data as Profile | null;
  }, []);

  const createProfile = useCallback(async (userId: string, displayName?: string) => {
    if (!supabase) return null;
    const { data } = await supabase
      .from("profiles")
      .insert({
        id: userId,
        role: "student",
        display_name: displayName || null,
      })
      .select()
      .single();
    return data as Profile | null;
  }, []);

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setState((s) => ({ ...s, loading: false }));
      return;
    }

    // Get initial session
    supabase!.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        let profile = await fetchProfile(session.user.id);
        if (!profile) {
          const name =
            session.user.user_metadata?.full_name ||
            session.user.user_metadata?.name ||
            null;
          profile = await createProfile(session.user.id, name);
        }
        setState({
          user: session.user,
          session,
          profile,
          loading: false,
        });
      } else {
        setState({ user: null, session: null, profile: null, loading: false });
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase!.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        let profile = await fetchProfile(session.user.id);
        if (!profile) {
          const name =
            session.user.user_metadata?.full_name ||
            session.user.user_metadata?.name ||
            null;
          profile = await createProfile(session.user.id, name);
        }
        setState({
          user: session.user,
          session,
          profile,
          loading: false,
        });
      } else {
        setState({ user: null, session: null, profile: null, loading: false });
      }
    });

    return () => subscription.unsubscribe();
  }, [fetchProfile, createProfile]);

  const signInWithKakao = useCallback(async () => {
    if (!supabase) return;
    await supabase.auth.signInWithOAuth({
      provider: "kakao",
      options: { redirectTo: window.location.origin + "/" },
    });
  }, []);

  const signInWithGoogle = useCallback(async () => {
    if (!supabase) return;
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin + "/" },
    });
  }, []);

  const signOut = useCallback(async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    setState({ user: null, session: null, profile: null, loading: false });
  }, []);

  const updateProfile = useCallback(
    async (updates: Partial<Pick<Profile, "display_name" | "role">>) => {
      if (!supabase || !state.user) return;
      const { data } = await supabase
        .from("profiles")
        .update(updates)
        .eq("id", state.user.id)
        .select()
        .single();
      if (data) {
        setState((s) => ({ ...s, profile: data as Profile }));
      }
    },
    [state.user]
  );

  return {
    ...state,
    signInWithKakao,
    signInWithGoogle,
    signOut,
    updateProfile,
    isConfigured: isSupabaseConfigured(),
  };
}
