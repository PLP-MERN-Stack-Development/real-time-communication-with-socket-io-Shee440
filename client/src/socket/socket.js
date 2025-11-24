import socket from './socket';

// Socket service with promise-based methods
export const socketService = {
  // Connection management
  connect() {
    return new Promise((resolve, reject) => {
      if (socket.connected) {
        resolve(socket);
        return;
      }

      const onConnect = () => {
        socket.off('connect_error', onError);
        resolve(socket);
      };

      const onError = (error) => {
        socket.off('connect', onConnect);
        reject(error);
      };

      socket.once('connect', onConnect);
      socket.once('connect_error', onError);
      socket.connect();
    });
  },

  disconnect() {
    socket.disconnect();
  },

  // User management
  joinUser(userData) {
    socket.emit('user_join', userData);
  },

  // Message management
  sendMessage(messageData) {
    return new Promise((resolve, reject) => {
      socket.emit('send_message', messageData, (response) => {
        if (response && response.success) {
          resolve(response);
        } else {
          reject(response?.error || 'Failed to send message');
        }
      });
    });
  },

  sendPrivateMessage(messageData) {
    return new Promise((resolve, reject) => {
      socket.emit('send_private_message', messageData, (response) => {
        if (response && response.success) {
          resolve(response);
        } else {
          reject(response?.error || 'Failed to send private message');
        }
      });
    });
  },

  // Typing indicators
  startTyping(room) {
    socket.emit('typing_start', { room });
  },

  stopTyping(room) {
    socket.emit('typing_stop', { room });
  },

  // Room management
  joinRoom(roomData) {
    socket.emit('join_room', roomData);
  },

  // Event subscription helpers
  onMessage(callback) {
    socket.on('new_message', callback);
    return () => socket.off('new_message', callback);
  },

  onPrivateMessage(callback) {
    socket.on('private_message', callback);
    return () => socket.off('private_message', callback);
  },

  onUserUpdate(callback) {
    socket.on('user_joined', callback);
    socket.on('user_left', callback);
    return () => {
      socket.off('user_joined', callback);
      socket.off('user_left', callback);
    };
  },

  onTyping(callback) {
    socket.on('user_typing', callback);
    socket.on('user_stop_typing', callback);
    return () => {
      socket.off('user_typing', callback);
      socket.off('user_stop_typing', callback);
    };
  }
};

export default socketService;
