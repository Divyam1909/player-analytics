import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { motion } from 'framer-motion';
import AuthHeader from '@/components/layout/AuthHeader';
import Sidebar from '@/components/layout/Sidebar';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import {
    Trophy,
    Target,
    TrendingUp,
    Video,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSidebarContext } from '@/contexts/SidebarContext';

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
    const { isCollapsed } = useSidebarContext();

    // Extract matches and calculate stats
    const { data: matches = [], isLoading } = useQuery({
        queryKey: ['dashboard-matches'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('matches')
                .select(`
                    id,
                    match_date,
                    competition_name,
                    home_score,
                    away_score,
                    home_team:home_team_id(team_name),
                    away_team:away_team_id(team_name)
                `)
                .order('match_date', { ascending: false });

            if (error) throw error;

            return ((data as any[]) || []).map(m => ({
                matchId: m.id,
                opponent: (m.away_team as any)?.team_name || 'Opponent',
                date: m.match_date,
                teamName: (m.home_team as any)?.team_name || 'Team',
                tournament: m.competition_name,
                tier: undefined,
                homeScore: m.home_score,
                awayScore: m.away_score,
                status: 'completed' as const,
            }));
        }
    });

    const stats = useMemo(() => {
        let wins = 0, draws = 0, losses = 0;
        let totalGoalsScored = 0;
        let totalGoalsConceded = 0;

        matches.forEach(m => {
            if (m.homeScore > m.awayScore) wins++;
            else if (m.homeScore < m.awayScore) losses++;
            else draws++;

            totalGoalsScored += m.homeScore;
            totalGoalsConceded += m.awayScore;
        });

        return {
            totalMatches: matches.length,
            wins,
            draws,
            losses,
            goalsScored: totalGoalsScored,
            goalsConceded: totalGoalsConceded,
            goalDifference: totalGoalsScored - totalGoalsConceded,
            recentForm: matches.slice(0, 4).map(m =>
                m.homeScore > m.awayScore ? 'W' : m.homeScore < m.awayScore ? 'L' : 'D'
            ),
        };
    }, [matches]);

    const coachName = user?.name || 'Coach';
    const teamName = user?.team || 'Team';

    return (
        <div className="min-h-screen bg-background">
            <AuthHeader title="Dashboard" />
            <Sidebar />

            <main className={cn(
                "pt-24 pb-12 px-6 transition-all duration-300",
                isCollapsed ? "ml-16" : "ml-64"
            )}>
                <div className="container mx-auto">
                    {/* Welcome Section */}
                    <motion.div
                        className="mb-8 p-6 rounded-xl bg-card border border-border"
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                    >
                        <h1 className="text-3xl font-bold text-foreground">
                            Welcome Coach {coachName}!
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

                </div>
            </main>
        </div>
    );
};

export default CoachDashboard;
