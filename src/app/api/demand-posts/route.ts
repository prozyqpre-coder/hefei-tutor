import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";
import { FAKE_USER_COOKIE_KEY } from "@/lib/auth-fake";

function toTextArray(v: unknown): string[] {
  if (Array.isArray(v)) return v.filter((x) => typeof x === "string") as string[];
  return [];
}

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const clientUserId = cookieStore.get(FAKE_USER_COOKIE_KEY)?.value;
  if (!clientUserId) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) return NextResponse.json({ error: "服务端未配置 KEY" }, { status: 503 });

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "无效 JSON" }, { status: 400 });
  }

  const mode = body.mode === "线上" || body.mode === "合肥线下" ? body.mode : null;
  if (!mode) return NextResponse.json({ error: "请选择模式" }, { status: 400 });
  const grade = toTextArray(body.grade);
  if (!grade.length) return NextResponse.json({ error: "请至少选择一个年级" }, { status: 400 });

  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, key, { auth: { persistSession: false } });
  const row = {
    mode,
    region: (body.region as string) || null,
    detail_address: (body.detail_address as string)?.trim() || null,
    grade,
    subjects: toTextArray(body.subjects),
    budget: body.budget != null && Number.isFinite(Number(body.budget)) ? Number(body.budget) : null,
    note: (body.note as string)?.trim() || null,
    status: "OPEN",
  };

  const { error } = await supabase.from("demand_posts").insert(row);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
