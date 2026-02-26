import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

/** 简历大厅：拉取所有已提交的教员简历（含待审核），由前端按 status 展示实名认证/待认证 */
export async function GET() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) {
    return NextResponse.json(
      { error: "服务端未配置 SUPABASE_SERVICE_ROLE_KEY" },
      { status: 503 }
    );
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceRoleKey,
    { auth: { persistSession: false } }
  );

  const { data: rows, error } = await supabase
    .from("student_profiles")
    .select("id, real_name, university, degree, region, grade, min_price, max_price, subjects, status, service_type, teach_mode, created_at")
    .not("real_name", "is", null)
    .in("status", ["pending_review", "APPROVED"])
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ list: rows ?? [] });
}
