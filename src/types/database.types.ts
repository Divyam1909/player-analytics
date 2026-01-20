/**
 * Database Types - Generated from Supabase SQL Schema
 * These types match the tables in your Supabase database
 */

export interface Database {
    public: {
        Tables: {
            players: {
                Row: {
                    id: string;
                    team_id: string;
                    first_name: string;
                    last_name: string | null;
                    jersey_number: number | null;
                    position: PlayerPosition | null;
                    date_of_birth: string | null;
                    nationality: string | null;
                    created_at: string | null;
                    updated_at: string | null;
                };
                Insert: Omit<Database['public']['Tables']['players']['Row'], 'id' | 'created_at' | 'updated_at'>;
                Update: Partial<Database['public']['Tables']['players']['Insert']>;
            };
            teams: {
                Row: {
                    id: string;
                    team_name: string;
                    team_email: string | null;
                    user_id: string | null;
                    head_coach_name: string | null;
                    logo_url: string | null;
                    has_free_access: boolean;
                    is_onboarded: boolean;
                    metadata: Record<string, unknown>;
                    created_at: string;
                    updated_at: string;
                };
                Insert: Omit<Database['public']['Tables']['teams']['Row'], 'id' | 'created_at' | 'updated_at'>;
                Update: Partial<Database['public']['Tables']['teams']['Insert']>;
            };
            matches: {
                Row: {
                    id: string;
                    team_id_deprecated: string;
                    is_home_team_deprecated: boolean;
                    opponent_name_deprecated: string;
                    team_score: number;
                    opponent_score: number;
                    competition_name: string;
                    match_date: string;
                    video_url: string | null;
                    created_at: string | null;
                    updated_at: string | null;
                    created_by: string;
                    home_team_id: string;
                    away_team_id: string;
                    our_team_id: string;
                    league_id: string | null;
                    home_score: number;
                    away_score: number;
                    home_jersey_color: string | null;
                    away_jersey_color: string | null;
                };
                Insert: Omit<Database['public']['Tables']['matches']['Row'], 'id' | 'created_at' | 'updated_at'>;
                Update: Partial<Database['public']['Tables']['matches']['Insert']>;
            };
            match_statistics: {
                Row: {
                    id: string;
                    match_id: string;
                    team_possession: number | null;
                    opponent_possession: number | null;
                    team_passes: number | null;
                    opponent_passes: number | null;
                    team_shots_on_target: number | null;
                    opponent_shots_on_target: number | null;
                    team_corners: number | null;
                    opponent_corners: number | null;
                    team_offsides: number | null;
                    opponent_offsides: number | null;
                    team_aerial_duels_won: number | null;
                    opponent_aerial_duels_won: number | null;
                    team_fouls: number | null;
                    opponent_fouls: number | null;
                    team_chances_created: number | null;
                    opponent_chances_created: number | null;
                    team_saves: number | null;
                    opponent_saves: number | null;
                    team_chances_final_third: number | null;
                    opponent_chances_final_third: number | null;
                    team_performance: number | null;
                    opponent_performance: number | null;
                    team_clearances: number | null;
                    opponent_clearances: number | null;
                    team_interceptions: number | null;
                    opponent_interceptions: number | null;
                    team_successful_dribbles: number | null;
                    opponent_successful_dribbles: number | null;
                    team_conversion_rate: number | null;
                    opponent_conversion_rate: number | null;
                    team_freekicks: number | null;
                    opponent_freekicks: number | null;
                    home_possession: number | null;
                    away_possession: number | null;
                    home_passes: number | null;
                    away_passes: number | null;
                    home_shots_on_target: number | null;
                    away_shots_on_target: number | null;
                    home_corners: number | null;
                    away_corners: number | null;
                    home_offsides: number | null;
                    away_offsides: number | null;
                    home_chances_created: number | null;
                    away_chances_created: number | null;
                    home_chances_final_third: number | null;
                    away_chances_final_third: number | null;
                    home_clearances: number | null;
                    away_clearances: number | null;
                    home_interceptions: number | null;
                    away_interceptions: number | null;
                    home_successful_dribbles: number | null;
                    away_successful_dribbles: number | null;
                    home_conversion_rate: number | null;
                    away_conversion_rate: number | null;
                    home_ball_recoveries: number | null;
                    away_ball_recoveries: number | null;
                    home_aerial_duels_won: number | null;
                    away_aerial_duels_won: number | null;
                    home_fouls: number | null;
                    away_fouls: number | null;
                    home_saves: number | null;
                    away_saves: number | null;
                    home_freekicks: number | null;
                    away_freekicks: number | null;
                    home_possession_control_index: number | null;
                    away_possession_control_index: number | null;
                    home_chance_creation_index: number | null;
                    away_chance_creation_index: number | null;
                    home_shooting_efficiency: number | null;
                    away_shooting_efficiency: number | null;
                    home_defensive_solidity: number | null;
                    away_defensive_solidity: number | null;
                    home_transition_progression: number | null;
                    away_transition_progression: number | null;
                    home_recovery_pressing_efficiency: number | null;
                    away_recovery_pressing_efficiency: number | null;
                    home_performance: number | null;
                    away_performance: number | null;
                    created_at: string | null;
                    updated_at: string | null;
                };
                Insert: Omit<Database['public']['Tables']['match_statistics']['Row'], 'id' | 'created_at' | 'updated_at'>;
                Update: Partial<Database['public']['Tables']['match_statistics']['Insert']>;
            };
            pass_events: {
                Row: {
                    id: string;
                    match_id: string;
                    team_id: string;
                    player_id: string;
                    minute: number | null;
                    second: number | null;
                    start_x: number | null;
                    start_y: number | null;
                    end_x: number | null;
                    end_y: number | null;
                    is_successful: boolean;
                    is_key_pass: boolean | null;
                    is_progressive_pass: boolean | null;
                    failure_reason: 'block' | 'offside' | 'interception' | null;
                    is_assist: boolean | null;
                    assist_pass_type: 'normal' | 'key' | 'progressive' | null;
                    is_cross: boolean | null;
                    cross_pass_type: 'normal' | 'key' | 'progressive' | null;
                    created_at: string | null;
                };
                Insert: Omit<Database['public']['Tables']['pass_events']['Row'], 'id' | 'created_at'>;
                Update: Partial<Database['public']['Tables']['pass_events']['Insert']>;
            };
            shots_on_target: {
                Row: {
                    id: string;
                    match_id: string;
                    team_id: string;
                    player_id: string;
                    minute: number | null;
                    second: number | null;
                    shot_x: number | null;
                    shot_y: number | null;
                    is_goal: boolean;
                    is_penalty: boolean | null;
                    created_at: string | null;
                };
                Insert: Omit<Database['public']['Tables']['shots_on_target']['Row'], 'id' | 'created_at'>;
                Update: Partial<Database['public']['Tables']['shots_on_target']['Insert']>;
            };
            duels: {
                Row: {
                    id: string;
                    match_id: string;
                    team_id: string;
                    player_id: string;
                    minute: number | null;
                    second: number | null;
                    duel_x: number | null;
                    duel_y: number | null;
                    duel_type: 'aerial' | 'dribble';
                    is_successful: boolean;
                    created_at: string | null;
                };
                Insert: Omit<Database['public']['Tables']['duels']['Row'], 'id' | 'created_at'>;
                Update: Partial<Database['public']['Tables']['duels']['Insert']>;
            };
            keeper_actions: {
                Row: {
                    id: string;
                    match_id: string;
                    team_id: string;
                    player_id: string;
                    minute: number | null;
                    second: number | null;
                    action_x: number | null;
                    action_y: number | null;
                    action_type: 'save' | 'collection';
                    save_location: 'inside_box' | 'outside_box' | null;
                    created_at: string | null;
                };
                Insert: Omit<Database['public']['Tables']['keeper_actions']['Row'], 'id' | 'created_at'>;
                Update: Partial<Database['public']['Tables']['keeper_actions']['Insert']>;
            };
            final_third_chances: {
                Row: {
                    id: string;
                    match_id: string;
                    team_id: string;
                    player_id: string;
                    minute: number | null;
                    second: number | null;
                    chance_x: number | null;
                    chance_y: number | null;
                    is_corner: boolean;
                    corner_type: 'short' | 'long' | null;
                    long_corner_success: boolean | null;
                    is_in_box: boolean | null;
                    created_at: string | null;
                };
                Insert: Omit<Database['public']['Tables']['final_third_chances']['Row'], 'id' | 'created_at'>;
                Update: Partial<Database['public']['Tables']['final_third_chances']['Insert']>;
            };
            leagues: {
                Row: {
                    id: string;
                    league_name: string;
                    tier: number | null;
                    custom_label: string | null;
                    is_default: boolean;
                    country: string | null;
                    state: string | null;
                    district: string | null;
                    league_type: string | null;
                    created_at: string;
                    updated_at: string;
                };
                Insert: Omit<Database['public']['Tables']['leagues']['Row'], 'id' | 'created_at' | 'updated_at'>;
                Update: Partial<Database['public']['Tables']['leagues']['Insert']>;
            };
            match_highlights: {
                Row: {
                    id: string;
                    match_id: string;
                    timestamp: string;
                    highlight_type: HighlightType;
                    description: string;
                    created_at: string | null;
                };
                Insert: Omit<Database['public']['Tables']['match_highlights']['Row'], 'id' | 'created_at'>;
                Update: Partial<Database['public']['Tables']['match_highlights']['Insert']>;
            };
        };
    };
}

