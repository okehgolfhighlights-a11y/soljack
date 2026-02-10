import { FastifyInstance } from "fastify";
import {
  createPrivateMatch,
  joinPrivateMatch,
  getActivePrivateMatches,
} from "../private/privateMatches";

export async function privateRoutes(fastify: FastifyInstance) {
  fastify.post("/private/create", async (req, reply) => {
    const body = req.body as any;

    const betSol = Number(body.betSol);
    const handsTotal = Number(body.handsTotal);

    if (
      !betSol ||
      betSol < 0.01 ||
      betSol > 20 ||
      !handsTotal ||
      handsTotal < 1 ||
      handsTotal > 11
    ) {
      return reply.code(400).send({ error: "Invalid params" });
    }

    const match = createPrivateMatch(betSol, handsTotal);
    return { match };
  });

  fastify.post("/private/join", async (req, reply) => {
    const body = req.body as any;
    const code = String(body.code || "").toUpperCase();

    const match = joinPrivateMatch(code);
    if (!match) {
      return reply.code(404).send({ error: "Invalid code" });
    }

    return { match };
  });

  fastify.get("/private/active", async () => {
    return getActivePrivateMatches();
  });
}