import { Link } from "react-router-dom";
import { Player } from "@/types/player";
import { Card, CardContent } from "@/components/ui/card";
import StatBar from "@/components/charts/StatBar";
import { ChevronRight, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface PlayerCardProps {
  player: Player;
}

const PlayerCard = ({ player }: PlayerCardProps) => {
  const avgRating = Math.round(
    (player.attributes.passing +
      player.attributes.shooting +
      player.attributes.dribbling +
      player.attributes.defending +
      player.attributes.physical) / 5
  );

  const getRatingColor = (rating: number) => {
    if (rating >= 90) return "text-success";
    if (rating >= 80) return "text-primary";
    if (rating >= 70) return "text-warning";
    return "text-destructive";
  };

  return (
    <Link to={`/player/${player.id}`}>
      <Card className="group relative overflow-hidden bg-card hover:bg-secondary/50 border-border hover:border-primary/50 transition-all duration-300">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        <CardContent className="p-5">
          <div className="flex items-start gap-4">
            {/* Player Avatar/Number */}
            <div className="relative">
              <div className="w-16 h-16 rounded-lg bg-secondary flex items-center justify-center border border-border group-hover:border-primary/30 transition-colors">
                <User className="w-8 h-8 text-muted-foreground" />
              </div>
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
                  <div className={cn("text-2xl font-bold", getRatingColor(player.overallRating))}>
                    {player.overallRating}
                  </div>
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

          {/* View Details */}
          <div className="mt-4 flex items-center justify-end text-xs text-muted-foreground group-hover:text-primary transition-colors">
            View Details
            <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

export default PlayerCard;
