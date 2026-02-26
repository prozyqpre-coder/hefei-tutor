import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const BUCKET = "verification";
const SIGNED_URL_EXPIRES = 3600;
const NOTIFY_MESSAGE = "恭喜！您的庐江地区家教资格已激活。";

function getServiceRoleKey(): string | null {
  const v = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (v == null || typeof v !== "string") return null;
  const trimmed = v.trim();
  return trimmed === "" ? null : trimmed;
}

export async function GET() {
  const key = getServiceRoleKey();
  if (!key) {
    return NextResponse.json(
      {
        error:
          "未配置 SUPABASE_SERVICE_ROLE_KEY。请在项目根目录 .env.local 中添加该变量并重启 dev server（npm run dev）。",
      },
      { status: 503 }
    );
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    key,
    { auth: { persistSession: false } }
  );

  const { data: rows, error } = await supabase
    .from("student_profiles")
    .select("id, user_id, client_user_id, real_name, university, degree, region, grade, min_price, max_price, auth_files, created_at")
    .eq("status", "pending_review")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const list = await Promise.all(
    (rows || []).map(async (row) => {
      const urls: string[] = [];
      const paths = (row.auth_files as string[]) || [];
      for (const path of paths) {
        const { data } = await supabase.storage.from(BUCKET).createSignedUrl(path, SIGNED_URL_EXPIRES);
        if (data?.signedUrl) urls.push(data.signedUrl);
      }
      let phone: string | null = null;
      if (row.user_id) {
        try {
          const { data: userData } = await supabase.auth.admin.getUserById(row.user_id);
          const u = userData?.user;
          if (u) {
            phone =
              (u.user_metadata?.phone as string) ||
              (typeof u.email === "string" && u.email.replace(/@gmail\.com$/i, "")) ||
              null;
          }
        } catch {
          // ignore
        }
      }
      return {
        ...row,
        cert_urls: urls,
        phone,
      };
    })
  );

  return NextResponse.json({ list });
}

export async function PATCH(request: Request) {
  const key = getServiceRoleKey();
  if (!key) {
    return NextResponse.json(
      {
        error:
          "未配置 SUPABASE_SERVICE_ROLE_KEY。请在 .env.local 中添加并重启。",
      },
      { status: 503 }
    );
  }

  let body: { id?: string; action?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "无效 JSON" }, { status: 400 });
  }

  if (body.action !== "approve" || !body.id) {
    return NextResponse.json({ error: "需要 id 和 action: approve" }, { status: 400 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    key,
    { auth: { persistSession: false } }
  );

  const { data: profile } = await supabase
    .from("student_profiles")
    .select("user_id, client_user_id")
    .eq("id", body.id)
    .eq("status", "pending_review")
    .single();

  if (!profile) {
    return NextResponse.json({ error: "记录不存在或已处理" }, { status: 404 });
  }

  const { error: updateErr } = await supabase
    .from("student_profiles")
    .update({ status: "APPROVED" })
    .eq("id", body.id)
    .eq("status", "pending_review");

  if (updateErr) {
    return NextResponse.json({ error: updateErr.message }, { status: 500 });
  }

  const { error: notifErr } = await supabase.from("notifications").insert({
    user_id: profile.user_id ?? null,
    client_user_id: profile.client_user_id ?? null,
    message: NOTIFY_MESSAGE,
    is_read: false,
  });

  if (notifErr) {
    // 通知插入失败不影响通过结果，仅记录
    console.warn("notification insert failed:", notifErr.message);
  }

  return NextResponse.json({ ok: true });
}
