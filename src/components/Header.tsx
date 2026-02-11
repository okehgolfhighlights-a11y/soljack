import { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useGame } from '../context/GameContext';
import UsernameModal from './UsernameModal';
import ProfileModal from './ProfileModal';
import LeaderboardDropdown from './LeaderboardDropdown';

export default function Header() {
  const { connected } = useWallet();
  const { username, balance } = useGame();
  const [showUsernameModal, setShowUsernameModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);

  return (
    <>
      <header style={styles.header}>
        <div style={styles.leftSection}>
          <button
            style={styles.muteButton}
            onClick={() => setIsMuted(!isMuted)}
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? '🔇' : '🔊'}
          </button>
          <button
            style={styles.leaderboardButton}
            onClick={() => setShowLeaderboard(!showLeaderboard)}
          >
            🏆 Leaderboard
          </button>
          {showLeaderboard && <LeaderboardDropdown onClose={() => setShowLeaderboard(false)} />}
        </div>

        <div style={styles.rightSection}>
          {connected && (
            <div style={styles.balanceDisplay}>
              {balance.toFixed(2)} SOL
            </div>
          )}
          <div style={styles.walletSection}>
            <WalletMultiButton />
            {connected && !username && (
              <button
                style={styles.claimButton}
                onClick={() => setShowUsernameModal(true)}
              >
                Claim Username
              </button>
            )}
            {connected && username && (
              <div style={styles.claimedBadge}>Username Claimed</div>
            )}
            {connected && (
              <button
                style={styles.profileButton}
                onClick={() => setShowProfileModal(true)}
              >
                Profile
              </button>
            )}
          </div>
        </div>
      </header>

      {showUsernameModal && <UsernameModal onClose={() => setShowUsernameModal(false)} />}
      {showProfileModal && <ProfileModal onClose={() => setShowProfileModal(false)} />}
    </>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: '20px',
    background: 'rgba(255, 255, 255, 0.3)',
    backdropFilter: 'blur(10px)',
  },
  leftSection: {
    display: 'flex',
    gap: '10px',
    position: 'relative',
  },
  muteButton: {
    background: 'rgba(255, 255, 255, 0.5)',
    border: 'none',
    borderRadius: '8px',
    padding: '10px 15px',
    fontSize: '20px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  },
  leaderboardButton: {
    background: 'rgba(255, 255, 255, 0.5)',
    border: 'none',
    borderRadius: '8px',
    padding: '10px 15px',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  },
  rightSection: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: '10px',
  },
  balanceDisplay: {
    background: 'rgba(255, 255, 255, 0.5)',
    padding: '8px 16px',
    borderRadius: '8px',
    fontWeight: 600,
    fontSize: '16px',
  },
  walletSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    alignItems: 'flex-end',
  },
  claimButton: {
    background: 'linear-gradient(135deg, #ffd700 0%, #ffed4e 100%)',
    border: 'none',
    borderRadius: '8px',
    padding: '10px 20px',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  },
  claimedBadge: {
    background: 'rgba(144, 202, 249, 0.3)',
    padding: '8px 16px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: 500,
    color: '#555',
  },
  profileButton: {
    background: 'rgba(255, 255, 255, 0.5)',
    border: 'none',
    borderRadius: '8px',
    padding: '10px 20px',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  },
};