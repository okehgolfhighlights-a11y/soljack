import { useEffect, useState } from "react";
import { PublicKey } from "@solana/web3.js";
import { useGameProgram } from "../lib/anchor";

/**
 * SpectatorTable
 * - Read-only view of a live PvP blackjack table
 * - No wallet required
 * - No actions
 */

export default function SpectatorTable({
  tableId,
}: {
  tableId: string;
}) {
  const program = useGameProgram();
  const [table, setTable] = useState<any>(null);
  const [error, setError] = useState("");

  /* -------------------- Poll Table -------------------- */

  useEffect(() => {
    if (!program || !tableId) return;

    const tablePda = new PublicKey(tableId);

    const fetchTable = async () => {
      try {
        const data = await program.account.tableAccount.fetch(
          tablePda
        );
        setTable(data);
      } catch (err) {
        console.error("Spectator fetch failed:", err);
        setError("Unable to load table");
      }
    };

    fetchTable();
    const int = setInterval(fetchTable, 2000);
    return () => clearInterval(int);
  }, [program, tableId]);

  /* -------------------- Guards -------------------- */

  if (error) {
    return <Centered>{error}</Centered>;
  }

  if (!table) {
    return <Centered>Loading table…</Centered>;
  }

  /* -------------------- Derived -------------------- */

  const creatorHand = table.creatorHand ?? [];
  const opponentHand = table.opponentHand ?? [];

  const creatorTotal = table.creatorTotal ?? 0;
  const opponentTotal = table.opponentTotal ?? 0;

  const betSol = Number(table.betAmount ?? 0) / 1e9;

  /* -------------------- Render -------------------- */

  return (
    <div style={styles.wrap}>
      <div style={styles.overlay}>SPECTATOR MODE</div>

      <div style={styles.table}>
        {/* Opponent */}
        <div style={styles.seatTop}>
          <div style={styles.label}>Opponent</div>
          <div style={styles.hand}>
            {opponentHand.map((c: number, i: number) => (
              <Card key={i} card={c} />
            ))}
          </div>
          <div style={styles.total}>Total: {opponentTotal}</div>
        </div>

        {/* Center */}
        <div style={styles.center}>
          <div style={styles.bet}>
            Pot: {(betSol * 2).toFixed(2)} SOL
          </div>
        </div>

        {/* Creator */}
        <div style={styles.seatBottom}>
          <div style={styles.label}>Creator</div>
          <div style={styles.hand}>
            {creatorHand.map((c: number, i: number) => (
              <Card key={i} card={c} />
            ))}
          </div>
          <div style={styles.total}>Total: {creatorTotal}</div>
        </div>
      </div>
    </div>
  );
}

/* -------------------- Card -------------------- */

function Card({ card }: { card: number }) {
  const suits = ["♠️", "♥️", "♦️", "♣️"];
  const ranks = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];

  const suit = suits[Math.floor(card / 13)];
  const rank = ranks[card % 13];
  const red = suit === "♥️" || suit === "♦️";

  return (
    <div
      style={{
        ...styles.card,
        color: red ? "#c0262d" : "#111",
      }}
    >
      <div>{rank}</div>
      <div>{suit}</div>
    </div>
  );
}

/* -------------------- Helpers -------------------- */

function Centered({ children }: { children: any }) {
  return (
    <div style={styles.centered}>
      <div>{children}</div>
    </div>
  );
}

/* -------------------- Styles -------------------- */

const styles: { [k: string]: React.CSSProperties } = {
  wrap: {
    position: "relative",
    padding: 20,
    background: "radial-gradient(circle, #0f5b2b, #041f0e)",
    minHeight: "80vh",
    borderRadius: 24,
    boxShadow: "0 30px 80px rgba(0,0,0,0.5)",
  },
  overlay: {
    position: "absolute",
    top: 14,
    left: "50%",
    transform: "translateX(-50%)",
    fontWeight: 900,
    letterSpacing: "0.3em",
    opacity: 0.25,
    pointerEvents: "none",
  },
  table: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    minHeight: 520,
  },
  seatTop: {
    textAlign: "center",
  },
  seatBottom: {
    textAlign: "center",
  },
  label: {
    fontWeight: 800,
    marginBottom: 6,
  },
  hand: {
    display: "flex",
    justifyContent: "center",
    gap: 10,
  },
  total: {
    marginTop: 6,
    fontWeight: 700,
  },
  center: {
    textAlign: "center",
    margin: "20px 0",
  },
  bet: {
    fontWeight: 900,
    fontSize: 16,
  },
  card: {
    width: 56,
    height: 84,
    background: "#fff",
    borderRadius: 10,
    padding: 6,
    fontWeight: 900,
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
  },
  centered: {
    minHeight: "60vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 800,
  },
};