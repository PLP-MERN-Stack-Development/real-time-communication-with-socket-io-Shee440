import { io } from 'socket.io-client';

// Socket.io connection URL
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

// Create socket instance with enhanced configuration
export const socket = io(SOCKET_URL, {
  autoConnect: false,
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  timeout: 20000,
  transports: ['websocket', 'polling']
});

// Socket service with utility methods
export const socketService = {
  connect() {
    socket.connect();
  },

  disconnect() {
    socket.disconnect();
  },

  joinUser(userData) {
    socket.emit('user_join', userData);
  },

  sendMessage(messageData) {
    socket.emit('send_message', messageData);
  },

  sendPrivateMessage(messageData) {
    socket.emit('send_private_message', messageData);
  },

  startTyping(room) {
    socket.emit('typing_start', { room });
  },

  stopTyping(room) {
    socket.emit('typing_stop', { room });
  },

  joinRoom(roomData) {
    socket.emit('join_room', roomData);
  },

  // Event subscription helpers
  on(event, callback) {
    socket.on(event, callback);
    return () => socket.off(event, callback);
  },

  off(event, callback) {
    socket.off(event, callback);
  },

  once(event, callback) {
    socket.once(event, callback);
  }
};

// Export default socket instance
export default socket;
