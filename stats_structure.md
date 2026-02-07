# Passing Event Structure Documentation

This document explicitly details the data structure, logical flow, and storage format for **Passing Events** within the application. It serves as a reference for database engineers and developers to understand how pass data is captured, categorized, and serialized.

## 1. Overview

The Passing module (`Passing.tsx`) captures detailed information about every pass event, distinguishing between success and failure with granular sub-classifications.
-   **Successful Passes** are categorized by their progressive nature, potential for creating chances (Key Passes/Assists), and their effectiveness in "outplaying" opponents.
-   **Unsuccessful Passes** are categorized by the specific reason for failure (Interception, Block, etc.) and the subsequent defensive context (High Press, Ball Recovery).

## 2. Data Entity Structure (`MatchEvent`)

All passing events are stored as `MatchEvent` objects (defined in `app/utils/EventFactory.ts`) with `eventType: "PASS"`.

### Core Fields (Common)
| Field Name | Type | Description |
| :--- | :--- | :--- |
| `eventId` | `UUID` (string) | Unique identifier for the event. |
| `eventType` | `"PASS"` | Constant identifier for this event type. |
| `teamId` | `UUID` (string) | ID of the team attempting the pass. |
| `fromPlayerId` | `UUID` (string) | ID of the player initiating the pass (The Passer). |
| `time` | `string` | Video timestamp (HH:MM:SS) for display. |
| `videoTimeSec` | `number` | Raw video timestamp in seconds. |
| `matchMinute` | `number` | Derived logically corrected match minute (0-90+). |
| `passLength` | `"LONG" \| "SHORT"` | Classification of pass distance. |
| `passResult` | `"SUCCESSFUL" \| "UNSUCCESSFUL"` | Primary outcome of the pass. |

---

### A. Successful Pass Fields (`passResult: "SUCCESSFUL"`)
When a pass is successful, the following fields are populated based on the user's navigational choice in the logic tree.

| Field Name | Type | Description |
| :--- | :--- | :--- |
| `toPlayerId` | `UUID` (string) | ID of the receiver (teammate). |
| `isProgressive`| `boolean` | `true` if the pass is categorized as "PROGRESSIVE". |
| `isAssist` | `boolean` | `true` if the pass immediately leads to a goal (Sub-type of Progressive). |
| `isCross` | `boolean` | `true` if the pass is a cross (Sub-type of Progressive). |
| `isKeyPass` | `boolean` | `true` if the pass is an Assist OR a Cross OR explicitly marked. |
| `outplay` | `boolean` | `true` if the pass takes opponents out of the game (leads to "Outplays"). |
| `outplayPlayers`| `number` | The number of opponents by-passed. (Required if `outplay` is `true`). |
| `outplayLines` | `number` | The number of defensive lines broken. (Required if `outplay` is `true`). |

**Logic Flow for Success:**
1.  **Category**: User selects "NORMAL" or "PROGRESSIVE".
2.  **Progressive Sub-Type**: If "PROGRESSIVE", user selects "ASSIST", "CROSS", or "NONE".
    *   *Note*: `isKeyPass` is automatically `true` if `isAssist` or `isCross` is true.
3.  **Outplay Check**:
    *   If "NORMAL": User is asked "Does it lead to Outplays?".
    *   If "KEY PASS" (Assist/Cross): User is asked "Key Pass: Outplays?".
4.  **Outplay Details**: If `outplay` is confirmed, `outplayPlayers` and `outplayLines` are recorded.

---

### B. Unsuccessful Pass Fields (`passResult: "UNSUCCESSFUL"`)
When a pass fails, the system captures the specific mechanism of failure and subsequent play.

