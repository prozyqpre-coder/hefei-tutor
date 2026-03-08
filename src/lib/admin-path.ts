/** 后台路径（仅你知晓，勿泄露）。访问 /admin 会 404。 */
export const ADMIN_BASE = "yezi-boss-control-888";

export function adminPath(subpath: string): string {
  const p = subpath.startsWith("/") ? subpath : `/${subpath}`;
  return `/${ADMIN_BASE}${p}`;
}

export function adminApiPath(subpath: string): string {
  const p = subpath.startsWith("/") ? subpath : `/${subpath}`;
  return `/api/${ADMIN_BASE}${p}`;
}
