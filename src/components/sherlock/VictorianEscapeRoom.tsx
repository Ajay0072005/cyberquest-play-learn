import React, { useState, Suspense, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Text, Box, Plane, useTexture, Html } from '@react-three/drei';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Key, Trophy, Lock, Eye, BookOpen } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useGame } from '@/context/GameContext';
import * as THREE from 'three';

interface VictorianEscapeRoomProps {
  onExit: () => void;
}

// Puzzle items in the room
const puzzles = [
  {
    id: 'safe',
    name: 'The Safe',
    position: [2, 1, -4.5] as [number, number, number],
    riddle: "I am the number of steps to 221B, doubled.",
    answer: "442",
    hint: "Baker Street's most famous address",
    solved: false
  },
  {
    id: 'desk',
    name: 'Holmes\' Desk',
    position: [-2, 0.8, -3] as [number, number, number],
    riddle: "The chemical formula for the white powder Holmes studies (abbreviated)",
    answer: "cocaine",
    hint: "A 7% solution...",
    solved: false
  },
  {
    id: 'violin',
    name: 'The Violin Case',
    position: [3.5, 0.5, 0] as [number, number, number],
    riddle: "Moriarty's first name",
    answer: "james",
    hint: "Professor _____ Moriarty",
    solved: false
  },
  {
    id: 'bookshelf',
    name: 'Secret Bookshelf',
    position: [-4, 2, 0] as [number, number, number],
    riddle: "Holmes' brother's name",
    answer: "mycroft",
    hint: "Works for the British government",
    solved: false
  }
];

// 3D Room Component
const Room = () => {
  return (
    <group>
      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[12, 12]} />
        <meshStandardMaterial color="#3a2518" />
      </mesh>
      
      {/* Ceiling */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 5, 0]}>
        <planeGeometry args={[12, 12]} />
        <meshStandardMaterial color="#2a1a0f" />
      </mesh>
      
      {/* Walls */}
      <mesh position={[0, 2.5, -6]} receiveShadow>
        <planeGeometry args={[12, 5]} />
        <meshStandardMaterial color="#4a3020" />
      </mesh>
      <mesh position={[0, 2.5, 6]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[12, 5]} />
        <meshStandardMaterial color="#4a3020" />
      </mesh>
      <mesh position={[-6, 2.5, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[12, 5]} />
        <meshStandardMaterial color="#5a4030" />
      </mesh>
      <mesh position={[6, 2.5, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[12, 5]} />
        <meshStandardMaterial color="#5a4030" />
      </mesh>
    </group>
  );
};

// Interactive object component
const InteractiveObject = ({ 
  position, 
  color, 
  onClick, 
  label,
  solved 
}: { 
  position: [number, number, number]; 
  color: string;
  onClick: () => void;
  label: string;
  solved: boolean;
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (meshRef.current && !solved) {
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 2) * 0.1;
    }
  });

  return (
    <group position={position}>
      <mesh
        ref={meshRef}
        onClick={onClick}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        castShadow
      >
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial 
          color={solved ? '#22c55e' : hovered ? '#f59e0b' : color} 
          emissive={hovered ? '#f59e0b' : '#000000'}
          emissiveIntensity={hovered ? 0.3 : 0}
        />
      </mesh>
      <Html position={[0, 1.2, 0]} center>
        <div className={`px-2 py-1 rounded text-xs font-bold whitespace-nowrap ${
          solved ? 'bg-green-500 text-white' : 'bg-amber-500 text-black'
        }`}>
          {solved ? '✓ ' : ''}{label}
        </div>
      </Html>
    </group>
  );
};

// Door component
const ExitDoor = ({ unlocked, onClick }: { unlocked: boolean; onClick: () => void }) => {
  const [hovered, setHovered] = useState(false);

  return (
    <group position={[0, 1.5, -5.9]}>
      <mesh 
        onClick={unlocked ? onClick : undefined}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <boxGeometry args={[2, 3, 0.2]} />
        <meshStandardMaterial 
          color={unlocked ? '#22c55e' : '#1a1a1a'} 
          emissive={unlocked && hovered ? '#22c55e' : '#000000'}
          emissiveIntensity={0.5}
        />
      </mesh>
      <Html position={[0, 0, 0.2]} center>
        <div className={`px-3 py-2 rounded font-bold ${
          unlocked ? 'bg-green-500 text-white' : 'bg-red-500/80 text-white'
        }`}>
          {unlocked ? '🚪 EXIT' : '🔒 LOCKED'}
        </div>
      </Html>
    </group>
  );
};

// Lighting
const Lights = () => {
  return (
    <>
      <ambientLight intensity={0.3} />
      <pointLight position={[0, 4, 0]} intensity={1} color="#ff9944" castShadow />
      <pointLight position={[-3, 3, -3]} intensity={0.5} color="#ffcc88" />
      <pointLight position={[3, 3, 3]} intensity={0.5} color="#ffcc88" />
    </>
  );
};

