const { 
  addUser, 
  removeUser, 
  getUser, 
  getUsersInRoom, 
  addMessage, 
  getMessages,
  addTypingUser,
  removeTypingUser,
  getTypingUsers
} = require('../utils/storage');

module.exports = (io) => {
  io.on('connection', (socket) => {
    console.log(`✅ User connected: ${socket.id}`);

    // User authentication and joining
    socket.on('user_join', (userData) => {
      try {
        const user = {
          id: socket.id,
          username: userData.username,
          isOnline: true,
          lastSeen: new Date(),
          currentRoom: 'general',
          joinedAt: new Date()
        };

        addUser(user);
        socket.join('general');

        // Send authentication success with initial data
        socket.emit('user_authenticated', {
          user,
          users: getUsersInRoom('general'),
          rooms: ['general', 'random', 'tech'],
          messages: getMessages(50)
        });

        // Notify others about new user
        socket.broadcast.emit('user_joined', {
          username: userData.username,
          users: getUsersInRoom('general'),
          timestamp: new Date()
        });

        console.log(`👤 ${userData.username} joined the chat`);
      } catch (error) {
        console.error('Error in user_join:', error);
        socket.emit('error', { message: 'Failed to join chat' });
      }
    });

    // Handle chat messages
    socket.on('send_message', (messageData) => {
      try {
        const user = getUser(socket.id);
        if (!user) return;

        const message = {
          id: Date.now().toString(),
          text: messageData.text || messageData.message,
          username: user.username,
          userId: socket.id,
          room: messageData.room || user.currentRoom,
          timestamp: new Date(),
          type: 'text'
        };

        addMessage(message);

        // Broadcast to room
        io.to(message.room).emit('new_message', message);
        
        console.log(`💬 ${user.username} in ${message.room}: ${message.text}`);
      } catch (error) {
        console.error('Error in send_message:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Handle private messages
    socket.on('send_private_message', (data) => {
      try {
        const fromUser = getUser(socket.id);
        if (!fromUser) return;

        const toUser = Object.values(getUsersInRoom()).find(u => u.username === data.toUsername);
        
        if (toUser) {
          const privateMessage = {
            id: Date.now().toString(),
            from: fromUser.username,
            to: data.toUsername,
            text: data.text,
            timestamp: new Date(),
            read: false
          };

          // Send to recipient
          io.to(toUser.id).emit('private_message', privateMessage);
          // Send confirmation to sender
          socket.emit('private_message_sent', privateMessage);

          console.log(`🔒 Private message from ${fromUser.username} to ${data.toUsername}`);
        } else {
          socket.emit('error', { message: 'User not found or offline' });
        }
      } catch (error) {
        console.error('Error in send_private_message:', error);
        socket.emit('error', { message: 'Failed to send private message' });
      }
    });

    // Typing indicators
    socket.on('typing_start', (data) => {
      const user = getUser(socket.id);
      if (user) {
        addTypingUser(socket.id, {
          username: user.username,
          room: data.room || user.currentRoom
        });

        socket.to(data.room || user.currentRoom).emit('user_typing', {
          username: user.username,
          room: data.room || user.currentRoom
        });
      }
    });

    socket.on('typing_stop', (data) => {
      const user = getUser(socket.id);
      if (user) {
        removeTypingUser(socket.id);
        
        socket.to(data.room || user.currentRoom).emit('user_stop_typing', {
          username: user.username,
          room: data.room || user.currentRoom
        });
      }
    });

    // Room management
    socket.on('join_room', (roomData) => {
      try {
        const user = getUser(socket.id);
        if (user && user.currentRoom !== roomData.room) {
          const oldRoom = user.currentRoom;
          
          // Leave old room
          socket.leave(oldRoom);
          
          // Join new room
          user.currentRoom = roomData.room;
          socket.join(roomData.room);

          // Update user in storage
          addUser(user);

          // Notify user
          socket.emit('room_joined', roomData.room);

          // Notify others in the new room
          socket.to(roomData.room).emit('user_joined_room', {
            username: user.username,
            room: roomData.room
          });

          console.log(`🚪 ${user.username} moved to ${roomData.room}`);
        }
      } catch (error) {
        console.error('Error in join_room:', error);
        socket.emit('error', { message: 'Failed to join room' });
      }
    });

    // Message reactions
    socket.on('message_reaction', (data) => {
      try {
        const user = getUser(socket.id);
        if (user) {
          io.emit('message_reacted', {
            messageId: data.messageId,
            reaction: data.reaction,
            username: user.username,
            timestamp: new Date()
          });
        }
      } catch (error) {
        console.error('Error in message_reaction:', error);
      }
    });

    // Handle disconnection
    socket.on('disconnect', (reason) => {
      try {
        const user = getUser(socket.id);
        if (user) {
          removeUser(socket.id);
          removeTypingUser(socket.id);

          // Notify others
          socket.broadcast.emit('user_left', {
            username: user.username,
            users: getUsersInRoom(user.currentRoom),
            timestamp: new Date()
          });

          console.log(`❌ ${user.username} disconnected: ${reason}`);
        } else {
          console.log(`❌ Anonymous user disconnected: ${reason}`);
        }
      } catch (error) {
        console.error('Error in disconnect:', error);
      }
    });

    // Error handling
    socket.on('error', (error) => {
      console.error(`Socket error for ${socket.id}:`, error);
    });
  });

  // Global error handling
  io.engine.on('connection_error', (err) => {
    console.error('Connection error:', err);
  });
};
