import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import AuthHeader from "@/components/layout/AuthHeader";
import Sidebar from "@/components/layout/Sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Calendar, Eye, ChevronRight, Search } from "lucide-react";
import playersData from "@/data/players.json";
import { Player } from "@/types/player";

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

const MatchSelection = () => {
    const [searchQuery, setSearchQuery] = useState("");

    const players = playersData.players as Player[];

    // Extract unique matches from player data
    const matches = useMemo(() => {
        const matchMap = new Map<string, MatchData>();

        players.forEach((player) => {
            player.matchStats.forEach((match) => {
                if (!matchMap.has(match.matchId)) {
                    // Calculate team score (sum of goals from all players in that match)
                    const teamGoals = players.reduce((total, p) => {
                        const playerMatch = p.matchStats.find(m => m.matchId === match.matchId);
                        return total + (playerMatch?.stats.goals || 0);
                    }, 0);

                    matchMap.set(match.matchId, {
                        matchId: match.matchId,
                        opponent: match.opponent,
                        date: match.date,
                        teamName: player.team,
                        tournament: "MFA Women's Premier League", // Default tournament name
                        homeScore: teamGoals,
                        awayScore: Math.floor(Math.random() * 3), // Simulated opponent score
                    });
                }
            });
        });

        return Array.from(matchMap.values()).sort((a, b) =>
            new Date(b.date).getTime() - new Date(a.date).getTime()
        );
    }, [players]);

    // Filter matches based on search
    const filteredMatches = useMemo(() => {
        if (!searchQuery.trim()) return matches;
        const query = searchQuery.toLowerCase();
        return matches.filter(
            (match) =>
                match.opponent.toLowerCase().includes(query) ||
                match.teamName.toLowerCase().includes(query) ||
                match.tournament.toLowerCase().includes(query)
        );
    }, [matches, searchQuery]);

    return (
        <div className="min-h-screen bg-background">
            <AuthHeader title="Match Center" />
            <Sidebar />

            <main className="pt-24 pb-12 px-6 ml-64">
                <div className="container mx-auto">
                    {/* Page Header */}
                    <motion.div
                        className="mb-8"
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                    >
                        <h1 className="text-3xl font-bold text-foreground mb-2">
                            Match <span className="text-primary">Center</span>
                        </h1>
                        <p className="text-muted-foreground">
                            Select a match to view detailed analytics and player performance
                        </p>
                    </motion.div>

                    {/* Past Matches Card */}
                    <Card className="bg-card border-border">
                        <CardHeader className="flex flex-row items-center justify-between pb-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-primary/10">
                                    <Trophy className="w-5 h-5 text-primary" />
                                </div>
                                <div>
                                    <CardTitle className="text-xl">Past Matches</CardTitle>
                                    <p className="text-sm text-muted-foreground">Your completed match history</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                {/* Search Bar */}
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <input
                                        type="text"
                                        placeholder="Search matches..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-64 pl-10 pr-4 py-2 text-sm rounded-lg bg-secondary border border-border focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
                                    />
                                </div>
                                <span className="px-3 py-1 rounded-lg bg-secondary text-sm font-medium">
                                    {filteredMatches.length} Matches
                                </span>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {/* Table Header */}
                            <div className="grid grid-cols-12 gap-4 px-4 py-3 text-xs uppercase tracking-wider text-muted-foreground border-b border-border mb-2">
                                <div className="col-span-4">Match</div>
                                <div className="col-span-2 text-center">Score</div>
                                <div className="col-span-2">Date</div>
                                <div className="col-span-3">Tournament</div>
                                <div className="col-span-1 text-right">Action</div>
                            </div>

                            {/* Match List */}
                            <motion.div
                                className="space-y-1"
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
                                    filteredMatches.map((match) => (
                                        <motion.div
                                            key={match.matchId}
                                            variants={itemVariants}
                                            className="group"
                                        >
                                            <Link
                                                to={`/match/${match.matchId}`}
                                                className="grid grid-cols-12 gap-4 items-center px-4 py-4 rounded-lg hover:bg-secondary/50 transition-all duration-200 border-l-4 border-primary/70 hover:border-primary"
                                            >
                                                {/* Match Name */}
                                                <div className="col-span-4">
                                                    <p className="font-medium text-foreground">
                                                        {match.teamName} vs {match.opponent}
                                                    </p>
                                                </div>

                                                {/* Score */}
                                                <div className="col-span-2 flex justify-center">
                                                    <span className="px-4 py-1.5 rounded-md bg-primary text-primary-foreground font-bold text-sm">
                                                        {match.homeScore} - {match.awayScore}
                                                    </span>
                                                </div>

                                                {/* Date */}
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

                                                {/* Tournament */}
                                                <div className="col-span-3">
                                                    <span className="text-sm text-primary">
                                                        {match.tournament}
                                                    </span>
                                                </div>

                                                {/* Action */}
                                                <div className="col-span-1 flex items-center justify-end gap-1 text-muted-foreground group-hover:text-primary transition-colors">
                                                    <Eye className="w-4 h-4" />
                                                    <span className="text-sm font-medium">View Details</span>
                                                    <ChevronRight className="w-4 h-4 opacity-0 -ml-1 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                                                </div>
                                            </Link>
                                        </motion.div>
                                    ))
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
