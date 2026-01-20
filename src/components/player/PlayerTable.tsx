import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Player } from "@/types/player";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import StatBar from "@/components/charts/StatBar";
import { ArrowUpDown, User, ArrowLeftRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { StatFilterMode } from "@/pages/Overview";

interface PlayerTableProps {
  players: Player[];
  onCompare?: (player: Player) => void;
  statFilter?: StatFilterMode;
  matchId?: string; // If provided, only show stats from this match
}

// Dynamic sort key type
type SortKey = string;

// Helper function to calculate stats for a player - optionally filters by matchId
const calculateOverallStats = (player: Player, matchId?: string) => {
  // If matchId is provided, only use stats from that specific match
  const matches = matchId
    ? player.matchStats.filter(ms => ms.matchId === matchId)
    : player.matchStats;

  if (matches.length === 0) return null;

  // Calculate total minutes played from actual data
  const totalMinutesPlayed = matches.reduce((a, m) => a + (m.minutesPlayed || 90), 0);

  return {
    // Meta stats
    matchesPlayed: matches.length,
    totalMinutesPlayed,

    // Passing stats
    totalPassing: matches.reduce((a, m) => a + m.stats.passes, 0),
    crosses: matches.reduce((a, m) => a + m.stats.crosses, 0),
    assists: matches.reduce((a, m) => a + m.stats.assists, 0),

    // Defensive stats
    blocks: matches.reduce((a, m) => a + (m.stats.blocks || 0), 0),
    interceptions: matches.reduce((a, m) => a + (m.stats.interceptions || 0), 0),
    clearances: matches.reduce((a, m) => a + (m.stats.clearances || 0), 0),
    recoveries: matches.reduce((a, m) => a + (m.stats.recoveries || 0), 0),

    // Attacking stats
    progressiveRuns: matches.reduce((a, m) => a + (m.stats.progressiveRuns || 0), 0),
    totalDribbles: matches.reduce((a, m) => a + m.stats.dribbles, 0),
    successfulDribbles: matches.reduce((a, m) => a + m.stats.dribblesSuccessful, 0),
    aerialDuelsWon: matches.reduce((a, m) => a + m.stats.aerialDuelsWon, 0),
    shots: matches.reduce((a, m) => a + m.stats.shots, 0),
    shotsOnTarget: matches.reduce((a, m) => a + m.stats.shotsOnTarget, 0),
    goals: matches.reduce((a, m) => a + m.stats.goals, 0),
    shotConversionRate: matches.reduce((a, m) => a + m.stats.shots, 0) > 0
      ? Math.round((matches.reduce((a, m) => a + m.stats.goals, 0) / matches.reduce((a, m) => a + m.stats.shots, 0)) * 100)
      : 0,
  };
};

const PlayerTable = ({ players, onCompare, statFilter = "none", matchId }: PlayerTableProps) => {
  const [sortKey, setSortKey] = useState<SortKey>("overallRating");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const navigate = useNavigate();

  // Calculate stats for all players - pass matchId to filter if provided
  const playersWithStats = useMemo(() => {
    return players.map(player => ({
      player,
      stats: calculateOverallStats(player, matchId)
    }));
  }, [players, matchId]);

  // Get column definitions based on filter mode
  const columnDefs = useMemo(() => {
    switch (statFilter) {
      case "passing":
        return [
          { label: "Pass", fullLabel: "Total Passes", key: "totalPassing", suffix: "" },
          { label: "Crs", fullLabel: "Crosses", key: "crosses", suffix: "" },
          { label: "Ast", fullLabel: "Assists", key: "assists", suffix: "" },
        ];
      case "defending":
        return [
          { label: "Blk", fullLabel: "Blocks", key: "blocks", suffix: "" },
          { label: "Int", fullLabel: "Interceptions", key: "interceptions", suffix: "" },
          { label: "Clr", fullLabel: "Clearances", key: "clearances", suffix: "" },
          { label: "Rec", fullLabel: "Recoveries", key: "recoveries", suffix: "" },
        ];
      case "attacking":
        return [
          { label: "PRn", fullLabel: "Progressive Runs", key: "progressiveRuns", suffix: "" },
          { label: "Drb", fullLabel: "Total Dribbles", key: "totalDribbles", suffix: "" },
          { label: "SDr", fullLabel: "Successful Dribbles", key: "successfulDribbles", suffix: "" },
          { label: "Air", fullLabel: "Aerial Duels Won", key: "aerialDuelsWon", suffix: "" },
          { label: "Sht", fullLabel: "Shots", key: "shots", suffix: "" },
          { label: "OT", fullLabel: "Shots On Target", key: "shotsOnTarget", suffix: "" },
          { label: "Cv%", fullLabel: "Conversion Rate", key: "shotConversionRate", suffix: "%" },
        ];
      default:
        return [
          { label: "M", fullLabel: "Matches Played", key: "matchesPlayed", suffix: "" },
          { label: "Min", fullLabel: "Minutes Played", key: "totalMinutesPlayed", suffix: "" },
          { label: "PAS", fullLabel: "Passing", key: "passing", suffix: "" },
          { label: "SHO", fullLabel: "Shooting", key: "shooting", suffix: "" },
          { label: "DRI", fullLabel: "Dribbling", key: "dribbling", suffix: "" },
          { label: "DEF", fullLabel: "Defending", key: "defending", suffix: "" },
          { label: "PHY", fullLabel: "Physical", key: "physical", suffix: "" },
        ];
    }
  }, [statFilter]);

  // Get stat value for a player
  const getStatValue = (player: Player, stats: ReturnType<typeof calculateOverallStats>, key: string): number => {
    // Attributes
    if (key in player.attributes) return player.attributes[key as keyof typeof player.attributes];
    // Calculated stats
    if (stats && key in stats) return stats[key as keyof typeof stats] as number;
    return 0;
  };

  // Calculate max values for each column dynamically from all players
  const maxValues = useMemo(() => {
    const maxMap: Record<string, number> = {};

    columnDefs.forEach(col => {
      let max = 0;
      playersWithStats.forEach(({ player, stats }) => {
        const value = getStatValue(player, stats, col.key);
        if (value > max) max = value;
      });
      // Ensure we don't divide by zero - use at least 1
      maxMap[col.key] = max > 0 ? max : 1;
    });

    return maxMap;
  }, [playersWithStats, columnDefs]);

  // Get sortable value for a player
  const getSortValue = (player: Player, stats: ReturnType<typeof calculateOverallStats>, key: SortKey): string | number => {
    // Basic player properties
    if (key === "name" || key === "position") return player[key];
    if (key === "jerseyNumber" || key === "overallRating") return player[key];

    // Attributes
    if (key in player.attributes) return player.attributes[key as keyof typeof player.attributes];

    // Calculated stats
    if (stats && key in stats) return stats[key as keyof typeof stats] as number;

    return 0;
  };

  const sortedPlayers = useMemo(() => {
    return [...playersWithStats].sort((a, b) => {
      const aValue = getSortValue(a.player, a.stats, sortKey);
      const bValue = getSortValue(b.player, b.stats, sortKey);

      if (typeof aValue === "string") {
        return sortDirection === "asc"
          ? aValue.localeCompare(bValue as string)
          : (bValue as string).localeCompare(aValue);
      }

      return sortDirection === "asc" ? (aValue as number) - (bValue as number) : (bValue as number) - (aValue as number);
    });
  }, [playersWithStats, sortKey, sortDirection]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDirection("desc");
    }
  };

  const handleRowClick = (playerId: string) => {
    window.scrollTo(0, 0);
    navigate(`/player/${playerId}`);
  };

  const handleCompareClick = (e: React.MouseEvent, player: Player) => {
    e.stopPropagation();
    onCompare?.(player);
  };

  const SortableHeader = ({ label, sortKeyValue, title }: { label: string; sortKeyValue: SortKey; title?: string }) => (
    <Button
      variant="ghost"
      size="sm"
      className="h-auto p-0 font-semibold text-muted-foreground hover:text-foreground hover:bg-transparent"
      onClick={() => handleSort(sortKeyValue)}
      title={title || label}
    >
      {label}
      <ArrowUpDown className={cn(
        "ml-1 h-3 w-3 transition-colors",
        sortKey === sortKeyValue && "text-primary"
      )} />
    </Button>
  );

  // Color based on relative position (percentage of max)
  const getRelativeColor = (value: number, maxValue: number) => {
    const percentage = maxValue > 0 ? (value / maxValue) * 100 : 0;
    if (percentage >= 80) return "text-success";
    if (percentage >= 60) return "text-primary";
    if (percentage >= 40) return "text-warning";
    return "text-destructive";
  };

  // Bar color based on relative position (matching text colors)
  const getRelativeBarColor = (value: number, maxValue: number) => {
    const percentage = maxValue > 0 ? (value / maxValue) * 100 : 0;
    if (percentage >= 80) return "bg-success";
    if (percentage >= 60) return "bg-primary";
    if (percentage >= 40) return "bg-warning";
    return "bg-destructive";
  };

  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="border-border hover:bg-transparent">
            <TableHead className="w-[35px] px-2 text-center h-10">
              <SortableHeader label="#" sortKeyValue="jerseyNumber" title="Jersey Number" />
            </TableHead>
            <TableHead className="w-[120px] px-2 h-10 text-center">
              <SortableHeader label="Player" sortKeyValue="name" />
            </TableHead>
            <TableHead className="w-[50px] px-2 h-10 text-center">
              <SortableHeader label="Pos" sortKeyValue="position" title="Position" />
            </TableHead>
            <TableHead className="w-[45px] px-2 text-center h-10">
              <SortableHeader label="OVR" sortKeyValue="overallRating" title="Overall Rating" />
            </TableHead>
            {columnDefs.map((col) => (
              <TableHead key={col.key} className="text-center w-[45px] px-1 h-10">
                <SortableHeader label={col.label} sortKeyValue={col.key} title={col.fullLabel} />
              </TableHead>
            ))}
            {onCompare && (
              <TableHead className="w-[40px] px-2 text-center h-10">
                <span className="text-xs font-semibold text-muted-foreground">Cmp</span>
              </TableHead>
            )}

          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedPlayers.map(({ player, stats }, index) => (
            <motion.tr
              key={player.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.02, duration: 0.2 }}
              className="border-border hover:bg-secondary/50 cursor-pointer group"
              onClick={() => handleRowClick(player.id)}
            >
              <TableCell className="text-center py-5 px-2">
                <span className="inline-flex items-center justify-center w-6 h-6 rounded bg-primary/10 text-primary font-bold text-xs">
                  {player.jerseyNumber}
                </span>
              </TableCell>
              <TableCell className="py-5 px-2">
                <div className="flex items-center justify-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center border border-border group-hover:border-primary/30 transition-colors">
                    <User className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div className="min-w-0 text-left">
                    <div className="font-medium text-sm text-foreground group-hover:text-primary transition-colors truncate">
                      {player.name}
                    </div>
                    <div className="text-xs text-muted-foreground truncate">{player.team}</div>
                  </div>
                </div>
              </TableCell>
              <TableCell className="py-5 px-2 text-center">
                <span className="px-1.5 py-0.5 rounded bg-secondary text-xs font-medium text-secondary-foreground whitespace-nowrap">
                  {player.position}
                </span>
              </TableCell>
              <TableCell className="text-center py-5 px-2">
                <span className={cn("font-bold", getRelativeColor(player.overallRating, 100))}>
                  {player.overallRating}
                </span>
              </TableCell>
              {columnDefs.map((col) => {
                const value = getStatValue(player, stats, col.key);
                const maxValue = maxValues[col.key];
                const displayValue = col.suffix ? `${value}${col.suffix}` : value;
                const barPercentage = maxValue > 0 ? (value / maxValue) * 100 : 0;
                const barColor = getRelativeBarColor(value, maxValue);

                return (
                  <TableCell key={col.key} className="py-5 px-1">
                    <div className="flex flex-col items-center gap-0.5">
                      <span className={cn("font-semibold text-sm", getRelativeColor(value, maxValue))}>
                        {displayValue}
                      </span>
                      <div className="w-10">
                        <StatBar value={Math.min(barPercentage, 100)} showValue={false} size="sm" colorClass={barColor} />
                      </div>
                    </div>
                  </TableCell>
                );
              })}
              {onCompare && (
                <TableCell className="py-5 px-2 text-center text-center">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => handleCompareClick(e, player)}
                    title="Compare"
                  >
                    <ArrowLeftRight className="w-3 h-3" />
                  </Button>
                </TableCell>
              )}

            </motion.tr>
          ))}
        </TableBody>
      </Table>
    </div >
  );
};

export default PlayerTable;
