import React, { useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, Lock, BookOpen, Brain, Search, Trophy } from 'lucide-react';
import { SherlockModule } from '@/components/sherlock/SherlockModule';
import { SherlockPuzzle } from '@/components/sherlock/SherlockPuzzle';
import { VictorianEscapeRoom } from '@/components/sherlock/VictorianEscapeRoom';
import { useGame } from '@/context/GameContext';

interface Module {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  icon: React.ReactNode;
  content: string[];
  puzzleType: 'deduction' | 'osint' | 'cipher';
  puzzleData: {
    question: string;
    clues: string[];
    answer: string;
    hint: string;
  };
}

const modules: Module[] = [
  {
    id: 1,
    title: "The Art of Observation",
    subtitle: "Chapter I",
    description: "Learn the foundations of deductive reasoning as practiced by the great detective himself.",
    icon: <Search className="h-6 w-6" />,
    content: [
      "\"You see, but you do not observe. The distinction is clear.\" — Sherlock Holmes",
      "In the world of cybersecurity, observation is everything. Just as Holmes could deduce a man's profession from the calluses on his hands, a security analyst must learn to see the subtle signs that reveal a breach.",
      "## The Science of Deduction in OSINT",
      "Open Source Intelligence (OSINT) is the modern detective's toolkit. Every digital footprint tells a story — metadata in images, patterns in social media posts, and connections between accounts all paint a picture of our target.",
      "### Key Observation Techniques:",
      "**1. Metadata Analysis** — Every file carries hidden information. A photograph may reveal GPS coordinates, camera model, and timestamp. Holmes would be delighted.",
      "**2. Social Media Forensics** — Posts, likes, and connections form a web of relationships. The Watson to your Holmes is the search engine.",
      "**3. Domain Research** — WHOIS records, DNS history, and SSL certificates are the fingerprints of the digital world.",
      "### The Holmes Method Applied",
      "When Holmes examined a scene, he followed a systematic approach:",
      "1. **Gather all available data** without prejudice",
      "2. **Eliminate the impossible** — what cannot be true",
      "3. **Whatever remains**, however improbable, must be the truth",
      "In OSINT, we apply the same logic: collect publicly available information, filter out false leads, and connect the remaining data points to form our conclusion."
    ],
    puzzleType: 'deduction',
    puzzleData: {
      question: "A suspicious email was sent from 'john.watson@secure-corp.com'. Using the Holmes method, examine the clues and deduce the sender's true nature.",
      clues: [
        "The email was sent at 3:47 AM local time",
        "The sender claims to work in London, but the email header shows an IP from Eastern Europe",
        "The domain 'secure-corp.com' was registered 2 days ago",
        "The email requests urgent wire transfer for a 'confidential project'",
        "The writing style contains grammatical errors unusual for a native English speaker"
      ],
      answer: "phishing",
      hint: "Apply Holmes' method: What cannot be true given these observations?"
    }
  },
  {
    id: 2,
    title: "Following the Digital Trail",
    subtitle: "Chapter II",
    description: "Master the techniques of tracing digital footprints across the vast network of information.",
    icon: <Brain className="h-6 w-6" />,
    content: [
      "\"Data! Data! Data! I can't make bricks without clay.\" — Sherlock Holmes",
      "In 'A Scandal in Bohemia,' Holmes emphasized the importance of gathering data before forming theories. In OSINT, this principle is paramount.",
      "## Digital Footprint Analysis",
      "Every online action leaves traces. Like footprints in the mud of Victorian London, these digital marks can be followed by the trained investigator.",
      "### The Five Pillars of Digital Investigation:",
      "**1. Username Analysis** — The same handle across platforms creates a trail. Tools like Sherlock (fittingly named) can check hundreds of sites simultaneously.",
      "**2. Email Intelligence** — An email address can reveal associated accounts, breaches, and patterns through services like Have I Been Pwned.",
      "**3. Image Tracking** — Reverse image search is your magnifying glass. Find where images appear, trace their origins, and identify edited versions.",
      "**4. Document Forensics** — PDFs and Office documents contain author metadata, revision history, and sometimes embedded comments.",
      "**5. Network Mapping** — Connections between entities reveal hidden relationships, just as Holmes mapped London's criminal networks.",
      "### The Game of Shadows",
      "Remember: your target may be equally skilled at covering their tracks. Look for:",
      "- Inconsistencies in cover stories",
      "- Time zone discrepancies",
      "- Language patterns that don't match claimed origins",
      "- Technical mistakes that reveal true capabilities"
    ],
    puzzleType: 'osint',
    puzzleData: {
      question: "You're investigating a threat actor. Analyze the OSINT data and identify their likely location.",
      clues: [
        "Username 'CryptoPhantom2024' appears on a Russian hacking forum",
        "GitHub activity shows commits primarily between 9 AM - 6 PM UTC+3",
        "A leaked database shows an account with a @yandex.ru email",
        "Forum posts mention 'our local time is ahead of London'",
        "The avatar image was traced to a Moscow photography club"
      ],
      answer: "moscow",
      hint: "Consider the time zone clues and geographic indicators together."
    }
  },
  {
    id: 3,
    title: "The Final Deduction",
    subtitle: "Chapter III",
    description: "Combine all your skills to unravel the most complex intelligence puzzles.",
    icon: <Trophy className="h-6 w-6" />,
    content: [
      "\"The game is afoot!\" — Sherlock Holmes",
      "In this final chapter, we bring together observation, analysis, and deduction into a unified methodology for intelligence gathering.",
      "## The Complete OSINT Framework",
      "Like Holmes solving his most intricate cases, a complete investigation requires a structured approach.",
      "### Phase 1: Planning & Direction",
      "Define your objectives clearly. What questions must be answered? What would constitute success? Holmes never began a case without understanding what he sought.",
      "### Phase 2: Collection",
      "Gather data from all available sources:",
      "- Social media platforms",
      "- Public records and databases",
      "- Technical infrastructure (domains, IPs, certificates)",
      "- News archives and publications",
      "- Images and documents",
      "### Phase 3: Processing",
      "Organize your findings. Create timelines, relationship maps, and evidence chains. Holmes kept detailed notes and often visualized connections.",
      "### Phase 4: Analysis",
      "Apply deductive reasoning:",
      "- What patterns emerge?",
      "- What contradictions exist?",
      "- What is the most likely explanation that fits ALL evidence?",
      "### Phase 5: Dissemination",
      "Present your findings clearly. A detective's deduction is worthless if others cannot understand the reasoning.",
      "## The Final Word",
      "\"When you have eliminated the impossible, whatever remains, however improbable, must be the truth.\"",
      "Congratulations, detective. You have completed your training in the Holmesian method of OSINT. Now, put your skills to the ultimate test in the Victorian Escape Room!"
    ],
    puzzleType: 'cipher',
    puzzleData: {
      question: "Decode Moriarty's encrypted message to reveal his next target. The cipher is a simple substitution where each letter shifts by 3 positions (Caesar cipher).",
      clues: [
        "Encrypted message: EDQN RI HQJODQG",
        "The cipher uses the standard English alphabet",
        "Each letter is shifted by the same amount",
        "Spaces and formatting are preserved",
        "Think: if D becomes A, what does E become?"
      ],
      answer: "bank of england",
      hint: "In a Caesar cipher with shift 3, D→A, E→B, F→C..."
    }
  }
];

