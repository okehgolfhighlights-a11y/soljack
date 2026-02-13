import { useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useGame } from "../context/GameContext";

interface ProfileModalProps {
  onClose: () => void;
}

export default function ProfileModal({ onClose }: ProfileModalProps) {
  const { publicKey } = useWallet();
  const { username, balance } = useGame();

  const stats = {
    wins: 0,
    losses: 0,
    totalHands: 0,
  };

  const winRate = stats.totalHands > 0 ? ((stats.wins / stats.totalHands) * 100).toFixed(1) : "0.0";

  const shortenAddress = (addr: string) => `${addr.slice(0, 4)}...${addr.slice(-4)}`;

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button style={styles.closeBtn} onClick={onClose}>
          ✕
        </button>

        <div style={styles.header}>
          <h2 style={styles.title}>Profile</h2>
          {username && <div style={styles.username}>@{username}</div>}
        </div>

        <div style={styles.section}>
          <div style={styles.row}>
            <span style={styles.label}>Wallet</span>
            <span style={styles.value}>
              {publicKey ? shortenAddress(publicKey.toBase58()) : "Not connected"}
            </span>
          </div>
          <div style={styles.row}>
            <span style={styles.label}>Balance</span>
            <span style={styles.balanceValue}>{balance.toFixed(2)} SOL</span>
          </div>
        </div>

        <div style={styles.statsGrid}>
          <div style={styles.statCard}>
            <div style={styles.statValue}>{stats.wins}</div>
            <div style={styles.statLabel}>Wins</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statValue}>{stats.losses}</div>
            <div style={styles.statLabel}>Losses</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statValue}>{stats.totalHands}</div>
            <div style={styles.statLabel}>Total Hands</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statValue}>{winRate}%</div>
            <div style={styles.statLabel}>Win Rate</div>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "rgba(0, 0, 0, 0.75)",
    backdropFilter: "blur(4px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 3000,
    padding: 20,
  },
  modal: {
    background: "linear-gradient(135deg, #1e1e2e 0%, #2d2d44 100%)",
    borderRadius: 20,
    padding: 40,
    maxWidth: 500,
    width: "100%",
    boxShadow: "0 20px 60px rgba(0, 0, 0, 0.5)",
    border: "2px solid rgba(255, 215, 0, 0.3)",
    position: "relative",
  },
  closeBtn: {
    position: "absolute",
    top: 20,
    right: 20,
    background: "rgba(255, 255, 255, 0.1)",
    border: "1px solid rgba(255, 255, 255, 0.2)",
    borderRadius: "50%",
    width: 36,
    height: 36,
    fontSize: 20,
    color: "#fff",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  header: {
    textAlign: "center",
    marginBottom: 30,
    borderBottom: "2px solid rgba(255, 215, 0, 0.2)",
    paddingBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 700,
    margin: "0 0 10px 0",
    background: "linear-gradient(135deg, #ffd700 0%, #ffed4e 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },
  username: {
    fontSize: 18,
    color: "#90caf9",
    fontWeight: 600,
  },
  section: {
    background: "rgba(255, 255, 255, 0.05)",
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    border: "1px solid rgba(255, 255, 255, 0.1)",
  },
  row: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "12px 0",
    borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
  },
  label: {
    fontSize: 14,
    color: "#aaa",
    textTransform: "uppercase",
    fontWeight: 600,
  },
  value: {
    fontSize: 16,
    color: "#fff",
    fontWeight: 600,
    fontFamily: "monospace",
  },
  balanceValue: {
    fontSize: 18,
    color: "#ffd700",
    fontWeight: 700,
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: 16,
  },
  statCard: {
    background: "rgba(255, 255, 255, 0.05)",
    borderRadius: 12,
    padding: 20,
    textAlign: "center",
    border: "1px solid rgba(255, 255, 255, 0.1)",
  },
  statValue: {
    fontSize: 32,
    fontWeight: 700,
    color: "#ffd700",
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 12,
    color: "#aaa",
    textTransform: "uppercase",
    fontWeight: 600,
  },
};