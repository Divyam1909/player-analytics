import * as React from "react";

interface DiagramProps {
  className?: string;
  width?: number;
  height?: number;
}

// Shot on Target Diagram - Shows a goal with the target area highlighted
export function ShotOnTargetDiagram({ className, width = 200, height = 120 }: DiagramProps) {
  return (
    <svg
      viewBox="0 0 200 120"
      width={width}
      height={height}
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Goal frame */}
      <rect x="30" y="20" width="140" height="80" fill="none" stroke="currentColor" strokeWidth="3" className="text-muted-foreground" />
      
      {/* Goal net pattern */}
      <g className="text-muted-foreground/30" strokeWidth="0.5" stroke="currentColor">
        {[0, 1, 2, 3, 4, 5, 6, 7].map(i => (
          <line key={`v${i}`} x1={30 + i * 20} y1="20" x2={30 + i * 20} y2="100" />
        ))}
        {[0, 1, 2, 3, 4].map(i => (
          <line key={`h${i}`} x1="30" y1={20 + i * 20} x2="170" y2={20 + i * 20} />
        ))}
      </g>
      
      {/* Target zone highlight */}
      <rect x="30" y="20" width="140" height="80" fill="currentColor" fillOpacity="0.15" className="text-success" />
      
      {/* Ball trajectory */}
      <circle cx="100" cy="110" r="6" fill="currentColor" className="text-foreground" />
      <line x1="100" y1="110" x2="100" y2="60" stroke="currentColor" strokeWidth="2" strokeDasharray="4 2" className="text-primary" />
      <circle cx="100" cy="60" r="6" fill="currentColor" className="text-primary" />
      
      {/* Arrow */}
      <polygon points="100,50 95,60 105,60" fill="currentColor" className="text-primary" />
    </svg>
  );
}

// Shot Off Target Diagram - Shows a shot going wide
export function ShotOffTargetDiagram({ className, width = 200, height = 120 }: DiagramProps) {
  return (
    <svg
      viewBox="0 0 200 120"
      width={width}
      height={height}
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Goal frame */}
      <rect x="30" y="20" width="140" height="80" fill="none" stroke="currentColor" strokeWidth="3" className="text-muted-foreground" />
      
      {/* Goal net pattern */}
      <g className="text-muted-foreground/30" strokeWidth="0.5" stroke="currentColor">
        {[0, 1, 2, 3, 4, 5, 6, 7].map(i => (
          <line key={`v${i}`} x1={30 + i * 20} y1="20" x2={30 + i * 20} y2="100" />
        ))}
        {[0, 1, 2, 3, 4].map(i => (
          <line key={`h${i}`} x1="30" y1={20 + i * 20} x2="170" y2={20 + i * 20} />
        ))}
      </g>
      
      {/* Miss zone */}
      <rect x="175" y="20" width="20" height="80" fill="currentColor" fillOpacity="0.15" className="text-destructive" />
      
      {/* Ball trajectory going wide */}
      <circle cx="100" cy="110" r="6" fill="currentColor" className="text-foreground" />
      <line x1="100" y1="110" x2="185" y2="50" stroke="currentColor" strokeWidth="2" strokeDasharray="4 2" className="text-destructive" />
      <circle cx="185" cy="50" r="6" fill="currentColor" className="text-destructive" />
      
      {/* X mark */}
      <g className="text-destructive" strokeWidth="2" stroke="currentColor">
        <line x1="180" y1="45" x2="190" y2="55" />
        <line x1="190" y1="45" x2="180" y2="55" />
      </g>
    </svg>
  );
}

