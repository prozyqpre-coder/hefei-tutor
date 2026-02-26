"use client";

import Link from "next/link";
import { BottomNav } from "./BottomNav";

export function MobileLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-background">
        <div className="mx-auto flex max-w-md items-center justify-center px-4 py-3">
          <Link href="/" className="text-lg font-semibold text-foreground">
            合肥名校家教平台
          </Link>
        </div>
      </header>
      <main className="mx-auto min-h-[100dvh] max-w-md pb-20">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
