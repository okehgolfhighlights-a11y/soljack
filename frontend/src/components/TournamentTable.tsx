
import React, { useEffect, useState } from "react";
import TableCore from "../game/table/TableCore";
import { useBlackjackGame } from "../game/hooks/useBlackjackGame";
import { createTournament, recordResult, TournamentType } from "../game/tournament/tournamentEngine";

interface Props {
  type: TournamentType;
}

export default function TournamentTable({ type }: Props) {
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

  const [tournament, setTournament] = useState(createTournament(type));

  useEffect(() => {
    start();
  }, []);

  useEffect(() => {
    if (phase === "end") {
      let result: "win" | "blackjack" | "loss" | "push" = "push";

      if (playerScore > 21) result = "loss";
      else if (dealerScore > 21 || playerScore > dealerScore) {
        result = playerScore === 21 && playerHand.length === 2
          ? "blackjack"
          : "win";
      } else if (playerScore < dealerScore) {
        result = "loss";
      }

      setTournament(prev => recordResult(prev, result));
    }
  }, [phase]);

  return (
    <div className="sj-table">
      <h2>Tournament Mode ({type})</h2>

      <TableCore
        title="Dealer"
        hand={dealerHand}
        hiddenFirst={phase !== "end"}
      />

      <TableCore title="Player" hand={playerHand} />

      <div className="sj-status">
        Player: {playerScore} | Dealer: {dealerScore}
      </div>

      <div className="sj-status">
        Points: {tournament.points} | Blackjacks: {tournament.blackjacks}
      </div>

      {tournament.type === "fixed" && (
        <div>Hands Remaining: {tournament.handsRemaining}</div>
      )}

      {tournament.type === "timed" && (
        <div>Time Left: {tournament.timeLeft}s</div>
      )}

      {tournament.type === "elimination" && (
        <div>
          Wins: {tournament.winsSoFar}/{tournament.winsRequired}
          {tournament.eliminated && <div>Eliminated</div>}
        </div>
      )}

      <div className="sj-controls">
        {phase === "player" && (
          <>
            <button onClick={hit}>Hit</button>
            <button onClick={stand}>Stand</button>
          </>
        )}

        {phase === "end" && (
          <button onClick={start}>Next Hand</button>
        )}
      </div>
    </div>
  );
}