| Field Name | Type | Description |
| :--- | :--- | :--- |
| `passFailureType` | `Enum` (String) | Primary cause of failure. options: `"OFFSIDE"`, `"BLOCK"`, `"INTERCEPTION"`, `"CLEARANCE"`, `"BALL_COLLECTION"`, `"UNSUCCESSFUL_CROSS"`, `"TACKLE"`. |
| `failureSubtype` | `String` | Secondary specific action. E.g., `"TACKLE"` (after Block/Clearance) or `"UNSUCCESSFUL_CROSS"` (after Ball Collection). |
| `opponentPlayerId`| `UUID` (string) | ID of the opponent player involved in the interception, block, tackle, or press. |
| `highPress` | `boolean` | `true` if the turnover was forced by a high press. |
| `ballRecovery` | `"SUCCESSFUL" \| "UNSUCCESSFUL"` | Indicates if the pressing team successfully recovered the ball immediately after the forced error. |

**Logic Flow for Failure:**

**Level 1: Primary Failure Type**
User selects one of:
*   `OFFSIDE` (End of flow)
*   `INTERCEPTION` (Proceeds to Level 2)
*   `BLOCK` (Proceeds to Level 2)
*   `CLEARANCE` (Proceeds to Level 2)

**Level 2: Secondary Options**
*   **From INTERCEPTION**:
    *   Option: `BALL COLLECTION` -> leads to Level 3 (`UNSUCCESSFUL CROSS`).
    *   Option: `HIGH PRESS` -> leads to Level 4.
*   **From BLOCK**:
    *   Option: `HIGH PRESS` -> leads to Level 4.
    *   Option: `TACKLE` (End of flow).
*   **From CLEARANCE**:
    *   Option: `TACKLE` (End of flow).

**Level 4: Pressing & Recovery**
(Triggered if `HIGH PRESS` was selected in Level 2)
1.  **Opponent Selection**: who applied the pressure (`opponentPlayerId`).
2.  **Recovery Check**: "Ball Recovered?" (Yes/No).
    *   Sets `ballRecovery` to `"SUCCESSFUL"` or `"UNSUCCESSFUL"`.

---

## 3. JSON Storage Examples

### Example 1: Successful Progressive Key Pass (Assist) with Outplays

```json
{
  "eventId": "uuid-1234-5678",
  "eventType": "PASS",
  "teamId": "team-uuid-A",
  "fromPlayerId": "player-uuid-10",
  "time": "00:15:30",
  "videoTimeSec": 930,
  "matchMinute": 15,
  
  "passLength": "SHORT",
  "passResult": "SUCCESSFUL",
  
  "toPlayerId": "player-uuid-09",
  "isProgressive": true,
  "isAssist": true,
  "isCross": false,
  "isKeyPass": true,
  
  "outplay": true,
  "outplayPlayers": 2,
  "outplayLines": 1,
  
  "passCategories": ["PROGRESSIVE_PASS", "KEY_PASS", "ASSIST"]
}
```

### Example 2: Unsuccessful Pass (Interception -> High Press -> Recovery)

```json
{
  "eventId": "uuid-8765-4321",
  "eventType": "PASS",
  "teamId": "team-uuid-A",
  "fromPlayerId": "player-uuid-04",
  "time": "00:42:10",
  "videoTimeSec": 2530,
  "matchMinute": 42,
  
  "passLength": "LONG",
  "passResult": "UNSUCCESSFUL",
  
  "passFailureType": "INTERCEPTION",
  "opponentPlayerId": "opponent-uuid-05",
  
  "highPress": true,
  "ballRecovery": "SUCCESSFUL", 
  
  "passCategories": [] 
}
```

### Example 3: Unsuccessful Pass (Block -> Tackle)

```json
{
  "eventId": "uuid-9999-0000",
  "eventType": "PASS",
  "teamId": "team-uuid-B",
  "fromPlayerId": "player-uuid-03",
  "time": "00:10:05",
  "videoTimeSec": 605,
  "matchMinute": 10,
  
  "passLength": "SHORT",
  "passResult": "UNSUCCESSFUL",
  
  "passFailureType": "BLOCK",
  "failureSubtype": "TACKLE",
  "opponentPlayerId": "opponent-uuid-22"
}
```

---

# Chances Created Event Structure Documentation

This section details the data structure and logical flow for **Chances Created Events** (`CHANCE_CREATED`), as handled by `ChancesCreated.tsx` and `EventFactory.ts`.

