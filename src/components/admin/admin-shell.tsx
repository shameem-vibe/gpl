"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ChevronDown, LogOut, Menu, X } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";
import { ROLE_LABELS } from "@/lib/constants/roles";
import { ADMIN_NAV, type AdminNavItem } from "@/lib/constants/admin-nav";
import type { Role } from "@/types/domain";

function NavList({ items, onNavigate }: { items: AdminNavItem[]; onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <ul className="grid gap-0.5">
      {items.map(({ href, label, icon: Icon }) => {
        const active = href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
        return (
          <li key={href}>
            <Link
              href={href} onClick={onNavigate} aria-current={active ? "page" : undefined}
              className={cn("flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium",
                active ? "bg-gold/15 text-gold" : "text-chalk-dim hover:bg-pitch-800 hover:text-chalk")}
            >
              <Icon className="h-[18px] w-[18px]" aria-hidden />{label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

export function AdminShell({
  allowedHrefs, user, children,
}: { allowedHrefs: string[]; user: { email: string | null; role: Role; preview?: boolean }; children: React.ReactNode }) {
  // Only strings cross the server/client boundary; icons are resolved here. Hiding is cosmetic, APIs enforce access.
  const items = ADMIN_NAV.filter((i) => allowedHrefs.includes(i.href));
  const [drawer, setDrawer] = useState(false);
  const [menu, setMenu] = useState(false);
  return (
    <div className="min-h-screen bg-navy-900 lg:grid lg:grid-cols-[16rem_1fr]">
      <aside className="sticky top-0 hidden h-screen flex-col border-r border-chalk/10 bg-pitch-950 lg:flex">
        <div className="flex h-16 items-center border-b border-chalk/10 px-4"><Logo compact href="/admin" /></div>
        <nav aria-label="Admin" className="flex-1 overflow-y-auto p-3"><NavList items={items} /></nav>
        <Link href="/" className="border-t border-chalk/10 p-4 text-sm text-chalk-mute hover:text-gold">View public site</Link>
      </aside>

      {drawer ? (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Admin menu">
          <button aria-label="Close menu" className="absolute inset-0 bg-pitch-950/80" onClick={() => setDrawer(false)} />
          <div className="relative flex h-full w-72 max-w-[85%] flex-col bg-pitch-950">
            <div className="flex h-16 items-center justify-between border-b border-chalk/10 px-4">
              <Logo compact href="/admin" />
              <Button variant="ghost" size="icon" aria-label="Close menu" onClick={() => setDrawer(false)}><X /></Button>
            </div>
            <nav aria-label="Admin mobile" className="flex-1 overflow-y-auto p-3"><NavList items={items} onNavigate={() => setDrawer(false)} /></nav>
          </div>
        </div>
      ) : null}

      <div className="min-w-0">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b border-chalk/10 bg-navy-900/95 px-4 backdrop-blur-sm md:px-8">
          <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open menu" onClick={() => setDrawer(true)}><Menu /></Button>
          <div className="hidden lg:block" />
          <div className="relative">
            <button
              onClick={() => setMenu((v) => !v)} aria-expanded={menu} aria-haspopup="menu"
              className="flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-pitch-800"
            >
              <span aria-hidden className="flex h-8 w-8 items-center justify-center rounded-full bg-gold font-display text-pitch-950">
                {(user.email ?? "?").charAt(0).toUpperCase()}
              </span>
              <span className="hidden text-left text-sm sm:block">
                <span className="block max-w-40 truncate">{user.email}</span>
                <span className="block text-xs text-chalk-mute">{ROLE_LABELS[user.role]}</span>
              </span>
              <ChevronDown className="h-4 w-4 text-chalk-mute" aria-hidden />
            </button>
            {menu ? (
              <div role="menu" className="absolute right-0 mt-2 w-56 rounded-md border border-chalk/15 bg-pitch-900 p-1">
                <p className="px-3 py-2 text-xs text-chalk-mute">{user.preview ? "UI preview (not signed in)" : "Signed in"}</p>
                <button role="menuitem" disabled className="flex w-full items-center gap-2 rounded px-3 py-2 text-left text-sm text-chalk-mute disabled:cursor-not-allowed">
                  <LogOut className="h-4 w-4" aria-hidden />Sign out (Phase 2)
                </button>
              </div>
            ) : null}
          </div>
        </header>
        {user.preview ? (
          <div className="border-b border-gold/30 bg-gold/10 px-4 py-2 text-center text-sm text-gold md:px-8">
            <Badge variant="gold">Preview</Badge> You are viewing the admin UI without authentication. This only works in development.
          </div>
        ) : null}
        <main className="p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}
