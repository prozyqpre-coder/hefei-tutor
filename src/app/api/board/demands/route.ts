import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET(request: Request) {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) return NextResponse.json({ error: "未配置 KEY" }, { status: 503 });
  const { searchParams } = new URL(request.url);
  const region = searchParams.get("region");
  const grade = searchParams.get("grade");
  const subject = searchParams.get("subject");
  const mode = searchParams.get("mode");

  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, key, { auth: { persistSession: false } });
  let q = supabase
    .from("demand_posts")
    .select("id, teach_mode, region, detail_address, gender, subject, student_grade, min_salary, max_salary, note, created_at")
    .order("created_at", { ascending: false });

  if (mode) q = q.eq("teach_mode", mode);
  if (region) q = q.eq("region", region);
  if (grade) q = q.eq("student_grade", grade);
  if (subject) q = q.eq("subject", subject);

  const { data: rows, error } = await q;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const list = rows ?? [];
  return NextResponse.json({ list });
}
