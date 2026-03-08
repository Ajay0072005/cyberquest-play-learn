import React, { useState } from "react";
import { MissionData } from "./missionsData";
import { Button } from "@/components/ui/button";
import { X, AlertTriangle, CheckCircle2 } from "lucide-react";

interface Props {
  mission: MissionData;
  onComplete: (xp: number) => void;
  onClose: () => void;
}

export const PuzzleOverlay: React.FC<Props> = ({ mission, onComplete, onClose }) => {
  const [selected, setSelected] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const handleAnswer = (index: number) => {
    if (answered) return;
    setSelected(index);
    setAnswered(true);
    setIsCorrect(mission.puzzle.options[index].correct);
  };

  const handleContinue = () => {
    if (isCorrect) {
      onComplete(mission.xpReward);
    } else {
      // Reset to try again
      setSelected(null);
      setAnswered(false);
      setIsCorrect(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl bg-card border border-primary/30 rounded-xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-primary/5">
          <h2 className="text-lg font-cyber font-bold text-primary">{mission.title}</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Context terminal */}
        <div className="px-6 py-4">
          <pre className="bg-black/80 text-emerald-400 p-4 rounded-lg text-xs font-mono whitespace-pre-wrap border border-emerald-500/20 max-h-48 overflow-y-auto">
            {mission.puzzle.context}
          </pre>
        </div>

        {/* Question */}
        <div className="px-6 pb-2">
          <p className="font-semibold text-foreground">{mission.puzzle.question}</p>
        </div>

        {/* Options */}
        <div className="px-6 pb-4 space-y-2">
          {mission.puzzle.options.map((opt, i) => {
            let borderColor = "border-border hover:border-primary/50";
            if (answered && selected === i) {
              borderColor = opt.correct
                ? "border-emerald-500 bg-emerald-500/10"
                : "border-red-500 bg-red-500/10";
            }

            return (
              <button
                key={i}
                onClick={() => handleAnswer(i)}
                disabled={answered}
                className={`w-full text-left px-4 py-3 rounded-lg border transition-all text-sm ${borderColor} ${
                  answered ? "cursor-default" : "cursor-pointer"
                }`}
              >
                <span className="font-medium">{opt.label}</span>
              </button>
            );
          })}
        </div>

        {/* Feedback */}
        {answered && selected !== null && (
          <div className="px-6 pb-4">
            <div
              className={`flex items-start gap-3 p-4 rounded-lg border ${
                isCorrect
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                  : "bg-red-500/10 border-red-500/30 text-red-300"
              }`}
            >
              {isCorrect ? (
                <CheckCircle2 className="h-5 w-5 shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
              )}
              <div>
                <p className="text-sm">{mission.puzzle.options[selected].feedback}</p>
                {isCorrect && (
                  <p className="text-xs mt-2 text-emerald-400 font-bold">+{mission.xpReward} XP earned!</p>
                )}
              </div>
            </div>

            <Button
              onClick={handleContinue}
              className="w-full mt-3"
              variant={isCorrect ? "cyber" : "outline"}
            >
              {isCorrect ? "Mission Complete!" : "Try Again"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
