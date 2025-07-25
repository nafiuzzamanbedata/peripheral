import React, { useEffect } from 'react';
import { io } from 'socket.io-client';

const socket = io('http://localhost:3001', {
  transports: ['websocket'],
  withCredentials: true,
});

export default function SocketTest() {
  useEffect(() => {
    socket.on('connect', () => {
      console.log('✅ connected as', socket.id);
    });

    socket.on('disconnect', (reason) => {
      console.log('❌ disconnected:', reason);
    });

    // Listen to all events using onAny
    socket.onAny((event, ...args) => {
      console.log(`📩 Event received: ${event}`, args);
    });

    return () => {
      socket.offAny();       // Remove wildcard listener
      socket.disconnect();   // Clean disconnect
    };
  }, []);

  return <div>WebSocket test page — check DevTools Console</div>;
}
