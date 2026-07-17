// src/services/adminSocket.js
import { io } from 'socket.io-client';

// base like http://192.168.1.5:5050/api -> http://192.168.1.5:5050
const RAW_API = import.meta.env.VITE_API_URL || 'https://deadman-link.onrender.com/api';
const SOCKET_URL = RAW_API.replace(/\/api\/?$/, '');

export const adminSocket = io(SOCKET_URL, {
  transports: ['websocket'],
  autoConnect: true,
});

adminSocket.on('connect', () => {
  const token = localStorage.getItem('token');
  if (token) {
    adminSocket.emit('join-admin-room', token);
  }
});
