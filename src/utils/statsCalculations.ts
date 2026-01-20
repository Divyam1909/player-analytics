/**
 * Stats Calculation Utilities
 * 
 * Scalable and efficient functions to calculate derived statistics
 * from raw database data. All calculations are pure functions
 * that can be easily tested and composed.
 */

import type {
    DbPassEvent,
    DbShotOnTarget,
    DbDuel,
    DbKeeperAction,
    DbFinalThirdChance
} from '@/types/database.types';

// ============================================
// PASS STATISTICS CALCULATIONS
// ============================================

export interface PassStats {
    totalPasses: number;
    successfulPasses: number;
    passAccuracy: number;
    keyPasses: number;
    progressivePasses: number;
    crosses: number;
    successfulCrosses: number;
    assists: number;
}

/**
 * Calculate pass statistics from raw pass events
 */
export function calculatePassStats(passEvents: DbPassEvent[]): PassStats {
    if (passEvents.length === 0) {
        return {
            totalPasses: 0,
            successfulPasses: 0,
            passAccuracy: 0,
            keyPasses: 0,
            progressivePasses: 0,
            crosses: 0,
            successfulCrosses: 0,
            assists: 0,
        };
    }

    const totalPasses = passEvents.length;
    const successfulPasses = passEvents.filter(p => p.is_successful).length;
    const passAccuracy = Math.round((successfulPasses / totalPasses) * 100);
    const keyPasses = passEvents.filter(p => p.is_key_pass).length;
    const progressivePasses = passEvents.filter(p => p.is_progressive_pass).length;
    const crosses = passEvents.filter(p => p.is_cross).length;
    const successfulCrosses = passEvents.filter(p => p.is_cross && p.is_successful).length;
    const assists = passEvents.filter(p => p.is_assist).length;

    return {
        totalPasses,
        successfulPasses,
        passAccuracy,
        keyPasses,
        progressivePasses,
        crosses,
        successfulCrosses,
        assists,
    };
}

/**
 * Calculate passes in final third (y > 66.67% of field)
 */
export function calculatePassesInFinalThird(passEvents: DbPassEvent[]): number {
    return passEvents.filter(p => p.start_x !== null && p.start_x > 66.67).length;
}

/**
 * Calculate passes in box (approximate box area)
 */
export function calculatePassesInBox(passEvents: DbPassEvent[]): number {
    return passEvents.filter(p => {
        if (p.start_x === null || p.start_y === null) return false;
        // Approximate penalty box: x > 83.5, y between 21.1 and 78.9
        return p.start_x > 83.5 && p.start_y > 21.1 && p.start_y < 78.9;
    }).length;
}

// ============================================
// SHOT STATISTICS CALCULATIONS
// ============================================

export interface ShotStats {
    totalShots: number;
    shotsOnTarget: number;
    goals: number;
    penalties: number;
    conversionRate: number;
}

/**
 * Calculate shot statistics from raw shot events
 */
export function calculateShotStats(shots: DbShotOnTarget[]): ShotStats {
    if (shots.length === 0) {
        return {
            totalShots: 0,
            shotsOnTarget: 0,
            goals: 0,
            penalties: 0,
            conversionRate: 0,
        };
    }

    const totalShots = shots.length;
    const shotsOnTarget = totalShots; // All are on target by definition
    const goals = shots.filter(s => s.is_goal).length;
    const penalties = shots.filter(s => s.is_penalty).length;
    const conversionRate = totalShots > 0 ? Math.round((goals / totalShots) * 100) : 0;

    return {
        totalShots,
        shotsOnTarget,
        goals,
        penalties,
        conversionRate,
    };
}

// ============================================
// DUEL STATISTICS CALCULATIONS
// ============================================

export interface DuelStats {
    aerialDuelsAttempted: number;
    aerialDuelsWon: number;
    aerialDuelSuccess: number;
    dribblesAttempted: number;
    dribblesSuccessful: number;
    dribbleSuccess: number;
}

/**
 * Calculate duel statistics from raw duel events
 */
