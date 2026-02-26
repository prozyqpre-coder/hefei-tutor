import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";
import { FAKE_USER_COOKIE_KEY } from "@/lib/auth-fake";

/** 模拟登录家长发布需求：写入 parent_requirements，字段与表结构一致 */
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
  const teachMode = body.teach_mode === "offline" || body.teach_mode === "online" ? body.teach_mode : null;
  if (!teachMode) {
    return NextResponse.json({ error: "请选择授课模式（offline/online）" }, { status: 400 });
  }

  function toTextArray(v: unknown): string[] | null {
    if (Array.isArray(v)) {
      const arr = v.filter((x) => typeof x === "string") as string[];
      return arr.length ? arr : null;
    }
    return null;
  }

  const region = toTextArray(body.region);
  const grade = toTextArray(body.grade);
  const subjects = toTextArray(body.subjects);
  if (!grade?.length) {
    return NextResponse.json({ error: "请至少选择一个年级" }, { status: 400 });
  }

  const row = {
    parent_id: null,
    client_user_id: id,
    teach_mode: teachMode,
    region,
    detail_address: (body.detail_address as string)?.trim() || null,
    grade,
    subjects,
    extra_note: (body.extra_note as string)?.trim() || null,
    price_range: (body.price_range as string)?.trim() || null,
    status: "OPEN",
  };

  const { error } = await supabase.from("parent_requirements").insert(row);

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}