// Progressive Pass Diagram - Shows a pass moving toward goal
export function ProgressivePassDiagram({ className, width = 200, height = 120 }: DiagramProps) {
  return (
    <svg
      viewBox="0 0 200 120"
      width={width}
      height={height}
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Field outline */}
      <rect x="10" y="10" width="180" height="100" fill="none" stroke="currentColor" strokeWidth="1" className="text-muted-foreground/50" />
      
      {/* Field thirds */}
      <line x1="70" y1="10" x2="70" y2="110" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" className="text-muted-foreground/30" />
      <line x1="130" y1="10" x2="130" y2="110" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" className="text-muted-foreground/30" />
      
      {/* Goal */}
      <rect x="175" y="40" width="15" height="40" fill="none" stroke="currentColor" strokeWidth="2" className="text-muted-foreground" />
      
      {/* Progress zone highlight */}
      <rect x="130" y="10" width="60" height="100" fill="currentColor" fillOpacity="0.1" className="text-success" />
      
      {/* Player 1 (passer) */}
      <circle cx="50" cy="60" r="8" fill="currentColor" className="text-primary" />
      
      {/* Player 2 (receiver) */}
      <circle cx="150" cy="60" r="8" fill="currentColor" className="text-success" />
      
      {/* Pass arrow */}
      <line x1="58" y1="60" x2="140" y2="60" stroke="currentColor" strokeWidth="2" className="text-primary" />
      <polygon points="142,60 135,55 135,65" fill="currentColor" className="text-primary" />
      
      {/* Distance indicator */}
      <text x="100" y="50" textAnchor="middle" fontSize="10" fill="currentColor" className="text-muted-foreground">+10m</text>
    </svg>
  );
}

// Key Pass Diagram - Shows a pass leading to a shot
export function KeyPassDiagram({ className, width = 200, height = 120 }: DiagramProps) {
  return (
    <svg
      viewBox="0 0 200 120"
      width={width}
      height={height}
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Penalty box */}
      <rect x="130" y="25" width="60" height="70" fill="none" stroke="currentColor" strokeWidth="1" className="text-muted-foreground/50" />
      
      {/* Goal */}
      <rect x="175" y="40" width="15" height="40" fill="none" stroke="currentColor" strokeWidth="2" className="text-muted-foreground" />
      
      {/* Passer */}
      <circle cx="80" cy="60" r="8" fill="currentColor" className="text-primary" />
      
      {/* Shooter */}
      <circle cx="150" cy="60" r="8" fill="currentColor" className="text-warning" />
      
      {/* Key pass */}
      <line x1="88" y1="60" x2="140" y2="60" stroke="currentColor" strokeWidth="2" className="text-primary" />
      <polygon points="142,60 135,55 135,65" fill="currentColor" className="text-primary" />
      
      {/* Shot */}
      <line x1="158" y1="60" x2="175" y2="60" stroke="currentColor" strokeWidth="2" strokeDasharray="3 2" className="text-warning" />
      <polygon points="177,60 170,55 170,65" fill="currentColor" className="text-warning" />
      
      {/* Labels */}
      <text x="100" y="45" textAnchor="middle" fontSize="8" fill="currentColor" className="text-primary">Key Pass</text>
      <text x="165" y="75" textAnchor="middle" fontSize="8" fill="currentColor" className="text-warning">Shot</text>
    </svg>
  );
}

// Interception Diagram
export function InterceptionDiagram({ className, width = 200, height = 120 }: DiagramProps) {
  return (
    <svg
      viewBox="0 0 200 120"
      width={width}
      height={height}
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Opponent passer */}
      <circle cx="40" cy="40" r="8" fill="currentColor" className="text-destructive/70" />
      
      {/* Intended receiver */}
      <circle cx="160" cy="80" r="8" fill="currentColor" className="text-destructive/70" />
      
      {/* Intercepting player */}
      <circle cx="100" cy="60" r="10" fill="currentColor" className="text-success" />
      
      {/* Original pass trajectory */}
      <line x1="48" y1="43" x2="152" y2="77" stroke="currentColor" strokeWidth="1" strokeDasharray="4 2" className="text-destructive/50" />
      
      {/* Interception point */}
      <circle cx="100" cy="60" r="15" fill="none" stroke="currentColor" strokeWidth="2" className="text-success" />
      
      {/* Ball at interception */}
      <circle cx="100" cy="60" r="4" fill="currentColor" className="text-foreground" />
      
      {/* X on intended path */}
      <g className="text-destructive" strokeWidth="2" stroke="currentColor">
        <line x1="125" y1="65" x2="135" y2="75" />
        <line x1="135" y1="65" x2="125" y2="75" />
      </g>
    </svg>
  );
}

