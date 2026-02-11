const API =
  (import.meta as any).env?.VITE_API_URL ||
  "http://localhost:3000";

export async function createPrivateMatch(
  betSol: number,
  handsTotal: number
) {
  const res = await fetch(`${API}/private/create`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ betSol, handsTotal }),
  });
  if (!res.ok) throw new Error("Create failed");
  return res.json();
}

export async function joinPrivateMatch(code: string) {
  const res = await fetch(`${API}/private/join`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code }),
  });
  if (!res.ok) throw new Error("Invalid code");
  return res.json();
}