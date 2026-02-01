import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { MatchEvent } from "@/types/player";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Video } from "lucide-react";
import TacticalField from "@/components/field/TacticalField";
import { StatHint } from "@/components/ui/stat-hint";

interface ShotMapProps {
    events: MatchEvent[];
    matchId?: string; // For video link navigation
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

// Goal dimensions (standard goal is 7.32m wide, centered on the goal line)
const GOAL_WIDTH = 7.32;
const GOAL_HEIGHT = 2.44; // For 3D representation if needed
const GOAL_Y_START = (PITCH_WIDTH - GOAL_WIDTH) / 2; // ~30.34
const GOAL_Y_END = GOAL_Y_START + GOAL_WIDTH; // ~37.66

// Calculate where the shot trajectory intersects the goal line
const calculateGoalLineIntersection = (shotX: number, shotY: number, targetX: number, targetY: number) => {
    // If target is already at or past the goal line, use target
    if (targetX >= PITCH_LENGTH) {
        return { x: PITCH_LENGTH, y: targetY };
    }
    
    // Calculate the trajectory to the goal line (x = 105)
    const dx = targetX - shotX;
    const dy = targetY - shotY;
    
    if (dx <= 0) {
        // Shot going backwards or sideways, just point to goal center
        return { x: PITCH_LENGTH, y: PITCH_WIDTH / 2 };
    }
    
    // Find where the line from shot to target intersects x = PITCH_LENGTH
    const t = (PITCH_LENGTH - shotX) / dx;
    const intersectY = shotY + t * dy;
    
    return { x: PITCH_LENGTH, y: Math.max(0, Math.min(PITCH_WIDTH, intersectY)) };
};

const ShotMap = ({ events, matchId }: ShotMapProps) => {
    const navigate = useNavigate();
    const [selectedInterval, setSelectedInterval] = useState<TimeInterval>(ALL_INTERVAL);
    const [intervalMode, setIntervalMode] = useState<'10min' | 'half'>('10min');
    const [selectedShot, setSelectedShot] = useState<number | null>(null);
    const [showXG, setShowXG] = useState(true);
    
    // Handle navigation to match video
    const handleGoToVideo = () => {
        if (matchId) {
            navigate(`/match/${matchId}#match-video`, { state: { from: 'shots' } });
        }
    };

    // Filter shots only
    const shotEvents = useMemo(() => {
        return events
            .map((e, originalIndex) => ({ ...e, originalIndex }))
            .filter(e => e.type === "shot");
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
                    
                    <div className="ml-auto flex items-center gap-2">
                        <Switch id="show-xg" checked={showXG} onCheckedChange={setShowXG} />
                        <Label htmlFor="show-xg" className="text-xs">Show xG</Label>
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

            {/* Stats Cards */}
            <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
                {[
                    { label: "Shots", value: stats.total, color: "text-primary", statId: "shots" },
                    { label: "On Target", value: stats.onTarget, color: "text-warning", statId: "shots_on_target" },
                    { label: "Goals", value: stats.goals, color: "text-success", statId: "goals" },
                    { label: "Accuracy", value: `${stats.accuracy}%`, color: "text-success", statId: "shot_conversion" },
                    { label: "xG", value: stats.totalXG.toFixed(2), color: "text-primary", statId: "xg" },
                ].map((stat) => (
                    <div key={stat.label} className="text-center p-3 rounded-lg bg-secondary/50 border border-border">
                        <p className={cn("text-lg font-bold", stat.color)}>{stat.value}</p>
                        <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                            <StatHint statId={stat.statId} iconSize="sm">
                                <span>{stat.label}</span>
                            </StatHint>
                        </p>
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
                    {/* Marker definitions */}
                    <defs>
                        {/* Arrow for goal */}
                        <marker
                            id="shot-arrow-goal"
                            markerWidth="4"
                            markerHeight="4"
                            refX="3"
                            refY="2"
                            orient="auto"
                        >
                            <path d="M0,0.5 L3.5,2 L0,3.5 L1,2 Z" fill="hsl(142, 76%, 36%)" />
                        </marker>
                        {/* Arrow for on target (saved) */}
                        <marker
                            id="shot-arrow-saved"
                            markerWidth="4"
                            markerHeight="4"
                            refX="3"
                            refY="2"
                            orient="auto"
                        >
                            <path d="M0,0.5 L3.5,2 L0,3.5 L1,2 Z" fill="hsl(38, 92%, 50%)" />
                        </marker>
                        {/* Arrow for missed */}
                        <marker
                            id="shot-arrow-missed"
                            markerWidth="4"
                            markerHeight="4"
                            refX="3"
                            refY="2"
                            orient="auto"
                        >
                            <path d="M0,0.5 L3.5,2 L0,3.5 L1,2 Z" fill="hsl(var(--destructive))" />
                        </marker>
                        {/* Glow filter for goals */}
                        <filter id="goal-glow" x="-50%" y="-50%" width="200%" height="200%">
                            <feGaussianBlur stdDeviation="1.5" result="blur" />
                            <feFlood floodColor="hsl(142, 76%, 36%)" floodOpacity="0.6" />
                            <feComposite in2="blur" operator="in" />
                            <feMerge>
                                <feMergeNode />
                                <feMergeNode in="SourceGraphic" />
                            </feMerge>
                        </filter>
                    </defs>

                    {/* Goal area highlight */}
                    <rect
                        x={PITCH_LENGTH - 0.5}
                        y={GOAL_Y_START}
                        width={0.5}
                        height={GOAL_WIDTH}
                        fill="white"
                        fillOpacity={0.3}
                    />

                    {/* Shot Markers */}
                    {filteredShots.map((shot, index) => {
                        // Convert backend coords (0-100) to SVG coords
                        const { x: svgX, y: svgY } = toSvgCoords(shot.x, shot.y);
                        const { x: targetSvgX, y: targetSvgY } = toSvgCoords(shot.targetX, shot.targetY);
                        const shotXG = shot.xG || calculateXG(shot.x, shot.y);
                        const shotStyle = getShotStyle(shot);
                        const isSelected = selectedShot === shot.originalIndex;
                        const isGoal = shot.isGoal || shot.shotOutcome === 'goal';
                        const isOnTarget = shot.success || shot.shotOutcome === 'saved' || isGoal;

                        // Circle radius
                        const radius = 1.2;

                        // Calculate where shot intersects goal line
                        const goalIntersection = calculateGoalLineIntersection(svgX, svgY, targetSvgX, targetSvgY);
                        
                        // Determine end point: for goals/on-target use goal line intersection, for missed use target
                        const endX = isOnTarget ? goalIntersection.x : Math.min(targetSvgX, PITCH_LENGTH);
                        const endY = isOnTarget ? goalIntersection.y : targetSvgY;
                        
                        // Check if shot is within goal posts
                        const isWithinGoal = endY >= GOAL_Y_START && endY <= GOAL_Y_END;
                        
                        // Get line color based on outcome
                        const lineColor = isGoal 
                            ? "hsl(142, 76%, 36%)" // Green for goal
                            : isOnTarget 
                                ? "hsl(38, 92%, 50%)" // Orange/yellow for saved
                                : "hsl(var(--destructive))"; // Red for missed
                        
                        const arrowId = isGoal 
                            ? "shot-arrow-goal" 
                            : isOnTarget 
                                ? "shot-arrow-saved" 
                                : "shot-arrow-missed";

                        return (
                            <g
                                key={`shot-${index}`}
                                style={{ cursor: 'pointer' }}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedShot(isSelected ? null : shot.originalIndex);
                                }}
                            >
                                {/* Full trajectory line from shot to goal/target */}
                                <line
                                    x1={svgX}
                                    y1={svgY}
                                    x2={endX - 1} // Slightly before end for arrow
                                    y2={endY}
                                    stroke={lineColor}
                                    strokeWidth={isSelected ? 0.6 : 0.4}
                                    strokeOpacity={isSelected ? 1 : 0.7}
                                    strokeDasharray={isGoal ? "none" : isOnTarget ? "none" : "1.5,0.8"}
                                    markerEnd={`url(#${arrowId})`}
                                />

                                {/* End point marker at goal line */}
                                {isOnTarget && (
                                    <g>
                                        {/* Impact point on goal line */}
                                        <circle
                                            cx={PITCH_LENGTH}
                                            cy={endY}
                                            r={isGoal ? 1 : 0.7}
                                            fill={isGoal ? "hsl(142, 76%, 36%)" : "hsl(38, 92%, 50%)"}
                                            fillOpacity={0.9}
                                            stroke="white"
                                            strokeWidth={0.2}
                                            filter={isGoal ? "url(#goal-glow)" : undefined}
                                        />
                                        {/* Show if within goal posts */}
                                        {isGoal && isWithinGoal && (
                                            <text
                                                x={PITCH_LENGTH + 1.5}
                                                y={endY + 0.4}
                                                fontSize={1.5}
                                                fill="hsl(142, 76%, 36%)"
                                                fontWeight="bold"
                                            >
                                                ⚽
                                            </text>
                                        )}
                                    </g>
                                )}
                                
                                {/* End point for missed shots */}
                                {!isOnTarget && (
                                    <circle
                                        cx={endX}
                                        cy={endY}
                                        r={0.5}
                                        fill="hsl(var(--destructive))"
                                        fillOpacity={0.6}
                                        stroke="white"
                                        strokeWidth={0.15}
                                    />
                                )}

                                {/* Shot origin marker */}
                                <g transform={`translate(${svgX}, ${svgY})`}>
                                    {/* Selection ring */}
                                    {isSelected && (
                                        <circle
                                            r={radius + 1}
                                            fill="none"
                                            stroke="white"
                                            strokeWidth={0.4}
                                            opacity={0.9}
                                        />
                                    )}

                                    {/* Shot visualization based on outcome */}
                                    {shotStyle.type === 'goal' ? (
                                        /* Goal: Filled green circle */
                                        <circle
                                            r={radius}
                                            fill="hsl(142, 76%, 36%)"
                                            fillOpacity={0.9}
                                            stroke="white"
                                            strokeWidth={0.3}
                                            filter="url(#goal-glow)"
                                        />
                                    ) : shotStyle.type === 'onTarget' ? (
                                        /* On Target: Orange/yellow circle */
                                        <circle
                                            r={radius}
                                            fill="hsl(38, 92%, 50%)"
                                            fillOpacity={0.8}
                                            stroke="white"
                                            strokeWidth={0.3}
                                        />
                                    ) : (
                                        /* Missed shot: Red unfilled circle */
                                        <circle
                                            r={radius}
                                            fill="transparent"
                                            stroke="hsl(var(--destructive))"
                                            strokeWidth={0.4}
                                        />
                                    )}

                                    {/* xG label */}
                                    {showXG && (
                                        <g transform={`translate(0, ${-radius - 1.5})`}>
                                            <rect
                                                x={-3}
                                                y={-1}
                                                width={6}
                                                height={2}
                                                rx={0.4}
                                                fill="rgba(0,0,0,0.8)"
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
                                            
                                            {/* Go to Video Button */}
                                            {matchId && (
                                                <div className="pt-3 mt-3 border-t border-border">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleGoToVideo();
                                                        }}
                                                        className="w-full flex items-center justify-center gap-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
                                                    >
                                                        <Video className="w-4 h-4" />
                                                        Go to Video
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    </>
                                );
                            })()}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm py-2 bg-secondary/30 rounded-lg px-4">
                <div className="flex items-center gap-2">
                    <svg width="24" height="20" viewBox="0 0 24 20">
                        <circle cx="6" cy="10" r="4" fill="hsl(142, 76%, 36%)" stroke="white" strokeWidth="1" />
                        <line x1="10" y1="10" x2="22" y2="10" stroke="hsl(142, 76%, 36%)" strokeWidth="1.5" />
                    </svg>
                    <span className="text-muted-foreground">Goal</span>
                </div>
                <div className="flex items-center gap-2">
                    <svg width="24" height="20" viewBox="0 0 24 20">
                        <circle cx="6" cy="10" r="4" fill="hsl(38, 92%, 50%)" stroke="white" strokeWidth="1" />
                        <line x1="10" y1="10" x2="22" y2="10" stroke="hsl(38, 92%, 50%)" strokeWidth="1.5" />
                    </svg>
                    <span className="text-muted-foreground">Saved</span>
                </div>
                <div className="flex items-center gap-2">
                    <svg width="24" height="20" viewBox="0 0 24 20">
                        <circle cx="6" cy="10" r="4" fill="transparent" stroke="hsl(var(--destructive))" strokeWidth="1.5" />
                        <line x1="10" y1="10" x2="22" y2="10" stroke="hsl(var(--destructive))" strokeWidth="1.5" strokeDasharray="3,2" />
                    </svg>
                    <span className="text-muted-foreground">Missed</span>
                </div>
                <div className="flex items-center gap-2 border-l border-border pl-4">
                    <div className="w-1 h-4 bg-white/30 rounded" />
                    <span className="text-muted-foreground text-xs">Goal Posts</span>
                </div>
            </div>
        </div>
    );
};

export default ShotMap;
