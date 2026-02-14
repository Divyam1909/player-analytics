import { useState, useMemo, useId } from "react";
import { useNavigate } from "react-router-dom";
import { MatchEvent } from "@/types/player";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Layers, ArrowRight, Eye, EyeOff, Video } from "lucide-react";
import TacticalField from "@/components/field/TacticalField";
import { StatHint } from "@/components/ui/stat-hint";

interface PassingMapProps {
    events: MatchEvent[];
    playerName?: string;
    matchId?: string; // For video link navigation
}

interface TimeInterval {
    label: string;
    start: number;
    end: number;
    category?: 'all' | '10min' | 'half' | 'overtime';
}

interface HoveredPass {
    pass: MatchEvent;
    index: number;
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
    const dx = (x2 - x1) / 100 * 105; // Convert to meters
    const dy = (y2 - y1) / 100 * 68;
    return Math.sqrt(dx * dx + dy * dy);
};

// Get pass type based on distance
const getPassType = (distance: number): { type: string; color: string } => {
    if (distance < 10) return { type: "Short", color: "hsl(199, 89%, 48%)" };
    if (distance < 25) return { type: "Medium", color: "hsl(142, 76%, 36%)" };
    return { type: "Long", color: "hsl(38, 92%, 50%)" };
};

const PassingMap = ({ events, playerName, matchId }: PassingMapProps) => {
    const uniqueId = useId();
    const navigate = useNavigate();
    const [selectedInterval, setSelectedInterval] = useState<TimeInterval>(ALL_INTERVAL);
    const [intervalMode, setIntervalMode] = useState<'10min' | 'half'>('10min');
    const [showConnections, setShowConnections] = useState(true);
    const [showLabels, setShowLabels] = useState(true);
    const [selectedPass, setSelectedPass] = useState<HoveredPass | null>(null);

    // Handle navigation to match video
    // Uses state to preserve the #passing hash for back navigation
    const handleGoToVideo = () => {
        if (matchId) {
            navigate(`/match/${matchId}#match-video`, { state: { from: 'passing' } });
        }
    };

    // Filter passes only
    const passEvents = useMemo(() => {
        return events.filter(e => e.type === "pass");
    }, [events]);

    // Check if there's overtime data
    const hasOvertime = useMemo(() => {
        return events.some(e => e.minute > 90);
    }, [events]);

    // Get available intervals based on mode
    const availableIntervals = useMemo(() => {
        if (intervalMode === 'half') {
            return hasOvertime ? HALF_INTERVALS : HALF_INTERVALS.filter(i => i.category !== 'overtime');
        }
        return TEN_MIN_INTERVALS;
    }, [intervalMode, hasOvertime]);

    // Filter by time interval
    const filteredPasses = useMemo(() => {
        return passEvents.filter(
            e => e.minute >= selectedInterval.start && e.minute < selectedInterval.end
        );
    }, [passEvents, selectedInterval]);

    // Calculate passing stats with distance breakdown
    const stats = useMemo(() => {
        const total = filteredPasses.length;
        const successful = filteredPasses.filter(p => p.success).length;
        const unsuccessful = total - successful;
        const accuracy = total > 0 ? Math.round((successful / total) * 100) : 0;
        const keyPasses = filteredPasses.filter(p => p.success && p.targetX > 75).length;

        // Calculate average pass distance
        const distances = filteredPasses.map(p => calculateDistance(p.x, p.y, p.targetX, p.targetY));
        const avgDistance = distances.length > 0 ? Math.round(distances.reduce((a, b) => a + b, 0) / distances.length) : 0;

        // Pass type breakdown
        const shortPasses = filteredPasses.filter(p => calculateDistance(p.x, p.y, p.targetX, p.targetY) < 10).length;
        const mediumPasses = filteredPasses.filter(p => {
            const d = calculateDistance(p.x, p.y, p.targetX, p.targetY);
            return d >= 10 && d < 25;
        }).length;
        const longPasses = filteredPasses.filter(p => calculateDistance(p.x, p.y, p.targetX, p.targetY) >= 25).length;

        // Get ball touches (all events in interval)
        const ballTouches = events.filter(
            e => e.minute >= selectedInterval.start && e.minute < selectedInterval.end
        ).length;

        return { total, successful, unsuccessful, accuracy, keyPasses, ballTouches, avgDistance, shortPasses, mediumPasses, longPasses };
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
        if (normalized < 0.3) return `hsla(199, 80%, 50%, ${normalized * 1.5})`;
        if (normalized < 0.6) return `hsla(142, 70%, 45%, ${0.2 + normalized * 0.3})`;
        return `hsla(38, 90%, 50%, ${0.3 + normalized * 0.3})`;
    };

    // Get the active pass (selected only - no hover to prevent glitching)
    const activePass = selectedPass;

    return (
        <div className="space-y-4">
            {/* Time Interval Selector */}
            <div className="flex flex-col gap-2">
                <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-medium text-muted-foreground">Time:</span>

                    {/* Full Match Button */}
                    <Button
                        variant={selectedInterval.category === 'all' ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedInterval(ALL_INTERVAL)}
                        className="h-7 px-3 text-xs"
                    >
                        Full Match
                    </Button>

                    {/* Interval Mode Toggle */}
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
                            variant={showLabels ? "secondary" : "ghost"}
                            size="sm"
                            onClick={() => setShowLabels(!showLabels)}
                            className="h-7 gap-1 text-xs"
                        >
                            {showLabels ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                            Labels
                        </Button>
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

            {/* Stats Cards - Updated with distance info */}
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
            <div className="flex items-center justify-center gap-4 text-xs">
                <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: "hsl(199, 89%, 48%)" }} />
                    <span className="text-muted-foreground">Short (&lt;10m): <span className="font-semibold text-foreground">{stats.shortPasses}</span></span>
                </div>
                <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: "hsl(142, 76%, 36%)" }} />
                    <span className="text-muted-foreground">Medium (10-25m): <span className="font-semibold text-foreground">{stats.mediumPasses}</span></span>
                </div>
                <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: "hsl(38, 92%, 50%)" }} />
                    <span className="text-muted-foreground">Long (&gt;25m): <span className="font-semibold text-foreground">{stats.longPasses}</span></span>
                </div>
            </div>

            {/* Selected Pass Info Panel - Fixed height container to prevent layout shift */}
            <div className="min-h-[70px] flex items-center">
                {activePass ? (
                    <div className="w-full bg-card border border-border rounded-lg p-3 shadow-lg">
                        <div className="flex items-center justify-between gap-4 flex-wrap">
                            <div className="flex items-center gap-3">
                                {/* Passer */}
                                <div className="flex items-center gap-2">
                                    <div className={cn(
                                        "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2",
                                        activePass.pass.success
                                            ? "bg-success/20 border-success text-success"
                                            : "bg-destructive/20 border-destructive text-destructive"
                                    )}>
                                        {playerName?.split(' ').map(n => n[0]).join('') || 'P'}
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground">Passer</p>
                                        <p className="text-sm font-semibold">{playerName || 'Player'}</p>
                                    </div>
                                </div>

                                {/* Arrow with distance */}
                                <div className="flex flex-col items-center px-4">
                                    <div className="flex items-center gap-1">
                                        <div className={cn(
                                            "h-0.5 w-12",
                                            activePass.pass.success ? "bg-success" : "bg-destructive"
                                        )} />
                                        <ArrowRight className={cn(
                                            "w-4 h-4",
                                            activePass.pass.success ? "text-success" : "text-destructive"
                                        )} />
                                    </div>
                                    <span className="text-xs font-bold mt-0.5" style={{
                                        color: getPassType(calculateDistance(
                                            activePass.pass.x, activePass.pass.y,
                                            activePass.pass.targetX, activePass.pass.targetY
                                        )).color
                                    }}>
                                        {Math.round(calculateDistance(
                                            activePass.pass.x, activePass.pass.y,
                                            activePass.pass.targetX, activePass.pass.targetY
                                        ))}m
                                    </span>
                                </div>

                                {/* Receiver */}
                                <div className="flex items-center gap-2">
                                    <div className={cn(
                                        "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2",
                                        activePass.pass.success
                                            ? "bg-primary/20 border-primary text-primary"
                                            : "bg-muted border-muted-foreground text-muted-foreground"
                                    )}>
                                        {activePass.pass.passTargetName?.split(' ').map(n => n[0]).join('') || 'R'}
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground">Receiver</p>
                                        <p className="text-sm font-semibold">{activePass.pass.passTargetName || 'Unknown'}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Go to Video Button */}
                            {matchId && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleGoToVideo}
                                    className="flex items-center gap-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
                                >
                                    <Video className="w-4 h-4" />
                                    <span className="hidden sm:inline">Go to Video</span>
                                </Button>
                            )}

                            {/* Pass Details */}
                            <div className="flex items-center gap-4 text-sm">
                                <div className="text-center">
                                    <p className="text-muted-foreground text-xs">Minute</p>
                                    <p className="font-bold">{activePass.pass.minute}'</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-muted-foreground text-xs">Type</p>
                                    <p className="font-bold" style={{
                                        color: getPassType(calculateDistance(
                                            activePass.pass.x, activePass.pass.y,
                                            activePass.pass.targetX, activePass.pass.targetY
                                        )).color
                                    }}>
                                        {getPassType(calculateDistance(
                                            activePass.pass.x, activePass.pass.y,
                                            activePass.pass.targetX, activePass.pass.targetY
                                        )).type}
                                    </p>
                                </div>
                                <div className="text-center">
                                    <p className="text-muted-foreground text-xs">Result</p>
                                    <Badge variant={activePass.pass.success ? "default" : "destructive"} className="text-xs">
                                        {activePass.pass.success ? "Completed" : "Failed"}
                                    </Badge>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="w-full text-center text-sm text-muted-foreground py-4">
                        Click on a pass to see details
                    </div>
                )}
            </div>

            {/* Field with Passing Network */}
            <TacticalField viewMode="full" className="w-full max-w-3xl mx-auto rounded-xl shadow-xl overflow-visible" showGrid={false}>
                <defs>
                    {/* Smaller arrow markers */}
                    <marker id={`arrow-success-${uniqueId}`} markerWidth="4" markerHeight="4" refX="3" refY="2" orient="auto" markerUnits="userSpaceOnUse">
                        <path d="M0,0.5 L3.5,2 L0,3.5 L1,2 Z" fill="hsl(142, 76%, 36%)" />
                    </marker>
                    <marker id={`arrow-fail-${uniqueId}`} markerWidth="4" markerHeight="4" refX="3" refY="2" orient="auto" markerUnits="userSpaceOnUse">
                        <path d="M0,0.5 L3.5,2 L0,3.5 L1,2 Z" fill="hsl(0, 72%, 50%)" />
                    </marker>
                    <marker id={`arrow-highlight-${uniqueId}`} markerWidth="5" markerHeight="5" refX="4" refY="2.5" orient="auto" markerUnits="userSpaceOnUse">
                        <path d="M0,0.5 L4.5,2.5 L0,4.5 L1.2,2.5 Z" fill="hsl(217, 91%, 60%)" />
                    </marker>

                    {/* Glow filters for highlighted elements */}
                    <filter id={`glow-success-${uniqueId}`} x="-50%" y="-50%" width="200%" height="200%">
                        <feGaussianBlur stdDeviation="1" result="blur" />
                        <feFlood floodColor="hsl(142, 76%, 36%)" floodOpacity="0.6" />
                        <feComposite in2="blur" operator="in" />
                        <feMerge>
                            <feMergeNode />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                    <filter id={`glow-fail-${uniqueId}`} x="-50%" y="-50%" width="200%" height="200%">
                        <feGaussianBlur stdDeviation="1" result="blur" />
                        <feFlood floodColor="hsl(0, 72%, 50%)" floodOpacity="0.6" />
                        <feComposite in2="blur" operator="in" />
                        <feMerge>
                            <feMergeNode />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                    <filter id={`glow-highlight-${uniqueId}`} x="-50%" y="-50%" width="200%" height="200%">
                        <feGaussianBlur stdDeviation="2" result="blur" />
                        <feFlood floodColor="hsl(217, 91%, 60%)" floodOpacity="0.8" />
                        <feComposite in2="blur" operator="in" />
                        <feMerge>
                            <feMergeNode />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>

                    {/* Drop shadow for labels */}
                    <filter id={`shadow-${uniqueId}`} x="-20%" y="-20%" width="140%" height="140%">
                        <feDropShadow dx="0" dy="0.3" stdDeviation="0.3" floodColor="black" floodOpacity="0.8" />
                    </filter>
                </defs>

                {/* Heatmap Overlay (SVG Rects) */}
                <g style={{ opacity: 0.4 }}>
                    {positionHeatmap.zones.map((row, rowIndex) =>
                        row.map((intensity, colIndex) => (
                            <rect
                                key={`hm-${rowIndex}-${colIndex}`}
                                x={colIndex * 10.5}
                                y={rowIndex * 11.33}
                                width={10.5}
                                height={11.33}
                                fill={getHeatmapColor(intensity, positionHeatmap.maxIntensity)}
                                style={{ filter: intensity > 0 ? "blur(3px)" : "none" }}
                            />
                        ))
                    )}
                </g>

                {/* Pass Connection Lines - Improved with better styling */}
                {showConnections && filteredPasses.map((pass, index) => {
                    const x1 = pass.x / 100 * 105;
                    const y1 = pass.y / 100 * 68;
                    const x2 = pass.targetX / 100 * 105;
                    const y2 = pass.targetY / 100 * 68;
                    const dist = calculateDistance(pass.x, pass.y, pass.targetX, pass.targetY);
                    const passType = getPassType(dist);
                    const isActive = activePass?.index === index;
                    const isHighlighted = isActive;

                    if (dist < 1) return null;

                    // Calculate shortened line to not overlap with circles
                    const angle = Math.atan2(y2 - y1, x2 - x1);
                    const startOffset = 2; // Offset from origin circle
                    const endOffset = 2.5; // Offset from target circle
                    const adjustedX1 = x1 + Math.cos(angle) * startOffset;
                    const adjustedY1 = y1 + Math.sin(angle) * startOffset;
                    const adjustedX2 = x2 - Math.cos(angle) * endOffset;
                    const adjustedY2 = y2 - Math.sin(angle) * endOffset;

                    return (
                        <g key={`pass-line-${index}`}>
                            {/* Line shadow for depth */}
                            <line
                                x1={adjustedX1} y1={adjustedY1} x2={adjustedX2} y2={adjustedY2}
                                stroke="black"
                                strokeWidth={isHighlighted ? 0.8 : 0.4}
                                strokeOpacity={0.2}
                                strokeDasharray={pass.success ? "none" : "2,1"}
                            />
                            {/* Main line */}
                            <line
                                x1={adjustedX1} y1={adjustedY1} x2={adjustedX2} y2={adjustedY2}
                                stroke={isHighlighted ? "hsl(217, 91%, 60%)" : (pass.success ? "hsl(142, 76%, 36%)" : "hsl(0, 72%, 50%)")}
                                strokeWidth={isHighlighted ? 0.6 : (pass.success ? 0.35 : 0.3)}
                                strokeOpacity={isHighlighted ? 1 : (activePass ? 0.25 : (pass.success ? 0.85 : 0.7))}
                                strokeDasharray={pass.success ? "none" : "2,1"}
                                markerEnd={`url(#${isHighlighted ? `arrow-highlight-${uniqueId}` : (pass.success ? `arrow-success-${uniqueId}` : `arrow-fail-${uniqueId}`)})`}
                                filter={isHighlighted ? `url(#glow-highlight-${uniqueId})` : undefined}
                            />
                        </g>
                    );
                })}

                {/* Pass Origin Points - Improved circles with player indicator */}
                {filteredPasses.map((pass, index) => {
                    const x = pass.x / 100 * 105;
                    const y = pass.y / 100 * 68;
                    const isActive = activePass?.index === index;
                    const dist = calculateDistance(pass.x, pass.y, pass.targetX, pass.targetY);
                    const passType = getPassType(dist);

                    return (
                        <g key={`origin-${index}`}>
                            {/* Highlight ring for active pass */}
                            {isActive && (
                                <circle
                                    cx={x}
                                    cy={y}
                                    r={2.2}
                                    fill="none"
                                    stroke="hsl(217, 91%, 60%)"
                                    strokeWidth={0.4}
                                    strokeOpacity={0.8}
                                />
                            )}
                            {/* Outer ring showing pass type */}
                            <circle
                                cx={x}
                                cy={y}
                                r={1.5}
                                fill="none"
                                stroke={isActive ? "hsl(217, 91%, 60%)" : passType.color}
                                strokeWidth={0.25}
                                strokeOpacity={isActive ? 1 : (activePass ? 0.15 : 0.7)}
                            />
                            {/* Inner filled circle - click to select */}
                            <circle
                                cx={x}
                                cy={y}
                                r={1}
                                fill={pass.success ? "hsl(142, 76%, 36%)" : "hsl(0, 72%, 50%)"}
                                stroke="white"
                                strokeWidth={0.2}
                                fillOpacity={isActive ? 1 : (activePass ? 0.25 : 1)}
                                filter={isActive ? `url(#glow-${pass.success ? 'success' : 'fail'}-${uniqueId})` : undefined}
                                style={{ cursor: 'pointer' }}
                                onClick={() => setSelectedPass(selectedPass?.index === index ? null : { pass, index })}
                            />
                        </g>
                    );
                })}

                {/* Pass Destination Points (Receivers) - Improved with better visibility */}
                {showConnections && filteredPasses.map((pass, index) => {
                    const x = pass.targetX / 100 * 105;
                    const y = pass.targetY / 100 * 68;
                    const isActive = activePass?.index === index;
                    const size = 1.1;

                    return (
                        <g key={`target-${index}`}>
                            {/* Highlight ring for active receiver */}
                            {isActive && (
                                <path
                                    d={`M ${x} ${y - 2} L ${x + 2} ${y} L ${x} ${y + 2} L ${x - 2} ${y} Z`}
                                    fill="none"
                                    stroke="hsl(217, 91%, 60%)"
                                    strokeWidth={0.3}
                                    strokeOpacity={0.8}
                                />
                            )}
                            {/* Diamond shape for receiver - click to select */}
                            <path
                                d={`M ${x} ${y - size} L ${x + size} ${y} L ${x} ${y + size} L ${x - size} ${y} Z`}
                                fill={pass.success ? "hsl(217, 91%, 50%)" : "hsl(0, 50%, 40%)"}
                                stroke="white"
                                strokeWidth={0.2}
                                fillOpacity={isActive ? 1 : (activePass ? 0.2 : 0.85)}
                                filter={isActive ? `url(#glow-highlight-${uniqueId})` : undefined}
                                style={{ cursor: 'pointer' }}
                                onClick={() => setSelectedPass(selectedPass?.index === index ? null : { pass, index })}
                            />
                        </g>
                    );
                })}
            </TacticalField>

            {/* Legend - Updated */}
            <div className="flex items-center justify-center gap-4 text-xs flex-wrap bg-secondary/30 rounded-lg p-3">
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-success border-2 border-white/50 flex items-center justify-center">
                        <span className="text-white text-[6px] font-bold">P</span>
                    </div>
                    <span className="text-muted-foreground">Passer (Success)</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-destructive border-2 border-white/50 flex items-center justify-center">
                        <span className="text-white text-[6px] font-bold">P</span>
                    </div>
                    <span className="text-muted-foreground">Passer (Failed)</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 flex items-center justify-center">
                        <div className="w-3 h-3 bg-primary rotate-45" />
                    </div>
                    <span className="text-muted-foreground">Receiver</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-6 h-0.5 bg-success" />
                    <ArrowRight className="w-3 h-3 text-success -ml-1" />
                    <span className="text-muted-foreground">Completed</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-6 h-0.5 bg-destructive" style={{ backgroundImage: "repeating-linear-gradient(90deg, hsl(var(--destructive)) 0px, hsl(var(--destructive)) 3px, transparent 3px, transparent 5px)" }} />
                    <span className="text-muted-foreground">Failed</span>
                </div>
            </div>

        </div>
    );
};

export default PassingMap;
