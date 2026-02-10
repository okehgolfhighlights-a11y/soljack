<<<<<<< Updated upstream
<<<<<<< Updated upstream
import { useEffect, useMemo, useRef, useState } from "react";

/* =========================
   Types
========================= */

type Suit = "♠️" | "♥️" | "♦️" | "♣️";
type Rank =
  | "A" | "2" | "3" | "4" | "5"
  | "6" | "7" | "8" | "9" | "10"
  | "J" | "Q" | "K";

type Phase = "waiting" | "playing" | "dealer" | "settle";

interface Card {
  suit: Suit;
  rank: Rank;
  id: string;
  dealtAt: number;
}

/* =========================
   Deck Helpers (PvP uses same visuals)
========================= */

const SUITS: Suit[] = ["♠️", "♥️", "♦️", "♣️"];
const RANKS: Rank[] = ["A","2","3","4","5","6","7","8","9","10","J","Q","K"];

function buildDeck(): Card[] {
  const deck: Card[] = [];
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      deck.push({
        suit,
        rank,
        id: ${rank}${suit}-${Math.random().toString(16).slice(2)},
        dealtAt: 0,
      });
    }
  }
  return shuffle(deck);
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function cardValue(rank: Rank): number {
  if (rank === "A") return 11;
  if (["K","Q","J"].includes(rank)) return 10;
  return Number(rank);
}

function handValue(cards: Card[]): number {
  let total = 0;
  let aces = 0;

  for (const c of cards) {
    total += cardValue(c.rank);
    if (c.rank === "A") aces++;
  }

  while (total > 21 && aces > 0) {
    total -= 10;
    aces--;
  }

  return total;
}

/* =========================
   UI: Card (same as Practice)
========================= */

function PlayingCard({
  card,
  index,
  fanDeg,
}: {
  card: Card;
  index: number;
  fanDeg: number;
}) {
  const red = card.suit === "♥️" || card.suit === "♦️";
  const spreadX = index * 18;
  const rotate = index * fanDeg;

  return (
    <div
      className="sj-card"
      style={{
        transform: translateX(${spreadX}px) rotate(${rotate}deg),
        color: red ? "#c0392b" : "#1f2937",
      }}
    >
      <div className="sj-card-inner">
        <div className="sj-card-face sj-card-front">
          <div className="sj-card-corner">{card.rank}{card.suit}</div>
          <div className="sj-card-suit">{card.suit}</div>
          <div className="sj-card-corner sj-card-corner-bottom">
            {card.rank}{card.suit}
          </div>
        </div>
        <div className="sj-card-face sj-card-back" />
      </div>
    </div>
  );
}

/* =========================
   PvP Table
========================= */

