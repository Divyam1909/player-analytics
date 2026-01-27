/**
 * Formation positions for half-field display
 * Coordinates are percentages (0-100) where:
 * - X: 0 = left edge, 100 = right edge
 * - Y: 0 = goal line (top), 100 = midfield line (bottom)
 */

export type FormationName = '4-3-3' | '4-4-2' | '4-2-3-1' | '3-5-2' | '4-2-1-3' | '5-3-2' | '3-4-3';

export interface FormationSlot {
    id: string;
    x: number;
    y: number;
    role: string; // e.g., "GK", "LCB", "RCB", "LB", "RB", "CM", "LW", "RW", "ST"
    preferredPositions: string[]; // Player positions that fit this slot
}

export interface Formation {
    name: FormationName;
    label: string;
    slots: FormationSlot[];
}

// Map player database positions to formation slot preferences
const positionMapping: Record<string, string[]> = {
    'GK': ['GK', 'Goalkeeper'],
    'CB': ['CB', 'Defender'],
    'LCB': ['CB', 'LB', 'Defender'],
    'RCB': ['CB', 'RB', 'Defender'],
    'LB': ['LB', 'LWB', 'Defender'],
    'RB': ['RB', 'RWB', 'Defender'],
    'LWB': ['LWB', 'LB', 'LW', 'Defender', 'Winger'],
    'RWB': ['RWB', 'RB', 'RW', 'Defender', 'Winger'],
    'CDM': ['CDM', 'CM', 'Midfielder'],
    'CM': ['CM', 'CDM', 'CAM', 'Midfielder'],
    'LCM': ['CM', 'CDM', 'CAM', 'Midfielder'],
    'RCM': ['CM', 'CDM', 'CAM', 'Midfielder'],
    'CAM': ['CAM', 'CM', 'Midfielder'],
    'LM': ['LM', 'LW', 'CM', 'Midfielder', 'Winger'],
    'RM': ['RM', 'RW', 'CM', 'Midfielder', 'Winger'],
    'LW': ['LW', 'LM', 'Winger', 'Forward'],
    'RW': ['RW', 'RM', 'Winger', 'Forward'],
    'CF': ['CF', 'ST', 'CAM', 'Forward'],
    'ST': ['ST', 'CF', 'Forward'],
    'LST': ['ST', 'CF', 'LW', 'Forward'],
    'RST': ['ST', 'CF', 'RW', 'Forward'],
};

