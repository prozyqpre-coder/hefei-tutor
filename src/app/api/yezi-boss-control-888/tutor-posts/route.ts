import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getKey(): string | null {
  const v = process.env.SUPABASE_SERVICE_ROLE_KEY;
  return v && typeof v === "string" && v.trim() ? v.trim() : null;
}

function tutorGradeMatches(filterGrade: string | null, grades: string[]): boolean {
  if (!filterGrade || !grades.length) return true;
  if (filterGrade === "小学") return grades.some((g) => g === "小学" || /^小学|^小[一二三四五六]$/.test(g));
  if (filterGrade === "初中") return grades.some((g) => g === "初中" || /^初[一二三]$/.test(g));
  if (filterGrade === "高中") return grades.some((g) => g === "高中" || /^高[一二三]$/.test(g));
  const shortToFull: Record<string, string> = {
    小一: "小学一年级", 小二: "小学二年级", 小三: "小学三年级",
    小四: "小学四年级", 小五: "小学五年级", 小六: "小学六年级",
  };
  const full = shortToFull[filterGrade] ?? filterGrade;
  return grades.includes(full) || (filterGrade.startsWith("小") && grades.includes("小学")) ||
    (filterGrade.startsWith("初") && grades.includes("初中")) || (filterGrade.startsWith("高") && grades.includes("高中"));
}

function phaseFromGrade(filterGrade: string | null): "primary" | "junior" | "senior" | null {
  if (!filterGrade) return null;
  if (filterGrade === "小学" || filterGrade.startsWith("小")) return "primary";
  if (filterGrade === "初中" || filterGrade.startsWith("初")) return "junior";
  if (filterGrade === "高中" || filterGrade.startsWith("高")) return "senior";
  return null;
}

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
    .select("id, real_name, university, identity, badge_text, gender, teach_mode, regions, grades, subjects, min_salary, max_salary, note, teaching_style, status, sort_order, serial_number, created_at")
    .in("status", ["pending", "verified", "rejected"])
    .order("sort_order", { ascending: false })
    .order("created_at", { ascending: false });

  if (mode) q = q.ilike("teach_mode", `%${mode}%`);
  if (region) q = q.contains("regions", [region]);
  if (minSalary) q = q.gte("min_salary", Number(minSalary));
  if (maxSalary) q = q.lte("max_salary", Number(maxSalary));

  const { data: rows, error } = await q;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const phase = phaseFromGrade(gradeShort);

  const list = (rows ?? []).filter((row) => {
    const grades = (row.grades || []) as string[];
    const subjects = (row.subjects || []) as string[];
    const gradeOk = tutorGradeMatches(gradeShort, grades);
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
