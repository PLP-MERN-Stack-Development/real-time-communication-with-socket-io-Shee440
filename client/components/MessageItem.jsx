import React, { useState, useEffect, useRef } from 'react';
import { useSocket } from '../context/SocketContext';

const MessageItem = ({ message, isOwn, currentRoom, showAvatar = true, grouped = false }) => {
  const { socket, user } = useSocket();
  const [showReactions, setShowReactions] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const messageRef = useRef(null);
  const reactions = ['👍', '❤️', '😂', '😮', '😢', '🔥', '🎉', '👏'];

  useEffect(() => {
    // Auto-hide reactions picker when clicking outside
    const handleClickOutside = (event) => {
      if (messageRef.current && !messageRef.current.contains(event.target)) {
        setShowReactions(false);
      }
    };

    if (showReactions) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showReactions]);

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleReaction = (reaction) => {
    if (!socket) return;
    socket.emit('add_reaction', {
      messageId: message.id,
      room: currentRoom,
      reaction
    });
    setShowReactions(false);
  };

  const handleMarkRead = () => {
    if (!socket || isOwn) return;
    socket.emit('mark_read', {
      messageId: message.id,
      room: currentRoom
    });
  };

  const messageReactions = message.reactions || {};
  const hasReactions = Object.keys(messageReactions).length > 0;

  return (
    <div 
      ref={messageRef}
      className={`message-item ${isOwn ? 'own' : ''} ${grouped ? 'grouped' : ''}`}
      onMouseEnter={() => {
        setIsHovered(true);
        handleMarkRead();
      }}
      onMouseLeave={() => setIsHovered(false)}
    >
      {!isOwn && showAvatar && (
        <div className="message-avatar">
          <img 
            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(message.sender)}&background=${message.senderAvatar || 'random'}&color=fff&size=128`}
            alt={message.sender}
            onError={(e) => {
              e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(message.sender)}&background=667eea&color=fff`;
            }}
          />
          <span className="online-indicator"></span>
        </div>
      )}
      {!isOwn && !showAvatar && <div className="message-avatar-spacer"></div>}
      <div className="message-content">
        {!isOwn && showAvatar && (
          <div className="message-sender">
            <span className="sender-name">{message.sender}</span>
            {message.isPrivate && (
              <span className="private-badge" title="Private message">🔒</span>
            )}
          </div>
        )}
        <div className={`message-bubble ${message.type === 'image' ? 'has-image' : ''}`}>
          {message.type === 'image' && message.fileUrl ? (
            <div className="message-image-container">
              <img 
                src={message.fileUrl} 
                alt="Shared image" 
                className="message-image"
                loading="lazy"
              />
              {message.content && message.content !== `Shared an image: ${message.fileUrl}` && (
                <p className="image-caption">{message.content}</p>
              )}
            </div>
          ) : (
            <p className="message-text">{message.content}</p>
          )}
          <div className="message-meta">
            <span className="message-time">{formatTime(message.timestamp)}</span>
            {isOwn && message.readBy && message.readBy.length > 0 && (
              <span className="read-indicator" title={`Read by ${message.readBy.join(', ')}`}>
                <span className="read-check">✓✓</span>
                <span className="read-text">Read</span>
              </span>
            )}
          </div>
        </div>
        {hasReactions && (
          <div className="message-reactions">
            {Object.entries(messageReactions).map(([reaction, users]) => (
              <button
                key={reaction} 
                className={`reaction-badge ${users.includes(user?.username) ? 'user-reacted' : ''}`}
                title={`${users.join(', ')} reacted with ${reaction}`}
                onClick={() => handleReaction(reaction)}
              >
                <span className="reaction-emoji">{reaction}</span>
                <span className="reaction-count">{users.length}</span>
              </button>
            ))}
          </div>
        )}
        {(isHovered || showReactions) && (
          <div className="message-actions">
            <button 
              className="reaction-btn"
              onClick={() => setShowReactions(!showReactions)}
              aria-label="Add reaction"
            >
              <span className="reaction-icon">😊</span>
            </button>
            {showReactions && (
              <div className="reaction-picker">
                {reactions.map(reaction => (
                  <button
                    key={reaction}
                    onClick={() => handleReaction(reaction)}
                    className="reaction-option"
                    title={reaction}
                  >
                    {reaction}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageItem;

