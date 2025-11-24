// User management utility
class UserManager {
  constructor() {
    this.users = new Map(); // socketId -> user data
    this.usernames = new Set(); // Track usernames for uniqueness
  }

  addUser(socketId, userData) {
    if (this.usernames.has(userData.username)) {
      return false; // Username already taken
    }
    this.users.set(socketId, {
      ...userData,
      socketId,
      online: true,
      lastSeen: new Date(),
      currentRoom: 'global'
    });
    this.usernames.add(userData.username);
    return true;
  }

  removeUser(socketId) {
    const user = this.users.get(socketId);
    if (user) {
      this.usernames.delete(user.username);
      this.users.delete(socketId);
      return user;
    }
    return null;
  }

  getUser(socketId) {
    return this.users.get(socketId);
  }

  getUserByUsername(username) {
    for (const [socketId, user] of this.users.entries()) {
      if (user.username === username) {
        return { socketId, ...user };
      }
    }
    return null;
  }

  getAllUsers() {
    return Array.from(this.users.values());
  }

  getOnlineUsers() {
    return this.getAllUsers().filter(user => user.online);
  }

  updateUserRoom(socketId, room) {
    const user = this.users.get(socketId);
    if (user) {
      user.currentRoom = room;
      return true;
    }
    return false;
  }

  setUserOnline(socketId, online) {
    const user = this.users.get(socketId);
    if (user) {
      user.online = online;
      user.lastSeen = new Date();
      return true;
    }
    return false;
  }
}

module.exports = new UserManager();

