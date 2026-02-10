import { FastifyRequest, FastifyReply } from 'fastify';
<<<<<<< Updated upstream
=======
import { getCache, setCache } from '../cache';
>>>>>>> Stashed changes

interface PlayerParams {
  wallet: string;
}

export async function getPlayerStats(
  request: FastifyRequest<{ Params: PlayerParams }>,
  reply: FastifyReply
) {
  try {
    const { wallet } = request.params;

<<<<<<< Updated upstream
=======
    // Check cache
    const cacheKey = `player:${wallet}:stats`;
    const cached = await getCache(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

>>>>>>> Stashed changes
    // TODO: Query blockchain/database for player stats
    const stats = {
      wallet,
      username: null,
      wins: 0,
      losses: 0,
      totalHands: 0,
      rank: null,
<<<<<<< Updated upstream
      recentHands: [],
    };

    return reply.send(stats);
  } catch (error) {
    console.error('Error fetching player stats:', error);
    return reply.code(500).send({ error: 'Failed to fetch player stats' });
  }
}
=======
      totalWagered: 0,
      totalWon: 0,
    };

    // Cache for 60 seconds
    await setCache(cacheKey, JSON.stringify(stats), 60);

    return stats;
  } catch (error) {
    reply.code(500).send({ error: 'Failed to fetch player stats' });
  }
}
>>>>>>> Stashed changes
