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
                    home_team_id: string;
                    away_team_id: string;
                    our_team_id: string;
                    league_id: string | null;
                    competition_name: string;
                    match_date: string;
                    home_score: number;
                    away_score: number;
                    home_jersey_color: string | null;
                    away_jersey_color: string | null;
                    video_url: string | null;
                    created_by: string | null;
                    created_at: string | null;
                    updated_at: string | null;
                };
                Insert: Omit<Database['public']['Tables']['matches']['Row'], 'id' | 'created_at' | 'updated_at'>;
                Update: Partial<Database['public']['Tables']['matches']['Insert']>;
            };
            match_statistics_summary: {
                Row: {
                    match_id: string;
                    home_team_id: string;
                    away_team_id: string;
                    our_team_id: string;
                    team_id: string;
                    opponent_id: string;

                    // Home Stats
                    home_successful_passes: number | null;
                    home_unsuccessful_passes: number | null;
                    home_total_passes: number | null;
                    home_progressive_passes: number | null;
                    home_key_passes: number | null;
                    home_assists: number | null;
                    home_crosses: number | null;
                    home_interceptions: number | null;
                    home_blocks: number | null;
                    home_clearances: number | null;
                    home_ball_recoveries: number | null;
                    home_high_press_recoveries: number | null;
                    home_shots_on_target: number | null;
                    home_goals: number | null;
                    home_penalties: number | null;
                    home_shots_saved: number | null;
                    home_aerial_duels_won: number | null;
                    home_aerial_duels_total: number | null;
                    home_successful_dribbles: number | null;
                    home_total_dribbles: number | null;
                    home_progressive_carries: number | null;
                    home_saves: number | null;
                    home_saves_inside_box: number | null;
                    home_saves_outside_box: number | null;
                    home_goals_conceded: number | null;
                    home_fouls_committed: number | null;
                    home_yellow_cards: number | null;
                    home_red_cards: number | null;
                    home_corners: number | null;
                    home_freekicks: number | null;
                    home_final_third_entries: number | null;
                    home_chances_in_box: number | null;

                    // Away Stats
                    away_successful_passes: number | null;
                    away_unsuccessful_passes: number | null;
                    away_total_passes: number | null;
                    away_progressive_passes: number | null;
                    away_key_passes: number | null;
                    away_assists: number | null;
                    away_crosses: number | null;
                    away_interceptions: number | null;
                    away_blocks: number | null;
                    away_clearances: number | null;
                    away_ball_recoveries: number | null;
                    away_high_press_recoveries: number | null;
                    away_shots_on_target: number | null;
                    away_goals: number | null;
                    away_penalties: number | null;
                    away_shots_saved: number | null;
                    away_aerial_duels_won: number | null;
                    away_aerial_duels_total: number | null;
                    away_successful_dribbles: number | null;
                    away_total_dribbles: number | null;
                    away_progressive_carries: number | null;
                    away_saves: number | null;
                    away_saves_inside_box: number | null;
                    away_saves_outside_box: number | null;
                    away_goals_conceded: number | null;
                    away_fouls_committed: number | null;
                    away_yellow_cards: number | null;
                    away_red_cards: number | null;
                    away_corners: number | null;
                    away_freekicks: number | null;
                    away_final_third_entries: number | null;
                    away_chances_in_box: number | null;
                };
                Insert: never; // Materialized view, generic insert not supported
                Update: never;
            };
            player_match_statistics: {
                Row: {
                    match_id: string;
                    player_id: string;
                    first_name: string;
                    last_name: string | null;
                    position: string | null;
                    team_id: string;

                    // Passing
                    successful_passes: number | null;
                    unsuccessful_passes: number | null;
                    total_passes: number | null;
                    progressive_passes: number | null;
                    key_passes: number | null;
                    assists: number | null;
                    crosses: number | null;
                    total_players_outplayed_passing: number | null;
                    total_lines_outplayed: number | null;
                    long_passes: number | null;
                    short_passes: number | null;

                    // Defensive
                    interceptions: number | null;
                    blocks: number | null;
                    clearances: number | null;
                    ball_recoveries: number | null;
                    high_press_actions: number | null;

                    // Shooting
                    shots_on_target: number | null;
                    goals: number | null;
                    penalties_scored: number | null;
                    shots_off_target: number | null;

                    // Duels
                    aerial_duels_won: number | null;
                    aerial_duels_total: number | null;
                    successful_dribbles: number | null;
                    total_dribbles: number | null;
                    progressive_carries: number | null;
                    total_players_outplayed_dribbling: number | null;

                    // Goalkeeper
                    saves: number | null;
                    saves_inside_box: number | null;
                    saves_outside_box: number | null;
                    goals_conceded: number | null;
                    ball_collections: number | null;

                    // Fouls
                    fouls_committed: number | null;
                    fouls_won: number | null;
                    yellow_cards: number | null;
                    red_cards: number | null;

                    // Set Pieces
                    corners_taken: number | null;
                    freekicks_taken: number | null;

                    // Final Third
                    final_third_touches: number | null;

                    // Physical Stats (new)
                    distance_covered_meters: number | null;
                    sprint_count: number | null;
                    high_intensity_runs: number | null;
                };
                Insert: never;
                Update: never;
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
                    failure_reason: 'block' | 'offside' | 'interception' | 'clearance' | 'ball_collection' | 'unsuccessful_cross' | 'tackle' | null;
                    failure_subtype: 'tackle' | 'unsuccessful_cross' | 'ball_collection' | null;
                    is_assist: boolean | null;
                    assist_pass_type: 'normal' | 'key' | 'progressive' | null;
                    is_cross: boolean | null;
                    cross_pass_type: 'normal' | 'key' | 'progressive' | null;
                    pass_length: 'short' | 'long' | null;
                    video_time_sec: number | null;
                    formatted_time: string | null;
                    ball_recovery_result: 'successful' | 'unsuccessful' | null;
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
                    shot_end_x: number | null;
                    shot_end_y: number | null;
                    is_goal: boolean;
                    is_penalty: boolean | null;
                    is_saved: boolean | null;
                    shot_result: 'goal' | 'saved' | 'off_target' | null;
                    save_location: 'inside_box' | 'outside_box' | null;
                    shot_opponent_id: string | null;
                    video_time_sec: number | null;
                    formatted_time: string | null;
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
                    duel_outcome: 'won' | 'lost' | 'successful' | 'unsuccessful' | null;
                    video_time_sec: number | null;
                    formatted_time: string | null;
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
                    chance_receiver_id: string | null;
                    chance_sub_type: 'corner' | 'normal' | null;
                    chance_side: 'left' | 'right' | 'centre' | null;
                    video_time_sec: number | null;
                    formatted_time: string | null;
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
            player_attributes: {
                Row: {
                    id: string;
                    player_id: string;
                    passing: number | null;
                    shooting: number | null;
                    dribbling: number | null;
                    defending: number | null;
                    physical: number | null;
                    overall_rating: number | null;
                    is_manual: boolean;
                    last_calculated_at: string | null;
                    created_at: string | null;
                    updated_at: string | null;
                };
                Insert: Omit<Database['public']['Tables']['player_attributes']['Row'], 'id' | 'created_at' | 'updated_at'>;
                Update: Partial<Database['public']['Tables']['player_attributes']['Insert']>;
            };
            player_heatmaps: {
                Row: {
                    id: string;
                    match_id: string;
                    player_id: string;
                    heatmap_image_url: string;
                    created_at: string | null;
                    updated_at: string | null;
                };
                Insert: Omit<Database['public']['Tables']['player_heatmaps']['Row'], 'id' | 'created_at' | 'updated_at'>;
                Update: Partial<Database['public']['Tables']['player_heatmaps']['Insert']>;
            };
            physical_stats: {
                Row: {
                    id: string;
                    match_id: string;
                    player_id: string;
                    distance_covered_meters: number | null;
                    sprint_count: number | null;
                    high_intensity_runs: number | null;
                    top_speed_kmh: number | null;
                    average_speed_kmh: number | null;
                    created_at: string | null;
                    updated_at: string | null;
                };
                Insert: Omit<Database['public']['Tables']['physical_stats']['Row'], 'id' | 'created_at' | 'updated_at'>;
                Update: Partial<Database['public']['Tables']['physical_stats']['Insert']>;
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
export type DbMatchStatisticsSummary = Database['public']['Tables']['match_statistics_summary']['Row'];
export type DbPassEvent = Database['public']['Tables']['pass_events']['Row'];
export type DbShotOnTarget = Database['public']['Tables']['shots_on_target']['Row'];
export type DbDuel = Database['public']['Tables']['duels']['Row'];
export type DbKeeperAction = Database['public']['Tables']['keeper_actions']['Row'];
export type DbFinalThirdChance = Database['public']['Tables']['final_third_chances']['Row'];
export type DbLeague = Database['public']['Tables']['leagues']['Row'];
export type DbPlayerMatchStatistics = Database['public']['Tables']['player_match_statistics']['Row'];
export type DbPlayerAttributes = Database['public']['Tables']['player_attributes']['Row'];
export type DbPlayerHeatmap = Database['public']['Tables']['player_heatmaps']['Row'];
export type DbPhysicalStats = Database['public']['Tables']['physical_stats']['Row'];
