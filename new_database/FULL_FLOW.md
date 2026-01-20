# Complete Database Flow & Structure

This document contains comprehensive Mermaid diagrams visualizing the entire database architecture, relationships, and data flows.

---

## 1. Entity Relationship Diagram (Complete Schema)

```mermaid
erDiagram
    leagues ||--o{ team_leagues : "contains"
    teams ||--o{ team_leagues : "participates"
    teams ||--o{ players : "has"
    teams ||--o{ matches : "home_team"
    teams ||--o{ matches : "away_team"
    teams ||--o{ matches : "our_team"
    teams ||--o{ users : "employs"
    
    players ||--o{ player_attributes : "has"
    players ||--o{ pass_events : "passes"
    players ||--o{ pass_events : "receives"
    players ||--o{ pass_events : "defends"
    players ||--o{ shots_on_target : "shoots"
    players ||--o{ keeper_actions : "performs"
    players ||--o{ duels : "challenges"
    players ||--o{ duels : "opposes"
    players ||--o{ fouls : "commits"
    players ||--o{ fouls : "fouled"
    players ||--o{ set_pieces : "first_contact"
    players ||--o{ set_pieces : "second_contact"
    players ||--o{ users : "linked_to"
    
    matches ||--o{ pass_events : "contains"
    matches ||--o{ shots_on_target : "contains"
    matches ||--o{ keeper_actions : "contains"
    matches ||--o{ duels : "contains"
    matches ||--o{ fouls : "contains"
    matches ||--o{ set_pieces : "contains"
    matches ||--o{ final_third_chances : "contains"
    matches ||--o{ match_possession : "tracks"
    matches ||--o{ match_performance : "tracks"
    matches ||--o{ match_highlights : "contains"
    
    fouls ||--o{ set_pieces : "results_in"
    keeper_actions ||--o{ shots_on_target : "saves"
    pass_events ||--o{ final_third_chances : "creates"
    
    leagues {
        uuid id PK
        text league_name
        int tier
        text country
        text league_type
    }
    
    teams {
        uuid id PK
        text team_name
        text head_coach_name
        text logo_url
        bool has_free_access
    }
    
    team_leagues {
        uuid id PK
        uuid team_id FK
        uuid league_id FK
        bool is_primary
    }
    
    players {
        uuid id PK
        uuid team_id FK
        text first_name
        text last_name
        int jersey_number
        text position
        date date_of_birth
    }
    
    player_attributes {
        uuid id PK
        uuid player_id FK
        int passing
        int shooting
        int dribbling
        int defending
        int physical
        int overall_rating
        bool is_manual
    }
    
    matches {
        uuid id PK
        uuid home_team_id FK
        uuid away_team_id FK
        uuid our_team_id FK
        uuid league_id FK
        date match_date
        int home_score
        int away_score
    }
    
    users {
        uuid id PK
        text email
        text password_hash
        text role
        text first_name
        text last_name
        uuid team_id FK
        uuid player_id FK
    }
    
    pass_events {
        uuid id PK
        uuid match_id FK
        uuid player_id FK
        uuid receiver_player_id FK
        uuid defending_player_id FK
        bool is_successful
        bool is_progressive_pass
        bool is_key_pass
        bool is_assist
    }
    
    shots_on_target {
        uuid id PK
        uuid match_id FK
        uuid player_id FK
        uuid keeper_action_id FK
        bool is_goal
        bool is_penalty
        bool is_saved
    }
    
    keeper_actions {
        uuid id PK
        uuid match_id FK
        uuid player_id FK
        text action_type
        text save_location
    }
    
    duels {
        uuid id PK
        uuid match_id FK
        uuid player_id FK
        uuid opponent_player_id FK
        text duel_type
        bool is_successful
        bool is_progressive_carry
    }
    
    fouls {
        uuid id PK
        uuid match_id FK
        uuid fouling_player_id FK
        uuid fouled_player_id FK
        text card_given
        bool resulted_in_freekick
    }
    
    set_pieces {
        uuid id PK
        uuid match_id FK
        uuid foul_id FK
        uuid first_contact_player_id FK
        uuid second_contact_player_id FK
        text set_piece_type
        bool reached_opponent_box
    }
    
    final_third_chances {
        uuid id PK
        uuid match_id FK
        uuid related_pass_event_id FK
        bool is_in_box
        bool is_corner
    }
    
    match_possession {
        uuid id PK
        uuid match_id FK
        int minute
        int our_team_possession
        int opponent_possession
    }
    
    match_performance {
        uuid id PK
        uuid match_id FK
        int minute
        int our_team_rating
        int opponent_rating
    }
    
    match_highlights {
        uuid id PK
        uuid match_id FK
        int minute
        text event_type
        text description
    }
```

---

## 2. Pass Events Flow

