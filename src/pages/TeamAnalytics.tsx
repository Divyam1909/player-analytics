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
import playersData from "@/data/players.json";

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

const TeamAnalytics = ({ embedded = false, defaultMatchId }: TeamAnalyticsProps) => {
    const players = playersData.players as Player[];
    const [selectedMatch, setSelectedMatch] = useState<string>(defaultMatchId || "all");
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentGoalIndex, setCurrentGoalIndex] = useState(0);

    // All unique matches
    const matches = useMemo(() => {
        const matchSet = new Map<string, { id: string; opponent: string; date: string }>();
        players.forEach((p) => {
            p.matchStats.forEach((m) => {
                if (!matchSet.has(m.matchId)) {
                    matchSet.set(m.matchId, { id: m.matchId, opponent: m.opponent, date: m.date });
                }
            });
        });
        return Array.from(matchSet.values());
    }, [players]);

    // Aggregate team stats
    const teamStats = useMemo(() => {
        const relevantStats = players.flatMap(p =>
            p.matchStats.filter(m => selectedMatch === "all" || m.matchId === selectedMatch)
        );

        const totalGoals = relevantStats.reduce((a, m) => a + m.stats.goals, 0);
        const totalAssists = relevantStats.reduce((a, m) => a + m.stats.assists, 0);

        const avgRating = Math.round(
            players.reduce((acc, p) => acc + p.overallRating, 0) / players.length
        );

        const totalMatches = selectedMatch === "all"
            ? Math.max(...players.map((p) => p.matchStats.length))
            : 1;

        return { totalGoals, totalAssists, avgRating, totalMatches };
    }, [players, selectedMatch]);

    // Position distribution for pie chart
    const positionData = useMemo(() => {
        const counts: Record<string, number> = {};
        players.forEach((p) => {
            counts[p.position] = (counts[p.position] || 0) + 1;
        });
        return Object.entries(counts).map(([name, value]) => ({ name, value }));
    }, [players]);

    // Top performers
    const topPerformers = useMemo(() => {
        const topScorer = players.reduce((prev, curr) => {
            const prevGoals = prev.matchStats.reduce((a, m) => a + m.stats.goals, 0);
            const currGoals = curr.matchStats.reduce((a, m) => a + m.stats.goals, 0);
            return currGoals > prevGoals ? curr : prev;
        });
        const topAssister = players.reduce((prev, curr) => {
            const prevAssists = prev.matchStats.reduce((a, m) => a + m.stats.assists, 0);
            const currAssists = curr.matchStats.reduce((a, m) => a + m.stats.assists, 0);
            return currAssists > prevAssists ? curr : prev;
        });
        const topRated = players.reduce((prev, curr) =>
            curr.overallRating > prev.overallRating ? curr : prev
        );

        return { topScorer, topAssister, topRated };
    }, [players]);

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
        { label: "Total Players", value: players.length, icon: Users, color: "text-primary" },
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
                        {statCards.map((stat) => (
                            <motion.div
                                key={stat.label}
                                variants={itemVariants}
                                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                                className="relative overflow-hidden rounded-lg border border-border bg-card p-5 group hover:border-primary/30 transition-all duration-300"
                            >
                                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-primary/10 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity" />
                                <div className="flex items-start justify-between">
                                    <div>
                                        <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">
                                            {stat.label}
                                        </p>
                                        <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                                    </div>
                                    <motion.div
                                        className={`p-3 rounded-lg bg-secondary ${stat.color}`}
                                        whileHover={{ rotate: 10 }}
                                    >
                                        <stat.icon className="w-5 h-5" />
                                    </motion.div>
                                </div>
                            </motion.div>
                        ))}
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
                                    <div className="relative aspect-[16/10] bg-gradient-to-b from-emerald-900/40 to-emerald-800/40 rounded-xl border border-emerald-700/30 overflow-hidden">
                                        {/* Field markings - Half pitch */}
                                        <svg
                                            viewBox="0 0 100 60"
                                            className="absolute inset-0 w-full h-full"
                                            preserveAspectRatio="xMidYMid meet"
                                        >
                                            {/* Penalty area */}
                                            <rect x="25" y="0" width="50" height="18" stroke="rgba(255,255,255,0.25)" strokeWidth="0.4" fill="none" />
                                            {/* Goal area */}
                                            <rect x="37" y="0" width="26" height="8" stroke="rgba(255,255,255,0.25)" strokeWidth="0.4" fill="none" />
                                            {/* Goal */}
                                            <rect x="40" y="0" width="20" height="3" fill="rgba(255,255,255,0.15)" stroke="rgba(255,255,255,0.3)" strokeWidth="0.3" />
                                            {/* Penalty arc */}
                                            <path d="M 32 18 A 12 12 0 0 0 68 18" stroke="rgba(255,255,255,0.2)" strokeWidth="0.3" fill="none" />
                                            {/* Penalty spot */}
                                            <circle cx="50" cy="14" r="0.8" fill="rgba(255,255,255,0.4)" />
                                            {/* Halfway line (at bottom) */}
                                            <line x1="0" y1="60" x2="100" y2="60" stroke="rgba(255,255,255,0.2)" strokeWidth="0.3" />
                                            {/* Corner arcs */}
                                            <path d="M 0 3 A 3 3 0 0 1 3 0" stroke="rgba(255,255,255,0.2)" strokeWidth="0.3" fill="none" />
                                            <path d="M 97 0 A 3 3 0 0 1 100 3" stroke="rgba(255,255,255,0.2)" strokeWidth="0.3" fill="none" />
                                        </svg>

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
                                                {topPerformers.topScorer.matchStats.reduce(
                                                    (a, m) => a + m.stats.goals,
                                                    0
                                                )}{" "}
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
                                                {topPerformers.topAssister.matchStats.reduce(
                                                    (a, m) => a + m.stats.assists,
                                                    0
                                                )}{" "}
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
                                    <div className="relative aspect-[16/10] bg-gradient-to-b from-emerald-900/40 to-emerald-800/40 rounded-xl border border-emerald-700/30 overflow-hidden">
                                        {/* Field markings for goal view (half pitch) */}
                                        <svg
                                            viewBox="0 0 100 60"
                                            className="absolute inset-0 w-full h-full"
                                            preserveAspectRatio="xMidYMid meet"
                                        >
                                            {/* Penalty area */}
                                            <rect x="25" y="0" width="50" height="18" stroke="rgba(255,255,255,0.25)" strokeWidth="0.4" fill="none" />
                                            {/* Goal area */}
                                            <rect x="37" y="0" width="26" height="8" stroke="rgba(255,255,255,0.25)" strokeWidth="0.4" fill="none" />
                                            {/* Goal */}
                                            <rect x="40" y="0" width="20" height="3" fill="rgba(255,255,255,0.15)" stroke="rgba(255,255,255,0.3)" strokeWidth="0.3" />
                                            {/* Arc */}
                                            <path d="M 32 18 A 12 12 0 0 0 68 18" stroke="rgba(255,255,255,0.2)" strokeWidth="0.3" fill="none" />
                                            {/* Penalty spot */}
                                            <circle cx="50" cy="14" r="0.8" fill="rgba(255,255,255,0.4)" />
                                        </svg>

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

                    {/* Advanced Statistics Section */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.45 }}
                        className="mb-8"
                    >
                        <Card className="bg-card border-border">
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
                                    // Calculate advanced team stats
                                    const teamName = "Bombay Gymkhana Men";
                                    const opponentName = selectedMatch === "all"
                                        ? "All Opponents"
                                        : matches.find(m => m.id === selectedMatch)?.opponent || "Opponent";

                                    const relevantMatches = selectedMatch === "all"
                                        ? players.flatMap(p => p.matchStats)
                                        : players.flatMap(p => p.matchStats.filter(m => m.matchId === selectedMatch));

                                    // Team stats
                                    const teamClearances = relevantMatches.reduce((a, m) => a + (m.stats.clearances || 0), 0);
                                    const teamInterceptions = relevantMatches.reduce((a, m) => a + (m.stats.interceptions || 0), 0);
                                    const teamDribbles = relevantMatches.reduce((a, m) => a + (m.stats.dribblesSuccessful || 0), 0);
                                    const teamRecoveries = relevantMatches.reduce((a, m) => a + (m.stats.recoveries || 0), 0);
                                    const teamPassesInBox = relevantMatches.reduce((a, m) => a + (m.stats.passesInBox || 0), 0);
                                    const teamPassesFinalThird = relevantMatches.reduce((a, m) => a + (m.stats.passesInFinalThird || 0), 0);
                                    const teamAerialDuels = relevantMatches.reduce((a, m) => a + (m.stats.aerialDuelsWon || 0), 0);
                                    const teamShots = relevantMatches.reduce((a, m) => a + (m.stats.shots || 0), 0);
                                    const teamShotsOnTarget = relevantMatches.reduce((a, m) => a + (m.stats.shotsOnTarget || 0), 0);

                                    // Simulated opponent stats (for demo)
                                    const oppClearances = Math.floor(teamClearances * 0.6);
                                    const oppInterceptions = Math.floor(teamInterceptions * 0.68);
                                    const oppDribbles = Math.floor(teamDribbles * 2.4);
                                    const oppRecoveries = Math.floor(teamRecoveries * 1.36);
                                    const oppPassesInBox = Math.floor(teamPassesInBox * 0.71);
                                    const oppPassesFinalThird = Math.floor(teamPassesFinalThird * 1.23);
                                    const oppAerialDuels = Math.floor(teamAerialDuels * 1.44);
                                    const oppFouls = 14;
                                    const teamFouls = 11;
                                    const oppSaves = 4;
                                    const teamSaves = 3;
                                    const oppFreeKicks = 11;
                                    const teamFreeKicks = 10;
                                    const teamConversion = teamShots > 0 ? Math.round((teamShotsOnTarget / teamShots) * 100) : 0;
                                    const oppConversion = 37;

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
                                        { label: "CONVERSION RATE", team: `${teamConversion}%`, opponent: `${oppConversion}%` },
                                    ];

                                    // Hexagon chart data (calculate performance indices)
                                    const totalStats = relevantMatches.length > 0 ? relevantMatches.length : 1;
                                    const totalPasses = relevantMatches.reduce((a, m) => a + (m.stats.passes || 0), 0);
                                    const totalPassAcc = relevantMatches.reduce((a, m) => a + (m.stats.passAccuracy || 0), 0) / totalStats;
                                    const totalGoals = relevantMatches.reduce((a, m) => a + (m.stats.goals || 0), 0);

                                    // Performance indices (0-100 scale)
                                    const pci = Math.min(100, Math.round(totalPassAcc * 0.8 + (teamRecoveries / Math.max(1, totalStats)) * 2)); // Possession Control Index
                                    const cci = Math.min(100, Math.round((teamPassesInBox + teamPassesFinalThird) / Math.max(1, totalStats) * 5)); // Chance Creation Index
                                    const se = teamShots > 0 ? Math.round((totalGoals / teamShots) * 100) : 0; // Shooting Efficiency
                                    const ds = Math.min(100, Math.round((teamClearances + teamInterceptions + teamRecoveries) / Math.max(1, totalStats) * 3)); // Defensive Solidity
                                    const tp = Math.min(100, Math.round((teamDribbles + relevantMatches.reduce((a, m) => a + (m.stats.progressiveRuns || 0), 0)) / Math.max(1, totalStats) * 4)); // Transition & Progression
                                    const rpe = Math.min(100, Math.round(teamRecoveries / Math.max(1, totalStats) * 5)); // Recovery & Pressing Efficiency

                                    // Opponent indices (simulated)
                                    const oppPci = Math.floor(pci * 0.75);
                                    const oppCci = Math.floor(cci * 0.68);
                                    const oppSe = Math.floor(se * 0.85);
                                    const oppDs = Math.floor(ds * 1.1);
                                    const oppTp = Math.floor(tp * 0.9);
                                    const oppRpe = Math.floor(rpe * 0.82);

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
                                                    {keyIndices.map((stat) => {
                                                        const teamLeading = stat.team > stat.opponent;
                                                        const oppLeading = stat.opponent > stat.team;
                                                        const difference = Math.abs(stat.team - stat.opponent);
                                                        const leadPercentage = stat.opponent > 0
                                                            ? Math.round((difference / stat.opponent) * 100)
                                                            : difference > 0 ? 100 : 0;
                                                        const leadingTeam = teamLeading ? teamName : (oppLeading ? opponentName : null);

                                                        return (
                                                            <div
                                                                key={stat.label}
                                                                className="p-3 rounded-lg bg-secondary/30 border border-border"
                                                            >
                                                                <div className="flex items-center gap-2 mb-2 text-primary">
                                                                    {stat.icon}
                                                                    <span className="text-xs font-medium truncate">{stat.label}</span>
                                                                </div>
                                                                <div className="flex items-center justify-between gap-2">
                                                                    <div className={cn(
                                                                        "text-xl font-bold px-2 py-1 rounded text-center flex-1",
                                                                        teamLeading
                                                                            ? "bg-primary/20 text-primary"
                                                                            : "text-foreground"
                                                                    )}>
                                                                        {stat.team}%
                                                                    </div>
                                                                    <span className="text-xs text-muted-foreground">vs</span>
                                                                    <div className={cn(
                                                                        "text-xl font-bold px-2 py-1 rounded text-center flex-1",
                                                                        oppLeading
                                                                            ? "bg-primary/20 text-primary"
                                                                            : "text-muted-foreground"
                                                                    )}>
                                                                        {stat.opponent}%
                                                                    </div>
                                                                </div>
                                                                {/* Leading indicator with percentage */}
                                                                {leadingTeam && (
                                                                    <div className={cn(
                                                                        "mt-2 pt-2 border-t border-border/50 text-center",
                                                                    )}>
                                                                        <span className={cn(
                                                                            "text-[10px] font-semibold",
                                                                            teamLeading ? "text-primary" : "text-muted-foreground"
                                                                        )}>
                                                                            {teamLeading ? teamName.split(" ")[0] : opponentName.split(" ")[0]} leads by {leadPercentage}%
                                                                        </span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>

                                            {/* Match Stats Grid */}
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
                                                {advancedStats.map((stat) => {
                                                    const teamLeading = stat.team > stat.opponent;
                                                    const oppLeading = stat.opponent > stat.team;

                                                    return (
                                                        <div
                                                            key={stat.label}
                                                            className="p-3 rounded-lg bg-secondary/30 border border-border"
                                                        >
                                                            <div className="flex items-center gap-2 mb-2 text-primary">
                                                                {stat.icon}
                                                                <span className="text-xs font-medium">{stat.label}</span>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <div className="flex-1 flex items-center gap-1">
                                                                    <div className="w-2 h-2 rounded-full bg-primary" />
                                                                    <span className={cn(
                                                                        "text-lg font-bold",
                                                                        teamLeading ? "text-primary" : "text-foreground"
                                                                    )}>
                                                                        {stat.team}
                                                                    </span>
                                                                    {teamLeading && (
                                                                        <span className="text-[9px] px-1 py-0.5 rounded bg-primary/20 text-primary font-medium">
                                                                            +
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                <span className="text-xs text-muted-foreground">vs</span>
                                                                <div className="flex-1 flex items-center gap-1 justify-end">
                                                                    {oppLeading && (
                                                                        <span className="text-[9px] px-1 py-0.5 rounded bg-muted text-muted-foreground font-medium">
                                                                            +
                                                                        </span>
                                                                    )}
                                                                    <span className={cn(
                                                                        "text-lg font-bold",
                                                                        oppLeading ? "text-foreground" : "text-muted-foreground"
                                                                    )}>
                                                                        {stat.opponent}
                                                                    </span>
                                                                    <div className="w-2 h-2 rounded-full bg-muted-foreground" />
                                                                </div>
                                                            </div>
                                                        </div>
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
                                                                <span className="text-lg font-bold text-primary">{stat.team}</span>
                                                                <span className="text-xs text-muted-foreground">vs</span>
                                                                <span className="text-lg font-bold text-foreground">{stat.opponent}</span>
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
