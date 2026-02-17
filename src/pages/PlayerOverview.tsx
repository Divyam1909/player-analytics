import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import AuthHeader from "@/components/layout/AuthHeader";
import Sidebar from "@/components/layout/Sidebar";
import { Player, MatchStats } from "@/types/player";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    User,
    Target,
    Footprints,
    Activity,
    CalendarDays,
    Search,
    Users,
    ArrowRight,
    ChevronRight,
    Filter,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { usePlayers } from "@/hooks/usePlayers";
import { useSidebarContext } from "@/contexts/SidebarContext";
import { StatHint } from "@/components/ui/stat-hint";

const POSITION_FILTERS = [
    { label: "All", value: "all" },
    { label: "FW", value: "Forward" },
    { label: "MF", value: "Midfielder" },
    { label: "DF", value: "Defender" },
    { label: "GK", value: "Goalkeeper" },
];

const PlayerOverview = () => {
    const { data: players, isLoading, error } = usePlayers();
    const { isCollapsed } = useSidebarContext();
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState("");
    const [positionFilter, setPositionFilter] = useState("all");
    const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);

    // Filter players
    const filteredPlayers = useMemo(() => {
        if (!players) return [];
        return players
            .filter((p) => p.matchStats.length > 0) // Only players with match data
            .filter((p) => {
                const matchesSearch = p.name
                    .toLowerCase()
                    .includes(searchQuery.toLowerCase());
                const matchesPosition =
                    positionFilter === "all" ||
                    p.position.toLowerCase().includes(positionFilter.toLowerCase());
                return matchesSearch && matchesPosition;
            })
            .sort((a, b) => a.name.localeCompare(b.name));
    }, [players, searchQuery, positionFilter]);

    // Selected player
    const selectedPlayer = useMemo(() => {
        if (!selectedPlayerId || !players) return null;
        return players.find((p) => p.id === selectedPlayerId) || null;
    }, [selectedPlayerId, players]);

    // Aggregated stats for selected player
    const aggregatedStats = useMemo(() => {
        if (!selectedPlayer) return null;
        const matches = selectedPlayer.matchStats;
        if (matches.length === 0) return null;
        return {
            goals: matches.reduce((a, m) => a + m.stats.goals, 0),
            assists: matches.reduce((a, m) => a + m.stats.assists, 0),
            passes: matches.reduce((a, m) => a + m.stats.passes, 0),
            passAccuracy: Math.round(
                matches.reduce((a, m) => a + m.stats.passAccuracy, 0) / matches.length
            ),
            keyPasses: matches.reduce((a, m) => a + m.stats.keyPasses, 0),
            crosses: matches.reduce((a, m) => a + m.stats.crosses, 0),
            progressivePassing: matches.reduce(
                (a, m) => a + m.stats.progressivePassing,
                0
            ),
            dribbles: matches.reduce((a, m) => a + m.stats.dribbles, 0),
            dribblesSuccessful: matches.reduce(
                (a, m) => a + m.stats.dribblesSuccessful,
                0
            ),
            aerialDuelsWon: matches.reduce((a, m) => a + m.stats.aerialDuelsWon, 0),
            shots: matches.reduce((a, m) => a + m.stats.shots, 0),
            shotsOnTarget: matches.reduce((a, m) => a + m.stats.shotsOnTarget, 0),
            ballTouches: matches.reduce((a, m) => a + m.stats.ballTouches, 0),
        };
    }, [selectedPlayer]);

    // Sum nullable stat helper
    const sumNullableStat = (
        statKey: keyof MatchStats
    ): number | null => {
        if (!selectedPlayer) return null;
        const values = selectedPlayer.matchStats.map((m) => m.stats[statKey]);
        if (values.some((v) => v === null)) return null;
        return values.reduce((a, v) => (a as number) + (v as number), 0) as number;
    };

    const displayStat = (value: number | null | string): string => {
        if (value === null) return "--";
        return String(value);
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background">
                <AuthHeader title="Player Overview" showBack />
                <Sidebar />
                <main
                    className={cn(
                        "pt-24 pb-12 px-6 transition-all duration-300",
                        isCollapsed ? "ml-16" : "ml-64"
                    )}
                >
                    <div className="container mx-auto flex items-center justify-center min-h-[60vh]">
                        <div className="animate-pulse text-primary text-lg">
                            Loading players...
                        </div>
                    </div>
                </main>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-background">
                <AuthHeader title="Player Overview" showBack />
                <Sidebar />
                <main
                    className={cn(
                        "pt-24 pb-12 px-6 transition-all duration-300",
                        isCollapsed ? "ml-16" : "ml-64"
                    )}
                >
                    <div className="container mx-auto flex items-center justify-center min-h-[60vh]">
                        <p className="text-destructive">
                            Error loading player data. Please try again.
                        </p>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            <AuthHeader title="Player Overview" showBack />
            <Sidebar />

            <main
                className={cn(
                    "pt-24 pb-12 px-6 transition-all duration-300",
                    isCollapsed ? "ml-16" : "ml-64"
                )}
            >
                <div className="container mx-auto">
                    {/* Page Title */}
                    <div className="mb-8">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                                <Users className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-foreground">
                                    Player Overview
                                </h1>
                                <p className="text-sm text-muted-foreground">
                                    Aggregated season statistics for all players
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-6">
                        {/* Player Selection Panel — Full Width Horizontal */}
                        <Card className="bg-card border-border">
                            <CardHeader className="pb-3">
                                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                                    <CardTitle className="text-base flex items-center gap-2">
                                        <Filter className="w-4 h-4 text-primary" />
                                        Players
                                        <span className="ml-2 text-xs text-muted-foreground font-normal">
                                            {filteredPlayers.length} found
                                        </span>
                                    </CardTitle>

                                    {/* Search */}
                                    <div className="relative flex-1 max-w-xs">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                        <input
                                            type="text"
                                            placeholder="Search players..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="w-full pl-10 pr-4 py-2 text-sm rounded-lg bg-secondary border border-border focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
                                        />
                                    </div>

                                    {/* Position Filters */}
                                    <div className="flex flex-wrap gap-1.5">
                                        {POSITION_FILTERS.map((pf) => (
                                            <Button
                                                key={pf.value}
                                                variant={
                                                    positionFilter === pf.value ? "default" : "outline"
                                                }
                                                size="sm"
                                                className="h-7 px-3 text-xs"
                                                onClick={() => setPositionFilter(pf.value)}
                                            >
                                                {pf.label}
                                            </Button>
                                        ))}
                                    </div>
                                </div>
                            </CardHeader>

                            <CardContent className="pt-0">
                                <div className="overflow-x-auto pb-2">
                                    <div className="flex gap-2 min-w-max">
                                        {filteredPlayers.length === 0 ? (
                                            <p className="text-sm text-muted-foreground text-center py-4 w-full">
                                                No players found
                                            </p>
                                        ) : (
                                            filteredPlayers.map((player, index) => (
                                                <motion.div
                                                    key={player.id}
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: index * 0.02 }}
                                                    onClick={() => setSelectedPlayerId(player.id)}
                                                    className={cn(
                                                        "flex flex-col items-center gap-1.5 px-3 py-2.5 rounded-lg cursor-pointer transition-all duration-200 min-w-[80px]",
                                                        selectedPlayerId === player.id
                                                            ? "bg-primary/15 border border-primary/30"
                                                            : "hover:bg-secondary/80 border border-transparent"
                                                    )}
                                                >
                                                    {/* Avatar */}
                                                    <div
                                                        className={cn(
                                                            "w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold flex-shrink-0",
                                                            selectedPlayerId === player.id
                                                                ? "bg-primary text-primary-foreground"
                                                                : "bg-secondary text-muted-foreground"
                                                        )}
                                                    >
                                                        {player.jerseyNumber}
                                                    </div>

                                                    {/* Info */}
                                                    <div className="text-center min-w-0">
                                                        <p
                                                            className={cn(
                                                                "text-xs font-medium truncate max-w-[70px]",
                                                                selectedPlayerId === player.id
                                                                    ? "text-primary"
                                                                    : "text-foreground"
                                                            )}
                                                            title={player.name}
                                                        >
                                                            {player.name.split(' ')[0]}...
                                                        </p>
                                                        <p className="text-[10px] text-muted-foreground">
                                                            {player.position.substring(0, 2).toUpperCase()} · {player.matchStats.length}
                                                        </p>
                                                    </div>

                                                    {/* Quick stats */}
                                                    <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                                                        <span>
                                                            {player.matchStats.reduce(
                                                                (a, m) => a + m.stats.goals,
                                                                0
                                                            )}G
                                                        </span>
                                                        <span>
                                                            {player.matchStats.reduce(
                                                                (a, m) => a + m.stats.assists,
                                                                0
                                                            )}A
                                                        </span>
                                                    </div>
                                                </motion.div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Stats Panel — Full Width Below */}
                        <div className="w-full">
                            <AnimatePresence mode="wait">
                                {selectedPlayer ? (
                                    <motion.div
                                        key={selectedPlayer.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        transition={{ duration: 0.3 }}
                                        className="space-y-6"
                                    >
                                        {/* Player Header */}
                                        <div className="relative overflow-hidden rounded-xl border border-border bg-card p-6">
                                            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5" />
                                            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-primary/10 to-transparent rounded-bl-full" />

                                            <div className="relative flex flex-col md:flex-row items-start md:items-center gap-6">
                                                {/* Avatar */}
                                                <div className="relative flex-shrink-0">
                                                    <div className="w-20 h-20 lg:w-24 lg:h-24 rounded-2xl bg-secondary border border-border flex items-center justify-center">
                                                        <User className="w-10 h-10 lg:w-12 lg:h-12 text-muted-foreground" />
                                                    </div>
                                                    <div className="absolute -bottom-2 -right-2 w-9 h-9 lg:w-10 lg:h-10 rounded-xl bg-primary flex items-center justify-center text-base lg:text-lg font-bold text-primary-foreground shadow-lg">
                                                        {selectedPlayer.jerseyNumber}
                                                    </div>
                                                </div>

                                                {/* Info */}
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex flex-wrap items-center gap-3 mb-2">
                                                        <h2 className="text-xl lg:text-2xl font-bold text-foreground">
                                                            {selectedPlayer.name}
                                                        </h2>
                                                        <span className="px-3 py-1 rounded-lg bg-secondary text-sm font-medium text-secondary-foreground">
                                                            {selectedPlayer.position}
                                                        </span>
                                                    </div>
                                                    <p className="text-muted-foreground mb-3">
                                                        {selectedPlayer.team}
                                                    </p>

                                                    <div className="flex flex-wrap gap-4">
                                                        <div className="flex items-center gap-2">
                                                            <Target className="w-4 h-4 text-destructive" />
                                                            <span className="text-sm text-muted-foreground">
                                                                {aggregatedStats?.goals ?? 0} Goals
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <Footprints className="w-4 h-4 text-warning" />
                                                            <span className="text-sm text-muted-foreground">
                                                                {aggregatedStats?.assists ?? 0} Assists
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <CalendarDays className="w-4 h-4 text-primary" />
                                                            <span className="text-sm text-muted-foreground">
                                                                {selectedPlayer.matchStats.length} Matches
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* View Full Profile */}
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="gap-2 flex-shrink-0"
                                                    onClick={() =>
                                                        navigate(`/player/${selectedPlayer.id}`)
                                                    }
                                                >
                                                    Full Profile
                                                    <ArrowRight className="w-3.5 h-3.5" />
                                                </Button>
                                            </div>
                                        </div>

                                        {/* Stats Breakdown */}
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                            {/* Passing Stats */}
                                            <Card className="bg-card border-border">
                                                <CardHeader className="pb-2">
                                                    <CardTitle className="text-lg flex items-center gap-2">
                                                        <span className="w-3 h-3 rounded-full bg-primary" />
                                                        Passing Stats
                                                    </CardTitle>
                                                </CardHeader>
                                                <CardContent>
                                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                                        {[
                                                            {
                                                                label: "Total Passes",
                                                                value: aggregatedStats?.passes ?? 0,
                                                                statId: "total_passes",
                                                            },
                                                            {
                                                                label: "Pass Accuracy",
                                                                value: `${aggregatedStats?.passAccuracy ?? 0}%`,
                                                                statId: "pass_accuracy",
                                                            },
                                                            {
                                                                label: "Key Passes",
                                                                value: aggregatedStats?.keyPasses ?? 0,
                                                                statId: "key_passes",
                                                            },
                                                            {
                                                                label: "Final Third",
                                                                value: sumNullableStat("passesInFinalThird"),
                                                                statId: "passes_final_third",
                                                            },
                                                            {
                                                                label: "In Box",
                                                                value: sumNullableStat("passesInBox"),
                                                                statId: "passes_in_box",
                                                            },
                                                            {
                                                                label: "Crosses",
                                                                value: aggregatedStats?.crosses ?? 0,
                                                                statId: "crosses",
                                                            },
                                                            {
                                                                label: "Assists",
                                                                value: aggregatedStats?.assists ?? 0,
                                                                statId: "assists",
                                                            },
                                                            {
                                                                label: "Prog. Pass",
                                                                value: aggregatedStats?.progressivePassing ?? 0,
                                                                statId: "progressive_passes",
                                                            },
                                                        ].map((stat) => (
                                                            <div
                                                                key={stat.label}
                                                                className="text-center p-3 rounded bg-secondary/50"
                                                            >
                                                                <span className="text-xl font-bold text-primary block">
                                                                    {displayStat(stat.value)}
                                                                </span>
                                                                <span className="text-[10px] uppercase text-muted-foreground block">
                                                                    <StatHint statId={stat.statId} iconSize="sm">
                                                                        <span>{stat.label}</span>
                                                                    </StatHint>
                                                                </span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </CardContent>
                                            </Card>

                                            {/* Defensive Stats */}
                                            <Card className="bg-card border-border">
                                                <CardHeader className="pb-2">
                                                    <CardTitle className="text-lg flex items-center gap-2">
                                                        <span className="w-3 h-3 rounded-full bg-success" />
                                                        Defensive Stats
                                                    </CardTitle>
                                                </CardHeader>
                                                <CardContent>
                                                    <div className="grid grid-cols-2 gap-3">
                                                        {[
                                                            {
                                                                label: "Blocks",
                                                                value: sumNullableStat("blocks"),
                                                                statId: "blocks",
                                                            },
                                                            {
                                                                label: "Interceptions",
                                                                value: sumNullableStat("interceptions"),
                                                                statId: "interceptions",
                                                            },
                                                            {
                                                                label: "Clearances",
                                                                value: sumNullableStat("clearances"),
                                                                statId: "clearances",
                                                            },
                                                            {
                                                                label: "Recoveries",
                                                                value: sumNullableStat("recoveries"),
                                                                statId: "recoveries",
                                                            },
                                                        ].map((stat) => (
                                                            <div
                                                                key={stat.label}
                                                                className="text-center p-3 rounded bg-secondary/50"
                                                            >
                                                                <span className="text-xl font-bold text-success block">
                                                                    {displayStat(stat.value)}
                                                                </span>
                                                                <span className="text-[10px] uppercase text-muted-foreground block">
                                                                    <StatHint statId={stat.statId} iconSize="sm">
                                                                        <span>{stat.label}</span>
                                                                    </StatHint>
                                                                </span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </CardContent>
                                            </Card>

                                            {/* Attacking Stats */}
                                            <Card className="bg-card border-border">
                                                <CardHeader className="pb-2">
                                                    <CardTitle className="text-lg flex items-center gap-2">
                                                        <span className="w-3 h-3 rounded-full bg-destructive" />
                                                        Attacking Stats
                                                    </CardTitle>
                                                </CardHeader>
                                                <CardContent>
                                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                                        {[
                                                            {
                                                                label: "Prog. Runs",
                                                                value: sumNullableStat("progressiveRuns"),
                                                                statId: "progressive_runs",
                                                            },
                                                            {
                                                                label: "Total Dribbles",
                                                                value: aggregatedStats?.dribbles ?? 0,
                                                                statId: "dribbles",
                                                            },
                                                            {
                                                                label: "Success Dribbles",
                                                                value: aggregatedStats?.dribblesSuccessful ?? 0,
                                                                statId: "dribbles_successful",
                                                            },
                                                            {
                                                                label: "Aerial Duels Won",
                                                                value: aggregatedStats?.aerialDuelsWon ?? 0,
                                                                statId: "aerial_duels_won",
                                                            },
                                                            {
                                                                label: "Shots",
                                                                value: aggregatedStats?.shots ?? 0,
                                                                statId: "shots",
                                                            },
                                                            {
                                                                label: "Shots on Target",
                                                                value: aggregatedStats?.shotsOnTarget ?? 0,
                                                                statId: "shots_on_target",
                                                            },
                                                            {
                                                                label: "Shot Conv. Rate",
                                                                value: (() => {
                                                                    const shots = aggregatedStats?.shots || 0;
                                                                    const goals = aggregatedStats?.goals || 0;
                                                                    return shots > 0
                                                                        ? `${Math.round((goals / shots) * 100)}%`
                                                                        : "0%";
                                                                })(),
                                                                statId: "shot_conversion",
                                                            },
                                                            {
                                                                label: "Ball Touches",
                                                                value: aggregatedStats?.ballTouches ?? 0,
                                                                statId: "ball_touches",
                                                            },
                                                        ].map((stat) => (
                                                            <div
                                                                key={stat.label}
                                                                className="text-center p-3 rounded bg-secondary/50"
                                                            >
                                                                <span className="text-xl font-bold text-destructive block">
                                                                    {displayStat(stat.value)}
                                                                </span>
                                                                <span className="text-[10px] uppercase text-muted-foreground block">
                                                                    <StatHint statId={stat.statId} iconSize="sm">
                                                                        <span>{stat.label}</span>
                                                                    </StatHint>
                                                                </span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        </div>
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="empty"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="flex flex-col items-center justify-center min-h-[50vh] text-center"
                                    >
                                        <div className="w-20 h-20 rounded-2xl bg-secondary/50 flex items-center justify-center mb-4">
                                            <Users className="w-10 h-10 text-muted-foreground/50" />
                                        </div>
                                        <h3 className="text-lg font-semibold text-foreground mb-1">
                                            Select a Player
                                        </h3>
                                        <p className="text-sm text-muted-foreground max-w-sm">
                                            Choose a player from the list to view their aggregated
                                            season statistics
                                        </p>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default PlayerOverview;
