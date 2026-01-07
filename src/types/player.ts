export interface PlayerAttributes {
  passing: number;
  shooting: number;
  dribbling: number;
  defending: number;
  physical: number;
}

export interface MatchStats {
  goals: number;
  assists: number;
  passes: number;
  passAccuracy: number;
  shots: number;
  shotsOnTarget: number;
  interceptions: number;
  tackles: number;
  dribbles: number;
  dribblesSuccessful: number;
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
}

export interface PlayerMatch {
  matchId: string;
  opponent: string;
  date: string;
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
