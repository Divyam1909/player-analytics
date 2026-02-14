import { useState, useMemo, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Search, X, ChevronRight } from 'lucide-react';

// Define the hierarchical stats structure
export interface StatsNode {
    id: string;
    name: string;
    shortName?: string; // Optional short name for display in tight spaces
    value: number | null;
    children?: StatsNode[];
    level: number;
    baseColor?: string;
    startAngle?: number;
    endAngle?: number;
    centerAngle?: number;
    suffix?: string; // Optional suffix like '%' for percentage values
}

// Short name mappings for common stats
const SHORT_NAME_MAP: Record<string, string> = {
    // Passing
    'Successful': 'SC',
    'Unsuccessful': 'US',
    'Progressive': 'PG',
    'Key Passes': 'KP',
    'Assists': 'AS',
    'Crosses': 'CR',
    'Long Passes': 'LP',
    'Short Passes': 'SP',
    'Through Balls': 'TB',
    'Other': 'OT',
    'Blocked': 'BL',
    'Clearance': 'CL',
    'Interception': 'IN',
    'Offside': 'OF',
    'Ball Recoveries': 'BR',
    'High Pressing': 'HP',
    // Set Pieces
    'Set Pieces': 'SP',
    'Goal Kicks': 'GK',
    'Free Kicks': 'FK',
    'Corners': 'CN',
    'Throw-ins': 'TI',
    'First Contact': '1C',
    'Second Contact': '2C',
    'Penalties': 'PN',
    // Duels
    'Duels': 'DU',
    'Aerial': 'AE',
    'Ground': 'GR',
    'Dribbles': 'DR',
    'Won': 'WN',
    'Lost': 'LT',
    'Tackles Won': 'TW',
    'Tackles Lost': 'TL',
    'Failed': 'FL',
    'Dribble Success Rate': 'DS',
    // Goalkeeper
    'Keeper Stats': 'GK',
    'Saves': 'SV',
    'Inside Box': 'IB',
    'Outside Box': 'OB',
    'Actions': 'AC',
    'Punches': 'PU',
    'Catches': 'CT',
    'Sweepings': 'SW',
    'Conceded': 'GC',
    // Outplays
    'Outplays': 'OP',
    'Passing': 'PS',
    'Dribbling': 'DR',
    'Players Outplayed': 'PO',
    'Lines Broken': 'LB',
};

// Get short name for a stat
function getShortName(name: string, providedShortName?: string): string {
    if (providedShortName) return providedShortName;
    return SHORT_NAME_MAP[name] || name.slice(0, 2).toUpperCase();
}

interface ExpandableStatsChartProps {
    data: StatsNode;
    className?: string;
    variant?: 'doughnut' | 'pie';
}

// Flattened stat item for search
interface FlatStatItem {
    id: string;
    name: string;
    value: number | null;
    path: string[]; // Array of parent IDs to expand to this stat
    pathNames: string[]; // Array of parent names for display
    level: number;
}

// Color palette that matches the website theme
const CATEGORY_COLORS: Record<string, { main: string; light: string; lighter: string }> = {
    passes: {
        main: 'hsl(217, 91%, 50%)',
        light: 'hsl(217, 91%, 60%)',
        lighter: 'hsl(217, 91%, 72%)',
    },
    shots: {
        main: 'hsl(0, 72%, 51%)',
        light: 'hsl(0, 72%, 60%)',
        lighter: 'hsl(0, 72%, 72%)',
    },
    duels: {
        main: 'hsl(38, 92%, 50%)',
        light: 'hsl(38, 92%, 58%)',
        lighter: 'hsl(38, 92%, 70%)',
    },
    defensive: {
        main: 'hsl(142, 71%, 45%)',
        light: 'hsl(142, 71%, 55%)',
        lighter: 'hsl(142, 71%, 68%)',
    },
    setpieces: {
        main: 'hsl(270, 70%, 55%)',
        light: 'hsl(270, 70%, 65%)',
        lighter: 'hsl(270, 70%, 78%)',
    },
    goalkeeper: {
        main: 'hsl(190, 80%, 45%)',
        light: 'hsl(190, 80%, 55%)',
        lighter: 'hsl(190, 80%, 68%)',
    },
    fouls: {
        main: 'hsl(330, 70%, 50%)',
        light: 'hsl(330, 70%, 60%)',
        lighter: 'hsl(330, 70%, 72%)',
    },
    outplays: {
        main: 'hsl(160, 70%, 45%)',
        light: 'hsl(160, 70%, 55%)',
        lighter: 'hsl(160, 70%, 68%)',
    },
};

