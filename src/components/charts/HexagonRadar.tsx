import { useMemo } from 'react';
import { motion } from 'framer-motion';

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

const HexagonRadar = ({
    data,
    teamName = "Team",
    opponentName = "Opponent",
    size = 320,
}: HexagonRadarProps) => {
    const center = size / 2;
    const radius = (size / 2) - 55; // More padding for labels
    const levels = 5;

    // Calculate points on the hexagon
    const getHexagonPoints = (radiusMultiplier: number) => {
        const points: { x: number; y: number }[] = [];
        for (let i = 0; i < 6; i++) {
            const angle = (Math.PI / 3) * i - Math.PI / 2;
            points.push({
                x: center + radiusMultiplier * Math.cos(angle),
                y: center + radiusMultiplier * Math.sin(angle),
            });
        }
        return points;
    };

    // Generate hexagon path
    const getHexagonPath = (radiusMultiplier: number) => {
        const points = getHexagonPoints(radiusMultiplier);
        return points.map((p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`)).join(' ') + ' Z';
    };

    // Calculate data points for team and opponent
    const { teamPoints, opponentPoints, labelPositions } = useMemo(() => {
        const teamPts: { x: number; y: number }[] = [];
        const oppPts: { x: number; y: number }[] = [];
        const labels: { x: number; y: number; label: string; fullLabel: string; angle: number; value: { team: number; opp: number } }[] = [];

        data.forEach((item, i) => {
            const angle = (Math.PI / 3) * i - Math.PI / 2;
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

            // Position labels further out with better spacing
            const labelRadius = radius + 45;
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

    return (
        <div className="relative flex flex-col items-center">
            <svg width={size} height={size} className="mx-auto">
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

                {/* Background hexagon levels with gradient fill */}
                {Array.from({ length: levels }, (_, i) => (
                    <path
                        key={i}
                        d={getHexagonPath(radius * ((i + 1) / levels))}
                        fill={i === levels - 1 ? "hsl(var(--secondary) / 0.3)" : "none"}
                        stroke="hsl(var(--border))"
                        strokeWidth={i === levels - 1 ? 1.5 : 0.7}
                        opacity={0.4 + (i * 0.1)}
                        strokeDasharray={i < levels - 1 ? "4,4" : "none"}
                    />
                ))}

                {/* Axis lines with dots at ends */}
                {getHexagonPoints(radius).map((point, i) => (
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

                {/* Data point dots - Opponent */}
                {opponentPoints.map((point, i) => (
                    <motion.circle
                        key={`opp-${i}`}
                        cx={point.x}
                        cy={point.y}
                        r={5}
                        fill="hsl(var(--background))"
                        stroke="hsl(var(--muted-foreground))"
                        strokeWidth={2}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.3, delay: 0.5 + i * 0.08 }}
                    />
                ))}

                {/* Data point dots - Team with glow */}
                {teamPoints.map((point, i) => (
                    <motion.g key={`team-${i}`}>
                        <motion.circle
                            cx={point.x}
                            cy={point.y}
                            r={8}
                            fill="hsl(var(--primary))"
                            opacity={0.3}
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ duration: 0.3, delay: 0.6 + i * 0.08 }}
                        />
                        <motion.circle
                            cx={point.x}
                            cy={point.y}
                            r={5}
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
                    const textAnchor =
                        label.angle === 0 ? 'middle' :
                            label.angle === 1 || label.angle === 2 ? 'start' :
                                label.angle === 3 ? 'middle' : 'end';

                    // Better dy offset
                    const dy =
                        label.angle === 0 ? -8 :
                            label.angle === 3 ? 16 : 4;

                    return (
                        <g key={i}>
                            <text
                                x={label.x}
                                y={label.y + dy}
                                textAnchor={textAnchor}
                                className="fill-foreground text-[11px] font-semibold"
                            >
                                {label.label}
                            </text>
                            <text
                                x={label.x}
                                y={label.y + dy + 12}
                                textAnchor={textAnchor}
                                className="fill-primary text-[10px] font-bold"
                            >
                                {label.value.team}%
                            </text>
                        </g>
                    );
                })}
            </svg>

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
