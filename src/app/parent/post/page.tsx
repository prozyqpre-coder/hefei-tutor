"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { useCurrentUser } from "@/lib/use-current-user";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { HEFEI_AREAS_FULL, SUBJECTS, GRADES_SHORT } from "@/lib/constants";
import { cn } from "@/lib/utils";

const MODE_OPTIONS = [
  { value: "线上", label: "线上" },
  { value: "合肥线下", label: "合肥线下" },
] as const;

type Phase = "primary" | "junior" | "senior";

function getPhasesFromShortGrades(grades: string[]): Phase[] {
  const set = new Set<Phase>();
  for (const g of grades) {
    if (g.startsWith("小")) set.add("primary");
    else if (g.startsWith("初")) set.add("junior");
    else if (g.startsWith("高")) set.add("senior");
  }
  return Array.from(set);
}

function isSubjectAllowedForPhases(subject: string, phases: Phase[]): boolean {
  const hasPrimary = phases.includes("primary");
  const hasJunior = phases.includes("junior");
  const hasSenior = phases.includes("senior");

  if (subject === "小学全科") return hasPrimary;
  if (subject === "初中全科") return hasJunior;
  if (subject === "高中全科") return hasSenior;
  return true;
}

const SELECT_CLASS =
  "flex h-11 w-full rounded-xl border border-input bg-background px-4 py-2 text-base ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";

