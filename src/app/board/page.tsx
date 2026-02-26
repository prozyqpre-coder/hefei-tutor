"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { HEFEI_AREAS_FULL, GRADES_SHORT, SUBJECTS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { ShieldCheck, ShieldAlert, ChevronDown } from "lucide-react";

type TutorRow = {
  id: string;
  real_name?: string | null;
  university: string | null;
  identity: string | null;
  gender: string | null;
  teach_mode: string | null;
  regions: string[] | null;
  grades: string[] | null;
  subjects: string[] | null;
  min_salary: number | null;
  max_salary: number | null;
  note?: string | null;
  status: string;
  created_at: string;
};

type DemandRow = {
  id: string;
  teach_mode: string | null;
  region: string | null;
  detail_address: string | null;
  gender: string | null;
  subject: string | null;
  student_grade: string | null;
  min_salary: number | null;
  max_salary: number | null;
  note?: string | null;
  created_at: string;
};

const MODES = ["线上", "合肥线下"] as const;

export default function BoardPage() {
  const [tab, setTab] = useState<"tutors" | "demands">("tutors");
  const [tutors, setTutors] = useState<TutorRow[]>([]);
  const [demands, setDemands] = useState<DemandRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters] = useState({
    region: "",
    grade: "",
    subject: "",
    mode: "",
    min_salary: "",
    max_salary: "",
  });

  const fetchTutors = useCallback(async () => {
    const params = new URLSearchParams();
    if (filters.region) params.set("region", filters.region);
    if (filters.grade) params.set("grade", filters.grade);
    if (filters.subject) params.set("subject", filters.subject);
    if (filters.mode) params.set("mode", filters.mode);
    if (filters.min_salary) params.set("min_salary", filters.min_salary);
    if (filters.max_salary) params.set("max_salary", filters.max_salary);
    const res = await fetch(`/api/board/tutors?${params}`);
    const data = await res.json();
    if (data.list) setTutors(data.list);
  }, [filters]);

  const fetchDemands = useCallback(async () => {
    const params = new URLSearchParams();
    if (filters.region) params.set("region", filters.region);
    if (filters.grade) params.set("grade", filters.grade);
    if (filters.subject) params.set("subject", filters.subject);
    if (filters.mode) params.set("mode", filters.mode);
    const res = await fetch(`/api/board/demands?${params}`);
    const data = await res.json();
    if (data.list) setDemands(data.list);
  }, [filters]);

  useEffect(() => {
    setLoading(true);
    if (tab === "tutors") fetchTutors().finally(() => setLoading(false));
    else fetchDemands().finally(() => setLoading(false));
  }, [tab, fetchTutors, fetchDemands]);

  return (
    <div className="flex flex-col">
      <div className="sticky top-[57px] z-30 border-b border-border bg-background">
        <div className="flex">
          <button
            type="button"
            onClick={() => setTab("tutors")}
            className={cn("flex-1 py-3 text-sm font-medium", tab === "tutors" ? "border-b-2 border-primary text-primary" : "text-muted-foreground")}
          >
            找老师
          </button>
          <button
            type="button"
            onClick={() => setTab("demands")}
            className={cn("flex-1 py-3 text-sm font-medium", tab === "demands" ? "border-b-2 border-primary text-primary" : "text-muted-foreground")}
          >
            找学生
          </button>
        </div>
        <div className="border-t border-border px-4 py-2">
          <button
            type="button"
            onClick={() => setFilterOpen((o) => !o)}
            className="flex w-full items-center justify-between text-sm text-muted-foreground"
          >
            <span>筛选：区域、年级、科目、模式</span>
            <ChevronDown className={cn("h-4 w-4 transition", filterOpen && "rotate-180")} />
          </button>
          {filterOpen && (
            <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
              <select
                value={filters.region}
                onChange={(e) => setFilters((f) => ({ ...f, region: e.target.value }))}
                className="rounded-lg border border-input bg-background px-3 py-2"
              >
                {/* 显式“全部区域”选项，值为空表示不过滤 */}
                <option value="">全部区域</option>
                {HEFEI_AREAS_FULL.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
              <select
                value={filters.grade}
                onChange={(e) => setFilters((f) => ({ ...f, grade: e.target.value }))}
                className="rounded-lg border border-input bg-background px-3 py-2"
              >
                {/* 显式“全部年级” */}
                <option value="">全部年级</option>
                {GRADES_SHORT.map((g) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
              <select
                value={filters.subject}
                onChange={(e) => setFilters((f) => ({ ...f, subject: e.target.value }))}
                className="rounded-lg border border-input bg-background px-3 py-2"
              >
                {/* 显式“全部科目” */}
                <option value="">全部科目</option>
                {SUBJECTS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              <select
                value={filters.mode}
                onChange={(e) => setFilters((f) => ({ ...f, mode: e.target.value }))}
                className="rounded-lg border border-input bg-background px-3 py-2"
              >
                {/* 显式“全部模式” */}
                <option value="">全部模式</option>
                {MODES.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
              {tab === "tutors" && (
                <>
                  <input
                    type="number"
                    placeholder="最低薪资"
                    value={filters.min_salary}
                    onChange={(e) => setFilters((f) => ({ ...f, min_salary: e.target.value }))}
                    className="rounded-lg border border-input bg-background px-3 py-2"
                  />
                  <input
                    type="number"
                    placeholder="最高薪资"
                    value={filters.max_salary}
                    onChange={(e) => setFilters((f) => ({ ...f, max_salary: e.target.value }))}
                    className="rounded-lg border border-input bg-background px-3 py-2"
                  />
                </>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="px-4 py-4">
        {loading ? (
          <p className="text-sm text-muted-foreground">加载中…</p>
        ) : tab === "tutors" ? (
          tutors.length === 0 ? (
            <p className="text-muted-foreground">暂无教员</p>
          ) : (
            <ul className="space-y-4">
              {tutors.map((row) => (
                <li key={row.id}>
                  <Link
                    href={`/tutor/${row.id}`}
                    className="block rounded-xl border border-border bg-card p-4 shadow-sm"
                  >
                    <div className="flex items-start gap-3">
                      <div className={cn("relative shrink-0", row.status === "verified" ? "rounded-full p-[3px] bg-gradient-to-r from-amber-400 via-violet-400 to-amber-400" : "")}>
                        <div className={cn("flex h-12 w-12 items-center justify-center rounded-full bg-muted text-lg font-medium", row.status === "verified" ? "" : "border-2 border-border")}>
                          {(row.university || "?")[0]}
                        </div>
                        {row.status === "verified" && (
                          <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-amber-400 text-[10px] text-white">✓</span>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-medium">
                            {row.real_name ? `${row.real_name[0]}老师` : "教员"}
                          </span>
                          {row.status === "verified" ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-2 py-0.5 text-xs font-medium text-amber-700 dark:text-amber-400">
                              <ShieldCheck className="h-3.5 w-3.5" /> 实名认证
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                              <ShieldAlert className="h-3.5 w-3.5" /> 未认证
                            </span>
                          )}
                        </div>
                        <p className="mt-0.5 text-sm text-muted-foreground">
                          {row.real_name && <span>{row.real_name}</span>}
                          {row.university && <span>{row.real_name ? ` · ${row.university}` : row.university}</span>}
                          {row.identity && <span>{` · ${row.identity}`}</span>}
                          {row.gender && <span>{` · ${row.gender}`}</span>}
                        </p>
                        <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
                          {row.teach_mode && <span>{row.teach_mode}</span>}
                          {row.regions?.length ? <span>{row.regions.join("、")}</span> : null}
                          {row.grades?.length ? <span>年级：{row.grades.join("、")}</span> : null}
                          {row.subjects?.length ? <span>科目：{row.subjects.join("、")}</span> : null}
                          {(row.min_salary != null || row.max_salary != null) && (
                            <span>￥{row.min_salary ?? "?"}-{row.max_salary ?? "?"}/小时</span>
                          )}
                        </div>
                        {row.note && (
                          <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">
                            {row.note}
                          </p>
                        )}
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )
        ) : demands.length === 0 ? (
          <p className="text-muted-foreground">暂无需求</p>
        ) : (
          <ul className="space-y-4">
            {demands.map((row) => (
              <li key={row.id}>
                <Link
                  href={`/demand/${row.id}`}
                  className="block rounded-xl border border-border bg-card p-4 shadow-sm"
                >
                  <div className="flex flex-col gap-1 text-sm text-muted-foreground">
                    <div className="flex flex-wrap gap-x-3 gap-y-1">
                      <span className="font-medium text-foreground">{row.teach_mode}</span>
                      {row.region && <span>{row.region}</span>}
                      {row.detail_address && <span>{row.detail_address}</span>}
                    </div>
                    <div className="flex flex-wrap gap-x-3 gap-y-1">
                      {row.gender && <span>学生性别：{row.gender}</span>}
                      {row.student_grade && <span>年级：{row.student_grade}</span>}
                      {row.subject && <span>科目：{row.subject}</span>}
                      {(row.min_salary != null || row.max_salary != null) && (
                        <span>预算：￥{row.min_salary ?? "?"}-{row.max_salary ?? "?"}/小时</span>
                      )}
                    </div>
                    {row.note && (
                      <p className="mt-1 line-clamp-2 text-xs">
                        {row.note}
                      </p>
                    )}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
