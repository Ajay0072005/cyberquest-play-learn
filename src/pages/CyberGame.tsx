import React, { useState, useCallback, useEffect, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { PlayerController } from "@/components/game/PlayerController";
import { CyberCity } from "@/components/game/CyberCity";
import { GameUI } from "@/components/game/GameUI";
import { PuzzleOverlay } from "@/components/game/PuzzleOverlay";
import { MissionId } from "@/components/game/GameTypes";
import { missions } from "@/components/game/missionsData";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CyberGame() {
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLDivElement>(null);
  const [isLocked, setIsLocked] = useState(false);
  const [completedMissions, setCompletedMissions] = useState<MissionId[]>([]);
  const [totalXP, setTotalXP] = useState(0);
  const [nearBuilding, setNearBuilding] = useState<MissionId | null>(null);
  const [showPuzzle, setShowPuzzle] = useState(false);
  const [activePuzzleMission, setActivePuzzleMission] = useState<MissionId | null>(null);
  const [showMissionComplete, setShowMissionComplete] = useState(false);
  const [lastReward, setLastReward] = useState(0);
  const [puzzleKey, setPuzzleKey] = useState(0); // Force remount of PuzzleOverlay

  // Get current mission (first incomplete one, or null)
  const currentMission = missions.find((m) => !completedMissions.includes(m.id))?.id ?? null;

  // Pointer lock handling with fallback for iframe
  const requestLock = useCallback(() => {
    if (showPuzzle || showMissionComplete) return;
    try {
      canvasRef.current?.requestPointerLock();
    } catch {
      // Fallback: just set locked state directly for iframe environments
      setIsLocked(true);
    }
  }, [showPuzzle, showMissionComplete]);

  useEffect(() => {
    const onLockChange = () => {
      setIsLocked(!!document.pointerLockElement);
    };
    const onLockError = () => {
      // Fallback for environments where pointer lock is blocked
      setIsLocked(true);
    };
    document.addEventListener("pointerlockchange", onLockChange);
    document.addEventListener("pointerlockerror", onLockError);
    return () => {
      document.removeEventListener("pointerlockchange", onLockChange);
      document.removeEventListener("pointerlockerror", onLockError);
    };
  }, []);

  // Handle E key for interaction
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (
        (e.code === "KeyE" || e.code === "Enter") &&
        isLocked &&
        nearBuilding &&
        !completedMissions.includes(nearBuilding) &&
        !showPuzzle
      ) {
        // Exit pointer lock to allow UI interaction
        try {
          document.exitPointerLock();
        } catch {}
        setIsLocked(false);
        setActivePuzzleMission(nearBuilding);
        setPuzzleKey((k) => k + 1);
        setShowPuzzle(true);
      }
      // ESC to unlock
      if (e.code === "Escape" && isLocked && !showPuzzle) {
        try {
          document.exitPointerLock();
        } catch {}
        setIsLocked(false);
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isLocked, nearBuilding, completedMissions, showPuzzle]);

  // Click to dismiss mission complete
  useEffect(() => {
    if (!showMissionComplete) return;
    const onClick = () => {
      setShowMissionComplete(false);
    };
    const timer = setTimeout(() => {
      document.addEventListener("click", onClick, { once: true });
    }, 800);
    return () => {
      clearTimeout(timer);
      document.removeEventListener("click", onClick);
    };
  }, [showMissionComplete]);

  const handlePuzzleComplete = useCallback(
    (xp: number) => {
      if (!activePuzzleMission) return;
      setCompletedMissions((prev) => [...prev, activePuzzleMission]);
      setTotalXP((prev) => prev + xp);
      setLastReward(xp);
      setShowPuzzle(false);
      setActivePuzzleMission(null);
      setShowMissionComplete(true);
    },
    [activePuzzleMission]
  );

  const handlePuzzleClose = useCallback(() => {
    setShowPuzzle(false);
    setActivePuzzleMission(null);
  }, []);

  const handleNearBuilding = useCallback((id: MissionId | null) => {
    setNearBuilding(id);
  }, []);

  const puzzleMission = activePuzzleMission
    ? missions.find((m) => m.id === activePuzzleMission)
    : null;

  return (
    <div className="fixed inset-0 bg-black overflow-hidden" style={{ touchAction: "none" }}>
      {/* Back button */}
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50">
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            try { document.exitPointerLock(); } catch {}
            navigate("/dashboard");
          }}
          className="text-muted-foreground hover:text-foreground bg-black/50 border border-border/30"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Exit Game
        </Button>
      </div>

      {/* Game UI */}
      <GameUI
        totalXP={totalXP}
        completedMissions={completedMissions}
        currentMission={currentMission}
        nearBuilding={nearBuilding}
        isLocked={isLocked}
        showMissionComplete={showMissionComplete}
        lastReward={lastReward}
      />

      {/* Puzzle Overlay */}
      {showPuzzle && puzzleMission && (
        <PuzzleOverlay
          key={puzzleKey}
          mission={puzzleMission}
          onComplete={handlePuzzleComplete}
          onClose={handlePuzzleClose}
        />
      )}

      {/* 3D Canvas */}
      <div ref={canvasRef} className="w-full h-full" onClick={requestLock}>
        <Canvas
          camera={{ fov: 70, near: 0.1, far: 150 }}
          gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
          dpr={[1, 1.5]}
        >
          <PlayerController isLocked={isLocked} />
          <CyberCity
            completedMissions={completedMissions}
            onApproachBuilding={handleNearBuilding}
          />
        </Canvas>
      </div>
    </div>
  );
}
