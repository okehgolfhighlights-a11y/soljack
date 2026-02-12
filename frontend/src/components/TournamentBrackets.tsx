interface Match {
  player1: string;
  player2: string;
  winner?: string;
}

interface TournamentBracketProps {
  players: string[];
  results: Record<string, string>;
  onPlayMatch: (p1: string, p2: string) => void;
}

export default function TournamentBracket({
  players,
  results,
  onPlayMatch,
}: TournamentBracketProps) {
  const quarters: Match[] = [
    { player1: players[0], player2: players[1], winner: results[`${players[0]}-${players[1]}`] },
    { player1: players[2], player2: players[3], winner: results[`${players[2]}-${players[3]}`] },
    { player1: players[4], player2: players[5], winner: results[`${players[4]}-${players[5]}`] },
    { player1: players[6], player2: players[7], winner: results[`${players[6]}-${players[7]}`] },
  ];

  const semis: Match[] = [
    {
      player1: quarters[0].winner || "?",
      player2: quarters[1].winner || "?",
      winner: results[`${quarters[0].winner}-${quarters[1].winner}`],
    },
    {
      player1: quarters[2].winner || "?",
      player2: quarters[3].winner || "?",
      winner: results[`${quarters[2].winner}-${quarters[3].winner}`],
    },
  ];

  const finals: Match = {
    player1: semis[0].winner || "?",
    player2: semis[1].winner || "?",
    winner: results[`${semis[0].winner}-${semis[1].winner}`],
  };

  const renderMatch = (match: Match, onClick?: () => void) => {
    const canPlay = match.player1 !== "?" && match.player2 !== "?" && !match.winner;
    const isYourMatch = match.player1 === "You" || match.player2 === "You";

    return (
      <div
        style={{
          ...styles.match,
          ...(match.winner ? styles.matchComplete : {}),
          ...(canPlay && isYourMatch ? styles.matchActive : {}),
        }}
        onClick={canPlay && isYourMatch ? onClick : undefined}
      >
        <div style={match.winner === match.player1 ? styles.winner : styles.player}>
          {match.player1}
        </div>
        <div style={styles.vs}>vs</div>
        <div style={match.winner === match.player2 ? styles.winner : styles.player}>
          {match.player2}
        </div>
        {canPlay && isYourMatch && <div style={styles.playNow}>▶ PLAY NOW</div>}
      </div>
    );
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Tournament Bracket</h2>

      <div style={styles.bracket}>
        <div style={styles.round}>
          <div style={styles.roundTitle}>Quarterfinals</div>
          {quarters.map((m, i) => (
            <div key={i}>
              {renderMatch(m, () => onPlayMatch(m.player1, m.player2))}
            </div>
          ))}
        </div>

        <div style={styles.round}>
          <div style={styles.roundTitle}>Semifinals</div>
          {semis.map((m, i) => (
            <div key={i} style={{ marginTop: i === 0 ? 40 : 80 }}>
              {renderMatch(m, () => onPlayMatch(m.player1, m.player2))}
            </div>
          ))}
        </div>

        <div style={styles.round}>
          <div style={styles.roundTitle}>Finals</div>
          <div style={{ marginTop: 80 }}>
            {renderMatch(finals, () => onPlayMatch(finals.player1, finals.player2))}
          </div>
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #1a5f3f 0%, #0d3d28 100%)",
    padding: 40,
  },
  title: {
    fontSize: 36,
    fontWeight: 700,
    color: "#ffd700",
    textAlign: "center",
    marginBottom: 40,
  },
  bracket: {
    display: "flex",
    justifyContent: "space-around",
    maxWidth: 1200,
    margin: "0 auto",
  },
  round: {
    display: "flex",
    flexDirection: "column",
  },
  roundTitle: {
    fontSize: 20,
    fontWeight: 700,
    color: "#ffd700",
    textAlign: "center",
    marginBottom: 20,
  },
  match: {
    background: "rgba(45, 80, 22, 0.8)",
    border: "2px solid rgba(255, 215, 0, 0.3)",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    minWidth: 180,
    cursor: "default",
  },
  matchComplete: {
    opacity: 0.6,
  },
  matchActive: {
    border: "3px solid #ffd700",
    boxShadow: "0 0 20px rgba(255, 215, 0, 0.5)",
    cursor: "pointer",
  },
  player: {
    fontSize: 14,
    fontWeight: 600,
    color: "#fff",
    padding: "6px 0",
  },
  winner: {
    fontSize: 14,
    fontWeight: 700,
    color: "#ffd700",
    padding: "6px 0",
  },
  vs: {
    fontSize: 12,
    color: "#999",
    textAlign: "center",
    padding: "4px 0",
  },
  playNow: {
    marginTop: 8,
    fontSize: 12,
    fontWeight: 700,
    color: "#4caf50",
    textAlign: "center",
  },
};