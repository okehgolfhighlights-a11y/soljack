import { useState, useEffect } from "react";

interface TournamentBracketProps {
  players: string[];
  onMatchStart: (player1: string, player2: string, roundName: string, p1Avatar: string, p2Avatar: string) => void;
}

const PLAYER_AVATARS = [
  "/memes/meme1-lasereyes.png",
  "/memes/meme2-penguin.png",
  "/memes/meme3-trollface.png",
  "/memes/meme4-npc.png",
  "/memes/meme5-unicorn.png",
  "/memes/meme6-smoker.png",
  "/memes/meme7-dolphin.png",
  "/memes/meme8-hippo.png",
];

export default function TournamentBracket({ players, onMatchStart }: TournamentBracketProps) {
  const [quarterResults, setQuarterResults] = useState<string[]>([]);
  const [semiResults, setSemiResults] = useState<string[]>([]);
  const [finalWinner, setFinalWinner] = useState<string | null>(null);
  const [currentMatch, setCurrentMatch] = useState(0);

  useEffect(() => {
    // Auto-start first quarterfinal
    if (currentMatch === 0) {
      const timer = setTimeout(() => {
        onMatchStart(
          players[0], 
          players[1], 
          "Quarterfinal",
          PLAYER_AVATARS[0],
          PLAYER_AVATARS[1]
        );
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleMatchResult = (winner: string) => {
    if (currentMatch < 4) {
      // Quarterfinals
      setQuarterResults((prev) => [...prev, winner]);
      setCurrentMatch(currentMatch + 1);

      if (currentMatch < 3) {
        setTimeout(() => {
          const matchIndex = currentMatch + 1;
          onMatchStart(
            players[matchIndex * 2],
            players[matchIndex * 2 + 1],
            "Quarterfinal",
            PLAYER_AVATARS[matchIndex * 2],
            PLAYER_AVATARS[matchIndex * 2 + 1]
          );
        }, 1500);
      } else {
        // Start semifinals
        setTimeout(() => {
          onMatchStart(
            quarterResults[0],
            quarterResults[1],
            "Semifinal",
            PLAYER_AVATARS[players.indexOf(quarterResults[0])],
            PLAYER_AVATARS[players.indexOf(quarterResults[1])]
          );
        }, 2000);
      }
    } else if (currentMatch < 6) {
      // Semifinals
      setSemiResults((prev) => [...prev, winner]);
      setCurrentMatch(currentMatch + 1);

      if (currentMatch === 4) {
        setTimeout(() => {
          onMatchStart(
            quarterResults[2],
            quarterResults[3],
            "Semifinal",
            PLAYER_AVATARS[players.indexOf(quarterResults[2])],
            PLAYER_AVATARS[players.indexOf(quarterResults[3])]
          );
        }, 1500);
      } else {
        // Start final
        setTimeout(() => {
          onMatchStart(
            semiResults[0],
            semiResults[1],
            "Final",
            PLAYER_AVATARS[players.indexOf(semiResults[0])],
            PLAYER_AVATARS[players.indexOf(semiResults[1])]
          );
        }, 2000);
      }
    } else {
      // Final winner
      setFinalWinner(winner);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.bracket}>
        <h2 style={styles.title}>Tournament Bracket</h2>

        <div style={styles.rounds}>
          {/* Quarterfinals */}
          <div style={styles.round}>
            <div style={styles.roundLabel}>Quarterfinals</div>
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                style={{
                  ...styles.match,
                  ...(currentMatch === i ? styles.matchActive : {}),
                }}
              >
                <div style={styles.matchPlayer}>
                  <img src={PLAYER_AVATARS[i * 2]} alt="" style={styles.avatar} />
                  <span>{players[i * 2]}</span>
                  {quarterResults[i] === players[i * 2] && <span style={styles.winner}>✓</span>}
                </div>
                <div style={styles.matchPlayer}>
                  <img src={PLAYER_AVATARS[i * 2 + 1]} alt="" style={styles.avatar} />
                  <span>{players[i * 2 + 1]}</span>
                  {quarterResults[i] === players[i * 2 + 1] && <span style={styles.winner}>✓</span>}
                </div>
              </div>
            ))}
          </div>

          {/* Semifinals */}
          <div style={styles.round}>
            <div style={styles.roundLabel}>Semifinals</div>
            {[0, 1].map((i) => (
              <div
                key={i}
                style={{
                  ...styles.match,
                  ...(currentMatch === i + 4 ? styles.matchActive : {}),
                }}
              >
                <div style={styles.matchPlayer}>
                  {quarterResults[i * 2] && (
                    <>
                      <img src={PLAYER_AVATARS[players.indexOf(quarterResults[i * 2])]} alt="" style={styles.avatar} />
                      <span>{quarterResults[i * 2]}</span>
                      {semiResults[i] === quarterResults[i * 2] && <span style={styles.winner}>✓</span>}
                    </>
                  )}
                </div>
                <div style={styles.matchPlayer}>
                  {quarterResults[i * 2 + 1] && (
                    <>
                      <img src={PLAYER_AVATARS[players.indexOf(quarterResults[i * 2 + 1])]} alt="" style={styles.avatar} />
                      <span>{quarterResults[i * 2 + 1]}</span>
                      {semiResults[i] === quarterResults[i * 2 + 1] && <span style={styles.winner}>✓</span>}
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Final */}
          <div style={styles.round}>
            <div style={styles.roundLabel}>Final</div>
            <div
              style={{
                ...styles.match,
                ...(currentMatch === 6 ? styles.matchActive : {}),
              }}
            >
              <div style={styles.matchPlayer}>
                {semiResults[0] && (
                  <>
                    <img src={PLAYER_AVATARS[players.indexOf(semiResults[0])]} alt="" style={styles.avatar} />
                    <span>{semiResults[0]}</span>
                    {finalWinner === semiResults[0] && <span style={styles.winner}>✓</span>}
                  </>
                )}
              </div>
              <div style={styles.matchPlayer}>
                {semiResults[1] && (
                  <>
                    <img src={PLAYER_AVATARS[players.indexOf(semiResults[1])]} alt="" style={styles.avatar} />
                    <span>{semiResults[1]}</span>
                    {finalWinner === semiResults[1] && <span style={styles.winner}>✓</span>}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
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
  bracket: {
    background: "linear-gradient(135deg, #2d5016 0%, #1a3a0f 100%)",
    borderRadius: 20,
    padding: 40,
    maxWidth: 1200,
    width: "100%",
    border: "4px solid #ffd700",
    boxShadow: "0 20px 60px rgba(0,0,0,0.8)",
  },
  title: {
    fontSize: 36,
    fontWeight: 700,
    color: "#ffd700",
    textAlign: "center",
    marginBottom: 40,
  },
  rounds: {
    display: "flex",
    gap: 40,
    justifyContent: "space-around",
  },
  round: {
    display: "flex",
    flexDirection: "column",
    gap: 20,
  },
  roundLabel: {
    fontSize: 18,
    fontWeight: 700,
    color: "#ffd700",
    textAlign: "center",
    textTransform: "uppercase",
    marginBottom: 10,
  },
  match: {
    background: "rgba(255, 255, 255, 0.05)",
    border: "2px solid rgba(255, 255, 255, 0.2)",
    borderRadius: 12,
    padding: 12,
    minWidth: 200,
    transition: "all 0.3s ease",
  },
  matchActive: {
    border: "2px solid #ffd700",
    boxShadow: "0 0 20px rgba(255, 215, 0, 0.5)",
  },
  matchPlayer: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: 8,
    color: "#fff",
    fontSize: 14,
    fontWeight: 600,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: "50%",
    objectFit: "cover",
    border: "2px solid #ffd700",
  },
  winner: {
    marginLeft: "auto",
    color: "#4caf50",
    fontSize: 18,
  },
};