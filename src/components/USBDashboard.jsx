import axios from 'axios';
import {
    Activity,
    AlertCircle,
    CheckCircle,
    Clock,
    Monitor,
    RefreshCw,
    Server,
    Usb,
    Wifi,
    WifiOff,
    XCircle
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import '../styles/Dashboard.css';
import ConnectionHistory from './ConnectionHistory';
import DeviceCard from './DeviceCard';
import StatusPanel from './StatusPanel';

const USBDashboard = () => {
    // State management
    const [devices, setDevices] = useState([]);
    const [history, setHistory] = useState([]);
    const [status, setStatus] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [socket, setSocket] = useState(null);
    const [stats, setStats] = useState(null);
    const [notifications, setNotifications] = useState([]);

    // API Configuration
    const API_BASE = 'http://localhost:3001';

    // Initialize WebSocket connection
    const initializeSocket = useCallback(() => {
        if (socket) {
            socket.disconnect();
        }

        const newSocket = io(API_BASE, {
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionAttempts: 5,
            timeout: 20000
        });

        // Connection events
        newSocket.on('connect', () => {
            console.log('Connected to USB Monitor Service');
            setIsConnected(true);
            setError(null);
            addNotification('Connected to USB Monitor Service', 'success');
        });

        newSocket.on('disconnect', (reason) => {
            console.log('Disconnected from service:', reason);
            setIsConnected(false);
            addNotification(`Disconnected: ${reason}`, 'error');
        });

        newSocket.on('connect_error', (error) => {
            console.error('Connection error:', error);
            setIsConnected(false);
            setError(`Failed to connect to service: ${error.message}`);
            addNotification('Failed to connect to service', 'error');
        });

        // Data events
        newSocket.on('devices:initial', (data) => {
            console.log('Received initial devices:', data);
            setDevices(data.devices || []);
            setIsLoading(false);
        });

        newSocket.on('device:connected', (data) => {
            console.log('Device connected:', data);
            setDevices(prev => {
                const updated = prev.filter(d => d.id !== data.device.id);
                return [...updated, data.device];
            });
            addNotification(`Device connected: ${data.device.productName}`, 'success');
        });

        newSocket.on('device:disconnected', (data) => {
            console.log('Device disconnected:', data);
            setDevices(prev =>
                prev.map(d =>
                    d.id === data.device.id
                        ? { ...d, status: 'disconnected', disconnectedAt: data.device.disconnectedAt }
                        : d
                )
            );
            addNotification(`Device disconnected: ${data.device.productName}`, 'warning');
        });

        newSocket.on('history:initial', (data) => {
            console.log('Received initial history:', data);
            setHistory(data.history || []);
        });

        newSocket.on('status:initial', (data) => {
            console.log('Received initial status:', data);
            setStatus(data.status);
        });

        newSocket.on('status:update', (data) => {
            setStatus(data.status);
        });

        newSocket.on('devices:refreshed', (data) => {
            console.log('Devices refreshed:', data);
            setDevices(data.devices || []);
            addNotification('Device list refreshed', 'info');
        });

        newSocket.on('error', (data) => {
            console.error('Socket error:', data);
            setError(data.message);
            addNotification(`Error: ${data.message}`, 'error');
        });

        setSocket(newSocket);

        return newSocket;
    }, [API_BASE, socket]);

    // Add notification
    const addNotification = (message, type = 'info') => {
        const id = Date.now();
        const notification = { id, message, type, timestamp: new Date() };

        setNotifications(prev => [notification, ...prev.slice(0, 4)]); // Keep last 5

        // Auto remove after 5 seconds
        setTimeout(() => {
            setNotifications(prev => prev.filter(n => n.id !== id));
        }, 5000);
    };

    // Fetch initial data via REST API
    const fetchInitialData = async () => {
        try {
            setIsLoading(true);

            // Fetch devices
            const devicesResponse = await axios.get(`${API_BASE}/api/devices`);
            setDevices(devicesResponse.data.data || []);

            // Fetch history
            const historyResponse = await axios.get(`${API_BASE}/api/history?limit=20`);
            setHistory(historyResponse.data.data || []);

            // Fetch status
            const statusResponse = await axios.get(`${API_BASE}/api/status`);
            setStatus(statusResponse.data.data || null);

            // Fetch stats
            const statsResponse = await axios.get(`${API_BASE}/api/stats`);
            setStats(statsResponse.data.data || null);

            setError(null);
        } catch (error) {
            console.error('Failed to fetch initial data:', error);
            setError(`Failed to fetch data: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    // Refresh devices
    const refreshDevices = async () => {
        try {
            if (socket && isConnected) {
                socket.emit('devices:refresh');
            } else {
                await axios.post(`${API_BASE}/api/devices/refresh`);
                await fetchInitialData();
            }
            addNotification('Refreshing device list...', 'info');
        } catch (error) {
            console.error('Failed to refresh devices:', error);
            addNotification('Failed to refresh devices', 'error');
        }
    };

    // Initialize component
    useEffect(() => {
        fetchInitialData();
        const newSocket = initializeSocket();

        return () => {
            if (newSocket) {
                newSocket.disconnect();
            }
        };
    }, [initializeSocket]);

    // Periodically fetch stats
    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await axios.get(`${API_BASE}/api/stats`);
                setStats(response.data.data);
            } catch (error) {
                console.warn('Failed to fetch stats:', error);
            }
        };

        fetchStats();
        const interval = setInterval(fetchStats, 30000); // Every 30 seconds

        return () => clearInterval(interval);
    }, [API_BASE]);

    // Calculate dashboard metrics
    const connectedDevices = devices.filter(d => d.status === 'connected');
    const disconnectedDevices = devices.filter(d => d.status === 'disconnected');
    const recentConnections = history.filter(h =>
        h.eventType === 'connect' &&
        new Date(h.timestamp) > new Date(Date.now() - 24 * 60 * 60 * 1000)
    );

    if (isLoading) {
        return (
            <div className="dashboard-loading">
                <div className="loading-spinner">
                    <RefreshCw className="spin" size={48} />
                </div>
                <p>Loading USB Monitor Dashboard...</p>
            </div>
        );
    }

    return (
        <div className="usb-dashboard">
            {/* Header */}
            <header className="dashboard-header">
                <div className="header-content">
                    <div className="header-title">
                        <Usb size={32} className="header-icon" />
                        <div>
                            <h1>USB Monitor Dashboard</h1>
                            <p className="subtitle">Real-time USB device monitoring</p>
                        </div>
                    </div>

                    <div className="header-actions">
                        <button
                            onClick={refreshDevices}
                            className="btn btn-primary"
                            disabled={!isConnected}
                        >
                            <RefreshCw size={16} />
                            Refresh
                        </button>

                        <div className={`connection-status ${isConnected ? 'connected' : 'disconnected'}`}>
                            {isConnected ? <Wifi size={16} /> : <WifiOff size={16} />}
                            {isConnected ? 'Connected' : 'Disconnected'}
                        </div>
                    </div>
                </div>
            </header>

            {/* Notifications */}
            {notifications.length > 0 && (
                <div className="notifications">
                    {notifications.map(notification => (
                        <div
                            key={notification.id}
                            className={`notification notification-${notification.type}`}
                        >
                            <div className="notification-content">
                                {notification.type === 'success' && <CheckCircle size={16} />}
                                {notification.type === 'error' && <XCircle size={16} />}
                                {notification.type === 'warning' && <AlertCircle size={16} />}
                                {notification.type === 'info' && <Activity size={16} />}
                                <span>{notification.message}</span>
                            </div>
                            <span className="notification-time">
                                {notification.timestamp.toLocaleTimeString()}
                            </span>
                        </div>
                    ))}
                </div>
            )}

            {/* Error Display */}
            {error && (
                <div className="error-banner">
                    <XCircle size={16} />
                    <span>{error}</span>
                    <button onClick={() => setError(null)}>×</button>
                </div>
            )}

            {/* Main Content */}
            <main className="dashboard-main">
                {/* Overview Cards */}
                <section className="overview-section">
                    <div className="overview-cards">
                        <div className="overview-card connected">
                            <div className="card-icon">
                                <CheckCircle size={24} />
                            </div>
                            <div className="card-content">
                                <h3>{connectedDevices.length}</h3>
                                <p>Connected Devices</p>
                            </div>
                        </div>

                        <div className="overview-card disconnected">
                            <div className="card-icon">
                                <XCircle size={24} />
                            </div>
                            <div className="card-content">
                                <h3>{disconnectedDevices.length}</h3>
                                <p>Recently Disconnected</p>
                            </div>
                        </div>

                        <div className="overview-card activity">
                            <div className="card-icon">
                                <Activity size={24} />
                            </div>
                            <div className="card-content">
                                <h3>{recentConnections.length}</h3>
                                <p>Connections Today</p>
                            </div>
                        </div>

                        <div className="overview-card status">
                            <div className="card-icon">
                                <Server size={24} />
                            </div>
                            <div className="card-content">
                                <h3>{status?.monitoringMethod === 'node-usb-detection' ? 'Native' : 'Polling'}</h3>
                                <p>Detection Method</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Status Panel */}
                {status && (
                    <section className="status-section">
                        <StatusPanel status={status} stats={stats} />
                    </section>
                )}

                {/* Devices Grid */}
                <section className="devices-section">
                    <div className="section-header">
                        <h2>
                            <Monitor size={20} />
                            USB Devices ({devices.length})
                        </h2>
                    </div>

                    {devices.length === 0 ? (
                        <div className="empty-state">
                            <Usb size={48} className="empty-icon" />
                            <h3>No USB devices detected</h3>
                            <p>Connect a USB device or refresh to scan for devices</p>
                            <button onClick={refreshDevices} className="btn btn-primary">
                                <RefreshCw size={16} />
                                Scan for Devices
                            </button>
                        </div>
                    ) : (
                        <div className="devices-grid">
                            {devices.map(device => (
                                <DeviceCard key={device.id} device={device} />
                            ))}
                        </div>
                    )}
                </section>

                {/* Connection History */}
                <section className="history-section">
                    <div className="section-header">
                        <h2>
                            <Clock size={20} />
                            Connection History
                        </h2>
                    </div>
                    <ConnectionHistory history={history} />
                </section>
            </main>
        </div>
    );
};

export default USBDashboard;