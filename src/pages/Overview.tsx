import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Player } from "@/types/player";
import Header from "@/components/layout/Header";
import PlayerTable from "@/components/player/PlayerTable";
import PlayerCard from "@/components/player/PlayerCard";
import CompareModal from "@/components/player/CompareModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  LayoutGrid,
  List,
  Users,
  CalendarDays,
  Target,
  Zap,
  Search,
  ArrowLeftRight,
  X,
  Filter
} from "lucide-react";
import playersData from "@/data/players.json";

export type StatFilterMode = "none" | "passing" | "attacking" | "defending";

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

const Overview = () => {
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  const [searchQuery, setSearchQuery] = useState("");
  const [isCompareOpen, setIsCompareOpen] = useState(false);
  const [selectedForCompare, setSelectedForCompare] = useState<Player | undefined>();
  const [statFilter, setStatFilter] = useState<StatFilterMode>("none");

  const players = playersData.players as Player[];

  // Filter players based on search
  const filteredPlayers = useMemo(() => {
    if (!searchQuery.trim()) return players;

    const query = searchQuery.toLowerCase();
    return players.filter(
      (player) =>
        player.name.toLowerCase().includes(query) ||
        player.position.toLowerCase().includes(query) ||
        player.team.toLowerCase().includes(query) ||
        player.jerseyNumber.toString().includes(query)
    );
  }, [players, searchQuery]);

  // Calculate overview stats
  const totalMatches = players.reduce((acc, p) => {
    // Get unique match IDs to avoid counting duplicates
    return acc + p.matchStats.length;
  }, 0) / players.length; // Average matches per player, then multiply by typical team size
  const teamMatches = Math.max(...players.map(p => p.matchStats.length)); // Use max as team's total matches
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
      label: "Total Matches",
      value: teamMatches,
      icon: CalendarDays,
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

  const handleCompare = (player?: Player) => {
    setSelectedForCompare(player);
    setIsCompareOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-24 pb-12 px-6">
        <div className="container mx-auto">
          {/* Page Header */}
          <motion.div
            className="mb-8"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Squad <span className="text-primary">Overview</span>
            </h1>
            <p className="text-muted-foreground">
              Comprehensive analysis of your squad's performance
            </p>
          </motion.div>

          {/* Stats Cards */}
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
            variants={containerVariants}
            initial="hidden"
            animate="show"
          >
            {statCards.map((stat, index) => (
              <motion.div
                key={stat.label}
                variants={itemVariants}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
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
                  <motion.div
                    className={`p-3 rounded-lg bg-secondary ${stat.color}`}
                    whileHover={{ rotate: 10 }}
                  >
                    <stat.icon className="w-5 h-5" />
                  </motion.div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Search and Controls */}
          <motion.div
            className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <h2 className="text-xl font-semibold text-foreground">
              All Players
              {searchQuery && (
                <span className="text-sm font-normal text-muted-foreground ml-2">
                  ({filteredPlayers.length} results)
                </span>
              )}
            </h2>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
              {/* Stat Filter Dropdown */}
              <div className="relative">
                <Select value={statFilter} onValueChange={(value: StatFilterMode) => setStatFilter(value)}>
                  <SelectTrigger className="w-[160px] bg-secondary border-border">
                    <Filter className="w-4 h-4 mr-2 text-muted-foreground" />
                    <SelectValue placeholder="Filter Stats" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border">
                    <SelectItem value="none">All Stats</SelectItem>
                    <SelectItem value="passing">Passing</SelectItem>
                    <SelectItem value="attacking">Attacking</SelectItem>
                    <SelectItem value="defending">Defending</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Search Input */}
              <div className="relative flex-1 md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search players..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-10 bg-secondary border-border"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Compare Button */}
              <Button
                variant="outline"
                onClick={() => handleCompare()}
                className="gap-2"
              >
                <ArrowLeftRight className="w-4 h-4" />
                Compare
              </Button>

              {/* View Toggle */}
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
          </motion.div>

          {/* Players View */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            {filteredPlayers.length === 0 ? (
              <motion.div
                className="flex flex-col items-center justify-center py-16 text-center"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <Search className="w-12 h-12 text-muted-foreground/30 mb-4" />
                <p className="text-lg font-medium text-foreground mb-1">No players found</p>
                <p className="text-sm text-muted-foreground">
                  Try adjusting your search query
                </p>
              </motion.div>
            ) : viewMode === "table" ? (
              <PlayerTable players={filteredPlayers} onCompare={handleCompare} statFilter={statFilter} />
            ) : (
              <motion.div
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                variants={containerVariants}
                initial="hidden"
                animate="show"
              >
                {filteredPlayers.map((player) => (
                  <motion.div key={player.id} variants={itemVariants}>
                    <PlayerCard player={player} onCompare={handleCompare} statFilter={statFilter} />
                  </motion.div>
                ))}
              </motion.div>
            )}
          </motion.div>
        </div>
      </main>

      {/* Compare Modal */}
      <CompareModal
        isOpen={isCompareOpen}
        onClose={() => setIsCompareOpen(false)}
        players={players}
        initialPlayer={selectedForCompare}
      />
    </div>
  );
};

export default Overview;
