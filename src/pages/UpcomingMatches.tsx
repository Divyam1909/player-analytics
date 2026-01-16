import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import AuthHeader from '@/components/layout/AuthHeader';
import Sidebar from '@/components/layout/Sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    Clock,
    Calendar,
    MapPin,
    Trophy,
    Users,
    TrendingUp,
    ChevronRight,
    Shield,
    Target,
    AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Sample upcoming matches data
const upcomingMatchesData = [
    {
        id: 'upcoming-1',
        opponent: 'Mumbai City FC',
        date: '2026-01-25',
        time: '19:00',
        venue: 'Mumbai Football Arena',
        tournament: 'ISL League',
        importance: 'high',
        opponentRank: 2,
        lastResult: 'W 2-1',
        headToHead: { wins: 3, draws: 1, losses: 2 },
    },
    {
        id: 'upcoming-2',
        opponent: 'Bengaluru FC',
        date: '2026-02-01',
        time: '20:00',
        venue: 'Kanteerava Stadium',
        tournament: 'ISL League',
        importance: 'medium',
        opponentRank: 5,
        lastResult: 'D 1-1',
        headToHead: { wins: 2, draws: 2, losses: 1 },
    },
    {
        id: 'upcoming-3',
        opponent: 'Kolkata United',
        date: '2026-02-08',
        time: '17:30',
        venue: 'Salt Lake Stadium',
        tournament: 'Cup Quarterfinal',
        importance: 'high',
        opponentRank: 3,
        lastResult: 'L 0-2',
        headToHead: { wins: 1, draws: 0, losses: 3 },
    },
    {
        id: 'upcoming-4',
        opponent: 'Goa FC',
        date: '2026-02-15',
        time: '18:00',
        venue: 'Home Stadium',
        tournament: 'ISL League',
        importance: 'low',
        opponentRank: 8,
        lastResult: 'W 3-0',
        headToHead: { wins: 4, draws: 1, losses: 0 },
    },
];

const containerVariants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: { staggerChildren: 0.1 },
    },
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
};

