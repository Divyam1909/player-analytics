import { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
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
import { ArrowUpDown, ChevronRight, User, ArrowLeftRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface PlayerTableProps {
  players: Player[];
  onCompare?: (player: Player) => void;
}

type SortKey = "name" | "jerseyNumber" | "position" | "overallRating" | "passing" | "shooting" | "dribbling" | "defending" | "physical";

const PlayerTable = ({ players, onCompare }: PlayerTableProps) => {
  const [sortKey, setSortKey] = useState<SortKey>("overallRating");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const navigate = useNavigate();

  const sortedPlayers = useMemo(() => {
    return [...players].sort((a, b) => {
      let aValue: string | number;
      let bValue: string | number;

      if (sortKey === "name" || sortKey === "position") {
        aValue = a[sortKey];
        bValue = b[sortKey];
      } else if (sortKey === "jerseyNumber" || sortKey === "overallRating") {
        aValue = a[sortKey];
        bValue = b[sortKey];
      } else {
        aValue = a.attributes[sortKey];
        bValue = b.attributes[sortKey];
      }

      if (typeof aValue === "string") {
        return sortDirection === "asc"
          ? aValue.localeCompare(bValue as string)
          : (bValue as string).localeCompare(aValue);
      }

      return sortDirection === "asc" ? aValue - (bValue as number) : (bValue as number) - aValue;
    });
  }, [players, sortKey, sortDirection]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDirection("desc");
    }
  };

  const handleRowClick = (playerId: string) => {
    navigate(`/player/${playerId}`);
  };

  const handleCompareClick = (e: React.MouseEvent, player: Player) => {
    e.stopPropagation();
    onCompare?.(player);
  };

  const SortableHeader = ({ label, sortKeyValue }: { label: string; sortKeyValue: SortKey }) => (
    <Button
      variant="ghost"
      size="sm"
      className="h-auto p-0 font-semibold text-muted-foreground hover:text-foreground hover:bg-transparent"
      onClick={() => handleSort(sortKeyValue)}
    >
      {label}
      <ArrowUpDown className={cn(
        "ml-1 h-3 w-3 transition-colors",
        sortKey === sortKeyValue && "text-primary"
      )} />
    </Button>
  );

  const getRatingColor = (rating: number) => {
    if (rating >= 90) return "text-success";
    if (rating >= 80) return "text-primary";
    if (rating >= 70) return "text-warning";
    return "text-destructive";
  };

  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="border-border hover:bg-transparent">
            <TableHead className="w-[250px]">
              <SortableHeader label="Player" sortKeyValue="name" />
            </TableHead>
            <TableHead className="w-[60px] text-center">
              <SortableHeader label="#" sortKeyValue="jerseyNumber" />
            </TableHead>
            <TableHead>
              <SortableHeader label="Position" sortKeyValue="position" />
            </TableHead>
            <TableHead className="text-center">
              <SortableHeader label="OVR" sortKeyValue="overallRating" />
            </TableHead>
            <TableHead className="text-center">
              <SortableHeader label="PAS" sortKeyValue="passing" />
            </TableHead>
            <TableHead className="text-center">
              <SortableHeader label="SHO" sortKeyValue="shooting" />
            </TableHead>
            <TableHead className="text-center">
              <SortableHeader label="DRI" sortKeyValue="dribbling" />
            </TableHead>
            <TableHead className="text-center">
              <SortableHeader label="DEF" sortKeyValue="defending" />
            </TableHead>
            <TableHead className="text-center">
              <SortableHeader label="PHY" sortKeyValue="physical" />
            </TableHead>
            {onCompare && (
              <TableHead className="w-[80px] text-center">
                <span className="text-xs font-semibold text-muted-foreground">Compare</span>
              </TableHead>
            )}
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedPlayers.map((player, index) => (
            <motion.tr
              key={player.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03, duration: 0.3 }}
              className="border-border hover:bg-secondary/50 cursor-pointer group"
              onClick={() => handleRowClick(player.id)}
            >
              <TableCell>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center border border-border group-hover:border-primary/30 transition-colors">
                    <User className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div>
                    <div className="font-semibold text-foreground group-hover:text-primary transition-colors">
                      {player.name}
                    </div>
                    <div className="text-xs text-muted-foreground">{player.team}</div>
                  </div>
                </div>
              </TableCell>
              <TableCell className="text-center">
                <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 text-primary font-bold text-sm">
                  {player.jerseyNumber}
                </span>
              </TableCell>
              <TableCell>
                <span className="inline-flex px-2 py-1 rounded-md bg-secondary text-xs font-medium text-secondary-foreground">
                  {player.position}
                </span>
              </TableCell>
              <TableCell className="text-center">
                <span className={cn("font-bold text-lg", getRatingColor(player.overallRating))}>
                  {player.overallRating}
                </span>
              </TableCell>
              <TableCell>
                <div className="flex flex-col items-center gap-1">
                  <span className={cn("font-semibold text-sm", getRatingColor(player.attributes.passing))}>
                    {player.attributes.passing}
                  </span>
                  <StatBar value={player.attributes.passing} showValue={false} size="sm" />
                </div>
              </TableCell>
              <TableCell>
                <div className="flex flex-col items-center gap-1">
                  <span className={cn("font-semibold text-sm", getRatingColor(player.attributes.shooting))}>
                    {player.attributes.shooting}
                  </span>
                  <StatBar value={player.attributes.shooting} showValue={false} size="sm" />
                </div>
              </TableCell>
              <TableCell>
                <div className="flex flex-col items-center gap-1">
                  <span className={cn("font-semibold text-sm", getRatingColor(player.attributes.dribbling))}>
                    {player.attributes.dribbling}
                  </span>
                  <StatBar value={player.attributes.dribbling} showValue={false} size="sm" />
                </div>
              </TableCell>
              <TableCell>
                <div className="flex flex-col items-center gap-1">
                  <span className={cn("font-semibold text-sm", getRatingColor(player.attributes.defending))}>
                    {player.attributes.defending}
                  </span>
                  <StatBar value={player.attributes.defending} showValue={false} size="sm" />
                </div>
              </TableCell>
              <TableCell>
                <div className="flex flex-col items-center gap-1">
                  <span className={cn("font-semibold text-sm", getRatingColor(player.attributes.physical))}>
                    {player.attributes.physical}
                  </span>
                  <StatBar value={player.attributes.physical} showValue={false} size="sm" />
                </div>
              </TableCell>
              {onCompare && (
                <TableCell>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => handleCompareClick(e, player)}
                    title="Compare player"
                  >
                    <ArrowLeftRight className="w-4 h-4" />
                  </Button>
                </TableCell>
              )}
              <TableCell>
                <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
              </TableCell>
            </motion.tr>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default PlayerTable;
