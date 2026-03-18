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

  const fetchOrCreateProfile = useCallback(async (user: User) => {
    if (!supabase) return null;
    const { data: existing } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();
    if (existing) return existing as Profile;

    const name =
      user.user_metadata?.full_name ||
      user.user_metadata?.name ||
      null;
    const { data: created } = await supabase
      .from("profiles")
      .insert({ id: user.id, role: "student", display_name: name })
      .select()
      .single();
    return created as Profile | null;
  }, []);

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setState((s) => ({ ...s, loading: false }));
      return;
    }

    // Just listen for auth state changes - Supabase handles everything
    const {
      data: { subscription },
    } = supabase!.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const profile = await fetchOrCreateProfile(session.user);
        setState({ user: session.user, session, profile, loading: false });
      } else {
        setState({ user: null, session: null, profile: null, loading: false });
      }
    });

    // Safety: stop loading after 1.5s no matter what
    const timeout = setTimeout(() => {
      setState((s) => (s.loading ? { ...s, loading: false } : s));
    }, 1500);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, [fetchOrCreateProfile]);

  const signInWithKakao = useCallback(async () => {
    if (!supabase) return;
    await supabase.auth.signInWithOAuth({
      provider: "kakao",
      options: { redirectTo: window.location.origin },
    });
  }, []);

  const signInWithGoogle = useCallback(async () => {
    if (!supabase) return;
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin },
    });
  }, []);

  const signOut = useCallback(async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
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