```mermaid
flowchart TD
    A[Pass Event] --> B{Successful?}
    
    B -->|Yes| C[Receiver Player ID<br/>same team]
    B -->|No| D[Defending Player ID<br/>opponent team or NULL]
    
    C --> E{Progressive?}
    E -->|Yes| F[Progressive Pass]
    E -->|No| G[Normal Pass]
    
    F --> H{Special Type?}
    G --> H
    
    H -->|Key Pass| I[Key Pass Flag]
    H -->|Assist| J[Assist Flag]
    H -->|Cross| K[Cross Flag]
    H -->|None| L[Standard Pass]
    
    I --> M[Outplays Players Count<br/>Outplays Lines Count]
    J --> M
    K --> M
    L --> M
    
    D --> N{Failure Reason}
    N -->|Block| O[Defender Blocked]
    N -->|Clearance| P[Defender Cleared]
    N -->|Interception| Q[Defender Intercepted]
    N -->|Offside| R[No Defender<br/>Offside]
    
    Q --> S{High Press?}
    S -->|Yes| T[High Press Flag]
    S -->|No| U[Normal Defense]
    
    T --> V{Ball Recovery?}
    U --> V
    V -->|Yes| W[Ball Recovery Flag]
    V -->|No| X[End]
    
    style A fill:#3b82f6
    style C fill:#10b981
    style D fill:#ef4444
```

---

## 3. Shot Events Flow

```mermaid
flowchart TD
    A[Shot on Target] --> B{Is Goal?}
    
    B -->|Yes| C{Penalty?}
    C -->|Yes| D[Goal - Penalty]
    C -->|No| E[Goal - Open Play]
    
    B -->|No| F[Shot Saved]
    F --> G[Link to Keeper Action]
    G --> H[Keeper Action Record]
    H --> I{Save Location}
    I -->|Inside Box| J[Save Inside Box]
    I -->|Outside Box| K[Save Outside Box]
    
    style A fill:#3b82f6
    style D fill:#10b981
    style E fill:#10b981
    style F fill:#f59e0b
```

---

## 4. Duel Events Flow

```mermaid
flowchart TD
    A[Duel] --> B{Duel Type}
    
    B -->|Aerial| C[Aerial Duel]
    B -->|Dribble| D[Dribble Attempt]
    
    C --> E{Successful?}
    D --> F{Successful?}
    
    E -->|Yes| G[Aerial Won<br/>Opponent Player ID]
    E -->|No| H[Aerial Lost<br/>Opponent Player ID]
    
    F -->|Yes| I[Dribble Successful]
    F -->|No| J[Dribble Failed<br/>Opponent Player ID]
    
    I --> K{Progressive Carry?}
    K -->|Yes| L{Location}
    K -->|No| M[Standard Dribble]
    
    L -->|Inside Box| N[Progressive Carry<br/>Inside Box<br/>Players Outplayed Count]
    L -->|Outside Box| O[Progressive Carry<br/>Outside Box<br/>Players Outplayed Count]
    
    style A fill:#3b82f6
    style G fill:#10b981
    style I fill:#10b981
```

---

## 5. Foul & Set Piece Flow

```mermaid
flowchart TD
    A[Foul Committed] --> B[Fouling Player ID<br/>Fouled Player ID]
    B --> C{Card Given?}
    
    C -->|Yellow| D[Yellow Card]
    C -->|Red| E[Red Card]
    C -->|None| F[No Card]
    
    D --> G{Results in Freekick?}
    E --> G
    F --> G
    
    G -->|Yes| H[Freekick Flag]
    G -->|No| I[End]
    
    H --> J[Set Piece: Free Kick]
    J --> K[Link to Foul ID]
    K --> L[First Contact Player]
    L --> M{Second Contact?}
    
    M -->|Yes| N[Second Contact Player]
    M -->|No| O[No Second Contact]
    
    N --> P{Reached Opponent Box?}
    O --> P
    P -->|Yes| Q[Success Flag]
    P -->|No| R[Cleared]
    
    S[Corner Kick] --> T[Corner Side<br/>Left/Right]
    T --> L
    
    U[Goal Kick] --> L
    
    style A fill:#ef4444
    style D fill:#fbbf24
    style E fill:#dc2626
```

---

## 6. Data Processing Flow (Events → Statistics)

```mermaid
flowchart LR
    A[Pass Events] --> E[Materialized View:<br/>match_statistics_summary]
    B[Shots] --> E
    C[Duels] --> E
    D[Keeper Actions] --> E
    F[Fouls] --> E
    G[Set Pieces] --> E
    H[Final Third] --> E
    
    A --> I[Materialized View:<br/>player_match_statistics]
    B --> I
    C --> I
    D --> I
    F --> I
    
    I --> J[Calculate Player<br/>Attributes Functions]
    
    J --> K{Attribute Calculations}
    K --> L[Passing Rating<br/>completion + progressive + key]
    K --> M[Shooting Rating<br/>conversion + goals]
    K --> N[Dribbling Rating<br/>success rate + carries]
    K --> O[Defending Rating<br/>tackles + aerials]
    K --> P[Physical Rating<br/>duel success]
    
    L --> Q[Position-Weighted<br/>Overall Rating]
    M --> Q
    N --> Q
    O --> Q
    P --> Q
    
    Q --> R[Player Attributes Table]
    
    style E fill:#8b5cf6
    style I fill:#8b5cf6
    style R fill:#10b981
```

