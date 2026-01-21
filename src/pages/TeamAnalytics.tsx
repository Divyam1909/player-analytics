import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import AuthHeader from "@/components/layout/AuthHeader";
import Sidebar from "@/components/layout/Sidebar";
import { Player, MatchEvent } from "@/types/player";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import LineChart from "@/components/charts/LineChart";
import HexagonRadar from "@/components/charts/HexagonRadar";
import {
    Users,
    Target,
    Footprints,
    TrendingUp,
    Shield,
    Trophy,
    Flame,
    ArrowRight,
    Play,
    Pause,
    SkipForward,
    RotateCcw,
    CalendarDays,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { usePlayers } from "@/hooks/usePlayers";
import { useCountUp } from "@/hooks/useCountUp";

// Animation variants
const containerVariants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.08,
        },
    },
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
};

// Helper to check if a value exists in database (not null/undefined)
const hasData = (value: number | null | undefined): value is number => {
    return value !== null && value !== undefined;
};

// Helper to sum values, returning null if all values are null (no data)
const sumWithNull = <T,>(
    items: T[],
    getter: (item: T) => number | null | undefined
): number | null => {
    const values = items.map(getter).filter(hasData);
    if (values.length === 0) return null;
    return values.reduce((a, b) => a + b, 0);
};

// Helper to average values, returning null if no data
const avgWithNull = <T,>(
    items: T[],
    getter: (item: T) => number | null | undefined
): number | null => {
    const values = items.map(getter).filter(hasData);
    if (values.length === 0) return null;
    return Math.round(values.reduce((a, b) => a + b, 0) / values.length);
};

// Animated value component for counting up numbers - handles null
const AnimatedValue = ({
    value,
    suffix = '',
    className = '',
    duration = 1500,
    delay = 0
}: {
    value: number | null;
    suffix?: string;
    className?: string;
    duration?: number;
    delay?: number;
}) => {
    const count = useCountUp({ end: value ?? 0, duration, delay });
    if (value === null) return <span className={className}>--</span>;
    return <span className={className}>{count}{suffix}</span>;
};

// Static value display - shows -- for null
const StatValue = ({ value, suffix = '' }: { value: number | null; suffix?: string }) => {
    if (value === null) return <span>--</span>;
    return <span>{value}{suffix}</span>;
};

// Animated percentage bar component - handles null
const AnimatedBar = ({
    value,
    maxValue = 100,
    color = 'bg-primary',
    delay = 0,
}: {
    value: number | null;
    maxValue?: number;
    color?: string;
    delay?: number;
}) => {
    if (value === null) return null;
    const percentage = Math.min((value / maxValue) * 100, 100);
    return (
        <motion.div
            className={cn("h-full rounded-full", color)}
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 1.2, delay, ease: "easeOut" }}
        />
    );
};

// Position colors for pie chart and players
const POSITION_COLORS: Record<string, string> = {
    Forward: "hsl(var(--destructive))",
    Midfielder: "hsl(var(--primary))",
    Defender: "hsl(var(--success))",
    Goalkeeper: "hsl(var(--warning))",
    Winger: "hsl(var(--chart-4))",
};

// Generate dynamic positions for any number of players
const generatePositions = (players: Player[]) => {
    // Group players by position type
    const groups: Record<string, Player[]> = {};
    players.forEach((p) => {
        const pos = p.position;
        if (!groups[pos]) groups[pos] = [];
        groups[pos].push(p);
    });

    // Position zones (y coordinate ranges for half-field, viewBox height is 60)
    // Goal is at top (y=0), so goalkeeper is closest to goal, forwards are furthest
    // Leave padding at bottom for player labels
    const zones: Record<string, { y: number; order: number }> = {
        Goalkeeper: { y: 8, order: 1 },
        Defender: { y: 18, order: 2 },
        Midfielder: { y: 28, order: 3 },
        Winger: { y: 38, order: 4 },
        Forward: { y: 48, order: 5 },
    };

    const result: { player: Player; position: { x: number; y: number }; color: string }[] = [];

    // For each position type, distribute players horizontally
    Object.entries(groups).forEach(([position, posPlayers]) => {
        const zone = zones[position] || { y: 50, order: 3 };
        const count = posPlayers.length;

        posPlayers.forEach((player, i) => {
            // Distribute evenly across the width (10% to 90%)
            const x = count === 1 ? 50 : 15 + (70 * i) / (count - 1);
            // Add slight y variation for visual interest
            const yOffset = count > 2 ? (i % 2 === 0 ? -3 : 3) : 0;

            result.push({
                player,
                position: { x, y: zone.y + yOffset },
                color: POSITION_COLORS[position] || "hsl(var(--primary))",
            });
        });
    });

    return result;
};

// Get all goal events from all matches
interface GoalMoment {
    matchId: string;
    opponent: string;
    minute: number;
    scorer: Player;
    event: MatchEvent;
}

interface TeamAnalyticsProps {
    embedded?: boolean;
    defaultMatchId?: string;
}


interface MatchListItem {
    id: string;
    opponent: string;
    date: string;
    homeTeam: string;
}

interface MatchStatistics {
    match_id: string;
    team_clearances: number;
    team_interceptions: number;
    team_successful_dribbles: number;
    home_ball_recoveries?: number;
    away_ball_recoveries?: number;
    team_chances_created: number;
    team_chances_final_third: number;
    team_aerial_duels_won: number;
    team_shots_on_target: number;
    team_fouls: number;
    team_saves: number;
    team_freekicks: number;
    opponent_clearances: number;
    opponent_interceptions: number;
    opponent_successful_dribbles: number;
    opponent_chances_created: number;
    opponent_chances_final_third: number;
    opponent_aerial_duels_won: number;
    opponent_fouls: number;
    opponent_saves: number;
    opponent_freekicks: number;
    opponent_conversion_rate: number;

    // Indices
    home_possession_control_index?: number;
    home_chance_creation_index?: number;
    home_shooting_efficiency?: number;
    home_defensive_solidity?: number;
    home_transition_progression?: number;
    home_recovery_pressing_efficiency?: number;

    away_possession_control_index?: number;
    away_chance_creation_index?: number;
    away_shooting_efficiency?: number;
    away_defensive_solidity?: number;
    away_transition_progression?: number;
    away_recovery_pressing_efficiency?: number;
}

// ... imports moved to top

