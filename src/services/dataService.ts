/**
 * Data Service
 * 
 * Central data access layer that:
 * 1. Fetches data from Supabase
 * 2. Returns null for missing data (no JSON fallback)
 * 3. Transforms database data to frontend format
 * 4. Uses calculation utilities for derived stats
 */

import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import type {
    DbPlayer,
    DbTeam,
    DbMatch,
    DbMatchStatisticsSummary,
    DbPlayerMatchStatistics,
    DbPlayerAttributes,
    DbPassEvent,
    DbShotOnTarget,
    DbDuel,
} from '@/types/database.types';
import type { Player, PlayerMatch, MatchStats, MatchEvent, PlayerAttributes } from '@/types/player';
import {
    calculatePassStats,
    calculateShotStats,
    calculateDuelStats,
    calculatePassesInFinalThird,
    calculatePassesInBox,
    passEventToMatchEvent,
    shotEventToMatchEvent,
    duelToMatchEvent,
    groupByPlayerAndMatch,
} from '@/utils/statsCalculations';

// ============================================
// SUPABASE DATA FETCHING
// ============================================

/**
 * Fetch all players from Supabase
 */
export async function fetchPlayersFromDB(): Promise<DbPlayer[] | null> {
    if (!isSupabaseConfigured() || !supabase) return null;

    const { data, error } = await supabase
        .from('players')
        .select('*')
        .order('jersey_number');

    if (error) {
        console.error('Error fetching players:', error);
        return null;
    }

    return data;
}

/**
 * Fetch all teams from Supabase
 */
export async function fetchTeamsFromDB(): Promise<DbTeam[] | null> {
    if (!isSupabaseConfigured() || !supabase) return null;

    const { data, error } = await supabase
        .from('teams')
        .select('*');

    if (error) {
        console.error('Error fetching teams:', error);
        return null;
    }

    return data;
}

/**
 * Fetch all matches from Supabase
 */
export async function fetchMatchesFromDB(): Promise<DbMatch[] | null> {
    if (!isSupabaseConfigured() || !supabase) return null;

    const { data, error } = await supabase
        .from('matches')
        .select('*')
        .order('match_date', { ascending: false });

    if (error) {
        console.error('Error fetching matches:', error);
        return null;
    }

    return data;
}

/**
 * Fetch match statistics from Supabase
 */
export async function fetchMatchStatisticsFromDB(): Promise<DbMatchStatisticsSummary[] | null> {
    if (!isSupabaseConfigured() || !supabase) return null;

    const { data, error } = await supabase
        .from('match_statistics_summary')
        .select('*');

    if (error) {
        console.error('Error fetching match statistics:', error);
        return null;
    }

    return data;
}

/**
 * Fetch pass events from Supabase
 */
export async function fetchPassEventsFromDB(matchId?: string, playerId?: string): Promise<DbPassEvent[] | null> {
    if (!isSupabaseConfigured() || !supabase) return null;

    let query = supabase.from('pass_events').select('*');

    if (matchId) query = query.eq('match_id', matchId);
    if (playerId) query = query.eq('player_id', playerId);

    const { data, error } = await query.order('minute').order('second');

    if (error) {
        console.error('Error fetching pass events:', error);
        return null;
    }

    return data;
}

/**
 * Fetch shots from Supabase
 */
export async function fetchShotsFromDB(matchId?: string, playerId?: string): Promise<DbShotOnTarget[] | null> {
    if (!isSupabaseConfigured() || !supabase) return null;

    let query = supabase.from('shots_on_target').select('*');

    if (matchId) query = query.eq('match_id', matchId);
    if (playerId) query = query.eq('player_id', playerId);

    const { data, error } = await query.order('minute').order('second');

    if (error) {
        console.error('Error fetching shots:', error);
        return null;
    }

    return data;
}

/**
 * Fetch duels from Supabase
 */
export async function fetchDuelsFromDB(matchId?: string, playerId?: string): Promise<DbDuel[] | null> {
    if (!isSupabaseConfigured() || !supabase) return null;

    let query = supabase.from('duels').select('*');

    if (matchId) query = query.eq('match_id', matchId);
    if (playerId) query = query.eq('player_id', playerId);

    const { data, error } = await query.order('minute').order('second');

    if (error) {
        console.error('Error fetching duels:', error);
        return null;
    }

    return data;
}

/**
 * Fetch player attributes from Supabase
 */
