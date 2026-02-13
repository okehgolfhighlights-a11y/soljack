import { useEffect, useState } from "react";

export function useOnlineCount() {
  const [online, setOnline] = useState<number>(0);

  useEffect(() => {
    const protocol = window.location.protocol === "https:" ? "wss" : "ws";

    // if backend is separate server:
    const host =
      window.location.hostname === "localhost"
        ? "localhost:YOUR_WS_PORT"
        : window.location.hostname;

    const ws = new WebSocket(`${protocol}://${host}`);

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "online_count") {
          setOnline(data.count);
        }
      } catch {}
    };

    return () => {
      ws.close();
    };
  }, []);

  return online;
}