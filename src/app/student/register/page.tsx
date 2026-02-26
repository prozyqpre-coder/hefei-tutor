"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase";
import { useCurrentUser } from "@/lib/use-current-user";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  SERVICE_TYPES,
  HEFEI_AREAS_FULL,
  UNIVERSITIES_ANHUI,
  SUBJECTS,
  GRADES,
} from "@/lib/constants";
import type { ServiceType } from "@/lib/constants";
import { cn } from "@/lib/utils";

const SELECT_CLASS =
  "flex h-11 w-full rounded-xl border border-input bg-background px-4 py-2 text-base ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";

export default function StudentRegisterPage() {
  const { user, loading: userLoading } = useCurrentUser();
  const [realName, setRealName] = useState("");
  const [university, setUniversity] = useState("");
  const [serviceType, setServiceType] = useState<ServiceType | "">("");
  const [region, setRegion] = useState<string[]>([]);
  const [grades, setGrades] = useState<string[]>([]);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [subjects, setSubjects] = useState<string[]>([]);
  const [fileXinxue, setFileXinxue] = useState<File | null>(null);
  const [fileStudentId, setFileStudentId] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isOffline = serviceType === "offline";
  const isOnline = serviceType === "online";

  useEffect(() => {
    if (user?.type !== "supabase") return;
    const supabase = createClient();
    supabase
      .from("student_profiles")
      .select("university")
      .eq("user_id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data?.university && !university) setUniversity(data.university);
      });
  }, [user?.type, user?.id, university]);

  function toggleSubject(s: string) {
    setSubjects((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
    );
  }

  function toggleRegion(r: string) {
    setRegion((prev) =>
      prev.includes(r) ? prev.filter((x) => x !== r) : [...prev, r]
    );
  }

  function toggleGrade(g: string) {
    setGrades((prev) =>
      prev.includes(g) ? prev.filter((x) => x !== g) : [...prev, g]
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!user) {
      setError("请先登录");
      return;
    }
    if (!serviceType) {
      setError("请选择服务模式");
      return;
    }
    const regionArr: string[] = isOnline ? ["线上/远程"] : region.length ? [...region] : [];
    if (!regionArr.length) {
      setError("请至少选择一个授课区域");
      return;
    }
    const min = minPrice.trim() ? Number(minPrice) : null;
    const max = maxPrice.trim() ? Number(maxPrice) : null;
    if (min != null && (Number.isNaN(min) || min < 0)) {
      setError("最低薪资请填写有效数字");
      return;
    }
    if (max != null && (Number.isNaN(max) || max < 0)) {
      setError("最高薪资请填写有效数字");
      return;
    }
    if (min != null && max != null && min > max) {
      setError("最低薪资不能大于最高薪资");
      return;
    }
    const gradeArr: string[] = grades.length ? [...grades] : [];
    const subjectsArr: string[] = subjects.length ? [...subjects] : [];

    setLoading(true);

    try {
      let authFiles: string[] = [];

      if (user.type === "supabase") {
        if (!fileXinxue?.size || !fileStudentId?.size) {
          setLoading(false);
          setError("请上传学信网截图和学生证钢印页");
          return;
        }
        const formData = new FormData();
        formData.set("user_id", user.id);
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
          const msg = (uploadData?.error as string) || "证件上传失败";
          alert(msg);
          setError(msg);
          return;
        }
        const pathXinxue = uploadData.pathXinxue as string;
        const pathStudentId = uploadData.pathStudentId as string;
        if (!pathXinxue || !pathStudentId) {
          setLoading(false);
          const msg = "上传返回路径异常，请重试";
          alert(msg);
          setError(msg);
          return;
        }
        authFiles = [pathXinxue, pathStudentId];
      }

      const row = {
        real_name: realName.trim() || null,
        university: university || null,
        service_type: serviceType,
        teach_mode: serviceType,
        region: regionArr,
        grade: gradeArr,
        min_price: Number.isFinite(min) ? min : null,
        max_price: Number.isFinite(max) ? max : null,
        subjects: subjectsArr.length ? subjectsArr : null,
        auth_files: authFiles.length ? authFiles : null,
        status: "pending_review" as const,
      };

      if (user.type === "fake") {
        const res = await fetch("/api/student-profiles", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(row),
          credentials: "include",
        });
        const data = await res.json().catch(() => ({}));
        setLoading(false);
        if (!res.ok) {
          const msg = (data?.error as string) || "提交失败，请稍后重试";
          alert(msg);
          setError(msg);
          return;
        }
        setSuccess(true);
        return;
      }

      const supabase = createClient();
      const { error: upsertErr } = await supabase
        .from("student_profiles")
        .upsert(
          { user_id: user.id, ...row },
          { onConflict: "user_id" }
        );

      setLoading(false);
      if (upsertErr) {
        alert(upsertErr.message);
        setError(upsertErr.message);
        return;
      }
      setSuccess(true);
    } catch (err) {
      setLoading(false);
      const msg = err instanceof Error ? err.message : "提交失败，请稍后重试";
      alert(msg);
      setError(msg);
    }
  }

  if (success) {
    return (
      <div className="px-4 py-8 text-center">
        <h1 className="text-lg font-semibold text-primary">简历已提交</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          您的求职信息已保存，审核通过后将展示在简历大厅。
        </p>
        <Link href="/student/pending" className="mt-6 inline-block">
          <Button>查看审核状态</Button>
        </Link>
      </div>
    );
  }

  if (!userLoading && !user) {
    return (
      <div className="px-4 py-8 text-center">
        <h1 className="text-lg font-semibold">请先登录</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          使用微信一键登录或手机号注册后再发布简历
        </p>
        <Link href="/auth" className="mt-6 inline-block">
          <Button>去登录</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="px-4 py-6">
      <h1 className="text-xl font-bold">发布简历 / 深度入驻</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        填写服务模式、薪资区间、授课区域与年级，审核通过后展示在简历大厅。
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-5">
        <div className="space-y-2">
          <Label htmlFor="realName">真实姓名 *</Label>
          <Input
            id="realName"
            placeholder="请输入真实姓名"
            value={realName}
            onChange={(e) => setRealName(e.target.value)}
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
          <Label>服务模式 *</Label>
          <div className="flex flex-col gap-2">
            {SERVICE_TYPES.map(({ value, label, desc }) => (
              <button
                key={value}
                type="button"
                onClick={() => {
                  setServiceType(value);
                  if (value === "online") setRegion([]);
                }}
                className={cn(
                  "rounded-xl border px-4 py-3 text-left text-sm transition-colors",
                  serviceType === value
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
            <Label>授课区域 *（多选，合肥九区三县一市）</Label>
            <div className="flex flex-wrap gap-2">
              {HEFEI_AREAS_FULL.map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => toggleRegion(d)}
                  className={cn(
                    "rounded-lg border px-3 py-1.5 text-sm transition-colors",
                    region.includes(d)
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-input bg-background hover:bg-muted"
                  )}
                >
                  {d}
                </button>
              ))}
            </div>
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
          <Label>可授课年级（多选）</Label>
          <div className="flex flex-wrap gap-2">
            {GRADES.map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => toggleGrade(g)}
                className={cn(
                  "rounded-lg border px-3 py-1.5 text-sm transition-colors",
                  grades.includes(g)
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-input bg-background hover:bg-muted"
                )}
              >
                {g}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label htmlFor="minPrice">最低薪资（元/小时）</Label>
            <Input
              id="minPrice"
              type="number"
              min={0}
              placeholder="如 50"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value.replace(/\D/g, ""))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="maxPrice">最高薪资（元/小时）</Label>
            <Input
              id="maxPrice"
              type="number"
              min={0}
              placeholder="如 120"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value.replace(/\D/g, ""))}
            />
          </div>
        </div>

        {user?.type === "supabase" && (
          <div className="space-y-3">
            <Label>认证材料 *（学信网截图 + 学生证钢印页）</Label>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="xinxue" className="text-xs text-muted-foreground">学信网截图</Label>
                <Input
                  id="xinxue"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setFileXinxue(e.target.files?.[0] ?? null)}
                  className="h-auto py-2"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="studentId" className="text-xs text-muted-foreground">学生证钢印页</Label>
                <Input
                  id="studentId"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setFileStudentId(e.target.files?.[0] ?? null)}
                  className="h-auto py-2"
                />
              </div>
            </div>
          </div>
        )}

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

        {error && <p className="text-sm text-red-600">{error}</p>}

        <Button
          type="submit"
          className="w-full"
          disabled={
            userLoading ||
            loading ||
            !serviceType ||
            (isOffline && region.length === 0) ||
            (user?.type === "supabase" && (!fileXinxue?.size || !fileStudentId?.size))
          }
        >
          {loading ? "提交中…" : "提交发布简历"}
        </Button>
      </form>
    </div>
  );
}
