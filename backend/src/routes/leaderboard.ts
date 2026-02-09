import { FastifyRequest, FastifyReply } from 'fastify';
import { getCache, setCache } from '../cache';

interface LeaderboardQuery {
  limit?: string;
}

export async function getLeaderboard(
  request: FastifyRequest<{ Querystring: LeaderboardQuery }>,
  reply: FastifyReply
) {
  try {
    const limit = parseInt(request.query.limit || '100');

    // Check cache
    const cacheKey = `leaderboard:${limit}`;
    const cached = await getCache(cacheKey);
    if (cached) {
      return reply.send(JSON.parse(cached));
    }

    // TODO: Query database for actual leaderboard
    const leaderboard: any[] = [];

    const response = { leaderboard };

    // Cache for 30 seconds
    await setCache(cacheKey, JSON.stringify(response), 30);

    return reply.send(response);
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return reply.code(500).send({ error: 'Failed to fetch leaderboard' });
  }
}