import { useEffect, useState } from 'react';
import { useSocket } from '../context/SocketContext';

export const useSocketEvent = (eventName, callback) => {
  const { socket } = useSocket();

  useEffect(() => {
    if (!socket) return;

    socket.on(eventName, callback);

    return () => {
      socket.off(eventName, callback);
    };
  }, [socket, eventName, callback]);
};

export const useOnlineUsers = () => {
  const { socket } = useSocket();
  const [onlineUsers, setOnlineUsers] = useState([]);

  useEffect(() => {
    if (!socket) return;

    const handleOnlineUsers = (users) => {
      setOnlineUsers(users);
    };

    socket.on('online_users', handleOnlineUsers);

    return () => {
      socket.off('online_users', handleOnlineUsers);
    };
  }, [socket]);

  return onlineUsers;
};

export const useTypingIndicator = (room = 'global') => {
  const { socket, user } = useSocket();
  const [typingUsers, setTypingUsers] = useState([]);

  useEffect(() => {
    if (!socket) return;

    const handleTyping = (data) => {
      if (data.room === room && data.username !== user?.username) {
        setTypingUsers(prev => {
          if (!prev.includes(data.username)) {
            return [...prev, data.username];
          }
          return prev;
        });
      }
    };

    const handleStoppedTyping = (data) => {
      if (data.room === room) {
        setTypingUsers(prev => prev.filter(u => u !== data.username));
      }
    };

    socket.on('user_typing', handleTyping);
    socket.on('user_stopped_typing', handleStoppedTyping);

    return () => {
      socket.off('user_typing', handleTyping);
      socket.off('user_stopped_typing', handleStoppedTyping);
    };
  }, [socket, room, user]);

  return typingUsers;
};

