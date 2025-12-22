# Video Call App

A simple **WebRTC video call application** built with **React** (frontend) and **Node.js + Socket.IO** (backend). Users can join a room using an email ID and room number, and make video calls to other participants in the same room.  

---

## Features

- Join a room using Email ID and Room Number
- Real-time video/audio communication
- Peer-to-peer connection using **WebRTC**
- Signaling via **Socket.IO**
- Works in modern browsers

---

## Tech Stack

- **Frontend:** React, React Router, React Hooks
- **Backend:** Node.js, Express, Socket.IO
- **WebRTC:** RTCPeerConnection for video calls

---

## Installation

### 1. Clone the repository

```bash
git clone https://github.com/your-username/video-call-app.git
cd video-call-app
2. Install server dependencies
cd server
npm install

3. Install client dependencies
cd ../client
npm install

Running Locally
1. Start the backend server
cd server
node index.js


The server will run on http://localhost:8000

2. Start the React frontend
cd client
npm start


The React app will run on http://localhost:3000

3. Testing

Open two different browsers or devices (or an incognito window)

Enter the same room number and different emails

Click Join and then Call to start video call

Deployment

You can deploy the frontend and backend separately or together:

Frontend

Build the React app:

cd client
npm run build


Deploy build/ folder to platforms like Vercel, Netlify, or Firebase Hosting

Backend

Deploy the server to Heroku, Render, or Railway

Make sure the server URL is updated in your React app for Socket.IO connection

Notes

Each participant should use a separate browser or device for video call.

Device-in-use errors occur if the camera or microphone is already being used by another tab/browser.

Project Structure
video-call-app/
├── client/           # React frontend
│   ├── src/
│   │   ├── screens/  # LobbyScreen & RoomPage
│   │   ├── service/  # Peer connection service
│   │   └── context/  # Socket provider
│   └── package.json
├── server/           # Node.js + Socket.IO backend
│   └── index.js
└── README.md

License

This project is open source and free to use.


I can also create a **ready-to-use GitHub repo structure** including `.gitignore` and deployment instructions, so you can just push it to GitHub and deploy.  

Do you want me to do that next?