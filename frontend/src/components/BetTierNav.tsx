import { useGame } from "../context/GameContext";

const BET_TIERS = [
  { label: "0.01 SOL", value: 0.01 },
  { label: "0.05 SOL", value: 0.05 },
  { label: "0.1 SOL", value: 0.1 },
  { label: "0.25 SOL", value: 0.25 },
  { label: "0.5 SOL", value: 0.5 },
  { label: "1 SOL", value: 1.0 },
];

interface Props {
  selectedTier: number | null;
  onSelectTier: (tier: number) => void;
  onPracticeMode: () => void;
}

export default function BetTierNav({
  selectedTier,
  onSelectTier,
  onPracticeMode,
}: Props) {
  const { balance } = useGame();

  return (
    <nav style={styles.nav}>
      {/* PRACTICE BUTTON */}
      <button
        style={{
          ...styles.practiceButton,
          background:
            selectedTier === null
              ? "linear-gradient(135deg, #4caf50 0%, #81c784 100%)"
              : "#4caf50",
        }}
        onClick={onPracticeMode}
      >
        🎮 Practice
      </button>

      {/* REAL BET TIERS */}
      {BET_TIERS.map((tier) => {
        const isSelected = selectedTier === tier.value;
        const canAfford = balance >= tier.value;

        return (
          <button
            key={tier.value}
            style={{
              ...styles.tierButton,
              background: isSelected
                ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                : canAfford
                ? "white"
                : "#eee",
              opacity: canAfford ? 1 : 0.5,
              cursor: canAfford ? "pointer" : "not-allowed",
              color: isSelected ? "white" : "#333",
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
    display: "flex",
    justifyContent: "center",
    gap: "15px",
    padding: "20px",
    flexWrap: "wrap",
  },
  practiceButton: {
    border: "none",
    borderRadius: "12px",
    padding: "15px 25px",
    fontSize: "16px",
    fontWeight: 600,
    color: "white",
    cursor: "pointer",
  },
  tierButton: {
    border: "none",
    borderRadius: "12px",
    padding: "15px 25px",
    fontSize: "16px",
    fontWeight: 600,
    transition: "all 0.2s ease",
  },
};