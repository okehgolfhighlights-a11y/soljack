import { useState, useEffect } from 'react';

interface Props {
  onClose: () => void;
}

interface LeaderboardEntry {
  rank: number;
  username: string | null;
  wallet: string;
  wins: number;
  losses: number;
  totalHands: number;
}

export default function LeaderboardDropdown({ onClose }: Props) {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/leaderboard?limit=10`);
      const data = await response.json();
      setLeaderboard(data.leaderboard || []);
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error);
      setLeaderboard([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div style={styles.backdrop} onClick={onClose} />
      <div style={styles.dropdown}>
        <div style={styles.header}>
          <h3 style={styles.title}>Leaderboard</h3>
          <button style={styles.closeButton} onClick={onClose}>×</button>
        </div>
        <div style={styles.list}>
          {loading ? (
            <div style={styles.loading}>Loading...</div>
          ) : leaderboard.length === 0 ? (
            <div style={styles.empty}>No players yet</div>
          ) : (
            leaderboard.map((entry) => (
              <div key={entry.rank} style={styles.entry}>
                <div style={styles.rankBadge}>#{entry.rank}</div>
                <div style={styles.playerInfo}>
                  <div style={entry.username ? styles.username : styles.wallet}>
                    {entry.username || `${entry.wallet.slice(0, 4)}...${entry.wallet.slice(-4)}`}
                  </div>
                  <div style={styles.record}>
                    {entry.wins}W - {entry.losses}L
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  backdrop: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 998,
  },
  dropdown: {
    position: 'fixed',
    top: '80px',
    left: '20px',
    width: '320px',
    background: 'white',
    borderRadius: '12px',
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.2)',
    zIndex: 999,
    maxHeight: '500px',
    display: 'flex',
    flexDirection: 'column',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px',
    borderBottom: '1px solid #e0e0e0',
  },
  title: {
    fontSize: '20px',
    fontWeight: 'bold',
    color: '#333',
    margin: 0,
  },
  closeButton: {
    background: 'none',
    border: 'none',
    fontSize: '28px',
    cursor: 'pointer',
    color: '#999',
    padding: 0,
    width: '30px',
    height: '30px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  list: {
    maxHeight: '400px',
    overflowY: 'auto',
  },
  entry: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
    padding: '15px 20px',
    borderBottom: '1px solid #f0f0f0',
  },
  rankBadge: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 'bold',
    fontSize: '16px',
    flexShrink: 0,
  },
  playerInfo: {
    flex: 1,
    minWidth: 0,
  },
  username: {
    fontSize: '16px',
    fontWeight: 'bold',
    background: 'linear-gradient(135deg, #ffd700 0%, #ffed4e 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    marginBottom: '3px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  wallet: {
    fontSize: '16px',
    fontWeight: 600,
    color: '#555',
    marginBottom: '3px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  record: {
    fontSize: '14px',
    color: '#666',
  },
  loading: {
    padding: '40px',
    textAlign: 'center',
    color: '#999',
  },
  empty: {
    padding: '40px',
    textAlign: 'center',
    color: '#999',
  },
};