## 1. Overview
The Chances Created module captures events where a player creates a scoring opportunity for a teammate. The key distinction in the data is whether the chance was created **inside the box** or **outside the box**, and if inside, whether it was from a **corner** or **normal** play, including side direction.

## 2. Data Entity Structure (`MatchEvent`)

All chance events are stored as `MatchEvent` objects with `eventType: "CHANCE_CREATED"`.

### Core Fields
| Field Name | Type | Description |
| :--- | :--- | :--- |
| `eventId` | `UUID` (string) | Unique identifier for the event. |
| `eventType` | `"CHANCE_CREATED"` | Constant identifier. |
| `teamId` | `UUID` (string) | ID of the team creating the chance. |
| `chanceSenderId` | `UUID` (string) | ID of the player creating the chance (Main Player). |
| `chanceReceiverId` | `UUID` (string) | ID of the player receiving the chance (Teammate). |
| `playerId` | `UUID` (string) | Redundant copy of `chanceSenderId` for legacy compatibility. |
| `time` | `string` | Video timestamp (HH:MM:SS). |
| `chanceLocation` | `"IN_THE_BOX" \| "NOT_IN_BOX"` | Primary classification of where the chance originated/occurred. |

### Conditional Fields (If `chanceLocation` is `"IN_THE_BOX"`)
| Field Name | Type | Description |
| :--- | :--- | :--- |
| `chanceSubType` | `"CORNER" \| "NORMAL"` | Type of play leading to the chance inside the box. |
| `chanceSide` | `"LEFT" \| "RIGHT" \| "CENTRE"` | Direction/Side of the chance (Context dependent). |

---

## 3. Logic Flow (UI -> Data)

The `ChancesCreated.tsx` component enforces a linear wizard:

1.  **Select Team**: Sets `teamId`.
2.  **Select Sender**: Sets `chanceSenderId` (and `playerId`).
3.  **Select Receiver**: Sets `chanceReceiverId`.
4.  **Select Outcome** (Location Classification):
    *   **Option A: OUTSIDE BOX** -> Sets `chanceLocation = "NOT_IN_BOX"`. Event is logged immediately.
    *   **Option B: IN BOX** -> Opens sub-menu.
        *   **Sub-Option 1: CORNER** -> User selects `LEFT` or `RIGHT`.
            *   Sets `chanceLocation = "IN_THE_BOX"`, `chanceSubType = "CORNER"`, `chanceSide = "LEFT" | "RIGHT"`.
        *   **Sub-Option 2: NORMAL** -> User selects `LEFT`, `CENTRE`, or `RIGHT`.
            *   Sets `chanceLocation = "IN_THE_BOX"`, `chanceSubType = "NORMAL"`, `chanceSide = "LEFT" | "CENTRE" | "RIGHT"`.

## 4. JSON Storage Examples

### Example 1: Chance Created Outside Box
```json
{
  "eventId": "uuid-1111-2222",
  "eventType": "CHANCE_CREATED",
  "teamId": "team-uuid-A",
  "chanceSenderId": "player-uuid-10",
  "chanceReceiverId": "player-uuid-09",
  "playerId": "player-uuid-10",
  "time": "00:20:00",
  "chanceLocation": "NOT_IN_BOX"
}
```

### Example 2: Chance Created Inside Box (Corner - Right)
```json
{
  "eventId": "uuid-3333-4444",
  "eventType": "CHANCE_CREATED",
  "teamId": "team-uuid-A",
  "chanceSenderId": "player-uuid-07",
  "chanceReceiverId": "player-uuid-04",
  "playerId": "player-uuid-07",
  "time": "00:35:15",
  "chanceLocation": "IN_THE_BOX",
  "chanceSubType": "CORNER",
  "chanceSide": "RIGHT"
}
```

### Example 3: Chance Created Inside Box (Normal - Centre)
```json
{
  "eventId": "uuid-5555-6666",
  "eventType": "CHANCE_CREATED",
  "teamId": "team-uuid-B",
  "chanceSenderId": "player-uuid-08",
  "chanceReceiverId": "player-uuid-11",
  "playerId": "player-uuid-08",
  "time": "00:55:00",
  "chanceLocation": "IN_THE_BOX",
  "chanceSubType": "NORMAL",
  "chanceSide": "CENTRE"
}
```

