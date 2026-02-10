import Fastify from 'fastify';
import cors from '@fastify/cors';

import { privateRoutes } from "./routes/private";
import { config } from './config';
import { initWebSocket } from './websocket';
import { registerRoutes } from './routes';
import { initIndexer } from './indexer';

const fastify = Fastify({
  logger: true,
});

// CORS
fastify.register(cors, {
  origin: ['https://soljack.online', 'http://localhost:8080'],
});

// Register routes
registerRoutes(fastify);

// Start server
const start = async () => {
  try {
    await fastify.listen({ port: config.port, host: '0.0.0.0' });
    console.log(`✅ HTTP server listening on port ${config.port}`);

    // Start WebSocket server
    initWebSocket();
    console.log(`✅ WebSocket server listening on port ${config.wsPort}`);

    // Start blockchain indexer
    initIndexer();
    console.log('✅ Blockchain indexer started');
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();