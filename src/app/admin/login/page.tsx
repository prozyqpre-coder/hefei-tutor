"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function AdminLoginPage() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: phone.trim(), password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.error ?? "登录失败，请重试");
        return;
      }
      router.replace("/admin/verify");
      router.refresh();
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
          />
        </div>
        {error && (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        )}
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "登录中…" : "登录"}
        </Button>
      </form>
    </div>
  );
}
