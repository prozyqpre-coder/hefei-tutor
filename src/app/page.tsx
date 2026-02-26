"use client";

import Link from "next/link";
import { GraduationCap, Users } from "lucide-react";

export default function HomePage() {
  return (
    <div className="flex flex-col">
      <section className="px-4 pt-6 pb-4 text-center">
        <h1 className="text-lg font-bold text-foreground">合肥名校家教平台</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          大学生与家长对接，靠谱又省心
        </p>
      </section>
      <section className="flex flex-1 flex-col gap-5 px-4 py-6">
        <Link href="/tutor/post" className="block">
          <div className="flex min-h-[120px] w-full flex-col items-center justify-center gap-3 rounded-2xl bg-primary px-6 py-8 text-primary-foreground shadow-lg transition active:scale-[0.98]">
            <GraduationCap className="h-12 w-12" />
            <span className="text-center text-xl font-semibold">我是大学生（应聘老师）</span>
            <span className="text-center text-sm opacity-90">进入教员注册 / 发布流程</span>
          </div>
        </Link>
        <Link href="/parent/post" className="block">
          <div className="flex min-h-[120px] w-full flex-col items-center justify-center gap-3 rounded-2xl border-2 border-primary bg-primary/5 px-6 py-8 text-primary shadow-lg transition active:scale-[0.98]">
            <Users className="h-12 w-12" />
            <span className="text-center text-xl font-semibold">我是家长（招聘老师）</span>
            <span className="text-center text-sm text-muted-foreground">进入家长需求发布流程</span>
          </div>
        </Link>
      </section>
    </div>
  );
}
