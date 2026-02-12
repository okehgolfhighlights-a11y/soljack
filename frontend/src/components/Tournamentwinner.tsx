interface TournamentWinnerProps {
  winner: string;
  onExit: () => void;
}

export default function TournamentWinner({ winner, onExit }: TournamentWinnerProps) {
  const isYou = winner === "You";

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <div style={styles.trophy}>🏆</div>
        <h1 style={styles.title}>
          {isYou ? "CHAMPION!" : "TOURNAMENT COMPLETE"}
        </h1>
        <div style={styles.winner}>{winner}</div>
        <div style={styles.prize}>
          {isYou ? "You won 0.8 SOL!" : `${winner} won 0.8 SOL`}
        </div>
        <button style={styles.exitBtn} onClick={onExit}>
          Return to Lobby
        </button>
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
    background: "rgba(0, 0, 0, 0.9)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10000,
  },
  modal: {
    background: "linear-gradient(135deg, #2d5016 0%, #1a3a0f 100%)",
    borderRadius: 20,
    padding: 60,
    textAlign: "center",
    border: "4px solid #ffd700",
    boxShadow: "0 0 60px rgba(255, 215, 0, 0.6)",
    maxWidth: 500,
  },
  trophy: {
    fontSize: 120,
    marginBottom: 20,
  },
  title: {
    fontSize: 48,
    fontWeight: 700,
    color: "#ffd700",
    marginBottom: 20,
    textShadow: "0 0 20px rgba(255, 215, 0, 0.8)",
  },
  winner: {
    fontSize: 32,
    fontWeight: 700,
    color: "#fff",
    marginBottom: 20,
  },
  prize: {
    fontSize: 24,
    color: "#4caf50",
    fontWeight: 600,
    marginBottom: 40,
  },
  exitBtn: {
    padding: "16px 40px",
    fontSize: 18,
    fontWeight: 700,
    background: "linear-gradient(135deg, #ff9800, #f57c00)",
    border: "none",
    borderRadius: 8,
    color: "#fff",
    cursor: "pointer",
    textTransform: "uppercase",
  },
};