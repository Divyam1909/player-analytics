import { useState, useMemo, useId } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MatchEvent } from "@/types/player";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Target, Circle, X, Star, AlertTriangle } from "lucide-react";
import TacticalField from "@/components/field/TacticalField";

interface ShotMapProps {
    events: MatchEvent[];
    onUpdateEvent?: (index: number, updates: Partial<MatchEvent>) => void;
    editable?: boolean;
}

interface TimeInterval {
    label: string;
    start: number;
    end: number;
}

const TIME_INTERVALS: TimeInterval[] = [
    { label: "All", start: 0, end: 90 },
    { label: "0-10'", start: 0, end: 10 },
    { label: "10-20'", start: 10, end: 20 },
    { label: "20-30'", start: 20, end: 30 },
    { label: "30-45'", start: 30, end: 45 },
    { label: "45-55'", start: 45, end: 55 },
    { label: "55-65'", start: 55, end: 65 },
    { label: "65-75'", start: 65, end: 75 },
    { label: "75-90'", start: 75, end: 90 },
];

// Calculate xG based on shot position
const calculateXG = (x: number, y: number): number => {
    // Simplified xG model based on distance from goal center
    const goalX = 100;
    const goalY = 50;
    const distance = Math.sqrt(Math.pow(goalX - x, 2) + Math.pow(goalY - y, 2));

    // Higher xG for closer shots and central positions
    let xG = Math.max(0, 1 - (distance / 100));

    // Boost for shots inside penalty area (x > 84)
    if (x > 84) xG *= 1.5;
    // Boost for central positions
    if (y > 35 && y < 65) xG *= 1.3;

    return Math.min(0.95, Math.max(0.02, xG));
};

