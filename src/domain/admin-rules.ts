import type { Role } from "@/types/domain";

/** Pure account-management rules. No Firebase imports, so they are unit-testable. */

export interface AccountState { uid: string; role: Role; active: boolean }
export interface AccountChange { role?: Role; active?: boolean }

export type RuleViolation =
  | "self_change"
  | "last_super_admin"
  | "no_change";

/**
 * Decides whether `actor` may apply `change` to `target`, given how many OTHER active super admins exist
 * (excluding the target). Returns a violation code, or null when allowed.
 */
export function checkAccountChange(
  actorUid: string,
  target: AccountState,
  change: AccountChange,
  otherActiveSuperAdmins: number,
): RuleViolation | null {
  const nextRole = change.role ?? target.role;
  const nextActive = change.active ?? target.active;
  if (nextRole === target.role && nextActive === target.active) return "no_change";
  // Nobody edits their own role or status: prevents self-lockout and self-escalation.
  if (actorUid === target.uid) return "self_change";
  const wasActiveSuper = target.role === "superAdmin" && target.active;
  const staysActiveSuper = nextRole === "superAdmin" && nextActive;
  if (wasActiveSuper && !staysActiveSuper && otherActiveSuperAdmins < 1) return "last_super_admin";
  return null;
}

export const VIOLATION_MESSAGES: Record<RuleViolation, string> = {
  self_change: "You cannot change your own role or status. Ask another Super Admin.",
  last_super_admin: "This is the last active Super Admin. Create or reactivate another Super Admin first.",
  no_change: "Nothing to change.",
};
