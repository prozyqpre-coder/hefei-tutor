'use client';

import { Suspense } from 'react';
import LoginForm from '@/components/auth/LoginForm';

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            登录您的账号
          </h2>
        </div>
        {/* 这个 Suspense 就是 Vercel 想要的那个“保护壳” */}
        <Suspense fallback={<div className="text-center">加载中...</div>}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}