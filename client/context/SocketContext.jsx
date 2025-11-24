import React, { createContext, useContext, useEffect, useState } from 'react';
import socketClient from '../socket/socketClient';

const SocketContext = createContext(null);

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const socketInstance = socketClient.connect();
    setSocket(socketInstance);

    socketInstance.on('connect', () => {
      setIsConnected(true);
    });

    socketInstance.on('disconnect', () => {
      setIsConnected(false);
    });

    socketInstance.on('authenticated', (userData) => {
      setUser(userData);
    });

    return () => {
      socketClient.disconnect();
    };
  }, []);

  const authenticate = (username, avatar) => {
    return new Promise((resolve, reject) => {
      if (!socket) {
        reject(new Error('Socket not connected'));
        return;
      }

      socket.emit('authenticate', { username, avatar });

      socket.once('authenticated', (userData) => {
        setUser(userData);
        resolve(userData);
      });

      socket.once('auth_error', (error) => {
        reject(error);
      });
    });
  };

  const value = {
    socket,
    isConnected,
    user,
    authenticate,
    setUser
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};

