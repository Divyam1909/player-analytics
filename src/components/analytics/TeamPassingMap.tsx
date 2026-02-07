import { useState, useMemo, useId } from "react";
import { useNavigate } from "react-router-dom";
import { MatchEvent, Player } from "@/types/player";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Layers, Users, ExternalLink } from "lucide-react";
import TacticalField from "@/components/field/TacticalField";
import { StatHint } from "@/components/ui/stat-hint";

interface PlayerPassData {
    player: Player;
    events: MatchEvent[];
}

interface TeamPassingMapProps {
    playerPasses: PlayerPassData[];
    matchId?: string;
}

interface TimeInterval {
    label: string;
    start: number;
    end: number;
    category?: 'all' | '10min' | 'half' | 'overtime';
}

// 10-minute interval options
const TEN_MIN_INTERVALS: TimeInterval[] = [
    { label: "0-10'", start: 0, end: 10, category: '10min' },
    { label: "10-20'", start: 10, end: 20, category: '10min' },
    { label: "20-30'", start: 20, end: 30, category: '10min' },
    { label: "30-40'", start: 30, end: 40, category: '10min' },
    { label: "40-50'", start: 40, end: 50, category: '10min' },
    { label: "50-60'", start: 50, end: 60, category: '10min' },
    { label: "60-70'", start: 60, end: 70, category: '10min' },
    { label: "70-80'", start: 70, end: 80, category: '10min' },
    { label: "80-90'", start: 80, end: 90, category: '10min' },
];

// Half/Period options
const HALF_INTERVALS: TimeInterval[] = [
    { label: "1st Half", start: 0, end: 45, category: 'half' },
    { label: "2nd Half", start: 45, end: 90, category: 'half' },
    { label: "Extra Time", start: 90, end: 120, category: 'overtime' },
];

const ALL_INTERVAL: TimeInterval = { label: "Full Match", start: 0, end: 120, category: 'all' };

// Calculate distance in meters (field is 105m x 68m)
const calculateDistance = (x1: number, y1: number, x2: number, y2: number): number => {
    const dx = (x2 - x1) / 100 * 105;
    const dy = (y2 - y1) / 100 * 68;
    return Math.sqrt(dx * dx + dy * dy);
};

// Get pass type based on distance (same as individual PassingMap)
const getPassType = (distance: number): { type: string; color: string } => {
    if (distance < 10) return { type: "Short", color: "hsl(199, 89%, 48%)" };  // Cyan
    if (distance < 25) return { type: "Medium", color: "hsl(142, 76%, 36%)" }; // Green
    return { type: "Long", color: "hsl(38, 92%, 50%)" };                        // Orange
};

