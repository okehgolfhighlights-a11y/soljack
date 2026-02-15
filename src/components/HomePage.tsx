import { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useGame } from '../context/GameContext';
import Lobby from './Lobby';

export default function HomePage() {
  const { publicKey } = useWallet();
  const game = useGame();
  const [showLobby, setShowLobby] = useState(false);
  const [betTier, setBetTier] = useState(1);

  // Show lobby if Play Now clicked
  if (showLobby && publicKey) {
    return <Lobby betTier={betTier} />;
  }

  return (
    <div style={styles.page}>
      {/* Coastal Background */}
      <div style={styles.background}>
        <div style={styles.gradient} />
      </div>

      {/* Content */}
      <div style={styles.content}>
        {/* Hero */}
        <div style={styles.hero}>
          <h1 style={styles.title}>
            <span style={styles.sol}>Sol</span>
            <span style={styles.jack}>Jack</span>
          </h1>
          <p style={styles.subtitle}>RIVIERA</p>
          <p style={styles.tagline}>Mediterranean Luxury × Solana Blackjack</p>

          {/* Stats */}
          <div style={styles.stats}>
            <div style={styles.stat}>
              <div style={styles.statValue}>0</div>
              <div style={styles.statLabel}>Total Players</div>
            </div>
            <div style={styles.stat}>
              <div style={styles.statValue}>
                <span style={styles.pulse}>●</span> {game.onlineCount}
              </div>
              <div style={styles.statLabel}>Online Now</div>
            </div>
            <div style={styles.stat}>
              <div style={styles.statValue}>0 SOL</div>
              <div style={styles.statLabel}>Total Volume</div>
            </div>
          </div>

          {/* Wallet */}
          <div style={styles.walletContainer}>
            <WalletMultiButton style={styles.wallet as any} />
          </div>

          {/* Play Button */}
          {publicKey && (
            <button 
              onClick={() => setShowLobby(true)}
              style={styles.playButton}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              🎰 Play Now
            </button>
          )}
        </div>

        {/* Features */}
        <div style={styles.features}>
          <h2 style={styles.featuresTitle}>🌊 Premium Solana Blackjack</h2>
          <div style={styles.featureGrid}>
            <Feature icon="🎴" title="Custom Card Backs" desc="Unlock Pump.fun, Solana, and Gold Finale" />
            <Feature icon="🎰" title="Premium Tables" desc="Mediterranean coastal and championship gold" />
            <Feature icon="🏆" title="Tournaments" desc="8-player brackets with epic finals" />
            <Feature icon="🐉" title="Riva the Dragon" desc="Your Mediterranean mascot guide" />
            <Feature icon="🔊" title="Immersive Audio" desc="Casino sounds and lofi house music" />
            <Feature icon="⚡" title="Built on Solana" desc="Fast, cheap, provably fair" />
          </div>
        </div>

        {/* Game Modes */}
        <div style={styles.modes}>
          <h2 style={styles.modesTitle}>🎮 Game Modes</h2>
          <div style={styles.modeGrid}>
            <GameMode 
              icon="🎯" 
              title="Practice" 
              desc="Perfect your strategy against AI"
              features={['3 difficulty levels', 'Free to play', 'Learn the ropes']}
            />
            <GameMode 
              icon="🎰" 
              title="PvP Matches" 
              desc="Challenge real players"
              features={['0.01 - 1 SOL buy-ins', 'Modified blackjack', '10-second shot clock']}
              featured
            />
            <GameMode 
              icon="🏆" 
              title="Tournaments" 
              desc="Compete for glory"
              features={['8-player brackets', 'Championship finals', 'All Gold Finale table']}
            />
          </div>
        </div>

        {/* Footer */}
        <footer style={styles.footer}>
          <div style={styles.footerContent}>
            <div>
              <h3 style={styles.footerBrand}>SolJack Riviera</h3>
              <p style={styles.footerText}>Mediterranean luxury × Solana blackjack</p>
            </div>
            <div style={styles.badges}>
              <span style={styles.badge}>Powered by Pump.fun</span>
              <span style={{...styles.badge, ...styles.badgeSolana}}>Built on Solana</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

// Feature Component
function Feature({ icon, title, desc }: { icon: string; title: string; desc: string }) {
  return (
    <div style={styles.feature}>
      <div style={styles.featureIcon}>{icon}</div>
      <h3 style={styles.featureTitle}>{title}</h3>
      <p style={styles.featureDesc}>{desc}</p>
    </div>
  );
}

// GameMode Component
function GameMode({ icon, title, desc, features, featured }: any) {
  return (
    <div style={{...styles.mode, ...(featured ? styles.modeFeatured : {})}}>
      {featured && <div style={styles.modeBadge}>⚡ POPULAR</div>}
      <div style={styles.modeIcon}>{icon}</div>
      <h3 style={styles.modeTitle}>{title}</h3>
      <p style={styles.modeDesc}>{desc}</p>
      <ul style={styles.modeFeatures}>
        {features.map((f: string, i: number) => (
          <li key={i} style={styles.modeFeature}>✓ {f}</li>
        ))}
      </ul>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100vh',
    position: 'relative',
    overflow: 'auto',
  },
  background: {
    position: 'fixed',
    inset: 0,
    background: 'linear-gradient(135deg, #1A3A52 0%, #0077BE 40%, #FFD700 100%)',
    zIndex: 0,
  },
  gradient: {
    position: 'absolute',
    inset: 0,
    background: 'radial-gradient(circle at 50% 20%, rgba(255,215,0,0.2), transparent 50%)',
  },
  content: {
    position: 'relative',
    zIndex: 10,
  },
  hero: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2rem',
    textAlign: 'center',
  },
  title: {
    fontSize: 'clamp(4rem, 12vw, 8rem)',
    fontWeight: 900,
    margin: 0,
    lineHeight: 0.9,
  },
  sol: {
    color: '#0077BE',
    textShadow: '0 0 60px rgba(0,119,190,1)',
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
    margin: '0.5rem 0 2rem',
  },
  tagline: {
    fontSize: 'clamp(1.2rem, 3vw, 2rem)',
    color: 'white',
    marginBottom: '3rem',
    textShadow: '0 2px 20px rgba(0,0,0,0.5)',
  },
  stats: {
    display: 'flex',
    gap: '3rem',
    marginBottom: '3rem',
    background: 'rgba(255,255,255,0.1)',
    backdropFilter: 'blur(10px)',
    padding: '2rem 3rem',
    borderRadius: '20px',
    border: '1px solid rgba(255,255,255,0.2)',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  stat: {
    textAlign: 'center',
    minWidth: '120px',
  },
  statValue: {
    fontSize: '2.5rem',
    fontWeight: 900,
    color: 'white',
    marginBottom: '0.5rem',
  },
  statLabel: {
    fontSize: '0.9rem',
    color: '#ddd',
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
  },
  pulse: {
    color: '#FFD835',
    animation: 'pulse 2s infinite',
  },
  walletContainer: {
    marginBottom: '2rem',
  },
  wallet: {},
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
  features: {
    padding: '6rem 2rem',
    background: 'rgba(255,255,255,0.95)',
  },
  featuresTitle: {
    fontSize: 'clamp(2rem, 5vw, 3rem)',
    textAlign: 'center',
    marginBottom: '3rem',
    color: '#1A3A52',
  },
  featureGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '2rem',
    maxWidth: '1200px',
    margin: '0 auto',
  },
  feature: {
    background: 'white',
    padding: '2rem',
    borderRadius: '16px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
    transition: 'transform 0.2s',
  },
  featureIcon: {
    fontSize: '3rem',
    marginBottom: '1rem',
  },
  featureTitle: {
    fontSize: '1.3rem',
    fontWeight: 700,
    marginBottom: '0.5rem',
    color: '#1A3A52',
  },
  featureDesc: {
    color: '#666',
    lineHeight: 1.6,
  },
  modes: {
    padding: '6rem 2rem',
    background: 'linear-gradient(180deg, rgba(0,119,190,0.1), rgba(26,58,82,0.2))',
  },
  modesTitle: {
    fontSize: 'clamp(2rem, 5vw, 3rem)',
    textAlign: 'center',
    marginBottom: '3rem',
    color: 'white',
  },
  modeGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '2rem',
    maxWidth: '1200px',
    margin: '0 auto',
  },
  mode: {
    background: 'white',
    padding: '2rem',
    borderRadius: '16px',
    position: 'relative',
    border: '3px solid transparent',
  },
  modeFeatured: {
    border: '3px solid #FFD700',
    boxShadow: '0 8px 40px rgba(255,215,0,0.4)',
  },
  modeBadge: {
    position: 'absolute',
    top: '-12px',
    right: '1rem',
    background: 'linear-gradient(135deg, #FFD700, #FFA500)',
    color: '#1A3A52',
    padding: '0.3rem 1rem',
    borderRadius: '20px',
    fontSize: '0.8rem',
    fontWeight: 900,
  },
  modeIcon: {
    fontSize: '4rem',
    marginBottom: '1rem',
  },
  modeTitle: {
    fontSize: '1.5rem',
    fontWeight: 700,
    marginBottom: '0.5rem',
    color: '#1A3A52',
  },
  modeDesc: {
    color: '#666',
    marginBottom: '1rem',
  },
  modeFeatures: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
  },
  modeFeature: {
    color: '#0077BE',
    fontWeight: 600,
    padding: '0.3rem 0',
  },
  footer: {
    background: '#1A3A52',
    padding: '3rem 2rem',
    color: 'white',
  },
  footerContent: {
    maxWidth: '1200px',
    margin: '0 auto',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '2rem',
  },
  footerBrand: {
    fontSize: '1.5rem',
    margin: '0 0 0.5rem',
  },
  footerText: {
    color: '#aaa',
    margin: 0,
  },
  badges: {
    display: 'flex',
    gap: '1rem',
    flexWrap: 'wrap',
  },
  badge: {
    background: 'rgba(255,255,255,0.1)',
    padding: '0.5rem 1rem',
    borderRadius: '20px',
    fontSize: '0.9rem',
    border: '1px solid rgba(255,255,255,0.2)',
  },
  badgeSolana: {
    background: 'linear-gradient(135deg, #9945FF, #14F195)',
    border: 'none',
  },
};