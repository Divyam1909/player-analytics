export interface PlayerAttributes {
  passing: number;
  shooting: number;
  dribbling: number;
  defending: number;
  physical: number;
}

export interface MatchStats {
  // Passing stats
  goals: number;
  assists: number;
  passes: number;
  passAccuracy: number;
  keyPasses: number;
  passesInFinalThird: number;
  passesInBox: number;
  crosses: number;
  progressivePassing: number;

  // Defensive stats
  blocks: number;
  interceptions: number;
  clearances: number;
  recoveries: number;
  tackles: number;

  // Attacking stats
  progressiveRuns: number;
  dribbles: number;
  dribblesSuccessful: number;
  aerialDuelsWon: number;
  shots: number;
  shotsOnTarget: number;
  ballTouches: number;

  // Physical stats
  distanceCovered: number;
  sprints: number;
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
  overallRating: number;
  attributes: PlayerAttributes;
  matchStats: PlayerMatch[];
}

export interface PlayersData {
  players: Player[];
}
