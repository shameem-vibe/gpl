/**
 * Best-effort in-memory sliding-window limiter. On serverless each instance has its own memory, so this slows
 * bursts and obvious abuse but is NOT a hard guarantee. Firebase Auth applies its own throttling to password
 * attempts. A shared store (e.g. Upstash free tier) is the upgrade path (docs/SECURITY.md).
 */
const hits = new Map<string, number[]>();

export function rateLimit(key: string, limit: number, windowMs: number, now = Date.now()): boolean {
  const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
  if (recent.length >= limit) { hits.set(key, recent); return false; }
  recent.push(now);
  hits.set(key, recent);
  if (hits.size > 5000) for (const [k, v] of hits) if (!v.some((t) => now - t < windowMs)) hits.delete(k);
  return true;
}
export const __resetRateLimit = () => hits.clear();

export function clientIp(req: Request): string {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "unknown";
}
