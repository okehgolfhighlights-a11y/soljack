
export type TournamentType = "fixed" | "timed" | "elimination";

export interface TournamentState {
  type: TournamentType;
  points: number;
  blackjacks: number;
  handsRemaining?: number;
  timeLeft?: number;
  winsRequired?: number;
  winsSoFar?: number;
  eliminated?: boolean;
}

export function createTournament(type: TournamentType): TournamentState {
  if (type === "fixed") {
    return {
      type,
      points: 0,
      blackjacks: 0,
      handsRemaining: 10
    };
  }

  if (type === "timed") {
    return {
      type,
      points: 0,
      blackjacks: 0,
      timeLeft: 300
    };
  }

  return {
    type: "elimination",
    points: 0,
    blackjacks: 0,
    winsRequired: 5,
    winsSoFar: 0,
    eliminated: false
  };
}

export function recordResult(state: TournamentState, result: "win" | "blackjack" | "loss" | "push") {
  const next = { ...state };

  if (result === "win") next.points += 1;
  if (result === "blackjack") {
    next.points += 2;
    next.blackjacks += 1;
  }

  if (state.type === "fixed" && next.handsRemaining !== undefined) {
    next.handsRemaining -= 1;
  }

  if (state.type === "elimination") {
    if (result === "win" || result === "blackjack") {
      next.winsSoFar = (next.winsSoFar || 0) + 1;
    } else if (result === "loss") {
      next.eliminated = true;
    }
  }

  return next;
}