const UpcomingMatches = () => {
    const [selectedMatch, setSelectedMatch] = useState<string | null>(null);

    const getImportanceColor = (importance: string) => {
        switch (importance) {
            case 'high': return 'border-destructive/50 bg-destructive/5';
            case 'medium': return 'border-warning/50 bg-warning/5';
            default: return 'border-border';
        }
    };

    const getImportanceBadge = (importance: string) => {
        switch (importance) {
            case 'high': return { text: 'High Priority', color: 'bg-destructive/20 text-destructive' };
            case 'medium': return { text: 'Medium Priority', color: 'bg-warning/20 text-warning' };
            default: return { text: 'Standard', color: 'bg-secondary text-muted-foreground' };
        }
    };

    const getDaysUntil = (dateStr: string) => {
        const date = new Date(dateStr);
        const now = new Date();
        const diff = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        if (diff === 0) return 'Today';
        if (diff === 1) return 'Tomorrow';
        if (diff < 0) return 'Passed';
        return `${diff} days`;
    };

    const getResultColor = (result: string) => {
        if (result.startsWith('W')) return 'text-emerald-500';
        if (result.startsWith('L')) return 'text-destructive';
        return 'text-muted-foreground';
    };

    return (
        <div className="min-h-screen bg-background">
            <AuthHeader title="Upcoming Matches" />
            <Sidebar />

            <main className="pt-24 pb-12 px-6 ml-64">
                <div className="container mx-auto">
                    {/* Header */}
                    <motion.div
                        className="mb-8"
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                    >
                        <h1 className="text-3xl font-bold text-foreground mb-2">
                            Upcoming <span className="text-primary">Matches</span>
                        </h1>
                        <p className="text-muted-foreground">
                            View and prepare for your next {upcomingMatchesData.length} fixtures
                        </p>
                    </motion.div>

                    {/* Summary Cards */}
                    <motion.div
                        className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8"
                        variants={containerVariants}
                        initial="hidden"
                        animate="show"
                    >
                        {[
                            { label: 'Next Match', value: getDaysUntil(upcomingMatchesData[0]?.date), icon: Clock, color: 'text-primary' },
                            { label: 'Upcoming', value: upcomingMatchesData.length, icon: Calendar, color: 'text-primary' },
                            { label: 'High Priority', value: upcomingMatchesData.filter(m => m.importance === 'high').length, icon: AlertCircle, color: 'text-destructive' },
                            { label: 'Home Games', value: upcomingMatchesData.filter(m => m.venue.includes('Home')).length, icon: Shield, color: 'text-emerald-500' },
                        ].map((stat, i) => (
                            <motion.div key={stat.label} variants={itemVariants}>
                                <Card className="bg-card border-border">
                                    <CardContent className="p-4 flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center">
                                            <stat.icon className={cn("w-6 h-6", stat.color)} />
                                        </div>
                                        <div>
                                            <p className={cn("text-2xl font-bold", stat.color)}>{stat.value}</p>
                                            <p className="text-xs text-muted-foreground uppercase tracking-wider">{stat.label}</p>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </motion.div>

                    {/* Matches List */}
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="show"
                        className="space-y-4"
                    >
                        {upcomingMatchesData.map((match, index) => {
                            const importanceBadge = getImportanceBadge(match.importance);
                            const isSelected = selectedMatch === match.id;

                            return (
                                <motion.div
                                    key={match.id}
                                    variants={itemVariants}
                                    onClick={() => setSelectedMatch(isSelected ? null : match.id)}
                                    className="cursor-pointer"
                                >
                                    <Card className={cn(
                                        "bg-card border-2 transition-all duration-300",
                                        getImportanceColor(match.importance),
                                        isSelected && "ring-2 ring-primary"
                                    )}>
                                        <CardContent className="p-0">
                                            {/* Main Row */}
                                            <div className="p-5 flex items-center gap-6">
                                                {/* Date Badge */}
                                                <div className="flex-shrink-0 text-center">
                                                    <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/30 flex flex-col items-center justify-center">
                                                        <span className="text-xs text-muted-foreground uppercase">
                                                            {new Date(match.date).toLocaleDateString('en-US', { month: 'short' })}
                                                        </span>
                                                        <span className="text-2xl font-bold text-primary">
                                                            {new Date(match.date).getDate()}
                                                        </span>
                                                    </div>
                                                    <p className="text-[10px] text-muted-foreground mt-1">{getDaysUntil(match.date)}</p>
                                                </div>

                                                {/* Match Info */}
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-3 mb-1">
                                                        <h3 className="text-lg font-bold text-foreground">vs {match.opponent}</h3>
                                                        <span className={cn("text-[10px] px-2 py-0.5 rounded-full font-medium", importanceBadge.color)}>
                                                            {importanceBadge.text}
                                                        </span>
                                                    </div>
                                                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                                                        <span className="flex items-center gap-1">
                                                            <Clock className="w-3.5 h-3.5" />
                                                            {match.time}
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            <MapPin className="w-3.5 h-3.5" />
                                                            {match.venue}
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            <Trophy className="w-3.5 h-3.5" />
                                                            {match.tournament}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Quick Stats */}
                                                <div className="flex items-center gap-6">
                                                    <div className="text-center">
                                                        <p className="text-xs text-muted-foreground mb-1">Opponent Rank</p>
                                                        <p className="text-lg font-bold text-foreground">#{match.opponentRank}</p>
                                                    </div>
                                                    <div className="text-center">
                                                        <p className="text-xs text-muted-foreground mb-1">Last Result</p>
                                                        <p className={cn("text-lg font-bold", getResultColor(match.lastResult))}>
                                                            {match.lastResult}
                                                        </p>
                                                    </div>
                                                    <ChevronRight className={cn(
                                                        "w-5 h-5 text-muted-foreground transition-transform",
                                                        isSelected && "rotate-90"
                                                    )} />
                                                </div>
                                            </div>

                                            {/* Expanded Details */}
                                            {isSelected && (
                                                <motion.div
                                                    initial={{ opacity: 0, height: 0 }}
                                                    animate={{ opacity: 1, height: 'auto' }}
                                                    exit={{ opacity: 0, height: 0 }}
                                                    className="border-t border-border"
                                                >
                                                    <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-6">
                                                        {/* Head to Head */}
                                                        <div className="bg-secondary/30 rounded-lg p-4">
                                                            <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                                                                <TrendingUp className="w-4 h-4 text-primary" />
                                                                Head to Head
                                                            </h4>
                                                            <div className="flex items-center justify-around">
                                                                <div className="text-center">
                                                                    <p className="text-2xl font-bold text-emerald-500">{match.headToHead.wins}</p>
                                                                    <p className="text-[10px] text-muted-foreground uppercase">Wins</p>
                                                                </div>
                                                                <div className="text-center">
                                                                    <p className="text-2xl font-bold text-muted-foreground">{match.headToHead.draws}</p>
                                                                    <p className="text-[10px] text-muted-foreground uppercase">Draws</p>
                                                                </div>
                                                                <div className="text-center">
                                                                    <p className="text-2xl font-bold text-destructive">{match.headToHead.losses}</p>
                                                                    <p className="text-[10px] text-muted-foreground uppercase">Losses</p>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Opponent Overview */}
                                                        <div className="bg-secondary/30 rounded-lg p-4">
                                                            <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                                                                <Users className="w-4 h-4 text-primary" />
                                                                Opponent Overview
                                                            </h4>
                                                            <div className="space-y-2 text-sm">
                                                                <div className="flex justify-between">
                                                                    <span className="text-muted-foreground">League Position</span>
                                                                    <span className="font-medium text-foreground">#{match.opponentRank}</span>
                                                                </div>
                                                                <div className="flex justify-between">
                                                                    <span className="text-muted-foreground">Form</span>
                                                                    <span className="font-medium text-foreground">W W D L W</span>
                                                                </div>
                                                                <div className="flex justify-between">
                                                                    <span className="text-muted-foreground">Key Player</span>
                                                                    <span className="font-medium text-foreground">TBD</span>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Actions */}
                                                        <div className="bg-secondary/30 rounded-lg p-4 flex flex-col justify-center gap-3">
                                                            <Button className="w-full" variant="default">
                                                                <Target className="w-4 h-4 mr-2" />
                                                                Pre-Match Analysis
                                                            </Button>
                                                            <Button className="w-full" variant="outline">
                                                                <Users className="w-4 h-4 mr-2" />
                                                                Select Starting XI
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            );
                        })}
                    </motion.div>
                </div>
            </main>
        </div>
    );
};

export default UpcomingMatches;
