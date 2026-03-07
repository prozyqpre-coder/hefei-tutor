"use client";

import { MessageCircle } from "lucide-react";

const STATION_WECHAT = "请添加站长微信"; // 替换为你的微信号

export default function ContactPage() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center px-4 py-8">
      <div className="w-full max-w-sm rounded-xl border bg-card p-6 text-center shadow-sm">
        <MessageCircle className="mx-auto h-12 w-12 text-primary" />
        <h1 className="mt-4 text-lg font-semibold">联系站长</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          如需发布家教信息、发布需求或联系教员，请联系管理员（站长）。
        </p>
        <p className="mt-4 text-base font-medium text-primary">
          站长微信：{STATION_WECHAT}
        </p>
      </div>
    </div>
  );
}
