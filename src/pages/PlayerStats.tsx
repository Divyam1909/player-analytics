import { useState, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import Header from "@/components/layout/Header";
import RadarChart from "@/components/charts/RadarChart";
import BarChart from "@/components/charts/BarChart";
import LineChart from "@/components/charts/LineChart";
import StatBar from "@/components/charts/StatBar";
import FootballField from "@/components/field/FootballField";
import { Player, PlayerMatch } from "@/types/player";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ArrowLeft, User, Target, Footprints, Shield, Flame, Activity } from "lucide-react";
import { cn } from "@/lib/utils";
import playersData from "@/data/players.json";

const PlayerStats = () => {
  const { id } = useParams<{ id: string }>();
  const [selectedMatchId, setSelectedMatchId] = useState<string>("");
  const [showHeatmap, setShowHeatmap] = useState(false);

  const players = playersData.players as Player[];
  const player = players.find((p) => p.id === id);

  // Default to first player if no id or player not found
  const currentPlayer = player || players[0];

  // Set default selected match
  useMemo(() => {
    if (currentPlayer && currentPlayer.matchStats.length > 0 && !selectedMatchId) {
      setSelectedMatchId(currentPlayer.matchStats[0].matchId);
    }
  }, [currentPlayer, selectedMatchId]);

  const selectedMatch = currentPlayer?.matchStats.find(
    (m) => m.matchId === selectedMatchId
  );

  // Calculate aggregated stats
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

  const getRatingColor = (rating: number) => {
    if (rating >= 90) return "text-success";
    if (rating >= 80) return "text-primary";
    if (rating >= 70) return "text-warning";
    return "text-destructive";
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

  // Offensive stats for bar chart
  const offensiveData = [
    { name: "Goals", value: aggregatedStats?.goals || 0 },
    { name: "Assists", value: aggregatedStats?.assists || 0 },
    { name: "Shots/G", value: aggregatedStats?.shots || 0 },
    { name: "Dribbles/G", value: aggregatedStats?.dribbles || 0 },
  ];

  // Defensive stats for bar chart  
  const defensiveData = [
    { name: "Intercept", value: aggregatedStats?.interceptions || 0 },
    { name: "Tackles", value: aggregatedStats?.tackles || 0 },
    { name: "Distance", value: parseFloat(aggregatedStats?.distanceCovered || "0") },
    { name: "Sprints", value: aggregatedStats?.sprints || 0 },
  ];

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
            Back to Overview
          </Link>

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
                    <Activity className="w-4 h-4 text-primary" />
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
          <Tabs defaultValue="overall" className="space-y-6">
            <TabsList className="bg-secondary border border-border">
              <TabsTrigger value="overall" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                Overall Stats
              </TabsTrigger>
              <TabsTrigger value="match" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                Match-Wise Stats
              </TabsTrigger>
            </TabsList>

            {/* Overall Stats Tab */}
            <TabsContent value="overall" className="space-y-6">
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

                {/* Attributes Breakdown */}
                <Card className="lg:col-span-2 bg-card border-border">
                  <CardHeader>
                    <CardTitle className="text-lg">Detailed Attributes</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <StatBar value={currentPlayer.attributes.passing} label="Passing" />
                    <StatBar value={currentPlayer.attributes.shooting} label="Shooting" />
                    <StatBar value={currentPlayer.attributes.dribbling} label="Dribbling" />
                    <StatBar value={currentPlayer.attributes.defending} label="Defending" />
                    <StatBar value={currentPlayer.attributes.physical} label="Physical" />
                  </CardContent>
                </Card>
              </div>

              {/* Charts Row */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="bg-card border-border">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Target className="w-5 h-5 text-destructive" />
                      Offensive Contributions
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <BarChart data={offensiveData} colorful />
                  </CardContent>
                </Card>

                <Card className="bg-card border-border">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Shield className="w-5 h-5 text-success" />
                      Defensive & Physical
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <BarChart data={defensiveData} colorful />
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
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-lg">Touch Map (All Matches)</CardTitle>
                  <div className="flex items-center gap-2">
                    <Switch
                      id="heatmap-overall"
                      checked={showHeatmap}
                      onCheckedChange={setShowHeatmap}
                    />
                    <Label htmlFor="heatmap-overall" className="text-sm text-muted-foreground">
                      Heatmap
                    </Label>
                  </div>
                </CardHeader>
                <CardContent>
                  <FootballField events={allEvents} showHeatmap={showHeatmap} />
                </CardContent>
              </Card>
            </TabsContent>

            {/* Match-Wise Stats Tab */}
            <TabsContent value="match" className="space-y-6">
              {/* Match Selector */}
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-lg">Select Match</CardTitle>
                </CardHeader>
                <CardContent>
                  <Select value={selectedMatchId} onValueChange={setSelectedMatchId}>
                    <SelectTrigger className="w-full md:w-[300px] bg-secondary border-border">
                      <SelectValue placeholder="Select a match" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border-border">
                      {currentPlayer.matchStats.map((match) => (
                        <SelectItem key={match.matchId} value={match.matchId}>
                          vs {match.opponent} - {new Date(match.date).toLocaleDateString()}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>

              {selectedMatch && (
                <>
                  {/* Match Stats Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {[
                      { label: "Goals", value: selectedMatch.stats.goals, color: "text-destructive" },
                      { label: "Assists", value: selectedMatch.stats.assists, color: "text-warning" },
                      { label: "Passes", value: selectedMatch.stats.passes, color: "text-primary" },
                      { label: "Pass %", value: `${selectedMatch.stats.passAccuracy}%`, color: "text-success" },
                      { label: "Shots", value: selectedMatch.stats.shots, color: "text-chart-4" },
                      { label: "On Target", value: selectedMatch.stats.shotsOnTarget, color: "text-chart-5" },
                      { label: "Intercept", value: selectedMatch.stats.interceptions, color: "text-success" },
                      { label: "Tackles", value: selectedMatch.stats.tackles, color: "text-primary" },
                      { label: "Dribbles", value: selectedMatch.stats.dribbles, color: "text-warning" },
                      { label: "Success", value: selectedMatch.stats.dribblesSuccessful, color: "text-success" },
                      { label: "Distance", value: `${selectedMatch.stats.distanceCovered}km`, color: "text-muted-foreground" },
                      { label: "Sprints", value: selectedMatch.stats.sprints, color: "text-primary" },
                    ].map((stat) => (
                      <Card key={stat.label} className="bg-card border-border">
                        <CardContent className="p-4 text-center">
                          <p className={cn("text-2xl font-bold", stat.color)}>
                            {stat.value}
                          </p>
                          <p className="text-xs uppercase tracking-wide text-muted-foreground mt-1">
                            {stat.label}
                          </p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {/* Match Charts */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card className="bg-card border-border">
                      <CardHeader>
                        <CardTitle className="text-lg">Match Performance</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <BarChart
                          data={[
                            { name: "Goals", value: selectedMatch.stats.goals },
                            { name: "Assists", value: selectedMatch.stats.assists },
                            { name: "Shots", value: selectedMatch.stats.shots },
                            { name: "On Target", value: selectedMatch.stats.shotsOnTarget },
                          ]}
                          colorful
                        />
                      </CardContent>
                    </Card>

                    <Card className="bg-card border-border">
                      <CardHeader>
                        <CardTitle className="text-lg">Passing & Movement</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <BarChart
                          data={[
                            { name: "Passes", value: selectedMatch.stats.passes },
                            { name: "Dribbles", value: selectedMatch.stats.dribbles },
                            { name: "Interceptions", value: selectedMatch.stats.interceptions },
                            { name: "Sprints", value: selectedMatch.stats.sprints },
                          ]}
                          colorful
                        />
                      </CardContent>
                    </Card>
                  </div>

                  {/* Match Touch Map */}
                  <Card className="bg-card border-border">
                    <CardHeader className="flex flex-row items-center justify-between">
                      <CardTitle className="text-lg">
                        Touch Map vs {selectedMatch.opponent}
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        <Switch
                          id="heatmap-match"
                          checked={showHeatmap}
                          onCheckedChange={setShowHeatmap}
                        />
                        <Label htmlFor="heatmap-match" className="text-sm text-muted-foreground">
                          Heatmap
                        </Label>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <FootballField events={selectedMatch.events} showHeatmap={showHeatmap} />
                    </CardContent>
                  </Card>
                </>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default PlayerStats;
