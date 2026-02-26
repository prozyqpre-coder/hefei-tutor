"use client";

import { useState, useEffect } from "react";

type JobRow = {
  id: string;
  teach_mode: string | null;
  region: string[] | null;
  detail_address: string | null;
  grade: string[] | null;
  subjects: string[] | null;
  extra_note: string | null;
  price_range: string | null;
  status: string;
  created_at: string;
};

export default function MarketJobsPage() {
  const [list, setList] = useState<JobRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetch("/api/market/jobs")
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
        if (!cancelled) setError("加载失败");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="px-4 py-6">
      <h1 className="text-lg font-semibold">需求大厅</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        家长发布的找家教需求，可按年级、科目、区域筛选对接。
      </p>
      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
      {loading ? (
        <p className="mt-8 text-sm text-muted-foreground">加载中…</p>
      ) : list.length === 0 ? (
        <p className="mt-8 text-muted-foreground">暂无需求。</p>
      ) : (
        <ul className="mt-6 space-y-4">
          {list.map((row) => (
            <li key={row.id} className="rounded-xl border border-border bg-card p-4 shadow-sm">
              <div className="flex flex-wrap gap-x-3 gap-y-1 text-sm">
                {row.teach_mode && (
                  <span className="font-medium">{row.teach_mode === "offline" ? "合肥线下" : "全国线上"}</span>
                )}
                {row.grade?.length ? <span>年级：{row.grade.join("、")}</span> : null}
                {row.subjects?.length ? <span>科目：{row.subjects.join("、")}</span> : null}
                {row.region?.length ? <span>区域：{row.region.join("、")}</span> : null}
                {row.detail_address && <span>地址：{row.detail_address}</span>}
                {row.price_range && <span>预算：{row.price_range}</span>}
              </div>
              {row.extra_note && (
                <p className="mt-2 text-xs text-muted-foreground">{row.extra_note}</p>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
