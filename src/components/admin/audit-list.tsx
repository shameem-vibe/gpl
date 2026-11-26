import { Badge } from "@/components/ui/badge";
import { ROLE_LABELS } from "@/lib/constants/roles";
import { formatDateTime } from "@/lib/utils/format";
import type { AuditLogEntry } from "@/types/domain";

export function AuditList({ entries, showActor, empty }: { entries: AuditLogEntry[]; showActor: boolean; empty: string }) {
  if (!entries.length) return <p className="text-chalk-mute">{empty}</p>;
  return (
    <ul className="divide-y divide-chalk/10">
      {entries.map((e) => (
        <li key={e.id} className="flex flex-wrap items-start justify-between gap-2 py-3">
          <div className="min-w-0">
            <p className="break-words">{e.summary}</p>
            <p className="text-sm text-chalk-mute">
              {showActor ? <>{e.actorEmail ?? e.actorUid}{e.actorRole ? ` (${ROLE_LABELS[e.actorRole]})` : ""} · </> : null}
              <time dateTime={e.createdAt ?? undefined}>{formatDateTime(e.createdAt)}</time>
            </p>
          </div>
          <Badge>{e.action}</Badge>
        </li>
      ))}
    </ul>
  );
}
