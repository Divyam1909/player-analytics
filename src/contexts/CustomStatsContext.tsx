import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Define all available stats categories and their individual stats
export interface StatItem {
    id: string;
    name: string;
    category: 'passing' | 'attacking' | 'defending' | 'physical' | 'team' | 'advanced';
    description: string;
}

// All available stats that can be selected
export const ALL_STATS: StatItem[] = [
    // Passing Stats
    { id: 'passes', name: 'Total Passes', category: 'passing', description: 'Total pass attempts' },
    { id: 'passAccuracy', name: 'Pass Accuracy', category: 'passing', description: 'Pass completion percentage' },
    { id: 'keyPasses', name: 'Key Passes', category: 'passing', description: 'Passes leading to shot attempts' },
    { id: 'passesInFinalThird', name: 'Passes in Final Third', category: 'passing', description: 'Passes completed in final third' },
    { id: 'passesInBox', name: 'Passes into Box', category: 'passing', description: 'Passes into penalty area' },
    { id: 'crosses', name: 'Crosses', category: 'passing', description: 'Cross attempts' },
    { id: 'progressivePassing', name: 'Progressive Passes', category: 'passing', description: 'Passes moving ball significantly forward' },
    { id: 'assists', name: 'Assists', category: 'passing', description: 'Passes leading to goals' },

    // Attacking Stats
    { id: 'goals', name: 'Goals', category: 'attacking', description: 'Goals scored' },
    { id: 'shots', name: 'Shots', category: 'attacking', description: 'Total shot attempts' },
    { id: 'shotsOnTarget', name: 'Shots on Target', category: 'attacking', description: 'Shots on goal' },
    { id: 'dribbles', name: 'Dribbles', category: 'attacking', description: 'Dribble attempts' },
    { id: 'dribblesSuccessful', name: 'Successful Dribbles', category: 'attacking', description: 'Completed dribbles' },
    { id: 'aerialDuelsWon', name: 'Aerial Duels Won', category: 'attacking', description: 'Headers won' },
    { id: 'progressiveRuns', name: 'Progressive Runs', category: 'attacking', description: 'Ball carries moving forward' },
    { id: 'ballTouches', name: 'Ball Touches', category: 'attacking', description: 'Total ball touches' },

    // Defensive Stats
    { id: 'blocks', name: 'Blocks', category: 'defending', description: 'Shot blocks' },
    { id: 'interceptions', name: 'Interceptions', category: 'defending', description: 'Passes intercepted' },
    { id: 'clearances', name: 'Clearances', category: 'defending', description: 'Defensive clearances' },
    { id: 'recoveries', name: 'Ball Recoveries', category: 'defending', description: 'Balls recovered' },
    { id: 'tackles', name: 'Tackles', category: 'defending', description: 'Successful tackles' },

    // Physical Stats
    { id: 'distanceCovered', name: 'Distance Covered', category: 'physical', description: 'Total distance in meters' },
    { id: 'sprints', name: 'Sprints', category: 'physical', description: 'Number of sprint actions' },

    // Team Stats (from match_statistics)
    { id: 'team_clearances', name: 'Team Clearances', category: 'team', description: 'Team total clearances' },
    { id: 'team_interceptions', name: 'Team Interceptions', category: 'team', description: 'Team total interceptions' },
    { id: 'team_successful_dribbles', name: 'Team Dribbles', category: 'team', description: 'Team successful dribbles' },
    { id: 'team_chances_created', name: 'Chances Created', category: 'team', description: 'Team chances in box' },
    { id: 'team_aerial_duels_won', name: 'Team Aerial Duels', category: 'team', description: 'Team aerial duels won' },
    { id: 'team_shots_on_target', name: 'Team Shots on Target', category: 'team', description: 'Team shots on goal' },
    { id: 'team_fouls', name: 'Team Fouls', category: 'team', description: 'Fouls committed' },
    { id: 'team_saves', name: 'Team Saves', category: 'team', description: 'Goalkeeper saves' },

    // Advanced Indices
    { id: 'possession_control_index', name: 'Possession Control Index', category: 'advanced', description: 'Ball retention quality' },
    { id: 'chance_creation_index', name: 'Chance Creation Index', category: 'advanced', description: 'Opportunity generation rate' },
    { id: 'shooting_efficiency', name: 'Shooting Efficiency', category: 'advanced', description: 'Shot conversion rate' },
    { id: 'defensive_solidity', name: 'Defensive Solidity', category: 'advanced', description: 'Defensive strength index' },
    { id: 'transition_progression', name: 'Transition & Progression', category: 'advanced', description: 'Counter-attack effectiveness' },
    { id: 'recovery_pressing_efficiency', name: 'Recovery & Pressing', category: 'advanced', description: 'Press and recovery quality' },
];

