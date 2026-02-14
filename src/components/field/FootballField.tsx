import { useState, useMemo, useId } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MatchEvent } from "@/types/player";
import { cn } from "@/lib/utils";
import { Play, Filter, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import TacticalField from "@/components/field/TacticalField";

interface FootballFieldProps {
  events: MatchEvent[];
  showHeatmap?: boolean;
}

type ViewMode = "heatmap";

// ViewBox constants for coordinate mapping
// Full field viewBox: '-8 -6 126 80' means x: -8 to 118, y: -6 to 74
// Actual pitch: x: 0 to 105, y: 0 to 68
const VIEWBOX_X_START = -8;
const VIEWBOX_WIDTH = 126;
const VIEWBOX_Y_START = -6;
const VIEWBOX_HEIGHT = 80;
const PITCH_WIDTH = 105;
const PITCH_HEIGHT = 68;

// Convert event coordinates (0-100) to CSS percentage position within the container
// accounting for the SVG viewBox padding
const toContainerPercent = (eventX: number, eventY: number) => {
  // Event coords are 0-100, map to pitch coords (0-105 for x, 0-68 for y)
  const pitchX = (eventX / 100) * PITCH_WIDTH;
  const pitchY = (eventY / 100) * PITCH_HEIGHT;

  // Convert pitch coords to viewBox coords, then to percentage
  const viewBoxX = pitchX - VIEWBOX_X_START;
  const viewBoxY = pitchY - VIEWBOX_Y_START;

  const percentX = (viewBoxX / VIEWBOX_WIDTH) * 100;
  const percentY = (viewBoxY / VIEWBOX_HEIGHT) * 100;

  return { x: percentX, y: percentY };
};

const FootballField = ({ events, showHeatmap = false }: FootballFieldProps) => {
  const uniqueId = useId();
  const [selectedEvent, setSelectedEvent] = useState<MatchEvent | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("heatmap");
  const [activeFilters, setActiveFilters] = useState<string[]>(["pass", "shot", "dribble", "interception", "tackle"]);
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationIndex, setAnimationIndex] = useState(-1);

  const eventColors: Record<string, { bg: string; glow: string; text: string; hsl: string }> = {
    pass: { bg: "bg-primary", glow: "shadow-primary/50", text: "text-primary", hsl: "199, 89%, 48%" },
    shot: { bg: "bg-destructive", glow: "shadow-destructive/50", text: "text-destructive", hsl: "0, 72%, 50%" },
    dribble: { bg: "bg-warning", glow: "shadow-warning/50", text: "text-warning", hsl: "38, 92%, 50%" },
    interception: { bg: "bg-success", glow: "shadow-success/50", text: "text-success", hsl: "142, 76%, 36%" },
    tackle: { bg: "bg-chart-4", glow: "shadow-chart-4/50", text: "text-chart-4", hsl: "280, 65%, 60%" },
  };

  const filteredEvents = useMemo(() => {
    return events.filter(event => activeFilters.includes(event.type));
  }, [events, activeFilters]);

  // Enhanced heatmap with proper grid calculation
  const heatmapData = useMemo(() => {
    if (filteredEvents.length === 0) return null;

    const gridCols = 12;
    const gridRows = 8;
    const zones: number[][] = Array(gridRows).fill(null).map(() => Array(gridCols).fill(0));

    filteredEvents.forEach(event => {
      const zoneX = Math.min(Math.floor(event.x / (100 / gridCols)), gridCols - 1);
      const zoneY = Math.min(Math.floor(event.y / (100 / gridRows)), gridRows - 1);
      zones[zoneY][zoneX]++;

      // Add weight to adjacent cells for smoother heatmap
      const addWeight = (y: number, x: number, weight: number) => {
        if (y >= 0 && y < gridRows && x >= 0 && x < gridCols) {
          zones[y][x] += weight;
        }
      };
      addWeight(zoneY - 1, zoneX, 0.3);
      addWeight(zoneY + 1, zoneX, 0.3);
      addWeight(zoneY, zoneX - 1, 0.3);
      addWeight(zoneY, zoneX + 1, 0.3);
    });

    const maxIntensity = Math.max(...zones.flat());
    return { zones, maxIntensity, gridCols, gridRows };
  }, [filteredEvents]);

  // Zone statistics
  const zoneStats = useMemo(() => {
    const leftThird = filteredEvents.filter(e => e.x < 33).length;
    const middleThird = filteredEvents.filter(e => e.x >= 33 && e.x < 66).length;
    const rightThird = filteredEvents.filter(e => e.x >= 66).length;
    const total = filteredEvents.length || 1;

    return {
      defensive: Math.round((leftThird / total) * 100),
      middle: Math.round((middleThird / total) * 100),
      attacking: Math.round((rightThird / total) * 100),
    };
  }, [filteredEvents]);

  // Event statistics
  const eventStats = useMemo(() => {
    const stats: Record<string, { total: number; successful: number }> = {};
    filteredEvents.forEach(event => {
      if (!stats[event.type]) {
        stats[event.type] = { total: 0, successful: 0 };
      }
      stats[event.type].total++;
      if (event.success) stats[event.type].successful++;
    });
    return stats;
  }, [filteredEvents]);

  // Animation playback
  const playAnimation = () => {
    if (isAnimating || filteredEvents.length === 0) return;

    setIsAnimating(true);
    setAnimationIndex(0);
    setSelectedEvent(null);

    let index = 0;
    const interval = setInterval(() => {
      index++;
      if (index >= filteredEvents.length) {
        clearInterval(interval);
        setIsAnimating(false);
        setAnimationIndex(-1);
      } else {
        setAnimationIndex(index);
      }
    }, 400);
  };

  const toggleFilter = (type: string) => {
    setActiveFilters(prev =>
      prev.includes(type)
        ? prev.filter(f => f !== type)
        : [...prev, type]
    );
  };

  const getHeatmapColor = (intensity: number, maxIntensity: number) => {
    if (maxIntensity === 0 || intensity === 0) return "transparent";
    const normalized = intensity / maxIntensity;

    // Smooth gradient from blue -> cyan -> green -> yellow -> red
    if (normalized < 0.2) {
      return `hsla(220, 80%, 60%, ${normalized * 3})`;
    } else if (normalized < 0.4) {
      return `hsla(180, 80%, 50%, ${0.3 + normalized * 0.5})`;
    } else if (normalized < 0.6) {
      return `hsla(120, 70%, 45%, ${0.4 + normalized * 0.4})`;
    } else if (normalized < 0.8) {
      return `hsla(45, 90%, 50%, ${0.5 + normalized * 0.3})`;
    }
    return `hsla(0, 85%, 55%, ${Math.min(0.85, 0.6 + normalized * 0.25)})`;
  };

  return (
    <div className="space-y-4">
      {/* Controls Bar */}
      <div className="flex flex-wrap items-center gap-3">
        {/* View Mode Toggle */}
        <div className="flex items-center gap-1 bg-secondary rounded-lg p-1 px-3">
          <span className="text-xs font-medium text-muted-foreground">Heatmap</span>
        </div>

        {/* Filter Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-7 gap-2">
              <Filter className="w-3 h-3" />
              Filter ({activeFilters.length})
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="bg-popover border-border">
            {Object.keys(eventColors).map((type) => (
              <DropdownMenuCheckboxItem
                key={type}
                checked={activeFilters.includes(type)}
                onCheckedChange={() => toggleFilter(type)}
                className="capitalize"
              >
                <span className={cn("mr-2 w-2 h-2 rounded-full inline-block", eventColors[type].bg)} />
                {type}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Animation Playback */}
        <Button
          variant="outline"
          size="sm"
          onClick={playAnimation}
          disabled={isAnimating || filteredEvents.length === 0}
          className="h-7 gap-2"
        >
          <Play className="w-3 h-3" />
          {isAnimating ? "Playing..." : "Replay"}
        </Button>

        {/* Stats Summary */}
        <div className="ml-auto flex items-center gap-2">
          <Badge variant="secondary" className="text-xs">
            {filteredEvents.length} touches
          </Badge>
        </div>
      </div>

      {/* Main Field Container */}
      <div className="relative w-full max-w-3xl mx-auto rounded-xl overflow-hidden border border-border shadow-xl aspect-[105/68]">
        {/* Tactical Field Background */}
        <TacticalField viewMode="full" className="absolute inset-0 w-full h-full" interactive={false} />

        {/* Subtle overlay for better visibility of markers */}
        <div className="absolute inset-0 bg-black/10" />


        {/* Heatmap Grid */}
        <AnimatePresence>
          {viewMode === "heatmap" && heatmapData && (() => {
            // Calculate the pitch area within the container (accounting for viewBox padding)
            const pitchLeft = ((-VIEWBOX_X_START) / VIEWBOX_WIDTH) * 100;
            const pitchTop = ((-VIEWBOX_Y_START) / VIEWBOX_HEIGHT) * 100;
            const pitchWidthPercent = (PITCH_WIDTH / VIEWBOX_WIDTH) * 100;
            const pitchHeightPercent = (PITCH_HEIGHT / VIEWBOX_HEIGHT) * 100;

            return (
              <motion.div
                className="absolute"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
                style={{
                  left: `${pitchLeft}%`,
                  top: `${pitchTop}%`,
                  width: `${pitchWidthPercent}%`,
                  height: `${pitchHeightPercent}%`,
                  display: 'grid',
                  gridTemplateColumns: `repeat(${heatmapData.gridCols}, 1fr)`,
                  gridTemplateRows: `repeat(${heatmapData.gridRows}, 1fr)`,
                }}
              >
                {heatmapData.zones.map((row, rowIndex) =>
                  row.map((intensity, colIndex) => (
                    <motion.div
                      key={`${rowIndex}-${colIndex}`}
                      initial={{ opacity: 0 }}
                      animate={{
                        opacity: 1,
                        backgroundColor: getHeatmapColor(intensity, heatmapData.maxIntensity),
                      }}
                      transition={{ duration: 0.5, delay: (rowIndex + colIndex) * 0.02 }}
                      style={{
                        filter: intensity > 0 ? "blur(4px)" : "none",
                      }}
                    />
                  ))
                )}
              </motion.div>
            );
          })()}
        </AnimatePresence>

        {/* Event points */}
        <AnimatePresence>
          {filteredEvents.map((event, index) => {
            const isAnimated = animationIndex >= 0 && index <= animationIndex;
            const isCurrentAnimation = index === animationIndex;

            // Special styling for shots: Goal = filled red, On Target = concentric circles, Missed = empty circle
            const isShot = event.type === "shot";
            const isGoal = isShot && (event.isGoal || event.shotOutcome === 'goal');
            const isOnTarget = isShot && !isGoal && (event.success || event.shotOutcome === 'saved');
            const isMissedShot = isShot && !isGoal && !isOnTarget;

            // Shot styling: all red, different fill patterns
            const getShotStyle = () => {
              if (isGoal) {
                return { background: "hsl(var(--destructive))", border: "none" };
              }
              if (isOnTarget) {
                return {
                  background: "transparent",
                  border: "2px solid hsl(var(--destructive))",
                  boxShadow: "inset 0 0 0 3px transparent, inset 0 0 0 5px hsl(var(--destructive))"
                };
              }
              if (isMissedShot) {
                return { background: "transparent", border: "2px solid hsl(var(--destructive))" };
              }
              return {};
            };

            const shotStyle = isShot ? getShotStyle() : {};

            // Convert event coordinates to container percentages
            const pos = toContainerPercent(event.x, event.y);

            return (
              <motion.div
                key={`event-${index}`}
                initial={{ scale: 0, opacity: 0 }}
                animate={{
                  scale: selectedEvent === event || isCurrentAnimation ? 1.5 : 1,
                  opacity: (!isAnimated && animationIndex >= 0) ? 0.3 : 1,
                }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className={cn(
                  "absolute cursor-pointer z-10",
                  !isShot && eventColors[event.type].bg,
                  "rounded-full",
                  selectedEvent === event && "ring-2 ring-white",
                  isCurrentAnimation && "ring-2 ring-white animate-pulse",
                )}
                style={{
                  left: `${pos.x}%`,
                  top: `${pos.y}%`,
                  transform: "translate(-50%, -50%)",
                  width: "12px",
                  height: "12px",
                  boxShadow: selectedEvent === event
                    ? `0 0 20px 4px hsla(${eventColors[event.type].hsl}, 0.6)`
                    : `0 2px 4px rgba(0,0,0,0.3)`,
                  ...shotStyle,
                }}
                onClick={() => setSelectedEvent(event === selectedEvent ? null : event)}
                whileHover={{ scale: 1.3 }}
              >
                {/* Inner circle for on-target shots (concentric effect) */}
                {isOnTarget && (
                  <div
                    className="absolute rounded-full border-2 border-destructive"
                    style={{
                      width: "6px",
                      height: "6px",
                      top: "50%",
                      left: "50%",
                      transform: "translate(-50%, -50%)",
                    }}
                  />
                )}
                {/* Time badge on hover/select */}
                <AnimatePresence>
                  {selectedEvent === event && (
                    <motion.div
                      className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-mono px-1.5 py-0.5 rounded bg-black/80 text-white whitespace-nowrap"
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 5 }}
                    >
                      {event.minute}'
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {/* Connection lines during animation */}
        {isAnimating && (
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-5">
            {filteredEvents.slice(0, animationIndex + 1).map((event, index) => {
              const startPos = toContainerPercent(event.x, event.y);
              const endPos = toContainerPercent(event.targetX, event.targetY);
              return (
                <motion.line
                  key={`line-${index}`}
                  x1={`${startPos.x}%`}
                  y1={`${startPos.y}%`}
                  x2={`${endPos.x}%`}
                  y2={`${endPos.y}%`}
                  stroke={event.success ? "hsl(142, 76%, 36%)" : "hsl(0, 72%, 50%)"}
                  strokeWidth="2"
                  strokeOpacity="0.6"
                  strokeDasharray="6,3"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.3 }}
                />
              );
            })}
          </svg>
        )}

        {/* Direction line for selected event */}
        {selectedEvent && !isAnimating && (() => {
          const startPos = toContainerPercent(selectedEvent.x, selectedEvent.y);
          const endPos = toContainerPercent(selectedEvent.targetX, selectedEvent.targetY);
          return (
            <svg className="absolute inset-0 w-full h-full pointer-events-none z-20">
              <defs>
                <marker
                  id={`arrowhead-${uniqueId}`}
                  markerWidth="10"
                  markerHeight="10"
                  refX="8"
                  refY="5"
                  orient="auto"
                >
                  <polygon
                    points="0 0, 10 5, 0 10"
                    fill={selectedEvent.success ? "hsl(142, 76%, 36%)" : "hsl(0, 72%, 50%)"}
                  />
                </marker>
              </defs>
              <motion.line
                x1={`${startPos.x}%`}
                y1={`${startPos.y}%`}
                x2={`${endPos.x}%`}
                y2={`${endPos.y}%`}
                stroke={selectedEvent.success ? "hsl(142, 76%, 36%)" : "hsl(0, 72%, 50%)"}
                strokeWidth="3"
                markerEnd={`url(#arrowhead-${uniqueId})`}
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 0.4 }}
              />
            </svg>
          );
        })()}

        {/* Event details tooltip */}
        <AnimatePresence>
          {selectedEvent && (
            <motion.div
              className="absolute bottom-4 left-4 bg-card/95 backdrop-blur-md border border-border rounded-xl p-4 z-30 shadow-xl min-w-[200px]"
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.9 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex items-center gap-2 mb-3 pb-2 border-b border-border">
                <div className={cn("w-3 h-3 rounded-full", eventColors[selectedEvent.type].bg)} />
                <span className="text-sm font-bold capitalize text-foreground">
                  {selectedEvent.type}
                </span>
                <span className="text-xs text-muted-foreground ml-auto font-mono">
                  {selectedEvent.minute}'
                </span>
              </div>
              <div className="text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">From</span>
                  <span className="font-mono text-foreground">({selectedEvent.x}, {selectedEvent.y})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">To</span>
                  <span className="font-mono text-foreground">({selectedEvent.targetX}, {selectedEvent.targetY})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Distance</span>
                  <span className="font-mono text-foreground">
                    {Math.round(Math.sqrt(Math.pow(selectedEvent.targetX - selectedEvent.x, 2) + Math.pow(selectedEvent.targetY - selectedEvent.y, 2)))}m
                  </span>
                </div>
                <div className="flex justify-between items-center pt-1">
                  <span className="text-muted-foreground">Result</span>
                  <Badge
                    variant={selectedEvent.success ? "default" : "destructive"}
                    className="text-[10px] h-5"
                  >
                    {selectedEvent.success ? "Success" : "Failed"}
                  </Badge>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Event Types Legend - Now outside the map */}
      <motion.div
        className="flex flex-wrap items-center justify-center gap-4 py-3 px-4 bg-card border border-border rounded-lg"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="text-xs font-semibold text-foreground flex items-center gap-2">
          <Layers className="w-3 h-3" />
          Event Types:
        </div>
        {Object.entries(eventColors).map(([type, colors]) => (
          <div
            key={type}
            className={cn(
              "flex items-center gap-2 px-2 py-1 rounded transition-opacity",
              !activeFilters.includes(type) && "opacity-40"
            )}
          >
            <div className={cn("w-2.5 h-2.5 rounded-full", colors.bg)} />
            <span className="text-xs text-muted-foreground capitalize">{type}</span>
            {eventStats[type] && (
              <span className="text-[10px] text-muted-foreground/70 font-mono">
                {eventStats[type].successful}/{eventStats[type].total}
              </span>
            )}
          </div>
        ))}
      </motion.div>

      {/* Stats Bar */}
      <motion.div
        className="grid grid-cols-2 md:grid-cols-5 gap-3"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        {Object.entries(eventStats).map(([type, stats], index) => (
          <motion.div
            key={type}
            className="bg-card border border-border rounded-lg p-3 text-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 + index * 0.05 }}
            whileHover={{ y: -2 }}
          >
            <div className="flex items-center justify-center gap-2 mb-1">
              <div className={cn("w-2 h-2 rounded-full", eventColors[type]?.bg)} />
              <span className="text-xs capitalize text-muted-foreground">{type}s</span>
            </div>
            <div className="text-lg font-bold text-foreground">{stats.total}</div>
            <div className="text-[10px] text-muted-foreground">
              {stats.total > 0 ? Math.round((stats.successful / stats.total) * 100) : 0}% success
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};

export default FootballField;