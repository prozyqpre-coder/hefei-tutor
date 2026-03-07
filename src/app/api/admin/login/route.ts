import { NextRequest, NextResponse } from "next/server";
import { SignJWT } from "jose";

const COOKIE_NAME = "admin_session";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

async function createAdminSessionToken(): Promise<string | null> {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret || typeof secret !== "string" || secret.trim() === "") return null;
  const key = new TextEncoder().encode(secret.trim());

  return new SignJWT({ role: "admin" })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(key);
}

export async function POST(request: NextRequest) {
  const expectedPhone = process.env.ADMIN_PHONE?.trim();
  const expectedPassword = process.env.ADMIN_PASSWORD?.trim();
  if (!expectedPhone || !expectedPassword) {
    return NextResponse.json(
      { error: "未配置管理员账号(ADMIN_PHONE/ADMIN_PASSWORD)，请在 .env.local 或 Vercel 环境变量中配置" },
      { status: 503 }
    );
  }

  let body: { phone?: string; password?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "请提供账号和密码" },
      { status: 400 }
    );
  }

  const phone = String(body?.phone ?? "").trim();
  const password = String(body?.password ?? "").trim();

  if (phone !== expectedPhone || password !== expectedPassword) {
    return NextResponse.json(
      { error: "账号或密码错误" },
      { status: 401 }
    );
  }

  const token = await createAdminSessionToken();
  if (!token) {
    return NextResponse.json(
      { error: "服务未配置 ADMIN_SESSION_SECRET" },
      { status: 503 }
    );
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: COOKIE_MAX_AGE,
  });
  return res;
}
