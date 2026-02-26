import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// 将前端下拉框的短年级（小一 / 小二 / 初一 等）映射为 tutor_posts.grades 中的完整年级
function gradeShortToFull(short: string): string {
  switch (short) {
    case "小一": return "小学一年级";
    case "小二": return "小学二年级";
    case "小三": return "小学三年级";
    case "小四": return "小学四年级";
    case "小五": return "小学五年级";
    case "小六": return "小学六年级";
    default:
      return short; // 初一 / 初二 / 初三 / 高一 / 高二 / 高三，本身就是完整写法
  }
}

// 根据短年级判断所属学段：小学 / 初中 / 高中
function phaseFromGradeShort(short: string | null): "primary" | "junior" | "senior" | null {
  if (!short) return null;
  if (short.startsWith("小")) return "primary";
  if (short.startsWith("初")) return "junior";
  if (short.startsWith("高")) return "senior";
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

  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, key, {
    auth: { persistSession: false },
  });

  // 先用简单条件在数据库侧过滤：模式 / 区域 / 薪资区间
  let q = supabase
    .from("tutor_posts")
    .select("id, real_name, university, identity, gender, teach_mode, regions, grades, subjects, min_salary, max_salary, note, auth_files, status, created_at")
    .in("status", ["pending", "verified"])
    .order("created_at", { ascending: false });

  if (mode) q = q.eq("teach_mode", mode);
  if (region) q = q.contains("regions", [region]);
  if (minSalary) q = q.gte("min_salary", Number(minSalary));
  if (maxSalary) q = q.lte("max_salary", Number(maxSalary));

  const { data: rows, error } = await q;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const phase = phaseFromGradeShort(gradeShort);
  const fullGrade = gradeShort ? gradeShortToFull(gradeShort) : null;

  const list = (rows ?? []).filter((row) => {
    const grades = (row.grades || []) as string[];
    const subjects = (row.subjects || []) as string[];

    // 1）年级匹配：如果没选年级，则不限制；选了，则必须包含对应完整年级
    let gradeOk = true;
    if (fullGrade) {
      gradeOk = grades.includes(fullGrade);
    }

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
