import type { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { Bell, CalendarDays, ChevronRight, LayoutDashboard, LogIn, Menu, Sparkles, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

const navItems = [
  { href: "/", label: "Home", icon: LayoutDashboard },
  { href: "/dashboard", label: "Dashboard", icon: Sparkles },
  { href: "/announcements", label: "Announcements", icon: Bell },
];

export function BrandMark() {
  return (
    <Link href="/" className="group flex items-center gap-3" aria-label="CampusConnect home">
      <span className="grid size-9 place-items-center rounded-xl bg-primary text-primary-foreground shadow-[0_6px_18px_rgba(12,107,88,0.22)] transition-transform duration-200 group-hover:-rotate-6">
        <Sparkles className="size-4" strokeWidth={2.4} />
      </span>
      <span className="leading-none">
        <span className="block text-[15px] font-extrabold tracking-[-0.03em]">CampusConnect</span>
        <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-muted-foreground">Student activity portal</span>
      </span>
    </Link>
  );
}

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const [location] = useLocation();
  return (
    <div className="flex flex-col gap-1 md:flex-row md:items-center md:gap-1">
      {navItems.map(({ href, label, icon: Icon }) => {
        const active = href === "/" ? location === "/" : location.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            className={`flex items-center gap-2 rounded-full px-3.5 py-2 text-sm font-semibold transition-colors duration-200 ${
              active ? "bg-secondary text-secondary-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            <Icon className="size-4" />
            {label}
          </Link>
        );
      })}
    </div>
  );
}

export default function AppShell({ children }: { children: ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border/70 bg-background/85 backdrop-blur-xl">
        <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-5 sm:px-8 lg:px-10">
          <BrandMark />
          <nav className="hidden md:block"><NavLinks /></nav>
          <div className="hidden items-center gap-3 md:flex">
            <Link href="/login" className="text-sm font-bold text-foreground transition-colors hover:text-primary">Log in</Link>
            <Link href="/register" className="group inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2.5 text-sm font-extrabold text-primary-foreground shadow-[0_6px_18px_rgba(12,107,88,0.18)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#0a5d4d]">
              Join the campus <ChevronRight className="size-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden" aria-label="Open navigation"><Menu className="size-5" /></Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[310px] bg-background p-6">
              <SheetHeader className="mb-8 text-left"><SheetTitle><BrandMark /></SheetTitle></SheetHeader>
              <NavLinks onNavigate={() => setMobileOpen(false)} />
              <div className="mt-8 grid gap-3 border-t border-border pt-6">
                <Link href="/login" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 rounded-xl px-3 py-3 text-sm font-bold text-foreground hover:bg-muted"><LogIn className="size-4" />Log in</Link>
                <Link href="/register" onClick={() => setMobileOpen(false)} className="flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-extrabold text-primary-foreground">Create account <ChevronRight className="size-4" /></Link>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </header>
      <main>{children}</main>
      <footer className="border-t border-border/80 bg-[#f0f4ee]">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-7 text-sm text-muted-foreground sm:px-8 md:flex-row md:items-center md:justify-between lg:px-10">
          <div className="flex items-center gap-2"><span className="grid size-6 place-items-center rounded-lg bg-primary text-primary-foreground"><Sparkles className="size-3" /></span><span>Built for curious students.</span></div>
          <div className="flex items-center gap-5"><span className="font-mono text-[10px] uppercase tracking-[0.16em]">CampusConnect v0.1</span><span>© 2025 Campus IT</span></div>
        </div>
      </footer>
    </div>
  );
}

export function SectionLabel({ children }: { children: ReactNode }) {
  return <div className="mb-4 flex items-center gap-2 font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-primary"><span className="size-2 rounded-full bg-accent" />{children}</div>;
}

export function PageHeading({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
  return <div className="max-w-2xl"><SectionLabel>{eyebrow}</SectionLabel><h1 className="text-4xl font-extrabold leading-[1.05] tracking-[-0.05em] text-foreground sm:text-5xl">{title}</h1><p className="mt-4 max-w-xl text-base leading-7 text-muted-foreground">{description}</p></div>;
}
