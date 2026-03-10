import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import AuthHeader from "@/components/layout/AuthHeader";
import Sidebar from "@/components/layout/Sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Calendar, Eye, ChevronRight, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSidebarContext } from "@/contexts/SidebarContext";

// Animation variants
const containerVariants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.05,
        },
    },
};

const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    show: { opacity: 1, x: 0 },
};

interface MatchData {
    matchId: string;
    opponent: string;
    date: string;
    teamName: string;
    tournament: string;
    homeScore: number;
    awayScore: number;
}


interface MatchResponse {
    id: string;
    match_date: string;
    competition_name: string;
    home_score: number;
    away_score: number;
    home_team: { team_name: string } | null;
    away_team: { team_name: string } | null;
}

const MatchSelection = () => {
    const [searchQuery, setSearchQuery] = useState("");
    const { isCollapsed } = useSidebarContext();

    const { data: matches = [], isLoading } = useQuery<MatchResponse[]>({
        queryKey: ['matches'],
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
            return data as unknown as MatchResponse[]; // Cast since Supabase types might be distinct
        }
    });

    const formattedMatches = useMemo(() => {
        return matches.map(match => {
            // Helper to get team name safely
            const getTeamName = (team: any) => team?.team_name || 'Unknown Team';

            return {
                matchId: match.id,
                opponent: getTeamName(match.away_team), // Assuming format Team vs Opponent
                date: match.match_date,
                teamName: getTeamName(match.home_team),
                tournament: match.competition_name,
                homeScore: match.home_score,
                awayScore: match.away_score,
            };
        });
    }, [matches]);

    // Filter matches based on search
    const filteredMatches = useMemo(() => {
        if (!searchQuery.trim()) return formattedMatches;
        const query = searchQuery.toLowerCase();
        return formattedMatches.filter(
            (match) =>
                match.opponent.toLowerCase().includes(query) ||
                match.teamName.toLowerCase().includes(query) ||
                match.tournament.toLowerCase().includes(query)
        );
    }, [formattedMatches, searchQuery]);

    return (
        <div className="min-h-screen bg-background">
            <AuthHeader title="Match Center" />
            <Sidebar />

            <main className={cn(
                "pt-20 sm:pt-24 pb-12 px-3 sm:px-6 transition-all duration-300",
                isCollapsed ? "lg:ml-16 ml-0" : "lg:ml-64 ml-0"
            )}>
                <div className="container mx-auto">
                    {/* Page Header */}
                    <motion.div
                        className="mb-6 sm:mb-8"
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                    >
                        <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-1 sm:mb-2">
                            Match <span className="text-primary">Center</span>
                        </h1>
                        <p className="text-sm sm:text-base text-muted-foreground">
                            Select a match to view detailed analytics and player performance
                        </p>
                    </motion.div>

                    {/* All Matches Card */}
                    <Card className="bg-card border-border">
                        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-primary/10 shrink-0">
                                    <Trophy className="w-5 h-5 text-primary" />
                                </div>
                                <div>
                                    <CardTitle className="text-lg sm:text-xl">All Matches</CardTitle>
                                    <p className="text-xs sm:text-sm text-muted-foreground">Your complete match history</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 sm:gap-4">
                                {/* Search Bar */}
                                <div className="relative flex-1 sm:flex-none">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <input
                                        type="text"
                                        placeholder="Search matches..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full sm:w-64 pl-10 pr-4 py-2 text-sm rounded-lg bg-secondary border border-border focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
                                    />
                                </div>
                                <span className="px-2 sm:px-3 py-1 rounded-lg bg-secondary text-xs sm:text-sm font-medium whitespace-nowrap shrink-0">
                                    {filteredMatches.length} Matches
                                </span>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {/* Table Header - hidden on mobile */}
                            <div className="hidden md:grid grid-cols-12 gap-4 px-4 py-3 text-xs uppercase tracking-wider text-muted-foreground border-b border-border mb-2">
                                <div className="col-span-4">Match</div>
                                <div className="col-span-2 text-center">Score</div>
                                <div className="col-span-2">Date</div>
                                <div className="col-span-3">Tournament</div>
                                <div className="col-span-1 text-right">Action</div>
                            </div>

                            {/* Match List */}
                            <motion.div
                                className="space-y-2 sm:space-y-1"
                                variants={containerVariants}
                                initial="hidden"
                                animate="show"
                            >
                                {filteredMatches.length === 0 ? (
                                    <div className="text-center py-12 text-muted-foreground">
                                        <Search className="w-12 h-12 mx-auto mb-4 opacity-30" />
                                        <p>No matches found</p>
                                    </div>
                                ) : (
                                    filteredMatches.map((match) => {
                                        const isWin = match.homeScore > match.awayScore;
                                        const isLoss = match.homeScore < match.awayScore;

                                        return (
                                            <motion.div
                                                key={match.matchId}
                                                variants={itemVariants}
                                                className="group"
                                            >
                                                {/* Desktop: grid layout */}
                                                <Link
                                                    to={`/match/${match.matchId}`}
                                                    className="relative overflow-hidden hidden md:grid grid-cols-12 gap-4 items-center px-4 py-4 rounded-lg hover:bg-secondary/50 transition-all duration-200 border border-border"
                                                >
                                                    <div className={cn(
                                                        "absolute left-0 top-0 bottom-0 w-1.5 rounded-l-lg",
                                                        isWin && "bg-emerald-500",
                                                        isLoss && "bg-red-500",
                                                        !isWin && !isLoss && "bg-orange-500"
                                                    )} />
                                                    <div className="col-span-4">
                                                        <p className="font-medium text-foreground">
                                                            {match.teamName} vs {match.opponent}
                                                        </p>
                                                    </div>
                                                    <div className="col-span-2 flex justify-center">
                                                        <span className="px-4 py-1.5 rounded-md bg-primary text-primary-foreground font-bold text-sm">
                                                            {match.homeScore} - {match.awayScore}
                                                        </span>
                                                    </div>
                                                    <div className="col-span-2 flex items-center gap-2 text-muted-foreground">
                                                        <Calendar className="w-4 h-4" />
                                                        <span className="text-sm">
                                                            {new Date(match.date).toLocaleDateString('en-US', {
                                                                month: 'short',
                                                                day: 'numeric',
                                                                year: 'numeric'
                                                            })}
                                                        </span>
                                                    </div>
                                                    <div className="col-span-3">
                                                        <span className="text-sm text-primary">
                                                            {match.tournament}
                                                        </span>
                                                    </div>
                                                    <div className="col-span-1 flex items-center justify-end gap-1 text-muted-foreground group-hover:text-primary transition-colors">
                                                        <Eye className="w-4 h-4" />
                                                        <span className="text-sm font-medium">View Details</span>
                                                        <ChevronRight className="w-4 h-4 opacity-0 -ml-1 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                                                    </div>
                                                </Link>

                                                {/* Mobile: card layout */}
                                                <Link
                                                    to={`/match/${match.matchId}`}
                                                    className="relative overflow-hidden md:hidden flex flex-col gap-2 p-3 rounded-lg hover:bg-secondary/50 transition-all duration-200 border border-border"
                                                >
                                                    <div className={cn(
                                                        "absolute left-0 top-0 bottom-0 w-1.5 rounded-l-lg",
                                                        isWin && "bg-emerald-500",
                                                        isLoss && "bg-red-500",
                                                        !isWin && !isLoss && "bg-orange-500"
                                                    )} />
                                                    <div className="flex items-center justify-between pl-2">
                                                        <p className="font-medium text-sm text-foreground truncate flex-1">
                                                            {match.teamName} vs {match.opponent}
                                                        </p>
                                                        <span className="px-3 py-1 rounded-md bg-primary text-primary-foreground font-bold text-sm ml-2 shrink-0">
                                                            {match.homeScore} - {match.awayScore}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center justify-between pl-2 text-xs text-muted-foreground">
                                                        <span className="flex items-center gap-1">
                                                            <Calendar className="w-3 h-3" />
                                                            {new Date(match.date).toLocaleDateString('en-US', {
                                                                month: 'short',
                                                                day: 'numeric',
                                                                year: 'numeric'
                                                            })}
                                                        </span>
                                                        <span className="text-primary text-xs truncate ml-2">
                                                            {match.tournament}
                                                        </span>
                                                    </div>
                                                </Link>
                                            </motion.div>
                                        );
                                    })
                                )}
                            </motion.div>
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    );
};

export default MatchSelection;