export const FORMATIONS: Formation[] = [
    {
        name: '4-3-3',
        label: '4-3-3',
        slots: [
            { id: 'gk', x: 50, y: 8, role: 'GK', preferredPositions: positionMapping['GK'] },
            { id: 'lb', x: 15, y: 25, role: 'LB', preferredPositions: positionMapping['LB'] },
            { id: 'lcb', x: 35, y: 22, role: 'LCB', preferredPositions: positionMapping['CB'] },
            { id: 'rcb', x: 65, y: 22, role: 'RCB', preferredPositions: positionMapping['CB'] },
            { id: 'rb', x: 85, y: 25, role: 'RB', preferredPositions: positionMapping['RB'] },
            { id: 'lcm', x: 30, y: 45, role: 'LCM', preferredPositions: positionMapping['CM'] },
            { id: 'cm', x: 50, y: 42, role: 'CM', preferredPositions: positionMapping['CM'] },
            { id: 'rcm', x: 70, y: 45, role: 'RCM', preferredPositions: positionMapping['CM'] },
            { id: 'lw', x: 18, y: 70, role: 'LW', preferredPositions: positionMapping['LW'] },
            { id: 'st', x: 50, y: 75, role: 'ST', preferredPositions: positionMapping['ST'] },
            { id: 'rw', x: 82, y: 70, role: 'RW', preferredPositions: positionMapping['RW'] },
        ],
    },
    {
        name: '4-4-2',
        label: '4-4-2',
        slots: [
            { id: 'gk', x: 50, y: 8, role: 'GK', preferredPositions: positionMapping['GK'] },
            { id: 'lb', x: 15, y: 25, role: 'LB', preferredPositions: positionMapping['LB'] },
            { id: 'lcb', x: 35, y: 22, role: 'LCB', preferredPositions: positionMapping['CB'] },
            { id: 'rcb', x: 65, y: 22, role: 'RCB', preferredPositions: positionMapping['CB'] },
            { id: 'rb', x: 85, y: 25, role: 'RB', preferredPositions: positionMapping['RB'] },
            { id: 'lm', x: 15, y: 48, role: 'LM', preferredPositions: positionMapping['LM'] },
            { id: 'lcm', x: 38, y: 45, role: 'LCM', preferredPositions: positionMapping['CM'] },
            { id: 'rcm', x: 62, y: 45, role: 'RCM', preferredPositions: positionMapping['CM'] },
            { id: 'rm', x: 85, y: 48, role: 'RM', preferredPositions: positionMapping['RM'] },
            { id: 'lst', x: 38, y: 75, role: 'LST', preferredPositions: positionMapping['ST'] },
            { id: 'rst', x: 62, y: 75, role: 'RST', preferredPositions: positionMapping['ST'] },
        ],
    },
    {
        name: '4-2-3-1',
        label: '4-2-3-1',
        slots: [
            { id: 'gk', x: 50, y: 8, role: 'GK', preferredPositions: positionMapping['GK'] },
            { id: 'lb', x: 15, y: 25, role: 'LB', preferredPositions: positionMapping['LB'] },
            { id: 'lcb', x: 35, y: 22, role: 'LCB', preferredPositions: positionMapping['CB'] },
            { id: 'rcb', x: 65, y: 22, role: 'RCB', preferredPositions: positionMapping['CB'] },
            { id: 'rb', x: 85, y: 25, role: 'RB', preferredPositions: positionMapping['RB'] },
            { id: 'lcdm', x: 35, y: 40, role: 'LCDM', preferredPositions: positionMapping['CDM'] },
            { id: 'rcdm', x: 65, y: 40, role: 'RCDM', preferredPositions: positionMapping['CDM'] },
            { id: 'lw', x: 20, y: 58, role: 'LW', preferredPositions: positionMapping['LW'] },
            { id: 'cam', x: 50, y: 55, role: 'CAM', preferredPositions: positionMapping['CAM'] },
            { id: 'rw', x: 80, y: 58, role: 'RW', preferredPositions: positionMapping['RW'] },
            { id: 'st', x: 50, y: 78, role: 'ST', preferredPositions: positionMapping['ST'] },
        ],
    },
    {
        name: '3-5-2',
        label: '3-5-2',
        slots: [
            { id: 'gk', x: 50, y: 8, role: 'GK', preferredPositions: positionMapping['GK'] },
            { id: 'lcb', x: 25, y: 22, role: 'LCB', preferredPositions: positionMapping['CB'] },
            { id: 'cb', x: 50, y: 20, role: 'CB', preferredPositions: positionMapping['CB'] },
            { id: 'rcb', x: 75, y: 22, role: 'RCB', preferredPositions: positionMapping['CB'] },
            { id: 'lwb', x: 10, y: 45, role: 'LWB', preferredPositions: positionMapping['LWB'] },
            { id: 'lcm', x: 32, y: 42, role: 'LCM', preferredPositions: positionMapping['CM'] },
            { id: 'cm', x: 50, y: 40, role: 'CM', preferredPositions: positionMapping['CM'] },
            { id: 'rcm', x: 68, y: 42, role: 'RCM', preferredPositions: positionMapping['CM'] },
            { id: 'rwb', x: 90, y: 45, role: 'RWB', preferredPositions: positionMapping['RWB'] },
            { id: 'lst', x: 38, y: 72, role: 'LST', preferredPositions: positionMapping['ST'] },
            { id: 'rst', x: 62, y: 72, role: 'RST', preferredPositions: positionMapping['ST'] },
        ],
    },
    {
        name: '4-2-1-3',
        label: '4-2-1-3',
        slots: [
            { id: 'gk', x: 50, y: 8, role: 'GK', preferredPositions: positionMapping['GK'] },
            { id: 'lb', x: 15, y: 25, role: 'LB', preferredPositions: positionMapping['LB'] },
            { id: 'lcb', x: 35, y: 22, role: 'LCB', preferredPositions: positionMapping['CB'] },
            { id: 'rcb', x: 65, y: 22, role: 'RCB', preferredPositions: positionMapping['CB'] },
            { id: 'rb', x: 85, y: 25, role: 'RB', preferredPositions: positionMapping['RB'] },
            { id: 'lcdm', x: 35, y: 40, role: 'LCDM', preferredPositions: positionMapping['CDM'] },
            { id: 'rcdm', x: 65, y: 40, role: 'RCDM', preferredPositions: positionMapping['CDM'] },
            { id: 'cam', x: 50, y: 55, role: 'CAM', preferredPositions: positionMapping['CAM'] },
            { id: 'lw', x: 20, y: 72, role: 'LW', preferredPositions: positionMapping['LW'] },
            { id: 'st', x: 50, y: 78, role: 'ST', preferredPositions: positionMapping['ST'] },
            { id: 'rw', x: 80, y: 72, role: 'RW', preferredPositions: positionMapping['RW'] },
        ],
    },
    {
        name: '5-3-2',
        label: '5-3-2',
        slots: [
            { id: 'gk', x: 50, y: 8, role: 'GK', preferredPositions: positionMapping['GK'] },
            { id: 'lwb', x: 10, y: 28, role: 'LWB', preferredPositions: positionMapping['LWB'] },
            { id: 'lcb', x: 28, y: 22, role: 'LCB', preferredPositions: positionMapping['CB'] },
            { id: 'cb', x: 50, y: 20, role: 'CB', preferredPositions: positionMapping['CB'] },
            { id: 'rcb', x: 72, y: 22, role: 'RCB', preferredPositions: positionMapping['CB'] },
            { id: 'rwb', x: 90, y: 28, role: 'RWB', preferredPositions: positionMapping['RWB'] },
            { id: 'lcm', x: 30, y: 48, role: 'LCM', preferredPositions: positionMapping['CM'] },
            { id: 'cm', x: 50, y: 45, role: 'CM', preferredPositions: positionMapping['CM'] },
            { id: 'rcm', x: 70, y: 48, role: 'RCM', preferredPositions: positionMapping['CM'] },
            { id: 'lst', x: 38, y: 72, role: 'LST', preferredPositions: positionMapping['ST'] },
            { id: 'rst', x: 62, y: 72, role: 'RST', preferredPositions: positionMapping['ST'] },
        ],
    },
    {
        name: '3-4-3',
        label: '3-4-3',
        slots: [
            { id: 'gk', x: 50, y: 8, role: 'GK', preferredPositions: positionMapping['GK'] },
            { id: 'lcb', x: 25, y: 22, role: 'LCB', preferredPositions: positionMapping['CB'] },
            { id: 'cb', x: 50, y: 20, role: 'CB', preferredPositions: positionMapping['CB'] },
            { id: 'rcb', x: 75, y: 22, role: 'RCB', preferredPositions: positionMapping['CB'] },
            { id: 'lm', x: 15, y: 48, role: 'LM', preferredPositions: positionMapping['LM'] },
            { id: 'lcm', x: 38, y: 45, role: 'LCM', preferredPositions: positionMapping['CM'] },
            { id: 'rcm', x: 62, y: 45, role: 'RCM', preferredPositions: positionMapping['CM'] },
            { id: 'rm', x: 85, y: 48, role: 'RM', preferredPositions: positionMapping['RM'] },
            { id: 'lw', x: 20, y: 72, role: 'LW', preferredPositions: positionMapping['LW'] },
            { id: 'st', x: 50, y: 78, role: 'ST', preferredPositions: positionMapping['ST'] },
            { id: 'rw', x: 80, y: 72, role: 'RW', preferredPositions: positionMapping['RW'] },
        ],
    },
];

