import { io } from 'socket.io-client';

// Connect to the backend Socket.IO server
const socket = io(import.meta.env.VITE_SOCKET_URL, {
  autoConnect: false, // Connect manually after login
});

export default socket;
