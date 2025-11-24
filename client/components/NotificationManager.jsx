import React, { useEffect, useState } from 'react';
import { useSocket } from '../context/SocketContext';
import { useSocketEvent } from '../hooks/useSocket';

const NotificationManager = () => {
  const { socket, user } = useSocket();
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);

  useSocketEvent('new_message', (message) => {
    // Only notify if message is not from current user and not in current view
    if (message.sender !== user?.username) {
      // Check if browser supports notifications
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(`New message from ${message.sender}`, {
          body: message.content,
          icon: '/favicon.ico'
        });
      }

      // Play sound
      playNotificationSound();

      // Update unread count
      setUnreadCount(prev => prev + 1);
      
      // Add to notifications
      setNotifications(prev => [...prev, {
        id: Date.now(),
        type: 'message',
        message: `New message from ${message.sender}`,
        timestamp: new Date()
      }]);
    }
  });

  useSocketEvent('user_joined', (data) => {
    if (data.username !== user?.username) {
      setNotifications(prev => [...prev, {
        id: Date.now(),
        type: 'user_joined',
        message: `${data.username} joined the chat`,
        timestamp: new Date()
      }]);
    }
  });

  useSocketEvent('user_left', (data) => {
    setNotifications(prev => [...prev, {
      id: Date.now(),
      type: 'user_left',
      message: `${data.username} left the chat`,
      timestamp: new Date()
    }]);
  });

  useEffect(() => {
    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  const playNotificationSound = () => {
    try {
      const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZijcIG2m98OScTgwOUKzn8LZjGwU7kdfyzHksBSR3x/DdkEAKFF606euoVRQKRp/g8r5sIQUqgc7y2Yo3CBtpvfDknE4MDlCs5/C2YxsFO5HX8sx5LAUkd8fw3ZBAC');
      audio.volume = 0.3;
      audio.play().catch(() => {});
    } catch (e) {
      // Fallback: use Web Audio API for a simple beep
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = 800;
      oscillator.type = 'sine';
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.1);
    }
  };

  // Clear notifications after 5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setNotifications(prev => prev.filter(n => 
        Date.now() - n.timestamp.getTime() < 5000
      ));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const clearUnread = () => {
    setUnreadCount(0);
  };

  return (
    <div className="notification-container">
      {unreadCount > 0 && (
        <div className="unread-badge" onClick={clearUnread} title="Click to clear">
          {unreadCount > 99 ? '99+' : unreadCount}
        </div>
      )}
      <div className="notifications-list">
        {notifications.slice(-3).map(notification => (
          <div 
            key={notification.id} 
            className={`notification ${notification.type}`}
            role="alert"
          >
            <div className="notification-icon">
              {notification.type === 'message' && '💬'}
              {notification.type === 'user_joined' && '👋'}
              {notification.type === 'user_left' && '👋'}
            </div>
            <div className="notification-content">
              <div className="notification-message">{notification.message}</div>
              <div className="notification-time">
                {new Date(notification.timestamp).toLocaleTimeString([], { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NotificationManager;