export default function ParentPostPage() {
  const { user, loading: userLoading } = useCurrentUser();
  const router = useRouter();
  const [mode, setMode] = useState<"线上" | "合肥线下" | "">("");
  const [region, setRegion] = useState("");
  const [detailAddress, setDetailAddress] = useState("");
  const [grades, setGrades] = useState<string[]>([]);
  const [subjects, setSubjects] = useState<string[]>([]);
  const [childGender, setChildGender] = useState<"男" | "女" | "">("");
  const [minBudget, setMinBudget] = useState("");
  const [maxBudget, setMaxBudget] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isOffline = mode === "合肥线下";

  useEffect(() => {
    if (!userLoading && !user) {
      router.replace("/auth?redirect=/parent/post");
    }
  }, [user, userLoading, router]);

  function toggleGrade(g: string) {
    setGrades((prev) => {
      const next = prev.includes(g) ? prev.filter((x) => x !== g) : [...prev, g];
      const phases = getPhasesFromShortGrades(next);
      setSubjects((prevSubjects) => prevSubjects.filter((s) => isSubjectAllowedForPhases(s, phases)));
      return next;
    });
  }
  function toggleSubject(s: string) {
    const phases = getPhasesFromShortGrades(grades);
    if (!isSubjectAllowedForPhases(s, phases)) return;
    setSubjects((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!mode) {
      setError("请选择模式");
      return;
    }
    if (isOffline && !region) {
      setError("请选择授课区域（合肥九区三县）");
      return;
    }
    if (isOffline && !detailAddress.trim()) {
      setError("请填写精确地址（具体到小区或街道）");
      return;
    }
    if (!grades.length) {
      setError("请至少选择一个年级");
      return;
    }
    if (!childGender) {
      setError("请选择小孩性别");
      return;
    }
    const minNum = minBudget.trim() ? Number(minBudget) : null;
    const maxNum = maxBudget.trim() ? Number(maxBudget) : null;
    if (minNum != null && (Number.isNaN(minNum) || minNum < 0)) {
      setError("最低预算请填有效数字");
      return;
    }
    if (maxNum != null && (Number.isNaN(maxNum) || maxNum < 0)) {
      setError("最高预算请填有效数字");
      return;
    }
    if (minNum != null && maxNum != null && minNum > maxNum) {
      setError("最低预算不能大于最高预算");
      return;
    }
    setLoading(true);

    const supabase = createClient();
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) {
      setLoading(false);
      router.replace("/auth?redirect=/parent/post");
      return;
    }

    const row = {
      teach_mode: mode,
      region: isOffline ? region : null,
      detail_address: isOffline ? detailAddress.trim() : null,
      gender: childGender,
      subject: subjects.length ? subjects.join("、") : null,
      student_grade: grades.length ? grades.join("、") : null,
      min_salary: minNum != null && Number.isFinite(minNum) ? minNum : null,
      max_salary: maxNum != null && Number.isFinite(maxNum) ? maxNum : null,
      note: note.trim() || null,
    };

    const { error: err } = await supabase.from("demand_posts").insert({
      user_id: authUser.id,
      ...row,
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
        <p className="mt-2 text-sm text-muted-foreground">您的需求将展示在信息大厅「找学生」中。</p>
        <Link href="/board" className="mt-6 inline-block">
          <Button>去信息大厅</Button>
        </Link>
      </div>
    );
  }

  if (!userLoading && !user) {
    return (
      <div className="px-4 py-8 text-center">
        <h1 className="text-lg font-semibold">请先登录</h1>
        <Link href="/auth?redirect=/parent/post" className="mt-6 inline-block">
          <Button>去登录</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="px-4 py-6">
      <h1 className="text-xl font-bold">家长发布需求</h1>
      <p className="mt-1 text-sm text-muted-foreground">模式、区域、精确地址、年级、科目、预算、备注</p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-5">
        <div className="space-y-2">
          <Label>模式 *</Label>
          <div className="flex gap-2">
            {MODE_OPTIONS.map(({ value, label }) => (
              <button
                key={value}
                type="button"
                onClick={() => { setMode(value); if (value === "线上") setRegion(""); }}
                className={cn("rounded-lg border px-4 py-2 text-sm", mode === value ? "border-primary bg-primary/10 text-primary" : "border-input hover:bg-muted")}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
        {isOffline && (
          <>
            <div className="space-y-2">
              <Label htmlFor="region">授课区域 *（合肥九区三县，单选）</Label>
              <select id="region" value={region} onChange={(e) => setRegion(e.target.value)} className={SELECT_CLASS} required>
                <option value="">请选择</option>
                {HEFEI_AREAS_FULL.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="detailAddress">精确地址 *（50 字以内）</Label>
              <Input
                id="detailAddress"
                placeholder="具体到小区或街道"
                value={detailAddress}
                onChange={(e) => setDetailAddress(e.target.value.slice(0, 50))}
                maxLength={50}
                className="rounded-xl"
              />
              <p className="text-right text-xs text-muted-foreground">
                {detailAddress.length}/50
              </p>
            </div>
          </>
        )}
        <div className="space-y-2">
          <Label>年级 *（多选）</Label>
          <div className="flex flex-wrap gap-2">
            {GRADES_SHORT.map((g) => (
              <button key={g} type="button" onClick={() => toggleGrade(g)} className={cn("rounded-lg border px-3 py-1.5 text-sm", grades.includes(g) ? "border-primary bg-primary/10 text-primary" : "border-input hover:bg-muted")}>
                {g}
              </button>
            ))}
          </div>
        </div>
        <div className="space-y-2">
          <Label>科目（多选）</Label>
          <div className="flex flex-wrap gap-2">
            {SUBJECTS.map((s) => {
              const phases = getPhasesFromShortGrades(grades);
              const disabled = !isSubjectAllowedForPhases(s, phases);
              const active = subjects.includes(s);
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => !disabled && toggleSubject(s)}
                  className={cn(
                    "rounded-lg border px-3 py-1.5 text-sm",
                    disabled
                      ? "border-dashed text-muted-foreground/50 cursor-not-allowed opacity-40"
                      : active
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-input hover:bg-muted"
                  )}
                >
                  {s}
                </button>
              );
            })}
          </div>
        </div>
        <div className="space-y-2">
          <Label>小孩性别 *</Label>
          <div className="flex gap-2">
            {["男", "女"].map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => setChildGender(g as "男" | "女")}
                className={cn(
                  "rounded-lg border px-4 py-2 text-sm",
                  childGender === g ? "border-primary bg-primary/10 text-primary" : "border-input hover:bg-muted"
                )}
              >
                {g}
              </button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label htmlFor="minBudget">最低预算（元/时）</Label>
            <Input
              id="minBudget"
              type="number"
              min={0}
              placeholder="如 80"
              value={minBudget}
              onChange={(e) => setMinBudget(e.target.value.replace(/\D/g, ""))}
              className="rounded-xl"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="maxBudget">最高预算（元/时）</Label>
            <Input
              id="maxBudget"
              type="number"
              min={0}
              placeholder="如 150"
              value={maxBudget}
              onChange={(e) => setMaxBudget(e.target.value.replace(/\D/g, ""))}
              className="rounded-xl"
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="note">备注（选填，50 字以内）</Label>
          <textarea
            id="note"
            placeholder="可补充说明，对教员性别、时间等要求"
            value={note}
            onChange={(e) => setNote(e.target.value.slice(0, 50))}
            maxLength={50}
            rows={3}
            className="flex w-full rounded-xl border border-input bg-background px-4 py-3 text-base placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
          <p className="text-right text-xs text-muted-foreground">
            {note.length}/50
          </p>
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <Button
          type="submit"
          className="w-full"
          disabled={
            userLoading ||
            loading ||
            !mode ||
            !grades.length ||
            !childGender ||
            (isOffline && (!region || !detailAddress.trim()))
          }
        >
          {loading ? "发布中…" : "发布需求"}
        </Button>
      </form>
    </div>
  );
}
