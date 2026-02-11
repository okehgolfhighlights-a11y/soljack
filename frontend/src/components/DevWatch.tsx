
import React from "react";
import TableCore from "../game/table/TableCore";
import { PlayingCard } from "../game/hooks/useBlackjackGame";

interface DevWatchProps {
  playerHand: PlayingCard[];
  dealerHand: PlayingCard[];
  playerScore: number;
  dealerScore: number;
  phase: string;
}

export default function DevWatch({
  playerHand,
  dealerHand,
  playerScore,
  dealerScore,
  phase
}: DevWatchProps) {

  const cameraMode =
    phase === "player"
      ? "player-focus"
      : phase === "dealer"
      ? "dealer-focus"
      : phase === "end"
      ? "showdown"
      : "wide";

  return (
    <div className="devwatch-container">
      <div className={"camera-" + cameraMode}>
        <TableCore title="Dealer" hand={dealerHand} hiddenFirst={phase !== "end"} />
        <TableCore title="Player" hand={playerHand} />
      </div>

      <div className="devwatch-overlay">
        <div>Player: {playerScore}</div>
        <div>Dealer: {dealerScore}</div>
      </div>
    </div>
  );
}
