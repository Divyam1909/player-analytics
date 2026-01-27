import { useState, useMemo, useEffect } from "react";
import { useParams, Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import AuthHeader from "@/components/layout/AuthHeader";
import Sidebar from "@/components/layout/Sidebar";
import RadarChart from "@/components/charts/RadarChart";
import LineChart from "@/components/charts/LineChart";
import StatBar from "@/components/charts/StatBar";
import MatchTimeline from "@/components/charts/MatchTimeline";
import FootballField from "@/components/field/FootballField";
import PassingMap from "@/components/analytics/PassingMap";
import ShotMap from "@/components/analytics/ShotMap";
import { Player, PlayerMatch } from "@/types/player";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Target, Footprints, Flame, Activity, ArrowRightLeft, Crosshair, CalendarDays, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePlayers } from "@/hooks/usePlayers";

// Valid tab values
const VALID_TABS = ["overall", "match", "passing", "shots"];

interface PlayerStatsProps {
  embedded?: boolean;
  defaultMatchId?: string;
}

const PlayerStats = ({ embedded = false, defaultMatchId }: PlayerStatsProps) => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();

  // Get initial tab from URL hash or default to "overall"
  const getInitialTab = () => {
    const hash = location.hash.replace("#", "");
    return VALID_TABS.includes(hash) ? hash : "overall";
  };

  const [activeTab, setActiveTab] = useState(getInitialTab);
  const [selectedMatchId, setSelectedMatchId] = useState<string>("");
  const [matchSearch, setMatchSearch] = useState<string>("");

  // Use the hook to fetch players from Supabase
  const { data: players = [], isLoading } = usePlayers();
  const player = players.find((p) => p.id === id);

  // Default to first player if no id or player not found
  const currentPlayer = player || players[0];

  // Set default selected match - using useEffect for side effects
  // NOTE: This hook MUST be before any early returns to comply with Rules of Hooks
  useEffect(() => {
    if (defaultMatchId) {
      setSelectedMatchId(defaultMatchId);
    } else if (currentPlayer && currentPlayer.matchStats.length > 0 && !selectedMatchId) {
      setSelectedMatchId(currentPlayer.matchStats[0].matchId);
    }
  }, [currentPlayer, selectedMatchId, defaultMatchId]);

  // Scroll to top when navigating to a new player
  useEffect(() => {
    if (!embedded) {
      window.scrollTo(0, 0);
    }
  }, [id, embedded]);

  // Loading state - MUST be before any conditional logic
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-primary">Loading player data...</div>
      </div>
    );
  }

  // Calculate aggregated stats - after loading check
  const aggregatedStats = useMemo(() => {
    if (!currentPlayer) return null;

    const matches = currentPlayer.matchStats;
    const total = {
      goals: matches.reduce((a, m) => a + m.stats.goals, 0),
      assists: matches.reduce((a, m) => a + m.stats.assists, 0),
      passes: Math.round(matches.reduce((a, m) => a + m.stats.passes, 0) / matches.length),
      passAccuracy: Math.round(matches.reduce((a, m) => a + m.stats.passAccuracy, 0) / matches.length),
      shots: Math.round(matches.reduce((a, m) => a + m.stats.shots, 0) / matches.length),
      shotsOnTarget: Math.round(matches.reduce((a, m) => a + m.stats.shotsOnTarget, 0) / matches.length),
      interceptions: Math.round(matches.reduce((a, m) => a + m.stats.interceptions, 0) / matches.length),
      tackles: Math.round(matches.reduce((a, m) => a + m.stats.tackles, 0) / matches.length),
      dribbles: Math.round(matches.reduce((a, m) => a + m.stats.dribbles, 0) / matches.length),
      dribblesSuccessful: Math.round(matches.reduce((a, m) => a + m.stats.dribblesSuccessful, 0) / matches.length),
      distanceCovered: (matches.reduce((a, m) => a + m.stats.distanceCovered, 0) / matches.length).toFixed(1),
      sprints: Math.round(matches.reduce((a, m) => a + m.stats.sprints, 0) / matches.length),
    };
    return total;
  }, [currentPlayer]);

  // All events for overall view
  const allEvents = useMemo(() => {
    if (!currentPlayer) return [];
    return currentPlayer.matchStats.flatMap((m) => m.events);
  }, [currentPlayer]);

  const selectedMatch = currentPlayer?.matchStats.find(
    (m) => m.matchId === selectedMatchId
  );

  const getRatingColor = (rating: number) => {
    if (rating >= 90) return "text-success";
    if (rating >= 80) return "text-primary";
    if (rating >= 70) return "text-warning";
    return "text-destructive";
  };

  // Helper to sum nullable stats - returns null if any value is null (data not available)
  const sumNullableStat = (statKey: keyof import("@/types/player").MatchStats): number | null => {
    if (!currentPlayer) return null;
    const values = currentPlayer.matchStats.map(m => m.stats[statKey]);
    if (values.some(v => v === null)) return null;
    return values.reduce((a, v) => (a as number) + (v as number), 0) as number;
  };

  // Helper to display stat value - shows "--" for null
  const displayStat = (value: number | null | string): string => {
    if (value === null) return "--";
    return String(value);
  };

  if (!currentPlayer) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Player not found</p>
      </div>
    );
  }

  // Match trend data for line chart
  const matchTrendData = currentPlayer.matchStats.map((match) => ({
    name: `vs ${match.opponent.split(" ")[0]}`,
    Goals: match.stats.goals,
    Assists: match.stats.assists,
    Shots: match.stats.shots,
  }));

  return (
    <div className={embedded ? "bg-background" : "min-h-screen bg-background"}>
      {!embedded && <AuthHeader title="Player Stats" showBack />}
      {!embedded && <Sidebar />}

      <main className={embedded ? "pb-12 px-6" : "pt-24 pb-12 px-6 ml-64"}>
        <div className="container mx-auto">

          {/* Player Header */}
          <div className="relative overflow-hidden rounded-xl border border-border bg-card p-6 mb-8">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5" />
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-primary/10 to-transparent rounded-bl-full" />

            <div className="relative flex flex-col lg:flex-row items-start lg:items-center gap-6">
              {/* Player Avatar */}
              <div className="relative flex-shrink-0">
                <div className="w-24 h-24 lg:w-32 lg:h-32 rounded-2xl bg-secondary border border-border flex items-center justify-center">
                  <User className="w-12 h-12 lg:w-16 lg:h-16 text-muted-foreground" />
                </div>
                <div className="absolute -bottom-2 -right-2 w-10 h-10 lg:w-12 lg:h-12 rounded-xl bg-primary flex items-center justify-center text-lg lg:text-xl font-bold text-primary-foreground shadow-lg glow-primary">
                  {currentPlayer.jerseyNumber}
                </div>
              </div>

              {/* Player Info */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-3 mb-2">
                  <h1 className="text-2xl lg:text-3xl font-bold text-foreground">
                    {currentPlayer.name}
                  </h1>
                  <span className="px-3 py-1 rounded-lg bg-secondary text-sm font-medium text-secondary-foreground">
                    {currentPlayer.position}
                  </span>
                </div>
                <p className="text-muted-foreground mb-4">{currentPlayer.team}</p>

                {/* Quick Stats */}
                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center gap-2">
                    <Target className="w-4 h-4 text-destructive" />
                    <span className="text-sm text-muted-foreground">
                      {aggregatedStats?.goals} Goals
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Footprints className="w-4 h-4 text-warning" />
                    <span className="text-sm text-muted-foreground">
                      {aggregatedStats?.assists} Assists
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CalendarDays className="w-4 h-4 text-primary" />
                    <span className="text-sm text-muted-foreground">
                      {currentPlayer.matchStats.length} Matches
                    </span>
                  </div>
                </div>
              </div>

              {/* Overall Rating */}
              <div className="flex-shrink-0 text-center lg:text-right">
                <div className={cn(
                  "text-5xl lg:text-6xl font-bold leading-none",
                  getRatingColor(currentPlayer.overallRating)
                )}>
                  {currentPlayer.overallRating}
                </div>
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mt-2">
                  Overall Rating
                </p>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <Tabs
            value={activeTab}
            onValueChange={(value) => {
              setActiveTab(value);
              navigate(`#${value}`, { replace: true });
              // Reset scroll position to top when switching tabs
              window.scrollTo(0, 0);
            }}
            className="space-y-6"
          >
            <TabsList className="bg-secondary border border-border flex flex-wrap h-auto gap-1 p-1 sticky top-16 z-30">
              <TabsTrigger value="overall" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                Overall Stats
              </TabsTrigger>
              <TabsTrigger value="match" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                Match-Wise Stats
              </TabsTrigger>
              <TabsTrigger value="passing" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground flex items-center gap-1">
                <ArrowRightLeft className="w-3 h-3" />
                Passing Analysis
              </TabsTrigger>
              <TabsTrigger value="shots" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground flex items-center gap-1">
                <Crosshair className="w-3 h-3" />
                Shot Analysis
              </TabsTrigger>
            </TabsList>

            {/* Overall Stats Tab */}
            <TabsContent value="overall" className="space-y-6">
              {/* Top Row - Radar and Player Summary */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Radar Chart */}
                <Card className="lg:col-span-1 bg-card border-border">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Flame className="w-5 h-5 text-primary" />
                      Attribute Pentagon
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex justify-center">
                    <RadarChart attributes={currentPlayer.attributes} size="md" />
                  </CardContent>
                </Card>

                {/* Player Summary */}
                <Card className="lg:col-span-2 bg-card border-border">
                  <CardHeader>
                    <CardTitle className="text-lg">Season Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                      {[
                        { label: "Matches", value: currentPlayer.matchStats.length, icon: CalendarDays, color: "text-primary" },
                        { label: "Minutes", value: currentPlayer.matchStats.reduce((a, m) => a + (m.minutesPlayed || 90), 0), icon: Activity, color: "text-muted-foreground" },
                        { label: "Goals", value: aggregatedStats?.goals ?? null, icon: Target, color: "text-destructive" },
                        { label: "Assists", value: aggregatedStats?.assists ?? null, icon: Footprints, color: "text-warning" },
                      ].map((stat) => (
                        <div key={stat.label} className="text-center p-4 rounded-lg bg-secondary/50 border border-border">
                          <stat.icon className={cn("w-5 h-5 mx-auto mb-2", stat.color)} />
                          <p className={cn("text-2xl font-bold", stat.color)}>{stat.value !== null ? stat.value : "--"}</p>
                          <p className="text-xs uppercase text-muted-foreground mt-1">{stat.label}</p>
                        </div>
                      ))}
                    </div>

                    {/* Category Comparison Bars */}
                    <div className="space-y-4">
                      <h4 className="text-sm font-medium text-muted-foreground">Category Strengths</h4>
                      {(() => {
                        const attrs = currentPlayer.attributes;
                        const hasPassingData = attrs.passing !== null;
                        const hasAttackingData = attrs.shooting !== null && attrs.dribbling !== null;
                        const hasDefendingData = attrs.defending !== null && attrs.physical !== null;

                        const categories = [
                          {
                            label: "Passing",
                            value: hasPassingData ? attrs.passing : null,
                            color: "bg-primary"
                          },
                          {
                            label: "Attacking",
                            value: hasAttackingData ? Math.round(((attrs.shooting ?? 0) + (attrs.dribbling ?? 0)) / 2) : null,
                            color: "bg-destructive"
                          },
                          {
                            label: "Defending",
                            value: hasDefendingData ? Math.round(((attrs.defending ?? 0) + (attrs.physical ?? 0)) / 2) : null,
                            color: "bg-success"
                          },
                        ];

                        return categories.map((category) => (
                          <div key={category.label} className="flex items-center gap-3">
                            <span className="text-xs font-medium w-20 text-muted-foreground">{category.label}</span>
                            <div className="flex-1 h-3 bg-secondary rounded-full overflow-hidden">
                              {category.value !== null ? (
                                <motion.div
                                  className={cn("h-full rounded-full", category.color)}
                                  initial={{ width: 0 }}
                                  animate={{ width: `${category.value}%` }}
                                  transition={{ duration: 0.5, delay: 0.2 }}
                                />
                              ) : (
                                <div className="h-full w-full flex items-center justify-center text-xs text-muted-foreground">
                                  Data unavailable
                                </div>
                              )}
                            </div>
                            <span className="text-xs font-bold w-8 text-right">{category.value !== null ? category.value : "--"}</span>
                          </div>
                        ));
                      })()}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Aggregated Stats - Mode Wise */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Passing Stats */}
                <Card className="bg-card border-border">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-primary"></span>
                      Passing Stats
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {[
                        { label: "Total Passes", value: currentPlayer.matchStats.reduce((a, m) => a + m.stats.passes, 0) },
                        { label: "Pass Accuracy", value: `${Math.round(currentPlayer.matchStats.reduce((a, m) => a + m.stats.passAccuracy, 0) / currentPlayer.matchStats.length)}%` },
                        { label: "Key Passes", value: currentPlayer.matchStats.reduce((a, m) => a + m.stats.keyPasses, 0) },
                        { label: "Final Third", value: sumNullableStat("passesInFinalThird") },
                        { label: "In Box", value: sumNullableStat("passesInBox") },
                        { label: "Crosses", value: currentPlayer.matchStats.reduce((a, m) => a + m.stats.crosses, 0) },
                        { label: "Assists", value: aggregatedStats?.assists || 0 },
                        { label: "Prog. Pass", value: currentPlayer.matchStats.reduce((a, m) => a + m.stats.progressivePassing, 0) },
                      ].map((stat) => (
                        <div key={stat.label} className="text-center p-3 rounded bg-secondary/50">
                          <p className="text-xl font-bold text-primary">{displayStat(stat.value)}</p>
                          <p className="text-[10px] uppercase text-muted-foreground">{stat.label}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Defensive Stats */}
                <Card className="bg-card border-border">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-success"></span>
                      Defensive Stats
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { label: "Blocks", value: sumNullableStat("blocks") },
                        { label: "Interceptions", value: sumNullableStat("interceptions") },
                        { label: "Clearances", value: sumNullableStat("clearances") },
                        { label: "Recoveries", value: sumNullableStat("recoveries") },
                      ].map((stat) => (
                        <div key={stat.label} className="text-center p-3 rounded bg-secondary/50">
                          <p className="text-xl font-bold text-success">{displayStat(stat.value)}</p>
                          <p className="text-[10px] uppercase text-muted-foreground">{stat.label}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Attacking Stats */}
                <Card className="bg-card border-border">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-destructive"></span>
                      Attacking Stats
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {[
                        { label: "Prog. Runs", value: sumNullableStat("progressiveRuns") },
                        { label: "Total Dribbles", value: currentPlayer.matchStats.reduce((a, m) => a + m.stats.dribbles, 0) },
                        { label: "Success Dribbles", value: currentPlayer.matchStats.reduce((a, m) => a + m.stats.dribblesSuccessful, 0) },
                        { label: "Aerial Duels Won", value: currentPlayer.matchStats.reduce((a, m) => a + m.stats.aerialDuelsWon, 0) },
                        { label: "Shots", value: currentPlayer.matchStats.reduce((a, m) => a + m.stats.shots, 0) },
                        { label: "Shots on Target", value: currentPlayer.matchStats.reduce((a, m) => a + m.stats.shotsOnTarget, 0) },
                        { label: "Shot Conv. Rate", value: (() => { const shots = currentPlayer.matchStats.reduce((a, m) => a + m.stats.shots, 0); const goals = aggregatedStats?.goals || 0; return shots > 0 ? `${Math.round((goals / shots) * 100)}%` : '0%'; })() },
                        { label: "Ball Touches", value: currentPlayer.matchStats.reduce((a, m) => a + m.stats.ballTouches, 0) },
                      ].map((stat) => (
                        <div key={stat.label} className="text-center p-3 rounded bg-secondary/50">
                          <p className="text-xl font-bold text-destructive">{displayStat(stat.value)}</p>
                          <p className="text-[10px] uppercase text-muted-foreground">{stat.label}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Match Trend */}
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-lg">Performance Trend</CardTitle>
                </CardHeader>
                <CardContent>
                  <LineChart
                    data={matchTrendData}
                    lines={[
                      { dataKey: "Goals", color: "hsl(var(--destructive))", name: "Goals" },
                      { dataKey: "Assists", color: "hsl(var(--warning))", name: "Assists" },
                      { dataKey: "Shots", color: "hsl(var(--primary))", name: "Shots" },
                    ]}
                    height={250}
                  />
                </CardContent>
              </Card>

              {/* Football Field - All Events */}
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-lg">Touch Map (All Matches)</CardTitle>
                </CardHeader>
                <CardContent>
                  <FootballField events={allEvents} />
                </CardContent>
              </Card>
            </TabsContent>

            {/* Match-Wise Stats Tab */}
            <TabsContent value="match" className="space-y-6">
              {/* Match Selector - Compact List Style */}
              <Card className="bg-card border-border">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Select Match</CardTitle>
                  {/* Search Bar */}
                  <div className="relative mt-3">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Search by opponent..."
                      value={matchSearch}
                      onChange={(e) => setMatchSearch(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 text-sm rounded-lg bg-secondary border border-border focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
                    />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="max-h-64 overflow-y-auto space-y-1">
                    {currentPlayer.matchStats
                      .filter((match) =>
                        match.opponent.toLowerCase().includes(matchSearch.toLowerCase())
                      )
                      .map((match) => (
                        <motion.div
                          key={match.matchId}
                          onClick={() => setSelectedMatchId(match.matchId)}
                          className={cn(
                            "flex items-center justify-between px-3 py-2 rounded-md cursor-pointer transition-all duration-200",
                            selectedMatchId === match.matchId
                              ? "bg-primary/15 border-l-2 border-primary"
                              : "hover:bg-secondary/80"
                          )}
                          whileHover={{ x: 4 }}
                          whileTap={{ scale: 0.99 }}
                        >
                          <div className="flex items-center gap-3">
                            {selectedMatchId === match.matchId && (
                              <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                            )}
                            <span className={cn(
                              "font-medium text-sm",
                              selectedMatchId === match.matchId ? "text-primary" : "text-foreground"
                            )}>
                              vs {match.opponent}
                            </span>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {new Date(match.date).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </span>
                        </motion.div>
                      ))}
                    {currentPlayer.matchStats.filter((match) =>
                      match.opponent.toLowerCase().includes(matchSearch.toLowerCase())
                    ).length === 0 && (
                        <p className="text-sm text-muted-foreground text-center py-4">
                          No matches found
                        </p>
                      )}
                  </div>
                </CardContent>
              </Card>

              {/* Match Timeline */}
              {selectedMatch && (
                <Card className="bg-card border-border">
                  <CardContent className="pt-6">
                    <MatchTimeline events={selectedMatch.events} />
                  </CardContent>
                </Card>
              )}

              {selectedMatch && (
                <>
                  {/* Passing Stats Section */}
                  <Card className="bg-card border-border">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-primary"></span>
                        Passing Stats
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
                        {[
                          { label: "Total Passes", value: selectedMatch.stats.passes, color: "text-primary" },
                          { label: "Pass %", value: `${selectedMatch.stats.passAccuracy}%`, color: "text-success" },
                          { label: "Key Passes", value: selectedMatch.stats.keyPasses, color: "text-warning" },
                          { label: "Final Third", value: selectedMatch.stats.passesInFinalThird, color: "text-primary" },
                          { label: "In Box", value: selectedMatch.stats.passesInBox, color: "text-destructive" },
                          { label: "Crosses", value: selectedMatch.stats.crosses, color: "text-chart-4" },
                          { label: "Assists", value: selectedMatch.stats.assists, color: "text-warning" },
                          { label: "Prog. Pass", value: selectedMatch.stats.progressivePassing, color: "text-success" },
                        ].map((stat) => (
                          <div key={stat.label} className="text-center p-3 rounded-lg bg-secondary/50">
                            <p className={cn("text-xl font-bold", stat.color)}>
                              {displayStat(stat.value)}
                            </p>
                            <p className="text-[10px] uppercase tracking-wide text-muted-foreground mt-1">
                              {stat.label}
                            </p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Defensive Stats Section */}
                  <Card className="bg-card border-border">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-success"></span>
                        Defensive Stats
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {[
                          { label: "Blocks", value: selectedMatch.stats.blocks, color: "text-success" },
                          { label: "Interceptions", value: selectedMatch.stats.interceptions, color: "text-primary" },
                          { label: "Clearances", value: selectedMatch.stats.clearances, color: "text-warning" },
                          { label: "Recoveries", value: selectedMatch.stats.recoveries, color: "text-success" },
                        ].map((stat) => (
                          <div key={stat.label} className="text-center p-4 rounded-lg bg-secondary/50">
                            <p className={cn("text-2xl font-bold", stat.color)}>
                              {displayStat(stat.value)}
                            </p>
                            <p className="text-xs uppercase tracking-wide text-muted-foreground mt-1">
                              {stat.label}
                            </p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Attacking Stats Section */}
                  <Card className="bg-card border-border">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-destructive"></span>
                        Attacking Stats
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
                        {[
                          { label: "Prog. Runs", value: selectedMatch.stats.progressiveRuns, color: "text-primary" },
                          { label: "Dribbles", value: selectedMatch.stats.dribbles, color: "text-warning" },
                          { label: "Success", value: selectedMatch.stats.dribblesSuccessful, color: "text-success" },
                          { label: "Aerial Won", value: selectedMatch.stats.aerialDuelsWon, color: "text-primary" },
                          { label: "Shots", value: selectedMatch.stats.shots, color: "text-destructive" },
                          { label: "On Target", value: selectedMatch.stats.shotsOnTarget, color: "text-warning" },
                          { label: "Conv. Rate", value: `${selectedMatch.stats.shots > 0 ? Math.round((selectedMatch.stats.goals / selectedMatch.stats.shots) * 100) : 0}%`, color: "text-success" },
                          { label: "Touches", value: selectedMatch.stats.ballTouches, color: "text-muted-foreground" },
                        ].map((stat) => (
                          <div key={stat.label} className="text-center p-3 rounded-lg bg-secondary/50">
                            <p className={cn("text-xl font-bold", stat.color)}>
                              {displayStat(stat.value)}
                            </p>
                            <p className="text-[10px] uppercase tracking-wide text-muted-foreground mt-1">
                              {stat.label}
                            </p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Match Touch Map */}
                  <Card className="bg-card border-border">
                    <CardHeader>
                      <CardTitle className="text-lg">
                        Touch Map vs {selectedMatch.opponent}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <FootballField events={selectedMatch.events} />
                    </CardContent>
                  </Card>
                </>
              )}
            </TabsContent>

            {/* Passing Analysis Tab */}
            <TabsContent value="passing" className="space-y-6">
              {/* Match Selector */}
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <ArrowRightLeft className="w-5 h-5 text-primary" />
                    Passing Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                    {/* All Matches Option */}
                    <motion.div
                      onClick={() => setSelectedMatchId("all")}
                      className={cn(
                        "relative p-3 rounded-lg border cursor-pointer transition-all duration-200",
                        selectedMatchId === "all"
                          ? "bg-primary/10 border-primary shadow-md"
                          : "bg-secondary/50 border-border hover:border-primary/50 hover:bg-secondary"
                      )}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {selectedMatchId === "all" && (
                        <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-primary" />
                      )}
                      <p className="font-semibold text-foreground text-sm">All Matches</p>
                      <p className="text-xs text-muted-foreground">Combined</p>
                    </motion.div>

                    {currentPlayer.matchStats.map((match) => (
                      <motion.div
                        key={match.matchId}
                        onClick={() => setSelectedMatchId(match.matchId)}
                        className={cn(
                          "relative p-3 rounded-lg border cursor-pointer transition-all duration-200",
                          selectedMatchId === match.matchId
                            ? "bg-primary/10 border-primary shadow-md"
                            : "bg-secondary/50 border-border hover:border-primary/50 hover:bg-secondary"
                        )}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        {selectedMatchId === match.matchId && (
                          <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-primary" />
                        )}
                        <p className="font-semibold text-foreground text-sm">vs {match.opponent}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(match.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </p>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Passing Map Visualization */}
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-lg">Pass Network & Position Map</CardTitle>
                </CardHeader>
                <CardContent>
                  <PassingMap
                    events={selectedMatchId === "all" ? allEvents : (selectedMatch?.events || [])}
                    playerName={currentPlayer.name}
                  />
                </CardContent>
              </Card>
            </TabsContent>
            {/* Shot Analysis Tab */}
            <TabsContent value="shots" className="space-y-6">
              {/* Match Selector */}
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Crosshair className="w-5 h-5 text-destructive" />
                    Shot Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                    {/* All Matches Option */}
                    <motion.div
                      onClick={() => setSelectedMatchId("all")}
                      className={cn(
                        "relative p-3 rounded-lg border cursor-pointer transition-all duration-200",
                        selectedMatchId === "all"
                          ? "bg-primary/10 border-primary shadow-md"
                          : "bg-secondary/50 border-border hover:border-primary/50 hover:bg-secondary"
                      )}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {selectedMatchId === "all" && (
                        <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-primary" />
                      )}
                      <p className="font-semibold text-foreground text-sm">All Matches</p>
                      <p className="text-xs text-muted-foreground">Combined</p>
                    </motion.div>

                    {currentPlayer.matchStats.map((match) => (
                      <motion.div
                        key={match.matchId}
                        onClick={() => setSelectedMatchId(match.matchId)}
                        className={cn(
                          "relative p-3 rounded-lg border cursor-pointer transition-all duration-200",
                          selectedMatchId === match.matchId
                            ? "bg-primary/10 border-primary shadow-md"
                            : "bg-secondary/50 border-border hover:border-primary/50 hover:bg-secondary"
                        )}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        {selectedMatchId === match.matchId && (
                          <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-primary" />
                        )}
                        <p className="font-semibold text-foreground text-sm">vs {match.opponent}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(match.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </p>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Shot Map Visualization */}
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-lg">Shot Map & Expected Goals</CardTitle>
                </CardHeader>
                <CardContent>
                  <ShotMap
                    events={selectedMatchId === "all" ? allEvents : (selectedMatch?.events || [])}
                    editable={true}
                  />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default PlayerStats;

