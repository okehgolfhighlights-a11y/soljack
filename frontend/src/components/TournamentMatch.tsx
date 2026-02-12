import { useState, useCallback, useEffect, useRef } from "react";

type Suit = "♠" | "♥" | "♦" | "♣";
type Rank = "A" | "K" | "Q" | "J" | "10" | "9" | "8" | "7" | "6" | "5" | "4" | "3" | "2";

interface Card {
  id: string;
  suit: Suit;
  rank: Rank;
}

interface TournamentMatchProps {
  player1: string;
  player2: string;
  onMatchEnd: (winner: string) => void;
}

const SUITS: Suit[] = ["♠", "♥", "♦", "♣"];
const RANKS: Rank[] = ["A", "K", "Q", "J", "10", "9", "8", "7", "6", "5", "4", "3", "2"];

function buildDeck(): Card[] {
  const deck: Card[] = [];
  let index = 0;
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      deck.push({ id: `${rank}-${suit}-${index}`, suit, rank });
      index++;
    }
  }
  return deck;
}

function shuffle(deck: Card[]): Card[] {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function handValue(hand: Card[]): number {
  let total = 0;
  let aces = 0;
  for (const card of hand) {
    if (card.rank === "A") aces++;
    else if (["K", "Q", "J"].includes(card.rank)) total += 10;
    else total += parseInt(card.rank, 10);
  }
  total += aces * 11;
  while (total > 21 && aces > 0) {
    total -= 10;
    aces--;
  }
  return total;
}

function isBlackjack(hand: Card[]): boolean {
  return hand.length === 2 && handValue(hand) === 21;
}

export default function TournamentMatch({ player1, player2, onMatchEnd }: TournamentMatchProps) {
  const [deck, setDeck] = useState<Card[]>(() => shuffle(buildDeck()));
  const [playerHand, setPlayerHand] = useState<Card[]>([]);
  const [dealerHand, setDealerHand] = useState<Card[]>([]);
  const [gamePhase, setGamePhase] = useState<"playing" | "finished">("playing");
  const [message, setMessage] = useState("");
  const [showDealerHole, setShowDealerHole] = useState(false);
  const [playerWins, setPlayerWins] = useState(0);
  const [opponentWins, setOpponentWins] = useState(0);
  const [isShuffling, setIsShuffling] = useState(false);
  
  // Track which cards have been animated
  const animatedCardsRef = useRef<Set<string>>(new Set());

  const triggerShuffle = useCallback(() => {
    setIsShuffling(true);
    setTimeout(() => {
      setIsShuffling(false);
    }, 5000);
  }, []);

  const dealHand = useCallback(() => {
    let workingDeck = [...deck];
    
    if (workingDeck.length < 4) {
      triggerShuffle();
      workingDeck = shuffle(buildDeck());
    }

    const draw = () => {
      if (workingDeck.length === 0) {
        triggerShuffle();
        workingDeck = shuffle(buildDeck());
      }
      return workingDeck.pop()!;
    };

    const p1 = draw();
    const d1 = draw();
    const p2 = draw();
    const d2 = draw();

    const player = [p1, p2];
    const dealer = [d1, d2];

    // Clear animated cards tracking for new hand
    animatedCardsRef.current.clear();

    setDeck(workingDeck);
    setPlayerHand(player);
    setDealerHand(dealer);
    setShowDealerHole(false);
    setMessage("");

    const pBJ = isBlackjack(player);
    const dBJ = isBlackjack(dealer);

    if (pBJ || dBJ) {
      setShowDealerHole(true);
      if (pBJ && dBJ) {
        setMessage("Push! (doesn't count)");
        setGamePhase("finished");
      } else if (pBJ) {
        setMessage("You win this hand!");
        setPlayerWins((w) => w + 1);
        setGamePhase("finished");
      } else {
        setMessage("Opponent wins this hand");
        setOpponentWins((w) => w + 1);
        setGamePhase("finished");
      }
    } else {
      setGamePhase("playing");
    }
  }, [deck, triggerShuffle]);

  const hit = useCallback(() => {
    setDeck((currentDeck) => {
      let workingDeck = [...currentDeck];
      if (workingDeck.length === 0) {
        triggerShuffle();
        workingDeck = shuffle(buildDeck());
      }
      const card = workingDeck.pop()!;
      setPlayerHand((h) => {
        const newHand = [...h, card];
        const val = handValue(newHand);
        if (val > 21) {
          setMessage("Bust! Opponent wins this hand");
          setOpponentWins((w) => w + 1);
          setGamePhase("finished");
          setShowDealerHole(true);
        }
        return newHand;
      });
      return workingDeck;
    });
  }, [triggerShuffle]);

  const stand = useCallback(() => {
    setShowDealerHole(true);
    setDeck((currentDeck) => {
      let workingDeck = [...currentDeck];
      let dealer = [...dealerHand];
      while (handValue(dealer) < 17) {
        if (workingDeck.length === 0) {
          triggerShuffle();
          workingDeck = shuffle(buildDeck());
        }
        dealer.push(workingDeck.pop()!);
      }
      setDealerHand(dealer);

      const pVal = handValue(playerHand);
      const dVal = handValue(dealer);

      if (dVal > 21) {
        setMessage("Dealer busts! You win this hand");
        setPlayerWins((w) => w + 1);
      } else if (pVal > dVal) {
        setMessage("You win this hand!");
        setPlayerWins((w) => w + 1);
      } else if (pVal < dVal) {
        setMessage("Opponent wins this hand");
        setOpponentWins((w) => w + 1);
      } else {
        setMessage("Push! (doesn't count)");
      }
      setGamePhase("finished");
      return workingDeck;
    });
  }, [dealerHand, playerHand, triggerShuffle]);

  useEffect(() => {
    if (playerHand.length === 0 && !isShuffling) dealHand();
  }, []);

  useEffect(() => {
    if (gamePhase === "finished" && !isShuffling) {
      if (playerWins >= 4) {
        setTimeout(() => onMatchEnd(player1), 2000);
      } else if (opponentWins >= 4) {
        setTimeout(() => onMatchEnd(player2), 2000);
      } else {
        const timer = setTimeout(dealHand, 2000);
        return () => clearTimeout(timer);
      }
    }
  }, [gamePhase, playerWins, opponentWins, isShuffling, dealHand, onMatchEnd, player1, player2]);

  const pVal = handValue(playerHand);
  const dVal = handValue(dealerHand);
  const canHit = gamePhase === "playing" && !isShuffling && pVal < 21;

  // Helper to determine if card should animate
  const shouldAnimate = (cardId: string) => {
    if (animatedCardsRef.current.has(cardId)) {
      return false;
    }
    animatedCardsRef.current.add(cardId);
    return true;
  };

  return (
    <div style={styles.container}>
      {isShuffling && (
        <div className="sj-shuffle-overlay">
          <div className="sj-shuffle-popup">
            <div className="sj-shuffle-icon">🔄</div>
            <div className="sj-shuffle-text">Shuffling Deck...</div>
            <div className="sj-shuffle-subtext">Please wait 5 seconds</div>
          </div>
        </div>
      )}

      <div style={styles.table}>
        <div style={styles.scoreboard}>
          <div style={styles.scoreItem}>
            <div style={styles.scoreLabel}>YOU</div>
            <div style={styles.scoreValue}>{playerWins}</div>
          </div>
          <div style={styles.scoreCenter}>First to 4 wins</div>
          <div style={styles.scoreItem}>
            <div style={styles.scoreLabel}>OPP</div>
            <div style={styles.scoreValue}>{opponentWins}</div>
          </div>
        </div>

        <div style={styles.dealerZone}>
          <div style={styles.label}>Dealer</div>
          <div className="sj-hand-row">
            {dealerHand.map((c, i) => (
              <div key={c.id} className={shouldAnimate(c.id) ? "sj-card-enter" : ""}>
                {i === 1 && !showDealerHole ? <CardBack /> : <PlayingCard card={c} />}
              </div>
            ))}
          </div>
          <div style={styles.score}>{showDealerHole ? dVal : dealerHand.length > 0 ? "?" : ""}</div>
        </div>

        {message && <div style={styles.message}>{message}</div>}

        <div style={styles.playerZone}>
          <div className="sj-hand-row">
            {playerHand.map((c, i) => (
              <div key={c.id} className={shouldAnimate(c.id) ? "sj-card-enter" : ""}>
                <PlayingCard card={c} />
              </div>
            ))}
          </div>
          <div style={styles.score}>{pVal}</div>
          <div style={styles.label}>Player</div>
        </div>

        <div style={styles.controls}>
          <button
            style={canHit ? styles.btnActive : styles.btnDisabled}
            onClick={hit}
            disabled={!canHit}
          >
            Hit
          </button>
          <button
            style={gamePhase === "playing" && !isShuffling ? styles.btnActive : styles.btnDisabled}
            onClick={stand}
            disabled={gamePhase !== "playing" || isShuffling}
          >
            Stand
          </button>
        </div>
      </div>
    </div>
  );
}

function PlayingCard({ card }: { card: Card }) {
  const isRed = card.suit === "♥" || card.suit === "♦";
  return (
    <div style={styles.card}>
      <div style={{ ...styles.corner, color: isRed ? "#d32f2f" : "#000" }}>
        {card.rank}
        <br />
        {card.suit}
      </div>
      <div style={{ ...styles.center, color: isRed ? "#d32f2f" : "#000" }}>{card.suit}</div>
    </div>
  );
}

function CardBack() {
  return (
    <div style={{ ...styles.card, background: "linear-gradient(135deg, #1976d2, #0d47a1)" }}>
      <div style={styles.backPattern}>🂠</div>
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
  table: {
    width: "100%",
    maxWidth: 900,
    background: "#2d5016",
    borderRadius: "200px / 100px",
    padding: "60px 40px",
    boxShadow: "0 20px 60px rgba(0,0,0,0.6), inset 0 0 40px rgba(0,0,0,0.3)",
    border: "12px solid #8b6914",
    position: "relative",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  scoreboard: {
    position: "absolute",
    top: 20,
    left: 40,
    right: 40,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  scoreItem: {
    textAlign: "center",
  },
  scoreLabel: {
    fontSize: 14,
    color: "#999",
    marginBottom: 4,
  },
  scoreValue: {
    fontSize: 32,
    fontWeight: 700,
    color: "#ffd700",
  },
  scoreCenter: {
    fontSize: 16,
    color: "#fff",
    fontWeight: 600,
  },
  dealerZone: {
    marginBottom: 80,
    textAlign: "center",
    width: "100%",
  },
  playerZone: {
    marginTop: 80,
    textAlign: "center",
    width: "100%",
  },
  label: {
    color: "#ffd700",
    fontSize: 20,
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: 2,
    marginBottom: 15,
  },
  card: {
    width: 90,
    height: 130,
    background: "#fff",
    borderRadius: 8,
    boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
    padding: 8,
    position: "relative",
  },
  corner: {
    position: "absolute",
    top: 8,
    left: 8,
    fontSize: 14,
    fontWeight: 700,
    lineHeight: 1.2,
  },
  center: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    fontSize: 48,
  },
  backPattern: {
    width: "100%",
    height: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 64,
    color: "rgba(255,255,255,0.3)",
  },
  score: {
    color: "#fff",
    fontSize: 18,
    fontWeight: 600,
    marginTop: 10,
    minHeight: 24,
  },
  message: {
    background: "rgba(255,215,0,0.9)",
    color: "#000",
    padding: "16px 24px",
    borderRadius: 12,
    fontSize: 20,
    fontWeight: 700,
    textAlign: "center",
    margin: "30px auto",
    maxWidth: 400,
  },
  controls: {
    display: "flex",
    gap: 16,
    justifyContent: "center",
    marginTop: 40,
  },
  btnActive: {
    padding: "14px 32px",
    fontSize: 16,
    fontWeight: 700,
    borderRadius: 8,
    border: "none",
    background: "linear-gradient(135deg, #4caf50, #388e3c)",
    color: "#fff",
    cursor: "pointer",
    textTransform: "uppercase",
  },
  btnDisabled: {
    padding: "14px 32px",
    fontSize: 16,
    fontWeight: 700,
    borderRadius: 8,
    border: "none",
    background: "#555",
    color: "#888",
    cursor: "not-allowed",
    opacity: 0.5,
    textTransform: "uppercase",
  },
};