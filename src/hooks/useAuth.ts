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

// localStorage에서 Supabase 세션을 동기적으로 읽어 초기값으로 사용
// → 캐시/네트워크 상태와 무관하게 즉시 로그인 상태 표시
function getInitialAuthState(): AuthState {
  if (typeof window === "undefined" || !isSupabaseConfigured()) {
    return { user: null, session: null, profile: null, loading: true };
  }
  try {
    const raw = localStorage.getItem("dailyseed-auth");
    if (raw) {
      const parsed = JSON.parse(raw);
      const user = parsed?.user;
      if (user?.id) {
        return { user, session: parsed, profile: null, loading: false };
      }
    }
  } catch { /* ignore */ }
  return { user: null, session: null, profile: null, loading: true };
}

export function useAuth() {
  const [state, setState] = useState<AuthState>(getInitialAuthState);

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

    // 1) 기존 세션 복원 (새로고침 시 localStorage에서 읽기)
    supabase!.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        // 세션 즉시 반영 → 로그인 상태 빠르게 표시
        setState((s) => ({ ...s, user: session.user, session, loading: false }));
        // 프로필은 백그라운드에서 fetch
        const profile = await fetchOrCreateProfile(session.user);
        if (profile) setState((s) => ({ ...s, profile }));
      } else {
        setState((s) => ({ ...s, loading: false }));
      }
    });

    // 2) 이후 변경사항 구독 (로그인/로그아웃 등)
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

    // Safety: stop loading after 3s no matter what
    const timeout = setTimeout(() => {
      setState((s) => (s.loading ? { ...s, loading: false } : s));
    }, 3000);

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
    await supabase.auth.signOut({ scope: "global" });
    // 커스텀 캐시 + Supabase localStorage 키 모두 정리
    localStorage.removeItem("dailyseed-auth");
    const keysToRemove = Object.keys(localStorage).filter(k => k.startsWith("sb-"));
    keysToRemove.forEach(k => localStorage.removeItem(k));
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
