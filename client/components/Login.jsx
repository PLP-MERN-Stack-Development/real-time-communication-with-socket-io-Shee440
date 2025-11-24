import React, { useState, useEffect } from 'react';
import { useSocket } from '../context/SocketContext';

const Login = ({ onLogin }) => {
  const { authenticate } = useSocket();
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [avatarColor, setAvatarColor] = useState('#667eea');

  // Generate random avatar color on mount
  useEffect(() => {
    const colors = ['#667eea', '#764ba2', '#f093fb', '#4facfe', '#43e97b', '#fa709a', '#fee140', '#30cfd0'];
    setAvatarColor(colors[Math.floor(Math.random() * colors.length)]);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!username.trim()) {
      setError('Please enter a username');
      return;
    }

    if (username.trim().length < 3) {
      setError('Username must be at least 3 characters');
      return;
    }

    if (!/^[a-zA-Z0-9_]+$/.test(username.trim())) {
      setError('Username can only contain letters, numbers, and underscores');
      return;
    }

    setLoading(true);
    try {
      await authenticate(username.trim(), avatarColor);
      onLogin();
    } catch (err) {
      setError(err.message || 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <div className="login-header">
          <div className="login-icon">💬</div>
          <h1>Welcome to Chat</h1>
          <p>Enter your username to start chatting</p>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="avatar-preview">
            <div 
              className="avatar-preview-circle"
              style={{ background: avatarColor }}
            >
              {username.trim() ? username.trim().charAt(0).toUpperCase() : '?'}
            </div>
            <p className="avatar-hint">Your avatar</p>
          </div>
          <div className="input-group">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              type="text"
              placeholder="Enter username (3-20 characters)"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                setError('');
              }}
              disabled={loading}
              autoFocus
              maxLength={20}
              minLength={3}
            />
            {username && (
              <div className="char-count">{username.length}/20</div>
            )}
          </div>
          {error && (
            <div className="error-message" role="alert">
              <span className="error-icon">⚠️</span>
              {error}
            </div>
          )}
          <button 
            type="submit" 
            disabled={loading || !username.trim() || username.trim().length < 3}
            className="login-button"
          >
            {loading ? (
              <>
                <span className="spinner"></span>
                Connecting...
              </>
            ) : (
              <>
                <span>🚀</span>
                Join Chat
              </>
            )}
          </button>
          <div className="login-footer">
            <p>By joining, you agree to be respectful to other users</p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;

