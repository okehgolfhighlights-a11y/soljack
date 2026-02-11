import { useEffect, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useGame } from "../context/GameContext";

interface Props {
  onClose: () => void;
}

export default function ProfileModal({ onClose }: Props) {
  const { publicKey } = useWallet();
  const { username, balance, stats } = useGame();

  const shortenAddress = (addr: string) => {
    return `${addr.slice(0, 4)}...${addr.slice(-4)}`;
  };

  const winRate = stats.totalHands > 0 
    ? ((stats.wins / stats.totalHands) * 100).toFixed(1) 
    : "0.0";

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
        {/* Close Button */}
        <button style={styles.closeButton} onClick={onClose}>
          ✕
        </button>

        {/* Header */}
        <div style={styles.header}>
          <h2 style={styles.title}>Player Profile</h2>
          {username && <div style={styles.username}>@{username}</div>}
        </div>

        {/* Wallet Info */}
        <div style={styles.section}>
          <div style={styles.infoRow}>
            <span style={styles.label}>Wallet</span>
            <span style={styles.value}>
              {publicKey ? shortenAddress(publicKey.toBase58()) : "Not connected"}
            </span>
          </div>
          <div style={styles.infoRow}>
            <span style={styles.label}>Balance</span>
            <span style={styles.balanceValue}>{balance.toFixed(2)} SOL</span>
          </div>
        </div>

        {/* Stats Grid */}
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

        {/* Rank */}
        <div style={styles.rankSection}>
          <div style={styles.rankLabel}>Leaderboard Rank</div>
          <div style={styles.rankValue}>
            {stats.rank ? `#${stats.rank}` : "Unranked"}
          </div>
        </div>
      </div>
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
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
    padding: "20px",
  },
  modal: {
    background: "linear-gradient(135deg, #1e1e2e 0%, #2d2d44 100%)",
    borderRadius: "20px",
    padding: "40px",
    maxWidth: "500px",
    width: "100%",
    boxShadow: "0 20px 60px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.1)",
    position: "relative",
    border: "2px solid rgba(255, 215, 0, 0.3)",
  },
  closeButton: {
    position: "absolute",
    top: "20px",
    right: "20px",
    background: "rgba(255, 255, 255, 0.1)",
    border: "1px solid rgba(255, 255, 255, 0.2)",
    borderRadius: "50%",
    width: "36px",
    height: "36px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "20px",
    color: "#fff",
    cursor: "pointer",
    transition: "all 0.2s",
  },
  header: {
    textAlign: "center",
    marginBottom: "30px",
    borderBottom: "2px solid rgba(255, 215, 0, 0.2)",
    paddingBottom: "20px",
  },
  title: {
    fontSize: "28px",
    fontWeight: 700,
    margin: "0 0 10px 0",
    background: "linear-gradient(135deg, #ffd700 0%, #ffed4e 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    letterSpacing: "1px",
  },
  username: {
    fontSize: "18px",
    color: "#90caf9",
    fontWeight: 600,
  },
  section: {
    background: "rgba(255, 255, 255, 0.05)",
    borderRadius: "12px",
    padding: "20px",
    marginBottom: "24px",
    border: "1px solid rgba(255, 255, 255, 0.1)",
  },
  infoRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "12px 0",
    borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
  },
  label: {
    fontSize: "14px",
    color: "#aaa",
    textTransform: "uppercase",
    letterSpacing: "1px",
    fontWeight: 600,
  },
  value: {
    fontSize: "16px",
    color: "#fff",
    fontWeight: 600,
    fontFamily: "monospace",
  },
  balanceValue: {
    fontSize: "18px",
    color: "#ffd700",
    fontWeight: 700,
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: "16px",
    marginBottom: "24px",
  },
  statCard: {
    background: "rgba(255, 255, 255, 0.05)",
    borderRadius: "12px",
    padding: "20px",
    textAlign: "center",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    transition: "all 0.2s",
  },
  statValue: {
    fontSize: "32px",
    fontWeight: 700,
    color: "#ffd700",
    marginBottom: "8px",
  },
  statLabel: {
    fontSize: "12px",
    color: "#aaa",
    textTransform: "uppercase",
    letterSpacing: "1px",
    fontWeight: 600,
  },
  rankSection: {
    background: "linear-gradient(135deg, rgba(255, 215, 0, 0.1) 0%, rgba(255, 215, 0, 0.05) 100%)",
    borderRadius: "12px",
    padding: "20px",
    textAlign: "center",
    border: "2px solid rgba(255, 215, 0, 0.3)",
  },
  rankLabel: {
    fontSize: "14px",
    color: "#aaa",
    textTransform: "uppercase",
    letterSpacing: "1px",
    fontWeight: 600,
    marginBottom: "10px",
  },
  rankValue: {
    fontSize: "36px",
    fontWeight: 700,
    background: "linear-gradient(135deg, #ffd700 0%, #ffed4e 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },
};