
import { useState, useMemo } from "react";

export interface PlayingCard {
  id: string;
  rank: string;
  suit: string;
}

const SUITS = ["♠","♥","♦","♣"];
const RANKS = ["A","K","Q","J","10","9","8","7","6","5","4","3","2"];

function shuffle(deck: PlayingCard[]) {
  return [...deck].sort(() => Math.random() - 0.5);
}

function buildDeck(): PlayingCard[] {
  const deck: PlayingCard[] = [];
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      deck.push({
        id: rank + suit + Math.random(),
        rank,
        suit
      });
    }
  }
  return shuffle(deck);
}

export function handValue(hand: PlayingCard[]): number {
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

export function useBlackjackGame() {
  const [deck, setDeck] = useState<PlayingCard[]>(buildDeck());
  const [playerHand, setPlayerHand] = useState<PlayingCard[]>([]);
  const [dealerHand, setDealerHand] = useState<PlayingCard[]>([]);
  const [phase, setPhase] = useState<"idle"|"player"|"dealer"|"end">("idle");

  const playerScore = useMemo(() => handValue(playerHand), [playerHand]);
  const dealerScore = useMemo(() => handValue(dealerHand), [dealerHand]);

  function drawCard(): PlayingCard {
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

  function start() {
    const fresh = buildDeck();
    setDeck(fresh);
    setPlayerHand([fresh.pop()!, fresh.pop()!]);
    setDealerHand([fresh.pop()!]);
    setPhase("player");
  }

  function hit() {
    if (phase !== "player") return;
    setPlayerHand(prev => [...prev, drawCard()]);
  }

  function stand() {
    if (phase !== "player") return;

    let dealer = [...dealerHand];
    while (handValue(dealer) < 17) {
      dealer.push(drawCard());
    }
    setDealerHand(dealer);
    setPhase("end");
  }

  return {
    playerHand,
    dealerHand,
    playerScore,
    dealerScore,
    phase,
    start,
    hit,
    stand
  };
}
