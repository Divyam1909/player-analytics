import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import AuthHeader from '@/components/layout/AuthHeader';
import Sidebar from '@/components/layout/Sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { Player } from '@/types/player';
import playersData from '@/data/players.json';
import {
    Trophy,
    Target,
    TrendingUp,
    Video,
    Calendar,
    Eye,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Animation variants
const containerVariants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
        },
    },
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
};

interface MatchData {
    matchId: string;
    opponent: string;
    date: string;
    teamName: string;
    tournament: string;
    tier?: string;
    homeScore: number;
    awayScore: number;
    status: 'registered' | 'pending' | 'completed';
}

const CoachDashboard = () => {
    const { user } = useAuth();
    const players = playersData.players as Player[];

    // Extract matches and calculate stats
    const { matches, stats } = useMemo(() => {
        const matchMap = new Map<string, MatchData>();
        let totalGoalsScored = 0;
        let totalGoalsConceded = 0;

        players.forEach((player) => {
            player.matchStats.forEach((match) => {
                if (!matchMap.has(match.matchId)) {
                    // Calculate team score
                    const teamGoals = players.reduce((total, p) => {
                        const playerMatch = p.matchStats.find(m => m.matchId === match.matchId);
                        return total + (playerMatch?.stats.goals || 0);
                    }, 0);

                    // Simulated opponent score for demo
                    const opponentScore = Math.floor(Math.random() * 5);

                    matchMap.set(match.matchId, {
                        matchId: match.matchId,
                        opponent: match.opponent,
                        date: match.date,
                        teamName: player.team,
                        tournament: 'MFA Men\'s Premiere League',
                        tier: match.matchId === 'm2' ? 'MFA Men\'s Premiere League (Tier 1)' : undefined,
                        homeScore: teamGoals,
                        awayScore: opponentScore,
                        status: 'registered',
                    });

                    totalGoalsScored += teamGoals;
                    totalGoalsConceded += opponentScore;
                }
            });
        });

        const matchesArray = Array.from(matchMap.values()).sort((a, b) =>
            new Date(b.date).getTime() - new Date(a.date).getTime()
        );

        // Calculate wins, draws, losses
        let wins = 0, draws = 0, losses = 0;
        matchesArray.forEach(m => {
            if (m.homeScore > m.awayScore) wins++;
            else if (m.homeScore < m.awayScore) losses++;
            else draws++;
        });

        return {
            matches: matchesArray,
            stats: {
                totalMatches: matchesArray.length,
                wins,
                draws,
                losses,
                goalsScored: totalGoalsScored,
                goalsConceded: totalGoalsConceded,
                goalDifference: totalGoalsScored - totalGoalsConceded,
                recentForm: matchesArray.slice(0, 4).map(m =>
                    m.homeScore > m.awayScore ? 'W' : m.homeScore < m.awayScore ? 'L' : 'D'
                ),
            },
        };
    }, [players]);

    const coachName = user?.name || 'Coach';
    const teamName = user?.team || 'Bombay Gymkhana Men';

    return (
        <div className="min-h-screen bg-background">
            <AuthHeader title="Dashboard" />
            <Sidebar />

            <main className="pt-24 pb-12 px-6 ml-64">
                <div className="container mx-auto">
                    {/* Welcome Section */}
                    <motion.div
                        className="mb-8 p-6 rounded-xl bg-card border border-border"
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                    >
                        <h1 className="text-3xl font-bold text-foreground">
                            Welcome Coach {coachName} to Thinking Engines!
                        </h1>
                        <p className="text-muted-foreground mt-1">
                            Managing {teamName}
                        </p>
                    </motion.div>

                    {/* Stats Cards */}
                    <motion.div
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
                        variants={containerVariants}
                        initial="hidden"
                        animate="show"
                    >
                        {/* Match Record */}
                        <motion.div variants={itemVariants}>
                            <Card className="bg-card border-border h-full">
                                <CardContent className="pt-6">
                                    <div className="flex items-center gap-2 text-muted-foreground mb-3">
                                        <Trophy className="w-4 h-4" />
                                        <span className="text-sm font-medium">Match Record</span>
                                    </div>
                                    <p className="text-3xl font-bold text-foreground mb-3">
                                        {stats.totalMatches} Matches
                                    </p>
                                    <div className="flex gap-2">
                                        <span className="px-2 py-1 rounded text-xs font-bold bg-emerald-500 text-white">
                                            {stats.wins}W
                                        </span>
                                        <span className="px-2 py-1 rounded text-xs font-bold bg-gray-500 text-white">
                                            {stats.draws}D
                                        </span>
                                        <span className="px-2 py-1 rounded text-xs font-bold bg-red-500 text-white">
                                            {stats.losses}L
                                        </span>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>

                        {/* Goal Statistics */}
                        <motion.div variants={itemVariants}>
                            <Card className="bg-card border-border h-full">
                                <CardContent className="pt-6">
                                    <div className="flex items-center gap-2 text-muted-foreground mb-3">
                                        <Target className="w-4 h-4" />
                                        <span className="text-sm font-medium">Goal Statistics</span>
                                    </div>
                                    <div className="flex items-baseline gap-3 mb-2">
                                        <span className="text-3xl font-bold text-emerald-500">{stats.goalsScored}</span>
                                        <span className="text-muted-foreground">-</span>
                                        <span className="text-3xl font-bold text-red-500">{stats.goalsConceded}</span>
                                    </div>
                                    <div className="flex gap-4 text-xs text-muted-foreground">
                                        <span>Scored</span>
                                        <span>Conceded</span>
                                    </div>
                                    <p className="text-sm text-muted-foreground mt-2">
                                        Goal Difference: <span className={stats.goalDifference >= 0 ? 'text-emerald-500' : 'text-red-500'}>
                                            {stats.goalDifference > 0 ? '+' : ''}{stats.goalDifference}
                                        </span>
                                    </p>
                                </CardContent>
                            </Card>
                        </motion.div>

                        {/* Recent Form */}
                        <motion.div variants={itemVariants}>
                            <Card className="bg-card border-border h-full">
                                <CardContent className="pt-6">
                                    <div className="flex items-center gap-2 text-muted-foreground mb-3">
                                        <TrendingUp className="w-4 h-4" />
                                        <span className="text-sm font-medium">Recent Form</span>
                                    </div>
                                    <div className="flex gap-2 mb-2">
                                        {stats.recentForm.map((result, i) => (
                                            <span
                                                key={i}
                                                className={cn(
                                                    "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white",
                                                    result === 'W' && "bg-emerald-500",
                                                    result === 'L' && "bg-red-500",
                                                    result === 'D' && "bg-gray-500"
                                                )}
                                            >
                                                {result}
                                            </span>
                                        ))}
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                        Last {stats.recentForm.length} matches
                                    </p>
                                </CardContent>
                            </Card>
                        </motion.div>

                        {/* Pre-Match Videos */}
                        <motion.div variants={itemVariants}>
                            <Card className="bg-card border-border h-full">
                                <CardContent className="pt-6">
                                    <div className="flex items-center gap-2 text-muted-foreground mb-3">
                                        <Video className="w-4 h-4" />
                                        <span className="text-sm font-medium">Pre-Match Videos</span>
                                    </div>
                                    <p className="text-3xl font-bold text-foreground mb-2">
                                        0 Videos
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        No videos available
                                    </p>
                                </CardContent>
                            </Card>
                        </motion.div>
                    </motion.div>

                    {/* Recent Matches */}
                    <Card className="bg-card border-border">
                        <CardHeader>
                            <CardTitle className="text-xl">Recent Matches</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <motion.div
                                className="space-y-2"
                                variants={containerVariants}
                                initial="hidden"
                                animate="show"
                            >
                                {matches.map((match) => {
                                    const isWin = match.homeScore > match.awayScore;
                                    const isLoss = match.homeScore < match.awayScore;

                                    return (
                                        <Link
                                            key={match.matchId}
                                            to={`/match/${match.matchId}`}
                                            className="block"
                                        >
                                            <motion.div
                                                variants={itemVariants}
                                                className="flex items-center justify-between p-4 rounded-lg hover:bg-secondary/50 transition-colors border border-border cursor-pointer group"
                                            >
                                                <div className="flex-1">
                                                    <p className="font-medium text-foreground group-hover:text-primary transition-colors">
                                                        {teamName} vs {match.opponent}
                                                    </p>
                                                    <div className="flex flex-wrap items-center gap-2 mt-1">
                                                        {/* Score Badge */}
                                                        <span
                                                            className={cn(
                                                                "px-2 py-0.5 rounded text-xs font-bold text-white",
                                                                isWin && "bg-emerald-500",
                                                                isLoss && "bg-red-500",
                                                                !isWin && !isLoss && "bg-gray-500"
                                                            )}
                                                        >
                                                            {match.homeScore} - {match.awayScore}
                                                        </span>

                                                        {/* Date */}
                                                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                                            <Calendar className="w-3 h-3" />
                                                            {new Date(match.date).toLocaleDateString('en-US', {
                                                                month: 'short',
                                                                day: 'numeric',
                                                            })}
                                                        </span>

                                                        {/* Tournament */}
                                                        <span className="text-xs text-muted-foreground">
                                                            {match.tournament}
                                                        </span>

                                                        {/* Tier if exists */}
                                                        {match.tier && (
                                                            <span className="text-xs text-muted-foreground">
                                                                {match.tier}
                                                            </span>
                                                        )}

                                                        {/* Status Badge */}
                                                        <span className="px-2 py-0.5 rounded text-xs font-medium bg-emerald-500/20 text-emerald-500 border border-emerald-500/30">
                                                            Registered
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Arrow Icon */}
                                                <div className="flex items-center gap-1 text-sm text-muted-foreground group-hover:text-primary transition-colors">
                                                    <Eye className="w-4 h-4" />
                                                </div>
                                            </motion.div>
                                        </Link>
                                    );
                                })}
                            </motion.div>
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    );
};

export default CoachDashboard;
