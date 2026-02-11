import React, { useState, useCallback, useMemo, useEffect } from "react";

type Suit = "♠" | "♥" | "♦" | "♣";
type Rank = "A" | "K" | "Q" | "J" | "10" | "9" | "8" | "7" | "6" | "5" | "4" | "3" | "2";

interface Card {
  id: string;
  suit: Suit;
  rank: Rank;
}

interface GameState {
  deck: Card[];
  playerHand: Card[];
  dealerHand: Card[];
  gamePhase: "betting" | "player_turn" | "dealer_turn" | "finished";
  message: string;
  bankroll: number;
  isReshuffling: boolean;
}

interface Props {
  onExit: () => void;
}

const SUITS: Suit[] = ["♠", "♥", "♦", "♣"];
const RANKS: Rank[] = ["A", "K", "Q", "J", "10", "9", "8", "7", "6", "5", "4", "3", "2"];
const BET_AMOUNT = 0.05;
const RESHUFFLE_DELAY = 5000;

function createDeck(): Card[] {
  const deck: Card[] = [];
  let index = 0;
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      deck.push({
        id: `${rank}-${suit}-${index}`,
        suit,
        rank,
      });
      index++;
    }
  }
  return deck;
}

function shuffleDeck(deck: Card[]): Card[] {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function calculateHandValue(hand: Card[]): number {
  let total = 0;
  let aces = 0;

  for (const card of hand) {
    if (card.rank === "A") {
      aces++;
    } else if (["K", "Q", "J"].includes(card.rank)) {
      total += 10;
    } else {
      total += parseInt(card.rank, 10);
    }
  }

  total += aces * 11;
  while (total > 21 && aces > 0) {
    total -= 10;
    aces--;
  }

  return total;
}

function isBlackjack(hand: Card[]): boolean {
  return hand.length === 2 && calculateHandValue(hand) === 21;
}

export default function PracticeTable({ onExit }: Props) {
  const [state, setState] = useState<GameState>(() => {
    const savedBankroll = localStorage.getItem("practice_bankroll");
    const savedDeck = localStorage.getItem("practice_deck");
    
    return {
      deck: savedDeck ? JSON.parse(savedDeck) : shuffleDeck(createDeck()),
      playerHand: [],
      dealerHand: [],
      gamePhase: "betting",
      message: "",
      bankroll: savedBankroll ? parseFloat(savedBankroll) : 1.0,
      isReshuffling: false,
    };
  });

  // Persist bankroll and deck to localStorage
  useEffect(() => {
    localStorage.setItem("practice_bankroll", state.bankroll.toFixed(2));
    localStorage.setItem("practice_deck", JSON.stringify(state.deck));
  }, [state.bankroll, state.deck]);

  const playerValue = useMemo(() => calculateHandValue(state.playerHand), [state.playerHand]);
  const dealerValue = useMemo(() => calculateHandValue(state.dealerHand), [state.dealerHand]);

  const drawCards = useCallback((count: number, currentDeck: Card[]): [Card[], Card[], boolean] => {
    let deck = [...currentDeck];
    const drawn: Card[] = [];
    let needsReshuffle = false;

    for (let i = 0; i < count; i++) {
      if (deck.length === 0) {
        needsReshuffle = true;
        deck = shuffleDeck(createDeck());
      }
      drawn.push(deck[0]);
      deck = deck.slice(1);
    }

    return [drawn, deck, needsReshuffle];
  }, []);

  const dealNewHand = useCallback(() => {
    setState((prev) => {
      const [cards, newDeck, needsReshuffle] = drawCards(4, prev.deck);

      // If we needed to reshuffle during the draw, show reshuffle modal
      if (needsReshuffle) {
        return {
          ...prev,
          isReshuffling: true,
          deck: newDeck,
        };
      }

      const playerHand = [cards[0], cards[2]];
      const dealerHand = [cards[1], cards[3]];

      const playerBJ = isBlackjack(playerHand);
      const dealerBJ = isBlackjack(dealerHand);

      if (playerBJ || dealerBJ) {
        let message = "";
        let bankrollDelta = 0;

        if (playerBJ && dealerBJ) {
          message = "Push! Both Blackjack.";
          bankrollDelta = 0;
        } else if (playerBJ) {
          message = `Blackjack! You win ${(BET_AMOUNT * 1.5).toFixed(2)} SOL`;
          bankrollDelta = BET_AMOUNT * 1.5;
        } else {
          message = `Dealer Blackjack. You lose ${BET_AMOUNT.toFixed(2)} SOL`;
          bankrollDelta = -BET_AMOUNT;
        }

        return {
          deck: newDeck,
          playerHand,
          dealerHand,
          gamePhase: "finished",
          message,
          bankroll: parseFloat((prev.bankroll + bankrollDelta).toFixed(2)),
          isReshuffling: false,
        };
      }

      return {
        deck: newDeck,
        playerHand,
        dealerHand,
        gamePhase: "player_turn",
        message: "",
        bankroll: prev.bankroll,
        isReshuffling: false,
      };
    });
  }, [drawCards]);

  const hit = useCallback(() => {
    setState((prev) => {
      if (prev.gamePhase !== "player_turn") return prev;

      const [cards, newDeck, needsReshuffle] = drawCards(1, prev.deck);

      if (needsReshuffle) {
        return {
          ...prev,
          isReshuffling: true,
          deck: newDeck,
        };
      }

      const newHand = [...prev.playerHand, cards[0]];
      const value = calculateHandValue(newHand);

      if (value > 21) {
        return {
          ...prev,
          deck: newDeck,
          playerHand: newHand,
          gamePhase: "finished",
          message: `Bust! You lose ${BET_AMOUNT.toFixed(2)} SOL`,
          bankroll: parseFloat((prev.bankroll - BET_AMOUNT).toFixed(2)),
        };
      }

      return {
        ...prev,
        deck: newDeck,
        playerHand: newHand,
      };
    });
  }, [drawCards]);

  const stand = useCallback(() => {
    setState((prev) => {
      if (prev.gamePhase !== "player_turn") return prev;

      let dealerHand = [...prev.dealerHand];
      let deck = [...prev.deck];
      let needsReshuffle = false;

      while (calculateHandValue(dealerHand) < 17) {
        if (deck.length === 0) {
          needsReshuffle = true;
          deck = shuffleDeck(createDeck());
        }
        dealerHand.push(deck[0]);
        deck = deck.slice(1);
      }

      if (needsReshuffle) {
        return {
          ...prev,
          isReshuffling: true,
          dealerHand,
          deck,
        };
      }

      const playerVal = calculateHandValue(prev.playerHand);
      const dealerVal = calculateHandValue(dealerHand);

      let message = "";
      let bankrollDelta = 0;

      if (dealerVal > 21) {
        message = `Dealer busts! You win ${BET_AMOUNT.toFixed(2)} SOL`;
        bankrollDelta = BET_AMOUNT;
      } else if (playerVal > dealerVal) {
        message = `You win ${BET_AMOUNT.toFixed(2)} SOL`;
        bankrollDelta = BET_AMOUNT;
      } else if (playerVal < dealerVal) {
        message = `You lose ${BET_AMOUNT.toFixed(2)} SOL`;
        bankrollDelta = -BET_AMOUNT;
      } else {
        message = "Push!";
        bankrollDelta = 0;
      }

      return {
        deck,
        playerHand: prev.playerHand,
        dealerHand,
        gamePhase: "finished",
        message,
        bankroll: parseFloat((prev.bankroll + bankrollDelta).toFixed(2)),
        isReshuffling: false,
      };
    });
  }, []);

  const resetBankroll = useCallback(() => {
    setState((prev) => ({
      ...prev,
      bankroll: 1.0,
      deck: shuffleDeck(createDeck()),
    }));
    localStorage.setItem("practice_bankroll", "1.00");
  }, []);

  // Auto-deal on initial mount
  useEffect(() => {
    if (state.gamePhase === "betting" && state.playerHand.length === 0 && !state.isReshuffling) {
      const timer = setTimeout(() => dealNewHand(), 100);
      return () => clearTimeout(timer);
    }
  }, [state.gamePhase, state.playerHand.length, state.isReshuffling, dealNewHand]);

  // Auto-deal after hand finishes (2 second delay)
  useEffect(() => {
    if (state.gamePhase === "finished" && !state.isReshuffling) {
      const timer = setTimeout(() => {
        dealNewHand();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [state.gamePhase, state.isReshuffling, dealNewHand]);

  // Handle reshuffle delay
  useEffect(() => {
    if (state.isReshuffling) {
      const timer = setTimeout(() => {
        setState(prev => ({
          ...prev,
          isReshuffling: false,
        }));
      }, RESHUFFLE_DELAY);
      return () => clearTimeout(timer);
    }
  }, [state.isReshuffling]);

  const isPlayerTurn = state.gamePhase === "player_turn";
  const cardsRemaining = state.deck.length;

  return (
    <div style={styles.container}>
      {/* Reshuffle Modal */}
      {state.isReshuffling && (
        <div style={styles.reshuffleOverlay}>
          <div style={styles.reshuffleModal}>
            <div style={styles.reshuffleIcon}>🔄</div>
            <h2 style={styles.reshuffleTitle}>Shuffling Deck...</h2>
            <p style={styles.reshuffleText}>
              The deck has been depleted and is being reshuffled.
            </p>
            <div style={styles.reshuffleTimer}>5 seconds</div>
          </div>
        </div>
      )}

      <div style={styles.table}>
        {/* Bankroll Display */}
        <div style={styles.bankrollBar}>
          <div style={styles.bankrollText}>
            Bankroll: <strong>{state.bankroll.toFixed(2)} SOL</strong>
          </div>
          <div style={styles.topRight}>
            <div style={styles.cardCounter}>
              Cards Left: <strong>{cardsRemaining}</strong>
            </div>
            <button style={styles.resetButton} onClick={resetBankroll}>
              Reset
            </button>
          </div>
        </div>

        {/* Dealer Section */}
        <div style={styles.dealerSection}>
          <div style={styles.sectionLabel}>Dealer</div>
          <div style={styles.handContainer}>
            {state.dealerHand.map((card, index) => (
              <div
                key={card.id}
                style={{
                  ...styles.cardWrapper,
                  left: `${index * 40}px`,
                  zIndex: index,
                }}
              >
                {index === 1 && state.gamePhase === "player_turn" ? (
                  <CardBack />
                ) : (
                  <PlayingCard card={card} />
                )}
              </div>
            ))}
          </div>
          <div style={styles.scoreDisplay}>
            {state.dealerHand.length > 0 && `Score: ${dealerValue}`}
          </div>
        </div>

        {/* Message Display */}
        {state.message && (
          <div style={styles.messageBox}>
            {state.message}
          </div>
        )}

        {/* Player Section */}
        <div style={styles.playerSection}>
          <div style={styles.handContainer}>
            {state.playerHand.map((card, index) => (
              <div
                key={card.id}
                style={{
                  ...styles.cardWrapper,
                  left: `${index * 40}px`,
                  zIndex: index,
                }}
              >
                <PlayingCard card={card} />
              </div>
            ))}
          </div>
          <div style={styles.scoreDisplay}>
            {state.playerHand.length > 0 && `Score: ${playerValue}`}
          </div>
          <div style={styles.sectionLabel}>Player</div>
        </div>

        {/* Controls */}
        <div style={styles.controls}>
          <button
            style={{
              ...styles.button,
              ...(isPlayerTurn ? styles.buttonActive : styles.buttonDisabled),
            }}
            onClick={hit}
            disabled={!isPlayerTurn}
          >
            Hit
          </button>
          <button
            style={{
              ...styles.button,
              ...(isPlayerTurn ? styles.buttonActive : styles.buttonDisabled),
            }}
            onClick={stand}
            disabled={!isPlayerTurn}
          >
            Stand
          </button>
          <button
            style={{
              ...styles.button,
              ...styles.buttonLobby,
            }}
            onClick={onExit}
          >
            Lobby
          </button>
        </div>
      </div>
    </div>
  );
}

function PlayingCard({ card }: { card: Card }) {
  const isRed = card.suit === "♥" || card.suit === "♦";
  const color = isRed ? "#dc143c" : "#000";

  return (
    <div style={styles.card}>
      <div style={{ ...styles.cardCornerTop, color }}>
        <div style={styles.cardRank}>{card.rank}</div>
        <div style={styles.cardSuit}>{card.suit}</div>
      </div>
      <div style={{ ...styles.cardCenter, color }}>
        {card.suit}
      </div>
      <div style={{ ...styles.cardCornerBottom, color }}>
        <div style={styles.cardRank}>{card.rank}</div>
        <div style={styles.cardSuit}>{card.suit}</div>
      </div>
    </div>
  );
}

function CardBack() {
  return (
    <div style={styles.card}>
      <div style={styles.cardBackPattern}>
        🂠
      </div>
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "linear-gradient(135deg, #1a5f3f 0%, #0d3d28 100%)",
    padding: "20px",
    position: "relative",
  },
  reshuffleOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "rgba(0, 0, 0, 0.85)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10000,
  },
  reshuffleModal: {
    background: "linear-gradient(135deg, #2d5016 0%, #1a3a0f 100%)",
    borderRadius: "20px",
    padding: "50px 60px",
    textAlign: "center",
    border: "4px solid #ffd700",
    boxShadow: "0 20px 60px rgba(0, 0, 0, 0.8)",
  },
  reshuffleIcon: {
    fontSize: "72px",
    marginBottom: "20px",
  },
  reshuffleTitle: {
    fontSize: "32px",
    fontWeight: 700,
    color: "#ffd700",
    marginBottom: "16px",
    textShadow: "0 2px 8px rgba(0, 0, 0, 0.5)",
  },
  reshuffleText: {
    fontSize: "18px",
    color: "#fff",
    marginBottom: "24px",
  },
  reshuffleTimer: {
    fontSize: "24px",
    fontWeight: 700,
    color: "#4caf50",
    background: "rgba(76, 175, 80, 0.2)",
    padding: "12px 24px",
    borderRadius: "8px",
    display: "inline-block",
  },
  table: {
    width: "100%",
    maxWidth: "900px",
    background: "#2d5016",
    borderRadius: "200px / 100px",
    padding: "60px 40px",
    boxShadow: "0 20px 60px rgba(0, 0, 0, 0.6), inset 0 0 40px rgba(0, 0, 0, 0.3)",
    border: "12px solid #8b6914",
    position: "relative",
  },
  bankrollBar: {
    position: "absolute",
    top: "20px",
    left: "40px",
    right: "40px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  bankrollText: {
    color: "#ffd700",
    fontSize: "18px",
    fontWeight: 600,
    textShadow: "0 2px 4px rgba(0,0,0,0.5)",
  },
  topRight: {
    display: "flex",
    gap: "16px",
    alignItems: "center",
  },
  cardCounter: {
    color: "#90caf9",
    fontSize: "16px",
    fontWeight: 600,
    textShadow: "0 2px 4px rgba(0,0,0,0.5)",
  },
  resetButton: {
    padding: "8px 16px",
    background: "rgba(139, 105, 20, 0.8)",
    border: "2px solid #ffd700",
    borderRadius: "6px",
    color: "#fff",
    fontSize: "14px",
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.2s",
  },
  dealerSection: {
    marginBottom: "80px",
    textAlign: "center",
  },
  playerSection: {
    marginTop: "80px",
    textAlign: "center",
  },
  sectionLabel: {
    color: "#ffd700",
    fontSize: "20px",
    fontWeight: 700,
    marginBottom: "20px",
    textTransform: "uppercase",
    letterSpacing: "2px",
    textShadow: "0 2px 4px rgba(0,0,0,0.5)",
  },
  handContainer: {
    position: "relative",
    height: "140px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    margin: "0 auto",
  },
  cardWrapper: {
    position: "absolute",
    transition: "all 0.3s ease",
  },
  card: {
    width: "90px",
    height: "130px",
    background: "#fff",
    borderRadius: "8px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
    padding: "8px",
    position: "relative",
    border: "1px solid #ddd",
  },
  cardCornerTop: {
    position: "absolute",
    top: "8px",
    left: "8px",
    fontSize: "14px",
    fontWeight: 700,
    lineHeight: "1",
  },
  cardCornerBottom: {
    position: "absolute",
    bottom: "8px",
    right: "8px",
    fontSize: "14px",
    fontWeight: 700,
    lineHeight: "1",
    transform: "rotate(180deg)",
  },
  cardRank: {
    fontSize: "16px",
  },
  cardSuit: {
    fontSize: "14px",
  },
  cardCenter: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    fontSize: "48px",
  },
  scoreDisplay: {
    color: "#fff",
    fontSize: "18px",
    fontWeight: 600,
    marginTop: "10px",
    textShadow: "0 2px 4px rgba(0,0,0,0.5)",
    minHeight: "24px",
  },
  messageBox: {
    background: "rgba(255, 215, 0, 0.9)",
    color: "#000",
    padding: "16px 24px",
    borderRadius: "12px",
    fontSize: "20px",
    fontWeight: 700,
    textAlign: "center",
    margin: "30px auto",
    maxWidth: "400px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
  },
  controls: {
    display: "flex",
    gap: "16px",
    justifyContent: "center",
    marginTop: "40px",
  },
  button: {
    padding: "14px 32px",
    fontSize: "16px",
    fontWeight: 700,
    borderRadius: "8px",
    border: "none",
    cursor: "pointer",
    transition: "all 0.2s",
    textTransform: "uppercase",
    letterSpacing: "1px",
    minWidth: "120px",
  },
  buttonActive: {
    background: "linear-gradient(135deg, #4caf50 0%, #388e3c 100%)",
    color: "#fff",
    boxShadow: "0 4px 12px rgba(76, 175, 80, 0.4)",
  },
  buttonLobby: {
    background: "linear-gradient(135deg, #ff9800 0%, #f57c00 100%)",
    color: "#fff",
    boxShadow: "0 4px 12px rgba(255, 152, 0, 0.4)",
  },
  buttonDisabled: {
    background: "#555",
    color: "#888",
    cursor: "not-allowed",
    opacity: 0.5,
  },
    cardBackPattern: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "linear-gradient(135deg, #1976d2 0%, #0d47a1 100%)",
    borderRadius: "8px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "64px",
    color: "rgba(255, 255, 255, 0.3)",
  },
};