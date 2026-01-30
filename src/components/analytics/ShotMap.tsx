import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MatchEvent } from "@/types/player";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import TacticalField from "@/components/field/TacticalField";

interface ShotMapProps {
    events: MatchEvent[];
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

// Field dimensions for coordinate mapping
const PITCH_LENGTH = 105; // SVG pitch length
const PITCH_WIDTH = 68;   // SVG pitch width

const ShotMap = ({ events }: ShotMapProps) => {
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
        const accuracy = total > 0 ? Math.round((onTarget / total) * 100) : 0;
        const totalXG = filteredShots.reduce((sum, s) => sum + (s.xG || calculateXG(s.x, s.y)), 0);

        return { total, goals, onTarget, accuracy, totalXG };
    }, [filteredShots]);

    // Handle click on empty field area to close popup
    const handleFieldClick = () => {
        setSelectedShot(null);
    };

    // Get shot marker style based on outcome
    // Goal = filled red circle, On Target = concentric red circles (unfilled), Shot = empty red circle (unfilled)
    const getShotStyle = (shot: MatchEvent) => {
        const isGoal = shot.isGoal || shot.shotOutcome === 'goal';
        const isOnTarget = shot.success || shot.shotOutcome === 'saved';
        const redColor = "hsl(var(--destructive))";
        
        if (isGoal) {
            return { type: 'goal', fill: redColor, stroke: redColor, fillOpacity: 0.9 };
        }
        if (isOnTarget) {
            return { type: 'onTarget', fill: "transparent", stroke: redColor, fillOpacity: 0 };
        }
        return { type: 'shot', fill: "transparent", stroke: redColor, fillOpacity: 0 };
    };

    // Convert backend coordinates (0-100) to SVG field coordinates
    // Backend: x = 0 (own goal line) to 100 (opponent goal line)
    // Backend: y = 0 (left touchline) to 100 (right touchline)
    // SVG: x = 0 to 105 (pitch length), y = 0 to 68 (pitch width)
    const toSvgCoords = (backendX: number, backendY: number) => {
        const svgX = (backendX / 100) * PITCH_LENGTH;
        const svgY = (backendY / 100) * PITCH_WIDTH;
        return { x: svgX, y: svgY };
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
            <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
                {[
                    { label: "Shots", value: stats.total, color: "text-primary" },
                    { label: "On Target", value: stats.onTarget, color: "text-warning" },
                    { label: "Goals", value: stats.goals, color: "text-success" },
                    { label: "Accuracy", value: `${stats.accuracy}%`, color: "text-success" },
                    { label: "xG", value: stats.totalXG.toFixed(2), color: "text-primary" },
                ].map((stat) => (
                    <div key={stat.label} className="text-center p-3 rounded-lg bg-secondary/50 border border-border">
                        <p className={cn("text-lg font-bold", stat.color)}>{stat.value}</p>
                        <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{stat.label}</p>
                    </div>
                ))}
            </div>

            {/* Full-Field Shot Map (Horizontal view) */}
            <div 
                className="relative w-full max-w-4xl mx-auto rounded-xl overflow-hidden border border-border shadow-xl bg-muted/20 aspect-[105/68]"
                onClick={handleFieldClick}
            >
                <TacticalField
                    viewMode="full"
                    className="w-full h-full"
                >
                    {/* Arrow marker definition */}
                    <defs>
                        <marker
                            id="shot-arrow"
                            markerWidth="4"
                            markerHeight="4"
                            refX="3"
                            refY="2"
                            orient="auto"
                        >
                            <path d="M0,0 L4,2 L0,4 Z" fill="hsl(var(--destructive))" />
                        </marker>
                    </defs>

                    {/* Shot Markers */}
                    {filteredShots.map((shot, index) => {
                        // Convert backend coords (0-100) to SVG coords
                        const { x: svgX, y: svgY } = toSvgCoords(shot.x, shot.y);
                        const shotXG = shot.xG || calculateXG(shot.x, shot.y);
                        const shotStyle = getShotStyle(shot);
                        const isSelected = selectedShot === shot.originalIndex;

                        // Circle radius - smaller fixed size for cleaner look
                        const radius = 1.2;

                        // Goal position (right side of field)
                        const goalX = PITCH_LENGTH; // 105
                        const goalY = PITCH_WIDTH / 2; // 34 (center of goal)

                        // Calculate arrow end point (shorter arrow, not all the way to goal)
                        const dx = goalX - svgX;
                        const dy = goalY - svgY;
                        const distance = Math.sqrt(dx * dx + dy * dy);
                        const arrowLength = Math.min(8, distance * 0.4); // Arrow length proportional to distance, max 8
                        const arrowEndX = svgX + (dx / distance) * arrowLength;
                        const arrowEndY = svgY + (dy / distance) * arrowLength;

                        return (
                            <g
                                key={`shot-${index}`}
                                style={{ cursor: 'pointer' }}
                                onClick={(e) => {
                                    e.stopPropagation(); // Prevent field click from closing popup
                                    setSelectedShot(isSelected ? null : shot.originalIndex);
                                }}
                            >
                                {/* Arrow showing shot direction to goal */}
                                <line
                                    x1={svgX}
                                    y1={svgY}
                                    x2={arrowEndX}
                                    y2={arrowEndY}
                                    stroke="hsl(var(--destructive))"
                                    strokeWidth={0.3}
                                    strokeOpacity={0.7}
                                    markerEnd="url(#shot-arrow)"
                                />

                                {/* Shot marker at origin */}
                                <g transform={`translate(${svgX}, ${svgY})`}>
                                    {/* Selection ring */}
                                    {isSelected && (
                                        <circle
                                            r={radius + 0.8}
                                            fill="none"
                                            stroke="white"
                                            strokeWidth={0.3}
                                            opacity={0.9}
                                        />
                                    )}

                                    {/* Shot visualization based on outcome */}
                                    {shotStyle.type === 'goal' ? (
                                        /* Goal: Filled red circle */
                                        <circle
                                            r={radius}
                                            fill={shotStyle.fill}
                                            fillOpacity={0.9}
                                            stroke={shotStyle.stroke}
                                            strokeWidth={0.25}
                                        />
                                    ) : shotStyle.type === 'onTarget' ? (
                                        /* On Target: Two concentric unfilled red circles */
                                        <>
                                            <circle
                                                r={radius}
                                                fill="transparent"
                                                stroke={shotStyle.stroke}
                                                strokeWidth={0.3}
                                            />
                                            <circle
                                                r={radius * 0.5}
                                                fill="transparent"
                                                stroke={shotStyle.stroke}
                                                strokeWidth={0.3}
                                            />
                                        </>
                                    ) : (
                                        /* Missed shot: Single unfilled red circle */
                                        <circle
                                            r={radius}
                                            fill="transparent"
                                            stroke={shotStyle.stroke}
                                            strokeWidth={0.3}
                                        />
                                    )}

                                    {/* xG label */}
                                    {showXG && (
                                        <g transform={`translate(0, ${radius + 1.8})`}>
                                            <rect
                                                x={-3}
                                                y={-1}
                                                width={6}
                                                height={2}
                                                rx={0.4}
                                                fill="rgba(0,0,0,0.75)"
                                            />
                                            <text
                                                x={0}
                                                y={0.4}
                                                textAnchor="middle"
                                                fontSize={1.3}
                                                fill="white"
                                                fontFamily="monospace"
                                            >
                                                {shotXG.toFixed(2)}
                                            </text>
                                        </g>
                                    )}
                                </g>
                            </g>
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
                                        </div>
                                    </>
                                );
                            })()}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm py-2">
                <div className="flex items-center gap-2">
                    <svg width="20" height="20" viewBox="0 0 20 20">
                        <circle cx="10" cy="10" r="5" fill="hsl(var(--destructive))" fillOpacity="0.9" stroke="hsl(var(--destructive))" strokeWidth="1" />
                    </svg>
                    <span className="text-muted-foreground">Goal</span>
                </div>
                <div className="flex items-center gap-2">
                    <svg width="20" height="20" viewBox="0 0 20 20">
                        <circle cx="10" cy="10" r="5" fill="transparent" stroke="hsl(var(--destructive))" strokeWidth="1.2" />
                        <circle cx="10" cy="10" r="2.5" fill="transparent" stroke="hsl(var(--destructive))" strokeWidth="1.2" />
                    </svg>
                    <span className="text-muted-foreground">On Target</span>
                </div>
                <div className="flex items-center gap-2">
                    <svg width="20" height="20" viewBox="0 0 20 20">
                        <circle cx="10" cy="10" r="5" fill="transparent" stroke="hsl(var(--destructive))" strokeWidth="1.2" />
                    </svg>
                    <span className="text-muted-foreground">Missed</span>
                </div>
            </div>
        </div>
    );
};

export default ShotMap;
