import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

function getSocketUrl() {
  return import.meta.env.VITE_WS_URL ?? window.location.origin;
}

export function connectNotificationSocket(onRefresh: () => void) {
  const token = localStorage.getItem('accessToken');
  if (!token) {
    return () => undefined;
  }

  if (!socket) {
    socket = io(getSocketUrl(), {
      path: '/socket.io',
      auth: { token },
      transports: ['websocket', 'polling'],
    });
  } else {
    socket.auth = { token };
    if (!socket.connected) {
      socket.connect();
    }
  }

  const handler = () => onRefresh();
  socket.on('notifications:refresh', handler);

  return () => {
    socket?.off('notifications:refresh', handler);
  };
}

export function disconnectNotificationSocket() {
  socket?.disconnect();
  socket = null;
}
