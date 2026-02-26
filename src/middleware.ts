import { NextRequest, NextResponse } from "next/server";

const COOKIE_NAME = "admin_session";
const COOKIE_PAYLOAD = "admin";

/** Edge 下用 Web Crypto 计算 HMAC-SHA256(secret, payload) 的 hex */
async function expectedAdminToken(secret: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign(
    "HMAC",
    key,
    enc.encode(COOKIE_PAYLOAD)
  );
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 仅保护 /admin 与 /api/admin
  const isAdminPage =
    pathname.startsWith("/admin") && !pathname.startsWith("/admin/login");
  const isAdminApi = pathname.startsWith("/api/admin");

  if (!isAdminPage && !isAdminApi) {
    return NextResponse.next();
  }

  const secret = process.env.ADMIN_SESSION_SECRET?.trim();
  if (!secret) {
    if (isAdminApi) {
      return NextResponse.json(
        { error: "未配置 ADMIN_SESSION_SECRET" },
        { status: 503 }
      );
    }
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  const cookieToken = request.cookies.get(COOKIE_NAME)?.value;
  const expected = await expectedAdminToken(secret);
  const valid = cookieToken === expected;

  if (valid) {
    return NextResponse.next();
  }

  if (isAdminApi) {
    return NextResponse.json({ error: "请先登录管理员后台" }, { status: 401 });
  }
  return NextResponse.redirect(new URL("/admin/login", request.url));
}

export const config = {
  matcher: ["/admin", "/admin/:path*", "/api/admin/:path*"],
};
