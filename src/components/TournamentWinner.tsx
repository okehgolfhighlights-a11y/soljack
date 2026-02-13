import { useEffect, useState } from "react";

interface TournamentWinnerProps {
  winner: string;
  onExit: () => void;
  winnerAvatar?: string;
}

export default function TournamentWinner({ winner, onExit, winnerAvatar = "/memes/meme1-lasereyes.png" }: TournamentWinnerProps) {
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    setShowConfetti(true);
  }, []);

  return (
    <div style={styles.container}>
      {showConfetti && <Confetti />}
      
      <div style={styles.card}>
        <div style={styles.trophy}>🏆</div>
        
        <div style={styles.winnerSection}>
          <img src={winnerAvatar} alt="" style={styles.avatar} />
          <h1 style={styles.title}>{winner}</h1>
        </div>
        
        <div style={styles.subtitle}>Tournament Champion</div>
        
        <div style={styles.prize}>
          <div style={styles.prizeLabel}>Prize Pool</div>
          <div style={styles.prizeAmount}>0.8 SOL</div>
        </div>

        <button style={styles.exitBtn} onClick={onExit}>
          Return to Lobby
        </button>
      </div>
    </div>
  );
}

function Confetti() {
  return (
    <div style={styles.confettiContainer}>
      {Array.from({ length: 30 }).map((_, i) => (
        <div
          key={i}
          style={{
            ...styles.confetti,
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 3}s`,
            animationDuration: `${3 + Math.random() * 2}s`,
          }}
        />
      ))}
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
    position: "relative",
    overflow: "hidden",
  },
  card: {
    background: "linear-gradient(135deg, #2d5016 0%, #1a3a0f 100%)",
    borderRadius: 20,
    padding: 60,
    maxWidth: 500,
    width: "100%",
    border: "4px solid #ffd700",
    boxShadow: "0 0 60px rgba(255, 215, 0, 0.6), 0 20px 60px rgba(0,0,0,0.8)",
    textAlign: "center",
    position: "relative",
    zIndex: 10,
  },
  trophy: {
    fontSize: 80,
    marginBottom: 20,
    animation: "bounce 1s ease-in-out infinite",
  },
  winnerSection: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 16,
    marginBottom: 20,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: "50%",
    objectFit: "cover",
    border: "4px solid #ffd700",
    boxShadow: "0 0 30px rgba(255, 215, 0, 0.8)",
  },
  title: {
    fontSize: 42,
    fontWeight: 700,
    color: "#ffd700",
    textShadow: "0 0 20px rgba(255, 215, 0, 0.8)",
    marginBottom: 0,
  },
  subtitle: {
    fontSize: 24,
    color: "#fff",
    marginBottom: 30,
    textTransform: "uppercase",
    letterSpacing: 2,
  },
  prize: {
    background: "rgba(255, 215, 0, 0.1)",
    border: "2px solid #ffd700",
    borderRadius: 12,
    padding: 20,
    marginBottom: 30,
  },
  prizeLabel: {
    fontSize: 16,
    color: "#fff",
    opacity: 0.8,
    marginBottom: 8,
  },
  prizeAmount: {
    fontSize: 36,
    fontWeight: 700,
    color: "#ffd700",
  },
  exitBtn: {
    width: "100%",
    padding: 16,
    fontSize: 18,
    fontWeight: 700,
    background: "linear-gradient(135deg, #ff9800, #f57c00)",
    border: "none",
    borderRadius: 8,
    color: "#fff",
    cursor: "pointer",
    textTransform: "uppercase",
    transition: "all 0.2s ease",
  },
  confettiContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    pointerEvents: "none",
    overflow: "hidden",
  },
  confetti: {
    position: "absolute",
    width: 10,
    height: 10,
    background: "#ffd700",
    top: -10,
    animation: "fall 5s linear infinite",
  },
};