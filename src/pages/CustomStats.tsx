import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import AuthHeader from "@/components/layout/AuthHeader";
import Sidebar from "@/components/layout/Sidebar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Settings,
    Check,
    X,
    Search,
    Sparkles,
    Target,
    Shield,
    Zap,
    Users,
    Activity,
    ChevronRight,
    Info,
    Trash2,
    CheckSquare,
    BarChart3,
    TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSidebarContext } from "@/contexts/SidebarContext";
import { useCustomStats, ALL_STATS, STAT_CATEGORIES, StatItem } from "@/contexts/CustomStatsContext";
import { usePlayers } from "@/hooks/usePlayers";
import { useMatchStatistics } from "@/hooks/useSupabaseData";
import { Player } from "@/types/player";

// Animation variants
const containerVariants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.05,
        },
    },
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
};

const getCategoryIcon = (category: string) => {
    switch (category) {
        case 'passing': return Target;
        case 'attacking': return Zap;
        case 'defending': return Shield;
        case 'physical': return Activity;
        case 'team': return Users;
        case 'advanced': return Sparkles;
        default: return Settings;
    }
};

const getCategoryColor = (category: string) => {
    switch (category) {
        case 'passing': return 'text-blue-400 bg-blue-400/10';
        case 'attacking': return 'text-red-400 bg-red-400/10';
        case 'defending': return 'text-green-400 bg-green-400/10';
        case 'physical': return 'text-yellow-400 bg-yellow-400/10';
        case 'team': return 'text-purple-400 bg-purple-400/10';
        case 'advanced': return 'text-cyan-400 bg-cyan-400/10';
        default: return 'text-gray-400 bg-gray-400/10';
    }
};

interface CustomStatsProps {
    embedded?: boolean;
    matchId?: string;
}

