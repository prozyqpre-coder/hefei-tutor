import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const COOKIE = "admin_session";

/** 后台路径：仅此路径需校验，其余全部放行。勿泄露。 */
const ADMIN_BASE = "yezi-boss-control-888";

function isAdminPage(path: string): boolean {
  return path === `/${ADMIN_BASE}` || path.startsWith(`/${ADMIN_BASE}/`);
}

function isAdminApi(path: string): boolean {
  return path.startsWith(`/api/${ADMIN_BASE}`);
}

function isAdminLoginPage(path: string): boolean {
  return path === `/${ADMIN_BASE}/login`;
}

async function hasValidAdmin(token: string | undefined): Promise<boolean> {
  const secret = process.env.ADMIN_SESSION_SECRET?.trim();
  if (!token || !secret) return false;
  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(secret));
    return payload.role === "admin";
  } catch {
    return false;
  }
}

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  if (!isAdminPage(path) && !isAdminApi(path)) return NextResponse.next();
  if (isAdminLoginPage(path)) return NextResponse.next();

  const ok = await hasValidAdmin(request.cookies.get(COOKIE)?.value);
  if (!ok) {
    if (isAdminApi(path)) return NextResponse.json({ error: "未登录" }, { status: 401 });
    return NextResponse.redirect(new URL(`/${ADMIN_BASE}/login`, request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: [`/${ADMIN_BASE}`, `/${ADMIN_BASE}/:path*`, `/api/${ADMIN_BASE}/:path*`],
};
