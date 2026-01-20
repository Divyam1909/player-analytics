# Database Requirements for Player Analytics

This document outlines all tables and columns required to make the player analytics website fully functional with backend data.

> [!IMPORTANT]
> **Note**: Missing data displays as "--" in the UI. This is intentional - 0 is reserved for actual zero values.

---

## Current Tables (Available in Supabase)

### `players`
| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `team_id` | UUID | Foreign key to teams |
| `first_name` | VARCHAR | Player's first name |
| `last_name` | VARCHAR | Player's last name |
| `jersey_number` | INTEGER | Jersey number |
| `position` | VARCHAR | Playing position (GK, CB, RB, LB, CM, CDM, CAM, RW, LW, ST, CF, etc.) |
| `date_of_birth` | DATE | Player's date of birth |
| `nationality` | VARCHAR | Player's nationality |

### `teams`
| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `team_name` | VARCHAR | Team name |
| `team_email` | VARCHAR | Team contact email |
| `head_coach_name` | VARCHAR | Head coach name |
| `logo_url` | VARCHAR | Team logo URL |

### `matches`
| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `match_date` | DATE | Date of the match |
| `competition_name` | VARCHAR | Tournament/competition name |
| `home_team_id` | UUID | Foreign key to teams |
| `away_team_id` | UUID | Foreign key to teams |
| `our_team_id` | UUID | Which team is "ours" |
| `home_score` | INTEGER | Home team score |
| `away_score` | INTEGER | Away team score |

### `pass_events`
| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `match_id` | UUID | Foreign key to matches |
| `player_id` | UUID | Foreign key to players |
| `is_assist` | BOOLEAN | Whether pass resulted in assist |
| `is_successful` | BOOLEAN | Whether pass was successful |
| `is_key_pass` | BOOLEAN | Whether it was a key pass |
| `is_cross` | BOOLEAN | Whether it was a cross |
| `is_progressive_pass` | BOOLEAN | Whether it was a progressive pass |
| `start_x`, `start_y` | FLOAT | Starting coordinates |
| `end_x`, `end_y` | FLOAT | Ending coordinates |
| `minute` | INTEGER | Minute of the event |

### `shots_on_target`
| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `match_id` | UUID | Foreign key to matches |
| `player_id` | UUID | Foreign key to players |
| `is_goal` | BOOLEAN | Whether shot resulted in goal |
| `shot_x`, `shot_y` | FLOAT | Shot coordinates |
| `minute` | INTEGER | Minute of the event |

### `duels`
| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `match_id` | UUID | Foreign key to matches |
| `player_id` | UUID | Foreign key to players |
| `duel_type` | VARCHAR | Type of duel (aerial, dribble) |
| `is_successful` | BOOLEAN | Whether duel was won |

### `match_statistics`
The `match_statistics` table EXISTS with all required columns, but **most columns are NULL** (not populated with data).

| Column Group | Columns (all nullable) | Status |
|--------------|------------------------|--------|
| **Basic Stats** | `team_possession`, `team_passes`, `team_shots_on_target`, `team_corners`, `team_offsides`, `team_fouls`, `team_saves`, `team_freekicks` + opponent versions | ✅ Schema exists, ⚠️ **Data may be NULL** |
| **Advanced Stats** | `team_clearances`, `team_interceptions`, `team_successful_dribbles`, `team_chances_created`, `team_chances_final_third`, `team_aerial_duels_won` + opponent versions | ✅ Schema exists, ⚠️ **Data may be NULL** |
| **Performance Indices** | `home_possession_control_index`, `home_chance_creation_index`, `home_shooting_efficiency`, `home_defensive_solidity`, `home_transition_progression`, `home_recovery_pressing_efficiency` + away versions | ✅ Schema exists, ⚠️ **Data is NULL** (shows as "--") |
| **Ball Recoveries** | `home_ball_recoveries`, `away_ball_recoveries` | ✅ Schema exists, ⚠️ **Data may be NULL** |
| **Conversion Rate** | `team_conversion_rate`, `opponent_conversion_rate`, `home_conversion_rate`, `away_conversion_rate` | ✅ Schema exists, ⚠️ **Data may be NULL** |

---

## Missing Tables (Required for Full Functionality)

### `player_attributes` ⚠️ NEW TABLE REQUIRED
| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `player_id` | UUID | Foreign key to players |
| `passing` | INTEGER | Passing skill rating (0-100) |
| `shooting` | INTEGER | Shooting skill rating (0-100) |
| `dribbling` | INTEGER | Dribbling skill rating (0-100) |
| `defending` | INTEGER | Defending skill rating (0-100) |
| `physical` | INTEGER | Physical skill rating (0-100) |
| `overall_rating` | INTEGER | Overall player rating (0-100) |
| `updated_at` | TIMESTAMP | Last update timestamp |

