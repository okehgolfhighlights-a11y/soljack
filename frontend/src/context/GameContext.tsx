import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";

type OnlineMsg =
  | { type: "online_count"; count: number }
  | { type: "ping" }
  | { type: "pong" }
  | { type: string; [k: string]: any };

interface GameContextValue {
  onlineCount: number;
  wsStatus: "connecting" | "open" | "closed" | "error";
}

const GameContext = createContext<GameContextValue | null>(null);

function deriveWsUrl(): string | null {
  // Prefer explicit env var for prod (recommended)
  const envUrl = (import.meta as any).env?.VITE_WS_URL as string | undefined;
  if (envUrl && envUrl.trim()) return envUrl.trim();

  // Fallback: same host, /ws
  if (typeof window === "undefined") return null;
  const proto = window.location.protocol === "https:" ? "wss" : "ws";
  return `${proto}://${window.location.host}/ws`;
}

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [onlineCount, setOnlineCount] = useState<number>(0);
  const [wsStatus, setWsStatus] = useState<GameContextValue["wsStatus"]>("connecting");

  const wsRef = useRef<WebSocket | null>(null);
  const retryRef = useRef<number>(0);
  const pingTimerRef = useRef<number | null>(null);
  const reconnectTimerRef = useRef<number | null>(null);

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
          retryRef.current = 0;
          setWsStatus("open");

          // Ask server for latest count (optional)
          try {
            ws.send(JSON.stringify({ type: "get_online_count" }));
          } catch {}

          // Heartbeat every 15s (server can ignore)
          if (pingTimerRef.current) window.clearInterval(pingTimerRef.current);
          pingTimerRef.current = window.setInterval(() => {
            try {
              ws.send(JSON.stringify({ type: "ping" }));
            } catch {}
          }, 15000);
        };

        ws.onmessage = (ev) => {
          if (!alive) return;
          let data: OnlineMsg | null = null;
          try {
            data = JSON.parse(ev.data);
          } catch {
            return;
          }
          if (!data) return;

          if (data.type === "online_count" && typeof (data as any).count === "number") {
            setOnlineCount((data as any).count);
          }

          if (data.type === "pong") {
            // no-op
          }
        };

        ws.onerror = () => {
          if (!alive) return;
          setWsStatus("error");
        };

        ws.onclose = () => {
          if (!alive) return;
          setWsStatus("closed");
          if (pingTimerRef.current) {
            window.clearInterval(pingTimerRef.current);
            pingTimerRef.current = null;
          }

          // Exponential-ish backoff: 0.5s, 1s, 2s, 3s, 5s max
          retryRef.current += 1;
          const delay = Math.min(5000, 500 * Math.pow(2, Math.min(4, retryRef.current - 1)));
          if (reconnectTimerRef.current) window.clearTimeout(reconnectTimerRef.current);
          reconnectTimerRef.current = window.setTimeout(connect, delay);
        };
      } catch {
        setWsStatus("error");
      }
    };

    connect();

    return () => {
      alive = false;
      if (reconnectTimerRef.current) window.clearTimeout(reconnectTimerRef.current);
      if (pingTimerRef.current) window.clearInterval(pingTimerRef.current);
      try {
        wsRef.current?.close();
      } catch {}
      wsRef.current = null;
    };
  }, []);

  const value = useMemo(() => ({ onlineCount, wsStatus }), [onlineCount, wsStatus]);

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error("useGame must be used within a GameProvider");
  return ctx;
}
