import React from "react";
import { MissionId, BUILDING_COLORS } from "./GameTypes";
import { missions } from "./missionsData";
import { Shield, Target, Star, Trophy } from "lucide-react";

interface Props {
  totalXP: number;
  completedMissions: MissionId[];
  currentMission: MissionId | null;
  nearBuilding: MissionId | null;
  isLocked: boolean;
  showMissionComplete: boolean;
  lastReward: number;
}

export const GameUI: React.FC<Props> = ({
  totalXP,
  completedMissions,
  currentMission,
  nearBuilding,
  isLocked,
  showMissionComplete,
  lastReward,
}) => {
  const activeMission = currentMission
    ? missions.find((m) => m.id === currentMission)
    : null;

  return (
    <>
      {/* XP Counter — top right */}
      <div className="fixed top-4 right-4 z-40 flex items-center gap-2 bg-black/70 backdrop-blur-sm border border-primary/30 rounded-lg px-4 py-2">
        <Star className="h-5 w-5 text-yellow-400" />
        <span className="font-cyber text-lg text-yellow-400">{totalXP} XP</span>
      </div>

      {/* Mission Progress — top left */}
      <div className="fixed top-4 left-4 z-40 bg-black/70 backdrop-blur-sm border border-border/50 rounded-lg p-3 min-w-[200px]">
        <div className="flex items-center gap-2 mb-2">
          <Shield className="h-4 w-4 text-primary" />
          <span className="text-xs font-bold text-primary uppercase tracking-wider">Missions</span>
        </div>
        <div className="space-y-1">
          {missions.map((m) => {
            const completed = completedMissions.includes(m.id);
            return (
              <div key={m.id} className="flex items-center gap-2 text-xs">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{
                    backgroundColor: completed ? "#00ff88" : BUILDING_COLORS[m.id],
                    opacity: completed ? 1 : 0.5,
                  }}
                />
                <span className={completed ? "text-emerald-400 line-through" : "text-muted-foreground"}>
                  {m.location}
                </span>
                {completed && <span className="text-emerald-500">✓</span>}
              </div>
            );
          })}
        </div>
        <div className="mt-2 pt-2 border-t border-border/50 text-xs text-muted-foreground">
          {completedMissions.length}/{missions.length} Complete
        </div>
      </div>

      {/* Current Objective — bottom center */}
      {activeMission && isLocked && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-40 bg-black/70 backdrop-blur-sm border border-primary/30 rounded-lg px-6 py-3 text-center">
          <div className="flex items-center gap-2 justify-center mb-1">
            <Target className="h-4 w-4 text-primary" />
            <span className="text-xs text-primary uppercase tracking-wider font-bold">Objective</span>
          </div>
          <p className="text-sm text-foreground">{activeMission.objective}</p>
        </div>
      )}

      {/* Interaction Prompt */}
      {nearBuilding && isLocked && !completedMissions.includes(nearBuilding) && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-40 animate-pulse">
          <div className="bg-black/80 border border-primary/50 rounded-lg px-5 py-2 text-center">
            <span className="text-primary font-mono text-sm">Press [E] to Enter</span>
          </div>
        </div>
      )}

      {/* Crosshair */}
      {isLocked && (
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-40 pointer-events-none">
          <div className="w-1 h-1 bg-primary rounded-full shadow-[0_0_6px_rgba(0,255,136,0.8)]" />
        </div>
      )}

      {/* Controls hint */}
      {isLocked && (
        <div className="fixed bottom-4 right-4 z-40 text-[10px] text-muted-foreground/50 space-y-0.5">
          <p>WASD — Move</p>
          <p>Mouse — Look</p>
          <p>E — Interact</p>
          <p>ESC — Menu</p>
        </div>
      )}

      {/* Click to start overlay */}
      {!isLocked && !showMissionComplete && (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/50 backdrop-blur-sm cursor-pointer">
          <div className="text-center">
            <h2 className="text-3xl font-cyber text-primary mb-4 cyber-glow">CYBERQUEST 3D</h2>
            <p className="text-muted-foreground mb-2">Click to start exploring</p>
            <p className="text-xs text-muted-foreground/60">Use WASD to move, Mouse to look around</p>
          </div>
        </div>
      )}

      {/* Mission Complete celebration */}
      {showMissionComplete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="text-center animate-scale-in">
            <Trophy className="h-16 w-16 text-yellow-400 mx-auto mb-4" />
            <h2 className="text-3xl font-cyber text-primary mb-2">Mission Complete!</h2>
            <p className="text-xl text-yellow-400 font-bold mb-4">+{lastReward} XP</p>
            {completedMissions.length === missions.length ? (
              <div>
                <p className="text-emerald-400 text-lg mb-2">🎉 All Missions Complete!</p>
                <p className="text-muted-foreground">You've secured the cyber city!</p>
              </div>
            ) : (
              <p className="text-muted-foreground">Click to continue exploring</p>
            )}
          </div>
        </div>
      )}
    </>
  );
};
