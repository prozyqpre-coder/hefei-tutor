import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";
import { FAKE_USER_COOKIE_KEY } from "@/lib/auth-fake";

const BUCKET = "verification";

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const clientUserId = cookieStore.get(FAKE_USER_COOKIE_KEY)?.value;
  if (!clientUserId) {
    return NextResponse.json(
      { error: "未登录（缺少模拟用户标识）" },
      { status: 401 }
    );
  }

  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) {
    return NextResponse.json(
      { error: "服务端未配置 SUPABASE_SERVICE_ROLE_KEY" },
      { status: 503 }
    );
  }

  const formData = await request.formData();
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

  const id = decodeURIComponent(clientUserId);
  const ts = Date.now();
  const ext = (f: File) => f.name.split(".").pop() || "jpg";
  const pathXinxue = `${id}/xinxue_${ts}.${ext(xinxue)}`;
  const pathStudentId = `${id}/student_id_${ts}.${ext(studentId)}`;

  const { error: up1 } = await supabase.storage.from(BUCKET).upload(pathXinxue, xinxue, { upsert: true });
  if (up1) {
    return NextResponse.json({ error: "学信网截图上传失败：" + up1.message }, { status: 500 });
  }
  const { error: up2 } = await supabase.storage.from(BUCKET).upload(pathStudentId, studentId, { upsert: true });
  if (up2) {
    return NextResponse.json({ error: "学生证上传失败：" + up2.message }, { status: 500 });
  }

  const realName = (formData.get("real_name") as string)?.trim() || null;
  const university = (formData.get("university") as string)?.trim() || null;
  function toTextArray(v: unknown): string[] | null {
    if (Array.isArray(v)) {
      const arr = v.filter((x) => typeof x === "string") as string[];
      return arr.length ? arr : null;
    }
    if (typeof v === "string" && v.trim()) return [v.trim()];
    return null;
  }
  let subjects: string[] = [];
  let region: string[] = [];
  let grade: string[] = [];
  try {
    const s = formData.get("subjects");
    if (typeof s === "string") subjects = JSON.parse(s);
  } catch {}
  try {
    const r = formData.get("region");
    if (typeof r === "string") region = JSON.parse(r);
  } catch {}
  try {
    const g = formData.get("grade");
    if (typeof g === "string") grade = JSON.parse(g);
  } catch {}
  const minPriceRaw = formData.get("min_price");
  const maxPriceRaw = formData.get("max_price");
  const minPrice = minPriceRaw != null && minPriceRaw !== "" ? Number(minPriceRaw) : null;
  const maxPrice = maxPriceRaw != null && maxPriceRaw !== "" ? Number(maxPriceRaw) : null;

  const authFiles: string[] = [pathXinxue, pathStudentId];

  const row: Record<string, unknown> = {
    user_id: null,
    client_user_id: id,
    real_name: realName,
    university: university,
    auth_files: authFiles,
    subjects: subjects.length ? subjects : null,
    region: region.length ? region : null,
    grade: grade.length ? grade : null,
    min_price: Number.isFinite(minPrice) ? minPrice : null,
    max_price: Number.isFinite(maxPrice) ? maxPrice : null,
    status: "pending_review",
  };

  const { error: upsertErr } = await supabase.from("student_profiles").upsert(row, {
    onConflict: "client_user_id",
  });

  if (upsertErr) {
    return NextResponse.json({ error: upsertErr.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
