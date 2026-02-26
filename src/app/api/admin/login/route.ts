import { NextRequest, NextResponse } from "next/server";
import { createHmac } from "crypto";

const COOKIE_NAME = "admin_session";
const COOKIE_VALUE_PAYLOAD = "admin";
const COOKIE_PATH = "/admin";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

function getSessionToken(): string | null {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret || typeof secret !== "string" || secret.trim() === "") return null;
  const hmac = createHmac("sha256", secret.trim());
  hmac.update(COOKIE_VALUE_PAYLOAD);
  return hmac.digest("hex");
}

export async function POST(request: NextRequest) {
  const expectedPhone = process.env.ADMIN_PHONE?.trim();
  const expectedPassword = process.env.ADMIN_PASSWORD?.trim();
  if (!expectedPhone || !expectedPassword) {
    return NextResponse.json(
      { error: "未配置管理员账号(ADMIN_PHONE/ADMIN_PASSWORD)，请在 .env.local 中配置" },
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

  const token = getSessionToken();
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
    path: COOKIE_PATH,
    maxAge: COOKIE_MAX_AGE,
  });
  return res;
}
