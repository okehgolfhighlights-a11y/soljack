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
      {/* Coastal background image */}
      <div style={styles.background}>
        <img 
          src="/assets/backgrounds/cinque-terre-sunset.jpg" 
          alt="Cinque Terre" 
          style={styles.backgroundImage}
        />
        <div style={styles.overlay} />
      </div>

      <div style={styles.content}>
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

          {publicKey ? (
            <button 
              onClick={() => setShowLobby(true)}
              style={styles.playButton}
              onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              🎰 Play Now
            </button>
          ) : (
            <p style={styles.connectPrompt}>
              Connect your wallet to start playing
            </p>
          )}
        </div>
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
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 0,
  },
  backgroundImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover' as const,
  },
  overlay: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(180deg, rgba(0, 119, 190, 0.6) 0%, rgba(26, 58, 82, 0.8) 100%)',
  },
  content: {
    position: 'relative' as const,
    zIndex: 10,
    minHeight: '100vh',
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
    fontSize: 'clamp(3rem, 10vw, 6rem)',
    fontWeight: 'bold',
    margin: 0,
    lineHeight: 0.9,
  },
  sol: {
    color: '#0077BE',
    textShadow: '0 0 30px rgba(0,119,190,0.8)',
  },
  jack: {
    background: 'linear-gradient(135deg, #FFD700, #FFA500)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  },
  subtitle: {
    fontSize: 'clamp(1.5rem, 4vw, 2.5rem)',
    letterSpacing: '0.3em',
    color: '#FF7F50',
    fontWeight: 'bold',
    margin: '0.5rem 0 2rem',
  },
  tagline: {
    fontSize: 'clamp(1rem, 3vw, 1.5rem)',
    marginBottom: '2rem',
    textShadow: '0 2px 10px rgba(0,0,0,0.5)',
  },
  wallet: {
    marginBottom: '2rem',
  },
  playButton: {
    padding: '1.25rem 3.5rem',
    fontSize: '1.5rem',
    background: 'linear-gradient(135deg, #FFD700, #FFA500)',
    color: '#1A3A52',
    border: 'none',
    borderRadius: '12px',
    fontWeight: 'bold',
    cursor: 'pointer',
    boxShadow: '0 8px 30px rgba(255,215,0,0.5)',
    transition: 'all 0.3s ease',
  },
  connectPrompt: {
    fontSize: '1.2rem',
    color: '#FFD835',
    textShadow: '0 2px 10px rgba(0,0,0,0.5)',
  },
};