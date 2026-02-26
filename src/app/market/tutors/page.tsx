"use client";

import { useState, useEffect } from "react";
import { ShieldCheck, ShieldAlert } from "lucide-react";

type TutorRow = {
  id: string;
  real_name: string | null;
  university: string | null;
  degree: string | null;
  region: string[] | null;
  grade: string[] | null;
  min_price: number | null;
  max_price: number | null;
  subjects: string[] | null;
  status: string;
  service_type: string | null;
  teach_mode: string | null;
  created_at: string;
};

export default function MarketTutorsPage() {
  const [list, setList] = useState<TutorRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetch("/api/market/tutors")
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return;
        if (data.error) {
          setError(data.error);
          setList([]);
        } else {
          setList(data.list ?? []);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setError("加载失败");
          setList([]);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="px-4 py-6">
      <h1 className="text-lg font-semibold">简历大厅</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        展示已发布简历的大学生教员，未审核通过的简历也会显示，审核通过后显示「实名认证」。
      </p>

      {error && (
        <p className="mt-4 text-sm text-red-600">{error}</p>
      )}

      {loading ? (
        <p className="mt-8 text-sm text-muted-foreground">加载中…</p>
      ) : list.length === 0 ? (
        <p className="mt-8 text-muted-foreground">暂无简历。</p>
      ) : (
        <ul className="mt-6 space-y-4">
          {list.map((row) => (
            <li
              key={row.id}
              className="rounded-xl border border-border bg-card p-4 shadow-sm"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <span className="font-medium">{row.real_name ?? "—"}</span>
                  <span className="ml-2 text-muted-foreground">{row.university ?? ""}</span>
                  {row.degree && (
                    <span className="ml-2 text-sm text-muted-foreground">（{row.degree}）</span>
                  )}
                </div>
                {row.status === "APPROVED" ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-green-600 px-2.5 py-0.5 text-xs font-medium text-white">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    实名认证
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                    <ShieldAlert className="h-3.5 w-3.5" />
                    待审核
                  </span>
                )}
              </div>
              <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-sm text-muted-foreground">
                {row.region?.length ? (
                  <span>区域：{row.region.join("、")}</span>
                ) : null}
                {row.grade?.length ? (
                  <span>年级：{row.grade.join("、")}</span>
                ) : null}
                {row.subjects?.length ? (
                  <span>科目：{row.subjects.join("、")}</span>
                ) : null}
                {(row.min_price != null && Number.isFinite(row.min_price)) ||
                (row.max_price != null && Number.isFinite(row.max_price)) ? (
                  <span>
                    薪资：{row.min_price ?? "?"}–{row.max_price ?? "?"} 元/时
                  </span>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
