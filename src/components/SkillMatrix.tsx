import React, { useState } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Shield, Swords, Server, FileSearch, Triangle } from "lucide-react";

interface SkillCategory {
  subject: string;
  score: number;
  fullMark: number;
}

interface Track {
  id: string;
  label: string;
  icon: React.ElementType;
  skills: SkillCategory[];
}

const levels = ["Entry level", "Intermediate", "Advanced"] as const;

const buildSkills = (scores: number[]): SkillCategory[] => {
  const subjects = [
    "Security Operations",
    "Incident Response",
    "Malware Analysis",
    "Penetration Testing",
    "Exploitation",
    "Red Teaming",
  ];
  return subjects.map((subject, i) => ({
    subject,
    score: scores[i],
    fullMark: 100,
  }));
};

const tracks: Track[] = [
  {
    id: "foundational",
    label: "Foundational",
    icon: Triangle,
    skills: buildSkills([70, 45, 35, 50, 30, 20]),
  },
  {
    id: "security-analyst",
    label: "Security Analyst",
    icon: FileSearch,
    skills: buildSkills([90, 80, 60, 40, 25, 20]),
  },
  {
    id: "penetration-tester",
    label: "Penetration Tester",
    icon: Swords,
    skills: buildSkills([40, 35, 45, 90, 85, 70]),
  },
  {
    id: "security-engineer",
    label: "Security Engineer",
    icon: Server,
    skills: buildSkills([75, 65, 50, 55, 45, 40]),
  },
];

const levelMultipliers: Record<string, number> = {
  "Entry level": 0.5,
  Intermediate: 0.75,
  Advanced: 1,
};

export const SkillMatrix: React.FC = () => {
  const [activeTrack, setActiveTrack] = useState(tracks[0].id);
  const [selectedLevel, setSelectedLevel] = useState<string>("Entry level");

  const track = tracks.find((t) => t.id === activeTrack)!;
  const multiplier = levelMultipliers[selectedLevel];

  const scaledSkills = track.skills.map((s) => ({
    ...s,
    score: Math.round(s.score * multiplier),
  }));

  return (
    <Card className="cyber-bg border-primary/30">
      <CardHeader className="pb-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Shield className="h-5 w-5 text-primary" />
            Skill Matrix
          </CardTitle>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground hidden sm:inline">
              Select level
            </span>
            <Select value={selectedLevel} onValueChange={setSelectedLevel}>
              <SelectTrigger className="w-[150px] h-8 text-sm border-primary/30">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {levels.map((l) => (
                  <SelectItem key={l} value={l}>
                    {l}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
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
                data={scaledSkills}
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
          {scaledSkills.map((s) => (
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
