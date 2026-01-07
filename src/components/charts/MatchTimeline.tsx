import { useMemo } from "react";
import { motion } from "framer-motion";
import { MatchEvent } from "@/types/player";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface MatchTimelineProps {
    events: MatchEvent[];
    className?: string;
}

// Event type configuration
const EVENT_CONFIG: Record<
    MatchEvent["type"],
    { icon: string; label: string; color: string; bgColor: string }
> = {
    pass: {
        icon: "🎯",
        label: "Pass",
        color: "text-primary",
        bgColor: "bg-primary/20",
    },
    shot: {
        icon: "⚽",
        label: "Shot",
        color: "text-destructive",
        bgColor: "bg-destructive/20",
    },
    dribble: {
        icon: "💨",
        label: "Dribble",
        color: "text-warning",
        bgColor: "bg-warning/20",
    },
    interception: {
        icon: "🛡️",
        label: "Interception",
        color: "text-success",
        bgColor: "bg-success/20",
    },
    tackle: {
        icon: "🦶",
        label: "Tackle",
        color: "text-chart-4",
        bgColor: "bg-chart-4/20",
    },
};

const MatchTimeline = ({ events, className }: MatchTimelineProps) => {
    // Group events by minute for stacking
    const eventsByMinute = useMemo(() => {
        const grouped = new Map<number, MatchEvent[]>();
        events.forEach((event) => {
            const minute = event.minute;
            const existing = grouped.get(minute) || [];
            grouped.set(minute, [...existing, event]);
        });
        return grouped;
    }, [events]);

    // Get unique minutes sorted
    const uniqueMinutes = useMemo(
        () => Array.from(eventsByMinute.keys()).sort((a, b) => a - b),
        [eventsByMinute]
    );

    // Filter to show only significant events (shots, successful dribbles, interceptions, tackles)
    const significantEvents = useMemo(() => {
        return events.filter(
            (e) =>
                e.type === "shot" ||
                e.type === "interception" ||
                e.type === "tackle" ||
                (e.type === "dribble" && e.success)
        );
    }, [events]);

    // Group significant events by minute
    const significantByMinute = useMemo(() => {
        const grouped = new Map<number, MatchEvent[]>();
        significantEvents.forEach((event) => {
            const minute = event.minute;
            const existing = grouped.get(minute) || [];
            grouped.set(minute, [...existing, event]);
        });
        return grouped;
    }, [significantEvents]);

    const significantMinutes = useMemo(
        () => Array.from(significantByMinute.keys()).sort((a, b) => a - b),
        [significantByMinute]
    );

    // Timeline markers at specific intervals
    const timeMarkers = [0, 15, 30, 45, 60, 75, 90];

    return (
        <div className={cn("space-y-4", className)}>
            {/* Timeline Header */}
            <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium text-muted-foreground">
                    Match Timeline
                </h4>
                <div className="text-xs text-muted-foreground">
                    {significantEvents.length} key events
                </div>
            </div>

            {/* Timeline Bar */}
            <div className="relative">
                {/* Background track */}
                <div className="h-12 bg-secondary rounded-lg relative overflow-hidden">
                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent" />

                    {/* Half-time marker */}
                    <div className="absolute left-1/2 top-0 bottom-0 w-px bg-border" />

                    {/* Time markers */}
                    <div className="absolute inset-x-0 bottom-0 flex justify-between px-2 pb-1">
                        {timeMarkers.map((minute) => (
                            <span
                                key={minute}
                                className="text-[10px] text-muted-foreground/60"
                            >
                                {minute}'
                            </span>
                        ))}
                    </div>

                    {/* Event dots */}
                    <div className="absolute inset-x-0 top-1/2 -translate-y-1/2">
                        {significantMinutes.map((minute) => {
                            const minuteEvents = significantByMinute.get(minute) || [];
                            const leftPercent = (minute / 90) * 100;

                            return (
                                <div
                                    key={minute}
                                    className="absolute flex flex-col items-center gap-0.5"
                                    style={{
                                        left: `${leftPercent}%`,
                                        transform: "translateX(-50%)",
                                    }}
                                >
                                    {minuteEvents.map((event, idx) => {
                                        const config = EVENT_CONFIG[event.type];
                                        return (
                                            <Tooltip key={`${minute}-${idx}`}>
                                                <TooltipTrigger asChild>
                                                    <motion.div
                                                        className={cn(
                                                            "w-6 h-6 rounded-full flex items-center justify-center text-xs cursor-pointer",
                                                            "border-2 border-background shadow-sm",
                                                            config.bgColor,
                                                            event.success
                                                                ? "ring-1 ring-success/50"
                                                                : "opacity-70"
                                                        )}
                                                        initial={{ scale: 0, opacity: 0 }}
                                                        animate={{ scale: 1, opacity: 1 }}
                                                        transition={{
                                                            delay: 0.1 + idx * 0.05,
                                                            type: "spring",
                                                            stiffness: 500,
                                                            damping: 25,
                                                        }}
                                                        whileHover={{ scale: 1.2, zIndex: 10 }}
                                                    >
                                                        {config.icon}
                                                    </motion.div>
                                                </TooltipTrigger>
                                                <TooltipContent
                                                    side="top"
                                                    className="bg-popover border-border"
                                                >
                                                    <div className="text-sm">
                                                        <p className="font-medium">
                                                            {config.label} @ {minute}'
                                                        </p>
                                                        <p
                                                            className={cn(
                                                                "text-xs",
                                                                event.success
                                                                    ? "text-success"
                                                                    : "text-destructive"
                                                            )}
                                                        >
                                                            {event.success ? "Successful" : "Unsuccessful"}
                                                        </p>
                                                    </div>
                                                </TooltipContent>
                                            </Tooltip>
                                        );
                                    })}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Period labels */}
                <div className="flex justify-between mt-1 px-2">
                    <span className="text-xs text-muted-foreground">First Half</span>
                    <span className="text-xs text-muted-foreground">Second Half</span>
                </div>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-3 justify-center pt-2">
                {Object.entries(EVENT_CONFIG)
                    .filter(([key]) => key !== "pass")
                    .map(([type, config]) => (
                        <div key={type} className="flex items-center gap-1.5">
                            <span className="text-sm">{config.icon}</span>
                            <span className="text-xs text-muted-foreground">
                                {config.label}
                            </span>
                        </div>
                    ))}
            </div>
        </div>
    );
};

export default MatchTimeline;
