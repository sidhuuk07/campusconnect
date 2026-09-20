import { useState } from "react";
import { ArrowLeft, ArrowRight, Check, LockKeyhole, Sparkles, UserPlus } from "lucide-react";
import { Link } from "wouter";
import AppShell from "@/components/AppShell";
import { Field } from "@/components/PortalComponents";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { api } from "@/lib/api";

const initial = { name: "", email: "", password: "", confirmPassword: "" };
export default function Register() {
  const [form, setForm] = useState(initial);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [serverError, setServerError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  function update(key: keyof typeof initial, value: string) { setForm(prev => ({ ...prev, [key]: value })); setErrors(prev => ({ ...prev, [key]: "" })); setServerError(""); }
  async function submit(event: React.FormEvent) {
    event.preventDefault();
    const next: Record<string, string> = {};
    if (!form.name.trim()) next.name = "Name is required.";
    if (!form.email.trim()) next.email = "Email is required.";
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) next.email = "Enter a valid email address.";
    if (form.password.length < 8) next.password = "Use at least 8 characters.";
    if (form.confirmPassword !== form.password) next.confirmPassword = "Passwords do not match.";
    setErrors(next);
    if (Object.keys(next).length > 0) return;
    try { setSubmitting(true); await api.students.create({ name: form.name, email: form.email, password: form.password }); setSubmitted(true); } catch (error) { setServerError(error instanceof Error ? error.message : "Unable to register right now."); } finally { setSubmitting(false); }
  }
  return <AppShell><div className="mx-auto max-w-7xl px-5 py-12 sm:px-8 sm:py-20 lg:px-10"><div className="mx-auto max-w-2xl text-center"><div className="mx-auto mb-5 grid size-12 place-items-center rounded-2xl bg-secondary text-primary"><UserPlus className="size-5" /></div><div className="font-mono text-[11px] uppercase tracking-[0.2em] text-primary">Start here</div><h1 className="mt-3 text-4xl font-extrabold tracking-[-0.06em] sm:text-5xl">Make campus yours.</h1><p className="mx-auto mt-4 max-w-lg text-base leading-7 text-muted-foreground">Set up your student account and make room for more of the moments that matter.</p></div><Card className="mx-auto mt-10 max-w-2xl border-0 bg-card shadow-[0_18px_50px_rgba(36,66,53,0.08)]"><CardContent className="p-6 sm:p-10"><Link href="/" className="mb-7 inline-flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-foreground"><ArrowLeft className="size-4" />Back to home</Link>{submitted ? <div className="py-8 text-center"><div className="mx-auto grid size-14 place-items-center rounded-full bg-[#e2f2e5] text-primary"><Check className="size-7" /></div><h2 className="mt-5 text-2xl font-extrabold tracking-[-0.04em]">Welcome to the community.</h2><p className="mx-auto mt-3 max-w-md text-sm leading-6 text-muted-foreground">Your student record was saved through the CampusConnect backend. Explore your dashboard to see live tasks.</p><Link href="/dashboard"><Button className="mt-7 rounded-full bg-primary font-extrabold hover:bg-[#0a5d4d]">Go to dashboard <ArrowRight className="ml-2 size-4" /></Button></Link></div> : <form onSubmit={submit} className="space-y-5" noValidate><div className="mb-2 flex items-center gap-3"><Sparkles className="size-4 text-primary" /><p className="text-sm font-extrabold">Create your student profile</p></div><Field id="register-name" label="Full name" type="text" autoComplete="name" placeholder="Alex Morgan" value={form.name} onChange={e => update("name", e.target.value)} error={errors.name} /><Field id="register-email" label="University email" type="email" autoComplete="email" placeholder="you@university.edu" value={form.email} onChange={e => update("email", e.target.value)} error={errors.email} /><div className="grid gap-5 sm:grid-cols-2"><Field id="register-password" label="Password" type="password" autoComplete="new-password" placeholder="8+ characters" value={form.password} onChange={e => update("password", e.target.value)} error={errors.password} /><Field id="register-confirm" label="Confirm password" type="password" autoComplete="new-password" placeholder="Repeat password" value={form.confirmPassword} onChange={e => update("confirmPassword", e.target.value)} error={errors.confirmPassword} /></div><div className="flex items-start gap-3 rounded-xl bg-[#f3f7f2] p-4 text-xs leading-5 text-muted-foreground"><LockKeyhole className="mt-0.5 size-4 shrink-0 text-primary" /><span>Password guidance: use 8 or more characters. The backend validates this before storage.</span></div>{serverError && <p className="rounded-xl bg-[#fff0ee] p-3 text-xs font-semibold text-destructive">{serverError}</p>}<Button type="submit" disabled={submitting} className="h-12 w-full rounded-xl bg-primary font-extrabold shadow-[0_10px_22px_rgba(12,107,88,0.18)] hover:bg-[#0a5d4d]">{submitting ? "Saving student record…" : "Create account"} {!submitting && <ArrowRight className="ml-2 size-4" />}</Button><p className="pt-2 text-center text-sm text-muted-foreground">Already have an account? <Link href="/login" className="font-extrabold text-primary hover:underline">Log in</Link></p></form>}</CardContent></Card></div></AppShell>;
}
