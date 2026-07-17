// src/services/api.js
import axios from 'axios';

// Prefer env, fall back to localhost:5050/api
const API_URL =
  import.meta.env.VITE_API_URL || 'https://deadman-link.onrender.com/api';

console.log('[Deadman-Link] API_URL =', API_URL);

const api = axios.create({
  baseURL: API_URL,
  // withCredentials: true, // enable if you later use cookies/auth
});

export default api;
