import React, { useState, useEffect } from 'react';
import { useSocket } from '../context/SocketContext';

const MessageSearch = ({ currentRoom, onSearchResults }) => {
  const { socket } = useSocket();
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [resultCount, setResultCount] = useState(null);

  useEffect(() => {
    // Clear results when room changes
    setQuery('');
    setResultCount(null);
    if (onSearchResults) {
      onSearchResults(null);
    }
  }, [currentRoom, onSearchResults]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!socket || !query.trim()) return;

    setIsSearching(true);
    setResultCount(null);
    socket.emit('search_messages', { room: currentRoom, query: query.trim() });

    socket.once('search_results', (data) => {
      setIsSearching(false);
      const results = data.results || [];
      setResultCount(results.length);
      if (onSearchResults) {
        onSearchResults(results.length > 0 ? results : null);
      }
    });

    // Timeout after 5 seconds
    setTimeout(() => {
      setIsSearching(false);
    }, 5000);
  };

  const handleClear = () => {
    setQuery('');
    setResultCount(null);
    if (onSearchResults) {
      onSearchResults(null);
    }
  };

  const handleInputChange = (e) => {
    setQuery(e.target.value);
    if (!e.target.value.trim() && onSearchResults) {
      onSearchResults(null);
      setResultCount(null);
    }
  };

  return (
    <div className="message-search">
      <form onSubmit={handleSearch} className="search-form">
        <div className="search-input-wrapper">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search messages..."
            value={query}
            onChange={handleInputChange}
            className="search-input"
            disabled={isSearching}
          />
          {query && (
            <button 
              type="button" 
              onClick={handleClear} 
              className="clear-search-input-btn"
              title="Clear search"
            >
              ✕
            </button>
          )}
        </div>
        <button 
          type="submit" 
          disabled={isSearching || !query.trim()}
          className="search-button"
          title="Search"
        >
          {isSearching ? (
            <span className="search-spinner"></span>
          ) : (
            <span>Search</span>
          )}
        </button>
      </form>
      {resultCount !== null && (
        <div className="search-results-info">
          {resultCount > 0 ? (
            <span className="search-results-count">
              Found {resultCount} {resultCount === 1 ? 'message' : 'messages'}
            </span>
          ) : (
            <span className="search-no-results">No messages found</span>
          )}
        </div>
      )}
    </div>
  );
};

export default MessageSearch;

