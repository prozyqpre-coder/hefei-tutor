"use client";

import { useState } from "react";
import Link from "next/link";

import { WECHAT_DEMAND, WECHAT_TUTOR } from "@/lib/wechat";

function CopyWechatCard({ label, wechat }: { label: string; wechat: string }) {
  const [toast, setToast] = useState(false);
  const handleClick = async () => {
    try {
      await navigator.clipboard.writeText(wechat);
      setToast(true);
      setTimeout(() => setToast(false), 3000);
      setTimeout(() => {
        window.location.href = "weixin://";
      }, 1000);
    } catch {
      setToast(true);
      setTimeout(() => setToast(false), 3000);
    }
  };
  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-sm transition-shadow hover:shadow-md">
      <p className="mb-2 text-sm font-medium text-muted-foreground">{label}</p>
      <span className="mb-3 block text-lg font-semibold text-foreground">{wechat}</span>
      <button
        type="button"
        onClick={handleClick}
        className="w-full rounded-xl bg-[#07C160] py-3 text-base font-medium text-white shadow-sm hover:bg-[#06ad56] active:scale-[0.98] transition"
      >
        💬 复制微信号并打开微信
      </button>
      <p className="mt-2 text-center text-xs text-muted-foreground">
        由于微信限制，需跳转后手动粘贴搜索
      </p>
      {toast && (
        <div className="fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2 rounded-lg bg-foreground/90 px-4 py-3 text-sm font-medium text-background shadow-lg animate-in fade-in zoom-in-95 duration-200">
          ✅ 微信号已复制，请在微信中粘贴搜索
        </div>
      )}
    </div>
  );
}

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50/30 to-violet-50/20 px-6 pt-16 pb-24">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            <span className="bg-gradient-to-r from-blue-600 via-violet-600 to-blue-700 bg-clip-text text-transparent">
              合肥学子家教平台
            </span>
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-muted-foreground sm:text-xl">
            专注连接在校大学生与有需要的家庭，提供一对一上门 / 线上家教辅导
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/board?tab=tutors"
              className="inline-flex items-center justify-center rounded-xl bg-primary px-6 py-4 text-base font-medium text-primary-foreground shadow-lg hover:bg-primary/90 active:scale-[0.98] transition"
            >
              我是家长，我要找老师
            </Link>
            <Link
              href="/board?tab=demands"
              className="inline-flex items-center justify-center rounded-xl border-2 border-primary bg-transparent px-6 py-4 text-base font-medium text-primary hover:bg-primary/5 active:scale-[0.98] transition"
            >
              我是教员，我要入驻
            </Link>
          </div>
        </div>
      </section>

      {/* 平台优势 */}
      <section className="px-6 py-16">
        <h2 className="mb-10 text-center text-2xl font-bold text-foreground">平台优势</h2>
        <div className="mx-auto grid max-w-4xl gap-6 sm:grid-cols-3">
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h3 className="font-semibold text-foreground">严格认证</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              教员需提供学信网、学生证等材料，平台审核通过后展示
            </p>
          </div>
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
              </svg>
            </div>
            <h3 className="font-semibold text-foreground">优质大学生</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              来自中科大、合工大、安大等高校，本科/研究生均可选择
            </p>
          </div>
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="font-semibold text-foreground">透明匹配</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              按年级、科目、区域筛选，信息一目了然，快速对接
            </p>
          </div>
        </div>
      </section>

      {/* 联系微信卡片 */}
      <section className="px-6 pb-20">
        <h2 className="mb-6 text-center text-xl font-bold text-foreground">联系我们</h2>
        <p className="mb-6 text-center text-sm leading-relaxed text-muted-foreground">
          添加微信后我们会第一时间回复，青春相伴，优质辅导
        </p>
        <div className="mx-auto flex max-w-md flex-col gap-4">
          <CopyWechatCard label="想找家教（家长）" wechat={WECHAT_DEMAND} />
          <CopyWechatCard label="想做家教（教员）" wechat={WECHAT_TUTOR} />
        </div>
      </section>
    </div>
  );
}
