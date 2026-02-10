import { useEffect, useMemo, useRef, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";

/* =========================
   Types
========================= */

type Suit = "♠️" | "♥️" | "♦️" | "♣️";
type Rank =
  | "A"
  | "2"
  | "3"
  | "4"
  | "5"
  | "6"
  | "7"
  | "8"
  | "9"
  | "10"
  | "J"
  | "Q"
  | "K";

type Phase = "playing" | "dealer" | "settle" | "reshuffle";

interface Card {
  suit: Suit;
  rank: Rank;
  id: string;
  dealtAt: number; // used for animation keys + ordering
}

/* =========================
   Deck Helpers
========================= */

const SUITS: Suit[] = ["♠️", "♥️", "♦️", "♣️"];
const RANKS: Rank[] = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];

function buildDeck(): Card[] {
  const deck: Card[] = [];
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      deck.push({
        suit,
        rank,
        id: '${rank}${suit}-${Math.random().toString(16).slice(2)}',
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
  if (rank === "K" || rank === "Q" || rank === "J") return 10;
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
   UI: Card
========================= */

function PlayingCard({ card, index, fanDeg }: { card: Card; index: number; fanDeg: number }) {
  const red = card.suit === "♥️" || card.suit === "♦️";

  // Fan + slight spread
  const spreadX = index * 18;
  const rotate = index * fanDeg;

  return (
    <div
      className="sj-card"
      style={{
        transform: 'translateX(${spreadX}px) rotate(${rotate}deg)',
        color: red ? "#c0392b" : "#1f2937",
      }}
    >
      <div className="sj-card-inner">
        <div className="sj-card-face sj-card-front">
          <div className="sj-card-corner">{card.rank}{card.suit}</div>
          <div className="sj-card-suit">{card.suit}</div>
          <div className="sj-card-corner sj-card-corner-bottom">{card.rank}{card.suit}</div>
        </div>
        <div className="sj-card-face sj-card-back" />
      </div>
    </div>
  );
}

/* =========================
   Practice Table
========================= */

export default function PracticeTable() {
  const BET = 0.05;
  const START_BANKROLL = 1.0;

  const { publicKey } = useWallet();
  const storageKey = publicKey ? 'soljack_practice_${publicKey.toBase58()} ': null;

  const [bankroll, setBankroll] = useState<number>(START_BANKROLL);

  const [deck, setDeck] = useState<Card[]>([]);
  const [player, setPlayer] = useState<Card[]>([]);
  const [dealer, setDealer] = useState<Card[]>([]);
  const [phase, setPhase] = useState<Phase>("playing");
  const [overlay, setOverlay] = useState<string>("");

  const dealingRef = useRef(false);

  const playerTotal = useMemo(() => handValue(player), [player]);
  const dealerTotal = useMemo(() => handValue(dealer), [dealer]);

  /* -------------------- Load bankroll per wallet -------------------- */

  useEffect(() => {
    if (!storageKey) {
      setBankroll(START_BANKROLL);
      return;
    }
    const saved = localStorage.getItem(storageKey);
    setBankroll(saved ? Number(saved) : START_BANKROLL);
  }, [storageKey]);

  /* -------------------- Persist bankroll per wallet -------------------- */

  useEffect(() => {
    if (!storageKey) return;
    localStorage.setItem(storageKey, bankroll.toFixed(2));
  }, [bankroll, storageKey]);

  /* -------------------- Init deck and first hand -------------------- */

  useEffect(() => {
    const fresh = buildDeck();
    setDeck(fresh);
    startHand(fresh);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* -------------------- Hand Flow -------------------- */

  function startHand(currentDeck = deck) {
    // If not enough cards to deal a hand (2+2), reshuffle
    if (currentDeck.length < 4) {
      reshuffle();
      return;
    }

    dealingRef.current = true;
    setPhase("playing");
    setOverlay("");

    setPlayer([]);
    setDealer([]);

    // Staggered deal with animations (dealer then player pacing)
    setTimeout(() => deal("player"), 250);
    setTimeout(() => deal("dealer"), 550);
    setTimeout(() => deal("player"), 850);
    setTimeout(() => deal("dealer"), 1150);

    setTimeout(() => {
      dealingRef.current = false;
    }, 1250);
  }

  function reshuffle() {
    dealingRef.current = true;
    setPhase("reshuffle");
    setOverlay("Reshuffling…");

    setTimeout(() => {
      const fresh = buildDeck();
      setDeck(fresh);

      setOverlay("");
      setPhase("playing");
      dealingRef.current = false;

      startHand(fresh);
    }, 5000);
  }

  function deal(target: "player" | "dealer") {
    setDeck((d) => {
      const next = [...d];
      const card = next.shift();
      if (!card) return d;

      const dealtCard: Card = { ...card, dealtAt: Date.now() };

      if (target === "player") setPlayer((h) => [...h, dealtCard]);
      else setDealer((h) => [...h, dealtCard]);

      return next;
    });
  }

  function hit() {
    if (phase !== "playing") return;
    if (dealingRef.current) return;
    dealingRef.current = true;

    // If deck empties mid-hand, reshuffle BEFORE dealing (rare but possible)
    if (deck.length < 1) {
      reshuffle();
      return;
    }

    setTimeout(() => {
      deal("player");
      dealingRef.current = false;
    }, 250);
  }

  function stand() {
    if (phase !== "playing") return;
    if (dealingRef.current) return;
    setPhase("dealer");
  }

  /* -------------------- Bust detection -------------------- */

  useEffect(() => {
    if (phase !== "playing") return;
    if (playerTotal > 21) {
      setPhase("settle");
    }
  }, [playerTotal, phase]);

  /* -------------------- Dealer logic: stand on 17 -------------------- */

  useEffect(() => {
    if (phase !== "dealer") return;

    if (dealingRef.current) return;

    if (dealerTotal < 17) {
      dealingRef.current = true;

      if (deck.length < 1) {
        reshuffle();
        return;
      }

      setTimeout(() => {
        deal("dealer");
        dealingRef.current = false;
      }, 450);
    } else {
      setPhase("settle");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, dealerTotal]);

  /* -------------------- Settle and auto-next hand -------------------- */

  useEffect(() => {
    if (phase !== "settle") return;

    // Determine outcome
    let delta = -BET;

    const p = playerTotal;
    const d = dealerTotal;

    if (p > 21) delta = -BET;
    else if (d > 21) delta = BET;
    else if (p > d) delta = BET;
    else if (p === d) delta = 0;
    else delta = -BET;

    setBankroll((b) => Math.max(0, +(b + delta).toFixed(2)));

    // Auto-next hand
    setTimeout(() => {
      startHand();
    }, 1400);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  /* -------------------- Reset (per wallet) -------------------- */

  function resetPractice() {
    if (!storageKey) return;

    const ok = window.confirm("Reset practice bankroll back to 1.00 Folana?");
    if (!ok) return;

    localStorage.removeItem(storageKey);
    setBankroll(START_BANKROLL);

    const fresh = buildDeck();
    setDeck(fresh);
    setPlayer([]);
    setDealer([]);
    setPhase("playing");
    setOverlay("");

    setTimeout(() => startHand(fresh), 200);
  }

  /* =========================
     Render
========================= */

  if (!publicKey) {
    return (
      <div style={styles.center}>
        Connect Phantom to start Practice Mode
      </div>
    );
  }

  return (
    <div style={styles.wrap}>
      {/* Inline CSS animations (no extra files needed) */}
      <style>{css}</style>

      {overlay && <div style={styles.overlay}>{overlay}</div>}

      <div style={styles.hud}>
        <div style={styles.hudLeft}>
          <div style={styles.badge}>PRACTICE</div>
          <div style={styles.sub}>Single Deck • Dealer stands on 17</div>
        </div>

        <div style={styles.hudRight}>
          <div style={styles.bankroll}>
            Bankroll: <b>{bankroll.toFixed(2)}</b> FOL
          </div>
          <div style={styles.bet}>Bet: {BET.toFixed(2)} FOL</div>
          {bankroll !== START_BANKROLL && (
            <button style={styles.resetBtn} onClick={resetPractice}>
              Reset
            </button>
          )}
        </div>
      </div>

      <div style={styles.table}>
        {/* Dealer */}
        <div style={styles.section}>
          <div style={styles.label}>DEALER</div>
          <div style={styles.total}>Total: {dealerTotal}</div>
          <div style={styles.hand}>
            {dealer.map((c, i) => (
              <PlayingCard key={c.id + c.dealtAt} card={c} index={i} fanDeg={3} />
            ))}
          </div>
        </div>

        {/* Center status */}
        <div style={styles.mid}>
          <div style={styles.status}>
            {phase === "playing" && "YOUR TURN"}
            {phase === "dealer" && "DEALER TURN"}
            {phase === "settle" && "SETTLING…"}
            {phase === "reshuffle" && "RESHUFFLING…"}
          </div>
          <div style={styles.deckHint}>Deck: {deck.length} cards left</div>
        </div>

        {/* Player */}
        <div style={styles.section}>
          <div style={styles.label}>YOU</div>
          <div style={styles.total}>Total: {playerTotal}</div>
          <div style={styles.hand}>
            {player.map((c, i) => (
              <PlayingCard key={c.id + c.dealtAt} card={c} index={i} fanDeg={-5} />
            ))}
          </div>
        </div>

        {/* Actions */}
        <div style={styles.actions}>
          <button
            style={{ ...styles.btn, opacity: phase === "playing" ? 1 : 0.45 }}
            onClick={hit}
            disabled={phase !== "playing" || dealingRef.current}
          >
            HIT
          </button>
          <button
            style={{ ...styles.btn, opacity: phase === "playing" ? 1 : 0.45 }}
            onClick={stand}
            disabled={phase !== "playing" || dealingRef.current}
          >
            STAND
          </button>
        </div>
      </div>
    </div>
  );
}

/* =========================
   Styles
========================= */

const styles: Record<string, React.CSSProperties> = {
  wrap: {
    minHeight: "100vh",
    background: "radial-gradient(circle at center, #145a32 0%, #0b2e1a 65%, #071b10 100%)",
    color: "#ecf0f1",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    padding: 20,
  },
  overlay: {
    position: "absolute",
    inset: 0,
    background: "rgba(0,0,0,0.78)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 34,
    fontWeight: 900,
    letterSpacing: 1,
    zIndex: 10,
  },
  center: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 18,
    fontWeight: 800,
    background: "#000",
    color: "#fff",
  },
  hud: {
    position: "absolute",
    top: 18,
    left: 18,
    right: 18,
    display: "flex",
    justifyContent: "space-between",
    gap: 16,
    zIndex: 2,
  },
  hudLeft: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
  },
  badge: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
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
    opacity: 0.85,
    fontSize: 12,
  },
  hudRight: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    background: "rgba(0,0,0,0.35)",
    border: "1px solid rgba(255,255,255,0.10)",
    padding: "8px 12px",
    borderRadius: 12,
  },
  bankroll: { fontWeight: 700 },
  bet: { opacity: 0.9, fontSize: 13 },
  resetBtn: {
    background: "rgba(255,255,255,0.12)",
    border: "1px solid rgba(255,255,255,0.22)",
    color: "#fff",
    borderRadius: 10,
    padding: "6px 10px",
    cursor: "pointer",
    fontWeight: 800,
    fontSize: 12,
  },
  table: {
    width: 980,
    maxWidth: "98vw",
    height: 640,
    maxHeight: "80vh",
    background: "linear-gradient(180deg, #1e8449, #145a32)",
    borderRadius: "340px 340px 90px 90px",
    padding: 40,
    boxShadow: "0 28px 90px rgba(0,0,0,0.55)",
    position: "relative",
    overflow: "hidden",
  },
  section: {
    marginBottom: 34,
  },
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
  deckHint: {
    marginTop: 6,
    opacity: 0.75,
    fontSize: 12,
  },
  actions: {
    position: "absolute",
    bottom: 26,
    left: 0,
    right: 0,
    display: "flex",
    justifyContent: "center",
    gap: 18,
    zIndex: 2,
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
    backdropFilter: "blur(8px)",
  },
};

/* =========================
   Inline CSS (animations)
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
  border: 1px solid rgba(0,0,0,0.08);
}

.sj-card-back {
  background:
    radial-gradient(circle at 30% 30%, rgba(255,255,255,.20), rgba(255,255,255,0) 55%),
    linear-gradient(135deg, #0b1220, #111827);
  border: 1px solid rgba(255,255,255,0.10);
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
  opacity: .95;
}

@keyframes sjDeal {
  0% {
    opacity: 0;
    transform: translateX(-140px) translateY(-60px) scale(.88) rotate(-10deg);
  }
  100% {
    opacity: 1;
    transform: translateX(var(--sj-x, 0px)) translateY(0px) scale(1) rotate(var(--sj-r, 0deg));
  }
}

@keyframes sjFlip {
  0% { transform: rotateY(180deg) scale(.98); }
  100% { transform: rotateY(0deg) scale(1); }
}
`;