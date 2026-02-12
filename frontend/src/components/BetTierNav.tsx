import { useGame } from "../context/GameContext";

const BET_TIERS = [
  { label: "0.01 SOL", value: 0.01 },
  { label: "0.05 SOL", value: 0.05 },
  { label: "0.1 SOL", value: 0.1 },
  { label: "0.25 SOL", value: 0.25 },
  { label: "0.5 SOL", value: 0.5 },
  { label: "1 SOL", value: 1.0 },
];

const COLORS = ["#e57373", "#ef9a9a", "#f48fb1", "#ce93d8", "#90caf9", "#81d4fa"];

interface Props {
  selectedTier: number | null;
  onSelectTier: (tier: number) => void;
  onPracticeMode: () => void;
  onTournamentMode: () => void;
}

export default function BetTierNav({
  selectedTier,
  onSelectTier,
  onPracticeMode,
  onTournamentMode,
}: Props) {
  const { balance } = useGame();

  return (
    <nav style={styles.nav}>
      <button
        style={{
          ...styles.practiceButton,
          background:
            selectedTier === -1
              ? "linear-gradient(135deg, #4caf50 0%, #81c784 100%)"
              : "rgba(76, 175, 80, 0.2)",
        }}
        onClick={onPracticeMode}
      >
        🤖 Practice
      </button>

      <button
        style={{
          ...styles.tournamentButton,
          background: "linear-gradient(135deg, #9c27b0 0%, #ba68c8 100%)",
        }}
        onClick={onTournamentMode}
      >
        🏆 Tournament 0.1 SOL
      </button>

      {BET_TIERS.map((tier, index) => {
        const isSelected = selectedTier === tier.value;
        const canAfford = balance >= tier.value + 0.001;

        return (
          <button
            key={tier.value}
            style={{
              ...styles.tierButton,
              background: isSelected
                ? `linear-gradient(135deg, ${COLORS[index]} 0%, ${COLORS[index]}dd 100%)`
                : canAfford
                ? "rgba(255, 255, 255, 0.5)"
                : "rgba(200, 200, 200, 0.3)",
              opacity: canAfford ? 1 : 0.5,
              cursor: canAfford ? "pointer" : "not-allowed",
              transform: isSelected ? "scale(1.05)" : "scale(1)",
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

const styles: Record<string, React.CSSProperties> = {
  nav: {
    display: "flex",
    justifyContent: "center",
    gap: 15,
    padding: 20,
    flexWrap: "wrap",
  },
  practiceButton: {
    border: "none",
    borderRadius: 12,
    padding: "15px 25px",
    fontSize: 16,
    fontWeight: 600,
    transition: "all 0.3s ease",
    cursor: "pointer",
    color: "white",
  },
  tournamentButton: {
    border: "none",
    borderRadius: 12,
    padding: "15px 25px",
    fontSize: 16,
    fontWeight: 600,
    transition: "all 0.3s ease",
    cursor: "pointer",
    color: "white",
  },
  tierButton: {
    border: "none",
    borderRadius: 12,
    padding: "15px 30px",
    fontSize: 16,
    fontWeight: 600,
    transition: "all 0.3s ease",
  },
};