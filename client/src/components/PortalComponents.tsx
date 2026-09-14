import type { InputHTMLAttributes, ReactNode } from "react";
import { CalendarDays, CheckCircle2, Clock3, MapPin, UserRound } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function Field({ label, error, hint, ...props }: InputHTMLAttributes<HTMLInputElement> & { label: string; error?: string; hint?: string }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2"><Label htmlFor={props.id}>{label}</Label>{hint && <span className="text-xs text-muted-foreground">{hint}</span>}</div>
      <Input {...props} className={`h-12 rounded-xl bg-white/70 px-4 text-sm shadow-none transition-[box-shadow,border-color] placeholder:text-muted-foreground/70 focus-visible:border-primary focus-visible:ring-4 focus-visible:ring-primary/10 ${error ? "border-destructive focus-visible:border-destructive focus-visible:ring-destructive/10" : ""}`} />
      {error && <p className="text-xs font-semibold text-destructive">{error}</p>}
    </div>
  );
}

export function StatCard({ label, value, detail, icon, tone = "green" }: { label: string; value: string; detail: string; icon: ReactNode; tone?: "green" | "yellow" | "blue" }) {
  const toneClass = tone === "yellow" ? "bg-[#fff6d8] text-[#8c6a00]" : tone === "blue" ? "bg-[#e5f0f4] text-[#2f6b82]" : "bg-secondary text-primary";
  return <Card className="border-0 bg-card shadow-[0_12px_35px_rgba(36,66,53,0.06)]"><CardContent className="p-5"><div className="flex items-start justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground">{label}</p><p className="mt-3 text-3xl font-extrabold tracking-[-0.06em]">{value}</p></div><span className={`grid size-10 place-items-center rounded-xl ${toneClass}`}>{icon}</span></div><p className="mt-3 text-xs font-medium text-muted-foreground">{detail}</p></CardContent></Card>;
}

export type Announcement = { id: string; category: string; title: string; summary: string; publishedAt: string; readTime: string; featured?: boolean };

export function AnnouncementCard({ item, compact = false }: { item: Announcement; compact?: boolean }) {
  return <article className={`group rounded-2xl border border-border/75 bg-card p-5 shadow-[0_12px_35px_rgba(36,66,53,0.045)] transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_18px_42px_rgba(36,66,53,0.09)] ${item.featured && !compact ? "md:p-7" : ""}`}>
    <div className="flex items-start justify-between gap-3"><Badge className="border-0 bg-secondary font-mono text-[10px] uppercase tracking-[0.14em] text-secondary-foreground">{item.category}</Badge><span className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">{item.readTime}</span></div>
    <h3 className={`mt-5 font-extrabold leading-tight tracking-[-0.035em] ${item.featured && !compact ? "text-2xl" : "text-lg"}`}>{item.title}</h3>
    <p className="mt-3 text-sm leading-6 text-muted-foreground">{item.summary}</p>
    <div className="mt-5 flex items-center gap-2 border-t border-border/70 pt-4 text-xs font-semibold text-muted-foreground"><CalendarDays className="size-3.5" />{item.publishedAt}</div>
  </article>;
}

export function WelcomeIdentity({ name }: { name: string }) {
  return <div className="flex items-center gap-3"><div className="grid size-10 place-items-center rounded-xl bg-[#dceee2] text-primary"><UserRound className="size-5" /></div><div><p className="text-sm font-extrabold">{name}</p><p className="font-mono text-[10px] uppercase tracking-[0.13em] text-muted-foreground">Student member</p></div></div>;
}

export function ScheduleRow({ time, title, location, color = "green" }: { time: string; title: string; location: string; color?: "green" | "yellow" }) {
  return <div className="flex gap-4"><div className={`mt-1 size-2.5 shrink-0 rounded-full ${color === "yellow" ? "bg-accent" : "bg-primary"}`} /><div className="min-w-0 flex-1"><div className="flex flex-col justify-between gap-1 sm:flex-row"><p className="text-sm font-extrabold">{title}</p><span className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">{time}</span></div><p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground"><MapPin className="size-3" />{location}</p></div></div>;
}

export function ProgressBar({ value, label, detail }: { value: number; label: string; detail: string }) {
  return <div><div className="mb-2 flex items-center justify-between text-xs"><span className="font-bold">{label}</span><span className="font-mono text-muted-foreground">{detail}</span></div><div className="h-2 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-primary transition-all duration-700" style={{ width: `${value}%` }} /></div></div>;
}

export function EmptyState({ icon, title, description }: { icon: ReactNode; title: string; description: string }) {
  return <div className="grid place-items-center rounded-2xl border border-dashed border-border bg-card/60 px-6 py-12 text-center"><span className="grid size-12 place-items-center rounded-2xl bg-secondary text-primary">{icon}</span><h3 className="mt-4 text-base font-extrabold">{title}</h3><p className="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">{description}</p></div>;
}

export function SmallStatus({ children }: { children: ReactNode }) {
  return <span className="inline-flex items-center gap-1.5 rounded-full bg-[#edf7ef] px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-primary"><CheckCircle2 className="size-3" />{children}</span>;
}

export function ActivityIcon({ children }: { children: ReactNode }) {
  return <span className="grid size-9 place-items-center rounded-xl bg-secondary text-primary">{children}</span>;
}

export function TimeIcon() { return <Clock3 className="size-4" />; }
