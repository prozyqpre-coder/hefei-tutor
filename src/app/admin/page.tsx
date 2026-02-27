"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
  const router = useRouter();
  const search = useSearchParams();
  const redirect = search.get("redirect") || "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleEmailLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const supabase = createClient();
      const { data: { user }, error: signInErr } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (signInErr || !user) {
        setError(signInErr?.message || "登录失败，请检查邮箱和密码");
        setLoading(false);
        return;
      }
      router.replace(redirect);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "登录失败");
      setLoading(false);
    }
  }

  // 测试账号登录：使用你在 Supabase 后台预先创建的账号
  // 账号：test@test.com  密码：123456
  async function handleTestLogin() {
    setError(null);
    setLoading(true);
    const supabase = createClient();
    const testEmail = "test@test.com";
    const testPassword = "123456";

    try {
      let { data: { user }, error } = await supabase.auth.signInWithPassword({
        email: testEmail,
        password: testPassword,
      });
      if (error || !user) {
        setError(error?.message || "测试账号登录失败，请确认账号已在 Supabase 后台创建");
        setLoading(false);
        return;
      }
      // 按你的要求：测试账号登录后，直接回首页
      router.replace("/");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "测试账号登录失败");
      setLoading(false);
    }
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!email || !password) {
      setError("请输入邮箱和密码");
      return;
    }
    if (password.length < 6) {
      setError("密码至少 6 位");
      return;
    }
    setLoading(true);
    try {
      const supabase = createClient();
      const { data, error: signUpErr } = await supabase.auth.signUp({
        email,
        password,
      });
      if (signUpErr || !data.user) {
        setError(signUpErr?.message || "注册失败");
        setLoading(false);
        return;
      }
      const { data: { user }, error: signInErr } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (signInErr || !user) {
        setError(signInErr?.message || "登录失败，请重试");
        setLoading(false);
        return;
      }
      router.replace(redirect);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "注册失败");
      setLoading(false);
    }
  }

  return (
    <div className="px-4 py-8">
      <h1 className="text-xl font-bold text-center">登录 / 注册</h1>
      <p className="mt-1 text-center text-sm text-muted-foreground">
        使用邮箱密码或临时一键登录，登录后即可发布信息
      </p>

      <div className="mx-auto mt-6 flex max-w-sm flex-col gap-6">
        <Button
          type="button"
          className="h-14 w-full rounded-2xl bg-[#07c160] text-base font-semibold text-white shadow-lg active:scale-[0.98]"
          disabled={loading}
          onClick={handleTestLogin}
        >
          {loading ? "登录中…" : "测试账号登录（test@test.com）"}
        </Button>

        <div className="border-t border-border pt-4">
          <form className="flex flex-col gap-4" onSubmit={handleEmailLogin}>
            <div className="space-y-2">
              <Label htmlFor="email">邮箱账号</Label>
              <Input
                id="email"
                type="email"
                placeholder="请输入邮箱"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-11 rounded-2xl"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">密码</Label>
              <Input
                id="password"
                type="password"
                placeholder="至少 6 位"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-11 rounded-2xl"
                required
              />
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <Button
              type="submit"
              className="mt-2 h-11 w-full rounded-2xl text-base font-semibold"
              disabled={loading}
            >
              邮箱密码登录
            </Button>
            <Button
              type="button"
              variant="outline"
              className="h-11 w-full rounded-2xl border-primary text-base font-semibold text-primary"
              disabled={loading}
              onClick={handleRegister}
            >
              邮箱注册并登录
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}

