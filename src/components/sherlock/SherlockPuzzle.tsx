import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Brain, CheckCircle, Lightbulb, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PuzzleData {
  question: string;
  clues: string[];
  answer: string;
  hint: string;
}

interface SherlockPuzzleProps {
  moduleId: number;
  puzzleData: PuzzleData;
  onComplete: () => void;
  onBack: () => void;
}

export const SherlockPuzzle: React.FC<SherlockPuzzleProps> = ({
  moduleId,
  puzzleData,
  onComplete,
  onBack
}) => {
  const [userAnswer, setUserAnswer] = useState('');
  const [showHint, setShowHint] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [isCorrect, setIsCorrect] = useState(false);
  const { toast } = useToast();

  const handleSubmit = () => {
    const normalizedAnswer = userAnswer.trim().toLowerCase();
    const normalizedCorrect = puzzleData.answer.toLowerCase();

    if (normalizedAnswer === normalizedCorrect) {
      setIsCorrect(true);
      toast({
        title: "Elementary, my dear Watson! 🎩",
        description: "You've solved the puzzle correctly!",
      });
    } else {
      setAttempts(prev => prev + 1);
      toast({
        title: "Not quite right",
        description: attempts >= 1 ? "Try using the hint!" : "Examine the clues more carefully.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" onClick={onBack} className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Lesson
          </Button>
          <div className="flex-1" />
          <Badge variant="outline" className="bg-amber-500/20 text-amber-400">
            <Brain className="h-3 w-3 mr-1" />
            Module {moduleId} Puzzle
          </Badge>
        </div>

        {/* Puzzle Card */}
        <Card className="cyber-bg border-amber-500/30 mb-6">
          <CardHeader className="border-b border-border/50">
            <CardTitle className="flex items-center gap-2 text-amber-400">
              <Brain className="h-5 w-5" />
              The Deduction Challenge
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            {isCorrect ? (
              <div className="text-center py-8">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-500/20 mb-4">
                  <CheckCircle className="h-10 w-10 text-green-500" />
                </div>
                <h3 className="text-2xl font-bold text-green-400 mb-2">Brilliant Deduction!</h3>
                <p className="text-muted-foreground mb-6">
                  You've proven yourself a true disciple of Holmes.
                </p>
                <Badge className="bg-green-500/20 text-green-400 text-lg px-4 py-2 mb-6">
                  +200 XP Earned
                </Badge>
                <div>
                  <Button 
                    onClick={onComplete}
                    className="bg-gradient-to-r from-primary to-secondary"
                  >
                    Continue to Next Module
                  </Button>
                </div>
              </div>
            ) : (
              <>
                {/* Question */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-2">The Case:</h3>
                  <p className="text-foreground bg-muted/30 p-4 rounded-lg border border-border/50">
                    {puzzleData.question}
                  </p>
                </div>

                {/* Clues */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <span>Evidence Collected:</span>
                  </h3>
                  <div className="space-y-2">
                    {puzzleData.clues.map((clue, index) => (
                      <div
                        key={index}
                        className="flex items-start gap-3 p-3 bg-muted/20 rounded-lg border border-border/30"
                      >
                        <Badge variant="outline" className="mt-0.5 shrink-0">
                          #{index + 1}
                        </Badge>
                        <p className="text-sm text-foreground">{clue}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Hint */}
                {showHint && (
                  <div className="mb-6 p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                    <div className="flex items-center gap-2 text-amber-400 mb-2">
                      <Lightbulb className="h-4 w-4" />
                      <span className="font-semibold">Holmes' Hint:</span>
                    </div>
                    <p className="text-amber-200/80 text-sm">{puzzleData.hint}</p>
                  </div>
                )}

                {/* Answer Input */}
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Your Deduction (one word answer):
                    </label>
                    <Input
                      value={userAnswer}
                      onChange={(e) => setUserAnswer(e.target.value)}
                      placeholder="Enter your answer..."
                      className="bg-muted/50"
                      onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                    />
                  </div>

                  <div className="flex gap-3">
                    <Button
                      onClick={handleSubmit}
                      disabled={!userAnswer.trim()}
                      className="flex-1 bg-gradient-to-r from-amber-500 to-orange-500"
                    >
                      Submit Deduction
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setShowHint(true)}
                      disabled={showHint}
                    >
                      <Lightbulb className="h-4 w-4 mr-2" />
                      Hint
                    </Button>
                  </div>

                  {attempts > 0 && (
                    <p className="text-sm text-muted-foreground text-center">
                      Attempts: {attempts}
                    </p>
                  )}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
