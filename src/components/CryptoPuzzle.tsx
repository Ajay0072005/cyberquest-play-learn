import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Lock, Key, CheckCircle, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useGame } from '@/context/GameContext';

const puzzles = [
  {
    id: 'caesar-1',
    title: 'Caesar Cipher Challenge',
    description: 'Decode this Caesar cipher (shift of 3)',
    encryptedMessage: 'FDHVDU FLSKHU LV HDV\\',
    solution: 'CAESAR CIPHER IS EASY',
    hint: 'Each letter is shifted 3 positions forward in the alphabet',
    points: 150
  },
  {
    id: 'base64-1', 
    title: 'Base64 Decoder',
    description: 'Decode this Base64 encoded message',
    encryptedMessage: 'SGFja2VyIEFsZXJ0IQ==',
    solution: 'Hacker Alert!',
    hint: 'This is a standard Base64 encoding',
    points: 100
  },
  {
    id: 'rot13-1',
    title: 'ROT13 Challenge',
    description: 'Decode this ROT13 encrypted text',
    encryptedMessage: 'Plorefrphevgl vf sha!',
    solution: 'Cybersecurity is fun!',
    hint: 'ROT13 shifts each letter by 13 positions',
    points: 120
  }
];

interface CryptoPuzzleProps {
  onBack: () => void;
}

export const CryptoPuzzle: React.FC<CryptoPuzzleProps> = ({ onBack }) => {
  const [currentPuzzle, setCurrentPuzzle] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [showHint, setShowHint] = useState(false);
  const [solved, setSolved] = useState<string[]>([]);
  const { toast } = useToast();
  const { addPoints, completeChallenge } = useGame();

  const puzzle = puzzles[currentPuzzle];

  const checkSolution = () => {
    const normalizedInput = userInput.trim().toUpperCase();
    const normalizedSolution = puzzle.solution.toUpperCase();
    
    if (normalizedInput === normalizedSolution) {
      if (!solved.includes(puzzle.id)) {
        setSolved(prev => [...prev, puzzle.id]);
        addPoints(puzzle.points);
        completeChallenge(puzzle.id);
        toast({
          title: "Puzzle Solved! 🎉",
          description: `+${puzzle.points} XP earned!`,
        });
      }
    } else {
      toast({
        title: "Incorrect Solution",
        description: "Try again or use the hint!",
        variant: "destructive"
      });
    }
  };

  const nextPuzzle = () => {
    if (currentPuzzle < puzzles.length - 1) {
      setCurrentPuzzle(prev => prev + 1);
      setUserInput('');
      setShowHint(false);
    }
  };

  const prevPuzzle = () => {
    if (currentPuzzle > 0) {
      setCurrentPuzzle(prev => prev - 1);
      setUserInput('');
      setShowHint(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="container mx-auto max-w-4xl">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" onClick={onBack} className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Challenges
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-cyber font-bold cyber-glow">
              Cryptography Puzzles
            </h1>
            <p className="text-muted-foreground">Decode encrypted messages to earn XP</p>
          </div>
          <Badge variant="outline" className="font-cyber">
            Puzzle {currentPuzzle + 1} / {puzzles.length}
          </Badge>
        </div>

        <div className="grid gap-6">
          <Card className="cyber-bg border-primary/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5 text-primary" />
                {puzzle.title}
                {solved.includes(puzzle.id) && (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Challenge:</h4>
                <p className="text-foreground">{puzzle.description}</p>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Encrypted Message:</h4>
                <div className="bg-muted p-4 rounded-lg font-mono text-center">
                  <code className="text-lg terminal-text cyber-glow">
                    {puzzle.encryptedMessage}
                  </code>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium mb-1 block">Your Solution:</label>
                  <Input
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    placeholder="Enter decoded message..."
                    className="bg-muted/50 terminal-text"
                    onKeyDown={(e) => e.key === 'Enter' && checkSolution()}
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={checkSolution}
                    className="flex items-center gap-2 bg-gradient-to-r from-primary to-secondary"
                    disabled={!userInput.trim()}
                  >
                    <Key className="h-4 w-4" />
                    Decrypt
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowHint(!showHint)}
                  >
                    {showHint ? 'Hide Hint' : 'Show Hint'}
                  </Button>
                </div>

                {showHint && (
                  <div className="bg-accent/20 p-3 rounded border-l-4 border-accent">
                    <p className="text-sm">💡 {puzzle.hint}</p>
                  </div>
                )}
              </div>

              <div className="flex justify-between pt-4 border-t border-border/50">
                <Button
                  variant="outline"
                  onClick={prevPuzzle}
                  disabled={currentPuzzle === 0}
                >
                  Previous Puzzle
                </Button>
                <div className="text-center">
                  <Badge variant="outline" className="bg-cyber-green/20 text-cyber-green">
                    +{puzzle.points} XP
                  </Badge>
                </div>
                <Button
                  variant="cyber"
                  onClick={nextPuzzle}
                  disabled={currentPuzzle === puzzles.length - 1}
                >
                  Next Puzzle
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};