"use client";

import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function TutorPostPage() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center px-4 py-8">
      <div className="w-full max-w-sm rounded-xl border bg-card p-6 text-center shadow-sm">
        <p className="text-sm text-muted-foreground">
          如需发布教员信息，请联系站长（管理员）统一发布。
        </p>
        <Link href="/contact" className="mt-4 inline-flex items-center gap-2">
          <Button className="gap-2">
            <MessageCircle className="h-4 w-4" />
            联系站长
          </Button>
        </Link>
      </div>
    </div>
  );
}
