"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase";
import { useCurrentUser } from "@/lib/use-current-user";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  SERVICE_TYPES,
  HEFEI_AREAS_FULL,
  SUBJECTS,
  PRICE_RANGES,
} from "@/lib/constants";
import type { ServiceType } from "@/lib/constants";
import { cn } from "@/lib/utils";

const SELECT_CLASS =
  "flex h-11 w-full rounded-xl border border-input bg-background px-4 py-2 text-base ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";

export default function ParentPublishPage() {
  const { user, loading: userLoading } = useCurrentUser();
  const [teachMode, setTeachMode] = useState<ServiceType | "">("");
  const [address, setAddress] = useState("");
  const [issueDesc, setIssueDesc] = useState("");
  const [subjects, setSubjects] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isOffline = teachMode === "offline";
  const isOnline = teachMode === "online";

  function toggleSubject(s: string) {
    setSubjects((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!user) {
      setError("请先登录");
      return;
    }
    if (!teachMode) {
      setError("请选择授课模式");
      return;
    }
    const addressValue = isOnline ? "线上/远程" : address;
    if (!addressValue) {
      setError("请选择授课区域/地址");
      return;
    }
    setLoading(true);

    const payload = {
      teach_mode: teachMode,
      address: addressValue,
      issue_desc: issueDesc.trim() || null,
      subjects: subjects.length ? subjects : null,
      price_range: priceRange || null,
      status: "OPEN",
    };

    if (user.type === "fake") {
      const res = await fetch("/api/parent-jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include",
      });
      const data = await res.json().catch(() => ({}));
      setLoading(false);
      if (!res.ok) {
        setError(data.error || "发布失败，请稍后重试");
        return;
      }
      setSuccess(true);
      return;
    }

    const supabase = createClient();
    const { error: err } = await supabase.from("parent_jobs").insert({
      parent_id: user.id,
      teach_mode: payload.teach_mode,
      address: payload.address,
      issue_desc: payload.issue_desc,
      subjects: payload.subjects,
      price_range: payload.price_range,
      status: payload.status,
    });
    setLoading(false);
    if (err) {
      setError(err.message);
      return;
    }
    setSuccess(true);
  }

  if (success) {
    return (
      <div className="px-4 py-8 text-center">
        <h1 className="text-lg font-semibold text-primary">发布成功</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          您的需求已发布，将展示在需求大厅供家教老师查看。
        </p>
        <Link href="/market/jobs" className="mt-6 inline-block">
          <Button>去需求大厅</Button>
        </Link>
      </div>
    );
  }

  if (!userLoading && !user) {
    return (
      <div className="px-4 py-8 text-center">
        <h1 className="text-lg font-semibold">请先登录</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          登录后再发布找家教需求
        </p>
        <Link href="/auth" className="mt-6 inline-block">
          <Button>去登录</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="px-4 py-6">
      <h1 className="text-xl font-bold">发布岗位 / 找家教</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        选择授课模式与地址，填写需求后展示在需求大厅
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-5">
        <div className="space-y-2">
          <Label>授课模式 *</Label>
          <div className="flex flex-col gap-2">
            {SERVICE_TYPES.map(({ value, label, desc }) => (
              <button
                key={value}
                type="button"
                onClick={() => {
                  setTeachMode(value);
                  if (value === "online") setAddress("");
                }}
                className={cn(
                  "rounded-xl border px-4 py-3 text-left text-sm transition-colors",
                  teachMode === value
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-input bg-background hover:bg-muted"
                )}
              >
                <span className="font-medium">{label}</span>
                <span className="ml-2 text-muted-foreground">— {desc}</span>
              </button>
            ))}
          </div>
        </div>

        {isOffline && (
          <div className="space-y-2">
            <Label htmlFor="address">授课区域 *</Label>
            <select
              id="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className={SELECT_CLASS}
              required
            >
              <option value="">请选择合肥九区三县一市</option>
              {HEFEI_AREAS_FULL.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
        )}

        {isOnline && (
          <div className="space-y-2">
            <Label>授课区域</Label>
            <div className="flex h-11 items-center rounded-xl border border-input bg-muted/50 px-4 text-muted-foreground">
              线上 / 远程
            </div>
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="issueDesc">需求描述（选填）</Label>
          <textarea
            id="issueDesc"
            placeholder="如：初二数学辅导，周末上门"
            value={issueDesc}
            onChange={(e) => setIssueDesc(e.target.value)}
            rows={3}
            className="flex w-full rounded-xl border border-input bg-background px-4 py-3 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          />
        </div>

        <div className="space-y-2">
          <Label>辅导科目（可多选）</Label>
          <div className="flex flex-wrap gap-2">
            {SUBJECTS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => toggleSubject(s)}
                className={cn(
                  "rounded-lg border px-3 py-1.5 text-sm transition-colors",
                  subjects.includes(s)
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-input bg-background hover:bg-muted"
                )}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="priceRange">预算时薪（元/小时）</Label>
          <select
            id="priceRange"
            value={priceRange}
            onChange={(e) => setPriceRange(e.target.value)}
            className={SELECT_CLASS}
          >
            <option value="">请选择</option>
            {PRICE_RANGES.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <Button
          type="submit"
          className="w-full"
          disabled={userLoading || loading || !teachMode}
        >
          {loading ? "发布中…" : "发布需求"}
        </Button>
      </form>
    </div>
  );
}
