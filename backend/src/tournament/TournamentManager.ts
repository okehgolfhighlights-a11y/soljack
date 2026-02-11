import { randomUUID } from "crypto";

export interface Match {
  id: string;
  playerA: string;
  playerB: string;
  dealerSeat: "A" | "B";
  winner?: string;
}

export interface Round {
  roundNumber: number;
  matches: Match[];
}

export interface Tournament {
  id: string;
  players: string[];
  rounds: Round[];
  status: "waiting" | "active" | "finished";
  currentRound: number;
}

export class TournamentManager {
  private tournament: Tournament | null = null;

  addPlayer(playerId: string) {
    if (!this.tournament) {
      this.tournament = {
        id: randomUUID(),
        players: [],
        rounds: [],
        status: "waiting",
        currentRound: 0,
      };
    }

    if (!this.tournament.players.includes(playerId)) {
      this.tournament.players.push(playerId);
    }

    if (this.tournament.players.length === 16) {
      this.startTournament();
    }
  }

  private startTournament() {
    if (!this.tournament) return;

    this.tournament.status = "active";
    this.tournament.currentRound = 1;

    const firstRound = this.createRound(
      this.shuffle([...this.tournament.players]),
      1
    );

    this.tournament.rounds.push(firstRound);
  }

  recordMatchWinner(matchId: string, winnerId: string) {
    if (!this.tournament) return;

    const round = this.tournament.rounds[this.tournament.currentRound - 1];
    const match = round.matches.find((m) => m.id === matchId);
    if (!match) return;

    match.winner = winnerId;

    if (round.matches.every((m) => m.winner)) {
      this.advanceRound();
    }
  }

  private advanceRound() {
    if (!this.tournament) return;

    const currentRound =
      this.tournament.rounds[this.tournament.currentRound - 1];

    const winners = currentRound.matches.map((m) => m.winner!) ;

    if (winners.length === 1) {
      this.tournament.status = "finished";
      return;
    }

    this.tournament.currentRound++;

    const nextRound = this.createRound(
      this.shuffle(winners),
      this.tournament.currentRound
    );

    this.tournament.rounds.push(nextRound);
  }

  private createRound(players: string[], roundNumber: number): Round {
    const matches: Match[] = [];

    for (let i = 0; i < players.length; i += 2) {
      const dealerSeat = Math.random() > 0.5 ? "A" : "B";

      matches.push({
        id: randomUUID(),
        playerA: players[i],
        playerB: players[i + 1],
        dealerSeat,
      });
    }

    return {
      roundNumber,
      matches,
    };
  }

  private shuffle<T>(array: T[]): T[] {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  getTournament() {
    return this.tournament;
  }
}