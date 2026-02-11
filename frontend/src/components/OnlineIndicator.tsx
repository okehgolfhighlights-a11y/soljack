import React from "react";
import { useGame } from "../context/GameContext";

export default function OnlineIndicator() {
  const { onlineCount, wsStatus } = useGame();

  const isLive = wsStatus === "open";
  const dotClass = isLive ? "sj-online-dot sj-online-dot-live" : "sj-online-dot";

  return (
    <div className="sj-online-indicator" title={isLive ? "Live" : "Connecting…"}>
      <span className={dotClass} />
      <span className="sj-online-text">
        {onlineCount} Online
      </span>
    </div>
  );
}
