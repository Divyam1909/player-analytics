import * as React from "react";
import { StatHint } from "@/components/ui/stat-hint";
import { getStatDefinition } from "@/data/statsDefinitions";
import { cn } from "@/lib/utils";

interface StatLabelProps {
  statId: string;
  label?: string;
  className?: string;
  labelClassName?: string;
  showIcon?: boolean;
  iconSize?: "sm" | "md";
  side?: "top" | "right" | "bottom" | "left";
  align?: "start" | "center" | "end";
}

/**
 * StatLabel - A convenience component that combines a stat label with a hint icon.
 * 
 * Usage:
 * <StatLabel statId="shots_on_target" />
 * <StatLabel statId="shots_on_target" label="On Target" />
 */
export function StatLabel({
  statId,
  label,
  className,
  labelClassName,
  showIcon = true,
  iconSize = "sm",
  side = "top",
  align = "center",
}: StatLabelProps) {
  const stat = getStatDefinition(statId);
  const displayLabel = label || stat?.name || statId;

  return (
    <StatHint
      statId={statId}
      showIcon={showIcon}
      iconSize={iconSize}
      className={className}
      side={side}
      align={align}
    >
      <span className={cn("text-xs font-medium text-muted-foreground uppercase tracking-wide", labelClassName)}>
        {displayLabel}
      </span>
    </StatHint>
  );
}

/**
 * StatLabelCompact - A more compact version for tight spaces like table headers
 */
interface StatLabelCompactProps {
  statId: string;
  label?: string;
  className?: string;
  side?: "top" | "right" | "bottom" | "left";
  align?: "start" | "center" | "end";
}

export function StatLabelCompact({
  statId,
  label,
  className,
  side = "top",
  align = "center",
}: StatLabelCompactProps) {
  const stat = getStatDefinition(statId);
  const displayLabel = label || stat?.shortName || statId;

  return (
    <StatHint
      statId={statId}
      showIcon={true}
      iconSize="sm"
      className={cn("whitespace-nowrap", className)}
      side={side}
      align={align}
    >
      <span className="text-xs font-medium">{displayLabel}</span>
    </StatHint>
  );
}

/**
 * StatValue - Display a stat value with an optional hint
 */
interface StatValueProps {
  statId: string;
  value: string | number;
  label?: string;
  className?: string;
  valueClassName?: string;
  labelClassName?: string;
  showIcon?: boolean;
  layout?: "vertical" | "horizontal";
  side?: "top" | "right" | "bottom" | "left";
}

export function StatValue({
  statId,
  value,
  label,
  className,
  valueClassName,
  labelClassName,
  showIcon = true,
  layout = "vertical",
  side = "top",
}: StatValueProps) {
  const stat = getStatDefinition(statId);
  const displayLabel = label || stat?.shortName || statId;

  if (layout === "horizontal") {
    return (
      <div className={cn("flex items-center justify-between gap-2", className)}>
        <StatHint statId={statId} showIcon={showIcon} iconSize="sm" side={side}>
          <span className={cn("text-sm text-muted-foreground", labelClassName)}>
            {displayLabel}
          </span>
        </StatHint>
        <span className={cn("text-sm font-semibold text-foreground", valueClassName)}>
          {value}
        </span>
      </div>
    );
  }

  return (
    <div className={cn("text-center", className)}>
      <div className={cn("text-lg font-bold text-primary", valueClassName)}>
        {value}
      </div>
      <StatHint statId={statId} showIcon={showIcon} iconSize="sm" side={side}>
        <span className={cn("text-[9px] uppercase tracking-wide text-muted-foreground", labelClassName)}>
          {displayLabel}
        </span>
      </StatHint>
    </div>
  );
}

export default StatLabel;
