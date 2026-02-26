import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createServerSupabaseClient } from "@/lib/supabase/server";

const BUCKET = "verification";

export async function POST(request: Request) {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) {
    return NextResponse.json(
      { error: "服务端未配置 SUPABASE_SERVICE_ROLE_KEY" },
      { status: 503 }
    );
  }

  const serverSupabase = await createServerSupabaseClient();
  const { data: { user } } = await serverSupabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "请先登录" }, { status: 401 });
  }

  const formData = await request.formData();
  const userId = (formData.get("user_id") as string)?.trim();
  if (userId !== user.id) {
    return NextResponse.json({ error: "只能上传本人的证件" }, { status: 403 });
  }

  const xinxue = formData.get("xinxue") as File | null;
  const studentId = formData.get("student_id") as File | null;
  if (!xinxue?.size || !studentId?.size) {
    return NextResponse.json(
      { error: "请上传学信网截图和学生证钢印页" },
      { status: 400 }
    );
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceRoleKey,
    { auth: { persistSession: false } }
  );

  const ts = Date.now();
  const ext = (f: File) => f.name.split(".").pop() || "jpg";
  const pathXinxue = `${userId}/xinxue_${ts}.${ext(xinxue)}`;
  const pathStudentId = `${userId}/student_id_${ts}.${ext(studentId)}`;

  const { error: up1 } = await supabase.storage.from(BUCKET).upload(pathXinxue, xinxue, { upsert: true });
  if (up1) {
    return NextResponse.json({ error: "学信网截图上传失败：" + up1.message }, { status: 500 });
  }
  const { error: up2 } = await supabase.storage.from(BUCKET).upload(pathStudentId, studentId, { upsert: true });
  if (up2) {
    return NextResponse.json({ error: "学生证上传失败：" + up2.message }, { status: 500 });
  }

  return NextResponse.json({ pathXinxue, pathStudentId });
}
