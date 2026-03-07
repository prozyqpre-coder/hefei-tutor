"use client";

import Link from "next/link";
import { MessageCircle } from "lucide-react";

const STATION_WECHAT = "请添加站长微信"; // 替换为你的微信号

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
        <Link href="/board" className="block">
          <div className="flex min-h-[100px] w-full flex-col items-center justify-center gap-2 rounded-2xl bg-primary px-6 py-6 text-primary-foreground shadow-lg transition active:scale-[0.98]">
            <span className="text-center text-lg font-semibold">信息大厅</span>
            <span className="text-center text-sm opacity-90">查看教员与家长需求列表</span>
          </div>
        </Link>
        <div className="rounded-2xl border-2 border-primary/30 bg-primary/5 px-4 py-5">
          <p className="text-center text-sm text-muted-foreground">
            如需发布信息或联系教员，请联系站长。
          </p>
          <Link
            href="/contact"
            className="mt-3 flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-medium text-primary-foreground transition active:scale-[0.98]"
          >
            <MessageCircle className="h-4 w-4" />
            联系管理员（站长微信：{STATION_WECHAT}）
          </Link>
        </div>
      </section>
    </div>
  );
}
