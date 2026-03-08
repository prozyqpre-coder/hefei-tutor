import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getKey(): string | null {
  const v = process.env.SUPABASE_SERVICE_ROLE_KEY;
  return v && typeof v === "string" && v.trim() ? v.trim() : null;
}

export async function GET(request: Request) {
  const key = getKey();
  if (!key) {
    return NextResponse.json({ error: "未配置 SUPABASE_SERVICE_ROLE_KEY" }, { status: 503 });
  }
  const { searchParams } = new URL(request.url);
  const region = searchParams.get("region");
  const grade = searchParams.get("grade");
  const subject = searchParams.get("subject");
  const mode = searchParams.get("mode");
  const minSalary = searchParams.get("min_salary");
  const maxSalary = searchParams.get("max_salary");

  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, key, {
    auth: { persistSession: false },
  });

  let q = supabase
    .from("demand_posts")
    .select("id, teach_mode, region, detail_address, gender, subject, student_grade, min_salary, max_salary, note, sort_order, created_at")
    .order("sort_order", { ascending: false })
    .order("created_at", { ascending: false });

  if (mode) q = q.ilike("teach_mode", `%${mode}%`);
  if (region) q = q.eq("region", region);
  if (grade) q = q.eq("student_grade", grade);
  if (subject) q = q.eq("subject", subject);
  if (minSalary) q = q.gte("min_salary", Number(minSalary));
  if (maxSalary) q = q.lte("max_salary", Number(maxSalary));

  const { data, error } = await q;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ list: data ?? [] });
}

export async function PATCH(request: Request) {
  const key = getKey();
  if (!key) {
    return NextResponse.json({ error: "未配置 SUPABASE_SERVICE_ROLE_KEY" }, { status: 503 });
  }
  let body: { id?: string; update?: Record<string, unknown> };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "无效 JSON" }, { status: 400 });
  }
  if (!body.id || !body.update) {
    return NextResponse.json({ error: "需要 id 和 update 字段" }, { status: 400 });
  }

  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, key, {
    auth: { persistSession: false },
  });
  const { error } = await supabase
    .from("demand_posts")
    .update(body.update)
    .eq("id", body.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request) {
  const key = getKey();
  if (!key) {
    return NextResponse.json({ error: "未配置 SUPABASE_SERVICE_ROLE_KEY" }, { status: 503 });
  }
  let body: { id?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "无效 JSON" }, { status: 400 });
  }
  if (!body.id) {
    return NextResponse.json({ error: "需要 id" }, { status: 400 });
  }

  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, key, {
    auth: { persistSession: false },
  });
  const { error } = await supabase
    .from("demand_posts")
    .delete()
    .eq("id", body.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