// Clearance Diagram
export function ClearanceDiagram({ className, width = 200, height = 120 }: DiagramProps) {
  return (
    <svg
      viewBox="0 0 200 120"
      width={width}
      height={height}
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Penalty box (danger zone) */}
      <rect x="10" y="25" width="60" height="70" fill="currentColor" fillOpacity="0.1" className="text-destructive" />
      <rect x="10" y="25" width="60" height="70" fill="none" stroke="currentColor" strokeWidth="1" className="text-muted-foreground/50" />
      
      {/* Goal */}
      <rect x="0" y="40" width="15" height="40" fill="none" stroke="currentColor" strokeWidth="2" className="text-muted-foreground" />
      
      {/* Defender clearing */}
      <circle cx="50" cy="60" r="8" fill="currentColor" className="text-success" />
      
      {/* Ball trajectory (cleared) */}
      <path d="M 55 55 Q 100 10 150 40" fill="none" stroke="currentColor" strokeWidth="2" className="text-success" />
      
      {/* Ball at end */}
      <circle cx="150" cy="40" r="5" fill="currentColor" className="text-foreground" />
      
      {/* Arrow at end */}
      <polygon points="155,38 148,33 148,43" fill="currentColor" className="text-success" />
      
      {/* Danger label */}
      <text x="40" y="105" textAnchor="middle" fontSize="8" fill="currentColor" className="text-destructive">Danger Zone</text>
    </svg>
  );
}

// Aerial Duel Diagram
export function AerialDuelDiagram({ className, width = 200, height = 120 }: DiagramProps) {
  return (
    <svg
      viewBox="0 0 200 120"
      width={width}
      height={height}
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Player 1 (winner) */}
      <ellipse cx="90" cy="80" rx="12" ry="25" fill="currentColor" className="text-success" />
      <circle cx="90" cy="45" r="10" fill="currentColor" className="text-success" />
      
      {/* Player 2 (loser) */}
      <ellipse cx="110" cy="85" rx="12" ry="25" fill="currentColor" className="text-destructive/70" />
      <circle cx="110" cy="50" r="10" fill="currentColor" className="text-destructive/70" />
      
      {/* Ball above */}
      <circle cx="95" cy="25" r="6" fill="currentColor" className="text-foreground" />
      
      {/* Jump lines */}
      <line x1="90" y1="55" x2="95" y2="31" stroke="currentColor" strokeWidth="1" strokeDasharray="2 2" className="text-success" />
      
      {/* Winner indicator */}
      <text x="90" y="115" textAnchor="middle" fontSize="10" fill="currentColor" className="text-success">Won</text>
    </svg>
  );
}

// xG Zones Diagram
export function XGZonesDiagram({ className, width = 200, height = 140 }: DiagramProps) {
  return (
    <svg
      viewBox="0 0 200 140"
      width={width}
      height={height}
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Field half */}
      <rect x="10" y="10" width="180" height="120" fill="none" stroke="currentColor" strokeWidth="1" className="text-muted-foreground/50" />
      
      {/* Penalty box */}
      <rect x="50" y="10" width="100" height="50" fill="none" stroke="currentColor" strokeWidth="1" className="text-muted-foreground/50" />
      
      {/* 6-yard box */}
      <rect x="75" y="10" width="50" height="20" fill="none" stroke="currentColor" strokeWidth="1" className="text-muted-foreground/50" />
      
      {/* Goal */}
      <rect x="85" y="5" width="30" height="8" fill="none" stroke="currentColor" strokeWidth="2" className="text-muted-foreground" />
      
      {/* xG zones with colors */}
      {/* High xG zone (6-yard box) */}
      <rect x="75" y="10" width="50" height="20" fill="currentColor" fillOpacity="0.4" className="text-success" />
      <text x="100" y="23" textAnchor="middle" fontSize="8" fontWeight="bold" fill="currentColor" className="text-success">0.35+</text>
      
      {/* Medium-high xG zone */}
      <rect x="60" y="30" width="80" height="20" fill="currentColor" fillOpacity="0.3" className="text-primary" />
      <text x="100" y="43" textAnchor="middle" fontSize="8" fill="currentColor" className="text-primary">0.15-0.35</text>
      
      {/* Medium xG zone */}
      <rect x="50" y="50" width="100" height="20" fill="currentColor" fillOpacity="0.2" className="text-warning" />
      <text x="100" y="63" textAnchor="middle" fontSize="8" fill="currentColor" className="text-warning">0.05-0.15</text>
      
      {/* Low xG zone */}
      <rect x="30" y="70" width="140" height="30" fill="currentColor" fillOpacity="0.1" className="text-muted-foreground" />
      <text x="100" y="88" textAnchor="middle" fontSize="8" fill="currentColor" className="text-muted-foreground">0.01-0.05</text>
      
      {/* Legend */}
      <text x="100" y="115" textAnchor="middle" fontSize="9" fill="currentColor" className="text-foreground">Expected Goals by Zone</text>
      <text x="100" y="128" textAnchor="middle" fontSize="7" fill="currentColor" className="text-muted-foreground">Higher xG = Better chance of scoring</text>
    </svg>
  );
}

