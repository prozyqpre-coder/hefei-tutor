"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { useCurrentUser } from "@/lib/use-current-user";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UNIVERSITIES_ANHUI, HEFEI_AREAS_FULL, GRADES, SUBJECTS } from "@/lib/constants";
import { cn } from "@/lib/utils";

const SELECT_CLASS =
  "flex h-11 w-full rounded-xl border border-input bg-background px-4 py-2 text-base ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";

const IDENTITY_OPTIONS = [
  { value: "本科生", label: "本科生" },
  { value: "研究生", label: "研究生" },
] as const;

const MODE_OPTIONS = [
  { value: "线上", label: "线上" },
  { value: "合肥线下", label: "合肥线下" },
] as const;

type Phase = "primary" | "junior" | "senior";

function getPhasesFromFullGrades(grades: string[]): Phase[] {
  const set = new Set<Phase>();
  for (const g of grades) {
    if (g.startsWith("小学")) set.add("primary");
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

export default function TutorPostPage() {
  const { user, loading: userLoading } = useCurrentUser();
  const router = useRouter();
  const [realName, setRealName] = useState("");
  const [university, setUniversity] = useState("");
  const [identity, setIdentity] = useState<"本科生" | "研究生" | "">("");
  const [gender, setGender] = useState<"男" | "女" | "">("");
  const [mode, setMode] = useState<"线上" | "合肥线下" | "">("");
  const [region, setRegion] = useState<string[]>([]);
  const [grades, setGrades] = useState<string[]>([]);
  const [subjects, setSubjects] = useState<string[]>([]);
  const [minSalary, setMinSalary] = useState("");
  const [maxSalary, setMaxSalary] = useState("");
  const [note, setNote] = useState("");
  const [fileXinxue, setFileXinxue] = useState<File | null>(null);
  const [fileStudentId, setFileStudentId] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isOffline = mode === "合肥线下";

  useEffect(() => {
    if (!userLoading && !user) {
      router.replace("/auth?redirect=/tutor/post");
    }
  }, [user, userLoading, router]);

  function toggleRegion(r: string) {
    setRegion((prev) => (prev.includes(r) ? prev.filter((x) => x !== r) : [...prev, r]));
  }
  function toggleGrade(g: string) {
    setGrades((prev) => {
      const next = prev.includes(g) ? prev.filter((x) => x !== g) : [...prev, g];
      const phases = getPhasesFromFullGrades(next);
      setSubjects((prevSubjects) => prevSubjects.filter((s) => isSubjectAllowedForPhases(s, phases)));
      return next;
    });
  }
  function toggleSubject(s: string) {
    const phases = getPhasesFromFullGrades(grades);
    if (!isSubjectAllowedForPhases(s, phases)) return;
    setSubjects((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!university.trim()) {
      setError("请选择院校");
      return;
    }
    if (!identity) {
      setError("请选择身份");
      return;
    }
    if (!mode) {
      setError("请选择模式");
      return;
    }
    const regionArr = isOffline ? region : [];
    if (isOffline && !regionArr.length) {
      setError("请至少选择一个授课区域");
      return;
    }
    if (!grades.length) {
      setError("请至少选择一个年级");
      return;
    }
    if (!subjects.length) {
      setError("请至少选择一个科目");
      return;
    }
    const min = minSalary.trim() ? Number(minSalary) : null;
    const max = maxSalary.trim() ? Number(maxSalary) : null;
    if (min != null && (Number.isNaN(min) || min < 0)) {
      setError("最低时薪请填有效数字");
      return;
    }
    if (max != null && (Number.isNaN(max) || max < 0)) {
      setError("最高时薪请填有效数字");
      return;
    }
    if (min != null && max != null && min > max) {
      setError("最低时薪不能大于最高时薪");
      return;
    }
    setLoading(true);

    const supabase = createClient();
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) {
      setLoading(false);
      router.replace("/auth?redirect=/tutor/post");
      return;
    }

    let authFiles: string[] = [];
    if (authUser) {
      if (!fileXinxue?.size || !fileStudentId?.size) {
        setLoading(false);
        setError("请上传学信网截图和学生证照片");
        return;
      }
      const formData = new FormData();
      formData.set("user_id", authUser.id);
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
        setError((uploadData?.error as string) || "证件上传失败");
        return;
      }
      const p1 = uploadData.pathXinxue as string;
      const p2 = uploadData.pathStudentId as string;
      if (p1 && p2) authFiles = [p1, p2];
    }

    const row = {
      real_name: realName.trim() || null,
      university: university.trim(),
      identity,
      teach_mode: mode,
      gender: gender || null,
      regions: regionArr,
      grades,
      subjects,
      min_salary: Number.isFinite(min) ? min : null,
      max_salary: Number.isFinite(max) ? max : null,
      note: note.trim() || null,
      auth_files: authFiles.length ? authFiles : null,
      status: "pending" as const,
    };

    const { error: err } = await supabase.from("tutor_posts").insert({
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
        <p className="mt-2 text-sm text-muted-foreground">您的教员信息已提交，审核通过后将展示在信息大厅。</p>
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
        <p className="mt-2 text-sm text-muted-foreground">登录后发布教员信息</p>
        <Link href="/login?redirect=/tutor/post" className="mt-6 inline-block">
          <Button>去登录</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="px-4 py-6">
      <h1 className="text-xl font-bold">教员发布</h1>
      <p className="mt-1 text-sm text-muted-foreground">院校、身份、模式、区域、年级、科目、薪资、备注</p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-5">
        <div className="space-y-1.5">
          <Label htmlFor="realName">真实姓名（选填）</Label>
          <Input
            id="realName"
            placeholder="请输入"
            value={realName}
            onChange={(e) => setRealName(e.target.value.slice(0, 10))}
            maxLength={10}
            className="rounded-xl"
          />
          <p className="text-right text-xs text-muted-foreground">
            {realName.length}/10
          </p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="university">院校选择 *</Label>
          <select id="university" value={university} onChange={(e) => setUniversity(e.target.value)} className={SELECT_CLASS} required>
            <option value="">请选择安徽省内高校</option>
            {UNIVERSITIES_ANHUI.map((u) => (
              <option key={u} value={u}>{u}</option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label>身份 *</Label>
          <div className="flex gap-2">
            {IDENTITY_OPTIONS.map(({ value, label }) => (
              <button
                key={value}
                type="button"
                onClick={() => setIdentity(value)}
                className={cn("rounded-lg border px-4 py-2 text-sm", identity === value ? "border-primary bg-primary/10 text-primary" : "border-input hover:bg-muted")}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
        <div className="space-y-2">
          <Label>性别 *</Label>
          <div className="flex gap-2">
            {["男", "女"].map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => setGender(g as "男" | "女")}
                className={cn(
                  "rounded-lg border px-4 py-2 text-sm",
                  gender === g ? "border-primary bg-primary/10 text-primary" : "border-input hover:bg-muted"
                )}
              >
                {g}
              </button>
            ))}
          </div>
        </div>
        <div className="space-y-2">
          <Label>模式 *</Label>
          <div className="flex gap-2">
            {MODE_OPTIONS.map(({ value, label }) => (
              <button
                key={value}
                type="button"
                onClick={() => { setMode(value); if (value === "线上") setRegion([]); }}
                className={cn("rounded-lg border px-4 py-2 text-sm", mode === value ? "border-primary bg-primary/10 text-primary" : "border-input hover:bg-muted")}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
        {isOffline && (
          <div className="space-y-2">
            <Label>区域 *（多选）</Label>
            <div className="flex flex-wrap gap-2">
              {HEFEI_AREAS_FULL.map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => toggleRegion(d)}
                  className={cn("rounded-lg border px-3 py-1.5 text-sm", region.includes(d) ? "border-primary bg-primary/10 text-primary" : "border-input hover:bg-muted")}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>
        )}
        <div className="space-y-2">
          <Label>年级 *（多选，小学一年级～高三）</Label>
          <div className="flex flex-wrap gap-2">
            {GRADES.map((g) => (
              <button key={g} type="button" onClick={() => toggleGrade(g)} className={cn("rounded-lg border px-3 py-1.5 text-sm", grades.includes(g) ? "border-primary bg-primary/10 text-primary" : "border-input hover:bg-muted")}>
                {g}
              </button>
            ))}
          </div>
        </div>
        <div className="space-y-2">
          <Label>科目 *（多选）</Label>
          <div className="flex flex-wrap gap-2">
            {SUBJECTS.map((s) => {
              const phases = getPhasesFromFullGrades(grades);
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
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label htmlFor="minSalary">最低时薪（元/时）</Label>
            <Input id="minSalary" type="number" min={0} placeholder="如 50" value={minSalary} onChange={(e) => setMinSalary(e.target.value.replace(/\D/g, ""))} className="rounded-xl" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="maxSalary">最高时薪（元/时）</Label>
            <Input id="maxSalary" type="number" min={0} placeholder="如 120" value={maxSalary} onChange={(e) => setMaxSalary(e.target.value.replace(/\D/g, ""))} className="rounded-xl" />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="note">备注（选填，50 字以内）</Label>
          <textarea
            id="note"
            placeholder="可补充说明，如擅长年级、授课风格等"
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
        {user?.type === "supabase" && (
          <div className="space-y-2">
            <Label>认证材料 *（学信网截图 + 学生证）</Label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs text-muted-foreground">学信网截图</Label>
                <Input type="file" accept="image/*" onChange={(e) => setFileXinxue(e.target.files?.[0] ?? null)} className="mt-1 h-auto py-2 rounded-xl" />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">学生证</Label>
                <Input type="file" accept="image/*" onChange={(e) => setFileStudentId(e.target.files?.[0] ?? null)} className="mt-1 h-auto py-2 rounded-xl" />
              </div>
            </div>
          </div>
        )}
        {error && <p className="text-sm text-red-600">{error}</p>}
        <Button type="submit" className="w-full" disabled={userLoading || loading || !university || !identity || !gender || !mode || !grades.length || !subjects.length || (user?.type === "supabase" && (!fileXinxue?.size || !fileStudentId?.size))}>
          {loading ? "提交中…" : "提交发布"}
        </Button>
      </form>
    </div>
  );
}
