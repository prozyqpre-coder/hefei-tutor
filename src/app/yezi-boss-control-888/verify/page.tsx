"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Loader2, XCircle, X, ChevronDown, PenLine } from "lucide-react";
import { HEFEI_AREAS_FULL, SUBJECTS, GRADES_SHORT, TEACHER_GRADE_OPTIONS } from "@/lib/constants";
import { teacherGradesForDisplay } from "@/lib/grades";
import { adminPath, adminApiPath } from "@/lib/admin-path";
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
  teaching_style?: string | null;
  auth_files: string[] | null;
  created_at: string;
  cert_urls: string[];
  sort_order?: number;
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
  sort_order?: number;
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
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [adminFilters, setAdminFilters] = useState({
    region: "",
    grade: "",
    subject: "",
    mode: "",
    min_salary: "",
    max_salary: "",
  });

  // 教员编辑状态
  const [editingTutor, setEditingTutor] = useState<PendingRow | null>(null);
  const [editingTutorRealName, setEditingTutorRealName] = useState("");
  const [editingTutorUniversity, setEditingTutorUniversity] = useState("");
  const [editingTutorIdentity, setEditingTutorIdentity] = useState<"本科生" | "研究生" | "">("");
  const [editingTutorGender, setEditingTutorGender] = useState<"男" | "女" | "">("");
  const [editingTutorModes, setEditingTutorModes] = useState<string[]>([]);
  const [editingTutorRegions, setEditingTutorRegions] = useState<string[]>([]);
  const [editingTutorGrades, setEditingTutorGrades] = useState<string[]>([]);
  const [editingTutorSubjects, setEditingTutorSubjects] = useState<string[]>([]);
  const [editingTutorMinSalary, setEditingTutorMinSalary] = useState("");
  const [editingTutorMaxSalary, setEditingTutorMaxSalary] = useState("");
  const [editingTutorNote, setEditingTutorNote] = useState("");
  const [editingTutorTeachingStyle, setEditingTutorTeachingStyle] = useState("");
  const [editingDemand, setEditingDemand] = useState<DemandAdminRow | null>(null);
  const [editingDemandModes, setEditingDemandModes] = useState<string[]>([]);
  const [editingRegion, setEditingRegion] = useState("");
  const [editingDetailAddress, setEditingDetailAddress] = useState("");
  const [editingGender, setEditingGender] = useState<"男" | "女" | "">("");
  const [editingGrades, setEditingGrades] = useState<string[]>([]);
  const [editingSubjects, setEditingSubjects] = useState<string[]>([]);
  const [editingMinSalary, setEditingMinSalary] = useState("");
  const [editingMaxSalary, setEditingMaxSalary] = useState("");
  const [editingNote, setEditingNote] = useState("");

  // 发布新信息表单
  const [publishType, setPublishType] = useState<"tutor" | "demand">("tutor");
  const [publishLoading, setPublishLoading] = useState(false);
  const [publishRealName, setPublishRealName] = useState("");
  const [publishUniversity, setPublishUniversity] = useState("");
  const [publishIdentity, setPublishIdentity] = useState<"本科生" | "研究生" | "">("");
  const [publishGender, setPublishGender] = useState<"男" | "女" | "">("");
  const [publishModes, setPublishModes] = useState<string[]>([]);
  const [publishRegions, setPublishRegions] = useState<string[]>([]);
  const [publishGrades, setPublishGrades] = useState<string[]>([]);
  const [publishSubjects, setPublishSubjects] = useState<string[]>([]);
  const [publishMinSalary, setPublishMinSalary] = useState("");
  const [publishMaxSalary, setPublishMaxSalary] = useState("");
  const [publishRegion, setPublishRegion] = useState("");
  const [publishDetailAddress, setPublishDetailAddress] = useState("");
  const [publishNote, setPublishNote] = useState("");
  const [publishTeachingStyle, setPublishTeachingStyle] = useState("");

  function togglePublishRegion(r: string) {
    setPublishRegions((prev) => (prev.includes(r) ? prev.filter((x) => x !== r) : [...prev, r]));
  }
  function togglePublishGrade(g: string) {
    setPublishGrades((prev) => (prev.includes(g) ? prev.filter((x) => x !== g) : [...prev, g]));
  }
  function togglePublishSubject(s: string) {
    setPublishSubjects((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));
  }
  function togglePublishMode(m: string) {
    setPublishModes((prev) => {
      const next = prev.includes(m) ? prev.filter((x) => x !== m) : [...prev, m];
      if (!next.includes("合肥线下")) setPublishRegions([]);
      return next;
    });
  }

  async function handlePublishSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    if (publishType === "tutor" && !publishUniversity.trim()) {
      setError("请填写院校");
      return;
    }
    setPublishLoading(true);
    try {
      const body: Record<string, unknown> = {
        type: publishType,
        teach_modes: publishModes.length ? publishModes : null,
        gender: publishGender || null,
        min_salary: publishMinSalary.trim() ? Number(publishMinSalary) : null,
        max_salary: publishMaxSalary.trim() ? Number(publishMaxSalary) : null,
        note: publishNote.trim() || null,
      };
      if (publishType === "tutor") {
        body.real_name = publishRealName.trim() || null;
        body.university = publishUniversity.trim() || "";
        body.identity = publishIdentity || null;
        body.regions = publishRegions;
        body.grades = publishGrades;
        body.subjects = publishSubjects;
      } else {
        body.region = publishRegion.trim() || null;
        body.detail_address = publishDetailAddress.trim() || null;
        body.grades = publishGrades;
        body.subjects = publishSubjects;
      }
      const res = await fetch(adminApiPath("publish"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        credentials: "same-origin",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "发布失败");
      setMessage("发布成功，已直接上架。");
      setPublishRealName("");
      setPublishUniversity("");
      setPublishIdentity("");
      setPublishGender("");
      setPublishModes([]);
      setPublishRegions([]);
      setPublishGrades([]);
      setPublishSubjects([]);
      setPublishMinSalary("");
      setPublishMaxSalary("");
      setPublishRegion("");
      setPublishDetailAddress("");
      setPublishNote("");
      setPublishTeachingStyle("");
      setShowPublishModal(false);
      fetchList();
      fetchAllTutors();
      fetchDemands();
    } catch (e) {
      setError(e instanceof Error ? e.message : "发布失败");
    } finally {
      setPublishLoading(false);
    }
  }

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
    setEditingTutorModes(row.teach_mode ? row.teach_mode.split("、").filter(Boolean) : []);
    setEditingTutorRegions(row.regions || []);
    setEditingTutorGrades(teacherGradesForDisplay(row.grades || []));
    setEditingTutorSubjects(row.subjects || []);
    setEditingTutorMinSalary(row.min_salary != null ? String(row.min_salary) : "");
    setEditingTutorMaxSalary(row.max_salary != null ? String(row.max_salary) : "");
    setEditingTutorNote(row.note || "");
    setEditingTutorTeachingStyle(row.teaching_style || "");
  }

  function closeTutorEdit() {
    setEditingTutor(null);
    setEditingTutorRealName("");
    setEditingTutorUniversity("");
    setEditingTutorIdentity("");
    setEditingTutorGender("");
    setEditingTutorModes([]);
    setEditingTutorRegions([]);
    setEditingTutorGrades([]);
    setEditingTutorSubjects([]);
    setEditingTutorMinSalary("");
    setEditingTutorMaxSalary("");
    setEditingTutorNote("");
    setEditingTutorTeachingStyle("");
  }

  function openDemandEdit(d: DemandAdminRow) {
    setEditingDemand(d);
    setEditingDemandModes(d.teach_mode ? d.teach_mode.split("、").filter(Boolean) : []);
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
    setEditingDemandModes([]);
    setEditingRegion("");
    setEditingDetailAddress("");
    setEditingGender("");
    setEditingGrades([]);
    setEditingSubjects([]);
    setEditingMinSalary("");
    setEditingMaxSalary("");
    setEditingNote("");
  }

  const [sortSavingId, setSortSavingId] = useState<string | null>(null);

  async function saveTutorSortOrder(id: string, sort_order: number) {
    setSortSavingId(id);
    setError(null);
    try {
      const res = await fetch(adminApiPath("tutor-posts"), {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, update: { sort_order } }),
        credentials: "same-origin",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "保存失败");
      setAllTutors((prev) => prev.map((t) => (t.id === id ? { ...t, sort_order } : t)));
    } catch (e) {
      setError(e instanceof Error ? e.message : "保存失败");
    } finally {
      setSortSavingId(null);
    }
  }

  async function saveDemandSortOrder(id: string, sort_order: number) {
    setSortSavingId(id);
    setError(null);
    try {
      const res = await fetch(adminApiPath("demand-posts"), {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, update: { sort_order } }),
        credentials: "same-origin",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "保存失败");
      setDemands((prev) => prev.map((d) => (d.id === id ? { ...d, sort_order } : d)));
    } catch (e) {
      setError(e instanceof Error ? e.message : "保存失败");
    } finally {
      setSortSavingId(null);
    }
  }

  const fetchList = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(adminApiPath("tutor-verify"), { credentials: "same-origin" });
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
      const params = new URLSearchParams();
      if (adminFilters.region) params.set("region", adminFilters.region);
      if (adminFilters.grade) params.set("grade", adminFilters.grade);
      if (adminFilters.subject) params.set("subject", adminFilters.subject);
      if (adminFilters.mode) params.set("mode", adminFilters.mode);
      if (adminFilters.min_salary) params.set("min_salary", adminFilters.min_salary);
      if (adminFilters.max_salary) params.set("max_salary", adminFilters.max_salary);
      const res = await fetch(`${adminApiPath("tutor-posts")}?${params}`, { credentials: "same-origin" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "加载失败");
      setAllTutors(data.list || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "加载失败");
      setAllTutors([]);
    }
  }, [adminFilters]);

  const fetchDemands = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (adminFilters.region) params.set("region", adminFilters.region);
      if (adminFilters.grade) params.set("grade", adminFilters.grade);
      if (adminFilters.subject) params.set("subject", adminFilters.subject);
      if (adminFilters.mode) params.set("mode", adminFilters.mode);
      if (adminFilters.min_salary) params.set("min_salary", adminFilters.min_salary);
      if (adminFilters.max_salary) params.set("max_salary", adminFilters.max_salary);
      const res = await fetch(`${adminApiPath("demand-posts")}?${params}`, { credentials: "same-origin" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "加载失败");
      setDemands(data.list || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "加载失败");
      setDemands([]);
    }
  }, [adminFilters]);

  useEffect(() => {
    fetchList();
    fetchAllTutors();
    fetchDemands();
  }, [fetchList, fetchAllTutors, fetchDemands]);

  useEffect(() => {
    if (tab === "tutors") {
      fetchAllTutors();
    } else {
      fetchDemands();
    }
  }, [adminFilters, tab, fetchAllTutors, fetchDemands]);

  async function handleAction(id: string, action: "approve" | "reject") {
    setActingId(id);
    setError(null);
    setMessage(null);
    try {
      const res = await fetch(adminApiPath("tutor-verify"), {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action }),
        credentials: "same-origin",
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
    await fetch(adminApiPath("logout"), { method: "POST", credentials: "same-origin" });
    router.replace(adminPath("login"));
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-xl font-bold">管理员 · 管理中心</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            筛选、审核、手动录入。通过后显示「实名认证」，打回后显示「未认证」。
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button type="button" size="sm" className="gap-1" onClick={() => setShowPublishModal(true)}>
            <PenLine className="h-4 w-4" />
            手动录入
          </Button>
          <Button type="button" variant="ghost" size="sm" onClick={handleLogout}>
            退出登录
          </Button>
        </div>
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

      <div className="mt-3 border border-border rounded-lg px-4 py-2">
        <button
          type="button"
          onClick={() => setFilterOpen((o) => !o)}
          className="flex w-full items-center justify-between text-sm text-muted-foreground"
        >
          <span>筛选：区域、年级、科目、模式、薪资</span>
          <ChevronDown className={cn("h-4 w-4 transition", filterOpen && "rotate-180")} />
        </button>
        {filterOpen && (
          <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
            <select
              value={adminFilters.region}
              onChange={(e) => setAdminFilters((f) => ({ ...f, region: e.target.value }))}
              className="rounded-lg border border-input bg-background px-3 py-2"
            >
              <option value="">区域</option>
              {HEFEI_AREAS_FULL.map((a) => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>
            <select
              value={adminFilters.grade}
              onChange={(e) => setAdminFilters((f) => ({ ...f, grade: e.target.value }))}
              className="rounded-lg border border-input bg-background px-3 py-2"
            >
              <option value="">年级</option>
              {tab === "tutors"
                ? TEACHER_GRADE_OPTIONS.map((g) => (
                    <option key={g} value={g}>{g}</option>
                  ))
                : GRADES_SHORT.map((g) => (
                    <option key={g} value={g}>{g}</option>
                  ))}
            </select>
            <select
              value={adminFilters.subject}
              onChange={(e) => setAdminFilters((f) => ({ ...f, subject: e.target.value }))}
              className="rounded-lg border border-input bg-background px-3 py-2"
            >
              <option value="">科目</option>
              {SUBJECTS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <select
              value={adminFilters.mode}
              onChange={(e) => setAdminFilters((f) => ({ ...f, mode: e.target.value }))}
              className="rounded-lg border border-input bg-background px-3 py-2"
            >
              <option value="">模式</option>
              <option value="线上">线上</option>
              <option value="合肥线下">合肥线下</option>
            </select>
            <input
              type="number"
              placeholder="最低薪资"
              value={adminFilters.min_salary}
              onChange={(e) => setAdminFilters((f) => ({ ...f, min_salary: e.target.value.replace(/\D/g, "") }))}
              className="rounded-lg border border-input bg-background px-3 py-2"
            />
            <input
              type="number"
              placeholder="最高薪资"
              value={adminFilters.max_salary}
              onChange={(e) => setAdminFilters((f) => ({ ...f, max_salary: e.target.value.replace(/\D/g, "") }))}
              className="rounded-lg border border-input bg-background px-3 py-2"
            />
          </div>
        )}
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
if (!window.confirm("确定要删除这条教员信息吗？删除后无法恢复。")) return;
                            try {
                              const res = await fetch(adminApiPath("tutor-posts"), {
                                method: "DELETE",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ id: row.id }),
                                credentials: "same-origin",
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
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] text-muted-foreground">排序</span>
                        <input
                          key={`t-${t.id}-${t.sort_order ?? 0}`}
                          type="number"
                          className="h-6 w-12 rounded border border-input bg-background px-1 text-center text-[11px]"
                          defaultValue={t.sort_order ?? 0}
                          onBlur={(e) => {
                            const v = parseInt(e.target.value, 10);
                            if (!Number.isNaN(v)) saveTutorSortOrder(t.id, v);
                          }}
                        />
                        <Button
                          size="xs"
                          variant="outline"
                          className="h-6 px-1.5 text-[10px]"
                          disabled={sortSavingId === t.id}
                          onClick={() => saveTutorSortOrder(t.id, (t.sort_order ?? 0) + 1)}
                        >
                          上移
                        </Button>
                        <Button
                          size="xs"
                          variant="outline"
                          className="h-6 px-1.5 text-[10px]"
                          disabled={sortSavingId === t.id}
                          onClick={() => saveTutorSortOrder(t.id, Math.max(0, (t.sort_order ?? 0) - 1))}
                        >
                          下移
                        </Button>
                      </div>
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
                            if (!window.confirm("确定要删除这条教员信息吗？删除后无法恢复。")) return;
                            try {
                              const res = await fetch(adminApiPath("tutor-posts"), {
                                method: "DELETE",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ id: t.id }),
                                credentials: "same-origin",
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
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] text-muted-foreground">排序</span>
                        <input
                          key={`d-${d.id}-${d.sort_order ?? 0}`}
                          type="number"
                          className="h-6 w-12 rounded border border-input bg-background px-1 text-center text-[11px]"
                          defaultValue={d.sort_order ?? 0}
                          onBlur={(e) => {
                            const v = parseInt(e.target.value, 10);
                            if (!Number.isNaN(v)) saveDemandSortOrder(d.id, v);
                          }}
                        />
                        <Button
                          size="xs"
                          variant="outline"
                          className="h-6 px-1.5 text-[10px]"
                          disabled={sortSavingId === d.id}
                          onClick={() => saveDemandSortOrder(d.id, (d.sort_order ?? 0) + 1)}
                        >
                          上移
                        </Button>
                        <Button
                          size="xs"
                          variant="outline"
                          className="h-6 px-1.5 text-[10px]"
                          disabled={sortSavingId === d.id}
                          onClick={() => saveDemandSortOrder(d.id, Math.max(0, (d.sort_order ?? 0) - 1))}
                        >
                          下移
                        </Button>
                      </div>
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
                          if (!window.confirm("确定要删除这条「找学生」信息吗？删除后无法恢复。")) return;
                          try {
                            const res = await fetch(adminApiPath("demand-posts"), {
                              method: "DELETE",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({ id: d.id }),
                              credentials: "same-origin",
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

      {/* 手动录入弹窗：完整发布表单 */}
      {showPublishModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-xl bg-background p-4 shadow-lg">
            <div className="flex items-center justify-between sticky top-0 bg-background pb-2 border-b border-border">
              <h3 className="text-base font-semibold">手动录入</h3>
              <button type="button" onClick={() => setShowPublishModal(false)} className="text-muted-foreground hover:text-foreground">
                <X className="h-5 w-5" />
              </button>
            </div>
        <form onSubmit={handlePublishSubmit} className="mt-4 space-y-4">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setPublishType("tutor")}
              className={cn(
                "flex-1 rounded-lg border px-3 py-2 text-sm font-medium",
                publishType === "tutor" ? "border-primary bg-primary/10 text-primary" : "border-input hover:bg-muted"
              )}
            >
              发布教员信息
            </button>
            <button
              type="button"
              onClick={() => setPublishType("demand")}
              className={cn(
                "flex-1 rounded-lg border px-3 py-2 text-sm font-medium",
                publishType === "demand" ? "border-primary bg-primary/10 text-primary" : "border-input hover:bg-muted"
              )}
            >
              发布家长需求
            </button>
          </div>

          {publishType === "tutor" && (
            <>
              <div>
                <label className="block text-xs text-muted-foreground">姓名（选填）</label>
                <input value={publishRealName} onChange={(e) => setPublishRealName(e.target.value.slice(0, 10))} maxLength={10} className="mt-1 w-full rounded-md border border-input bg-background px-2 py-1.5 text-sm" />
              </div>
              <div>
                <label className="block text-xs text-muted-foreground">院校 *</label>
                <input value={publishUniversity} onChange={(e) => setPublishUniversity(e.target.value)} className="mt-1 w-full rounded-md border border-input bg-background px-2 py-1.5 text-sm" required />
              </div>
              <div>
                <label className="block text-xs text-muted-foreground">身份</label>
                <div className="mt-1 flex gap-2">
                  {IDENTITY_OPTIONS.map(({ value, label }) => (
                    <button key={value} type="button" onClick={() => setPublishIdentity(value)} className={cn("rounded-lg border px-3 py-1.5 text-xs", publishIdentity === value ? "border-primary bg-primary/10 text-primary" : "border-input")}>{label}</button>
                  ))}
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-xs text-muted-foreground">性别</label>
            <div className="mt-1 flex gap-2">
              {["男", "女"].map((g) => (
                <button key={g} type="button" onClick={() => setPublishGender(g as "男" | "女")} className={cn("rounded-lg border px-3 py-1.5 text-xs", publishGender === g ? "border-primary bg-primary/10 text-primary" : "border-input")}>{g}</button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs text-muted-foreground">授课方式（可多选）</label>
            <div className="mt-1 flex gap-2">
              {MODE_OPTIONS.map(({ value, label }) => (
                <label key={value} className="flex cursor-pointer items-center gap-2">
                  <input
                    type="checkbox"
                    checked={publishModes.includes(value)}
                    onChange={() => togglePublishMode(value)}
                    className="h-4 w-4 rounded border-input"
                  />
                  <span className="text-sm">{label}</span>
                </label>
              ))}
            </div>
          </div>
          {publishModes.includes("合肥线下") && (
            <div>
              <label className="block text-xs text-muted-foreground">授课区域（多选）</label>
              <div className="mt-1 flex flex-wrap gap-2">
                {HEFEI_AREAS_FULL.map((d) => (
                  <button key={d} type="button" onClick={() => togglePublishRegion(d)} className={cn("rounded-lg border px-3 py-1.5 text-xs", publishRegions.includes(d) ? "border-primary bg-primary/10 text-primary" : "border-input")}>{d}</button>
                ))}
              </div>
            </div>
          )}
          {publishType === "demand" && publishModes.includes("合肥线下") && (
            <>
              <div>
                <label className="block text-xs text-muted-foreground">区域</label>
                <input value={publishRegion} onChange={(e) => setPublishRegion(e.target.value)} className="mt-1 w-full rounded-md border border-input bg-background px-2 py-1.5 text-sm" />
              </div>
              <div>
                <label className="block text-xs text-muted-foreground">详细地址</label>
                <input value={publishDetailAddress} onChange={(e) => setPublishDetailAddress(e.target.value)} className="mt-1 w-full rounded-md border border-input bg-background px-2 py-1.5 text-sm" />
              </div>
            </>
          )}
          <div>
            <label className={cn("block text-xs", publishType === "tutor" ? "font-bold text-gray-800 dark:text-gray-200" : "text-muted-foreground")}>
              {publishType === "tutor" ? "可授年级（多选）" : "学生年级（多选）"}
            </label>
            <div className="mt-1 flex flex-wrap gap-2">
              {publishType === "tutor" ? (
                TEACHER_GRADE_OPTIONS.map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => togglePublishGrade(g)}
                    className={cn(
                      "inline-flex min-w-[2.5rem] items-center justify-center rounded-md px-3 py-1.5 text-xs font-medium mx-1",
                      publishGrades.includes(g) ? "border border-primary bg-primary/10 text-primary" : "border border-input bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                    )}
                  >
                    {g}
                  </button>
                ))
              ) : (
                GRADES_SHORT.map((g) => (
                  <button key={g} type="button" onClick={() => togglePublishGrade(g)} className={cn("rounded-lg border px-3 py-1.5 text-xs", publishGrades.includes(g) ? "border-primary bg-primary/10 text-primary" : "border-input")}>
                    {g}
                  </button>
                ))
              )}
            </div>
          </div>
          <div>
            <label className="block text-xs text-muted-foreground">辅导科目（多选）</label>
            <div className="mt-1 flex flex-wrap gap-2">
              {SUBJECTS.map((s) => (
                <button key={s} type="button" onClick={() => togglePublishSubject(s)} className={cn("rounded-lg border px-3 py-1.5 text-xs", publishSubjects.includes(s) ? "border-primary bg-primary/10 text-primary" : "border-input")}>{s}</button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs text-muted-foreground">最低薪资/预算（元/时）</label>
              <input type="number" value={publishMinSalary} onChange={(e) => setPublishMinSalary(e.target.value.replace(/\D/g, ""))} className="mt-1 w-full rounded-md border border-input bg-background px-2 py-1.5 text-sm" />
            </div>
            <div>
              <label className="block text-xs text-muted-foreground">最高薪资/预算（元/时）</label>
              <input type="number" value={publishMaxSalary} onChange={(e) => setPublishMaxSalary(e.target.value.replace(/\D/g, ""))} className="mt-1 w-full rounded-md border border-input bg-background px-2 py-1.5 text-sm" />
            </div>
          </div>
          <div>
            <label className="block text-xs text-muted-foreground">备注</label>
            <textarea value={publishNote} onChange={(e) => setPublishNote(e.target.value)} rows={2} className="mt-1 w-full rounded-md border border-input bg-background px-2 py-1.5 text-sm" />
          </div>
          {publishType === "tutor" && (
            <div>
              <label className="block text-xs text-muted-foreground">授课风格 / 教师寄语（可选）</label>
              <textarea value={publishTeachingStyle} onChange={(e) => setPublishTeachingStyle(e.target.value)} rows={2} placeholder="如：耐心细致，善于启发思考" className="mt-1 w-full rounded-md border border-input bg-background px-2 py-1.5 text-sm" />
            </div>
          )}
          <Button type="submit" className="w-full" disabled={publishLoading}>
            {publishLoading ? "发布中…" : "发布（直接上架）"}
          </Button>
        </form>
          </div>
        </div>
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
                const isOffline = editingTutorModes.includes("合肥线下");
                const min = editingTutorMinSalary.trim() ? Number(editingTutorMinSalary) : null;
                const max = editingTutorMaxSalary.trim() ? Number(editingTutorMaxSalary) : null;
                const update: Record<string, unknown> = {
                  real_name: editingTutorRealName.trim() || null,
                  university: editingTutorUniversity.trim() || null,
                  identity: editingTutorIdentity || null,
                  gender: editingTutorGender || null,
                  teach_mode: editingTutorModes.length ? editingTutorModes.join("、") : null,
                  regions: isOffline ? editingTutorRegions : [],
                  grades: editingTutorGrades,
                  subjects: editingTutorSubjects,
                  min_salary: min != null && !Number.isNaN(min) ? min : null,
                  max_salary: max != null && !Number.isNaN(max) ? max : null,
                  note: editingTutorNote.trim() || null,
                  teaching_style: editingTutorTeachingStyle.trim() || null,
                };
                try {
                  const res = await fetch(adminApiPath("tutor-posts"), {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ id: editingTutor.id, update }),
                    credentials: "same-origin",
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
                <label className="block text-xs text-muted-foreground">授课方式（可多选）</label>
                <div className="mt-1 flex flex-wrap gap-2">
                  {MODE_OPTIONS.map(({ value, label }) => (
                    <label key={value} className="flex cursor-pointer items-center gap-2">
                      <input
                        type="checkbox"
                        checked={editingTutorModes.includes(value)}
                        onChange={() => {
                          setEditingTutorModes((prev) => {
                            const next = prev.includes(value) ? prev.filter((x) => x !== value) : [...prev, value];
                            if (!next.includes("合肥线下")) setEditingTutorRegions([]);
                            return next;
                          });
                        }}
                        className="h-4 w-4 rounded border-input"
                      />
                      <span className="text-sm">{label}</span>
                    </label>
                  ))}
                </div>
              </div>
              {editingTutorModes.includes("合肥线下") && (
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
                <label className="block text-xs font-bold text-gray-800 dark:text-gray-200">可授年级（多选）</label>
                <div className="mt-1 flex flex-wrap gap-2 -mx-1">
                  {TEACHER_GRADE_OPTIONS.map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => toggleEditingTutorGrade(g)}
                      className={cn(
                        "inline-flex min-w-[2.5rem] items-center justify-center rounded-md px-3 py-1.5 text-xs font-medium mx-1",
                        editingTutorGrades.includes(g) ? "border border-primary bg-primary/10 text-primary" : "border border-input bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
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
              <div>
                <label className="block text-xs text-muted-foreground">授课风格 / 教师寄语（可选）</label>
                <textarea
                  rows={2}
                  value={editingTutorTeachingStyle}
                  onChange={(e) => setEditingTutorTeachingStyle(e.target.value)}
                  placeholder="如：耐心细致，善于启发思考"
                  className="mt-1 w-full rounded-md border border-input bg-background px-2 py-1"
                />
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
                const isOffline = editingDemandModes.includes("合肥线下");
                const min = editingMinSalary.trim() ? Number(editingMinSalary) : null;
                const max = editingMaxSalary.trim() ? Number(editingMaxSalary) : null;
                const update: Record<string, unknown> = {
                  teach_mode: editingDemandModes.length ? editingDemandModes.join("、") : null,
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
                  const res = await fetch(adminApiPath("demand-posts"), {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ id: editingDemand.id, update }),
                    credentials: "same-origin",
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
                <label className="block text-xs text-muted-foreground">授课方式（可多选）</label>
                <div className="mt-1 flex flex-wrap gap-2">
                  {MODE_OPTIONS.map(({ value, label }) => (
                    <label key={value} className="flex cursor-pointer items-center gap-2">
                      <input
                        type="checkbox"
                        checked={editingDemandModes.includes(value)}
                        onChange={() => {
                          setEditingDemandModes((prev) => {
                            const next = prev.includes(value) ? prev.filter((x) => x !== value) : [...prev, value];
                            if (!next.includes("合肥线下")) {
                              setEditingRegion("");
                              setEditingDetailAddress("");
                            }
                            return next;
                          });
                        }}
                        className="h-4 w-4 rounded border-input"
                      />
                      <span className="text-sm">{label}</span>
                    </label>
                  ))}
                </div>
              </div>
              {editingDemandModes.includes("合肥线下") && (
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
