import Link from "next/link";
import { CheckCircle2, CircleDashed } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ADMIN_NAV } from "@/lib/constants/admin-nav";
import { isAdminConfigured } from "@/lib/firebase/admin";
import { can } from "@/domain/permissions";
import { getCurrentAdmin } from "@/lib/auth/session";

export const metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const user = await getCurrentAdmin();
  // Honest status board: nothing here is a fake statistic.
  const checklist = [
    { label: "Firebase Admin credentials", done: isAdminConfigured(), note: "Set in Vercel environment variables" },
    { label: "Admin sign-in and sessions", done: false, note: "Phase 2" },
    { label: "Firestore security rules deployed", done: false, note: "Deploy firebase/firestore.rules" },
    { label: "Seasons and teams", done: false, note: "Phase 3" },
    { label: "Match scoring", done: false, note: "Phase 5" },
  ];
  const modules = ADMIN_NAV.filter((i) => i.slug && user && can(user.role, i.permission));
  return (
    <div className="mx-auto max-w-6xl">
      <h1 className="text-5xl">Dashboard</h1>
      <p className="mt-2 text-chalk-dim">Live numbers appear here once the data modules are connected.</p>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_1.4fr]">
        <Card>
          <CardHeader><CardTitle>Setup status</CardTitle></CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {checklist.map((c) => (
                <li key={c.label} className="flex items-start gap-3">
                  {c.done ? <CheckCircle2 className="mt-0.5 h-5 w-5 text-win" aria-label="Done" /> : <CircleDashed className="mt-0.5 h-5 w-5 text-chalk-mute" aria-label="Not done" />}
                  <span><span className="block">{c.label}</span><span className="text-sm text-chalk-mute">{c.note}</span></span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Modules</CardTitle></CardHeader>
          <CardContent>
            <ul className="grid gap-2 sm:grid-cols-2">
              {modules.map((m) => (
                <li key={m.href}>
                  <Link href={m.href} className="flex items-center justify-between gap-3 rounded-md border border-chalk/10 p-3 hover:border-gold/50">
                    <span className="flex items-center gap-3"><m.icon className="h-5 w-5 text-gold" aria-hidden />{m.label}</span>
                    <Badge>{m.phase}</Badge>
                  </Link>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
