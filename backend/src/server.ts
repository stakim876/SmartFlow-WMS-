import { createServer } from 'http';
import app from './app';
import { env } from './core/config/env';
import { prisma } from './core/config/database';
import { initSocket } from './core/realtime/socket';

async function main() {
  try {
    await prisma.$connect();
    console.log('Database connected');

    const server = createServer(app);
    initSocket(server);

    server.listen(env.port, () => {
      console.log(`Server running on http://localhost:${env.port}`);
      console.log(`API docs: http://localhost:${env.port}/api-docs`);
      console.log(`WebSocket: ws://localhost:${env.port}/socket.io`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

main();

const shutdown = async () => {
  await prisma.$disconnect();
  process.exit(0);
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
