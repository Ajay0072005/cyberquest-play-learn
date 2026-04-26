import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  BookOpen,
  Beaker,
  Trophy,
  CheckCircle2,
  Circle,
  ChevronRight,
  Sparkles,
  Award,
  Lightbulb,
  Lock,
  RotateCcw,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { careerRoles, getCareerRoleBySlug, RoleCourse, RoleLab, RoleStage, CareerRole } from "@/data/careerRolesData";
import { useLabProgress } from "@/hooks/useLabProgress";
import { useGame } from "@/context/GameContext";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const COURSE_PROGRESS_KEY = "career-roles-course-progress";

type CourseProgressMap = Record<string, boolean>; // key: `${roleSlug}:${courseId}` -> done

const loadCourseProgress = (): CourseProgressMap => {
  try {
    return JSON.parse(localStorage.getItem(COURSE_PROGRESS_KEY) || "{}");
  } catch {
    return {};
  }
};

const saveCourseProgress = (map: CourseProgressMap) => {
  localStorage.setItem(COURSE_PROGRESS_KEY, JSON.stringify(map));
};

const difficultyClass = (d: string) => {
  switch (d) {
    case "Beginner":
      return "bg-green-500/15 text-green-400 border-green-500/30";
    case "Intermediate":
      return "bg-blue-500/15 text-blue-400 border-blue-500/30";
    case "Advanced":
      return "bg-orange-500/15 text-orange-400 border-orange-500/30";
    case "Expert":
      return "bg-red-500/15 text-red-400 border-red-500/30";
    default:
      return "bg-muted text-muted-foreground";
  }
};

const stageOrderClass = (level: string) => {
  switch (level) {
    case "Beginner":
      return "from-emerald-500 to-emerald-400";
    case "Intermediate":
      return "from-blue-500 to-blue-400";
    case "Advanced":
      return "from-orange-500 to-orange-400";
    default:
      return "from-primary to-primary/70";
  }
};