export const VictorianEscapeRoom: React.FC<VictorianEscapeRoomProps> = ({ onExit }) => {
  const [solvedPuzzles, setSolvedPuzzles] = useState<string[]>([]);
  const [activePuzzle, setActivePuzzle] = useState<typeof puzzles[0] | null>(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [showHint, setShowHint] = useState(false);
  const [escaped, setEscaped] = useState(false);
  const { toast } = useToast();
  const { addPoints, completeChallenge } = useGame();

  const allSolved = solvedPuzzles.length === puzzles.length;

  const handlePuzzleClick = (puzzle: typeof puzzles[0]) => {
    if (!solvedPuzzles.includes(puzzle.id)) {
      setActivePuzzle(puzzle);
      setUserAnswer('');
      setShowHint(false);
    }
  };

  const handleSubmitAnswer = () => {
    if (!activePuzzle) return;

    if (userAnswer.trim().toLowerCase() === activePuzzle.answer.toLowerCase()) {
      setSolvedPuzzles(prev => [...prev, activePuzzle.id]);
      setActivePuzzle(null);
      addPoints(100);
      toast({
        title: "Puzzle Solved! 🔓",
        description: `+100 XP - ${puzzles.length - solvedPuzzles.length - 1} puzzles remaining`,
      });
    } else {
      toast({
        title: "Incorrect",
        description: "That's not the answer. Try again!",
        variant: "destructive"
      });
    }
  };

  const handleEscape = () => {
    setEscaped(true);
    addPoints(500);
    completeChallenge('victorian-escape-room');
    toast({
      title: "🎉 Escaped!",
      description: "You've escaped Moriarty's trap! +500 XP",
    });
  };

  if (escaped) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="cyber-bg border-green-500/50 max-w-lg">
          <CardContent className="pt-8 text-center">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-green-500/20 mb-6">
              <Trophy className="h-12 w-12 text-green-500" />
            </div>
            <h2 className="text-3xl font-bold text-green-400 mb-4">
              Congratulations, Detective!
            </h2>
            <p className="text-muted-foreground mb-6">
              You've successfully escaped the Victorian Escape Room and completed The Sherlock Method course. Your deductive skills rival those of the great detective himself!
            </p>
            <Badge className="bg-green-500/20 text-green-400 text-lg px-6 py-2 mb-6">
              +500 XP Earned
            </Badge>
            <div className="flex gap-3 justify-center">
              <Button onClick={onExit} className="bg-gradient-to-r from-primary to-secondary">
                Return to Course
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="absolute top-4 left-4 right-4 z-10 flex items-center justify-between">
        <Button variant="ghost" onClick={onExit} className="bg-background/80 backdrop-blur">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Exit
        </Button>
        <Badge variant="outline" className="bg-background/80 backdrop-blur text-amber-400 border-amber-500/50">
          <Key className="h-3 w-3 mr-1" />
          {solvedPuzzles.length}/{puzzles.length} Puzzles Solved
        </Badge>
      </div>

      {/* Instructions */}
      <div className="absolute bottom-4 left-4 z-10">
        <Card className="bg-background/90 backdrop-blur border-primary/30 max-w-xs">
          <CardContent className="pt-4 text-sm">
            <p className="text-muted-foreground">
              <Eye className="h-4 w-4 inline mr-1" />
              Click on glowing objects to solve puzzles. Solve all 4 to unlock the exit door.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 3D Scene */}
      <div className="h-screen w-full">
        <Canvas shadows camera={{ position: [0, 2, 8], fov: 60 }}>
          <Suspense fallback={null}>
            <Lights />
            <Room />
            
            {/* Puzzle Objects */}
            {puzzles.map(puzzle => (
              <InteractiveObject
                key={puzzle.id}
                position={puzzle.position}
                color="#8b4513"
                onClick={() => handlePuzzleClick(puzzle)}
                label={puzzle.name}
                solved={solvedPuzzles.includes(puzzle.id)}
              />
            ))}

            {/* Exit Door */}
            <ExitDoor unlocked={allSolved} onClick={handleEscape} />

            <OrbitControls 
              enablePan={false}
              maxPolarAngle={Math.PI / 2}
              minDistance={3}
              maxDistance={10}
            />
          </Suspense>
        </Canvas>
      </div>

      {/* Puzzle Modal */}
      {activePuzzle && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-20 p-4">
          <Card className="cyber-bg border-amber-500/50 max-w-md w-full">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-4">
                <Lock className="h-5 w-5 text-amber-400" />
                <h3 className="text-xl font-bold text-amber-400">{activePuzzle.name}</h3>
              </div>
              
              <div className="bg-muted/30 p-4 rounded-lg mb-4">
                <p className="text-foreground">{activePuzzle.riddle}</p>
              </div>

              {showHint && (
                <div className="bg-amber-500/10 border border-amber-500/30 p-3 rounded-lg mb-4">
                  <p className="text-amber-200 text-sm">💡 Hint: {activePuzzle.hint}</p>
                </div>
              )}

              <div className="space-y-3">
                <Input
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  placeholder="Enter your answer..."
                  className="bg-muted/50"
                  onKeyDown={(e) => e.key === 'Enter' && handleSubmitAnswer()}
                />
                <div className="flex gap-2">
                  <Button 
                    onClick={handleSubmitAnswer}
                    disabled={!userAnswer.trim()}
                    className="flex-1 bg-gradient-to-r from-amber-500 to-orange-500"
                  >
                    Submit
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setShowHint(true)}
                    disabled={showHint}
                  >
                    Hint
                  </Button>
                  <Button 
                    variant="ghost" 
                    onClick={() => setActivePuzzle(null)}
                  >
                    Close
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
