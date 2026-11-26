import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { assertSameOrigin } from "@/lib/auth/guard";
import { SESSION_COOKIE, sessionCookieOptions } from "@/lib/auth/session";
import { handle } from "@/lib/api/respond";
import { recordLogout } from "@/lib/services/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export function POST(req: Request) {
  return handle(async () => {
    assertSameOrigin(req);
    await recordLogout((await cookies()).get(SESSION_COOKIE)?.value);
    const res = NextResponse.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
    res.cookies.set(SESSION_COOKIE, "", { ...sessionCookieOptions(0), maxAge: 0 });
    return res;
  });
}
