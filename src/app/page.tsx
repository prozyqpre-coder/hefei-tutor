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
        className="flex min-h-[44px] w-full items-center justify-center rounded-xl bg-[#07C160] py-3 text-base font-medium text-white shadow-sm hover:bg-[#06ad56] active:scale-[0.98] transition"
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
      {/* 极简页眉 */}
      <section className="px-6 pt-8 pb-4">
        <div className="mx-auto max-w-md text-center">
          <h1 className="text-xl font-bold tracking-tight sm:text-2xl">
            <span className="bg-gradient-to-r from-blue-600 via-violet-600 to-blue-700 bg-clip-text text-transparent">
              安徽学子家教平台
            </span>
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            大学生与家长对接，一对一上门/线上辅导
          </p>
        </div>
      </section>

      {/* 联系方式置顶 */}
      <section className="px-6 py-4">
        <div className="mx-auto flex max-w-md flex-col gap-4">
          <CopyWechatCard label="（家长）想找家教" wechat={WECHAT_DEMAND} />
          <CopyWechatCard label="（教员）想做家教" wechat={WECHAT_TUTOR} />
        </div>
      </section>

      {/* 身份入口按钮 */}
      <section className="px-6 pb-12">
        <div className="mx-auto flex max-w-md flex-col gap-2 sm:flex-row sm:justify-center sm:gap-3">
          <Link
            href="/board?tab=tutors"
            className="flex min-h-[44px] items-center justify-center rounded-xl bg-primary px-6 py-2.5 text-base font-medium text-primary-foreground shadow-md hover:bg-primary/90 active:scale-[0.98] transition"
          >
            我是家长，我要找老师
          </Link>
          <Link
            href="/board?tab=demands"
            className="flex min-h-[44px] items-center justify-center rounded-xl border-2 border-primary bg-transparent px-6 py-2.5 text-base font-medium text-primary hover:bg-primary/5 active:scale-[0.98] transition"
          >
            我是教员，我要入驻
          </Link>
        </div>
      </section>
    </div>
  );
}
