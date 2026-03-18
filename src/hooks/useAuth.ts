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
    // Try fetch first
    const { data: existing } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();
    if (existing) return existing as Profile;

    // Create if not found
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

    let isMounted = true;

    const updateState = async (session: Session | null) => {
      if (!isMounted) return;
      if (session?.user) {
        const profile = await fetchOrCreateProfile(session.user);
        if (isMounted) {
          setState({ user: session.user, session, profile, loading: false });
        }
      } else {
        if (isMounted) {
          setState({ user: null, session: null, profile: null, loading: false });
        }
      }
    };

    // Step 1: Handle OAuth callback code if present
    const init = async () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const code = params.get("code");

        if (code) {
          console.log("[Auth] Exchanging code...");
          try {
            const { data, error } = await supabase!.auth.exchangeCodeForSession(code);
            console.log("[Auth] Exchange result:", error?.message || "success");
            // Clean URL regardless of result
            window.history.replaceState({}, "", window.location.pathname);
            if (data?.session) {
              await updateState(data.session);
              return;
            }
          } catch (e) {
            console.error("[Auth] Exchange error:", e);
            window.history.replaceState({}, "", window.location.pathname);
          }
        }

        // Step 2: Check existing session from localStorage
        const { data: { session } } = await supabase!.auth.getSession();
        console.log("[Auth] Existing session:", session?.user?.id || "none");
        await updateState(session);
      } catch (e) {
        console.error("[Auth] Init error:", e);
        if (isMounted) {
          setState({ user: null, session: null, profile: null, loading: false });
        }
      }
    };

    init();

    // Step 3: Listen for future auth changes (token refresh, sign out)
    const {
      data: { subscription },
    } = supabase!.auth.onAuthStateChange(async (_event, session) => {
      console.log("[Auth] State change:", _event);
      await updateState(session);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
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
