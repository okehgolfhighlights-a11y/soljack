import { useEffect, useState } from 'react';

interface PlatformStats {
  totalHands: number;
  activeTables: number;
  totalVolume: number;
  dealerWinRate: number;
  playerWinRate: number;
}

export default function Stats() {
  const [stats, setStats] = useState<PlatformStats>({
    totalHands: 0,
    activeTables: 0,
    totalVolume: 0,
    dealerWinRate: 0,
    playerWinRate: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/stats`);
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <h3 style={styles.title}>Live Stats</h3>
        <div style={styles.loading}>Loading stats...</div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <h3 style={styles.title}>Live Stats</h3>
      <div style={styles.grid}>
        <div style={styles.statCard}>
          <div style={styles.label}>Total Hands</div>
          <div style={styles.value}>{stats.totalHands.toLocaleString()}</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.label}>Active Tables</div>
          <div style={styles.value}>{stats.activeTables}</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.label}>Total Volume</div>
          <div style={styles.value}>{stats.totalVolume.toFixed(2)} SOL</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.label}>Dealer Win Rate</div>
          <div style={styles.value}>{(stats.dealerWinRate * 100).toFixed(1)}%</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.label}>Player Win Rate</div>
          <div style={styles.value}>{(stats.playerWinRate * 100).toFixed(1)}%</div>
        </div>
      </div>
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    width: '100%',
    maxWidth: '800px',
    marginTop: '40px',
  },
  title: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#333',
    marginBottom: '20px',
    textAlign: 'center',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
    gap: '15px',
  },
  statCard: {
    background: 'rgba(255, 255, 255, 0.5)',
    backdropFilter: 'blur(10px)',
    borderRadius: '12px',
    padding: '20px',
    textAlign: 'center',
  },
  label: {
    fontSize: '14px',
    color: '#666',
    marginBottom: '8px',
  },
  value: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#333',
  },
  loading: {
    textAlign: 'center',
    padding: '40px',
    color: '#999',
  },
};