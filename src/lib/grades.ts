import { TEACHER_GRADE_OPTIONS } from "./constants";

export type TeacherGradeTier = (typeof TEACHER_GRADE_OPTIONS)[number];

/** 将任意年级字符串映射为学段大类（小学/初中/高中），用于兼容历史数据 */
export function normalizeGradeToTier(g: string): TeacherGradeTier | null {
  if (/小学|^小[一二三四五六]$/.test(g)) return "小学";
  if (/初一|初二|初三|初中/.test(g)) return "初中";
  if (/高一|高二|高三|高中/.test(g)) return "高中";
  if (TEACHER_GRADE_OPTIONS.includes(g as TeacherGradeTier)) return g as TeacherGradeTier;
  return null;
}

/** 教师卡片的年级展示：将 grades 数组归一化为 小学/初中/高中，去重并按顺序排列 */
export function teacherGradesForDisplay(grades: string[] | null): TeacherGradeTier[] {
  if (!grades?.length) return [];
  const tiers = grades
    .map(normalizeGradeToTier)
    .filter((t): t is TeacherGradeTier => t != null);
  const order: TeacherGradeTier[] = ["小学", "初中", "高中"];
  return [...new Set(tiers)].sort((a, b) => order.indexOf(a) - order.indexOf(b));
}
