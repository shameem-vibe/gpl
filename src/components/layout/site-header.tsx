"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { PUBLIC_NAV } from "@/lib/constants/site";
import { cn } from "@/lib/utils/cn";

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  return (
    <header className="sticky top-0 z-40 border-b border-chalk/10 bg-pitch-900/95 backdrop-blur-sm">
      <div className="container flex h-16 items-center justify-between gap-4">
        <Logo />
        <nav aria-label="Main" className="hidden items-center gap-0.5 xl:flex">
          {PUBLIC_NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive(item.href) ? "page" : undefined}
              className={cn(
                "rounded px-3 py-2 text-sm font-medium transition-colors hover:text-chalk",
                isActive(item.href) ? "text-gold" : "text-chalk-dim",
                item.href === "/live" && "inline-flex items-center gap-2",
              )}
            >
              {item.href === "/live" ? <span aria-hidden className="h-2 w-2 animate-pulseDot rounded-full bg-live" /> : null}
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Button asChild size="sm" className="hidden sm:inline-flex">
            <Link href="/register">Register as a player</Link>
          </Button>
          <Button
            variant="ghost" size="icon" className="xl:hidden"
            aria-expanded={open} aria-controls="mobile-nav" aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X /> : <Menu />}
          </Button>
        </div>
      </div>
      {open ? (
        <nav id="mobile-nav" aria-label="Mobile" className="border-t border-chalk/10 bg-pitch-900 xl:hidden">
          <ul className="container grid gap-1 py-3">
            {PUBLIC_NAV.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setOpen(false)}
                  aria-current={isActive(item.href) ? "page" : undefined}
                  className={cn("block rounded px-3 py-3 text-base font-medium", isActive(item.href) ? "bg-pitch-800 text-gold" : "text-chalk-dim")}
                >
                  {item.label}
                </Link>
              </li>
            ))}
            <li className="pt-2">
              <Button asChild className="w-full"><Link href="/register" onClick={() => setOpen(false)}>Register as a player</Link></Button>
            </li>
          </ul>
        </nav>
      ) : null}
    </header>
  );
}
