export type MissionId = "phishing" | "network" | "password" | "malware" | "final";

export interface GameState {
  currentMission: MissionId | null;
  completedMissions: MissionId[];
  totalXP: number;
  showPuzzle: boolean;
  showDialogue: boolean;
  dialogueText: string;
  isLocked: boolean; // pointer lock state
  showMissionComplete: boolean;
  lastReward: number;
}

export const INITIAL_GAME_STATE: GameState = {
  currentMission: null,
  completedMissions: [],
  totalXP: 0,
  showPuzzle: false,
  showDialogue: false,
  dialogueText: "",
  isLocked: false,
  showMissionComplete: false,
  lastReward: 0,
};

// Building positions in the cyber city
export const BUILDING_POSITIONS: Record<MissionId, [number, number, number]> = {
  phishing: [-20, 0, -15],
  network: [20, 0, -15],
  password: [-20, 0, 20],
  malware: [20, 0, 20],
  final: [0, 0, -35],
};

export const BUILDING_COLORS: Record<MissionId, string> = {
  phishing: "#00ff88",
  network: "#00aaff",
  password: "#ffaa00",
  malware: "#ff4444",
  final: "#aa00ff",
};
