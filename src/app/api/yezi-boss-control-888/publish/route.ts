import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getKey(): string | null {
  const v = process.env.SUPABASE_SERVICE_ROLE_KEY;
  return v && typeof v === "string" && v.trim() ? v.trim() : null;
}

function toTextArray(v: unknown): string[] {
  if (Array.isArray(v)) return v.filter((x) => typeof x === "string") as string[];
  if (typeof v === "string") return v.split("、").map((s) => s.trim()).filter(Boolean);
  return [];
}

/** 管理员发布新信息：插入 tutor_posts 或 demand_posts，状态为 verified */
export async function POST(request: Request) {
  const key = getKey();
  if (!key) {
    return NextResponse.json({ error: "未配置 SUPABASE_SERVICE_ROLE_KEY" }, { status: 503 });
  }

  let body: { type?: string; [k: string]: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "无效 JSON" }, { status: 400 });
  }

  const type = body.type === "tutor" || body.type === "demand" ? body.type : null;
  if (!type) {
    return NextResponse.json({ error: "需要 type: tutor 或 demand" }, { status: 400 });
  }

  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, key, {
    auth: { persistSession: false },
  });

  if (type === "tutor") {
    const row = {
      real_name: (body.real_name as string)?.trim() || null,
      university: (body.university as string)?.trim() || "",
      identity: (body.identity as string) || null,
      gender: (body.gender as string) || null,
      teach_mode: (body.teach_mode as string) || null,
      regions: toTextArray(body.regions),
      grades: toTextArray(body.grades),
      subjects: toTextArray(body.subjects),
      min_salary: body.min_salary != null && Number.isFinite(Number(body.min_salary)) ? Number(body.min_salary) : null,
      max_salary: body.max_salary != null && Number.isFinite(Number(body.max_salary)) ? Number(body.max_salary) : null,
      note: (body.note as string)?.trim() || null,
      auth_files: [],
      status: "verified",
    };
    const { error } = await supabase.from("tutor_posts").insert(row);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  }

  const row = {
    teach_mode: (body.teach_mode as string) || null,
    region: (body.region as string)?.trim() || null,
    detail_address: (body.detail_address as string)?.trim() || null,
    gender: (body.gender as string) || null,
    subject: Array.isArray(body.subjects) ? (body.subjects as string[]).join("、") : (body.subject as string)?.trim() || null,
    student_grade: Array.isArray(body.grades) ? (body.grades as string[]).join("、") : (body.student_grade as string)?.trim() || null,
    min_salary: body.min_salary != null && Number.isFinite(Number(body.min_salary)) ? Number(body.min_salary) : null,
    max_salary: body.max_salary != null && Number.isFinite(Number(body.max_salary)) ? Number(body.max_salary) : null,
    note: (body.note as string)?.trim() || null,
  };
  const { error } = await supabase.from("demand_posts").insert(row);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
