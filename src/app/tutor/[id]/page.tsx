"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { ShieldCheck, ShieldAlert } from "lucide-react";

type TutorDetail = {
  id: string;
  university: string | null;
  identity: string | null;
  gender: string | null;
  teach_mode: string | null;
  regions: string[] | null;
  grades: string[] | null;
  subjects: string[] | null;
  min_salary: number | null;
  max_salary: number | null;
  note: string | null;
  status: string;
  created_at: string;
};

export default function TutorDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [data, setData] = useState<TutorDetail | null>(null);
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
          .from("tutor_posts")
          .select("id, university, identity, gender, teach_mode, regions, grades, subjects, min_salary, max_salary, note, status, created_at")
          .eq("id", params.id)
          .single();
        if (error) {
          setError(error.message);
          setData(null);
        } else {
          setData(data as TutorDetail);
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
        加载失败：{error || "未找到该教员"}
        <div className="mt-4">
          <Button variant="outline" size="sm" onClick={() => router.back()}>
            返回
          </Button>
        </div>
      </div>
    );
  }

  const maskedName = `${(data.university || "合肥")[0] || "合肥"}老师`;

  return (
    <div className="px-4 py-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold">{maskedName}</h1>
          <p className="mt-1 text-xs text-muted-foreground">
            {data.university}
            {data.identity ? ` · ${data.identity}` : ""}
            {data.gender ? ` · ${data.gender}` : ""}
          </p>
        </div>
        <div>
          {data.status === "verified" ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-600">
              <ShieldCheck className="h-3.5 w-3.5" />
              官方认证
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">
              <ShieldAlert className="h-3.5 w-3.5" />
              未认证
            </span>
          )}
        </div>
      </div>

      <div className="space-y-2 rounded-xl bg-card p-4 text-sm">
        <div className="flex justify-between gap-2">
          <span className="text-muted-foreground">授课方式</span>
          <span>{data.teach_mode || "未填写"}</span>
        </div>
        <div className="flex justify-between gap-2">
          <span className="text-muted-foreground">授课区域</span>
          <span className="text-right">{data.regions?.length ? data.regions.join("、") : "未填写"}</span>
        </div>
        <div className="flex justify-between gap-2">
          <span className="text-muted-foreground">可授年级</span>
          <span className="text-right">{data.grades?.length ? data.grades.join("、") : "未填写"}</span>
        </div>
        <div className="flex justify-between gap-2">
          <span className="text-muted-foreground">辅导科目</span>
          <span className="text-right">{data.subjects?.length ? data.subjects.join("、") : "未填写"}</span>
        </div>
        <div className="flex justify-between gap-2">
          <span className="text-muted-foreground">薪资区间</span>
          <span>
            {(data.min_salary != null || data.max_salary != null)
              ? `￥${data.min_salary ?? "?"}-${data.max_salary ?? "?"}/小时`
              : "未填写"}
          </span>
        </div>
      </div>

      {data.note && (
        <div className="space-y-2 rounded-xl bg-card p-4 text-sm">
          <p className="font-medium">教员简介</p>
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
