// socket.js
import { io } from 'socket.io-client';

let socket = null;

export function initSocket() {
  const token = localStorage.getItem('token');
  if (!token) return null;
  
  if (socket) return socket;
  
  socket = io('http://localhost:5000', {
    auth: { token },
    transports: ['websocket', 'polling'],
  });
  
  socket.on('connect', () => console.log('✅ Socket.io connecté'));
  
  socket.on('notification', (data) => {
    console.log('📩 Notification:', data);
    // Afficher avec alert simple (pas de toast pour éviter les dépendances)
    alert(`🔔 ${data.title}\n${data.message}`);
  });
  
  socket.on('disconnect', () => console.log('❌ Socket.io déconnecté'));
  
  return socket;
}

export function getSocket() {
  return socket;
}