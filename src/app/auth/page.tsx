"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient, phoneToEmail } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  generateFakeUserId,
  setFakeUserId,
} from "@/lib/auth-fake";
import { UNIVERSITIES_ANHUI, DEGREES } from "@/lib/constants";
import { cn } from "@/lib/utils";

const BUCKET_VERIFICATION = "verification";
const WECHAT_LOADING_MS = 1800;
const SELECT_CLASS =
  "flex h-11 w-full rounded-xl border border-input bg-background px-4 py-2 text-base ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";

export default function AuthPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [university, setUniversity] = useState("");
  const [degree, setDegree] = useState("");
  const [fileXinxue, setFileXinxue] = useState<File | null>(null);
  const [fileStudentId, setFileStudentId] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [wechatLoading, setWechatLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputXinxueRef = useRef<HTMLInputElement>(null);
  const inputStudentIdRef = useRef<HTMLInputElement>(null);

  async function handleWechatLogin() {
    setWechatLoading(true);
    await new Promise((r) => setTimeout(r, WECHAT_LOADING_MS));
    const id = generateFakeUserId();
    setFakeUserId(id);
    setWechatLoading(false);
    router.push("/");
    router.refresh();
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const supabase = createClient();
    const email = phoneToEmail(phone);
    const { error: err } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (err) {
      setError(err.message === "Invalid login credentials" ? "手机号或密码错误" : err.message);
      return;
    }
    router.push("/");
    router.refresh();
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password.length < 6) {
      setError("密码至少 6 位");
      return;
    }
    if (!university || !degree) {
      setError("请选择所在学校和身份");
      return;
    }
    if (!fileXinxue || !fileStudentId) {
      setError("请上传学信网截图和学生证钢印页");
      return;
    }
    setLoading(true);
    const supabase = createClient();
    const email = phoneToEmail(phone);
    const { data: signUpData, error: signUpErr } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { phone } },
    });
    if (signUpErr) {
      setLoading(false);
      setError(signUpErr.message?.includes("already registered") ? "该手机号已注册，请直接登录" : signUpErr.message);
      return;
    }
    const user = signUpData.user;
    if (!user) {
      setLoading(false);
      setError("注册失败，请重试");
      return;
    }
    const uid = user.id;
    const formData = new FormData();
    formData.set("user_id", uid);
    formData.set("xinxue", fileXinxue);
    formData.set("student_id", fileStudentId);
    const uploadRes = await fetch("/api/upload-verification", {
      method: "POST",
      body: formData,
      credentials: "include",
    });
    const uploadData = await uploadRes.json().catch(() => ({}));
    if (!uploadRes.ok) {
      setLoading(false);
      setError(uploadData.error || "证件上传失败，请重试");
      return;
    }
    const pathXinxue = uploadData.pathXinxue as string;
    const pathStudentId = uploadData.pathStudentId as string;
    if (!pathXinxue || !pathStudentId) {
      setLoading(false);
      setError("上传返回路径异常，请重试");
      return;
    }

    const { error: profileErr } = await supabase.from("student_profiles").upsert(
      {
        user_id: uid,
        university: university.trim(),
        degree,
        auth_files: [pathXinxue, pathStudentId],
        status: "pending_review",
      },
      { onConflict: "user_id" }
    );
    if (profileErr) {
      setLoading(false);
      setError("保存资料失败：" + profileErr.message);
      return;
    }
    setLoading(false);
    router.push("/student/pending");
    router.refresh();
  }

  return (
    <div className="px-4 py-8">
      <h1 className="text-xl font-bold">我的</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        登录后发布教员信息或家长需求
      </p>

      <div className="mt-6 space-y-4">
      <div className="w-full max-w-[280px]">
        {wechatLoading ? (
          <div className="flex flex-col items-center gap-4 rounded-2xl border border-primary/30 bg-primary/5 py-10">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary/30 border-t-primary" />
            <p className="text-sm text-muted-foreground">正在唤起微信授权…</p>
          </div>
        ) : (
          <button
            type="button"
            onClick={handleWechatLogin}
            className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-[#07c160] text-lg font-semibold text-white shadow-lg transition active:scale-[0.98] hover:bg-[#06ad56]"
          >
            <WechatIcon />
            微信一键登录 / 注册
          </button>
        )}
      </div>
      <a href="/tutor/post" className="block rounded-xl border border-primary/30 bg-primary/5 px-4 py-3 text-center text-sm font-medium text-primary">
        学生认证中心：上传学信网截图 + 学生证照片 → 发布教员信息
      </a>
      </div>

      <div className="mt-8 border-t border-border pt-6">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setMode("login")}
            className={cn(
              "rounded-lg border px-4 py-2 text-sm font-medium transition-colors",
              mode === "login" ? "border-primary bg-primary/10 text-primary" : "border-input hover:bg-muted"
            )}
          >
            登录
          </button>
          <button
            type="button"
            onClick={() => setMode("register")}
            className={cn(
              "rounded-lg border px-4 py-2 text-sm font-medium transition-colors",
              mode === "register" ? "border-primary bg-primary/10 text-primary" : "border-input hover:bg-muted"
            )}
          >
            手机号注册
          </button>
        </div>

        {mode === "login" && (
          <form onSubmit={handleLogin} className="mt-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="phone">手机号</Label>
              <Input
                id="phone"
                type="tel"
                inputMode="numeric"
                placeholder="请输入手机号"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 11))}
                maxLength={11}
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
                minLength={6}
                required
              />
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "登录中…" : "登录"}
            </Button>
          </form>
        )}

        {mode === "register" && (
          <form onSubmit={handleRegister} className="mt-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reg-phone">手机号</Label>
              <Input
                id="reg-phone"
                type="tel"
                inputMode="numeric"
                placeholder="请输入手机号"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 11))}
                maxLength={11}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reg-password">密码</Label>
              <Input
                id="reg-password"
                type="password"
                placeholder="至少 6 位"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={6}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="university">所在学校 *</Label>
              <select
                id="university"
                value={university}
                onChange={(e) => setUniversity(e.target.value)}
                className={SELECT_CLASS}
                required
              >
                <option value="">请选择高校</option>
                {UNIVERSITIES_ANHUI.map((u) => (
                  <option key={u} value={u}>{u}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label>学历 *</Label>
              <div className="flex gap-2">
                {DEGREES.map(({ value, label }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setDegree(value)}
                    className={cn(
                      "rounded-lg border px-4 py-2 text-sm transition-colors",
                      degree === value ? "border-primary bg-primary/10 text-primary" : "border-input hover:bg-muted"
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label>证件上传 *</Label>
              <div className="space-y-2">
                <div>
                  <span className="text-xs text-muted-foreground">学信网截图</span>
                  <input
                    ref={inputXinxueRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => setFileXinxue(e.target.files?.[0] ?? null)}
                  />
                  <button
                    type="button"
                    onClick={() => inputXinxueRef.current?.click()}
                    className="mt-1 flex h-11 w-full items-center rounded-xl border border-input bg-background px-4 text-sm text-muted-foreground hover:bg-muted"
                  >
                    {fileXinxue ? fileXinxue.name : "点击选择"}
                  </button>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground">学生证钢印页</span>
                  <input
                    ref={inputStudentIdRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => setFileStudentId(e.target.files?.[0] ?? null)}
                  />
                  <button
                    type="button"
                    onClick={() => inputStudentIdRef.current?.click()}
                    className="mt-1 flex h-11 w-full items-center rounded-xl border border-input bg-background px-4 text-sm text-muted-foreground hover:bg-muted"
                  >
                    {fileStudentId ? fileStudentId.name : "点击选择"}
                  </button>
                </div>
              </div>
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "注册中…" : "注册"}
            </Button>
          </form>
        )}
      </div>

      <p className="mt-6 text-center text-xs text-muted-foreground">
        注册即表示同意平台服务协议。
      </p>
      <p className="mt-4 text-center">
        <a href="/admin/verify" className="text-xs text-muted-foreground underline">管理员入口 · 证件审核</a>
      </p>
    </div>
  );
}

function WechatIcon() {
  return (
    <svg className="h-7 w-7" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 0 1 .213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.328.328 0 0 0 .167-.054l1.903-1.114a.864.864 0 0 1 .717-.098 10.16 10.16 0 0 0 2.837.403c.276 0 .543-.027.811-.05-.857-2.578.071-4.972 1.93-6.446 1.857-1.475 4.415-1.98 6.877-1.12.345.12.677.262.996.424.857-2.578-.071-4.972-1.93-6.446C14.714 2.957 11.756 2.188 8.691 2.188z" />
    </svg>
  );
}
