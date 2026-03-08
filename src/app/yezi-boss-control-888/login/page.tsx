"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { adminPath, adminApiPath } from "@/lib/admin-path";

const LOCK_AFTER_FAILED = 5;
const LOCK_DURATION_MS = 15 * 60 * 1000; // 15 分钟

export default function AdminLoginPage() {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockUntil, setLockUntil] = useState<number | null>(null);

  const now = Date.now();
  const isLocked = lockUntil != null && now < lockUntil;
  const lockMinutesLeft = useMemo(() => {
    if (!lockUntil || now >= lockUntil) return 0;
    return Math.ceil((lockUntil - now) / 60000);
  }, [lockUntil, now]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isLocked) return;
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(adminApiPath("login"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: phone.trim(), password }),
        credentials: "same-origin",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const nextAttempts = failedAttempts + 1;
        setFailedAttempts(nextAttempts);
        setError(data?.error ?? "登录失败，请重试");
        if (nextAttempts >= LOCK_AFTER_FAILED) {
          setLockUntil(Date.now() + LOCK_DURATION_MS);
        }
        setLoading(false);
        return;
      }
      window.location.href = adminPath("verify");
      return;
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm space-y-4 rounded-lg border bg-card p-6 shadow-sm"
      >
        <h1 className="text-center text-lg font-semibold">管理员登录</h1>
        {isLocked ? (
          <p className="text-center text-sm text-destructive">
            连续输错次数过多，请 {lockMinutesLeft} 分钟后再试
          </p>
        ) : (
          <>
            <div className="space-y-2">
              <Label htmlFor="admin-phone">账号（手机号）</Label>
              <Input
                id="admin-phone"
                type="text"
                inputMode="numeric"
                autoComplete="username"
                placeholder="请输入管理员账号"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                className="w-full"
                disabled={isLocked}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="admin-password">密码</Label>
              <Input
                id="admin-password"
                type="password"
                autoComplete="current-password"
                placeholder="请输入密码"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full"
                disabled={isLocked}
              />
            </div>
            {error && (
              <p className="text-sm text-destructive" role="alert">
                {error}
              </p>
            )}
            <Button type="submit" className="w-full" disabled={loading || isLocked}>
              {loading ? "登录中…" : "登录"}
            </Button>
          </>
        )}
      </form>
    </div>
  );
}
