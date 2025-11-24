import React, { createContext, useContext, useEffect, useState } from 'react';
import { socket, socketService } from '../socket/socket';

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [privateMessages, setPrivateMessages] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [currentRoom, setCurrentRoom] = useState('general');
  const [connectionError, setConnectionError] = useState(null);

  useEffect(() => {
    // Socket connection events
    const onConnect = () => {
      setIsConnected(true);
      setConnectionError(null);
      console.log('Connected to server');
    };

    const onDisconnect = () => {
      setIsConnected(false);
      console.log('Disconnected from server');
    };

    const onConnectError = (error) => {
      setConnectionError(error.message);
      console.error('Connection error:', error);
    };

    // User events
    const onUserAuthenticated = (data) => {
      setUser(data.user);
      setUsers(data.users || []);
      setRooms(data.rooms || []);
      setMessages(data.messages || []);
    };

    const onUserJoined = (data) => {
      setUsers(data.users || []);
      if (data.username !== user?.username) {
        showNotification(`${data.username} joined the chat`);
      }
    };

    const onUserLeft = (data) => {
      setUsers(data.users || []);
      if (data.username !== user?.username) {
        showNotification(`${data.username} left the chat`);
      }
    };

    // Message events
    const onNewMessage = (message) => {
      setMessages(prev => [...prev, message]);
    };

    const onPrivateMessage = (message) => {
      setPrivateMessages(prev => [...prev, message]);
      playNotificationSound();
      showNotification(`Private message from ${message.from}`, message.text);
    };

    const onPrivateMessageSent = (message) => {
      setPrivateMessages(prev => [...prev, message]);
    };

    // Typing events
    const onUserTyping = (data) => {
      setTypingUsers(prev => {
        const filtered = prev.filter(user => user.username !== data.username);
        return [...filtered, data];
      });
    };

    const onUserStopTyping = (data) => {
      setTypingUsers(prev => prev.filter(user => user.username !== data.username));
    };

    // Room events
    const onRoomJoined = (room) => {
      setCurrentRoom(room);
    };

    const onUserJoinedRoom = (data) => {
      if (data.username !== user?.username) {
        showNotification(`${data.username} joined ${data.room}`);
      }
    };

    // Register event listeners
    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('connect_error', onConnectError);
    socket.on('user_authenticated', onUserAuthenticated);
    socket.on('user_joined', onUserJoined);
    socket.on('user_left', onUserLeft);
    socket.on('new_message', onNewMessage);
    socket.on('private_message', onPrivateMessage);
    socket.on('private_message_sent', onPrivateMessageSent);
    socket.on('user_typing', onUserTyping);
    socket.on('user_stop_typing', onUserStopTyping);
    socket.on('room_joined', onRoomJoined);
    socket.on('user_joined_room', onUserJoinedRoom);

    // Clean up event listeners
    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('connect_error', onConnectError);
      socket.off('user_authenticated', onUserAuthenticated);
      socket.off('user_joined', onUserJoined);
      socket.off('user_left', onUserLeft);
      socket.off('new_message', onNewMessage);
      socket.off('private_message', onPrivateMessage);
      socket.off('private_message_sent', onPrivateMessageSent);
      socket.off('user_typing', onUserTyping);
      socket.off('user_stop_typing', onUserStopTyping);
      socket.off('room_joined', onRoomJoined);
      socket.off('user_joined_room', onUserJoinedRoom);
    };
  }, [user]);

  const connect = () => {
    setConnectionError(null);
    socket.connect();
  };

  const disconnect = () => {
    socket.disconnect();
    setUser(null);
    setUsers([]);
    setMessages([]);
    setPrivateMessages([]);
  };

  const joinUser = (userData) => {
    socket.emit('user_join', userData);
  };

  const sendMessage = (messageData) => {
    socket.emit('send_message', messageData);
  };

  const sendPrivateMessage = (messageData) => {
    socket.emit('send_private_message', messageData);
  };

  const startTyping = (room = currentRoom) => {
    socket.emit('typing_start', { room });
  };

  const stopTyping = (room = currentRoom) => {
    socket.emit('typing_stop', { room });
  };

  const joinRoom = (room) => {
    socket.emit('join_room', { room });
  };

  const playNotificationSound = () => {
    try {
      const audio = new Audio('/notification.mp3');
      audio.volume = 0.3;
      audio.play().catch(() => {});
    } catch (error) {
      console.log('Notification sound not available');
    }
  };

  const showNotification = (title, body = '') => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, { body, icon: '/favicon.ico' });
    }
  };

  const value = {
    // State
    isConnected,
    connectionError,
    user,
    users,
    messages,
    privateMessages,
    typingUsers,
    rooms,
    currentRoom,
    
    // Actions
    connect,
    disconnect,
    joinUser,
    sendMessage,
    sendPrivateMessage,
    startTyping,
    stopTyping,
    joinRoom,
    
    // Setters
    setUser,
    setUsers,
    setMessages,
    setPrivateMessages,
    setCurrentRoom,
    
    // Helpers
    playNotificationSound,
    showNotification
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};
