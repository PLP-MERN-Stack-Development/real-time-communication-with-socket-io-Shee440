import React, { useMemo } from 'react';
import MessageItem from './MessageItem';

const MessageList = ({ messages, currentUser, currentRoom }) => {
  const groupedMessages = useMemo(() => {
    if (messages.length === 0) return [];

    const groups = [];
    let currentGroup = {
      date: null,
      messages: []
    };

    messages.forEach((message, index) => {
      const messageDate = new Date(message.timestamp);
      const messageDateStr = messageDate.toDateString();
      const prevMessage = index > 0 ? messages[index - 1] : null;
      const prevDateStr = prevMessage ? new Date(prevMessage.timestamp).toDateString() : null;
      const isNewDay = prevDateStr !== messageDateStr;
      const isSameSender = prevMessage && 
        prevMessage.sender === message.sender && 
        !isNewDay &&
        (messageDate - new Date(prevMessage.timestamp)) < 60000; // 1 minute

      if (isNewDay) {
        if (currentGroup.messages.length > 0) {
          groups.push(currentGroup);
        }
        currentGroup = {
          date: messageDateStr,
          messages: [message]
        };
      } else {
        if (isSameSender) {
          message.showAvatar = false;
          message.grouped = true;
        } else {
          message.showAvatar = true;
          message.grouped = false;
        }
        currentGroup.messages.push(message);
      }
    });

    if (currentGroup.messages.length > 0) {
      groups.push(currentGroup);
    }

    return groups;
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className="message-list empty">
        <div className="empty-state-content">
          <div className="empty-state-icon">💬</div>
          <p className="empty-state-title">No messages yet</p>
          <p className="empty-state-subtitle">Start the conversation by sending a message!</p>
        </div>
      </div>
    );
  }

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    }
  };

  return (
    <div className="message-list">
      {groupedMessages.map((group, groupIndex) => (
        <div key={groupIndex} className="message-group">
          <div className="date-divider">
            <span className="date-divider-line"></span>
            <span className="date-divider-text">{formatDate(group.date)}</span>
            <span className="date-divider-line"></span>
          </div>
          {group.messages.map((message) => (
            <MessageItem
              key={message.id}
              message={message}
              isOwn={message.sender === currentUser}
              currentRoom={currentRoom}
              showAvatar={message.showAvatar !== false}
              grouped={message.grouped === true}
            />
          ))}
        </div>
      ))}
    </div>
  );
};

export default MessageList;

