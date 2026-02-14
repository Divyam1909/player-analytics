import { useMemo, useState, useCallback } from "react";
import { MatchEvent } from "@/types/player";
import { cn } from "@/lib/utils";
import { StatHint } from "@/components/ui/stat-hint";
import { Button } from "@/components/ui/button";

interface PlayerPassingTreeProps {
    events: MatchEvent[];
    playerName: string;
    matchId?: string;
}

interface ReceiverData {
    id: string;
    name: string;
    totalPasses: number;
    successfulPasses: number;
    accuracy: number;
    keyPasses: number;
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

// Same color scheme as TeamPassingMap for consistency
const getConnectionColor = (accuracy: number): string => {
    if (accuracy >= 85) return "hsl(142, 76%, 42%)";   // Green
    if (accuracy >= 70) return "hsl(38, 92%, 50%)";    // Orange
    return "hsl(0, 72%, 50%)";                          // Red
};

const getConnectionColorWithOpacity = (accuracy: number, opacity: number): string => {
    if (accuracy >= 85) return `hsla(142, 76%, 42%, ${opacity})`;
    if (accuracy >= 70) return `hsla(38, 92%, 50%, ${opacity})`;
    return `hsla(0, 72%, 50%, ${opacity})`;
};

const PlayerPassingTree = ({ events: initialEvents, playerName }: PlayerPassingTreeProps) => {
    const [selectedInterval, setSelectedInterval] = useState<TimeInterval>(ALL_INTERVAL);
    const [intervalMode, setIntervalMode] = useState<'10min' | 'half'>('10min');
    const [hoveredReceiverId, setHoveredReceiverId] = useState<string | null>(null);
    const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

    // Check if there's overtime data
    const hasOvertime = useMemo(() => {
        return initialEvents.some(e => e.minute > 90);
    }, [initialEvents]);

    // Get available intervals based on mode
    const availableIntervals = useMemo(() => {
        if (intervalMode === 'half') {
            return hasOvertime ? HALF_INTERVALS : HALF_INTERVALS.filter(i => i.category !== 'overtime');
        }
        return TEN_MIN_INTERVALS;
    }, [intervalMode, hasOvertime]);

    // Filter events based on time interval
    const events = useMemo(() => {
        if (selectedInterval.category === 'all') return initialEvents;
        return initialEvents.filter(e => e.minute >= selectedInterval.start && e.minute < selectedInterval.end);
    }, [initialEvents, selectedInterval]);

    // Build receiver data from pass events
    const receivers = useMemo(() => {
        const passes = events.filter(e => e.type === 'pass');
        const receiverMap = new Map<string, ReceiverData>();

        passes.forEach(pass => {
            const id = pass.passTarget;
            const name = pass.passTargetName;
            if (!id || !name) return;

            const existing = receiverMap.get(id) || {
                id,
                name,
                totalPasses: 0,
                successfulPasses: 0,
                accuracy: 0,
                keyPasses: 0,
            };

            existing.totalPasses++;
            if (pass.success) existing.successfulPasses++;
            if (pass.success && pass.targetX > 75) existing.keyPasses++;

            receiverMap.set(id, existing);
        });

        // Calculate accuracy
        receiverMap.forEach(r => {
            r.accuracy = r.totalPasses > 0
                ? Math.round((r.successfulPasses / r.totalPasses) * 100)
                : 0;
        });

        return Array.from(receiverMap.values())
            .sort((a, b) => b.totalPasses - a.totalPasses);
    }, [events]);

    // Summary stats
    const stats = useMemo(() => {
        const passes = events.filter(e => e.type === 'pass');
        const total = passes.length;
        const successful = passes.filter(p => p.success).length;
        const keyPasses = passes.filter(p => p.success && p.targetX > 75).length;
        return {
            total,
            successful,
            accuracy: total > 0 ? Math.round((successful / total) * 100) : 0,
            keyPasses,
        };
    }, [events]);

    // SVG layout — Compact tree: root at top, receivers in rows below
    const NODE_R = 18; // Uniform size for all nodes
    const SVG_W = 460;
    const ROOT_Y = 48;

    // Split receivers into rows for compact layout
    const needsTwoRows = receivers.length > 6;
    const SVG_H = needsTwoRows ? 340 : 260;

    const rows = useMemo(() => {
        if (receivers.length === 0) return [];
        if (!needsTwoRows) return [receivers];
        const mid = Math.ceil(receivers.length / 2);
        return [receivers.slice(0, mid), receivers.slice(mid)];
    }, [receivers, needsTwoRows]);

    // Calculate positions for each row
    const receiverPositions = useMemo(() => {
        const positions = new Map<string, { x: number; y: number }>();
        const rowYPositions = needsTwoRows ? [SVG_H - 120, SVG_H - 42] : [SVG_H - 50];

        rows.forEach((row, rowIdx) => {
            const count = row.length;
            if (count === 0) return;

            const rowY = rowYPositions[rowIdx];
            const padding = 38;
            const availableW = SVG_W - padding * 2;
            const step = count > 1 ? availableW / (count - 1) : 0;
            const startX = count === 1 ? SVG_W / 2 : padding;

            row.forEach((receiver, i) => {
                positions.set(receiver.id, {
                    x: startX + i * step,
                    y: rowY,
                });
            });
        });

        return positions;
    }, [rows, needsTwoRows, SVG_W, SVG_H]);

    const maxPasses = useMemo(() => {
        return Math.max(1, ...receivers.map(r => r.totalPasses));
    }, [receivers]);

    // Handle mouse move on connection lines
    const handleConnectionHover = useCallback((receiverId: string, e: React.MouseEvent<SVGPathElement>) => {
        const svg = e.currentTarget.closest('svg');
        if (!svg) return;
        const rect = svg.getBoundingClientRect();
        setTooltipPos({
            x: e.clientX - rect.left,
            y: e.clientY - rect.top - 10,
        });
        setHoveredReceiverId(receiverId);
    }, []);

    const hoveredData = hoveredReceiverId ? receivers.find(r => r.id === hoveredReceiverId) : null;

    if (receivers.length === 0 && selectedInterval.category === 'all') {
        return (
            <div className="text-center py-8 text-muted-foreground">
                <p>No passing connection data available</p>
                <p className="text-sm mt-1">Pass target information is required for this visualization</p>
            </div>
        );
    }

    const playerInitials = playerName.split(' ').map(n => n[0]).join('').slice(0, 2);

    return (
        <div className="space-y-4">
            {/* Time Interval Selector — ABOVE the map */}
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
                </div>

                {/* Time Interval Buttons — always visible */}
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

            {/* Tree Visualization */}
            <div className="relative flex justify-center">
                {receivers.length === 0 ? (
                    <div className="flex items-center justify-center h-[200px] text-muted-foreground text-sm">
                        No passes in this time period
                    </div>
                ) : (
                    <svg
                        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
                        className="w-full max-w-xl"
                        style={{ minHeight: needsTwoRows ? 300 : 230 }}
                    >
                        <defs>
                            <radialGradient id="ptree-bg" cx="50%" cy="15%" r="65%">
                                <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.04" />
                                <stop offset="100%" stopColor="transparent" stopOpacity="0" />
                            </radialGradient>
                            <filter id="ptree-glow" x="-50%" y="-50%" width="200%" height="200%">
                                <feGaussianBlur stdDeviation="3" result="blur" />
                                <feMerge>
                                    <feMergeNode in="blur" />
                                    <feMergeNode in="SourceGraphic" />
                                </feMerge>
                            </filter>
                        </defs>

                        {/* Background */}
                        <rect width={SVG_W} height={SVG_H} fill="url(#ptree-bg)" rx="8" />

                        {/* Connection lines — Bezier curves from root to each receiver */}
                        {receivers.map(receiver => {
                            const pos = receiverPositions.get(receiver.id);
                            if (!pos) return null;

                            const thickness = 1.5 + (receiver.totalPasses / maxPasses) * 4;
                            const isHovered = hoveredReceiverId === receiver.id;

                            // Control points for a smooth S-curve
                            const rootBottom = ROOT_Y + NODE_R;
                            const midY = (rootBottom + pos.y) / 2;
                            const path = `M ${SVG_W / 2} ${rootBottom} C ${SVG_W / 2} ${midY}, ${pos.x} ${midY}, ${pos.x} ${pos.y - NODE_R}`;

                            return (
                                <path
                                    key={`line-${receiver.id}`}
                                    d={path}
                                    fill="none"
                                    stroke={isHovered
                                        ? getConnectionColor(receiver.accuracy)
                                        : getConnectionColorWithOpacity(receiver.accuracy, hoveredReceiverId ? (isHovered ? 0.9 : 0.12) : 0.55)
                                    }
                                    strokeWidth={isHovered ? thickness + 1.5 : thickness}
                                    strokeLinecap="round"
                                    filter={isHovered ? "url(#ptree-glow)" : undefined}
                                    style={{
                                        cursor: 'pointer',
                                        transition: 'opacity 0.2s, stroke-width 0.2s',
                                    }}
                                    onMouseMove={(e) => handleConnectionHover(receiver.id, e)}
                                    onMouseLeave={() => setHoveredReceiverId(null)}
                                />
                            );
                        })}

                        {/* Pass count badge on hovered line */}
                        {hoveredData && (() => {
                            const pos = receiverPositions.get(hoveredData.id);
                            if (!pos) return null;
                            const midX = (SVG_W / 2 + pos.x) / 2;
                            const midY = (ROOT_Y + NODE_R + pos.y - NODE_R) / 2;
                            return (
                                <g style={{ pointerEvents: 'none' }}>
                                    <rect
                                        x={midX - 16} y={midY - 9}
                                        width={32} height={18}
                                        rx={4}
                                        fill="hsl(var(--popover))"
                                        stroke="hsl(var(--border))"
                                        strokeWidth={0.5}
                                    />
                                    <text
                                        x={midX} y={midY + 1}
                                        textAnchor="middle"
                                        dominantBaseline="middle"
                                        fontSize="9"
                                        fontWeight="700"
                                        fill={getConnectionColor(hoveredData.accuracy)}
                                    >
                                        {hoveredData.totalPasses}×
                                    </text>
                                </g>
                            );
                        })()}

                        {/* Root player node */}
                        <g>
                            {/* Outer glow ring */}
                            <circle
                                cx={SVG_W / 2} cy={ROOT_Y} r={NODE_R + 3}
                                fill="none"
                                stroke="hsl(var(--primary))"
                                strokeWidth="1.5"
                                opacity={0.35}
                            />
                            {/* Node circle */}
                            <circle
                                cx={SVG_W / 2} cy={ROOT_Y} r={NODE_R}
                                fill="hsl(var(--primary))"
                                stroke="hsl(var(--primary))"
                                strokeWidth="2"
                            />
                            {/* Initials */}
                            <text
                                x={SVG_W / 2} y={ROOT_Y + 1}
                                textAnchor="middle"
                                dominantBaseline="middle"
                                fontSize="11"
                                fontWeight="700"
                                fill="hsl(var(--primary-foreground))"
                            >
                                {playerInitials}
                            </text>
                            {/* Player name above node */}
                            <text
                                x={SVG_W / 2}
                                y={ROOT_Y - NODE_R - 8}
                                textAnchor="middle"
                                dominantBaseline="middle"
                                fontSize="10"
                                fontWeight="600"
                                fill="hsl(var(--foreground))"
                            >
                                {playerName}
                            </text>
                        </g>

                        {/* Receiver nodes */}
                        {receivers.map(receiver => {
                            const pos = receiverPositions.get(receiver.id);
                            if (!pos) return null;

                            const isHovered = hoveredReceiverId === receiver.id;
                            const lastName = receiver.name.split(' ').slice(-1)[0];

                            return (
                                <g
                                    key={receiver.id}
                                    style={{ cursor: 'pointer', transition: 'opacity 0.25s' }}
                                    opacity={hoveredReceiverId ? (isHovered ? 1 : 0.25) : 1}
                                    onMouseEnter={() => setHoveredReceiverId(receiver.id)}
                                    onMouseLeave={() => setHoveredReceiverId(null)}
                                >
                                    {/* Highlight ring */}
                                    {isHovered && (
                                        <circle
                                            cx={pos.x} cy={pos.y} r={NODE_R + 3}
                                            fill="none"
                                            stroke={getConnectionColor(receiver.accuracy)}
                                            strokeWidth="1.5"
                                            opacity={0.6}
                                        />
                                    )}
                                    {/* Node circle — UNIFORM SIZE */}
                                    <circle
                                        cx={pos.x} cy={pos.y} r={NODE_R}
                                        fill={isHovered ? "hsl(var(--primary))" : "hsl(var(--card))"}
                                        stroke={isHovered ? "hsl(var(--primary))" : "hsl(var(--border))"}
                                        strokeWidth="1.5"
                                    />
                                    {/* Initials */}
                                    <text
                                        x={pos.x} y={pos.y + 1}
                                        textAnchor="middle"
                                        dominantBaseline="middle"
                                        fontSize="9"
                                        fontWeight="700"
                                        fill={isHovered ? "hsl(var(--primary-foreground))" : "hsl(var(--foreground))"}
                                    >
                                        {receiver.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                    </text>
                                    {/* Player name below node */}
                                    <text
                                        x={pos.x}
                                        y={pos.y + NODE_R + 10}
                                        textAnchor="middle"
                                        dominantBaseline="middle"
                                        fontSize="8"
                                        fontWeight="500"
                                        fill="hsl(var(--muted-foreground))"
                                    >
                                        {lastName}
                                    </text>
                                    {/* Stats below name */}
                                    <text
                                        x={pos.x}
                                        y={pos.y + NODE_R + 20}
                                        textAnchor="middle"
                                        dominantBaseline="middle"
                                        fontSize="7"
                                        fontWeight="600"
                                        fill={getConnectionColor(receiver.accuracy)}
                                    >
                                        {receiver.totalPasses} • {receiver.accuracy}%
                                    </text>
                                </g>
                            );
                        })}
                    </svg>
                )}

                {/* Hover tooltip — appears near cursor on line hover */}
                {hoveredData && (
                    <div
                        className="absolute pointer-events-none z-50 px-3 py-2 rounded-lg bg-popover border border-border shadow-xl text-sm"
                        style={{
                            left: tooltipPos.x,
                            top: tooltipPos.y,
                            transform: 'translate(-50%, -100%)',
                        }}
                    >
                        <p className="font-semibold text-foreground text-xs mb-1">
                            {playerName.split(' ').slice(-1)[0]} → {hoveredData.name.split(' ').slice(-1)[0]}
                        </p>
                        <div className="flex items-center gap-3 text-xs">
                            <span className="text-muted-foreground">
                                Passes: <strong className="text-foreground">{hoveredData.totalPasses}</strong>
                            </span>
                            <span className="text-muted-foreground">
                                Accuracy: <strong style={{ color: getConnectionColor(hoveredData.accuracy) }}>{hoveredData.accuracy}%</strong>
                            </span>
                        </div>
                        <div className="flex items-center gap-3 text-xs mt-0.5">
                            <span className="text-muted-foreground">
                                Successful: <strong className="text-success">{hoveredData.successfulPasses}</strong>
                            </span>
                            <span className="text-muted-foreground">
                                Key: <strong className="text-warning">{hoveredData.keyPasses}</strong>
                            </span>
                        </div>
                    </div>
                )}
            </div>

            {/* Legend */}
            <div className="flex items-center justify-center gap-4 text-xs flex-wrap">
                <div className="flex items-center gap-1.5">
                    <div className="w-5 h-1 rounded" style={{ backgroundColor: "hsl(142, 76%, 42%)" }} />
                    <span className="text-muted-foreground">High accuracy (≥85%)</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <div className="w-5 h-1 rounded" style={{ backgroundColor: "hsl(38, 92%, 50%)" }} />
                    <span className="text-muted-foreground">Medium (70-84%)</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <div className="w-5 h-1 rounded" style={{ backgroundColor: "hsl(0, 72%, 50%)" }} />
                    <span className="text-muted-foreground">Low (&lt;70%)</span>
                </div>
                <span className="text-muted-foreground/60 ml-2 border-l border-border pl-2">
                    Line thickness = pass volume
                </span>
            </div>

            {/* Connection count info */}
            {receivers.length > 0 && (
                <p className="text-xs text-center text-muted-foreground">
                    Showing {receivers.length} connection{receivers.length !== 1 ? 's' : ''} from {playerName}
                </p>
            )}

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {[
                    { label: "Total", value: stats.total, color: "text-primary", statId: "total_passes" },
                    { label: "Successful", value: stats.successful, color: "text-success", statId: "total_passes" },
                    { label: "Accuracy", value: `${stats.accuracy}%`, color: "text-warning", statId: "pass_accuracy" },
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
        </div>
    );
};

export default PlayerPassingTree;