export const getFormationByName = (name: FormationName): Formation => {
    return FORMATIONS.find(f => f.name === name) || FORMATIONS[0];
};

// Position colors for display
export const POSITION_SLOT_COLORS: Record<string, string> = {
    'GK': 'hsl(var(--warning))',
    'LB': 'hsl(var(--success))',
    'LCB': 'hsl(var(--success))',
    'CB': 'hsl(var(--success))',
    'RCB': 'hsl(var(--success))',
    'RB': 'hsl(var(--success))',
    'LWB': 'hsl(var(--success))',
    'RWB': 'hsl(var(--success))',
    'LCDM': 'hsl(var(--primary))',
    'RCDM': 'hsl(var(--primary))',
    'CDM': 'hsl(var(--primary))',
    'LCM': 'hsl(var(--primary))',
    'CM': 'hsl(var(--primary))',
    'RCM': 'hsl(var(--primary))',
    'LM': 'hsl(var(--primary))',
    'RM': 'hsl(var(--primary))',
    'CAM': 'hsl(var(--chart-4))',
    'LW': 'hsl(var(--chart-4))',
    'RW': 'hsl(var(--chart-4))',
    'LST': 'hsl(var(--destructive))',
    'ST': 'hsl(var(--destructive))',
    'RST': 'hsl(var(--destructive))',
    'CF': 'hsl(var(--destructive))',
};

export const getSlotColor = (role: string): string => {
    return POSITION_SLOT_COLORS[role] || 'hsl(var(--primary))';
};
