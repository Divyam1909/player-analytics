# New Database - Complete Reference

## 📁 Quick Start

```bash
# Complete Fresh Setup (run in order)
\i new_database/database-drop-all.sql              # 1. Clean slate
\i new_database/database-schema-part1.sql          # 2. Core tables
\i new_database/database-schema-part2.sql          # 3. Events & supporting
\i new_database/database-schema-part3.sql          # 4. Materialized views
\i new_database/database-schema-users.sql          # 5. Users/auth
\i new_database/seed/master-seed.sql               # 6. All seed data
\i new_database/extras/refresh-views.sql           # 7. Refresh views
\i new_database/extras/calculate-player-attributes.sql  # 8. Calculate attributes
```

**Result**: 2 leagues, 6 teams, 120 players, 4 matches, 7 users, all views refreshed

## 🗂️ Folder Structure

```
new_database/
├── database-drop-all.sql              # Drop all tables
├── database-schema-part1.sql          # Core tables + events
├── database-schema-part2.sql          # Extended events
├── database-schema-part3.sql          # Materialized views
├── database-schema-users.sql          # Authentication
├── seed/
│   ├── master-seed.sql               # Master loader (runs all)
│   ├── 1-core-data.sql               # Leagues, teams, 25 players
│   ├── 2-players.sql                 # 95 more players
│   ├── 3-matches-and-events.sql      # 4 matches + events
│   ├── 4-supporting-data.sql         # Possession, performance
│   └── 5-users.sql                   # 7 user accounts
├── extras/
│   ├── refresh-views.sql             # Refresh materialized views
│   ├── calculate-player-attributes.sql  # Run attribute calculation
│   └── database-player-attributes-calculation.sql  # Functions
├── DATABASE.md                        # Complete database reference
└── README.md                          # This file
```

## 📊 What's Included

### Seed Data Summary
- **2 Leagues**: Premier Youth League, National Football Championship
- **6 Teams**: Thunder FC, Lightning United, Phoenix Athletic, Dragon Warriors, Eagle Rangers, Falcon Stars
- **120 Players**: Full rosters with realistic names, positions, nationalities
- **4 Matches**: With detailed event data for Match 1
- **7 Users**: 1 admin, 1 coach, 5 players (all password: `password123`)

### Test Login Credentials
```
Admin:   admin@postmatch.org / password123
Coach:   coach@thunderfc.org / password123  (Thunder FC)
Player1: player1@thunderfc.org / password123  (Oliver Smith, GK #1)
Player2: player2@thunderfc.org / password123  (Harry Johnson, RB #2)
Player3: player3@thunderfc.org / password123  (Lucas Lopez, CAM #10)
Player4: player4@thunderfc.org / password123  (Samuel Diaz, ST #9)
Player5: player5@thunderfc.org / password123  (Henry Gomez, RW #7)
```

## 🔍 Verification

```sql
-- Quick check all tables
SELECT 'Leagues' as table, COUNT(*) FROM leagues
UNION ALL SELECT 'Teams', COUNT(*) FROM teams
UNION ALL SELECT 'Players', COUNT(*) FROM players
UNION ALL SELECT 'Matches', COUNT(*) FROM matches
UNION ALL SELECT 'Users', COUNT(*) FROM users;
-- Expected: 2, 6, 120, 4, 7

-- Verify views
SELECT COUNT(*) FROM match_statistics_summary;      -- Should be 4
SELECT COUNT(*) FROM player_match_statistics;       -- Should be ~20-30
SELECT COUNT(*) FROM player_attributes;             -- Should be 120
```

## 📖 Documentation

See **[DATABASE.md](file:///c:/Users/divya/Desktop/player-analytics/new_database/DATABASE.md)** for:
- Complete schema documentation
- Table structures and relationships
- Event-driven architecture details
- Materialized views explanation
- Player attributes system
- Design decisions and philosophy

## 🚀 Next Steps

After database setup is complete:
1. Update TypeScript types to match new schema
2. Refactor `AuthContext.tsx` to use Supabase authentication
3. Update `dataService.ts` to fetch player attributes
4. Update login pages with new credentials
5. Test all authentication flows