export async function fetchPlayerAttributesFromDB(): Promise<DbPlayerAttributes[] | null> {
    if (!isSupabaseConfigured() || !supabase) return null;

    const { data, error } = await supabase
        .from('player_attributes')
        .select('*');

    if (error) {
        console.error('Error fetching player attributes:', error);
        return null;
    }

    return data;
}

// ============================================
// DATA TRANSFORMATION
// ============================================

/**
 * Convert DB player position to frontend position string
 */
function dbPositionToFrontend(position: string | null): string {
    const positionMap: Record<string, string> = {
        'GK': 'Goalkeeper',
        'CB': 'Defender',
        'RB': 'Defender',
        'LB': 'Defender',
        'RWB': 'Defender',
        'LWB': 'Defender',
        'CM': 'Midfielder',
        'CDM': 'Midfielder',
        'CAM': 'Midfielder',
        'RW': 'Winger',
        'LW': 'Winger',
        'ST': 'Forward',
        'CF': 'Forward',
    };
    return position ? (positionMap[position] || position) : 'Unknown';
}

/**
 * Build match events from database events
 */
function buildMatchEvents(
    passEvents: DbPassEvent[],
    shots: DbShotOnTarget[],
    duels: DbDuel[]
): MatchEvent[] {
    const events: MatchEvent[] = [];

    passEvents.forEach(p => events.push(passEventToMatchEvent(p)));
    shots.forEach(s => events.push(shotEventToMatchEvent(s)));
    duels.forEach(d => events.push(duelToMatchEvent(d)));

    // Sort by minute
    events.sort((a, b) => a.minute - b.minute);

    return events;
}

/**
 * Build MatchStats from database events
 * Returns null for stats not available in database
 */
