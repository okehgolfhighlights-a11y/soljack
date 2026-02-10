export type PrivateMatch = {
  code: string;
  tableId: string | null;
  betSol: number;
  handsTotal: number;
  handsPlayed: number;
  status: "waiting" | "active" | "done";
  createdAt: number;
};

const matches = new Map<string, PrivateMatch>();

/* -------------------- Helpers -------------------- */

function generateCode() {
  return (
    "SJ-" +
    Math.random().toString(36).substring(2, 6).toUpperCase()
  );
}

/* -------------------- API -------------------- */

export function createPrivateMatch(
  betSol: number,
  handsTotal: number
): PrivateMatch {
  const code = generateCode();

  const match: PrivateMatch = {
    code,
    tableId: null,
    betSol,
    handsTotal,
    handsPlayed: 0,
    status: "waiting",
    createdAt: Date.now(),
  };

  matches.set(code, match);
  return match;
}

export function joinPrivateMatch(code: string): PrivateMatch | null {
  const match = matches.get(code);
  if (!match) return null;
  return match;
}

export function attachTableToPrivateMatch(
  code: string,
  tableId: string
) {
  const match = matches.get(code);
  if (!match) return null;

  match.tableId = tableId;
  match.status = "active";
  return match;
}

export function incrementHand(code: string) {
  const match = matches.get(code);
  if (!match) return;

  match.handsPlayed += 1;

  if (match.handsPlayed >= match.handsTotal) {
    match.status = "done";
  }
}

export function getActivePrivateMatches(): PrivateMatch[] {
  return Array.from(matches.values()).filter(
    (m) => m.status === "active" && m.tableId
  );
}