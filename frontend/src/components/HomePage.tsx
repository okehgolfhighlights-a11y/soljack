import { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import Header from './Header';
import BetTierNav from './BetTierNav';
import Lobby from './Lobby';
import TableSimple from './TableSimple';
import HowItWorks from './HowItWorks';
import Stats from './Stats';
import { useGame } from '../context/GameContext';

export default function HomePage() {
  const { connected } = useWallet();
  const { isAtTable } = useGame();
  const [selectedBetTier, setSelectedBetTier] = useState<number | null>(null);
  const [practiceMode, setPracticeMode] = useState(false);

  if (!connected) {
    return (
      <div style={styles.container}>
        <Header />
        <div style={styles.hero}>
          <div style={styles.logoContainer}>
            <h1 style={styles.logo}>SolJack</h1>
            <p style={styles.tagline}>PvP Blackjack on Solana</p>
          </div>
          <WalletMultiButton />
          <p style={styles.description}>
            Pure peer-to-peer blackjack. Choose Dealer or Player before matching.
            <br />
            Single deck, reshuffled when depleted. Provably fair.
          </p>
          <HowItWorks />
          <Stats />
        </div>
        <footer style={styles.footer}>
          Not financial advice. For entertainment purposes only.
        </footer>
      </div>
    );
  }

  if (isAtTable) {
    return <TableSimple />;
  }

  return (
    <div style={styles.container}>
      <Header />
      <BetTierNav 
        selectedTier={selectedBetTier} 
        onSelectTier={(tier) => {
          setSelectedBetTier(tier);
          setPracticeMode(false);
        }}
        onPracticeMode={() => {
          setSelectedBetTier(null);
          setPracticeMode(true);
        }}
      />
      {selectedBetTier && selectedBetTier > 0 && <Lobby betTier={selectedBetTier} />}
      <footer style={styles.footer}>
        🏆 First username to 100 wins receives creator rewards from Pump.Fun token launch
      </footer>
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
  },
  hero: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px 20px',
    maxWidth: '800px',
    margin: '0 auto',
  },
  logoContainer: {
    textAlign: 'center',
    marginBottom: '40px',
  },
  logo: {
    fontSize: '64px',
    fontWeight: 'bold',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    marginBottom: '10px',
  },
  tagline: {
    fontSize: '24px',
    color: '#333',
    fontWeight: 500,
  },
  description: {
    marginTop: '30px',
    fontSize: '18px',
    color: '#555',
    textAlign: 'center',
    lineHeight: '1.6',
  },
  footer: {
    padding: '20px',
    textAlign: 'center',
    fontSize: '14px',
    color: '#666',
    background: 'rgba(255, 255, 255, 0.3)',
    backdropFilter: 'blur(10px)',
  },
};