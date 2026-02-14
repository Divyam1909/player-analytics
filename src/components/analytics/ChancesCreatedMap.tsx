import { useState, useMemo, useId } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { MatchEvent } from "@/types/player";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Video } from "lucide-react";

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
const ZONES = {
    FINAL_THIRD_START: 66.67,
    EDGE_OF_BOX: 83,
    BOX_START: 83,
    SIX_YARD_START: 94.76,
    LEFT_WING_END: 30,
    CENTER_START: 30,
    CENTER_END: 70,
    RIGHT_WING_START: 70,
    BOX_Y_START: 21,
    BOX_Y_END: 79,
    CORNER_ZONE_X: 90,
    CORNER_ZONE_Y_LEFT: 15,
    CORNER_ZONE_Y_RIGHT: 85,
};

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

// Helper functions
const isInFinalThird = (x: number) => x >= ZONES.FINAL_THIRD_START;
const isInBox = (x: number, y: number) =>
    x >= ZONES.BOX_START && y >= ZONES.BOX_Y_START && y <= ZONES.BOX_Y_END;
const isInSixYardBox = (x: number, y: number) =>
    x >= ZONES.SIX_YARD_START && y >= 36 && y <= 64;
const isInCornerZone = (x: number, y: number) =>
    x >= ZONES.CORNER_ZONE_X && (y <= ZONES.CORNER_ZONE_Y_LEFT || y >= ZONES.CORNER_ZONE_Y_RIGHT);

type HorizontalZone = 'left_wing' | 'center' | 'right_wing';
const getHorizontalZone = (y: number): HorizontalZone => {
    if (y < ZONES.LEFT_WING_END) return 'left_wing';
    if (y > ZONES.RIGHT_WING_START) return 'right_wing';
    return 'center';
};

type VerticalZone = 'deep' | 'edge_of_box' | 'inside_box' | 'six_yard' | 'corner_left' | 'corner_right';
const getVerticalZone = (x: number, y: number): VerticalZone => {
    if (isInCornerZone(x, y)) return y <= ZONES.CORNER_ZONE_Y_LEFT ? 'corner_left' : 'corner_right';
    if (isInSixYardBox(x, y)) return 'six_yard';
    if (isInBox(x, y)) return 'inside_box';
    if (x >= ZONES.FINAL_THIRD_START) return 'edge_of_box';
    return 'deep';
};

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

// All zone keys including corners
type ZoneKey =
    | 'left_wing-deep' | 'left_wing-edge_of_box' | 'left_wing-inside_box' | 'left_wing-six_yard'
    | 'center-deep' | 'center-edge_of_box' | 'center-inside_box' | 'center-six_yard'
    | 'right_wing-deep' | 'right_wing-edge_of_box' | 'right_wing-inside_box' | 'right_wing-six_yard'
    | 'corner_left' | 'corner_right';

interface ZoneInfo {
    key: ZoneKey;
    label: string;
    shortLabel: string;
    count: number;
    ledToShot: number;
    ledToGoal: number;
    boxEntries: number;
}

const ZONE_COLORS: Record<string, { base: string; active: string }> = {
    'left_wing': { base: 'hsla(210, 70%, 55%, VAR)', active: 'hsla(210, 80%, 60%, 0.55)' },
    'center': { base: 'hsla(38, 85%, 55%, VAR)', active: 'hsla(38, 90%, 60%, 0.55)' },
    'right_wing': { base: 'hsla(142, 60%, 50%, VAR)', active: 'hsla(142, 70%, 55%, 0.55)' },
    'corner': { base: 'hsla(270, 70%, 60%, VAR)', active: 'hsla(270, 80%, 65%, 0.55)' },
    'box': { base: 'hsla(0, 70%, 55%, VAR)', active: 'hsla(0, 80%, 60%, 0.55)' },
};

