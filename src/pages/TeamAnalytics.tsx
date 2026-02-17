import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate, useLocation } from "react-router-dom";
import AuthHeader from "@/components/layout/AuthHeader";
import Sidebar from "@/components/layout/Sidebar";
import { Player, MatchEvent } from "@/types/player";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import LineChart from "@/components/charts/LineChart";
import HexagonRadar from "@/components/charts/HexagonRadar";
import ExpandableStatsChart, { StatsNode } from "@/components/charts/ExpandableStatsChart";
import {
    Users,
    Target,
    Footprints,
    TrendingUp,
    Shield,
    Trophy,
    Flame,
    ArrowRight,
    Play,
    Pause,
    SkipForward,
    RotateCcw,
    CalendarDays,
    BarChart3,
    PieChart as PieChartIcon,
    LayoutGrid,
    Video,
    Activity,
    GitCompare,
    User,
    ArrowUpRight,
    ArrowDownRight,
    Minus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { usePlayers } from "@/hooks/usePlayers";
import { useSidebarContext } from "@/contexts/SidebarContext";
import { useCountUp } from "@/hooks/useCountUp";
import { FORMATIONS, FormationName, getFormationByName, getSlotColor, FormationSlot } from "@/lib/formationPositions";
import TacticalField from "@/components/field/TacticalField";
import TeamPassingMap from "@/components/analytics/TeamPassingMap";
import { StatHint } from "@/components/ui/stat-hint";

// ── Position-based field coordinates for full pitch formation view ──
// Coordinates are in pitch units: x=0-105, y=0-68
// Home team defends left goal (x=0), attacks toward right goal (x=105)
const POSITION_COORDS: Record<string, { x: number; y: number }> = {
    // Goalkeepers
    GK: { x: 5.5, y: 34 },
    Goalkeeper: { x: 5.5, y: 34 },
    // Defenders
    CB: { x: 18, y: 34 },
    Defender: { x: 18, y: 34 },
    LCB: { x: 18, y: 24 },
    RCB: { x: 18, y: 44 },
    LB: { x: 17, y: 12 },
    RB: { x: 17, y: 56 },
    LWB: { x: 22, y: 10 },
    RWB: { x: 22, y: 58 },
    // Defensive Midfielders
    CDM: { x: 30, y: 34 },
    LCDM: { x: 30, y: 25 },
    RCDM: { x: 30, y: 43 },
    // Central Midfielders
    CM: { x: 38, y: 34 },
    Midfielder: { x: 38, y: 34 },
    LCM: { x: 37, y: 24 },
    RCM: { x: 37, y: 44 },
    LM: { x: 36, y: 13 },
    RM: { x: 36, y: 55 },
    // Attacking Midfielders
    CAM: { x: 44, y: 34 },
    LCAM: { x: 44, y: 25 },
    RCAM: { x: 44, y: 43 },
    // Wingers
    LW: { x: 46, y: 14 },
    RW: { x: 46, y: 54 },
    Winger: { x: 46, y: 34 },
    // Forwards
    CF: { x: 50, y: 34 },
    ST: { x: 51, y: 34 },
    Forward: { x: 51, y: 34 },
    LST: { x: 50, y: 26 },
    RST: { x: 50, y: 42 },
};
const DEFAULT_COORDS = { x: 38, y: 34 };
const PITCH_W = 105;
const PITCH_H = 68;

// Team colors for formation view
const FORMATION_TEAM_COLORS = {
    home: { node: "rgba(59, 140, 255, 0.95)", border: "rgba(30, 80, 180, 0.9)" },
    away: { node: "rgba(240, 75, 75, 0.95)", border: "rgba(165, 40, 40, 0.9)" },
};

/**
 * Get pitch coordinates for a player based on their position.
 */
function getPositionCoords(
    position: string,
    isHomeTeam: boolean,
    index: number,
    totalSamePos: number,
): { x: number; y: number } {
    let coords = POSITION_COORDS[position];
    if (!coords) {
        const posKey = position.trim();
        coords = POSITION_COORDS[posKey];
    }
    if (!coords) {
        const posUpper = position.toUpperCase().trim();
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
            for (const [key, val] of Object.entries(POSITION_COORDS)) {
                if (posUpper.includes(key.toUpperCase())) {
                    coords = val;
                    break;
                }
            }
        }
    }
    if (!coords) coords = DEFAULT_COORDS;

    let { x, y } = coords;
    if (totalSamePos > 1) {
        const offsetY = (index - (totalSamePos - 1) / 2) * 4.5;
        y = Math.max(6, Math.min(PITCH_H - 6, y + offsetY));
    }
    if (!isHomeTeam) {
        x = PITCH_W - x;
    }
    x = Math.max(5, Math.min(PITCH_W - 5, x));
    y = Math.max(6, Math.min(PITCH_H - 6, y));
    return { x, y };
}

// Animation variants
const containerVariants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.08,
        },
    },
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
};

// Section navigation configuration
const SECTIONS = [
    { id: 'overview', label: 'Overview', shortLabel: 'OV', icon: BarChart3 },
    { id: 'advanced', label: 'Advanced Stats', shortLabel: 'AS', icon: Activity },
    { id: 'breakdown', label: 'Stats Breakdown', shortLabel: 'SB', icon: PieChartIcon },
    { id: 'formation', label: 'Formation', shortLabel: 'FM', icon: LayoutGrid },
    { id: 'passing', label: 'Passing Map', shortLabel: 'PM', icon: Footprints },
    { id: 'goals', label: 'Goal Replay', shortLabel: 'GR', icon: Video },
    { id: 'trend', label: 'Performance', shortLabel: 'PT', icon: TrendingUp },
];

// Section Navigation Component
interface SectionNavProps {
    activeSection: string;
    onSectionClick: (sectionId: string) => void;
    isCollapsed: boolean;
    embedded?: boolean;
}

const SectionNav = ({ activeSection, onSectionClick, isCollapsed, embedded }: SectionNavProps) => {
    return (
        <motion.div
            initial={{ opacity: 0, x: 20, y: '-50%' }}
            animate={{ opacity: 1, x: 0, y: '-50%' }}
            transition={{ delay: 0.5, duration: 0.4 }}
            className={cn(
                "fixed right-3 z-50",
                embedded ? "top-[55%]" : "top-[55%]"
            )}
        >
            <div className={cn(
                "flex flex-row items-stretch rounded-xl bg-card/95 backdrop-blur-md border border-border shadow-xl",
                embedded ? "p-1.5 gap-0" : "p-2 gap-0"
            )}>
                {/* Active indicator bar - positioned on the left side */}
                <div className="relative flex flex-col justify-start mr-1.5">
                    <motion.div
                        className={cn(
                            "rounded-full bg-primary",
                            embedded ? "w-1 h-6" : "w-1.5 h-8"
                        )}
                        animate={{
                            y: SECTIONS.findIndex(s => s.id === activeSection) * (embedded ? 32 : 40) + (embedded ? 4 : 4)
                        }}
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                </div>

                {/* Buttons container */}
                <div className={cn(
                    "flex flex-col",
                    embedded ? "gap-1" : "gap-1.5"
                )}>
                    {SECTIONS.map((section, index) => {
                        const Icon = section.icon;
                        const isActive = activeSection === section.id;

                        return (
                            <motion.button
                                key={section.id}
                                onClick={() => onSectionClick(section.id)}
                                className={cn(
                                    "group relative flex items-center justify-center rounded-lg transition-all duration-200",
                                    embedded ? "w-7 h-7" : "w-9 h-9",
                                    isActive
                                        ? "bg-primary/20 text-primary"
                                        : "text-muted-foreground hover:text-foreground hover:bg-secondary/80"
                                )}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                initial={{ opacity: 0, x: 10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.6 + index * 0.05 }}
                            >
                                <Icon className={cn(embedded ? "w-3.5 h-3.5" : "w-4 h-4")} />

                                {/* Tooltip on hover */}
                                <div className={cn(
                                    "absolute right-full mr-3 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap",
                                    "bg-popover text-popover-foreground border border-border shadow-lg",
                                    "opacity-0 invisible group-hover:opacity-100 group-hover:visible",
                                    "transition-all duration-200 pointer-events-none"
                                )}>
                                    {section.label}
                                    <div className="absolute top-1/2 -translate-y-1/2 -right-1.5 w-2.5 h-2.5 rotate-45 bg-popover border-r border-t border-border" />
                                </div>
                            </motion.button>
                        );
                    })}
                </div>
            </div>
        </motion.div>
    );
};

// Helper to check if a value exists in database (not null/undefined)
const hasData = (value: number | null | undefined): value is number => {
    return value !== null && value !== undefined;
};

// Helper to sum values, returning null if all values are null (no data)
const sumWithNull = <T,>(
    items: T[],
    getter: (item: T) => number | null | undefined
): number | null => {
    const values = items.map(getter).filter(hasData);
    if (values.length === 0) return null;
    return values.reduce((a, b) => a + b, 0);
};

// Helper to average values, returning null if no data
const avgWithNull = <T,>(
    items: T[],
    getter: (item: T) => number | null | undefined
): number | null => {
    const values = items.map(getter).filter(hasData);
    if (values.length === 0) return null;
    return Math.round(values.reduce((a, b) => a + b, 0) / values.length);
};

// Animated value component for counting up numbers - handles null
const AnimatedValue = ({
    value,
    suffix = '',
    className = '',
    duration = 1500,
    delay = 0
}: {
    value: number | null;
    suffix?: string;
    className?: string;
    duration?: number;
    delay?: number;
}) => {
    const count = useCountUp({ end: value ?? 0, duration, delay });
    if (value === null) return <span className={className}>--</span>;
    return <span className={className}>{count}{suffix}</span>;
};

// Static value display - shows -- for null
const StatValue = ({ value, suffix = '' }: { value: number | null; suffix?: string }) => {
    if (value === null) return <span>--</span>;
    return <span>{value}{suffix}</span>;
};

// Animated percentage bar component - handles null
const AnimatedBar = ({
    value,
    maxValue = 100,
    color = 'bg-primary',
    delay = 0,
}: {
    value: number | null;
    maxValue?: number;
    color?: string;
    delay?: number;
}) => {
    if (value === null) return null;
    const percentage = Math.min((value / maxValue) * 100, 100);
    return (
        <motion.div
            className={cn("h-full rounded-full", color)}
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 1.2, delay, ease: "easeOut" }}
        />
    );
};

// Position colors for pie chart
const POSITION_COLORS: Record<string, string> = {
    Forward: "hsl(var(--destructive))",
    Midfielder: "hsl(var(--primary))",
    Defender: "hsl(var(--success))",
    Goalkeeper: "hsl(var(--warning))",
    Winger: "hsl(var(--chart-4))",
};

// Team colors for comparison view
const TEAM_COLORS = {
    home: "hsl(217, 91%, 60%)", // Blue
    away: "hsl(0, 72%, 51%)",   // Red
};

// Comparison bar component - shows both teams' values side by side
interface ComparisonBarProps {
    label: string;
    teamValue: number | null;
    opponentValue: number | null;
    teamName: string;
    opponentName: string;
    icon?: React.ReactNode;
    suffix?: string;
    reverseColors?: boolean; // For stats like fouls where lower is better
}

const ComparisonBar = ({
    label,
    teamValue,
    opponentValue,
    teamName,
    opponentName,
    icon,
    suffix = '',
    reverseColors = false,
}: ComparisonBarProps) => {
    const tVal = teamValue ?? 0;
    const oVal = opponentValue ?? 0;
    const total = tVal + oVal;
    const teamPct = total > 0 ? (tVal / total) * 100 : 50;
    const oppPct = total > 0 ? (oVal / total) * 100 : 50;
    
    // Determine advantage
    const teamAhead = reverseColors ? tVal < oVal : tVal > oVal;
    const oppAhead = reverseColors ? oVal < tVal : oVal > tVal;
    const isTied = tVal === oVal;

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                    {icon && <span className="text-muted-foreground">{icon}</span>}
                    {label}
                </div>
            </div>
            <div className="flex items-center gap-3">
                {/* Team value */}
                <div className={cn(
                    "w-16 text-right text-sm font-bold",
                    teamAhead && "text-success",
                    oppAhead && "text-muted-foreground",
                    isTied && "text-foreground"
                )}>
                    {teamValue !== null ? `${teamValue}${suffix}` : '--'}
                    {teamAhead && !isTied && <ArrowUpRight className="inline w-3 h-3 ml-0.5" />}
                </div>
                
                {/* Bar visualization */}
                <div className="flex-1 h-3 flex rounded-full overflow-hidden bg-secondary/30">
                    <motion.div
                        className="h-full rounded-l-full"
                        style={{ backgroundColor: TEAM_COLORS.home }}
                        initial={{ width: 0 }}
                        animate={{ width: `${teamPct}%` }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                    />
                    <motion.div
                        className="h-full rounded-r-full"
                        style={{ backgroundColor: TEAM_COLORS.away }}
                        initial={{ width: 0 }}
                        animate={{ width: `${oppPct}%` }}
                        transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 }}
                    />
                </div>
                
                {/* Opponent value */}
                <div className={cn(
                    "w-16 text-left text-sm font-bold",
                    oppAhead && "text-success",
                    teamAhead && "text-muted-foreground",
                    isTied && "text-foreground"
                )}>
                    {opponentValue !== null ? `${opponentValue}${suffix}` : '--'}
                    {oppAhead && !isTied && <ArrowUpRight className="inline w-3 h-3 ml-0.5" />}
                </div>
            </div>
        </div>
    );
};

// Compact stat card for comparison view
interface ComparisonStatCardProps {
    label: string;
    teamValue: number | string | null;
    opponentValue: number | string | null;
    teamName: string;
    opponentName: string;
    icon?: React.ReactNode;
    reverseColors?: boolean;
}

