import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Player } from "@/types/player";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import RadarChart from "@/components/charts/RadarChart";
import { cn } from "@/lib/utils";
import { ArrowLeftRight, X, Trophy, Target, Footprints, Shield, Zap } from "lucide-react";

interface CompareModalProps {
    isOpen: boolean;
    onClose: () => void;
    players: Player[];
    initialPlayer?: Player;
}

const CompareModal = ({ isOpen, onClose, players, initialPlayer }: CompareModalProps) => {
    const [player1Id, setPlayer1Id] = useState<string>(initialPlayer?.id || "");
    const [player2Id, setPlayer2Id] = useState<string>("");

    // Sync player1Id when initialPlayer changes (e.g., clicking compare on a specific player row)
    useEffect(() => {
        if (initialPlayer) {
            setPlayer1Id(initialPlayer.id);
        }
    }, [initialPlayer]);

    // Reset selections when modal closes
    useEffect(() => {
        if (!isOpen) {
            setPlayer1Id(initialPlayer?.id || "");
            setPlayer2Id("");
        }
    }, [isOpen, initialPlayer]);

    const player1 = players.find(p => p.id === player1Id);
    const player2 = players.find(p => p.id === player2Id);

    const getPlayerStats = (player: Player) => {
        const matches = player.matchStats;
        return {
            goals: matches.reduce((a, m) => a + m.stats.goals, 0),
            assists: matches.reduce((a, m) => a + m.stats.assists, 0),
            avgPasses: Math.round(matches.reduce((a, m) => a + m.stats.passes, 0) / matches.length),
            avgPassAccuracy: Math.round(matches.reduce((a, m) => a + m.stats.passAccuracy, 0) / matches.length),
            avgShots: Math.round(matches.reduce((a, m) => a + m.stats.shots, 0) / matches.length),
            avgTackles: Math.round(matches.reduce((a, m) => a + m.stats.tackles, 0) / matches.length),
        };
    };

    const stats1 = player1 ? getPlayerStats(player1) : null;
    const stats2 = player2 ? getPlayerStats(player2) : null;

    const compareValue = (val1: number, val2: number) => {
        if (val1 > val2) return "better";
        if (val1 < val2) return "worse";
        return "equal";
    };

    const statItems = [
        { label: "Overall Rating", key: "overallRating", icon: Trophy },
        { label: "Total Goals", key: "goals", icon: Target },
        { label: "Total Assists", key: "assists", icon: Footprints },
        { label: "Avg Passes", key: "avgPasses", icon: Shield },
        { label: "Pass Accuracy", key: "avgPassAccuracy", suffix: "%" },
        { label: "Avg Shots", key: "avgShots", icon: Zap },
    ];

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-card border-border">
                <DialogHeader>
                    <DialogTitle className="text-xl flex items-center gap-2">
                        <ArrowLeftRight className="w-5 h-5 text-primary" />
                        Player Comparison
                    </DialogTitle>
                </DialogHeader>

                {/* Player Selection */}
                <div className="grid grid-cols-2 gap-6 mt-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">Player 1</label>
                        <Select value={player1Id} onValueChange={setPlayer1Id}>
                            <SelectTrigger className="bg-secondary border-border">
                                <SelectValue placeholder="Select player" />
                            </SelectTrigger>
                            <SelectContent className="bg-popover border-border">
                                {players.map((player) => (
                                    <SelectItem key={player.id} value={player.id} disabled={player.id === player2Id}>
                                        {player.name} ({player.position})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">Player 2</label>
                        <Select value={player2Id} onValueChange={setPlayer2Id}>
                            <SelectTrigger className="bg-secondary border-border">
                                <SelectValue placeholder="Select player" />
                            </SelectTrigger>
                            <SelectContent className="bg-popover border-border">
                                {players.map((player) => (
                                    <SelectItem key={player.id} value={player.id} disabled={player.id === player1Id}>
                                        {player.name} ({player.position})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Comparison Content */}
                <AnimatePresence mode="wait">
                    {player1 && player2 && stats1 && stats2 && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3 }}
                            className="space-y-6 mt-6"
                        >
                            {/* Radar Charts */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                                <div className="flex flex-col items-center">
                                    <h3 className="text-lg font-bold text-foreground mb-2">{player1.name}</h3>
                                    <p className="text-sm text-muted-foreground mb-4">{player1.position} • #{player1.jerseyNumber}</p>
                                    <RadarChart attributes={player1.attributes} size="sm" />
                                </div>

                                <div className="flex items-center justify-center">
                                    <div className="text-4xl font-bold text-muted-foreground/30">VS</div>
                                </div>

                                <div className="flex flex-col items-center">
                                    <h3 className="text-lg font-bold text-foreground mb-2">{player2.name}</h3>
                                    <p className="text-sm text-muted-foreground mb-4">{player2.position} • #{player2.jerseyNumber}</p>
                                    <RadarChart attributes={player2.attributes} size="sm" />
                                </div>
                            </div>

                            {/* Stats Comparison */}
                            <div className="space-y-3">
                                <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Statistics</h4>

                                {statItems.map((stat) => {
                                    const val1 = stat.key === "overallRating" ? player1.overallRating : (stats1 as any)[stat.key];
                                    const val2 = stat.key === "overallRating" ? player2.overallRating : (stats2 as any)[stat.key];
                                    const comparison = compareValue(val1, val2);

                                    return (
                                        <div key={stat.key} className="grid grid-cols-3 items-center gap-4 py-2">
                                            <motion.div
                                                className={cn(
                                                    "text-right text-xl font-bold transition-colors",
                                                    comparison === "better" && "text-success",
                                                    comparison === "worse" && "text-destructive",
                                                    comparison === "equal" && "text-foreground"
                                                )}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: 0.1 }}
                                            >
                                                {val1}{stat.suffix || ""}
                                            </motion.div>

                                            <div className="text-center">
                                                <div className="text-xs uppercase tracking-wide text-muted-foreground">{stat.label}</div>
                                                {/* Progress bar comparison */}
                                                <div className="mt-2 flex gap-1 h-2">
                                                    <motion.div
                                                        className={cn(
                                                            "h-full rounded-l-full",
                                                            comparison === "better" ? "bg-success" : comparison === "worse" ? "bg-destructive" : "bg-primary"
                                                        )}
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${(val1 / (val1 + val2)) * 100}%` }}
                                                        transition={{ duration: 0.5, delay: 0.2 }}
                                                    />
                                                    <motion.div
                                                        className={cn(
                                                            "h-full rounded-r-full",
                                                            comparison === "worse" ? "bg-success" : comparison === "better" ? "bg-destructive" : "bg-primary"
                                                        )}
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${(val2 / (val1 + val2)) * 100}%` }}
                                                        transition={{ duration: 0.5, delay: 0.2 }}
                                                    />
                                                </div>
                                            </div>

                                            <motion.div
                                                className={cn(
                                                    "text-left text-xl font-bold transition-colors",
                                                    comparison === "worse" && "text-success",
                                                    comparison === "better" && "text-destructive",
                                                    comparison === "equal" && "text-foreground"
                                                )}
                                                initial={{ opacity: 0, x: 20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: 0.1 }}
                                            >
                                                {val2}{stat.suffix || ""}
                                            </motion.div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Attribute Comparison */}
                            <div className="space-y-3">
                                <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Attributes</h4>

                                {Object.entries(player1.attributes).map(([key, val1]) => {
                                    const val2 = player2.attributes[key as keyof typeof player2.attributes];
                                    const comparison = compareValue(val1, val2);

                                    return (
                                        <div key={key} className="grid grid-cols-3 items-center gap-4 py-1">
                                            <div className={cn(
                                                "text-right font-mono",
                                                comparison === "better" && "text-success",
                                                comparison === "worse" && "text-destructive/70"
                                            )}>
                                                {val1}
                                            </div>
                                            <div className="text-center text-sm capitalize text-muted-foreground">{key}</div>
                                            <div className={cn(
                                                "text-left font-mono",
                                                comparison === "worse" && "text-success",
                                                comparison === "better" && "text-destructive/70"
                                            )}>
                                                {val2}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Placeholder when no players selected */}
                {(!player1 || !player2) && (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                        <ArrowLeftRight className="w-12 h-12 text-muted-foreground/30 mb-4" />
                        <p className="text-muted-foreground">Select two players to compare their stats</p>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
};

export default CompareModal;