const ChancesCreatedMap = ({ events, playerName, matchId }: ChancesCreatedMapProps) => {
    const uniqueId = useId();
    const navigate = useNavigate();
    const [selectedInterval, setSelectedInterval] = useState<TimeInterval>(ALL_INTERVAL);
    const [intervalMode, setIntervalMode] = useState<'10min' | 'half'>('10min');
    const [selectedZone, setSelectedZone] = useState<ZoneKey | null>(null);

    const handleGoToVideo = () => {
        if (matchId) navigate(`/match/${matchId}#match-video`, { state: { from: 'chances' } });
    };

    const hasOvertime = useMemo(() => events.some(e => e.minute > 90), [events]);

    const availableIntervals = useMemo(() => {
        if (intervalMode === 'half')
            return hasOvertime ? HALF_INTERVALS : HALF_INTERVALS.filter(i => i.category !== 'overtime');
        return TEN_MIN_INTERVALS;
    }, [intervalMode, hasOvertime]);

    // Process events to identify chances
    const processedChances = useMemo(() => {
        const chances: ProcessedChance[] = [];
        const passEvents = events.filter(e => e.type === 'pass');
        const shotEvents = events.filter(e => e.type === 'shot');

        passEvents.forEach((pass, index) => {
            if (pass.minute < selectedInterval.start || pass.minute >= selectedInterval.end) return;

            const endsInFinalThird = isInFinalThird(pass.targetX);
            const endsInBoxArea = isInBox(pass.targetX, pass.targetY);
            const endsInCornerZone = isInCornerZone(pass.targetX, pass.targetY);
            const startsOutsideBox = !isInBox(pass.x, pass.y);

            const ledToShot = shotEvents.some(shot =>
                shot.minute >= pass.minute && shot.minute <= pass.minute + 1
            );
            const ledToGoal = shotEvents.some(shot =>
                shot.minute >= pass.minute && shot.minute <= pass.minute + 1 &&
                (shot.isGoal || shot.shotOutcome === 'goal')
            );

            const horizontalZone = getHorizontalZone(pass.targetY);
            const verticalZone = getVerticalZone(pass.targetX, pass.targetY);

            if (endsInCornerZone && pass.success) {
                chances.push({
                    type: 'corner_zone', event: pass, index, horizontalZone, verticalZone,
                    isCornerZone: true, isInBox: endsInBoxArea, ledToShot, ledToGoal
                });
            } else if (endsInBoxArea && startsOutsideBox && pass.success) {
                chances.push({
                    type: 'box_entry', event: pass, index, horizontalZone, verticalZone,
                    isCornerZone: false, isInBox: true, ledToShot, ledToGoal
                });
            } else if (endsInFinalThird && pass.success && !endsInBoxArea) {
                const isProgressive = pass.targetX - pass.x > 10;
                if (isProgressive || ledToShot) {
                    chances.push({
                        type: 'final_third_chance', event: pass, index, horizontalZone, verticalZone,
                        isCornerZone: false, isInBox: false, ledToShot, ledToGoal
                    });
                }
            }
        });

        return chances;
    }, [events, selectedInterval]);

    // Compute zone stats including corners
    const zoneStats = useMemo(() => {
        const makeZone = (key: ZoneKey, shortLabel: string): ZoneInfo => ({
            key, label: shortLabel, shortLabel, count: 0, ledToShot: 0, ledToGoal: 0, boxEntries: 0,
        });

        const zones: Record<ZoneKey, ZoneInfo> = {
            'left_wing-deep': makeZone('left_wing-deep', 'LW Deep'),
            'left_wing-edge_of_box': makeZone('left_wing-edge_of_box', 'LW Edge'),
            'left_wing-inside_box': makeZone('left_wing-inside_box', 'LW Box'),
            'left_wing-six_yard': makeZone('left_wing-six_yard', 'LW 6yd'),
            'center-deep': makeZone('center-deep', 'Centre Deep'),
            'center-edge_of_box': makeZone('center-edge_of_box', 'Centre Edge'),
            'center-inside_box': makeZone('center-inside_box', 'Centre Box'),
            'center-six_yard': makeZone('center-six_yard', 'Centre 6yd'),
            'right_wing-deep': makeZone('right_wing-deep', 'RW Deep'),
            'right_wing-edge_of_box': makeZone('right_wing-edge_of_box', 'RW Edge'),
            'right_wing-inside_box': makeZone('right_wing-inside_box', 'RW Box'),
            'right_wing-six_yard': makeZone('right_wing-six_yard', 'RW 6yd'),
            'corner_left': makeZone('corner_left', 'Left Corner'),
            'corner_right': makeZone('corner_right', 'Right Corner'),
        };

        processedChances.forEach(c => {
            // Corner zones are their own category
            if (c.verticalZone === 'corner_left') {
                zones['corner_left'].count++;
                if (c.ledToShot) zones['corner_left'].ledToShot++;
                if (c.ledToGoal) zones['corner_left'].ledToGoal++;
                if (c.type === 'box_entry') zones['corner_left'].boxEntries++;
            } else if (c.verticalZone === 'corner_right') {
                zones['corner_right'].count++;
                if (c.ledToShot) zones['corner_right'].ledToShot++;
                if (c.ledToGoal) zones['corner_right'].ledToGoal++;
                if (c.type === 'box_entry') zones['corner_right'].boxEntries++;
            } else {
                const key = `${c.horizontalZone}-${c.verticalZone}` as ZoneKey;
                if (zones[key]) {
                    zones[key].count++;
                    if (c.ledToShot) zones[key].ledToShot++;
                    if (c.ledToGoal) zones[key].ledToGoal++;
                    if (c.type === 'box_entry') zones[key].boxEntries++;
                }
            }
        });

        return zones;
    }, [processedChances]);

    // Summary stats
    const stats = useMemo(() => {
        const boxEntries = processedChances.filter(c => c.type === 'box_entry');
        const finalThirdChances = processedChances.filter(c => c.type === 'final_third_chance');
        const cornerZoneChances = processedChances.filter(c => c.type === 'corner_zone');
        const ledToShot = processedChances.filter(c => c.ledToShot);
        const ledToGoal = processedChances.filter(c => c.ledToGoal);

        return {
            total: processedChances.length,
            boxEntries: boxEntries.length,
            finalThirdChances: finalThirdChances.length,
            cornerZoneChances: cornerZoneChances.length,
            ledToShot: ledToShot.length,
            ledToGoal: ledToGoal.length,
            conversionRate: processedChances.length > 0
                ? Math.round((ledToShot.length / processedChances.length) * 100) : 0,
            leftWing: processedChances.filter(c => c.horizontalZone === 'left_wing').length,
            center: processedChances.filter(c => c.horizontalZone === 'center').length,
            rightWing: processedChances.filter(c => c.horizontalZone === 'right_wing').length,
        };
    }, [processedChances]);

    const selectedZoneInfo = selectedZone ? zoneStats[selectedZone] : null;

    const maxCount = useMemo(() =>
        Math.max(1, ...Object.values(zoneStats).map(z => z.count)),
        [zoneStats]
    );

    // Get fill color based on zone category and selection
    const getZoneFill = (key: ZoneKey, zone: ZoneInfo, isSelected: boolean, anySelected: boolean) => {
        if (zone.count === 0) {
            return anySelected && !isSelected ? 'rgba(255,255,255,0.01)' : 'rgba(255,255,255,0.03)';
        }
        const intensity = zone.count / maxCount;

        if (isSelected) {
            return `hsla(217, 91%, 60%, ${0.3 + intensity * 0.35})`;
        }
        if (anySelected) {
            return `rgba(255,255,255,${0.02 + intensity * 0.04})`;
        }

        // Color by category
        let colorKey = 'center';
        if (key.startsWith('left_wing')) colorKey = 'left_wing';
        else if (key.startsWith('right_wing')) colorKey = 'right_wing';
        else if (key.startsWith('corner')) colorKey = 'corner';
        if (key.includes('inside_box') || key.includes('six_yard')) colorKey = 'box';

        const baseColor = ZONE_COLORS[colorKey]?.base || ZONE_COLORS.center.base;
        return baseColor.replace('VAR', `${0.12 + intensity * 0.4}`);
    };

    // Zone rectangles — pitch coords (right half: x 52.5–105, y 0–68)
    //
    // Layout:
    // DEEP (52.5–70)  |  EDGE (70–88.5)  |  BOX AREA (88.5–105)
    //                 |                   |  Corner L (outside box, y 0–13.84)
    // LW (y 0–20.4)  |  LW (y 0–20.4)   |  LW Box (y 13.84–24.84) | LW 6yd
    // C  (y 20.4–47.6)| C (y 20.4–47.6) |  C Box  (y 24.84–43.16) | C 6yd
    // RW (y 47.6–68) |  RW (y 47.6–68)  |  RW Box (y 43.16–54.16) | RW 6yd
    //                 |                   |  Corner R (outside box, y 54.16–68)
    const zoneRects: Record<ZoneKey, { x: number; y: number; w: number; h: number }> = {
        // Deep zones: midfield (52.5) to final third start (~70)
        'left_wing-deep': { x: 52.5, y: 0, w: 17.5, h: 20.4 },
        'center-deep': { x: 52.5, y: 20.4, w: 17.5, h: 27.2 },
        'right_wing-deep': { x: 52.5, y: 47.6, w: 17.5, h: 20.4 },

        // Edge of box: 70 to 88.5 — full wing height (no corner cutout)
        'left_wing-edge_of_box': { x: 70, y: 0, w: 18.5, h: 20.4 },
        'center-edge_of_box': { x: 70, y: 20.4, w: 18.5, h: 27.2 },
        'right_wing-edge_of_box': { x: 70, y: 47.6, w: 18.5, h: 20.4 },

        // Inside box: 88.5 to 99.5 — within penalty area bounds
        'left_wing-inside_box': { x: 88.5, y: 13.84, w: 11, h: 11 },
        'center-inside_box': { x: 88.5, y: 24.84, w: 11, h: 18.32 },
        'right_wing-inside_box': { x: 88.5, y: 43.16, w: 11, h: 11 },

        // 6-yard box: 99.5 to 105 — within goal area bounds
        'left_wing-six_yard': { x: 99.5, y: 13.84, w: 5.5, h: 11 },
        'center-six_yard': { x: 99.5, y: 24.84, w: 5.5, h: 18.32 },
        'right_wing-six_yard': { x: 99.5, y: 43.16, w: 5.5, h: 11 },

        // Corner zones — ONLY the areas outside the penalty box near the goal line
        'corner_left': { x: 88.5, y: 0, w: 16.5, h: 13.84 },
        'corner_right': { x: 88.5, y: 54.16, w: 16.5, h: 13.84 },
    };

    const anySelected = selectedZone !== null;

    // Helper to render rotated text (counteracting the -90deg SVG rotation)
    const ZoneText = ({ x, y, size, weight, fill, opacity, children }: {
        x: number; y: number; size: number; weight: number; fill: string; opacity: number; children: React.ReactNode;
    }) => (
        <text
            x={x} y={y}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize={size}
            fontWeight={weight}
            fill={fill}
            opacity={opacity}
            transform={`rotate(90 ${x} ${y})`}
            style={{ pointerEvents: 'none', transition: 'fill 0.3s, opacity 0.3s' }}
        >
            {children}
        </text>
    );

    return (
        <div className="space-y-5">
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
                            onClick={() => { setIntervalMode('10min'); setSelectedInterval(ALL_INTERVAL); }}
                            className="h-7 px-2 text-xs rounded-none border-0"
                        >
                            10 Min
                        </Button>
                        <div className="w-px h-5 bg-border" />
                        <Button
                            variant={intervalMode === 'half' ? "secondary" : "ghost"}
                            size="sm"
                            onClick={() => { setIntervalMode('half'); setSelectedInterval(ALL_INTERVAL); }}
                            className="h-7 px-2 text-xs rounded-none border-0"
                        >
                            Halves
                        </Button>
                    </div>
                </div>
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

            {/* Main Layout: Large field + side panel */}
            <div className="flex flex-col xl:flex-row gap-5">
                {/* Half-field SVG — LARGE, rotated 90° left (goal at bottom) */}
                <div className="relative flex-1 min-w-0">
                    <div
                        className="w-full mx-auto rounded-xl overflow-hidden border border-border/50 shadow-lg"
                        style={{ maxWidth: 600 }}
                    >
                        {/* Aspect ratio wrapper for the rotated field */}
                        <div className="w-full" style={{ aspectRatio: '76 / 68' }}>
                            <svg
                                viewBox="42 -14 76 96"
                                preserveAspectRatio="xMidYMid meet"
                                className="w-full h-full block"
                                style={{ transform: 'rotate(-90deg)' }}
                            >
                                <defs>
                                    <pattern id={`gs-${uniqueId}`} x="0" y="0" width="12" height="68" patternUnits="userSpaceOnUse">
                                        <rect x="0" y="0" width="6" height="68" fillOpacity="0" />
                                        <rect x="6" y="0" width="6" height="68" fill="white" fillOpacity="0.04" />
                                    </pattern>
                                    <filter id={`gn-${uniqueId}`} x="0%" y="0%" width="100%" height="100%">
                                        <feTurbulence type="fractalNoise" baseFrequency="0.7" numOctaves="3" result="noise" />
                                        <feColorMatrix type="matrix" in="noise"
                                            values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.12 0" />
                                    </filter>
                                    <pattern id={`net-${uniqueId}`} x="0" y="0" width="0.5" height="0.5" patternUnits="userSpaceOnUse">
                                        <path d="M 0,0 L 0.5,0.5 M 0.5,0 L 0,0.5" stroke="#cbd5e1" strokeWidth="0.08" opacity="0.6" />
                                        <rect width="0.5" height="0.5" fill="rgba(255,255,255,0.05)" />
                                    </pattern>
                                    <filter id={`zg-${uniqueId}`} x="-15%" y="-15%" width="130%" height="130%">
                                        <feGaussianBlur stdDeviation="1.5" result="blur" />
                                        <feMerge>
                                            <feMergeNode in="blur" />
                                            <feMergeNode in="SourceGraphic" />
                                        </feMerge>
                                    </filter>
                                </defs>

                                {/* Grass */}
                                <rect x="42" y="-14" width="76" height="96" fill="var(--pitch-green, #357a38)" />
                                <rect x="42" y="-14" width="76" height="96" fill={`url(#gs-${uniqueId})`} />
                                <rect x="42" y="-14" width="76" height="96" filter={`url(#gn-${uniqueId})`} opacity="0.5" style={{ pointerEvents: 'none' }} />

                                {/* Pitch lines */}
                                <g fill="none" stroke="white" strokeWidth="0.15">
                                    <line x1="52.5" y1="0" x2="105" y2="0" />
                                    <line x1="52.5" y1="68" x2="105" y2="68" />
                                    <line x1="52.5" y1="0" x2="52.5" y2="68" />
                                    <line x1="105" y1="0" x2="105" y2="68" />
                                    <path d="M 52.5,24.85 A 9.15,9.15 0 0,1 52.5,43.15" />
                                    <circle cx="52.5" cy="34" r="0.4" fill="white" />
                                    <rect x="88.5" y="13.84" width="16.5" height="40.32" />
                                    <rect x="99.5" y="24.84" width="5.5" height="18.32" />
                                    <circle cx="94" cy="34" r="0.3" fill="white" />
                                    <path d="M 88.5,26.5 A 9.15,9.15 0 0,0 88.5,41.5" />
                                    <path d="M 105,1 A 1,1 0 0,1 104,0" />
                                    <path d="M 105,67 A 1,1 0 0,0 104,68" />
                                    <rect x="105" y="30.34" width="2.44" height="7.32" stroke="#e5e7eb" strokeWidth="0.2" fill={`url(#net-${uniqueId})`} />
                                </g>

                                {/* Zone sections — clickable rectangles with stats */}
                                {(Object.entries(zoneRects) as [ZoneKey, typeof zoneRects[ZoneKey]][]).map(([key, rect]) => {
                                    const zone = zoneStats[key];
                                    const isSelected = selectedZone === key;
                                    const fill = getZoneFill(key, zone, isSelected, anySelected);
                                    const isLargeEnough = rect.w > 8 && rect.h > 8;
                                    const isCorner = key.startsWith('corner');

                                    const cx = rect.x + rect.w / 2;
                                    const cy = rect.y + rect.h / 2;

                                    // Font sizes based on rect dimensions
                                    const numSize = Math.min(rect.w, rect.h) > 12 ? 5.5 : Math.min(rect.w, rect.h) > 6 ? 4 : 3;
                                    const labelSize = numSize * 0.35;

                                    return (
                                        <g key={key} style={{ cursor: 'pointer' }} onClick={(e) => {
                                            e.stopPropagation();
                                            setSelectedZone(isSelected ? null : key);
                                        }}>
                                            <rect
                                                x={rect.x} y={rect.y}
                                                width={rect.w} height={rect.h}
                                                fill={fill}
                                                stroke={isSelected ? "hsl(217, 91%, 65%)" : "rgba(255,255,255,0.12)"}
                                                strokeWidth={isSelected ? 0.5 : 0.1}
                                                rx={0.4}
                                                filter={isSelected ? `url(#zg-${uniqueId})` : undefined}
                                                style={{ transition: 'fill 0.3s, stroke 0.3s, opacity 0.3s' }}
                                                opacity={anySelected && !isSelected ? 0.3 : 1}
                                            />

                                            {/* Numerical value */}
                                            <ZoneText
                                                x={cx} y={cy - (isLargeEnough || isCorner ? 1.5 : 0)}
                                                size={numSize}
                                                weight={800}
                                                fill={isSelected ? "hsl(217, 91%, 85%)" : zone.count > 0 ? "rgba(255,255,255,0.92)" : "rgba(255,255,255,0.2)"}
                                                opacity={anySelected && !isSelected ? 0.25 : 1}
                                            >
                                                {zone.count}
                                            </ZoneText>

                                            {/* Label */}
                                            {(isLargeEnough || isCorner) && (
                                                <ZoneText
                                                    x={cx} y={cy + numSize * 0.7}
                                                    size={labelSize}
                                                    weight={600}
                                                    fill={isSelected ? "hsl(217, 91%, 75%)" : "rgba(255,255,255,0.4)"}
                                                    opacity={anySelected && !isSelected ? 0.2 : 1}
                                                >
                                                    {zone.shortLabel}
                                                </ZoneText>
                                            )}
                                        </g>
                                    );
                                })}

                                {/* Depth labels along the center */}
                                <ZoneText x={61} y={10} size={1.5} weight={500} fill="rgba(255,255,255,0.2)" opacity={anySelected ? 0.15 : 0.5}>
                                    DEEP
                                </ZoneText>
                                <ZoneText x={80} y={34} size={1.5} weight={500} fill="rgba(255,255,255,0.2)" opacity={anySelected ? 0.15 : 0.5}>
                                    EDGE OF BOX
                                </ZoneText>
                                <ZoneText x={95} y={34} size={1.5} weight={500} fill="rgba(255,255,255,0.2)" opacity={anySelected ? 0.15 : 0.5}>
                                    INSIDE BOX
                                </ZoneText>
                            </svg>
                        </div>

                        {/* Goal label */}
                        <div className="text-center py-1.5 bg-secondary/30 border-t border-border/30">
                            <span className="text-[10px] font-semibold tracking-widest uppercase text-muted-foreground">
                                ⬇ Goal
                            </span>
                        </div>
                    </div>

                    {/* Quick wing stats below field */}
                    <div className="grid grid-cols-3 gap-2 mt-3" style={{ maxWidth: 600, margin: '12px auto 0' }}>
                        {[
                            { label: "Left Wing", value: stats.leftWing, color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20" },
                            { label: "Centre", value: stats.center, color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/20" },
                            { label: "Right Wing", value: stats.rightWing, color: "text-green-400", bg: "bg-green-500/10 border-green-500/20" },
                        ].map(s => (
                            <div key={s.label} className={cn("text-center p-2.5 rounded-lg border", s.bg)}>
                                <p className={cn("text-xl font-bold", s.color)}>{s.value}</p>
                                <p className="text-[9px] uppercase tracking-wider text-muted-foreground font-medium">{s.label}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Detail Panel */}
                <div className="xl:w-72 space-y-3">
                    <AnimatePresence mode="wait">
                        {selectedZoneInfo ? (
                            <motion.div
                                key={selectedZone}
                                className="bg-card/80 backdrop-blur-sm rounded-xl border border-border p-4 space-y-3 shadow-lg"
                                initial={{ opacity: 0, x: 10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -10 }}
                                transition={{ duration: 0.2 }}
                            >
                                <div className="flex items-center justify-between pb-2 border-b border-border">
                                    <h4 className="text-sm font-bold text-foreground">
                                        {selectedZoneInfo.shortLabel}
                                    </h4>
                                    <Badge variant="secondary" className="text-xs font-semibold">
                                        {selectedZoneInfo.count} chance{selectedZoneInfo.count !== 1 ? 's' : ''}
                                    </Badge>
                                </div>

                                <div className="grid grid-cols-2 gap-2">
                                    {[
                                        { label: "Chances", value: selectedZoneInfo.count, color: "text-primary" },
                                        { label: "Led to Shot", value: selectedZoneInfo.ledToShot, color: "text-warning" },
                                        { label: "Led to Goal", value: selectedZoneInfo.ledToGoal, color: "text-success" },
                                        { label: "Box Entries", value: selectedZoneInfo.boxEntries, color: "text-destructive" },
                                    ].map(s => (
                                        <div key={s.label} className="text-center p-2.5 rounded-lg bg-secondary/50 border border-border/50">
                                            <p className={cn("text-xl font-bold", s.color)}>{s.value}</p>
                                            <p className="text-[9px] uppercase tracking-wider text-muted-foreground">{s.label}</p>
                                        </div>
                                    ))}
                                </div>

                                {/* Conversion info */}
                                {selectedZoneInfo.count > 0 && (
                                    <div className="p-2.5 rounded-lg bg-secondary/30 border border-border/30 text-center">
                                        <p className="text-sm font-semibold text-foreground">
                                            {selectedZoneInfo.count > 0
                                                ? Math.round((selectedZoneInfo.ledToShot / selectedZoneInfo.count) * 100)
                                                : 0}%
                                        </p>
                                        <p className="text-[9px] uppercase tracking-wider text-muted-foreground">Shot Conversion</p>
                                    </div>
                                )}

                                {matchId && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handleGoToVideo}
                                        className="w-full flex items-center justify-center gap-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
                                    >
                                        <Video className="w-4 h-4" />
                                        Go to Video
                                    </Button>
                                )}

                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setSelectedZone(null)}
                                    className="w-full text-xs text-muted-foreground hover:text-foreground"
                                >
                                    Clear Selection
                                </Button>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="hint"
                                className="bg-secondary/30 rounded-xl border border-border/30 p-5 text-center"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                            >
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    Click a zone on the field to see detailed stats for that area
                                </p>
                            </motion.div>
                        )}
                    </AnimatePresence>


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
                    <div key={stat.label} className="text-center p-2.5 rounded-lg bg-secondary/50 border border-border">
                        <p className={cn("text-lg font-bold", stat.color)}>{stat.value}</p>
                        <p className="text-[9px] uppercase tracking-wider text-muted-foreground">{stat.label}</p>
                    </div>
                ))}
            </div>

            {/* Legend */}
            <div className="flex flex-wrap items-center justify-center gap-5 text-xs py-2 px-3 bg-secondary/20 rounded-lg">
                <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: "hsla(210, 70%, 55%, 0.5)" }} />
                    <span className="text-muted-foreground">Left Wing</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: "hsla(38, 85%, 55%, 0.5)" }} />
                    <span className="text-muted-foreground">Centre</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: "hsla(142, 60%, 50%, 0.5)" }} />
                    <span className="text-muted-foreground">Right Wing</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: "hsla(0, 70%, 55%, 0.5)" }} />
                    <span className="text-muted-foreground">Box Area</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: "hsla(270, 70%, 60%, 0.5)" }} />
                    <span className="text-muted-foreground">Corner</span>
                </div>
                <span className="text-muted-foreground/50 border-l border-border pl-3">
                    Brighter = more chances
                </span>
            </div>
        </div>
    );
};

export default ChancesCreatedMap;
