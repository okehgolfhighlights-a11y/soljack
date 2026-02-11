
import React, { useEffect } from "react";
import TableCore from "../game/table/TableCore";
import { useBlackjackGame } from "../game/hooks/useBlackjackGame";

// Foundation PvP table (socket integration comes next)
export default function PvPTable() {
  const {
    playerHand,
    dealerHand,
    playerScore,
    dealerScore,
    phase,
    start,
    hit,
    stand
  } = useBlackjackGame();

  useEffect(() => {
    start();
  }, []);

  return (
    <div className="sj-table">
      <h2>PvP Match</h2>

      <TableCore
        title="Opponent"
        hand={dealerHand}
        hiddenFirst={phase !== "end"}
      />

      <TableCore
        title="You"
        hand={playerHand}
      />

      <div className="sj-status">
        You: {playerScore} | Opponent: {dealerScore}
      </div>

      <div className="sj-controls">
        {phase === "player" && (
          <>
            <button onClick={hit}>Hit</button>
            <button onClick={stand}>Stand</button>
          </>
        )}

        {phase === "end" && (
          <button onClick={start}>Next Round</button>
        )}
      </div>
    </div>
  );
}