function buildMatchStats(
    passEvents: DbPassEvent[],
    shots: DbShotOnTarget[],
    duels: DbDuel[]
): MatchStats {
    const passStats = calculatePassStats(passEvents);
    const shotStats = calculateShotStats(shots);
    const duelStats = calculateDuelStats(duels);

    return {
        // Calculated from DB
        goals: shotStats.goals,
        assists: passStats.assists,
        passes: passStats.totalPasses,
        passAccuracy: passStats.passAccuracy,
        keyPasses: passStats.keyPasses,
        passesInFinalThird: calculatePassesInFinalThird(passEvents),
        passesInBox: calculatePassesInBox(passEvents),
        crosses: passStats.crosses,
        progressivePassing: passStats.progressivePasses,
        shots: shotStats.totalShots,
        shotsOnTarget: shotStats.shotsOnTarget,
        dribbles: duelStats.dribblesAttempted,
        dribblesSuccessful: duelStats.dribblesSuccessful,
        aerialDuelsWon: duelStats.aerialDuelsWon,
        ballTouches: passStats.totalPasses + duelStats.dribblesAttempted + shotStats.totalShots,

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

// ============================================
// DATA FETCHING
// ============================================

export interface HybridPlayerData {
    source: 'database';
    player: Player;
}

/**
 * Get all players with their stats from Supabase
 * Returns empty array if database is not available
 */
/**
 * Fetch player match statistics from Supabase
 */
export async function fetchPlayerMatchStatisticsFromDB(): Promise<DbPlayerMatchStatistics[] | null> {
    if (!isSupabaseConfigured() || !supabase) return null;

    const { data, error } = await supabase
        .from('player_match_statistics')
        .select('*');

    if (error) {
        console.error('Error fetching player match statistics:', error);
        return null;
    }

    return data;
}

/**
 * Get all players with their stats from Supabase
 * Returns empty array if database is not available
 */
export async function getPlayersWithStats(): Promise<Player[]> {
    // Check if Supabase is configured
    if (!isSupabaseConfigured()) {
        console.log('Supabase not configured, returning empty array');
        return [];
    }

    try {
        // Fetch all data from Supabase - Optimized to use views
        const [dbPlayers, playerMatchStats, matches, teams, playerAttributes] = await Promise.all([
            fetchPlayersFromDB(),
            fetchPlayerMatchStatisticsFromDB(),
            fetchMatchesFromDB(),
            fetchTeamsFromDB(),
            fetchPlayerAttributesFromDB(),
        ]);

        // If DB fetch failed, return empty array
        if (!dbPlayers || dbPlayers.length === 0) {
            console.log('No players in database');
            return [];
        }

        // Create a map of matches for quick lookup
        const matchMap = new Map<string, DbMatch>();
        matches?.forEach(m => matchMap.set(m.id, m));

        // Create a map of teams for quick lookup
        const teamMap = new Map<string, DbTeam>();
        teams?.forEach(t => teamMap.set(t.id, t));

        // Create a map of player attributes for quick lookup
        const attributesMap = new Map<string, DbPlayerAttributes>();
        playerAttributes?.forEach(attr => attributesMap.set(attr.player_id, attr));

        // Group stats by player
        const statsByPlayer = new Map<string, DbPlayerMatchStatistics[]>();
        playerMatchStats?.forEach(stat => {
            const current = statsByPlayer.get(stat.player_id) || [];
            current.push(stat);
            statsByPlayer.set(stat.player_id, current);
        });

        // Build player data
        const players: Player[] = dbPlayers.map(dbPlayer => {
            const playerStats = statsByPlayer.get(dbPlayer.id) || [];
            const attributes = attributesMap.get(dbPlayer.id);

            // Build match stats for each match
            const matchStats: PlayerMatch[] = playerStats.map(stat => {
                const match = matchMap.get(stat.match_id);

                // Compute opponent name from team relationships
                let opponentName = 'Unknown';
                if (match) {
                    // Opponent is the team that is NOT our_team_id
                    const opponentTeamId = match.our_team_id === match.home_team_id
                        ? match.away_team_id
                        : match.home_team_id;
                    opponentName = teamMap.get(opponentTeamId)?.team_name || 'Unknown';
                }

                return {
                    matchId: stat.match_id,
                    opponent: opponentName,
                    date: match?.match_date || new Date().toISOString().split('T')[0],
                    minutesPlayed: 90, // TODO: Fetch from physical_stats table when available
                    stats: {
                        goals: stat.goals || 0,
                        assists: stat.assists || 0,
                        passes: stat.total_passes || 0,
                        passAccuracy: calculatePassCompletionRate(stat.successful_passes || 0, stat.total_passes || 0),
                        keyPasses: stat.key_passes || 0,
                        passesInFinalThird: stat.final_third_touches || 0, // Using touches as proxy for now
                        passesInBox: 0, // Not directly in view yet, would need update
                        crosses: stat.crosses || 0,
                        progressivePassing: stat.progressive_passes || 0,
                        shots: (stat.shots_on_target || 0) + (stat.shots_off_target || 0),
                        shotsOnTarget: stat.shots_on_target || 0,
                        dribbles: stat.total_dribbles || 0,
                        dribblesSuccessful: stat.successful_dribbles || 0,
                        aerialDuelsWon: stat.aerial_duels_won || 0,
                        ballTouches: (stat.total_passes || 0) + (stat.total_dribbles || 0), // Approx

                        blocks: stat.blocks,
                        interceptions: stat.interceptions,
                        clearances: stat.clearances,
                        recoveries: stat.ball_recoveries,
                        tackles: null, // Not in view
                        progressiveRuns: stat.progressive_carries,
                        distanceCovered: stat.distance_covered_meters,
                        sprints: stat.sprint_count,
                    },
                    events: [], // detailed events loaded on demand if needed
                };
            });

            return {
                id: dbPlayer.id,
                name: `${dbPlayer.first_name}${dbPlayer.last_name ? ' ' + dbPlayer.last_name : ''}`,
                jerseyNumber: dbPlayer.jersey_number || 0,
                position: dbPositionToFrontend(dbPlayer.position),
                team: teamMap.get(dbPlayer.team_id)?.team_name || 'Unknown Team',
                teamId: dbPlayer.team_id,
                overallRating: attributes?.overall_rating || null,
                attributes: {
                    passing: attributes?.passing || null,
                    shooting: attributes?.shooting || null,
                    dribbling: attributes?.dribbling || null,
                    defending: attributes?.defending || null,
                    physical: attributes?.physical || null,
                },
                matchStats,
            };
        });

        return players;

    } catch (error) {
        console.error('Error fetching player data:', error);
        return [];
    }
}

function calculatePassCompletionRate(successful: number, total: number): number {
    if (total === 0) return 0;
    return Math.round((successful / total) * 100);
}

/**
 * Get a single player by ID with stats
 */
export async function getPlayerById(playerId: string): Promise<Player | null> {
    const players = await getPlayersWithStats();
    return players.find(p => p.id === playerId) || null;
}

/**
 * Check data source status
 */
export function getDataSourceStatus(): {
    supabaseConfigured: boolean;
} {
    return {
        supabaseConfigured: isSupabaseConfigured(),
    };
}
