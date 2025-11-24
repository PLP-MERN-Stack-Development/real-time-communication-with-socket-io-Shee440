import React, { useState } from 'react';

const PrivateMessageModal = ({ user, onClose, onSend }) => {
  const [message, setMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim()) {
      onSend(message.trim());
      setMessage('');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Private Message to {user.username}</h3>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        <form onSubmit={handleSubmit}>
          <textarea
            placeholder="Type your private message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows="4"
            autoFocus
          />
          <div className="modal-actions">
            <button type="button" onClick={onClose}>Cancel</button>
            <button type="submit" disabled={!message.trim()}>Send</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PrivateMessageModal;

