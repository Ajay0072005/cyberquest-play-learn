import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { 
  Search, 
  Crosshair, 
  Shield, 
  ChevronRight,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  Terminal,
  ArrowLeft
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useGame } from '@/context/GameContext';
import { useLabProgress } from '@/hooks/useLabProgress';

export interface LabStep {
  title: string;
  description: string;
  instruction: string;
  codeExample?: string;
  expectedAnswer: string;
  hint: string;
  explanation: string;
}

export interface MiniLabData {
  id: string;
  title: string;
  category: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  duration: string;
  description: string;
  scenario: string;
  steps: {
    identify: LabStep;
    exploit: LabStep;
    fix: LabStep;
  };
  points: number;
}

interface MiniLabProps {
  lab: MiniLabData;
  onComplete: () => void;
  onBack: () => void;
}

type StepKey = 'identify' | 'exploit' | 'fix';

const stepConfig = {
  identify: {
    icon: Search,
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/20',
    borderColor: 'border-blue-500/50',
    label: 'IDENTIFY',
    description: 'Understand & locate the vulnerability'
  },
  exploit: {
    icon: Crosshair,
    color: 'text-orange-400',
    bgColor: 'bg-orange-500/20',
    borderColor: 'border-orange-500/50',
    label: 'EXPLOIT',
    description: 'Perform controlled exploitation'
  },
  fix: {
    icon: Shield,
    color: 'text-green-400',
    bgColor: 'bg-green-500/20',
    borderColor: 'border-green-500/50',
    label: 'FIX',
    description: 'Apply mitigation & secure'
  }
};

