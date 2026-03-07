import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const ADMIN_COOKIE_NAME = "admin_session";

async function verifyAdminSession(token: string | undefined): Promise<boolean> {
  const secret = process.env.ADMIN_SESSION_SECRET?.trim();
  if (!token || !secret) return false;
  try {
    const key = new TextEncoder().encode(secret);
    const { payload } = await jwtVerify(token, key);
    return payload.role === "admin";
  } catch {
    return false;
  }
}

/**
 * 极简：只拦截 /admin（排除 /admin/login），校验 admin_session；其余全部放行。
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isAdminLogin = pathname === "/admin/login";
  const isAdminPath = pathname.startsWith("/admin");
  const isAdminApi = pathname.startsWith("/api/admin");

  if (!isAdminPath && !isAdminApi) {
    return NextResponse.next();
  }

  if (isAdminLogin) {
    return NextResponse.next();
  }

  const token = request.cookies.get(ADMIN_COOKIE_NAME)?.value;
  const ok = await verifyAdminSession(token);

  if (!ok) {
    if (isAdminApi) {
      return NextResponse.json(
        { error: "请先登录管理员后台" },
        { status: 401 }
      );
    }
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin", "/admin/:path*", "/api/admin/:path*"],
};