const ComparisonStatCard = ({
    label,
    teamValue,
    opponentValue,
    teamName,
    opponentName,
    icon,
    reverseColors = false,
}: ComparisonStatCardProps) => {
    const tVal = typeof teamValue === 'string' ? parseFloat(teamValue) || 0 : teamValue ?? 0;
    const oVal = typeof opponentValue === 'string' ? parseFloat(opponentValue) || 0 : opponentValue ?? 0;
    
    const teamAhead = reverseColors ? tVal < oVal : tVal > oVal;
    const oppAhead = reverseColors ? oVal < tVal : oVal > tVal;
    const isTied = tVal === oVal;
    
    const diff = tVal - oVal;
    const diffPct = oVal > 0 ? Math.round(((tVal - oVal) / oVal) * 100) : 0;

    return (
        <div className="p-3 rounded-lg bg-secondary/30 border border-border">
            <div className="flex items-center gap-2 mb-2">
                {icon && <span className="text-muted-foreground">{icon}</span>}
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</span>
            </div>
            <div className="flex items-center justify-between gap-2">
                {/* Team value */}
                <div className="flex flex-col items-start">
                    <span className={cn(
                        "text-lg font-bold",
                        teamAhead && "text-primary",
                        !teamAhead && !isTied && "text-muted-foreground"
                    )}>
                        {teamValue ?? '--'}
                    </span>
                    <span className="text-[10px] text-muted-foreground truncate max-w-[60px]">{teamName}</span>
                </div>
                
                {/* VS / Difference indicator */}
                <div className="flex flex-col items-center">
                    {!isTied && (
                        <span className={cn(
                            "text-xs font-bold",
                            (reverseColors ? diff < 0 : diff > 0) ? "text-success" : "text-destructive"
                        )}>
                            {(reverseColors ? diff < 0 : diff > 0) ? '+' : ''}{diff}
                        </span>
                    )}
                    {isTied && <Minus className="w-3 h-3 text-muted-foreground" />}
                </div>
                
                {/* Opponent value */}
                <div className="flex flex-col items-end">
                    <span className={cn(
                        "text-lg font-bold",
                        oppAhead && "text-destructive",
                        !oppAhead && !isTied && "text-muted-foreground"
                    )}>
                        {opponentValue ?? '--'}
                    </span>
                    <span className="text-[10px] text-muted-foreground truncate max-w-[60px]">{opponentName}</span>
                </div>
            </div>
        </div>
    );
};

// Get all goal events from all matches
interface GoalMoment {
    matchId: string;
    opponent: string;
    minute: number;
    scorer: Player;
    event: MatchEvent;
}

interface TeamAnalyticsProps {
    embedded?: boolean;
    defaultMatchId?: string;
}


interface MatchListItem {
    id: string;
    opponent: string;
    date: string;
    homeTeam: string;
    homeTeamId: string;
    awayTeamId: string;
    ourTeamId: string;
}

interface MatchStatistics {
    match_id: string;
    team_clearances: number;
    team_interceptions: number;
    team_successful_dribbles: number;
    home_ball_recoveries?: number;
    away_ball_recoveries?: number;
    team_chances_created: number;
    team_chances_final_third: number;
    team_aerial_duels_won: number;
    team_shots_on_target: number;
    team_fouls: number;
    team_saves: number;
    team_freekicks: number;
    opponent_clearances: number;
    opponent_interceptions: number;
    opponent_successful_dribbles: number;
    opponent_chances_created: number;
    opponent_chances_final_third: number;
    opponent_aerial_duels_won: number;
    opponent_fouls: number;
    opponent_saves: number;
    opponent_freekicks: number;
    opponent_shots_on_target: number;
    opponent_conversion_rate: number | null;

    // Indices
    home_possession_control_index?: number;
    home_chance_creation_index?: number;
    home_shooting_efficiency?: number;
    home_defensive_solidity?: number;
    home_transition_progression?: number;
    home_recovery_pressing_efficiency?: number;

    away_possession_control_index?: number;
    away_chance_creation_index?: number;
    away_shooting_efficiency?: number;
    away_defensive_solidity?: number;
    away_transition_progression?: number;
    away_recovery_pressing_efficiency?: number;
}

// ... imports moved to top

