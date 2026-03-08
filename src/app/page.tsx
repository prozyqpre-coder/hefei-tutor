"use client";

import { useState, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";

const TUTOR_WECHAT = "Jiajiao-66666";
const DEMAND_WECHAT = "YEZI-123-126";

function CopyWechat({ wechat, label }: { wechat: string; label: string }) {
  const [toast, setToast] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(wechat);
      setToast(true);
      setTimeout(() => setToast(false), 2000);
    } catch {
      setToast(true);
      setTimeout(() => setToast(false), 2000);
    }
  };
  return (
    <p className="mt-3 border-t border-border pt-3 text-xs text-primary">
      {label}
      <button
        type="button"
        onClick={copy}
        className="ml-1 font-medium underline underline-offset-2 active:opacity-80"
      >
        {wechat}
      </button>
      {toast && (
        <span className="ml-2 text-[10px] text-muted-foreground">
          微信号已复制，请前往微信添加
        </span>
      )}
    </p>
  );
}

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

export default function HomePage() {
  const [tab, setTab] = useState<"tutors" | "demands">("tutors");
  const [tutors, setTutors] = useState<TutorRow[]>([]);
  const [demands, setDemands] = useState<DemandRow[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTutors = useCallback(async () => {
    const res = await fetch("/api/board/tutors");
    const data = await res.json();
    if (data.list) setTutors(data.list);
  }, []);

  const fetchDemands = useCallback(async () => {
    const res = await fetch("/api/board/demands");
    const data = await res.json();
    if (data.list) setDemands(data.list);
  }, []);

  useEffect(() => {
    setLoading(true);
    if (tab === "tutors") fetchTutors().finally(() => setLoading(false));
    else fetchDemands().finally(() => setLoading(false));
  }, [tab, fetchTutors, fetchDemands]);

  return (
    <div className="flex flex-col pb-24">
      <div className="px-4 py-3">
        <div className="flex rounded-lg bg-muted p-1">
          <button
            type="button"
            onClick={() => setTab("tutors")}
            className={cn(
              "flex-1 rounded-md py-2 text-sm font-medium transition",
              tab === "tutors"
                ? "bg-background text-primary shadow-sm"
                : "text-muted-foreground"
            )}
          >
            找老师
          </button>
          <button
            type="button"
            onClick={() => setTab("demands")}
            className={cn(
              "flex-1 rounded-md py-2 text-sm font-medium transition",
              tab === "demands"
                ? "bg-background text-primary shadow-sm"
                : "text-muted-foreground"
            )}
          >
            找学生
          </button>
        </div>
      </div>

      <main className="flex-1 px-4 py-4">
        {loading ? (
          <div className="flex justify-center py-12">
            <span className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : tab === "tutors" ? (
          tutors.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              暂无教员信息
            </p>
          ) : (
            <ul className="space-y-4">
              {tutors.map((t) => (
                <li
                  key={t.id}
                  className="rounded-xl border border-border bg-card p-4 shadow-sm"
                >
                  <div className="space-y-1 text-sm">
                    {t.real_name && (
                      <p className="font-medium text-foreground">{t.real_name}</p>
                    )}
                    <p className="text-muted-foreground">
                      {[t.university, t.identity, t.gender]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                    {t.teach_mode && (
                      <p className="text-muted-foreground">{t.teach_mode.replace(/、/g, " / ")}</p>
                    )}
                    {t.regions?.length ? (
                      <p className="text-muted-foreground">
                        区域：{t.regions.join("、")}
                      </p>
                    ) : null}
                    {t.grades?.length ? (
                      <p className="text-muted-foreground">
                        年级：{t.grades.join("、")}
                      </p>
                    ) : null}
                    {t.subjects?.length ? (
                      <p className="text-muted-foreground">
                        科目：{t.subjects.join("、")}
                      </p>
                    ) : null}
                    {(t.min_salary != null || t.max_salary != null) && (
                      <p className="text-muted-foreground">
                        薪资：￥{t.min_salary ?? "?"} - {t.max_salary ?? "?"}
                        /小时
                      </p>
                    )}
                    {t.note && (
                      <p className="text-muted-foreground">{t.note}</p>
                    )}
                  </div>
                  <CopyWechat wechat={TUTOR_WECHAT} label="老师发布信息请联系微信：" />
                </li>
              ))}
            </ul>
          )
        ) : demands.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            暂无家长需求
          </p>
        ) : (
          <ul className="space-y-4">
            {demands.map((d) => (
              <li
                key={d.id}
                className="rounded-xl border border-border bg-card p-4 shadow-sm"
              >
                <div className="space-y-1 text-sm">
                  {d.gender && (
                    <p className="text-muted-foreground">学生性别：{d.gender}</p>
                  )}
                  {d.student_grade && (
                    <p className="text-muted-foreground">
                      年级：{d.student_grade}
                    </p>
                  )}
                  {d.teach_mode && (
                    <p className="text-muted-foreground">{d.teach_mode.replace(/、/g, " / ")}</p>
                  )}
                  {d.region && (
                    <p className="text-muted-foreground">区域：{d.region}</p>
                  )}
                  {d.detail_address && (
                    <p className="text-muted-foreground">
                      地址：{d.detail_address}
                    </p>
                  )}
                  {d.subject && (
                    <p className="text-muted-foreground">科目：{d.subject}</p>
                  )}
                  {(d.min_salary != null || d.max_salary != null) && (
                    <p className="text-muted-foreground">
                      预算：￥{d.min_salary ?? "?"} - {d.max_salary ?? "?"}/小时
                    </p>
                  )}
                  {d.note && (
                    <p className="text-muted-foreground">{d.note}</p>
                  )}
                </div>
                <CopyWechat wechat={DEMAND_WECHAT} label="家长发布信息请联系微信：" />
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