const CustomStats = ({ embedded = false, matchId }: CustomStatsProps) => {
    const { isCollapsed } = useSidebarContext();
    const {
        selectedStats,
        isCustomMode,
        setSelectedStats,
        setIsCustomMode,
        toggleStat,
        clearAllStats,
        selectAllStats,
        hasCustomStats,
    } = useCustomStats();

    const [searchQuery, setSearchQuery] = useState("");
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    const [pendingMode, setPendingMode] = useState<boolean | null>(null);
    const [expandedCategory, setExpandedCategory] = useState<string | null>('passing');
    const [activeSubTab, setActiveSubTab] = useState<'stats' | 'configure'>(hasCustomStats ? 'stats' : 'configure');

    // Fetch data
    const { data: players = [], isLoading: playersLoading } = usePlayers();
    const { data: matchStats = [], isLoading: matchStatsLoading } = useMatchStatistics();

    const isLoading = playersLoading || matchStatsLoading;

    // Get match-specific stats
    const currentMatchStats = useMemo(() => {
        if (!matchId || !matchStats) return null;
        return matchStats.find(m => m.match_id === matchId);
    }, [matchId, matchStats]);

    // Get players who participated in this match
    const matchPlayers = useMemo(() => {
        if (!matchId) return players;
        return players.filter(p => p.matchStats.some(m => m.matchId === matchId));
    }, [players, matchId]);

    // Calculate aggregated player stats
    const aggregatedPlayerStats = useMemo(() => {
        const stats: Record<string, number | null> = {};

        const playerStatKeys = [
            'passes', 'passAccuracy', 'keyPasses', 'passesInFinalThird', 'passesInBox',
            'crosses', 'progressivePassing', 'assists', 'goals', 'shots', 'shotsOnTarget',
            'dribbles', 'dribblesSuccessful', 'aerialDuelsWon', 'progressiveRuns', 'ballTouches',
            'blocks', 'interceptions', 'clearances', 'recoveries', 'tackles',
            'distanceCovered', 'sprints'
        ];

        playerStatKeys.forEach(key => {
            const values = matchPlayers.map(p => {
                if (matchId) {
                    const matchStat = p.matchStats.find(m => m.matchId === matchId);
                    return matchStat ? (matchStat.stats as any)[key] : null;
                }
                return p.matchStats.reduce((acc, m) => acc + ((m.stats as any)[key] || 0), 0);
            }).filter(v => v !== null && v !== undefined);

            if (values.length > 0) {
                if (key === 'passAccuracy') {
                    stats[key] = Math.round(values.reduce((a, b) => a + b, 0) / values.length);
                } else {
                    stats[key] = values.reduce((a, b) => a + b, 0);
                }
            } else {
                stats[key] = null;
            }
        });

        return stats;
    }, [matchPlayers, matchId]);

    // Map team stats — use team_*/opponent_* columns directly from match_statistics table
    const teamStatsMap = useMemo(() => {
        if (!currentMatchStats) return {};

        return {
            'team_clearances': currentMatchStats.team_clearances ?? null,
            'team_interceptions': currentMatchStats.team_interceptions ?? null,
            'team_successful_dribbles': currentMatchStats.team_successful_dribbles ?? null,
            'team_chances_created': currentMatchStats.team_chances_created ?? null,
            'team_aerial_duels_won': currentMatchStats.team_aerial_duels_won ?? null,
            'team_shots_on_target': currentMatchStats.team_shots_on_target ?? null,
            'team_fouls': currentMatchStats.team_fouls ?? null,
            'team_saves': currentMatchStats.team_saves ?? null,
            'possession_control_index': currentMatchStats.home_possession_control_index ?? null,
            'chance_creation_index': currentMatchStats.home_chance_creation_index ?? null,
            'shooting_efficiency': currentMatchStats.home_shooting_efficiency ?? null,
            'defensive_solidity': currentMatchStats.home_defensive_solidity ?? null,
            'transition_progression': currentMatchStats.home_transition_progression ?? null,
            'recovery_pressing_efficiency': currentMatchStats.home_recovery_pressing_efficiency ?? null,
        } as Record<string, number | null>;
    }, [currentMatchStats]);

    // Get stat value
    const getStatValue = (statId: string): number | null => {
        if (statId in aggregatedPlayerStats) {
            return aggregatedPlayerStats[statId];
        }
        if (statId in teamStatsMap) {
            return teamStatsMap[statId];
        }
        return null;
    };

    // Format stat value
    const formatStatValue = (statId: string, value: number | null): string => {
        if (value === null) return '--';
        if (statId === 'passAccuracy' || statId.includes('efficiency') || statId.includes('index')) {
            return `${Math.round(value)}%`;
        }
        if (statId === 'distanceCovered') {
            return `${(value / 1000).toFixed(1)} km`;
        }
        return value.toString();
    };

    // Get selected stats with data
    const selectedStatsWithData = useMemo(() => {
        return selectedStats.map(statId => {
            const stat = ALL_STATS.find(s => s.id === statId);
            if (!stat) return null;
            return {
                ...stat,
                value: getStatValue(statId),
                formattedValue: formatStatValue(statId, getStatValue(statId)),
            };
        }).filter(Boolean);
    }, [selectedStats, aggregatedPlayerStats, teamStatsMap]);

    // Group selected stats by category
    const groupedSelectedStats = useMemo(() => {
        const groups: Record<string, typeof selectedStatsWithData> = {};
        STAT_CATEGORIES.forEach(cat => {
            const statsInCategory = selectedStatsWithData.filter(s => s?.category === cat.id);
            if (statsInCategory.length > 0) {
                groups[cat.id] = statsInCategory;
            }
        });
        return groups;
    }, [selectedStatsWithData]);

    // Top performers
    const topPerformers = useMemo(() => {
        const performers: { stat: string; player: Player; value: number }[] = [];

        selectedStats.slice(0, 5).forEach(statId => {
            const stat = ALL_STATS.find(s => s.id === statId);
            if (!stat || stat.category === 'team' || stat.category === 'advanced') return;

            let topPlayer: Player | null = null;
            let topValue = -1;

            matchPlayers.forEach(player => {
                let value = 0;
                if (matchId) {
                    const matchStat = player.matchStats.find(m => m.matchId === matchId);
                    value = matchStat ? ((matchStat.stats as any)[statId] || 0) : 0;
                } else {
                    value = player.matchStats.reduce((acc, m) => acc + ((m.stats as any)[statId] || 0), 0);
                }

                if (value > topValue) {
                    topValue = value;
                    topPlayer = player;
                }
            });

            if (topPlayer && topValue > 0) {
                performers.push({ stat: stat.name, player: topPlayer, value: topValue });
            }
        });

        return performers;
    }, [selectedStats, matchPlayers, matchId]);

    // Filter stats for configuration
    const filteredStats = useMemo(() => {
        if (!searchQuery.trim()) return ALL_STATS;
        const query = searchQuery.toLowerCase();
        return ALL_STATS.filter(stat =>
            stat.name.toLowerCase().includes(query) ||
            stat.description.toLowerCase().includes(query) ||
            stat.category.toLowerCase().includes(query)
        );
    }, [searchQuery]);

    const groupedStats = useMemo(() => {
        const groups: Record<string, StatItem[]> = {};
        STAT_CATEGORIES.forEach(cat => {
            groups[cat.id] = filteredStats.filter(s => s.category === cat.id);
        });
        return groups;
    }, [filteredStats]);

    // Handlers
    const handleModeToggle = (newMode: boolean) => {
        if (newMode && !hasCustomStats) return;

        if (newMode && hasCustomStats) {
            setPendingMode(newMode);
            setShowConfirmDialog(true);
        } else {
            setIsCustomMode(false);
        }
    };

    const confirmModeChange = () => {
        if (pendingMode !== null) {
            setIsCustomMode(pendingMode);
        }
        setShowConfirmDialog(false);
        setPendingMode(null);
    };

    const selectCategoryStats = (categoryId: string) => {
        const categoryStatIds = ALL_STATS.filter(s => s.category === categoryId).map(s => s.id);
        const currentSelected = new Set(selectedStats);
        const allSelected = categoryStatIds.every(id => currentSelected.has(id));

        if (allSelected) {
            setSelectedStats(selectedStats.filter(id => !categoryStatIds.includes(id)));
        } else {
            const newSelected = new Set([...selectedStats, ...categoryStatIds]);
            setSelectedStats(Array.from(newSelected));
        }
    };

    const isCategoryFullySelected = (categoryId: string) => {
        const categoryStatIds = ALL_STATS.filter(s => s.category === categoryId).map(s => s.id);
        return categoryStatIds.every(id => selectedStats.includes(id));
    };

    const getSelectedCountInCategory = (categoryId: string) => {
        const categoryStatIds = ALL_STATS.filter(s => s.category === categoryId).map(s => s.id);
        return categoryStatIds.filter(id => selectedStats.includes(id)).length;
    };

    // Stats View Component
    const StatsView = () => (
        <div className="space-y-6">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between"
            >
                <div>
                    <h2 className="text-2xl font-bold text-foreground">
                        Your <span className="text-primary">Custom Stats</span>
                    </h2>
                    <p className="text-sm text-muted-foreground">
                        Showing {selectedStats.length} selected statistics for this match
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Badge variant={isCustomMode ? "default" : "outline"} className="gap-1">
                        <Sparkles className="w-3 h-3" />
                        {isCustomMode ? "Custom Mode ON" : "Custom Mode OFF"}
                    </Badge>
                </div>
            </motion.div>

            {selectedStats.length === 0 ? (
                <Card className="bg-card border-border">
                    <CardContent className="flex flex-col items-center justify-center py-16">
                        <Sparkles className="w-16 h-16 text-muted-foreground/30 mb-4" />
                        <h3 className="text-xl font-semibold text-foreground mb-2">No Custom Stats Selected</h3>
                        <p className="text-muted-foreground text-center max-w-md mb-4">
                            Configure your custom stats in the Settings tab to see your preferred metrics here.
                        </p>
                        <Button onClick={() => setActiveSubTab('configure')} className="gap-2">
                            <Settings className="w-4 h-4" />
                            Configure Custom Stats
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <>
                    {/* Stats Grid by Category */}
                    <motion.div
                        className="space-y-6"
                        variants={containerVariants}
                        initial="hidden"
                        animate="show"
                    >
                        {Object.entries(groupedSelectedStats).map(([categoryId, stats]) => {
                            const category = STAT_CATEGORIES.find(c => c.id === categoryId);
                            if (!category) return null;
                            const Icon = getCategoryIcon(categoryId);
                            const colorClass = getCategoryColor(categoryId);

                            return (
                                <motion.div key={categoryId} variants={itemVariants}>
                                    <Card className="overflow-hidden">
                                        <CardHeader className="pb-3">
                                            <CardTitle className="flex items-center gap-2 text-lg">
                                                <div className={cn("p-2 rounded-lg", colorClass)}>
                                                    <Icon className="w-4 h-4" />
                                                </div>
                                                {category.name}
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                                {stats.map((stat) => (
                                                    <motion.div
                                                        key={stat!.id}
                                                        whileHover={{ scale: 1.02 }}
                                                        className="p-4 rounded-lg bg-secondary/50 border border-border hover:border-primary/30 transition-colors"
                                                    >
                                                        <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">
                                                            {stat!.name}
                                                        </p>
                                                        <p className={cn(
                                                            "text-2xl font-bold",
                                                            stat!.value !== null ? "text-primary" : "text-muted-foreground"
                                                        )}>
                                                            {stat!.formattedValue}
                                                        </p>
                                                    </motion.div>
                                                ))}
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            );
                        })}
                    </motion.div>

                    {/* Top Performers */}
                    {topPerformers.length > 0 && (
                        <motion.div variants={itemVariants} initial="hidden" animate="show">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <TrendingUp className="w-5 h-5 text-primary" />
                                        Top Performers
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {topPerformers.map((perf, idx) => (
                                            <div
                                                key={`${perf.stat}-${idx}`}
                                                className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50 border border-border"
                                            >
                                                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                                                    {perf.player.jerseyNumber}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-medium text-foreground truncate">
                                                        {perf.player.name}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {perf.stat}
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-lg font-bold text-primary">{perf.value}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    )}
                </>
            )}
        </div>
    );

    // Configuration View Component
    const ConfigureView = () => (
        <div className="space-y-6">
            {/* Mode Toggle Card */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
            >
                <Card className="border-primary/20 bg-gradient-to-br from-card to-card/50">
                    <CardContent className="p-6">
                        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                            <div className="flex items-start gap-4">
                                <div className={cn(
                                    "p-3 rounded-xl transition-colors",
                                    isCustomMode ? "bg-primary/20 text-primary" : "bg-secondary text-muted-foreground"
                                )}>
                                    <Sparkles className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-foreground mb-1">
                                        Custom Stats Mode
                                    </h3>
                                    <p className="text-sm text-muted-foreground max-w-md">
                                        {isCustomMode
                                            ? "Custom mode is ON. When viewing matches, you'll see your custom stats first."
                                            : hasCustomStats
                                                ? "Toggle to enable custom mode and see only your selected stats."
                                                : "Select stats below to enable custom mode."
                                        }
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2">
                                    <span className={cn(
                                        "text-sm font-medium",
                                        !isCustomMode ? "text-foreground" : "text-muted-foreground"
                                    )}>
                                        All Stats
                                    </span>
                                    <Switch
                                        checked={isCustomMode}
                                        onCheckedChange={handleModeToggle}
                                        disabled={!hasCustomStats}
                                        className="data-[state=checked]:bg-primary"
                                    />
                                    <span className={cn(
                                        "text-sm font-medium",
                                        isCustomMode ? "text-primary" : "text-muted-foreground"
                                    )}>
                                        Custom
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Selected stats summary */}
                        <div className="mt-4 pt-4 border-t border-border">
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-sm text-muted-foreground">
                                    Selected: <span className="text-primary font-semibold">{selectedStats.length}</span> / {ALL_STATS.length} stats
                                </span>
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={clearAllStats}
                                        disabled={selectedStats.length === 0}
                                        className="gap-1"
                                    >
                                        <Trash2 className="w-3 h-3" />
                                        Clear
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={selectAllStats}
                                        disabled={selectedStats.length === ALL_STATS.length}
                                        className="gap-1"
                                    >
                                        <CheckSquare className="w-3 h-3" />
                                        Select All
                                    </Button>
                                </div>
                            </div>

                            {selectedStats.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                    {selectedStats.slice(0, 8).map(statId => {
                                        const stat = ALL_STATS.find(s => s.id === statId);
                                        if (!stat) return null;
                                        return (
                                            <Badge
                                                key={statId}
                                                variant="secondary"
                                                className="gap-1 cursor-pointer hover:bg-destructive/20 transition-colors"
                                                onClick={() => toggleStat(statId)}
                                            >
                                                {stat.name}
                                                <X className="w-3 h-3" />
                                            </Badge>
                                        );
                                    })}
                                    {selectedStats.length > 8 && (
                                        <Badge variant="outline">
                                            +{selectedStats.length - 8} more
                                        </Badge>
                                    )}
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            {/* Search */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.15 }}
            >
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        type="text"
                        placeholder="Search stats..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 bg-secondary border-border"
                    />
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery("")}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </div>
            </motion.div>

            {/* Stats Categories */}
            <motion.div
                className="space-y-4"
                variants={containerVariants}
                initial="hidden"
                animate="show"
            >
                {STAT_CATEGORIES.map((category) => {
                    const categoryStats = groupedStats[category.id] || [];
                    if (categoryStats.length === 0) return null;

                    const Icon = getCategoryIcon(category.id);
                    const isExpanded = expandedCategory === category.id;
                    const selectedCount = getSelectedCountInCategory(category.id);
                    const totalCount = categoryStats.length;
                    const isFullySelected = isCategoryFullySelected(category.id);

                    return (
                        <motion.div key={category.id} variants={itemVariants}>
                            <Card className={cn(
                                "overflow-hidden transition-all duration-200",
                                isExpanded && "border-primary/30"
                            )}>
                                <CardHeader
                                    className="cursor-pointer hover:bg-secondary/50 transition-colors"
                                    onClick={() => setExpandedCategory(isExpanded ? null : category.id)}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className={cn("p-2 rounded-lg bg-secondary", category.color)}>
                                                <Icon className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <CardTitle className="text-lg">{category.name}</CardTitle>
                                                <CardDescription>
                                                    {selectedCount} / {totalCount} selected
                                                </CardDescription>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    selectCategoryStats(category.id);
                                                }}
                                                className={cn(
                                                    "gap-1",
                                                    isFullySelected && "text-primary"
                                                )}
                                            >
                                                {isFullySelected ? (
                                                    <>
                                                        <Check className="w-4 h-4" />
                                                        Selected
                                                    </>
                                                ) : (
                                                    <>
                                                        <CheckSquare className="w-4 h-4" />
                                                        Select All
                                                    </>
                                                )}
                                            </Button>
                                            <ChevronRight className={cn(
                                                "w-5 h-5 text-muted-foreground transition-transform",
                                                isExpanded && "rotate-90"
                                            )} />
                                        </div>
                                    </div>
                                </CardHeader>

                                <AnimatePresence>
                                    {isExpanded && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: "auto", opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.2 }}
                                        >
                                            <CardContent className="pt-0 pb-4">
                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                                    {categoryStats.map((stat) => {
                                                        const isSelected = selectedStats.includes(stat.id);
                                                        return (
                                                            <motion.div
                                                                key={stat.id}
                                                                whileHover={{ scale: 1.01 }}
                                                                whileTap={{ scale: 0.99 }}
                                                            >
                                                                <div
                                                                    onClick={() => toggleStat(stat.id)}
                                                                    className={cn(
                                                                        "p-4 rounded-lg border cursor-pointer transition-all",
                                                                        isSelected
                                                                            ? "border-primary bg-primary/10"
                                                                            : "border-border bg-secondary/50 hover:border-primary/30"
                                                                    )}
                                                                >
                                                                    <div className="flex items-start justify-between">
                                                                        <div className="flex-1">
                                                                            <div className="flex items-center gap-2 mb-1">
                                                                                <Checkbox
                                                                                    checked={isSelected}
                                                                                    className="pointer-events-none"
                                                                                />
                                                                                <span className={cn(
                                                                                    "font-medium",
                                                                                    isSelected ? "text-primary" : "text-foreground"
                                                                                )}>
                                                                                    {stat.name}
                                                                                </span>
                                                                            </div>
                                                                            <p className="text-xs text-muted-foreground ml-6">
                                                                                {stat.description}
                                                                            </p>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </motion.div>
                                                        );
                                                    })}
                                                </div>
                                            </CardContent>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </Card>
                        </motion.div>
                    );
                })}
            </motion.div>

            {/* Info Card */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.3 }}
            >
                <Card className="bg-secondary/30 border-dashed">
                    <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                            <Info className="w-5 h-5 text-primary mt-0.5" />
                            <div>
                                <p className="text-sm text-muted-foreground">
                                    <strong className="text-foreground">How it works:</strong> When Custom Mode is enabled,
                                    clicking on a match will show your selected stats first instead of the Overview section.
                                    This helps you focus on the metrics that matter most to your coaching strategy.
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-pulse text-primary">Loading...</div>
            </div>
        );
    }

    return (
        <div className={embedded ? "bg-background" : "min-h-screen bg-background"}>
            {!embedded && <AuthHeader title="Custom Stats" />}
            {!embedded && <Sidebar />}

            <main className={cn(
                embedded ? "pb-12 px-6" : "pt-24 pb-12 px-6 transition-all duration-300",
                !embedded && (isCollapsed ? "ml-16" : "ml-64")
            )}>
                <div className="container mx-auto max-w-6xl">
                    {/* Page Header */}
                    <motion.div
                        className="mb-6"
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                    >
                        <h1 className="text-3xl font-bold text-foreground mb-2">
                            Custom <span className="text-primary">Stats</span>
                        </h1>
                        <p className="text-muted-foreground">
                            {embedded
                                ? "View your selected statistics for this match or configure your preferences."
                                : "Select the statistics you want to focus on. Your preferences will be saved and used across matches."
                            }
                        </p>
                    </motion.div>

                    {/* Tabbed Interface for Embedded Mode */}
                    {embedded ? (
                        <Tabs value={activeSubTab} onValueChange={(v) => setActiveSubTab(v as 'stats' | 'configure')} className="space-y-6">
                            <TabsList className="bg-secondary border border-border">
                                <TabsTrigger
                                    value="stats"
                                    className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground flex items-center gap-2"
                                    disabled={!hasCustomStats}
                                >
                                    <BarChart3 className="w-4 h-4" />
                                    View Stats
                                    {hasCustomStats && (
                                        <Badge variant="secondary" className="ml-1 text-xs">
                                            {selectedStats.length}
                                        </Badge>
                                    )}
                                </TabsTrigger>
                                <TabsTrigger
                                    value="configure"
                                    className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground flex items-center gap-2"
                                >
                                    <Settings className="w-4 h-4" />
                                    Configure
                                </TabsTrigger>
                            </TabsList>

                            <TabsContent value="stats" className="mt-0">
                                <StatsView />
                            </TabsContent>

                            <TabsContent value="configure" className="mt-0">
                                <ConfigureView />
                            </TabsContent>
                        </Tabs>
                    ) : (
                        <ConfigureView />
                    )}
                </div>
            </main>

            {/* Confirmation Dialog */}
            <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Enable Custom Stats Mode?</DialogTitle>
                        <DialogDescription>
                            When enabled, clicking on any match will show your custom stats view first instead of the Overview.
                            You have selected <strong className="text-primary">{selectedStats.length} stats</strong> to display.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                            {selectedStats.map(statId => {
                                const stat = ALL_STATS.find(s => s.id === statId);
                                if (!stat) return null;
                                return (
                                    <Badge key={statId} variant="secondary">
                                        {stat.name}
                                    </Badge>
                                );
                            })}
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowConfirmDialog(false)}>
                            Cancel
                        </Button>
                        <Button onClick={confirmModeChange} className="gap-2">
                            <Check className="w-4 h-4" />
                            Enable Custom Mode
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default CustomStats;
