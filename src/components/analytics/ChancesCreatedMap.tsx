import { useState, useMemo, useId } from "react";
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

interface ChancesCreatedMapProps {
    events: MatchEvent[];
    playerName?: string;
    matchId?: string;
}

interface TimeInterval {
    label: string;
    start: number;
    end: number;
    category?: 'all' | '10min' | 'half' | 'overtime';
}

// Zone definitions (in percentage coordinates 0-100)
// Field is 105m x 68m, attacking towards right (x=100)
const ZONES = {
    // Vertical zones (X-axis - distance from goal)
    FINAL_THIRD_START: 66.67,  // Last third of the pitch
    EDGE_OF_BOX: 83,           // Edge of penalty area (~16.5m from goal line)
    BOX_START: 83,             // Penalty area starts
    SIX_YARD_START: 94.76,     // 6-yard box (~5.5m from goal line)
    
    // Horizontal zones (Y-axis - width of field)
    LEFT_WING_END: 30,         // Left wing zone (0-30%)
    CENTER_START: 30,          // Center zone starts
    CENTER_END: 70,            // Center zone ends
    RIGHT_WING_START: 70,      // Right wing zone (70-100%)
    
    // Box boundaries (Y-axis)
    BOX_Y_START: 21,           // Box y range (~13.84m from touchline)
    BOX_Y_END: 79,             // (~54.16m from touchline)
    
    // Corner zones
    CORNER_ZONE_X: 90,         // X threshold for corner zone
    CORNER_ZONE_Y_LEFT: 15,    // Y threshold for left corner
    CORNER_ZONE_Y_RIGHT: 85,   // Y threshold for right corner
};

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

const HALF_INTERVALS: TimeInterval[] = [
    { label: "1st Half", start: 0, end: 45, category: 'half' },
    { label: "2nd Half", start: 45, end: 90, category: 'half' },
    { label: "Extra Time", start: 90, end: 120, category: 'overtime' },
];

const ALL_INTERVAL: TimeInterval = { label: "Full Match", start: 0, end: 120, category: 'all' };

// Field dimensions for coordinate mapping
const PITCH_LENGTH = 105;
const PITCH_WIDTH = 68;

// Convert backend coordinates (0-100) to SVG field coordinates
const toSvgCoords = (backendX: number, backendY: number) => {
    const svgX = (backendX / 100) * PITCH_LENGTH;
    const svgY = (backendY / 100) * PITCH_WIDTH;
    return { x: svgX, y: svgY };
};

// Check if a point is in the final third
const isInFinalThird = (x: number) => x >= ZONES.FINAL_THIRD_START;

// Check if a point is in the box
const isInBox = (x: number, y: number) => 
    x >= ZONES.BOX_START && y >= ZONES.BOX_Y_START && y <= ZONES.BOX_Y_END;

// Check if a point is in the 6-yard box
const isInSixYardBox = (x: number, y: number) => 
    x >= ZONES.SIX_YARD_START && y >= 36 && y <= 64;

// Check if a point is in corner zone
const isInCornerZone = (x: number, y: number) => 
    x >= ZONES.CORNER_ZONE_X && (y <= ZONES.CORNER_ZONE_Y_LEFT || y >= ZONES.CORNER_ZONE_Y_RIGHT);

// Horizontal zone (width of field - Left/Center/Right)
type HorizontalZone = 'left_wing' | 'center' | 'right_wing';
const getHorizontalZone = (y: number): HorizontalZone => {
    if (y < ZONES.LEFT_WING_END) return 'left_wing';
    if (y > ZONES.RIGHT_WING_START) return 'right_wing';
    return 'center';
};

// Vertical zone (depth - distance from goal)
type VerticalZone = 'deep' | 'edge_of_box' | 'inside_box' | 'six_yard';
const getVerticalZone = (x: number, y: number): VerticalZone => {
    if (isInSixYardBox(x, y)) return 'six_yard';
    if (isInBox(x, y)) return 'inside_box';
    if (x >= ZONES.FINAL_THIRD_START) return 'edge_of_box';
    return 'deep';
};

