import { useState } from "react";

interface TournamentLobbyProps {
  onStart: (players: string[]) => void;
  onExit: () => void;
}

export default function TournamentLobby({ onStart, onExit }: TournamentLobbyProps) {
  const [players] = useState<string[]>(["You"]);

  return (
    <div style={styles.container}>
      <div style={styles.lobby}>
        <h2 style={styles.title}>Tournament Lobby</h2>
        <div style={styles.subtitle}>0.1 SOL Entry • Winner Takes All (0.8 SOL)</div>

        <div style={styles.infoBox}>
          <div style={styles.infoIcon}>⏳</div>
          <div style={styles.infoTitle}>Real Players Only</div>
          <div style={styles.infoText}>
            Tournament will start when 8 players join the queue.
            <br />
            Payment (0.1 SOL) will be charged when lobby is full.
          </div>
        </div>

        <div style={styles.grid}>
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} style={players[i] ? styles.slotFilled : styles.slotEmpty}>
              {players[i] ? (
                <>
                  <div style={styles.playerIcon}>👤</div>
                  <div style={styles.playerName}>{players[i]}</div>
                </>
              ) : (
                <div style={styles.waiting}>Waiting...</div>
              )}
            </div>
          ))}
        </div>

        <div style={styles.status}>
          Waiting for players to join... ({players.length}/8)
        </div>

        <div style={styles.notice}>
          💡 Tournament queue system requires backend integration.
          <br />
          This is a frontend preview only.
        </div>

        <button style={styles.exitBtn} onClick={onExit}>
          Exit Lobby
        </button>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "linear-gradient(135deg, #1a5f3f 0%, #0d3d28 100%)",
    padding: 20,
  },
  lobby: {
    background: "linear-gradient(135deg, #2d5016 0%, #1a3a0f 100%)",
    borderRadius: 20,
    padding: 50,
    maxWidth: 700,
    width: "100%",
    border: "4px solid #ffd700",
    boxShadow: "0 20px 60px rgba(0,0,0,0.8)",
  },
  title: {
    fontSize: 36,
    fontWeight: 700,
    color: "#ffd700",
    textAlign: "center",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: "#fff",
    textAlign: "center",
    marginBottom: 30,
  },
  infoBox: {
    background: "rgba(255, 215, 0, 0.1)",
    border: "2px solid rgba(255, 215, 0, 0.3)",
    borderRadius: 12,
    padding: 24,
    marginBottom: 30,
    textAlign: "center",
  },
  infoIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  infoTitle: {
    fontSize: 20,
    fontWeight: 700,
    color: "#ffd700",
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: "#fff",
    lineHeight: 1.6,
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: 16,
    marginBottom: 30,
  },
  slotFilled: {
    background: "rgba(76, 175, 80, 0.2)",
    border: "2px solid #4caf50",
    borderRadius: 12,
    padding: 20,
    textAlign: "center",
  },
  slotEmpty: {
    background: "rgba(255, 255, 255, 0.05)",
    border: "2px dashed rgba(255, 255, 255, 0.3)",
    borderRadius: 12,
    padding: 20,
    textAlign: "center",
  },
  playerIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  playerName: {
    fontSize: 14,
    fontWeight: 600,
    color: "#fff",
  },
  waiting: {
    fontSize: 14,
    color: "#999",
    padding: "20px 0",
  },
  status: {
    fontSize: 20,
    fontWeight: 600,
    color: "#ffd700",
    textAlign: "center",
    marginBottom: 20,
  },
  notice: {
    fontSize: 13,
    color: "#90caf9",
    textAlign: "center",
    marginBottom: 20,
    padding: 12,
    background: "rgba(144, 202, 249, 0.1)",
    borderRadius: 8,
    lineHeight: 1.6,
  },
  exitBtn: {
    width: "100%",
    padding: 16,
    fontSize: 16,
    fontWeight: 700,
    background: "rgba(139, 105, 20, 0.8)",
    border: "2px solid #ffd700",
    borderRadius: 8,
    color: "#fff",
    cursor: "pointer",
  },
};