import { useState, useMemo, useEffect } from "react";
import { useParams, Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Header from "@/components/layout/Header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, BarChart3, Users, Activity, FileText, PlayCircle, Video } from "lucide-react";
import playersData from "@/data/players.json";
import { Player } from "@/types/player";

// Import existing page components
import TeamAnalytics from "./TeamAnalytics";
import Overview from "./Overview";
import PlayerStats from "./PlayerStats";

const MatchDetails = () => {
    const { matchId } = useParams<{ matchId: string }>();
    const location = useLocation();
    const navigate = useNavigate();

    // Valid tab values
    const VALID_TABS = ["overview", "player-overview", "player-stats", "annotation", "pre-match", "match-video"];

    // Get initial tab from URL hash or default to "overview"
    const getInitialTab = () => {
        const hash = location.hash.replace("#", "");
        return VALID_TABS.includes(hash) ? hash : "overview";
    };

    const [activeTab, setActiveTab] = useState(getInitialTab);

    // Update URL hash when tab changes
    const handleTabChange = (tab: string) => {
        setActiveTab(tab);
        navigate(`${location.pathname}#${tab}`, { replace: true });
    };

    // Sync tab with URL hash on navigation
    useEffect(() => {
        const hash = location.hash.replace("#", "");
        if (VALID_TABS.includes(hash) && hash !== activeTab) {
            setActiveTab(hash);
        }
    }, [location.hash]);

    const players = playersData.players as Player[];

    // Find match details
    const matchDetails = useMemo(() => {
        for (const player of players) {
            const match = player.matchStats.find(m => m.matchId === matchId);
            if (match) {
                // Calculate team score
                const teamGoals = players.reduce((total, p) => {
                    const playerMatch = p.matchStats.find(m => m.matchId === matchId);
                    return total + (playerMatch?.stats.goals || 0);
                }, 0);

                return {
                    matchId: match.matchId,
                    opponent: match.opponent,
                    date: match.date,
                    teamName: player.team,
                    homeScore: teamGoals,
                    awayScore: Math.floor(Math.random() * 3),
                };
            }
        }
        return null;
    }, [matchId, players]);

    if (!matchDetails) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center">
                    <p className="text-muted-foreground mb-4">Match not found</p>
                    <Link to="/" className="text-primary hover:underline">
                        Back to Match Selection
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            <Header />

            <main className="pt-24 pb-12 px-6">
                <div className="container mx-auto">
                    {/* Back Button */}
                    <Link
                        to="/"
                        className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Matches
                    </Link>

                    {/* Match Header */}
                    <motion.div
                        className="relative overflow-hidden rounded-xl border border-border bg-card p-6 mb-6"
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5" />
                        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-primary/10 to-transparent rounded-bl-full" />

                        <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                            <div>
                                <h1 className="text-2xl font-bold text-foreground mb-2">
                                    {matchDetails.teamName} vs {matchDetails.opponent}
                                </h1>
                                <p className="text-muted-foreground">
                                    {new Date(matchDetails.date).toLocaleDateString('en-US', {
                                        weekday: 'long',
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}
                                </p>
                            </div>

                            <div className="flex items-center gap-4">
                                <div className="text-center">
                                    <p className="text-xs uppercase text-muted-foreground mb-1">{matchDetails.teamName}</p>
                                    <p className="text-3xl font-bold text-primary">{matchDetails.homeScore}</p>
                                </div>
                                <div className="text-2xl font-light text-muted-foreground">-</div>
                                <div className="text-center">
                                    <p className="text-xs uppercase text-muted-foreground mb-1">{matchDetails.opponent}</p>
                                    <p className="text-3xl font-bold text-foreground">{matchDetails.awayScore}</p>
                                </div>
                                {/* Win/Loss/Draw Badge with Glow */}
                                <div className={`ml-4 px-4 py-1.5 rounded-full text-sm font-bold uppercase shadow-lg ${matchDetails.homeScore > matchDetails.awayScore
                                    ? 'bg-success/30 text-success border border-success/50 shadow-success/30'
                                    : matchDetails.homeScore < matchDetails.awayScore
                                        ? 'bg-destructive/30 text-destructive border border-destructive/50 shadow-destructive/30'
                                        : 'bg-warning/30 text-warning border border-warning/50 shadow-warning/30'
                                    }`}
                                    style={{
                                        boxShadow: matchDetails.homeScore > matchDetails.awayScore
                                            ? '0 0 15px 2px hsl(var(--success) / 0.4)'
                                            : matchDetails.homeScore < matchDetails.awayScore
                                                ? '0 0 15px 2px hsl(var(--destructive) / 0.4)'
                                                : '0 0 15px 2px hsl(var(--warning) / 0.4)'
                                    }}
                                >
                                    {matchDetails.homeScore > matchDetails.awayScore
                                        ? 'Win'
                                        : matchDetails.homeScore < matchDetails.awayScore
                                            ? 'Loss'
                                            : 'Draw'}
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Tabs */}
                    <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
                        <TabsList className="bg-secondary border border-border flex flex-wrap h-auto gap-1 p-1">
                            <TabsTrigger
                                value="overview"
                                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground flex items-center gap-2"
                            >
                                <BarChart3 className="w-4 h-4" />
                                Overview
                            </TabsTrigger>
                            <TabsTrigger
                                value="player-overview"
                                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground flex items-center gap-2"
                            >
                                <Users className="w-4 h-4" />
                                Player Overview
                            </TabsTrigger>
                            <TabsTrigger
                                value="player-stats"
                                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground flex items-center gap-2"
                            >
                                <Activity className="w-4 h-4" />
                                Player Stats
                            </TabsTrigger>
                            <TabsTrigger
                                value="annotation"
                                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground flex items-center gap-2"
                            >
                                <FileText className="w-4 h-4" />
                                Annotation
                            </TabsTrigger>
                            <TabsTrigger
                                value="pre-match"
                                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground flex items-center gap-2"
                            >
                                <PlayCircle className="w-4 h-4" />
                                Pre Match
                            </TabsTrigger>
                            <TabsTrigger
                                value="match-video"
                                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground flex items-center gap-2"
                            >
                                <Video className="w-4 h-4" />
                                Match Video
                            </TabsTrigger>
                        </TabsList>

                        {/* Overview Tab - Team Analytics Page */}
                        <TabsContent value="overview" className="mt-0">
                            <TeamAnalytics embedded defaultMatchId={matchId} />
                        </TabsContent>

                        {/* Player Overview Tab - Overview Page */}
                        <TabsContent value="player-overview" className="mt-0">
                            <Overview embedded />
                        </TabsContent>

                        {/* Player Stats Tab - PlayerStats Page */}
                        <TabsContent value="player-stats" className="mt-0">
                            <PlayerStats embedded defaultMatchId={matchId} />
                        </TabsContent>

                        {/* Annotation Tab - Placeholder */}
                        <TabsContent value="annotation" className="space-y-6">
                            <Card className="bg-card border-border">
                                <CardContent className="flex flex-col items-center justify-center py-16">
                                    <FileText className="w-16 h-16 text-muted-foreground/30 mb-4" />
                                    <h3 className="text-xl font-semibold text-foreground mb-2">Annotation</h3>
                                    <p className="text-muted-foreground text-center max-w-md">
                                        Match annotation features coming soon. You'll be able to add notes and markers to key moments.
                                    </p>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Pre Match Tab - Placeholder */}
                        <TabsContent value="pre-match" className="space-y-6">
                            <Card className="bg-card border-border">
                                <CardContent className="flex flex-col items-center justify-center py-16">
                                    <PlayCircle className="w-16 h-16 text-muted-foreground/30 mb-4" />
                                    <h3 className="text-xl font-semibold text-foreground mb-2">Pre Match Analysis</h3>
                                    <p className="text-muted-foreground text-center max-w-md">
                                        Pre-match analysis and preparation content coming soon.
                                    </p>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Match Video Tab - Placeholder */}
                        <TabsContent value="match-video" className="space-y-6">
                            <Card className="bg-card border-border">
                                <CardContent className="flex flex-col items-center justify-center py-16">
                                    <Video className="w-16 h-16 text-muted-foreground/30 mb-4" />
                                    <h3 className="text-xl font-semibold text-foreground mb-2">Match Video</h3>
                                    <p className="text-muted-foreground text-center max-w-md">
                                        Match video playback and highlights coming soon.
                                    </p>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>
            </main>
        </div>
    );
};

export default MatchDetails;
