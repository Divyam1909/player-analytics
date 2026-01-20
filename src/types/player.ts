export interface PlayerAttributes {
  passing: number | null;
  shooting: number | null;
  dribbling: number | null;
  defending: number | null;
  physical: number | null;
}

export interface MatchStats {
  // Passing stats
  goals: number;
  assists: number;
  passes: number;
  passAccuracy: number;
  keyPasses: number;
  passesInFinalThird: number | null;
  passesInBox: number | null;
  crosses: number;
  progressivePassing: number;

  // Defensive stats
  blocks: number | null;
  interceptions: number | null;
  clearances: number | null;
  recoveries: number | null;
  tackles: number | null;

  // Attacking stats
  progressiveRuns: number | null;
  dribbles: number;
  dribblesSuccessful: number;
  aerialDuelsWon: number;
  shots: number;
  shotsOnTarget: number;
  ballTouches: number;

  // Physical stats
  distanceCovered: number | null;
  sprints: number | null;
}

export interface MatchEvent {
  type: 'pass' | 'shot' | 'dribble' | 'interception' | 'tackle';
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  success: boolean;
  minute: number;
  // Advanced analytics properties
  passTarget?: string; // Target player ID for passing network
  isBigChance?: boolean; // Analyst-marked big chance
  isGoal?: boolean; // Whether shot resulted in goal
  xG?: number; // Expected goals value for shots
  shotOutcome?: 'missed' | 'saved' | 'blocked' | 'goal'; // Detailed shot outcome
}

export interface PlayerMatch {
  matchId: string;
  opponent: string;
  date: string;
  minutesPlayed: number;
  stats: MatchStats;
  events: MatchEvent[];
}

export interface Player {
  id: string;
  name: string;
  jerseyNumber: number;
  position: string;
  team: string;
  overallRating: number | null;
  attributes: PlayerAttributes;
  matchStats: PlayerMatch[];
}

export interface PlayersData {
  players: Player[];
}
