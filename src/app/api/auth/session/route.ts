import { NextResponse } from "next/server";
import { assertSameOrigin, HttpError } from "@/lib/auth/guard";
import { SESSION_COOKIE, sessionCookieOptions } from "@/lib/auth/session";
import { handle, readJson } from "@/lib/api/respond";
import { clientIp, rateLimit } from "@/lib/security/rate-limit";
import { createAdminSession } from "@/lib/services/session";
import { sessionRequestSchema } from "@/lib/validation/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export function POST(req: Request) {
  return handle(async () => {
    assertSameOrigin(req);
    if (!rateLimit(`session:${clientIp(req)}`, 10, 60_000)) throw new HttpError(429, "Too many attempts. Wait a minute and try again.");
    const { idToken } = sessionRequestSchema.parse(await readJson(req));
    const { cookie, maxAgeSeconds } = await createAdminSession(idToken);
    const res = NextResponse.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
    res.cookies.set(SESSION_COOKIE, cookie, sessionCookieOptions(maxAgeSeconds));
    return res;
  });
}