// Dribble Diagram
export function DribbleDiagram({ className, width = 200, height = 120 }: DiagramProps) {
  return (
    <svg
      viewBox="0 0 200 120"
      width={width}
      height={height}
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Defender */}
      <circle cx="100" cy="60" r="10" fill="currentColor" className="text-destructive/70" />
      
      {/* Attacker path */}
      <path d="M 40 60 Q 70 40 100 45 Q 130 50 160 60" fill="none" stroke="currentColor" strokeWidth="2" className="text-success" />
      
      {/* Attacker start */}
      <circle cx="40" cy="60" r="8" fill="currentColor" className="text-success/50" />
      
      {/* Attacker end */}
      <circle cx="160" cy="60" r="8" fill="currentColor" className="text-success" />
      
      {/* Ball positions */}
      <circle cx="40" cy="60" r="4" fill="currentColor" className="text-foreground/50" />
      <circle cx="70" cy="47" r="4" fill="currentColor" className="text-foreground/70" />
      <circle cx="130" cy="52" r="4" fill="currentColor" className="text-foreground/85" />
      <circle cx="160" cy="60" r="4" fill="currentColor" className="text-foreground" />
      
      {/* Arrow */}
      <polygon points="168,60 160,55 160,65" fill="currentColor" className="text-success" />
      
      {/* Labels */}
      <text x="100" y="85" textAnchor="middle" fontSize="8" fill="currentColor" className="text-destructive">Defender beaten</text>
    </svg>
  );
}

// Block Diagram
export function BlockDiagram({ className, width = 200, height = 120 }: DiagramProps) {
  return (
    <svg
      viewBox="0 0 200 120"
      width={width}
      height={height}
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Goal */}
      <rect x="160" y="35" width="30" height="50" fill="none" stroke="currentColor" strokeWidth="2" className="text-muted-foreground" />
      
      {/* Shooter */}
      <circle cx="60" cy="60" r="8" fill="currentColor" className="text-destructive/70" />
      
      {/* Blocking defender */}
      <circle cx="120" cy="60" r="10" fill="currentColor" className="text-success" />
      
      {/* Shot trajectory (blocked) */}
      <line x1="68" y1="60" x2="110" y2="60" stroke="currentColor" strokeWidth="2" className="text-destructive" />
      
      {/* Block effect */}
      <g className="text-success">
        <line x1="115" y1="50" x2="125" y2="70" stroke="currentColor" strokeWidth="3" />
        <line x1="115" y1="70" x2="125" y2="50" stroke="currentColor" strokeWidth="3" />
      </g>
      
      {/* Ball deflection */}
      <path d="M 120 60 Q 130 40 140 30" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="3 2" className="text-muted-foreground" />
      <circle cx="140" cy="30" r="4" fill="currentColor" className="text-foreground" />
    </svg>
  );
}

// Cross Diagram
export function CrossDiagram({ className, width = 200, height = 120 }: DiagramProps) {
  return (
    <svg
      viewBox="0 0 200 120"
      width={width}
      height={height}
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Penalty box */}
      <rect x="100" y="20" width="90" height="80" fill="none" stroke="currentColor" strokeWidth="1" className="text-muted-foreground/50" />
      
      {/* Goal */}
      <rect x="175" y="40" width="15" height="40" fill="none" stroke="currentColor" strokeWidth="2" className="text-muted-foreground" />
      
      {/* Wide player (crosser) */}
      <circle cx="30" cy="90" r="8" fill="currentColor" className="text-primary" />
      
      {/* Target player in box */}
      <circle cx="150" cy="60" r="8" fill="currentColor" className="text-success" />
      
      {/* Cross trajectory */}
      <path d="M 38 87 Q 90 30 145 55" fill="none" stroke="currentColor" strokeWidth="2" className="text-primary" />
      
      {/* Ball */}
      <circle cx="145" cy="55" r="5" fill="currentColor" className="text-foreground" />
      
      {/* Arrow */}
      <polygon points="148,52 140,50 142,58" fill="currentColor" className="text-primary" />
      
      {/* Labels */}
      <text x="30" y="108" textAnchor="middle" fontSize="8" fill="currentColor" className="text-primary">Wide</text>
      <text x="150" y="80" textAnchor="middle" fontSize="8" fill="currentColor" className="text-success">Target</text>
    </svg>
  );
}

