# Seed Data - Quick Reference

## Overview

Comprehensive seed data for the player analytics database with:
- 2 leagues
- 6 teams (4 with 25 players, 2 with 10 players)
- 120 total players with realistic positions and nationalities
- 4 matches with detailed event data
- Supporting data (possession, performance, highlights)

---

## 📊 Data Summary

| Category | Count | Details |
|----------|-------|---------|
| **Leagues** | 2 | Premier Youth League, National Football Championship |
| **Teams** | 6 | Thunder FC, Lightning United, Phoenix Athletic, Dragon Warriors, Eagle Rangers, Falcon Stars |
| **Players** | 120 | 4 teams × 25 players + 2 teams × 10 players |
| **Matches** | 4 | 2 per league with realistic scores |
| **Pass Events** | ~20 | Sample events for Match 1 |
| **Shots** | ~14 | Goals and saves across matches |
| **Duels** | ~6 | Aerial and dribble duels |
| **Fouls** | ~3 | With cards and freekicks |
| **Set Pieces** | ~3 | Corners and free kicks |

---

## 🎮 Teams & Players Breakdown

### First 4 Teams (25 players each = 100 players)

**Thunder FC** (aaaaaaaa...)
- GK: 2, Defenders: 8, Midfielders: 10, Forwards: 5
- Coach: Michael Stone
- League: Premier Youth League

**Lightning United** (bbbbbbbb...)
- GK: 2, Defenders: 8, Midfielders: 10, Forwards: 5
- Coach: Sarah Martinez
- League: Premier Youth League

**Phoenix Athletic** (cccccccc...)
- GK: 2, Defenders: 8, Midfielders: 10, Forwards: 5
- Coach: David Chen
- League: National Championship

**Dragon Warriors** (dddddddd...)
- GK: 2, Defenders: 8, Midfielders: 10, Forwards: 5
- Coach: Emma Johnson
- League: National Championship

### Additional 2 Teams (10 players each = 20 players)

**Eagle Rangers** (eeeeeeee...)
- GK: 1, Defenders: 4, Midfielders: 3, Forwards: 2
- Coach: James Wilson
- Leagues: Both (Premier as secondary)

**Falcon Stars** (ffffffff...)
- GK: 1, Defenders: 4, Midfielders: 3, Forwards: 2
- Coach: Lisa Anderson
- Leagues: Both (National as primary)

---

## ⚽ Match Results

| # | Home Team | Away Team | Score | League |
|---|-----------|-----------|-------|--------|
| 1 | Thunder FC | Lightning United | 2-1 | Premier Youth |
| 2 | Eagle Rangers | Thunder FC | 1-3 | Premier Youth |
| 3 | Phoenix Athletic | Dragon Warriors | 3-2 | National Championship |
| 4 | Dragon Warriors | Falcon Stars | 2-2 | National Championship |

---

## 📁 File Structure

```
seed/
├── master-seed.sql          ⭐ Run this (loads all files)
├── 1-core-data.sql          (Leagues, teams, Thunder FC players)
├── 2-players.sql            (Remaining teams' players)
├── 3-matches-and-events.sql (Matches + detailed Match 1 events)
├── 4-supporting-data.sql    (Possession, performance, highlights)
└── README.md                (This file)
```

---

## 🚀 How to Load Seed Data

### Option 1: Master File (Recommended)
```sql
-- In Supabase SQL Editor or psql:
\i master-seed.sql
```

### Option 2: Individual Files
```sql
\i 1-core-data.sql
\i 2-players.sql
\i 3-matches-and-events.sql
\i 4-supporting-data.sql
```

---

## ✅ After Loading Data

**IMPORTANT:** Run the extras folder files AFTER loading seed data:

```sql
-- 1. Refresh materialized views
\i ../extras/refresh-views.sql

-- 2. Calculate player attributes (ratings)
\i ../extras/calculate-player-attributes.sql
```

**Why?** The views need event data to aggregate, and player attributes need match stats to calculate.

---

## 🔍 Verification Queries

After loading, verify data:

```sql
-- Check row counts
SELECT 
  'Players' as table_name,
  COUNT(*) as count 
FROM players
UNION ALL
SELECT 'Matches', COUNT(*) FROM matches
UNION ALL
SELECT 'Pass Events', COUNT(*) FROM pass_events;

-- View match statistics
SELECT * FROM match_statistics_summary LIMIT 5;

-- View player attributes
SELECT 
  p.first_name || ' ' || p.last_name as player_name,
  pa.passing,
  pa.shooting,
  pa.overall_rating
FROM players p
JOIN player_attributes pa ON pa.player_id = p.id
ORDER BY pa.overall_rating DESC
LIMIT 10;
```

---

## 📝 Notes

- **Player IDs** follow pattern: `{team_letter}00000{number}` (e.g., `a0000001` for Thunder's first player)
- **Match IDs**: `m0000001` through `m0000004`
- **Nationalities**: Diverse mix from 30+ countries
- **Positions**: Realistic distribution (2 GK, 8 def, 10 mid, 5 fwd for 25-player squads)
- **Events**: Match 1 has most detailed events; others have basic structure

---

## 🎯 What's Generated

✅ Core entities (leagues, teams, players)  
✅ Match records with scores  
✅ Pass events (successful/unsuccessful, progressive, key passes, assists)  
✅ Shots on target (goals, saves)  
✅ Keeper actions (saves by location, goals conceded)  
✅ Duels (aerial/dribble, progressive carries)  
✅ Fouls (with cards, linked to freekicks)  
✅ Set pieces (corners, free kicks with contact tracking)  
✅ Possession (minute-by-minute)  
✅ Performance ratings (minute-by-minute)  
✅ Match highlights  
✅ Final third chances  

---

## 🔄 Next Steps

1. ✅ Load schema (database-schema-part1/2/3.sql)
2. ✅ Load seed data (master-seed.sql)
3. ⏭️ **Run extras** (refresh-views.sql, calculate-player-attributes.sql)
4. ⏭️ Test frontend with new data
5. ⏭️ Add more match events as needed

**Ready to calculate player attributes and generate statistics!**