---

# Shot Event Structure Documentation

This section details the data structure and logical flow for **Shot Events** (`SHOT_ON_TARGET`), as handled by `ShotTracker.tsx` and `EventFactory.ts`.

## 1. Overview
The Shot Tracker module (`ShotTracker.tsx`) is a comprehensive tool dealing with both **On Target** and **Off Target** shots using an interactive pitch plotter. It logs the shot result, shooter, opponent (goalkeeper or defender causing the outcome), and the precise start and end coordinates on the pitch.

## 2. Data Entity Structure (`MatchEvent`)

All shot events are stored as `MatchEvent` objects with `eventType: "SHOT_ON_TARGET"`. Note that even "OFF_TARGET" shots use this event type, differentiated by the `shotResult` field.

### Core Fields
| Field Name | Type | Description |
| :--- | :--- | :--- |
| `eventId` | `UUID` (string) | Unique identifier for the event. |
| `eventType` | `"SHOT_ON_TARGET"` | Constant identifier. |
| `teamId` | `UUID` (string) | ID of the team taking the shot. |
| `playerId` | `UUID` (string) | ID of the shooter. |
| `shotResult` | `"GOAL" \| "SAVED" \| "OFF_TARGET"` | The outcome of the shot. |
| `shotStart` | `{x: number, y: number}` | Start coordinates (0-100) of the shot on the pitch. |
| `shotEnd` | `{x: number, y: number}` | End coordinates (0-100) of the shot (Goal, Save location, or where it went out). |

### Conditional Fields (Based on `shotResult`)
| Field Name | Type | Condition | Description |
| :--- | :--- | :--- | :--- |
| `shotType` | `"NORMAL" \| "PENALTY"` | `GOAL` or `SAVED` | Classification of the shot type. Auto-set to `NORMAL` if `saveLocation` is `OUTSIDE_BOX`. |
| `saveLocation` | `"INSIDE_BOX" \| "OUTSIDE_BOX"` | `SAVED` | Location of the save/shot initiation relative to the box (Specific to Keeper saves). |
| `shotOpponentId` | `UUID` (string) | `GOAL` or `SAVED` | ID of the opponent (Goalkeeper who made the save or conceded the goal). |

## 3. Logic Flow (UI -> Data)

The `ShotTracker.tsx` component logic branches early based on accuracy but converges on data submission.

### Branch A: OFF TARGET
1.  **Shot Accuracy**: User selects "OFF TARGET".
    *   Sets `shotResult = "OFF_TARGET"`.
2.  **Select Team**: Sets `teamId`.
3.  **Select Shooter**: Sets `playerId`.
4.  **Plotting**:
    *   User clicks 'Start' point (sets `shotStart`).
    *   User clicks 'End' point (sets `shotEnd`).
    *   **Result**: Event is submitted. `shotType` and `shotOpponentId` are undefined.

### Branch B: ON TARGET
1.  **Shot Accuracy**: User selects "ON TARGET".
2.  **Result**: User selects "GOAL" or "SAVED".
    *   Sets `shotResult`.
3.  **Specific Details**:
    *   **If SAVED**: User selects Location ("INSIDE BOX" / "OUTSIDE BOX").
        *   Sets `saveLocation`.
        *   If "OUTSIDE BOX", auto-sets `shotType = "NORMAL"`.
    *   **Type Selection**: User selects "NORMAL" or "PENALTY" (if not already set).
4.  **Select Team**: Sets `teamId`.
5.  **Select Shooter**: Sets `playerId`.
6.  **Select Opponent** (GK): Sets `shotOpponentId` (Who saved it or who conceded).
7.  **Plotting**:
    *   User clicks 'Start' point (sets `shotStart`).
    *   User clicks 'End' point (sets `shotEnd`).
    *   **Result**: Event is submitted.

## 4. JSON Storage Examples

