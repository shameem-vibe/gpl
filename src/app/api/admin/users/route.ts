import { assertSameOrigin, requirePermission } from "@/lib/auth/guard";
import { handle, ok, readJson } from "@/lib/api/respond";
import { createStaff } from "@/lib/services/admin-users";
import { createAdminSchema } from "@/lib/validation/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export function POST(req: Request) {
  return handle(async () => {
    assertSameOrigin(req);
    const actor = await requirePermission("users:manage");
    const input = createAdminSchema.parse(await readJson(req));
    return ok(await createStaff(actor, input), { status: 201 });
  });
}
