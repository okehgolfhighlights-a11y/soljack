import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

type Role = "dealer" | "player";

interface QueueStatus {
  inQueue: boolean;
  betTier: number;
  role: Role | null;
}

interface GameContextValue {
  // Online indicator
  onlineCount: number;
  wsStatus: "connecting" | "open" | "closed" | "error";

  // User state
  username: string | null;
  balance: number;
  isAtTable: boolean;

  // Queue system
  joinQueue: (betTier: number, role: Role) => Promise<void>;
  leaveQueue: () => Promise<void>;
  queueStatus: QueueStatus | null;

  // Private matches
  createPrivateMatch: (betTier: number, role: Role) => Promise<string>;
  joinPrivateMatch: (code: string, role: Role) => Promise<void>;
}

const GameContext = createContext<GameContextValue | null>(null);

/* =========================================================
   WEBSOCKET URL
========================================================= */
function deriveWsUrl(): string | null {
  const envUrl = (import.meta as any).env?.VITE_WS_URL as string | undefined;
  if (envUrl && envUrl.trim()) return envUrl.trim();

  if (typeof window === "undefined") return null;

  const proto = window.location.protocol === "https:" ? "wss" : "ws";
  return `${proto}://${window.location.host}/ws`;
}

/* =========================================================
   PROVIDER
========================================================= */
export function GameProvider({ children }: { children: React.ReactNode }) {
  const [onlineCount, setOnlineCount] = useState<number>(0);
  const [wsStatus, setWsStatus] =
    useState<GameContextValue["wsStatus"]>("connecting");

  const [queueStatus, setQueueStatus] = useState<QueueStatus | null>(null);
  
  // User state (stub values - replace with real implementation)
  const [username, setUsername] = useState<string | null>(null);
  const [balance, setBalance] = useState<number>(0);
  const [isAtTable, setIsAtTable] = useState<boolean>(false);

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimerRef = useRef<number | null>(null);

  /* =========================================================
     WEBSOCKET CONNECT
  ========================================================= */
  useEffect(() => {
    const wsUrl = deriveWsUrl();
    if (!wsUrl) return;

    let alive = true;

    const connect = () => {
      if (!alive) return;

      try {
        setWsStatus("connecting");
        const ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        ws.onopen = () => {
          if (!alive) return;
          setWsStatus("open");
        };

        ws.onmessage = (ev) => {
          try {
            const data = JSON.parse(ev.data);
            if (data.type === "online_count") {
              setOnlineCount(data.count);
            }
          } catch {
            // ignore bad packets
          }
        };

        ws.onerror = () => {
          if (!alive) return;
          setWsStatus("error");
        };

        ws.onclose = () => {
          if (!alive) return;
          setWsStatus("closed");

          reconnectTimerRef.current = window.setTimeout(() => {
            connect();
          }, 1500);
        };
      } catch {
        setWsStatus("error");
      }
    };

    connect();

    return () => {
      alive = false;
      if (reconnectTimerRef.current)
        window.clearTimeout(reconnectTimerRef.current);
      wsRef.current?.close();
    };
  }, []);

  /* =========================================================
     QUEUE SYSTEM (SIMULATED SAFE VERSION)
  ========================================================= */
  async function joinQueue(betTier: number, role: Role) {
    setQueueStatus({
      inQueue: true,
      betTier,
      role,
    });
  }

  async function leaveQueue() {
    setQueueStatus(null);
  }

  /* =========================================================
     PRIVATE MATCH SYSTEM (SAFE STUB VERSION)
  ========================================================= */
  async function createPrivateMatch(
    betTier: number,
    role: Role
  ): Promise<string> {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    setQueueStatus({
      inQueue: true,
      betTier,
      role,
    });
    return code;
  }

  async function joinPrivateMatch(code: string, role: Role) {
    setQueueStatus({
      inQueue: true,
      betTier: 1,
      role,
    });
  }

  const value = useMemo(
    () => ({
      onlineCount,
      wsStatus,
      username,
      balance,
      isAtTable,
      joinQueue,
      leaveQueue,
      queueStatus,
      createPrivateMatch,
      joinPrivateMatch,
    }),
    [onlineCount, wsStatus, username, balance, isAtTable, queueStatus]
  );

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

/* =========================================================
   HOOK
========================================================= */
export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx)
    throw new Error("useGame must be used within a GameProvider");
  return ctx;
}