### Example 1: Goal Scored (Normal)
```json
{
  "eventId": "uuid-7777-8888",
  "eventType": "SHOT_ON_TARGET",
  "teamId": "team-uuid-A",
  "playerId": "player-uuid-10",
  "time": "00:12:45",
  "matchMinute": 12,
  "shotResult": "GOAL",
  "shotType": "NORMAL",
  "shotOpponentId": "opponent-gk-uuid-01",
  "shotStart": { "x": 88.5, "y": 50.0 },
  "shotEnd": { "x": 100.0, "y": 48.0 },
  "outcome": "GOAL"
}
```

### Example 2: Saved Shot (Inside Box)
```json
{
  "eventId": "uuid-9999-aaaa",
  "eventType": "SHOT_ON_TARGET",
  "teamId": "team-uuid-B",
  "playerId": "player-uuid-09",
  "time": "00:30:10",
  "matchMinute": 30,
  "shotResult": "SAVED",
  "saveLocation": "INSIDE_BOX",
  "shotType": "NORMAL",
  "shotOpponentId": "opponent-gk-uuid-22",
  "shotStart": { "x": 92.0, "y": 45.0 },
  "shotEnd": { "x": 98.0, "y": 52.0 },
  "outcome": "SAVED"
}
```

### Example 3: Penalty Goal
```json
{
  "eventId": "uuid-bbbb-cccc",
  "eventType": "SHOT_ON_TARGET",
  "teamId": "team-uuid-A",
  "playerId": "player-uuid-07",
  "time": "00:65:00",
  "matchMinute": 65,
  "shotResult": "GOAL",
  "shotType": "PENALTY",
  "shotOpponentId": "opponent-gk-uuid-01",
  "shotStart": { "x": 89.0, "y": 50.0 },
  "shotEnd": { "x": 100.0, "y": 54.0 },
  "outcome": "GOAL"
}
```

### Example 4: Off Target
```json
{
  "eventId": "uuid-dddd-eeee",
  "eventType": "SHOT_ON_TARGET",
  "teamId": "team-uuid-B",
  "playerId": "player-uuid-11",
  "time": "00:05:20",
  "matchMinute": 5,
  "shotResult": "OFF_TARGET",
  "shotStart": { "x": 75.0, "y": 40.0 },
  "shotEnd": { "x": 105.0, "y": 30.0 },
  "outcome": "OFF_TARGET"
}
```

---

# Duels Event Structure Documentation

This section details the data structure and logical flow for **Duel Events** (`DUEL`), as handled by `Duels.tsx` and `EventFactory.ts`.

## 1. Overview
The Duels module captures specific 1v1 interactions between players. It specifically covers two main types of duels:
-   **AERIAL**: Contests for the ball in the air (Headers).
-   **DRIBBLE**: Contests on the ground where one player attempts to bypass another.

## 2. Data Entity Structure (`MatchEvent`)

All duel events are stored as `MatchEvent` objects with `eventType: "DUEL"`.

### Core Fields
| Field Name | Type | Description |
| :--- | :--- | :--- |
| `eventId` | `UUID` (string) | Unique identifier for the event. |
| `eventType` | `"DUEL"` | Constant identifier. |
| `teamId` | `UUID` (string) | ID of the team initiating/winning the duel. |
| `playerId` | `UUID` (string) | ID of the main player involved. |
| `opponentPlayerId` | `UUID` (string) | ID of the opponent player in the duel. |
| `duelType` | `"AERIAL" \| "DRIBBLE"` | The primary category of the duel. |
| `duelOutcome` | `"WON" \| "LOST" \| "SUCCESSFUL" \| "UNSUCCESSFUL"` | The result of the duel. |

### Conditional Fields (For Dribbles)
| Field Name | Type | Condition | Description |
| :--- | :--- | :--- | :--- |
| `progressiveCarry` | `boolean` | `duelType = "DRIBBLE"` AND `duelOutcome = "SUCCESSFUL"` | True if the dribble significantly advanced play. |
| `playersOutplayed` | `number` | `progressiveCarry = true` | Number of opponents by-passed by the dribble. |
| `carryLocation` | `"INSIDE_BOX" \| "OUTSIDE_BOX"` | `progressiveCarry = true` | Where the dribble ended. |

