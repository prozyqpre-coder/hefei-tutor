"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Loader2, XCircle, X } from "lucide-react";
import { HEFEI_AREAS_FULL, SUBJECTS, GRADES_SHORT, GRADES } from "@/lib/constants";
import { cn } from "@/lib/utils";

const MODE_OPTIONS = [
  { value: "线上", label: "线上" },
  { value: "合肥线下", label: "合肥线下" },
] as const;

const IDENTITY_OPTIONS = [
  { value: "本科生", label: "本科生" },
  { value: "研究生", label: "研究生" },
] as const;

type PendingRow = {
  id: string;
  real_name?: string | null;
  university: string | null;
  identity: string | null;
  gender: string | null;
  teach_mode: string | null;
  regions: string[] | null;
  grades: string[] | null;
  subjects: string[] | null;
  min_salary: number | null;
  max_salary: number | null;
  note?: string | null;
  auth_files: string[] | null;
  created_at: string;
  cert_urls: string[];
};

type DemandAdminRow = {
  id: string;
  teach_mode: string | null;
  region: string | null;
  detail_address: string | null;
  gender: string | null;
  subject: string | null;
  student_grade: string | null;
  min_salary: number | null;
  max_salary: number | null;
   note: string | null;
  created_at: string;
};

export default function AdminVerifyPage() {
  const router = useRouter();
  const [list, setList] = useState<PendingRow[]>([]);
  const [allTutors, setAllTutors] = useState<PendingRow[]>([]);
  const [demands, setDemands] = useState<DemandAdminRow[]>([]);
  const [tab, setTab] = useState<"tutors" | "demands">("tutors");
  const [loading, setLoading] = useState(true);
  const [actingId, setActingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [modalImage, setModalImage] = useState<{ url: string; label: string } | null>(null);

  // 教员编辑状态
  const [editingTutor, setEditingTutor] = useState<PendingRow | null>(null);
  const [editingTutorRealName, setEditingTutorRealName] = useState("");
  const [editingTutorUniversity, setEditingTutorUniversity] = useState("");
  const [editingTutorIdentity, setEditingTutorIdentity] = useState<"本科生" | "研究生" | "">("");
  const [editingTutorGender, setEditingTutorGender] = useState<"男" | "女" | "">("");
  const [editingTutorMode, setEditingTutorMode] = useState<"线上" | "合肥线下" | "">("");
  const [editingTutorRegions, setEditingTutorRegions] = useState<string[]>([]);
  const [editingTutorGrades, setEditingTutorGrades] = useState<string[]>([]);
  const [editingTutorSubjects, setEditingTutorSubjects] = useState<string[]>([]);
  const [editingTutorMinSalary, setEditingTutorMinSalary] = useState("");
  const [editingTutorMaxSalary, setEditingTutorMaxSalary] = useState("");
  const [editingTutorNote, setEditingTutorNote] = useState("");
  const [editingDemand, setEditingDemand] = useState<DemandAdminRow | null>(null);
  const [editingMode, setEditingMode] = useState<"线上" | "合肥线下" | "">("");
  const [editingRegion, setEditingRegion] = useState("");
  const [editingDetailAddress, setEditingDetailAddress] = useState("");
  const [editingGender, setEditingGender] = useState<"男" | "女" | "">("");
  const [editingGrades, setEditingGrades] = useState<string[]>([]);
  const [editingSubjects, setEditingSubjects] = useState<string[]>([]);
  const [editingMinSalary, setEditingMinSalary] = useState("");
  const [editingMaxSalary, setEditingMaxSalary] = useState("");
  const [editingNote, setEditingNote] = useState("");

  function toggleEditingTutorRegion(r: string) {
    setEditingTutorRegions((prev) => (prev.includes(r) ? prev.filter((x) => x !== r) : [...prev, r]));
  }

  function toggleEditingTutorGrade(g: string) {
    setEditingTutorGrades((prev) => (prev.includes(g) ? prev.filter((x) => x !== g) : [...prev, g]));
  }

  function toggleEditingTutorSubject(s: string) {
    setEditingTutorSubjects((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));
  }

  function toggleEditingGrade(g: string) {
    setEditingGrades((prev) => (prev.includes(g) ? prev.filter((x) => x !== g) : [...prev, g]));
  }

  function toggleEditingSubject(s: string) {
    setEditingSubjects((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));
  }

  function openTutorEdit(row: PendingRow) {
    setEditingTutor(row);
    setEditingTutorRealName(row.real_name || "");
    setEditingTutorUniversity(row.university || "");
    setEditingTutorIdentity((row.identity as "本科生" | "研究生" | null) || "");
    setEditingTutorGender((row.gender as "男" | "女" | null) || "");
    setEditingTutorMode((row.teach_mode as "线上" | "合肥线下" | null) || "");
    setEditingTutorRegions(row.regions || []);
    setEditingTutorGrades(row.grades || []);
    setEditingTutorSubjects(row.subjects || []);
    setEditingTutorMinSalary(row.min_salary != null ? String(row.min_salary) : "");
    setEditingTutorMaxSalary(row.max_salary != null ? String(row.max_salary) : "");
    setEditingTutorNote(row.note || "");
  }

  function closeTutorEdit() {
    setEditingTutor(null);
    setEditingTutorRealName("");
    setEditingTutorUniversity("");
    setEditingTutorIdentity("");
    setEditingTutorGender("");
    setEditingTutorMode("");
    setEditingTutorRegions([]);
    setEditingTutorGrades([]);
    setEditingTutorSubjects([]);
    setEditingTutorMinSalary("");
    setEditingTutorMaxSalary("");
    setEditingTutorNote("");
  }

  function openDemandEdit(d: DemandAdminRow) {
    setEditingDemand(d);
    setEditingMode((d.teach_mode as "线上" | "合肥线下" | null) || "");
    setEditingRegion(d.region || "");
    setEditingDetailAddress(d.detail_address || "");
    setEditingGender((d.gender as "男" | "女" | null) || "");
    setEditingGrades(d.student_grade ? d.student_grade.split("、").filter(Boolean) : []);
    setEditingSubjects(d.subject ? d.subject.split("、").filter(Boolean) : []);
    setEditingMinSalary(d.min_salary != null ? String(d.min_salary) : "");
    setEditingMaxSalary(d.max_salary != null ? String(d.max_salary) : "");
    setEditingNote(d.note || "");
  }

  function closeDemandEdit() {
    setEditingDemand(null);
    setEditingMode("");
    setEditingRegion("");
    setEditingDetailAddress("");
    setEditingGender("");
    setEditingGrades([]);
    setEditingSubjects([]);
    setEditingMinSalary("");
    setEditingMaxSalary("");
    setEditingNote("");
  }

  const fetchList = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/tutor-verify");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "加载失败");
      setList(data.list || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "加载失败");
      setList([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchAllTutors = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/tutor-posts");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "加载失败");
      setAllTutors(data.list || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "加载失败");
      setAllTutors([]);
    }
  }, []);

  const fetchDemands = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/demand-posts");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "加载失败");
      setDemands(data.list || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "加载失败");
      setDemands([]);
    }
  }, []);

  useEffect(() => {
    fetchList();
    fetchAllTutors();
    fetchDemands();
  }, [fetchList, fetchAllTutors, fetchDemands]);

  async function handleAction(id: string, action: "approve" | "reject") {
    setActingId(id);
    setError(null);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/tutor-verify", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "操作失败");
      setList((prev) => prev.filter((r) => r.id !== id));
      setMessage(action === "approve" ? "已通过，该教员已获得「实名认证」" : "已打回");
      setTimeout(() => setMessage(null), 3000);
    } catch (e) {
      setError(e instanceof Error ? e.message : "操作失败");
    } finally {
      setActingId(null);
    }
  }

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.replace("/admin/login");
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-xl font-bold">管理员 · 教员证件审核</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            所有申请单的证件大图，通过后显示「实名认证」，打回后显示「未认证」。
          </p>
        </div>
        <Button type="button" variant="ghost" size="sm" onClick={handleLogout}>
          退出登录
        </Button>
      </div>

      <div className="mt-4 flex gap-2 rounded-full bg-muted p-1 text-xs font-medium">
        <button
          type="button"
          onClick={() => setTab("tutors")}
          className={cn(
            "flex-1 rounded-full px-3 py-1.5",
            tab === "tutors" ? "bg-background text-primary shadow-sm" : "text-muted-foreground"
          )}
        >
          教员审核
        </button>
        <button
          type="button"
          onClick={() => setTab("demands")}
          className={cn(
            "flex-1 rounded-full px-3 py-1.5",
            tab === "demands" ? "bg-background text-primary shadow-sm" : "text-muted-foreground"
          )}
        >
          家长需求审核
        </button>
      </div>

      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
      {message && <p className="mt-4 text-sm text-green-600">{message}</p>}

      {loading ? (
        <div className="mt-8 flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : null}

      {/* 教员审核列表 */}
      {tab === "tutors" && (
        <>
          {list.length === 0 ? (
            <p className="mt-8 text-muted-foreground">暂无待审核教员。</p>
          ) : (
            <ul className="mt-6 space-y-6">
              {list.map((row) => (
                <li key={row.id} className="rounded-xl border border-border bg-card p-4 shadow-sm">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <span className="font-medium">教员</span>
                      <span className="ml-2 text-muted-foreground">{row.university || ""}</span>
                      {row.identity && <span className="ml-2 text-sm text-muted-foreground">（{row.identity}）</span>}
                      {row.gender && <span className="ml-2 text-sm text-muted-foreground">· 性别：{row.gender}</span>}
                      {row.regions?.length ? <span className="ml-2 text-sm text-muted-foreground">· {row.regions.join("、")}</span> : null}
                      {(row.min_salary != null || row.max_salary != null) && (
                        <span className="ml-2 text-sm text-muted-foreground">
                          · 薪资：￥{row.min_salary ?? "?"}-{row.max_salary ?? "?"}/小时
                        </span>
                      )}
                      <Link
                        href={`/tutor/${row.id}`}
                        target="_blank"
                        className="ml-2 text-xs text-primary underline-offset-2 hover:underline"
                      >
                        查看详情
                      </Link>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-1"
                        disabled={!!actingId}
                        onClick={() => openTutorEdit(row)}
                      >
                        修改
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        className="gap-1"
                        disabled={!!actingId}
                        onClick={async () => {
                          if (!window.confirm("确定要删除这条教员信息吗？")) return;
                          try {
                            const res = await fetch("/api/admin/tutor-posts", {
                              method: "DELETE",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({ id: row.id }),
                            });
                            const data = await res.json();
                            if (!res.ok) throw new Error(data.error || "删除失败");
                            setList((prev) => prev.filter((x) => x.id !== row.id));
                          } catch (e) {
                            setError(e instanceof Error ? e.message : "删除失败");
                          }
                        }}
                      >
                        删除
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-1"
                        disabled={!!actingId}
                        onClick={() => handleAction(row.id, "reject")}
                      >
                        {actingId === row.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4" />}
                        打回
                      </Button>
                      <Button
                        size="sm"
                        className="gap-1"
                        disabled={!!actingId}
                        onClick={() => handleAction(row.id, "approve")}
                      >
                        {actingId === row.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                        通过
                      </Button>
                    </div>
                  </div>
                  <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {row.cert_urls.map((url, i) => {
                      const label = i === 0 ? "学信网截图" : `学生证${i > 1 ? i : ""}`;
                      return (
                        <div key={i} className="overflow-hidden rounded-lg border border-border">
                          <p className="bg-muted px-2 py-1 text-xs">{label}</p>
                          <button type="button" onClick={() => setModalImage({ url, label })} className="block w-full text-left">
                            <img src={url} alt={label} className="h-auto w-full object-contain hover:opacity-90" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </li>
              ))}
            </ul>
          )}

          <h2 className="mt-10 text-sm font-semibold text-muted-foreground">信息大厅 · 全部教员（含已认证）</h2>
          {allTutors.length === 0 ? (
            <p className="mt-2 text-xs text-muted-foreground">暂无教员信息。</p>
          ) : (
            <ul className="mt-2 space-y-3 text-xs text-muted-foreground">
              {allTutors.map((t) => (
                <li key={t.id} className="rounded-lg border border-dashed border-border px-3 py-2">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="space-y-0.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-medium text-foreground">
                          {t.real_name
                            ? `${t.real_name[0]}老师`
                            : t.university
                            ? `${t.university[0]}老师`
                            : "教员"}
                        </span>
                        {t.status === "verified" ? (
                          <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] text-emerald-600">
                            已认证
                          </span>
                        ) : t.status === "pending" ? (
                          <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] text-amber-600">
                            待审核
                          </span>
                        ) : (
                          <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">
                            已打回
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {t.real_name && <span>{t.real_name}</span>}
                        {t.university && <span>{t.real_name ? `· ${t.university}` : t.university}</span>}
                        {t.identity && <span>· {t.identity}</span>}
                        {t.gender && <span>· {t.gender}</span>}
                        {t.teach_mode && <span>· {t.teach_mode}</span>}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <Link
                        href={`/tutor/${t.id}`}
                        target="_blank"
                        className="text-[11px] text-primary underline-offset-2 hover:underline"
                      >
                        查看详情
                      </Link>
                      <div className="flex gap-1">
                        <Button
                          size="xs"
                          variant="outline"
                          className="h-6 px-2 text-[11px]"
                          onClick={() => openTutorEdit(t)}
                        >
                          修改
                        </Button>
                        <Button
                          size="xs"
                          variant="destructive"
                          className="h-6 px-2 text-[11px]"
                          onClick={async () => {
                            if (!window.confirm("确定要删除这条教员信息吗？")) return;
                            try {
                              const res = await fetch("/api/admin/tutor-posts", {
                                method: "DELETE",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ id: t.id }),
                              });
                              const data = await res.json();
                              if (!res.ok) throw new Error(data.error || "删除失败");
                              setAllTutors((prev) => prev.filter((x) => x.id !== t.id));
                              setList((prev) => prev.filter((x) => x.id !== t.id));
                            } catch (e) {
                              setError(e instanceof Error ? e.message : "删除失败");
                            }
                          }}
                        >
                          删除
                        </Button>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </>
      )}

      {/* 家长发布的「找学生」信息管理 */}
      {tab === "demands" && (
        <>
          {demands.length === 0 ? (
            <p className="mt-4 text-sm text-muted-foreground">暂无「找学生」信息。</p>
          ) : (
            <ul className="mt-4 space-y-4">
              {demands.map((d) => (
                <li key={d.id} className="rounded-xl border border-border bg-card p-4 shadow-sm">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="text-sm text-muted-foreground space-y-1">
                      <div>
                        <span className="font-medium text-foreground">学生</span>
                        {d.gender && <span className="ml-2">性别：{d.gender}</span>}
                        {d.student_grade && <span className="ml-2">年级：{d.student_grade}</span>}
                      </div>
                      <div>
                        {d.teach_mode && <span>{d.teach_mode}</span>}
                        {d.region && <span className="ml-2">{d.region}</span>}
                        {d.detail_address && <span className="ml-2">{d.detail_address}</span>}
                      </div>
                      {(d.min_salary != null || d.max_salary != null) && (
                        <div>预算：￥{d.min_salary ?? "?"}-{d.max_salary ?? "?"}/小时</div>
                      )}
                      {d.subject && <div>科目：{d.subject}</div>}
                      <Link
                        href={`/demand/${d.id}`}
                        target="_blank"
                        className="inline-block text-xs text-primary underline-offset-2 hover:underline"
                      >
                        查看详情
                      </Link>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openDemandEdit(d)}
                      >
                        修改
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={async () => {
                          if (!window.confirm("确定要删除这条「找学生」信息吗？")) return;
                          try {
                            const res = await fetch("/api/admin/demand-posts", {
                              method: "DELETE",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({ id: d.id }),
                            });
                            const data = await res.json();
                            if (!res.ok) throw new Error(data.error || "删除失败");
                            setDemands((prev) => prev.filter((x) => x.id !== d.id));
                          } catch (e) {
                            setError(e instanceof Error ? e.message : "删除失败");
                          }
                        }}
                      >
                        删除
                      </Button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </>
      )}

      {modalImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4" onClick={() => setModalImage(null)} role="dialog" aria-modal="true">
          <div className="relative max-h-[90vh] max-w-4xl" onClick={(e) => e.stopPropagation()}>
            <button type="button" onClick={() => setModalImage(null)} className="absolute -right-2 -top-2 z-10 rounded-full bg-white/90 p-1.5 text-black shadow-lg" aria-label="关闭">
              <X className="h-5 w-5" />
            </button>
            <p className="mb-2 text-center text-sm text-white">{modalImage.label}</p>
            <img src={modalImage.url} alt={modalImage.label} className="max-h-[85vh] w-auto rounded-lg object-contain shadow-2xl" draggable={false} />
          </div>
        </div>
      )}

      {/* 编辑教员信息的弹窗 */}
      {editingTutor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-xl bg-background p-4 shadow-lg">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold">修改教员信息</h3>
              <button
                type="button"
                onClick={closeTutorEdit}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <form
              className="mt-4 space-y-3 text-sm"
              onSubmit={async (e) => {
                e.preventDefault();
                if (!editingTutor) return;
                const isOffline = editingTutorMode === "合肥线下";
                const min = editingTutorMinSalary.trim() ? Number(editingTutorMinSalary) : null;
                const max = editingTutorMaxSalary.trim() ? Number(editingTutorMaxSalary) : null;
                const update: Record<string, unknown> = {
                  real_name: editingTutorRealName.trim() || null,
                  university: editingTutorUniversity.trim() || null,
                  identity: editingTutorIdentity || null,
                  gender: editingTutorGender || null,
                  teach_mode: editingTutorMode || null,
                  regions: isOffline ? editingTutorRegions : [],
                  grades: editingTutorGrades,
                  subjects: editingTutorSubjects,
                  min_salary: min != null && !Number.isNaN(min) ? min : null,
                  max_salary: max != null && !Number.isNaN(max) ? max : null,
                  note: editingTutorNote.trim() || null,
                };
                try {
                  const res = await fetch("/api/admin/tutor-posts", {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ id: editingTutor.id, update }),
                  });
                  const data = await res.json();
                  if (!res.ok) throw new Error(data.error || "修改失败");
                  closeTutorEdit();
                  fetchList();
                  fetchAllTutors();
                } catch (e) {
                  setError(e instanceof Error ? e.message : "修改失败");
                }
              }}
            >
              <div>
                <label className="block text-xs text-muted-foreground">姓名（10 字以内）</label>
                <input
                  value={editingTutorRealName}
                  maxLength={10}
                  onChange={(e) => setEditingTutorRealName(e.target.value.slice(0, 10))}
                  className="mt-1 w-full rounded-md border border-input bg-background px-2 py-1"
                />
              </div>
              <div>
                <label className="block text-xs text-muted-foreground">院校</label>
                <input
                  value={editingTutorUniversity}
                  onChange={(e) => setEditingTutorUniversity(e.target.value)}
                  className="mt-1 w-full rounded-md border border-input bg-background px-2 py-1"
                />
              </div>
              <div>
                <label className="block text-xs text-muted-foreground">身份</label>
                <div className="mt-1 flex flex-wrap gap-2">
                  {IDENTITY_OPTIONS.map(({ value, label }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setEditingTutorIdentity(value)}
                      className={cn(
                        "rounded-lg border px-3 py-1.5 text-xs",
                        editingTutorIdentity === value ? "border-primary bg-primary/10 text-primary" : "border-input hover:bg-muted"
                      )}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs text-muted-foreground">性别</label>
                <div className="mt-1 flex gap-2">
                  {["男", "女"].map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setEditingTutorGender(g as "男" | "女")}
                      className={cn(
                        "rounded-lg border px-3 py-1.5 text-xs",
                        editingTutorGender === g ? "border-primary bg-primary/10 text-primary" : "border-input hover:bg-muted"
                      )}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs text-muted-foreground">授课方式</label>
                <div className="mt-1 flex flex-wrap gap-2">
                  {MODE_OPTIONS.map(({ value, label }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => {
                        setEditingTutorMode(value);
                        if (value === "线上") setEditingTutorRegions([]);
                      }}
                      className={cn(
                        "rounded-lg border px-3 py-1.5 text-xs",
                        editingTutorMode === value ? "border-primary bg-primary/10 text-primary" : "border-input hover:bg-muted"
                      )}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
              {editingTutorMode === "合肥线下" && (
                <div>
                  <label className="block text-xs text-muted-foreground">授课区域（多选）</label>
                  <div className="mt-1 flex flex-wrap gap-2">
                    {HEFEI_AREAS_FULL.map((d) => (
                      <button
                        key={d}
                        type="button"
                        onClick={() => toggleEditingTutorRegion(d)}
                        className={cn(
                          "rounded-lg border px-3 py-1.5 text-xs",
                          editingTutorRegions.includes(d) ? "border-primary bg-primary/10 text-primary" : "border-input hover:bg-muted"
                        )}
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <div>
                <label className="block text-xs text-muted-foreground">可授年级（多选）</label>
                <div className="mt-1 flex flex-wrap gap-2">
                  {GRADES.map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => toggleEditingTutorGrade(g)}
                      className={cn(
                        "rounded-lg border px-3 py-1.5 text-xs",
                        editingTutorGrades.includes(g) ? "border-primary bg-primary/10 text-primary" : "border-input hover:bg-muted"
                      )}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs text-muted-foreground">辅导科目（多选）</label>
                <div className="mt-1 flex flex-wrap gap-2">
                  {SUBJECTS.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => toggleEditingTutorSubject(s)}
                      className={cn(
                        "rounded-lg border px-3 py-1.5 text-xs",
                        editingTutorSubjects.includes(s) ? "border-primary bg-primary/10 text-primary" : "border-input hover:bg-muted"
                      )}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs text-muted-foreground">最低薪资（元/时）</label>
                  <input
                    type="number"
                    value={editingTutorMinSalary}
                    onChange={(e) => setEditingTutorMinSalary(e.target.value.replace(/\D/g, ""))}
                    className="mt-1 w-full rounded-md border border-input bg-background px-2 py-1"
                  />
                </div>
                <div>
                  <label className="block text-xs text-muted-foreground">最高薪资（元/时）</label>
                  <input
                    type="number"
                    value={editingTutorMaxSalary}
                    onChange={(e) => setEditingTutorMaxSalary(e.target.value.replace(/\D/g, ""))}
                    className="mt-1 w-full rounded-md border border-input bg-background px-2 py-1"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs text-muted-foreground">备注 / 简介（50 字以内）</label>
                <textarea
                  rows={3}
                  value={editingTutorNote}
                  onChange={(e) => setEditingTutorNote(e.target.value.slice(0, 50))}
                  maxLength={50}
                  className="mt-1 w-full rounded-md border border-input bg-background px-2 py-1"
                />
                <p className="mt-0.5 text-right text-[10px] text-muted-foreground">
                  {editingTutorNote.length}/50
                </p>
              </div>
              <div className="mt-3 flex justify-end gap-2">
                <Button type="button" variant="outline" size="sm" onClick={closeTutorEdit}>
                  取消
                </Button>
                <Button type="submit" size="sm">
                  保存
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 编辑「找学生」信息的弹窗 */}
      {editingDemand && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-xl bg-background p-4 shadow-lg">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold">修改找学生信息</h3>
              <button
                type="button"
                onClick={() => setEditingDemand(null)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <form
              className="mt-4 space-y-3 text-sm"
              onSubmit={async (e) => {
                e.preventDefault();
                if (!editingDemand) return;
                const isOffline = editingMode === "合肥线下";
                const min = editingMinSalary.trim() ? Number(editingMinSalary) : null;
                const max = editingMaxSalary.trim() ? Number(editingMaxSalary) : null;
                const update: Record<string, unknown> = {
                  teach_mode: editingMode || null,
                  region: isOffline ? (editingRegion || null) : null,
                  detail_address: isOffline ? (editingDetailAddress.trim() || null) : null,
                  gender: editingGender || null,
                  student_grade: editingGrades.length ? editingGrades.join("、") : null,
                  subject: editingSubjects.length ? editingSubjects.join("、") : null,
                  min_salary: min != null && !Number.isNaN(min) ? min : null,
                  max_salary: max != null && !Number.isNaN(max) ? max : null,
                  note: editingNote.trim() || null,
                };
                try {
                  const res = await fetch("/api/admin/demand-posts", {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ id: editingDemand.id, update }),
                  });
                  const data = await res.json();
                  if (!res.ok) throw new Error(data.error || "修改失败");
                  closeDemandEdit();
                  fetchDemands();
                } catch (e) {
                  setError(e instanceof Error ? e.message : "修改失败");
                }
              }}
            >
              <div>
                <label className="block text-xs text-muted-foreground">授课方式</label>
                <div className="mt-1 flex flex-wrap gap-2">
                  {MODE_OPTIONS.map(({ value, label }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => {
                        setEditingMode(value);
                        if (value === "线上") {
                          setEditingRegion("");
                          setEditingDetailAddress("");
                        }
                      }}
                      className={cn(
                        "rounded-lg border px-3 py-1.5 text-xs",
                        editingMode === value ? "border-primary bg-primary/10 text-primary" : "border-input hover:bg-muted"
                      )}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
              {editingMode === "合肥线下" && (
                <>
                  <div>
                    <label className="block text-xs text-muted-foreground">授课区域（合肥九区三县）</label>
                    <select
                      value={editingRegion}
                      onChange={(e) => setEditingRegion(e.target.value)}
                      className="mt-1 w-full rounded-md border border-input bg-background px-2 py-1"
                    >
                      <option value="">请选择</option>
                      {HEFEI_AREAS_FULL.map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-muted-foreground">详细地址（50 字以内）</label>
                    <input
                      value={editingDetailAddress}
                      onChange={(e) => setEditingDetailAddress(e.target.value.slice(0, 50))}
                      maxLength={50}
                      className="mt-1 w-full rounded-md border border-input bg-background px-2 py-1"
                    />
                    <p className="mt-0.5 text-right text-[10px] text-muted-foreground">
                      {editingDetailAddress.length}/50
                    </p>
                  </div>
                </>
              )}
              <div>
                <label className="block text-xs text-muted-foreground">学生年级（多选）</label>
                <div className="mt-1 flex flex-wrap gap-2">
                  {GRADES_SHORT.map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => toggleEditingGrade(g)}
                      className={cn(
                        "rounded-lg border px-3 py-1.5 text-xs",
                        editingGrades.includes(g) ? "border-primary bg-primary/10 text-primary" : "border-input hover:bg-muted"
                      )}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs text-muted-foreground">科目（多选）</label>
                <div className="mt-1 flex flex-wrap gap-2">
                  {SUBJECTS.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => toggleEditingSubject(s)}
                      className={cn(
                        "rounded-lg border px-3 py-1.5 text-xs",
                        editingSubjects.includes(s) ? "border-primary bg-primary/10 text-primary" : "border-input hover:bg-muted"
                      )}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs text-muted-foreground">学生性别</label>
                <div className="mt-1 flex gap-2">
                  {["男", "女"].map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setEditingGender(g as "男" | "女")}
                      className={cn(
                        "rounded-lg border px-3 py-1.5 text-xs",
                        editingGender === g ? "border-primary bg-primary/10 text-primary" : "border-input hover:bg-muted"
                      )}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs text-muted-foreground">最低预算（元/时）</label>
                  <input
                    type="number"
                    value={editingMinSalary}
                    onChange={(e) => setEditingMinSalary(e.target.value.replace(/\D/g, ""))}
                    className="mt-1 w-full rounded-md border border-input bg-background px-2 py-1"
                  />
                </div>
                <div>
                  <label className="block text-xs text-muted-foreground">最高预算（元/时）</label>
                  <input
                    type="number"
                    value={editingMaxSalary}
                    onChange={(e) => setEditingMaxSalary(e.target.value.replace(/\D/g, ""))}
                    className="mt-1 w-full rounded-md border border-input bg-background px-2 py-1"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs text-muted-foreground">备注 / 简介（50 字以内）</label>
                <textarea
                  rows={3}
                  value={editingNote}
                  onChange={(e) => setEditingNote(e.target.value.slice(0, 50))}
                  maxLength={50}
                  className="mt-1 w-full rounded-md border border-input bg-background px-2 py-1"
                />
                <p className="mt-0.5 text-right text-[10px] text-muted-foreground">
                  {editingNote.length}/50
                </p>
              </div>
              <div className="mt-3 flex justify-end gap-2">
                <Button type="button" variant="outline" size="sm" onClick={closeDemandEdit}>
                  取消
                </Button>
                <Button type="submit" size="sm">
                  保存
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
