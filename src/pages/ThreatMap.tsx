import { lazy, Suspense, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Globe2, Pause, Play, RotateCw, X, ArrowRight } from 'lucide-react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useThreatFeed } from '@/hooks/useThreatFeed';
import { Attack, AttackType, ATTACK_INFO, ATTACK_TYPES } from '@/components/threatmap/threatData';

const ThreatGlobe = lazy(() => import('@/components/threatmap/ThreatGlobe'));

const ThreatMap: React.FC = () => {
  const [filters, setFilters] = useState<AttackType[]>(ATTACK_TYPES);
  const [paused, setPaused] = useState(false);
  const [rotate, setRotate] = useState(true);
  const [selected, setSelected] = useState<Attack | null>(null);
  const { active, log, total } = useThreatFeed(filters, paused);

  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    log.forEach((a) => { c[a.to.name] = (c[a.to.name] || 0) + 1; });
    return Object.entries(c).sort((a, b) => b[1] - a[1]).slice(0, 5);
  }, [log]);

  const toggle = (t: AttackType) =>
    setFilters((f) => (f.includes(t) ? f.filter((x) => x !== t) : [...f, t]));

  return (
    <DashboardLayout>
      <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="h-10 w-10 rounded-lg bg-primary/15 border border-primary/30 flex items-center justify-center">
              <Globe2 className="h-5 w-5 text-primary" />
            </div>
            <h1 className="text-3xl md:text-4xl font-cyber font-bold text-foreground">Cyber War Room</h1>
          </div>
          <p className="text-muted-foreground max-w-2xl text-sm">
            A live simulation of global attack traffic. Drag to spin, scroll to zoom, click an arc to inspect it.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setPaused((p) => !p)}>
            {paused ? <Play className="h-4 w-4 mr-1" /> : <Pause className="h-4 w-4 mr-1" />}{paused ? 'Resume' : 'Pause'}
          </Button>
          <Button variant={rotate ? 'default' : 'outline'} size="sm" onClick={() => setRotate((r) => !r)}>
            <RotateCw className="h-4 w-4 mr-1" />Rotate
          </Button>
        </div>
      </header>

      <div className="flex flex-wrap gap-2 mb-4">
        {ATTACK_TYPES.map((t) => {
          const on = filters.includes(t);
          return (
            <button key={t} onClick={() => toggle(t)} aria-pressed={on}
              className={`flex items-center gap-2 rounded-full border px-3 py-1 text-xs transition-colors ${on ? 'border-border bg-muted text-foreground' : 'border-border/50 text-muted-foreground opacity-60'}`}>
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: ATTACK_INFO[t].color }} />{t}
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_340px] gap-4">
        <Card className="relative overflow-hidden h-[460px] md:h-[600px]">
          <div className="absolute inset-0">
          <Suspense fallback={<div className="h-full flex items-center justify-center text-muted-foreground text-sm">Loading globe…</div>}>
            <ThreatGlobe attacks={active} autoRotate={rotate} onSelect={setSelected} />
          </Suspense>
          </div>
          <div className="absolute top-3 left-3 rounded-md bg-background/80 backdrop-blur px-3 py-2 border border-border">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Attacks tracked</div>
            <div className="text-2xl font-mono font-bold text-primary">{total.toLocaleString()}</div>
          </div>
          {selected && (
            <div className="absolute bottom-3 left-3 right-3 md:right-auto md:w-80 rounded-lg bg-background/95 backdrop-blur border border-border p-4">
              <div className="flex items-start justify-between mb-2">
                <Badge style={{ background: ATTACK_INFO[selected.type].color }} className="text-background">{selected.type}</Badge>
                <button aria-label="Close details" onClick={() => setSelected(null)} className="text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>
              </div>
              <p className="text-sm text-foreground font-medium">{selected.from.name} → {selected.to.name}</p>
              <p className="text-xs text-muted-foreground mb-2">Port {selected.port} · {selected.severity} severity</p>
              <p className="text-xs text-muted-foreground mb-3">{ATTACK_INFO[selected.type].blurb}</p>
              <Button asChild size="sm" className="w-full">
                <Link to={ATTACK_INFO[selected.type].lab.path}>Practice defending: {ATTACK_INFO[selected.type].lab.label}<ArrowRight className="h-4 w-4 ml-1" /></Link>
              </Button>
            </div>
          )}
        </Card>

        <div className="flex flex-col gap-4">
          <Card>
            <CardContent className="p-4">
              <h2 className="text-sm font-semibold mb-3">Most targeted</h2>
              {counts.length === 0 && <p className="text-xs text-muted-foreground">Waiting for traffic…</p>}
              {counts.map(([city, n]) => (
                <div key={city} className="flex items-center gap-2 mb-2 text-xs">
                  <span className="w-24 truncate text-foreground">{city}</span>
                  <div className="flex-1 h-1.5 rounded bg-muted overflow-hidden">
                    <div className="h-full bg-primary transition-all" style={{ width: `${(n / counts[0][1]) * 100}%` }} />
                  </div>
                  <span className="w-6 text-right font-mono text-muted-foreground">{n}</span>
                </div>
              ))}
            </CardContent>
          </Card>
          <Card className="flex-1">
            <CardContent className="p-4">
              <h2 className="text-sm font-semibold mb-3">Live feed</h2>
              <ul className="space-y-1.5 max-h-[380px] overflow-y-auto font-mono text-[11px]">
                {log.map((a) => (
                  <li key={a.id}>
                    <button onClick={() => setSelected(a)} className="w-full text-left flex gap-2 hover:bg-muted/50 rounded px-1 py-0.5">
                      <span className="text-muted-foreground">{a.time.toLocaleTimeString([], { hour12: false })}</span>
                      <span style={{ color: ATTACK_INFO[a.type].color }}>{a.type}</span>
                      <span className="text-foreground truncate">{a.from.country}→{a.to.country} :{a.port.split('/')[0]}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
      <p className="mt-3 text-xs text-muted-foreground">Traffic shown is simulated for learning purposes.</p>
    </DashboardLayout>
  );
};

export default ThreatMap;
