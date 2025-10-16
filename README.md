# 3D Collaboration Platform

A real-time multi-user **3D collaboration web app** built using **Three.js**, **Yjs**, and **y-websocket**.  
Users can explore a 3D model together, chat live, and share camera movements across sessions.

---

## 🚀 Features

- 👥 **Live Participants List** – Updates automatically when users join or leave.  
- 💬 **Real-Time Chat** – Simple text chat synced via Yjs.  
- 🎥 **Shared Camera Controls** – OrbitControls movements shared across users.  
- 🧩 **3D Model Viewer** – Loads and displays `.glb` models interactively.  

---

## 🛠️ Tech Stack

| Purpose | Tools |
|----------|--------|
| 3D Visualization | Three.js (GLTFLoader, OrbitControls) |
| Real-Time Sync | Yjs, y-websocket |
| Server | Node.js (WebSocket Server) |
| Language | JavaScript, HTML, CSS |

---

## ⚙️ Run Locally

1. Clone the repo  
   ```bash
   git clone https://github.com/Archana-Patukuri/Collaboration.git
   cd Collaboration
   
2. Install dependencies
 ```bash
npm install
3. Start WebSocket server
 ```bash
npx y-websocket-server
4. Run Project
 ```bash
npm run de