const SherlockCourse = () => {
  const [currentModule, setCurrentModule] = useState<number | null>(null);
  const [showPuzzle, setShowPuzzle] = useState(false);
  const [showEscapeRoom, setShowEscapeRoom] = useState(false);
  const [completedModules, setCompletedModules] = useState<number[]>(() => {
    const saved = localStorage.getItem('sherlock-completed');
    return saved ? JSON.parse(saved) : [];
  });
  const [completedPuzzles, setCompletedPuzzles] = useState<number[]>(() => {
    const saved = localStorage.getItem('sherlock-puzzles');
    return saved ? JSON.parse(saved) : [];
  });
  const { addPoints, completeChallenge } = useGame();

  const progress = (completedModules.length / modules.length) * 100;
  const allCompleted = completedModules.length === modules.length && completedPuzzles.length === modules.length;

  const handleModuleComplete = (moduleId: number) => {
    if (!completedModules.includes(moduleId)) {
      const updated = [...completedModules, moduleId];
      setCompletedModules(updated);
      localStorage.setItem('sherlock-completed', JSON.stringify(updated));
    }
    setShowPuzzle(true);
  };

  const handlePuzzleComplete = (moduleId: number) => {
    if (!completedPuzzles.includes(moduleId)) {
      const updated = [...completedPuzzles, moduleId];
      setCompletedPuzzles(updated);
      localStorage.setItem('sherlock-puzzles', JSON.stringify(updated));
      addPoints(200);
      completeChallenge(`sherlock-module-${moduleId}`);
    }
    setShowPuzzle(false);
    setCurrentModule(null);
  };

  const isModuleUnlocked = (moduleId: number) => {
    if (moduleId === 1) return true;
    return completedPuzzles.includes(moduleId - 1);
  };

  if (showEscapeRoom) {
    return (
      <DashboardLayout>
        <VictorianEscapeRoom onExit={() => setShowEscapeRoom(false)} />
      </DashboardLayout>
    );
  }

  if (currentModule !== null) {
    const module = modules.find(m => m.id === currentModule)!;
    
    if (showPuzzle) {
      return (
        <DashboardLayout>
          <SherlockPuzzle
            moduleId={module.id}
            puzzleData={module.puzzleData}
            onComplete={() => handlePuzzleComplete(module.id)}
            onBack={() => setShowPuzzle(false)}
          />
        </DashboardLayout>
      );
    }

    return (
      <DashboardLayout>
        <SherlockModule
          module={module}
          onComplete={() => handleModuleComplete(module.id)}
          onBack={() => setCurrentModule(null)}
          isCompleted={completedModules.includes(module.id)}
        />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-background p-4 md:p-6">
        <div className="container mx-auto max-w-5xl">
          {/* Header */}
          <div className="text-center mb-8">
            <Badge variant="outline" className="mb-4 bg-amber-500/20 text-amber-400 border-amber-500/50">
              <BookOpen className="h-3 w-3 mr-1" />
              Interactive Course
            </Badge>
            <h1 className="text-3xl md:text-4xl font-cyber font-bold cyber-glow mb-2">
              The Sherlock Method
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Master the art of deduction and OSINT through the lens of the world's greatest detective
            </p>
          </div>

          {/* Progress */}
          <Card className="cyber-bg border-primary/30 mb-8">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Course Progress</span>
                <span className="text-sm text-muted-foreground">
                  {completedModules.length}/{modules.length} Modules
                </span>
              </div>
              <Progress value={progress} className="h-2" />
            </CardContent>
          </Card>

          {/* Modules Grid */}
          <div className="grid gap-4 md:gap-6 mb-8">
            {modules.map((module) => {
              const unlocked = isModuleUnlocked(module.id);
              const completed = completedModules.includes(module.id);
              const puzzleDone = completedPuzzles.includes(module.id);

              return (
                <Card
                  key={module.id}
                  className={`cyber-bg border-primary/30 transition-all duration-300 ${
                    unlocked ? 'hover:border-primary/60 cursor-pointer' : 'opacity-60'
                  } ${completed && puzzleDone ? 'border-green-500/50' : ''}`}
                  onClick={() => unlocked && setCurrentModule(module.id)}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-3 rounded-lg ${
                          completed && puzzleDone 
                            ? 'bg-green-500/20 text-green-400' 
                            : 'bg-primary/20 text-primary'
                        }`}>
                          {completed && puzzleDone ? <CheckCircle className="h-6 w-6" /> : module.icon}
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground uppercase tracking-wider">
                            {module.subtitle}
                          </p>
                          <CardTitle className="text-lg">{module.title}</CardTitle>
                        </div>
                      </div>
                      {!unlocked && <Lock className="h-5 w-5 text-muted-foreground" />}
                      {completed && puzzleDone && (
                        <Badge variant="outline" className="bg-green-500/20 text-green-400 border-green-500/50">
                          +200 XP
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground text-sm">{module.description}</p>
                    <div className="flex gap-2 mt-3">
                      <Badge variant="secondary" className="text-xs">
                        {completed ? '✓ Read' : 'Lesson'}
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        {puzzleDone ? '✓ Solved' : 'Puzzle'}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Final Challenge */}
          <Card className={`cyber-bg transition-all duration-300 ${
            allCompleted 
              ? 'border-amber-500/50 hover:border-amber-500/80 cursor-pointer' 
              : 'border-muted/30 opacity-60'
          }`}>
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="p-4 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20">
                  <Trophy className="h-12 w-12 text-amber-400" />
                </div>
                <div className="flex-1 text-center md:text-left">
                  <h3 className="text-xl font-bold mb-1">The Victorian Escape Room</h3>
                  <p className="text-muted-foreground mb-3">
                    Complete all modules to unlock the final 3D challenge. Escape Moriarty's trap using everything you've learned!
                  </p>
                  {allCompleted ? (
                    <Button 
                      onClick={() => setShowEscapeRoom(true)}
                      className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
                    >
                      Enter the Escape Room
                    </Button>
                  ) : (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Lock className="h-4 w-4" />
                      <span className="text-sm">Complete all modules to unlock</span>
                    </div>
                  )}
                </div>
                <Badge variant="outline" className="bg-amber-500/20 text-amber-400 border-amber-500/50">
                  +500 XP
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default SherlockCourse;
