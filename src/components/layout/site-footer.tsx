import Link from "next/link";
import { Facebook, Mail, MapPin, Phone, Youtube } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { PUBLIC_NAV, SITE } from "@/lib/constants/site";

export function SiteFooter() {
  return (
    <footer className="stripes mt-8 border-t border-chalk/10 bg-pitch-950">
      <div className="container grid gap-10 py-12 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <Logo />
          <p className="mt-4 max-w-sm text-chalk-mute">{SITE.secondary}</p>
          <div className="mt-5 flex gap-2">
            <a href={SITE.social.facebook} aria-label="GPL on Facebook" className="rounded-md border border-chalk/15 p-2.5 text-chalk-dim hover:border-gold hover:text-gold"><Facebook className="h-5 w-5" /></a>
            <a href={SITE.social.youtube} aria-label="GPL on YouTube" className="rounded-md border border-chalk/15 p-2.5 text-chalk-dim hover:border-gold hover:text-gold"><Youtube className="h-5 w-5" /></a>
          </div>
        </div>
        <nav aria-label="Footer">
          <h2 className="text-xl">Explore</h2>
          <ul className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-chalk-dim">
            {PUBLIC_NAV.map((n) => (
              <li key={n.href}><Link href={n.href} className="hover:text-gold">{n.label}</Link></li>
            ))}
          </ul>
        </nav>
        <div>
          <h2 className="text-xl">Contact</h2>
          <ul className="mt-3 space-y-2 text-chalk-dim">
            <li className="flex items-center gap-2"><MapPin className="h-4 w-4 text-gold" aria-hidden />{SITE.contact.location}</li>
            <li className="flex items-center gap-2"><Phone className="h-4 w-4 text-gold" aria-hidden />{SITE.contact.phone}</li>
            <li className="flex items-center gap-2"><Mail className="h-4 w-4 text-gold" aria-hidden />{SITE.contact.email}</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-chalk/10 py-4 text-center text-sm text-chalk-mute">
        © {new Date().getFullYear()} Gobindapur Premier League. Contact details above are placeholders.
      </div>
    </footer>
  );
}
