// src/components/HomePage.tsx
import { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import Lobby from './Lobby';

export default function HomePage() {
  const { publicKey } = useWallet();
  const [showLobby, setShowLobby] = useState(false);
  const [betTier, setBetTier] = useState(1);

  if (showLobby && publicKey) {
    return <Lobby betTier={betTier} />;
  }

  return (
    <div style={styles.container}>
      <div style={styles.background} />
      
      <div style={styles.content}>
        <h1 style={styles.title}>
          <span style={styles.sol}>Sol</span>
          <span style={styles.jack}>Jack</span>
        </h1>
        <p style={styles.subtitle}>RIVIERA</p>
        <p style={styles.tagline}>Mediterranean Luxury × Solana Blackjack</p>
        
        <WalletMultiButton style={styles.wallet as any} />

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
    position: 'relative' as const,
    minHeight: '100vh',
    overflow: 'hidden',
  },
  background: {
    position: 'absolute' as const,
    inset: 0,
    background: 'linear-gradient(135deg, #1A3A52 0%, #0077BE 50%, #FFD700 100%)',
  },
  content: {
    position: 'relative' as const,
    zIndex: 10,
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    gap: '2rem',
    padding: '2rem',
  },
  title: {
    fontSize: 'clamp(4rem, 12vw, 8rem)',
    fontWeight: 900,
    margin: 0,
    lineHeight: 0.9,
  },
  sol: {
    color: '#0077BE',
    textShadow: '0 0 40px rgba(0,119,190,0.8)',
  },
  jack: {
    background: 'linear-gradient(135deg, #FFD700, #FFA500)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  },
  subtitle: {
    fontSize: 'clamp(2rem, 5vw, 3rem)',
    letterSpacing: '0.5em',
    color: '#FF7F50',
    fontWeight: 700,
    margin: 0,
  },
  tagline: {
    fontSize: 'clamp(1.2rem, 3vw, 2rem)',
    color: 'white',
    textShadow: '0 2px 20px rgba(0,0,0,0.5)',
    margin: 0,
  },
  wallet: {
    marginTop: '2rem',
  },
  playButton: {
    padding: '1.5rem 4rem',
    fontSize: '2rem',
    background: 'linear-gradient(135deg, #FFD700, #FFA500)',
    color: '#1A3A52',
    border: 'none',
    borderRadius: '16px',
    fontWeight: 900,
    cursor: 'pointer',
    boxShadow: '0 10px 40px rgba(255,215,0,0.6)',
    transition: 'transform 0.2s',
  },
};