### `defensive_events` ⚠️ NEW TABLE REQUIRED
| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `match_id` | UUID | Foreign key to matches |
| `player_id` | UUID | Foreign key to players |
| `event_type` | VARCHAR | Type: 'block', 'interception', 'clearance', 'recovery', 'tackle' |
| `minute` | INTEGER | Minute of the event |
| `x`, `y` | FLOAT | Coordinates |
| `is_successful` | BOOLEAN | Whether action was successful |

### `physical_stats` ⚠️ NEW TABLE REQUIRED
| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `match_id` | UUID | Foreign key to matches |
| `player_id` | UUID | Foreign key to players |
| `distance_covered` | FLOAT | Distance covered in km |
| `sprints` | INTEGER | Number of sprints |
| `minutes_played` | INTEGER | Minutes played in match |

---

## What's Showing as "--" on the Website

| Section | Stats Showing "--" | Reason |
|---------|-------------------|--------|
| **Performance Overview (Hexagon Radar)** | PCI, CCI, SE, DS, T&P, RPE | `match_statistics` index columns are NULL |
| **Key Performance Indices Cards** | All 6 indices | Same as above |
| **Player Radar Charts** | Passing, Shooting, Dribbling, Defending, Physical | `player_attributes` table doesn't exist |
| **Player Stats - Defensive** | Blocks, Interceptions, Clearances, Tackles, Recoveries | `defensive_events` table doesn't exist |
| **Player Stats - Physical** | Distance Covered, Sprints | `physical_stats` table doesn't exist |

---

## To Populate Missing Data

### Option 1: Add Data to Existing `match_statistics` Table
Populate the index columns for each match:
```sql
UPDATE match_statistics 
SET 
    home_possession_control_index = 75,
    home_chance_creation_index = 68,
    home_shooting_efficiency = 45,
    home_defensive_solidity = 82,
    home_transition_progression = 60,
    home_recovery_pressing_efficiency = 70,
    away_possession_control_index = 65,
    away_chance_creation_index = 60,
    away_shooting_efficiency = 40,
    away_defensive_solidity = 75,
    away_transition_progression = 55,
    away_recovery_pressing_efficiency = 65
WHERE match_id = 'your-match-uuid';
```

### Option 2: Create New Tables
```sql
-- Player Attributes Table
CREATE TABLE player_attributes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    player_id UUID REFERENCES players(id) ON DELETE CASCADE,
    passing INTEGER CHECK (passing >= 0 AND passing <= 100),
    shooting INTEGER CHECK (shooting >= 0 AND shooting <= 100),
    dribbling INTEGER CHECK (dribbling >= 0 AND dribbling <= 100),
    defending INTEGER CHECK (defending >= 0 AND defending <= 100),
    physical INTEGER CHECK (physical >= 0 AND physical <= 100),
    overall_rating INTEGER CHECK (overall_rating >= 0 AND overall_rating <= 100),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(player_id)
);
CREATE INDEX idx_player_attributes_player_id ON player_attributes(player_id);

-- Defensive Events Table
CREATE TABLE defensive_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    match_id UUID REFERENCES matches(id) ON DELETE CASCADE,
    player_id UUID REFERENCES players(id) ON DELETE CASCADE,
    event_type VARCHAR(50) NOT NULL CHECK (event_type IN ('block', 'interception', 'clearance', 'recovery', 'tackle')),
    minute INTEGER,
    x FLOAT,
    y FLOAT,
    is_successful BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_defensive_events_match_id ON defensive_events(match_id);
CREATE INDEX idx_defensive_events_player_id ON defensive_events(player_id);

-- Physical Stats Table
CREATE TABLE physical_stats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    match_id UUID REFERENCES matches(id) ON DELETE CASCADE,
    player_id UUID REFERENCES players(id) ON DELETE CASCADE,
    distance_covered FLOAT,
    sprints INTEGER,
    minutes_played INTEGER DEFAULT 90,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(match_id, player_id)
);
CREATE INDEX idx_physical_stats_match_id ON physical_stats(match_id);
CREATE INDEX idx_physical_stats_player_id ON physical_stats(player_id);
```

---

## Summary

| Category | Status | Action Needed |
|----------|--------|---------------|
| **Basic CRUD tables** (players, teams, matches) | ✅ Complete | None |
| **Event tables** (pass_events, shots_on_target, duels) | ✅ Complete | None |
| **Match statistics structure** | ✅ Complete | **Populate NULL columns with data** |
| **Player attributes** | ❌ Missing | Create table + seed data |
| **Defensive events** | ❌ Missing | Create table + seed data |
| **Physical stats** | ❌ Missing | Create table + seed data |
