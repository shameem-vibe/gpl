import { assertSameOrigin, requirePermission } from "@/lib/auth/guard";
import { handle, ok, readJson } from "@/lib/api/respond";
import { updateStaff } from "@/lib/services/admin-users";
import { uidSchema, updateAdminSchema } from "@/lib/validation/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export function PATCH(req: Request, { params }: { params: Promise<{ uid: string }> }) {
  return handle(async () => {
    assertSameOrigin(req);
    const actor = await requirePermission("users:manage");
    const uid = uidSchema.parse((await params).uid);
    const input = updateAdminSchema.parse(await readJson(req));
    return ok({ user: await updateStaff(actor, uid, input) });
  });
}
