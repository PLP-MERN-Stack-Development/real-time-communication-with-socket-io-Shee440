const userManager = require('../utils/userManager');
const messageStore = require('../utils/messageStore');

function setupSocketHandlers(io) {
  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // User authentication
    socket.on('authenticate', (data) => {
      const { username, avatar } = data;
      
      if (!username || username.trim().length === 0) {
        socket.emit('auth_error', { message: 'Username is required' });
        return;
      }

      const success = userManager.addUser(socket.id, {
        username: username.trim(),
        avatar: avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(username)}&background=random`
      });

      if (success) {
        const user = userManager.getUser(socket.id);
        socket.emit('authenticated', user);
        
        // Join global room
        socket.join('global');
        
        // Notify others
        socket.to('global').emit('user_joined', {
          username: user.username,
          socketId: socket.id,
          timestamp: new Date()
        });

        // Send online users list
        socket.emit('online_users', userManager.getOnlineUsers());
        
        // Send recent messages
        const messages = messageStore.getMessages('global', 50);
        socket.emit('message_history', messages);
      } else {
        socket.emit('auth_error', { message: 'Username already taken' });
      }
    });

    // Send message
    socket.on('send_message', (data) => {
      const user = userManager.getUser(socket.id);
      if (!user) {
        socket.emit('error', { message: 'Not authenticated' });
        return;
      }

      const messageData = {
        sender: user.username,
        senderId: socket.id,
        content: data.content,
        room: data.room || 'global',
        type: data.type || 'text',
        fileUrl: data.fileUrl || null,
        isPrivate: data.isPrivate || false,
        recipient: data.recipient || null
      };

      const message = messageStore.addMessage(messageData);
      
      if (message.isPrivate && message.recipient) {
        // Private message
        const recipient = userManager.getUserByUsername(message.recipient);
        if (recipient) {
          io.to(recipient.socketId).emit('new_message', message.toJSON());
          socket.emit('message_sent', message.toJSON());
        } else {
          socket.emit('error', { message: 'User not found' });
        }
      } else {
        // Room message
        io.to(message.room).emit('new_message', message.toJSON());
      }
    });

    // Typing indicator
    socket.on('typing_start', (data) => {
      const user = userManager.getUser(socket.id);
      if (!user) return;

      socket.to(data.room || 'global').emit('user_typing', {
        username: user.username,
        room: data.room || 'global'
      });
    });

    socket.on('typing_stop', (data) => {
      const user = userManager.getUser(socket.id);
      if (!user) return;

      socket.to(data.room || 'global').emit('user_stopped_typing', {
        username: user.username,
        room: data.room || 'global'
      });
    });

    // Join room
    socket.on('join_room', (data) => {
      const user = userManager.getUser(socket.id);
      if (!user) return;

      const { room } = data;
      const oldRoom = user.currentRoom;

      socket.leave(oldRoom);
      socket.join(room);
      userManager.updateUserRoom(socket.id, room);

      socket.emit('room_joined', { room });
      socket.to(room).emit('user_joined_room', {
        username: user.username,
        room,
        timestamp: new Date()
      });

      // Send room messages
      const messages = messageStore.getMessages(room, 50);
      socket.emit('message_history', messages);
    });

    // Leave room
    socket.on('leave_room', (data) => {
      const user = userManager.getUser(socket.id);
      if (!user) return;

      const { room } = data;
      socket.leave(room);
      socket.to(room).emit('user_left_room', {
        username: user.username,
        room,
        timestamp: new Date()
      });
    });

    // Message reaction
    socket.on('add_reaction', (data) => {
      const user = userManager.getUser(socket.id);
      if (!user) return;

      const { messageId, room, reaction } = data;
      const message = messageStore.addReaction(messageId, room, user.username, reaction);
      
      if (message) {
        io.to(room).emit('reaction_added', {
          messageId,
          reaction,
          user: user.username,
          reactions: message.reactions
        });
      }
    });

    // Mark message as read
    socket.on('mark_read', (data) => {
      const user = userManager.getUser(socket.id);
      if (!user) return;

      const { messageId, room } = data;
      const message = messageStore.markAsRead(messageId, room, user.username);
      
      if (message) {
        socket.emit('message_read', {
          messageId,
          readBy: message.readBy
        });
      }
    });

    // Search messages
    socket.on('search_messages', (data) => {
      const { room, query } = data;
      const results = messageStore.searchMessages(room, query);
      socket.emit('search_results', { room, query, results: results.map(m => m.toJSON()) });
    });

    // Disconnect
    socket.on('disconnect', () => {
      const user = userManager.removeUser(socket.id);
      if (user) {
        io.to(user.currentRoom).emit('user_left', {
          username: user.username,
          timestamp: new Date()
        });
        io.emit('online_users', userManager.getOnlineUsers());
      }
      console.log('User disconnected:', socket.id);
    });
  });
}

module.exports = setupSocketHandlers;

