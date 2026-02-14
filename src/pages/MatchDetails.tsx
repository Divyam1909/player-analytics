import { useState, useEffect } from "react";
import { useParams, Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import AuthHeader from "@/components/layout/AuthHeader";
import Sidebar from "@/components/layout/Sidebar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { BarChart3, Users, Sparkles, PlayCircle, Video } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useSidebarContext } from "@/contexts/SidebarContext";
import { useCustomStats } from "@/contexts/CustomStatsContext";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

// Import existing page components
import TeamAnalytics from "./TeamAnalytics";
import Overview from "./Overview";
import CustomStats from "./CustomStats";


interface MatchDetailsResponse {
    id: string;
    match_date: string;
    competition_name: string;
    home_score: number;
    away_score: number;
    home_team: { team_name: string } | null;
    away_team: { team_name: string } | null;
}

const MatchDetails = () => {
    const { matchId } = useParams<{ matchId: string }>();
    const { isCollapsed } = useSidebarContext();
    const { user } = useAuth();
    const isPremium = user?.subscriptionType === 'premium';
    const location = useLocation();
    const navigate = useNavigate();

    // Valid tab values
    const VALID_TABS = ["overview", "player-overview", "custom", "pre-match", "match-video"];

    // Custom stats context
    const { isCustomMode, hasCustomStats } = useCustomStats();

    // Get initial tab from URL hash or default based on custom mode
    const getInitialTab = () => {
        const hash = location.hash.replace("#", "");
        if (VALID_TABS.includes(hash)) return hash;
        // If custom mode is enabled and has stats, default to custom tab
        if (isCustomMode && hasCustomStats) return "custom";
        return "overview";
    };

    const [activeTab, setActiveTab] = useState(getInitialTab);

    // Update URL hash when tab changes
    const handleTabChange = (tab: string) => {
        setActiveTab(tab);
        navigate(`${location.pathname}#${tab}`, { replace: true });
        // Reset scroll position to top when switching tabs
        window.scrollTo(0, 0);
    };

    // Sync tab with URL hash on navigation
    useEffect(() => {
        const hash = location.hash.replace("#", "");
        if (VALID_TABS.includes(hash) && hash !== activeTab) {
            setActiveTab(hash);
        }
    }, [location.hash]);

    // Auto-navigate to custom tab when entering match details if custom mode is enabled
    useEffect(() => {
        if (isCustomMode && hasCustomStats && !location.hash) {
            setActiveTab("custom");
            navigate(`${location.pathname}#custom`, { replace: true });
        }
    }, [matchId]); // Only on initial mount/matchId change

    const { data: matchDetails, isLoading } = useQuery({
        queryKey: ['match', matchId],
        queryFn: async () => {
            if (!matchId) return null;
            const { data: rawData, error } = await supabase
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
                .eq('id', matchId)
                .single();

            if (error) throw error;
            if (!rawData) return null;

            const data = rawData as unknown as MatchDetailsResponse;

            // Helper to get team name
            const getTeamName = (team: any) => team?.team_name || 'Unknown Team';

            return {
                matchId: data.id,
                opponent: getTeamName(data.away_team),
                date: data.match_date,
                teamName: getTeamName(data.home_team),
                homeScore: data.home_score,
                awayScore: data.away_score,
            };
        },
        enabled: !!matchId
    });

    // Fetch all matches for the dropdown
    const { data: allMatches = [] } = useQuery({
        queryKey: ['all-matches-for-dropdown'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('matches')
                .select(`
                    id,
                    match_date,
                    home_team:home_team_id(team_name),
                    away_team:away_team_id(team_name)
                `)
                .order('match_date', { ascending: false });

            if (error) throw error;
            return ((data as any[]) || []).map(m => ({
                id: m.id,
                label: `${(m.home_team as any)?.team_name || 'Team'} vs ${(m.away_team as any)?.team_name || 'Opponent'}`,
                date: m.match_date
            }));
        }
    });

    // Handle match change from dropdown
    const handleMatchChange = (newMatchId: string) => {
        navigate(`/match/${newMatchId}#${activeTab}`, { replace: false });
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="animate-pulse text-primary">Loading match details...</div>
            </div>
        );
    }

    if (!matchDetails) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center">
                    <p className="text-muted-foreground mb-4">Match not found</p>
                    <Link to="/matches" className="text-primary hover:underline">
                        Back to Match Selection
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            <AuthHeader
                title="Match Details"
                showBack
                matchOptions={allMatches}
                selectedMatchId={matchId}
                onMatchChange={handleMatchChange}
            />
            <Sidebar />

            <main className={cn(
                "pt-24 pb-12 px-6 transition-all duration-300",
                isCollapsed ? "ml-16" : "ml-64"
            )}>
                <div className="container mx-auto">
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
                        <TabsList className="bg-secondary border border-border flex flex-wrap h-auto gap-1 p-1 sticky top-16 z-30">
                            <TabsTrigger
                                value="overview"
                                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground flex items-center gap-2"
                            >
                                <BarChart3 className="w-4 h-4" />
                                Overview
                            </TabsTrigger>
                            {isPremium && (
                                <TabsTrigger
                                    value="player-overview"
                                    className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground flex items-center gap-2"
                                >
                                    <Users className="w-4 h-4" />
                                    Player Overview
                                </TabsTrigger>
                            )}

                            <TabsTrigger
                                value="custom"
                                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground flex items-center gap-2"
                            >
                                <Sparkles className="w-4 h-4" />
                                Custom
                                {isCustomMode && hasCustomStats && (
                                    <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                                )}
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
                            <Overview embedded matchId={matchId} />
                        </TabsContent>



                        {/* Custom Tab - Custom Stats View */}
                        <TabsContent value="custom" className="space-y-6">
                            <CustomStats embedded matchId={matchId} />
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
