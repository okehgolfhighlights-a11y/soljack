import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import SpectatorTable from "./SpectatorTable";

/**
 * Dev Watch Mode (read-only spectator)
 * - Only accessible if connected wallet matches DEV_WALLET
 * - Autonomous: polls /watch/list, picks best table, then polls /watch/state/:tableId
 *
 * Backend expectations (can be mocked):
 *  GET  /watch/list               -> { tables: Array<{ tableId: string, type: 'tournament'|'private'|'pvp', startedAt?: number, updatedAt?: number }> }
 *  GET  /watch/state/:tableId     -> { state: SpectatorState }
 */
const DEV_WALLET = "7KwQDkHVKGJ5BQ89JN83XeG1kvWdFHhf7QH5o67jiym4";

type WatchTableType = "tournament" | "private" | "pvp";

type WatchTable = {
  tableId: string;
  type: WatchTableType;
  startedAt?: number;
  updatedAt?: number;
};

type SpectatorState = any;

function scoreTable(t: WatchTable): number {
  // Weighted viewing:
  // 1) tournaments
  // 2) private
  // 3) pvp
  const typeWeight: Record<WatchTableType, number> = {
    tournament: 1000,
    private: 100,
    pvp: 10,
  };
  const recency = t.updatedAt ?? t.startedAt ?? 0;
  return typeWeight[t.type] + recency / 1000;
}

