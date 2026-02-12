import { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import Header from "./Header";
import BetTierNav from "./BetTierNav";
import Lobby from "./Lobby";
import TableSimple from "./TableSimple";
import PracticeTable from "./PracticeTable";
import TournamentLobby from "./TournamentLobby";
import TournamentBracket from "./TournamentBracket";
import TournamentMatch from "./TournamentMatch";
import TournamentWinner from "./TournamentWinner";
import HowItWorks from "./HowItWorks";
import Stats from "./Stats";
import { useGame } from "../context/GameContext";

type TournamentPhase =
  | "lobby"
  | "bracket"
  | "match"
  | "winner";

export default function HomePage() {
  const { connected } = useWallet();
  const { isAtTable } = useGame();
  const [selectedBetTier, setSelectedBetTier] = useState<number | null>(null);
  const [practiceMode, setPracticeMode] = useState(false);
  const [tournamentMode, setTournamentMode] = useState(false);

  const [tournamentPhase, setTournamentPhase] = useState<TournamentPhase>("lobby");
  const [tournamentPlayers, setTournamentPlayers] = useState<string[]>([]);
  const [matchResults, setMatchResults] = useState<Record<string, string>>({});
  const [currentMatch, setCurrentMatch] = useState<{ p1: string; p2: string } | null>(null);
  const [tournamentWinner, setTournamentWinner] = useState<string | null>(null);

  if (!connected) {
    return (
      <div style={styles.container}>
        <Header />
        <div style={styles.hero}>
          <div style={styles.logoContainer}>
            <h1 style={styles.logo}>SolJack</h1>
            <p style={styles.tagline}>PvP Blackjack on Solana</p>
          </div>
          <WalletMultiButton />
          <p style={styles.description}>
            Pure peer-to-peer blackjack. Choose Dealer or Player before matching.
            <br />
            Single deck, reshuffled when depleted. Provably fair.
          </p>
          <HowItWorks />
          <Stats />
        </div>
        <footer style={styles.footer}>
          Not financial advice. For entertainment purposes only.
        </footer>
      </div>
    );
  }

  if (isAtTable) {
    return <TableSimple />;
  }

  if (practiceMode) {
    return <PracticeTable onExit={() => setPracticeMode(false)} />;
  }

  if (tournamentMode) {
    if (tournamentPhase === "lobby") {
      return (
        <TournamentLobby
          onStart={(players) => {
            setTournamentPlayers(players);
            setTournamentPhase("bracket");
          }}
          onExit={() => {
            setTournamentMode(false);
            setTournamentPhase("lobby");
            setMatchResults({});
            setTournamentWinner(null);
          }}
        />
      );
    }

    if (tournamentPhase === "bracket") {
      return (
        <TournamentBracket
          players={tournamentPlayers}
          results={matchResults}
          onPlayMatch={(p1, p2) => {
            setCurrentMatch({ p1, p2 });
            setTournamentPhase("match");
          }}
        />
      );
    }

    if (tournamentPhase === "match" && currentMatch) {
      return (
        <TournamentMatch
          player1={currentMatch.p1}
          player2={currentMatch.p2}
          onMatchEnd={(winner) => {
            setMatchResults((prev) => ({
              ...prev,
              [`${currentMatch.p1}-${currentMatch.p2}`]: winner,
            }));

            const allMatches = Object.keys(matchResults).length + 1;

            if (allMatches === 7) {
              setTournamentWinner(winner);
              setTournamentPhase("winner");
            } else {
              setTournamentPhase("bracket");
            }
          }}
        />
      );
    }

    if (tournamentPhase === "winner" && tournamentWinner) {
      return (
        <TournamentWinner
          winner={tournamentWinner}
          onExit={() => {
            setTournamentMode(false);
            setTournamentPhase("lobby");
            setMatchResults({});
            setTournamentWinner(null);
          }}
        />
      );
    }
  }

  return (
    <div style={styles.container}>
      <Header />
      <BetTierNav
        selectedTier={selectedBetTier}
        onSelectTier={(tier) => {
          setSelectedBetTier(tier);
          setPracticeMode(false);
          setTournamentMode(false);
        }}
        onPracticeMode={() => {
          setSelectedBetTier(null);
          setPracticeMode(true);
          setTournamentMode(false);
        }}
        onTournamentMode={() => {
          setSelectedBetTier(null);
          setPracticeMode(false);
          setTournamentMode(true);
        }}
      />
      {selectedBetTier && selectedBetTier > 0 && <Lobby betTier={selectedBetTier} />}
      <footer style={styles.footer}>
        🏆 First username to 100 wins receives creator rewards from Pump.Fun token launch
      </footer>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
  },
  hero: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "40px 20px",
    maxWidth: 800,
    margin: "0 auto",
  },
  logoContainer: {
    textAlign: "center",
    marginBottom: 40,
  },
  logo: {
    fontSize: 64,
    fontWeight: "bold",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    marginBottom: 10,
  },
  tagline: {
    fontSize: 24,
    color: "#333",
    fontWeight: 500,
  },
  description: {
    marginTop: 30,
    fontSize: 18,
    color: "#555",
    textAlign: "center",
    lineHeight: 1.6,
  },
  footer: {
    padding: 20,
    textAlign: "center",
    fontSize: 14,
    color: "#666",
    background: "rgba(255, 255, 255, 0.3)",
    backdropFilter: "blur(10px)",
  },
};