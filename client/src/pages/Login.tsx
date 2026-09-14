import { useState } from "react";
import { ArrowLeft, ArrowRight, LockKeyhole, Mail, ShieldCheck, Sparkles } from "lucide-react";
import { Link } from "wouter";
import AppShell from "@/components/AppShell";
import { Field } from "@/components/PortalComponents";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  function update(key: keyof typeof form, value: string) { setForm(prev => ({ ...prev, [key]: value })); setErrors(prev => ({ ...prev, [key]: "" })); }
  function submit(event: React.FormEvent) {
    event.preventDefault();
    const next: Record<string, string> = {};
    if (!form.email.trim()) next.email = "Email is required.";
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) next.email = "Enter a valid email address.";
    if (!form.password) next.password = "Password is required.";
    setErrors(next);
    if (Object.keys(next).length === 0) setSubmitted(true);
  }

  return <AppShell><div className="mx-auto grid max-w-7xl gap-10 px-5 py-12 sm:px-8 sm:py-20 lg:grid-cols-[0.85fr_1.15fr] lg:items-center lg:px-10"><div className="hidden rounded-[30px] bg-primary p-10 text-primary-foreground shadow-[0_20px_55px_rgba(12,107,88,0.16)] lg:block"><div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-[#b9e1c4]"><Sparkles className="size-4" />Welcome back</div><h1 className="mt-10 max-w-md text-5xl font-extrabold leading-[1.02] tracking-[-0.07em]">Pick up where your campus story left off.</h1><p className="mt-6 max-w-md text-sm leading-7 text-[#c9e2d0]">Your dashboard keeps the people, opportunities, and moments worth remembering close at hand.</p><div className="mt-14 grid gap-4 border-t border-white/15 pt-7 text-sm"><div className="flex items-center gap-3"><span className="grid size-9 place-items-center rounded-xl bg-white/10"><ShieldCheck className="size-4" /></span><span>Private and built for students</span></div><div className="flex items-center gap-3"><span className="grid size-9 place-items-center rounded-xl bg-white/10"><LockKeyhole className="size-4" /></span><span>One secure place for campus life</span></div></div></div><div className="mx-auto w-full max-w-lg"><Link href="/" className="mb-8 inline-flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-foreground"><ArrowLeft className="size-4" />Back to home</Link><Card className="border-0 bg-card shadow-[0_18px_50px_rgba(36,66,53,0.08)]"><CardContent className="p-6 sm:p-9"><div className="mb-8"><div className="mb-4 grid size-11 place-items-center rounded-2xl bg-secondary text-primary"><Mail className="size-5" /></div><h2 className="text-3xl font-extrabold tracking-[-0.055em]">Log in to CampusConnect</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">Use your university email to access your student space.</p></div>{submitted ? <div className="rounded-2xl border border-[#bfdfc8] bg-[#edf8ef] p-5"><p className="font-extrabold text-primary">You’re ready to go.</p><p className="mt-2 text-sm leading-6 text-muted-foreground">This starter project uses a demo session. Continue to your dashboard to explore the experience.</p><Link href="/dashboard"><Button className="mt-5 rounded-full bg-primary font-extrabold hover:bg-[#0a5d4d]">Open dashboard <ArrowRight className="ml-2 size-4" /></Button></Link></div> : <form onSubmit={submit} className="space-y-5" noValidate><Field id="login-email" label="University email" type="email" autoComplete="email" placeholder="you@university.edu" value={form.email} onChange={e => update("email", e.target.value)} error={errors.email} /><Field id="login-password" label="Password" type="password" autoComplete="current-password" placeholder="Enter your password" value={form.password} onChange={e => update("password", e.target.value)} error={errors.password} hint="Forgot password?" /><Button type="submit" className="mt-2 h-12 w-full rounded-xl bg-primary font-extrabold shadow-[0_10px_22px_rgba(12,107,88,0.18)] hover:bg-[#0a5d4d]">Log in <ArrowRight className="ml-2 size-4" /></Button><p className="pt-2 text-center text-sm text-muted-foreground">New to campus? <Link href="/register" className="font-extrabold text-primary hover:underline">Create an account</Link></p></form>}</CardContent></Card><p className="mt-6 text-center text-xs leading-5 text-muted-foreground">By continuing, you agree to use CampusConnect for university-related activities only.</p></div></div></AppShell>;
}
