import { cn } from "@/lib/utils";

interface StatBarProps {
  value: number;
  maxValue?: number;
  label?: string;
  showValue?: boolean;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "success" | "warning" | "danger";
}

const StatBar = ({ 
  value, 
  maxValue = 100, 
  label, 
  showValue = true,
  size = "md",
  variant = "default"
}: StatBarProps) => {
  const percentage = Math.min((value / maxValue) * 100, 100);
  
  const getVariantColor = () => {
    if (variant !== "default") {
      switch (variant) {
        case "success": return "bg-success";
        case "warning": return "bg-warning";
        case "danger": return "bg-destructive";
      }
    }
    
    if (percentage >= 80) return "bg-success";
    if (percentage >= 60) return "bg-primary";
    if (percentage >= 40) return "bg-warning";
    return "bg-destructive";
  };

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
            getVariantColor()
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

export default StatBar;
