# 💬 V-Chat — Real-Time WebSocket Chat Application

V-Chat is a real-time, multi-room chat application built using **Node.js and Socket.IO**, enabling users to communicate instantly with live updates, typing indicators, and online user tracking.  
The project focuses on real-world WebSocket communication, event-driven architecture, and production deployment.

---

## 🚀 Features

- 🔴 Real-time messaging using WebSockets (Socket.IO)
- 👤 Username-based chat (users must enter name before chatting)
- 🏠 Multiple chat rooms (General, Developers, Random)
- 🟢 Live join & leave notifications
- ✍️ Typing indicators
- 👥 Online users list per room
- 🌙 Dark mode UI
- 📱 Responsive UI (desktop & mobile)
- 🌐 Deployed for public access

---

## 🛠 Tech Stack

### Frontend
- HTML
- CSS (Custom Dark UI)
- Vanilla JavaScript

### Backend
- Node.js
- Express.js
- Socket.IO (WebSockets)

### Deployment
- GitHub (version control)
- Railway (production deployment)

---

## ⚙️ How It Works (High-Level)

- Client connects to server using **Socket.IO**
- User must enter a username before joining a room
- Server maintains:
  - Active sockets
  - Room-wise users list
- Messages, typing events, join/leave events are broadcasted in real time
- Each message includes socket ID to distinguish sender vs receiver
- UI updates dynamically without page reload

---

🌍 Live Demo

🔗 Live URL: https://your-deployed-link-here

🔗 GitHub Repo: https://github.com/your-username/chat-websocket

---

## 📚 What I Learned

- Difference between HTTP and WebSocket-based communication
- Handling real-time events using Socket.IO
- Managing users, rooms, and socket lifecycle
- Designing sender vs receiver message logic
- Building and deploying real-time Node.js applications

  
## 🧑‍💻 Local Setup & Run

```bash
# Clone the repository
git clone https://github.com/your-username/chat-websocket.git

# Navigate to project folder
cd chat-websocket

# Install dependencies
npm install


# Start server
npm run dev

#server runs on 
http://localhost:4000