// Helper: Convert polar to cartesian
function polarToCartesian(centerX: number, centerY: number, radius: number, angleInRadians: number) {
    return {
        x: centerX + (radius * Math.cos(angleInRadians)),
        y: centerY + (radius * Math.sin(angleInRadians))
    };
}

// Helper: Describe an arc path with smooth corners
function describeArc(x: number, y: number, innerRadius: number, outerRadius: number, startAngle: number, endAngle: number, padding: number = 0.01) {
    if (innerRadius >= outerRadius) return "";

    // Add small padding between segments
    const paddedStart = startAngle + padding;
    const paddedEnd = endAngle - padding;

    if (paddedStart >= paddedEnd) return "";

    const start = polarToCartesian(x, y, outerRadius, paddedEnd);
    const end = polarToCartesian(x, y, outerRadius, paddedStart);
    const start2 = polarToCartesian(x, y, innerRadius, paddedEnd);
    const end2 = polarToCartesian(x, y, innerRadius, paddedStart);

    const largeArcFlag = paddedEnd - paddedStart <= Math.PI ? "0" : "1";

    return [
        "M", start.x, start.y,
        "A", outerRadius, outerRadius, 0, largeArcFlag, 0, end.x, end.y,
        "L", end2.x, end2.y,
        "A", innerRadius, innerRadius, 0, largeArcFlag, 1, start2.x, start2.y,
        "Z"
    ].join(" ");
}

// Calculate values recursively
function calculateHierarchy(node: StatsNode): number {
    if (!node.children || node.children.length === 0) {
        return node.value ?? 0;
    }
    const sum = node.children.reduce((acc, child) => acc + calculateHierarchy(child), 0);
    node.value = sum;
    return sum;
}

// Assign angles recursively
function assignAngles(node: StatsNode, startAngle: number, endAngle: number) {
    node.startAngle = startAngle;
    node.endAngle = endAngle;
    node.centerAngle = startAngle + (endAngle - startAngle) / 2;

    if (node.children && node.children.length > 0) {
        let curr = startAngle;
        const total = node.value ?? 0;
        const span = endAngle - startAngle;

        node.children.forEach(child => {
            const childValue = child.value ?? 0;
            const childSpan = total > 0 ? (childValue / total) * span : span / node.children!.length;
            assignAngles(child, curr, curr + childSpan);
            curr += childSpan;
        });
    }
}

