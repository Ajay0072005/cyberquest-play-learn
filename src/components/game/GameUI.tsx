import React from "react";
import { MissionId, BUILDING_COLORS } from "./GameTypes";
import { missions } from "./missionsData";
import { Shield, Target, Star, Trophy, MousePointer } from "lucide-react";

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

  const nearBuildingCompleted = nearBuilding ? completedMissions.includes(nearBuilding) : false;

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
        <div className="space-y-1.5">
          {missions.map((m) => {
            const completed = completedMissions.includes(m.id);
            const isNext = m.id === currentMission;
            return (
              <div key={m.id} className="flex items-center gap-2 text-xs">
                <div
                  className={`w-2.5 h-2.5 rounded-full ${isNext ? "animate-pulse" : ""}`}
                  style={{
                    backgroundColor: completed ? "#00ff88" : BUILDING_COLORS[m.id],
                    opacity: completed ? 1 : isNext ? 1 : 0.4,
                  }}
                />
                <span className={
                  completed ? "text-emerald-400 line-through" : 
                  isNext ? "text-foreground font-medium" : "text-muted-foreground"
                }>
                  {m.location}
                </span>
                {completed && <span className="text-emerald-500 text-[10px]">✓</span>}
                {isNext && !completed && <span className="text-primary text-[10px]">← NEXT</span>}
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
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-40 bg-black/70 backdrop-blur-sm border border-primary/30 rounded-lg px-6 py-3 text-center max-w-md">
          <div className="flex items-center gap-2 justify-center mb-1">
            <Target className="h-4 w-4 text-primary" />
            <span className="text-xs text-primary uppercase tracking-wider font-bold">Objective</span>
          </div>
          <p className="text-sm text-foreground">{activeMission.objective}</p>
        </div>
      )}

      {/* Interaction Prompt */}
      {nearBuilding && isLocked && !nearBuildingCompleted && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-40">
          <div className="bg-black/80 border border-primary/50 rounded-lg px-5 py-2.5 text-center animate-pulse">
            <span className="text-primary font-mono text-sm font-bold">Press [E] to Enter</span>
          </div>
        </div>
      )}

      {/* Already completed message */}
      {nearBuilding && isLocked && nearBuildingCompleted && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-40">
          <div className="bg-black/60 border border-emerald-500/30 rounded-lg px-5 py-2 text-center">
            <span className="text-emerald-400 font-mono text-xs">✓ Mission Complete</span>
          </div>
        </div>
      )}

      {/* Crosshair */}
      {isLocked && (
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-40 pointer-events-none">
          <div className="relative">
            <div className="w-6 h-[1px] bg-primary/60 absolute -left-3 top-0" />
            <div className="w-[1px] h-6 bg-primary/60 absolute left-0 -top-3" />
            <div className="w-1.5 h-1.5 bg-primary rounded-full absolute -left-[3px] -top-[3px] shadow-[0_0_8px_rgba(0,255,136,0.8)]" />
          </div>
        </div>
      )}

      {/* Controls hint */}
      {isLocked && (
        <div className="fixed bottom-4 right-4 z-40 text-[10px] text-muted-foreground/50 space-y-0.5 text-right">
          <p>WASD / Arrows — Move</p>
          <p>Mouse — Look</p>
          <p>E / Enter — Interact</p>
          <p>ESC — Pause</p>
        </div>
      )}

      {/* Click to start overlay */}
      {!isLocked && !showMissionComplete && !nearBuilding && (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/60 backdrop-blur-sm cursor-pointer">
          <div className="text-center animate-fade-in">
            <h2 className="text-4xl font-cyber text-primary mb-4 cyber-glow">CYBERQUEST 3D</h2>
            <p className="text-lg text-muted-foreground mb-3">Explore the Cyber City</p>
            <div className="flex items-center justify-center gap-2 text-primary/70 mb-6">
              <MousePointer className="h-5 w-5" />
              <span className="text-sm">Click anywhere to start</span>
            </div>
            <div className="grid grid-cols-2 gap-x-8 gap-y-1 text-xs text-muted-foreground/60 max-w-xs mx-auto">
              <span className="text-right">WASD</span><span className="text-left">Move</span>
              <span className="text-right">Mouse</span><span className="text-left">Look around</span>
              <span className="text-right">E</span><span className="text-left">Interact</span>
              <span className="text-right">ESC</span><span className="text-left">Pause</span>
            </div>
          </div>
        </div>
      )}

      {/* Mission Complete celebration */}
      {showMissionComplete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm cursor-pointer">
          <div className="text-center animate-scale-in">
            <Trophy className="h-16 w-16 text-yellow-400 mx-auto mb-4 animate-bounce" />
            <h2 className="text-3xl font-cyber text-primary mb-2 cyber-glow">Mission Complete!</h2>
            <p className="text-2xl text-yellow-400 font-bold mb-4">+{lastReward} XP</p>
            {completedMissions.length === missions.length ? (
              <div className="space-y-2">
                <p className="text-emerald-400 text-xl font-bold">🎉 All Missions Complete!</p>
                <p className="text-muted-foreground">You've secured the cyber city!</p>
                <p className="text-primary font-cyber text-lg mt-4">Total: {totalXP} XP</p>
              </div>
            ) : (
              <p className="text-muted-foreground text-sm mt-2">Click anywhere to continue exploring</p>
            )}
          </div>
        </div>
      )}
    </>
  );
};
