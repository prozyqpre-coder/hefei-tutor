/** 模拟登录使用的 localStorage / cookie 键名 */
export const FAKE_USER_STORAGE_KEY = "hefei_tutor_user_id";
export const FAKE_USER_COOKIE_KEY = "hefei_tutor_user_id";

/** 生成模拟微信用户 ID */
export function generateFakeUserId(): string {
  const part = Math.random().toString(36).slice(2, 10);
  return `wx_user_${part}`;
}

/** 仅在客户端使用：从 localStorage 读取当前用户 ID（模拟登录） */
export function getFakeUserIdFromStorage(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(FAKE_USER_STORAGE_KEY);
}

/** 保存模拟用户 ID 到 localStorage 并写入 cookie（供 API 路由读取） */
export function setFakeUserId(id: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(FAKE_USER_STORAGE_KEY, id);
  document.cookie = `${FAKE_USER_COOKIE_KEY}=${encodeURIComponent(id)}; path=/; max-age=31536000; SameSite=Lax`;
}

/** 是否已通过模拟微信登录 */
export function isFakeLoggedIn(): boolean {
  return !!getFakeUserIdFromStorage();
}
