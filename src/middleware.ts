import { NextRequest, NextResponse } from "next/server";
// 以下逻辑已暂时全部关闭，不做任何页面/API 拦截
// import { jwtVerify } from "jose";

// const COOKIE = "admin_session";
// const ADMIN_BASE = "yezi-boss-control-888";

// function isAdminPage(path: string): boolean {
//   return path === `/${ADMIN_BASE}` || path.startsWith(`/${ADMIN_BASE}/`);
// }
// function isAdminApi(path: string): boolean {
//   return path.startsWith(`/api/${ADMIN_BASE}`);
// }
// function isAdminLoginPage(path: string): boolean {
//   return path === `/${ADMIN_BASE}/login`;
// }
// async function hasValidAdmin(token: string | undefined): Promise<boolean> {
//   const secret = process.env.ADMIN_SESSION_SECRET?.trim();
//   if (!token || !secret) return false;
//   try {
//     const { payload } = await jwtVerify(token, new TextEncoder().encode(secret));
//     return payload.role === "admin";
//   } catch {
//     return false;
//   }
// }

const ADMIN_BASE = "yezi-boss-control-888";

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  // 登录接口必须放行，否则未带 Cookie 时无法登录（会先被中间件返回 401「未登录」）
  if (path === `/api/${ADMIN_BASE}/login`) return NextResponse.next();

  // 暂时不做任何其他拦截，直接放行
  return NextResponse.next();

  // const path = request.nextUrl.pathname;
  // if (!isAdminPage(path) && !isAdminApi(path)) return NextResponse.next();
  // if (isAdminLoginPage(path)) return NextResponse.next();
  // const ok = await hasValidAdmin(request.cookies.get(COOKIE)?.value);
  // if (!ok) {
  //   if (isAdminApi(path)) return NextResponse.json({ error: "未登录" }, { status: 401 });
  //   return NextResponse.redirect(new URL(`/${ADMIN_BASE}/login`, request.url));
  // }
  // return NextResponse.next();
}

export const config = {
  matcher: [
    "/yezi-boss-control-888",
    "/yezi-boss-control-888/:path*",
    "/api/yezi-boss-control-888/:path*",
  ],
};
