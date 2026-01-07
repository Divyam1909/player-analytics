import { useState, useMemo } from "react";
import { MatchEvent } from "@/types/player";
import { cn } from "@/lib/utils";
import { Play, Filter, BarChart3, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface FootballFieldProps {
  events: MatchEvent[];
  showHeatmap?: boolean;
}

type ViewMode = "dots" | "heatmap" | "zones";

const FootballField = ({ events, showHeatmap = false }: FootballFieldProps) => {
  const [selectedEvent, setSelectedEvent] = useState<MatchEvent | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>(showHeatmap ? "heatmap" : "dots");
  const [activeFilters, setActiveFilters] = useState<string[]>(["pass", "shot", "dribble", "interception", "tackle"]);
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationIndex, setAnimationIndex] = useState(-1);

  const eventColors: Record<string, { bg: string; glow: string; text: string }> = {
    pass: { bg: "bg-primary", glow: "shadow-primary/50", text: "text-primary" },
    shot: { bg: "bg-destructive", glow: "shadow-destructive/50", text: "text-destructive" },
    dribble: { bg: "bg-warning", glow: "shadow-warning/50", text: "text-warning" },
    interception: { bg: "bg-success", glow: "shadow-success/50", text: "text-success" },
    tackle: { bg: "bg-chart-4", glow: "shadow-chart-4/50", text: "text-chart-4" },
  };

  const filteredEvents = useMemo(() => {
    return events.filter(event => activeFilters.includes(event.type));
  }, [events, activeFilters]);

  // Enhanced heatmap with canvas-like gradient
  const heatmapData = useMemo(() => {
    if (filteredEvents.length === 0) return null;

    const gridSize = 10;
    const zones: number[][] = Array(gridSize).fill(null).map(() => Array(gridSize).fill(0));
    
    filteredEvents.forEach(event => {
      const zoneX = Math.min(Math.floor(event.x / (100 / gridSize)), gridSize - 1);
      const zoneY = Math.min(Math.floor(event.y / (100 / gridSize)), gridSize - 1);
      zones[zoneY][zoneX]++;
    });

    const maxIntensity = Math.max(...zones.flat());
    return { zones, maxIntensity };
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
    }, 300);
  };

  const toggleFilter = (type: string) => {
    setActiveFilters(prev => 
      prev.includes(type) 
        ? prev.filter(f => f !== type)
        : [...prev, type]
    );
  };

  const getHeatmapColor = (intensity: number, maxIntensity: number) => {
    const normalized = maxIntensity > 0 ? intensity / maxIntensity : 0;
    if (normalized === 0) return "transparent";
    
    // Gradient from blue to cyan to green to yellow to red
    if (normalized < 0.25) return `hsla(200, 100%, 50%, ${normalized * 2})`;
    if (normalized < 0.5) return `hsla(160, 100%, 50%, ${normalized * 1.5})`;
    if (normalized < 0.75) return `hsla(60, 100%, 50%, ${normalized * 1.2})`;
    return `hsla(0, 100%, 50%, ${Math.min(normalized, 0.9)})`;
  };

  return (
    <div className="space-y-4">
      {/* Controls Bar */}
      <div className="flex flex-wrap items-center gap-3">
        {/* View Mode Toggle */}
        <div className="flex items-center gap-1 bg-secondary rounded-lg p-1">
          <Button
            variant={viewMode === "dots" ? "default" : "ghost"}
            size="sm"
            onClick={() => setViewMode("dots")}
            className="h-7 px-3 text-xs"
          >
            Touches
          </Button>
          <Button
            variant={viewMode === "heatmap" ? "default" : "ghost"}
            size="sm"
            onClick={() => setViewMode("heatmap")}
            className="h-7 px-3 text-xs"
          >
            Heatmap
          </Button>
          <Button
            variant={viewMode === "zones" ? "default" : "ghost"}
            size="sm"
            onClick={() => setViewMode("zones")}
            className="h-7 px-3 text-xs"
          >
            Zones
          </Button>
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
      <div className="relative w-full aspect-[16/10] bg-gradient-to-b from-[#1a4a1a] via-[#1a3a1a] to-[#1a4a1a] rounded-xl overflow-hidden border border-border shadow-xl">
        {/* Grass Pattern Overlay */}
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `repeating-linear-gradient(
              90deg,
              transparent,
              transparent 5%,
              rgba(255,255,255,0.03) 5%,
              rgba(255,255,255,0.03) 10%
            )`
          }}
        />

        {/* Field markings */}
        <svg
          viewBox="0 0 100 62.5"
          className="absolute inset-0 w-full h-full"
          preserveAspectRatio="none"
        >
          {/* Field outline */}
          <rect
            x="1"
            y="1"
            width="98"
            height="60.5"
            fill="none"
            stroke="rgba(255,255,255,0.4)"
            strokeWidth="0.3"
          />
          
          {/* Center line */}
          <line
            x1="50"
            y1="1"
            x2="50"
            y2="61.5"
            stroke="rgba(255,255,255,0.4)"
            strokeWidth="0.3"
          />
          
          {/* Center circle */}
          <circle
            cx="50"
            cy="31.25"
            r="9.15"
            fill="none"
            stroke="rgba(255,255,255,0.4)"
            strokeWidth="0.3"
          />
          
          {/* Center spot */}
          <circle cx="50" cy="31.25" r="0.8" fill="rgba(255,255,255,0.5)" />
          
          {/* Left penalty area */}
          <rect
            x="1"
            y="14"
            width="16.5"
            height="34.5"
            fill="none"
            stroke="rgba(255,255,255,0.4)"
            strokeWidth="0.3"
          />
          
          {/* Left goal area */}
          <rect
            x="1"
            y="22.5"
            width="5.5"
            height="17.5"
            fill="none"
            stroke="rgba(255,255,255,0.4)"
            strokeWidth="0.3"
          />
          
          {/* Left penalty arc */}
          <path
            d="M 17.5 24 A 9.15 9.15 0 0 1 17.5 38.5"
            fill="none"
            stroke="rgba(255,255,255,0.4)"
            strokeWidth="0.3"
          />
          
          {/* Right penalty area */}
          <rect
            x="82.5"
            y="14"
            width="16.5"
            height="34.5"
            fill="none"
            stroke="rgba(255,255,255,0.4)"
            strokeWidth="0.3"
          />
          
          {/* Right goal area */}
          <rect
            x="93.5"
            y="22.5"
            width="5.5"
            height="17.5"
            fill="none"
            stroke="rgba(255,255,255,0.4)"
            strokeWidth="0.3"
          />
          
          {/* Right penalty arc */}
          <path
            d="M 82.5 24 A 9.15 9.15 0 0 0 82.5 38.5"
            fill="none"
            stroke="rgba(255,255,255,0.4)"
            strokeWidth="0.3"
          />
          
          {/* Left penalty spot */}
          <circle cx="12" cy="31.25" r="0.5" fill="rgba(255,255,255,0.5)" />
          
          {/* Right penalty spot */}
          <circle cx="88" cy="31.25" r="0.5" fill="rgba(255,255,255,0.5)" />
          
          {/* Corner arcs */}
          <path d="M 1 3 A 2 2 0 0 0 3 1" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="0.3" />
          <path d="M 97 1 A 2 2 0 0 0 99 3" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="0.3" />
          <path d="M 1 59.5 A 2 2 0 0 1 3 61.5" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="0.3" />
          <path d="M 97 61.5 A 2 2 0 0 1 99 59.5" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="0.3" />
          
          {/* Goals */}
          <rect x="-1" y="26" width="2" height="10.5" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="0.4" />
          <rect x="99" y="26" width="2" height="10.5" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="0.4" />
        </svg>

        {/* Zone View - Third Divisions */}
        {viewMode === "zones" && (
          <div className="absolute inset-0 flex">
            <div className="flex-1 border-r border-dashed border-foreground/20 flex items-center justify-center">
              <div className="text-center">
                <div className="text-2xl font-bold text-foreground/80">{zoneStats.defensive}%</div>
                <div className="text-xs text-muted-foreground uppercase tracking-wide">Defensive</div>
              </div>
            </div>
            <div className="flex-1 border-r border-dashed border-foreground/20 flex items-center justify-center">
              <div className="text-center">
                <div className="text-2xl font-bold text-foreground/80">{zoneStats.middle}%</div>
                <div className="text-xs text-muted-foreground uppercase tracking-wide">Middle</div>
              </div>
            </div>
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="text-2xl font-bold text-foreground/80">{zoneStats.attacking}%</div>
                <div className="text-xs text-muted-foreground uppercase tracking-wide">Attacking</div>
              </div>
            </div>
          </div>
        )}

        {/* Heatmap Grid */}
        {viewMode === "heatmap" && heatmapData && (
          <div className="absolute inset-0 grid grid-cols-10 grid-rows-10">
            {heatmapData.zones.map((row, rowIndex) =>
              row.map((intensity, colIndex) => (
                <div
                  key={`${rowIndex}-${colIndex}`}
                  className="transition-all duration-500"
                  style={{
                    backgroundColor: getHeatmapColor(intensity, heatmapData.maxIntensity),
                    filter: intensity > 0 ? "blur(8px)" : "none",
                  }}
                />
              ))
            )}
          </div>
        )}

        {/* Event points */}
        {(viewMode === "dots" || viewMode === "zones") && filteredEvents.map((event, index) => {
          const isAnimated = animationIndex >= 0 && index <= animationIndex;
          const isCurrentAnimation = index === animationIndex;
          
          return (
            <div
              key={index}
              className={cn(
                "absolute cursor-pointer transition-all duration-300 z-10",
                eventColors[event.type].bg,
                "rounded-full",
                selectedEvent === event && "ring-2 ring-foreground scale-150",
                isCurrentAnimation && "scale-150 ring-2 ring-foreground animate-pulse",
                !isAnimated && animationIndex >= 0 && "opacity-30",
              )}
              style={{
                left: `${event.x}%`,
                top: `${event.y}%`,
                transform: "translate(-50%, -50%)",
                width: selectedEvent === event ? "16px" : "12px",
                height: selectedEvent === event ? "16px" : "12px",
                boxShadow: selectedEvent === event ? `0 0 20px 4px ${event.type === "pass" ? "hsl(var(--primary))" : event.type === "shot" ? "hsl(var(--destructive))" : event.type === "dribble" ? "hsl(var(--warning))" : "hsl(var(--success))"}` : "none"
              }}
              onClick={() => setSelectedEvent(event === selectedEvent ? null : event)}
            >
              {/* Time badge */}
              <div 
                className={cn(
                  "absolute -top-5 left-1/2 -translate-x-1/2 text-[9px] font-mono px-1 py-0.5 rounded bg-background/90 text-foreground whitespace-nowrap transition-opacity",
                  selectedEvent === event ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                )}
                style={{ opacity: selectedEvent === event ? 1 : undefined }}
              >
                {event.minute}'
              </div>
            </div>
          );
        })}

        {/* Connection lines for all passes when in animation mode */}
        {isAnimating && (
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-5">
            {filteredEvents.slice(0, animationIndex + 1).map((event, index) => (
              <line
                key={index}
                x1={`${event.x}%`}
                y1={`${event.y}%`}
                x2={`${event.targetX}%`}
                y2={`${event.targetY}%`}
                stroke={event.success ? "hsl(var(--success))" : "hsl(var(--destructive))"}
                strokeWidth="1"
                strokeOpacity="0.4"
                strokeDasharray="4,2"
              />
            ))}
          </svg>
        )}

        {/* Direction line for selected event */}
        {selectedEvent && !isAnimating && (
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-20">
            <defs>
              <marker
                id="arrowhead"
                markerWidth="8"
                markerHeight="8"
                refX="6"
                refY="4"
                orient="auto"
              >
                <polygon 
                  points="0 0, 8 4, 0 8" 
                  fill={selectedEvent.success ? "hsl(var(--success))" : "hsl(var(--destructive))"} 
                />
              </marker>
              <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.8" />
                <stop offset="100%" stopColor={selectedEvent.success ? "hsl(var(--success))" : "hsl(var(--destructive))"} stopOpacity="0.8" />
              </linearGradient>
            </defs>
            <line
              x1={`${selectedEvent.x}%`}
              y1={`${selectedEvent.y}%`}
              x2={`${selectedEvent.targetX}%`}
              y2={`${selectedEvent.targetY}%`}
              stroke="url(#lineGradient)"
              strokeWidth="3"
              markerEnd="url(#arrowhead)"
              className="animate-pulse"
            />
          </svg>
        )}

        {/* Event details tooltip */}
        {selectedEvent && (
          <div className="absolute bottom-4 left-4 bg-card/95 backdrop-blur-md border border-border rounded-xl p-4 z-30 shadow-xl min-w-[180px]">
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
                <span className="text-muted-foreground">From Position</span>
                <span className="font-mono text-foreground">({selectedEvent.x}, {selectedEvent.y})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">To Position</span>
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
                  {selectedEvent.success ? "✓ Success" : "✗ Failed"}
                </Badge>
              </div>
            </div>
          </div>
        )}

        {/* Legend */}
        <div className="absolute top-4 right-4 bg-card/95 backdrop-blur-md border border-border rounded-xl p-3 z-30 shadow-lg">
          <div className="text-xs font-semibold text-foreground mb-2 flex items-center gap-2">
            <Layers className="w-3 h-3" />
            Event Types
          </div>
          <div className="space-y-1.5">
            {Object.entries(eventColors).map(([type, colors]) => (
              <div 
                key={type} 
                className={cn(
                  "flex items-center gap-2 px-1 py-0.5 rounded transition-opacity",
                  !activeFilters.includes(type) && "opacity-40"
                )}
              >
                <div className={cn("w-2.5 h-2.5 rounded-full", colors.bg)} />
                <span className="text-xs text-muted-foreground capitalize">{type}</span>
                {eventStats[type] && (
                  <span className="text-[10px] text-muted-foreground/70 ml-auto font-mono">
                    {eventStats[type].successful}/{eventStats[type].total}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {Object.entries(eventStats).map(([type, stats]) => (
          <div 
            key={type}
            className="bg-card border border-border rounded-lg p-3 text-center"
          >
            <div className="flex items-center justify-center gap-2 mb-1">
              <div className={cn("w-2 h-2 rounded-full", eventColors[type]?.bg)} />
              <span className="text-xs capitalize text-muted-foreground">{type}s</span>
            </div>
            <div className="text-lg font-bold text-foreground">{stats.total}</div>
            <div className="text-[10px] text-muted-foreground">
              {Math.round((stats.successful / stats.total) * 100)}% success
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FootballField;