import React, { useEffect, useMemo, useState } from "react";

type Suit = "♠️" | "♥️" | "♦️" | "♣️";
type Rank = "A" | "K" | "Q" | "J" | "10" | "9" | "8" | "7" | "6" | "5" | "4" | "3" | "2";

export type Card = {
  id: string;
  suit: Suit;
  rank: Rank;
};

const SUITS: Suit[] = ["♠️", "♥️", "♦️", "♣️"];
const RANKS: Rank[] = ["A", "K", "Q", "J", "10", "9", "8", "7", "6", "5", "4", "3", "2"];

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildDeck(): Card[] {
  const deck: Card[] = [];
  let n = 0;
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      deck.push({
        id: '${rank}${suit}-${n++}-${Math.random().toString(16).slice(2)}',
        suit,
        rank,
      });
    }
  }
  return shuffle(deck);
}

function handValue(hand: Card[]): number {
  // count Aces last (as 11 then downgrade to 1)
  let total = 0;
  let aces = 0;

  for (const c of hand) {
    if (c.rank === "A") aces++;
    else if (c.rank === "K" || c.rank === "Q" || c.rank === "J") total += 10;
    else total += Number(c.rank);
  }

  total += aces * 11;
  while (total > 21 && aces > 0) {
    total -= 10;
    aces--;
  }
  return total;
}

function isBlackjack(hand: Card[]): boolean {
  return hand.length === 2 && handValue(hand) === 21;
}

function CardView({ c }: { c: Card }) {
  const isRed = c.suit === "♥️" || c.suit === "♦️";
  return (
    <div className="sj-card" style={{ color: isRed ? "#d32f2f" : "#111" }}>
      <div className="sj-card-front">
        <div className="sj-card-corner">
          {c.rank}
          {c.suit}
        </div>
        <div className="sj-card-suit">{c.suit}</div>
        <div className="sj-card-corner sj-card-corner-bottom">
          {c.rank}
          {c.suit}
        </div>
      </div>
    </div>
  );
}

export default function PracticeTable() {
  const [deck, setDeck] = useState<Card[]>(() => buildDeck());
  const [playerHand, setPlayerHand] = useState<Card[]>([]);
  const [dealerHand, setDealerHand] = useState<Card[]>([]);
  const [inHand, setInHand] = useState(false);
  const [message, setMessage] = useState<string>("");

  const [bankroll, setBankroll] = useState<number>(() => {
    const v = localStorage.getItem("practice_bankroll");
    return v ? Number(v) : 1;
  });

  useEffect(() => {
    localStorage.setItem("practice_bankroll", String(bankroll));
  }, [bankroll]);

  const playerScore = useMemo(() => handValue(playerHand), [playerHand]);
  const dealerScore = useMemo(() => handValue(dealerHand), [dealerHand]);

  function drawCard(): Card {
    let d = deck;
    if (d.length === 0) d = buildDeck();
    const [top, ...rest] = d;
    setDeck(rest);
    return top;
  }

  function dealNewHand() {
    setMessage("");
    setInHand(true);

    const d1 = drawCard();
    const d2 = drawCard();
    const p1 = drawCard();
    const p2 = drawCard();

    const dealer = [d1, d2];
    const player = [p1, p2];

    setDealerHand(dealer);
    setPlayerHand(player);

    const pbj = isBlackjack(player);
    const dbj = isBlackjack(dealer);

    if (pbj && dbj) {
      setMessage("Push. Both Blackjack.");
      setBankroll((b) => b); // no change
      setInHand(false);
    } else if (pbj) {
      setMessage("Blackjack! You win +0.05");
      setBankroll((b) => Number((b + 0.05).toFixed(4)));
      setInHand(false);
    } else if (dbj) {
      setMessage("Dealer Blackjack. You lose -0.05");
      setBankroll((b) => Number((b - 0.05).toFixed(4)));
      setInHand(false);
    }
  }

  function hit() {
    if (!inHand) return;
    const c = drawCard();
    const next = [...playerHand, c];
    setPlayerHand(next);

    const v = handValue(next);
    if (v > 21) {
      setMessage("Bust. You lose -0.05");
      setBankroll((b) => Number((b - 0.05).toFixed(4)));
      setInHand(false);
    }
  }

  function stand() {
    if (!inHand) return;

    // Dealer draws to 17
    let d = [...dealerHand];
    while (handValue(d) < 17) {
      d.push(drawCard());
    }
    setDealerHand(d);

    const p = handValue(playerHand);
    const ds = handValue(d);

    if (ds > 21) {
      setMessage("Dealer busts. You win +0.05");
      setBankroll((b) => Number((b + 0.05).toFixed(4)));
    } else if (p > ds) {
      setMessage("You win +0.05");
      setBankroll((b) => Number((b + 0.05).toFixed(4)));
    } else if (p < ds) {
      setMessage("You lose -0.05");
      setBankroll((b) => Number((b - 0.05).toFixed(4)));
    } else {
      setMessage("Push.");
    }

    setInHand(false);
  }

  function resetBankroll() {
    setBankroll(1);
    localStorage.removeItem("practice_bankroll");
  }

  useEffect(() => {
    // Auto-deal if no hand
    if (!inHand && playerHand.length === 0 && dealerHand.length === 0) {
      dealNewHand();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="sj-table">
      <h2>Practice Table</h2>
      <p>Bankroll: {bankroll.toFixed(2)} ◎</p>

      {/* DEALER */}
      <div className="sj-section">
        <div className="sj-label">Dealer</div>
        <div className="sj-hand">
          {dealerHand.map((c, i) => (
            <div key={c.id} className="sj-card-wrap" style={{ left: i * 36 }}>
              <CardView c={c} />
            </div>
          ))}
        </div>
        <div className="sj-score">Score: {dealerScore}</div>
      </div>

      {/* PLAYER */}
      <div className="sj-section">
        <div className="sj-label">Player</div>
        <div className="sj-hand">
          {playerHand.map((c, i) => (
            <div key={c.id} className="sj-card-wrap" style={{ left: i * 36 }}>
              <CardView c={c} />
            </div>
          ))}
        </div>
        <div className="sj-score">Score: {playerScore}</div>
      </div>

      {message && <p className="sj-message">{message}</p>}

      <div className="sj-controls">
        <button onClick={hit} disabled={!inHand}>
          Hit
        </button>
        <button onClick={stand} disabled={!inHand}>
          Stand
        </button>
        <button onClick={dealNewHand}>New Hand</button>
        <button onClick={resetBankroll}>Reset Bankroll</button>
      </div>
    </div>
  );
}      