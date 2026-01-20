import { Radar, RadarChart as RechartsRadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from "recharts";
import { PlayerAttributes } from "@/types/player";

interface RadarChartProps {
  attributes: PlayerAttributes;
  size?: "sm" | "md" | "lg";
}

const RadarChart = ({ attributes, size = "md" }: RadarChartProps) => {
  // Check if any attribute data is available
  const hasData = attributes.passing !== null ||
    attributes.shooting !== null ||
    attributes.dribbling !== null ||
    attributes.defending !== null ||
    attributes.physical !== null;

  const data = [
    { attribute: "Passing", value: attributes.passing ?? 0, fullMark: 100 },
    { attribute: "Shooting", value: attributes.shooting ?? 0, fullMark: 100 },
    { attribute: "Dribbling", value: attributes.dribbling ?? 0, fullMark: 100 },
    { attribute: "Defending", value: attributes.defending ?? 0, fullMark: 100 },
    { attribute: "Physical", value: attributes.physical ?? 0, fullMark: 100 },
  ];

  const sizeMap = {
    sm: { width: 200, height: 200 },
    md: { width: 300, height: 300 },
    lg: { width: 400, height: 400 },
  };

  // Show message if no data available
  if (!hasData) {
    return (
      <div
        style={{ width: sizeMap[size].width, height: sizeMap[size].height }}
        className="flex items-center justify-center text-muted-foreground text-sm"
      >
        <div className="text-center">
          <p>Attribute data not available</p>
          <p className="text-xs mt-1">Add player_attributes table to database</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ width: sizeMap[size].width, height: sizeMap[size].height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsRadarChart data={data} cx="50%" cy="50%" outerRadius="55%">
          <PolarGrid
            stroke="hsl(var(--border))"
            strokeOpacity={0.5}
          />
          <PolarAngleAxis
            dataKey="attribute"
            tick={{
              fill: "hsl(var(--muted-foreground))",
              fontSize: size === "sm" ? 10 : 12,
              fontWeight: 500
            }}
          />
          <PolarRadiusAxis
            angle={90}
            domain={[0, 100]}
            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
            tickCount={5}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "8px",
              color: "hsl(var(--foreground))",
            }}
            formatter={(value: number) => [`${value}`, "Rating"]}
          />
          <Radar
            name="Player"
            dataKey="value"
            stroke="hsl(var(--primary))"
            fill="hsl(var(--primary))"
            fillOpacity={0.3}
            strokeWidth={2}
          />
        </RechartsRadarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default RadarChart;
