'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * 管理员统一入口：未登录会由中间件重定向到 /admin/login；
 * 已登录则跳转到完整审核后台 /admin/verify（教员审核、家长需求审核等）。
 */
export default function AdminPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/admin/verify');
  }, [router]);

  return (
    <div className="flex min-h-[40vh] items-center justify-center px-4">
      <p className="text-sm text-muted-foreground">正在跳转到管理员审核后台…</p>
    </div>
  );
}