const ShotMap = ({ events, onUpdateEvent, editable = false }: ShotMapProps) => {
    const uniqueId = useId();
    const [selectedInterval, setSelectedInterval] = useState<TimeInterval>(TIME_INTERVALS[0]);
    const [selectedShot, setSelectedShot] = useState<number | null>(null);
    const [showXG, setShowXG] = useState(true);

    // Filter shots only
    const shotEvents = useMemo(() => {
        return events
            .map((e, originalIndex) => ({ ...e, originalIndex }))
            .filter(e => e.type === "shot");
    }, [events]);

    // Filter by time interval
    const filteredShots = useMemo(() => {
        return shotEvents.filter(
            e => e.minute >= selectedInterval.start && e.minute < selectedInterval.end
        );
    }, [shotEvents, selectedInterval]);

    // Calculate shot stats
    const stats = useMemo(() => {
        const total = filteredShots.length;
        const goals = filteredShots.filter(s => s.isGoal || s.shotOutcome === 'goal').length;
        const onTarget = filteredShots.filter(s => s.success || s.shotOutcome === 'saved' || s.shotOutcome === 'goal').length;
        const bigChances = filteredShots.filter(s => s.isBigChance).length;
        const bigChancesMissed = filteredShots.filter(s => s.isBigChance && !s.isGoal && s.shotOutcome !== 'goal').length;
        const accuracy = total > 0 ? Math.round((onTarget / total) * 100) : 0;
        const totalXG = filteredShots.reduce((sum, s) => sum + (s.xG || calculateXG(s.x, s.y)), 0);

        return { total, goals, onTarget, bigChances, bigChancesMissed, accuracy, totalXG };
    }, [filteredShots]);

    const getShotIcon = (shot: MatchEvent & { originalIndex: number }) => {
        const isGoal = shot.isGoal || shot.shotOutcome === 'goal';
        const isOnTarget = shot.success || shot.shotOutcome === 'saved';
        const isBigChance = shot.isBigChance;

        if (isGoal) {
            return (
                <div className="relative">
                    <Target className="w-5 h-5 text-success" />
                    {isBigChance && <Star className="absolute -top-1 -right-1 w-3 h-3 text-warning fill-warning" />}
                </div>
            );
        }
        if (isOnTarget) {
            return (
                <div className="relative">
                    <Circle className="w-5 h-5 text-warning fill-warning/30" />
                    {isBigChance && <Star className="absolute -top-1 -right-1 w-3 h-3 text-destructive fill-destructive" />}
                </div>
            );
        }
        return (
            <div className="relative">
                <X className="w-5 h-5 text-destructive" />
                {isBigChance && <AlertTriangle className="absolute -top-1 -right-1 w-3 h-3 text-destructive fill-destructive/30" />}
            </div>
        );
    };

    const getShotColor = (shot: MatchEvent) => {
        const isGoal = shot.isGoal || shot.shotOutcome === 'goal';
        if (isGoal) return "bg-success";
        if (shot.success) return "bg-warning";
        return "bg-destructive";
    };

    const handleBigChanceToggle = (index: number, value: boolean) => {
        if (onUpdateEvent) {
            onUpdateEvent(index, { isBigChance: value });
        }
    };

    return (
        <div className="space-y-4">
            {/* Time Interval Selector */}
            <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-medium text-muted-foreground">Time Interval:</span>
                <div className="flex flex-wrap gap-1">
                    {TIME_INTERVALS.map((interval) => (
                        <Button
                            key={interval.label}
                            variant={selectedInterval.label === interval.label ? "default" : "outline"}
                            size="sm"
                            onClick={() => setSelectedInterval(interval)}
                            className="h-7 px-2 text-xs"
                        >
                            {interval.label}
                        </Button>
                    ))}
                </div>
                <div className="ml-auto flex items-center gap-2">
                    <Switch id="show-xg" checked={showXG} onCheckedChange={setShowXG} />
                    <Label htmlFor="show-xg" className="text-xs">Show xG</Label>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-3 md:grid-cols-7 gap-2">
                {[
                    { label: "Shots", value: stats.total, color: "text-primary" },
                    { label: "On Target", value: stats.onTarget, color: "text-warning" },
                    { label: "Goals", value: stats.goals, color: "text-success" },
                    { label: "Big Chances", value: stats.bigChances, color: "text-chart-4" },
                    { label: "BC Missed", value: stats.bigChancesMissed, color: "text-destructive" },
                    { label: "Accuracy", value: `${stats.accuracy}%`, color: "text-success" },
                    { label: "xG", value: stats.totalXG.toFixed(2), color: "text-primary" },
                ].map((stat) => (
                    <div key={stat.label} className="text-center p-3 rounded-lg bg-secondary/50 border border-border">
                        <p className={cn("text-lg font-bold", stat.color)}>{stat.value}</p>
                        <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{stat.label}</p>
                    </div>
                ))}
            </div>

            {/* Half-Field Shot Map (attacking half only - Goal Top) */}
            <div className="relative w-full max-w-4xl mx-auto rounded-xl overflow-hidden border border-border shadow-xl bg-muted/20 aspect-[1.26796]">
                <TacticalField
                    viewMode="vertical_half"
                    className="w-full h-full"
                    interactive
                >
                    {/* Shot Markers */}
                    {filteredShots.map((shot, index) => {
                        // Transform for Goal Top view (Vertical Half -90deg):
                        // Shot X (Length): 0 (Own Goal) -> 100 (Opp Goal).
                        // SVG X (Vertical): 0 (Bottom) -> 105 (Top).
                        // shot.x=100 -> svgX=105. shot.x=50 -> svgX=52.5.
                        const svgX = shot.x * 1.05;

                        // Shot Y (Width): 0 (Left) -> 100 (Right).
                        // SVG Y (Horizontal): 0 (Left) -> 68 (Right).
                        const svgY = shot.y * 0.68;

                        const shotXG = shot.xG || calculateXG(shot.x, shot.y);

                        return (
                            <foreignObject
                                key={`shot-${index}`}
                                x={svgX - 2.5}
                                y={svgY - 2.5}
                                width={5}
                                height={5}
                                className="overflow-visible"
                            >
                                <motion.div
                                    className={cn(
                                        "w-full h-full flex items-center justify-center cursor-pointer transform rotate-90", // Counter-rotate to stay upright
                                        selectedShot === shot.originalIndex && "ring-2 ring-white ring-offset-2 ring-offset-transparent rounded-full"
                                    )}
                                    onClick={() => setSelectedShot(selectedShot === shot.originalIndex ? null : shot.originalIndex)}
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ delay: index * 0.05 }}
                                    whileHover={{ scale: 1.3 }}
                                >
                                    {getShotIcon(shot)}

                                    {/* xG Badge */}
                                    {showXG && (
                                        <div
                                            className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-[8px] font-mono px-1 py-0.5 rounded bg-black/70 text-white whitespace-nowrap"
                                            style={{ fontSize: '1.5px', lineHeight: '1.2', bottom: '-2px' }}
                                        >
                                            {shotXG.toFixed(2)}
                                        </div>
                                    )}
                                </motion.div>
                            </foreignObject>
                        );
                    })}
                </TacticalField>

                {/* Selected Shot Details Overlay */}
                <AnimatePresence>
                    {selectedShot !== null && (
                        <motion.div
                            className="absolute top-4 right-4 bg-card/95 backdrop-blur-md border border-border rounded-xl p-4 z-30 shadow-xl min-w-[220px]"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                        >
                            {(() => {
                                const shot = events[selectedShot];
                                if (!shot) return null;
                                const shotXG = shot.xG || calculateXG(shot.x, shot.y);

                                return (
                                    <>
                                        <div className="flex items-center justify-between mb-3 pb-2 border-b border-border">
                                            <span className="text-sm font-bold">Shot Details</span>
                                            <Badge variant="secondary" className="text-xs">{shot.minute}'</Badge>
                                        </div>
                                        <div className="space-y-2 text-xs">
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Position</span>
                                                <span className="font-mono">({shot.x}, {shot.y})</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Expected Goals</span>
                                                <span className="font-bold text-primary">{shotXG.toFixed(2)}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Outcome</span>
                                                <Badge variant={shot.isGoal || shot.shotOutcome === 'goal' ? "default" : shot.success ? "secondary" : "destructive"}>
                                                    {shot.isGoal || shot.shotOutcome === 'goal' ? "Goal" : shot.success ? "On Target" : "Missed"}
                                                </Badge>
                                            </div>

                                            {/* Big Chance Toggle for Analysts */}
                                            {editable && (
                                                <div className="flex items-center justify-between pt-2 border-t border-border mt-2">
                                                    <Label htmlFor="big-chance" className="text-muted-foreground">Big Chance?</Label>
                                                    <Switch
                                                        id="big-chance"
                                                        checked={shot.isBigChance || false}
                                                        onCheckedChange={(checked) => handleBigChanceToggle(selectedShot, checked)}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </>
                                );
                            })()}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap items-center justify-center gap-4 text-sm py-2">
                <div className="flex items-center gap-2">
                    <Target className="w-4 h-4 text-success" />
                    <span className="text-muted-foreground">Goal</span>
                </div>
                <div className="flex items-center gap-2">
                    <Circle className="w-4 h-4 text-warning fill-warning/30" />
                    <span className="text-muted-foreground">On Target</span>
                </div>
                <div className="flex items-center gap-2">
                    <X className="w-4 h-4 text-destructive" />
                    <span className="text-muted-foreground">Missed</span>
                </div>
                <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-warning fill-warning" />
                    <span className="text-muted-foreground">Big Chance</span>
                </div>
            </div>
        </div>
    );
};

export default ShotMap;
