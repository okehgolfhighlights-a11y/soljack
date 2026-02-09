import { useState, useEffect } from 'react';
import { useGame } from '../context/GameContext';

interface OpenTable {
  tableId: string;
  betAmount: number;
  creator: string;
  creatorUsername: string | null;
  creatorRole: 'DEALER' | 'PLAYER';
  openRole: 'DEALER' | 'PLAYER';
  creatorStats: {
    wins: number;
    losses: number;
    totalHands: number;
  };
  timeRemaining: number;
  createdAt: number;
}

interface Props {
  betTier: number;
}

export default function Lobby({ betTier }: Props) {
  const [openTables, setOpenTables] = useState<OpenTable[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateTable, setShowCreateTable] = useState(false);
  const { setCurrentTableId } = useGame();

  useEffect(() => {
    fetchTables();
    const interval = setInterval(fetchTables, 5000); // Refresh every 5s
    return () => clearInterval(interval);
  }, [betTier]);

  const fetchTables = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/tables/open?betAmount=${betTier * 1e9}`
      );
      const data = await response.json();
      setOpenTables(data.tables || []);
    } catch (error) {
      console.error('Failed to fetch tables:', error);
      setOpenTables([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTable = () => {
    setShowCreateTable(true);
  };

  const handleJoinTable = async (tableId: string) => {
    // TODO: Call join_table instruction
    setCurrentTableId(tableId);
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>Tables - {betTier} SOL</h2>
        <button style={styles.createButton} onClick={handleCreateTable}>
          Create Table
        </button>
      </div>

      {showCreateTable && (
        <CreateTableModal
          betTier={betTier}
          onClose={() => setShowCreateTable(false)}
          onCreated={(tableId) => setCurrentTableId(tableId)}
        />
      )}

      {loading ? (
        <div style={styles.loading}>Loading tables...</div>
      ) : (
        <div style={styles.tableGrid}>
          {openTables.length === 0 ? (
            <div style={styles.emptyState}>
              <p>No open tables at this bet tier.</p>
              <p>Be the first to create one!</p>
            </div>
          ) : (
            openTables.map((table) => (
              <TableCard
                key={table.tableId}
                table={table}
                onJoin={handleJoinTable}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}

function TableCard({ table, onJoin }: { table: OpenTable; onJoin: (id: string) => void }) {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div style={styles.tableCard} onClick={() => onJoin(table.tableId)}>
      <div style={styles.cardHeader}>
        <span style={table.creatorUsername ? styles.usernameGold : styles.usernameDefault}>
          {table.creatorUsername || `${table.creator.slice(0, 4)}...${table.creator.slice(-4)}`}
        </span>
        <span style={styles.timer}>{formatTime(table.timeRemaining)}</span>
      </div>

      <div style={styles.seatsContainer}>
        <div style={table.creatorRole === 'DEALER' ? styles.seatTaken : styles.seatOpen}>
          <div style={styles.seatLabel}>DEALER</div>
          {table.creatorRole === 'DEALER' && (
            <div style={styles.playerInfo}>
              {table.creatorUsername || `${table.creator.slice(0, 4)}...`}
            </div>
          )}
        </div>

        <div style={styles.divider} />

        <div style={table.creatorRole === 'PLAYER' ? styles.seatTaken : styles.seatOpen}>
          <div style={styles.seatLabel}>PLAYER</div>
          {table.creatorRole === 'PLAYER' && (
            <div style={styles.playerInfo}>
              {table.creatorUsername || `${table.creator.slice(0, 4)}...`}
            </div>
          )}
        </div>
      </div>

      <div style={styles.stats}>
        {table.creatorStats.wins}W - {table.creatorStats.losses}L
        <span style={styles.handsPlayed}>
          ({table.creatorStats.totalHands} hands)
        </span>
      </div>
    </div>
  );
}

function CreateTableModal({
  betTier,
  onClose,
  onCreated,
}: {
  betTier: number;
  onClose: () => void;
  onCreated: (tableId: string) => void;
}) {
  const [selectedRole, setSelectedRole] = useState<'DEALER' | 'PLAYER' | null>(null);
  const [creating, setCreating] = useState(false);

  const handleCreate = async () => {
    if (!selectedRole) return;
    
    setCreating(true);
    try {
      // TODO: Call create_table instruction
      const mockTableId = 'table_' + Date.now();
      onCreated(mockTableId);
      onClose();
    } catch (error) {
      console.error('Failed to create table:', error);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div style={styles.modalOverlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h3 style={styles.modalTitle}>Create Table - {betTier} SOL</h3>
        <p style={styles.modalSubtitle}>Choose your role:</p>

        <div style={styles.roleSelector}>
          <button
            style={{
              ...styles.roleButton,
              background: selectedRole === 'DEALER' ? '#90caf9' : 'rgba(255, 255, 255, 0.5)',
            }}
            onClick={() => setSelectedRole('DEALER')}
            disabled={creating}
          >
            DEALER
          </button>
          <button
            style={{
              ...styles.roleButton,
              background: selectedRole === 'PLAYER' ? '#90caf9' : 'rgba(255, 255, 255, 0.5)',
            }}
            onClick={() => setSelectedRole('PLAYER')}
            disabled={creating}
          >
            PLAYER
          </button>
        </div>

        <div style={styles.modalActions}>
          <button style={styles.cancelButton} onClick={onClose} disabled={creating}>
            Back
          </button>
          <button
            style={styles.confirmButton}
            onClick={handleCreate}
            disabled={!selectedRole || creating}
          >
            {creating ? 'Creating...' : 'Create Table'}
          </button>
        </div>
      </div>
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '20px',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '30px',
  },
  title: {
    fontSize: '28px',
    fontWeight: 'bold',
    color: '#333',
  },
  createButton: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    border: 'none',
    borderRadius: '8px',
    padding: '12px 24px',
    fontSize: '16px',
    fontWeight: 600,
    color: 'white',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  },
  loading: {
    textAlign: 'center',
    padding: '60px',
    fontSize: '18px',
    color: '#666',
  },
  tableGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '20px',
  },
  emptyState: {
    gridColumn: '1 / -1',
    textAlign: 'center',
    padding: '60px 20px',
    fontSize: '18px',
    color: '#666',
  },
  tableCard: {
    background: 'rgba(255, 255, 255, 0.6)',
    backdropFilter: 'blur(10px)',
    borderRadius: '12px',
    padding: '20px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    border: '2px solid transparent',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '15px',
  },
  usernameGold: {
    fontSize: '16px',
    fontWeight: 600,
    background: 'linear-gradient(135deg, #ffd700 0%, #ffed4e 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  usernameDefault: {
    fontSize: '16px',
    fontWeight: 600,
    color: '#333',
  },
  timer: {
    fontSize: '14px',
    color: '#666',
    background: 'rgba(0, 0, 0, 0.1)',
    padding: '4px 8px',
    borderRadius: '4px',
  },
  seatsContainer: {
    display: 'flex',
    gap: '10px',
    marginBottom: '15px',
  },
  seatTaken: {
    flex: 1,
    padding: '15px',
    borderRadius: '8px',
    background: 'rgba(144, 202, 249, 0.3)',
    border: '2px solid #90caf9',
  },
  seatOpen: {
    flex: 1,
    padding: '15px',
    borderRadius: '8px',
    background: 'rgba(129, 212, 250, 0.2)',
    border: '2px dashed #81d4fa',
  },
  seatLabel: {
    fontSize: '12px',
    fontWeight: 600,
    color: '#666',
    marginBottom: '5px',
  },
  playerInfo: {
    fontSize: '14px',
    fontWeight: 500,
    color: '#333',
  },
  divider: {
    width: '2px',
    background: 'rgba(0, 0, 0, 0.1)',
  },
  stats: {
    fontSize: '14px',
    color: '#666',
    textAlign: 'center',
  },
  handsPlayed: {
    fontSize: '12px',
    marginLeft: '5px',
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  modal: {
    background: 'white',
    borderRadius: '16px',
    padding: '30px',
    maxWidth: '500px',
    width: '90%',
  },
  modalTitle: {
    fontSize: '24px',
    fontWeight: 'bold',
    marginBottom: '10px',
    color: '#333',
  },
  modalSubtitle: {
    fontSize: '16px',
    color: '#666',
    marginBottom: '20px',
  },
  roleSelector: {
    display: 'flex',
    gap: '15px',
    marginBottom: '30px',
  },
  roleButton: {
    flex: 1,
    padding: '20px',
    border: 'none',
    borderRadius: '8px',
    fontSize: '18px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  },
  modalActions: {
    display: 'flex',
    gap: '10px',
  },
  cancelButton: {
    flex: 1,
    padding: '12px',
    background: 'rgba(0, 0, 0, 0.1)',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: 600,
    cursor: 'pointer',
  },
  confirmButton: {
    flex: 1,
    padding: '12px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: 600,
    color: 'white',
    cursor: 'pointer',
  },
};