/** Only allow redirects back into /admin. Blocks open redirects such as //evil.com or https://evil.com. */
export function safeAdminRedirect(next: string | null | undefined, fallback = "/admin"): string {
  if (!next || typeof next !== "string") return fallback;
  if (!next.startsWith("/admin") || next.startsWith("//") || next.includes("\\") || /[\r\n]/.test(next)) return fallback;
  if (next.startsWith("/admin/login") || next.startsWith("/admin/forgot-password")) return fallback;
  return next;
}