const TeamAnalytics = ({ embedded = false, defaultMatchId }: TeamAnalyticsProps) => {
    // const players = playersData.players as Player[]; // Remove
    const { data: players = [], isLoading: isPlayersLoading } = usePlayers(); // Use hook
    const [selectedMatch, setSelectedMatch] = useState<string>(defaultMatchId || "all");
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentGoalIndex, setCurrentGoalIndex] = useState(0);

    // Fetch matches from Supabase
    const { data: dbMatches = [] } = useQuery({
        queryKey: ['matches-list'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('matches')
                .select('id, competition_name, match_date, home_team:home_team_id(team_name), away_team:away_team_id(team_name)')
                .order('match_date', { ascending: false });

            if (error) throw error;
            return ((data as any[]) || []).map(m => ({
                id: m.id,
                opponent: (m.away_team as any)?.team_name || 'Opponent',
                date: m.match_date,
                homeTeam: (m.home_team as any)?.team_name || 'Team'
            })) as MatchListItem[];
        }
    });

    const matches = useMemo(() => {
        return dbMatches;
    }, [dbMatches]);

    // Fetch match statistics
    const { data: matchStatsList = [] } = useQuery({
        queryKey: ['match-statistics', selectedMatch],
        queryFn: async () => {
            let query = supabase.from('match_statistics_summary').select('*');
            if (selectedMatch !== "all") {
                query = query.eq('match_id', selectedMatch);
            }
            const { data, error } = await query;
            if (error) throw error;

            // Map view columns to UI expected columns
            return (data || []).map((m: any) => {
                const isHome = m.team_id === m.home_team_id;

                return {
                    match_id: m.match_id,

                    // Generic Team Stats
                    team_clearances: isHome ? m.home_clearances : m.away_clearances,
                    team_interceptions: isHome ? m.home_interceptions : m.away_interceptions,
                    team_successful_dribbles: isHome ? m.home_successful_dribbles : m.away_successful_dribbles,
                    home_ball_recoveries: m.home_ball_recoveries, // Keep original for some logic
                    away_ball_recoveries: m.away_ball_recoveries,
                    team_chances_created: isHome ? m.home_chances_in_box : m.away_chances_in_box, // Mapping to chances in box
                    team_chances_final_third: isHome ? m.home_final_third_entries : m.away_final_third_entries,
                    team_aerial_duels_won: isHome ? m.home_aerial_duels_won : m.away_aerial_duels_won,
                    team_shots_on_target: isHome ? m.home_shots_on_target : m.away_shots_on_target,
                    team_fouls: isHome ? m.home_fouls_committed : m.away_fouls_committed,
                    team_saves: isHome ? m.home_saves : m.away_saves,
                    team_freekicks: isHome ? m.home_freekicks : m.away_freekicks,

                    // Generic Opponent Stats
                    opponent_clearances: isHome ? m.away_clearances : m.home_clearances,
                    opponent_interceptions: isHome ? m.away_interceptions : m.home_interceptions,
                    opponent_successful_dribbles: isHome ? m.away_successful_dribbles : m.home_successful_dribbles,
                    opponent_chances_created: isHome ? m.away_chances_in_box : m.home_chances_in_box,
                    opponent_chances_final_third: isHome ? m.away_final_third_entries : m.home_final_third_entries,
                    opponent_aerial_duels_won: isHome ? m.away_aerial_duels_won : m.home_aerial_duels_won,
                    opponent_fouls: isHome ? m.away_fouls_committed : m.home_fouls_committed,
                    opponent_saves: isHome ? m.away_saves : m.home_saves,
                    opponent_freekicks: isHome ? m.away_freekicks : m.home_freekicks,
                    opponent_conversion_rate: null, // Calc if needed

                    // Indices (Assuming they are already in the view or null)
                    home_possession_control_index: m.home_possession_control_index,
                    // ... other indices map directly
                } as unknown as MatchStatistics;
            });
        }
    });

    // Aggregate team stats
    const teamStats = useMemo(() => {
        // Guard against empty players array
        if (players.length === 0) {
            return { totalGoals: 0, totalAssists: 0, avgRating: 0, totalMatches: 0, playerCount: 0 };
        }

        // Filter players who participated in the selected match
        const activePlayers = selectedMatch === "all"
            ? players
            : players.filter(p => p.matchStats.some(m => m.matchId === selectedMatch));

        const relevantStats = activePlayers.flatMap(p =>
            p.matchStats.filter(m => selectedMatch === "all" || m.matchId === selectedMatch)
        );

        const totalGoals = relevantStats.reduce((a, m) => a + m.stats.goals, 0);
        const totalAssists = relevantStats.reduce((a, m) => a + m.stats.assists, 0);

        // Average rating from active players only
        const avgRating = activePlayers.length > 0
            ? Math.round(activePlayers.reduce((acc, p) => acc + p.overallRating, 0) / activePlayers.length)
            : 0;

        const totalMatches = selectedMatch === "all"
            ? Math.max(...players.map((p) => p.matchStats.length), 0)
            : 1;

        return { totalGoals, totalAssists, avgRating, totalMatches, playerCount: activePlayers.length };
    }, [players, selectedMatch]);

    // Position distribution for pie chart
    const positionData = useMemo(() => {
        const counts: Record<string, number> = {};
        players.forEach((p) => {
            counts[p.position] = (counts[p.position] || 0) + 1;
        });
        return Object.entries(counts).map(([name, value]) => ({ name, value }));
    }, [players]);

    // Top performers - filter by selected match
    const topPerformers = useMemo(() => {
        // Guard against empty array - reduce without initial value throws on empty arrays
        if (players.length === 0) {
            return { topScorer: null, topAssister: null, topRated: null };
        }

        // Filter players who participated in the selected match
        const activePlayers = selectedMatch === "all"
            ? players
            : players.filter(p => p.matchStats.some(m => m.matchId === selectedMatch));

        if (activePlayers.length === 0) {
            return { topScorer: null, topAssister: null, topRated: null };
        }

        // Helper to get goals for a player (filtered by match if applicable)
        const getPlayerGoals = (player: Player) => {
            if (selectedMatch === "all") {
                return player.matchStats.reduce((a, m) => a + m.stats.goals, 0);
            }
            const matchStat = player.matchStats.find(m => m.matchId === selectedMatch);
            return matchStat ? matchStat.stats.goals : 0;
        };

        // Helper to get assists for a player (filtered by match if applicable)
        const getPlayerAssists = (player: Player) => {
            if (selectedMatch === "all") {
                return player.matchStats.reduce((a, m) => a + m.stats.assists, 0);
            }
            const matchStat = player.matchStats.find(m => m.matchId === selectedMatch);
            return matchStat ? matchStat.stats.assists : 0;
        };

        const topScorer = activePlayers.reduce((prev, curr) => {
            const prevGoals = getPlayerGoals(prev);
            const currGoals = getPlayerGoals(curr);
            return currGoals > prevGoals ? curr : prev;
        });
        const topAssister = activePlayers.reduce((prev, curr) => {
            const prevAssists = getPlayerAssists(prev);
            const currAssists = getPlayerAssists(curr);
            return currAssists > prevAssists ? curr : prev;
        });
        const topRated = activePlayers.reduce((prev, curr) =>
            curr.overallRating > prev.overallRating ? curr : prev
        );

        return { topScorer, topAssister, topRated };
    }, [players, selectedMatch]);

    // Team trend data
    const teamTrendData = useMemo(() => {
        const matchMap = new Map<string, { goals: number; assists: number }>();

        players.forEach((player) => {
            player.matchStats.forEach((match) => {
                const key = match.opponent;
                const existing = matchMap.get(key) || { goals: 0, assists: 0 };
                matchMap.set(key, {
                    goals: existing.goals + match.stats.goals,
                    assists: existing.assists + match.stats.assists,
                });
            });
        });

        return Array.from(matchMap.entries()).map(([opponent, stats]) => ({
            name: `vs ${opponent.split(" ")[0]}`,
            Goals: stats.goals,
            Assists: stats.assists,
        }));
    }, [players]);

    // Generate dynamic formation positions
    const formationPlayers = useMemo(() => {
        const activePlayers = selectedMatch === "all"
            ? players
            : players.filter(p => p.matchStats.some(m => m.matchId === selectedMatch));
        return generatePositions(activePlayers);
    }, [players, selectedMatch]);

    // Get all goal moments (shots that were successful)
    const goalMoments = useMemo(() => {
        const goals: GoalMoment[] = [];

        players.forEach((player) => {
            player.matchStats.forEach((match) => {
                // Filter shots that were successful (goals)
                const goalEvents = match.events.filter((e) => e.type === "shot" && e.success);
                goalEvents.forEach((event) => {
                    goals.push({
                        matchId: match.matchId,
                        opponent: match.opponent,
                        minute: event.minute,
                        scorer: player,
                        event,
                    });
                });
            });
        });

        // Sort by match and minute
        return goals.sort((a, b) => {
            if (a.matchId !== b.matchId) return a.matchId.localeCompare(b.matchId);
            return a.minute - b.minute;
        });
    }, [players]);

    // Filter goal moments by selected match
    const filteredGoals = useMemo(() => {
        if (selectedMatch === "all") return goalMoments;
        return goalMoments.filter((g) => g.matchId === selectedMatch);
    }, [goalMoments, selectedMatch]);

    const currentGoal = filteredGoals[currentGoalIndex];

    // Playback controls
    const handleNextGoal = () => {
        setCurrentGoalIndex((prev) => (prev + 1) % filteredGoals.length);
    };

    const handleReset = () => {
        setCurrentGoalIndex(0);
        setIsPlaying(false);
    };

    // Reset index when match changes
    useEffect(() => {
        setCurrentGoalIndex(0);
        setIsPlaying(false);
    }, [selectedMatch]);

    // Auto-play effect
    useEffect(() => {
        if (isPlaying && filteredGoals.length > 0) {
            const interval = setInterval(() => {
                setCurrentGoalIndex((prev) => {
                    const next = prev + 1;
                    if (next >= filteredGoals.length) {
                        setIsPlaying(false);
                        return 0;
                    }
                    return next;
                });
            }, 2000);
            return () => clearInterval(interval);
        }
    }, [isPlaying, filteredGoals.length]);

    const statCards = [
        { label: selectedMatch === "all" ? "Total Players" : "Match Players", value: teamStats.playerCount, icon: Users, color: "text-primary" },
        { label: "Total Goals", value: teamStats.totalGoals, icon: Target, color: "text-destructive" },
        { label: "Total Assists", value: teamStats.totalAssists, icon: Footprints, color: "text-warning" },
        { label: "Avg Rating", value: teamStats.avgRating, icon: TrendingUp, color: "text-success" },
    ];

    return (
        <div className={embedded ? "bg-background" : "min-h-screen bg-background"}>
            {!embedded && <AuthHeader title="Team Analytics" />}
            {!embedded && <Sidebar />}

            <main className={embedded ? "pb-12 px-6" : "pt-24 pb-12 px-6 ml-64"}>
                <div className="container mx-auto">
                    {/* Page Header */}
                    <motion.div
                        className="mb-8"
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                    >
                        <h1 className="text-3xl font-bold text-foreground mb-2">
                            Team <span className="text-primary">Analytics</span>
                        </h1>
                        <p className="text-muted-foreground">
                            Comprehensive overview of your team's collective performance
                        </p>
                    </motion.div>

                    {/* Match Selector */}
                    <motion.div
                        className="mb-8"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                    >
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
                            {/* All Matches Option */}
                            <motion.div
                                onClick={() => setSelectedMatch("all")}
                                className={cn(
                                    "relative p-3 rounded-lg border cursor-pointer transition-all duration-200",
                                    selectedMatch === "all"
                                        ? "bg-primary/10 border-primary shadow-md"
                                        : "bg-secondary/50 border-border hover:border-primary/50 hover:bg-secondary"
                                )}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <div className="flex justify-between items-start mb-1">
                                    <span className="text-sm font-bold">All Matches</span>
                                    {selectedMatch === "all" && (
                                        <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                                    )}
                                </div>
                                <div className="flex items-center gap-1.5 mt-2">
                                    <CalendarDays className="w-3.5 h-3.5 text-muted-foreground" />
                                    <span className="text-xs text-muted-foreground">Season Overview</span>
                                </div>
                            </motion.div>

                            {/* Individual Matches */}
                            {matches.map((match) => (
                                <motion.div
                                    key={match.id}
                                    onClick={() => setSelectedMatch(match.id)}
                                    className={cn(
                                        "relative p-3 rounded-lg border cursor-pointer transition-all duration-200",
                                        selectedMatch === match.id
                                            ? "bg-primary/10 border-primary shadow-md"
                                            : "bg-secondary/50 border-border hover:border-primary/50 hover:bg-secondary"
                                    )}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    <div className="flex justify-between items-start mb-1">
                                        <span className="text-sm font-bold truncate pr-2">vs {match.opponent}</span>
                                        {selectedMatch === match.id && (
                                            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                                        )}
                                    </div>
                                    <div className="flex items-center gap-1.5 mt-2">
                                        <CalendarDays className="w-3.5 h-3.5 text-muted-foreground" />
                                        <span className="text-xs text-muted-foreground">
                                            {new Date(match.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                        </span>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Stat Cards */}
                    <motion.div
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
                        variants={containerVariants}
                        initial="hidden"
                        animate="show"
                    >
                        {statCards.map((stat, index) => (
                            <motion.div
                                key={stat.label}
                                variants={itemVariants}
                                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                                className="relative overflow-hidden rounded-xl glass card-glow p-5 group hover:border-primary/40 transition-all duration-300"
                            >
                                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-primary/15 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity" />
                                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-50" />
                                <div className="relative flex items-start justify-between">
                                    <div>
                                        <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
                                            {stat.label}
                                        </p>
                                        <p className={`text-3xl font-bold ${stat.color}`}>
                                            <AnimatedValue value={stat.value} delay={index * 100} />
                                        </p>
                                    </div>
                                    <motion.div
                                        className={`p-3 rounded-xl glass-subtle ${stat.color}`}
                                        whileHover={{ rotate: 10, scale: 1.1 }}
                                    >
                                        <stat.icon className="w-6 h-6" />
                                    </motion.div>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>

                    {/* Advanced Statistics Section - REORDERED */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.15 }}
                        className="mb-8"
                    >
                        <Card className="glass-strong rounded-xl">
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <svg className="w-5 h-5 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M12 2L2 7l10 5 10-5-10-5z" />
                                        <path d="M2 17l10 5 10-5" />
                                        <path d="M2 12l10 5 10-5" />
                                    </svg>
                                    Advanced Statistics
                                </CardTitle>
                                <p className="text-sm text-muted-foreground">Detailed match performance metrics</p>
                            </CardHeader>
                            <CardContent>
                                {(() => {
                                    // Use fetched match statistics
                                    const relevantStats = matchStatsList;
                                    const isAggregation = selectedMatch === "all";

                                    // Team stats - Use sumWithNull to preserve null for missing data
                                    const teamClearances = sumWithNull(relevantStats, m => m.team_clearances);
                                    const teamInterceptions = sumWithNull(relevantStats, m => m.team_interceptions);
                                    const teamDribbles = sumWithNull(relevantStats, m => m.team_successful_dribbles);
                                    const teamRecoveries = sumWithNull(relevantStats, m => (m as any).home_ball_recoveries);
                                    const teamPassesInBox = sumWithNull(relevantStats, m => m.team_chances_created);
                                    const teamPassesFinalThird = sumWithNull(relevantStats, m => m.team_chances_final_third);
                                    const teamAerialDuels = sumWithNull(relevantStats, m => m.team_aerial_duels_won);
                                    const teamShotsOnTarget = sumWithNull(relevantStats, m => m.team_shots_on_target);
                                    const teamShots = teamShotsOnTarget !== null ? teamShotsOnTarget * 2 : null; // Est total shots

                                    // Opponent stats
                                    const oppClearances = sumWithNull(relevantStats, m => m.opponent_clearances);
                                    const oppInterceptions = sumWithNull(relevantStats, m => m.opponent_interceptions);
                                    const oppDribbles = sumWithNull(relevantStats, m => m.opponent_successful_dribbles);
                                    const oppRecoveries = sumWithNull(relevantStats, m => (m as any).away_ball_recoveries);
                                    const oppPassesInBox = sumWithNull(relevantStats, m => m.opponent_chances_created);
                                    const oppPassesFinalThird = sumWithNull(relevantStats, m => m.opponent_chances_final_third);
                                    const oppAerialDuels = sumWithNull(relevantStats, m => m.opponent_aerial_duels_won);

                                    const teamFouls = sumWithNull(relevantStats, m => m.team_fouls);
                                    const oppFouls = sumWithNull(relevantStats, m => m.opponent_fouls);
                                    const teamSaves = sumWithNull(relevantStats, m => m.team_saves);
                                    const oppSaves = sumWithNull(relevantStats, m => m.opponent_saves);
                                    const teamFreeKicks = sumWithNull(relevantStats, m => m.team_freekicks);
                                    const oppFreeKicks = sumWithNull(relevantStats, m => m.opponent_freekicks);

                                    const teamConversion = teamShots !== null && teamShots > 0 && teamShotsOnTarget !== null
                                        ? Math.round((teamShotsOnTarget / teamShots) * 100) : null;
                                    const oppConversion = avgWithNull(relevantStats, m => m.opponent_conversion_rate ? Number(m.opponent_conversion_rate) : null);

                                    // Match info for header
                                    const currentMatchInfo = dbMatches.find(m => m.id === selectedMatch);
                                    const teamName = currentMatchInfo?.homeTeam || "Bombay Gymkhana Men";
                                    const opponentName = selectedMatch === "all" ? "All Opponents" : currentMatchInfo?.opponent || "Opponent";

                                    const advancedStats = [
                                        {
                                            label: "Chances Created (In Box)",
                                            team: teamPassesInBox,
                                            opponent: oppPassesInBox,
                                            icon: <TrendingUp className="w-4 h-4" />
                                        },
                                        {
                                            label: "Chances Created (Final Third)",
                                            team: teamPassesFinalThird,
                                            opponent: oppPassesFinalThird,
                                            icon: <TrendingUp className="w-4 h-4" />
                                        },
                                        {
                                            label: "Clearances",
                                            team: teamClearances,
                                            opponent: oppClearances,
                                            icon: <Shield className="w-4 h-4" />
                                        },
                                        {
                                            label: "Interceptions",
                                            team: teamInterceptions,
                                            opponent: oppInterceptions,
                                            icon: <Target className="w-4 h-4" />
                                        },
                                        {
                                            label: "Successful Dribbles",
                                            team: teamDribbles,
                                            opponent: oppDribbles,
                                            icon: <Flame className="w-4 h-4" />
                                        },
                                        {
                                            label: "Ball Recoveries",
                                            team: teamRecoveries,
                                            opponent: oppRecoveries,
                                            icon: <Footprints className="w-4 h-4" />
                                        },
                                    ];

                                    const bottomStats = [
                                        { label: "AERIAL DUELS WON", team: teamAerialDuels, opponent: oppAerialDuels },
                                        { label: "FOULS", team: teamFouls, opponent: oppFouls },
                                        { label: "SAVES", team: teamSaves, opponent: oppSaves },
                                        { label: "FREE KICKS", team: teamFreeKicks, opponent: oppFreeKicks },
                                        { label: "CONVERSION RATE", team: teamConversion !== null ? `${teamConversion}%` : "--", opponent: oppConversion !== null ? `${Math.round(oppConversion)}%` : "--" },
                                    ];

                                    // Indices from DB - use avgWithNull to preserve null for missing data
                                    const pci = avgWithNull(relevantStats, m => (m as any).home_possession_control_index);
                                    const cci = avgWithNull(relevantStats, m => (m as any).home_chance_creation_index);
                                    const se = avgWithNull(relevantStats, m => (m as any).home_shooting_efficiency);
                                    const ds = avgWithNull(relevantStats, m => (m as any).home_defensive_solidity);
                                    const tp = avgWithNull(relevantStats, m => (m as any).home_transition_progression);
                                    const rpe = avgWithNull(relevantStats, m => (m as any).home_recovery_pressing_efficiency);

                                    // Opponent indices (using away_*)
                                    const oppPci = avgWithNull(relevantStats, m => (m as any).away_possession_control_index);
                                    const oppCci = avgWithNull(relevantStats, m => (m as any).away_chance_creation_index);
                                    const oppSe = avgWithNull(relevantStats, m => (m as any).away_shooting_efficiency);
                                    const oppDs = avgWithNull(relevantStats, m => (m as any).away_defensive_solidity);
                                    const oppTp = avgWithNull(relevantStats, m => (m as any).away_transition_progression);
                                    const oppRpe = avgWithNull(relevantStats, m => (m as any).away_recovery_pressing_efficiency);

                                    const hexagonData = [
                                        { label: "PCI", teamValue: pci, opponentValue: oppPci, maxValue: 100 },
                                        { label: "CCI", teamValue: cci, opponentValue: oppCci, maxValue: 100 },
                                        { label: "SE", teamValue: se, opponentValue: oppSe, maxValue: 100 },
                                        { label: "DS", teamValue: ds, opponentValue: oppDs, maxValue: 100 },
                                        { label: "T&P", teamValue: tp, opponentValue: oppTp, maxValue: 100 },
                                        { label: "RPE", teamValue: rpe, opponentValue: oppRpe, maxValue: 100 },
                                    ];

                                    const keyIndices = [
                                        { label: "Possession Control Index", short: "PCI", team: pci, opponent: oppPci, icon: <Target className="w-4 h-4" /> },
                                        { label: "Chance Creation Index", short: "CCI", team: cci, opponent: oppCci, icon: <TrendingUp className="w-4 h-4" /> },
                                        { label: "Shooting Efficiency", short: "SE", team: se, opponent: oppSe, icon: <Flame className="w-4 h-4" /> },
                                        { label: "Defensive Solidity", short: "DS", team: ds, opponent: oppDs, icon: <Shield className="w-4 h-4" /> },
                                        { label: "Transition & Progression", short: "T&P", team: tp, opponent: oppTp, icon: <Footprints className="w-4 h-4" /> },
                                        { label: "Recovery & Pressing", short: "RPE", team: rpe, opponent: oppRpe, icon: <Users className="w-4 h-4" /> },
                                    ];

                                    return (
                                        <>
                                            {/* Team Names Header */}
                                            <div className="flex items-center justify-center gap-4 mb-6">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-3 h-3 rounded-full bg-primary" />
                                                    <span className="font-medium text-foreground">{teamName}</span>
                                                </div>
                                                <span className="text-muted-foreground">vs</span>
                                                <div className="flex items-center gap-2">
                                                    <div className="w-3 h-3 rounded-full bg-muted-foreground" />
                                                    <span className="text-muted-foreground">{opponentName}</span>
                                                </div>
                                            </div>

                                            {/* Hexagon Chart + Key Performance Indices */}
                                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                                                {/* Hexagon Radar Chart */}
                                                <div className="flex flex-col items-center justify-center p-4 rounded-xl bg-gradient-to-br from-secondary/50 to-background border border-border">
                                                    <h4 className="text-sm font-semibold text-foreground mb-4">Performance Overview</h4>
                                                    <HexagonRadar
                                                        data={hexagonData}
                                                        teamName={teamName}
                                                        opponentName={opponentName}
                                                        size={320}
                                                    />
                                                </div>

                                                {/* Key Performance Indices */}
                                                <div className="grid grid-cols-2 gap-3">
                                                    {keyIndices.map((stat, index) => {
                                                        // Only compare if both values have data
                                                        const bothHaveData = stat.team !== null && stat.opponent !== null;
                                                        const teamLeading = bothHaveData && stat.team > stat.opponent;
                                                        const oppLeading = bothHaveData && stat.opponent > stat.team;
                                                        const difference = bothHaveData ? Math.abs(stat.team - stat.opponent) : 0;
                                                        const leadPercentage = bothHaveData && stat.opponent > 0
                                                            ? Math.round((difference / stat.opponent) * 100)
                                                            : difference > 0 ? 100 : 0;
                                                        const leadingTeam = bothHaveData ? (teamLeading ? teamName : (oppLeading ? opponentName : null)) : null;

                                                        return (
                                                            <motion.div
                                                                key={stat.label}
                                                                initial={{ opacity: 0, scale: 0.95 }}
                                                                animate={{ opacity: 1, scale: 1 }}
                                                                transition={{ delay: index * 0.08 }}
                                                                className="p-4 rounded-xl glass-subtle hover:border-primary/30 transition-all duration-300"
                                                            >
                                                                <div className="flex items-center gap-2 mb-3 text-primary">
                                                                    {stat.icon}
                                                                    <span className="text-xs font-semibold truncate">{stat.label}</span>
                                                                </div>
                                                                <div className="flex items-center justify-between gap-2 mb-2">
                                                                    <div className={cn(
                                                                        "text-2xl font-bold px-3 py-1.5 rounded-lg text-center flex-1",
                                                                        teamLeading
                                                                            ? "bg-primary/20 text-primary"
                                                                            : "text-foreground"
                                                                    )}>
                                                                        {stat.team !== null ? <AnimatedValue value={stat.team} delay={index * 100} suffix="%" /> : "--"}
                                                                    </div>
                                                                    <span className="text-sm font-medium text-muted-foreground">vs</span>
                                                                    <div className={cn(
                                                                        "text-2xl font-bold px-3 py-1.5 rounded-lg text-center flex-1",
                                                                        oppLeading
                                                                            ? "bg-primary/20 text-primary"
                                                                            : "text-muted-foreground"
                                                                    )}>
                                                                        {stat.opponent !== null ? <AnimatedValue value={stat.opponent} delay={index * 100 + 150} suffix="%" /> : "--"}
                                                                    </div>
                                                                </div>
                                                                {/* Animated comparison bar - only show if both values exist */}
                                                                {bothHaveData && (
                                                                    <div className="h-1.5 rounded-full bg-secondary overflow-hidden mb-2">
                                                                        <motion.div
                                                                            className="h-full bg-primary rounded-full"
                                                                            initial={{ width: 0 }}
                                                                            animate={{ width: `${(stat.team / (stat.team + stat.opponent)) * 100}%` }}
                                                                            transition={{ duration: 1.2, delay: index * 0.1, ease: "easeOut" }}
                                                                        />
                                                                    </div>
                                                                )}
                                                                {/* Leading indicator with percentage */}
                                                                {leadingTeam && (
                                                                    <div className={cn(
                                                                        "pt-2 border-t border-border/50 text-center",
                                                                    )}>
                                                                        <span className={cn(
                                                                            "text-sm font-semibold",
                                                                            teamLeading ? "text-primary" : "text-muted-foreground"
                                                                        )}>
                                                                            {teamLeading ? teamName.split(" ")[0] : opponentName.split(" ")[0]} leads by {leadPercentage}%
                                                                        </span>
                                                                    </div>
                                                                )}
                                                            </motion.div>
                                                        );
                                                    })}
                                                </div>
                                            </div>

                                            {/* Match Stats Grid */}
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
                                                {advancedStats.map((stat, index) => {
                                                    // Only compare if both values have data
                                                    const bothHaveData = stat.team !== null && stat.opponent !== null;
                                                    const teamLeading = bothHaveData && stat.team > stat.opponent;
                                                    const oppLeading = bothHaveData && stat.opponent > stat.team;
                                                    const difference = bothHaveData ? Math.abs(stat.team - stat.opponent) : null;

                                                    return (
                                                        <motion.div
                                                            key={stat.label}
                                                            initial={{ opacity: 0, y: 10 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            transition={{ delay: index * 0.05 }}
                                                            className="p-4 rounded-xl glass-subtle hover:border-primary/30 transition-all duration-300"
                                                        >
                                                            <div className="flex items-center gap-2 mb-3 text-primary">
                                                                {stat.icon}
                                                                <span className="text-xs font-semibold">{stat.label}</span>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <div className="flex-1 flex items-center gap-1.5">
                                                                    <div className="w-2.5 h-2.5 rounded-full bg-primary shadow-sm shadow-primary/50" />
                                                                    <span className={cn(
                                                                        "text-xl font-bold",
                                                                        teamLeading ? "text-primary" : "text-foreground"
                                                                    )}>
                                                                        {stat.team !== null ? <AnimatedValue value={stat.team} delay={index * 80} duration={1200} /> : "--"}
                                                                    </span>
                                                                    {teamLeading && difference !== null && (
                                                                        <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-primary/20 text-primary font-semibold">
                                                                            +{difference}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                <span className="text-sm font-medium text-muted-foreground">vs</span>
                                                                <div className="flex-1 flex items-center gap-1.5 justify-end">
                                                                    {oppLeading && difference !== null && (
                                                                        <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-muted text-muted-foreground font-semibold">
                                                                            +{difference}
                                                                        </span>
                                                                    )}
                                                                    <span className={cn(
                                                                        "text-xl font-bold",
                                                                        oppLeading ? "text-foreground" : "text-muted-foreground"
                                                                    )}>
                                                                        {stat.opponent !== null ? <AnimatedValue value={stat.opponent} delay={index * 80 + 100} duration={1200} /> : "--"}
                                                                    </span>
                                                                    <div className="w-2.5 h-2.5 rounded-full bg-muted-foreground/60" />
                                                                </div>
                                                            </div>
                                                        </motion.div>
                                                    );
                                                })}
                                            </div>

                                            {/* Bottom Stats Row */}
                                            <div className="border-t border-border pt-4">
                                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                                                    {bottomStats.map((stat) => (
                                                        <div key={stat.label} className="text-center p-2 rounded-lg bg-secondary/20">
                                                            <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">
                                                                {stat.label}
                                                            </p>
                                                            <div className="flex items-center justify-center gap-2">
                                                                <span className="text-lg font-bold text-primary">
                                                                    {stat.team !== null ? stat.team : "--"}
                                                                </span>
                                                                <span className="text-xs text-muted-foreground">vs</span>
                                                                <span className="text-lg font-bold text-foreground">
                                                                    {stat.opponent !== null ? stat.opponent : "--"}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </>
                                    );
                                })()}
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Main Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                        {/* Formation Visualization - Now shows ALL players */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="lg:col-span-2"
                        >
                            <Card className="bg-card border-border h-full">
                                <CardHeader className="flex flex-row items-center justify-between">
                                    <CardTitle className="text-lg flex items-center gap-2">
                                        <Shield className="w-5 h-5 text-primary" />
                                        Team Formation ({players.length} Players)
                                    </CardTitle>
                                    <div className="flex items-center gap-2">
                                        {Object.entries(POSITION_COLORS).map(([pos, color]) => {
                                            const count = positionData.find((p) => p.name === pos)?.value || 0;
                                            if (count === 0) return null;
                                            return (
                                                <div key={pos} className="flex items-center gap-1 text-xs">
                                                    <div
                                                        className="w-2.5 h-2.5 rounded-full"
                                                        style={{ backgroundColor: color }}
                                                    />
                                                    <span className="text-muted-foreground">{pos}</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="relative w-full max-w-4xl mx-auto rounded-xl border border-white/20 overflow-hidden bg-muted/20" style={{ aspectRatio: '1.4' }}>
                                        {/* Properly rotated background */}
                                        <div
                                            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                                            style={{
                                                width: '71.43%',
                                                height: '100%',
                                                backgroundImage: 'url(/half-field.jpg)',
                                                backgroundSize: '100% 100%',
                                                backgroundPosition: 'center',
                                                backgroundRepeat: 'no-repeat',
                                                transform: 'translate(-50%, -50%) rotate(90deg)',
                                            }}
                                        />

                                        {/* Subtle overlay for better visibility */}
                                        <div className="absolute inset-0 bg-black/15" />

                                        {/* Players - ALL visible now */}
                                        {formationPlayers.map(({ player, position, color }, index) => (
                                            <Link
                                                key={player.id}
                                                to={`/player/${player.id}`}
                                                className="absolute transform -translate-x-1/2 -translate-y-1/2 group/player z-10"
                                                style={{ left: `${position.x}%`, top: `${(position.y / 60) * 100}%` }}
                                            >
                                                <motion.div
                                                    className="flex flex-col items-center"
                                                    whileHover={{ scale: 1.2, zIndex: 20 }}
                                                    initial={{ scale: 0, opacity: 0 }}
                                                    animate={{ scale: 1, opacity: 1 }}
                                                    transition={{ delay: 0.1 + index * 0.05, type: "spring" }}
                                                >
                                                    <div
                                                        className={cn(
                                                            "w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold border-2 shadow-lg transition-all",
                                                            "text-white",
                                                            "group-hover/player:ring-2 group-hover/player:ring-white/50 group-hover/player:shadow-xl"
                                                        )}
                                                        style={{ backgroundColor: color, borderColor: color }}
                                                    >
                                                        {player.jerseyNumber}
                                                    </div>
                                                    <span className="text-[11px] mt-1 text-white font-semibold bg-black/60 px-2 py-0.5 rounded-full whitespace-nowrap">
                                                        {player.name.split(" ")[1] || player.name.split(" ")[0]}
                                                    </span>
                                                    <span className="text-[9px] text-white/70 bg-black/40 px-1.5 rounded">
                                                        {player.position}
                                                    </span>
                                                </motion.div>
                                            </Link>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>

                        {/* Top Performers */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                        >
                            <Card className="bg-card border-border h-full">
                                <CardHeader>
                                    <CardTitle className="text-lg flex items-center gap-2">
                                        <Trophy className="w-5 h-5 text-warning" />
                                        Top Performers
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {/* Show loading/empty state if no performers yet */}
                                    {!topPerformers.topScorer || !topPerformers.topAssister || !topPerformers.topRated ? (
                                        <div className="text-center py-8 text-muted-foreground">
                                            <p>Loading top performers...</p>
                                        </div>
                                    ) : (
                                        <>
                                            {/* Top Scorer */}
                                            <Link
                                                to={`/player/${topPerformers.topScorer.id}`}
                                                className="flex items-center gap-4 p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors group"
                                            >
                                                <div className="w-12 h-12 rounded-full bg-destructive/20 flex items-center justify-center">
                                                    <Target className="w-6 h-6 text-destructive" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-xs uppercase tracking-wider text-muted-foreground">
                                                        Top Scorer
                                                    </p>
                                                    <p className="font-semibold text-foreground truncate">
                                                        {topPerformers.topScorer.name}
                                                    </p>
                                                    <p className="text-sm text-destructive font-medium">
                                                        {selectedMatch === "all"
                                                            ? topPerformers.topScorer.matchStats.reduce(
                                                                (a, m) => a + m.stats.goals,
                                                                0
                                                            )
                                                            : topPerformers.topScorer.matchStats
                                                                .filter(m => m.matchId === selectedMatch)
                                                                .reduce((a, m) => a + m.stats.goals, 0)
                                                        }{" "}
                                                        goals
                                                    </p>
                                                </div>
                                                <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                                            </Link>

                                            {/* Top Assister */}
                                            <Link
                                                to={`/player/${topPerformers.topAssister.id}`}
                                                className="flex items-center gap-4 p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors group"
                                            >
                                                <div className="w-12 h-12 rounded-full bg-warning/20 flex items-center justify-center">
                                                    <Footprints className="w-6 h-6 text-warning" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-xs uppercase tracking-wider text-muted-foreground">
                                                        Top Assister
                                                    </p>
                                                    <p className="font-semibold text-foreground truncate">
                                                        {topPerformers.topAssister.name}
                                                    </p>
                                                    <p className="text-sm text-warning font-medium">
                                                        {selectedMatch === "all"
                                                            ? topPerformers.topAssister.matchStats.reduce(
                                                                (a, m) => a + m.stats.assists,
                                                                0
                                                            )
                                                            : topPerformers.topAssister.matchStats
                                                                .filter(m => m.matchId === selectedMatch)
                                                                .reduce((a, m) => a + m.stats.assists, 0)
                                                        }{" "}
                                                        assists
                                                    </p>
                                                </div>
                                                <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                                            </Link>

                                            {/* Top Rated */}
                                            <Link
                                                to={`/player/${topPerformers.topRated.id}`}
                                                className="flex items-center gap-4 p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors group"
                                            >
                                                <div className="w-12 h-12 rounded-full bg-success/20 flex items-center justify-center">
                                                    <Flame className="w-6 h-6 text-success" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-xs uppercase tracking-wider text-muted-foreground">
                                                        Highest Rated
                                                    </p>
                                                    <p className="font-semibold text-foreground truncate">
                                                        {topPerformers.topRated.name}
                                                    </p>
                                                    <p className="text-sm text-success font-medium">
                                                        {topPerformers.topRated.overallRating} rating
                                                    </p>
                                                </div>
                                                <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                                            </Link>
                                        </>
                                    )}
                                </CardContent>
                            </Card>
                        </motion.div>
                    </div>

                    {/* Goal Replay Section */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="mb-8"
                    >
                        <Card className="bg-card border-border">
                            <CardHeader className="flex flex-row items-center justify-between flex-wrap gap-4">
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <Target className="w-5 h-5 text-destructive" />
                                    Goal Replay ({filteredGoals.length} Goals)
                                </CardTitle>
                                <div className="flex items-center gap-3">
                                    {/* Removed Select dropdown as we have global selector now */}
                                    <div className="flex items-center gap-1">
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            onClick={handleReset}
                                            disabled={filteredGoals.length === 0}
                                        >
                                            <RotateCcw className="w-4 h-4" />
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            onClick={() => setIsPlaying(!isPlaying)}
                                            disabled={filteredGoals.length === 0}
                                        >
                                            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            onClick={handleNextGoal}
                                            disabled={filteredGoals.length === 0}
                                        >
                                            <SkipForward className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    {/* Goal Pitch Visualization */}
                                    <div className="relative w-full max-w-4xl mx-auto rounded-xl border border-white/20 overflow-hidden bg-muted/20" style={{ aspectRatio: '1.4' }}>
                                        {/* Properly rotated background */}
                                        <div
                                            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                                            style={{
                                                width: '71.43%',
                                                height: '100%',
                                                backgroundImage: 'url(/half-field.jpg)',
                                                backgroundSize: '100% 100%',
                                                backgroundPosition: 'center',
                                                backgroundRepeat: 'no-repeat',
                                                transform: 'translate(-50%, -50%) rotate(90deg)',
                                            }}
                                        />

                                        {/* Subtle overlay for better visibility */}
                                        <div className="absolute inset-0 bg-black/15" />

                                        {/* Current Goal Animation */}
                                        <AnimatePresence mode="wait">
                                            {currentGoal && (
                                                <motion.div
                                                    key={`${currentGoal.matchId}-${currentGoal.minute}`}
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    exit={{ opacity: 0 }}
                                                    className="absolute inset-0"
                                                >
                                                    {/* Shot path */}
                                                    <svg
                                                        viewBox="0 0 100 60"
                                                        className="absolute inset-0 w-full h-full"
                                                        preserveAspectRatio="xMidYMid meet"
                                                    >
                                                        <motion.line
                                                            x1={currentGoal.event.x}
                                                            y1={60 - (currentGoal.event.y * 0.6)}
                                                            x2={50}
                                                            y2={1.5}
                                                            stroke="hsl(var(--destructive))"
                                                            strokeWidth="0.8"
                                                            strokeDasharray="2 1"
                                                            initial={{ pathLength: 0, opacity: 0 }}
                                                            animate={{ pathLength: 1, opacity: 1 }}
                                                            transition={{ duration: 0.8, ease: "easeOut" }}
                                                        />
                                                    </svg>

                                                    {/* Shooter position */}
                                                    <motion.div
                                                        className="absolute transform -translate-x-1/2 -translate-y-1/2"
                                                        style={{
                                                            left: `${currentGoal.event.x}%`,
                                                            top: `${100 - currentGoal.event.y}%`,
                                                        }}
                                                        initial={{ scale: 0 }}
                                                        animate={{ scale: 1 }}
                                                        transition={{ delay: 0.2, type: "spring" }}
                                                    >
                                                        <div className="w-10 h-10 rounded-full bg-destructive flex items-center justify-center text-white font-bold border-2 border-white shadow-lg">
                                                            {currentGoal.scorer.jerseyNumber}
                                                        </div>
                                                    </motion.div>

                                                    {/* Goal indicator */}
                                                    <motion.div
                                                        className="absolute left-1/2 top-2 transform -translate-x-1/2"
                                                        initial={{ scale: 0, y: 20 }}
                                                        animate={{ scale: 1, y: 0 }}
                                                        transition={{ delay: 0.6, type: "spring" }}
                                                    >
                                                        <div className="w-5 h-5 rounded-full bg-white border-2 border-primary shadow-sm" />
                                                    </motion.div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>

                                        {filteredGoals.length === 0 && (
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <p className="text-muted-foreground">No goals in selected match</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Goal Details */}
                                    <div className="space-y-4">
                                        <AnimatePresence mode="wait">
                                            {currentGoal && (
                                                <motion.div
                                                    key={`details-${currentGoal.matchId}-${currentGoal.minute}`}
                                                    initial={{ opacity: 0, x: 20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    exit={{ opacity: 0, x: -20 }}
                                                    className="space-y-4"
                                                >
                                                    <div className="p-4 rounded-lg bg-secondary/50">
                                                        <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">
                                                            Goal #{currentGoalIndex + 1} of {filteredGoals.length}
                                                        </p>
                                                        <h3 className="text-xl font-bold text-foreground">
                                                            {currentGoal.scorer.name}
                                                        </h3>
                                                        <p className="text-sm text-muted-foreground">
                                                            vs {currentGoal.opponent} • {currentGoal.minute}'
                                                        </p>
                                                    </div>

                                                    <div className="grid grid-cols-2 gap-3">
                                                        <div className="p-3 rounded-lg bg-secondary/30 text-center">
                                                            <p className="text-2xl font-bold text-destructive">
                                                                {currentGoal.minute}'
                                                            </p>
                                                            <p className="text-xs text-muted-foreground">Minute</p>
                                                        </div>
                                                        <div className="p-3 rounded-lg bg-secondary/30 text-center">
                                                            <p className="text-2xl font-bold text-primary">
                                                                #{currentGoal.scorer.jerseyNumber}
                                                            </p>
                                                            <p className="text-xs text-muted-foreground">Jersey</p>
                                                        </div>
                                                    </div>

                                                    <Link
                                                        to={`/player/${currentGoal.scorer.id}`}
                                                        className="flex items-center justify-center gap-2 p-3 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary transition-colors"
                                                    >
                                                        View Player Stats
                                                        <ArrowRight className="w-4 h-4" />
                                                    </Link>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>

                                        {/* Goal List */}
                                        <div className="space-y-2 max-h-40 overflow-y-auto">
                                            {filteredGoals.map((goal, i) => (
                                                <button
                                                    key={`${goal.matchId}-${goal.minute}-${i}`}
                                                    onClick={() => setCurrentGoalIndex(i)}
                                                    className={cn(
                                                        "w-full flex items-center gap-3 p-2 rounded-lg text-left transition-colors",
                                                        i === currentGoalIndex
                                                            ? "bg-primary/20 border border-primary/30"
                                                            : "bg-secondary/30 hover:bg-secondary/50"
                                                    )}
                                                >
                                                    <div className="w-8 h-8 rounded-full bg-destructive/20 flex items-center justify-center text-sm font-bold text-destructive">
                                                        {goal.scorer.jerseyNumber}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-medium text-foreground truncate">
                                                            {goal.scorer.name}
                                                        </p>
                                                        <p className="text-xs text-muted-foreground">
                                                            {goal.minute}' vs {goal.opponent}
                                                        </p>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>



                    {/* Position Distribution + Team Trend */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                        >
                            <Card className="bg-card border-border">
                                <CardHeader>
                                    <CardTitle className="text-lg flex items-center gap-2">
                                        <Users className="w-5 h-5 text-primary" />
                                        Position Distribution
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="h-64">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie
                                                    data={positionData}
                                                    cx="50%"
                                                    cy="50%"
                                                    innerRadius={50}
                                                    outerRadius={80}
                                                    paddingAngle={4}
                                                    dataKey="value"
                                                    labelLine={false}
                                                    label={({ name, percent }) =>
                                                        `${name} ${(percent * 100).toFixed(0)}%`
                                                    }
                                                >
                                                    {positionData.map((entry, index) => (
                                                        <Cell
                                                            key={`cell-${index}`}
                                                            fill={POSITION_COLORS[entry.name] || "hsl(var(--muted))"}
                                                        />
                                                    ))}
                                                </Pie>
                                                <Tooltip
                                                    contentStyle={{
                                                        backgroundColor: "hsl(var(--popover))",
                                                        border: "1px solid hsl(var(--border))",
                                                        borderRadius: "8px",
                                                    }}
                                                />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>
                                    {/* Legend */}
                                    <div className="flex flex-wrap justify-center gap-4 mt-4">
                                        {positionData.map((entry) => (
                                            <div key={entry.name} className="flex items-center gap-2">
                                                <div
                                                    className="w-3 h-3 rounded-full"
                                                    style={{ backgroundColor: POSITION_COLORS[entry.name] }}
                                                />
                                                <span className="text-sm text-muted-foreground">
                                                    {entry.name} ({entry.value})
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>

                        {/* Team Performance Trend */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6 }}
                        >
                            <Card className="bg-card border-border">
                                <CardHeader>
                                    <CardTitle className="text-lg flex items-center gap-2">
                                        <TrendingUp className="w-5 h-5 text-primary" />
                                        Team Performance Trend
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <LineChart
                                        data={teamTrendData}
                                        lines={[
                                            { dataKey: "Goals", color: "hsl(var(--destructive))", name: "Goals" },
                                            { dataKey: "Assists", color: "hsl(var(--warning))", name: "Assists" },
                                        ]}
                                        height={264}
                                    />
                                </CardContent>
                            </Card>
                        </motion.div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default TeamAnalytics;