// Through Ball Diagram
export function ThroughBallDiagram({ className, width = 200, height = 120 }: DiagramProps) {
  return (
    <svg
      viewBox="0 0 200 120"
      width={width}
      height={height}
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Defensive line */}
      <line x1="100" y1="20" x2="100" y2="100" stroke="currentColor" strokeWidth="2" strokeDasharray="5 3" className="text-destructive/50" />
      
      {/* Defenders */}
      <circle cx="100" cy="35" r="7" fill="currentColor" className="text-destructive/70" />
      <circle cx="100" cy="60" r="7" fill="currentColor" className="text-destructive/70" />
      <circle cx="100" cy="85" r="7" fill="currentColor" className="text-destructive/70" />
      
      {/* Passer */}
      <circle cx="40" cy="60" r="8" fill="currentColor" className="text-primary" />
      
      {/* Runner */}
      <circle cx="140" cy="48" r="8" fill="currentColor" className="text-success" />
      
      {/* Through ball */}
      <path d="M 48 58 L 130 48" fill="none" stroke="currentColor" strokeWidth="2" className="text-primary" />
      <polygon points="132,48 125,43 125,53" fill="currentColor" className="text-primary" />
      
      {/* Running line */}
      <path d="M 140 55 L 170 60" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="3 2" className="text-success" />
      
      {/* Goal */}
      <rect x="175" y="45" width="15" height="30" fill="none" stroke="currentColor" strokeWidth="2" className="text-muted-foreground" />
      
      {/* Labels */}
      <text x="100" y="115" textAnchor="middle" fontSize="8" fill="currentColor" className="text-destructive">Defensive Line</text>
    </svg>
  );
}

// Goal Diagram
export function GoalDiagram({ className, width = 200, height = 120 }: DiagramProps) {
  return (
    <svg
      viewBox="0 0 200 120"
      width={width}
      height={height}
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Goal frame */}
      <rect x="30" y="20" width="140" height="80" fill="none" stroke="currentColor" strokeWidth="3" className="text-muted-foreground" />
      
      {/* Goal net pattern */}
      <g className="text-muted-foreground/30" strokeWidth="0.5" stroke="currentColor">
        {[0, 1, 2, 3, 4, 5, 6, 7].map(i => (
          <line key={`v${i}`} x1={30 + i * 20} y1="20" x2={30 + i * 20} y2="100" />
        ))}
        {[0, 1, 2, 3, 4].map(i => (
          <line key={`h${i}`} x1="30" y1={20 + i * 20} x2="170" y2={20 + i * 20} />
        ))}
      </g>
      
      {/* Ball in net */}
      <circle cx="100" cy="60" r="10" fill="currentColor" className="text-success" />
      
      {/* Ball trajectory */}
      <line x1="100" y1="115" x2="100" y2="70" stroke="currentColor" strokeWidth="2" strokeDasharray="4 2" className="text-success" />
      
      {/* Celebration effect */}
      <g className="text-warning">
        <line x1="80" y1="40" x2="70" y2="30" stroke="currentColor" strokeWidth="2" />
        <line x1="120" y1="40" x2="130" y2="30" stroke="currentColor" strokeWidth="2" />
        <line x1="85" y1="80" x2="75" y2="90" stroke="currentColor" strokeWidth="2" />
        <line x1="115" y1="80" x2="125" y2="90" stroke="currentColor" strokeWidth="2" />
      </g>
      
      {/* GOAL text */}
      <text x="100" y="65" textAnchor="middle" fontSize="12" fontWeight="bold" fill="white">GOAL!</text>
    </svg>
  );
}

