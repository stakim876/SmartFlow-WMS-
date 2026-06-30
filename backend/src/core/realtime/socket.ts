import { Server as HttpServer } from 'http';
import jwt from 'jsonwebtoken';
import { Server, Socket } from 'socket.io';
import { env } from '../config/env';
import { AuthPayload } from '../middleware/auth';

let io: Server | null = null;

export function initSocket(server: HttpServer) {
  io = new Server(server, {
    cors: {
      origin: env.corsOrigin,
      credentials: true,
    },
    path: '/socket.io',
  });

  io.use((socket, next) => {
    try {
      const token =
        (socket.handshake.auth?.token as string | undefined) ??
        (socket.handshake.headers.authorization?.replace('Bearer ', '') as string | undefined);

      if (!token) {
        next(new Error('UNAUTHORIZED'));
        return;
      }

      const payload = jwt.verify(token, env.jwt.secret) as AuthPayload;
      socket.data.userId = payload.userId;
      next();
    } catch {
      next(new Error('UNAUTHORIZED'));
    }
  });

  io.on('connection', (socket: Socket) => {
    const userId = socket.data.userId as string;
    socket.join(`user:${userId}`);
  });

  return io;
}

export function getIo() {
  return io;
}

export function emitNotificationsRefresh(userId?: string) {
  if (!io) {
    return;
  }
  if (userId) {
    io.to(`user:${userId}`).emit('notifications:refresh');
    return;
  }
  io.emit('notifications:refresh');
}
