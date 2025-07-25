import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

// const socket = io('http://localhost:3001'); // ← Don’t use `new` here!
const socket = io('http://localhost:3001', {
  transports: ['websocket'], // force WebSocket (skip polling)
  withCredentials: true
});

function WebSocketPage() {
  const [connected, setConnected] = useState(false);
  const [devices, setDevices] = useState([]);

  useEffect(() => {
    // Listen for socket connection
    socket.on('connect', () => {
      setConnected(true);
      console.log('🟢 Connected to WebSocket server');
    });

    socket.on('disconnect', () => {
      setConnected(false);
      console.log('🔴 Disconnected from WebSocket server');
    });

    socket.on('devices:initial', (data) => {
      console.log('📦 Received initial devices:', data.devices);
      setDevices(data.devices || []);
    });

    // Clean up listeners on unmount
    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('devices:initial');
    };
  }, []);

  return (
    <div>
      <h1>WebSocket Page</h1>
      <p>Status: {connected ? '🟢 Connected' : '🔴 Disconnected'}</p>
      <h2>Devices:</h2>
      <ul>
        {devices.map((device, idx) => (
          <li key={device.id || idx}>{device.productName || 'Unknown Device'}</li>
        ))}
      </ul>
    </div>
  );
}

export default WebSocketPage;