const CareerRoles: React.FC = () => {
  const [selectedSlug, setSelectedSlug] = useState<string | null>(() => {
    return localStorage.getItem("career-roles-selected") || null;
  });
  const [courseProgress, setCourseProgress] = useState<CourseProgressMap>(loadCourseProgress);

  const { isLabCompleted, resetLabProgress } = useLabProgress();
  const { sqlLevelsCompleted, cryptoPuzzlesSolved, terminalFlagsFound } = useGame();
  const { toast } = useToast();
  const [resetting, setResetting] = useState(false);

  // Sherlock completion is stored locally
  const sherlockCompleted = useMemo(() => {
    try {
      const progress = JSON.parse(localStorage.getItem("sherlock-progress") || "{}");
      const modules = Object.values(progress).filter(Boolean).length;
      const escape = localStorage.getItem("sherlock-escape-completed") === "true";
      return modules >= 1 || escape;
    } catch {
      return false;
    }
  }, [selectedSlug]);

  useEffect(() => {
    if (selectedSlug) {
      localStorage.setItem("career-roles-selected", selectedSlug);
    }
  }, [selectedSlug]);

  const isLabDone = (lab: RoleLab): boolean => {
    if (lab.kind === "minilab") return isLabCompleted(lab.id, "minilab");
    // page labs
    switch (lab.id) {
      case "terminal-basics":
        return terminalFlagsFound > 0;
      case "sql-game":
        return sqlLevelsCompleted > 0;
      case "crypto":
        return cryptoPuzzlesSolved > 0;
      case "sherlock":
        return sherlockCompleted;
      default:
        return false;
    }
  };

  const isCourseDone = (roleSlug: string, course: RoleCourse) =>
    !!courseProgress[`${roleSlug}:${course.id}`];

  const toggleCourse = (roleSlug: string, course: RoleCourse) => {
    const key = `${roleSlug}:${course.id}`;
    const next = { ...courseProgress, [key]: !courseProgress[key] };
    setCourseProgress(next);
    saveCourseProgress(next);
  };

  const resetRoleProgress = async (role: CareerRole) => {
    setResetting(true);
    try {
      // 1. Clear course progress for this role
      const next = { ...courseProgress };
      role.stages.forEach((s) => {
        s.courses.forEach((c) => {
          delete next[`${role.slug}:${c.id}`];
        });
      });
      setCourseProgress(next);
      saveCourseProgress(next);

      // 2. Reset minilab completions tied to this role (DB-backed)
      const minilabs = role.stages.flatMap((s) =>
        s.labs.filter((l): l is RoleLab & { kind: "minilab" } => l.kind === "minilab")
      );
      for (const lab of minilabs) {
        if (isLabCompleted(lab.id, "minilab")) {
          await resetLabProgress(lab.id, "minilab");
        }
      }

      // 3. Clear local sherlock keys if sherlock lab is part of this role
      const hasSherlock = role.stages.some((s) => s.labs.some((l) => l.id === "sherlock"));
      if (hasSherlock) {
        localStorage.removeItem("sherlock-progress");
        localStorage.removeItem("sherlock-escape-completed");
      }

      toast({
        title: "Path Progress Reset",
        description: `${role.title} progress has been cleared. Note: shared game stats (SQL, Crypto, Terminal) are kept.`,
      });
    } catch (e) {
      console.error(e);
      toast({
        title: "Error",
        description: "Failed to reset some items.",
        variant: "destructive",
      });
    } finally {
      setResetting(false);
    }
  };

  const computeRoleStats = (role: CareerRole) => {
    let totalCourses = 0;
    let doneCourses = 0;
    let totalLabs = 0;
    let doneLabs = 0;
    role.stages.forEach((s) => {
      totalCourses += s.courses.length;
      doneCourses += s.courses.filter((c) => isCourseDone(role.slug, c)).length;
      totalLabs += s.labs.length;
      doneLabs += s.labs.filter(isLabDone).length;
    });
    const total = totalCourses + totalLabs;
    const done = doneCourses + doneLabs;
    const pct = total === 0 ? 0 : Math.round((done / total) * 100);
    return { totalCourses, doneCourses, totalLabs, doneLabs, pct, total, done };
  };

  // ROLE SELECTION GRID
  if (!selectedSlug) {
    return (
      <DashboardLayout>
        <div className="space-y-8">
          <div>
            <h1 className="text-3xl font-cyber font-bold cyber-glow mb-2">Career Paths</h1>
            <p className="text-muted-foreground max-w-3xl">
              Pick a cybersecurity role and follow a structured roadmap of existing courses, hands-on labs and mini projects — organized from Beginner to Advanced. Your progress is tracked automatically.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {careerRoles.map((role) => {
              const stats = computeRoleStats(role);
              const Icon = role.icon;
              return (
                <Card
                  key={role.slug}
                  className="cyber-bg border-primary/20 hover:border-primary/40 transition-all cursor-pointer group"
                  onClick={() => setSelectedSlug(role.slug)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                      <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${role.color} flex items-center justify-center shadow-lg`}>
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-lg group-hover:text-primary transition-colors">
                          {role.title}
                        </CardTitle>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground line-clamp-2">{role.description}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {role.skills.slice(0, 3).map((s) => (
                        <Badge key={s} variant="secondary" className="text-xs">{s}</Badge>
                      ))}
                    </div>
                    <div>
                      <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
                        <span>Path Progress</span>
                        <span className="text-primary font-medium">{stats.pct}%</span>
                      </div>
                      <Progress value={stats.pct} className="h-2" />
                      <div className="flex justify-between text-xs text-muted-foreground mt-2">
                        <span>{stats.doneCourses}/{stats.totalCourses} courses</span>
                        <span>{stats.doneLabs}/{stats.totalLabs} labs</span>
                      </div>
                    </div>
                    <Button className="w-full group-hover:bg-primary/90">
                      View Roadmap
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const role = getCareerRoleBySlug(selectedSlug);
  if (!role) {
    return (
      <DashboardLayout>
        <div className="text-center py-20">
          <p className="text-muted-foreground mb-4">Role not found.</p>
          <Button onClick={() => setSelectedSlug(null)}>Back to roles</Button>
        </div>
      </DashboardLayout>
    );
  }

  const stats = computeRoleStats(role);
  const Icon = role.icon;
  const earnedBadge = stats.pct === 100;

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <Button variant="ghost" size="sm" onClick={() => setSelectedSlug(null)} className="-ml-2">
          <ArrowLeft className="h-4 w-4 mr-1" />
          All career paths
        </Button>

        {/* Hero */}
        <Card className="cyber-bg border-primary/20 overflow-hidden">
          <CardContent className="p-6 md:p-8">
            <div className="flex flex-col md:flex-row gap-6 items-start">
              <div className={`h-20 w-20 rounded-2xl bg-gradient-to-br ${role.color} flex items-center justify-center shrink-0 shadow-lg`}>
                <Icon className="h-10 w-10 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl md:text-3xl font-cyber font-bold mb-2">{role.title}</h1>
                <p className="text-muted-foreground mb-4">{role.description}</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {role.skills.map((s) => (
                    <Badge key={s} variant="secondary">{s}</Badge>
                  ))}
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Overall Progress</span>
                  <span className="text-sm font-medium text-primary">{stats.pct}%</span>
                </div>
                <Progress value={stats.pct} className="h-2" />
                <div className="flex flex-wrap gap-4 text-xs text-muted-foreground mt-3">
                  <span><BookOpen className="h-3 w-3 inline mr-1" />{stats.doneCourses}/{stats.totalCourses} courses</span>
                  <span><Beaker className="h-3 w-3 inline mr-1" />{stats.doneLabs}/{stats.totalLabs} labs</span>
                  <span><Trophy className="h-3 w-3 inline mr-1 text-yellow-400" />{stats.done}/{stats.total} milestones</span>
                </div>
              </div>
              <div className={cn(
                "shrink-0 flex flex-col items-center gap-2 p-4 rounded-xl border",
                earnedBadge ? "border-yellow-500/40 bg-yellow-500/5" : "border-border bg-muted/20"
              )}>
                <div className={cn(
                  "h-14 w-14 rounded-full flex items-center justify-center",
                  earnedBadge ? "bg-gradient-to-br from-yellow-400 to-amber-500 text-white" : "bg-muted text-muted-foreground"
                )}>
                  {earnedBadge ? <Award className="h-7 w-7" /> : <Lock className="h-6 w-6" />}
                </div>
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">Skill Badge</p>
                  <p className="text-sm font-cyber font-bold">{role.badge}</p>
                  <p className="text-[10px] text-muted-foreground mt-1">
                    {earnedBadge ? "Earned!" : "Complete the path to unlock"}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stages */}
        <Tabs defaultValue={role.stages[0]?.level} className="space-y-6">
          <TabsList className="grid grid-cols-3 w-full max-w-md">
            {role.stages.map((s) => (
              <TabsTrigger key={s.level} value={s.level}>{s.level}</TabsTrigger>
            ))}
          </TabsList>

          {role.stages.map((stage, stageIdx) => (
            <TabsContent key={stage.level} value={stage.level} className="space-y-6">
              {/* Stage header */}
              <Card className="cyber-bg border-primary/20">
                <CardContent className="p-5 flex items-center gap-4">
                  <div className={`h-10 w-10 rounded-lg bg-gradient-to-br ${stageOrderClass(stage.level)} flex items-center justify-center shrink-0`}>
                    <span className="text-white font-bold">{stageIdx + 1}</span>
                  </div>
                  <div>
                    <h3 className="font-cyber font-bold text-lg">{stage.level} Stage</h3>
                    <p className="text-sm text-muted-foreground">{stage.summary}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Courses */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <BookOpen className="h-5 w-5 text-primary" />
                  <h4 className="font-cyber font-bold">Courses</h4>
                  <Badge variant="outline" className="ml-auto">
                    {stage.courses.filter(c => isCourseDone(role.slug, c)).length}/{stage.courses.length}
                  </Badge>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {stage.courses.map((course) => {
                    const done = isCourseDone(role.slug, course);
                    return (
                      <Card key={course.id} className={cn(
                        "cyber-bg transition-all",
                        done ? "border-green-500/40" : "border-primary/20 hover:border-primary/40"
                      )}>
                        <CardContent className="p-4 flex items-start gap-3">
                          <button
                            onClick={() => toggleCourse(role.slug, course)}
                            className="mt-0.5 shrink-0"
                            aria-label={done ? "Mark course incomplete" : "Mark course complete"}
                          >
                            {done ? (
                              <CheckCircle2 className="h-5 w-5 text-green-400" />
                            ) : (
                              <Circle className="h-5 w-5 text-muted-foreground hover:text-primary" />
                            )}
                          </button>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                              <Badge className={difficultyClass(course.difficulty)}>{course.difficulty}</Badge>
                            </div>
                            <p className={cn("font-medium", done && "line-through text-muted-foreground")}>
                              {course.title}
                            </p>
                            {course.pathSlug && (
                              <Link
                                to={`/path/${course.pathSlug}`}
                                className="text-xs text-primary hover:underline inline-flex items-center gap-1 mt-1"
                              >
                                Open course <ChevronRight className="h-3 w-3" />
                              </Link>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>

              {/* Labs */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Beaker className="h-5 w-5 text-primary" />
                  <h4 className="font-cyber font-bold">Hands-On Labs</h4>
                  <Badge variant="outline" className="ml-auto">
                    {stage.labs.filter(isLabDone).length}/{stage.labs.length}
                  </Badge>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {stage.labs.map((lab) => {
                    const done = isLabDone(lab);
                    const link = lab.kind === "page" ? lab.link : "/labs";
                    return (
                      <Card key={lab.id} className={cn(
                        "cyber-bg transition-all",
                        done ? "border-green-500/40" : "border-primary/20 hover:border-primary/40"
                      )}>
                        <CardContent className="p-4 flex items-start gap-3">
                          <div className="mt-0.5 shrink-0">
                            {done ? (
                              <CheckCircle2 className="h-5 w-5 text-green-400" />
                            ) : (
                              <Circle className="h-5 w-5 text-muted-foreground" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={cn("font-medium", done && "line-through text-muted-foreground")}>
                              {lab.title}
                            </p>
                            <p className="text-xs text-muted-foreground capitalize mt-0.5">
                              {lab.kind === "page" ? "Standalone challenge" : "Mini lab"}
                            </p>
                            {link && (
                              <Link
                                to={link}
                                className="text-xs text-primary hover:underline inline-flex items-center gap-1 mt-1"
                              >
                                {done ? "Replay" : "Start lab"} <ChevronRight className="h-3 w-3" />
                              </Link>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>

              {/* Mini projects */}
              {stage.miniProjects && stage.miniProjects.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Lightbulb className="h-5 w-5 text-primary" />
                    <h4 className="font-cyber font-bold">Mini Projects</h4>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {stage.miniProjects.map((p) => (
                      <Card key={p.title} className="cyber-bg border-primary/20">
                        <CardContent className="p-4 flex items-start gap-3">
                          <Sparkles className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                          <div>
                            <p className="font-medium">{p.title}</p>
                            <p className="text-sm text-muted-foreground mt-1">{p.description}</p>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default CareerRoles;
