import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const BUCKET = "verification";
const SIGNED_URL_EXPIRES = 3600;

function getKey(): string | null {
  const v = process.env.SUPABASE_SERVICE_ROLE_KEY;
  return v && typeof v === "string" && v.trim() ? v.trim() : null;
}

export async function GET() {
  const key = getKey();
  if (!key) return NextResponse.json({ error: "未配置 SUPABASE_SERVICE_ROLE_KEY" }, { status: 503 });

  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, key, { auth: { persistSession: false } });
  const { data: rows, error } = await supabase
    .from("tutor_posts")
    .select("id, real_name, university, identity, gender, teach_mode, regions, grades, subjects, min_salary, max_salary, note, auth_files, status, created_at")
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const list = await Promise.all(
    (rows || []).map(async (row) => {
      const urls: string[] = [];
      const paths = (row.auth_files as string[]) || [];
      for (const path of paths) {
        const { data } = await supabase.storage.from(BUCKET).createSignedUrl(path, SIGNED_URL_EXPIRES);
        if (data?.signedUrl) urls.push(data.signedUrl);
      }
      return { ...row, cert_urls: urls };
    })
  );

  return NextResponse.json({ list });
}

export async function PATCH(request: Request) {
  const key = getKey();
  if (!key) return NextResponse.json({ error: "未配置 SUPABASE_SERVICE_ROLE_KEY" }, { status: 503 });

  let body: { id?: string; action?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "无效 JSON" }, { status: 400 });
  }
  if (!body.id || (body.action !== "approve" && body.action !== "reject")) {
    return NextResponse.json({ error: "需要 id 和 action: approve | reject" }, { status: 400 });
  }

  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, key, { auth: { persistSession: false } });
  const newStatus = body.action === "approve" ? "verified" : "rejected";

  const { error: updateErr } = await supabase
    .from("tutor_posts")
    .update({ status: newStatus })
    .eq("id", body.id)
    .eq("status", "pending");

  if (updateErr) return NextResponse.json({ error: updateErr.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
