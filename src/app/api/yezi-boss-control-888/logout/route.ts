import { NextRequest, NextResponse } from "next/server";

const COOKIE_NAME = "admin_session";

export async function POST(request: NextRequest) {
  const isHttps = request.nextUrl?.protocol === "https:";
  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production" || isHttps,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return res;
}
