import React, { useState, useMemo } from "react";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, Swords, Server, FileSearch, Triangle } from "lucide-react";
import { useLabProgress } from "@/hooks/useLabProgress";
import { useGame } from "@/context/GameContext";

const SKILL_SUBJECTS = [
  "Security Operations",
  "Incident Response",
  "Malware Analysis",
  "Penetration Testing",
  "Exploitation",
  "Red Teaming",
] as const;

// Maps lab_type and mini-lab categories to skill contributions (weights per skill index)
const labTypeSkillMap: Record<string, number[]> = {
  // lab_type values
  sql_level:      [10, 0, 0, 30, 30, 0],
  crypto_puzzle:  [5, 0, 20, 10, 20, 0],
  terminal_flag:  [10, 10, 0, 20, 15, 20],
  story_mission:  [15, 25, 10, 5, 5, 10],
  // mini-lab categories
  "Web Security":       [15, 5, 0, 25, 25, 5],
  "Social Engineering": [10, 15, 5, 5, 5, 10],
  "Access Control":     [15, 10, 0, 15, 20, 10],
  "Server Security":    [10, 10, 10, 20, 20, 15],
  "Authentication":     [15, 5, 0, 20, 25, 5],
};

// Mini-lab IDs mapped to their category for skill attribution
const miniLabCategories: Record<string, string> = {
  "sql-injection-login": "Web Security",
  "phishing-analysis": "Social Engineering",
  "xss-stored": "Web Security",
  "broken-auth": "Access Control",
  "csrf-attack": "Web Security",
  "privilege-escalation": "Access Control",
  "command-injection": "Server Security",
  "insecure-deserialization": "Server Security",
  "ssrf-attack": "Server Security",
  "jwt-vulnerabilities": "Authentication",
  "path-traversal": "Server Security",
};

interface TrackConfig {
  id: string;
  label: string;
  icon: React.ElementType;
  // Weight multipliers per skill index — which skills matter most for this track
  weights: number[];
}

const tracks: TrackConfig[] = [
  {
    id: "foundational",
    label: "Foundational",
    icon: Triangle,
    weights: [1, 1, 1, 1, 1, 1], // even
  },
  {
    id: "security-analyst",
    label: "Security Analyst",
    icon: FileSearch,
    weights: [1.5, 1.5, 1.2, 0.6, 0.4, 0.3],
  },
  {
    id: "penetration-tester",
    label: "Penetration Tester",
    icon: Swords,
    weights: [0.5, 0.4, 0.6, 1.5, 1.5, 1.3],
  },
  {
    id: "security-engineer",
    label: "Security Engineer",
    icon: Server,
    weights: [1.3, 1.1, 0.9, 1, 0.8, 0.7],
  },
];

// Max raw score per skill before capping (tuned so completing ~12-15 labs reaches 100%)
const MAX_RAW = 250;

export const SkillMatrix: React.FC = () => {
  const [activeTrack, setActiveTrack] = useState(tracks[0].id);
  const { completedLabs } = useLabProgress();
  const { sqlLevelsCompleted, cryptoPuzzlesSolved, terminalFlagsFound } = useGame();

  const rawSkills = useMemo(() => {
    const scores = new Array(6).fill(0);

    // Accumulate from lab_progress records (mini_labs + story_missions)
    completedLabs.forEach((lab) => {
      let key = lab.lab_type;

      // For mini_labs, use category-based mapping
      if (lab.lab_type === "mini_lab") {
        const cat = miniLabCategories[lab.lab_id];
        if (cat) key = cat;
        else return;
      }

      const mapping = labTypeSkillMap[key];
      if (!mapping) return;

      mapping.forEach((w, i) => {
        scores[i] += w;
      });
    });

    // Accumulate from GameContext counts (sql, crypto, terminal)
    const gameEntries: [string, number][] = [
      ["sql_level", sqlLevelsCompleted],
      ["crypto_puzzle", cryptoPuzzlesSolved],
      ["terminal_flag", terminalFlagsFound],
    ];

    gameEntries.forEach(([type, count]) => {
      const mapping = labTypeSkillMap[type];
      if (!mapping) return;
      mapping.forEach((w, i) => {
        scores[i] += w * count;
      });
    });

    return scores;
  }, [completedLabs, sqlLevelsCompleted, cryptoPuzzlesSolved, terminalFlagsFound]);

  const track = tracks.find((t) => t.id === activeTrack)!;

  const chartData = useMemo(() => {
    return SKILL_SUBJECTS.map((subject, i) => {
      const weighted = rawSkills[i] * track.weights[i];
      const score = Math.min(100, Math.round((weighted / MAX_RAW) * 100));
      return { subject, score, fullMark: 100 };
    });
  }, [rawSkills, track]);

  const hasAnyProgress = rawSkills.some((s) => s > 0);

  return (
    <Card className="cyber-bg border-primary/30">
      <CardHeader className="pb-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Shield className="h-5 w-5 text-primary" />
            Skill Matrix
          </CardTitle>
          {!hasAnyProgress && (
            <Badge variant="outline" className="text-xs border-muted-foreground/30 text-muted-foreground">
              Complete labs to fill your matrix
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row gap-4">
          {/* Track sidebar */}
          <div className="flex md:flex-col gap-2 md:w-56 overflow-x-auto md:overflow-visible pb-2 md:pb-0">
            {tracks.map((t) => {
              const Icon = t.icon;
              const isActive = t.id === activeTrack;
              return (
                <button
                  key={t.id}
                  onClick={() => setActiveTrack(t.id)}
                  className={`flex items-center gap-2.5 px-4 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap
                    ${
                      isActive
                        ? "bg-primary/20 text-primary border border-primary/50"
                        : "bg-muted/30 text-muted-foreground hover:bg-muted/50 border border-transparent"
                    }`}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {t.label}
                </button>
              );
            })}
          </div>

          {/* Radar chart */}
          <div className="flex-1 min-h-[320px]">
            <ResponsiveContainer width="100%" height={340}>
              <RadarChart
                cx="50%"
                cy="50%"
                outerRadius="70%"
                data={chartData}
              >
                <PolarGrid
                  stroke="hsl(var(--border))"
                  strokeOpacity={0.4}
                />
                <PolarAngleAxis
                  dataKey="subject"
                  tick={({ x, y, payload }) => (
                    <text
                      x={x}
                      y={y}
                      textAnchor="middle"
                      dominantBaseline="central"
                      className="fill-foreground text-[11px] font-medium"
                    >
                      {payload.value}
                    </text>
                  )}
                />
                <PolarRadiusAxis
                  angle={90}
                  domain={[0, 100]}
                  tick={false}
                  axisLine={false}
                />
                <Radar
                  name="Skills"
                  dataKey="score"
                  stroke="hsl(var(--primary))"
                  fill="hsl(var(--primary))"
                  fillOpacity={0.25}
                  strokeWidth={2}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-2 mt-2 justify-center">
          {chartData.map((s) => (
            <Badge
              key={s.subject}
              variant="outline"
              className="text-xs border-primary/30"
            >
              {s.subject}: {s.score}%
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
