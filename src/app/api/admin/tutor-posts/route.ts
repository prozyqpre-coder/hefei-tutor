import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getKey(): string | null {
  const v = process.env.SUPABASE_SERVICE_ROLE_KEY;
  return v && typeof v === "string" && v.trim() ? v.trim() : null;
}

function gradeShortToFull(short: string): string {
  switch (short) {
    case "小一": return "小学一年级";
    case "小二": return "小学二年级";
    case "小三": return "小学三年级";
    case "小四": return "小学四年级";
    case "小五": return "小学五年级";
    case "小六": return "小学六年级";
    default: return short;
  }
}

function phaseFromGradeShort(short: string | null): "primary" | "junior" | "senior" | null {
  if (!short) return null;
  if (short.startsWith("小")) return "primary";
  if (short.startsWith("初")) return "junior";
  if (short.startsWith("高")) return "senior";
  return null;
}

// 获取所有教员信息（支持筛选：区域、年级、科目、模式、薪资）
export async function GET(request: Request) {
  const key = getKey();
  if (!key) {
    return NextResponse.json({ error: "未配置 SUPABASE_SERVICE_ROLE_KEY" }, { status: 503 });
  }
  const { searchParams } = new URL(request.url);
  const region = searchParams.get("region");
  const gradeShort = searchParams.get("grade");
  const subject = searchParams.get("subject");
  const mode = searchParams.get("mode");
  const minSalary = searchParams.get("min_salary");
  const maxSalary = searchParams.get("max_salary");

  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, key, {
    auth: { persistSession: false },
  });

  let q = supabase
    .from("tutor_posts")
    .select("id, real_name, university, identity, gender, teach_mode, regions, grades, subjects, min_salary, max_salary, note, status, sort_order, created_at")
    .in("status", ["pending", "verified", "rejected"])
    .order("sort_order", { ascending: false })
    .order("created_at", { ascending: false });

  if (mode) q = q.eq("teach_mode", mode);
  if (region) q = q.contains("regions", [region]);
  if (minSalary) q = q.gte("min_salary", Number(minSalary));
  if (maxSalary) q = q.lte("max_salary", Number(maxSalary));

  const { data: rows, error } = await q;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const fullGrade = gradeShort ? gradeShortToFull(gradeShort) : null;
  const phase = phaseFromGradeShort(gradeShort);

  const list = (rows ?? []).filter((row) => {
    const grades = (row.grades || []) as string[];
    const subjects = (row.subjects || []) as string[];
    let gradeOk = true;
    if (fullGrade) gradeOk = grades.includes(fullGrade);
    let subjectOk = true;
    if (subject) {
      const candidates: string[] = [subject, "全科"];
      if (phase === "primary") candidates.push("小学全科");
      if (phase === "junior") candidates.push("初中全科");
      if (phase === "senior") candidates.push("高中全科");
      subjectOk = candidates.some((s) => subjects.includes(s));
    }
    return gradeOk && subjectOk;
  });

  return NextResponse.json({ list });
}

// 修改教员信息
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
    .from("tutor_posts")
    .update(body.update)
    .eq("id", body.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}

// 删除教员信息
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
    .from("tutor_posts")
    .delete()
    .eq("id", body.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}

