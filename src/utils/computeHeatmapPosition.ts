/**
 * ──────────────────────────────────────────────────────────────────
 * FUTURE: If heatmap data is inserted directly in the database,
 * use that instead of computing positions from events here.
 * This file can then be deleted and replaced with a direct
 * database query for player heatmap positions.
 * ──────────────────────────────────────────────────────────────────
 */

import { MatchEvent } from "@/types/player";

// Pitch dimensions in "pitch units"
const PITCH_W = 105;
const PITCH_H = 68;

// Grid resolution for heatmap zones
const GRID_COLS = 12;
const GRID_ROWS = 8;

/**
 * Compute the pitch coordinate (in pitch units: 0-105 x, 0-68 y)
 * where the player has the highest event activity.
 *
 * Events use 0-100 normalised coordinates. We divide the pitch into
 * a GRID_COLS × GRID_ROWS grid, count events per cell, and return
 * the centre of the cell with the most events.
 *
 * @param events    All match events for this player (passes, shots, dribbles, etc.)
 * @param isHomeTeam If true, clamp position to the left half (x ≤ 52.5)
 * @returns { x, y } in pitch coordinates, or null if no events
 */
export function computeHeatmapPosition(
    events: MatchEvent[],
    isHomeTeam: boolean,
): { x: number; y: number } | null {
    if (events.length === 0) return null;

    // Build heat grid
    const zones: number[][] = Array.from({ length: GRID_ROWS }, () =>
        Array(GRID_COLS).fill(0),
    );

    events.forEach((event) => {
        const col = Math.min(Math.floor((event.x / 100) * GRID_COLS), GRID_COLS - 1);
        const row = Math.min(Math.floor((event.y / 100) * GRID_ROWS), GRID_ROWS - 1);
        zones[row][col]++;

        // Smooth: add partial weight to adjacent cells
        const addWeight = (r: number, c: number, weight: number) => {
            if (r >= 0 && r < GRID_ROWS && c >= 0 && c < GRID_COLS) {
                zones[r][c] += weight;
            }
        };
        addWeight(row - 1, col, 0.3);
        addWeight(row + 1, col, 0.3);
        addWeight(row, col - 1, 0.3);
        addWeight(row, col + 1, 0.3);
    });

    // Find peak zone
    let maxVal = -1;
    let maxRow = 0;
    let maxCol = 0;
    for (let r = 0; r < GRID_ROWS; r++) {
        for (let c = 0; c < GRID_COLS; c++) {
            if (zones[r][c] > maxVal) {
                maxVal = zones[r][c];
                maxRow = r;
                maxCol = c;
            }
        }
    }

    // Convert zone centre to pitch coordinates
    let x = ((maxCol + 0.5) / GRID_COLS) * PITCH_W;
    let y = ((maxRow + 0.5) / GRID_ROWS) * PITCH_H;

    // Clamp to home-team half if needed
    if (isHomeTeam) {
        x = Math.min(x, 52);
    } else {
        x = Math.max(x, 53);
    }

    // Keep within field boundaries with padding
    x = Math.max(5, Math.min(PITCH_W - 5, x));
    y = Math.max(6, Math.min(PITCH_H - 6, y));

    return { x, y };
}
