import { useState, useMemo } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Clock, Search, X, Shield, AlertTriangle, ChevronRight, ExternalLink,
  Crosshair, BookOpen, HelpCircle, Calendar, DollarSign, Users, Eye, EyeOff, ArrowUpDown
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cyberAttacks, CyberAttack } from '@/data/cyberAttacksData';

const categories = ['All', 'Ransomware', 'Data Breach', 'Supply Chain', 'Zero-Day', 'Nation-State', 'Wiper', 'DDoS', 'Social Engineering', 'ICS', 'Espionage'];

const severityColor: Record<string, string> = {
  Critical: 'bg-red-500/20 text-red-400 border-red-500/30',
  High: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  Medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
};

const CyberTimeTravel = () => {
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('All');
  const [sortBy, setSortBy] = useState('latest');
  const [selectedAttack, setSelectedAttack] = useState<CyberAttack | null>(null);
  const [revealedAnswers, setRevealedAnswers] = useState<Set<number>>(new Set());

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    let result = cyberAttacks.filter(a => {
      const matchesCat = catFilter === 'All' || a.category.toLowerCase().includes(catFilter.toLowerCase());
      const matchesSearch = !q || a.name.toLowerCase().includes(q) || a.summary.toLowerCase().includes(q) || a.target.toLowerCase().includes(q) || a.attackVector.toLowerCase().includes(q) || String(a.year).includes(q);
      return matchesCat && matchesSearch;
    });

    // Apply sorting
    switch (sortBy) {
      case 'year-asc':
        result.sort((a, b) => a.year - b.year);
        break;
      case 'year-desc':
        result.sort((a, b) => b.year - a.year);
        break;
      case 'name-asc':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'name-desc':
        result.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case 'severity':
        const severityOrder = { Critical: 0, High: 1, Medium: 2 };
        result.sort((a, b) => severityOrder[a.severity as keyof typeof severityOrder] - severityOrder[b.severity as keyof typeof severityOrder]);
        break;
      case 'impact':
        result.sort((a, b) => b.estimatedCost.localeCompare(a.estimatedCost));
        break;
      case 'latest':
      default:
        result.sort((a, b) => b.year - a.year);
    }

    return result;
  }, [search, catFilter, sortBy]);

  const toggleAnswer = (idx: number) => {
    setRevealedAnswers(prev => {
      const next = new Set(prev);
      next.has(idx) ? next.delete(idx) : next.add(idx);
      return next;
    });
  };

  const openAttack = (attack: CyberAttack) => {
    setSelectedAttack(attack);
    setRevealedAnswers(new Set());
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-primary/20">
            <Clock className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-cyber font-bold text-foreground">Cyber Time Travel</h1>
            <p className="text-sm text-muted-foreground">Investigate the top 50 cyber attacks in history</p>
          </div>
        </div>

        {/* Search + Category Filters */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, year, target, attack vector..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 pr-9"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <div className="flex gap-2 flex-wrap items-center justify-between">
            <div className="flex gap-2 flex-wrap">
              {categories.map(cat => (
                <Button key={cat} variant={catFilter === cat ? 'default' : 'outline'} size="sm" onClick={() => setCatFilter(cat)}>
                  {cat}
                </Button>
              ))}
            </div>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[180px]">
                <ArrowUpDown className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Sort by..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="latest">Latest Year</SelectItem>
                <SelectItem value="year-asc">Year (Oldest)</SelectItem>
                <SelectItem value="year-desc">Year (Newest)</SelectItem>
                <SelectItem value="severity">Critical Level</SelectItem>
                <SelectItem value="name-asc">A - Z</SelectItem>
                <SelectItem value="name-desc">Z - A</SelectItem>
                <SelectItem value="impact">Impact (Highest)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Stats */}
        <div className="flex gap-4 text-sm text-muted-foreground">
          <span>{filtered.length} attacks</span>
          <span>•</span>
          <span>{filtered.filter(a => a.severity === 'Critical').length} Critical</span>
          <span>•</span>
          <span>Years {Math.min(...filtered.map(a => a.year))}–{Math.max(...filtered.map(a => a.year))}</span>
        </div>

        {/* Attack Cards */}
        <ScrollArea className="h-[calc(100vh-340px)]">
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3 pr-4">
            {filtered.map(attack => (
              <Card
                key={attack.id}
                className="group cursor-pointer hover:border-primary/50 transition-all"
                onClick={() => openAttack(attack)}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <CardTitle className="text-sm font-bold group-hover:text-primary transition-colors">
                        {attack.name}
                      </CardTitle>
                      <CardDescription className="text-xs mt-0.5">{attack.year} • {attack.target}</CardDescription>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex gap-1.5 flex-wrap">
                    <Badge variant="outline" className={`text-[10px] ${severityColor[attack.severity]}`}>
                      {attack.severity}
                    </Badge>
                    <Badge variant="outline" className="text-[10px]">{attack.category}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2">{attack.impact}</p>
                  <p className="text-[10px] text-muted-foreground/70 truncate">
                    <span className="font-medium">Vector:</span> {attack.attackVector}
                  </p>
                </CardContent>
              </Card>
            ))}
            {filtered.length === 0 && (
              <Card className="md:col-span-3">
                <CardContent className="py-8 text-center text-muted-foreground">No attacks match your search.</CardContent>
              </Card>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Attack Analysis Modal */}
      <Dialog open={!!selectedAttack} onOpenChange={() => setSelectedAttack(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
          {selectedAttack && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/20">
                    <AlertTriangle className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <DialogTitle className="text-lg font-cyber">{selectedAttack.name} ({selectedAttack.year})</DialogTitle>
                    <p className="text-xs text-muted-foreground mt-0.5">{selectedAttack.attribution}</p>
                  </div>
                  <a href={selectedAttack.documentationUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary/80 transition-colors">
                    <ExternalLink className="h-5 w-5" />
                  </a>
                </div>
                <div className="flex gap-2 flex-wrap mt-2">
                  <Badge variant="outline" className={severityColor[selectedAttack.severity]}>{selectedAttack.severity}</Badge>
                  <Badge variant="outline">{selectedAttack.category}</Badge>
                  <Badge variant="outline" className="gap-1"><DollarSign className="h-3 w-3" />{selectedAttack.estimatedCost}</Badge>
                </div>
              </DialogHeader>

              <ScrollArea className="flex-1 pr-4">
                <Tabs defaultValue="overview" className="space-y-4">
                  <TabsList className="grid grid-cols-4 w-full">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="technical">Technical</TabsTrigger>
                    <TabsTrigger value="timeline">Timeline</TabsTrigger>
                    <TabsTrigger value="analyze">Analyze</TabsTrigger>
                  </TabsList>

                  <TabsContent value="overview" className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 rounded-lg bg-muted/20 border border-border/50">
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Attack Vector</p>
                        <p className="text-xs font-medium">{selectedAttack.attackVector}</p>
                      </div>
                      <div className="p-3 rounded-lg bg-muted/20 border border-border/50">
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Target</p>
                        <p className="text-xs font-medium">{selectedAttack.target}</p>
                      </div>
                    </div>
                    <div className="p-3 rounded-lg bg-muted/20 border border-border/50">
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Impact</p>
                      <p className="text-xs">{selectedAttack.impact}</p>
                    </div>
                    <div>
                      <p className="text-xs leading-relaxed text-muted-foreground">{selectedAttack.summary}</p>
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold mb-2 flex items-center gap-1.5"><BookOpen className="h-3.5 w-3.5 text-primary" />Lessons Learned</h4>
                      <ul className="space-y-1.5">
                        {selectedAttack.lessonsLearned.map((l, i) => (
                          <li key={i} className="text-xs text-muted-foreground flex gap-2">
                            <span className="text-primary shrink-0">•</span>{l}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </TabsContent>

                  <TabsContent value="technical" className="space-y-4">
                    <div>
                      <h4 className="text-xs font-semibold mb-2 flex items-center gap-1.5"><Crosshair className="h-3.5 w-3.5 text-primary" />Technical Details</h4>
                      <p className="text-xs leading-relaxed text-muted-foreground">{selectedAttack.technicalDetails}</p>
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold mb-2">Affected Systems</h4>
                      <div className="flex gap-1.5 flex-wrap">
                        {selectedAttack.affectedSystems.map((s, i) => (
                          <Badge key={i} variant="outline" className="text-[10px]">{s}</Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold mb-2">MITRE ATT&CK</h4>
                      <div className="flex gap-1.5 flex-wrap">
                        {selectedAttack.mitreAttackIds.map((m, i) => (
                          <Badge key={i} variant="secondary" className="text-[10px] font-mono">{m}</Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold mb-2">Indicators of Compromise (IOCs)</h4>
                      <ul className="space-y-1">
                        {selectedAttack.iocs.map((ioc, i) => (
                          <li key={i} className="text-xs text-muted-foreground font-mono bg-muted/30 px-2 py-1 rounded">{ioc}</li>
                        ))}
                      </ul>
                    </div>
                  </TabsContent>

                  <TabsContent value="timeline" className="space-y-1">
                    <div className="relative pl-6 border-l-2 border-primary/30 space-y-4">
                      {selectedAttack.timeline.map((t, i) => (
                        <div key={i} className="relative">
                          <div className="absolute -left-[25px] top-1 h-3 w-3 rounded-full bg-primary border-2 border-background" />
                          <p className="text-[10px] text-primary font-semibold">{t.date}</p>
                          <p className="text-xs text-muted-foreground">{t.event}</p>
                        </div>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="analyze" className="space-y-4">
                    <p className="text-xs text-muted-foreground">Test your analysis skills — try to answer before revealing.</p>
                    {selectedAttack.analysisQuestions.map((q, i) => (
                      <div key={i} className="border border-border/50 rounded-lg overflow-hidden">
                        <button
                          className="w-full flex items-center justify-between p-3 text-left hover:bg-muted/20 transition-colors"
                          onClick={() => toggleAnswer(i)}
                        >
                          <div className="flex items-start gap-2">
                            <HelpCircle className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                            <span className="text-xs font-medium">{q.question}</span>
                          </div>
                          {revealedAnswers.has(i) ? <EyeOff className="h-4 w-4 text-muted-foreground shrink-0" /> : <Eye className="h-4 w-4 text-muted-foreground shrink-0" />}
                        </button>
                        {revealedAnswers.has(i) && (
                          <div className="px-3 pb-3 pt-0">
                            <div className="p-2.5 rounded-md bg-primary/5 border border-primary/20">
                              <p className="text-xs text-muted-foreground leading-relaxed">{q.answer}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </TabsContent>
                </Tabs>
              </ScrollArea>
            </>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default CyberTimeTravel;
