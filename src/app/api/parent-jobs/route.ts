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

  const { error } = await supabase.from("parent_jobs").insert({
    parent_id: null,
    client_user_id: decodeURIComponent(clientUserId),
    teach_mode: body.teach_mode ?? null,
    address: body.address ?? null,
    issue_desc: body.issue_desc ?? null,
    subjects: Array.isArray(body.subjects) ? body.subjects : null,
    price_range: body.price_range ?? null,
    status: body.status ?? "OPEN",
  });

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}
