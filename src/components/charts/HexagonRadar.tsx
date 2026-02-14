import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface HexagonRadarProps {
    data: {
        label: string;
        fullLabel?: string;
        teamValue: number;
        opponentValue: number;
        maxValue: number;
    }[];
    teamName?: string;
    opponentName?: string;
    size?: number;
}

interface HoverInfo {
    index: number;
    type: 'team' | 'opponent';
    x: number;
    y: number;
    label: string;
    value: number;
    teamName: string;
}

const HexagonRadar = ({
    data,
    teamName = "Team",
    opponentName = "Opponent",
    size = 320,
}: HexagonRadarProps) => {
    const [hoverInfo, setHoverInfo] = useState<HoverInfo | null>(null);
    const center = size / 2;
    const radius = (size / 2) - 45; // Reduced padding for closer labels
    const levels = 5;

    const sides = data.length;
    const angleStep = (2 * Math.PI) / sides;

    // Calculate points on the polygon
    const getPolygonPoints = (radiusMultiplier: number) => {
        const points: { x: number; y: number }[] = [];
        for (let i = 0; i < sides; i++) {
            const angle = angleStep * i - Math.PI / 2;
            points.push({
                x: center + radiusMultiplier * Math.cos(angle),
                y: center + radiusMultiplier * Math.sin(angle),
            });
        }
        return points;
    };

    // Generate polygon path
    const getPolygonPath = (radiusMultiplier: number) => {
        const points = getPolygonPoints(radiusMultiplier);
        return points.map((p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`)).join(' ') + ' Z';
    };

    // Calculate data points for team and opponent
    const { teamPoints, opponentPoints, labelPositions } = useMemo(() => {
        const teamPts: { x: number; y: number }[] = [];
        const oppPts: { x: number; y: number }[] = [];
        const labels: { x: number; y: number; label: string; fullLabel: string; angle: number; value: { team: number; opp: number } }[] = [];

        data.forEach((item, i) => {
            const angle = angleStep * i - Math.PI / 2;
            const teamNormalized = item.maxValue > 0 ? Math.min(1, item.teamValue / item.maxValue) : 0;
            const oppNormalized = item.maxValue > 0 ? Math.min(1, item.opponentValue / item.maxValue) : 0;

            teamPts.push({
                x: center + radius * teamNormalized * Math.cos(angle),
                y: center + radius * teamNormalized * Math.sin(angle),
            });

            oppPts.push({
                x: center + radius * oppNormalized * Math.cos(angle),
                y: center + radius * oppNormalized * Math.sin(angle),
            });

            // Position labels closer to the graph
            const labelRadius = radius + 32; // Increased for larger text
            labels.push({
                x: center + labelRadius * Math.cos(angle),
                y: center + labelRadius * Math.sin(angle),
                label: item.label,
                fullLabel: item.fullLabel || item.label,
                angle: i,
                value: { team: item.teamValue, opp: item.opponentValue },
            });
        });

        return { teamPoints: teamPts, opponentPoints: oppPts, labelPositions: labels };
    }, [data, center, radius]);

    const teamPath = teamPoints.map((p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`)).join(' ') + ' Z';
    const opponentPath = opponentPoints.map((p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`)).join(' ') + ' Z';

    const handleTeamHover = (index: number, point: { x: number; y: number }) => {
        setHoverInfo({
            index,
            type: 'team',
            x: point.x,
            y: point.y,
            label: data[index].label,
            value: data[index].teamValue,
            teamName: teamName,
        });
    };

    const handleOpponentHover = (index: number, point: { x: number; y: number }) => {
        setHoverInfo({
            index,
            type: 'opponent',
            x: point.x,
            y: point.y,
            label: data[index].label,
            value: data[index].opponentValue,
            teamName: opponentName,
        });
    };

    return (
        <div className="relative flex flex-col items-center">
            <svg width={size} height={size} className="mx-auto overflow-visible">
                {/* Defs for gradients and filters */}
                <defs>
                    <linearGradient id="teamGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                        <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0.15} />
                    </linearGradient>
                    <linearGradient id="oppGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="hsl(var(--muted-foreground))" stopOpacity={0.25} />
                        <stop offset="100%" stopColor="hsl(var(--muted-foreground))" stopOpacity={0.08} />
                    </linearGradient>
                    <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                        <feGaussianBlur stdDeviation="2" result="blur" />
                        <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>
                </defs>

                {/* Background polygon levels with gradient fill */}
                {Array.from({ length: levels }, (_, i) => (
                    <path
                        key={i}
                        d={getPolygonPath(radius * ((i + 1) / levels))}
                        fill={i === levels - 1 ? "hsl(var(--secondary) / 0.3)" : "none"}
                        stroke="hsl(var(--border))"
                        strokeWidth={i === levels - 1 ? 1.5 : 0.7}
                        opacity={0.4 + (i * 0.1)}
                        strokeDasharray={i < levels - 1 ? "4,4" : "none"}
                    />
                ))}

                {/* Axis lines with dots at ends */}
                {getPolygonPoints(radius).map((point, i) => (
                    <g key={i}>
                        <line
                            x1={center}
                            y1={center}
                            x2={point.x}
                            y2={point.y}
                            stroke="hsl(var(--border))"
                            strokeWidth={0.7}
                            opacity={0.5}
                        />
                        <circle
                            cx={point.x}
                            cy={point.y}
                            r={2}
                            fill="hsl(var(--border))"
                            opacity={0.6}
                        />
                    </g>
                ))}

                {/* Center point */}
                <circle
                    cx={center}
                    cy={center}
                    r={3}
                    fill="hsl(var(--muted-foreground))"
                    opacity={0.5}
                />

                {/* Opponent data polygon */}
                <motion.path
                    d={opponentPath}
                    fill="url(#oppGradient)"
                    stroke="hsl(var(--muted-foreground))"
                    strokeWidth={2}
                    strokeLinejoin="round"
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
                />

                {/* Team data polygon with glow */}
                <motion.path
                    d={teamPath}
                    fill="url(#teamGradient)"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2.5}
                    strokeLinejoin="round"
                    filter="url(#glow)"
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
                />

                {/* Data point dots - Opponent (interactive) */}
                {opponentPoints.map((point, i) => (
                    <motion.g
                        key={`opp-${i}`}
                        onMouseEnter={() => handleOpponentHover(i, point)}
                        onMouseLeave={() => setHoverInfo(null)}
                        style={{ cursor: 'pointer' }}
                    >
                        {/* Hover hitbox (larger invisible circle) */}
                        <circle
                            cx={point.x}
                            cy={point.y}
                            r={12}
                            fill="transparent"
                        />
                        <motion.circle
                            cx={point.x}
                            cy={point.y}
                            r={hoverInfo?.type === 'opponent' && hoverInfo?.index === i ? 7 : 5}
                            fill="hsl(var(--background))"
                            stroke="hsl(var(--muted-foreground))"
                            strokeWidth={2}
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ duration: 0.3, delay: 0.5 + i * 0.08 }}
                        />
                    </motion.g>
                ))}

                {/* Data point dots - Team with glow (interactive) */}
                {teamPoints.map((point, i) => (
                    <motion.g
                        key={`team-${i}`}
                        onMouseEnter={() => handleTeamHover(i, point)}
                        onMouseLeave={() => setHoverInfo(null)}
                        style={{ cursor: 'pointer' }}
                    >
                        {/* Hover hitbox (larger invisible circle) */}
                        <circle
                            cx={point.x}
                            cy={point.y}
                            r={14}
                            fill="transparent"
                        />
                        <motion.circle
                            cx={point.x}
                            cy={point.y}
                            r={hoverInfo?.type === 'team' && hoverInfo?.index === i ? 10 : 8}
                            fill="hsl(var(--primary))"
                            opacity={0.3}
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ duration: 0.3, delay: 0.6 + i * 0.08 }}
                        />
                        <motion.circle
                            cx={point.x}
                            cy={point.y}
                            r={hoverInfo?.type === 'team' && hoverInfo?.index === i ? 7 : 5}
                            fill="hsl(var(--primary))"
                            stroke="hsl(var(--background))"
                            strokeWidth={2}
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ duration: 0.3, delay: 0.6 + i * 0.08 }}
                        />
                    </motion.g>
                ))}

                {/* Labels with values */}
                {labelPositions.map((label, i) => {
                    // Better text anchor based on angle position
                    // Dynamic text anchor based on angle position relative to sides
                    const angleRad = angleStep * label.angle - Math.PI / 2;
                    const angleDeg = ((angleRad * 180 / Math.PI) + 360) % 360;
                    const textAnchor =
                        (angleDeg > 45 && angleDeg < 135) ? 'start' :
                            (angleDeg > 225 && angleDeg < 315) ? 'end' : 'middle';

                    // Better dy offset - reduced spacing
                    const dy =
                        (angleDeg > 350 || angleDeg < 10) ? -8 :
                            (angleDeg > 170 && angleDeg < 190) ? 14 : 3;

                    return (
                        <g key={i}>
                            <text
                                x={label.x}
                                y={label.y + dy}
                                textAnchor={textAnchor}
                                className="fill-foreground text-xs font-bold"
                            >
                                {label.label}
                            </text>
                            <text
                                x={label.x}
                                y={label.y + dy + 14}
                                textAnchor={textAnchor}
                                className="fill-primary text-sm font-bold"
                            >
                                {label.value.team}%
                            </text>
                        </g>
                    );
                })}
            </svg>

            {/* Hover Tooltip */}
            <AnimatePresence>
                {hoverInfo && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8, y: 5 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8, y: 5 }}
                        transition={{ duration: 0.15 }}
                        className="absolute pointer-events-none z-10 px-3 py-2 rounded-lg shadow-lg border border-border"
                        style={{
                            left: hoverInfo.x,
                            top: hoverInfo.y - 50,
                            transform: 'translateX(-50%)',
                            backgroundColor: hoverInfo.type === 'team'
                                ? 'hsl(var(--primary) / 0.95)'
                                : 'hsl(var(--secondary))',
                        }}
                    >
                        <p className={`text-[10px] font-medium ${hoverInfo.type === 'team' ? 'text-primary-foreground' : 'text-foreground'}`}>
                            {hoverInfo.teamName}
                        </p>
                        <p className={`text-sm font-bold ${hoverInfo.type === 'team' ? 'text-primary-foreground' : 'text-foreground'}`}>
                            {hoverInfo.label}: {hoverInfo.value}%
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Legend - Improved styling */}
            <div className="flex items-center justify-center gap-8 mt-2 px-4 py-2 rounded-lg bg-secondary/30">
                <div className="flex items-center gap-2">
                    <div className="w-3.5 h-3.5 rounded-full bg-primary shadow-md shadow-primary/30" />
                    <span className="text-xs text-foreground font-medium">{teamName}</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3.5 h-3.5 rounded-full bg-muted-foreground/60" />
                    <span className="text-xs text-muted-foreground">{opponentName}</span>
                </div>
            </div>
        </div>
    );
};

export default HexagonRadar;
