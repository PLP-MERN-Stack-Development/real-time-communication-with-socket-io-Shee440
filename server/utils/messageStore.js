// Message storage utility (in-memory, can be replaced with database)
const Message = require('../models/Message');

class MessageStore {
  constructor() {
    this.messages = new Map(); // room -> messages array
    this.maxMessagesPerRoom = 100; // Keep last 100 messages per room
  }

  addMessage(messageData) {
    const message = new Message(messageData);
    const room = message.room;

    if (!this.messages.has(room)) {
      this.messages.set(room, []);
    }

    const roomMessages = this.messages.get(room);
    roomMessages.push(message);

    // Keep only last N messages
    if (roomMessages.length > this.maxMessagesPerRoom) {
      roomMessages.shift();
    }

    return message;
  }

  getMessages(room, limit = 50, offset = 0) {
    if (!this.messages.has(room)) {
      return [];
    }
    const roomMessages = this.messages.get(room);
    return roomMessages.slice(-limit - offset, -offset || undefined).reverse();
  }

  getMessageById(messageId, room) {
    if (!this.messages.has(room)) {
      return null;
    }
    return this.messages.get(room).find(msg => msg.id === messageId);
  }

  addReaction(messageId, room, userId, reaction) {
    const message = this.getMessageById(messageId, room);
    if (message) {
      message.addReaction(userId, reaction);
      return message;
    }
    return null;
  }

  markAsRead(messageId, room, userId) {
    const message = this.getMessageById(messageId, room);
    if (message) {
      message.markAsRead(userId);
      return message;
    }
    return null;
  }

  searchMessages(room, query) {
    if (!this.messages.has(room)) {
      return [];
    }
    const lowerQuery = query.toLowerCase();
    return this.messages.get(room).filter(msg =>
      msg.content.toLowerCase().includes(lowerQuery)
    );
  }
}

module.exports = new MessageStore();

