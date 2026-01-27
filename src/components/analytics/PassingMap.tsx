import { useState, useMemo, useId } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MatchEvent } from "@/types/player";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Layers, ArrowRight } from "lucide-react";
import TacticalField from "@/components/field/TacticalField";

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
            <TacticalField viewMode="full" className="w-full max-w-3xl mx-auto rounded-xl shadow-xl overflow-visible" showGrid={false}>
                <defs>
                    <marker id={`arrow-success-${uniqueId}`} markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto" markerUnits="userSpaceOnUse">
                        <path d="M0,0 L6,3 L0,6 Z" fill="hsl(142, 76%, 36%)" />
                    </marker>
                    <marker id={`arrow-fail-${uniqueId}`} markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto" markerUnits="userSpaceOnUse">
                        <path d="M0,0 L6,3 L0,6 Z" fill="hsl(0, 72%, 50%)" />
                    </marker>
                </defs>

                {/* Heatmap Overlay (SVG Rects) */}
                <g style={{ opacity: 0.5 }}>
                    {positionHeatmap.zones.map((row, rowIndex) =>
                        row.map((intensity, colIndex) => (
                            <rect
                                key={`hm-${rowIndex}-${colIndex}`}
                                x={colIndex * 10.5}
                                y={rowIndex * 11.33}
                                width={10.5}
                                height={11.33}
                                fill={getHeatmapColor(intensity, positionHeatmap.maxIntensity)}
                                style={{ filter: intensity > 0 ? "blur(4px)" : "none" }}
                            />
                        ))
                    )}
                </g>

                {/* Pass Connection Lines */}
                {showConnections && filteredPasses.map((pass, index) => {
                    const x1 = pass.x / 100 * 105;
                    const y1 = pass.y / 100 * 68;
                    const x2 = pass.targetX / 100 * 105;
                    const y2 = pass.targetY / 100 * 68;
                    const dist = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));

                    if (dist < 1) return null;

                    return (
                        <motion.line
                            key={`pass-${index}`}
                            x1={x1} y1={y1} x2={x2} y2={y2}
                            stroke={pass.success ? "hsl(142, 76%, 36%)" : "hsl(0, 72%, 50%)"}
                            strokeWidth={pass.success ? 0.3 : 0.25}
                            strokeOpacity={pass.success ? 0.85 : 0.7}
                            strokeDasharray={pass.success ? "none" : "1,0.5"}
                            markerEnd={`url(#${pass.success ? `arrow-success-${uniqueId}` : `arrow-fail-${uniqueId}`})`}
                            initial={{ pathLength: 0, opacity: 0 }}
                            animate={{ pathLength: 1, opacity: 1 }}
                            transition={{ duration: 0.3, delay: index * 0.02 }}
                        />
                    );
                })}

                {/* Pass Origin Points */}
                {filteredPasses.map((pass, index) => (
                    <motion.circle
                        key={`point-${index}`}
                        cx={pass.x / 100 * 105}
                        cy={pass.y / 100 * 68}
                        r={0.6}
                        fill={pass.success ? "hsl(var(--success))" : "hsl(var(--destructive))"}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: index * 0.02 }}
                    />
                ))}

                {/* Pass Destination Points (Receivers) */}
                {showConnections && filteredPasses.filter(p => p.success).map((pass, index) => (
                    <foreignObject
                        key={`target-${index}`}
                        x={(pass.targetX / 100 * 105) - 3}
                        y={(pass.targetY / 100 * 68) - 3}
                        width={6}
                        height={6}
                        className="overflow-visible"
                    >
                        <div className="flex flex-col items-center">
                            <div className="w-1.5 h-1.5 rounded-full bg-primary border border-white/50" />
                            <span
                                className="text-white bg-black/60 px-0.5 rounded mt-0.5 whitespace-nowrap"
                                style={{ fontSize: '1.5px', lineHeight: '1.2' }}
                            >
                                {pass.passTarget || `${pass.minute}'`}
                            </span>
                        </div>
                    </foreignObject>
                ))}
            </TacticalField>

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