---

## 7. User Authentication Flow

```mermaid
flowchart TD
    A[Login Request] --> B[Users Table Lookup]
    B --> C{User Found?}
    
    C -->|No| D[Login Failed]
    C -->|Yes| E[Verify Password Hash<br/>bcrypt]
    
    E --> F{Password Valid?}
    F -->|No| D
    F -->|Yes| G{Role Check}
    
    G -->|Admin| H[Admin Dashboard]
    G -->|Coach| I[Load Team Data]
    G -->|Player| J[Load Player Data]
    
    I --> K[Team ID → Teams Table]
    K --> L[Coach Dashboard<br/>Full Team Access]
    
    J --> M[Player ID → Players Table]
    M --> N[Player Stats View<br/>Limited Access]
    
    style A fill:#3b82f6
    style H fill:#10b981
    style L fill:#10b981
    style N fill:#10b981
    style D fill:#ef4444
```

---

## 8. Complete System Architecture

```mermaid
graph TB
    subgraph "Data Input Layer"
        A1[Match Events]
        A2[Manual Overrides]
    end
    
    subgraph "Storage Layer - Core Tables"
        B1[Leagues]
        B2[Teams]
        B3[Players]
        B4[Matches]
        B5[Users]
    end
    
    subgraph "Storage Layer - Event Tables"
        C1[Pass Events]
        C2[Shots]
        C3[Keeper Actions]
        C4[Duels]
        C5[Fouls]
        C6[Set Pieces]
        C7[Final Third]
    end
    
    subgraph "Storage Layer - Supporting"
        D1[Possession]
        D2[Performance]
        D3[Highlights]
    end
    
    subgraph "Processing Layer"
        E1[Materialized Views<br/>Match Statistics]
        E2[Materialized Views<br/>Player Statistics]
        E3[Calculation Functions<br/>Player Attributes]
    end
    
    subgraph "Output Layer"
        F1[Player Attributes<br/>0-100 Ratings]
        F2[Match Summaries]
        F3[Player Profiles]
    end
    
    subgraph "Application Layer"
        G1[Admin Dashboard]
        G2[Coach Dashboard]
        G3[Player View]
    end
    
    A1 --> C1 & C2 & C3 & C4 & C5 & C6 & C7
    A1 --> D1 & D2 & D3
    A2 --> F1
    
    B1 & B2 --> B4
    B2 --> B3
    B3 --> C1 & C2 & C3 & C4 & C5 & C6
    B4 --> C1 & C2 & C3 & C4 & C5 & C6 & C7
    B4 --> D1 & D2 & D3
    
    C1 & C2 & C3 & C4 & C5 & C6 & C7 --> E1
    C1 & C2 & C3 & C4 & C5 --> E2
    
    E2 --> E3
    E3 --> F1
    E1 --> F2
    E2 --> F3
    
    B5 --> G1 & G2 & G3
    F1 & F2 & F3 --> G1 & G2 & G3
    
    style E1 fill:#8b5cf6
    style E2 fill:#8b5cf6
    style E3 fill:#6366f1
    style F1 fill:#10b981
```

---

## 9. Position-Based Rating Weights

```mermaid
graph TD
    A[Player] --> B{Position}
    
    B -->|GK| C["Defending 40%<br/>Physical 40%<br/>Passing 20%"]
    B -->|CB/RB/LB/RWB/LWB| D["Defending 40%<br/>Physical 25%<br/>Passing 25%<br/>Dribbling 10%"]
    B -->|CDM| E["Defending 30%<br/>Passing 30%<br/>Physical 25%<br/>Dribbling 15%"]
    B -->|CM| F["Passing 35%<br/>Dribbling 25%<br/>Defending 20%<br/>Physical 20%"]
    B -->|CAM| G["Passing 35%<br/>Shooting 25%<br/>Dribbling 25%<br/>Defending 15%"]
    B -->|RW/LW| H["Dribbling 35%<br/>Shooting 30%<br/>Passing 25%<br/>Physical 10%"]
    B -->|ST/CF| I["Shooting 40%<br/>Dribbling 25%<br/>Physical 20%<br/>Passing 15%"]
    
    C --> J[Overall Rating<br/>0-100]
    D --> J
    E --> J
    F --> J
    G --> J
    H --> J
    I --> J
    
    style J fill:#10b981
```

---

## Summary

This database uses an **event-driven architecture** where:

1. **Individual events** (passes, shots, duels, fouls) are stored with complete context
2. **Materialized views** aggregate events into match and player statistics
3. **Calculation functions** derive player skill ratings from performance
4. **Position-aware algorithms** ensure realistic player ratings
5. **User authentication** enables role-based access (admin/coach/player)

**Key Benefits:**
- ✅ Infinitely scalable - add new stats by querying existing events
- ✅ No schema changes needed for new metrics
- ✅ 10-20x faster queries with materialized views
- ✅ Auto-calculated player ratings
- ✅ Complete audit trail of all match events
