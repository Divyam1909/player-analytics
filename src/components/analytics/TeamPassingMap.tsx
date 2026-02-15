import { useState, useMemo, useCallback, useRef } from "react";
import { MatchEvent, Player } from "@/types/player";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { StatHint } from "@/components/ui/stat-hint";
import TacticalField from "@/components/field/TacticalField";

// ── Types ──────────────────────────────────────────────────────

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
    category?: "all" | "10min" | "half" | "overtime";
}

interface PassConnection {
    fromId: string;
    toId: string;
    fromName: string;
    toName: string;
    total: number;
    teamId: string;
}

interface PlayerNode {
    player: Player;
    x: number; // pitch coords 0-105
    y: number; // pitch coords 0-68
    teamId: string;
    passCount: number;
}

// ── Constants ──────────────────────────────────────────────────

const TEN_MIN_INTERVALS: TimeInterval[] = [
    { label: "0-10'", start: 0, end: 10, category: "10min" },
    { label: "10-20'", start: 10, end: 20, category: "10min" },
    { label: "20-30'", start: 20, end: 30, category: "10min" },
    { label: "30-40'", start: 30, end: 40, category: "10min" },
    { label: "40-50'", start: 40, end: 50, category: "10min" },
    { label: "50-60'", start: 50, end: 60, category: "10min" },
    { label: "60-70'", start: 60, end: 70, category: "10min" },
    { label: "70-80'", start: 70, end: 80, category: "10min" },
    { label: "80-90'", start: 80, end: 90, category: "10min" },
];

const HALF_INTERVALS: TimeInterval[] = [
    { label: "1st Half", start: 0, end: 45, category: "half" },
    { label: "2nd Half", start: 45, end: 90, category: "half" },
    { label: "Extra Time", start: 90, end: 120, category: "overtime" },
];

const ALL_INTERVAL: TimeInterval = {
    label: "Full Match",
    start: 0,
    end: 120,
    category: "all",
};

const PITCH_W = 105;
const PITCH_H = 68;
const NODE_R = 2.2;
const MIN_LINE_W = 0.3;
const MAX_LINE_W = 2.0;
const MIN_CONN_PASSES = 1;

// ── Position-based field coordinates (full pitch, for home team on left half) ──
// Coordinates are in pitch units: x=0-105, y=0-68
// Home team defends left goal (x=0), attacks toward right goal (x=105)
// Field thirds: Defensive (0-35), Middle (35-70), Attacking (70-105)
// Center line at x=52.5 - HOME TEAM STAYS IN LEFT HALF (x < 52.5)
const POSITION_COORDS: Record<string, { x: number; y: number }> = {
    // Goalkeepers - inside the 6-yard box
    GK: { x: 5.5, y: 34 },
    Goalkeeper: { x: 5.5, y: 34 },

    // Defenders - defensive third, in front of penalty area
    CB: { x: 18, y: 34 },
    Defender: { x: 18, y: 34 },
    LCB: { x: 18, y: 24 },
    RCB: { x: 18, y: 44 },
    LB: { x: 17, y: 12 },
    RB: { x: 17, y: 56 },
    LWB: { x: 22, y: 10 },
    RWB: { x: 22, y: 58 },

    // Defensive Midfielders - just ahead of defense
    CDM: { x: 30, y: 34 },
    LCDM: { x: 30, y: 25 },
    RCDM: { x: 30, y: 43 },

    // Central Midfielders - middle third
    CM: { x: 38, y: 34 },
    Midfielder: { x: 38, y: 34 },
    LCM: { x: 37, y: 24 },
    RCM: { x: 37, y: 44 },
    LM: { x: 36, y: 13 },
    RM: { x: 36, y: 55 },

    // Attacking Midfielders - approaching center line
    CAM: { x: 44, y: 34 },
    LCAM: { x: 44, y: 25 },
    RCAM: { x: 44, y: 43 },

    // Wingers - near center line, wide positions
    LW: { x: 46, y: 14 },
    RW: { x: 46, y: 54 },
    Winger: { x: 46, y: 34 },

    // Forwards - at center line, most attacking positions
    CF: { x: 50, y: 34 },
    ST: { x: 51, y: 34 },
    Forward: { x: 51, y: 34 },
    LST: { x: 50, y: 26 },
    RST: { x: 50, y: 42 },
};

