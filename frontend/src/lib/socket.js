import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:8000';

let socket;

export const getSocket = () => {
  if (!socket) {
    socket = io(SOCKET_URL, {
      withCredentials: true,
      autoConnect: false,
    });
  }

  return socket;
};

export const connectSocket = (userId) => {
  const client = getSocket();
  if (!client.connected) {
    client.connect();
  }

  if (userId) {
    client.emit('join', userId);
  }

  return client;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
  }
};
