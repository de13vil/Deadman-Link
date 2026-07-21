<div align="center">
  <img src="https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React 19" />
  <img src="https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB" />
  <img src="https://img.shields.io/badge/Socket.io-black?style=for-the-badge&logo=socket.io&badgeColor=010101" alt="Socket.io" />
  <img src="https://img.shields.io/badge/Vite-B73BFE?style=for-the-badge&logo=vite&logoColor=FFD62E" alt="Vite" />

  <h1 align="center">🔗 Deadman-Link</h1>
  <p align="center">
    <strong>A next-generation, highly secure, real-time URL management and analytics platform.</strong>
  </p>
</div>

---

## 📖 Overview

**Deadman-Link** goes beyond traditional URL shortening. It is a full-stack, enterprise-grade link management ecosystem designed for speed, security, and real-time collaboration. Whether you need to manage short links, track granular geographic analytics, sync data across devices in real-time, host synchronized YouTube watch parties, or utilize AI for deep link insights—Deadman-Link handles it all seamlessly.

## 🚀 Key Features

### 🔗 Advanced Link Management
* **Instant Shortening & Aliasing:** Generate secure short links instantly or create custom, branded aliases.
* **Expiration Controls:** Set exact expiration dates and times for time-sensitive URLs.
* **QR Code Generation:** Automatically generate high-resolution, downloadable QR codes for every link.
* **AI-Powered Insights:** Integrated Google Gemini AI to analyze link context, parse metadata, and provide intelligent URL summaries.

### 📊 Granular Analytics Engine
* **Click Tracking:** Monitor total engagement and unique clicks in real-time.
* **Geographic Mapping:** Track global user locations using IP geolocation and visualize them on an interactive map.
* **Device Metrics:** Analyze traffic sources, separating mobile vs. desktop interactions.
* **Time-Series Data:** Interactive charts built with Recharts to visualize traffic spikes over custom timeframes.

### 🌐 Real-Time Collaboration (WebSockets)
* **Live Device Syncing:** Push links and clipboard data seamlessly between connected devices in real-time using Socket.io.
* **Synchronized Watch Parties:** Create private rooms to watch YouTube videos together. Play, pause, and seek states sync instantly across all connected clients.

### 🛡️ Enterprise-Grade Security
* **Multi-Authentication:** Secure local JWT-based authentication paired with Google OAuth 2.0.
* **Strict Rate Limiting:** Automated rate limiters to prevent API abuse and brute-force attacks.
* **Dynamic IP Banning:** Heuristic scanning and manual admin controls to permanently ban malicious IPs.
* **Encrypted Sockets:** JWT-secured WebSocket connections ensuring real-time events remain strictly confidential.
* **Admin God-Mode:** A highly restricted, root-level dashboard for user management, system-wide metrics, and moderation.

---

## 🏗️ System Architecture

Deadman-Link is built on a robust decoupled architecture, separating the client presentation layer from the API and WebSocket services.

* **Frontend (Client):** A blazing-fast Single Page Application (SPA) built with React 19 and Vite. State is managed via React Hooks, with routing handled by React Router. Tailwind CSS provides a highly responsive, utility-first design system.
* **Backend (API Server):** A stateless Node.js / Express.js REST API. It handles data validation, business logic, authentication (Passport.js), and communicates with the database.
* **Real-Time Engine:** A standalone Socket.io server integrated within the Node instance, handling multiplexed, bidirectional event streaming for Watch Parties and Device Syncing.
* **Database (Storage):** MongoDB handles persistent storage (Links, Users, Analytics Events, OTPs). Data is modeled using Mongoose with strict schema validation and indexing for high read-throughput.

---

## 💻 Local Development Setup

### Prerequisites
* Node.js (v18+)
* MongoDB (Atlas Cluster URI or Local instance)
* Google Cloud Console (For OAuth 2.0 Credentials)

### 1. Clone & Install
```bash
git clone https://github.com/de13vil/Deadman-Link.git
cd Deadman-Link

# Install Frontend dependencies
npm install

# Install Backend dependencies
cd server
npm install
```

### 2. Environment Configuration
Create two `.env` files in your project.

**Frontend (`/.env`)**
```env
# Points the React app to your local backend API
VITE_API_URL=http://localhost:5050/api
# The URL of your local React dev server
VITE_APP_URL=http://localhost:5173
```

**Backend (`/server/.env`)**
```env
# Core Settings
PORT=5050
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/
JWT_SECRET=your_super_secret_jwt_key
FRONTEND_URL=http://localhost:5173

# Security
# Required to create an Admin account via the secure registration form
ADMIN_SECURITY_KEY=your_admin_registration_key

# Google OAuth 2.0 (Required for SSO)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:5050/api/auth/google/callback

# Email Integration (Optional - for OTPs. Falls back to console logs if blank)
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# Google Gemini AI Integration (Required for AI Insights)
GEMINI_API_KEY=your_gemini_api_key
```

### 3. Launch the Stack
You will need two terminal windows to run both servers concurrently.

**Terminal 1 (Backend API):**
```bash
cd server
npm run dev
# Server will start on http://localhost:5050
```

**Terminal 2 (Frontend Client):**
```bash
npm run dev
# Frontend will start on http://localhost:5173
```

---

## ☁️ Deployment Guide

Deadman-Link is container-ready and optimized for modern cloud PaaS providers.

### Frontend Deployment (Vercel)
1. Push your code to GitHub.
2. Import the repository into [Vercel](https://vercel.com).
3. Vercel will automatically detect Vite. 
4. Add your `VITE_API_URL` to Vercel's Environment Variables (pointing to your live backend URL).
5. Deploy.

### Backend Deployment (Render / Heroku)
1. Create a New Web Service on [Render](https://render.com) pointing to your repository.
2. Set the Root Directory to `server`.
3. Set the Build Command to `npm install`.
4. Set the Start Command to `node index.js`.
5. Add all your backend Environment Variables. 
   * **Crucial:** Update `FRONTEND_URL` and `GOOGLE_CALLBACK_URL` to reflect your live production URLs to prevent CORS errors and OAuth redirects to localhost.
6. Deploy.

---
<div align="center">
  <em>Developed by Divyansh Meena</em>
</div>
