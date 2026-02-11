import { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useGame } from '../context/GameContext';

interface Props {
  onClose: () => void;
}

interface HandHistory {
  tableId: string;
  outcome: 'WIN' | 'LOSS' | 'PUSH';
  role: 'DEALER' | 'PLAYER';
  betAmount: number;
  timestamp: number;
}

export default function ProfileModal({ onClose }: Props) {
  const { publicKey } = useWallet();
  const { username, stats } = useGame();
  const [recentHands, setRecentHands] = useState<HandHistory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (publicKey) {
      fetchPlayerStats();
    }
  }, [publicKey]);

  const fetchPlayerStats = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/player/${publicKey!.toString()}/stats`
      );
      const data = await response.json();
      setRecentHands(data.recentHands || []);
    } catch (error) {
      console.error('Failed to fetch player stats:', error);
      setRecentHands([]);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (timestamp: number) => {
    const diff = Date.now() - timestamp;
    const hours = Math.floor(diff / 3600000);
    if (hours < 1) return `${Math.floor(diff / 60000)}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h2 style={styles.title}>Profile</h2>

        <div style={styles.userInfo}>
          {username ? (
            <div style={styles.username}>{username}</div>
          ) : (
            <div style={styles.noUsername}>No username claimed</div>
          )}
        </div>

        <div style={styles.statsGrid}>
          <div style={styles.statCard}>
            <div style={styles.statLabel}>W-L</div>
            <div style={styles.statValue}>{stats.wins}-{stats.losses}</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statLabel}>Total Hands</div>
            <div style={styles.statValue}>{stats.totalHands}</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statLabel}>Rank</div>
            <div style={styles.statValue}>
              {stats.rank ? `#${stats.rank}` : 'Unranked'}
            </div>
          </div>
        </div>

        <div style={styles.historySection}>
          <h3 style={styles.historyTitle}>Last 5 Hands</h3>
          {loading ? (
            <div style={styles.loading}>Loading...</div>
          ) : recentHands.length === 0 ? (
            <div style={styles.emptyHistory}>No hands played yet</div>
          ) : (
            <div style={styles.historyList}>
              {recentHands.map((hand, i) => (
                <div key={i} style={styles.historyItem}>
                  <div style={styles.historyLeft}>
                    <span style={{
                      ...styles.outcome,
                      color: hand.outcome === 'WIN' ? '#4caf50' : hand.outcome === 'LOSS' ? '#f44336' : '#ff9800',
                    }}>
                      {hand.outcome}
                    </span>
                    <span style={styles.role}>{hand.role}</span>
                  </div>
                  <div style={styles.historyRight}>
                    <span style={styles.betAmount}>{(hand.betAmount / 1e9).toFixed(2)} SOL</span>
                    <span style={styles.timestamp}>{formatTime(hand.timestamp)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <button style={styles.closeButton} onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.6)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2000,
  },
  modal: {
    background: 'white',
    borderRadius: '16px',
    padding: '40px',
    maxWidth: '600px',
    width: '90%',
    maxHeight: '80vh',
    overflowY: 'auto',
  },
  title: {
    fontSize: '28px',
    fontWeight: 'bold',
    marginBottom: '20px',
    color: '#333',
  },
  userInfo: {
    marginBottom: '30px',
  },
  username: {
    fontSize: '24px',
    fontWeight: 'bold',
    background: 'linear-gradient(135deg, #ffd700 0%, #ffed4e 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  noUsername: {
    fontSize: '18px',
    color: '#999',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '15px',
    marginBottom: '30px',
  },
  statCard: {
    background: 'rgba(144, 202, 249, 0.1)',
    borderRadius: '8px',
    padding: '20px',
    textAlign: 'center',
  },
  statLabel: {
    fontSize: '14px',
    color: '#666',
    marginBottom: '5px',
  },
  statValue: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#333',
  },
  historySection: {
    marginBottom: '30px',
  },
  historyTitle: {
    fontSize: '20px',
    fontWeight: 'bold',
    marginBottom: '15px',
    color: '#333',
  },
  loading: {
    textAlign: 'center',
    padding: '40px',
    color: '#999',
  },
  emptyHistory: {
    textAlign: 'center',
    padding: '40px',
    color: '#999',
  },
  historyList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  historyItem: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '15px',
    background: 'rgba(0, 0, 0, 0.03)',
    borderRadius: '8px',
  },
  historyLeft: {
    display: 'flex',
    gap: '15px',
    alignItems: 'center',
  },
  outcome: {
    fontWeight: 'bold',
    fontSize: '16px',
  },
  role: {
    fontSize: '14px',
    color: '#666',
  },
  historyRight: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: '5px',
  },
  betAmount: {
    fontSize: '14px',
    fontWeight: 600,
    color: '#333',
  },
  timestamp: {
    fontSize: '12px',
    color: '#999',
  },
  closeButton: {
    width: '100%',
    padding: '15px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: 600,
    color: 'white',
    cursor: 'pointer',
  },
};