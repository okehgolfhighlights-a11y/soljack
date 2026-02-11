import { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useGame } from '../context/GameContext';
import PrivateMatchModal from './PrivateMatchModal';

interface LobbyProps {
  betTier: number;
}

export default function Lobby({ betTier }: LobbyProps) {
  const { publicKey } = useWallet();
  const { 
    joinQueue, 
    leaveQueue, 
    queueStatus, 
    createPrivateMatch,
    joinPrivateMatch 
  } = useGame();
  
  const [selectedRole, setSelectedRole] = useState<'dealer' | 'player' | null>(null);
  const [isInQueue, setIsInQueue] = useState(false);
  const [showPrivateModal, setShowPrivateModal] = useState(false);

  useEffect(() => {
    // Check if we're already in queue for this tier
    const inQueue = queueStatus?.betTier === betTier && queueStatus?.inQueue;
    setIsInQueue(!!inQueue);
    if (inQueue) {
      setSelectedRole(queueStatus?.role || null);
    }
  }, [queueStatus, betTier]);

  const handleJoinQueue = async (role: 'dealer' | 'player') => {
    if (!publicKey) return;
    
    setSelectedRole(role);
    try {
      await joinQueue(betTier, role);
      setIsInQueue(true);
    } catch (err) {
      console.error('Failed to join queue:', err);
      setSelectedRole(null);
    }
  };

  const handleLeaveQueue = async () => {
    try {
      await leaveQueue();
      setIsInQueue(false);
      setSelectedRole(null);
    } catch (err) {
      console.error('Failed to leave queue:', err);
    }
  };

  const handleCreatePrivate = async (role: 'dealer' | 'player') => {
    if (!publicKey) return;
    
    try {
      const matchCode = await createPrivateMatch(betTier, role);
      setShowPrivateModal(false);
      // Show the match code to the user
      alert(`Private match created! Share this code: ${matchCode}`);
    } catch (err) {
      console.error('Failed to create private match:', err);
    }
  };

  const handleJoinPrivate = async (matchCode: string, role: 'dealer' | 'player') => {
    if (!publicKey) return;
    
    try {
      await joinPrivateMatch(matchCode, role);
      setShowPrivateModal(false);
    } catch (err) {
      console.error('Failed to join private match:', err);
      alert('Failed to join match. Invalid code or match already full.');
    }
  };

  const betAmount = betTier * 0.01; // Convert tier to SOL amount

  if (isInQueue) {
    return (
      <div style={styles.container}>
        <div style={styles.queueCard}>
          <div style={styles.spinnerContainer}>
            <div style={styles.spinner}></div>
          </div>
          <h2 style={styles.queueTitle}>Finding opponent...</h2>
          <p style={styles.queueInfo}>
            Role: <strong>{selectedRole === 'dealer' ? 'Dealer' : 'Player'}</strong>
            <br />
            Bet Amount: <strong>{betAmount} SOL</strong>
          </p>
          <button onClick={handleLeaveQueue} style={styles.leaveButton}>
            Leave Queue
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>Choose Your Role</h2>
        <p style={styles.subtitle}>Bet Amount: {betAmount} SOL per hand</p>
      </div>

      <div style={styles.roleCards}>
        <div style={styles.roleCard}>
          <div style={styles.roleIcon}>🎰</div>
          <h3 style={styles.roleTitle}>Dealer</h3>
          <p style={styles.roleDescription}>
            House advantage. Hit on 16, stand on 17. 
            Win on pushes. Slightly better odds.
          </p>
          <button 
            onClick={() => handleJoinQueue('dealer')} 
            style={styles.roleButton}
          >
            Join as Dealer
          </button>
        </div>

        <div style={styles.roleCard}>
          <div style={styles.roleIcon}>🎴</div>
          <h3 style={styles.roleTitle}>Player</h3>
          <p style={styles.roleDescription}>
            Traditional blackjack player. 
            Full control over hit/stand decisions.
          </p>
          <button 
            onClick={() => handleJoinQueue('player')} 
            style={styles.roleButton}
          >
            Join as Player
          </button>
        </div>
      </div>

      <div style={styles.privateMatchSection}>
        <button 
          onClick={() => setShowPrivateModal(true)} 
          style={styles.privateButton}
        >
          Create/Join Private Match
        </button>
      </div>

      {showPrivateModal && (
        <PrivateMatchModal
          betTier={betTier}
          onClose={() => setShowPrivateModal(false)}
          onCreateMatch={handleCreatePrivate}
          onJoinMatch={handleJoinPrivate}
        />
      )}
    </div>
  );
}

/* =======================
   STYLES
======================= */

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    maxWidth: '900px',
    margin: '0 auto',
    padding: '40px 20px',
  },
  header: {
    textAlign: 'center',
    marginBottom: '40px',
  },
  title: {
    fontSize: '32px',
    fontWeight: 'bold',
    color: '#333',
    marginBottom: '8px',
  },
  subtitle: {
    fontSize: '18px',
    color: '#666',
  },
  roleCards: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '24px',
    marginBottom: '32px',
  },
  roleCard: {
    background: 'white',
    borderRadius: '16px',
    padding: '32px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
    textAlign: 'center',
    transition: 'transform 0.2s, box-shadow 0.2s',
  },
  roleIcon: {
    fontSize: '64px',
    marginBottom: '16px',
  },
  roleTitle: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#333',
    marginBottom: '12px',
  },
  roleDescription: {
    fontSize: '14px',
    color: '#666',
    lineHeight: '1.6',
    marginBottom: '24px',
    minHeight: '60px',
  },
  roleButton: {
    width: '100%',
    padding: '14px 28px',
    fontSize: '16px',
    fontWeight: 600,
    border: 'none',
    borderRadius: '8px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    cursor: 'pointer',
    transition: 'transform 0.2s',
  },
  privateMatchSection: {
    textAlign: 'center',
    marginTop: '32px',
  },
  privateButton: {
    padding: '12px 24px',
    fontSize: '14px',
    fontWeight: 600,
    border: '2px solid #667eea',
    borderRadius: '8px',
    background: 'white',
    color: '#667eea',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  queueCard: {
    background: 'white',
    borderRadius: '16px',
    padding: '48px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
    textAlign: 'center',
    maxWidth: '400px',
    margin: '0 auto',
  },
  spinnerContainer: {
    marginBottom: '24px',
  },
  spinner: {
    width: '60px',
    height: '60px',
    margin: '0 auto',
    border: '4px solid #f3f3f3',
    borderTop: '4px solid #667eea',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  queueTitle: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#333',
    marginBottom: '16px',
  },
  queueInfo: {
    fontSize: '16px',
    color: '#666',
    lineHeight: '1.8',
    marginBottom: '32px',
  },
  leaveButton: {
    padding: '12px 32px',
    fontSize: '16px',
    fontWeight: 600,
    border: '2px solid #e53e3e',
    borderRadius: '8px',
    background: 'white',
    color: '#e53e3e',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
};

/* =======================
   ANIMATIONS
======================= */

const styleSheet = document.createElement("style");
styleSheet.textContent = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;
document.head.appendChild(styleSheet);