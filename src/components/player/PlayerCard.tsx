import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Player } from "@/types/player";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import StatBar from "@/components/charts/StatBar";
import { ChevronRight, User, ArrowLeftRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface PlayerCardProps {
  player: Player;
  onCompare?: (player: Player) => void;
}

const PlayerCard = ({ player, onCompare }: PlayerCardProps) => {
  const getRatingColor = (rating: number) => {
    if (rating >= 90) return "text-success";
    if (rating >= 80) return "text-primary";
    if (rating >= 70) return "text-warning";
    return "text-destructive";
  };

  const handleCompareClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onCompare?.(player);
  };

  return (
    <Link to={`/player/${player.id}`}>
      <motion.div
        whileHover={{ y: -4, transition: { duration: 0.2 } }}
        whileTap={{ scale: 0.98 }}
      >
        <Card className="group relative overflow-hidden bg-card hover:bg-secondary/50 border-border hover:border-primary/50 transition-all duration-300">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          <CardContent className="p-5">
            <div className="flex items-start gap-4">
              {/* Player Avatar/Number */}
              <div className="relative">
                <motion.div
                  className="w-16 h-16 rounded-lg bg-secondary flex items-center justify-center border border-border group-hover:border-primary/30 transition-colors"
                  whileHover={{ rotate: [0, -5, 5, 0] }}
                  transition={{ duration: 0.5 }}
                >
                  <User className="w-8 h-8 text-muted-foreground" />
                </motion.div>
                <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-sm font-bold text-primary-foreground">
                  {player.jerseyNumber}
                </div>
              </div>

              {/* Player Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-foreground group-hover:text-primary transition-colors truncate">
                      {player.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">{player.position}</p>
                    <p className="text-xs text-muted-foreground/70">{player.team}</p>
                  </div>
                  <div className="text-right">
                    <motion.div
                      className={cn("text-2xl font-bold", getRatingColor(player.overallRating))}
                      initial={{ scale: 0.8 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 200 }}
                    >
                      {player.overallRating}
                    </motion.div>
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                      Overall
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Attributes */}
            <div className="mt-4 grid grid-cols-5 gap-3">
              {Object.entries(player.attributes).map(([key, value]) => (
                <div key={key} className="text-center">
                  <div className={cn("text-lg font-bold", getRatingColor(value))}>
                    {value}
                  </div>
                  <div className="text-[9px] uppercase tracking-wide text-muted-foreground">
                    {key.slice(0, 3)}
                  </div>
                </div>
              ))}
            </div>

            {/* Stats Bars */}
            <div className="mt-4 space-y-2">
              <StatBar value={player.attributes.passing} label="Passing" size="sm" />
              <StatBar value={player.attributes.shooting} label="Shooting" size="sm" />
              <StatBar value={player.attributes.dribbling} label="Dribbling" size="sm" />
            </div>

            {/* Actions */}
            <div className="mt-4 flex items-center justify-between">
              {onCompare && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={handleCompareClick}
                >
                  <ArrowLeftRight className="w-3 h-3 mr-1" />
                  Compare
                </Button>
              )}
              <div className={cn(
                "flex items-center text-xs text-muted-foreground group-hover:text-primary transition-colors",
                !onCompare && "ml-auto"
              )}>
                View Details
                <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </Link>
  );
};

export default PlayerCard;
