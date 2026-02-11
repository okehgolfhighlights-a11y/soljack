import { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useGame } from '../context/GameContext';

export default function TableSimple() {
  const { publicKey } = useWallet();
  const { 
    gameState, 
    hit, 
    stand, 
    leaveTable,
    dealerHit,
    dealerStand 
  } = useGame();

  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!gameState) return;

    // Update message based on game state
    if (gameState.phase === 'waiting') {
      setMessage('Waiting for opponent...');
    } else if (gameState.phase === 'player_turn') {
      setMessage(gameState.currentPlayer === publicKey?.toBase58() 
        ? 'Your turn - Hit or Stand?' 
        : 'Waiting for opponent...');
    } else if (gameState.phase === 'dealer_turn') {
      setMessage(gameState.dealerPubkey === publicKey?.toBase58()
        ? 'Your turn as Dealer - Hit or Stand?'
        : 'Dealer is playing...');
    } else if (gameState.phase === 'finished') {
      const winner = gameState.winner;
      if (winner === publicKey?.toBase58()) {
        setMessage('🎉 You won!');
      } else if (winner === 'push') {
        setMessage('Push - Tie game');
      } else {
        setMessage('You lost');
      }
    }
  }, [gameState, publicKey]);

  if (!gameState) {
    return (
      <div style={styles.container}>
        <p>Loading game...</p>
      </div>
    );
  }

  const isDealer = gameState.dealerPubkey === publicKey?.toBase58();
  const isMyTurn = gameState.phase === 'player_turn' 
    ? gameState.currentPlayer === publicKey?.toBase58()
    : gameState.phase === 'dealer_turn' && isDealer;

  const playerHand = isDealer ? gameState.playerHand : gameState.dealerHand;
  const opponentHand = isDealer ? gameState.dealerHand : gameState.playerHand;

  return (
    <div style={styles.container}>
      <div style={styles.table}>
        {/* Header */}
        <div style={styles.header}>
          <h2 style={styles.title}>SolJack Table</h2>
          <button onClick={leaveTable} style={styles.leaveButton}>
            Leave Table
          </button>
        </div>

        {/* Game Info */}
        <div style={styles.gameInfo}>
          <p style={styles.betAmount}>Bet: {gameState.betAmount} SOL</p>
          <p style={styles.message}>{message}</p>
        </div>

        {/* Opponent's Hand */}
        <div style={styles.handSection}>
          <h3 style={styles.handTitle}>
            {isDealer ? 'Player' : 'Dealer'} {!isDealer && '(You)'}
          </h3>
          <div style={styles.cards}>
            {opponentHand.map((card, i) => (
              <div key={i} style={styles.card}>
                {renderCard(card)}
              </div>
            ))}
          </div>
          <p style={styles.handValue}>
            Total: {calculateHandValue(opponentHand)}
          </p>
        </div>

        {/* Player's Hand */}
        <div style={styles.handSection}>
          <h3 style={styles.handTitle}>
            {isDealer ? 'Dealer' : 'Player'} (You)
          </h3>
          <div style={styles.cards}>
            {playerHand.map((card, i) => (
              <div key={i} style={styles.card}>
                {renderCard(card)}
              </div>
            ))}
          </div>
          <p style={styles.handValue}>
            Total: {calculateHandValue(playerHand)}
          </p>
        </div>

        {/* Action Buttons */}
        {isMyTurn && gameState.phase !== 'finished' && (
          <div style={styles.actions}>
            <button 
              onClick={() => isDealer ? dealerHit() : hit()} 
              style={styles.actionButton}
            >
              Hit
            </button>
            <button 
              onClick={() => isDealer ? dealerStand() : stand()} 
              style={{...styles.actionButton, ...styles.standButton}}
            >
              Stand
            </button>
          </div>
        )}

        {/* Game Result */}
        {gameState.phase === 'finished' && (
          <div style={styles.result}>
            <h3 style={styles.resultTitle}>Game Over</h3>
            <p style={styles.resultMessage}>{message}</p>
            {gameState.winner === publicKey?.toBase58() && (
              <p style={styles.winnings}>
                +{gameState.betAmount * 2} SOL
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* =======================
   HELPER FUNCTIONS
======================= */

function renderCard(card: { suit: string; rank: string }) {
  const suitSymbols: { [key: string]: string } = {
    'hearts': '♥',
    'diamonds': '♦',
    'clubs': '♣',
    'spades': '♠',
  };

  const suitColors: { [key: string]: string } = {
    'hearts': '#e53e3e',
    'diamonds': '#e53e3e',
    'clubs': '#000',
    'spades': '#000',
  };

  return (
    <div style={{ color: suitColors[card.suit] || '#000' }}>
      <div style={{ fontSize: '24px', fontWeight: 'bold' }}>
        {card.rank}
      </div>
      <div style={{ fontSize: '32px' }}>
        {suitSymbols[card.suit] || card.suit}
      </div>
    </div>
  );
}

function calculateHandValue(hand: Array<{ suit: string; rank: string }>): number {
  let total = 0;
  let aces = 0;

  for (const card of hand) {
    if (card.rank === 'A') {
      aces++;
      total += 11;
    } else if (['K', 'Q', 'J'].includes(card.rank)) {
      total += 10;
    } else {
      total += parseInt(card.rank);
    }
  }

  // Adjust for aces
  while (total > 21 && aces > 0) {
    total -= 10;
    aces--;
  }

  return total;
}

/* =======================
   STYLES
======================= */

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #1e3a8a 0%, #312e81 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
  },
  table: {
    background: '#2d5016',
    borderRadius: '24px',
    padding: '40px',
    maxWidth: '800px',
    width: '100%',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.4)',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '32px',
  },
  title: {
    fontSize: '28px',
    fontWeight: 'bold',
    color: '#fff',
    margin: 0,
  },
  leaveButton: {
    padding: '8px 16px',
    fontSize: '14px',
    fontWeight: 600,
    border: '2px solid rgba(255, 255, 255, 0.3)',
    borderRadius: '8px',
    background: 'transparent',
    color: '#fff',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  gameInfo: {
    textAlign: 'center',
    marginBottom: '32px',
  },
  betAmount: {
    fontSize: '16px',
    color: '#fbbf24',
    fontWeight: 600,
    marginBottom: '8px',
  },
  message: {
    fontSize: '18px',
    color: '#fff',
    fontWeight: 500,
  },
  handSection: {
    background: 'rgba(0, 0, 0, 0.2)',
    borderRadius: '12px',
    padding: '24px',
    marginBottom: '20px',
  },
  handTitle: {
    fontSize: '18px',
    fontWeight: 600,
    color: '#fff',
    marginBottom: '16px',
    textAlign: 'center',
  },
  cards: {
    display: 'flex',
    justifyContent: 'center',
    gap: '12px',
    flexWrap: 'wrap',
    marginBottom: '16px',
  },
  card: {
    background: 'white',
    borderRadius: '8px',
    padding: '16px',
    minWidth: '80px',
    textAlign: 'center',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
  },
  handValue: {
    textAlign: 'center',
    fontSize: '16px',
    fontWeight: 600,
    color: '#fbbf24',
  },
  actions: {
    display: 'flex',
    gap: '16px',
    justifyContent: 'center',
    marginTop: '32px',
  },
  actionButton: {
    padding: '14px 32px',
    fontSize: '16px',
    fontWeight: 600,
    border: 'none',
    borderRadius: '8px',
    background: '#059669',
    color: 'white',
    cursor: 'pointer',
    transition: 'all 0.2s',
    minWidth: '120px',
  },
  standButton: {
    background: '#dc2626',
  },
  result: {
    background: 'rgba(0, 0, 0, 0.3)',
    borderRadius: '12px',
    padding: '32px',
    marginTop: '32px',
    textAlign: 'center',
  },
  resultTitle: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: '12px',
  },
  resultMessage: {
    fontSize: '20px',
    color: '#fbbf24',
    fontWeight: 600,
    marginBottom: '8px',
  },
  winnings: {
    fontSize: '28px',
    fontWeight: 'bold',
    color: '#10b981',
  },
};