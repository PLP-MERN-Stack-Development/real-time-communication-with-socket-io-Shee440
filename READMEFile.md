# Real-Time Chat Application with Socket.io

A fully functional real-time chat application built with React frontend and Node.js backend using Socket.io. Features include global chat rooms, private messaging, typing indicators, message reactions, file sharing, notifications, and more.

## ✨ Features

### Core Chat Functionality
- ✅ **User Authentication** - Simple username-based authentication
- ✅ **Global Chat Rooms** - Multiple chat rooms (global, general, random, tech)
- ✅ **Message Display** - Messages with sender name and timestamp
- ✅ **Typing Indicators** - Real-time typing status for users
- ✅ **Online/Offline Status** - See who's online in real-time

### Advanced Chat Features
- ✅ **Private Messaging** - One-on-one private conversations
- ✅ **Multiple Chat Rooms** - Switch between different channels
- ✅ **Message Reactions** - Add emoji reactions to messages (👍, ❤️, 😂, etc.)
- ✅ **File/Image Sharing** - Share images in chat
- ✅ **Read Receipts** - See when messages are read
- ✅ **Message Search** - Search through message history

### Real-Time Notifications
- ✅ **New Message Alerts** - Notifications when receiving messages
- ✅ **Join/Leave Notifications** - Know when users join or leave
- ✅ **Unread Message Count** - Track unread messages
- ✅ **Sound Notifications** - Audio alerts for new messages
- ✅ **Browser Notifications** - Desktop notifications using Web Notifications API

### Performance & UX
- ✅ **Message Pagination** - Load older messages (structure ready)
- ✅ **Reconnection Logic** - Automatic reconnection on disconnect
- ✅ **Message Search** - Search functionality for finding messages
- ✅ **Responsive Design** - Works on desktop and mobile devices
- ✅ **Error Handling** - Proper error handling and loading states

## Project Structure

```
├── client/                 # React front-end
│   ├── public/             # Static files
│   ├── src/                # React source code
│   │   ├── components/     # UI components
│   │   │   ├── Login.jsx
│   │   │   ├── ChatRoom.jsx
│   │   │   ├── MessageList.jsx
│   │   │   ├── MessageItem.jsx
│   │   │   ├── MessageInput.jsx
│   │   │   ├── OnlineUsers.jsx
│   │   │   ├── RoomSelector.jsx
│   │   │   ├── PrivateMessagesView.jsx
│   │   │   ├── PrivateMessageModal.jsx
│   │   │   ├── MessageSearch.jsx
│   │   │   └── NotificationManager.jsx
│   │   ├── context/        # React context providers
│   │   │   └── SocketContext.jsx
│   │   ├── hooks/          # Custom React hooks
│   │   │   └── useSocket.js
│   │   ├── socket/         # Socket.io client setup
│   │   │   └── socketClient.js
│   │   ├── App.jsx         # Main application component
│   │   ├── App.css         # Application styles
│   │   └── main.jsx        # Entry point
│   └── package.json        # Client dependencies
├── server/                 # Node.js back-end
│   ├── config/             # Configuration files
│   ├── models/             # Data models
│   │   └── Message.js
│   ├── socket/             # Socket.io server setup
│   │   └── socketHandlers.js
│   ├── utils/              # Utility functions
│   │   ├── userManager.js
│   │   └── messageStore.js
│   ├── server.js           # Main server file
│   └── package.json        # Server dependencies
└── README.md               # Project documentation
```

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Install server dependencies:
```bash
cd server
npm install
```

2. Install client dependencies:
```bash
cd ../client
npm install
```

### Running the Application

1. Start the server:
```bash
cd server
npm run dev
```

The server will run on `http://localhost:3000`

2. Start the client (in a new terminal):
```bash
cd client
npm run dev
```

The client will run on `http://localhost:5173`

3. Open your browser and navigate to `http://localhost:5173`

4. Enter a username to start chatting!

## Usage Guide

### Basic Chatting
1. Enter your username on the login screen
2. Start typing messages in the input field
3. Messages appear in real-time for all users in the same room

### Switching Rooms
- Click on any room in the sidebar (global, general, random, tech)
- Messages are room-specific

### Private Messaging
1. Click the 💬 button next to any online user
2. Or click "Private Messages" in the sidebar
3. Select a conversation or start a new one

### Message Reactions
- Hover over any message and click the 😊 button
- Select an emoji reaction (👍, ❤️, 😂, 😮, 😢, 🔥)

### Search Messages
- Use the search bar in the chat header
- Type keywords to find messages in the current room

### Notifications
- Browser will ask for notification permission on first use
- You'll receive desktop notifications for new messages
- Sound notifications play automatically

## Technologies

- **Frontend**: 
  - React 18
  - Socket.io Client 4.5
  - Vite (build tool)
  
- **Backend**: 
  - Node.js
  - Express 4.18
  - Socket.io 4.5
  - CORS

## Socket.io Events

### Client → Server
- `authenticate` - User login
- `send_message` - Send a message
- `typing_start` - User started typing
- `typing_stop` - User stopped typing
- `join_room` - Join a chat room
- `leave_room` - Leave a chat room
- `add_reaction` - Add reaction to message
- `mark_read` - Mark message as read
- `search_messages` - Search messages

### Server → Client
- `authenticated` - Authentication successful
- `auth_error` - Authentication failed
- `new_message` - New message received
- `message_history` - Message history loaded
- `online_users` - List of online users
- `user_joined` - User joined chat
- `user_left` - User left chat
- `user_typing` - User is typing
- `user_stopped_typing` - User stopped typing
- `reaction_added` - Reaction added to message
- `search_results` - Search results

## Features in Detail

### Reconnection Logic
The client automatically reconnects if the connection is lost, with exponential backoff and a maximum of 5 reconnection attempts.

### Message Storage
Messages are stored in-memory (last 100 per room). In production, you'd want to use a database like MongoDB or PostgreSQL.

### Responsive Design
The application is fully responsive and works on:
- Desktop (1920px+)
- Tablet (768px - 1024px)
- Mobile (320px - 768px)

## Future Enhancements

- Database integration for persistent message storage
- User profiles and avatars
- Message editing and deletion
- Voice and video calling
- File upload to cloud storage
- End-to-end encryption
- Message threads/replies
- User roles and permissions

## License

MIT
## Author

Sheila Mumbi
