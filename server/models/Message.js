// Message model
class Message {
  constructor(data) {
    this.id = data.id || this.generateId();
    this.sender = data.sender;
    this.senderId = data.senderId;
    this.content = data.content;
    this.timestamp = data.timestamp || new Date();
    this.room = data.room || 'global';
    this.type = data.type || 'text'; // text, image, file
    this.fileUrl = data.fileUrl || null;
    this.reactions = data.reactions || {};
    this.readBy = data.readBy || [];
    this.isPrivate = data.isPrivate || false;
    this.recipient = data.recipient || null;
  }

  generateId() {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  addReaction(userId, reaction) {
    if (!this.reactions[reaction]) {
      this.reactions[reaction] = [];
    }
    if (!this.reactions[reaction].includes(userId)) {
      this.reactions[reaction].push(userId);
    }
  }

  markAsRead(userId) {
    if (!this.readBy.includes(userId)) {
      this.readBy.push(userId);
    }
  }

  toJSON() {
    return {
      id: this.id,
      sender: this.sender,
      senderId: this.senderId,
      content: this.content,
      timestamp: this.timestamp,
      room: this.room,
      type: this.type,
      fileUrl: this.fileUrl,
      reactions: this.reactions,
      readBy: this.readBy,
      isPrivate: this.isPrivate,
      recipient: this.recipient
    };
  }
}

module.exports = Message;