// Fallback for unknown positions - default to central midfielder
const DEFAULT_COORDS = { x: 38, y: 34 };

/**
 * Get pitch coordinates for a player based on their position.
 * @param position Player's position string from database
 * @param isHomeTeam If false, mirror to the right side of the pitch
 * @param index Unique index for collision avoidance offset
 */
function getPositionCoords(
    position: string,
    isHomeTeam: boolean,
    index: number,
    totalSamePos: number,
): { x: number; y: number } {
    // Try exact match first
    let coords = POSITION_COORDS[position];

    // Try with trimmed and uppercase for fuzzy matching
    if (!coords) {
        const posKey = position.trim();
        coords = POSITION_COORDS[posKey];
    }

    // Try matching partial (e.g., "Left Winger" contains "LW", "Defender" contains "CB")
    if (!coords) {
        const posUpper = position.toUpperCase().trim();
        
        // Check for common text patterns
        if (posUpper.includes('GOALKEEPER') || posUpper.includes('KEEPER')) {
            coords = POSITION_COORDS['GK'];
        } else if (posUpper.includes('DEFENDER') || posUpper.includes('BACK')) {
            coords = POSITION_COORDS['CB'];
        } else if (posUpper.includes('MIDFIELDER') || posUpper.includes('MID')) {
            coords = POSITION_COORDS['CM'];
        } else if (posUpper.includes('WINGER') || posUpper.includes('WING')) {
            coords = POSITION_COORDS['Winger'];
        } else if (posUpper.includes('FORWARD') || posUpper.includes('STRIKER') || posUpper.includes('ATTACKER')) {
            coords = POSITION_COORDS['ST'];
        } else {
            // Try exact key match from map
            for (const [key, val] of Object.entries(POSITION_COORDS)) {
                if (posUpper.includes(key.toUpperCase())) {
                    coords = val;
                    break;
                }
            }
        }
    }

    // Final fallback
    if (!coords) {
        coords = DEFAULT_COORDS;
    }

    let { x, y } = coords;

    // Offset if multiple players at same position - smaller offset for better spacing
    if (totalSamePos > 1) {
        const offsetY = (index - (totalSamePos - 1) / 2) * 4.5;
        y = Math.max(6, Math.min(PITCH_H - 6, y + offsetY));
    }

    // Mirror for away team (flip x to right side of pitch)
    if (!isHomeTeam) {
        x = PITCH_W - x;
    }

    // Ensure players stay within field boundaries with padding
    x = Math.max(5, Math.min(PITCH_W - 5, x));
    y = Math.max(6, Math.min(PITCH_H - 6, y));

    return { x, y };
}

// Team palettes
const TEAM_PALETTES = [
    {
        node: "rgba(59, 140, 255, 0.95)",
        border: "rgba(30, 80, 180, 0.9)",
        line: "rgba(59, 140, 255, 0.50)",
        lineHover: "rgba(59, 140, 255, 0.85)",
    },
    {
        node: "rgba(240, 75, 75, 0.95)",
        border: "rgba(165, 40, 40, 0.9)",
        line: "rgba(240, 75, 75, 0.50)",
        lineHover: "rgba(240, 75, 75, 0.85)",
    },
];

// ── Component ──────────────────────────────────────────────────

