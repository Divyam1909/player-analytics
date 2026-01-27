/**
 * React Query Hooks for Supabase Data
 * 
 * Custom hooks that use TanStack Query to fetch and cache
 * data from the data service layer.
 */

import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
    getPlayersWithStats,
    getPlayerById,
    getDataSourceStatus,
    fetchMatchesFromDB,
    fetchMatchStatisticsFromDB,
} from '@/services/dataService';
import type { Player } from '@/types/player';
import type { DbMatch, DbMatchStatisticsSummary } from '@/types/database.types';

// Query keys for cache management
export const queryKeys = {
    players: ['players'] as const,
    player: (id: string) => ['player', id] as const,
    matches: ['matches'] as const,
    matchStatistics: ['matchStatistics'] as const,
    dataSourceStatus: ['dataSourceStatus'] as const,
};

// ============================================
// PLAYER HOOKS
// ============================================

/**
 * Fetch all players with their stats from Supabase
 */
export function usePlayers() {
    return useQuery<Player[], Error>({
        queryKey: queryKeys.players,
        queryFn: getPlayersWithStats,
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 30 * 60 * 1000, // 30 minutes (formerly cacheTime)
        retry: 1,
    });
}

/**
 * Fetch a single player by ID
 */
export function usePlayer(playerId: string | undefined) {
    return useQuery<Player | null, Error>({
        queryKey: queryKeys.player(playerId || ''),
        queryFn: () => playerId ? getPlayerById(playerId) : Promise.resolve(null),
        enabled: !!playerId,
        staleTime: 5 * 60 * 1000,
        gcTime: 30 * 60 * 1000,
        retry: 1,
    });
}

// ============================================
// MATCH HOOKS
// ============================================

/**
 * Fetch all matches from database
 */
export function useMatches() {
    return useQuery<DbMatch[] | null, Error>({
        queryKey: queryKeys.matches,
        queryFn: fetchMatchesFromDB,
        staleTime: 5 * 60 * 1000,
        gcTime: 30 * 60 * 1000,
        retry: 1,
    });
}

/**
 * Fetch match statistics
 */
export function useMatchStatistics() {
    return useQuery<DbMatchStatisticsSummary[] | null, Error>({
        queryKey: queryKeys.matchStatistics,
        queryFn: fetchMatchStatisticsFromDB,
        staleTime: 5 * 60 * 1000,
        gcTime: 30 * 60 * 1000,
        retry: 1,
    });
}

// ============================================
// DATA SOURCE STATUS
// ============================================

/**
 * Get current data source status
 */
export function useDataSourceStatus() {
    const status = getDataSourceStatus();
    return {
        isSupabaseConfigured: status.supabaseConfigured,
    };
}

// ============================================
// PREFETCHING
// ============================================

/**
 * Prefetch players data (useful for route preloading)
 */
export function usePrefetchPlayers() {
    const queryClient = useQueryClient();

    return () => {
        queryClient.prefetchQuery({
            queryKey: queryKeys.players,
            queryFn: getPlayersWithStats,
        });
    };
}

/**
 * Prefetch a specific player
 */
export function usePrefetchPlayer() {
    const queryClient = useQueryClient();

    return (playerId: string) => {
        queryClient.prefetchQuery({
            queryKey: queryKeys.player(playerId),
            queryFn: () => getPlayerById(playerId),
        });
    };
}

// ============================================
// CACHE INVALIDATION
// ============================================

/**
 * Invalidate all player data (call after mutations)
 */
export function useInvalidatePlayers() {
    const queryClient = useQueryClient();

    return () => {
        queryClient.invalidateQueries({ queryKey: ['players'] });
    };
}

/**
 * Invalidate all data (call after major changes)
 */
export function useInvalidateAll() {
    const queryClient = useQueryClient();

    return () => {
        queryClient.invalidateQueries();
    };
}