export default function DevWatch() {
  const { publicKey, connected } = useWallet();

  const isDev = useMemo(() => {
    const pk = publicKey?.toBase58();
    return !!pk && pk === DEV_WALLET;
  }, [publicKey]);

  const apiBase = useMemo(() => {
    return (import.meta as any).env?.VITE_BACKEND_URL || "";
  }, []);

  const [tables, setTables] = useState<WatchTable[]>([]);
  const [activeTableId, setActiveTableId] = useState<string | null>(null);
  const [activeType, setActiveType] = useState<WatchTableType | null>(null);
  const [state, setState] = useState<SpectatorState | null>(null);
  const [error, setError] = useState<string>("");

  // Poll list
  useEffect(() => {
    let mounted = true;

    async function tick() {
      try {
        setError("");
        const res = await fetch(`${apiBase}/watch/list`);
        if (!res.ok) throw new Error(`watch/list failed: ${res.status}`);
        const data = await res.json();

        const list: WatchTable[] = Array.isArray(data?.tables) ? data.tables : [];
        if (!mounted) return;

        setTables(list);

        if (!list.length) {
          setActiveTableId(null);
          setActiveType(null);
          return;
        }

        const best = [...list].sort((a, b) => scoreTable(b) - scoreTable(a))[0];
        setActiveTableId(best.tableId);
        setActiveType(best.type);
      } catch (e: any) {
        if (!mounted) return;
        setError(e?.message || "Failed to load watch list");
      }
    }

    tick();
    const id = window.setInterval(tick, 2500);
    return () => {
      mounted = false;
      window.clearInterval(id);
    };
  }, [apiBase]);

  // Poll state for active table
  useEffect(() => {
    if (!activeTableId) {
      setState(null);
      return;
    }

    let mounted = true;

    async function tick() {
      try {
        setError("");
        const res = await fetch(`${apiBase}/watch/state/${activeTableId}`);
        if (!res.ok) throw new Error(`watch/state failed: ${res.status}`);
        const data = await res.json();
        if (!mounted) return;
        setState(data?.state ?? data);
      } catch (e: any) {
        if (!mounted) return;
        setError(e?.message || "Failed to load table state");
      }
    }

    tick();
    const id = window.setInterval(tick, 750);
    return () => {
      mounted = false;
      window.clearInterval(id);
    };
  }, [apiBase, activeTableId]);

  if (!connected || !publicKey) {
    return (
      <div style={styles.page}>
        <div style={styles.card}>
          <h2 style={styles.title}>Dev Watch</h2>
          <p style={styles.sub}>Connect Phantom to access Dev Watch mode.</p>
        </div>
      </div>
    );
  }

  if (!isDev) {
    return (
      <div style={styles.page}>
        <div style={styles.card}>
          <h2 style={styles.title}>Dev Watch</h2>
          <p style={styles.sub}>Unauthorized wallet.</p>
          <div style={styles.mono}>Connected: {publicKey.toBase58()}</div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.topBar}>
        <div>
          <div style={styles.badge}>LIVE</div>
          <div style={styles.heading}>Dev Watch Mode</div>
          <div style={styles.meta}>
            <span style={styles.pill}>Autonomous camera</span>
            {activeType && <span style={styles.pill}>{activeType.toUpperCase()}</span>}
            {activeTableId && <span style={styles.pillMono}>Table: {activeTableId}</span>}
          </div>
        </div>

        <div style={styles.right}>
          <a href="/" style={styles.link}>
            Exit
          </a>
        </div>
      </div>

      {error && <div style={styles.error}>{error}</div>}

      <div style={styles.grid}>
        <div style={styles.stage}>
          <div style={styles.stageInner}>
            {activeTableId ? (
              <SpectatorTable tableId={activeTableId} state={state} />
            ) : (
              <div style={styles.empty}>No active tables found.</div>
            )}
          </div>
        </div>

        <div style={styles.side}>
          <div style={styles.sideCard}>
            <div style={styles.sideTitle}>Now Watching</div>
            <div style={styles.sideRow}>
              <div style={styles.sideLabel}>Priority</div>
              <div style={styles.sideValue}>Tournaments → Private → PvP</div>
            </div>
            <div style={styles.sideRow}>
              <div style={styles.sideLabel}>Tables found</div>
              <div style={styles.sideValue}>{tables.length}</div>
            </div>
            <div style={styles.sideRow}>
              <div style={styles.sideLabel}>Autoselect</div>
              <div style={styles.sideValue}>{activeTableId ? "ON" : "—"}</div>
            </div>
          </div>

          <div style={styles.sideCard}>
            <div style={styles.sideTitle}>Table Feed</div>
            <div style={styles.feed}>
              {tables.slice(0, 12).map((t) => {
                const active = t.tableId === activeTableId;
                return (
                  <div
                    key={t.tableId}
                    style={{
                      ...styles.feedRow,
                      ...(active ? styles.feedRowActive : {}),
                    }}
                  >
                    <div style={styles.feedType}>{t.type.toUpperCase()}</div>
                    <div style={styles.feedId}>{t.tableId}</div>
                  </div>
                );
              })}
              {!tables.length && <div style={styles.feedEmpty}>Waiting for games…</div>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, CSSProperties> = {
  page: {
    minHeight: "100vh",
    padding: "18px",
    background:
      "radial-gradient(circle at 20% 0%, rgba(255, 94, 184, 0.25), transparent 45%), radial-gradient(circle at 80% 0%, rgba(122, 92, 255, 0.25), transparent 45%), #0b0b12",
    color: "white",
  },
  topBar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "16px",
    marginBottom: "16px",
  },
  badge: {
    display: "inline-block",
    padding: "4px 10px",
    borderRadius: "999px",
    background: "linear-gradient(135deg, #ff4ec7 0%, #7b5cff 100%)",
    fontWeight: 800,
    letterSpacing: "0.06em",
    fontSize: "12px",
  },
  heading: { fontSize: "22px", fontWeight: 800, marginTop: "8px" },
  meta: { display: "flex", gap: "8px", marginTop: "8px", flexWrap: "wrap" },
  pill: {
    padding: "6px 10px",
    borderRadius: "999px",
    background: "rgba(255,255,255,0.08)",
    border: "1px solid rgba(255,255,255,0.12)",
    fontSize: "12px",
  },
  pillMono: {
    padding: "6px 10px",
    borderRadius: "999px",
    background: "rgba(0,0,0,0.25)",
    border: "1px solid rgba(255,255,255,0.12)",
    fontSize: "12px",
    fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
  },
  right: { display: "flex", alignItems: "center", gap: "12px" },
  link: {
    color: "white",
    textDecoration: "none",
    padding: "10px 14px",
    borderRadius: "10px",
    background: "rgba(255,255,255,0.08)",
    border: "1px solid rgba(255,255,255,0.14)",
  },
  error: {
    background: "rgba(255,0,95,0.15)",
    border: "1px solid rgba(255,0,95,0.25)",
    padding: "10px 12px",
    borderRadius: "12px",
    marginBottom: "14px",
    fontSize: "14px",
  },
  grid: { display: "grid", gridTemplateColumns: "minmax(0, 1fr) 360px", gap: "16px" },
  stage: {
    borderRadius: "16px",
    overflow: "hidden",
    border: "1px solid rgba(255,255,255,0.14)",
  } as any,
  stageInner: { padding: "14px" },
  empty: { padding: "40px 10px", opacity: 0.75, textAlign: "center" },
  side: { display: "flex", flexDirection: "column", gap: "12px" },
  sideCard: {
    borderRadius: "16px",
    border: "1px solid rgba(255,255,255,0.14)",
    background: "rgba(255,255,255,0.06)",
    backdropFilter: "blur(14px)",
    padding: "14px",
  },
  sideTitle: { fontSize: "14px", fontWeight: 800, marginBottom: "10px" },
  sideRow: { display: "flex", justifyContent: "space-between", gap: "10px", marginBottom: "8px" },
  sideLabel: { opacity: 0.75, fontSize: "12px" },
  sideValue: { fontSize: "12px", fontWeight: 700 },
  feed: { display: "flex", flexDirection: "column", gap: "8px", maxHeight: "520px", overflow: "auto" },
  feedRow: {
    display: "grid",
    gridTemplateColumns: "90px 1fr",
    gap: "10px",
    padding: "10px 10px",
    borderRadius: "12px",
    border: "1px solid rgba(255,255,255,0.10)",
    background: "rgba(0,0,0,0.20)",
  },
  feedRowActive: {
    border: "1px solid rgba(255, 78, 199, 0.55)",
    background: "rgba(255, 78, 199, 0.08)",
  },
  feedType: { fontSize: "11px", fontWeight: 900, letterSpacing: "0.06em" },
  feedId: {
    fontSize: "12px",
    fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
    opacity: 0.9,
  },
  feedEmpty: { padding: "10px", opacity: 0.7, fontSize: "12px" },
  card: {
    maxWidth: "560px",
    margin: "120px auto 0",
    borderRadius: "18px",
    border: "1px solid rgba(255,255,255,0.14)",
    background: "rgba(255,255,255,0.06)",
    backdropFilter: "blur(14px)",
    padding: "18px",
    textAlign: "center",
  },
  title: { margin: 0, fontSize: "22px", fontWeight: 900 },
  sub: { marginTop: "10px", opacity: 0.8 },
  mono: {
    marginTop: "14px",
    padding: "10px",
    borderRadius: "12px",
    background: "rgba(0,0,0,0.25)",
    border: "1px solid rgba(255,255,255,0.12)",
    fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
    fontSize: "12px",
    wordBreak: "break-all",
  },
};

// Fix the stage style (some editors can auto-inject junk on paste; keep this line)
(styles.stage as any).background = "rgba(255,255,255,0.06)";
(styles.stage as any).backdropFilter = "blur(14px)";