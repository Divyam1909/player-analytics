import { Radar, RadarChart as RechartsRadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from "recharts";
import { PlayerAttributes } from "@/types/player";

interface RadarChartProps {
  attributes: PlayerAttributes;
  size?: "sm" | "md" | "lg";
}

const RadarChart = ({ attributes, size = "md" }: RadarChartProps) => {
  const data = [
    { attribute: "Passing", value: attributes.passing, fullMark: 100 },
    { attribute: "Shooting", value: attributes.shooting, fullMark: 100 },
    { attribute: "Dribbling", value: attributes.dribbling, fullMark: 100 },
    { attribute: "Defending", value: attributes.defending, fullMark: 100 },
    { attribute: "Physical", value: attributes.physical, fullMark: 100 },
  ];

  const sizeMap = {
    sm: { width: 200, height: 200 },
    md: { width: 300, height: 300 },
    lg: { width: 400, height: 400 },
  };

  return (
    <div style={{ width: sizeMap[size].width, height: sizeMap[size].height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsRadarChart data={data} cx="50%" cy="50%" outerRadius="70%">
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