// Assist Diagram
export function AssistDiagram({ className, width = 200, height = 120 }: DiagramProps) {
  return (
    <svg
      viewBox="0 0 200 120"
      width={width}
      height={height}
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Goal */}
      <rect x="165" y="40" width="25" height="40" fill="none" stroke="currentColor" strokeWidth="2" className="text-muted-foreground" />
      
      {/* Assister */}
      <circle cx="60" cy="60" r="8" fill="currentColor" className="text-primary" />
      
      {/* Scorer */}
      <circle cx="130" cy="60" r="8" fill="currentColor" className="text-success" />
      
      {/* Assist pass */}
      <line x1="68" y1="60" x2="120" y2="60" stroke="currentColor" strokeWidth="2" className="text-primary" />
      <polygon points="122,60 115,55 115,65" fill="currentColor" className="text-primary" />
      
      {/* Goal shot */}
      <line x1="138" y1="60" x2="165" y2="60" stroke="currentColor" strokeWidth="2" className="text-success" />
      
      {/* Ball in goal */}
      <circle cx="175" cy="60" r="5" fill="currentColor" className="text-success" />
      
      {/* Labels */}
      <text x="60" y="80" textAnchor="middle" fontSize="8" fill="currentColor" className="text-primary">Assist</text>
      <text x="130" y="80" textAnchor="middle" fontSize="8" fill="currentColor" className="text-success">Goal</text>
    </svg>
  );
}

// Progressive Run Diagram
export function ProgressiveRunDiagram({ className, width = 200, height = 120 }: DiagramProps) {
  return (
    <svg
      viewBox="0 0 200 120"
      width={width}
      height={height}
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Field thirds */}
      <line x1="70" y1="10" x2="70" y2="110" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" className="text-muted-foreground/30" />
      <line x1="130" y1="10" x2="130" y2="110" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" className="text-muted-foreground/30" />
      
      {/* Goal */}
      <rect x="175" y="45" width="15" height="30" fill="none" stroke="currentColor" strokeWidth="2" className="text-muted-foreground" />
      
      {/* Progress zone */}
      <rect x="130" y="10" width="60" height="100" fill="currentColor" fillOpacity="0.1" className="text-success" />
      
      {/* Player with ball - start */}
      <circle cx="50" cy="60" r="6" fill="currentColor" className="text-primary/50" />
      
      {/* Player with ball - end */}
      <circle cx="150" cy="60" r="8" fill="currentColor" className="text-success" />
      
      {/* Running path with ball */}
      <path d="M 56 60 L 142 60" fill="none" stroke="currentColor" strokeWidth="2" className="text-success" />
      <polygon points="144,60 137,55 137,65" fill="currentColor" className="text-success" />
      
      {/* Ball at feet indicators */}
      <circle cx="70" cy="60" r="3" fill="currentColor" className="text-foreground/50" />
      <circle cx="100" cy="60" r="3" fill="currentColor" className="text-foreground/70" />
      <circle cx="130" cy="60" r="3" fill="currentColor" className="text-foreground/85" />
      <circle cx="150" cy="60" r="4" fill="currentColor" className="text-foreground" />
      
      {/* Distance */}
      <text x="100" y="45" textAnchor="middle" fontSize="10" fill="currentColor" className="text-muted-foreground">+10m toward goal</text>
    </svg>
  );
}

// Map of diagram IDs to components
export const statDiagrams: Record<string, React.FC<DiagramProps>> = {
  'shot-on-target': ShotOnTargetDiagram,
  'shot-off-target': ShotOffTargetDiagram,
  'progressive-pass': ProgressivePassDiagram,
  'key-pass': KeyPassDiagram,
  'interception': InterceptionDiagram,
  'clearance': ClearanceDiagram,
  'aerial-duel': AerialDuelDiagram,
  'xg-zones': XGZonesDiagram,
  'dribble': DribbleDiagram,
  'block': BlockDiagram,
  'cross': CrossDiagram,
  'through-ball': ThroughBallDiagram,
  'goal': GoalDiagram,
  'assist': AssistDiagram,
  'progressive-run': ProgressiveRunDiagram,
  'shot': ShotOnTargetDiagram, // Alias
};

// Helper to get diagram component by ID
export function getStatDiagram(iconId: string): React.FC<DiagramProps> | undefined {
  return statDiagrams[iconId];
}