const TeamPassingMap = ({ playerPasses }: TeamPassingMapProps) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [selectedInterval, setSelectedInterval] =
        useState<TimeInterval>(ALL_INTERVAL);
    const [intervalMode, setIntervalMode] = useState<"10min" | "half">("10min");
    const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
    const [hoveredConn, setHoveredConn] = useState<PassConnection | null>(null);
    const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
    const [selectedPlayerIds, setSelectedPlayerIds] = useState<Set<string>>(
        new Set(),
    );

    // ── Derived data ──────────────────────────────────────────

    const playerMap = useMemo(() => {
        const m = new Map<string, Player>();
        playerPasses.forEach((pp) => m.set(pp.player.id, pp.player));
        return m;
    }, [playerPasses]);

    // Group players by team
    const teamGroups = useMemo(() => {
        const groups = new Map<string, { players: Player[]; teamName: string }>();
        playerPasses.forEach((pp) => {
            const tid = pp.player.teamId;
            if (!groups.has(tid)) {
                groups.set(tid, { players: [], teamName: pp.player.team });
            }
            groups.get(tid)!.players.push(pp.player);
        });
        // Sort by player count descending (home team = most players)
        return [...groups.entries()].sort(
            (a, b) => b[1].players.length - a[1].players.length,
        );
    }, [playerPasses]);

    // Determine home/away by index
    const homeTeamId = teamGroups[0]?.[0] || "";
    const teamColorMap = useMemo(() => {
        const m = new Map<string, (typeof TEAM_PALETTES)[0] & { teamName: string; isHome: boolean }>();
        teamGroups.forEach(([teamId, info], i) => {
            m.set(teamId, {
                ...TEAM_PALETTES[i % TEAM_PALETTES.length],
                teamName: info.teamName,
                isHome: teamId === homeTeamId,
            });
        });
        return m;
    }, [teamGroups, homeTeamId]);

    // All pass events filtered by time
    const allPassEvents = useMemo(
        () =>
            playerPasses.flatMap((pp) =>
                pp.events
                    .filter((e) => e.type === "pass")
                    .map((e) => ({
                        ...e,
                        playerId: pp.player.id,
                        teamId: pp.player.teamId,
                    })),
            ),
        [playerPasses],
    );

    const hasOvertime = useMemo(
        () => allPassEvents.some((e) => e.minute > 90),
        [allPassEvents],
    );

    const availableIntervals = useMemo(() => {
        if (intervalMode === "half")
            return hasOvertime
                ? HALF_INTERVALS
                : HALF_INTERVALS.filter((i) => i.category !== "overtime");
        return TEN_MIN_INTERVALS;
    }, [intervalMode, hasOvertime]);

    const filteredPasses = useMemo(
        () =>
            allPassEvents.filter(
                (e) =>
                    e.minute >= selectedInterval.start &&
                    e.minute < selectedInterval.end,
            ),
        [allPassEvents, selectedInterval],
    );

    // Count passes per player
    const playerPassCounts = useMemo(() => {
        const counts = new Map<string, number>();
        filteredPasses.forEach((p) => {
            counts.set(p.playerId, (counts.get(p.playerId) || 0) + 1);
        });
        return counts;
    }, [filteredPasses]);

    // ── Player nodes with formation-based positions ───────────

    const playerNodes = useMemo(() => {
        const nodes: PlayerNode[] = [];

        // Count players per position per team for collision offset
        const positionCounts = new Map<string, number>();
        const positionIndices = new Map<string, number>();

        // First pass: count positions per team
        teamGroups.forEach(([teamId, { players }]) => {
            players.forEach((player) => {
                const key = `${teamId}:${player.position}`;
                positionCounts.set(key, (positionCounts.get(key) || 0) + 1);
            });
        });

        // Second pass: assign positions
        teamGroups.forEach(([teamId, { players }]) => {
            const isHome = teamId === homeTeamId;
            players.forEach((player) => {
                const key = `${teamId}:${player.position}`;
                const idx = positionIndices.get(key) || 0;
                positionIndices.set(key, idx + 1);
                const totalSamePos = positionCounts.get(key) || 1;

                const { x, y } = getPositionCoords(
                    player.position,
                    isHome,
                    idx,
                    totalSamePos,
                );

                nodes.push({
                    player,
                    x,
                    y,
                    teamId,
                    passCount: playerPassCounts.get(player.id) || 0,
                });
            });
        });

        return nodes;
    }, [teamGroups, homeTeamId, playerPassCounts]);

    // ── Bidirectional connections (same team only) ────────────

    const connections = useMemo(() => {
        const connMap = new Map<string, { total: number; teamId: string }>();
        const playerSet = new Set(playerPasses.map((pp) => pp.player.id));

        filteredPasses.forEach((pass) => {
            if (!pass.passTarget) return;
            if (!playerSet.has(pass.playerId) || !playerSet.has(pass.passTarget))
                return;

            const fromPlayer = playerMap.get(pass.playerId);
            const toPlayer = playerMap.get(pass.passTarget);
            if (!fromPlayer || !toPlayer) return;
            if (fromPlayer.teamId !== toPlayer.teamId) return;

            const key = [pass.playerId, pass.passTarget].sort().join("::");
            const ex = connMap.get(key) || { total: 0, teamId: fromPlayer.teamId };
            ex.total++;
            connMap.set(key, ex);
        });

        const result: PassConnection[] = [];
        connMap.forEach((data, key) => {
            if (data.total < MIN_CONN_PASSES) return;
            const [fromId, toId] = key.split("::");
            const fp = playerMap.get(fromId);
            const tp = playerMap.get(toId);
            if (fp && tp) {
                result.push({
                    fromId,
                    toId,
                    fromName: fp.name,
                    toName: tp.name,
                    total: data.total,
                    teamId: data.teamId,
                });
            }
        });
        return result.sort((a, b) => a.total - b.total);
    }, [filteredPasses, playerMap, playerPasses]);

    const visibleConnections = useMemo(() => {
        if (selectedPlayerIds.size === 0) return connections;
        return connections.filter(
            (c) => selectedPlayerIds.has(c.fromId) || selectedPlayerIds.has(c.toId),
        );
    }, [connections, selectedPlayerIds]);

    const maxConnPasses = useMemo(
        () => Math.max(1, ...visibleConnections.map((c) => c.total)),
        [visibleConnections],
    );

    const nodePositions = useMemo(() => {
        const m = new Map<string, { x: number; y: number }>();
        playerNodes.forEach((n) => m.set(n.player.id, { x: n.x, y: n.y }));
        return m;
    }, [playerNodes]);

    // Stats
    const stats = useMemo(() => {
        const relevant =
            selectedPlayerIds.size > 0
                ? filteredPasses.filter(
                      (p) =>
                          selectedPlayerIds.has(p.playerId) ||
                          (p.passTarget && selectedPlayerIds.has(p.passTarget)),
                  )
                : filteredPasses;
        const total = relevant.length;
        const successful = relevant.filter((p) => p.success).length;
        return {
            total,
            successful,
            accuracy: total > 0 ? Math.round((successful / total) * 100) : 0,
            keyPasses: relevant.filter((p) => p.success && p.targetX > 75).length,
        };
    }, [filteredPasses, selectedPlayerIds]);

    // ── Callbacks ─────────────────────────────────────────────

    const togglePlayer = useCallback((id: string) => {
        setSelectedPlayerIds((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    }, []);

    const clearSelection = useCallback(() => setSelectedPlayerIds(new Set()), []);

    const isNodeDimmed = useCallback(
        (id: string) => {
            if (selectedPlayerIds.size === 0) return false;
            if (selectedPlayerIds.has(id)) return false;
            return !visibleConnections.some((c) => c.fromId === id || c.toId === id);
        },
        [selectedPlayerIds, visibleConnections],
    );

    const handleNodeHover = useCallback(
        (playerId: string | null, e?: React.MouseEvent) => {
            setHoveredNodeId(playerId);
            if (e && containerRef.current) {
                const rect = containerRef.current.getBoundingClientRect();
                setTooltipPos({
                    x: e.clientX - rect.left,
                    y: e.clientY - rect.top - 10,
                });
            }
        },
        [],
    );

    const handleConnHover = useCallback(
        (conn: PassConnection | null, e?: React.MouseEvent) => {
            setHoveredConn(conn);
            if (e && containerRef.current) {
                const rect = containerRef.current.getBoundingClientRect();
                setTooltipPos({
                    x: e.clientX - rect.left,
                    y: e.clientY - rect.top - 10,
                });
            }
        },
        [],
    );

    // ── Render ─────────────────────────────────────────────────

    return (
        <div className="space-y-4">
            {/* Pitch */}
            <div
                ref={containerRef}
                className="relative w-full max-w-3xl mx-auto rounded-xl overflow-hidden border border-border shadow-xl aspect-[105/68]"
            >
                <TacticalField viewMode="full" className="absolute inset-0 w-full h-full">
                    {/* Pass lines */}
                    {visibleConnections.map((conn, i) => {
                        const from = nodePositions.get(conn.fromId);
                        const to = nodePositions.get(conn.toId);
                        if (!from || !to) return null;

                        const palette = teamColorMap.get(conn.teamId);
                        if (!palette) return null;

                        const w =
                            MIN_LINE_W +
                            (conn.total / maxConnPasses) * (MAX_LINE_W - MIN_LINE_W);

                        const isHovered =
                            hoveredConn?.fromId === conn.fromId &&
                            hoveredConn?.toId === conn.toId;
                        const isNodeHov =
                            hoveredNodeId === conn.fromId || hoveredNodeId === conn.toId;
                        const isDimmed =
                            selectedPlayerIds.size > 0 &&
                            !selectedPlayerIds.has(conn.fromId) &&
                            !selectedPlayerIds.has(conn.toId);

                        const stroke = isHovered
                            ? palette.lineHover
                            : isNodeHov
                              ? palette.lineHover
                              : isDimmed
                                ? "rgba(255,255,255,0.05)"
                                : palette.line;

                        return (
                            <line
                                key={`l-${i}`}
                                x1={from.x}
                                y1={from.y}
                                x2={to.x}
                                y2={to.y}
                                stroke={stroke}
                                strokeWidth={isHovered ? w * 1.3 : w}
                                strokeLinecap="round"
                                style={{ cursor: "pointer", transition: "stroke 0.15s" }}
                                onMouseMove={(e) => handleConnHover(conn, e)}
                                onMouseLeave={() => handleConnHover(null)}
                            />
                        );
                    })}

                    {/* Player nodes */}
                    {playerNodes.map((node) => {
                        const pos = nodePositions.get(node.player.id);
                        if (!pos) return null;

                        const palette = teamColorMap.get(node.teamId);
                        if (!palette) return null;

                        const dimmed = isNodeDimmed(node.player.id);
                        const isSelected = selectedPlayerIds.has(node.player.id);
                        const isHovered = hoveredNodeId === node.player.id;
                        const lastName = node.player.name.split(" ").slice(-1)[0];

                        return (
                            <g
                                key={node.player.id}
                                style={{ cursor: "pointer" }}
                                opacity={dimmed ? 0.15 : 1}
                                onClick={() => togglePlayer(node.player.id)}
                                onMouseMove={(e) => handleNodeHover(node.player.id, e)}
                                onMouseLeave={() => handleNodeHover(null)}
                            >
                                {(isSelected || isHovered) && (
                                    <circle
                                        cx={pos.x}
                                        cy={pos.y}
                                        r={NODE_R + 0.8}
                                        fill="none"
                                        stroke="white"
                                        strokeWidth="0.4"
                                        opacity={0.85}
                                    />
                                )}
                                <circle
                                    cx={pos.x}
                                    cy={pos.y}
                                    r={NODE_R}
                                    fill={palette.node}
                                    stroke={palette.border}
                                    strokeWidth="0.3"
                                />
                                <text
                                    x={pos.x}
                                    y={pos.y - NODE_R - 1.2}
                                    textAnchor="middle"
                                    dominantBaseline="auto"
                                    fontSize="2"
                                    fontWeight="500"
                                    fontFamily="system-ui, -apple-system, sans-serif"
                                    fill="white"
                                    stroke="rgba(0,0,0,0.5)"
                                    strokeWidth="0.3"
                                    paintOrder="stroke"
                                >
                                    {lastName}
                                </text>
                            </g>
                        );
                    })}
                </TacticalField>

                {/* Overlay */}
                <div className="absolute inset-0 bg-black/[0.04] pointer-events-none" />

                {/* Team labels */}
                {teamColorMap.size > 0 && (
                    <div className="absolute top-2 left-1/2 -translate-x-1/2 flex items-center gap-3 pointer-events-none select-none">
                        {[...teamColorMap.entries()].map(([, palette]) => (
                            <div
                                key={palette.teamName}
                                className="flex items-center gap-1.5 bg-black/40 px-2.5 py-1 rounded-full"
                            >
                                <span
                                    className="w-2 h-2 rounded-full"
                                    style={{ backgroundColor: palette.node }}
                                />
                                <span className="text-[10px] font-semibold text-white/80">
                                    {palette.teamName}
                                </span>
                            </div>
                        ))}
                    </div>
                )}

                {/* Time badge */}
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[10px] text-white/70 font-medium bg-black/40 px-3 py-1 rounded-full pointer-events-none select-none">
                    Passes from minutes {selectedInterval.start} to{" "}
                    {selectedInterval.end > 90 ? "90+" : selectedInterval.end}
                </div>

                {/* Empty state */}
                {playerNodes.length === 0 && (
                    <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
                        <p className="text-white/60 text-sm font-medium bg-black/30 px-4 py-2 rounded-lg">
                            No player data available
                        </p>
                    </div>
                )}

                {/* Tooltip — connection */}
                {hoveredConn && (
                    <div
                        className="absolute pointer-events-none z-50 px-3 py-2 rounded-lg bg-popover/95 backdrop-blur border border-border shadow-xl"
                        style={{
                            left: tooltipPos.x,
                            top: tooltipPos.y,
                            transform: "translate(-50%, -100%)",
                        }}
                    >
                        <p className="font-semibold text-foreground text-xs">
                            {hoveredConn.fromName.split(" ").slice(-1)[0]} ↔{" "}
                            {hoveredConn.toName.split(" ").slice(-1)[0]}:{" "}
                            <span className="text-primary">{hoveredConn.total} passes</span>
                        </p>
                    </div>
                )}

                {/* Tooltip — node */}
                {hoveredNodeId &&
                    !hoveredConn &&
                    (() => {
                        const node = playerNodes.find((n) => n.player.id === hoveredNodeId);
                        if (!node) return null;
                        return (
                            <div
                                className="absolute pointer-events-none z-50 px-3 py-2 rounded-lg bg-popover/95 backdrop-blur border border-border shadow-xl"
                                style={{
                                    left: tooltipPos.x,
                                    top: tooltipPos.y,
                                    transform: "translate(-50%, -100%)",
                                }}
                            >
                                <p className="font-semibold text-foreground text-xs">
                                    {node.player.name}{" "}
                                    <span className="text-muted-foreground">
                                        #{node.player.jerseyNumber}
                                    </span>
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    {node.player.position} • {node.passCount} passes •{" "}
                                    {node.player.team}
                                </p>
                            </div>
                        );
                    })()}
            </div>

            {/* Time controls */}
            <div className="flex flex-col gap-2">
                <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-medium text-muted-foreground">Time:</span>
                    <Button
                        variant={selectedInterval.category === "all" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedInterval(ALL_INTERVAL)}
                        className="h-7 px-3 text-xs"
                    >
                        Full Match
                    </Button>
                    <div className="flex items-center border border-border rounded-md overflow-hidden">
                        <Button
                            variant={intervalMode === "10min" ? "secondary" : "ghost"}
                            size="sm"
                            onClick={() => {
                                setIntervalMode("10min");
                                setSelectedInterval(ALL_INTERVAL);
                            }}
                            className="h-7 px-2 text-xs rounded-none border-0"
                        >
                            10 Min
                        </Button>
                        <div className="w-px h-5 bg-border" />
                        <Button
                            variant={intervalMode === "half" ? "secondary" : "ghost"}
                            size="sm"
                            onClick={() => {
                                setIntervalMode("half");
                                setSelectedInterval(ALL_INTERVAL);
                            }}
                            className="h-7 px-2 text-xs rounded-none border-0"
                        >
                            Halves
                        </Button>
                    </div>
                    {selectedPlayerIds.size > 0 && (
                        <button
                            onClick={clearSelection}
                            className="text-xs text-primary hover:underline ml-auto"
                        >
                            Clear filter
                        </button>
                    )}
                </div>
                <div className="flex flex-wrap gap-1">
                    {availableIntervals.map((interval) => (
                        <Button
                            key={interval.label}
                            variant={
                                selectedInterval.label === interval.label ? "default" : "outline"
                            }
                            size="sm"
                            onClick={() => setSelectedInterval(interval)}
                            className={cn(
                                "h-7 px-2 text-xs",
                                interval.category === "overtime" &&
                                    "border-warning/50 text-warning hover:bg-warning/10",
                            )}
                        >
                            {interval.label}
                        </Button>
                    ))}
                </div>
            </div>

            {/* Stats cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {(
                    [
                        { label: "Total", value: stats.total, color: "text-primary", statId: "total_passes" },
                        { label: "Successful", value: stats.successful, color: "text-success", statId: "total_passes" },
                        { label: "Accuracy", value: `${stats.accuracy}%`, color: "text-warning", statId: "pass_accuracy" },
                        { label: "Key Passes", value: stats.keyPasses, color: "text-destructive", statId: "key_passes" },
                    ] as const
                ).map((stat) => (
                    <div
                        key={stat.label}
                        className="text-center p-2.5 rounded-lg bg-secondary/50 border border-border"
                    >
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
