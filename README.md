# 🔗 Deadman-Link

A powerful, full-stack URL shortening and link management platform built for speed, security, and real-time collaboration. Manage short links, generate QR codes, synchronize devices, host synchronized YouTube watch parties, and monitor granular analytics—all backed by a secure, real-time Node.js server.

---

## ✨ Features

### 🚀 Core Link Management
- **Instant Short Links**: Instantly shorten URLs with custom aliases and expiration dates.
- **QR Code Generation**: Automatically generate downloadable QR codes for every link.
- **Granular Analytics**: Track clicks, geographic locations (IP tracking), device types, and traffic trends.
- **AI-Powered Integration**: Utilize Gemini AI to parse metadata and analyze link context.

### 🔒 Security & Authentication
- **Multi-Authentication**: Secure local JWT authentication and Google OAuth 2.0 integration.
- **Admin God-Mode**: Exclusive Admin Dashboard for user management, system-wide metrics, and active socket monitoring.
- **Rate Limiting & IP Blocking**: Strict automated rate limiters and dynamic IP bans for abuse prevention.
- **Socket Authentication**: JWT-secured WebSockets to ensure real-time events remain confidential.

### 🌐 Real-Time Collaboration (Socket.io)
- **Live Device Syncing**: Seamlessly push links and data between connected devices in real-time.
- **YouTube Watch Parties**: Create collaborative watch rooms where play/pause states sync across all clients instantly.

---

## 🛠️ Technology Stack

**Frontend:**
- React 19 & Vite
- Tailwind CSS (Utility-first styling)
- React Router (Client-side routing)
- Recharts (Analytics visualization)
- Socket.io-client (Real-time syncing)

**Backend:**
- Node.js & Express.js
- MongoDB & Mongoose (NoSQL Database)
- Socket.io (Real-time bidirectional event-based communication)
- Passport.js (Google OAuth & JWT strategies)
- Google Gemini AI (AI integrations)

---

## 💻 Local Development Setup

### Prerequisites
- Node.js (v18+)
- MongoDB (Atlas URI or Local instance)
- Google Cloud Console (For OAuth Credentials)

### 1. Clone & Install
```bash
# Clone the repository
git clone https://github.com/de13vil/Deadman-Link.git
cd Deadman-Link

# Install Frontend dependencies
npm install

# Install Backend dependencies
cd server
npm install
```

### 2. Environment Configuration
You will need two `.env` files. 

**Frontend (`/.env`)**
```env
VITE_API_URL=http://localhost:5050/api
VITE_APP_URL=http://localhost:5173
```

**Backend (`/server/.env`)**
```env
MONGO_URI=mongodb+srv://<your-db-credentials>
JWT_SECRET=your_super_secret_jwt_key
PORT=5050

# Email Integration (Optional)
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:5050/api/auth/google/callback

FRONTEND_URL=http://localhost:5173
ADMIN_SECURITY_KEY=your_admin_registration_key
GEMINI_API_KEY=your_gemini_api_key
```

### 3. Run the Application
Open two terminals:

**Terminal 1 (Backend):**
```bash
cd server
npm run dev
```
*Server will start on `http://localhost:5050`*

**Terminal 2 (Frontend):**
```bash
npm run dev
```
*Frontend will start on `http://localhost:5173`*

---

## ☁️ Deployment Guide

The app is built to be deployed seamlessly across modern cloud providers.

- **Frontend**: Optimized for [Vercel](https://vercel.com). Simply link your GitHub repo. Vercel automatically detects the Vite configuration.
- **Backend**: Optimized for [Render](https://render.com) or Heroku. Make sure to map your Environment Variables and set the `Build Command` to `npm install` and the `Start Command` to `node index.js`.

**Production Note:** 
When moving to production, ensure `VITE_API_URL`, `FRONTEND_URL`, and `GOOGLE_CALLBACK_URL` in your Cloud environment variables match your live domains (e.g., `https://deadman-link.onrender.com/api`), otherwise the app will fallback to localhost and fail.

---
*Developed by Divyansh Meena*
