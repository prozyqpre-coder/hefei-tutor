"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { Button } from "@/components/ui/button";

type DemandDetail = {
  id: string;
  teach_mode: string | null;
  region: string | null;
  detail_address: string | null;
  gender: string | null;
  subject: string | null;
  student_grade: string | null;
  min_salary: number | null;
  max_salary: number | null;
  note: string | null;
  created_at: string;
};

export default function DemandDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [data, setData] = useState<DemandDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDetail() {
      if (!params?.id) return;
      setLoading(true);
      setError(null);
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from("demand_posts")
          .select("id, teach_mode, region, detail_address, gender, subject, student_grade, min_salary, max_salary, note, created_at")
          .eq("id", params.id)
          .single();
        if (error) {
          setError(error.message);
          setData(null);
        } else {
          setData(data as DemandDetail);
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : "加载失败");
        setData(null);
      } finally {
        setLoading(false);
      }
    }
    fetchDetail();
  }, [params?.id]);

  if (loading) {
    return <div className="px-4 py-8 text-sm text-muted-foreground">加载中…</div>;
  }

  if (error || !data) {
    return (
      <div className="px-4 py-8 text-sm text-muted-foreground">
        加载失败：{error || "未找到该需求"}
        <div className="mt-4">
          <Button variant="outline" size="sm" onClick={() => router.back()}>
            返回
          </Button>
        </div>
      </div>
    );
  }

  const maskedName = "家长";

  return (
    <div className="px-4 py-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold">{maskedName}</h1>
          <p className="mt-1 text-xs text-muted-foreground">
            {data.teach_mode || "未填写"}
            {data.gender ? ` · 学生性别：${data.gender}` : ""}
            {data.student_grade ? ` · 年级：${data.student_grade}` : ""}
          </p>
        </div>
      </div>

      <div className="space-y-2 rounded-xl bg-card p-4 text-sm">
        <div className="flex justify-between gap-2">
          <span className="text-muted-foreground">授课区域</span>
          <span className="text-right">
            {data.region || "未填写"}
            {data.detail_address ? ` · ${data.detail_address}` : ""}
          </span>
        </div>
        <div className="flex justify-between gap-2">
          <span className="text-muted-foreground">辅导科目</span>
          <span className="text-right">{data.subject || "未填写"}</span>
        </div>
        <div className="flex justify-between gap-2">
          <span className="text-muted-foreground">预算时薪</span>
          <span>
            {(data.min_salary != null || data.max_salary != null)
              ? `￥${data.min_salary ?? "?"}-${data.max_salary ?? "?"}/小时`
              : "未填写"}
          </span>
        </div>
      </div>

      {data.note && (
        <div className="space-y-2 rounded-xl bg-card p-4 text-sm">
          <p className="font-medium">家长备注</p>
          <p className="whitespace-pre-wrap break-words text-muted-foreground">{data.note}</p>
        </div>
      )}

      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-border bg-background/95 px-4 py-3">
        <Button className="h-11 w-full rounded-full text-sm font-medium" onClick={() => alert("联系方式暂未配置，请稍后在后台补充。")}>
          立即联系
        </Button>
      </div>
    </div>
  );
}
