import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function toTextArray(v: unknown): string[] {
  if (Array.isArray(v)) return v.filter((x) => typeof x === "string") as string[];
  return [];
}

export async function POST(request: Request) {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) return NextResponse.json({ error: "服务端未配置 KEY" }, { status: 503 });

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "无效 JSON" }, { status: 400 });
  }

  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, key, { auth: { persistSession: false } });
  const row = {
    university: (body.university as string)?.trim() || "",
    identity: (body.identity as string) || "",
    teach_mode: (body.teach_mode as string) || "",
    gender: (body.gender as string) || null,
    regions: toTextArray(body.regions),
    grades: toTextArray(body.grades),
    subjects: toTextArray(body.subjects),
    min_salary: body.min_salary != null && Number.isFinite(Number(body.min_salary)) ? Number(body.min_salary) : null,
    max_salary: body.max_salary != null && Number.isFinite(Number(body.max_salary)) ? Number(body.max_salary) : null,
    auth_files: toTextArray(body.auth_files),
    status: (body.status as string) || "pending",
  };

  const { error } = await supabase.from("tutor_posts").insert(row);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
