import { useEffect, useMemo, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import SpectatorTable from "../components/SpectatorTable";
import { useGameProgram } from "../lib/anchor";

const DEV_WALLET =
  "7KwQDkHVKGJ5BQ89JN83XeG1kvWdFHhf7QH5o67jiym4";

const ROTATE_PVP_MS = 12000;
const ROTATE_TOURNAMENT_MS = 8000;

const API_URL =
  (import.meta as any).env?.VITE_API_URL ||
  "http://localhost:3000";

type ChainTable = {
  id: string;
  betSol: number;
  isTournament?: boolean;
};

type PrivateMeta = {
  tableId: string;
  code: string;
  betSol: number;
  handsTotal: number;
  handsPlayed: number;
  status: "waiting" | "active" | "done";
};

type WatchedTable = {
  id: string;
  betSol: number;
  isTournament?: boolean;
  isPrivate?: boolean;
  privateCode?: string;
  handsTotal?: number;
  handsPlayed?: number;
};

export default function DevWatch() {
  const { publicKey } = useWallet();
  const program = useGameProgram();

  const [chainTables, setChainTables] = useState<ChainTable[]>([]);
  const [privateMeta, setPrivateMeta] = useState<PrivateMeta[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const authorized =
    publicKey?.toBase58() === DEV_WALLET;

  /* -------------------- Fetch Active Chain Tables -------------------- */

  useEffect(() => {
    if (!program || !authorized) return;

    const fetchTables = async () => {
      try {
        const accounts = await program.account.tableAccount.all();

        const active: ChainTable[] = accounts
          .filter((a) => a.account.opponent)
          .map((a) => ({
            id: a.publicKey.toBase58(),
            betSol: Number(a.account.betAmount) / 1e9,
            isTournament: a.account.isTournament ?? false,
          }));

        setChainTables(active);
      } catch (err) {
        console.error("DevWatch chain fetch error:", err);
      }
    };

    fetchTables();
    const int = setInterval(fetchTables, 4000);
    return () => clearInterval(int);
  }, [program, authorized]);

  /* -------------------- Fetch Private Match Metadata -------------------- */

  useEffect(() => {
    if (!authorized) return;

    const fetchPrivate = async () => {
      try {
        const res = await fetch(`${API_URL}/private/active`);
        if (!res.ok) return;
        const json = await res.json();
        setPrivateMeta(Array.isArray(json) ? json : []);
      } catch (err) {
        console.error("DevWatch private fetch error:", err);
      }
    };

    fetchPrivate();
    const int = setInterval(fetchPrivate, 4000);
    return () => clearInterval(int);
  }, [authorized]);

  /* -------------------- Merge chain + private meta -------------------- */

  const merged: WatchedTable[] = useMemo(() => {
    const privMap = new Map<string, PrivateMeta>();
    for (const p of privateMeta) privMap.set(p.tableId, p);

    return chainTables.map((t) => {
      const p = privMap.get(t.id);
      if (!p) return { id: t.id, betSol: t.betSol, isTournament: t.isTournament };
      return {
        id: t.id,
        betSol: p.betSol ?? t.betSol,
        isTournament: t.isTournament,
        isPrivate: true,
        privateCode: p.code,
        handsTotal: p.handsTotal,
        handsPlayed: p.handsPlayed,
      };
    });
  }, [chainTables, privateMeta]);

  /* -------------------- Priority Grouping -------------------- */

  const tournamentTables = useMemo(
    () => merged.filter((t) => t.isTournament),
    [merged]
  );

  const privateTables = useMemo(() => {
    // Only show active/meaningful private matches
    return merged
      .filter((t) => !t.isTournament && t.isPrivate)
      .sort((a, b) => {
        // weight by bet then by progress
        const betDiff = (b.betSol ?? 0) - (a.betSol ?? 0);
        if (betDiff !== 0) return betDiff;

        const aProg =
          (a.handsTotal ?? 0) > 0
            ? (a.handsPlayed ?? 0) / (a.handsTotal ?? 1)
            : 0;
        const bProg =
          (b.handsTotal ?? 0) > 0
            ? (b.handsPlayed ?? 0) / (b.handsTotal ?? 1)
            : 0;
        return bProg - aProg;
      });
  }, [merged]);

  const publicTables = useMemo(
    () =>
      merged
        .filter((t) => !t.isTournament && !t.isPrivate)
        .sort((a, b) => (b.betSol ?? 0) - (a.betSol ?? 0)),
    [merged]
  );

  /* -------------------- Camera Source -------------------- */

  const cameraSource = useMemo(() => {
    if (tournamentTables.length > 0) {
      return {
        mode: "tournament" as const,
        tables: tournamentTables,
        rotateMs: ROTATE_TOURNAMENT_MS,
      };
    }

    if (privateTables.length > 0) {
      return {
        mode: "private" as const,
        tables: privateTables,
        rotateMs: ROTATE_PVP_MS,
      };
    }

    return {
      mode: "public" as const,
      tables: publicTables,
      rotateMs: ROTATE_PVP_MS,
    };
  }, [tournamentTables, privateTables, publicTables]);

  /* -------------------- Auto Rotate -------------------- */

  useEffect(() => {
    setCurrentIndex(0);

    if (cameraSource.tables.length <= 1) return;

    const t = setInterval(() => {
      setCurrentIndex((i) => (i + 1) % cameraSource.tables.length);
    }, cameraSource.rotateMs);

    return () => clearInterval(t);
  }, [cameraSource]);

  /* -------------------- Guards -------------------- */

  if (!publicKey) return <Centered>Connect Phantom</Centered>;
  if (!authorized) return <Centered>Not authorized</Centered>;
  if (cameraSource.tables.length === 0) return <Centered>No live games</Centered>;

  const active = cameraSource.tables[currentIndex];

  return (
    <div style={styles.wrap}>
      <div style={styles.header}>
        <div>
          <b>DEV WATCH MODE</b>
          <div style={styles.sub}>{cameraSource.mode.toUpperCase()} VIEW</div>
        </div>

        <div style={styles.meta}>
          Bet: {active.betSol.toFixed(2)} SOL
          {active.isPrivate && active.privateCode ? (
            <span style={styles.badge}>PRIVATE {active.privateCode}</span>
          ) : null}
        </div>
      </div>

      <SpectatorTable tableId={active.id} />
    </div>
  );
}

function Centered({ children }: { children: any }) {
  return (
    <div style={styles.center}>
      <div>{children}</div>
    </div>
  );
}

const styles: { [k: string]: React.CSSProperties } = {
  wrap: { minHeight: "100vh", background: "#05060a", color: "#fff" },
  header: {
    padding: "14px 18px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottom: "1px solid rgba(255,255,255,0.1)",
    gap: 10,
  },
  sub: { fontSize: 12, opacity: 0.7 },
  meta: { fontWeight: 800, fontSize: 13, display: "flex", alignItems: "center", gap: 10 },
  badge: {
    padding: "4px 8px",
    borderRadius: 999,
    border: "1px solid rgba(255,255,255,0.18)",
    background: "rgba(255,255,255,0.06)",
    fontSize: 12,
    opacity: 0.95,
  },
  center: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontWeight: 800,
    fontSize: 18,
  },
};