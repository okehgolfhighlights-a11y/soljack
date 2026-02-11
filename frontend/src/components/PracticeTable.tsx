import { useEffect, useMemo, useState } from "react";

type Suit = "♠️" | "♥️" | "♦️" | "♣️";
type Rank = "A" | "K" | "Q" | "J" | "10" | "9" | "8" | "7" | "6" | "5" | "4" | "3" | "2";

interface Card {
  id: string;
  rank: Rank;
  suit: Suit;
}

const SUITS: Suit[] = ["♠️", "♥️", "♦️", "♣️"];
const RANKS: Rank[] = ["A","K","Q","J","10","9","8","7","6","5","4","3","2"];

function buildDeck(): Card[] {
  const deck: Card[] = [];
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      deck.push({
        id: '${rank}${suit}-${crypto.randomUUID()}',
        rank,
        suit,
      });
    }
  }
  return shuffle(deck);
}

function shuffle(deck: Card[]) {
  return [...deck].sort(() => Math.random() - 0.5);
}

function handValue(hand: Card[]): number {
  let total = 0;
  let aces = 0;

  for (const c of hand) {
    if (c.rank === "A") {
      total += 11;
      aces++;
    } else if (["K","Q","J"].includes(c.rank)) {
      total += 10;
    } else {
      total += Number(c.rank);
    }
  }

  while (total > 21 && aces > 0) {
    total -= 10;
    aces--;
  }

  return total;
}

export default function PracticeTable() {
  const [deck, setDeck] = useState<Card[]>([]);
  const [playerHand, setPlayerHand] = useState<Card[]>([]);
  const [dealerHand, setDealerHand] = useState<Card[]>([]);
  const [message, setMessage] = useState("");
  const [bankroll, setBankroll] = useState<number>(() => {
    const saved = localStorage.getItem("practice_bankroll");
    return saved ? Number(saved) : 1;
  });

  useEffect(() => {
    localStorage.setItem("practice_bankroll", bankroll.toString());
  }, [bankroll]);

  useEffect(() => {
    resetGame();
  }, []);

  const playerScore = useMemo(() => handValue(playerHand), [playerHand]);
  const dealerScore = useMemo(() => handValue(dealerHand), [dealerHand]);

  function drawCard(): Card {
    if (deck.length === 0) {
      const fresh = buildDeck();
      setDeck(fresh);
      return fresh.pop()!;
    }

    const next = [...deck];
    const card = next.pop()!;
    setDeck(next);
    return card;
  }

  function resetGame() {
    const newDeck = buildDeck();
    setDeck(newDeck);
    setPlayerHand([newDeck.pop()!, newDeck.pop()!]);
    setDealerHand([newDeck.pop()!]);
    setMessage("");
  }

  function hit() {
    setPlayerHand(prev => [...prev, drawCard()]);
  }

  function stand() {
    let dealer = [...dealerHand];

    while (handValue(dealer) < 17) {
      dealer.push(drawCard());
    }

    setDealerHand(dealer);

    const p = handValue(playerHand);
    const d = handValue(dealer);

    if (p > 21) {
      setMessage("Bust! You lose.");
      setBankroll(b => b - 0.05);
    } else if (d > 21 || p > d) {
      setMessage("You win!");
      setBankroll(b => b + 0.05);
    } else if (p === d) {
      setMessage("Push.");
    } else {
      setMessage("Dealer wins.");
      setBankroll(b => b - 0.05);
    }
  }

  function resetBankroll() {
    setBankroll(1);
    localStorage.removeItem("practice_bankroll");
  }

  return (
    <div className="sj-table">
      <h2>Practice Table</h2>

      <p>Bankroll: {bankroll.toFixed(2)} ◎</p>

      {/* DEALER HAND */}
      <div className="sj-hand">
        {dealerHand.map((c) => (
          <div key={c.id} className="sj-card">
            <div className="sj-card-front">
              <div className="sj-card-corner">
                {c.rank}{c.suit}
              </div>

              <div className="sj-card-suit">
                {c.suit}
              </div>

              <div className="sj-card-corner sj-card-corner-bottom">
                {c.rank}{c.suit}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* PLAYER HAND */}
      <div className="sj-hand">
        {playerHand.map((c) => (
          <div key={c.id} className="sj-card">
            <div className="sj-card-front">
              <div className="sj-card-corner">
                {c.rank}{c.suit}
              </div>

              <div className="sj-card-suit">
                {c.suit}
              </div>

              <div className="sj-card-corner sj-card-corner-bottom">
                {c.rank}{c.suit}
              </div>
            </div>
          </div>
        ))}
      </div>

      <p>
        Player: {playerScore} | Dealer: {dealerScore}
      </p>

      {message && <p>{message}</p>}

      <div className="sj-controls">
        <button onClick={hit}>Hit</button>
        <button onClick={stand}>Stand</button>
        <button onClick={resetGame}>New Hand</button>
        <button onClick={resetBankroll}>Reset Bankroll</button>
      </div>
    </div>
  );
}