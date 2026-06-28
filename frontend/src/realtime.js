import { io } from 'socket.io-client';

const API_ROOT = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
const SOCKET_URL = API_ROOT || window.location.origin;

export function createRealtimeSocket({ email, isAdmin }) {
  return io(SOCKET_URL, {
    transports: ['websocket', 'polling'],
    withCredentials: true,
    auth: {
      email,
      isAdmin
    }
  });
}
