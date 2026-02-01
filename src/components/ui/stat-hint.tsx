import * as React from "react";
import { Link } from "react-router-dom";
import { HelpCircle, ExternalLink } from "lucide-react";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { getStatDefinition, StatDefinition } from "@/data/statsDefinitions";
import { cn } from "@/lib/utils";

interface StatHintProps {
  statId: string;
  children?: React.ReactNode;
  showIcon?: boolean;
  iconSize?: "sm" | "md";
  className?: string;
  iconClassName?: string;
  side?: "top" | "right" | "bottom" | "left";
  align?: "start" | "center" | "end";
}

export function StatHint({
  statId,
  children,
  showIcon = true,
  iconSize = "sm",
  className,
  iconClassName,
  side = "top",
  align = "center",
}: StatHintProps) {
  const stat = getStatDefinition(statId);

  if (!stat) {
    // If stat not found, just render children without hint
    return <>{children}</>;
  }

  const iconSizeClass = iconSize === "sm" ? "w-2.5 h-2.5" : "w-3.5 h-3.5";

  return (
    <HoverCard openDelay={200} closeDelay={100}>
      <HoverCardTrigger asChild>
        <span className={cn("inline-flex items-center gap-0.5 cursor-help", className)}>
          {children}
          {showIcon && (
            <HelpCircle
              className={cn(
                iconSizeClass,
                "text-muted-foreground/40 hover:text-muted-foreground transition-colors flex-shrink-0 ml-0.5",
                iconClassName
              )}
            />
          )}
        </span>
      </HoverCardTrigger>
      <HoverCardContent
        side={side}
        align={align}
        className="w-80 p-0 overflow-hidden"
      >
        <StatHintContent stat={stat} />
      </HoverCardContent>
    </HoverCard>
  );
}

interface StatHintContentProps {
  stat: StatDefinition;
}

function StatHintContent({ stat }: StatHintContentProps) {
  return (
    <div className="space-y-0">
      {/* Header */}
      <div className="bg-primary/10 px-4 py-2.5 border-b border-border">
        <div className="flex items-center justify-between">
          <h4 className="font-semibold text-sm text-foreground">{stat.name}</h4>
          <span className="text-xs font-mono bg-secondary px-1.5 py-0.5 rounded text-muted-foreground">
            {stat.shortName}
          </span>
        </div>
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
          {stat.category}
        </span>
      </div>

      {/* Content */}
      <div className="px-4 py-3 space-y-3">
        {/* Description */}
        <p className="text-xs text-muted-foreground leading-relaxed">
          {stat.description}
        </p>

        {/* Calculation */}
        <div className="space-y-1">
          <h5 className="text-[10px] uppercase tracking-wider font-medium text-foreground/70">
            How it's calculated
          </h5>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {stat.calculation}
          </p>
        </div>

        {/* Good Range (if available) */}
        {stat.goodRange && (
          <div className="flex items-center gap-2 text-xs">
            <span className="text-muted-foreground">Target:</span>
            <span className="text-primary font-medium">{stat.goodRange}</span>
          </div>
        )}

        {/* Learn More Link */}
        <Link
          to={`/stats-glossary#${stat.id}`}
          className="inline-flex items-center gap-1 text-xs text-primary hover:text-primary/80 hover:underline transition-colors pt-1"
        >
          Learn more
          <ExternalLink className="w-3 h-3" />
        </Link>
      </div>
    </div>
  );
}

// Standalone icon-only hint (for compact spaces like table headers)
interface StatHintIconProps {
  statId: string;
  size?: "sm" | "md";
  className?: string;
  side?: "top" | "right" | "bottom" | "left";
  align?: "start" | "center" | "end";
}

export function StatHintIcon({
  statId,
  size = "sm",
  className,
  side = "top",
  align = "center",
}: StatHintIconProps) {
  const stat = getStatDefinition(statId);

  if (!stat) {
    return null;
  }

  const iconSizeClass = size === "sm" ? "w-3 h-3" : "w-4 h-4";

  return (
    <HoverCard openDelay={200} closeDelay={100}>
      <HoverCardTrigger asChild>
        <button
          type="button"
          className={cn(
            "inline-flex items-center justify-center cursor-help focus:outline-none",
            className
          )}
        >
          <HelpCircle
            className={cn(
              iconSizeClass,
              "text-muted-foreground/50 hover:text-muted-foreground transition-colors"
            )}
          />
        </button>
      </HoverCardTrigger>
      <HoverCardContent
        side={side}
        align={align}
        className="w-80 p-0 overflow-hidden"
      >
        <StatHintContent stat={stat} />
      </HoverCardContent>
    </HoverCard>
  );
}

export default StatHint;
