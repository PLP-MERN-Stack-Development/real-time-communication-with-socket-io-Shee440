import React from 'react';

const RoomSelector = ({ rooms, currentRoom, onRoomChange }) => {
  const roomIcons = {
    global: '🌍',
    general: '💬',
    random: '🎲',
    tech: '💻',
    gaming: '🎮',
    music: '🎵',
    sports: '⚽',
    news: '📰'
  };

  const getRoomIcon = (room) => {
    return roomIcons[room.toLowerCase()] || '💬';
  };

  const getRoomName = (room) => {
    return room.charAt(0).toUpperCase() + room.slice(1);
  };

  return (
    <div className="room-selector">
      <div className="room-selector-header">
        <h3>
          <span className="rooms-icon">🏠</span>
          Chat Rooms
        </h3>
      </div>
      <div className="rooms-list">
        {rooms.map((room) => (
          <button
            key={room}
            className={`room-item ${room === currentRoom ? 'active' : ''}`}
            onClick={() => onRoomChange(room)}
            title={`Join ${getRoomName(room)} room`}
            aria-label={`${getRoomName(room)} room`}
          >
            <span className="room-icon">{getRoomIcon(room)}</span>
            <span className="room-name">#{getRoomName(room)}</span>
            {room === currentRoom && (
              <span className="room-active-indicator">●</span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default RoomSelector;

