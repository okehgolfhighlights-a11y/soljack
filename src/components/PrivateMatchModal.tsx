import { useState } from "react";
import { createPrivateMatch, joinPrivateMatch } from "../lib/privateApi";

export default function PrivateMatchModal({
  onClose,
  onJoinTable,
}: {
  onClose: () => void;
  onJoinTable: (tableId?: string) => void;
}) {
  const [mode, setMode] = useState<"create" | "join">("create");
  const [betSol, setBetSol] = useState(0.01);
  const [hands, setHands] = useState(5);
  const [code, setCode] = useState("");
  const [createdCode, setCreatedCode] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function handleCreate() {
    try {
      const res = await createPrivateMatch(betSol, hands);
      setCreatedCode(res.match.code);
    } catch {
      setError("Failed to create private match");
    }
  }

  async function handleJoin() {
    try {
      const res = await joinPrivateMatch(code);
      onJoinTable(res.match.tableId);
    } catch {
      setError("Invalid code");
    }
  }

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <h3>Private Match</h3>

        <div style={styles.tabs}>
          <button onClick={() => setMode("create")}>Create</button>
          <button onClick={() => setMode("join")}>Join</button>
        </div>

        {mode === "create" && (
          <>
            <label>Bet (SOL)</label>
            <input
              type="number"
              min={0.01}
              max={20}
              step={0.01}
              value={betSol}
              onChange={(e) => setBetSol(Number(e.target.value))}
            />

            <label>Hands (1–11)</label>
            <input
              type="number"
              min={1}
              max={11}
              value={hands}
              onChange={(e) => setHands(Number(e.target.value))}
            />

            <button onClick={handleCreate}>Create Match</button>

            {createdCode && (
              <div style={styles.code}>
                Share code: <b>{createdCode}</b>
              </div>
            )}
          </>
        )}

        {mode === "join" && (
          <>
            <label>Enter Code</label>
            <input
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
            />
            <button onClick={handleJoin}>Join</button>
          </>
        )}

        {error && <div style={styles.error}>{error}</div>}

        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
}

const styles: { [k: string]: React.CSSProperties } = {
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.6)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  modal: {
    background: "#0b1220",
    padding: 20,
    borderRadius: 12,
    width: 320,
    color: "#fff",
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },
  tabs: {
    display: "flex",
    gap: 8,
  },
  code: {
    marginTop: 8,
    padding: 8,
    background: "#111827",
    borderRadius: 6,
    textAlign: "center",
  },
  error: {
    color: "#f87171",
    fontSize: 12,
  },
};