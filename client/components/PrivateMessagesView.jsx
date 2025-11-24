import React, { useState, useEffect, useRef } from 'react';
import { useSocket } from '../context/SocketContext';
import MessageList from './MessageList';
import MessageInput from './MessageInput';

const PrivateMessagesView = () => {
  const { socket, user } = useSocket();
  const [privateMessages, setPrivateMessages] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (message) => {
      if (message.isPrivate && (message.recipient === user?.username || message.sender === user?.username)) {
        setPrivateMessages(prev => {
          const exists = prev.find(m => m.id === message.id);
          if (exists) return prev;
          return [...prev, message];
        });

        // Update conversations list
        const otherUser = message.sender === user?.username ? message.recipient : message.sender;
        setConversations(prev => {
          const exists = prev.find(c => c.username === otherUser);
          if (exists) {
            return prev.map(c => 
              c.username === otherUser 
                ? { ...c, lastMessage: message, unread: c.username !== selectedConversation ? (c.unread || 0) + 1 : 0 }
                : c
            );
          }
          return [...prev, {
            username: otherUser,
            lastMessage: message,
            unread: 1
          }];
        });
      }
    };

    socket.on('new_message', handleNewMessage);

    return () => {
      socket.off('new_message', handleNewMessage);
    };
  }, [socket, user, selectedConversation]);

  const handleSelectConversation = (username) => {
    setSelectedConversation(username);
    const conversationMessages = privateMessages.filter(m => 
      (m.sender === username && m.recipient === user?.username) ||
      (m.sender === user?.username && m.recipient === username)
    );
    setPrivateMessages(conversationMessages);
    
    // Mark as read
    setConversations(prev => prev.map(c => 
      c.username === username ? { ...c, unread: 0 } : c
    ));
  };

  const handleSendPrivateMessage = (content) => {
    if (!socket || !user || !selectedConversation || !content.trim()) return;

    socket.emit('send_message', {
      content: content.trim(),
      isPrivate: true,
      recipient: selectedConversation
    });
  };

  const filteredMessages = selectedConversation
    ? privateMessages.filter(m => 
        (m.sender === selectedConversation && m.recipient === user?.username) ||
        (m.sender === user?.username && m.recipient === selectedConversation)
      )
    : [];

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [filteredMessages]);

  return (
    <div className="private-messages-view">
      <div className="conversations-list">
        <div className="conversations-header">
          <h3>
            <span className="conversations-icon">💬</span>
            Conversations
          </h3>
        </div>
        {conversations.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon-small">💭</div>
            <p className="empty-state-text">No private messages yet</p>
            <p className="empty-state-hint">Start a conversation from the online users list</p>
          </div>
        ) : (
          conversations.map(conv => (
            <div
              key={conv.username}
              className={`conversation-item ${selectedConversation === conv.username ? 'active' : ''}`}
              onClick={() => handleSelectConversation(conv.username)}
            >
              <div className="conversation-avatar">
                <img 
                  src={`https://ui-avatars.com/api/?name=${encodeURIComponent(conv.username)}&background=random&color=fff&size=128`}
                  alt={conv.username}
                  onError={(e) => {
                    e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(conv.username)}&background=667eea&color=fff`;
                  }}
                />
                <span className="online-indicator"></span>
              </div>
              <div className="conversation-info">
                <div className="conversation-name">{conv.username}</div>
                {conv.lastMessage && (
                  <div className="conversation-preview">
                    {conv.lastMessage.content.length > 30 
                      ? conv.lastMessage.content.substring(0, 30) + '...'
                      : conv.lastMessage.content}
                  </div>
                )}
              </div>
              {conv.unread > 0 && (
                <div className="unread-badge-small">{conv.unread > 99 ? '99+' : conv.unread}</div>
              )}
            </div>
          ))
        )}
      </div>
      <div className="private-messages-main">
        {selectedConversation ? (
          <>
            <div className="private-messages-header">
              <div className="pm-header-left">
                <div className="pm-header-avatar">
                  <img 
                    src={`https://ui-avatars.com/api/?name=${encodeURIComponent(selectedConversation)}&background=random&color=fff&size=128`}
                    alt={selectedConversation}
                    onError={(e) => {
                      e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedConversation)}&background=667eea&color=fff`;
                    }}
                  />
                  <span className="online-indicator"></span>
                </div>
                <div>
                  <h3>{selectedConversation}</h3>
                  <span className="pm-status">Online</span>
                </div>
              </div>
            </div>
            <MessageList 
              messages={filteredMessages}
              currentUser={user?.username}
              currentRoom="private"
            />
            <div ref={messagesEndRef} />
            <MessageInput 
              onSendMessage={handleSendPrivateMessage}
              currentRoom="private"
            />
          </>
        ) : (
          <div className="no-conversation-selected">
            <div className="empty-conversation-content">
              <div className="empty-conversation-icon">💬</div>
              <p className="empty-conversation-title">Select a conversation</p>
              <p className="empty-conversation-subtitle">Choose a conversation from the list to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PrivateMessagesView;

