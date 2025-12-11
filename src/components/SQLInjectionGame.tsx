import React, { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Terminal, CheckCircle, XCircle, Lightbulb, Target } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useGame } from "@/context/GameContext";

interface GameLevel {
  id: number;
  title: string;
  description: string;
  database: { [key: string]: any[] };
  vulnerableQuery: string;
  objective: string;
  hints: string[];
  solution: string[];
  expectedResult: string;
}

const gameLevels: GameLevel[] = [
  {
    id: 1,
    title: "Basic Authentication Bypass",
    description: "A simple login form that checks credentials against a database",
    database: {
      users: [
        { id: 1, username: "admin", password: "secret123", role: "administrator" },
        { id: 2, username: "user", password: "password", role: "user" },
        { id: 3, username: "guest", password: "guest", role: "guest" }
      ]
    },
    vulnerableQuery: "SELECT * FROM users WHERE username = '{input}' AND password = '{password}'",
    objective: "Bypass the login without knowing valid credentials",
    hints: [
      "What happens if you make the password check always return true?",
      "Try using SQL comments to ignore the password check",
      "The characters -- create a comment in SQL"
    ],
    solution: ["admin'--", "' OR '1'='1'--"],
    expectedResult: "Successfully logged in as admin"
  },
  {
    id: 2,
    title: "Data Extraction",
    description: "Extract sensitive information from a user profile lookup",
    database: {
      users: [
        { id: 1, username: "admin", email: "admin@company.com", ssn: "123-45-6789" },
        { id: 2, username: "john", email: "john@company.com", ssn: "987-65-4321" },
        { id: 3, username: "jane", email: "jane@company.com", ssn: "555-12-3456" }
      ]
    },
    vulnerableQuery: "SELECT username, email FROM users WHERE username = '{input}'",
    objective: "Extract all usernames and SSN numbers from the database",
    hints: [
      "You can use UNION to combine results from different queries",
      "Try: ' UNION SELECT username, ssn FROM users--",
      "The UNION operator combines rows from multiple SELECT statements"
    ],
    solution: ["' UNION SELECT username, ssn FROM users--"],
    expectedResult: "Extracted all SSN numbers"
  },
  {
    id: 3,
    title: "Table Discovery",
    description: "Discover hidden tables in the database schema",
    database: {
      users: [{ id: 1, username: "test", email: "test@test.com" }],
      secrets: [{ id: 1, secret_key: "FLAG{sql_injection_master}", value: "top_secret_data" }]
    },
    vulnerableQuery: "SELECT * FROM users WHERE id = {input}",
    objective: "Find and access the 'secrets' table to get the flag",
    hints: [
      "Use UNION to query other tables",
      "Try: 1 UNION SELECT * FROM secrets",
      "You need to match the column count in your UNION"
    ],
    solution: ["1 UNION SELECT id, secret_key FROM secrets"],
    expectedResult: "FLAG{sql_injection_master}"
  }
];

