export type WatchMode = "TOURNAMENT" | "PRIVATE" | "PVP";

export interface LiveTable {
  tableId: string;
  mode: WatchMode;
  bet: number;
  hand: number;
  updatedAt: number; // ms timestamp
}

/**
 * Higher score = higher priority
 */
export function scoreTable(t: LiveTable): number {
  let score = 0;

  if (t.mode === "TOURNAMENT") score += 1000;
  if (t.mode === "PRIVATE") score += 200 + t.bet * 10;
  if (t.mode === "PVP") score += 50 + Math.random() * 20;

  // Prefer recently updated tables
  score += Math.min(100, (Date.now() - t.updatedAt) / -1000);

  return score;
}

export function pickNextTable(
  tables: LiveTable[],
  currentId?: string
): LiveTable | null {
  if (!tables.length) return null;

  const scored = tables
    .filter(t => t.tableId !== currentId)
    .map(t => ({ t, score: scoreTable(t) }))
    .sort((a, b) => b.score - a.score);

  return scored[0]?.t ?? null;
}