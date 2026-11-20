import { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';
import { BaseUrl } from '../config';
import { getAuthToken } from '../Services/postServices';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);

/**
 * SocketProvider
 * Centralizes real-time WebSocket connection using Socket.IO.
 * - Authenticated with user JWT token
 * - Tracks online / offline presence across the platform
 * - Automatically connects on login and disconnects on logout
 */
export const SocketProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const socketRef = useRef(null);

  useEffect(() => {
    const token = getAuthToken();
    if (!currentUser || !token) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      setSocket(null);
      setIsConnected(false);
      setOnlineUsers(new Set());
      return;
    }

    // Create singleton socket connection
    const socketInstance = io(BaseUrl, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });

    socketRef.current = socketInstance;
    setSocket(socketInstance);

    socketInstance.on('connect', () => {
      setIsConnected(true);
    });

    socketInstance.on('disconnect', () => {
      setIsConnected(false);
    });

    socketInstance.on('connect_error', (err) => {
      console.warn('Socket connection error:', err?.message || err);
      setIsConnected(false);
    });

    // Real-time online presence handling
    socketInstance.on('users:online', (data) => {
      if (data?.userIds && Array.isArray(data.userIds)) {
        setOnlineUsers(new Set(data.userIds.map(Number)));
      }
    });

    socketInstance.on('user:online', (data) => {
      if (data?.userId) {
        setOnlineUsers((prev) => {
          const next = new Set(prev);
          next.add(Number(data.userId));
          return next;
        });
      }
    });

    socketInstance.on('user:offline', (data) => {
      if (data?.userId) {
        setOnlineUsers((prev) => {
          const next = new Set(prev);
          next.delete(Number(data.userId));
          return next;
        });
      }
    });

    return () => {
      socketInstance.disconnect();
      socketRef.current = null;
      setSocket(null);
      setIsConnected(false);
    };
  }, [currentUser?.id]);

  const isUserOnline = useCallback(
    (userId) => {
      if (!userId) return false;
      return onlineUsers.has(Number(userId));
    },
    [onlineUsers]
  );

  return (
    <SocketContext.Provider
      value={{
        socket,
        isConnected,
        onlineUsers,
        isUserOnline,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

/**
 * Hook to consume SocketContext safely
 */
export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    return {
      socket: null,
      isConnected: false,
      onlineUsers: new Set(),
      isUserOnline: () => false,
    };
  }
  return context;
};

export default SocketContext;