export function calculateDuelStats(duels: DbDuel[]): DuelStats {
    const aerialDuels = duels.filter(d => d.duel_type === 'aerial');
    const dribbleDuels = duels.filter(d => d.duel_type === 'dribble');

    const aerialDuelsAttempted = aerialDuels.length;
    const aerialDuelsWon = aerialDuels.filter(d => d.is_successful).length;
    const aerialDuelSuccess = aerialDuelsAttempted > 0
        ? Math.round((aerialDuelsWon / aerialDuelsAttempted) * 100)
        : 0;

    const dribblesAttempted = dribbleDuels.length;
    const dribblesSuccessful = dribbleDuels.filter(d => d.is_successful).length;
    const dribbleSuccess = dribblesAttempted > 0
        ? Math.round((dribblesSuccessful / dribblesAttempted) * 100)
        : 0;

    return {
        aerialDuelsAttempted,
        aerialDuelsWon,
        aerialDuelSuccess,
        dribblesAttempted,
        dribblesSuccessful,
        dribbleSuccess,
    };
}

// ============================================
// KEEPER STATISTICS CALCULATIONS
// ============================================

export interface KeeperStats {
    saves: number;
    savesInsideBox: number;
    savesOutsideBox: number;
    collections: number;
}

/**
 * Calculate goalkeeper statistics from raw keeper actions
 */
export function calculateKeeperStats(actions: DbKeeperAction[]): KeeperStats {
    const saves = actions.filter(a => a.action_type === 'save');
    const collections = actions.filter(a => a.action_type === 'collection').length;

    return {
        saves: saves.length,
        savesInsideBox: saves.filter(s => s.save_location === 'inside_box').length,
        savesOutsideBox: saves.filter(s => s.save_location === 'outside_box').length,
        collections,
    };
}

// ============================================
// CHANCE CREATION CALCULATIONS
// ============================================

export interface ChanceStats {
    totalChances: number;
    chancesFromCorners: number;
    chancesInBox: number;
    shortCorners: number;
    longCorners: number;
    longCornerSuccess: number;
}

/**
 * Calculate chance creation statistics
 */
export function calculateChanceStats(chances: DbFinalThirdChance[]): ChanceStats {
    const totalChances = chances.length;
    const corners = chances.filter(c => c.is_corner);
    const chancesFromCorners = corners.length;
    const chancesInBox = chances.filter(c => c.is_in_box).length;
    const shortCorners = corners.filter(c => c.corner_type === 'short').length;
    const longCorners = corners.filter(c => c.corner_type === 'long').length;
    const longCornerSuccess = corners.filter(c => c.corner_type === 'long' && c.long_corner_success).length;

    return {
        totalChances,
        chancesFromCorners,
        chancesInBox,
        shortCorners,
        longCorners,
        longCornerSuccess,
    };
}

// ============================================
// AGGREGATION UTILITIES
// ============================================

/**
 * Group events by player ID for per-player calculations
 */
export function groupByPlayerId<T extends { player_id: string }>(
    events: T[]
): Map<string, T[]> {
    const grouped = new Map<string, T[]>();

    for (const event of events) {
        const existing = grouped.get(event.player_id) || [];
        existing.push(event);
        grouped.set(event.player_id, existing);
    }

    return grouped;
}

/**
 * Group events by match ID for per-match calculations
 */
export function groupByMatchId<T extends { match_id: string }>(
    events: T[]
): Map<string, T[]> {
    const grouped = new Map<string, T[]>();

    for (const event of events) {
        const existing = grouped.get(event.match_id) || [];
        existing.push(event);
        grouped.set(event.match_id, existing);
    }

    return grouped;
}

/**
 * Group events by player and match for per-player-per-match calculations
 */
export function groupByPlayerAndMatch<T extends { player_id: string; match_id: string }>(
    events: T[]
): Map<string, T[]> {
    const grouped = new Map<string, T[]>();

    for (const event of events) {
        const key = `${event.player_id}__${event.match_id}`;
        const existing = grouped.get(key) || [];
        existing.push(event);
        grouped.set(key, existing);
    }

    return grouped;
}

