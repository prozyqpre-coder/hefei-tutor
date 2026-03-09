"use client";

import { Suspense, useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { HEFEI_AREAS_FULL, GRADES_SHORT, SUBJECTS, TEACHER_GRADE_OPTIONS } from "@/lib/constants";
import { WECHAT_DEMAND, WECHAT_TUTOR } from "@/lib/wechat";
import { teacherGradesForDisplay } from "@/lib/grades";
import { cn } from "@/lib/utils";
import { ShieldCheck, ShieldAlert, ChevronDown, ChevronRight } from "lucide-react";

/** 教师卡片年级标签：强制不换行不截断，宁可超出边界 */
const TEACHER_GRADE_TAG_CLASS =
  "inline-flex shrink-0 items-center rounded-md border-[0.5px] border-purple-200 bg-purple-50 px-1.5 py-1 text-sm text-purple-600 tracking-tighter overflow-visible !whitespace-nowrap sm:px-2 sm:text-base dark:border-purple-300/50 dark:bg-purple-100/50 dark:text-purple-700";

/** 教师卡片科目标签：强制不换行不截断，宁可超出边界 */
const TEACHER_SUBJECT_TAG_CLASS =
  "inline-flex shrink-0 items-center rounded-md border-[0.5px] border-blue-200 bg-blue-50 px-1.5 py-1 text-sm text-blue-600 tracking-tighter overflow-visible !whitespace-nowrap sm:px-2 sm:text-base dark:border-blue-300/50 dark:bg-blue-100/50 dark:text-blue-700";

/** 找学生卡片年级标签：强制不换行不截断 */
const DEMAND_GRADE_TAG_CLASS =
  "inline-flex shrink-0 items-center rounded-md border-[0.5px] border-purple-200 bg-purple-50 px-1.5 py-1 text-sm text-purple-600 tracking-tighter overflow-visible !whitespace-nowrap sm:px-2 sm:text-base dark:border-purple-300/50 dark:bg-purple-100/50 dark:text-purple-700";

/** 找学生卡片科目标签：强制不换行不截断 */
const DEMAND_SUBJECT_TAG_CLASS =
  "inline-flex shrink-0 items-center rounded-md border-[0.5px] border-blue-200 bg-blue-50 px-1.5 py-1 text-sm text-blue-600 tracking-tighter overflow-visible !whitespace-nowrap sm:px-2 sm:text-base dark:border-blue-300/50 dark:bg-blue-100/50 dark:text-blue-700";

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
  teaching_style?: string | null;
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

function BoardPageContent() {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  const initialTab = tabParam === "demands" ? "demands" : "tutors";
  const [tab, setTab] = useState<"tutors" | "demands">(initialTab);

  useEffect(() => {
    if (tabParam === "demands") setTab("demands");
    else if (tabParam === "tutors") setTab("tutors");
  }, [tabParam]);
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
        <div className="border-b border-border bg-muted/50 px-4 py-3 text-sm text-muted-foreground">
          <p>（家长）想找家教请微信联系 {WECHAT_DEMAND}</p>
          <p className="mt-1">（教员）想做家教请微信联系 {WECHAT_TUTOR}</p>
        </div>
        <div className="flex">
          <button
            type="button"
            onClick={() => setTab("tutors")}
            className={cn("flex-1 min-h-[44px] py-3 text-sm font-medium", tab === "tutors" ? "border-b-2 border-primary text-primary" : "text-muted-foreground")}
          >
            找老师
          </button>
          <button
            type="button"
            onClick={() => setTab("demands")}
            className={cn("flex-1 min-h-[44px] py-3 text-sm font-medium", tab === "demands" ? "border-b-2 border-primary text-primary" : "text-muted-foreground")}
          >
            找学生
          </button>
        </div>
        <div className="border-t border-border px-4 py-2">
          <button
            type="button"
            onClick={() => setFilterOpen((o) => !o)}
            className="flex min-h-[44px] w-full items-center justify-between text-sm text-muted-foreground"
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
                {/* 找老师用大类，找学生用细分 */}
                <option value="">全部年级</option>
                {tab === "tutors"
                  ? TEACHER_GRADE_OPTIONS.map((g) => (
                      <option key={g} value={g}>{g}</option>
                    ))
                  : GRADES_SHORT.map((g) => (
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
            <ul className="space-y-6">
              {tutors.map((row) => (
                <li key={row.id} className="mb-6 last:mb-0">
                  <Link
                    href={`/tutor/${row.id}`}
                    className="relative block overflow-visible rounded-xl bg-card px-3 py-4 shadow-sm transition-shadow duration-200 hover:shadow-md"
                  >
                    {(row.min_salary != null || row.max_salary != null) && (
                      <div className="absolute right-3 top-4 text-right">
                        <div className="text-xl font-bold text-orange-500 dark:text-orange-400">
                          ¥{row.min_salary ?? "?"}-{row.max_salary ?? "?"}
                        </div>
                        <div className="text-base font-medium text-orange-500/90 dark:text-orange-400/90">/小时</div>
                      </div>
                    )}
                    <div className="flex items-start gap-3 pr-20">
                      <div className={cn("relative shrink-0", row.status === "verified" ? "rounded-full p-[3px] bg-gradient-to-r from-amber-400 via-violet-400 to-amber-400" : "")}>
                        <div className={cn("flex h-12 w-12 items-center justify-center rounded-full bg-muted text-lg font-medium", row.status === "verified" ? "" : "border-2 border-border")}>
                          {(row.real_name || row.university || "?")[0]}
                        </div>
                        {row.status === "verified" && (
                          <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-amber-400 text-[10px] text-white">✓</span>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="shrink-0 text-xl font-bold !whitespace-nowrap">
                            {row.real_name ? `${row.real_name[0]}老师` : "教员"}
                          </span>
                          {row.status === "verified" ? (
                            <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-amber-500/15 px-3 py-1 text-sm font-medium text-amber-700 overflow-visible !whitespace-nowrap dark:text-amber-400">
                              <ShieldCheck className="h-3.5 w-3.5" /> 实名认证
                            </span>
                          ) : (
                            <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-muted px-3 py-1 text-sm text-muted-foreground overflow-visible !whitespace-nowrap">
                              <ShieldAlert className="h-3.5 w-3.5" /> 未认证
                            </span>
                          )}
                        </div>
                        <p className="mt-1 flex flex-nowrap items-center gap-x-1 overflow-visible text-base leading-relaxed text-muted-foreground">
                          {row.real_name && <span className="shrink-0 overflow-visible !whitespace-nowrap">{row.real_name}</span>}
                          {row.university && <span className="shrink-0 overflow-visible !whitespace-nowrap">{row.real_name ? ` · ${row.university}` : row.university}</span>}
                          {row.identity && <span className="shrink-0 overflow-visible !whitespace-nowrap">{` · ${row.identity}`}</span>}
                          {row.gender && <span className="shrink-0 overflow-visible !whitespace-nowrap">{` · ${row.gender}`}</span>}
                        </p>
                        <div className="mt-3 grid grid-cols-[4rem_1fr] grid-rows-auto items-start gap-x-1 gap-y-2.5 text-base leading-relaxed">
                          {row.teach_mode ? (
                            <div className="contents">
                              <span className="shrink-0 text-base font-bold text-gray-800 dark:text-gray-200">模式：</span>
                              <span className="flex min-w-0 flex-nowrap text-gray-500 dark:text-gray-400">
                                <span className="!whitespace-nowrap">{row.teach_mode.replace(/、/g, " / ")}</span>
                              </span>
                            </div>
                          ) : null}
                          {row.regions && row.regions.length > 0 ? (
                            <div className="contents">
                              <span className="shrink-0 text-base font-bold text-gray-800 dark:text-gray-200">区域：</span>
                              <span className="min-w-0 break-words text-gray-500 dark:text-gray-400">
                                {row.regions.join("、")}
                              </span>
                            </div>
                          ) : null}
                          {row.grades && row.grades.length > 0 ? (
                            <div className="contents">
                              <span className="shrink-0 text-base font-bold text-gray-800 dark:text-gray-200">年级：</span>
                              <span className="flex min-w-0 flex-wrap items-center gap-1">
                                {teacherGradesForDisplay(row.grades).map((g) => (
                                  <span key={g} className={TEACHER_GRADE_TAG_CLASS}>
                                    {g}
                                  </span>
                                ))}
                              </span>
                            </div>
                          ) : null}
                          {row.subjects && row.subjects.length > 0 ? (
                            <div className="contents">
                              <span className="shrink-0 text-base font-bold text-gray-800 dark:text-gray-200">科目：</span>
                              <span className="flex min-w-0 flex-wrap items-center gap-1">
                                {row.subjects.map((s) => (
                                  <span key={s} className={TEACHER_SUBJECT_TAG_CLASS}>
                                    {s}
                                  </span>
                                ))}
                              </span>
                            </div>
                          ) : null}
                        </div>
                        {row.note && (
                          <p className="mt-3 line-clamp-2 text-base leading-relaxed text-muted-foreground">
                            {row.note}
                          </p>
                        )}
                        {row.teaching_style != null && String(row.teaching_style).trim() !== "" && (
                          <div className="mt-3 h-auto overflow-visible rounded-lg bg-amber-50 p-3 pb-4 dark:bg-amber-900/20">
                            <p className="flex items-start gap-2 text-sm leading-relaxed">
                              <span className="shrink-0 text-amber-600 dark:text-amber-400">💡</span>
                              <span className="min-w-0 flex-1 overflow-visible">
                                <span className="font-bold text-amber-800 dark:text-amber-200">授课风格：</span>
                                <span className="text-amber-900/90 dark:text-amber-100/90">{row.teaching_style.trim()}</span>
                              </span>
                            </p>
                          </div>
                        )}
                        <p className="mt-3 flex items-center gap-1 text-sm text-primary">
                          <span>点开查看更多信息</span>
                          <ChevronRight className="h-4 w-4" />
                        </p>
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
          <ul className="space-y-6">
            {demands.map((row) => (
              <li key={row.id} className="mb-6 last:mb-0">
                <Link
                  href={`/demand/${row.id}`}
                  className="relative block overflow-visible rounded-xl bg-card px-3 py-4 shadow-sm transition-shadow duration-200 hover:shadow-md"
                >
                  {(row.min_salary != null || row.max_salary != null) && (
                    <div className="absolute right-3 top-4 text-right">
                      <div className="text-xl font-bold text-orange-500 dark:text-orange-400">
                        ¥{row.min_salary ?? "?"}-{row.max_salary ?? "?"}
                      </div>
                      <div className="text-base font-medium text-orange-500/90 dark:text-orange-400/90">/小时</div>
                    </div>
                  )}
                  <div className="flex items-start gap-3 pr-20">
                    <div className="min-w-0 flex-1 grid grid-cols-[4rem_1fr] items-start gap-x-1 gap-y-2.5 text-base leading-relaxed">
                      {row.teach_mode ? (
                        <div className="contents">
                          <span className="shrink-0 text-base font-bold text-gray-800 dark:text-gray-200">模式：</span>
                          <span className="min-w-0 break-words text-gray-500 dark:text-gray-400">
                            {row.teach_mode.replace(/、/g, " / ")}
                          </span>
                        </div>
                      ) : null}
                      {(row.region || row.detail_address) ? (
                        <div className="contents">
                          <span className="shrink-0 text-base font-bold text-gray-800 dark:text-gray-200">区域：</span>
                          <span className="min-w-0 break-words text-gray-500 dark:text-gray-400">
                            {[row.region, row.detail_address].filter(Boolean).join(" · ")}
                          </span>
                        </div>
                      ) : null}
                      {row.gender ? (
                        <div className="contents">
                          <span className="shrink-0 text-base font-bold text-gray-800 dark:text-gray-200">性别：</span>
                          <span className="min-w-0 break-words text-gray-500 dark:text-gray-400">
                            {row.gender}
                          </span>
                        </div>
                      ) : null}
                      {row.student_grade ? (
                        <div className="contents">
                          <span className="shrink-0 text-base font-bold text-gray-800 dark:text-gray-200">年级：</span>
                          <span className={DEMAND_GRADE_TAG_CLASS}>
                            {row.student_grade}
                          </span>
                        </div>
                      ) : null}
                      {row.subject ? (
                        <div className="contents">
                          <span className="shrink-0 text-base font-bold text-gray-800 dark:text-gray-200">科目：</span>
                          <span className="flex min-w-0 flex-wrap items-center gap-1">
                            {row.subject.split(/[、,，]/).map((s) => (
                              <span key={s} className={DEMAND_SUBJECT_TAG_CLASS}>
                                {s.trim()}
                              </span>
                            ))}
                          </span>
                        </div>
                      ) : null}
                      {row.note && (
                        <p className="col-span-2 mt-2 line-clamp-2 text-base text-muted-foreground">
                          {row.note}
                        </p>
                      )}
                      <p className="col-span-2 mt-3 flex items-center gap-1 text-sm text-primary">
                        <span>点开查看更多信息</span>
                        <ChevronRight className="h-4 w-4" />
                      </p>
                    </div>
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

export default function BoardPage() {
  return (
    <Suspense fallback={<div className="flex min-h-[40vh] items-center justify-center px-4 text-sm text-muted-foreground">加载中…</div>}>
      <BoardPageContent />
    </Suspense>
  );
}
