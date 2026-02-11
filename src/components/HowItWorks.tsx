import { useState } from 'react';

export default function HowItWorks() {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div style={styles.container}>
      <button
        style={styles.toggleButton}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        How It Works {isExpanded ? '▲' : '▼'}
      </button>

      {isExpanded && (
        <div style={styles.content}>
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>1. Pure PvP — No House</h3>
            <p style={styles.text}>
              Player vs Player only. Platform never plays or holds funds.
              Choose your role: Dealer or Player before matching.
            </p>
          </div>

          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>2. Simple Betting</h3>
            <p style={styles.text}>
              Six bet tiers: 0.01 to 1 SOL. Tiny 0.001 SOL fee per player.
              Instant payouts on-chain.
            </p>
          </div>

          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>3. Fair Play</h3>
            <p style={styles.text}>
              Single 52-card deck (reshuffled only when depleted).
              Standard blackjack rules. 60-second turn timer.
            </p>
          </div>

          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>4. Claim Your Name</h3>
            <p style={styles.text}>
              Optional username for $1 SOL (displays in gold).
              First username to 100 wins gets Pump.Fun creator rewards 🏆
            </p>
          </div>

          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>5. Connect & Play</h3>
            <p style={styles.text}>
              Connect Phantom wallet. Create or join a table.
              Play as many hands as you want.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    width: '100%',
    maxWidth: '700px',
    marginTop: '40px',
  },
  toggleButton: {
    width: '100%',
    padding: '15px',
    background: 'rgba(255, 255, 255, 0.5)',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: 600,
    cursor: 'pointer',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  content: {
    marginTop: '20px',
    padding: '20px',
    background: 'rgba(255, 255, 255, 0.3)',
    borderRadius: '8px',
    backdropFilter: 'blur(10px)',
  },
  section: {
    marginBottom: '20px',
  },
  sectionTitle: {
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#333',
    marginBottom: '8px',
  },
  text: {
    fontSize: '15px',
    color: '#555',
    lineHeight: '1.6',
    margin: 0,
  },
};