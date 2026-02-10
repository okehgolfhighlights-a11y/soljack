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
    </div>
  );
}

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