export const MiniLab: React.FC<MiniLabProps> = ({ lab, onComplete, onBack }) => {
  const [currentStep, setCurrentStep] = useState<StepKey>('identify');
  const [userAnswer, setUserAnswer] = useState('');
  const [showHint, setShowHint] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<StepKey[]>([]);
  const [showExplanation, setShowExplanation] = useState(false);
  const { toast } = useToast();
  const { addPoints, completeChallenge } = useGame();
  const { completeLab } = useLabProgress();

  const steps: StepKey[] = ['identify', 'exploit', 'fix'];
  const currentStepIndex = steps.indexOf(currentStep);
  const stepData = lab.steps[currentStep];
  const config = stepConfig[currentStep];
  const StepIcon = config.icon;

  const progress = (completedSteps.length / 3) * 100;

  const handleSubmit = async () => {
    const normalizedAnswer = userAnswer.trim().toLowerCase();
    const normalizedExpected = stepData.expectedAnswer.toLowerCase();

    if (normalizedAnswer.includes(normalizedExpected) || normalizedExpected.includes(normalizedAnswer)) {
      setCompletedSteps(prev => [...prev, currentStep]);
      setShowExplanation(true);
      
      if (currentStep === 'fix') {
        // Lab completed - save to database
        await completeLab(lab.id, 'minilab', lab.points);
        addPoints(lab.points);
        completeChallenge(`minilab-${lab.id}`);
        toast({
          title: "🎉 Mini Lab Completed!",
          description: `+${lab.points} XP - You've mastered this security concept!`,
        });
      } else {
        toast({
          title: "✅ Step Completed!",
          description: "Great work! Read the explanation and continue.",
        });
      }
    } else {
      toast({
        title: "Not quite right",
        description: "Check your answer and try again. Use the hint if needed.",
        variant: "destructive"
      });
    }
  };

  const handleNextStep = () => {
    setShowExplanation(false);
    setUserAnswer('');
    setShowHint(false);
    
    if (currentStep === 'fix') {
      onComplete();
    } else {
      setCurrentStep(steps[currentStepIndex + 1]);
    }
  };

  const isStepCompleted = (step: StepKey) => completedSteps.includes(step);

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" onClick={onBack} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </div>

        {/* Lab Info */}
        <Card className="cyber-bg border-primary/30 mb-6">
          <CardHeader>
            <div className="flex items-start justify-between flex-wrap gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline" className="text-primary border-primary/50">
                    {lab.category}
                  </Badge>
                  <Badge 
                    variant="outline" 
                    className={
                      lab.difficulty === 'Beginner' ? 'text-green-400 border-green-500/50' :
                      lab.difficulty === 'Intermediate' ? 'text-yellow-400 border-yellow-500/50' :
                      'text-red-400 border-red-500/50'
                    }
                  >
                    {lab.difficulty}
                  </Badge>
                  <Badge variant="outline" className="text-muted-foreground">
                    {lab.duration}
                  </Badge>
                </div>
                <CardTitle className="text-2xl font-cyber">{lab.title}</CardTitle>
                <p className="text-muted-foreground mt-2">{lab.description}</p>
              </div>
              <div className="text-right">
                <span className="text-3xl font-bold text-primary">{lab.points}</span>
                <span className="text-muted-foreground ml-1">XP</span>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-8">
          {steps.map((step, index) => {
            const stepConf = stepConfig[step];
            const Icon = stepConf.icon;
            const isActive = step === currentStep;
            const isComplete = isStepCompleted(step);
            
            return (
              <React.Fragment key={step}>
                <div className={`flex flex-col items-center ${isActive ? 'scale-110' : ''} transition-transform`}>
                  <div className={`
                    w-12 h-12 rounded-full flex items-center justify-center transition-all
                    ${isComplete ? 'bg-green-500/20 border-2 border-green-500' : 
                      isActive ? `${stepConf.bgColor} border-2 ${stepConf.borderColor}` : 
                      'bg-muted/30 border-2 border-border'}
                  `}>
                    {isComplete ? (
                      <CheckCircle2 className="h-6 w-6 text-green-400" />
                    ) : (
                      <Icon className={`h-6 w-6 ${isActive ? stepConf.color : 'text-muted-foreground'}`} />
                    )}
                  </div>
                  <span className={`text-xs font-cyber mt-2 ${isActive ? stepConf.color : 'text-muted-foreground'}`}>
                    {stepConf.label}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-2 ${isStepCompleted(step) ? 'bg-green-500' : 'bg-border'}`} />
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Scenario Card */}
        <Card className="cyber-bg border-border mb-6">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-yellow-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-yellow-400 mb-1">Scenario</h4>
                <p className="text-sm text-muted-foreground">{lab.scenario}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Current Step */}
        <Card className={`cyber-bg ${config.borderColor} border-2 mb-6`}>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg ${config.bgColor} flex items-center justify-center`}>
                <StepIcon className={`h-5 w-5 ${config.color}`} />
              </div>
              <div>
                <p className={`text-xs font-cyber ${config.color}`}>{config.description}</p>
                <CardTitle className="text-lg">{stepData.title}</CardTitle>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-muted-foreground">{stepData.description}</p>

            {stepData.codeExample && (
              <div className="bg-black/50 rounded-lg p-4 font-mono text-sm overflow-x-auto">
                <div className="flex items-center gap-2 mb-2 text-muted-foreground">
                  <Terminal className="h-4 w-4" />
                  <span className="text-xs">Code Example</span>
                </div>
                <pre className="text-green-400">{stepData.codeExample}</pre>
              </div>
            )}

            <div className="bg-muted/20 rounded-lg p-4">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <Crosshair className="h-4 w-4 text-primary" />
                Your Task
              </h4>
              <p className="text-sm text-muted-foreground">{stepData.instruction}</p>
            </div>

            {showExplanation ? (
              <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                <h4 className="font-semibold text-green-400 mb-2 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  Correct! Here's the explanation:
                </h4>
                <p className="text-sm text-muted-foreground">{stepData.explanation}</p>
                <Button 
                  onClick={handleNextStep} 
                  className="mt-4 bg-gradient-to-r from-primary to-primary/70"
                >
                  {currentStep === 'fix' ? 'Complete Lab' : 'Continue to Next Step'}
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            ) : (
              <>
                <Textarea
                  placeholder="Enter your answer..."
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  className="min-h-[100px] bg-background/50"
                />

                {showHint && (
                  <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                    <h4 className="font-semibold text-yellow-400 mb-1 flex items-center gap-2">
                      <Lightbulb className="h-4 w-4" />
                      Hint
                    </h4>
                    <p className="text-sm text-muted-foreground">{stepData.hint}</p>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <Button
                    variant="outline"
                    onClick={() => setShowHint(true)}
                    disabled={showHint}
                  >
                    <Lightbulb className="h-4 w-4 mr-2" />
                    Show Hint
                  </Button>
                  <Button 
                    onClick={handleSubmit}
                    className="bg-gradient-to-r from-primary to-primary/70"
                    disabled={!userAnswer.trim()}
                  >
                    Submit Answer
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Progress Bar */}
        <div className="mt-6">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-muted-foreground">Lab Progress</span>
            <span className="text-primary">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </div>
    </div>
  );
};
