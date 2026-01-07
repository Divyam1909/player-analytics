import { useState } from "react";
import { Player } from "@/types/player";
import Header from "@/components/layout/Header";
import PlayerTable from "@/components/player/PlayerTable";
import PlayerCard from "@/components/player/PlayerCard";
import { Button } from "@/components/ui/button";
import { LayoutGrid, List, Users, TrendingUp, Target, Zap } from "lucide-react";
import playersData from "@/data/players.json";

const Overview = () => {
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  const players = playersData.players as Player[];

  // Calculate overview stats
  const avgRating = Math.round(
    players.reduce((acc, p) => acc + p.overallRating, 0) / players.length
  );
  const topScorer = players.reduce((prev, curr) => {
    const prevGoals = prev.matchStats.reduce((a, m) => a + m.stats.goals, 0);
    const currGoals = curr.matchStats.reduce((a, m) => a + m.stats.goals, 0);
    return currGoals > prevGoals ? curr : prev;
  });
  const topAssister = players.reduce((prev, curr) => {
    const prevAssists = prev.matchStats.reduce((a, m) => a + m.stats.assists, 0);
    const currAssists = curr.matchStats.reduce((a, m) => a + m.stats.assists, 0);
    return currAssists > prevAssists ? curr : prev;
  });

  const statCards = [
    {
      label: "Total Players",
      value: players.length,
      icon: Users,
      color: "text-primary",
    },
    {
      label: "Avg Rating",
      value: avgRating,
      icon: TrendingUp,
      color: "text-success",
    },
    {
      label: "Top Scorer",
      value: topScorer.name.split(" ")[1],
      subValue: `${topScorer.matchStats.reduce((a, m) => a + m.stats.goals, 0)} goals`,
      icon: Target,
      color: "text-destructive",
    },
    {
      label: "Top Assister",
      value: topAssister.name.split(" ")[1],
      subValue: `${topAssister.matchStats.reduce((a, m) => a + m.stats.assists, 0)} assists`,
      icon: Zap,
      color: "text-warning",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-24 pb-12 px-6">
        <div className="container mx-auto">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Squad <span className="text-primary">Overview</span>
            </h1>
            <p className="text-muted-foreground">
              Comprehensive analysis of all Blue Lock players
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {statCards.map((stat) => (
              <div
                key={stat.label}
                className="relative overflow-hidden rounded-lg border border-border bg-card p-5 group hover:border-primary/30 transition-all duration-300"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-primary/10 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity" />
                
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">
                      {stat.label}
                    </p>
                    <p className={`text-2xl font-bold ${stat.color}`}>
                      {stat.value}
                    </p>
                    {stat.subValue && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {stat.subValue}
                      </p>
                    )}
                  </div>
                  <div className={`p-3 rounded-lg bg-secondary ${stat.color}`}>
                    <stat.icon className="w-5 h-5" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* View Toggle & Filter */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-foreground">
              All Players
            </h2>
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === "table" ? "default" : "secondary"}
                size="sm"
                onClick={() => setViewMode("table")}
                className="gap-2"
              >
                <List className="w-4 h-4" />
                Table
              </Button>
              <Button
                variant={viewMode === "grid" ? "default" : "secondary"}
                size="sm"
                onClick={() => setViewMode("grid")}
                className="gap-2"
              >
                <LayoutGrid className="w-4 h-4" />
                Grid
              </Button>
            </div>
          </div>

          {/* Players View */}
          {viewMode === "table" ? (
            <PlayerTable players={players} />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {players.map((player) => (
                <PlayerCard key={player.id} player={player} />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Overview;