## 3. Logic Flow (UI -> Data)

The `Duels.tsx` component is a wizard starting with Player Selection -> Type Selection.

### Common Setup
1.  **Select Team**: Sets `teamId`.
2.  **Select Player**: Sets `playerId`.
3.  **Select Type**: User chooses "AERIAL" or "DRIBBLE".
4.  **Select Opponent**: User selects the `opponentPlayerId` (or Unknown).

### Branch A: AERIAL DUEL
1.  **Outcome Selection**: User selects "WON" or "LOST".
    *   Sets `duelOutcome` to `"WON"` or `"LOST"`.
    *   **Result**: Event is submitted.

### Branch B: DRIBBLE DUEL
1.  **Outcome Selection**: User selects "SUCCESSFUL" or "UNSUCCESSFUL".
    *   **If UNSUCCESSFUL**:
        *   Sets `duelOutcome = "UNSUCCESSFUL"`.
        *   **Result**: Event is submitted immediately.
    *   **If SUCCESSFUL**:
        *   Sets `duelOutcome = "SUCCESSFUL"`.
        *   **Progressive Check**: User selects "YES" or "NO".
            *   **NO**: Event submitted (`progressiveCarry = false`).
            *   **YES**:
                *   Sets `progressiveCarry = true`.
                *   **Players Outplayed**: User selects number (1-11).
                *   **End Location**: User selects "INSIDE BOX" or "OUTSIDE BOX".
                *   **Result**: Event is submitted with all details.

## 4. JSON Storage Examples

### Example 1: Dribble Won (Progressive + Into Box)
```json
{
  "eventId": "uuid-1212-3434",
  "eventType": "DUEL",
  "teamId": "team-uuid-A",
  "playerId": "player-uuid-10",
  "opponentPlayerId": "opponent-uuid-05",
  "time": "00:55:20",
  "duelType": "DRIBBLE",
  "duelOutcome": "SUCCESSFUL",
  "progressiveCarry": true,
  "playersOutplayed": 2,
  "carryLocation": "INSIDE_BOX",
  "outcome": "DRIBBLE_WON"
}
```

### Example 2: Aerial Duel Lost
```json
{
  "eventId": "uuid-5656-7878",
  "eventType": "DUEL",
  "teamId": "team-uuid-B",
  "playerId": "player-uuid-04",
  "opponentPlayerId": "opponent-uuid-09",
  "time": "00:10:45",
  "duelType": "AERIAL",
  "duelOutcome": "LOST",
  "outcome": "AERIAL_DUEL_LOST"
}
```

### Example 3: Dribble Unsuccessful
```json
{
  "eventId": "uuid-9090-0000",
  "eventType": "DUEL",
  "teamId": "team-uuid-A",
  "playerId": "player-uuid-07",
  "opponentPlayerId": "opponent-uuid-03",
  "time": "00:41:10",
  "duelType": "DRIBBLE",
  "duelOutcome": "UNSUCCESSFUL",
  "outcome": "DRIBBLE_LOST"
}
```

---

# Set Pieces Event Structure Documentation

This section details the data structure and logical flow for **Set Piece Events** (`SET_PIECE`), as handled by `Other_stat.tsx` (Set Piece Logger).

## 1. Overview
The Set Piece module captures events related to dead-ball situations like Corners, Free Kicks, Goal Kicks, and Throw-ins. It tracks the sequence of events following the set piece execution, including cards shown, first and second contacts, and the final outcome (whether the ball reached the box).

## 2. Data Entity Structure (`MatchEvent`)

All set piece events are stored as `MatchEvent` objects with `eventType: "SET_PIECE"`.

