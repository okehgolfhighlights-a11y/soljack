import { FastifyRequest, FastifyReply } from 'fastify';

interface PlayerParams {
  wallet: string;
}

export async function getPlayerStats(
  request: FastifyRequest<{ Params: PlayerParams }>,
  reply: FastifyReply
) {
  try {
    const { wallet } = request.params;

    // TODO: Query blockchain/database for player stats
    const stats = {
      wallet,
      username: null,
      wins: 0,
      losses: 0,
      totalHands: 0,
      rank: null,
      recentHands: [],
    };

    return reply.send(stats);
  } catch (error) {
    console.error('Error fetching player stats:', error);
    return reply.code(500).send({ error: 'Failed to fetch player stats' });
  }
}