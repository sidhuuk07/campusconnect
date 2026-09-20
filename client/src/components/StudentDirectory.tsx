import { useEffect, useState } from "react";
import { Loader2, Search, UserRound } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { api, type Student } from "@/lib/api";

export default function StudentDirectory() {
  const [search, setSearch] = useState("");
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => { let active = true; setLoading(true); api.students.list(search).then(result => { if (active) setStudents(result.data); }).catch(error => { if (active) setError(error instanceof Error ? error.message : "Unable to search students."); }).finally(() => active && setLoading(false)); return () => { active = false; }; }, [search]);
  return <Card className="border-0 bg-card shadow-[0_12px_35px_rgba(36,66,53,0.06)]"><CardHeader className="p-7 pb-4"><div className="flex items-center justify-between gap-3"><div><CardTitle className="text-lg font-extrabold tracking-[-0.03em]">Student directory</CardTitle><p className="mt-1 text-xs text-muted-foreground">Search registered students by name or email.</p></div><span className="grid size-9 place-items-center rounded-xl bg-secondary text-primary"><UserRound className="size-4" /></span></div></CardHeader><CardContent className="p-7 pt-2"><div className="relative"><Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input value={search} onChange={event => setSearch(event.target.value)} placeholder="Search students" className="h-11 rounded-xl bg-background pl-10" /></div>{error && <p className="mt-3 text-xs font-semibold text-destructive">{error}</p>}<div className="mt-5 space-y-2">{loading ? <p className="flex items-center gap-2 py-3 text-sm text-muted-foreground"><Loader2 className="size-4 animate-spin" />Searching…</p> : students.length ? students.slice(0, 5).map(student => <div key={student.id} className="flex items-center justify-between gap-3 rounded-xl bg-background px-3 py-2.5"><div className="min-w-0"><p className="truncate text-sm font-bold">{student.name}</p><p className="truncate text-xs text-muted-foreground">{student.email}</p></div><span className="font-mono text-[9px] uppercase tracking-[0.12em] text-primary">{student.role}</span></div>) : <p className="py-3 text-sm text-muted-foreground">No matching students found.</p>}</div></CardContent></Card>;
}
