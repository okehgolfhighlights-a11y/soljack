import { useEffect, useState } from "react";
import TableSimple from "./TableSimple";
import {
  LiveTable,
  pickNextTable,
} from "../lib/devWatchSelector";

const SWITCH_EVERY_MS = 15000; // camera rotation speed

export default function DevWatch() {
  const [tables, setTables] = useState<LiveTable[]>([]);
  const [current, setCurrent] = useState<LiveTable | null>(null);
  const [fade, setFade] = useState(false);

  /* -------------------- Fetch live tables -------------------- */

  useEffect(() => {
    const fetchTables = async () => {
      try {
        const res = await fetch(
          ${import.meta.env.VITE_BACKEND_URL}/watch/list
        );
        const data = await res.json();
        setTables(data.tables || []);
      } catch {
        setTables([]);
      }
    };

    fetchTables();
    const poll = setInterval(fetchTables, 4000);
    return () => clearInterval(poll);
  }, []);

  /* -------------------- Autonomous switching -------------------- */

  useEffect(() => {
    if (!tables.length) return;

    const next = pickNextTable(
      tables,
      current?.tableId
    );

    if (!next) return;

    if (!current || next.tableId !== current.tableId) {
      setFade(true);
      setTimeout(() => {
        setCurrent(next);
        setFade(false);
      }, 600);
    }

    const timer = setTimeout(() => {
      const rotate = pickNextTable(
        tables,
        current?.tableId
      );
      if (!rotate) return;

      setFade(true);
      setTimeout(() => {
        setCurrent(rotate);
        setFade(false);
      }, 600);
    }, SWITCH_EVERY_MS);

    return () => clearTimeout(timer);
  }, [tables, current]);

  /* -------------------- Render -------------------- */

  if (!current) {
    return (
      <div style={styles.empty}>
        <h1 style={styles.logo}>SOLJACK LIVE</h1>
        <p>Waiting for live tables…</p>
      </div>
    );
  }

  return (
    <div style={styles.root}>
      <div style={styles.topBar}>
        <span style={styles.live}>● LIVE</span>
        <span style={styles.mode}>{current.mode}</span>
        <span style={styles.meta}>
          Bet {current.bet} SOL · Hand {current.hand}
        </span>
      </div>

      <div
        style={{
          ...styles.stage,
          opacity: fade ? 0 : 1,
        }}
      >
        {/* 
          TableSimple will later accept tableId
          For now it just renders visuals
        */}
        <TableSimple />
      </div>

      <div style={styles.footer}>
        <span>Table {current.tableId}</span>
        <span>Autonomous Camera</span>
      </div>
    </div>
  );
}

/* =========================
   Styles
========================= */

const styles: Record<string, React.CSSProperties> = {
  root: {
    minHeight: "100vh",
    background:
      "radial-gradient(circle at center, #0f3d24 0%, #061c12 70%)",
    color: "#fff",
    display: "flex",
    flexDirection: "column",
  },
  stage: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "opacity 600ms ease",
  },
  topBar: {
    display: "flex",
    justifyContent: "space-between",
    padding: "16px 32px",
    background: "rgba(0,0,0,0.7)",
    borderBottom: "1px solid rgba(255,215,0,0.25)",
  },
  live: {
    color: "#ff3b3b",
    fontWeight: 900,
  },
  mode: {
    color: "#ffd700",
    fontWeight: 700,
  },
  meta: {
    opacity: 0.85,
  },
  footer: {
    display: "flex",
    justifyContent: "space-between",
    padding: "12px 32px",
    background: "rgba(0,0,0,0.75)",
    fontSize: 12,
    opacity: 0.8,
  },
  empty: {
    minHeight: "100vh",
    background: "#020b06",
    color: "#fff",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },
  logo: {
    fontSize: 42,
    fontWeight: 900,
    letterSpacing: 4,
    color: "#ffd700",
  },
};