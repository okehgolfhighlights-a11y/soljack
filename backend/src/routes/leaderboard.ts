import { FastifyRequest, FastifyReply } from "fastify";
import { getCache, setCache } from "../cache";

interface LeaderboardQuery {
  limit?: string;
}

export async function getLeaderboard(
  request: FastifyRequest<{ Querystring: LeaderboardQuery }>,
  reply: FastifyReply
) {
  try {
    const limit = parseInt(request.query.limit ?? "100", 10);

    const cacheKey = 'leaderboard:${limit}';
    const cached = await getCache(cacheKey);

    if (cached) {
      return { entries: JSON.parse(cached) };
    }

    /**
     * 🔥 RESET STATE
     * No database yet = empty leaderboard
     */
    const entries: any[] = [];

    // Cache for 30 seconds
    await setCache(cacheKey, JSON.stringify(entries), 30);

    return { entries };
  } catch (error) {
    reply.code(500).send({ error: "Failed to fetch leaderboard" });
  }
}