// Enums
export type PlayerPosition =
    | 'GK' | 'CB' | 'RB' | 'LB' | 'RWB' | 'LWB'
    | 'CM' | 'CDM' | 'CAM' | 'RW' | 'LW' | 'ST' | 'CF';

export type HighlightType =
    | 'goal' | 'assist' | 'shot_on_target' | 'save' | 'penalty'
    | 'yellow_card' | 'red_card' | 'offside' | 'corner' | 'free_kick'
    | 'substitution' | 'chances_created' | 'cross' | 'other';

// Convenience type aliases
export type DbPlayer = Database['public']['Tables']['players']['Row'];
export type DbTeam = Database['public']['Tables']['teams']['Row'];
export type DbMatch = Database['public']['Tables']['matches']['Row'];
export type DbMatchStatistics = Database['public']['Tables']['match_statistics']['Row'];
export type DbPassEvent = Database['public']['Tables']['pass_events']['Row'];
export type DbShotOnTarget = Database['public']['Tables']['shots_on_target']['Row'];
export type DbDuel = Database['public']['Tables']['duels']['Row'];
export type DbKeeperAction = Database['public']['Tables']['keeper_actions']['Row'];
export type DbFinalThirdChance = Database['public']['Tables']['final_third_chances']['Row'];
export type DbLeague = Database['public']['Tables']['leagues']['Row'];
export type DbMatchHighlight = Database['public']['Tables']['match_highlights']['Row'];
