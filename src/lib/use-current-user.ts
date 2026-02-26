"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase";
import { getFakeUserIdFromStorage } from "@/lib/auth-fake";

export type CurrentUser =
  | { type: "supabase"; id: string }
  | { type: "fake"; id: string }
  | null;

/** 获取当前用户：优先 Supabase Auth，否则为模拟微信用户（localStorage） */
export function useCurrentUser(): { user: CurrentUser; loading: boolean } {
  const [user, setUser] = useState<CurrentUser>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      const supabase = createClient();
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (cancelled) return;
      if (authUser) {
        setUser({ type: "supabase", id: authUser.id });
        setLoading(false);
        return;
      }
      const fakeId = getFakeUserIdFromStorage();
      if (fakeId) {
        setUser({ type: "fake", id: fakeId });
      } else {
        setUser(null);
      }
      setLoading(false);
    }

    run();
    return () => {
      cancelled = true;
    };
  }, []);

  return { user, loading };
}