export default function TableSimple() {
  const [deck, setDeck] = useState<Card[]>([]);
  const [player, setPlayer] = useState<Card[]>([]);
  const [dealer, setDealer] = useState<Card[]>([]);
  const [phase, setPhase] = useState<Phase>("waiting");

  const dealingRef = useRef(false);

  const playerTotal = useMemo(() => handValue(player), [player]);
  const dealerTotal = useMemo(() => handValue(dealer), [dealer]);

  /* -------------------- Init (mock PvP join) -------------------- */

  useEffect(() => {
    const fresh = buildDeck();
    setDeck(fresh);
    setPhase("playing");
    startHand(fresh);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* -------------------- Hand Flow -------------------- */

  function startHand(currentDeck = deck) {
    dealingRef.current = true;
    setPlayer([]);
    setDealer([]);

    setTimeout(() => deal("player"), 250);
    setTimeout(() => deal("dealer"), 550);
    setTimeout(() => deal("player"), 850);
    setTimeout(() => deal("dealer"), 1150);

    setTimeout(() => {
      dealingRef.current = false;
      setPhase("playing");
    }, 1300);
  }

  function deal(target: "player" | "dealer") {
    setDeck((d) => {
      const next = [...d];
      const card = next.shift();
      if (!card) return d;

      const dealt: Card = { ...card, dealtAt: Date.now() };

      if (target === "player") setPlayer((h) => [...h, dealt]);
      else setDealer((h) => [...h, dealt]);

      return next;
    });
  }

  function hit() {
    if (phase !== "playing" || dealingRef.current) return;
    dealingRef.current = true;

    setTimeout(() => {
      deal("player");
      dealingRef.current = false;
    }, 250);
  }

  function stand() {
    if (phase !== "playing") return;
    setPhase("dealer");
  }

  /* -------------------- Dealer Logic -------------------- */

  useEffect(() => {
    if (phase !== "dealer") return;

    if (dealerTotal < 17) {
      dealingRef.current = true;
      setTimeout(() => {
        deal("dealer");
        dealingRef.current = false;
      }, 450);
    } else {
      setPhase("settle");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, dealerTotal]);

  /* -------------------- Settle (mock PvP) -------------------- */

  useEffect(() => {
    if (phase !== "settle") return;

    // Pause briefly, then next hand
    setTimeout(() => {
      startHand();
    }, 1400);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  /* =========================
     Render
========================= */

  return (
    <div style={styles.wrap}>
      <style>{css}</style>

      <div style={styles.hud}>
        <div style={styles.badge}>PVP</div>
        <div style={styles.sub}>Waiting on-chain sync (mock)</div>
      </div>

      <div style={styles.table}>
        {/* Dealer */}
        <div style={styles.section}>
          <div style={styles.label}>DEALER</div>
          <div style={styles.total}>Total: {dealerTotal}</div>
          <div style={styles.hand}>
            {dealer.map((c, i) => (
              <PlayingCard
                key={c.id + c.dealtAt}
                card={c}
                index={i}
                fanDeg={3}
              />
            ))}
          </div>
        </div>

        {/* Center */}
        <div style={styles.mid}>
          <div style={styles.status}>
            {phase === "playing" && "YOUR TURN"}
            {phase === "dealer" && "DEALER TURN"}
            {phase === "settle" && "SETTLING…"}
          </div>
        </div>

        {/* Player */}
        <div style={styles.section}>
          <div style={styles.label}>YOU</div>
          <div style={styles.total}>Total: {playerTotal}</div>
          <div style={styles.hand}>
            {player.map((c, i) => (
              <PlayingCard
                key={c.id + c.dealtAt}
                card={c}
                index={i}
                fanDeg={-5}
              />
            ))}
          </div>
        </div>

        {/* Actions */}
        <div style={styles.actions}>
          <button
            style={{ ...styles.btn, opacity: phase === "playing" ? 1 : 0.45 }}
            onClick={hit}
            disabled={phase !== "playing"}
          >
            HIT
          </button>
          <button
            style={{ ...styles.btn, opacity: phase === "playing" ? 1 : 0.45 }}
            onClick={stand}
            disabled={phase !== "playing"}
          >
            STAND
          </button>
        </div>
      </div>
=======
=======
>>>>>>> Stashed changes
import { useState, useEffect } from 'react';
import { PublicKey } from '@solana/web3.js';
import { useWallet } from '@solana/wallet-adapter-react';
import { useGame } from '../context/GameContext';
import { useGameProgram } from '../lib/anchor';
import * as crypto from 'crypto-browserify';

// Helper to convert card value to display
function cardToString(card: number): string {
  const suits = ['♠', '♥', '♦', '♣'];
  const ranks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
  const suit = suits[Math.floor(card / 13)];
  const rank = ranks[card % 13];
  return `${rank}${suit}`;
}

function ActiveGame({ tableData, tablePda, onLeave }: { tableData: any; tablePda: PublicKey; onLeave: () => void }) {
  const { publicKey } = useWallet();
  const program = useGameProgram();
  const [actionInProgress, setActionInProgress] = useState(false);

  const isCreator = tableData.creator.equals(publicKey);
  const myRole = isCreator ? tableData.creatorRole : (tableData.creatorRole.dealer ? { player: {} } : { dealer: {} });
  const myHand = isCreator ? tableData.creatorHand : tableData.opponentHand;
  const myTotal = isCreator ? tableData.creatorTotal : tableData.opponentTotal;
  const opponentHand = isCreator ? tableData.opponentHand : tableData.creatorHand;
  const opponentTotal = isCreator ? tableData.opponentTotal : tableData.creatorTotal;

  const isMyTurn = tableData.currentTurn &&
    ((tableData.currentTurn.dealer && myRole.dealer) || (tableData.currentTurn.player && myRole.player));

  const handleHit = async () => {
    if (!publicKey || !program || actionInProgress) return;

    setActionInProgress(true);
    try {
      const tx = await program.methods
        .hit()
        .accounts({
          player: publicKey,
          tableAccount: tablePda,
        })
        .rpc();

      console.log('Hit transaction:', tx);
    } catch (err: any) {
      console.error('Failed to hit:', err);
      alert(err.message || 'Failed to hit');
    } finally {
      setActionInProgress(false);
    }
  };

  const handleStand = async () => {
    if (!publicKey || !program || actionInProgress) return;

    setActionInProgress(true);
    try {
      const tx = await program.methods
        .stand()
        .accounts({
          player: publicKey,
          tableAccount: tablePda,
        })
        .rpc();

      console.log('Stand transaction:', tx);
    } catch (err: any) {
      console.error('Failed to stand:', err);
      alert(err.message || 'Failed to stand');
    } finally {
      setActionInProgress(false);
    }
  };

  return (
    <div style={styles.gameContainer}>
      <h2 style={styles.gameTitle}>Blackjack - {myRole.dealer ? 'Dealer' : 'Player'}</h2>

      <div style={styles.table}>
        {/* Opponent Section */}
        <div style={styles.handSection}>
          <div style={styles.handLabel}>
            Opponent ({myRole.dealer ? 'Player' : 'Dealer'})
            {!isMyTurn && <span style={styles.turnIndicator}> - Their Turn</span>}
          </div>
          <div style={styles.cards}>
            {opponentHand.map((card: number, i: number) => (
              <div key={i} style={styles.card}>
                {cardToString(card)}
              </div>
            ))}
          </div>
          <div style={styles.total}>Total: {opponentTotal}</div>
        </div>

        {/* My Hand Section */}
        <div style={{...styles.handSection, ...styles.myHandSection}}>
          <div style={styles.handLabel}>
            You ({myRole.dealer ? 'Dealer' : 'Player'})
            {isMyTurn && <span style={styles.turnIndicator}> - Your Turn</span>}
          </div>
          <div style={styles.cards}>
            {myHand.map((card: number, i: number) => (
              <div key={i} style={styles.card}>
                {cardToString(card)}
              </div>
            ))}
          </div>
          <div style={styles.total}>Total: {myTotal}</div>
        </div>
      </div>

      {/* Action Buttons */}
      {isMyTurn && (
        <div style={styles.actions}>
          <button
            style={styles.hitButton}
            onClick={handleHit}
            disabled={actionInProgress}
          >
            {actionInProgress ? 'Processing...' : 'HIT'}
          </button>
          <button
            style={styles.standButton}
            onClick={handleStand}
            disabled={actionInProgress}
          >
            {actionInProgress ? 'Processing...' : 'STAND'}
          </button>
        </div>
      )}

      {!isMyTurn && (
        <div style={styles.waitingMessage}>
          Waiting for opponent...
        </div>
      )}

      <button style={styles.leaveButton} onClick={onLeave}>
        Leave Table
      </button>
<<<<<<< Updated upstream
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
    </div>
  );
}

<<<<<<< Updated upstream
<<<<<<< Updated upstream
/* =========================
   Styles (same look as Practice)
========================= */

const styles: Record<string, React.CSSProperties> = {
  wrap: {
    minHeight: "100vh",
    background:
      "radial-gradient(circle at center, #145a32 0%, #0b2e1a 65%, #071b10 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    color: "#ecf0f1",
  },
  hud: {
    position: "absolute",
    top: 18,
    left: 18,
    display: "flex",
    flexDirection: "column",
    gap: 6,
    zIndex: 2,
  },
  badge: {
    padding: "6px 10px",
    borderRadius: 999,
    background: "rgba(0,0,0,0.45)",
    border: "1px solid rgba(255,215,0,0.35)",
    color: "#ffd700",
    fontWeight: 900,
    letterSpacing: 1,
    width: "fit-content",
  },
  sub: {
    fontSize: 12,
    opacity: 0.85,
  },
  table: {
    width: 980,
    height: 640,
    background: "linear-gradient(180deg, #1e8449, #145a32)",
    borderRadius: "340px 340px 90px 90px",
    padding: 40,
    boxShadow: "0 28px 90px rgba(0,0,0,0.55)",
    position: "relative",
  },
  section: { marginBottom: 34 },
  label: {
    textAlign: "center",
    fontWeight: 900,
    color: "#ffd700",
    letterSpacing: 1,
    marginBottom: 6,
  },
  total: {
    textAlign: "center",
    opacity: 0.85,
    marginBottom: 10,
    fontWeight: 700,
  },
  hand: {
    display: "flex",
    justifyContent: "center",
    minHeight: 150,
    position: "relative",
  },
  mid: {
    textAlign: "center",
    margin: "10px 0 14px",
  },
  status: {
    fontWeight: 900,
    fontSize: 18,
    color: "#00ffa3",
    textShadow: "0 0 14px rgba(0,255,163,0.55)",
    letterSpacing: 1,
  },
  actions: {
    position: "absolute",
    bottom: 26,
    left: 0,
    right: 0,
    display: "flex",
    justifyContent: "center",
    gap: 18,
  },
  btn: {
    padding: "12px 26px",
    fontSize: 16,
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.18)",
    background: "rgba(0,0,0,0.35)",
    color: "#fff",
    cursor: "pointer",
    fontWeight: 900,
    letterSpacing: 1,
  },
};

/* =========================
   Inline CSS animations
========================= */

const css = `
.sj-card {
  width: 92px;
  height: 132px;
  position: absolute;
  transform-origin: bottom center;
  animation: sjDeal 520ms cubic-bezier(.2,.8,.2,1) forwards;
  opacity: 0;
  filter: drop-shadow(0 10px 26px rgba(0,0,0,.35));
}

.sj-card-inner {
  width: 100%;
  height: 100%;
  border-radius: 14px;
  position: relative;
  transform-style: preserve-3d;
  animation: sjFlip 520ms cubic-bezier(.2,.8,.2,1) forwards;
}

.sj-card-face {
  position: absolute;
  inset: 0;
  border-radius: 14px;
  backface-visibility: hidden;
}

.sj-card-front {
  background: linear-gradient(135deg, #ffffff 0%, #f2f2f2 100%);
}

.sj-card-back {
  background: linear-gradient(135deg, #0b1220, #111827);
  transform: rotateY(180deg);
}

.sj-card-corner {
  position: absolute;
  top: 8px;
  left: 8px;
  font-weight: 900;
  font-size: 14px;
}

.sj-card-corner-bottom {
  top: auto;
  left: auto;
  bottom: 8px;
  right: 8px;
  transform: rotate(180deg);
}

.sj-card-suit {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40px;
  font-weight: 900;
}

@keyframes sjDeal {
  from {
    opacity: 0;
    transform: translateX(-140px) translateY(-60px) scale(.88) rotate(-10deg);
  }
  to {
    opacity: 1;
    transform: translateX(0px) translateY(0px) scale(1) rotate(0deg);
  }
}

@keyframes sjFlip {
  from { transform: rotateY(180deg); }
  to { transform: rotateY(0deg); }
}
`;
=======
=======
>>>>>>> Stashed changes
export default function TableSimple() {
  const { currentTableId, setCurrentTableId } = useGame();
  const { publicKey } = useWallet();
  const program = useGameProgram();

  const [tableData, setTableData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Poll table state
  useEffect(() => {
    if (!currentTableId || !program) return;

    const fetchTable = async () => {
      try {
        const tablePda = new PublicKey(currentTableId);
        const data = await program.account.tableAccount.fetch(tablePda);
        setTableData(data);
        setLoading(false);

        // Auto-handle commit/reveal phases
        await autoHandlePhases(data, tablePda);
      } catch (err) {
        console.error('Error fetching table:', err);
        setError('Failed to load table');
        setLoading(false);
      }
    };

    fetchTable();
    const interval = setInterval(fetchTable, 2000);
    return () => clearInterval(interval);
  }, [currentTableId, program, publicKey]);

  const autoHandlePhases = async (data: any, tablePda: PublicKey) => {
    if (!publicKey || !program) return;

    // Check if we need to submit commitment
    const isCreator = data.creator.equals(publicKey);
    const isOpponent = data.opponent?.equals(publicKey);

    if (!isCreator && !isOpponent) return;

    // Phase: Committing - submit our commitment
    if (data.state.committing) {
      const needsCommitment =
        (isCreator && !data.creatorCommitment) ||
        (isOpponent && !data.opponentCommitment);

      if (needsCommitment) {
        try {
          // Generate random seed
          const seed = crypto.randomBytes(32);

          // Hash it for commitment
          const hash = crypto.createHash('sha256');
          hash.update(seed);
          const commitment = hash.digest();

          // Store seed locally for reveal
          localStorage.setItem(`table_${currentTableId}_seed`, seed.toString('hex'));

          // Submit commitment
          await program.methods
            .submitCommitment(Array.from(commitment))
            .accounts({
              player: publicKey,
              tableAccount: tablePda,
            })
            .rpc();

          console.log('Commitment submitted');
        } catch (err) {
          console.error('Failed to submit commitment:', err);
        }
      }
    }

    // Phase: Both committed, need to reveal
    if (data.creatorCommitment && data.opponentCommitment) {
      const needsReveal =
        (isCreator && !data.creatorSeedRevealed) ||
        (isOpponent && !data.opponentSeedRevealed);

      if (needsReveal) {
        try {
          const seedHex = localStorage.getItem(`table_${currentTableId}_seed`);
          if (!seedHex) {
            console.error('Seed not found in localStorage');
            return;
          }

          const seed = Buffer.from(seedHex, 'hex');

          // Reveal seed
          await program.methods
            .revealSeed(Array.from(seed))
            .accounts({
              player: publicKey,
              tableAccount: tablePda,
            })
            .rpc();

          console.log('Seed revealed');
        } catch (err) {
          console.error('Failed to reveal seed:', err);
        }
      }
    }
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loading}>Loading table...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.container}>
        <div style={styles.error}>{error}</div>
        <button onClick={() => setCurrentTableId(null)}>Back to Lobby</button>
      </div>
    );
  }

  if (!tableData) {
    return (
      <div style={styles.container}>
        <div style={styles.error}>Table not found</div>
        <button onClick={() => setCurrentTableId(null)}>Back to Lobby</button>
      </div>
    );
  }

  // Determine game phase
  const isWaiting = !tableData.opponent;
  const isCommitting = tableData.state.committing;
  const isActive = tableData.state.active;
  const isSettled = tableData.state.settled;

  // Simplified rendering based on state
  if (isWaiting) {
    return (
      <div style={styles.container}>
        <h2>Waiting for opponent to join...</h2>
        <p>Table ID: {currentTableId?.slice(0, 8)}...</p>
        <p>Bet: {(tableData.betAmount / 1e9).toFixed(2)} SOL</p>
        <button onClick={() => setCurrentTableId(null)}>Leave Table</button>
      </div>
    );
  }

  if (isCommitting) {
    return (
      <div style={styles.container}>
        <h2>Shuffling deck...</h2>
        <p>Using provably fair commit-reveal protocol</p>
        <div>
          Creator committed: {tableData.creatorCommitment ? '✓' : '...'}
        </div>
        <div>
          Opponent committed: {tableData.opponentCommitment ? '✓' : '...'}
        </div>
        <div>
          Creator revealed: {tableData.creatorSeedRevealed ? '✓' : '...'}
        </div>
        <div>
          Opponent revealed: {tableData.opponentSeedRevealed ? '✓' : '...'}
        </div>
      </div>
    );
  }

  if (isActive) {
    return <ActiveGame tableData={tableData} tablePda={new PublicKey(currentTableId!)} onLeave={() => setCurrentTableId(null)} />;
  }

  if (isSettled) {
    return (
      <div style={styles.container}>
        <h2>Game Complete!</h2>
        <p>Final scores would show here</p>
        <button onClick={() => setCurrentTableId(null)}>Back to Lobby</button>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <h2>Unknown State</h2>
      <pre>{JSON.stringify(tableData, null, 2)}</pre>
      <button onClick={() => setCurrentTableId(null)}>Back to Lobby</button>
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    padding: '40px',
    maxWidth: '800px',
    margin: '0 auto',
  },
  loading: {
    fontSize: '24px',
    textAlign: 'center',
  },
  error: {
    color: '#f44336',
    fontSize: '18px',
    marginBottom: '20px',
  },
  gameContainer: {
    padding: '40px',
    maxWidth: '900px',
    margin: '0 auto',
    minHeight: '100vh',
  },
  gameTitle: {
    fontSize: '32px',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: '40px',
    color: '#333',
  },
  table: {
    background: 'rgba(16, 124, 16, 0.8)',
    borderRadius: '20px',
    padding: '40px',
    marginBottom: '30px',
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)',
  },
  handSection: {
    marginBottom: '40px',
  },
  myHandSection: {
    background: 'rgba(255, 255, 255, 0.1)',
    borderRadius: '12px',
    padding: '20px',
    marginBottom: '0',
  },
  handLabel: {
    fontSize: '18px',
    fontWeight: 600,
    color: 'white',
    marginBottom: '15px',
  },
  turnIndicator: {
    color: '#ffd700',
    fontWeight: 'bold',
  },
  cards: {
    display: 'flex',
    gap: '10px',
    marginBottom: '15px',
    flexWrap: 'wrap',
  },
  card: {
    background: 'white',
    border: '2px solid #333',
    borderRadius: '8px',
    padding: '15px 10px',
    fontSize: '24px',
    fontWeight: 'bold',
    minWidth: '60px',
    textAlign: 'center',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
  },
  total: {
    fontSize: '20px',
    fontWeight: 'bold',
    color: 'white',
  },
  actions: {
    display: 'flex',
    gap: '20px',
    justifyContent: 'center',
    marginBottom: '30px',
  },
  hitButton: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    border: 'none',
    borderRadius: '12px',
    padding: '20px 60px',
    fontSize: '24px',
    fontWeight: 'bold',
    color: 'white',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
  },
  standButton: {
    background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    border: 'none',
    borderRadius: '12px',
    padding: '20px 60px',
    fontSize: '24px',
    fontWeight: 'bold',
    color: 'white',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
  },
  waitingMessage: {
    textAlign: 'center',
    fontSize: '20px',
    color: '#666',
    marginBottom: '30px',
    fontStyle: 'italic',
  },
  leaveButton: {
    display: 'block',
    margin: '0 auto',
    background: 'rgba(0, 0, 0, 0.2)',
    border: '1px solid rgba(0, 0, 0, 0.3)',
    borderRadius: '8px',
    padding: '12px 24px',
    fontSize: '16px',
    fontWeight: 600,
    color: '#333',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  },
};
<<<<<<< Updated upstream
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
