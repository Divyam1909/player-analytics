import { useState, useMemo, useId } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MatchEvent } from "@/types/player";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Layers, ArrowRight } from "lucide-react";

interface PassingMapProps {
    events: MatchEvent[];
    playerName?: string;
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

const PassingMap = ({ events, playerName }: PassingMapProps) => {
    const uniqueId = useId();
    const [selectedInterval, setSelectedInterval] = useState<TimeInterval>(TIME_INTERVALS[0]);
    const [showConnections, setShowConnections] = useState(true);

    // Filter passes only
    const passEvents = useMemo(() => {
        return events.filter(e => e.type === "pass");
    }, [events]);

    // Filter by time interval
    const filteredPasses = useMemo(() => {
        return passEvents.filter(
            e => e.minute >= selectedInterval.start && e.minute < selectedInterval.end
        );
    }, [passEvents, selectedInterval]);

    // Calculate passing stats
    const stats = useMemo(() => {
        const total = filteredPasses.length;
        const successful = filteredPasses.filter(p => p.success).length;
        const unsuccessful = total - successful;
        const accuracy = total > 0 ? Math.round((successful / total) * 100) : 0;
        const keyPasses = filteredPasses.filter(p => p.success && p.targetX > 75).length;

        // Get ball touches (all events in interval)
        const ballTouches = events.filter(
            e => e.minute >= selectedInterval.start && e.minute < selectedInterval.end
        ).length;

        return { total, successful, unsuccessful, accuracy, keyPasses, ballTouches };
    }, [filteredPasses, events, selectedInterval]);

    // Calculate heatmap zones for positioning
    const positionHeatmap = useMemo(() => {
        const gridCols = 10;
        const gridRows = 6;
        const zones: number[][] = Array(gridRows).fill(null).map(() => Array(gridCols).fill(0));

        filteredPasses.forEach(pass => {
            const zoneX = Math.min(Math.floor(pass.x / (100 / gridCols)), gridCols - 1);
            const zoneY = Math.min(Math.floor(pass.y / (100 / gridRows)), gridRows - 1);
            zones[zoneY][zoneX]++;
        });

        const maxIntensity = Math.max(...zones.flat());
        return { zones, maxIntensity, gridCols, gridRows };
    }, [filteredPasses]);

    const getHeatmapColor = (intensity: number, max: number) => {
        if (max === 0 || intensity === 0) return "transparent";
        const normalized = intensity / max;
        if (normalized < 0.3) return `hsla(199, 80%, 50%, ${normalized * 2})`;
        if (normalized < 0.6) return `hsla(142, 70%, 45%, ${0.3 + normalized * 0.4})`;
        return `hsla(38, 90%, 50%, ${0.5 + normalized * 0.3})`;
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
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowConnections(!showConnections)}
                    className="ml-auto h-7 gap-1"
                >
                    <Layers className="w-3 h-3" />
                    {showConnections ? "Hide" : "Show"} Lines
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                {[
                    { label: "Total Passes", value: stats.total, color: "text-primary" },
                    { label: "Successful", value: stats.successful, color: "text-success" },
                    { label: "Unsuccessful", value: stats.unsuccessful, color: "text-destructive" },
                    { label: "Accuracy", value: `${stats.accuracy}%`, color: "text-warning" },
                    { label: "Key Passes", value: stats.keyPasses, color: "text-chart-4" },
                    { label: "Ball Touches", value: stats.ballTouches, color: "text-muted-foreground" },
                ].map((stat) => (
                    <div key={stat.label} className="text-center p-3 rounded-lg bg-secondary/50 border border-border">
                        <p className={cn("text-lg font-bold", stat.color)}>{stat.value}</p>
                        <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{stat.label}</p>
                    </div>
                ))}
            </div>

            {/* Field with Passing Network */}
            <div className="relative w-full max-w-3xl mx-auto rounded-xl overflow-hidden border border-border shadow-xl" style={{ aspectRatio: '105/68' }}>
                {/* Football Field Background Image */}
                <img
                    src="/41290.jpg"
                    alt="Football field"
                    className="absolute inset-0 w-full h-full object-cover"
                />

                {/* Subtle overlay for better visibility of markers */}
                <div className="absolute inset-0 bg-black/10" />

                {/* Position Heatmap Overlay */}
                <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                        display: 'grid',
                        gridTemplateColumns: `repeat(${positionHeatmap.gridCols}, 1fr)`,
                        gridTemplateRows: `repeat(${positionHeatmap.gridRows}, 1fr)`,
                    }}
                >
                    {positionHeatmap.zones.map((row, rowIndex) =>
                        row.map((intensity, colIndex) => (
                            <div
                                key={`${rowIndex}-${colIndex}`}
                                style={{
                                    backgroundColor: getHeatmapColor(intensity, positionHeatmap.maxIntensity),
                                    filter: intensity > 0 ? "blur(8px)" : "none",
                                }}
                            />
                        ))
                    )}
                </div>

                {/* Pass Connection Lines */}
                {showConnections && (
                    <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ overflow: 'visible' }}>
                        <defs>
                            <marker id={`arrow-success-${uniqueId}`} markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
                                <polygon points="0 0, 8 4, 0 8" fill="hsl(142, 76%, 36%)" />
                            </marker>
                            <marker id={`arrow-fail-${uniqueId}`} markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
                                <polygon points="0 0, 8 4, 0 8" fill="hsl(0, 72%, 50%)" />
                            </marker>
                        </defs>
                        {filteredPasses.map((pass, index) => {
                            // Calculate angle from origin to target
                            const dx = pass.targetX - pass.x;
                            const dy = pass.targetY - pass.y;
                            const angle = Math.atan2(dy, dx);

                            // Circle radius in percentage (roughly 1.5% of container)
                            const circleRadiusPercent = 1.5;

                            // Offset start position by circle radius in direction of target
                            const startX = pass.x + Math.cos(angle) * circleRadiusPercent;
                            const startY = pass.y + Math.sin(angle) * circleRadiusPercent;

                            return (
                                <motion.line
                                    key={`pass-${index}`}
                                    x1={`${startX}%`}
                                    y1={`${startY}%`}
                                    x2={`${pass.targetX}%`}
                                    y2={`${pass.targetY}%`}
                                    stroke={pass.success ? "hsl(142, 76%, 36%)" : "hsl(0, 72%, 50%)"}
                                    strokeWidth={pass.success ? "2" : "1.5"}
                                    strokeOpacity={pass.success ? 0.7 : 0.5}
                                    strokeDasharray={pass.success ? "none" : "4,2"}
                                    markerEnd={`url(#${pass.success ? `arrow-success-${uniqueId}` : `arrow-fail-${uniqueId}`})`}
                                    initial={{ pathLength: 0, opacity: 0 }}
                                    animate={{ pathLength: 1, opacity: 1 }}
                                    transition={{ duration: 0.3, delay: index * 0.02 }}
                                />
                            );
                        })}
                    </svg>
                )}

                {/* Pass Origin Points */}
                {filteredPasses.map((pass, index) => (
                    <motion.div
                        key={`point-${index}`}
                        className={cn(
                            "absolute w-3 h-3 rounded-full z-10",
                            pass.success ? "bg-success" : "bg-destructive"
                        )}
                        style={{
                            left: `${pass.x}%`,
                            top: `${pass.y}%`,
                            transform: "translate(-50%, -50%)",
                        }}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: index * 0.02 }}
                    />
                ))}

                {/* Pass Destination Points (Receivers) */}
                {showConnections && filteredPasses.filter(p => p.success).map((pass, index) => (
                    <motion.div
                        key={`target-${index}`}
                        className="absolute flex flex-col items-center z-10"
                        style={{
                            left: `${pass.targetX}%`,
                            top: `${pass.targetY}%`,
                            transform: "translate(-50%, -50%)",
                        }}
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: index * 0.02 + 0.1 }}
                    >
                        <div className="w-2.5 h-2.5 rounded-full bg-primary border border-white/50" />
                        <span className="text-[8px] text-white bg-black/60 px-1 rounded mt-0.5 whitespace-nowrap">
                            {pass.passTarget || `${pass.minute}'`}
                        </span>
                    </motion.div>
                ))}
            </div>

            {/* Legend */}
            <div className="flex items-center justify-center gap-6 text-sm flex-wrap">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-success" />
                    <span className="text-muted-foreground">Pass Origin</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-primary border border-white/50" />
                    <span className="text-muted-foreground">Pass Target</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-8 h-0.5 bg-success" />
                    <span className="text-muted-foreground">Successful Pass</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-8 h-0.5 bg-destructive" style={{ backgroundImage: "repeating-linear-gradient(90deg, transparent, transparent 2px, hsl(var(--destructive)) 2px, hsl(var(--destructive)) 4px)" }} />
                    <span className="text-muted-foreground">Unsuccessful Pass</span>
                </div>
            </div>
        </div>
    );
};

export default PassingMap;
