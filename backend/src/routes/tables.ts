import { FastifyRequest, FastifyReply } from 'fastify';

interface OpenTablesQuery {
  betAmount?: string;
}

interface TableParams {
  tableId: string;
}

export async function getOpenTables(
  request: FastifyRequest<{ Querystring: OpenTablesQuery }>,
  reply: FastifyReply
) {
  try {
    const betAmount = request.query.betAmount;

    // TODO: Query blockchain/database for open tables
    const tables: any[] = [];

    const filtered = betAmount
      ? tables.filter((t) => t.betAmount.toString() === betAmount)
      : tables;

    return reply.send({ tables: filtered });
  } catch (error) {
    console.error('Error fetching open tables:', error);
    return reply.code(500).send({ error: 'Failed to fetch open tables' });
  }
}

export async function getTableById(
  request: FastifyRequest<{ Params: TableParams }>,
  reply: FastifyReply
) {
  try {
    const { tableId } = request.params;

    // TODO: Query blockchain for table data
    return reply.code(404).send({ error: 'Table not found' });
  } catch (error) {
    console.error('Error fetching table:', error);
    return reply.code(500).send({ error: 'Failed to fetch table' });
  }
}