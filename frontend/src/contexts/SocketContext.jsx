import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { getSocket } from '../services/socket';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const [connected, setConnected] = useState(false);
  const [listeners] = useState(() => new Map());

  useEffect(() => {
    if (!user) return;

    const socket = getSocket();
    if (!socket) return;

    const onConnect = () => setConnected(true);
    const onDisconnect = () => setConnected(false);

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    setConnected(socket.connected);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
    };
  }, [user]);

  const subscribe = useCallback((event, handler) => {
    const socket = getSocket();
    if (!socket) return () => {};

    socket.on(event, handler);
    return () => socket.off(event, handler);
  }, []);

  return (
    <SocketContext.Provider value={{ connected, subscribe }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const ctx = useContext(SocketContext);
  if (!ctx) throw new Error('useSocket must be used within SocketProvider');
  return ctx;
};
