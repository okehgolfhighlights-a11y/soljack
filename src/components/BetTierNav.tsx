import { useGame } from '../context/GameContext';

const BET_TIERS = [
  { label: '0.01 SOL', value: 0.01, lamports: 10000000 },
  { label: '0.05 SOL', value: 0.05, lamports: 50000000 },
  { label: '0.1 SOL', value: 0.1, lamports: 100000000 },
  { label: '0.25 SOL', value: 0.25, lamports: 250000000 },
  { label: '0.5 SOL', value: 0.5, lamports: 500000000 },
  { label: '1 SOL', value: 1.0, lamports: 1000000000 },
];

const COLORS = ['#e57373', '#ef9a9a', '#f48fb1', '#ce93d8', '#90caf9', '#81d4fa'];

interface Props {
  selectedTier: number | null;
  onSelectTier: (tier: number) => void;
  onPracticeMode: () => void;
}

export default function BetTierNav({ selectedTier, onSelectTier, onPracticeMode }: Props) {
  const { balance } = useGame();

  return (
    <nav style={styles.nav}>
      {/* Practice Mode Button (Dev Mode) */}
      <button
        style={{
          ...styles.practiceButton,
          background: selectedTier === -1 
            ? 'linear-gradient(135deg, #4caf50 0%, #81c784 100%)'
            : 'rgba(76, 175, 80, 0.2)',
          transform: selectedTier === -1 ? 'scale(1.05)' : 'scale(1)',
          boxShadow: selectedTier === -1 ? '0 4px 12px rgba(76, 175, 80, 0.3)' : 'none',
        }}
        onClick={onPracticeMode}
        title="Practice against bot dealer - Free to play!"
      >
        🤖 Practice
      </button>

      {/* Regular Bet Tiers */}
      {BET_TIERS.map((tier, index) => {
        const isSelected = selectedTier === tier.value;
        const canAfford = balance >= tier.value + 0.001; // bet + fee
        
        return (
          <button
            key={tier.value}
            style={{
              ...styles.tierButton,
              background: isSelected 
                ? `linear-gradient(135deg, ${COLORS[index]} 0%, ${COLORS[index]}dd 100%)`
                : canAfford
                ? `rgba(255, 255, 255, 0.5)`
                : 'rgba(200, 200, 200, 0.3)',
              opacity: canAfford ? 1 : 0.5,
              cursor: canAfford ? 'pointer' : 'not-allowed',
              transform: isSelected ? 'scale(1.05)' : 'scale(1)',
              boxShadow: isSelected ? '0 4px 12px rgba(0,0,0,0.2)' : 'none',
            }}
            onClick={() => canAfford && onSelectTier(tier.value)}
            disabled={!canAfford}
          >
            {tier.label}
          </button>
        );
      })}
    </nav>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  nav: {
    display: 'flex',
    justifyContent: 'center',
    gap: '15px',
    padding: '20px',
    flexWrap: 'wrap',
  },
  practiceButton: {
    border: 'none',
    borderRadius: '12px',
    padding: '15px 25px',
    fontSize: '16px',
    fontWeight: 600,
    transition: 'all 0.3s ease',
    cursor: 'pointer',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  tierButton: {
    border: 'none',
    borderRadius: '12px',
    padding: '15px 30px',
    fontSize: '16px',
    fontWeight: 600,
    transition: 'all 0.3s ease',
  },
};