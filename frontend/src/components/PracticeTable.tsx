import { useState, useEffect } from 'react';

interface Props {
  onExit: () => void;
}

export default function PracticeTable({ onExit }: Props) {
  const [gameState, setGameState] = useState<'PLAYING' | 'SETTLED'>('PLAYING');
  const [playerHand, setPlayerHand] = useState<number[]>([]);
  const [dealerHand, setDealerHand] = useState<number[]>([]);
  const [playerTotal, setPlayerTotal] = useState(0);
  const [dealerTotal, setDealerTotal] = useState(0);
  const [currentTurn, setCurrentTurn] = useState<'DEALER' | 'PLAYER'>('PLAYER');
  const [deck, setDeck] = useState<number[]>([]);
  const [deckIndex, setDeckIndex] = useState(0);
  const [dealerHoleCard, setDealerHoleCard] = useState<number | null>(null);
  const [result, setResult] = useState<'WIN' | 'LOSS' | 'PUSH' | null>(null);

  useEffect(() => {
    startNewHand();
  }, []);

  const createDeck = () => {
    const newDeck: number[] = [];
    for (let i = 0; i < 52; i++) {
      const value = (i % 13) + 1;
      newDeck.push(value === 1 ? 11 : value > 10 ? 10 : value);
    }
    // Shuffle
    for (let i = newDeck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newDeck[i], newDeck[j]] = [newDeck[j], newDeck[i]];
    }
    return newDeck;
  };

  const calculateHandValue = (hand: number[]) => {
    let total = hand.reduce((sum, card) => sum + card, 0);
    let aces = hand.filter(card => card === 11).length;
    while (total > 21 && aces > 0) {
      total -= 10;
      aces--;
    }
    return total;
  };

  const dealCard = (currentDeck: number[], currentIndex: number) => {
    if (currentIndex >= currentDeck.length) {
      const newDeck = createDeck();
      return { card: newDeck[0], newDeck, newIndex: 1 };
    }
    return { card: currentDeck[currentIndex], newDeck: currentDeck, newIndex: currentIndex + 1 };
  };

  const startNewHand = () => {
    const newDeck = createDeck();
    const pCard1 = newDeck[0];
    const dCard1 = newDeck[1];
    const pCard2 = newDeck[2];
    const dCard2 = newDeck[3];

    const newPlayerHand = [pCard1, pCard2];
    const newDealerHand = [dCard1];

    setDeck(newDeck);
    setDeckIndex(4);
    setPlayerHand(newPlayerHand);
    setDealerHand(newDealerHand);
    setDealerHoleCard(dCard2);
    setPlayerTotal(calculateHandValue(newPlayerHand));
    setDealerTotal(dCard1);
    setCurrentTurn('PLAYER');
    setGameState('PLAYING');
    setResult(null);
  };

  const handleHit = () => {
    if (currentTurn !== 'PLAYER' || gameState !== 'PLAYING') return;

    const { card, newDeck, newIndex } = dealCard(deck, deckIndex);
    const newHand = [...playerHand, card];
    const newTotal = calculateHandValue(newHand);

    setPlayerHand(newHand);
    setPlayerTotal(newTotal);
    setDeck(newDeck);
    setDeckIndex(newIndex);

    if (newTotal > 21) {
      // Player busts - dealer wins
      setCurrentTurn('DEALER');
      setTimeout(() => settleBust(), 1000);
    }
  };

  const handleStand = () => {
    if (currentTurn !== 'PLAYER' || gameState !== 'PLAYING') return;

    // Dealer's turn
    setCurrentTurn('DEALER');
    setTimeout(() => playDealerTurn(), 500);
  };

  const playDealerTurn = () => {
    let currentDealerHand = [...dealerHand, dealerHoleCard!];
    let currentTotal = calculateHandValue(currentDealerHand);
    let currentDeck = deck;
    let currentIndex = deckIndex;

    setDealerHand(currentDealerHand);
    setDealerTotal(currentTotal);
    setDealerHoleCard(null);

    // Dealer hits until 17
    const hitInterval = setInterval(() => {
      if (currentTotal < 17) {
        const { card, newDeck, newIndex } = dealCard(currentDeck, currentIndex);
        currentDealerHand = [...currentDealerHand, card];
        currentTotal = calculateHandValue(currentDealerHand);
        currentDeck = newDeck;
        currentIndex = newIndex;

        setDealerHand([...currentDealerHand]);
        setDealerTotal(currentTotal);
        setDeck(currentDeck);
        setDeckIndex(currentIndex);
      } else {
        clearInterval(hitInterval);
        setTimeout(() => settleHand(currentTotal), 1000);
      }
    }, 800);
  };

  const settleBust = () => {
    setResult('LOSS');
    setGameState('SETTLED');
  };

  const settleHand = (finalDealerTotal: number) => {
    if (finalDealerTotal > 21) {
      setResult('WIN');
    } else if (playerTotal > finalDealerTotal) {
      setResult('WIN');
    } else if (finalDealerTotal > playerTotal) {
      setResult('LOSS');
    } else {
      setResult('PUSH');
    }
    setGameState('SETTLED');
  };

  const handlePlayAgain = () => {
    startNewHand();
  };

  if (gameState === 'SETTLED') {
    return (
      <div style={styles.container}>
        <div style={styles.table}>
          <div style={styles.resultsOverlay}>
            <h2 style={{
              ...styles.resultText,
              background: result === 'WIN' 
                ? 'linear-gradient(135deg, #4caf50 0%, #81c784 100%)'
                : result === 'LOSS'
                ? 'linear-gradient(135deg, #f44336 0%, #e57373 100%)'
                : 'linear-gradient(135deg, #ff9800 0%, #ffb74d 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
              {result === 'WIN' ? 'You Won!' : result === 'LOSS' ? 'Dealer Won!' : 'Push!'}
            </h2>
            <div style={styles.practiceNote}>🤖 Practice Mode - No real money</div>
            <div style={styles.finalHands}>
              <div>
                <div style={styles.handLabel}>Your Hand: {playerTotal}</div>
                <div style={styles.cards}>
                  {playerHand.map((card, i) => (
                    <div key={i} style={styles.card}>{card}</div>
                  ))}
                </div>
              </div>
              <div>
                <div style={styles.handLabel}>Dealer Hand: {dealerTotal}</div>
                <div style={styles.cards}>
                  {dealerHand.map((card, i) => (
                    <div key={i} style={styles.card}>{card}</div>
                  ))}
                </div>
              </div>
            </div>
            <div style={styles.resultActions}>
              <button style={styles.playAgainButton} onClick={handlePlayAgain}>
                Play Again
              </button>
              <button style={styles.exitButton} onClick={onExit}>
                Exit Practice
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.practiceLabel}>🤖 Practice Mode - Free Play</div>
      
      <div style={styles.table}>
        {/* Dealer section */}
        <div style={styles.dealerSection}>
          <div style={styles.playerInfo}>
            <span>Bot Dealer</span>
            {currentTurn === 'DEALER' && (
              <div style={styles.turnIndicator}>
                <div style={styles.timerRing}>⏳</div>
              </div>
            )}
          </div>
          <div style={styles.cards}>
            {dealerHand.map((card, i) => (
              <div key={i} style={styles.card}>{card}</div>
            ))}
            {dealerHoleCard !== null && (
              <div style={styles.card}>🂠</div>
            )}
          </div>
          <div style={styles.total}>{dealerTotal}</div>
        </div>

        {/* Player section */}
        <div style={styles.playerSection}>
          <div style={styles.playerInfo}>
            <span>You (Player)</span>
            {currentTurn === 'PLAYER' && (
              <div style={styles.turnIndicator}>
                <div style={styles.timerRing}>⏳</div>
              </div>
            )}
          </div>
          <div style={styles.cards}>
            {playerHand.map((card, i) => (
              <div key={i} style={styles.card}>{card}</div>
            ))}
          </div>
          <div style={styles.total}>{playerTotal}</div>

          {currentTurn === 'PLAYER' && (
            <div style={styles.actionButtons}>
              <button style={styles.actionButton} onClick={handleStand}>
                Stand
              </button>
              <button style={styles.actionButton} onClick={handleHit}>
                Hit
              </button>
            </div>
          )}
        </div>
      </div>

      <button style={styles.exitButtonFixed} onClick={onExit}>
        Exit Practice
      </button>
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
  },
  practiceLabel: {
    position: 'fixed',
    top: '20px',
    right: '20px',
    background: 'rgba(76, 175, 80, 0.9)',
    color: 'white',
    padding: '10px 20px',
    borderRadius: '8px',
    fontWeight: 'bold',
    fontSize: '16px',
    zIndex: 1000,
  },
  table: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    background: '#1a1a1a',
    margin: '20px',
    borderRadius: '200px 200px 0 0',
    padding: '40px',
    position: 'relative',
  },
  dealerSection: {
    marginBottom: '60px',
    textAlign: 'center',
  },
  playerSection: {
    marginTop: '60px',
    textAlign: 'center',
  },
  playerInfo: {
    color: 'white',
    fontSize: '18px',
    fontWeight: 'bold',
    marginBottom: '20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '15px',
  },
  turnIndicator: {
    position: 'relative',
  },
  timerRing: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    background: 'rgba(76, 175, 80, 0.3)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '20px',
  },
  cards: {
    display: 'flex',
    gap: '10px',
    justifyContent: 'center',
    marginBottom: '15px',
  },
  card: {
    width: '80px',
    height: '120px',
    background: 'white',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '32px',
    fontWeight: 'bold',
    boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
  },
  total: {
    color: 'white',
    fontSize: '24px',
    fontWeight: 'bold',
    marginBottom: '20px',
  },
  actionButtons: {
    display: 'flex',
    gap: '20px',
    justifyContent: 'center',
  },
  actionButton: {
    padding: '15px 40px',
    fontSize: '18px',
    fontWeight: 'bold',
    border: 'none',
    borderRadius: '12px',
    cursor: 'pointer',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    transition: 'all 0.3s ease',
  },
  resultsOverlay: {
    textAlign: 'center',
    color: 'white',
  },
  resultText: {
    fontSize: '48px',
    marginBottom: '20px',
    fontWeight: 'bold',
  },
  practiceNote: {
    fontSize: '16px',
    color: '#4caf50',
    marginBottom: '30px',
    fontWeight: 'bold',
  },
  finalHands: {
    display: 'flex',
    gap: '40px',
    justifyContent: 'center',
    marginBottom: '30px',
  },
  handLabel: {
    fontSize: '18px',
    marginBottom: '10px',
  },
  resultActions: {
    display: 'flex',
    gap: '15px',
    justifyContent: 'center',
  },
  playAgainButton: {
    padding: '15px 30px',
    fontSize: '18px',
    fontWeight: 'bold',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    background: 'linear-gradient(135deg, #4caf50 0%, #81c784 100%)',
    color: 'white',
  },
  exitButton: {
    padding: '15px 30px',
    fontSize: '18px',
    fontWeight: 'bold',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    background: 'rgba(255, 255, 255, 0.2)',
    color: 'white',
  },
  exitButtonFixed: {
    position: 'fixed',
    bottom: '20px',
    right: '20px',
    padding: '12px 24px',
    fontSize: '16px',
    fontWeight: 'bold',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    background: 'rgba(244, 67, 54, 0.9)',
    color: 'white',
    zIndex: 1000,
  },
};