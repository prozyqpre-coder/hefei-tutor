/** 服务类型：合肥线下 / 安徽线上 */
export const SERVICE_TYPES = [
  { value: "offline", label: "合肥线下", desc: "仅限合肥本地" },
  { value: "online", label: "安徽线上", desc: "全省高校，远程授课" },
] as const;

export type ServiceType = (typeof SERVICE_TYPES)[number]["value"];

/** 合肥九区三县（授课方式选「合肥线下」时使用） */
export const HEFEI_AREAS = [
  "蜀山区",
  "包河区",
  "庐阳区",
  "瑶海区",
  "政务区",
  "经开区",
  "高新区",
  "滨湖新区",
  "新站区",
  "长丰县",
  "肥东县",
  "肥西县",
] as const;

/** 合肥高校（仅合肥线下时使用） */
export const UNIVERSITIES_HEFEI = [
  "中国科学技术大学",
  "合肥工业大学",
  "安徽大学",
  "安徽师范大学",
  "安徽农业大学",
  "安徽医科大学",
  "合肥大学",
  "安徽建筑大学",
] as const;

/** 安徽省主要高校（安徽线上时使用，含合肥及芜湖、蚌埠、马鞍山等地） */
export const UNIVERSITIES_ANHUI = [
  "中国科学技术大学",
  "合肥工业大学",
  "安徽大学",
  "安徽师范大学",
  "安徽农业大学",
  "安徽医科大学",
  "合肥大学",
  "安徽建筑大学",
  "安徽财经大学",
  "安徽工业大学",
  "安徽理工大学",
  "安徽工程大学",
  "皖南医学院",
  "蚌埠医学院",
  "安庆师范大学",
  "淮北师范大学",
  "安徽科技学院",
  "合肥师范学院",
  "阜阳师范大学",
  "其他",
] as const;

/** @deprecated 兼容旧代码，等同于 UNIVERSITIES_HEFEI */
export const UNIVERSITIES = UNIVERSITIES_HEFEI;

/** @deprecated 兼容旧代码，请用 HEFEI_AREAS */
export const DISTRICTS = HEFEI_AREAS;

export type HefeiArea = (typeof HEFEI_AREAS)[number];
export type District = HefeiArea;
export type UniversityHefei = (typeof UNIVERSITIES_HEFEI)[number];
export type UniversityAnhui = (typeof UNIVERSITIES_ANHUI)[number];
export type University = UniversityHefei | UniversityAnhui;

/** 常见辅导科目（可多选） */
export const SUBJECTS = [
  "数学", "语文", "英语", "物理", "化学", "生物",
  "地理", "历史", "政治", "小学全科", "初中全科", "高中全科", "其他",
] as const;

/** 价格区间（元/小时） */
export const PRICE_RANGES = [
  "50以下", "50-80", "80-120", "120-150", "150以上",
] as const;

/** 身份：大学生 / 家长 */
export const USER_IDENTITY = [
  { value: "student", label: "大学生" },
  { value: "parent", label: "家长" },
] as const;

/** 学历：本科 / 研究生（注册时身份） */
export const DEGREES = [
  { value: "本科", label: "本科生" },
  { value: "研究生", label: "研究生" },
] as const;

export type Degree = (typeof DEGREES)[number]["value"];

/** 合肥九区三县一市（发布简历/找家教时授课区域，含庐江县、巢湖市） */
export const HEFEI_AREAS_FULL = [
  "蜀山区",
  "包河区",
  "庐阳区",
  "瑶海区",
  "经开区",
  "高新区",
  "新站区",
  "滨湖新区",
  "政务区",
  "肥东县",
  "肥西县",
  "长丰县",
  "庐江县",
  "巢湖市",
] as const;

export type HefeiAreaFull = (typeof HEFEI_AREAS_FULL)[number];

/** 可授课年级（多选）：小学一年级～高三 */
export const GRADES = [
  "小学一年级",
  "小学二年级",
  "小学三年级",
  "小学四年级",
  "小学五年级",
  "小学六年级",
  "初一",
  "初二",
  "初三",
  "高一",
  "高二",
  "高三",
] as const;

/** 年级短标签（小一～高三），用于筛选与展示 */
export const GRADES_SHORT = [
  "小一", "小二", "小三", "小四", "小五", "小六",
  "初一", "初二", "初三", "高一", "高二", "高三",
] as const;

export type Grade = (typeof GRADES)[number];
export type GradeShort = (typeof GRADES_SHORT)[number];
