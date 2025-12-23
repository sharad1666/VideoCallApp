# 🎥 Video Call App (WebRTC + Socket.IO)

A real-time **peer-to-peer video calling web application** built using **WebRTC** and **Socket.IO**, featuring screen sharing, live media controls, call timer, and a modern **piano black & neon green** UI.  
The application is fully deployed on **Render** and works on both desktop and mobile browsers.

---

## 🚀 Live Demo

🔗 **Frontend (Live App)**  
https://videocallapp-frontend-2rbz.onrender.com/

🔗 **Backend (Socket Server)**  
https://videocallapp-backend-cllm.onrender.com/

> 💡 Open the app on two different devices or browsers, enter the same room ID, and start a video call.

---

## ✨ Features

- 🔗 Join a room using a **Room ID**
- 📹 Real-time video & audio communication (WebRTC)
- 🔴 Peer-to-peer connection (no media server)
- 🔄 Socket.IO signaling (offer / answer / ICE)
- 🎤 Mute / Unmute microphone (with live indicator)
- 📷 Camera on / off toggle
- 🔇 Remote mute status indicator (real-time)
- 🖥 Screen sharing support
- ⏱ Call duration timer
- ❌ Call end / disconnect handling
- 🎨 Modern **piano black & neon green** UI
- 📱 Responsive design (desktop & mobile)
- ☁️ Fully deployed on **Render (HTTPS enabled)**

---

## 🛠 Tech Stack

### Frontend
- React 18
- React Router
- Socket.IO Client
- WebRTC APIs (`RTCPeerConnection`)
- Custom CSS (dark theme)

### Backend
- Node.js
- Express
- Socket.IO

### Deployment
- Render (Frontend & Backend)
- HTTPS (required for WebRTC media access)

---

## 🧠 How It Works (High-Level)

1. Users join a room using a room ID.
2. Socket.IO handles signaling between peers (join, offer, answer, ICE candidates).
3. WebRTC establishes a direct peer-to-peer connection for audio/video.
4. Media state changes (mute, camera off) are synced in real time.
5. UI updates dynamically based on call state and peer actions.

---

## ▶️ Run Locally

### 1️⃣ Clone the repository
```bash
git clone https://github.com/sharad1666/VideoCallApp.git
cd VideoCallApp
2️⃣ Start Backend
bash
Copy code
cd server
npm install
npm start
Backend runs on:

arduino
Copy code
http://localhost:8000
3️⃣ Start Frontend
bash
Copy code
cd client
npm install
npm start
Frontend runs on:

arduino
Copy code
http://localhost:3000
🧪 Testing Instructions
Open the app in two different browsers or devices

Enter the same room ID

Click Join → Start Call

Test:

Mute / unmute

Camera on / off

Screen sharing

Call end

📁 Project Structure
csharp
Copy code
VideoCallApp/
├── client/               # React frontend
│   ├── src/
│   │   ├── screens/      # Lobby & Room
│   │   ├── context/      # Socket provider
│   │   └── index.js
│   └── public/
│       └── _redirects
├── server/               # Node.js + Socket.IO backend
│   └── index.js
└── README.md
📌 Future Enhancements
Group video calls

In-call chat

Call recording

TURN server integration

User authentication

👤 Author
Sharad Kumar Yadav
PG-DAC | Full Stack Developer
C-DAC ACTS, Pune

⭐ Support
If you find this project useful, please give it a ⭐ on GitHub!