const ExpandableStatsChart = ({ data, className, variant = 'doughnut' }: ExpandableStatsChartProps) => {
    const [activePath, setActivePath] = useState<string[]>([]);
    const [hoveredNode, setHoveredNode] = useState<StatsNode | null>(null);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const containerRef = useRef<HTMLDivElement>(null);

    // Search state
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [selectedSearchIndex, setSelectedSearchIndex] = useState(0);
    const searchInputRef = useRef<HTMLInputElement>(null);
    const searchContainerRef = useRef<HTMLDivElement>(null);

    // Process data
    const processedData = useMemo(() => {
        const clonedData = JSON.parse(JSON.stringify(data)) as StatsNode;
        calculateHierarchy(clonedData);
        assignAngles(clonedData, -Math.PI / 2, Math.PI * 1.5); // Start from top
        return clonedData;
    }, [data]);

    // Flatten all stats for search
    const flattenedStats = useMemo(() => {
        const result: FlatStatItem[] = [];

        const flatten = (node: StatsNode, pathIds: string[], pathNames: string[]) => {
            if (node.level > 0) {
                result.push({
                    id: node.id,
                    name: node.name,
                    value: node.value,
                    path: [...pathIds],
                    pathNames: [...pathNames],
                    level: node.level,
                });
            }

            if (node.children) {
                node.children.forEach(child => {
                    flatten(
                        child,
                        node.level > 0 ? [...pathIds, node.id] : pathIds,
                        node.level > 0 ? [...pathNames, node.name] : pathNames
                    );
                });
            }
        };

        flatten(processedData, [], []);
        return result;
    }, [processedData]);

    // Filter stats based on search query
    const filteredStats = useMemo(() => {
        if (!searchQuery.trim()) return flattenedStats;

        const query = searchQuery.toLowerCase();
        return flattenedStats.filter(stat =>
            stat.name.toLowerCase().includes(query) ||
            stat.pathNames.some(name => name.toLowerCase().includes(query))
        );
    }, [flattenedStats, searchQuery]);

    // Reset selected index when filtered results change
    useEffect(() => {
        setSelectedSearchIndex(0);
    }, [filteredStats]);

    // Handle keyboard navigation in search
    const handleSearchKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setSelectedSearchIndex(prev =>
                prev < filteredStats.length - 1 ? prev + 1 : prev
            );
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSelectedSearchIndex(prev => prev > 0 ? prev - 1 : 0);
        } else if (e.key === 'Enter' && filteredStats.length > 0) {
            e.preventDefault();
            handleSelectStat(filteredStats[selectedSearchIndex]);
        } else if (e.key === 'Escape') {
            setIsSearchOpen(false);
            setSearchQuery('');
        }
    }, [filteredStats, selectedSearchIndex]);

    // Handle stat selection from search
    const handleSelectStat = useCallback((stat: FlatStatItem) => {
        // Build the path to expand to this stat
        const pathToExpand = [...stat.path, stat.id];
        setActivePath(pathToExpand);
        setSearchQuery('');
        setIsSearchOpen(false);
    }, []);

    // Close search dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
                setIsSearchOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Reset pie chart to main view when clicking outside the chart
    useEffect(() => {
        const handleChartClickOutside = (e: MouseEvent) => {
            if (activePath.length > 0 && containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setActivePath([]);
            }
        };

        document.addEventListener('mousedown', handleChartClickOutside);
        return () => document.removeEventListener('mousedown', handleChartClickOutside);
    }, [activePath]);

    // Get color for search result based on path
    const getSearchResultColor = useCallback((stat: FlatStatItem): string => {
        // Get the root category from the path
        const rootCategory = stat.pathNames[0]?.toLowerCase() || stat.name.toLowerCase();

        const colors = rootCategory.includes('pass') ? CATEGORY_COLORS.passes
            : rootCategory.includes('shot') ? CATEGORY_COLORS.shots
                : rootCategory.includes('duel') ? CATEGORY_COLORS.duels
                    : rootCategory.includes('defen') ? CATEGORY_COLORS.defensive
                        : rootCategory.includes('set') || rootCategory.includes('piece') ? CATEGORY_COLORS.setpieces
                            : rootCategory.includes('goal') || rootCategory.includes('keep') || rootCategory.includes('save') ? CATEGORY_COLORS.goalkeeper
                                : rootCategory.includes('foul') || rootCategory.includes('card') ? CATEGORY_COLORS.fouls
                                    : rootCategory.includes('outplay') ? CATEGORY_COLORS.outplays
                                        : CATEGORY_COLORS.passes;

        if (stat.level === 1) return colors.main;
        if (stat.level === 2) return colors.light;
        return colors.lighter;
    }, []);

    // Level configuration - tighter rings for better appearance
    const LEVELS: Record<number, { inner: number; outer: number }> = variant === 'pie' ? {
        0: { inner: 0, outer: 0 },
        1: { inner: 0, outer: 120 },
        2: { inner: 130, outer: 160 },
        3: { inner: 170, outer: 195 },
        4: { inner: 205, outer: 215 },
    } : {
        0: { inner: 0, outer: 45 },
        1: { inner: 55, outer: 95 },
        2: { inner: 105, outer: 140 },
        3: { inner: 150, outer: 180 },
        4: { inner: 190, outer: 215 },
    };

    // Flatten nodes for rendering
    const flattenNodes = useCallback((node: StatsNode, path: StatsNode[] = []): { node: StatsNode; path: StatsNode[] }[] => {
        const result: { node: StatsNode; path: StatsNode[] }[] = [];
        result.push({ node, path });

        if (node.children) {
            node.children.forEach(child => {
                result.push(...flattenNodes(child, [...path, node]));
            });
        }

        return result;
    }, []);

    const allNodes = useMemo(() => flattenNodes(processedData), [flattenNodes, processedData]);

    // Get parent ID
    const getParentId = useCallback((node: StatsNode): string | null => {
        for (const item of allNodes) {
            if (item.node.children?.find(c => c.id === node.id)) {
                return item.node.id;
            }
        }
        return null;
    }, [allNodes]);

    // Get root category for a node
    const getRootCategory = useCallback((node: StatsNode): string => {
        let current = node;
        let item = allNodes.find(n => n.node.id === node.id);

        while (item && item.path.length > 1) {
            current = item.path[1];
            item = allNodes.find(n => n.node.id === current.id);
        }

        if (current.level === 1) {
            return current.name.toLowerCase();
        }

        return node.name.toLowerCase();
    }, [allNodes]);

    // Check if node should be visible
    const isNodeVisible = useCallback((node: StatsNode): boolean => {
        if (node.level === 0) return false;
        if (node.level === 1) return true;

        const parentId = getParentId(node);
        if (!parentId) return false;

        return activePath.includes(parentId);
    }, [activePath, getParentId]);

    // Check if node is dimmed
    const isNodeDimmed = useCallback((node: StatsNode): boolean => {
        if (activePath.length === 0) return false;
        if (activePath.includes(node.id)) return false;

        const parentId = getParentId(node);
        if (parentId) {
            const parent = allNodes.find(n => n.node.id === parentId)?.node;
            if (parent?.children) {
                const hasActiveSibling = parent.children.some(c => activePath.includes(c.id));
                if (hasActiveSibling && !activePath.includes(node.id)) return true;
            }
        }

        return false;
    }, [activePath, allNodes, getParentId]);

    // Handle click
    const handleNodeClick = useCallback((node: StatsNode) => {
        if (activePath.includes(node.id) && activePath[activePath.length - 1] === node.id) {
            setActivePath(prev => prev.slice(0, -1));
        } else {
            const path: string[] = [];
            let current: StatsNode | null = node;
            while (current) {
                if (current.level > 0) {
                    path.unshift(current.id);
                }
                const parentId = getParentId(current);
                current = parentId ? allNodes.find(n => n.node.id === parentId)?.node ?? null : null;
            }
            setActivePath(path);
        }
    }, [activePath, allNodes, getParentId]);

    // Handle mouse move for tooltip
    const handleMouseMove = useCallback((e: React.MouseEvent) => {
        if (containerRef.current) {
            const rect = containerRef.current.getBoundingClientRect();
            setMousePos({
                x: e.clientX - rect.left,
                y: e.clientY - rect.top
            });
        }
    }, []);

    // Get node color
    const getNodeColor = useCallback((node: StatsNode): string => {
        const category = getRootCategory(node);

        const colors = category.includes('pass') ? CATEGORY_COLORS.passes
            : category.includes('shot') ? CATEGORY_COLORS.shots
                : category.includes('duel') ? CATEGORY_COLORS.duels
                    : category.includes('defen') ? CATEGORY_COLORS.defensive
                        : category.includes('set') || category.includes('piece') ? CATEGORY_COLORS.setpieces
                            : category.includes('goal') || category.includes('keep') || category.includes('save') ? CATEGORY_COLORS.goalkeeper
                                : category.includes('foul') || category.includes('card') ? CATEGORY_COLORS.fouls
                                    : category.includes('outplay') ? CATEGORY_COLORS.outplays
                                        : CATEGORY_COLORS.passes;

        if (node.level === 1) return colors.main;
        if (node.level === 2) return colors.light;
        return colors.lighter;
    }, [getRootCategory]);

    // Calculate arc props with animations
    const getArcProps = useCallback((node: StatsNode) => {
        const levelConfig = LEVELS[node.level] || LEVELS[3];
        const isVisible = isNodeVisible(node);
        const isDimmed = isNodeDimmed(node);
        const isActive = activePath.includes(node.id);
        const isLastActive = activePath[activePath.length - 1] === node.id;

        let innerR = levelConfig.inner;
        let outerR = levelConfig.outer;
        let opacity = 1;

        if (!isVisible) {
            innerR = levelConfig.inner;
            outerR = levelConfig.inner;
            opacity = 0;
        } else if (isDimmed) {
            outerR = levelConfig.inner + 12;
            opacity = 0.25;
        } else if (isLastActive) {
            outerR = levelConfig.outer + 8;
        } else if (isActive) {
            outerR = levelConfig.outer + 3;
        }

        return { innerR, outerR, opacity, isVisible };
    }, [activePath, isNodeDimmed, isNodeVisible]);

    // Get breadcrumb path
    const breadcrumbPath = useMemo(() => {
        const path: StatsNode[] = [];
        activePath.forEach(id => {
            const node = allNodes.find(n => n.node.id === id)?.node;
            if (node) path.push(node);
        });
        return path;
    }, [activePath, allNodes]);

    return (
        <div
            ref={containerRef}
            className={cn("relative select-none", className)}
            onMouseMove={handleMouseMove}
        >
            {/* Search Bar */}
            <div ref={searchContainerRef} className="relative mb-4 max-w-md mx-auto">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                        ref={searchInputRef}
                        type="text"
                        placeholder="Search stats... (e.g., Goals, Assists, Interceptions)"
                        value={searchQuery}
                        onChange={(e) => {
                            setSearchQuery(e.target.value);
                            setIsSearchOpen(true);
                        }}
                        onFocus={() => setIsSearchOpen(true)}
                        onKeyDown={handleSearchKeyDown}
                        className="w-full pl-10 pr-10 py-2.5 text-sm rounded-lg bg-secondary/50 border border-border focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors placeholder:text-muted-foreground/60"
                    />
                    {searchQuery && (
                        <button
                            onClick={() => {
                                setSearchQuery('');
                                searchInputRef.current?.focus();
                            }}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </div>

                {/* Search Dropdown */}
                <AnimatePresence>
                    {isSearchOpen && searchQuery && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.15 }}
                            className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-lg shadow-xl z-50 max-h-80 overflow-y-auto"
                        >
                            {filteredStats.length === 0 ? (
                                <div className="px-4 py-3 text-sm text-muted-foreground text-center">
                                    No stats found for "{searchQuery}"
                                </div>
                            ) : (
                                <div className="py-1">
                                    {filteredStats.slice(0, 20).map((stat, index) => (
                                        <button
                                            key={stat.id}
                                            onClick={() => handleSelectStat(stat)}
                                            onMouseEnter={() => setSelectedSearchIndex(index)}
                                            className={cn(
                                                "w-full px-4 py-2.5 text-left flex items-center gap-3 transition-colors",
                                                index === selectedSearchIndex
                                                    ? "bg-primary/10"
                                                    : "hover:bg-secondary/50"
                                            )}
                                        >
                                            <div
                                                className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                                                style={{ backgroundColor: getSearchResultColor(stat) }}
                                            />
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-1 text-xs text-muted-foreground mb-0.5">
                                                    {stat.pathNames.map((name, i) => (
                                                        <span key={i} className="flex items-center gap-1">
                                                            {name}
                                                            {i < stat.pathNames.length - 1 && (
                                                                <ChevronRight className="w-3 h-3" />
                                                            )}
                                                        </span>
                                                    ))}
                                                </div>
                                                <div className="flex items-center justify-between gap-2">
                                                    <span className="font-medium text-foreground truncate">
                                                        {stat.name}
                                                    </span>
                                                    <span className="text-sm font-semibold text-primary flex-shrink-0">
                                                        {stat.value !== null ? stat.value.toLocaleString() : '--'}
                                                    </span>
                                                </div>
                                            </div>
                                        </button>
                                    ))}
                                    {filteredStats.length > 20 && (
                                        <div className="px-4 py-2 text-xs text-muted-foreground text-center border-t border-border">
                                            Showing 20 of {filteredStats.length} results
                                        </div>
                                    )}
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Floating Tooltip - follows mouse */}
            <AnimatePresence>
                {hoveredNode && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.15 }}
                        className="absolute z-50 pointer-events-none"
                        style={{
                            left: mousePos.x + 15,
                            top: mousePos.y - 10,
                            transform: 'translateY(-100%)',
                        }}
                    >
                        <div className="bg-card/95 backdrop-blur-md border border-border rounded-lg px-3 py-2 shadow-xl">
                            <p className="text-xs text-muted-foreground mb-0.5">{getRootCategory(hoveredNode)}</p>
                            <p className="text-sm font-semibold text-foreground">{hoveredNode.name}</p>
                            <p className="text-xl font-bold" style={{ color: getNodeColor(hoveredNode) }}>
                                {hoveredNode.value !== null ? `${hoveredNode.value.toLocaleString()}${hoveredNode.suffix || ''}` : '--'}
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Breadcrumb Navigation */}
            <div className="flex items-center justify-center gap-2 mb-4 min-h-[28px]">
                <button
                    onClick={() => setActivePath([])}
                    className={cn(
                        "text-xs font-medium px-2 py-1 rounded transition-colors",
                        activePath.length === 0
                            ? "text-primary bg-primary/10"
                            : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                    )}
                >
                    All Stats
                </button>
                {breadcrumbPath.map((node, idx) => (
                    <div key={node.id} className="flex items-center gap-2">
                        <span className="text-muted-foreground/50">/</span>
                        <button
                            onClick={() => {
                                const newPath = activePath.slice(0, idx + 1);
                                setActivePath(newPath);
                            }}
                            className={cn(
                                "text-xs font-medium px-2 py-1 rounded transition-colors",
                                idx === breadcrumbPath.length - 1
                                    ? "text-primary bg-primary/10"
                                    : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                            )}
                        >
                            {node.name}
                        </button>
                    </div>
                ))}
            </div>

            {/* SVG Chart */}
            <div className="flex justify-center">
                <svg
                    viewBox="-230 -230 460 460"
                    className="w-full max-w-[460px] aspect-square overflow-visible"
                >
                    {/* Subtle glow filter */}
                    <defs>
                        <filter id="glow-stats" x="-50%" y="-50%" width="200%" height="200%">
                            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                            <feMerge>
                                <feMergeNode in="coloredBlur" />
                                <feMergeNode in="SourceGraphic" />
                            </feMerge>
                        </filter>
                        <filter id="shadow-stats">
                            <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.3" />
                        </filter>
                        <filter id="pie-hover-shadow" x="-50%" y="-50%" width="200%" height="200%">
                            <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="rgba(0,0,0,0.5)" floodOpacity="0.6" />
                            <feDropShadow dx="0" dy="1" stdDeviation="2" floodColor="rgba(255,255,255,0.15)" floodOpacity="0.3" />
                        </filter>
                    </defs>

                    {/* Background rings for depth */}
                    {[1, 2, 3].map(level => {
                        const config = LEVELS[level];
                        if (!config) return null;
                        return (
                            <circle
                                key={`bg-ring-${level}`}
                                cx={0}
                                cy={0}
                                r={(config.inner + config.outer) / 2}
                                fill="none"
                                stroke="hsl(var(--border))"
                                strokeWidth={config.outer - config.inner}
                                strokeOpacity={0.1}
                            />
                        );
                    })}

                    {/* Render arcs */}
                    {allNodes.map(({ node }) => {
                        if (node.level === 0) return null;
                        const { innerR, outerR, opacity } = getArcProps(node);
                        const isHovered = hoveredNode?.id === node.id;
                        const isPieSlice = variant === 'pie' && node.level === 1;

                        const d = describeArc(
                            0, 0,
                            innerR,
                            isHovered ? outerR + (isPieSlice ? 8 : 5) : outerR,
                            node.startAngle ?? 0,
                            node.endAngle ?? 0,
                            variant === 'pie' && node.level === 1 ? 0.008 : 0.015
                        );

                        if (!d) return null;

                        // For pie slices, compute a slight outward translation on hover for 3D lift
                        let hoverTranslateX = 0;
                        let hoverTranslateY = 0;
                        if (isPieSlice && isHovered) {
                            const midAngle = (node.startAngle ?? 0) + ((node.endAngle ?? 0) - (node.startAngle ?? 0)) / 2;
                            hoverTranslateX = Math.cos(midAngle) * 6;
                            hoverTranslateY = Math.sin(midAngle) * 6;
                        }

                        return (
                            <motion.path
                                key={node.id}
                                d={d}
                                fill={getNodeColor(node)}
                                fillOpacity={opacity}
                                stroke={isPieSlice ? 'hsl(var(--card))' : 'hsl(var(--background))'}
                                strokeWidth={isPieSlice ? 2.5 : 1.5}
                                className="cursor-pointer"
                                style={{
                                    filter: isHovered
                                        ? (isPieSlice ? 'url(#pie-hover-shadow)' : 'url(#glow-stats)')
                                        : undefined,
                                }}
                                onClick={() => handleNodeClick(node)}
                                onMouseEnter={() => setHoveredNode(node)}
                                onMouseLeave={() => setHoveredNode(null)}
                                initial={false}
                                animate={{
                                    fillOpacity: isHovered && isPieSlice ? Math.min(opacity + 0.15, 1) : opacity,
                                    x: hoverTranslateX,
                                    y: hoverTranslateY,
                                    scale: isHovered ? (isPieSlice ? 1.04 : 1.02) : 1,
                                }}
                                transition={{ duration: 0.25, ease: "easeOut" }}
                            />
                        );
                    })}

                    {/* Value labels on pie slices (pie variant only) */}
                    {variant === 'pie' && allNodes.map(({ node }) => {
                        if (node.level !== 1) return null;
                        const { opacity, isVisible } = getArcProps(node);
                        if (!isVisible || opacity < 0.5) return null;

                        const levelConfig = LEVELS[node.level] || LEVELS[3];
                        const midAngle = (node.startAngle ?? 0) + ((node.endAngle ?? 0) - (node.startAngle ?? 0)) / 2;
                        const midR = levelConfig.outer * 0.55;
                        const pos = polarToCartesian(0, 0, midR, midAngle);

                        const arcAngle = (node.endAngle ?? 0) - (node.startAngle ?? 0);
                        if (arcAngle < 0.25) return null;

                        return (
                            <g key={`pie-val-${node.id}`}>
                                <text
                                    x={pos.x}
                                    y={pos.y - 6}
                                    textAnchor="middle"
                                    dominantBaseline="middle"
                                    className="pointer-events-none select-none"
                                    fill="white"
                                    fontSize={13}
                                    fontWeight="700"
                                    style={{ textShadow: '0 1px 3px rgba(0,0,0,0.9), 0 0 6px rgba(0,0,0,0.5)' }}
                                >
                                    {node.name}
                                </text>
                                <text
                                    x={pos.x}
                                    y={pos.y + 10}
                                    textAnchor="middle"
                                    dominantBaseline="middle"
                                    className="pointer-events-none select-none"
                                    fill="white"
                                    fontSize={16}
                                    fontWeight="800"
                                    style={{ textShadow: '0 1px 3px rgba(0,0,0,0.9), 0 0 6px rgba(0,0,0,0.5)' }}
                                >
                                    {node.value?.toLocaleString() ?? 0}
                                </text>
                            </g>
                        );
                    })}

                    {/* Labels for visible segments (skip level 1 in pie mode — already has value labels) */}
                    {allNodes.map(({ node }) => {
                        if (node.level === 0) return null;
                        if (variant === 'pie' && node.level === 1) return null;
                        const { opacity, isVisible } = getArcProps(node);
                        if (!isVisible || opacity < 0.5) return null;

                        const levelConfig = LEVELS[node.level] || LEVELS[3];
                        const midAngle = (node.startAngle ?? 0) + ((node.endAngle ?? 0) - (node.startAngle ?? 0)) / 2;
                        const midR = levelConfig.inner + (levelConfig.outer - levelConfig.inner) / 2;
                        const pos = polarToCartesian(0, 0, midR, midAngle);

                        const arcAngle = (node.endAngle ?? 0) - (node.startAngle ?? 0);
                        // Skip labels for very small arcs
                        if (arcAngle < 0.15) return null;

                        // Calculate text rotation for readability
                        let textRotation = (midAngle * 180 / Math.PI);
                        const flipText = midAngle > Math.PI / 2 && midAngle < Math.PI * 1.5;
                        if (flipText) {
                            textRotation += 180;
                        }

                        // Determine label based on available space
                        // Use short name for small arcs, full name for larger ones
                        const arcLength = arcAngle * midR; // Approximate arc length in pixels
                        const useShortName = arcAngle < 0.5 || arcLength < 50 || node.name.length > 8;
                        const shortName = getShortName(node.name, node.shortName);
                        const displayName = useShortName ? shortName : node.name;

                        return (
                            <g key={`label-${node.id}`}>
                                <text
                                    x={pos.x}
                                    y={pos.y}
                                    textAnchor="middle"
                                    dominantBaseline="middle"
                                    className="pointer-events-none select-none"
                                    fill="white"
                                    fontSize={useShortName ? (node.level === 1 ? 9 : 8) : (node.level === 1 ? 10 : 8)}
                                    fontWeight={node.level === 1 ? "700" : "600"}
                                    transform={`rotate(${textRotation}, ${pos.x}, ${pos.y})`}
                                    style={{
                                        textShadow: '0 1px 2px rgba(0,0,0,0.8), 0 0 4px rgba(0,0,0,0.5)',
                                        opacity: opacity > 0.5 ? 1 : 0
                                    }}
                                >
                                    {displayName}
                                </text>
                            </g>
                        );
                    })}

                    {/* Center circle with total (doughnut only) */}
                    {variant === 'doughnut' && (
                        <circle
                            cx={0}
                            cy={0}
                            r={45}
                            fill="hsl(var(--card))"
                            stroke="hsl(var(--border))"
                            strokeWidth={2}
                            filter="url(#shadow-stats)"
                        />
                    )}
                    {variant === 'doughnut' && (
                        <>
                            <text
                                x={0}
                                y={-10}
                                textAnchor="middle"
                                fill="hsl(var(--muted-foreground))"
                                fontSize={9}
                                fontWeight="500"
                                className="select-none uppercase tracking-wider"
                            >
                                Total
                            </text>
                            <text
                                x={0}
                                y={12}
                                textAnchor="middle"
                                fill="hsl(var(--primary))"
                                fontSize={18}
                                fontWeight="bold"
                                className="select-none"
                            >
                                {processedData.value?.toLocaleString() ?? 0}
                            </text>
                        </>
                    )}
                </svg>
            </div>

            {/* Category Legend */}
            <div className="flex flex-wrap justify-center gap-2 mt-6">
                {processedData.children?.map(child => {
                    const isActive = activePath.includes(child.id);
                    const hasActiveChild = child.children?.some(c => activePath.includes(c.id));

                    return (
                        <motion.button
                            key={child.id}
                            onClick={() => handleNodeClick(child)}
                            className={cn(
                                "flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all",
                                isActive || hasActiveChild
                                    ? "border-primary/50 bg-primary/10"
                                    : "border-border bg-secondary/30 hover:bg-secondary/60 hover:border-border"
                            )}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <div
                                className="w-2.5 h-2.5 rounded-full"
                                style={{ backgroundColor: getNodeColor(child) }}
                            />
                            <span className={cn(
                                "text-xs font-medium",
                                isActive || hasActiveChild ? "text-foreground" : "text-muted-foreground"
                            )}>
                                {child.name}
                            </span>
                            <span className={cn(
                                "text-xs tabular-nums",
                                isActive || hasActiveChild ? "text-primary" : "text-muted-foreground/70"
                            )}>
                                {child.value?.toLocaleString()}
                            </span>
                        </motion.button>
                    );
                })}
            </div>

            {/* Instructions */}
            <p className="text-center text-xs text-muted-foreground/60 mt-4">
                Click segments to drill down • Click again to collapse
            </p>
        </div>
    );
};

export default ExpandableStatsChart;
