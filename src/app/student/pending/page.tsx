import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ShieldCheck } from "lucide-react";

export default function StudentPendingPage() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center px-6 py-12 text-center">
      <ShieldCheck className="h-16 w-16 text-primary" />
      <h1 className="mt-4 text-xl font-bold">您的名校教员身份正在审核中</h1>
      <p className="mt-2 text-muted-foreground">
        审核通过后将获得「实名认证」勋章并开始接单。
      </p>
      <p className="mt-1 text-sm text-muted-foreground">
        预计 24 小时内完成，请耐心等待；如有疑问可联系平台客服。
      </p>
      <div className="mt-8 flex flex-col gap-3">
        <Link href="/">
          <Button>返回首页</Button>
        </Link>
        <Link href="/market/tutors" className="text-sm text-primary underline">
          去简历大厅看看
        </Link>
      </div>
    </div>
  );
}
