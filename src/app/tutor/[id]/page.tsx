"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { teacherGradesForDisplay } from "@/lib/grades";
import { WECHAT_DEMAND } from "@/lib/wechat";
import { Button } from "@/components/ui/button";
import { WechatContactButton } from "@/components/WechatContactButton";
import { ShieldCheck, ShieldAlert, Mail } from "lucide-react";

type TutorDetail = {
  id: string;
  university: string | null;
  identity: string | null;
  badge_text: string | null;
  gender: string | null;
  teach_mode: string | null;
  regions: string[] | null;
  grades: string[] | null;
  subjects: string[] | null;
  min_salary: number | null;
  max_salary: number | null;
  note: string | null;
  teaching_style: string | null;
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
          .select("id, university, identity, badge_text, gender, teach_mode, regions, grades, subjects, min_salary, max_salary, note, teaching_style, status, created_at")
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

  const maskedName = `${(data.real_name || data.university || "合肥")[0] || "合肥"}老师`;

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
          <span>{(data.teach_mode && data.teach_mode.replace(/、/g, " / ")) || "未填写"}</span>
        </div>
        <div className="flex justify-between gap-2">
          <span className="text-muted-foreground">授课区域</span>
          <span className="text-right">{data.regions?.length ? data.regions.join("、") : "未填写"}</span>
        </div>
        <div className="flex justify-between gap-2">
          <span className="text-muted-foreground">可授年级</span>
          <span className="text-right">{data.grades?.length ? teacherGradesForDisplay(data.grades).join("、") : "未填写"}</span>
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

      {data.teaching_style != null && String(data.teaching_style).trim() !== "" && (
        <div className="rounded-xl bg-amber-50 p-4 dark:bg-amber-900/20">
          <p className="flex items-start gap-2 text-sm leading-relaxed">
            <span className="shrink-0 text-amber-600 dark:text-amber-400">💡</span>
            <span>
              <span className="font-bold text-amber-800 dark:text-amber-200">授课风格：</span>
              <span className="whitespace-pre-wrap text-amber-900/90 dark:text-amber-100/90">{data.teaching_style.trim()}</span>
            </span>
          </p>
        </div>
      )}

      <div className="flex flex-col items-center justify-center gap-2 rounded-xl bg-sky-50 px-4 py-4 text-center text-sm dark:bg-sky-900/20">
        <Mail className="h-5 w-5 text-sky-600 dark:text-sky-400" />
        <p className="font-medium text-sky-800 dark:text-sky-200">
          觉得这位老师不错，请将名字发送给微信号 <span className="font-semibold">{WECHAT_DEMAND}</span>，我们为您对接
        </p>
      </div>

      <div className="h-20" />

      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-border bg-background/95 px-4 py-3">
        <WechatContactButton wechat={WECHAT_DEMAND} />
      </div>
    </div>
  );
}
