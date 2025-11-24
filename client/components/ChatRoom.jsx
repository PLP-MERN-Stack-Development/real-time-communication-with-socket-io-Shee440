import React, { useState, useEffect, useRef } from 'react';
import { useSocket } from '../context/SocketContext';
import { useTypingIndicator } from '../hooks/useSocket';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import OnlineUsers from './OnlineUsers';
import RoomSelector from './RoomSelector';
import MessageSearch from './MessageSearch';
import PrivateMessagesView from './PrivateMessagesView';

const ChatRoom = () => {
  const { socket, user } = useSocket();
  const [messages, setMessages] = useState([]);
  const [currentRoom, setCurrentRoom] = useState('global');
  const [rooms] = useState(['global', 'general', 'random', 'tech']);
  const [showPrivateMessages, setShowPrivateMessages] = useState(false);
  const [searchResults, setSearchResults] = useState(null);
  const [hasMoreMessages, setHasMoreMessages] = useState(false);
  const typingUsers = useTypingIndicator(currentRoom);
  const messagesEndRef = useRef(null);
  const messagesStartRef = useRef(null);

  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (message) => {
      if (message.room === currentRoom || (message.isPrivate && (message.recipient === user.username || message.sender === user.username))) {
        setMessages(prev => [...prev, message]);
        scrollToBottom();
      }
    };

    const handleMessageHistory = (history) => {
      setMessages(history);
      scrollToBottom();
    };

    const handleReactionAdded = (data) => {
      setMessages(prev => prev.map(msg => 
        msg.id === data.messageId 
          ? { ...msg, reactions: data.reactions }
          : msg
      ));
    };

    socket.on('new_message', handleNewMessage);
    socket.on('message_history', handleMessageHistory);
    socket.on('reaction_added', handleReactionAdded);

    return () => {
      socket.off('new_message', handleNewMessage);
      socket.off('message_history', handleMessageHistory);
      socket.off('reaction_added', handleReactionAdded);
    };
  }, [socket, currentRoom, user]);

  useEffect(() => {
    if (socket && currentRoom && !showPrivateMessages) {
      socket.emit('join_room', { room: currentRoom });
      setMessages([]);
      setSearchResults(null);
      loadMoreMessages();
    }
  }, [socket, currentRoom, showPrivateMessages]);

  const loadMoreMessages = () => {
    if (!socket) return;
    // In a real app, this would load older messages with pagination
    // For now, we just load the initial messages
    setHasMoreMessages(false);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = (content, type = 'text', fileUrl = null) => {
    if (!socket || !user || !content.trim()) return;

    socket.emit('send_message', {
      content: content.trim(),
      room: currentRoom,
      type,
      fileUrl
    });
  };

  const handleRoomChange = (room) => {
    setCurrentRoom(room);
  };

  if (showPrivateMessages) {
    return (
      <div className="chat-room">
        <div className="chat-sidebar">
          <OnlineUsers currentRoom={currentRoom} />
          <RoomSelector 
            rooms={rooms} 
            currentRoom={currentRoom} 
            onRoomChange={handleRoomChange} 
          />
        </div>
        <div className="chat-main">
          <div className="chat-header">
            <h2>Private Messages</h2>
            <button 
              className="back-btn"
              onClick={() => setShowPrivateMessages(false)}
            >
              ← Back to Rooms
            </button>
          </div>
          <PrivateMessagesView />
        </div>
      </div>
    );
  }

  return (
    <div className="chat-room">
      <div className="chat-sidebar">
        <OnlineUsers currentRoom={currentRoom} />
        <button 
          className="pm-view-btn"
          onClick={() => setShowPrivateMessages(true)}
          title="View private messages"
        >
          <span className="pm-icon">💬</span>
          <span className="pm-text">Private Messages</span>
        </button>
        <RoomSelector 
          rooms={rooms} 
          currentRoom={currentRoom} 
          onRoomChange={handleRoomChange} 
        />
      </div>
      <div className="chat-main">
        <div className="chat-header">
          <div className="chat-header-left">
            <h2>
              <span className="room-hash">#</span>
              {currentRoom}
            </h2>
            {searchResults && (
              <button 
                className="clear-search-btn"
                onClick={() => setSearchResults(null)}
                title="Clear search"
              >
                ✕ Clear search
              </button>
            )}
          </div>
          <div className="chat-header-right">
            <MessageSearch 
              currentRoom={currentRoom}
              onSearchResults={setSearchResults}
            />
          </div>
          {typingUsers.length > 0 && (
            <div className="typing-indicator">
              <span className="typing-dots">
                <span></span><span></span><span></span>
              </span>
              <span className="typing-text">
                {typingUsers.join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...
              </span>
            </div>
          )}
        </div>
        {hasMoreMessages && (
          <div className="load-more-container">
            <button onClick={loadMoreMessages} className="load-more-btn">
              <span>⬆</span> Load older messages
            </button>
          </div>
        )}
        <div ref={messagesStartRef} />
        <MessageList 
          messages={searchResults || messages} 
          currentUser={user?.username}
          currentRoom={currentRoom}
        />
        <div ref={messagesEndRef} />
        <MessageInput 
          onSendMessage={handleSendMessage}
          currentRoom={currentRoom}
        />
      </div>
    </div>
  );
};

export default ChatRoom;

