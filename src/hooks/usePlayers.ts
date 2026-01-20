
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Player, PlayerMatch, MatchEvent } from "@/types/player";

// Database Interfaces
interface DbPlayer {
    id: string;
    team_id: string;
    first_name: string;
    last_name: string;
    jersey_number: number;
    position: string;
}

interface DbTeam {
    id: string;
    team_name: string;
}

interface DbMatch {
    id: string;
    match_date: string;
    away_team_id: string;
    away_team: { team_name: string }[] | { team_name: string } | null;
}

interface DbPassEvent {
    match_id: string;
    player_id: string;
    is_assist: boolean;
    is_successful: boolean;
    is_key_pass: boolean;
    is_cross: boolean;
    is_progressive_pass: boolean;
    start_x: number;
    start_y: number;
    end_x: number;
    end_y: number;
    minute: number;
}

interface DbShotEvent {
    match_id: string;
    player_id: string;
    is_goal: boolean;
    shot_x: number;
    shot_y: number;
    minute: number;
}

interface DbDuelEvent {
    match_id: string;
    player_id: string;
    duel_type: string;
    is_successful: boolean;
}

export const usePlayers = () => {
    return useQuery({
        queryKey: ['players-full-data'],
        queryFn: async () => {
            // 1. Fetch Players
            const { data: dbPlayers, error: playersError } = await supabase
                .from('players')
                .select('*');
            if (playersError) throw playersError;

            // 1.5 Fetch Teams
            const { data: dbTeams, error: teamsError } = await supabase
                .from('teams')
                .select('id, team_name');
            if (teamsError) throw teamsError;

            // Create team lookup map
            const teamMap = new Map<string, DbTeam>();
            (dbTeams as DbTeam[])?.forEach(t => teamMap.set(t.id, t));

            // 2. Fetch Matches (to get dates and opponents)
            const { data: dbMatches, error: matchesError } = await supabase
                .from('matches')
                .select('id, match_date, away_team_id, away_team:away_team_id(team_name)')
                .order('match_date', { ascending: false });
            if (matchesError) throw matchesError;

            // 3. Fetch Events
            // Fetching all for now since dataset is small. In prod, would fetch per player or match.
            const { data: passEvents, error: passError } = await supabase
                .from('pass_events')
                .select('*');
            if (passError) throw passError;

            const { data: shotEvents, error: shotError } = await supabase
                .from('shots_on_target')
                .select('*');
            if (shotError) throw shotError;

            const { data: duelEvents, error: duelError } = await supabase
                .from('duels')
                .select('*');
            if (duelError) throw duelError;

            const { data: keeperEvents, error: keeperError } = await supabase
                .from('keeper_actions')
                .select('*');
            // Not throwing on keeper (optional or might be empty)

            // 4. Transform and Combine
            const players: Player[] = (dbPlayers as DbPlayer[]).map(dbPlayer => {
                const fullName = `${dbPlayer.first_name} ${dbPlayer.last_name}`;

                // Player attributes not available in database - set to null
                // TODO: Fetch from player_attributes table when available
                const attributes = {
                    passing: null,
                    shooting: null,
                    dribbling: null,
                    defending: null,
                    physical: null
                };
                const overallRating = null;

                // Build Match Stats
                // Get all match IDs this player participated in (based on events)
                // We'll iterate through all known matches and see if player has events
                const playerMatches: PlayerMatch[] = (dbMatches as any[]).map((match: DbMatch) => {
                    const matchId = match.id;
                    const pPasses = (passEvents as DbPassEvent[])?.filter(e => e.player_id === dbPlayer.id && e.match_id === matchId) || [];
                    const pShots = (shotEvents as DbShotEvent[])?.filter(e => e.player_id === dbPlayer.id && e.match_id === matchId) || [];
                    const pDuels = (duelEvents as DbDuelEvent[])?.filter(e => e.player_id === dbPlayer.id && e.match_id === matchId) || [];

                    // If no activity, assume didn't play (or filter out empty later? JSON includes all matches usually)
                    // If 0 events, return null/skip? 
                    // Let's include if they have at least one event.
                    if (pPasses.length === 0 && pShots.length === 0 && pDuels.length === 0) return null;

                    // Calculate Stats
                    const goals = pShots.filter(s => s.is_goal).length;
                    const assists = pPasses.filter(p => p.is_assist).length;
                    const passes = pPasses.length; // Attempted
                    const successfulPasses = pPasses.filter(p => p.is_successful).length;
                    const passAccuracy = passes > 0 ? Math.round((successfulPasses / passes) * 100) : 0;

                    const shots = pShots.length; // On target mostly, since `shots_on_target` table
                    const shotsOnTarget = pShots.length; // Table name implies. (Though schema might allow misses?)

                    const interceptions = 0; // Not explicitly in events, maybe duels type?
                    // Duels has duel_type.
                    const aerialDuelsWon = pDuels.filter(d => d.duel_type === 'aerial' && d.is_successful).length;
                    const dribbles = pDuels.filter(d => d.duel_type === 'dribble').length;
                    const dribblesSuccessful = pDuels.filter(d => d.duel_type === 'dribble' && d.is_successful).length;

                    // Events specific list (subset)
                    const events: MatchEvent[] = [];
                    // Add some shots and assists to events list
                    pShots.forEach(s => {
                        events.push({
                            type: 'shot',
                            minute: s.minute,
                            success: s.is_goal,
                            x: s.shot_x,
                            y: s.shot_y,
                            targetX: 100, // Goal center approx
                            targetY: 50
                        });
                    });
                    pPasses.forEach(p => {
                        events.push({
                            type: 'pass',
                            minute: p.minute,
                            success: p.is_successful,
                            x: p.start_x,
                            y: p.start_y,
                            targetX: p.end_x,
                            targetY: p.end_y
                        });
                    });

                    // Note: JSON "MatchStats" structure has `stats` object
                    const awayTeamName = Array.isArray(match.away_team)
                        ? match.away_team[0]?.team_name
                        : (match.away_team as any)?.team_name;

                    return {
                        matchId: match.id,
                        opponent: awayTeamName || 'Opponent',
                        date: match.match_date,
                        minutesPlayed: 90, // Default to 90 if events exist
                        stats: {
                            goals,
                            assists,
                            passes,
                            passAccuracy,
                            shots,
                            shotsOnTarget,
                            dribbles,
                            dribblesSuccessful,
                            aerialDuelsWon,
                            // Available from pass_events
                            keyPasses: pPasses.filter(p => p.is_key_pass).length,
                            crosses: pPasses.filter(p => p.is_cross).length,
                            progressivePassing: pPasses.filter(p => p.is_progressive_pass).length,
                            ballTouches: passes + dribbles + shots,
                            // Not available in database - use null
                            passesInFinalThird: null,
                            passesInBox: null,
                            blocks: null,
                            interceptions: null,
                            clearances: null,
                            recoveries: null,
                            tackles: null,
                            progressiveRuns: null,
                            distanceCovered: null,
                            sprints: null
                        },
                        events
                    };
                }).filter((m): m is PlayerMatch => m !== null);

                return {
                    id: dbPlayer.id,
                    name: fullName,
                    jerseyNumber: dbPlayer.jersey_number,
                    position: dbPlayer.position,
                    team: teamMap.get(dbPlayer.team_id)?.team_name || 'Unknown Team',
                    overallRating,
                    attributes,
                    matchStats: playerMatches
                };
            });

            return players;
        }
    });
};
