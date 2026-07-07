import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5004';

let socket = null;

export const connectSocket = (token) => {
  if (socket) {
    if (socket.auth.token !== token) {
      socket.auth.token = token;
      if (socket.connected) {
        socket.disconnect().connect();
      }
    }
    return socket;
  }

  socket = io(SOCKET_URL, {
    auth: { token },
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: Infinity, // Reconnect infinitely if disconnected
    reconnectionDelay: 1000,        // Start trying to reconnect after 1 second
    reconnectionDelayMax: 5000,     // Max delay between reconnection attempts is 5 seconds
    timeout: 20000,                 // Wait 20 seconds before timing out connection attempt
  });

  return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const joinRequestRoom = (requestId) => {
  socket?.emit('join_rooms', { requestId });
};

export const emitLocation = (requestId, latitude, longitude) => {
  socket?.emit('update_location', { requestId, latitude, longitude });
};