const TeamPassingMap = ({ playerPasses, matchId }: TeamPassingMapProps) => {
    const uniqueId = useId();
    const navigate = useNavigate();
    const [selectedInterval, setSelectedInterval] = useState<TimeInterval>(ALL_INTERVAL);
    const [intervalMode, setIntervalMode] = useState<'10min' | 'half'>('10min');
    const [showConnections, setShowConnections] = useState(true);
    const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);

    // Navigate to individual player's passing map
    const handlePlayerClick = (playerId: string) => {
        navigate(`/player/${playerId}#passing`);
    };

    // Filter passes from all players
    const allPassEvents = useMemo(() => {
        return playerPasses.flatMap(pp =>
            pp.events.filter(e => e.type === "pass").map(e => ({
                ...e,
                playerId: pp.player.id,
                playerName: pp.player.name,
            }))
        );
    }, [playerPasses]);

    // Check if there's overtime data
    const hasOvertime = useMemo(() => {
        return allPassEvents.some(e => e.minute > 90);
    }, [allPassEvents]);

    // Get available intervals based on mode
    const availableIntervals = useMemo(() => {
        if (intervalMode === 'half') {
            return hasOvertime ? HALF_INTERVALS : HALF_INTERVALS.filter(i => i.category !== 'overtime');
        }
        return TEN_MIN_INTERVALS;
    }, [intervalMode, hasOvertime]);

    // Filter by time interval and selected player
    const filteredPasses = useMemo(() => {
        let passes = allPassEvents.filter(
            e => e.minute >= selectedInterval.start && e.minute < selectedInterval.end
        );
        if (selectedPlayerId) {
            passes = passes.filter(e => e.playerId === selectedPlayerId);
        }
        return passes;
    }, [allPassEvents, selectedInterval, selectedPlayerId]);

    // Sample passes when there are too many
    const MAX_VISIBLE_PASSES = 120;
    const displayPasses = useMemo(() => {
        if (filteredPasses.length <= MAX_VISIBLE_PASSES) return filteredPasses;
        const step = filteredPasses.length / MAX_VISIBLE_PASSES;
        return filteredPasses.filter((_, index) => Math.floor(index % step) === 0).slice(0, MAX_VISIBLE_PASSES);
    }, [filteredPasses]);

    // Calculate passing stats
    const stats = useMemo(() => {
        const total = filteredPasses.length;
        const successful = filteredPasses.filter(p => p.success).length;
        const accuracy = total > 0 ? Math.round((successful / total) * 100) : 0;
        const keyPasses = filteredPasses.filter(p => p.success && p.targetX > 75).length;

        const distances = filteredPasses.map(p => calculateDistance(p.x, p.y, p.targetX, p.targetY));
        const avgDistance = distances.length > 0 ? Math.round(distances.reduce((a, b) => a + b, 0) / distances.length) : 0;

        // Pass type breakdown
        const shortPasses = filteredPasses.filter(p => calculateDistance(p.x, p.y, p.targetX, p.targetY) < 10).length;
        const mediumPasses = filteredPasses.filter(p => {
            const d = calculateDistance(p.x, p.y, p.targetX, p.targetY);
            return d >= 10 && d < 25;
        }).length;
        const longPasses = filteredPasses.filter(p => calculateDistance(p.x, p.y, p.targetX, p.targetY) >= 25).length;

        return { total, successful, accuracy, keyPasses, avgDistance, shortPasses, mediumPasses, longPasses };
    }, [filteredPasses]);

    // Get players who have passes in current filter (only show these)
    const playersWithPasses = useMemo(() => {
        const playerIds = new Set(filteredPasses.map(p => p.playerId));
        return playerPasses.filter(pp => playerIds.has(pp.player.id));
    }, [filteredPasses, playerPasses]);

    // Calculate heatmap zones
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
        if (normalized < 0.3) return `hsla(199, 80%, 50%, ${normalized * 0.8})`;
        if (normalized < 0.6) return `hsla(142, 70%, 45%, ${0.15 + normalized * 0.25})`;
        return `hsla(38, 90%, 50%, ${0.2 + normalized * 0.25})`;
    };

    return (
        <div className="space-y-4">
            {/* Time Interval Selector */}
            <div className="flex flex-col gap-2">
                <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-medium text-muted-foreground">Time:</span>

                    <Button
                        variant={selectedInterval.category === 'all' ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedInterval(ALL_INTERVAL)}
                        className="h-7 px-3 text-xs"
                    >
                        Full Match
                    </Button>

                    <div className="flex items-center border border-border rounded-md overflow-hidden">
                        <Button
                            variant={intervalMode === '10min' ? "secondary" : "ghost"}
                            size="sm"
                            onClick={() => {
                                setIntervalMode('10min');
                                setSelectedInterval(ALL_INTERVAL);
                            }}
                            className="h-7 px-2 text-xs rounded-none border-0"
                        >
                            10 Min
                        </Button>
                        <div className="w-px h-5 bg-border" />
                        <Button
                            variant={intervalMode === 'half' ? "secondary" : "ghost"}
                            size="sm"
                            onClick={() => {
                                setIntervalMode('half');
                                setSelectedInterval(ALL_INTERVAL);
                            }}
                            className="h-7 px-2 text-xs rounded-none border-0"
                        >
                            Halves
                        </Button>
                    </div>

                    <div className="flex items-center gap-1 ml-auto">
                        <Button
                            variant={showConnections ? "secondary" : "ghost"}
                            size="sm"
                            onClick={() => setShowConnections(!showConnections)}
                            className="h-7 gap-1 text-xs"
                        >
                            <Layers className="w-3 h-3" />
                            Lines
                        </Button>
                    </div>
                </div>

                {/* Time Interval Buttons */}
                <div className="flex flex-wrap gap-1">
                    {availableIntervals.map((interval) => (
                        <Button
                            key={interval.label}
                            variant={selectedInterval.label === interval.label ? "default" : "outline"}
                            size="sm"
                            onClick={() => setSelectedInterval(interval)}
                            className={cn(
                                "h-7 px-2 text-xs",
                                interval.category === 'overtime' && "border-warning/50 text-warning hover:bg-warning/10"
                            )}
                        >
                            {interval.label}
                        </Button>
                    ))}
                </div>
            </div>

            {/* Player Filter - Only show players with passes */}
            {playersWithPasses.length > 0 && (
                <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        Filter:
                    </span>
                    <Button
                        variant={selectedPlayerId === null ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedPlayerId(null)}
                        className="h-7 px-3 text-xs"
                    >
                        All ({playersWithPasses.length})
                    </Button>
                    {playersWithPasses.slice(0, 10).map(pp => {
                        const playerPassCount = filteredPasses.filter(p => p.playerId === pp.player.id).length;
                        return (
                            <Tooltip key={pp.player.id}>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant={selectedPlayerId === pp.player.id ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => setSelectedPlayerId(selectedPlayerId === pp.player.id ? null : pp.player.id)}
                                        className="h-7 px-2 text-xs gap-1"
                                    >
                                        <span className="font-medium">{pp.player.name.split(' ').slice(-1)[0]}</span>
                                        <Badge variant="secondary" className="h-4 px-1 text-[10px]">{playerPassCount}</Badge>
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent side="top">
                                    <p className="font-medium">{pp.player.name}</p>
                                    <p className="text-xs text-muted-foreground">#{pp.player.jerseyNumber} • {pp.player.position}</p>
                                    <p className="text-xs text-primary mt-1">Click to view individual passing map →</p>
                                </TooltipContent>
                            </Tooltip>
                        );
                    })}
                    {playersWithPasses.length > 10 && (
                        <span className="text-xs text-muted-foreground">+{playersWithPasses.length - 10} more</span>
                    )}
                </div>
            )}

            {/* Stats Cards */}
            <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
                {[
                    { label: "Total", value: stats.total, color: "text-primary", statId: "total_passes" },
                    { label: "Successful", value: stats.successful, color: "text-success", statId: "total_passes" },
                    { label: "Accuracy", value: `${stats.accuracy}%`, color: "text-warning", statId: "pass_accuracy" },
                    { label: "Avg Distance", value: `${stats.avgDistance}m`, color: "text-chart-4", statId: "long_passes" },
                    { label: "Key Passes", value: stats.keyPasses, color: "text-destructive", statId: "key_passes" },
                ].map((stat) => (
                    <div key={stat.label} className="text-center p-2.5 rounded-lg bg-secondary/50 border border-border">
                        <p className={cn("text-lg font-bold", stat.color)}>{stat.value}</p>
                        <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                            <StatHint statId={stat.statId} iconSize="sm">
                                <span>{stat.label}</span>
                            </StatHint>
                        </p>
                    </div>
                ))}
            </div>

            {/* Pass Type Breakdown */}
            <div className="flex justify-center gap-4 text-xs">
                <div className="flex items-center gap-1.5">
                    <div className="w-3 h-0.5 rounded" style={{ backgroundColor: "hsl(199, 89%, 48%)" }} />
                    <span className="text-muted-foreground">Short (&lt;10m): <strong className="text-foreground">{stats.shortPasses}</strong></span>
                </div>
                <div className="flex items-center gap-1.5">
                    <div className="w-3 h-0.5 rounded" style={{ backgroundColor: "hsl(142, 76%, 36%)" }} />
                    <span className="text-muted-foreground">Medium (10-25m): <strong className="text-foreground">{stats.mediumPasses}</strong></span>
                </div>
                <div className="flex items-center gap-1.5">
                    <div className="w-3 h-0.5 rounded" style={{ backgroundColor: "hsl(38, 92%, 50%)" }} />
                    <span className="text-muted-foreground">Long (&gt;25m): <strong className="text-foreground">{stats.longPasses}</strong></span>
                </div>
            </div>

            {/* Field with Team Passing Network */}
            <TacticalField viewMode="full" className="w-full max-w-3xl mx-auto rounded-xl shadow-xl overflow-visible" showGrid={false}>
                <defs>
                    {/* Arrow markers for pass types */}
                    <marker id={`arrow-short-${uniqueId}`} markerWidth="4" markerHeight="4" refX="3" refY="2" orient="auto" markerUnits="userSpaceOnUse">
                        <path d="M0,0.5 L3.5,2 L0,3.5 L1,2 Z" fill="hsl(199, 89%, 48%)" />
                    </marker>
                    <marker id={`arrow-medium-${uniqueId}`} markerWidth="4" markerHeight="4" refX="3" refY="2" orient="auto" markerUnits="userSpaceOnUse">
                        <path d="M0,0.5 L3.5,2 L0,3.5 L1,2 Z" fill="hsl(142, 76%, 36%)" />
                    </marker>
                    <marker id={`arrow-long-${uniqueId}`} markerWidth="4" markerHeight="4" refX="3" refY="2" orient="auto" markerUnits="userSpaceOnUse">
                        <path d="M0,0.5 L3.5,2 L0,3.5 L1,2 Z" fill="hsl(38, 92%, 50%)" />
                    </marker>
                    <marker id={`arrow-fail-${uniqueId}`} markerWidth="4" markerHeight="4" refX="3" refY="2" orient="auto" markerUnits="userSpaceOnUse">
                        <path d="M0,0.5 L3.5,2 L0,3.5 L1,2 Z" fill="hsl(0, 72%, 50%)" />
                    </marker>
                </defs>

                {/* Heatmap Overlay */}
                <g style={{ opacity: 0.35 }}>
                    {positionHeatmap.zones.map((row, rowIndex) =>
                        row.map((intensity, colIndex) => (
                            <rect
                                key={`hm-${rowIndex}-${colIndex}`}
                                x={(colIndex / positionHeatmap.gridCols) * 105}
                                y={(rowIndex / positionHeatmap.gridRows) * 68}
                                width={105 / positionHeatmap.gridCols}
                                height={68 / positionHeatmap.gridRows}
                                fill={getHeatmapColor(intensity, positionHeatmap.maxIntensity)}
                                rx={0.5}
                            />
                        ))
                    )}
                </g>

                {/* Pass Connection Lines */}
                {showConnections && displayPasses.map((pass, index) => {
                    const x1 = pass.x / 100 * 105;
                    const y1 = pass.y / 100 * 68;
                    const x2 = pass.targetX / 100 * 105;
                    const y2 = pass.targetY / 100 * 68;
                    const dist = calculateDistance(pass.x, pass.y, pass.targetX, pass.targetY);
                    const passType = getPassType(dist);

                    if (dist < 1) return null;

                    // Shorten line for arrow
                    const angle = Math.atan2(y2 - y1, x2 - x1);
                    const endOffset = 1.5;
                    const adjustedX2 = x2 - Math.cos(angle) * endOffset;
                    const adjustedY2 = y2 - Math.sin(angle) * endOffset;

                    const isHighlighted = selectedPlayerId === pass.playerId;
                    const lineOpacity = selectedPlayerId ? (isHighlighted ? 0.85 : 0.1) : 0.6;

                    const arrowId = pass.success
                        ? `arrow-${passType.type.toLowerCase()}-${uniqueId}`
                        : `arrow-fail-${uniqueId}`;

                    return (
                        <g key={`pass-line-${index}`}>
                            <line
                                x1={x1} y1={y1} x2={adjustedX2} y2={adjustedY2}
                                stroke={pass.success ? passType.color : "hsl(0, 72%, 50%)"}
                                strokeWidth={isHighlighted ? 0.5 : 0.3}
                                strokeOpacity={lineOpacity}
                                strokeDasharray={pass.success ? "none" : "1.5,0.8"}
                                markerEnd={`url(#${arrowId})`}
                            />
                            {/* Origin dot */}
                            <circle
                                cx={x1}
                                cy={y1}
                                r={isHighlighted ? 0.8 : 0.5}
                                fill={pass.success ? passType.color : "hsl(0, 72%, 50%)"}
                                fillOpacity={lineOpacity}
                            />
                        </g>
                    );
                })}
            </TacticalField>

            {/* Player Legend with click to navigate */}
            <div className="bg-secondary/30 rounded-lg p-4">
                <p className="text-xs text-center text-muted-foreground mb-3">
                    Click a player below to view their detailed passing analysis
                </p>
                <div className="flex items-center justify-center gap-2 flex-wrap">
                    {playersWithPasses.slice(0, 8).map(pp => {
                        const playerPassCount = filteredPasses.filter(p => p.playerId === pp.player.id).length;
                        return (
                            <Tooltip key={pp.player.id}>
                                <TooltipTrigger asChild>
                                    <button
                                        onClick={() => handlePlayerClick(pp.player.id)}
                                        className={cn(
                                            "flex items-center gap-2 px-3 py-1.5 rounded-md text-xs transition-all",
                                            "bg-background/80 border border-border hover:border-primary hover:bg-primary/10",
                                            "group cursor-pointer"
                                        )}
                                    >
                                        <span className="font-medium text-foreground group-hover:text-primary transition-colors">
                                            {pp.player.name.split(' ').slice(-1)[0]}
                                        </span>
                                        <Badge variant="outline" className="h-4 px-1.5 text-[10px]">{playerPassCount}</Badge>
                                        <ExternalLink className="w-3 h-3 text-muted-foreground group-hover:text-primary transition-colors" />
                                    </button>
                                </TooltipTrigger>
                                <TooltipContent side="top">
                                    <p className="font-medium">{pp.player.name}</p>
                                    <p className="text-xs text-muted-foreground">#{pp.player.jerseyNumber} • {pp.player.position}</p>
                                </TooltipContent>
                            </Tooltip>
                        );
                    })}
                    {playersWithPasses.length > 8 && (
                        <span className="text-xs text-muted-foreground">+{playersWithPasses.length - 8} more</span>
                    )}
                </div>
            </div>

            {/* Legend for pass types */}
            <div className="flex items-center justify-center gap-4 text-xs flex-wrap">
                <div className="flex items-center gap-1.5">
                    <div className="w-6 h-0.5 rounded" style={{ backgroundColor: "hsl(199, 89%, 48%)" }} />
                    <span className="text-muted-foreground">Short</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <div className="w-6 h-0.5 rounded" style={{ backgroundColor: "hsl(142, 76%, 36%)" }} />
                    <span className="text-muted-foreground">Medium</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <div className="w-6 h-0.5 rounded" style={{ backgroundColor: "hsl(38, 92%, 50%)" }} />
                    <span className="text-muted-foreground">Long</span>
                </div>
                <div className="flex items-center gap-1.5 ml-2 pl-2 border-l border-border">
                    <div className="w-6 h-0.5" style={{ backgroundImage: "repeating-linear-gradient(90deg, hsl(0, 72%, 50%) 0px, hsl(0, 72%, 50%) 3px, transparent 3px, transparent 5px)" }} />
                    <span className="text-muted-foreground">Failed</span>
                </div>
                {filteredPasses.length > MAX_VISIBLE_PASSES && (
                    <span className="text-muted-foreground/60 italic ml-2">Showing {MAX_VISIBLE_PASSES} of {filteredPasses.length} passes</span>
                )}
            </div>
        </div>
    );
};

export default TeamPassingMap;
