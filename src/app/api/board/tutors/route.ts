import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// 教员年级匹配：支持大类（小学/初中/高中）及历史数据（小学一年级、小一、初一 等）
function tutorGradeMatches(filterGrade: string | null, grades: string[]): boolean {
  if (!filterGrade || !grades.length) return true;
  if (filterGrade === "小学") {
    return grades.some((g) => g === "小学" || /^小学|^小[一二三四五六]$/.test(g));
  }
  if (filterGrade === "初中") {
    return grades.some((g) => g === "初中" || /^初[一二三]$/.test(g));
  }
  if (filterGrade === "高中") {
    return grades.some((g) => g === "高中" || /^高[一二三]$/.test(g));
  }
  // 兼容旧筛选：小一 -> 小学一年级 或 小学
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
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) return NextResponse.json({ error: "未配置 KEY" }, { status: 503 });
  const { searchParams } = new URL(request.url);
  const region = searchParams.get("region");
  const gradeShort = searchParams.get("grade");
  const subject = searchParams.get("subject");
  const mode = searchParams.get("mode");
  const minSalary = searchParams.get("min_salary");
  const maxSalary = searchParams.get("max_salary");
  const education = searchParams.get("education");

  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, key, {
    auth: { persistSession: false },
  });

  // 信息大厅只展示已发布（verified）；排序：sort_order 降序，再 created_at 倒序
  let q = supabase
    .from("tutor_posts")
    .select("id, real_name, university, identity, badge_text, gender, teach_mode, regions, grades, subjects, min_salary, max_salary, note, teaching_style, auth_files, status, created_at")
    .eq("status", "verified")
    .order("sort_order", { ascending: false })
    .order("created_at", { ascending: false });

  if (mode) q = q.ilike("teach_mode", `%${mode}%`);
  if (region) q = q.contains("regions", [region]);
  if (minSalary) q = q.gte("min_salary", Number(minSalary));
  if (maxSalary) q = q.lte("max_salary", Number(maxSalary));
  if (education) q = q.eq("identity", education);

  const { data: rows, error } = await q;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const phase = phaseFromGrade(gradeShort);

  const list = (rows ?? []).filter((row) => {
    const grades = (row.grades || []) as string[];
    const subjects = (row.subjects || []) as string[];

    const gradeOk = tutorGradeMatches(gradeShort, grades);

    // 2）科目匹配：
    //    - 如果没选科目，则不限制
    //    - 如果选了科目：
    //      - 科目数组包含该科目
    //      - 或包含「全科」
    //      - 或包含对应学段的「小学全科 / 初中全科 / 高中全科」
    let subjectOk = true;
    if (subject) {
      const candidates: string[] = [subject, "全科"];
      if (phase === "primary") candidates.push("小学全科");
      if (phase === "junior")  candidates.push("初中全科");
      if (phase === "senior")  candidates.push("高中全科");

      subjectOk = candidates.some((s) => subjects.includes(s));
    }

    return gradeOk && subjectOk;
  });

  return NextResponse.json({ list });
}