export const STAT_CATEGORIES = [
    { id: 'passing', name: 'Passing', color: 'text-blue-400' },
    { id: 'attacking', name: 'Attacking', color: 'text-red-400' },
    { id: 'defending', name: 'Defending', color: 'text-green-400' },
    { id: 'physical', name: 'Physical', color: 'text-yellow-400' },
    { id: 'team', name: 'Team Stats', color: 'text-purple-400' },
    { id: 'advanced', name: 'Advanced Indices', color: 'text-cyan-400' },
] as const;

interface CustomStatsContextType {
    selectedStats: string[];
    isCustomMode: boolean;
    setSelectedStats: (stats: string[]) => void;
    setIsCustomMode: (mode: boolean) => void;
    toggleStat: (statId: string) => void;
    clearAllStats: () => void;
    selectAllStats: () => void;
    hasCustomStats: boolean;
}

const STORAGE_KEY = 'coach-custom-stats';
const MODE_STORAGE_KEY = 'coach-custom-mode';

const CustomStatsContext = createContext<CustomStatsContextType | undefined>(undefined);

export const CustomStatsProvider = ({ children }: { children: ReactNode }) => {
    const [selectedStats, setSelectedStatsState] = useState<string[]>(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            return stored ? JSON.parse(stored) : [];
        } catch {
            return [];
        }
    });

    const [isCustomMode, setIsCustomModeState] = useState<boolean>(() => {
        try {
            const stored = localStorage.getItem(MODE_STORAGE_KEY);
            return stored === 'true';
        } catch {
            return false;
        }
    });

    // Persist selected stats to localStorage
    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(selectedStats));
    }, [selectedStats]);

    // Persist mode to localStorage
    useEffect(() => {
        localStorage.setItem(MODE_STORAGE_KEY, String(isCustomMode));
    }, [isCustomMode]);

    const setSelectedStats = (stats: string[]) => {
        setSelectedStatsState(stats);
    };

    const setIsCustomMode = (mode: boolean) => {
        setIsCustomModeState(mode);
    };

    const toggleStat = (statId: string) => {
        setSelectedStatsState(prev =>
            prev.includes(statId)
                ? prev.filter(id => id !== statId)
                : [...prev, statId]
        );
    };

    const clearAllStats = () => {
        setSelectedStatsState([]);
    };

    const selectAllStats = () => {
        setSelectedStatsState(ALL_STATS.map(s => s.id));
    };

    const hasCustomStats = selectedStats.length > 0;

    return (
        <CustomStatsContext.Provider value={{
            selectedStats,
            isCustomMode,
            setSelectedStats,
            setIsCustomMode,
            toggleStat,
            clearAllStats,
            selectAllStats,
            hasCustomStats,
        }}>
            {children}
        </CustomStatsContext.Provider>
    );
};

export const useCustomStats = () => {
    const context = useContext(CustomStatsContext);
    if (context === undefined) {
        throw new Error('useCustomStats must be used within a CustomStatsProvider');
    }
    return context;
};