### Core Fields
| Field Name | Type | Description |
| :--- | :--- | :--- |
| `eventId` | `UUID` (string) | Unique identifier for the event. |
| `eventType` | `"SET_PIECE"` | Constant identifier. |
| `teamId` | `UUID` (string) | ID of the team taking the set piece. |
| `playerId` | `UUID` (string) | ID of the set piece taker. |
| `setPieceType` | `"GOAL_KICK" \| "CORNER" \| "FREE_KICK" \| "THROW_IN"` | Type of set piece. |
| `setPieceCard` | `"YELLOW" \| "RED" \| "NONE"` | Card issued during/before the event. |
| `opponentPlayerId`| `UUID` (string) | ID of the opponent player who fouled (Only for Free Kicks). |
| `firstContact` | `"YES" \| "NO"` | Did the taker's team make first contact? |
| `firstContactPlayerId` | `UUID` (string) | ID of the player making first contact (if Yes). |
| `secondContact` | `"YES" \| "NO"` | Did the team make a second contact immediately after? |
| `secondContactPlayerId` | `UUID` (string) | ID of the player making second contact (if Yes). |
| `setPieceResult` | `"REACHED_BOX" \| "DIDNT_REACH_BOX"` | Final outcome if sequence breaks early. |

## 3. Logic Flow (UI -> Data)

The `Other_stat.tsx` component is a complex multi-step wizard.

1.  **Select Team**: Sets `teamId`.
2.  **Select Taker**: Sets `playerId`.
3.  **Select Type**: User chooses one of 4 types.
    *   **Special Case**: If `FREE_KICK` is selected:
        *   **Identify Fouler**: User selects opponent player (`opponentPlayerId`).
4.  **Card Selection**: User selects "YELLOW", "RED", or "NONE" (`setPieceCard`).
5.  **First Contact Check**: "First Contact Success?" (Yes/No).
    *   **NO**: Skips to Step 7 (Second Contact).
    *   **YES**:
        *   **Identify Player**: User selects teammate who made contact (`firstContactPlayerId`).
6.  **Second Contact Check**: "Second Contact Made?" (Yes/No).
    *   **NO**: Skips to Final Outcome.
    *   **YES**:
        *   **Identify Player**: User selects teammate who made contact (`secondContactPlayerId`).
7.  **Final Outcome**: "Did Ball Reach Box?" (Only if flow didn't naturally conclude).
    *   Sets `setPieceResult` to "REACHED_BOX" or "DIDNT_REACH_BOX".
    *   **Result**: Event is submitted.

## 4. JSON Storage Examples

### Example 1: Corner Kick (Successful Combo)
```json
{
  "eventId": "uuid-1111-2222",
  "eventType": "SET_PIECE",
  "teamId": "team-uuid-A",
  "playerId": "player-uuid-10",
  "time": "00:15:00",
  "setPieceType": "CORNER",
  "setPieceCard": "NONE",
  "firstContact": "YES",
  "firstContactPlayerId": "player-uuid-05",
  "secondContact": "YES",
  "secondContactPlayerId": "player-uuid-09",
  "setPieceResult": "REACHED_BOX",
  "outcome": "SET_PIECE"
}
```

### Example 2: Free Kick (Foul + Yellow Card + No Contact)
```json
{
  "eventId": "uuid-3333-4444",
  "eventType": "SET_PIECE",
  "teamId": "team-uuid-B",
  "playerId": "player-uuid-08",
  "opponentPlayerId": "opponent-uuid-02",
  "time": "00:30:15",
  "setPieceType": "FREE_KICK",
  "setPieceCard": "YELLOW",
  "firstContact": "NO",
  "secondContact": "NO",
  "setPieceResult": "DIDNT_REACH_BOX",
  "outcome": "SET_PIECE"
}
```

### Example 3: Goal Kick (Standard)
```json
{
  "eventId": "uuid-5555-6666",
  "eventType": "SET_PIECE",
  "teamId": "team-uuid-A",
  "playerId": "player-uuid-01",
  "time": "00:05:00",
  "setPieceType": "GOAL_KICK",
  "setPieceCard": "NONE",
  "firstContact": "YES",
  "firstContactPlayerId": "player-uuid-09",
  "secondContact": "NO",
  "setPieceResult": "REACHED_BOX",
  "outcome": "SET_PIECE"
}
```

Heatmap
Heatmap will contain playerID and heatmap image URL