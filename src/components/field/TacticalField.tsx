import React, { useRef, useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface TacticalFieldProps {
    viewMode?: 'full' | 'left' | 'right' | 'left_half' | 'right_half' | 'top_half' | 'bottom_half'; // Horizontal and Vertical orientations
    children?: React.ReactNode;
    className?: string;
    interactive?: boolean;
    onFieldClick?: (x: number, y: number) => void;
    showGrid?: boolean;
}

const TacticalField: React.FC<TacticalFieldProps> = ({
    viewMode = 'full',
    children,
    className,
    interactive = false,
    onFieldClick,
    showGrid = false
}) => {
    const svgRef = useRef<SVGSVGElement>(null);

    // Constants matching the HTML reference
    const PITCH_WIDTH = 105;
    const PITCH_HEIGHT = 68;

    // ViewBox logic - zoomed out more to show corners and goals with extra padding
    const getViewBox = () => {
        switch (viewMode) {
            case 'left':
            case 'left_half':
            case 'top_half':
                return '-8 -6 72 80'; // Left half: more zoomed out
            case 'right':
            case 'right_half':
            case 'bottom_half':
                return '41 -6 72 80'; // Right half: more zoomed out
            case 'full':
            default:
                return '-8 -6 126 80'; // Full field: more zoomed out
        }
    };

    // Whether to rotate for vertical display
    const isVertical = viewMode === 'top_half' || viewMode === 'bottom_half';

    const handleDataClick = (e: React.MouseEvent) => {
        if (!interactive || !onFieldClick || !svgRef.current) return;

        const pt = svgRef.current.createSVGPoint();
        pt.x = e.clientX;
        pt.y = e.clientY;

        // Matrix transform to get SVG coordinates
        const svgP = pt.matrixTransform(svgRef.current.getScreenCTM()?.inverse());

        // Clamp to pitch boundaries
        const x = Math.max(0, Math.min(PITCH_WIDTH, svgP.x));
        const y = Math.max(0, Math.min(PITCH_HEIGHT, svgP.y));

        onFieldClick(x, y);
    };

    return (
        <div className={cn("relative w-full h-full overflow-hidden", className)}>
            <svg
                ref={svgRef}
                id="tactical-field"
                viewBox={getViewBox()}
                preserveAspectRatio="xMidYMid meet"
                xmlns="http://www.w3.org/2000/svg"
                className={cn(
                    "w-full h-full block transition-all duration-300",
                    isVertical && "rotate-90"
                )}
                onClick={handleDataClick}
                style={{ cursor: interactive ? 'crosshair' : 'default' }}
            >
                {/* Definitions */}
                <defs>
                    {/* Marker for Pass Arrows */}
                    <marker id="arrowhead-white" markerWidth="4" markerHeight="4" refX="2" refY="2" orient="auto">
                        <path d="M0,0 L4,2 L0,4 Z" fill="#ffffff" />
                    </marker>
                    <marker id="arrowhead-amber" markerWidth="4" markerHeight="4" refX="2" refY="2" orient="auto">
                        <path d="M0,0 L4,2 L0,4 Z" fill="#fbbf24" />
                    </marker>
                    <marker id="arrowhead-red" markerWidth="4" markerHeight="4" refX="2" refY="2" orient="auto">
                        <path d="M0,0 L4,2 L0,4 Z" fill="#ef4444" />
                    </marker>

                    {/* PATTERN: Goal Netting (Crosshatch) */}
                    <pattern id="goalNet" x="0" y="0" width="0.5" height="0.5" patternUnits="userSpaceOnUse">
                        {/* Diagonal Mesh Look */}
                        <path d="M 0,0 L 0.5,0.5 M 0.5,0 L 0,0.5" stroke="#cbd5e1" strokeWidth="0.08" opacity="0.6" />
                        <rect width="0.5" height="0.5" fill="rgba(255,255,255,0.05)" />
                    </pattern>

                    {/* PATTERN: Grass Stripes */}
                    <pattern id="grassStripes" x="0" y="0" width="12" height="68" patternUnits="userSpaceOnUse">
                        <rect x="0" y="0" width="6" height="68" fillOpacity="0" /> {/* Transparent (shows base) */}
                        <rect x="6" y="0" width="6" height="68" fill="white" fillOpacity="0.05" />
                    </pattern>

                    {/* FILTER: Organic Grass Noise */}
                    <filter id="grassNoise" x="0%" y="0%" width="100%" height="100%">
                        <feTurbulence type="fractalNoise" baseFrequency="0.7" numOctaves="3" result="noise" />
                        <feColorMatrix type="matrix" in="noise"
                            values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.15 0" />
                    </filter>
                </defs>

                {/* LAYER 0: Grass Base & Texture */}
                <rect x="-5" y="-5" width="115" height="78" fill="var(--pitch-green, #357a38)" />

                {/* Stripes */}
                <rect x="-5" y="-5" width="115" height="78" fill="url(#grassStripes)" />

                {/* Noise Texture Overlay (Grain) */}
                <rect x="-5" y="-5" width="115" height="78" filter="url(#grassNoise)" opacity="0.6" style={{ pointerEvents: 'none' }} />

                {/* Main Field Lines Group */}
                <g id="pitch-lines" fill="none" stroke="white" strokeWidth="0.15">
                    {/* Touchlines and Goal lines */}
                    <rect x="0" y="0" width="105" height="68" />

                    {/* Halfway Line */}
                    <line x1="52.5" y1="0" x2="52.5" y2="68" />

                    {/* Center Circle */}
                    <circle cx="52.5" cy="34" r="9.15" />
                    <circle cx="52.5" cy="34" r="0.4" fill="white" />

                    {/* --- LEFT SIDE --- */}
                    {/* Penalty Area */}
                    <rect x="0" y="13.84" width="16.5" height="40.32" />
                    {/* Goal Area */}
                    <rect x="0" y="24.84" width="5.5" height="18.32" />
                    {/* Penalty Spot */}
                    <circle cx="11" cy="34" r="0.3" fill="white" />
                    {/* Penalty Arc */}
                    <path d="M 16.5,26.5 A 9.15,9.15 0 0,1 16.5,41.5" />
                    {/* Corners */}
                    <path d="M 0,1 A 1,1 0 0,0 1,0" />
                    <path d="M 0,67 A 1,1 0 0,1 1,68" />

                    {/* --- RIGHT SIDE --- */}
                    {/* Penalty Area */}
                    <rect x="88.5" y="13.84" width="16.5" height="40.32" />
                    {/* Goal Area */}
                    <rect x="99.5" y="24.84" width="5.5" height="18.32" />
                    {/* Penalty Spot */}
                    <circle cx="94" cy="34" r="0.3" fill="white" />
                    {/* Penalty Arc */}
                    <path d="M 88.5,26.5 A 9.15,9.15 0 0,0 88.5,41.5" />
                    {/* Corners */}
                    <path d="M 105,1 A 1,1 0 0,1 104,0" />
                    <path d="M 105,67 A 1,1 0 0,0 104,68" />

                    {/* Goals (Visual only) */}
                    <rect x="-2.44" y="30.34" width="2.44" height="7.32" stroke="#e5e7eb" strokeWidth="0.2" fill="url(#goalNet)" />
                    <rect x="105" y="30.34" width="2.44" height="7.32" stroke="#e5e7eb" strokeWidth="0.2" fill="url(#goalNet)" />
                </g>

                {/* Grid Overlay (Optional) */}
                {showGrid && (
                    <g id="grid" stroke="rgba(255,255,255,0.1)" strokeWidth="0.1">
                        {Array.from({ length: 21 }).map((_, i) => (
                            <line key={`v-${i}`} x1={i * 5.25} y1="0" x2={i * 5.25} y2="68" />
                        ))}
                        {Array.from({ length: 14 }).map((_, i) => (
                            <line key={`h-${i}`} x1="0" y1={i * 5.23} x2="105" y2={i * 5.23} />
                        ))}
                    </g>
                )}

                {/* Children Layer (Players, Passes, Shots) */}
                <g id="layer-content">
                    {children}
                </g>

            </svg>

            {/* CSS Texture Overlay */}
            <div className="absolute inset-0 pointer-events-none"
                style={{
                    background: 'repeating-linear-gradient(90deg, transparent, transparent 5.8%, rgba(255, 255, 255, 0.03) 5.8%, rgba(255, 255, 255, 0.03) 11.6%)',
                    mixBlendMode: 'overlay'
                }}
            />
        </div>
    );
};

export default TacticalField;
