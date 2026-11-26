import { assertSameOrigin, requirePermission } from "@/lib/auth/guard";
import { handle, ok } from "@/lib/api/respond";
import { issueResetLink } from "@/lib/services/admin-users";
import { uidSchema } from "@/lib/validation/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export function POST(req: Request, { params }: { params: Promise<{ uid: string }> }) {
  return handle(async () => {
    assertSameOrigin(req);
    const actor = await requirePermission("users:manage");
    const uid = uidSchema.parse((await params).uid);
    return ok({ resetLink: await issueResetLink(actor, uid) });
  });
}
