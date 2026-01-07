import { cn } from "@/lib/utils";

interface StatBarProps {
  value: number;
  maxValue?: number;
  label?: string;
  showValue?: boolean;
  size?: "sm" | "md" | "lg";
  colorClass?: string; // Custom color class to use instead of auto-calculated
}

const StatBar = ({
  value,
  maxValue = 100,
  label,
  showValue = true,
  size = "md",
  colorClass
}: StatBarProps) => {
  const percentage = Math.min((value / maxValue) * 100, 100);

  // Auto-calculate color based on value (aligned with getRatingColor thresholds)
  const getAutoColor = () => {
    if (value >= 90) return "bg-success";
    if (value >= 80) return "bg-primary";
    if (value >= 70) return "bg-warning";
    return "bg-destructive";
  };

  const barColor = colorClass || getAutoColor();

  const sizeClasses = {
    sm: "h-1.5",
    md: "h-2",
    lg: "h-3",
  };

  return (
    <div className="w-full">
      {(label || showValue) && (
        <div className="flex justify-between items-center mb-1">
          {label && (
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              {label}
            </span>
          )}
          {showValue && (
            <span className="text-xs font-bold text-foreground">
              {value}
            </span>
          )}
        </div>
      )}
      <div className={cn("w-full bg-secondary rounded-full overflow-hidden", sizeClasses[size])}>
        <div
          className={cn(
            "h-full rounded-full transition-all duration-500 ease-out",
            barColor
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

export default StatBar;
