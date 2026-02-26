import { NextResponse } from "next/server";

const COOKIE_NAME = "admin_session";
const COOKIE_PATH = "/admin";

export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE_NAME, "", {
    httpOnly: true,
    path: COOKIE_PATH,
    maxAge: 0,
  });
  return res;
}
