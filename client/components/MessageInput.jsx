import React, { useState, useRef, useEffect } from 'react';
import { useSocket } from '../context/SocketContext';

const MessageInput = ({ onSendMessage, currentRoom }) => {
  const { socket, user } = useSocket();
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const typingTimeoutRef = useRef(null);
  const fileInputRef = useRef(null);
  const inputRef = useRef(null);

  const emojis = ['😀', '😂', '❤️', '👍', '🎉', '🔥', '😊', '😍', '🤔', '👏', '🙌', '💯'];

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      if (isTyping && socket) {
        socket.emit('typing_stop', { room: currentRoom });
      }
    };
  }, [socket, currentRoom, isTyping]);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setMessage(value);

    if (!isTyping && socket && value.trim()) {
      setIsTyping(true);
      socket.emit('typing_start', { room: currentRoom });
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      if (socket) {
        socket.emit('typing_stop', { room: currentRoom });
        setIsTyping(false);
      }
    }, 1000);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim() && onSendMessage && !uploading) {
      if (previewImage) {
        onSendMessage(message.trim() || 'Shared an image', 'image', previewImage);
        setPreviewImage(null);
      } else {
        onSendMessage(message.trim());
      }
      setMessage('');
      if (socket) {
        socket.emit('typing_stop', { room: currentRoom });
        setIsTyping(false);
      }
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }

    // Check if image
    if (file.type.startsWith('image/')) {
      setUploading(true);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
        setUploading(false);
        inputRef.current?.focus();
      };
      reader.onerror = () => {
        alert('Error reading file');
        setUploading(false);
      };
      reader.readAsDataURL(file);
    } else {
      alert('Please upload an image file');
    }
  };

  const handleEmojiClick = (emoji) => {
    setMessage(prev => prev + emoji);
    inputRef.current?.focus();
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const removePreview = () => {
    setPreviewImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="message-input-container">
      {previewImage && (
        <div className="image-preview">
          <img src={previewImage} alt="Preview" />
          <button 
            type="button"
            className="remove-preview-btn"
            onClick={removePreview}
            aria-label="Remove preview"
          >
            ×
          </button>
        </div>
      )}
      <form onSubmit={handleSubmit} className="message-input-form">
        <div className="input-actions">
          <input
            ref={fileInputRef}
            type="file"
            id="file-upload"
            accept="image/*"
            onChange={handleFileUpload}
            style={{ display: 'none' }}
          />
          <label htmlFor="file-upload" className="file-upload-btn" title="Upload image">
            {uploading ? '⏳' : '📎'}
          </label>
          <div className="emoji-picker-container">
            <button 
              type="button"
              className="emoji-btn"
              title="Add emoji"
            >
              😊
            </button>
            <div className="emoji-picker">
              {emojis.map(emoji => (
                <button
                  key={emoji}
                  type="button"
                  className="emoji-option"
                  onClick={() => handleEmojiClick(emoji)}
                  title={emoji}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        </div>
        <input
          ref={inputRef}
          type="text"
          placeholder={currentRoom === 'private' ? "Type a private message..." : "Type a message..."}
          value={message}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          className="message-input"
          maxLength={1000}
          disabled={uploading}
        />
        {message.length > 0 && (
          <div className="char-count-input">{message.length}/1000</div>
        )}
        <button 
          type="submit" 
          disabled={!message.trim() && !previewImage || uploading}
          className="send-button"
          title="Send message (Enter)"
        >
          {uploading ? (
            <span className="spinner-small"></span>
          ) : (
            <span>➤</span>
          )}
        </button>
      </form>
    </div>
  );
};

export default MessageInput;

