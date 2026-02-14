import { useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { MatchEvent, Player } from "@/types/player";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Users } from "lucide-react";
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

interface PassConnection {
    fromId: string;
    toId: string;
    fromName: string;
    toName: string;
    total: number;
    successful: number;
    accuracy: number;
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

// Get connection color based on accuracy
const getConnectionColor = (accuracy: number): string => {
    if (accuracy >= 85) return "hsl(142, 76%, 42%)";   // Green — high accuracy
    if (accuracy >= 70) return "hsl(38, 92%, 50%)";    // Orange — medium
    return "hsl(0, 72%, 50%)";                          // Red — low
};

const getConnectionColorWithOpacity = (accuracy: number, opacity: number): string => {
    if (accuracy >= 85) return `hsla(142, 76%, 42%, ${opacity})`;
    if (accuracy >= 70) return `hsla(38, 92%, 50%, ${opacity})`;
    return `hsla(0, 72%, 50%, ${opacity})`;
};

const TeamPassingMap = ({ playerPasses }: TeamPassingMapProps) => {
    const navigate = useNavigate();
    const [selectedInterval, setSelectedInterval] = useState<TimeInterval>(ALL_INTERVAL);
    const [intervalMode, setIntervalMode] = useState<'10min' | 'half'>('10min');
    const [selectedPlayerIds, setSelectedPlayerIds] = useState<Set<string>>(new Set());
    const [hoveredConnection, setHoveredConnection] = useState<PassConnection | null>(null);
    const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

    // Filter pass events by time interval
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

    // Filter by time interval
    const filteredPasses = useMemo(() => {
        return allPassEvents.filter(
            e => e.minute >= selectedInterval.start && e.minute < selectedInterval.end
        );
    }, [allPassEvents, selectedInterval]);

    // Build player map
    const playerMap = useMemo(() => {
        const map = new Map<string, Player>();
        playerPasses.forEach(pp => {
            map.set(pp.player.id, pp.player);
        });
        return map;
    }, [playerPasses]);

    // Build passing connections (bidirectional — combine A→B and B→A)
    const connections = useMemo(() => {
        const connMap = new Map<string, { total: number; successful: number }>();

        filteredPasses.forEach(pass => {
            if (!pass.passTarget) return;
            // Only count connections between known players in the squad
            if (!playerMap.has(pass.playerId) || !playerMap.has(pass.passTarget)) return;

            // Create sorted key so A→B and B→A merge into one connection
            const key = [pass.playerId, pass.passTarget].sort().join('::');
            const existing = connMap.get(key) || { total: 0, successful: 0 };
            existing.total++;
            if (pass.success) existing.successful++;
            connMap.set(key, existing);
        });

        const result: PassConnection[] = [];
        connMap.forEach((data, key) => {
            const [fromId, toId] = key.split('::');
            const fromPlayer = playerMap.get(fromId);
            const toPlayer = playerMap.get(toId);
            if (fromPlayer && toPlayer) {
                result.push({
                    fromId,
                    toId,
                    fromName: fromPlayer.name,
                    toName: toPlayer.name,
                    total: data.total,
                    successful: data.successful,
                    accuracy: data.total > 0 ? Math.round((data.successful / data.total) * 100) : 0,
                });
            }
        });

        // Sort by total passes descending
        return result.sort((a, b) => b.total - a.total);
    }, [filteredPasses, playerMap]);

    // Players that appear in connections (have pass data)
    const activePlayerIds = useMemo(() => {
        const ids = new Set<string>();
        connections.forEach(c => {
            ids.add(c.fromId);
            ids.add(c.toId);
        });
        return ids;
    }, [connections]);

    const activePlayers = useMemo(() => {
        return playerPasses
            .filter(pp => activePlayerIds.has(pp.player.id))
            .map(pp => pp.player);
    }, [playerPasses, activePlayerIds]);

    // Filter connections by selected players
    const visibleConnections = useMemo(() => {
        if (selectedPlayerIds.size === 0) return connections;
        return connections.filter(c =>
            selectedPlayerIds.has(c.fromId) || selectedPlayerIds.has(c.toId)
        );
    }, [connections, selectedPlayerIds]);

    const maxPasses = useMemo(() => {
        return Math.max(1, ...visibleConnections.map(c => c.total));
    }, [visibleConnections]);

    // Passing stats
    const stats = useMemo(() => {
        const relevantPasses = selectedPlayerIds.size > 0
            ? filteredPasses.filter(p => selectedPlayerIds.has(p.playerId) || (p.passTarget && selectedPlayerIds.has(p.passTarget)))
            : filteredPasses;

        const total = relevantPasses.length;
        const successful = relevantPasses.filter(p => p.success).length;
        const accuracy = total > 0 ? Math.round((successful / total) * 100) : 0;
        const keyPasses = relevantPasses.filter(p => p.success && p.targetX > 75).length;

        return { total, successful, accuracy, keyPasses };
    }, [filteredPasses, selectedPlayerIds]);

    // SVG layout — compact
    const SVG_SIZE = 380;
    const CENTER = SVG_SIZE / 2;
    const RADIUS = 140;
    const NODE_RADIUS = 18;

    // Calculate player positions in a circle
    const playerPositions = useMemo(() => {
        const positions = new Map<string, { x: number; y: number }>();
        const count = activePlayers.length;
        activePlayers.forEach((player, index) => {
            const angle = (2 * Math.PI * index) / count - Math.PI / 2; // Start from top
            positions.set(player.id, {
                x: CENTER + RADIUS * Math.cos(angle),
                y: CENTER + RADIUS * Math.sin(angle),
            });
        });
        return positions;
    }, [activePlayers]);

    // Toggle player selection
    const togglePlayer = useCallback((playerId: string) => {
        setSelectedPlayerIds(prev => {
            const next = new Set(prev);
            if (next.has(playerId)) {
                next.delete(playerId);
            } else {
                next.add(playerId);
            }
            return next;
        });
    }, []);

    const clearSelection = useCallback(() => {
        setSelectedPlayerIds(new Set());
    }, []);

    // Check if a node should be dimmed
    const isNodeDimmed = useCallback((playerId: string) => {
        if (selectedPlayerIds.size === 0) return false;
        if (selectedPlayerIds.has(playerId)) return false;
        // Check if this player is connected to any selected player
        return !visibleConnections.some(c => c.fromId === playerId || c.toId === playerId);
    }, [selectedPlayerIds, visibleConnections]);

    // Handle mouse move on connections
    const handleConnectionHover = useCallback((conn: PassConnection, e: React.MouseEvent<SVGLineElement>) => {
        const svg = e.currentTarget.closest('svg');
        if (!svg) return;
        const rect = svg.getBoundingClientRect();
        setTooltipPos({
            x: e.clientX - rect.left,
            y: e.clientY - rect.top - 10,
        });
        setHoveredConnection(conn);
    }, []);

    return (
        <div className="space-y-4">
            {/* Network Graph — shown first */}
            <div className="relative flex justify-center">
                <svg
                    viewBox={`0 0 ${SVG_SIZE} ${SVG_SIZE}`}
                    className="w-full max-w-xl"
                    style={{ minHeight: 300 }}
                >
                    <defs>
                        {/* Subtle glow for hovered connections */}
                        <filter id="conn-glow" x="-50%" y="-50%" width="200%" height="200%">
                            <feGaussianBlur stdDeviation="3" result="blur" />
                            <feMerge>
                                <feMergeNode in="blur" />
                                <feMergeNode in="SourceGraphic" />
                            </feMerge>
                        </filter>
                        {/* Radial gradient for background */}
                        <radialGradient id="net-bg" cx="50%" cy="50%" r="50%">
                            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.03" />
                            <stop offset="100%" stopColor="transparent" stopOpacity="0" />
                        </radialGradient>
                    </defs>

                    {/* Background circle */}
                    <circle cx={CENTER} cy={CENTER} r={RADIUS + 30} fill="url(#net-bg)" />
                    <circle
                        cx={CENTER} cy={CENTER} r={RADIUS + 30}
                        fill="none" stroke="hsl(var(--border))" strokeWidth="0.5" strokeDasharray="4,4" opacity={0.4}
                    />

                    {/* Connection lines */}
                    {visibleConnections.map((conn, i) => {
                        const from = playerPositions.get(conn.fromId);
                        const to = playerPositions.get(conn.toId);
                        if (!from || !to) return null;

                        const thickness = 1 + (conn.total / maxPasses) * 4;
                        const isHovered = hoveredConnection?.fromId === conn.fromId && hoveredConnection?.toId === conn.toId;
                        const baseOpacity = selectedPlayerIds.size > 0
                            ? ((selectedPlayerIds.has(conn.fromId) || selectedPlayerIds.has(conn.toId)) ? 0.7 : 0.1)
                            : 0.5;

                        return (
                            <line
                                key={`conn-${i}`}
                                x1={from.x} y1={from.y}
                                x2={to.x} y2={to.y}
                                stroke={isHovered
                                    ? getConnectionColor(conn.accuracy)
                                    : getConnectionColorWithOpacity(conn.accuracy, isHovered ? 1 : baseOpacity)
                                }
                                strokeWidth={isHovered ? thickness + 1.5 : thickness}
                                strokeLinecap="round"
                                filter={isHovered ? "url(#conn-glow)" : undefined}
                                style={{
                                    cursor: 'pointer',
                                    transition: 'stroke-width 0.2s, stroke-opacity 0.2s',
                                }}
                                onMouseMove={(e) => handleConnectionHover(conn, e)}
                                onMouseLeave={() => setHoveredConnection(null)}
                            />
                        );
                    })}

                    {/* Player nodes */}
                    {activePlayers.map(player => {
                        const pos = playerPositions.get(player.id);
                        if (!pos) return null;

                        const isDimmed = isNodeDimmed(player.id);
                        const isSelected = selectedPlayerIds.has(player.id);
                        const lastName = player.name.split(' ').slice(-1)[0];

                        return (
                            <g
                                key={player.id}
                                style={{ cursor: 'pointer', transition: 'opacity 0.3s' }}
                                opacity={isDimmed ? 0.2 : 1}
                                onClick={() => togglePlayer(player.id)}
                            >
                                {/* Glow ring for selected players */}
                                {isSelected && (
                                    <circle
                                        cx={pos.x} cy={pos.y} r={NODE_RADIUS + 3}
                                        fill="none"
                                        stroke="hsl(var(--primary))"
                                        strokeWidth="2"
                                        opacity={0.6}
                                    />
                                )}
                                {/* Node circle */}
                                <circle
                                    cx={pos.x} cy={pos.y} r={NODE_RADIUS}
                                    fill={isSelected ? "hsl(var(--primary))" : "hsl(var(--card))"}
                                    stroke={isSelected ? "hsl(var(--primary))" : "hsl(var(--border))"}
                                    strokeWidth="1.5"
                                />
                                {/* Jersey number */}
                                <text
                                    x={pos.x} y={pos.y + 1}
                                    textAnchor="middle"
                                    dominantBaseline="middle"
                                    fontSize="11"
                                    fontWeight="700"
                                    fill={isSelected ? "hsl(var(--primary-foreground))" : "hsl(var(--foreground))"}
                                >
                                    {player.jerseyNumber}
                                </text>
                                {/* Player name label */}
                                <text
                                    x={pos.x}
                                    y={pos.y + NODE_RADIUS + 11}
                                    textAnchor="middle"
                                    dominantBaseline="middle"
                                    fontSize="8"
                                    fontWeight="600"
                                    fill="hsl(var(--muted-foreground))"
                                    className="select-none"
                                >
                                    {lastName}
                                </text>
                            </g>
                        );
                    })}
                </svg>

                {/* Hover tooltip */}
                {hoveredConnection && (
                    <div
                        className="absolute pointer-events-none z-50 px-3 py-2 rounded-lg bg-popover border border-border shadow-xl text-sm"
                        style={{
                            left: tooltipPos.x,
                            top: tooltipPos.y,
                            transform: 'translate(-50%, -100%)',
                        }}
                    >
                        <p className="font-semibold text-foreground text-xs mb-1">
                            {hoveredConnection.fromName.split(' ').slice(-1)[0]} ↔ {hoveredConnection.toName.split(' ').slice(-1)[0]}
                        </p>
                        <div className="flex items-center gap-3 text-xs">
                            <span className="text-muted-foreground">
                                Passes: <strong className="text-foreground">{hoveredConnection.total}</strong>
                            </span>
                            <span className="text-muted-foreground">
                                Accuracy: <strong style={{ color: getConnectionColor(hoveredConnection.accuracy) }}>{hoveredConnection.accuracy}%</strong>
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
            {visibleConnections.length > 0 && (
                <p className="text-xs text-center text-muted-foreground">
                    Showing {visibleConnections.length} connection{visibleConnections.length !== 1 ? 's' : ''} between {activePlayers.length} players
                    {selectedPlayerIds.size > 0 && (
                        <> • <button onClick={clearSelection} className="text-primary hover:underline">Clear filter</button></>
                    )}
                </p>
            )}

            {/* Time Interval Selector — below the graph */}
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

            {/* Player Filter — Multi-select */}
            {activePlayers.length > 0 && (
                <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        Filter:
                    </span>
                    <Button
                        variant={selectedPlayerIds.size === 0 ? "default" : "outline"}
                        size="sm"
                        onClick={clearSelection}
                        className="h-7 px-3 text-xs"
                    >
                        All ({activePlayers.length})
                    </Button>
                    {activePlayers.map(player => {
                        const isSelected = selectedPlayerIds.has(player.id);
                        const playerPassCount = filteredPasses.filter(p => p.playerId === player.id).length;
                        return (
                            <Tooltip key={player.id}>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant={isSelected ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => togglePlayer(player.id)}
                                        className="h-7 px-2 text-xs gap-1"
                                    >
                                        <span className="font-medium">{player.name.split(' ').slice(-1)[0]}</span>
                                        <Badge variant="secondary" className="h-4 px-1 text-[10px]">{playerPassCount}</Badge>
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent side="top">
                                    <p className="font-medium">{player.name}</p>
                                    <p className="text-xs text-muted-foreground">#{player.jerseyNumber} • {player.position}</p>
                                    <p className="text-xs text-primary mt-1">Click to toggle filter</p>
                                </TooltipContent>
                            </Tooltip>
                        );
                    })}
                </div>
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

export default TeamPassingMap;