// ============================================
// EVENT TO FRONTEND FORMAT CONVERSION
// ============================================

import type { MatchEvent } from '@/types/player';

/**
 * Convert database pass event to frontend MatchEvent format
 */
export function passEventToMatchEvent(passEvent: DbPassEvent): MatchEvent {
    return {
        type: 'pass',
        x: passEvent.start_x ?? 0,
        y: passEvent.start_y ?? 0,
        targetX: passEvent.end_x ?? 0,
        targetY: passEvent.end_y ?? 0,
        success: passEvent.is_successful,
        minute: passEvent.minute ?? 0,
    };
}

/**
 * Convert database shot event to frontend MatchEvent format
 */
export function shotEventToMatchEvent(shot: DbShotOnTarget): MatchEvent {
    return {
        type: 'shot',
        x: shot.shot_x ?? 0,
        y: shot.shot_y ?? 0,
        targetX: 100, // Goal is at x=100
        targetY: 50, // Center of goal
        success: shot.is_goal,
        minute: shot.minute ?? 0,
        isGoal: shot.is_goal,
    };
}

/**
 * Convert database duel to frontend MatchEvent format
 */
export function duelToMatchEvent(duel: DbDuel): MatchEvent {
    return {
        type: duel.duel_type === 'dribble' ? 'dribble' : 'tackle',
        x: duel.duel_x ?? 0,
        y: duel.duel_y ?? 0,
        targetX: duel.duel_x ?? 0,
        targetY: duel.duel_y ?? 0,
        success: duel.is_successful,
        minute: duel.minute ?? 0,
    };
}

// ============================================
// COMBINED PLAYER MATCH STATS
// ============================================

import type { MatchStats } from '@/types/player';

export interface CalculatedPlayerMatchStats {
    passStats: PassStats;
    shotStats: ShotStats;
    duelStats: DuelStats;
    passesInFinalThird: number;
    passesInBox: number;
}

/**
 * Calculate all stats for a player in a specific match from raw events
 */
export function calculatePlayerMatchStats(
    passEvents: DbPassEvent[],
    shots: DbShotOnTarget[],
    duels: DbDuel[]
): CalculatedPlayerMatchStats {
    return {
        passStats: calculatePassStats(passEvents),
        shotStats: calculateShotStats(shots),
        duelStats: calculateDuelStats(duels),
        passesInFinalThird: calculatePassesInFinalThird(passEvents),
        passesInBox: calculatePassesInBox(passEvents),
    };
}

/**
 * Convert calculated stats to frontend MatchStats format
 * Returns null for fields not calculable from current DB tables
 */
export function toFrontendMatchStats(
    calculated: CalculatedPlayerMatchStats
): MatchStats {
    return {
        // From calculations
        goals: calculated.shotStats.goals,
        assists: calculated.passStats.assists,
        passes: calculated.passStats.totalPasses,
        passAccuracy: calculated.passStats.passAccuracy,
        keyPasses: calculated.passStats.keyPasses,
        passesInFinalThird: calculated.passesInFinalThird,
        passesInBox: calculated.passesInBox,
        crosses: calculated.passStats.crosses,
        progressivePassing: calculated.passStats.progressivePasses,
        shots: calculated.shotStats.totalShots,
        shotsOnTarget: calculated.shotStats.shotsOnTarget,
        dribbles: calculated.duelStats.dribblesAttempted,
        dribblesSuccessful: calculated.duelStats.dribblesSuccessful,
        aerialDuelsWon: calculated.duelStats.aerialDuelsWon,
        ballTouches: calculated.passStats.totalPasses + calculated.duelStats.dribblesAttempted + calculated.shotStats.totalShots,

        // Not available in database - return null
        blocks: null,
        interceptions: null,
        clearances: null,
        recoveries: null,
        tackles: null,
        progressiveRuns: null,
        distanceCovered: null,
        sprints: null,
    };
}