export const SQLInjectionGame: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [currentLevel, setCurrentLevel] = useState(0);
  const [userInput, setUserInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [queryHistory, setQueryHistory] = useState<string[]>([]);
  const [showHints, setShowHints] = useState(false);
  const [completedLevels, setCompletedLevels] = useState<number[]>([]);
  const [currentHint, setCurrentHint] = useState(0);
  const terminalRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { incrementSqlLevels } = useGame();

  const level = gameLevels[currentLevel];

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [queryHistory]);

  const executeQuery = () => {
    if (!userInput.trim() && !passwordInput.trim()) return;

    const input = userInput || passwordInput;
    let query = level.vulnerableQuery.replace(/{input}/g, input);
    if (level.vulnerableQuery.includes('{password}')) {
      query = query.replace(/{password}/g, passwordInput);
    }

    setQueryHistory(prev => [...prev, `> ${query}`, ""]);

    // Simulate SQL execution
    setTimeout(() => {
      const isSuccess = level.solution.some(solution => 
        input.toLowerCase().includes(solution.toLowerCase()) ||
        solution.toLowerCase().includes(input.toLowerCase())
      );

      let result = "";
      if (isSuccess) {
        result = `✅ ${level.expectedResult}`;
        if (!completedLevels.includes(level.id)) {
          setCompletedLevels(prev => [...prev, level.id]);
          incrementSqlLevels();
          toast({
            title: "Challenge Completed!",
            description: `Level ${level.id}: ${level.title}`,
          });
        }
      } else {
        result = "❌ Access denied or query failed";
      }

      setQueryHistory(prev => [...prev, result, ""]);
    }, 500);

    setUserInput("");
    setPasswordInput("");
  };

  const nextLevel = () => {
    if (currentLevel < gameLevels.length - 1) {
      setCurrentLevel(prev => prev + 1);
      setQueryHistory([]);
      setShowHints(false);
      setCurrentHint(0);
    }
  };

  const prevLevel = () => {
    if (currentLevel > 0) {
      setCurrentLevel(prev => prev - 1);
      setQueryHistory([]);
      setShowHints(false);
      setCurrentHint(0);
    }
  };

  const showNextHint = () => {
    if (currentHint < level.hints.length - 1) {
      setCurrentHint(prev => prev + 1);
    }
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" onClick={onBack} className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Challenges
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-cyber font-bold cyber-glow">
              SQL Injection Training Lab
            </h1>
            <p className="text-muted-foreground">Interactive cybersecurity challenge</p>
          </div>
          <Badge variant="outline" className="font-cyber">
            Level {currentLevel + 1} / {gameLevels.length}
          </Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Challenge Info */}
          <Card className="cyber-bg border-primary/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                {level.title}
                {completedLevels.includes(level.id) && (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Scenario:</h4>
                <p className="text-muted-foreground">{level.description}</p>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Objective:</h4>
                <p className="text-primary">{level.objective}</p>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Vulnerable Query:</h4>
                <code className="bg-muted p-2 rounded text-sm block terminal-text">
                  {level.vulnerableQuery}
                </code>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Database Schema:</h4>
                <div className="bg-muted p-3 rounded text-sm">
                  {Object.entries(level.database).map(([table, data]) => (
                    <div key={table} className="mb-2">
                      <strong className="terminal-text">{table}:</strong>
                      <div className="ml-4 text-muted-foreground">
                        {data.length > 0 && Object.keys(data[0]).join(", ")}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Hints */}
              <div>
                <Button
                  variant="outline"
                  onClick={() => setShowHints(!showHints)}
                  className="w-full flex items-center gap-2"
                >
                  <Lightbulb className="h-4 w-4" />
                  {showHints ? "Hide Hints" : "Show Hints"}
                </Button>

                {showHints && (
                  <div className="mt-4 space-y-2">
                    {level.hints.slice(0, currentHint + 1).map((hint, index) => (
                      <div key={index} className="bg-accent/20 p-3 rounded border-l-4 border-accent">
                        <p className="text-sm">{hint}</p>
                      </div>
                    ))}
                    {currentHint < level.hints.length - 1 && (
                      <Button variant="ghost" size="sm" onClick={showNextHint}>
                        Next Hint
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Terminal */}
          <Card className="cyber-bg border-primary/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Terminal className="h-5 w-5 text-primary cyber-glow" />
                SQL Injection Terminal
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Terminal Output */}
              <div
                ref={terminalRef}
                className="bg-black p-4 rounded-lg h-64 overflow-y-auto font-mono text-sm text-green-400"
              >
                <div className="text-green-300 mb-2">
                  === SQL Injection Lab Terminal ===
                </div>
                <div className="text-green-300 mb-4">
                  Objective: {level.objective}
                </div>
                {queryHistory.map((line, index) => (
                  <div key={index} className="mb-1">
                    {line.startsWith('>') ? (
                      <span className="text-yellow-300">{line}</span>
                    ) : line.startsWith('✅') ? (
                      <span className="text-green-400">{line}</span>
                    ) : line.startsWith('❌') ? (
                      <span className="text-red-400">{line}</span>
                    ) : (
                      <span>{line}</span>
                    )}
                  </div>
                ))}
              </div>

              {/* Input Forms */}
              <div className="space-y-3">
                {level.vulnerableQuery.includes('{password}') ? (
                  <>
                    <div>
                      <label className="text-sm font-medium mb-1 block">Username:</label>
                      <Input
                        value={userInput}
                        onChange={(e) => setUserInput(e.target.value)}
                        placeholder="Enter username..."
                        className="bg-muted/50 terminal-text"
                        onKeyDown={(e) => e.key === 'Enter' && executeQuery()}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block">Password:</label>
                      <Input
                        value={passwordInput}
                        onChange={(e) => setPasswordInput(e.target.value)}
                        placeholder="Enter password..."
                        className="bg-muted/50 terminal-text"
                        onKeyDown={(e) => e.key === 'Enter' && executeQuery()}
                      />
                    </div>
                  </>
                ) : (
                  <div>
                    <label className="text-sm font-medium mb-1 block">SQL Input:</label>
                    <Input
                      value={userInput}
                      onChange={(e) => setUserInput(e.target.value)}
                      placeholder="Enter your SQL injection payload..."
                      className="bg-muted/50 terminal-text"
                      onKeyDown={(e) => e.key === 'Enter' && executeQuery()}
                    />
                  </div>
                )}

                <Button
                  onClick={executeQuery}
                  className="w-full bg-gradient-to-r from-primary to-secondary hover:shadow-cyber"
                >
                  Execute Query
                </Button>
              </div>

              {/* Navigation */}
              <div className="flex justify-between pt-4 border-t border-border/50">
                <Button
                  variant="outline"
                  onClick={prevLevel}
                  disabled={currentLevel === 0}
                >
                  Previous Level
                </Button>
                <Button
                  variant="cyber"
                  onClick={nextLevel}
                  disabled={currentLevel === gameLevels.length - 1 || !completedLevels.includes(level.id)}
                >
                  Next Level
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Progress */}
        <Card className="mt-6 cyber-bg border-primary/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Progress</span>
              <span className="text-sm text-muted-foreground">
                {completedLevels.length} / {gameLevels.length} levels completed
              </span>
            </div>
            <div className="w-full bg-muted rounded-full h-2 mt-2">
              <div
                className="bg-gradient-to-r from-primary to-secondary h-2 rounded-full transition-all duration-500"
                style={{ width: `${(completedLevels.length / gameLevels.length) * 100}%` }}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};