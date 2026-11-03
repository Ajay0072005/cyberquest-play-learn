import { useMemo, useState } from 'react';
import {
  FlaskConical, Network, ScanSearch, Database, Code2, Mail, Bug, KeyRound, Hammer,
  Globe2, Shuffle, ShieldOff, LayoutTemplate, Lock, Search, Siren, CheckCircle2, Circle,
  X, Loader2, ArrowRight, BookOpen, Crosshair, ShieldCheck, Wrench,
} from 'lucide-react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useLabProgress } from '@/hooks/useLabProgress';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { SECURITY_LABS, SecurityLab } from '@/data/securityLabsData';
import { cn } from '@/lib/utils';

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  network: Network, scan: ScanSearch, database: Database, code: Code2, mail: Mail,
  bug: Bug, key: KeyRound, hammer: Hammer, globe: Globe2, shuffle: Shuffle,
  'shield-off': ShieldOff, layout: LayoutTemplate, lock: Lock, search: Search, siren: Siren,
};

const DIFFICULTY_STYLES: Record<string, string> = {
  Beginner: 'text-green-500 border-green-500/40 bg-green-500/10',
  Intermediate: 'text-yellow-500 border-yellow-500/40 bg-yellow-500/10',
  Advanced: 'text-red-500 border-red-500/40 bg-red-500/10',
};

const CHALLENGE_KEY = 'cq-security-lab-challenges';

const loadChecks = (): Record<string, string[]> => {
  try {
    return JSON.parse(localStorage.getItem(CHALLENGE_KEY) ?? '{}');
  } catch {
    return {};
  }
};

