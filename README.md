# USB Monitor Dashboard - Frontend

A modern React dashboard for monitoring USB device connections in real-time. Connects to the USB Monitor Service backend via REST API and WebSocket for live updates.

## Features

🔌 **Real-time USB Monitoring** - Live connect/disconnect events
📊 **Device Management** - View all connected USB devices with detailed info
📈 **Statistics Dashboard** - Connection history and analytics
🎨 **Modern UI** - Beautiful glassmorphic design with animations
📱 **Responsive Design** - Works on desktop, tablet, and mobile
🔔 **Live Notifications** - Toast notifications for device events
⚡ **WebSocket Integration** - Real-time updates with fallback to REST API

## Quick Start

### Prerequisites
- Node.js 16+
- Running USB Monitor Service backend on port 3001

### Installation

1. **Navigate to frontend directory:**
```bash
cd frontend
```

2. **Install dependencies:**
```bash
npm install
```

3. **Start the development server:**
```bash
npm start
```

4. **Open your browser:**
Visit `http://localhost:3000`

## Project Structure

```
frontend/
├── public/
│   └── index.html          # HTML template
├── src/
│   ├── components/
│   │   ├── USBDashboard.js    # Main dashboard component
│   │   ├── DeviceCard.js      # Individual device card
│   │   ├── ConnectionHistory.js # History timeline
│   │   └── StatusPanel.js     # Service status panel
│   ├── styles/
│   │   └── Dashboard.css      # All styling
│   ├── App.js                 # Root component
│   └── index.js              # Entry point
└── package.json
```

## Components Overview

### USBDashboard (Main Component)
- **WebSocket Connection** - Connects to backend service
- **State Management** - Manages devices, history, status
- **Real-time Updates** - Handles live device events
- **Error Handling** - Connection errors and fallbacks
- **Notifications** - Toast notifications for events

### DeviceCard
- **Device Information** - Shows device details, vendor/product IDs
- **Connection Status** - Visual indicators for connected/disconnected
- **Duration Tracking** - Shows how long device was connected
- **Device Icons** - Emoji icons based on device type

### ConnectionHistory
- **Event Timeline** - Chronological list of connect/disconnect events
- **Filtering** - Filter by event type and time range
- **Real-time Updates** - New events appear automatically

### StatusPanel
- **Service Status** - Shows if monitoring is active
- **Detection Method** - Which USB detection method is being used
- **Library Status** - Shows availability of native USB libraries
- **Statistics** - Connection counts and manufacturer breakdown

## API Integration

### REST API Endpoints
```javascript
// Get all devices
GET /api/devices

// Get device by ID
GET /api/devices/:id

// Get connection history
GET /api/history?limit=50

// Get service status
GET /api/status

// Get statistics
GET /api/stats

// Refresh device list
POST /api/devices/refresh
```

### WebSocket Events

**Listening for:**
- `device:connected` - New device connected
- `device:disconnected` - Device disconnected
- `devices:initial` - Initial device list on connect
- `history:initial` - Initial history on connect
- `status:update` - Service status changes

**Emitting:**
- `devices:get` - Request current devices
- `devices:refresh` - Refresh device list
- `history:get` - Request history
- `status:get` - Request status

## Configuration

### Environment Variables
Create a `.env` file in the frontend directory:

```env
# Backend API URL
REACT_APP_API_URL=http://localhost:3001

# Enable debug mode
REACT_APP_DEBUG=true
```

### API Configuration
The dashboard automatically detects the backend URL:
1. Uses `REACT_APP_API_URL` if set
2. Falls back to `http://localhost:3001`
3. Uses proxy configuration in package.json for development

## Styling

### Design System
- **Colors**: Purple gradient background with glassmorphic cards
- **Typography**: System fonts with proper hierarchy
- **Icons**: Lucide React icons throughout
- **Animations**: Smooth transitions and hover effects
- **Responsive**: Mobile-first responsive design

### Key Visual Elements
- **Glassmorphic Cards** - Translucent cards with blur effects
- **Status Indicators** - Color-coded connection status
- **Live Notifications** - Sliding toast notifications
- **Loading States** - Skeleton loading for better UX

## Features in Detail

### Real-time Monitoring
```javascript
// WebSocket connection with auto-reconnect
const socket = io(API_BASE, {
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionAttempts: 5
});

// Listen for device events
socket.on('device:connected', (data) => {
  setDevices(prev => [...prev.filter(d => d.id !== data.device.id), data.device]);
  addNotification(`Device connected: ${data.device.productName}`, 'success');
});
```

### Device Management
- **Live Status Updates** - Devices update in real-time
- **Device Details** - Vendor/Product IDs, serial numbers
- **Connection Duration** - Tracks how long devices are connected
- **Device Icons** - Smart icons based on vendor (Apple, Logitech, etc.)

### Error Handling
- **Connection Resilience** - Auto-reconnect on disconnect
- **Fallback API** - Uses REST API if WebSocket fails
- **User Feedback** - Clear error messages and loading states

## Development

### Running in Development
```bash
# Start with hot reload
npm start

# Backend should be running on port 3001
# Frontend will be available on port 3000
```

### Building for Production
```bash
# Create production build
npm run build

# Serve built files
npx serve -s build
```

### Testing the Connection
1. **Start Backend Service:**
   ```bash
   cd ../
   npm run dev
   ```

2. **Start Frontend:**
   ```bash
   npm start
   ```

3. **Test USB Events:**
   - Connect/disconnect USB devices
   - Watch real-time updates in dashboard
   - Check browser console for WebSocket messages

## Troubleshooting

### Common Issues

**1. "Cannot connect to backend service"**
- Ensure backend is running on port 3001
- Check CORS settings in backend
- Verify API_BASE URL in frontend

**2. "WebSocket connection failed"**
- Backend service might not be running
- Check firewall/network settings
- WebSocket falls back to polling automatically

**3. "No devices showing"**
- Backend might not have USB access permissions
- Check backend logs for errors
- Try refreshing device list

### Browser Console Debugging
```javascript
// Enable debug logging
localStorage.setItem('debug', 'socket.io-client:*');

// Check WebSocket connection
console.log('Socket connected:', socket.connected);

// Monitor device updates
window.addEventListener('deviceUpdate', console.log);
```

## Browser Compatibility

- **Chrome/Edge**: Full support including WebSockets
- **Firefox**: Full support
- **Safari**: Full support
- **Mobile Browsers**: Responsive design works on all major mobile browsers

## Performance

- **Lazy Loading**: Components load as needed
- **Efficient Updates**: Only re-renders changed components
- **Memory Management**: Automatic cleanup of event listeners
- **Optimized Rendering**: Virtual scrolling for large device lists

The dashboard is optimized for smooth performance even with many USB devices and frequent connect/disconnect events.

## Next Steps

1. **Test the connection** between frontend and backend
2. **Connect/disconnect USB devices** to see live updates
3. **Customize the styling** to match your brand
4. **Add more features** like device filtering, export, etc.