const TeamAnalytics = ({ embedded = false, defaultMatchId }: TeamAnalyticsProps) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { isCollapsed } = useSidebarContext();
    // const players = playersData.players as Player[]; // Remove
    const { data: players = [], isLoading: isPlayersLoading } = usePlayers(); // Use hook
    const [selectedMatch, setSelectedMatch] = useState<string>(defaultMatchId || "all");
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentGoalIndex, setCurrentGoalIndex] = useState(0);
    const [goalHalfFilter, setGoalHalfFilter] = useState<'full' | '1st' | '2nd'>('full');

    // Formation state
    const [selectedFormation, setSelectedFormation] = useState<FormationName>('4-3-3');
    const [fieldPlayerIds, setFieldPlayerIds] = useState<string[]>([]);
    const [draggedPlayerId, setDraggedPlayerId] = useState<string | null>(null);
    const [hoveredSlot, setHoveredSlot] = useState<number | null>(null);
    const [swapConfirmation, setSwapConfirmation] = useState<{ from: string; to: string; slotIndex: number } | null>(null);

    // Section navigation state
    const [activeSection, setActiveSection] = useState<string>('overview');
    const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});

    // View mode: 'single' for single team view, 'comparison' for both teams side-by-side
    const [viewMode, setViewMode] = useState<'single' | 'comparison'>('single');

    // Handle section click - smooth scroll to section
    const handleSectionClick = useCallback((sectionId: string) => {
        const element = sectionRefs.current[sectionId];
        if (element) {
            const headerOffset = 180; // Account for fixed header
            const elementPosition = element.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }
        setActiveSection(sectionId);
    }, []);

    // Track active section on scroll
    useEffect(() => {
        const handleScroll = () => {
            const scrollOffset = embedded ? 200 : 150; // Different offset for embedded view

            // Find which section is currently in view
            for (const section of SECTIONS) {
                const element = sectionRefs.current[section.id];
                if (element) {
                    const rect = element.getBoundingClientRect();
                    const viewportHeight = window.innerHeight;

                    // Check if element is in the top half of the viewport
                    if (rect.top <= scrollOffset && rect.bottom > scrollOffset) {
                        setActiveSection(section.id);
                        break;
                    }
                }
            }
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        handleScroll(); // Initial check
        return () => window.removeEventListener('scroll', handleScroll);
    }, [embedded]);

    // Scroll restoration: scroll to section from hash on mount / back-navigation
    useEffect(() => {
        const hash = location.hash?.replace('#', '');
        const stateSection = (location.state as any)?.scrollToSection;
        const target = hash || stateSection;
        if (target) {
            // Small delay to let DOM render
            const timer = setTimeout(() => {
                const el = sectionRefs.current[target] || document.getElementById(target);
                if (el) {
                    const headerOffset = 180;
                    const top = el.getBoundingClientRect().top + window.pageYOffset - headerOffset;
                    window.scrollTo({ top, behavior: 'smooth' });
                    setActiveSection(target);
                }
            }, 200);
            return () => clearTimeout(timer);
        }
    }, [location]);

    // Fetch matches from Supabase
    const { data: dbMatches = [] } = useQuery({
        queryKey: ['matches-list'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('matches')
                .select('id, competition_name, match_date, home_team_id, away_team_id, our_team_id, home_team:home_team_id(team_name), away_team:away_team_id(team_name)')
                .order('match_date', { ascending: false });

            if (error) throw error;
            return ((data as any[]) || []).map(m => ({
                id: m.id,
                opponent: (m.away_team as any)?.team_name || 'Opponent',
                date: m.match_date,
                homeTeam: (m.home_team as any)?.team_name || 'Team',
                homeTeamId: m.home_team_id,
                awayTeamId: m.away_team_id,
                ourTeamId: m.our_team_id,
            })) as MatchListItem[];
        }
    });

    const matches = useMemo(() => {
        return dbMatches;
    }, [dbMatches]);

    // Fetch match statistics
    const { data: matchStatsList = [] } = useQuery({
        queryKey: ['match-statistics', selectedMatch],
        queryFn: async () => {
            let query = supabase.from('match_statistics_summary').select('*');
            if (selectedMatch !== "all") {
                query = query.eq('match_id', selectedMatch);
            }
            const { data, error } = await query;
            if (error) throw error;

            // Map view columns to UI expected columns - normalize to team/opponent perspective
            return (data || []).map((m: any) => {
                const isHome = m.team_id === m.home_team_id;

                return {
                    match_id: m.match_id,

                    // Generic Team Stats (normalized - always "our team" perspective)
                    team_clearances: isHome ? m.home_clearances : m.away_clearances,
                    team_interceptions: isHome ? m.home_interceptions : m.away_interceptions,
                    team_successful_dribbles: isHome ? m.home_successful_dribbles : m.away_successful_dribbles,
                    team_chances_created: isHome ? m.home_chances_in_box : m.away_chances_in_box,
                    team_chances_final_third: isHome ? m.home_final_third_entries : m.away_final_third_entries,
                    team_aerial_duels_won: isHome ? m.home_aerial_duels_won : m.away_aerial_duels_won,
                    team_shots_on_target: isHome ? m.home_shots_on_target : m.away_shots_on_target,
                    team_fouls: isHome ? m.home_fouls_committed : m.away_fouls_committed,
                    team_saves: isHome ? m.home_saves : m.away_saves,
                    team_freekicks: isHome ? m.home_freekicks : m.away_freekicks,

                    // Generic Opponent Stats
                    opponent_clearances: isHome ? m.away_clearances : m.home_clearances,
                    opponent_interceptions: isHome ? m.away_interceptions : m.home_interceptions,
                    opponent_successful_dribbles: isHome ? m.away_successful_dribbles : m.home_successful_dribbles,
                    opponent_chances_created: isHome ? m.away_chances_in_box : m.home_chances_in_box,
                    opponent_chances_final_third: isHome ? m.away_final_third_entries : m.home_final_third_entries,
                    opponent_aerial_duels_won: isHome ? m.away_aerial_duels_won : m.home_aerial_duels_won,
                    opponent_fouls: isHome ? m.away_fouls_committed : m.home_fouls_committed,
                    opponent_saves: isHome ? m.away_saves : m.home_saves,
                    opponent_freekicks: isHome ? m.away_freekicks : m.home_freekicks,
                    opponent_shots_on_target: isHome ? m.away_shots_on_target : m.home_shots_on_target,
                    opponent_conversion_rate: null,

                    // Passing stats (normalized to team perspective using home_ prefix for compatibility)
                    home_successful_passes: isHome ? m.home_successful_passes : m.away_successful_passes,
                    home_unsuccessful_passes: isHome ? m.home_unsuccessful_passes : m.away_unsuccessful_passes,
                    home_total_passes: isHome ? m.home_total_passes : m.away_total_passes,
                    home_progressive_passes: isHome ? m.home_progressive_passes : m.away_progressive_passes,
                    home_key_passes: isHome ? m.home_key_passes : m.away_key_passes,
                    home_assists: isHome ? m.home_assists : m.away_assists,
                    home_crosses: isHome ? m.home_crosses : m.away_crosses,

                    // Opponent Passing stats (for comparison mode)
                    away_successful_passes: isHome ? m.away_successful_passes : m.home_successful_passes,
                    away_unsuccessful_passes: isHome ? m.away_unsuccessful_passes : m.home_unsuccessful_passes,
                    away_total_passes: isHome ? m.away_total_passes : m.home_total_passes,
                    away_progressive_passes: isHome ? m.away_progressive_passes : m.home_progressive_passes,
                    away_key_passes: isHome ? m.away_key_passes : m.home_key_passes,
                    away_assists: isHome ? m.away_assists : m.home_assists,
                    away_crosses: isHome ? m.away_crosses : m.home_crosses,

                    // Attacking stats
                    home_goals: isHome ? m.home_goals : m.away_goals,
                    home_penalties: isHome ? m.home_penalties : m.away_penalties,
                    home_shots_saved: isHome ? m.home_shots_saved : m.away_shots_saved,
                    away_goals: isHome ? m.away_goals : m.home_goals,

                    // Duels stats
                    home_aerial_duels_total: isHome ? m.home_aerial_duels_total : m.away_aerial_duels_total,
                    home_total_dribbles: isHome ? m.home_total_dribbles : m.away_total_dribbles,
                    home_progressive_carries: isHome ? m.home_progressive_carries : m.away_progressive_carries,
                    away_aerial_duels_total: isHome ? m.away_aerial_duels_total : m.home_aerial_duels_total,
                    away_total_dribbles: isHome ? m.away_total_dribbles : m.home_total_dribbles,
                    away_progressive_carries: isHome ? m.away_progressive_carries : m.home_progressive_carries,

                    // Defensive stats
                    home_blocks: isHome ? m.home_blocks : m.away_blocks,
                    home_ball_recoveries: isHome ? m.home_ball_recoveries : m.away_ball_recoveries,
                    home_high_press_recoveries: isHome ? m.home_high_press_recoveries : m.away_high_press_recoveries,
                    away_blocks: isHome ? m.away_blocks : m.home_blocks,
                    away_ball_recoveries: isHome ? m.away_ball_recoveries : m.home_ball_recoveries,

                    // Set pieces
                    home_corners: isHome ? m.home_corners : m.away_corners,
                    away_corners: isHome ? m.away_corners : m.home_corners,

                    // Goalkeeper stats
                    home_saves_inside_box: isHome ? m.home_saves_inside_box : m.away_saves_inside_box,
                    home_saves_outside_box: isHome ? m.home_saves_outside_box : m.away_saves_outside_box,
                    home_goals_conceded: isHome ? m.home_goals_conceded : m.away_goals_conceded,
                    away_saves_inside_box: isHome ? m.away_saves_inside_box : m.home_saves_inside_box,
                    away_saves_outside_box: isHome ? m.away_saves_outside_box : m.home_saves_outside_box,
                    away_goals_conceded: isHome ? m.away_goals_conceded : m.home_goals_conceded,

                    // Fouls and cards
                    home_yellow_cards: isHome ? m.home_yellow_cards : m.away_yellow_cards,
                    home_red_cards: isHome ? m.home_red_cards : m.away_red_cards,
                    away_yellow_cards: isHome ? m.away_yellow_cards : m.home_yellow_cards,
                    away_red_cards: isHome ? m.away_red_cards : m.home_red_cards,

                    // Indices - swap based on which team is ours
                    home_possession_control_index: isHome ? m.home_possession_control_index : m.away_possession_control_index,
                    home_chance_creation_index: isHome ? m.home_chance_creation_index : m.away_chance_creation_index,
                    home_shooting_efficiency: isHome ? m.home_shooting_efficiency : m.away_shooting_efficiency,
                    home_defensive_solidity: isHome ? m.home_defensive_solidity : m.away_defensive_solidity,
                    home_transition_progression: isHome ? m.home_transition_progression : m.away_transition_progression,
                    home_recovery_pressing_efficiency: isHome ? m.home_recovery_pressing_efficiency : m.away_recovery_pressing_efficiency,

                    away_possession_control_index: isHome ? m.away_possession_control_index : m.home_possession_control_index,
                    away_chance_creation_index: isHome ? m.away_chance_creation_index : m.home_chance_creation_index,
                    away_shooting_efficiency: isHome ? m.away_shooting_efficiency : m.home_shooting_efficiency,
                    away_defensive_solidity: isHome ? m.away_defensive_solidity : m.home_defensive_solidity,
                    away_transition_progression: isHome ? m.away_transition_progression : m.home_transition_progression,
                    away_recovery_pressing_efficiency: isHome ? m.away_recovery_pressing_efficiency : m.home_recovery_pressing_efficiency,
                } as unknown as MatchStatistics;
            });
        }
    });

    // Aggregate team stats
    const teamStats = useMemo(() => {
        // Guard against empty players array
        if (players.length === 0) {
            return { totalGoals: 0, totalAssists: 0, avgRating: 0, totalMatches: 0, playerCount: 0 };
        }

        // Filter players who participated in the selected match
        const activePlayers = selectedMatch === "all"
            ? players
            : players.filter(p => p.matchStats.some(m => m.matchId === selectedMatch));

        const relevantStats = activePlayers.flatMap(p =>
            p.matchStats.filter(m => selectedMatch === "all" || m.matchId === selectedMatch)
        );

        const totalGoals = relevantStats.reduce((a, m) => a + m.stats.goals, 0);
        const totalAssists = relevantStats.reduce((a, m) => a + m.stats.assists, 0);

        // Average rating from active players only
        const avgRating = activePlayers.length > 0
            ? Math.round(activePlayers.reduce((acc, p) => acc + p.overallRating, 0) / activePlayers.length)
            : 0;

        const totalMatches = selectedMatch === "all"
            ? Math.max(...players.map((p) => p.matchStats.length), 0)
            : 1;

        return { totalGoals, totalAssists, avgRating, totalMatches, playerCount: activePlayers.length };
    }, [players, selectedMatch]);

    // Position distribution for pie chart
    const positionData = useMemo(() => {
        const counts: Record<string, number> = {};
        players.forEach((p) => {
            counts[p.position] = (counts[p.position] || 0) + 1;
        });
        return Object.entries(counts).map(([name, value]) => ({ name, value }));
    }, [players]);

    // Top performers - filter by selected match
    const topPerformers = useMemo(() => {
        // Guard against empty array - reduce without initial value throws on empty arrays
        if (players.length === 0) {
            return { topScorer: null, topAssister: null, topRated: null };
        }

        // Filter players who participated in the selected match
        const activePlayers = selectedMatch === "all"
            ? players
            : players.filter(p => p.matchStats.some(m => m.matchId === selectedMatch));

        if (activePlayers.length === 0) {
            return { topScorer: null, topAssister: null, topRated: null };
        }

        // Helper to get goals for a player (filtered by match if applicable)
        const getPlayerGoals = (player: Player) => {
            if (selectedMatch === "all") {
                return player.matchStats.reduce((a, m) => a + m.stats.goals, 0);
            }
            const matchStat = player.matchStats.find(m => m.matchId === selectedMatch);
            return matchStat ? matchStat.stats.goals : 0;
        };

        // Helper to get assists for a player (filtered by match if applicable)
        const getPlayerAssists = (player: Player) => {
            if (selectedMatch === "all") {
                return player.matchStats.reduce((a, m) => a + m.stats.assists, 0);
            }
            const matchStat = player.matchStats.find(m => m.matchId === selectedMatch);
            return matchStat ? matchStat.stats.assists : 0;
        };

        const topScorer = activePlayers.reduce((prev, curr) => {
            const prevGoals = getPlayerGoals(prev);
            const currGoals = getPlayerGoals(curr);
            return currGoals > prevGoals ? curr : prev;
        });
        const topAssister = activePlayers.reduce((prev, curr) => {
            const prevAssists = getPlayerAssists(prev);
            const currAssists = getPlayerAssists(curr);
            return currAssists > prevAssists ? curr : prev;
        });
        const topRated = activePlayers.reduce((prev, curr) =>
            curr.overallRating > prev.overallRating ? curr : prev
        );

        return { topScorer, topAssister, topRated };
    }, [players, selectedMatch]);

    // Team trend data
    const teamTrendData = useMemo(() => {
        const matchMap = new Map<string, { goals: number; assists: number }>();

        players.forEach((player) => {
            player.matchStats.forEach((match) => {
                const key = match.opponent;
                const existing = matchMap.get(key) || { goals: 0, assists: 0 };
                matchMap.set(key, {
                    goals: existing.goals + match.stats.goals,
                    assists: existing.assists + match.stats.assists,
                });
            });
        });

        return Array.from(matchMap.entries()).map(([opponent, stats]) => ({
            name: `vs ${opponent.split(" ")[0]}`,
            Goals: stats.goals,
            Assists: stats.assists,
        }));
    }, [players]);

    // Generate dynamic formation positions
    const currentFormation = useMemo(() => getFormationByName(selectedFormation), [selectedFormation]);
    const formationDepthBounds = useMemo(() => {
        const ys = currentFormation.slots.map((s) => s.y);
        const minY = Math.min(...ys);
        const maxY = Math.max(...ys);
        return { minY, maxY, rangeY: Math.max(1, maxY - minY) };
    }, [currentFormation]);

    // Tactical visualizations (formation + passing) always use one concrete match.
    // If UI filter is "all", fall back to the latest match so we never mix multiple teams.
    const tacticalMatchId = useMemo(
        () => (selectedMatch !== "all" ? selectedMatch : (matches[0]?.id ?? "all")),
        [selectedMatch, matches],
    );
    const tacticalMatchInfo = useMemo(
        () => matches.find((m) => m.id === tacticalMatchId),
        [matches, tacticalMatchId],
    );

    // Get tactical players for the selected tactical match context.
    // Prefer full team rosters for that match (home + away) so formation/bench
    // are not limited to only players who logged an event.
    const activePlayers = useMemo(() => {
        if (tacticalMatchInfo) {
            const teamIds = new Set([tacticalMatchInfo.homeTeamId, tacticalMatchInfo.awayTeamId]);
            return players.filter((p) => teamIds.has(p.teamId));
        }
        return tacticalMatchId === "all"
            ? players
            : players.filter(p => p.matchStats.some(m => m.matchId === tacticalMatchId));
    }, [players, tacticalMatchId, tacticalMatchInfo]);

    // Group active players by team for formation view
    const {
        homeTeamPlayers,
        homeStartingPlayers,
        opponentPlayers,
        opponentStartingPlayers,
        homeTeamId,
        homeTeamName,
        opponentTeamName,
    } = useMemo(() => {
        const selectStartingEleven = (teamPlayers: typeof activePlayers) => {
            const positionPriority: { match: string[]; count: number }[] = [
                { match: ['GK', 'Goalkeeper', 'keeper'], count: 1 },
                { match: ['CB', 'LB', 'RB', 'Defender', 'Back', 'LCB', 'RCB', 'LWB', 'RWB'], count: 4 },
                { match: ['CM', 'CDM', 'CAM', 'LM', 'RM', 'Midfielder', 'Mid'], count: 3 },
                { match: ['ST', 'CF', 'LW', 'RW', 'Forward', 'Striker', 'Winger', 'Attacker'], count: 3 },
            ];
            const selected: typeof activePlayers = [];
            const usedIds = new Set<string>();
            for (const { match, count } of positionPriority) {
                const candidates = teamPlayers
                    .filter(p => !usedIds.has(p.id) && match.some(m => p.position.toLowerCase().includes(m.toLowerCase())))
                    .sort((a, b) => (b.overallRating || 0) - (a.overallRating || 0));
                for (let i = 0; i < Math.min(count, candidates.length); i++) {
                    selected.push(candidates[i]);
                    usedIds.add(candidates[i].id);
                }
            }
            const remaining = teamPlayers
                .filter(p => !usedIds.has(p.id))
                .sort((a, b) => (b.overallRating || 0) - (a.overallRating || 0));
            for (let i = 0; selected.length < 11 && i < remaining.length; i++) {
                selected.push(remaining[i]);
            }
            return selected;
        };

        // Group by teamId
        const teamGroups = new Map<string, { players: typeof activePlayers; teamName: string }>();
        activePlayers.forEach(p => {
            if (!teamGroups.has(p.teamId)) {
                teamGroups.set(p.teamId, { players: [], teamName: p.team });
            }
            teamGroups.get(p.teamId)!.players.push(p);
        });

        // Sort by player count descending for fallback when no specific match selected
        const sortedTeams = [...teamGroups.entries()].sort(
            (a, b) => b[1].players.length - a[1].players.length
        );

        let derivedHomeTeamId = sortedTeams[0]?.[0] || "";
        let homePool = sortedTeams[0]?.[1]?.players || [];
        let homeTeamName = sortedTeams[0]?.[1]?.teamName || "Home Team";
        let opponentPool: typeof activePlayers = [];
        let opponentTeamName = "Opponent";

        // Prefer explicit match team IDs when a specific match is selected
        if (tacticalMatchInfo && tacticalMatchId !== "all") {
            const explicitHomeTeamId = tacticalMatchInfo.ourTeamId;
            const explicitOpponentTeamId =
                explicitHomeTeamId === tacticalMatchInfo.homeTeamId
                    ? tacticalMatchInfo.awayTeamId
                    : tacticalMatchInfo.homeTeamId;

            if (explicitHomeTeamId && teamGroups.has(explicitHomeTeamId)) {
                derivedHomeTeamId = explicitHomeTeamId;
                homePool = teamGroups.get(explicitHomeTeamId)!.players;
                homeTeamName = teamGroups.get(explicitHomeTeamId)!.teamName;
            }
            if (explicitOpponentTeamId && teamGroups.has(explicitOpponentTeamId)) {
                opponentPool = teamGroups.get(explicitOpponentTeamId)!.players;
                opponentTeamName = teamGroups.get(explicitOpponentTeamId)!.teamName;
            }

            // Fallback when explicit IDs exist in match row but no player rows resolved
            if (opponentPool.length === 0) {
                const fallbackOpponent = sortedTeams.find(([tid]) => tid !== derivedHomeTeamId);
                if (fallbackOpponent) {
                    opponentPool = fallbackOpponent[1].players;
                    opponentTeamName = fallbackOpponent[1].teamName;
                }
            }
        } else {
            // "All matches" fallback: pick the largest non-home team
            const primaryOpponentTeam = sortedTeams.find(([tid]) => tid !== derivedHomeTeamId);
            if (primaryOpponentTeam) {
                opponentPool = primaryOpponentTeam[1].players;
                opponentTeamName = primaryOpponentTeam[1].teamName;
            }
        }

        const homeStartingPlayers = selectStartingEleven(homePool);
        const opponentStartingPlayers = selectStartingEleven(opponentPool);

        return {
            homeTeamPlayers: homePool,
            homeStartingPlayers,
            opponentPlayers: opponentPool,
            opponentStartingPlayers,
            homeTeamId: derivedHomeTeamId,
            homeTeamName,
            opponentTeamName,
        };
    }, [activePlayers, tacticalMatchInfo, tacticalMatchId]);

    // Compute default formation assignment for current match + formation
    const getDefaultFieldAssignment = useCallback(() => {
        if (homeTeamPlayers.length === 0) return [] as string[];

        const formation = getFormationByName(selectedFormation);
        const assigned: string[] = [];
        const usedPlayerIds = new Set<string>();

        formation.slots.forEach((slot) => {
            const candidates = homeTeamPlayers.filter(
                (p) =>
                    !usedPlayerIds.has(p.id) &&
                    slot.preferredPositions.some(
                        (pref) =>
                            p.position.toLowerCase().includes(pref.toLowerCase()) ||
                            pref.toLowerCase().includes(p.position.toLowerCase()),
                    ),
            );

            const bestCandidate = candidates.sort(
                (a, b) => (b.overallRating || 0) - (a.overallRating || 0),
            )[0];

            if (bestCandidate) {
                assigned.push(bestCandidate.id);
                usedPlayerIds.add(bestCandidate.id);
            } else {
                const fallback = homeTeamPlayers.find((p) => !usedPlayerIds.has(p.id));
                if (fallback) {
                    assigned.push(fallback.id);
                    usedPlayerIds.add(fallback.id);
                } else {
                    assigned.push("");
                }
            }
        });

        return assigned;
    }, [homeTeamPlayers, selectedFormation]);

    // Opponent player nodes with normalized depth on right half (limited to 11 players)
    const opponentNodes = useMemo(() => {
        const positionCounts = new Map<string, number>();
        const positionIndices = new Map<string, number>();
        
        // Count positions
        opponentStartingPlayers.forEach(p => {
            const key = p.position;
            positionCounts.set(key, (positionCounts.get(key) || 0) + 1);
        });
        
        // Assign base positions from role map
        const baseNodes = opponentStartingPlayers.map(player => {
            const key = player.position;
            const idx = positionIndices.get(key) || 0;
            positionIndices.set(key, idx + 1);
            const totalSamePos = positionCounts.get(key) || 1;
            
            const { x, y } = getPositionCoords(player.position, false, idx, totalSamePos);
            return { player, x, y };
        });

        // Normalize depth to occupy the full right half (midline -> goal)
        const xs = baseNodes.map((n) => n.x);
        const minX = Math.min(...xs);
        const maxX = Math.max(...xs);
        const rangeX = Math.max(1, maxX - minX);

        return baseNodes.map((n) => ({
            ...n,
            x: 56.5 + ((n.x - minX) / rangeX) * 43.5,
        }));
    }, [opponentStartingPlayers]);

    // Auto-assign home team players to formation slots when match or formation changes
    useEffect(() => {
        setFieldPlayerIds(getDefaultFieldAssignment());
    }, [getDefaultFieldAssignment, tacticalMatchId]);

    const handleResetFormation = useCallback(() => {
        setFieldPlayerIds(getDefaultFieldAssignment());
        setDraggedPlayerId(null);
        setSwapConfirmation(null);
    }, [getDefaultFieldAssignment]);

    // Field players with their slot positions (home team only)
    const fieldPlayers = useMemo(() => {
        const formation = getFormationByName(selectedFormation);
        return formation.slots.map((slot, index) => {
            const playerId = fieldPlayerIds[index];
            const player = homeTeamPlayers.find(p => p.id === playerId);
            return { slot, player: player || null };
        });
    }, [fieldPlayerIds, homeTeamPlayers, selectedFormation]);

    // Bench players (home team only, not on field)
    const benchPlayers = useMemo(() => {
        const fieldIds = new Set(fieldPlayerIds);
        return homeTeamPlayers.filter(p => !fieldIds.has(p.id));
    }, [homeTeamPlayers, fieldPlayerIds]);

    // Drag-drop handlers
    const handleDragStart = (playerId: string) => {
        setDraggedPlayerId(playerId);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
    };

    const handleDropOnField = (targetSlotIndex: number) => {
        if (!draggedPlayerId) return;

        const draggedPlayer = players.find(p => p.id === draggedPlayerId);
        const targetPlayerId = fieldPlayerIds[targetSlotIndex];
        const targetPlayer = players.find(p => p.id === targetPlayerId);

        if (!draggedPlayer) return;

        // Show confirmation dialog
        setSwapConfirmation({
            from: draggedPlayer.name,
            to: targetPlayer?.name || 'Empty slot',
            slotIndex: targetSlotIndex
        });
    };

    const confirmSwap = () => {
        if (!swapConfirmation || !draggedPlayerId) return;

        const newFieldPlayerIds = [...fieldPlayerIds];
        const draggedIsOnField = fieldPlayerIds.includes(draggedPlayerId);
        const targetPlayerId = fieldPlayerIds[swapConfirmation.slotIndex];

        if (draggedIsOnField) {
            // Swapping two field players
            const draggedIndex = fieldPlayerIds.indexOf(draggedPlayerId);
            newFieldPlayerIds[draggedIndex] = targetPlayerId;
            newFieldPlayerIds[swapConfirmation.slotIndex] = draggedPlayerId;
        } else {
            // Swapping bench player with field player
            newFieldPlayerIds[swapConfirmation.slotIndex] = draggedPlayerId;
        }

        setFieldPlayerIds(newFieldPlayerIds);
        setDraggedPlayerId(null);
        setSwapConfirmation(null);
    };

    const cancelSwap = () => {
        setDraggedPlayerId(null);
        setSwapConfirmation(null);
    };

    const handleDropOnBench = () => {
        // If dragging a field player to bench, we need to swap with a bench player
        // For simplicity, this will just reset the drag state
        setDraggedPlayerId(null);
    };

    // Get all goal moments (shots that were successful)
    const goalMoments = useMemo(() => {
        const goals: GoalMoment[] = [];

        players.forEach((player) => {
            player.matchStats.forEach((match) => {
                // Filter shots that were successful (goals)
                const goalEvents = match.events.filter((e) => e.type === "shot" && e.success);
                goalEvents.forEach((event) => {
                    goals.push({
                        matchId: match.matchId,
                        opponent: match.opponent,
                        minute: event.minute,
                        scorer: player,
                        event,
                    });
                });
            });
        });

        // Sort by match and minute
        return goals.sort((a, b) => {
            if (a.matchId !== b.matchId) return a.matchId.localeCompare(b.matchId);
            return a.minute - b.minute;
        });
    }, [players]);

    // Filter goal moments by selected match and half
    const filteredGoals = useMemo(() => {
        let goals = selectedMatch === "all" ? goalMoments : goalMoments.filter((g) => g.matchId === selectedMatch);
        if (goalHalfFilter === '1st') {
            goals = goals.filter(g => g.minute <= 45);
        } else if (goalHalfFilter === '2nd') {
            goals = goals.filter(g => g.minute > 45);
        }
        return goals;
    }, [goalMoments, selectedMatch, goalHalfFilter]);

    const currentGoal = filteredGoals[currentGoalIndex];

    // Playback controls
    const handleNextGoal = () => {
        setCurrentGoalIndex((prev) => (prev + 1) % filteredGoals.length);
    };

    const handleReset = () => {
        setCurrentGoalIndex(0);
        setIsPlaying(false);
    };

    // Reset index when match changes
    useEffect(() => {
        setCurrentGoalIndex(0);
        setIsPlaying(false);
    }, [selectedMatch]);

    // Auto-play effect
    useEffect(() => {
        if (isPlaying && filteredGoals.length > 0) {
            const interval = setInterval(() => {
                setCurrentGoalIndex((prev) => {
                    const next = prev + 1;
                    if (next >= filteredGoals.length) {
                        setIsPlaying(false);
                        return 0;
                    }
                    return next;
                });
            }, 2000);
            return () => clearInterval(interval);
        }
    }, [isPlaying, filteredGoals.length]);

    return (
        <div className={embedded ? "bg-background" : "min-h-screen bg-background"}>
            {!embedded && <AuthHeader title="Team Analytics" />}
            {!embedded && <Sidebar />}

            {/* Section Navigation */}
            <SectionNav
                activeSection={activeSection}
                onSectionClick={handleSectionClick}
                isCollapsed={isCollapsed}
                embedded={embedded}
            />

            <main className={cn(
                embedded ? "pb-12 px-6" : "pt-24 pb-12 px-6 transition-all duration-300",
                !embedded && (isCollapsed ? "ml-16" : "ml-64")
            )}>
                <div className="container mx-auto">
                    {/* Page Header */}
                    <motion.div
                        className="mb-8"
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                    >
                        <h1 className="text-3xl font-bold text-foreground mb-2">
                            Team <span className="text-primary">Analytics</span>
                        </h1>
                        <p className="text-muted-foreground">
                            Comprehensive overview of your team's collective performance
                        </p>
                    </motion.div>

                    {/* Match Selector */}
                    <motion.div
                        id="overview"
                        ref={(el) => { sectionRefs.current['overview'] = el; }}
                        className="mb-8 scroll-mt-24"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                    >
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
                            {/* All Matches Option */}
                            <motion.div
                                onClick={() => setSelectedMatch("all")}
                                className={cn(
                                    "relative p-3 rounded-lg border cursor-pointer transition-all duration-200",
                                    selectedMatch === "all"
                                        ? "bg-primary/10 border-primary shadow-md"
                                        : "bg-secondary/50 border-border hover:border-primary/50 hover:bg-secondary"
                                )}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <div className="flex justify-between items-start mb-1">
                                    <span className="text-sm font-bold">All Matches</span>
                                    {selectedMatch === "all" && (
                                        <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                                    )}
                                </div>
                                <div className="flex items-center gap-1.5 mt-2">
                                    <CalendarDays className="w-3.5 h-3.5 text-muted-foreground" />
                                    <span className="text-xs text-muted-foreground">Season Overview</span>
                                </div>
                            </motion.div>

                            {/* Individual Matches */}
                            {matches.map((match) => (
                                <motion.div
                                    key={match.id}
                                    onClick={() => setSelectedMatch(match.id)}
                                    className={cn(
                                        "relative p-3 rounded-lg border cursor-pointer transition-all duration-200",
                                        selectedMatch === match.id
                                            ? "bg-primary/10 border-primary shadow-md"
                                            : "bg-secondary/50 border-border hover:border-primary/50 hover:bg-secondary"
                                    )}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    <div className="flex justify-between items-start mb-1">
                                        <span className="text-sm font-bold truncate pr-2">vs {match.opponent}</span>
                                        {selectedMatch === match.id && (
                                            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                                        )}
                                    </div>
                                    <div className="flex items-center gap-1.5 mt-2">
                                        <CalendarDays className="w-3.5 h-3.5 text-muted-foreground" />
                                        <span className="text-xs text-muted-foreground">
                                            {new Date(match.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                        </span>
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        {/* View Mode Toggle */}
                        <div className="flex items-center justify-end gap-2 mt-4">
                            <span className="text-xs text-muted-foreground">View:</span>
                            <div className="flex items-center border border-border rounded-lg overflow-hidden bg-secondary/30">
                                <Button
                                    variant={viewMode === 'single' ? 'default' : 'ghost'}
                                    size="sm"
                                    onClick={() => setViewMode('single')}
                                    className={cn(
                                        "h-8 px-3 text-xs rounded-none gap-1.5",
                                        viewMode === 'single' && "shadow-md"
                                    )}
                                >
                                    <User className="w-3.5 h-3.5" />
                                    Single Team
                                </Button>
                                <div className="w-px h-5 bg-border" />
                                <Button
                                    variant={viewMode === 'comparison' ? 'default' : 'ghost'}
                                    size="sm"
                                    onClick={() => setViewMode('comparison')}
                                    className={cn(
                                        "h-8 px-3 text-xs rounded-none gap-1.5",
                                        viewMode === 'comparison' && "shadow-md"
                                    )}
                                >
                                    <GitCompare className="w-3.5 h-3.5" />
                                    Compare Teams
                                </Button>
                            </div>
                        </div>
                    </motion.div>


                    {/* Advanced Statistics Section - REORDERED */}
                    <motion.div
                        id="advanced"
                        ref={(el) => { sectionRefs.current['advanced'] = el; }}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.15 }}
                        className="mb-8 scroll-mt-24"
                    >
                        <Card className="glass-strong rounded-xl">
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <svg className="w-5 h-5 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M12 2L2 7l10 5 10-5-10-5z" />
                                        <path d="M2 17l10 5 10-5" />
                                        <path d="M2 12l10 5 10-5" />
                                    </svg>
                                    Advanced Statistics
                                </CardTitle>
                                <p className="text-sm text-muted-foreground">Detailed match performance metrics</p>
                            </CardHeader>
                            <CardContent>
                                {(() => {
                                    // Use fetched match statistics
                                    const relevantStats = matchStatsList;
                                    const isAggregation = selectedMatch === "all";

                                    // Team stats - Use sumWithNull to preserve null for missing data
                                    const teamClearances = sumWithNull(relevantStats, m => m.team_clearances);
                                    const teamInterceptions = sumWithNull(relevantStats, m => m.team_interceptions);
                                    const teamDribbles = sumWithNull(relevantStats, m => m.team_successful_dribbles);
                                    const teamRecoveries = sumWithNull(relevantStats, m => (m as any).home_ball_recoveries);
                                    const teamPassesInBox = sumWithNull(relevantStats, m => m.team_chances_created);
                                    const teamPassesFinalThird = sumWithNull(relevantStats, m => m.team_chances_final_third);
                                    const teamAerialDuels = sumWithNull(relevantStats, m => m.team_aerial_duels_won);
                                    const teamShotsOnTarget = sumWithNull(relevantStats, m => m.team_shots_on_target);
                                    const teamShots = teamShotsOnTarget !== null ? teamShotsOnTarget * 2 : null; // Est total shots

                                    // Opponent stats
                                    const oppClearances = sumWithNull(relevantStats, m => m.opponent_clearances);
                                    const oppInterceptions = sumWithNull(relevantStats, m => m.opponent_interceptions);
                                    const oppDribbles = sumWithNull(relevantStats, m => m.opponent_successful_dribbles);
                                    const oppRecoveries = sumWithNull(relevantStats, m => (m as any).away_ball_recoveries);
                                    const oppPassesInBox = sumWithNull(relevantStats, m => m.opponent_chances_created);
                                    const oppPassesFinalThird = sumWithNull(relevantStats, m => m.opponent_chances_final_third);
                                    const oppAerialDuels = sumWithNull(relevantStats, m => m.opponent_aerial_duels_won);

                                    const teamFouls = sumWithNull(relevantStats, m => m.team_fouls);
                                    const oppFouls = sumWithNull(relevantStats, m => m.opponent_fouls);
                                    const teamSaves = sumWithNull(relevantStats, m => m.team_saves);
                                    const oppSaves = sumWithNull(relevantStats, m => m.opponent_saves);
                                    const teamFreeKicks = sumWithNull(relevantStats, m => m.team_freekicks);
                                    const oppFreeKicks = sumWithNull(relevantStats, m => m.opponent_freekicks);

                                    const teamConversion = teamShots !== null && teamShots > 0 && teamShotsOnTarget !== null
                                        ? Math.round((teamShotsOnTarget / teamShots) * 100) : null;

                                    const oppShotsOnTarget = sumWithNull(relevantStats, m => m.opponent_shots_on_target);
                                    const oppShots = oppShotsOnTarget !== null ? oppShotsOnTarget * 2 : null; // Estimate
                                    const oppConversion = oppShots !== null && oppShots > 0 && oppShotsOnTarget !== null
                                        ? Math.round((oppShotsOnTarget / oppShots) * 100) : null;

                                    // Match info for header
                                    const currentMatchInfo = dbMatches.find(m => m.id === selectedMatch);
                                    const teamName = currentMatchInfo?.homeTeam || "Our Team";
                                    const opponentName = selectedMatch === "all" ? "All Opponents" : currentMatchInfo?.opponent || "Opponent";

                                    const advancedStats = [
                                        {
                                            label: "Chances Created (In Box)",
                                            team: teamPassesInBox,
                                            opponent: oppPassesInBox,
                                            icon: <TrendingUp className="w-4 h-4" />
                                        },
                                        {
                                            label: "Chances Created (Final Third)",
                                            team: teamPassesFinalThird,
                                            opponent: oppPassesFinalThird,
                                            icon: <TrendingUp className="w-4 h-4" />
                                        },
                                        {
                                            label: "Clearances",
                                            team: teamClearances,
                                            opponent: oppClearances,
                                            icon: <Shield className="w-4 h-4" />
                                        },
                                        {
                                            label: "Interceptions",
                                            team: teamInterceptions,
                                            opponent: oppInterceptions,
                                            icon: <Target className="w-4 h-4" />
                                        },
                                        {
                                            label: "Successful Dribbles",
                                            team: teamDribbles,
                                            opponent: oppDribbles,
                                            icon: <Flame className="w-4 h-4" />
                                        },
                                        {
                                            label: "Ball Recoveries",
                                            team: teamRecoveries,
                                            opponent: oppRecoveries,
                                            icon: <Footprints className="w-4 h-4" />
                                        },
                                    ];

                                    const bottomStats = [
                                        { label: "AERIAL DUELS WON", team: teamAerialDuels, opponent: oppAerialDuels },
                                        { label: "FOULS", team: teamFouls, opponent: oppFouls },
                                        { label: "SAVES", team: teamSaves, opponent: oppSaves },
                                        { label: "FREE KICKS", team: teamFreeKicks, opponent: oppFreeKicks },
                                        { label: "CONVERSION RATE", team: teamConversion !== null ? `${teamConversion}%` : "--", opponent: oppConversion !== null ? `${Math.round(oppConversion)}%` : "--" },
                                    ];

                                    // Indices from DB - use avgWithNull to preserve null for missing data
                                    const pci = avgWithNull(relevantStats, m => (m as any).home_possession_control_index);
                                    const cci = avgWithNull(relevantStats, m => (m as any).home_chance_creation_index);
                                    const se = avgWithNull(relevantStats, m => (m as any).home_shooting_efficiency);
                                    const ds = avgWithNull(relevantStats, m => (m as any).home_defensive_solidity);
                                    const tp = avgWithNull(relevantStats, m => (m as any).home_transition_progression);
                                    const rpe = avgWithNull(relevantStats, m => (m as any).home_recovery_pressing_efficiency);

                                    // Opponent indices (using away_*)
                                    const oppPci = avgWithNull(relevantStats, m => (m as any).away_possession_control_index);
                                    const oppCci = avgWithNull(relevantStats, m => (m as any).away_chance_creation_index);
                                    const oppSe = avgWithNull(relevantStats, m => (m as any).away_shooting_efficiency);
                                    const oppDs = avgWithNull(relevantStats, m => (m as any).away_defensive_solidity);
                                    const oppTp = avgWithNull(relevantStats, m => (m as any).away_transition_progression);
                                    const oppRpe = avgWithNull(relevantStats, m => (m as any).away_recovery_pressing_efficiency);

                                    const hexagonData = [
                                        { label: "PCI", teamValue: pci, opponentValue: oppPci, maxValue: 100 },
                                        { label: "CCI", teamValue: cci, opponentValue: oppCci, maxValue: 100 },
                                        { label: "SE", teamValue: se, opponentValue: oppSe, maxValue: 100 },
                                        { label: "DS", teamValue: ds, opponentValue: oppDs, maxValue: 100 },
                                        { label: "T&P", teamValue: tp, opponentValue: oppTp, maxValue: 100 },
                                    ];


                                    // Calculate totals for head-to-head metrics
                                    const teamTotalPasses = sumWithNull(relevantStats, m => (m as any).home_total_passes);
                                    const oppTotalPasses = sumWithNull(relevantStats, m => (m as any).away_total_passes);
                                    const possessionTeam = teamTotalPasses !== null && oppTotalPasses !== null && (teamTotalPasses + oppTotalPasses) > 0
                                        ? Math.round((teamTotalPasses / (teamTotalPasses + oppTotalPasses)) * 100)
                                        : null;
                                    const possessionOpp = possessionTeam !== null ? 100 - possessionTeam : null;

                                    const teamGoals = sumWithNull(relevantStats, m => (m as any).home_goals);
                                    const oppGoals = sumWithNull(relevantStats, m => (m as any).away_goals);

                                    return (
                                        <>
                                            {/* Team Names Header with color indicators */}
                                            <div className="flex items-center justify-center gap-4 mb-6">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: TEAM_COLORS.home }} />
                                                    <span className="font-medium text-foreground">{teamName}</span>
                                                </div>
                                                <span className="text-muted-foreground font-bold">vs</span>
                                                <div className="flex items-center gap-2">
                                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: TEAM_COLORS.away }} />
                                                    <span className="text-muted-foreground">{opponentName}</span>
                                                </div>
                                            </div>

                                            {/* Comparison View - Side-by-side stats */}
                                            {viewMode === 'comparison' && (
                                                <>
                                                    {/* Head-to-Head Summary */}
                                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                                                        <ComparisonStatCard
                                                            label="Goals"
                                                            teamValue={teamGoals}
                                                            opponentValue={oppGoals}
                                                            teamName={teamName}
                                                            opponentName={opponentName}
                                                            icon={<Target className="w-4 h-4" />}
                                                        />
                                                        <ComparisonStatCard
                                                            label="Possession"
                                                            teamValue={possessionTeam !== null ? `${possessionTeam}%` : null}
                                                            opponentValue={possessionOpp !== null ? `${possessionOpp}%` : null}
                                                            teamName={teamName}
                                                            opponentName={opponentName}
                                                            icon={<Footprints className="w-4 h-4" />}
                                                        />
                                                        <ComparisonStatCard
                                                            label="Shots on Target"
                                                            teamValue={teamShotsOnTarget}
                                                            opponentValue={oppShotsOnTarget}
                                                            teamName={teamName}
                                                            opponentName={opponentName}
                                                            icon={<Target className="w-4 h-4" />}
                                                        />
                                                        <ComparisonStatCard
                                                            label="Fouls"
                                                            teamValue={teamFouls}
                                                            opponentValue={oppFouls}
                                                            teamName={teamName}
                                                            opponentName={opponentName}
                                                            icon={<Shield className="w-4 h-4" />}
                                                            reverseColors
                                                        />
                                                    </div>

                                                    {/* Detailed Comparison Bars */}
                                                    <div className="p-4 rounded-xl bg-gradient-to-br from-secondary/30 to-background border border-border mb-6">
                                                        <h4 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                                                            <GitCompare className="w-4 h-4 text-primary" />
                                                            Detailed Comparison
                                                        </h4>
                                                        <div className="grid gap-4">
                                                            {advancedStats.map((stat, i) => (
                                                                <ComparisonBar
                                                                    key={stat.label}
                                                                    label={stat.label}
                                                                    teamValue={stat.team}
                                                                    opponentValue={stat.opponent}
                                                                    teamName={teamName}
                                                                    opponentName={opponentName}
                                                                    icon={stat.icon}
                                                                />
                                                            ))}
                                                        </div>
                                                    </div>

                                                    {/* Bottom Stats Grid */}
                                                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
                                                        {bottomStats.map((stat) => (
                                                            <ComparisonStatCard
                                                                key={stat.label}
                                                                label={stat.label}
                                                                teamValue={stat.team}
                                                                opponentValue={stat.opponent}
                                                                teamName={teamName}
                                                                opponentName={opponentName}
                                                                reverseColors={stat.label === "FOULS"}
                                                            />
                                                        ))}
                                                    </div>
                                                </>
                                            )}

                                            {/* Hexagon Radar Chart - Full Width */}
                                            <div className="flex flex-col items-center justify-center p-6 rounded-xl bg-gradient-to-br from-secondary/50 to-background border border-border mb-6">
                                                <h4 className="text-sm font-semibold text-foreground mb-4">Performance Indices Overview</h4>
                                                <HexagonRadar
                                                    data={hexagonData}
                                                    teamName={teamName}
                                                    opponentName={opponentName}
                                                    size={380}
                                                />
                                                {/* Legend for indices */}
                                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mt-6 w-full">
                                                    {[
                                                        { label: "PCI", full: "Possession Control Index", statId: "pci" },
                                                        { label: "CCI", full: "Chance Creation Index", statId: "cci" },
                                                        { label: "SE", full: "Shooting Efficiency", statId: "se" },
                                                        { label: "DS", full: "Defensive Solidity", statId: "ds" },
                                                        { label: "T&P", full: "Transition & Progression", statId: "tp" },
                                                    ].map((item) => (
                                                        <div key={item.label} className="text-center p-2 rounded-lg bg-background/50">
                                                            <StatHint statId={item.statId} iconSize="sm">
                                                                <span className="text-xs font-bold text-primary">{item.label}</span>
                                                            </StatHint>
                                                            <p className="text-[10px] text-muted-foreground">{item.full}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>


                                        </>
                                    );
                                })()}
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Statistics Breakdown - Two Expandable Sunburst Charts */}
                    {(() => {
                        // Build hierarchical stats data from match statistics
                        const relevantStats = matchStatsList;

                        // Get match info for team names in comparison view
                        const currentMatchInfo = dbMatches.find(m => m.id === selectedMatch);
                        const breakdownTeamName = currentMatchInfo?.homeTeam || "Our Team";
                        const breakdownOpponentName = selectedMatch === "all" ? "All Opponents" : currentMatchInfo?.opponent || "Opponent";

                        // Get aggregated values for Passes - Team
                        const successfulPasses = sumWithNull(relevantStats, m => (m as any).home_successful_passes) ?? 0;
                        const unsuccessfulPasses = sumWithNull(relevantStats, m => (m as any).home_unsuccessful_passes) ?? 0;
                        const progressivePasses = sumWithNull(relevantStats, m => (m as any).home_progressive_passes) ?? 0;
                        const keyPasses = sumWithNull(relevantStats, m => (m as any).home_key_passes) ?? 0;
                        const assists = sumWithNull(relevantStats, m => (m as any).home_assists) ?? 0;
                        const crosses = sumWithNull(relevantStats, m => (m as any).home_crosses) ?? 0;
                        const longPasses = sumWithNull(relevantStats, m => (m as any).home_long_passes) ?? Math.floor(successfulPasses * 0.15);
                        const shortPasses = sumWithNull(relevantStats, m => (m as any).home_short_passes) ?? Math.floor(successfulPasses * 0.5);
                        const throughBalls = sumWithNull(relevantStats, m => (m as any).home_through_balls) ?? Math.floor(keyPasses * 0.3);

                        // Get aggregated values for Passes - Opponent
                        const oppSuccessfulPasses = sumWithNull(relevantStats, m => (m as any).away_successful_passes) ?? 0;
                        const oppUnsuccessfulPasses = sumWithNull(relevantStats, m => (m as any).away_unsuccessful_passes) ?? 0;
                        const oppProgressivePasses = sumWithNull(relevantStats, m => (m as any).away_progressive_passes) ?? 0;
                        const oppKeyPasses = sumWithNull(relevantStats, m => (m as any).away_key_passes) ?? 0;
                        const oppAssists = sumWithNull(relevantStats, m => (m as any).away_assists) ?? 0;
                        const oppCrosses = sumWithNull(relevantStats, m => (m as any).away_crosses) ?? 0;

                        // Unsuccessful passes breakdown
                        const passesBlocked = sumWithNull(relevantStats, m => (m as any).home_passes_blocked) ?? Math.floor(unsuccessfulPasses * 0.2);
                        const passesClearance = sumWithNull(relevantStats, m => (m as any).home_passes_cleared) ?? Math.floor(unsuccessfulPasses * 0.15);
                        const passesIntercepted = sumWithNull(relevantStats, m => (m as any).home_passes_intercepted) ?? Math.floor(unsuccessfulPasses * 0.25);
                        const passesOffside = sumWithNull(relevantStats, m => (m as any).home_passes_offside) ?? Math.floor(unsuccessfulPasses * 0.05);
                        const passesBallRecoveries = sumWithNull(relevantStats, m => (m as any).home_passes_ball_recoveries) ?? Math.floor(unsuccessfulPasses * 0.2);
                        const passesHighPressing = sumWithNull(relevantStats, m => (m as any).home_passes_high_pressing) ?? Math.floor(unsuccessfulPasses * 0.15);

                        // Get aggregated values for Duels - Team
                        const aerialDuelsWon = sumWithNull(relevantStats, m => m.team_aerial_duels_won) ?? 0;
                        const aerialDuelsTotal = sumWithNull(relevantStats, m => (m as any).home_aerial_duels_total) ?? aerialDuelsWon * 2;
                        const aerialDuelsLost = Math.max(0, aerialDuelsTotal - aerialDuelsWon);
                        const successfulDribbles = sumWithNull(relevantStats, m => m.team_successful_dribbles) ?? 0;
                        const totalDribbles = sumWithNull(relevantStats, m => (m as any).home_total_dribbles) ?? successfulDribbles * 2;
                        const unsuccessfulDribbles = Math.max(0, totalDribbles - successfulDribbles);
                        const progressiveCarries = sumWithNull(relevantStats, m => (m as any).home_progressive_carries) ?? 0;
                        const tacklesWon = sumWithNull(relevantStats, m => (m as any).home_tackles_won) ?? Math.floor(aerialDuelsWon * 0.8);
                        const tacklesLost = sumWithNull(relevantStats, m => (m as any).home_tackles_lost) ?? Math.floor(tacklesWon * 0.3);
                        const dribbleSuccessRate = totalDribbles > 0 ? Math.round((successfulDribbles / totalDribbles) * 100) : 0;

                        // Get aggregated values for Duels - Opponent
                        const oppAerialDuelsWon = sumWithNull(relevantStats, m => m.opponent_aerial_duels_won) ?? 0;
                        const oppSuccessfulDribbles = sumWithNull(relevantStats, m => m.opponent_successful_dribbles) ?? 0;
                        const oppProgressiveCarries = sumWithNull(relevantStats, m => (m as any).away_progressive_carries) ?? 0;

                        // Get aggregated values for Set Pieces - Team
                        const corners = sumWithNull(relevantStats, m => (m as any).home_corners) ?? 0;
                        const cornersFirstContact = sumWithNull(relevantStats, m => (m as any).home_corners_first_contact) ?? Math.floor(corners * 0.7);
                        const cornersSecondContact = sumWithNull(relevantStats, m => (m as any).home_corners_second_contact) ?? Math.floor(corners * 0.3);
                        const freeKicks = sumWithNull(relevantStats, m => m.team_freekicks) ?? 0;
                        const freeKicksFirstContact = sumWithNull(relevantStats, m => (m as any).home_freekicks_first_contact) ?? Math.floor(freeKicks * 0.6);
                        const freeKicksSecondContact = sumWithNull(relevantStats, m => (m as any).home_freekicks_second_contact) ?? Math.floor(freeKicks * 0.4);
                        const goalKicks = sumWithNull(relevantStats, m => (m as any).home_goal_kicks) ?? Math.floor(corners * 2);
                        const goalKicksFirstContact = sumWithNull(relevantStats, m => (m as any).home_goal_kicks_first_contact) ?? Math.floor(goalKicks * 0.8);
                        const goalKicksSecondContact = sumWithNull(relevantStats, m => (m as any).home_goal_kicks_second_contact) ?? Math.floor(goalKicks * 0.2);
                        const throwIns = sumWithNull(relevantStats, m => (m as any).home_throw_ins) ?? Math.floor(corners * 3);
                        const throwInsFirstContact = sumWithNull(relevantStats, m => (m as any).home_throw_ins_first_contact) ?? Math.floor(throwIns * 0.75);
                        const throwInsSecondContact = sumWithNull(relevantStats, m => (m as any).home_throw_ins_second_contact) ?? Math.floor(throwIns * 0.25);

                        // Get aggregated values for Set Pieces - Opponent
                        const oppCorners = sumWithNull(relevantStats, m => (m as any).away_corners) ?? 0;
                        const oppFreeKicks = sumWithNull(relevantStats, m => m.opponent_freekicks) ?? 0;

                        // Get aggregated values for Goalkeeper
                        const saves = sumWithNull(relevantStats, m => m.team_saves) ?? 0;
                        const savesInsideBox = sumWithNull(relevantStats, m => (m as any).home_saves_inside_box) ?? Math.floor(saves * 0.6);
                        const savesOutsideBox = saves - savesInsideBox;
                        const goalsConceded = sumWithNull(relevantStats, m => (m as any).home_goals_conceded) ?? 0;
                        const punches = sumWithNull(relevantStats, m => (m as any).home_punches) ?? Math.floor(saves * 0.2);
                        const catches = sumWithNull(relevantStats, m => (m as any).home_catches) ?? Math.floor(saves * 0.4);
                        const sweepings = sumWithNull(relevantStats, m => (m as any).home_sweepings) ?? Math.floor(saves * 0.15);

                        // Get aggregated values for Outplays
                        const outplaysPassingPlayersOutplayed = sumWithNull(relevantStats, m => (m as any).home_outplays_passing_players) ?? Math.floor(successfulPasses * 0.05);
                        const outplaysPassingLinesBroken = sumWithNull(relevantStats, m => (m as any).home_outplays_passing_lines) ?? Math.floor(progressivePasses * 0.3);
                        const outplaysDribblingPlayersOutplayed = sumWithNull(relevantStats, m => (m as any).home_outplays_dribbling_players) ?? Math.floor(successfulDribbles * 0.8);
                        const outplaysDribblingLinesBroken = sumWithNull(relevantStats, m => (m as any).home_outplays_dribbling_lines) ?? Math.floor(progressiveCarries * 0.5);

                        // Passing Stats Tree Data
                        const passingStatsData: StatsNode = {
                            id: 'root-passes',
                            name: 'Passing Stats',
                            value: null,
                            level: 0,
                            children: [
                                {
                                    id: 'passes-successful',
                                    name: 'Successful',
                                    value: null,
                                    level: 1,
                                    children: [
                                        { id: 'passes-progressive', name: 'Progressive', value: progressivePasses, level: 2 },
                                        { id: 'passes-key', name: 'Key Passes', value: keyPasses, level: 2 },
                                        { id: 'passes-assists', name: 'Assists', value: assists, level: 2 },
                                        { id: 'passes-crosses', name: 'Crosses', value: crosses, level: 2 },
                                        { id: 'passes-long', name: 'Long Passes', value: longPasses, level: 2 },
                                        { id: 'passes-short', name: 'Short Passes', value: shortPasses, level: 2 },
                                        { id: 'passes-through', name: 'Through Balls', value: throughBalls, level: 2 },
                                        { id: 'passes-other', name: 'Other', value: Math.max(0, successfulPasses - progressivePasses - keyPasses - assists - crosses - longPasses - shortPasses - throughBalls), level: 2 },
                                    ]
                                },
                                {
                                    id: 'passes-unsuccessful',
                                    name: 'Unsuccessful',
                                    value: null,
                                    level: 1,
                                    children: [
                                        { id: 'passes-blocked', name: 'Blocked', value: passesBlocked, level: 2 },
                                        { id: 'passes-clearance', name: 'Clearance', value: passesClearance, level: 2 },
                                        { id: 'passes-intercepted', name: 'Interception', value: passesIntercepted, level: 2 },
                                        { id: 'passes-offside', name: 'Offside', value: passesOffside, level: 2 },
                                        { id: 'passes-ball-recoveries', name: 'Ball Recoveries', value: passesBallRecoveries, level: 2 },
                                        { id: 'passes-high-pressing', name: 'High Pressing', value: passesHighPressing, level: 2 },
                                    ]
                                }
                            ]
                        };

                        // Other Stats Tree Data (Set Pieces, Duels, Keeper Stats, Outplays)
                        const otherStatsData: StatsNode = {
                            id: 'root-other',
                            name: 'Other Stats',
                            value: null,
                            level: 0,
                            children: [
                                {
                                    id: 'setpieces',
                                    name: 'Set Pieces',
                                    value: null,
                                    level: 1,
                                    children: [
                                        {
                                            id: 'sp-goalkicks',
                                            name: 'Goal Kicks',
                                            value: null,
                                            level: 2,
                                            children: [
                                                { id: 'goalkicks-first', name: 'First Contact', value: goalKicksFirstContact, level: 3 },
                                                { id: 'goalkicks-second', name: 'Second Contact', value: goalKicksSecondContact, level: 3 },
                                            ]
                                        },
                                        {
                                            id: 'sp-freekicks',
                                            name: 'Free Kicks',
                                            value: null,
                                            level: 2,
                                            children: [
                                                { id: 'freekicks-first', name: 'First Contact', value: freeKicksFirstContact, level: 3 },
                                                { id: 'freekicks-second', name: 'Second Contact', value: freeKicksSecondContact, level: 3 },
                                            ]
                                        },
                                        {
                                            id: 'sp-corners',
                                            name: 'Corners',
                                            value: null,
                                            level: 2,
                                            children: [
                                                { id: 'corners-first', name: 'First Contact', value: cornersFirstContact, level: 3 },
                                                { id: 'corners-second', name: 'Second Contact', value: cornersSecondContact, level: 3 },
                                            ]
                                        },
                                        {
                                            id: 'sp-throwins',
                                            name: 'Throw-ins',
                                            value: null,
                                            level: 2,
                                            children: [
                                                { id: 'throwins-first', name: 'First Contact', value: throwInsFirstContact, level: 3 },
                                                { id: 'throwins-second', name: 'Second Contact', value: throwInsSecondContact, level: 3 },
                                            ]
                                        },
                                    ]
                                },
                                {
                                    id: 'duels',
                                    name: 'Duels',
                                    value: null,
                                    level: 1,
                                    children: [
                                        {
                                            id: 'duels-aerial',
                                            name: 'Aerial',
                                            value: null,
                                            level: 2,
                                            children: [
                                                { id: 'aerial-won', name: 'Won', value: aerialDuelsWon, level: 3 },
                                                { id: 'aerial-lost', name: 'Lost', value: aerialDuelsLost, level: 3 },
                                            ]
                                        },
                                        {
                                            id: 'duels-ground',
                                            name: 'Ground',
                                            value: null,
                                            level: 2,
                                            children: [
                                                { id: 'tackles-won', name: 'Tackles Won', value: tacklesWon, level: 3 },
                                                { id: 'tackles-lost', name: 'Tackles Lost', value: tacklesLost, level: 3 },
                                            ]
                                        },
                                        {
                                            id: 'duels-dribbles',
                                            name: 'Dribbles',
                                            value: null,
                                            level: 2,
                                            children: [
                                                { id: 'dribbles-successful', name: 'Successful', value: successfulDribbles, level: 3 },
                                                { id: 'dribbles-progressive', name: 'Progressive', value: progressiveCarries, level: 3 },
                                                { id: 'dribbles-failed', name: 'Failed', value: unsuccessfulDribbles, level: 3 },
                                            ]
                                        },
                                        { id: 'duels-dribble-rate', name: 'Dribble Success Rate', value: dribbleSuccessRate, level: 2, suffix: '%' },
                                    ]
                                },
                                {
                                    id: 'goalkeeper',
                                    name: 'Keeper Stats',
                                    value: null,
                                    level: 1,
                                    children: [
                                        {
                                            id: 'gk-saves',
                                            name: 'Saves',
                                            value: null,
                                            level: 2,
                                            children: [
                                                { id: 'saves-inbox', name: 'Inside Box', value: savesInsideBox, level: 3 },
                                                { id: 'saves-outbox', name: 'Outside Box', value: savesOutsideBox, level: 3 },
                                            ]
                                        },
                                        {
                                            id: 'gk-actions',
                                            name: 'Actions',
                                            value: null,
                                            level: 2,
                                            children: [
                                                { id: 'gk-punches', name: 'Punches', value: punches, level: 3 },
                                                { id: 'gk-catches', name: 'Catches', value: catches, level: 3 },
                                                { id: 'gk-sweepings', name: 'Sweepings', value: sweepings, level: 3 },
                                            ]
                                        },
                                        { id: 'gk-conceded', name: 'Conceded', value: goalsConceded, level: 2 },
                                    ]
                                },
                                {
                                    id: 'outplays',
                                    name: 'Outplays',
                                    value: null,
                                    level: 1,
                                    children: [
                                        {
                                            id: 'outplays-passing',
                                            name: 'Passing',
                                            value: null,
                                            level: 2,
                                            children: [
                                                { id: 'outplays-passing-players', name: 'Players Outplayed', value: outplaysPassingPlayersOutplayed, level: 3 },
                                                { id: 'outplays-passing-lines', name: 'Lines Broken', value: outplaysPassingLinesBroken, level: 3 },
                                            ]
                                        },
                                        {
                                            id: 'outplays-dribbling',
                                            name: 'Dribbling',
                                            value: null,
                                            level: 2,
                                            children: [
                                                { id: 'outplays-dribbling-players', name: 'Players Outplayed', value: outplaysDribblingPlayersOutplayed, level: 3 },
                                                { id: 'outplays-dribbling-lines', name: 'Lines Broken', value: outplaysDribblingLinesBroken, level: 3 },
                                            ]
                                        },
                                    ]
                                },
                            ]
                        };

                        // Passing comparison data for comparison mode
                        const passingComparisonStats = [
                            { label: "Successful Passes", team: successfulPasses, opponent: oppSuccessfulPasses, icon: <Footprints className="w-4 h-4" /> },
                            { label: "Progressive Passes", team: progressivePasses, opponent: oppProgressivePasses, icon: <TrendingUp className="w-4 h-4" /> },
                            { label: "Key Passes", team: keyPasses, opponent: oppKeyPasses, icon: <Target className="w-4 h-4" /> },
                            { label: "Assists", team: assists, opponent: oppAssists, icon: <Trophy className="w-4 h-4" /> },
                            { label: "Crosses", team: crosses, opponent: oppCrosses, icon: <Flame className="w-4 h-4" /> },
                        ];

                        const actionsComparisonStats = [
                            { label: "Aerial Duels Won", team: aerialDuelsWon, opponent: oppAerialDuelsWon, icon: <Shield className="w-4 h-4" /> },
                            { label: "Successful Dribbles", team: successfulDribbles, opponent: oppSuccessfulDribbles, icon: <Flame className="w-4 h-4" /> },
                            { label: "Progressive Carries", team: progressiveCarries, opponent: oppProgressiveCarries, icon: <TrendingUp className="w-4 h-4" /> },
                            { label: "Corners", team: corners, opponent: oppCorners, icon: <Target className="w-4 h-4" /> },
                            { label: "Free Kicks", team: freeKicks, opponent: oppFreeKicks, icon: <Footprints className="w-4 h-4" /> },
                        ];

                        return (
                            <div
                                id="breakdown"
                                ref={(el) => { sectionRefs.current['breakdown'] = el; }}
                                className="mb-8 scroll-mt-24 space-y-6"
                            >
                                {/* Comparison Mode: Side-by-side bars */}
                                {viewMode === 'comparison' && (
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                        {/* Passing Comparison */}
                                        <motion.div
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.15 }}
                                        >
                                            <Card className="glass-strong rounded-xl">
                                                <CardHeader>
                                                    <div className="flex items-center justify-between">
                                                        <CardTitle className="text-lg flex items-center gap-2">
                                                            <GitCompare className="w-5 h-5 text-primary" />
                                                            Passing Comparison
                                                        </CardTitle>
                                                        <div className="flex items-center gap-3 text-xs">
                                                            <div className="flex items-center gap-1.5">
                                                                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: TEAM_COLORS.home }} />
                                                                <span className="text-muted-foreground">{breakdownTeamName}</span>
                                                            </div>
                                                            <div className="flex items-center gap-1.5">
                                                                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: TEAM_COLORS.away }} />
                                                                <span className="text-muted-foreground">{breakdownOpponentName}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </CardHeader>
                                                <CardContent className="space-y-4">
                                                    {passingComparisonStats.map((stat) => (
                                                        <ComparisonBar
                                                            key={stat.label}
                                                            label={stat.label}
                                                            teamValue={stat.team}
                                                            opponentValue={stat.opponent}
                                                            teamName={breakdownTeamName}
                                                            opponentName={breakdownOpponentName}
                                                            icon={stat.icon}
                                                        />
                                                    ))}
                                                </CardContent>
                                            </Card>
                                        </motion.div>

                                        {/* Actions Comparison */}
                                        <motion.div
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.2 }}
                                        >
                                            <Card className="glass-strong rounded-xl">
                                                <CardHeader>
                                                    <div className="flex items-center justify-between">
                                                        <CardTitle className="text-lg flex items-center gap-2">
                                                            <GitCompare className="w-5 h-5 text-primary" />
                                                            Actions Comparison
                                                        </CardTitle>
                                                        <div className="flex items-center gap-3 text-xs">
                                                            <div className="flex items-center gap-1.5">
                                                                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: TEAM_COLORS.home }} />
                                                                <span className="text-muted-foreground">{breakdownTeamName}</span>
                                                            </div>
                                                            <div className="flex items-center gap-1.5">
                                                                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: TEAM_COLORS.away }} />
                                                                <span className="text-muted-foreground">{breakdownOpponentName}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </CardHeader>
                                                <CardContent className="space-y-4">
                                                    {actionsComparisonStats.map((stat) => (
                                                        <ComparisonBar
                                                            key={stat.label}
                                                            label={stat.label}
                                                            teamValue={stat.team}
                                                            opponentValue={stat.opponent}
                                                            teamName={breakdownTeamName}
                                                            opponentName={breakdownOpponentName}
                                                            icon={stat.icon}
                                                        />
                                                    ))}
                                                </CardContent>
                                            </Card>
                                        </motion.div>
                                    </div>
                                )}

                                {/* Original Charts Grid */}
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    {/* Passing Stats Chart */}
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.25 }}
                                    >
                                        <Card className="glass-strong rounded-xl h-full">
                                            <CardHeader>
                                                <CardTitle className="text-lg flex items-center gap-2">
                                                    <svg className="w-5 h-5 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                        <circle cx="12" cy="12" r="10" />
                                                        <circle cx="12" cy="12" r="6" />
                                                        <circle cx="12" cy="12" r="2" />
                                                    </svg>
                                                    Passing Breakdown
                                                </CardTitle>
                                                <p className="text-sm text-muted-foreground">Detailed passing statistics - click to expand</p>
                                            </CardHeader>
                                            <CardContent>
                                                <ExpandableStatsChart data={passingStatsData} className="py-4" />
                                            </CardContent>
                                        </Card>
                                    </motion.div>

                                    {/* Other Stats Chart (Set Pieces, Duels, Keeper) */}
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.3 }}
                                    >
                                        <Card className="glass-strong rounded-xl h-full">
                                            <CardHeader>
                                                <CardTitle className="text-lg flex items-center gap-2">
                                                    <svg className="w-5 h-5 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                        <circle cx="12" cy="12" r="10" />
                                                        <circle cx="12" cy="12" r="6" />
                                                        <circle cx="12" cy="12" r="2" />
                                                    </svg>
                                                    Match Actions
                                                </CardTitle>
                                                <p className="text-sm text-muted-foreground">Set pieces, duels & keeper stats - click to expand</p>
                                            </CardHeader>
                                            <CardContent>
                                                <ExpandableStatsChart data={otherStatsData} className="py-4" variant="pie" />
                                            </CardContent>
                                        </Card>
                                    </motion.div>
                                </div>
                            </div>
                        );
                    })()}

                    {/* Main Grid - Formation Section */}
                    <div
                        id="formation"
                        ref={(el) => { sectionRefs.current['formation'] = el; }}
                        className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8 scroll-mt-24"
                    >
                        {/* Formation Visualization - 11 field players + bench */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="lg:col-span-2"
                        >
                            <Card className="bg-card border-border">
                                <CardHeader className="flex flex-row items-center justify-between flex-wrap gap-2">
                                    <CardTitle className="text-lg flex items-center gap-2">
                                        <Shield className="w-5 h-5 text-primary" />
                                        Team Formation
                                    </CardTitle>
                                    <div className="flex items-center gap-3">
                                        {/* Formation Dropdown */}
                                        <Select
                                            value={selectedFormation}
                                            onValueChange={(value) => setSelectedFormation(value as FormationName)}
                                        >
                                            <SelectTrigger className="w-[120px] h-8 text-sm">
                                                <SelectValue placeholder="Formation" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {FORMATIONS.map((f) => (
                                                    <SelectItem key={f.name} value={f.name}>
                                                        {f.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={handleResetFormation}
                                            className="h-8 px-3 text-xs"
                                        >
                                            <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
                                            Reset
                                        </Button>
                                        {/* Team Legend */}
                                        <div className="hidden md:flex items-center gap-3">
                                            <div className="flex items-center gap-1.5 text-xs">
                                                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: FORMATION_TEAM_COLORS.home.node }} />
                                                <span className="text-muted-foreground">Home</span>
                                            </div>
                                            <div className="flex items-center gap-1.5 text-xs">
                                                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: FORMATION_TEAM_COLORS.away.node }} />
                                                <span className="text-muted-foreground">Opponent</span>
                                            </div>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {/* Full field with both teams - like passing network */}
                                    <div className="relative w-full max-w-3xl mx-auto rounded-xl overflow-hidden border border-border shadow-xl aspect-[105/68]">
                                        <TacticalField
                                            viewMode="full"
                                            className="absolute inset-0 w-full h-full"
                                        >
                                            {/* Home Team Field Players - 11 slots (left side) */}
                                            {fieldPlayers.map(({ slot, player }, index) => {
                                                // Normalize formation depth to fill left half.
                                                // This keeps forwards close to the midfield line regardless of
                                                // each formation's raw Y range in `formationPositions`.
                                                const svgX = 5 + ((slot.y - formationDepthBounds.minY) / formationDepthBounds.rangeY) * 43.5;
                                                const svgY = (slot.x / 100) * PITCH_H;

                                                const circleRadius = 2.2;

                                                const handlePlayerClick = (e: React.MouseEvent) => {
                                                    if (player && !draggedPlayerId) {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                        window.history.replaceState(null, '', '/team#formation');
                                                        navigate(`/player/${player.id}`);
                                                    }
                                                };

                                                return (
                                                    <g key={slot.id}>
                                                        {/* Drop zone for drag and drop */}
                                                        <foreignObject
                                                            x={svgX - 5}
                                                            y={svgY - 5}
                                                            width={10}
                                                            height={10}
                                                            style={{ pointerEvents: 'all' }}
                                                        >
                                                            <div
                                                                onDragOver={handleDragOver}
                                                                onDrop={() => handleDropOnField(index)}
                                                                style={{ width: '100%', height: '100%' }}
                                                            />
                                                        </foreignObject>

                                                        {player ? (
                                                            <g
                                                                transform={`translate(${svgX}, ${svgY})`}
                                                                className="cursor-pointer"
                                                                onClick={handlePlayerClick}
                                                                style={{ pointerEvents: 'all' }}
                                                            >
                                                                {/* Shadow/halo */}
                                                                <circle
                                                                    cx={0}
                                                                    cy={0}
                                                                    r={circleRadius + 0.3}
                                                                    fill="rgba(0,0,0,0.3)"
                                                                />

                                                                {/* Main circle - home team blue */}
                                                                <motion.circle
                                                                    cx={0}
                                                                    cy={0}
                                                                    r={circleRadius}
                                                                    fill={FORMATION_TEAM_COLORS.home.node}
                                                                    stroke={FORMATION_TEAM_COLORS.home.border}
                                                                    strokeWidth={0.3}
                                                                    initial={{ scale: 0, opacity: 0 }}
                                                                    animate={{ scale: 1, opacity: 1 }}
                                                                    transition={{ delay: 0.1 + index * 0.03, type: "spring" }}
                                                                    whileHover={{ scale: 1.3 }}
                                                                    className={cn(
                                                                        draggedPlayerId === player.id && "stroke-yellow-400 stroke-[0.5]"
                                                                    )}
                                                                />

                                                                {/* Jersey number */}
                                                                <text
                                                                    x={0}
                                                                    y={0.6}
                                                                    textAnchor="middle"
                                                                    fill="white"
                                                                    fontSize="1.6"
                                                                    fontWeight="bold"
                                                                    fontFamily="Arial"
                                                                    style={{ pointerEvents: 'none' }}
                                                                >
                                                                    {player.jerseyNumber}
                                                                </text>

                                                                {/* Player name (below circle) */}
                                                                <text
                                                                    x={0}
                                                                    y={circleRadius + 2.2}
                                                                    textAnchor="middle"
                                                                    fill="white"
                                                                    fontSize="1.4"
                                                                    fontWeight="500"
                                                                    fontFamily="system-ui, -apple-system, sans-serif"
                                                                    stroke="rgba(0,0,0,0.5)"
                                                                    strokeWidth="0.3"
                                                                    paintOrder="stroke"
                                                                    style={{ pointerEvents: 'none' }}
                                                                >
                                                                    {player.name.split(" ").pop()}
                                                                </text>
                                                            </g>
                                                        ) : (
                                                            <g transform={`translate(${svgX}, ${svgY})`}>
                                                                <circle
                                                                    cx={0}
                                                                    cy={0}
                                                                    r={circleRadius}
                                                                    fill="rgba(0,0,0,0.2)"
                                                                    stroke="rgba(255,255,255,0.4)"
                                                                    strokeWidth={0.2}
                                                                    strokeDasharray="0.8 0.8"
                                                                />
                                                                <text
                                                                    x={0}
                                                                    y={0.5}
                                                                    textAnchor="middle"
                                                                    fill="rgba(255,255,255,0.5)"
                                                                    fontSize="1.3"
                                                                >
                                                                    {slot.role}
                                                                </text>
                                                            </g>
                                                        )}
                                                    </g>
                                                );
                                            })}

                                            {/* Opponent Team Players (right side) - position-based */}
                                            {opponentNodes.map((node, index) => {
                                                const circleRadius = 2.2;
                                                const lastName = node.player.name.split(" ").slice(-1)[0];

                                                return (
                                                    <g
                                                        key={node.player.id}
                                                        style={{ cursor: 'pointer' }}
                                                        onClick={() => {
                                                            window.history.replaceState(null, '', '/team#formation');
                                                            navigate(`/player/${node.player.id}`);
                                                        }}
                                                    >
                                                        {/* Shadow */}
                                                        <circle
                                                            cx={node.x}
                                                            cy={node.y}
                                                            r={circleRadius + 0.3}
                                                            fill="rgba(0,0,0,0.3)"
                                                        />
                                                        {/* Main circle - opponent red */}
                                                        <motion.circle
                                                            cx={node.x}
                                                            cy={node.y}
                                                            r={circleRadius}
                                                            fill={FORMATION_TEAM_COLORS.away.node}
                                                            stroke={FORMATION_TEAM_COLORS.away.border}
                                                            strokeWidth={0.3}
                                                            initial={{ scale: 0, opacity: 0 }}
                                                            animate={{ scale: 1, opacity: 1 }}
                                                            transition={{ delay: 0.2 + index * 0.03, type: "spring" }}
                                                            whileHover={{ scale: 1.2 }}
                                                        />
                                                        {/* Jersey number */}
                                                        <text
                                                            x={node.x}
                                                            y={node.y + 0.6}
                                                            textAnchor="middle"
                                                            fill="white"
                                                            fontSize="1.6"
                                                            fontWeight="bold"
                                                            fontFamily="Arial"
                                                            style={{ pointerEvents: 'none' }}
                                                        >
                                                            {node.player.jerseyNumber}
                                                        </text>
                                                        {/* Player name */}
                                                        <text
                                                            x={node.x}
                                                            y={node.y - circleRadius - 1.2}
                                                            textAnchor="middle"
                                                            dominantBaseline="auto"
                                                            fontSize="1.4"
                                                            fontWeight="500"
                                                            fontFamily="system-ui, -apple-system, sans-serif"
                                                            fill="white"
                                                            stroke="rgba(0,0,0,0.5)"
                                                            strokeWidth="0.3"
                                                            paintOrder="stroke"
                                                            style={{ pointerEvents: 'none' }}
                                                        >
                                                            {lastName}
                                                        </text>
                                                    </g>
                                                );
                                            })}
                                        </TacticalField>

                                        {/* Team labels overlay */}
                                        <div className="absolute top-3 left-0 right-0 flex items-center justify-center gap-4 pointer-events-none select-none px-4">
                                            <div className="flex items-center gap-2 bg-black/50 px-4 py-1.5 rounded-full">
                                                <span
                                                    className="w-2.5 h-2.5 rounded-full"
                                                    style={{ backgroundColor: FORMATION_TEAM_COLORS.home.node }}
                                                />
                                                <span className="text-xs font-semibold text-white/90">
                                                    {homeTeamName}
                                                </span>
                                            </div>
                                            {opponentPlayers.length > 0 && (
                                                <div className="flex items-center gap-2 bg-black/50 px-4 py-1.5 rounded-full">
                                                    <span
                                                        className="w-2.5 h-2.5 rounded-full"
                                                        style={{ backgroundColor: FORMATION_TEAM_COLORS.away.node }}
                                                    />
                                                    <span className="text-xs font-semibold text-white/90">
                                                        {opponentTeamName}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Bench Section */}
                                    {benchPlayers.length > 0 && (
                                        <div
                                            className="mt-4 p-3 rounded-lg bg-secondary/30 border border-border"
                                            onDragOver={handleDragOver}
                                            onDrop={handleDropOnBench}
                                        >
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-sm font-medium text-muted-foreground">
                                                    Bench ({benchPlayers.length} players)
                                                </span>
                                                <span className="text-xs text-muted-foreground">
                                                    Drag players to swap positions
                                                </span>
                                            </div>
                                            <div className="flex gap-3 overflow-x-auto pb-2">
                                                {benchPlayers.map((player) => (
                                                    <div
                                                        key={player.id}
                                                        className={cn(
                                                            "flex-shrink-0 cursor-grab active:cursor-grabbing",
                                                            draggedPlayerId === player.id && "opacity-50"
                                                        )}
                                                        draggable
                                                        onDragStart={(e) => {
                                                            handleDragStart(player.id);
                                                            // Create a minimal drag image to hide the default ghost
                                                            const emptyImg = new Image();
                                                            emptyImg.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
                                                            e.dataTransfer.setDragImage(emptyImg, 0, 0);
                                                        }}
                                                    >
                                                        <Link to={`/player/${player.id}`} onClick={(e) => { if (draggedPlayerId) { e.preventDefault(); } else { window.history.replaceState(null, '', '/team#formation'); } }}>
                                                            <motion.div
                                                                className="flex flex-col items-center p-2 rounded-lg hover:bg-secondary/50 transition-colors"
                                                                whileHover={{ scale: 1.05 }}
                                                            >
                                                                <div
                                                                    className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold border-2 text-white shadow"
                                                                    style={{
                                                                        backgroundColor: FORMATION_TEAM_COLORS.home.node,
                                                                        borderColor: FORMATION_TEAM_COLORS.home.border
                                                                    }}
                                                                >
                                                                    {player.jerseyNumber}
                                                                </div>
                                                                <span className="text-[9px] mt-1 text-foreground font-medium whitespace-nowrap max-w-[60px] truncate">
                                                                    {player.name.split(" ").pop()}
                                                                </span>
                                                                <span className="text-[8px] text-muted-foreground">
                                                                    {player.position}
                                                                </span>
                                                            </motion.div>
                                                        </Link>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </motion.div>

                        {/* Top Performers */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                        >
                            <Card className="bg-card border-border h-full">
                                <CardHeader>
                                    <CardTitle className="text-lg flex items-center gap-2">
                                        <Trophy className="w-5 h-5 text-warning" />
                                        Top Performers
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {/* Show loading/empty state if no performers yet */}
                                    {!topPerformers.topScorer || !topPerformers.topAssister || !topPerformers.topRated ? (
                                        <div className="text-center py-8 text-muted-foreground">
                                            <p>Loading top performers...</p>
                                        </div>
                                    ) : (
                                        <>
                                            {/* Top Scorer */}
                                            <Link
                                                to={`/player/${topPerformers.topScorer.id}`}
                                                className="flex items-center gap-4 p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors group"
                                                onClick={() => window.history.replaceState(null, '', '/team#stats')}
                                            >
                                                <div className="w-12 h-12 rounded-full bg-destructive/20 flex items-center justify-center">
                                                    <Target className="w-6 h-6 text-destructive" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-xs uppercase tracking-wider text-muted-foreground">
                                                        Top Scorer
                                                    </p>
                                                    <p className="font-semibold text-foreground truncate">
                                                        {topPerformers.topScorer.name}
                                                    </p>
                                                    <p className="text-sm text-destructive font-medium">
                                                        {selectedMatch === "all"
                                                            ? topPerformers.topScorer.matchStats.reduce(
                                                                (a, m) => a + m.stats.goals,
                                                                0
                                                            )
                                                            : topPerformers.topScorer.matchStats
                                                                .filter(m => m.matchId === selectedMatch)
                                                                .reduce((a, m) => a + m.stats.goals, 0)
                                                        }{" "}
                                                        goals
                                                    </p>
                                                </div>
                                                <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                                            </Link>

                                            {/* Top Assister */}
                                            <Link
                                                to={`/player/${topPerformers.topAssister.id}`}
                                                className="flex items-center gap-4 p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors group"
                                                onClick={() => window.history.replaceState(null, '', '/team#stats')}
                                            >
                                                <div className="w-12 h-12 rounded-full bg-warning/20 flex items-center justify-center">
                                                    <Footprints className="w-6 h-6 text-warning" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-xs uppercase tracking-wider text-muted-foreground">
                                                        Top Assister
                                                    </p>
                                                    <p className="font-semibold text-foreground truncate">
                                                        {topPerformers.topAssister.name}
                                                    </p>
                                                    <p className="text-sm text-warning font-medium">
                                                        {selectedMatch === "all"
                                                            ? topPerformers.topAssister.matchStats.reduce(
                                                                (a, m) => a + m.stats.assists,
                                                                0
                                                            )
                                                            : topPerformers.topAssister.matchStats
                                                                .filter(m => m.matchId === selectedMatch)
                                                                .reduce((a, m) => a + m.stats.assists, 0)
                                                        }{" "}
                                                        assists
                                                    </p>
                                                </div>
                                                <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                                            </Link>

                                            {/* Top Rated */}
                                            <Link
                                                to={`/player/${topPerformers.topRated.id}`}
                                                className="flex items-center gap-4 p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors group"
                                                onClick={() => window.history.replaceState(null, '', '/team#stats')}
                                            >
                                                <div className="w-12 h-12 rounded-full bg-success/20 flex items-center justify-center">
                                                    <Flame className="w-6 h-6 text-success" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-xs uppercase tracking-wider text-muted-foreground">
                                                        Highest Rated
                                                    </p>
                                                    <p className="font-semibold text-foreground truncate">
                                                        {topPerformers.topRated.name}
                                                    </p>
                                                    <p className="text-sm text-success font-medium">
                                                        {topPerformers.topRated.overallRating} rating
                                                    </p>
                                                </div>
                                                <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                                            </Link>
                                        </>
                                    )}
                                </CardContent>
                            </Card>
                        </motion.div>
                    </div>

                    {/* Team Passing Map Section */}
                    <motion.div
                        id="passing"
                        ref={(el) => { sectionRefs.current['passing'] = el; }}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.35 }}
                        className="mb-8 scroll-mt-24"
                    >
                        <Card className="bg-card border-border">
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <Footprints className="w-5 h-5 text-primary" />
                                    Passing Network
                                </CardTitle>
                                <p className="text-sm text-muted-foreground">Player-to-player passing connections — hover lines for details, click players to filter</p>
                            </CardHeader>
                            <CardContent>
                                <TeamPassingMap
                                    playerPasses={[...homeStartingPlayers, ...opponentStartingPlayers].map(player => ({
                                        player,
                                        events: player.matchStats
                                            .filter(m => tacticalMatchId === "all" || m.matchId === tacticalMatchId)
                                            .flatMap(m => m.events)
                                    }))}
                                    matchId={tacticalMatchId !== "all" ? tacticalMatchId : undefined}
                                    preferredHomeTeamId={tacticalMatchInfo?.ourTeamId}
                                    selectedFormation={selectedFormation}
                                />
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Goal Replay Section */}
                    <motion.div
                        id="goals"
                        ref={(el) => { sectionRefs.current['goals'] = el; }}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="mb-8 scroll-mt-24"
                    >
                        <Card className="bg-card border-border">
                            <CardHeader className="flex flex-row items-center justify-between flex-wrap gap-4">
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <Target className="w-5 h-5 text-destructive" />
                                    Goal Replay ({filteredGoals.length} Goals)
                                </CardTitle>
                                {/* Half selection toggle */}
                                <div className="flex items-center gap-1 border border-border rounded-md overflow-hidden">
                                    {(['full', '1st', '2nd'] as const).map((half) => (
                                        <Button
                                            key={half}
                                            variant={goalHalfFilter === half ? 'default' : 'ghost'}
                                            size="sm"
                                            onClick={() => { setGoalHalfFilter(half); setCurrentGoalIndex(0); }}
                                            className="h-7 px-3 text-xs rounded-none border-0"
                                        >
                                            {half === 'full' ? 'Full Match' : half === '1st' ? '1st Half' : '2nd Half'}
                                        </Button>
                                    ))}
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {/* Goal Pitch Visualization - full field */}
                                <div className="relative w-full max-w-3xl mx-auto rounded-xl border border-border overflow-hidden bg-muted/20 aspect-[16/10]">
                                    <TacticalField
                                        viewMode="full"
                                        className="w-full h-full"
                                        interactive
                                    >
                                        {/* Half dimming overlay — dims the INACTIVE half */}
                                        {goalHalfFilter === '1st' && (
                                            <rect x={52.5} y={-6} width={56} height={80} fill="black" fillOpacity={0.5} rx={0} style={{ pointerEvents: 'none' }} />
                                        )}
                                        {goalHalfFilter === '2nd' && (
                                            <rect x={-8} y={-6} width={60.5} height={80} fill="black" fillOpacity={0.5} rx={0} style={{ pointerEvents: 'none' }} />
                                        )}

                                        {/* Current Goal Animation */}
                                        <AnimatePresence mode="wait">
                                            {currentGoal && (
                                                <g key={`${currentGoal.matchId}-${currentGoal.minute}`}>
                                                    {(() => {
                                                        // Map normalised event coords (0-100) to full pitch SVG coords
                                                        const svgX = (currentGoal.event.x / 100) * 105;
                                                        const svgY = (currentGoal.event.y / 100) * 68;
                                                        // Goal on the right side
                                                        const goalX = 105;
                                                        const goalY = 34;

                                                        return (
                                                            <>
                                                                {/* Shot trajectory line */}
                                                                <motion.line
                                                                    x1={svgX} y1={svgY} x2={goalX} y2={goalY}
                                                                    stroke="hsl(var(--destructive))"
                                                                    strokeWidth="0.5"
                                                                    strokeDasharray="1.5 0.8"
                                                                    initial={{ pathLength: 0, opacity: 0 }}
                                                                    animate={{ pathLength: 1, opacity: 1 }}
                                                                    transition={{ duration: 0.8, ease: "easeOut" }}
                                                                />

                                                                {/* Shooter circle — click to go to player shot map */}
                                                                <motion.g
                                                                    initial={{ scale: 0 }}
                                                                    animate={{ scale: 1 }}
                                                                    transition={{ delay: 0.2, type: "spring" }}
                                                                    style={{ cursor: 'pointer' }}
                                                                    onClick={() => {
                                                                        // Stamp current URL with #goals so back-button returns to this section
                                                                        window.history.replaceState(null, '', '/team#goals');
                                                                        navigate(`/player/${currentGoal.scorer.id}#shots`);
                                                                    }}
                                                                >
                                                                    <circle cx={svgX} cy={svgY} r={2.2}
                                                                        fill="hsl(var(--destructive))" fillOpacity={0.9}
                                                                        stroke="hsl(var(--destructive))" strokeWidth="0.3"
                                                                    />
                                                                    <text x={svgX} y={svgY + 0.5}
                                                                        textAnchor="middle" fill="white"
                                                                        fontSize="1.4" fontWeight="bold" fontFamily="Arial"
                                                                    >
                                                                        {currentGoal.scorer.jerseyNumber}
                                                                    </text>
                                                                </motion.g>

                                                                {/* Ball in net */}
                                                                <motion.circle
                                                                    cx={goalX} cy={goalY} r={1}
                                                                    fill="white" stroke="black" strokeWidth="0.15"
                                                                    initial={{ scale: 0, opacity: 0 }}
                                                                    animate={{ scale: 1, opacity: 1 }}
                                                                    transition={{ delay: 0.8, type: "spring" }}
                                                                />

                                                                {/* Scorer label below circle */}
                                                                <motion.text
                                                                    x={svgX} y={svgY + 4}
                                                                    textAnchor="middle" fill="white"
                                                                    fontSize="1.8" fontWeight="600" fontFamily="Arial"
                                                                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                                                    transition={{ delay: 0.4 }}
                                                                >
                                                                    {currentGoal.scorer.name.split(' ').pop()} {currentGoal.minute}'
                                                                </motion.text>
                                                            </>
                                                        );
                                                    })()}
                                                </g>
                                            )}
                                        </AnimatePresence>
                                    </TacticalField>
                                </div>

                                {/* Goal counter */}
                                {currentGoal && filteredGoals.length > 0 && (
                                    <p className="text-xs text-center text-muted-foreground">
                                        Goal {currentGoalIndex + 1} of {filteredGoals.length}
                                    </p>
                                )}

                                {/* Empty state */}
                                {filteredGoals.length === 0 && (
                                    <div className="flex flex-col items-center justify-center py-6 text-center">
                                        <Target className="w-10 h-10 text-muted-foreground/30 mb-2" />
                                        <p className="text-muted-foreground font-medium text-sm">No goals recorded</p>
                                        <p className="text-xs text-muted-foreground/60">
                                            {goalHalfFilter !== 'full'
                                                ? `No goals in the ${goalHalfFilter === '1st' ? 'first' : 'second'} half`
                                                : selectedMatch === "all"
                                                    ? "No goals have been scored yet"
                                                    : "No goals scored in this match"}
                                        </p>
                                    </div>
                                )}

                                {/* Compact goal list */}
                                {filteredGoals.length > 1 && (
                                    <div className="flex flex-wrap gap-2 justify-center">
                                        {filteredGoals.map((goal, i) => (
                                            <button
                                                key={`${goal.matchId}-${goal.minute}-${i}`}
                                                onClick={() => setCurrentGoalIndex(i)}
                                                className={cn(
                                                    "flex items-center gap-2 px-3 py-1.5 rounded-full text-xs transition-colors",
                                                    i === currentGoalIndex
                                                        ? "bg-destructive/20 border border-destructive/40 text-destructive font-semibold"
                                                        : "bg-secondary/40 hover:bg-secondary/60 text-muted-foreground"
                                                )}
                                            >
                                                <span className="font-bold">{goal.scorer.jerseyNumber}</span>
                                                <span>{goal.scorer.name.split(' ').pop()}</span>
                                                <span className="opacity-60">{goal.minute}'</span>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Team Performance Trend */}
                    <motion.div
                        id="trend"
                        ref={(el) => { sectionRefs.current['trend'] = el; }}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="scroll-mt-24"
                    >
                        <Card className="bg-card border-border">
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <TrendingUp className="w-5 h-5 text-primary" />
                                    Team Performance Trend
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <LineChart
                                    data={teamTrendData}
                                    lines={[
                                        { dataKey: "Goals", color: "hsl(var(--destructive))", name: "Goals" },
                                        { dataKey: "Assists", color: "hsl(var(--warning))", name: "Assists" },
                                    ]}
                                    height={264}
                                />
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>
            </main>

            {/* Swap Confirmation Dialog */}
            {
                swapConfirmation && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-card border-2 border-primary rounded-xl p-6 max-w-md mx-4 shadow-2xl"
                        >
                            <h3 className="text-xl font-bold text-foreground mb-4">Confirm Player Swap</h3>
                            <p className="text-muted-foreground mb-6">
                                Swap <span className="font-semibold text-primary">{swapConfirmation.from}</span> with{' '}
                                <span className="font-semibold text-primary">{swapConfirmation.to}</span>?
                            </p>
                            <div className="flex gap-3 justify-end">
                                <Button variant="outline" onClick={cancelSwap}>
                                    Cancel
                                </Button>
                                <Button onClick={confirmSwap}>
                                    Confirm Swap
                                </Button>
                            </div>
                        </motion.div>
                    </div>
                )
            }
        </div >
    );
};

export default TeamAnalytics;