const SecurityLabs: React.FC = () => {
  const { user } = useAuth();
  const { isLabCompleted, completeLab } = useLabProgress();
  const [checks, setChecks] = useState<Record<string, string[]>>(loadChecks);
  const [openLab, setOpenLab] = useState<SecurityLab | null>(null);
  const [completing, setCompleting] = useState(false);

  const persistChecks = (next: Record<string, string[]>) => {
    setChecks(next);
    localStorage.setItem(CHALLENGE_KEY, JSON.stringify(next));
  };

  const toggleChallenge = (lab: SecurityLab, challenge: string) => {
    const current = checks[lab.id] ?? [];
    const next = current.includes(challenge)
      ? current.filter((c) => c !== challenge)
      : [...current, challenge];
    persistChecks({ ...checks, [lab.id]: next });
  };

  const labProgress = (lab: SecurityLab) => {
    const done = (checks[lab.id] ?? []).length;
    return { done, total: lab.challenges.length, pct: Math.round((done / lab.challenges.length) * 100) };
  };

  const finishLab = async (lab: SecurityLab) => {
    if (!user) return;
    setCompleting(true);
    try {
      // Persist progress in the shared learning system and award XP server-side
      const ok = await completeLab(lab.id, 'security-lab', lab.points);
      if (ok && !isLabCompleted(lab.id, 'security-lab')) {
        await supabase.rpc('add_user_points', { _points: lab.points });
      }
      // mark all challenges checked for a clean node state
      persistChecks({ ...checks, [lab.id]: [...lab.challenges] });
    } finally {
      setCompleting(false);
    }
  };

  const completedCount = useMemo(
    () => SECURITY_LABS.filter((l) => isLabCompleted(l.id, 'security-lab')).length,
    // recompute when challenge state changes so the header stays fresh
    [checks, isLabCompleted],
  );
  const totalXp = useMemo(
    () => SECURITY_LABS.filter((l) => isLabCompleted(l.id, 'security-lab')).reduce((s, l) => s + l.points, 0),
    [checks, isLabCompleted],
  );

  return (
    <DashboardLayout>
      <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="h-10 w-10 rounded-lg bg-primary/15 border border-primary/30 flex items-center justify-center">
              <FlaskConical className="h-5 w-5 text-primary" />
            </div>
            <h1 className="text-3xl md:text-4xl font-cyber font-bold text-foreground">Security Labs</h1>
          </div>
          <p className="text-muted-foreground max-w-2xl text-sm">
            Hands-on cybersecurity labs: attack walkthroughs, detection methods, defensive solutions and guided
            challenges. Earn XP for every lab you complete — it counts toward your badges and the leaderboard.
          </p>
        </div>
        <div className="flex gap-6 text-center">
          <div>
            <div className="text-2xl font-mono font-bold text-primary">{completedCount}/{SECURITY_LABS.length}</div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Labs completed</div>
          </div>
          <div>
            <div className="text-2xl font-mono font-bold text-primary">{totalXp.toLocaleString()}</div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">XP earned</div>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {SECURITY_LABS.map((lab) => {
          const Icon = ICONS[lab.icon] ?? FlaskConical;
          const p = labProgress(lab);
          const done = isLabCompleted(lab.id, 'security-lab');
          return (
            <Card
              key={lab.id}
              role="button"
              tabIndex={0}
              aria-label={`Open ${lab.title} lab`}
              onClick={() => setOpenLab(lab)}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setOpenLab(lab); }}
              className="cursor-pointer hover:border-primary/50 hover:-translate-y-0.5 transition-all group"
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 border border-primary/25 flex items-center justify-center">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  {done ? (
                    <Badge className="gap-1 text-[10px] bg-primary/15 text-primary border-primary/40">
                      <CheckCircle2 className="h-3 w-3" />Complete
                    </Badge>
                  ) : (
                    <span className={cn('text-[10px] px-2 py-0.5 rounded-full border', DIFFICULTY_STYLES[lab.difficulty])}>
                      {lab.difficulty}
                    </span>
                  )}
                </div>
                <h3 className="text-sm font-semibold text-foreground mb-0.5">{lab.title}</h3>
                <p className="text-[11px] text-muted-foreground mb-3">{lab.category}</p>
                <Progress value={p.pct} className="h-1.5 mb-1" />
                <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                  <span>{p.done}/{p.total} challenges</span>
                  <span className="font-mono text-primary">{lab.points} XP</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Lab detail dialog */}
      <Dialog open={!!openLab} onOpenChange={(o) => !o && setOpenLab(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          {openLab && (() => {
            const Icon = ICONS[openLab.icon] ?? FlaskConical;
            const p = labProgress(openLab);
            const done = isLabCompleted(openLab.id, 'security-lab');
            return (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-3 text-xl">
                    <span className="h-10 w-10 rounded-lg bg-primary/10 border border-primary/25 flex items-center justify-center">
                      <Icon className="h-5 w-5 text-primary" />
                    </span>
                    {openLab.title}
                  </DialogTitle>
                  <div className="flex items-center gap-2 pt-1">
                    <span className={cn('text-[10px] px-2 py-0.5 rounded-full border', DIFFICULTY_STYLES[openLab.difficulty])}>
                      {openLab.difficulty}
                    </span>
                    <Badge variant="outline" className="text-[10px]">{openLab.category}</Badge>
                    <Badge variant="outline" className="text-[10px] font-mono text-primary border-primary/40">{openLab.points} XP</Badge>
                    {done && <Badge className="text-[10px] bg-primary/15 text-primary border-primary/40"><CheckCircle2 className="h-3 w-3 mr-1" />Completed</Badge>}
                  </div>
                </DialogHeader>

                {/* Briefing */}
                <section>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
                    <BookOpen className="h-3.5 w-3.5" />The attack
                  </h4>
                  <p className="text-sm text-foreground/90">{openLab.attackExplanation}</p>
                </section>

                <section>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
                    <Crosshair className="h-3.5 w-3.5" />Learning objectives
                  </h4>
                  <ul className="text-sm text-foreground/90 space-y-1">
                    {openLab.objectives.map((o) => <li key={o} className="flex gap-2"><ArrowRight className="h-3.5 w-3.5 text-primary mt-0.5 flex-shrink-0" />{o}</li>)}
                  </ul>
                </section>

                <div className="grid md:grid-cols-2 gap-4">
                  <section>
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
                      <Bug className="h-3.5 w-3.5" />Vulnerabilities it abuses
                    </h4>
                    <ul className="text-xs text-foreground/90 space-y-1 list-disc list-inside">
                      {openLab.vulnerabilities.map((v) => <li key={v}>{v}</li>)}
                    </ul>
                  </section>
                  <section>
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
                      <ShieldCheck className="h-3.5 w-3.5" />Detection methods
                    </h4>
                    <ul className="text-xs text-foreground/90 space-y-1 list-disc list-inside">
                      {openLab.detection.map((d) => <li key={d}>{d}</li>)}
                    </ul>
                  </section>
                  <section>
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
                      <ShieldOff className="h-3.5 w-3.5" />Defensive solutions
                    </h4>
                    <ul className="text-xs text-foreground/90 space-y-1 list-disc list-inside">
                      {openLab.defenses.map((d) => <li key={d}>{d}</li>)}
                    </ul>
                  </section>
                  <section>
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
                      <Wrench className="h-3.5 w-3.5" />Tools
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {openLab.tools.map((t) => (
                        <Badge key={t} variant="outline" className="text-[10px] font-mono">{t}</Badge>
                      ))}
                    </div>
                  </section>
                </div>

                {/* Guided challenges */}
                <section className="border-t border-border pt-3">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
                    <FlaskConical className="h-3.5 w-3.5" />Guided challenges ({p.done}/{p.total})
                  </h4>
                  <Progress value={p.pct} className="h-1.5 mb-3" />
                  <ul className="space-y-2">
                    {openLab.challenges.map((c) => {
                      const checked = (checks[openLab.id] ?? []).includes(c);
                      return (
                        <li key={c}>
                          <button
                            type="button"
                            onClick={() => toggleChallenge(openLab, c)}
                            className="w-full flex items-start gap-2 text-left text-sm hover:bg-muted/50 rounded-md px-2 py-1.5"
                          >
                            {checked ? <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" /> : <Circle className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />}
                            <span className={checked ? 'text-foreground' : 'text-foreground/80'}>{c}</span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                  <div className="flex gap-2 mt-4">
                    {done ? (
                      <Badge className="bg-primary/15 text-primary border-primary/40"><CheckCircle2 className="h-3.5 w-3.5 mr-1" />Lab completed — {openLab.points} XP earned</Badge>
                    ) : (
                      <Button
                        size="sm"
                        onClick={() => finishLab(openLab)}
                        disabled={completing || p.done < p.total}
                      >
                        {completing ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : null}
                        {p.done < p.total ? `Complete all ${p.total} challenges to earn ${openLab.points} XP` : `Claim ${openLab.points} XP`}
                      </Button>
                    )}
                    {!user && <p className="text-xs text-muted-foreground self-center">Sign in to track progress and earn XP.</p>}
                  </div>
                </section>
              </>
            );
          })()}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default SecurityLabs;
