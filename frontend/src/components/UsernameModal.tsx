import { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useGame } from '../context/GameContext';

interface UsernameModalProps {
  onClose: () => void;
}

export default function UsernameModal({ onClose }: UsernameModalProps) {
  const { publicKey } = useWallet();
  const { setUsername } = useGame();
  const [input, setInput] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!publicKey) return;

    const trimmed = input.trim();
    if (trimmed.length < 3) {
      setError('Username must be at least 3 characters');
      return;
    }
    if (trimmed.length > 20) {
      setError('Username must be 20 characters or less');
      return;
    }
    if (!/^[a-zA-Z0-9_]+$/.test(trimmed)) {
      setError('Username can only contain letters, numbers, and underscores');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await setUsername(trimmed);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to set username');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <h2 style={styles.title}>Choose Your Username</h2>
        <p style={styles.subtitle}>
          This will be your permanent display name on SolJack
        </p>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Enter username"
            style={styles.input}
            maxLength={20}
            autoFocus
            disabled={loading}
          />
          {error && <p style={styles.error}>{error}</p>}
          <div style={styles.buttonContainer}>
            <button
              type="button"
              onClick={onClose}
              style={styles.cancelButton}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={styles.submitButton}
              disabled={loading || input.trim().length < 3}
            >
              {loading ? 'Setting...' : 'Set Username'}
            </button>
          </div>
        </form>
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
    background: 'rgba(0, 0, 0, 0.7)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  modal: {
    background: 'white',
    borderRadius: '12px',
    padding: '32px',
    maxWidth: '400px',
    width: '90%',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
  },
  title: {
    margin: '0 0 8px 0',
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#333',
  },
  subtitle: {
    margin: '0 0 24px 0',
    fontSize: '14px',
    color: '#666',
  },
  input: {
    width: '100%',
    padding: '12px',
    fontSize: '16px',
    border: '2px solid #ddd',
    borderRadius: '8px',
    marginBottom: '8px',
    boxSizing: 'border-box',
  },
  error: {
    color: '#e53e3e',
    fontSize: '14px',
    margin: '0 0 16px 0',
  },
  buttonContainer: {
    display: 'flex',
    gap: '12px',
    marginTop: '24px',
  },
  cancelButton: {
    flex: 1,
    padding: '12px',
    fontSize: '16px',
    fontWeight: 600,
    border: '2px solid #ddd',
    background: 'white',
    color: '#666',
    borderRadius: '8px',
    cursor: 'pointer',
  },
  submitButton: {
    flex: 1,
    padding: '12px',
    fontSize: '16px',
    fontWeight: 600,
    border: 'none',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    borderRadius: '8px',
    cursor: 'pointer',
  },
};