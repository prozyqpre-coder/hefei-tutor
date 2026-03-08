"use client";

import { useState } from "react";
import Link from "next/link";

const WECHAT_DEMAND = "YEZI-123-126";
const WECHAT_TUTOR = "Jiajiao-66666";

function CopyWechat({ wechat }: { wechat: string }) {
  const [toast, setToast] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(wechat);
      setToast(true);
      setTimeout(() => setToast(false), 2000);
    } catch {
      setToast(true);
      setTimeout(() => setToast(false), 2000);
    }
  };
  return (
    <span className="inline-flex items-center gap-2">
      <button
        type="button"
        onClick={copy}
        className="font-medium text-[#1e40af] underline underline-offset-2 decoration-[#1e40af]/50 hover:decoration-[#1e40af] active:scale-[0.98] transition"
      >
        {wechat}
      </button>
      {toast && (
        <span className="text-xs text-neutral-500">已复制</span>
      )}
    </span>
  );
}

export default function HomePage() {
  return (
    <div className="min-h-[80vh] bg-[#fafafa] flex flex-col items-center justify-center px-6 py-16 text-center">
      <div className="mx-auto max-w-md space-y-10">
        <header className="space-y-4">
          <h1 className="text-2xl font-bold text-neutral-900 leading-snug">
            你好～欢迎来到
            <br />
            <span className="text-[#1e40af]">【合肥学子家教平台】</span>
          </h1>
          <p className="text-base text-neutral-600 leading-relaxed">
            我们专注连接在校大学生与有需要的家庭，提供一对一上门/线上家教辅导。
          </p>
        </header>

        <ul className="space-y-4 text-left text-sm text-neutral-700">
          <li className="flex items-start gap-3">
            <span className="text-emerald-500 shrink-0 mt-0.5">✅</span>
            <span>
              想找家教：请联系 <CopyWechat wechat={WECHAT_DEMAND} />
            </span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-emerald-500 shrink-0 mt-0.5">✅</span>
            <span>
              想做家教：请联系 <CopyWechat wechat={WECHAT_TUTOR} />
            </span>
          </li>
        </ul>

        <p className="text-sm text-neutral-500 leading-relaxed">
          看到消息后我们会第一时间回复你。青春相伴，优质辅导。
        </p>

        <div className="pt-4">
          <Link
            href="/board"
            className="inline-flex items-center justify-center w-full max-w-xs mx-auto py-4 px-6 rounded-xl bg-[#1e3a8a] text-white font-medium text-base shadow-md hover:bg-[#1e40af] active:scale-[0.98] transition focus:outline-none focus:ring-2 focus:ring-[#1e40af] focus:ring-offset-2"
          >
            点击进入 · 信息大厅
          </Link>
        </div>
      </div>
    </div>
  );
}
