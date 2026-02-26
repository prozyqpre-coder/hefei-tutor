import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";
import { FAKE_USER_COOKIE_KEY } from "@/lib/auth-fake";

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const clientUserId = cookieStore.get(FAKE_USER_COOKIE_KEY)?.value;
  if (!clientUserId) {
    return NextResponse.json(
      { error: "未登录（缺少模拟用户标识）" },
      { status: 401 }
    );
  }

  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) {
    return NextResponse.json(
      { error: "服务端未配置 SUPABASE_SERVICE_ROLE_KEY" },
      { status: 503 }
    );
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "请求体不是有效 JSON" }, { status: 400 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceRoleKey,
    { auth: { persistSession: false } }
  );

  const id = decodeURIComponent(clientUserId);
  const teachMode =
    body.service_type === "offline" || body.service_type === "online"
      ? (body.service_type as "offline" | "online")
      : null;

  function toTextArray(v: unknown): string[] | null {
    if (Array.isArray(v)) {
      const arr = v.filter((x) => typeof x === "string") as string[];
      return arr.length ? arr : null;
    }
    if (typeof v === "string" && v.trim()) return [v.trim()];
    return null;
  }
  const region = toTextArray(body.region);
  const grade = toTextArray(body.grade);
  const subjects = toTextArray(body.subjects);
  const authFiles = toTextArray(body.auth_files);
  const minPrice = body.min_price != null ? Number(body.min_price) : null;
  const maxPrice = body.max_price != null ? Number(body.max_price) : null;

  const row: Record<string, unknown> = {
    user_id: null,
    client_user_id: id,
    real_name: (body.real_name as string) ?? null,
    university: (body.university as string) ?? null,
    degree: (body.degree as string) ?? null,
    service_type: (body.service_type as string) ?? null,
    teach_mode: teachMode,
    region,
    grade,
    min_price: Number.isFinite(minPrice) ? minPrice : null,
    max_price: Number.isFinite(maxPrice) ? maxPrice : null,
    subjects,
    auth_files: authFiles,
    status: "pending_review",
  };

  const { error } = await supabase.from("student_profiles").upsert(row, {
    onConflict: "client_user_id",
  });

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}
