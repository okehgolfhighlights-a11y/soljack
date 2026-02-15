// src/components/HomePage.tsx
import { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

export default function HomePage() {
  const { publicKey } = useWallet();
  const [showLobby, setShowLobby] = useState(false);

  return (
    <div style={styles.container}>
      <div style={styles.hero}>
        <h1 style={styles.title}>
          <span style={styles.sol}>Sol</span>
          <span style={styles.jack}>Jack</span>
        </h1>
        <p style={styles.subtitle}>RIVIERA</p>
        <p style={styles.tagline}>Mediterranean Luxury × Solana Blackjack</p>
        
        <div style={styles.wallet}>
          <WalletMultiButton />
        </div>

        {publicKey && (
          <button 
            onClick={() => setShowLobby(true)}
            style={styles.playButton}
          >
            🎰 Play Now
          </button>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #1A3A52 0%, #0077BE 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  hero: {
    textAlign: 'center' as const,
    color: 'white',
    padding: '2rem',
  },
  title: {
    fontSize: '5rem',
    fontWeight: 'bold',
    margin: 0,
    lineHeight: 1,
  },
  sol: {
    color: '#0077BE',
    textShadow: '0 0 20px rgba(0,119,190,0.5)',
  },
  jack: {
    background: 'linear-gradient(135deg, #FFD700, #FFA500)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  subtitle: {
    fontSize: '2rem',
    letterSpacing: '0.3em',
    color: '#FF7F50',
    margin: '0.5rem 0 2rem',
  },
  tagline: {
    fontSize: '1.5rem',
    marginBottom: '2rem',
  },
  wallet: {
    marginBottom: '2rem',
  },
  playButton: {
    padding: '1rem 3rem',
    fontSize: '1.5rem',
    background: 'linear-gradient(135deg, #FFD700, #FFA500)',
    color: '#1A3A52',
    border: 'none',
    borderRadius: '12px',
    fontWeight: 'bold',
    cursor: 'pointer',
    boxShadow: '0 4px 20px rgba(255,215,0,0.4)',
  },
};