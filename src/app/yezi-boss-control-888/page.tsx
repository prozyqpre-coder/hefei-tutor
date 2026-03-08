"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { adminPath } from "@/lib/admin-path";

export default function AdminEntryPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace(adminPath("verify"));
  }, [router]);

  return (
    <div className="flex min-h-[40vh] items-center justify-center px-4">
      <p className="text-sm text-muted-foreground">正在跳转…</p>
    </div>
  );
}
