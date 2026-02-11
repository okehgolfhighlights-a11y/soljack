import { useEffect, useMemo, useState } from "react";

type Suit = "♠️" | "♥️" | "♦️" | "♣️";

interface Card {
  id: string;
  suit: Suit;
  rank: string;
}

const SUITS: Suit[] = ["♠️", "♥️", "♦️", "♣️"];
const RANKS = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];

function buildDeck(): Card[] {
  const deck: Card[] = [];

  for (const suit of SUITS) {
    for (const rank of RANKS) {
      deck.push({
        id: crypto.randomUUID(),
        suit,
        rank,
      });
    }
  }

  return shuffle(deck);
}

function shuffle(deck: Card[]): Card[] {
  return [...deck].sort(() => Math.random() - 0.5);
}

function handValue(hand: Card[]): number {
  let total = 0;
  let aces = 0;

  for (const card of hand) {
    if (card.rank === "A") {
      total += 11;
      aces++;
    } else if (["K", "Q", "J"].includes(card.rank)) {
      total += 10;
    } else {
      total += Number(card.rank);
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

  function drawCard(currentDeck: Card[]): { card: Card; deck: Card[] } {
    const nextDeck = [...currentDeck];
    const card = nextDeck.pop()!;
    return { card, deck: nextDeck };
  }

  function resetGame() {
    const newDeck = buildDeck();

    const { card: p1, deck: d1 } = drawCard(newDeck);
    const { card: p2, deck: d2 } = drawCard(d1);
    const { card: dCard, deck: d3 } = drawCard(d2);

    setDeck(d3);
    setPlayerHand([p1, p2]);
    setDealerHand([dCard]);
    setMessage("");
  }

  function hit() {
    if (playerScore >= 21) return;

    const { card, deck: nextDeck } = drawCard(deck);
    setDeck(nextDeck);
    setPlayerHand((prev) => [...prev, card]);
  }

  function stand() {
    let dealer = [...dealerHand];
    let currentDeck = [...deck];

    while (handValue(dealer) < 17) {
      const { card, deck: nextDeck } = drawCard(currentDeck);
      dealer.push(card);
      currentDeck = nextDeck;
    }

    setDealerHand(dealer);
    setDeck(currentDeck);

    const p = handValue(playerHand);
    const d = handValue(dealer);

    if (p > 21) {
      setMessage("Bust! You lose.");
      setBankroll((b) => b - 0.05);
    } else if (d > 21 || p > d) {
      setMessage("You win!");
      setBankroll((b) => b + 0.05);
    } else if (p === d) {
      setMessage("Push.");
    } else {
      setMessage("Dealer wins.");
      setBankroll((b) => b - 0.05);
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

      {/* DEALER */}
      <div className="sj-hand">
        {dealerHand.map((c, i) => (
          <div
            key={c.id}
            className="sj-card"
            style={{ left: ${i * 36}px }}
          >
            <div className="sj-card-front">
              <div className="sj-card-corner">
                {c.rank}{c.suit}
              </div>
              <div className="sj-card-suit">{c.suit}</div>
              <div className="sj-card-corner sj-card-corner-bottom">
                {c.rank}{c.suit}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* PLAYER */}
      <div className="sj-hand">
        {playerHand.map((c, i) => (
          <div
            key={c.id}
            className="sj-card"
            style={{ left: ${i * 36}px }}
          >
            <div className="sj-card-front">
              <div className="sj-card-corner">
                {c.rank}{c.suit}
              </div>
              <div className="sj-card-suit">{c.suit}</div>
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