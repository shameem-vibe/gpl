import "server-only";
import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { HttpError } from "@/lib/auth/guard";

const noStore = { "Cache-Control": "no-store" };
export const ok = (body: unknown = { ok: true }, init?: ResponseInit) =>
  NextResponse.json(body, { ...init, headers: { ...noStore, ...(init?.headers ?? {}) } });

/** Wraps a handler: maps known errors to safe JSON, hides internals for everything else. */
export async function handle(fn: () => Promise<Response>): Promise<Response> {
  try {
    return await fn();
  } catch (e) {
    if (e instanceof HttpError) return NextResponse.json({ error: e.message }, { status: e.status, headers: noStore });
    if (e instanceof ZodError) {
      return NextResponse.json({ error: e.issues[0]?.message ?? "Invalid input." }, { status: 400, headers: noStore });
    }
    console.error("[api] unexpected error", e instanceof Error ? e.message : "unknown");
    return NextResponse.json({ error: "Something went wrong." }, { status: 500, headers: noStore });
  }
}

export async function readJson(req: Request): Promise<unknown> {
  try { return await req.json(); } catch { throw new HttpError(400, "Invalid request body."); }
}