// Chance type classification
type ChanceType = 'box_entry' | 'final_third_chance' | 'corner_zone';

interface ProcessedChance {
    type: ChanceType;
    event: MatchEvent;
    index: number;
    horizontalZone: HorizontalZone;
    verticalZone: VerticalZone;
    isCornerZone: boolean;
    isInBox: boolean;
    ledToShot: boolean;
    ledToGoal: boolean;
}

const ChancesCreatedMap = ({ events, playerName, matchId }: ChancesCreatedMapProps) => {
    const uniqueId = useId();
    const navigate = useNavigate();
    const [selectedInterval, setSelectedInterval] = useState<TimeInterval>(ALL_INTERVAL);
    const [intervalMode, setIntervalMode] = useState<'10min' | 'half'>('10min');
    const [selectedChance, setSelectedChance] = useState<number | null>(null);
    const [showHeatmap, setShowHeatmap] = useState(true);
    const [filterType, setFilterType] = useState<'all' | 'box_entry' | 'final_third' | 'corner'>('all');

    // Handle navigation to match video
    const handleGoToVideo = () => {
        if (matchId) {
            navigate(`/match/${matchId}#match-video`, { state: { from: 'chances' } });
        }
    };

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

    // Process events to identify chances created
    const processedChances = useMemo(() => {
        const chances: ProcessedChance[] = [];
        const passEvents = events.filter(e => e.type === 'pass');
        const shotEvents = events.filter(e => e.type === 'shot');

        passEvents.forEach((pass, index) => {
            // Filter by time interval
            if (pass.minute < selectedInterval.start || pass.minute >= selectedInterval.end) return;

            const endsInFinalThird = isInFinalThird(pass.targetX);
            const endsInBox = isInBox(pass.targetX, pass.targetY);
            const endsInCornerZone = isInCornerZone(pass.targetX, pass.targetY);
            const startsOutsideBox = !isInBox(pass.x, pass.y);
            
            // Check if this pass led to a shot (shot within same minute or next)
            const ledToShot = shotEvents.some(shot => 
                shot.minute >= pass.minute && shot.minute <= pass.minute + 1
            );
            
            // Check if led to goal
            const ledToGoal = shotEvents.some(shot => 
                shot.minute >= pass.minute && 
                shot.minute <= pass.minute + 1 && 
                (shot.isGoal || shot.shotOutcome === 'goal')
            );

            const horizontalZone = getHorizontalZone(pass.targetY);
            const verticalZone = getVerticalZone(pass.targetX, pass.targetY);

            // Corner Zone Chance
            if (endsInCornerZone && pass.success) {
                chances.push({
                    type: 'corner_zone',
                    event: pass,
                    index,
                    horizontalZone,
                    verticalZone,
                    isCornerZone: true,
                    isInBox: endsInBox,
                    ledToShot,
                    ledToGoal
                });
            }
            // Box Entry: Pass that enters the box from outside
            else if (endsInBox && startsOutsideBox && pass.success) {
                chances.push({
                    type: 'box_entry',
                    event: pass,
                    index,
                    horizontalZone,
                    verticalZone,
                    isCornerZone: false,
                    isInBox: true,
                    ledToShot,
                    ledToGoal
                });
            }
            // Final Third Chance: Progressive pass ending in final third
            else if (endsInFinalThird && pass.success && !endsInBox) {
                const isProgressive = pass.targetX - pass.x > 10;
                if (isProgressive || ledToShot) {
                    chances.push({
                        type: 'final_third_chance',
                        event: pass,
                        index,
                        horizontalZone,
                        verticalZone,
                        isCornerZone: false,
                        isInBox: false,
                        ledToShot,
                        ledToGoal
                    });
                }
            }
        });

        return chances;
    }, [events, selectedInterval]);

    // Filter chances by type
    const filteredChances = useMemo(() => {
        if (filterType === 'all') return processedChances;
        if (filterType === 'box_entry') return processedChances.filter(c => c.type === 'box_entry');
        if (filterType === 'corner') return processedChances.filter(c => c.type === 'corner_zone');
        return processedChances.filter(c => c.type === 'final_third_chance');
    }, [processedChances, filterType]);

    // Calculate stats
    const stats = useMemo(() => {
        const boxEntries = processedChances.filter(c => c.type === 'box_entry');
        const finalThirdChances = processedChances.filter(c => c.type === 'final_third_chance');
        const cornerZoneChances = processedChances.filter(c => c.type === 'corner_zone');
        const ledToShot = processedChances.filter(c => c.ledToShot);
        const ledToGoal = processedChances.filter(c => c.ledToGoal);
        
        // Horizontal zone breakdown (width)
        const leftWing = processedChances.filter(c => c.horizontalZone === 'left_wing').length;
        const center = processedChances.filter(c => c.horizontalZone === 'center').length;
        const rightWing = processedChances.filter(c => c.horizontalZone === 'right_wing').length;
        
        // Vertical zone breakdown (depth)
        const deep = processedChances.filter(c => c.verticalZone === 'deep').length;
        const edgeOfBox = processedChances.filter(c => c.verticalZone === 'edge_of_box').length;
        const insideBox = processedChances.filter(c => c.verticalZone === 'inside_box').length;
        const sixYard = processedChances.filter(c => c.verticalZone === 'six_yard').length;

        return {
            total: processedChances.length,
            boxEntries: boxEntries.length,
            finalThirdChances: finalThirdChances.length,
            cornerZoneChances: cornerZoneChances.length,
            ledToShot: ledToShot.length,
            ledToGoal: ledToGoal.length,
            conversionRate: processedChances.length > 0 
                ? Math.round((ledToShot.length / processedChances.length) * 100) 
                : 0,
            // Horizontal
            leftWing,
            center,
            rightWing,
            // Vertical
            deep,
            edgeOfBox,
            insideBox,
            sixYard
        };
    }, [processedChances]);

    // Calculate heatmap for final third
    const heatmapData = useMemo(() => {
        const gridCols = 6;
        const gridRows = 6;
        const zones: number[][] = Array(gridRows).fill(null).map(() => Array(gridCols).fill(0));

        filteredChances.forEach(chance => {
            const x = chance.event.targetX;
            const y = chance.event.targetY;
            
            if (x >= ZONES.FINAL_THIRD_START) {
                const normalizedX = (x - ZONES.FINAL_THIRD_START) / (100 - ZONES.FINAL_THIRD_START);
                const colIndex = Math.min(Math.floor(normalizedX * gridCols), gridCols - 1);
                const rowIndex = Math.min(Math.floor((y / 100) * gridRows), gridRows - 1);
                zones[rowIndex][colIndex]++;
            }
        });

        const maxIntensity = Math.max(...zones.flat(), 1);
        return { zones, maxIntensity, gridCols, gridRows };
    }, [filteredChances]);

    const getHeatmapColor = (intensity: number, max: number) => {
        if (max === 0 || intensity === 0) return "transparent";
        const normalized = intensity / max;
        if (normalized < 0.3) return `hsla(45, 100%, 50%, ${normalized * 1.2})`;
        if (normalized < 0.6) return `hsla(30, 100%, 50%, ${0.2 + normalized * 0.4})`;
        return `hsla(0, 80%, 50%, ${0.3 + normalized * 0.4})`;
    };

    const handleFieldClick = () => {
        setSelectedChance(null);
    };

    const selectedChanceData = selectedChance !== null 
        ? filteredChances.find(c => c.index === selectedChance) 
        : null;

    // Zone label helpers
    const getHorizontalZoneLabel = (zone: HorizontalZone) => {
        switch (zone) {
            case 'left_wing': return 'Left Wing';
            case 'center': return 'Center';
            case 'right_wing': return 'Right Wing';
        }
    };

    const getVerticalZoneLabel = (zone: VerticalZone) => {
        switch (zone) {
            case 'deep': return 'Deep';
            case 'edge_of_box': return 'Edge of Box';
            case 'inside_box': return 'Inside Box';
            case 'six_yard': return '6-Yard Box';
        }
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
                    
                    <div className="ml-auto flex items-center gap-3">
                        <div className="flex items-center gap-2">
                            <Switch id="show-heatmap" checked={showHeatmap} onCheckedChange={setShowHeatmap} />
                            <Label htmlFor="show-heatmap" className="text-xs">Heatmap</Label>
                        </div>
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

            {/* Filter Buttons */}
            <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-medium text-muted-foreground">Show:</span>
                <div className="flex items-center border border-border rounded-md overflow-hidden">
                    <Button
                        variant={filterType === 'all' ? "secondary" : "ghost"}
                        size="sm"
                        onClick={() => setFilterType('all')}
                        className="h-7 px-3 text-xs rounded-none border-0"
                    >
                        All
                    </Button>
                    <div className="w-px h-5 bg-border" />
                    <Button
                        variant={filterType === 'box_entry' ? "secondary" : "ghost"}
                        size="sm"
                        onClick={() => setFilterType('box_entry')}
                        className="h-7 px-3 text-xs rounded-none border-0"
                    >
                        Box Entries
                    </Button>
                    <div className="w-px h-5 bg-border" />
                    <Button
                        variant={filterType === 'final_third' ? "secondary" : "ghost"}
                        size="sm"
                        onClick={() => setFilterType('final_third')}
                        className="h-7 px-3 text-xs rounded-none border-0"
                    >
                        Final Third
                    </Button>
                    <div className="w-px h-5 bg-border" />
                    <Button
                        variant={filterType === 'corner' ? "secondary" : "ghost"}
                        size="sm"
                        onClick={() => setFilterType('corner')}
                        className="h-7 px-3 text-xs rounded-none border-0"
                    >
                        Corner Zones
                    </Button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-4 md:grid-cols-7 gap-2">
                {[
                    { label: "Total", value: stats.total, color: "text-primary" },
                    { label: "Box Entries", value: stats.boxEntries, color: "text-destructive" },
                    { label: "Final Third", value: stats.finalThirdChances, color: "text-warning" },
                    { label: "Corner Zones", value: stats.cornerZoneChances, color: "text-purple-500" },
                    { label: "Led to Shot", value: stats.ledToShot, color: "text-success" },
                    { label: "Led to Goal", value: stats.ledToGoal, color: "text-success" },
                    { label: "Conversion", value: `${stats.conversionRate}%`, color: "text-chart-4" },
                ].map((stat) => (
                    <div key={stat.label} className="text-center p-2 rounded-lg bg-secondary/50 border border-border">
                        <p className={cn("text-lg font-bold", stat.color)}>{stat.value}</p>
                        <p className="text-[9px] uppercase tracking-wide text-muted-foreground">{stat.label}</p>
                    </div>
                ))}
            </div>

            {/* Zone Breakdown - Two Rows */}
            <div className="space-y-2">
                {/* Horizontal Zones (Width - Left/Center/Right) */}
                <div className="bg-secondary/30 rounded-lg p-3">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2 font-medium">Width Zones (Where on the field)</p>
                    <div className="flex items-center justify-center gap-4 text-xs flex-wrap">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded bg-blue-500" />
                            <span className="text-muted-foreground">Left Wing: <span className="font-bold text-foreground">{stats.leftWing}</span></span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded bg-amber-500" />
                            <span className="text-muted-foreground">Center: <span className="font-bold text-foreground">{stats.center}</span></span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded bg-green-500" />
                            <span className="text-muted-foreground">Right Wing: <span className="font-bold text-foreground">{stats.rightWing}</span></span>
                        </div>
                    </div>
                </div>
                
                {/* Vertical Zones (Depth - Distance from goal) */}
                <div className="bg-secondary/30 rounded-lg p-3">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2 font-medium">Depth Zones (Distance from goal)</p>
                    <div className="flex items-center justify-center gap-4 text-xs flex-wrap">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded bg-slate-400" />
                            <span className="text-muted-foreground">Deep: <span className="font-bold text-foreground">{stats.deep}</span></span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded bg-orange-500" />
                            <span className="text-muted-foreground">Edge of Box: <span className="font-bold text-foreground">{stats.edgeOfBox}</span></span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded bg-red-500" />
                            <span className="text-muted-foreground">Inside Box: <span className="font-bold text-foreground">{stats.insideBox}</span></span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded bg-red-700" />
                            <span className="text-muted-foreground">6-Yard Box: <span className="font-bold text-foreground">{stats.sixYard}</span></span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Map */}
            <div 
                className="relative w-full max-w-4xl mx-auto rounded-xl overflow-hidden border border-border shadow-xl bg-muted/20 aspect-[105/68]"
                onClick={handleFieldClick}
            >
                <TacticalField viewMode="full" className="w-full h-full">
                    <defs>
                        {/* Arrow markers */}
                        <marker id={`arrow-box-${uniqueId}`} markerWidth="4" markerHeight="4" refX="3" refY="2" orient="auto">
                            <path d="M0,0.5 L3.5,2 L0,3.5 L1,2 Z" fill="hsl(0, 80%, 50%)" />
                        </marker>
                        <marker id={`arrow-final-${uniqueId}`} markerWidth="4" markerHeight="4" refX="3" refY="2" orient="auto">
                            <path d="M0,0.5 L3.5,2 L0,3.5 L1,2 Z" fill="hsl(38, 92%, 50%)" />
                        </marker>
                        <marker id={`arrow-corner-${uniqueId}`} markerWidth="4" markerHeight="4" refX="3" refY="2" orient="auto">
                            <path d="M0,0.5 L3.5,2 L0,3.5 L1,2 Z" fill="hsl(270, 70%, 60%)" />
                        </marker>
                        <marker id={`arrow-goal-${uniqueId}`} markerWidth="5" markerHeight="5" refX="4" refY="2.5" orient="auto">
                            <path d="M0,0.5 L4.5,2.5 L0,4.5 L1.2,2.5 Z" fill="hsl(142, 76%, 36%)" />
                        </marker>
                        <marker id={`arrow-highlight-${uniqueId}`} markerWidth="5" markerHeight="5" refX="4" refY="2.5" orient="auto">
                            <path d="M0,0.5 L4.5,2.5 L0,4.5 L1.2,2.5 Z" fill="hsl(217, 91%, 60%)" />
                        </marker>
                        
                        {/* Glow filters */}
                        <filter id={`glow-box-${uniqueId}`} x="-50%" y="-50%" width="200%" height="200%">
                            <feGaussianBlur stdDeviation="1.5" result="blur" />
                            <feFlood floodColor="hsl(0, 80%, 50%)" floodOpacity="0.6" />
                            <feComposite in2="blur" operator="in" />
                            <feMerge>
                                <feMergeNode />
                                <feMergeNode in="SourceGraphic" />
                            </feMerge>
                        </filter>
                        <filter id={`glow-goal-${uniqueId}`} x="-50%" y="-50%" width="200%" height="200%">
                            <feGaussianBlur stdDeviation="2" result="blur" />
                            <feFlood floodColor="hsl(142, 76%, 36%)" floodOpacity="0.8" />
                            <feComposite in2="blur" operator="in" />
                            <feMerge>
                                <feMergeNode />
                                <feMergeNode in="SourceGraphic" />
                            </feMerge>
                        </filter>
                    </defs>

                    {/* Zone Overlays */}
                    
                    {/* Horizontal Zone Dividers (width) - Dashed lines */}
                    {/* Left wing / Center divider at 30% */}
                    <line
                        x1={70}
                        y1={(ZONES.LEFT_WING_END / 100) * PITCH_WIDTH}
                        x2={105}
                        y2={(ZONES.LEFT_WING_END / 100) * PITCH_WIDTH}
                        stroke="rgba(255,255,255,0.2)"
                        strokeWidth={0.15}
                        strokeDasharray="1,1"
                    />
                    {/* Center / Right wing divider at 70% */}
                    <line
                        x1={70}
                        y1={(ZONES.RIGHT_WING_START / 100) * PITCH_WIDTH}
                        x2={105}
                        y2={(ZONES.RIGHT_WING_START / 100) * PITCH_WIDTH}
                        stroke="rgba(255,255,255,0.2)"
                        strokeWidth={0.15}
                        strokeDasharray="1,1"
                    />
                    
                    {/* Final Third Zone Highlight */}
                    <rect
                        x={70}
                        y={0}
                        width={35}
                        height={68}
                        fill="hsl(38, 92%, 50%)"
                        fillOpacity={0.05}
                        stroke="hsl(38, 92%, 50%)"
                        strokeWidth={0.2}
                        strokeOpacity={0.3}
                        strokeDasharray="2,2"
                    />
                    
                    {/* Corner Zone Highlights */}
                    {/* Top-left corner zone */}
                    <rect
                        x={(ZONES.CORNER_ZONE_X / 100) * PITCH_LENGTH}
                        y={0}
                        width={PITCH_LENGTH - (ZONES.CORNER_ZONE_X / 100) * PITCH_LENGTH}
                        height={(ZONES.CORNER_ZONE_Y_LEFT / 100) * PITCH_WIDTH}
                        fill="hsl(270, 70%, 60%)"
                        fillOpacity={0.1}
                        stroke="hsl(270, 70%, 60%)"
                        strokeWidth={0.2}
                        strokeOpacity={0.4}
                    />
                    {/* Bottom-right corner zone */}
                    <rect
                        x={(ZONES.CORNER_ZONE_X / 100) * PITCH_LENGTH}
                        y={(ZONES.CORNER_ZONE_Y_RIGHT / 100) * PITCH_WIDTH}
                        width={PITCH_LENGTH - (ZONES.CORNER_ZONE_X / 100) * PITCH_LENGTH}
                        height={PITCH_WIDTH - (ZONES.CORNER_ZONE_Y_RIGHT / 100) * PITCH_WIDTH}
                        fill="hsl(270, 70%, 60%)"
                        fillOpacity={0.1}
                        stroke="hsl(270, 70%, 60%)"
                        strokeWidth={0.2}
                        strokeOpacity={0.4}
                    />
                    
                    {/* Box Zone Highlight */}
                    <rect
                        x={88.5}
                        y={13.84}
                        width={16.5}
                        height={40.32}
                        fill="hsl(0, 80%, 50%)"
                        fillOpacity={0.08}
                        stroke="hsl(0, 80%, 50%)"
                        strokeWidth={0.2}
                        strokeOpacity={0.4}
                    />

                    {/* Heatmap Overlay */}
                    {showHeatmap && (
                        <g style={{ opacity: 0.6 }}>
                            {heatmapData.zones.map((row, rowIndex) =>
                                row.map((intensity, colIndex) => {
                                    const cellWidth = 35 / heatmapData.gridCols;
                                    const cellHeight = 68 / heatmapData.gridRows;
                                    return (
                                        <rect
                                            key={`hm-${rowIndex}-${colIndex}`}
                                            x={70 + colIndex * cellWidth}
                                            y={rowIndex * cellHeight}
                                            width={cellWidth}
                                            height={cellHeight}
                                            fill={getHeatmapColor(intensity, heatmapData.maxIntensity)}
                                            style={{ filter: intensity > 0 ? "blur(4px)" : "none" }}
                                        />
                                    );
                                })
                            )}
                        </g>
                    )}

                    {/* Zone Labels on Field */}
                    <text x={75} y={6} fontSize={2} fill="rgba(255,255,255,0.4)" fontWeight="500">LEFT WING</text>
                    <text x={75} y={35} fontSize={2} fill="rgba(255,255,255,0.4)" fontWeight="500">CENTER</text>
                    <text x={75} y={64} fontSize={2} fill="rgba(255,255,255,0.4)" fontWeight="500">RIGHT WING</text>
                    
                    {/* Corner zone labels */}
                    <text x={96} y={4} fontSize={1.5} fill="hsl(270, 70%, 60%)" fontWeight="500">CORNER</text>
                    <text x={96} y={66} fontSize={1.5} fill="hsl(270, 70%, 60%)" fontWeight="500">CORNER</text>

                    {/* Chance Lines and Markers */}
                    {filteredChances.map((chance, idx) => {
                        const { x: startX, y: startY } = toSvgCoords(chance.event.x, chance.event.y);
                        const { x: endX, y: endY } = toSvgCoords(chance.event.targetX, chance.event.targetY);
                        const isSelected = selectedChance === chance.index;
                        const isBoxEntry = chance.type === 'box_entry';
                        const isCornerZone = chance.type === 'corner_zone';
                        const ledToGoal = chance.ledToGoal;
                        
                        // Colors based on type and outcome
                        const lineColor = ledToGoal 
                            ? "hsl(142, 76%, 36%)" 
                            : isCornerZone
                                ? "hsl(270, 70%, 60%)"
                                : isBoxEntry 
                                    ? "hsl(0, 80%, 50%)" 
                                    : "hsl(38, 92%, 50%)";
                        
                        const arrowId = isSelected 
                            ? `arrow-highlight-${uniqueId}`
                            : ledToGoal 
                                ? `arrow-goal-${uniqueId}`
                                : isCornerZone
                                    ? `arrow-corner-${uniqueId}`
                                    : isBoxEntry 
                                        ? `arrow-box-${uniqueId}` 
                                        : `arrow-final-${uniqueId}`;

                        return (
                            <g 
                                key={`chance-${idx}`}
                                style={{ cursor: 'pointer' }}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedChance(isSelected ? null : chance.index);
                                }}
                            >
                                {/* Connection line */}
                                <line
                                    x1={startX}
                                    y1={startY}
                                    x2={endX - 1}
                                    y2={endY}
                                    stroke={isSelected ? "hsl(217, 91%, 60%)" : lineColor}
                                    strokeWidth={isSelected ? 0.6 : 0.4}
                                    strokeOpacity={isSelected ? 1 : (selectedChance !== null ? 0.2 : 0.7)}
                                    markerEnd={`url(#${arrowId})`}
                                />
                                
                                {/* Origin point */}
                                <circle
                                    cx={startX}
                                    cy={startY}
                                    r={isSelected ? 1.5 : 1}
                                    fill={isSelected ? "hsl(217, 91%, 60%)" : lineColor}
                                    fillOpacity={isSelected ? 1 : (selectedChance !== null ? 0.3 : 0.8)}
                                    stroke="white"
                                    strokeWidth={0.2}
                                />
                                
                                {/* End point */}
                                <circle
                                    cx={endX}
                                    cy={endY}
                                    r={isBoxEntry || isCornerZone ? (isSelected ? 2 : 1.5) : (isSelected ? 1.5 : 1)}
                                    fill={ledToGoal ? "hsl(142, 76%, 36%)" : (isSelected ? "hsl(217, 91%, 60%)" : lineColor)}
                                    fillOpacity={isSelected ? 1 : (selectedChance !== null ? 0.3 : 0.9)}
                                    stroke="white"
                                    strokeWidth={0.3}
                                    filter={ledToGoal ? `url(#glow-goal-${uniqueId})` : ((isBoxEntry || isCornerZone) && isSelected ? `url(#glow-box-${uniqueId})` : undefined)}
                                />
                                
                                {/* Goal indicator */}
                                {ledToGoal && (
                                    <text
                                        x={endX + 2}
                                        y={endY + 0.5}
                                        fontSize={2}
                                        fill="hsl(142, 76%, 36%)"
                                    >
                                        ⚽
                                    </text>
                                )}
                            </g>
                        );
                    })}
                </TacticalField>

                {/* Selected Chance Details Overlay */}
                <AnimatePresence>
                    {selectedChanceData && (
                        <motion.div
                            className="absolute top-4 right-4 bg-card/95 backdrop-blur-md border border-border rounded-xl p-4 z-30 shadow-xl min-w-[260px]"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                        >
                            <div className="flex items-center justify-between mb-3 pb-2 border-b border-border">
                                <span className="text-sm font-bold">Chance Details</span>
                                <Badge variant="secondary" className="text-xs">{selectedChanceData.event.minute}'</Badge>
                            </div>
                            <div className="space-y-2 text-xs">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Type</span>
                                    <Badge variant={
                                        selectedChanceData.type === 'box_entry' ? "destructive" : 
                                        selectedChanceData.type === 'corner_zone' ? "secondary" : "default"
                                    } className={selectedChanceData.type === 'corner_zone' ? "bg-purple-500/20 text-purple-400" : ""}>
                                        {selectedChanceData.type === 'box_entry' ? 'Box Entry' : 
                                         selectedChanceData.type === 'corner_zone' ? 'Corner Zone' : 'Final Third'}
                                    </Badge>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Width Zone</span>
                                    <span className="font-medium">{getHorizontalZoneLabel(selectedChanceData.horizontalZone)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Depth Zone</span>
                                    <span className="font-medium">{getVerticalZoneLabel(selectedChanceData.verticalZone)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Led to Shot</span>
                                    <Badge variant={selectedChanceData.ledToShot ? "default" : "secondary"}>
                                        {selectedChanceData.ledToShot ? 'Yes' : 'No'}
                                    </Badge>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Led to Goal</span>
                                    <Badge variant={selectedChanceData.ledToGoal ? "default" : "secondary"} className={selectedChanceData.ledToGoal ? "bg-success" : ""}>
                                        {selectedChanceData.ledToGoal ? 'Yes' : 'No'}
                                    </Badge>
                                </div>
                                {selectedChanceData.event.passTarget && (
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Receiver</span>
                                        <span className="font-medium">{selectedChanceData.event.passTarget}</span>
                                    </div>
                                )}
                                
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
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap items-center justify-center gap-4 text-xs py-3 bg-secondary/30 rounded-lg px-4">
                <div className="flex items-center gap-2">
                    <svg width="24" height="16" viewBox="0 0 24 16">
                        <circle cx="4" cy="8" r="3" fill="hsl(0, 80%, 50%)" stroke="white" strokeWidth="0.5" />
                        <line x1="7" y1="8" x2="20" y2="8" stroke="hsl(0, 80%, 50%)" strokeWidth="1.5" />
                    </svg>
                    <span className="text-muted-foreground">Box Entry</span>
                </div>
                <div className="flex items-center gap-2">
                    <svg width="24" height="16" viewBox="0 0 24 16">
                        <circle cx="4" cy="8" r="3" fill="hsl(38, 92%, 50%)" stroke="white" strokeWidth="0.5" />
                        <line x1="7" y1="8" x2="20" y2="8" stroke="hsl(38, 92%, 50%)" strokeWidth="1.5" />
                    </svg>
                    <span className="text-muted-foreground">Final Third</span>
                </div>
                <div className="flex items-center gap-2">
                    <svg width="24" height="16" viewBox="0 0 24 16">
                        <circle cx="4" cy="8" r="3" fill="hsl(270, 70%, 60%)" stroke="white" strokeWidth="0.5" />
                        <line x1="7" y1="8" x2="20" y2="8" stroke="hsl(270, 70%, 60%)" strokeWidth="1.5" />
                    </svg>
                    <span className="text-muted-foreground">Corner Zone</span>
                </div>
                <div className="flex items-center gap-2">
                    <svg width="24" height="16" viewBox="0 0 24 16">
                        <circle cx="4" cy="8" r="3" fill="hsl(142, 76%, 36%)" stroke="white" strokeWidth="0.5" />
                        <line x1="7" y1="8" x2="20" y2="8" stroke="hsl(142, 76%, 36%)" strokeWidth="1.5" />
                    </svg>
                    <span className="text-muted-foreground">Led to Goal</span>
                </div>
                <div className="flex items-center gap-2 border-l border-border pl-4">
                    <div className="w-4 h-4 rounded bg-gradient-to-r from-yellow-500/50 to-red-500/50" />
                    <span className="text-muted-foreground">Heatmap</span>
                </div>
            </div>
        </div>
    );
};

export default ChancesCreatedMap;
