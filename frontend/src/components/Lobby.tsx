import React, { useEffect, useMemo, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useGame } from "../context/GameContext";
import PrivateMatchModal from "./PrivateMatchModal";

interface LobbyProps {
  betTier: number;
}

type Role = "dealer" | "player";

export default function Lobby({ betTier }: LobbyProps) {
  const { publicKey } = useWallet();

  // GameContext typing is currently drifting while we refactor — harden Lobby so it never breaks builds.
  const game = useGame() as any;

  const joinQueue: (tier: number, role: Role) => Promise<void> = game?.joinQueue;
  const leaveQueue: () => Promise<void> = game?.leaveQueue;
  const queueStatus = game?.queueStatus; // expected shape: { inQueue?: boolean, betTier?: number, role?: Role }
  const createPrivateMatch: (tier: number, role: Role) => Promise<any> = game?.createPrivateMatch;
  const joinPrivateMatch: (code: string, role: Role) => Promise<any> = game?.joinPrivateMatch;

  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [isInQueue, setIsInQueue] = useState(false);
  const [showPrivateModal, setShowPrivateModal] = useState(false);

  const betAmount = useMemo(() => {
    // your convention: tier -> SOL amount
    return Number((betTier * 0.01).toFixed(4));
  }, [betTier]);

  // Keep local queue flags synced with server state
  useEffect(() => {
    const inQueue =
      !!queueStatus &&
      !!queueStatus.inQueue &&
      (queueStatus.betTier === undefined || queueStatus.betTier === betTier);

    setIsInQueue(!!inQueue);

    if (inQueue && queueStatus?.role) {
      setSelectedRole(queueStatus.role as Role);
    }
    if (!inQueue) {
      setSelectedRole(null);
    }
  }, [queueStatus, betTier]);

  async function handleJoinQueue(role: Role) {
    if (!publicKey) return;
    if (!joinQueue) return;

    setSelectedRole(role);
    try {
      await joinQueue(betTier, role);
      setIsInQueue(true);
    } catch (err) {
      console.error("Failed to join queue:", err);
      setSelectedRole(null);
      setIsInQueue(false);
    }
  }

  async function handleLeaveQueue() {
    if (!leaveQueue) return;
    try {
      await leaveQueue();
    } catch (err) {
      console.error("Failed to leave queue:", err);
    } finally {
      setIsInQueue(false);
      setSelectedRole(null);
    }
  }

  async function handleCreatePrivate(role: Role) {
    if (!publicKey) return;
    if (!createPrivateMatch) return;

    try {
      const res = await createPrivateMatch(betTier, role);
      // optional: show code if your backend returns it
      if (res?.match?.code) alert(`Private match created! Share this code: ${res.match.code}`);
    } catch (err) {
      console.error("Failed to create private match:", err);
      alert("Failed to create private match.");
    }
  }

  async function handleJoinPrivate(code: string, role: Role) {
    if (!publicKey) return;
    if (!joinPrivateMatch) return;

    try {
      await joinPrivateMatch(code, role);
      setShowPrivateModal(false);
    } catch (err) {
      console.error("Failed to join private match:", err);
      alert("Failed to join match. Invalid code or match full.");
    }
  }

  if (isInQueue) {
    return (
      <div style={styles.container}>
        <div style={styles.queueCard}>
          <div style={styles.spinnerContainer}>
            <div style={styles.spinner} />
          </div>

          <h2 style={styles.queueTitle}>Finding opponent...</h2>

          <p style={styles.queueInfo}>
            Role: <strong>{selectedRole === "dealer" ? "Dealer" : "Player"}</strong>
            <br />
            Bet Amount: <strong>{betAmount} SOL</strong>
          </p>

          <button onClick={handleLeaveQueue} style={styles.leaveButton}>
            Leave Queue
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>Choose Your Role</h2>
        <p style={styles.subtitle}>Bet Amount: {betAmount} SOL per hand</p>
        {!publicKey && (
          <p style={{ ...styles.subtitle, color: "#b00020" }}>
            Connect your wallet to join matches.
          </p>
        )}
      </div>

      <div style={styles.roleCards}>
        <div style={styles.roleCard}>
          <div style={styles.roleIcon}>🧑‍⚖️</div>
          <h3 style={styles.roleTitle}>Dealer</h3>
          <p style={styles.roleDescription}>Dealer draws on 16, stands on 17.</p>
          <button
            onClick={() => handleJoinQueue("dealer")}
            style={styles.roleButton}
            disabled={!publicKey}
          >
            Join as Dealer
          </button>
        </div>

        <div style={styles.roleCard}>
          <div style={styles.roleIcon}>🧑‍💻</div>
          <h3 style={styles.roleTitle}>Player</h3>
          <p style={styles.roleDescription}>You control hit/stand decisions.</p>
          <button
            onClick={() => handleJoinQueue("player")}
            style={styles.roleButton}
            disabled={!publicKey}
          >
            Join as Player
          </button>
        </div>
      </div>

      <div style={styles.privateMatchSection}>
        <button
          onClick={() => setShowPrivateModal(true)}
          style={styles.privateButton}
          disabled={!publicKey}
        >
          Create / Join Private Match
        </button>
      </div>

      {showPrivateModal && (
        <PrivateMatchModal
          betTier={betTier}
          onClose={() => setShowPrivateModal(false)}
          onCreateMatch={handleCreatePrivate}
          onJoinMatch={handleJoinPrivate}
        />
      )}
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    maxWidth: 900,
    margin: "0 auto",
    padding: "40px 20px",
    textAlign: "center",
  },
  header: {
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 800,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    margin: 0,
  },
  roleCards: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
    gap: 24,
    marginBottom: 32,
  },
  roleCard: {
    background: "white",
    borderRadius: 16,
    padding: 32,
    boxShadow: "0 4px 12px rgba(0,0,0,0.10)",
  },
  roleIcon: {
    fontSize: 56,
    marginBottom: 12,
  },
  roleTitle: {
    fontSize: 24,
    fontWeight: 800,
    marginBottom: 10,
  },
  roleDescription: {
    fontSize: 14,
    color: "#666",
    lineHeight: 1.6,
    marginBottom: 20,
    minHeight: 44,
  },
  roleButton: {
    width: "100%",
    padding: "14px 18px",
    fontSize: 16,
    fontWeight: 700,
    border: "none",
    borderRadius: 10,
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "white",
    cursor: "pointer",
  },
  privateMatchSection: {
    marginTop: 10,
  },
  privateButton: {
    padding: "12px 24px",
    fontSize: 14,
    fontWeight: 700,
    borderRadius: 10,
    border: "2px solid #667eea",
    background: "white",
    color: "#667eea",
    cursor: "pointer",
  },

  // Queue view
  queueCard: {
    background: "white",
    borderRadius: 16,
    padding: 48,
    boxShadow: "0 4px 12px rgba(0,0,0,0.10)",
    maxWidth: 420,
    margin: "0 auto",
  },
  spinnerContainer: {
    marginBottom: 18,
  },
  spinner: {
    width: 56,
    height: 56,
    margin: "0 auto",
    border: "4px solid #f3f3f3",
    borderTop: "4px solid #667eea",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  },
  queueTitle: {
    fontSize: 22,
    margin: "10px 0 12px",
    fontWeight: 800,
  },
  queueInfo: {
    fontSize: 15,
    color: "#444",
    lineHeight: 1.7,
    marginBottom: 22,
  },
  leaveButton: {
    width: "100%",
    padding: "12px 18px",
    fontSize: 16,
    fontWeight: 700,
    border: "2px solid #e53e3e",
    borderRadius: 10,
    background: "white",
    color: "#e53e3e",
    cursor: "pointer",
  },
};

// Inject spinner keyframes once (safe)
(function injectSpinOnce() {
  if (typeof document === "undefined") return;

  const id = "sj-spin-keyframes";
  if (document.getElementById(id)) return;

  const style = document.createElement("style");
  style.id = id;

  style.textContent = `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `;

  document.head.appendChild(style);
})();