import React from "react";

interface Props {
  onClose: () => void;
  entries: LeaderboardEntry[];
}

interface LeaderboardEntry {
  rank: number;
  username: string | null;
  wallet: string;
  wins: number;
  losses: number;
  totalHands: number;
}

export default function LeaderboardDropdown({ onClose, entries }: Props) {
  return (
    <>
      {/* Backdrop */}
      <div
        style={styles.backdrop}
        onClick={onClose}
      />

      {/* Panel */}
      <div
        style={styles.panel}
        onClick={(e) => e.stopPropagation()} // 🚨 CRITICAL FIX
      >
        {/* Header */}
        <div style={styles.header}>
          <strong>🏆 Leaderboard</strong>
          <button style={styles.closeButton} onClick={onClose}>
            ✕
          </button>
        </div>

        {/* Empty state */}
        {entries.length === 0 && (
          <div style={styles.empty}>No games played yet</div>
        )}

        {/* Entries */}
        <div style={styles.list}>
          {entries.map((entry) => (
            <div key={entry.rank} style={styles.entry}>
              <div style={styles.rankBadge}>{entry.rank}</div>

              <div style={styles.playerInfo}>
                <div
                  style={
                    entry.username ? styles.username : styles.wallet
                  }
                >
                  {entry.username ??
                    entry.wallet.slice(0, 6) + "..."}
                </div>

                <div style={styles.record}>
                  {entry.wins}W – {entry.losses}L
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  backdrop: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.25)",
    zIndex: 9999,
  },

  panel: {
    position: "fixed",
    top: "90px",
    left: "16px",
    width: "320px",
    maxHeight: "70vh",
    overflowY: "auto",
    background: "rgba(255,255,255,0.96)",
    backdropFilter: "blur(12px)",
    borderRadius: "16px",
    padding: "12px",
    boxShadow: "0 20px 60px rgba(0,0,0,0.35)",
    zIndex: 10000, // 🚨 ABOVE EVERYTHING
    color: "#111",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "12px",
  },

  closeButton: {
    background: "none",
    border: "none",
    fontSize: "18px",
    cursor: "pointer",
    color: "#999",
  },

  empty: {
    opacity: 0.6,
    textAlign: "center",
    padding: "16px",
    fontSize: "14px",
  },

  list: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },

  entry: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "10px",
    borderRadius: "12px",
    background: "#f5f6fa",
  },

  rankBadge: {
    width: "36px",
    height: "36px",
    borderRadius: "50%",
    background: "linear-gradient(135deg, #667eea, #764ba2)",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "bold",
    fontSize: "14px",
  },

  playerInfo: {
    flex: 1,
  },

  username: {
    fontWeight: "bold",
    fontSize: "15px",
    background: "linear-gradient(135deg, #ff7a18, #ffdd00)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },

  wallet: {
    fontSize: "14px",
    color: "#555",
  },

  record: {
    fontSize: "13px",
    color: "#666",
  },
};