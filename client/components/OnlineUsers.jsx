import React, { useState, useEffect } from 'react';
import { useOnlineUsers } from '../hooks/useSocket';
import { useSocket } from '../context/SocketContext';
import PrivateMessageModal from './PrivateMessageModal';

const OnlineUsers = ({ currentRoom }) => {
  const onlineUsers = useOnlineUsers();
  const { socket, user } = useSocket();
  const [selectedUser, setSelectedUser] = useState(null);
  const [showPrivateModal, setShowPrivateModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handlePrivateMessage = (targetUser) => {
    setSelectedUser(targetUser);
    setShowPrivateModal(true);
  };

  const handleSendPrivateMessage = (content) => {
    if (!socket || !selectedUser) return;

    socket.emit('send_message', {
      content,
      isPrivate: true,
      recipient: selectedUser.username
    });

    setShowPrivateModal(false);
    setSelectedUser(null);
  };

  const filteredUsers = onlineUsers.filter(u => {
    if (u.username === user?.username) return false;
    if (searchQuery.trim()) {
      return u.username.toLowerCase().includes(searchQuery.toLowerCase());
    }
    return true;
  });

  const sortedUsers = [...filteredUsers].sort((a, b) => 
    a.username.localeCompare(b.username)
  );

  return (
    <>
      <div className="online-users">
        <div className="online-users-header">
          <h3>
            <span className="users-icon">👥</span>
            Online Users
            <span className="users-count">({onlineUsers.length})</span>
          </h3>
        </div>
        {onlineUsers.length > 3 && (
          <div className="users-search">
            <input
              type="text"
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="users-search-input"
            />
          </div>
        )}
        <div className="users-list">
          {sortedUsers.length === 0 ? (
            <div className="no-users-message">
              {searchQuery ? 'No users found' : 'No other users online'}
            </div>
          ) : (
            sortedUsers.map((onlineUser) => (
              <div key={onlineUser.socketId} className="user-item">
                <div className="user-avatar">
                  <img 
                    src={onlineUser.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(onlineUser.username)}&background=${onlineUser.avatarColor || 'random'}&color=fff&size=128`}
                    alt={onlineUser.username}
                    onError={(e) => {
                      e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(onlineUser.username)}&background=667eea&color=fff`;
                    }}
                  />
                  <span className="online-indicator" title="Online"></span>
                </div>
                <span className="user-name" title={onlineUser.username}>
                  {onlineUser.username}
                </span>
                <button 
                  className="pm-btn"
                  onClick={() => handlePrivateMessage(onlineUser)}
                  title={`Send private message to ${onlineUser.username}`}
                  aria-label={`Message ${onlineUser.username}`}
                >
                  💬
                </button>
              </div>
            ))
          )}
        </div>
      </div>
      {showPrivateModal && selectedUser && (
        <PrivateMessageModal
          user={selectedUser}
          onClose={() => {
            setShowPrivateModal(false);
            setSelectedUser(null);
          }}
          onSend={handleSendPrivateMessage}
        />
      )}
    </>
  );
};

export default OnlineUsers;

