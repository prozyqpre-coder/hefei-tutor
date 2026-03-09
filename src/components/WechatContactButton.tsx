"use client";

import { useState } from "react";

export function WechatContactButton({ wechat }: { wechat: string }) {
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
    <div className="space-y-2">
      <button
        type="button"
        onClick={handleClick}
        className="h-11 w-full rounded-full bg-[#07C160] text-sm font-medium text-white shadow-sm hover:bg-[#06ad56] active:scale-[0.98] transition"
      >
        💬 复制微信号并打开微信
      </button>
      <p className="text-center text-xs text-muted-foreground">
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
