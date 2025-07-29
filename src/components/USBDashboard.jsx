import { useCallback, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import axios from 'axios';
import { Activity, CheckCircle, RefreshCw, Server, Usb, Moon, Sun, Filter, XCircle, Monitor, Clock } from 'lucide-react';
import DeviceCard from './DeviceCard';
import StatusPanel from './StatusPanel';
import ConnectionHistory from './ConnectionHistory';
import '../styles/Dashboard.css';

const USBDashboard = () => {
  const [devices, setDevices] = useState([]);
  const [history, setHistory] = useState([]);
  const [status, setStatus] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [socketInstance, setSocketInstance] = useState(null);
  const [stats, setStats] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [theme, setTheme] = useState('light');
  const [filter, setFilter] = useState('');
  const API_BASE = 'http://localhost:3001';

  const initializeSocket = useCallback(() => {
    const newSocket = io(API_BASE, {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
      timeout: 20000,
      transports: ['websocket', 'polling'],
      pingTimeout: 30000,
      pingInterval: 25000,
    });

    newSocket.on('connect', () => {
      setIsConnected(true);
      setError(null);
      addNotification('Connected to USB Monitor Service', 'success');
    });

    newSocket.on('disconnect', (reason) => {
      setIsConnected(false);
      addNotification(`Disconnected: ${reason}`, 'error');
    });

    newSocket.on('connect_error', (error) => {
      setIsConnected(false);
      setError(`Failed to connect: ${error.message}`);
      addNotification('Failed to connect to service', 'error');
    });

    newSocket.on('devices:initial', (data) => {
      setDevices(data.devices || []);
      setIsLoading(false);
    });

    newSocket.on('device:connected', (data) => {
      setDevices((prev) => {
        const updated = prev.filter((d) => d.id !== data.device.id);
        return [...updated, data.device];
      });
      addNotification(`Device connected: ${data.device.productName}`, 'success');
    });

    newSocket.on('device:disconnected', (data) => {
      setDevices((prev) =>
        prev.map((d) =>
          d.id === data.device.id
            ? { ...d, status: 'disconnected', disconnectedAt: data.device.disconnectedAt }
            : d
        )
      );
      addNotification(`Device disconnected: ${data.device.productName}`, 'warning');
    });

    newSocket.on('history:initial', (data) => setHistory(data.history || []));
    newSocket.on('status:initial', (data) => setStatus(data.status));
    newSocket.on('status:update', (data) => setStatus(data.status));
    newSocket.on('devices:refreshed', (data) => {
      setDevices(data.devices || []);
      addNotification('Device list refreshed', 'info');
    });
    newSocket.on('error', (data) => {
      setError(data.message);
      addNotification(`Error: ${data.message}`, 'error');
    });

    setSocketInstance(newSocket);
    return newSocket;
  }, []);

  const addNotification = (message, type = 'info') => {
    const id = Date.now();
    setNotifications((prev) => [{ id, message, type, timestamp: new Date() }, ...prev.slice(0, 4)]);
    setTimeout(() => setNotifications((prev) => prev.filter((n) => n.id !== id)), 5000);
  };

  const fetchInitialData = async () => {
    setIsLoading(true);
    try {
      const [devicesResponse, historyResponse, statusResponse, statsResponse] = await Promise.all([
        axios.get(`${API_BASE}/api/devices`),
        axios.get(`${API_BASE}/api/history?limit=20`),
        axios.get(`${API_BASE}/api/status`),
        axios.get(`${API_BASE}/api/stats`),
      ]);
      setDevices(devicesResponse.data.data || []);
      setHistory(historyResponse.data.data || []);
      setStatus(statusResponse.data.data || null);
      setStats(statsResponse.data.data || null);
      setError(null);
    } catch (error) {
      setError(`Failed to fetch data: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshDevices = async () => {
    try {
      if (socketInstance && isConnected) {
        socketInstance.emit('devices:refresh');
      } else {
        await axios.post(`${API_BASE}/api/devices/refresh`);
        await fetchInitialData();
      }
      addNotification('Refreshing device list...', 'info');
    } catch (error) {
      addNotification('Failed to refresh devices', error);
    }
  };

  useEffect(() => {
    fetchInitialData();
    const newSocket = initializeSocket();
    return () => newSocket?.disconnect();
  }, [initializeSocket]);

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
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleFilter = (e) => setFilter(e.detail);
    window.addEventListener('setFilter', handleFilter);
    return () => window.removeEventListener('setFilter', handleFilter);
  }, []);

  useEffect(() => {
    const handleNotification = (e) => addNotification(e.detail.message, e.detail.type);
    window.addEventListener('addNotification', handleNotification);
    return () => window.removeEventListener('addNotification', handleNotification);
  }, []);

  const toggleTheme = () => setTheme(theme === 'light' ? 'dark' : 'light');

  const clearFilters = () => {
    setFilter('');
    window.dispatchEvent(new CustomEvent('clearHistoryFilters'));
  };

  const filteredDevices = devices.filter(
    (d) =>
      (d.productName?.toLowerCase().includes(filter.toLowerCase()) ||
       d.manufacturer?.toLowerCase().includes(filter.toLowerCase()) ||
       d.id === filter) &&
      (filter === 'connected' ? d.status === 'connected' : filter === 'disconnected' ? d.status === 'disconnected' : true)
  );

  const connectedDevices = filteredDevices.filter((d) => d.status === 'connected');
  const disconnectedDevices = filteredDevices.filter((d) => d.status === 'disconnected');
  const recentConnections = history.filter(
    (h) => h.eventType === 'connect' && new Date(h.timestamp) > new Date(Date.now() - 24 * 60 * 60 * 1000)
  );

  if (isLoading) {
    return (
      <div className="dashboard-loading">
        <RefreshCw className="spin" size={48} />
        <p>Loading USB Monitor Dashboard...</p>
      </div>
    );
  }

  return (
    <div className={`usb-dashboard ${theme}`}>
      <header className="dashboard-header">
        <div className="header-content">
          <div className="header-title">
            <Usb size={32} className="header-icon animate-pulse" aria-hidden="true" />
            <div>
              <h1>USB Monitor Dashboard</h1>
              <p className="subtitle">Real-time USB device monitoring</p>
            </div>
          </div>
          <div className="header-actions">
            <input
              type="text"
              placeholder="Search devices..."
              value={filter && !['connected', 'disconnected'].includes(filter) ? filter : ''}
              onChange={(e) => setFilter(e.target.value)}
              className="search-bar"
              aria-label="Search USB devices"
            />
            <button
              onClick={refreshDevices}
              className="btn btn-primary"
              disabled={!isConnected}
              aria-label="Refresh device list"
            >
              <RefreshCw size={16} className={isConnected ? '' : 'spin'} />
              Refresh
            </button>
            <button onClick={clearFilters} className="btn btn-secondary" aria-label="Clear filters">
              <Filter size={16} />
              Clear Filters
            </button>
            <button onClick={toggleTheme} className="btn btn-secondary" aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}>
              {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
            </button>
            <div className={`connection-status ${isConnected ? 'connected' : 'disconnected'}`}>
              {isConnected ? 'Connected' : 'Disconnected'}
            </div>
          </div>
        </div>
      </header>

      <div className="notifications">
        {notifications.map((notification) => (
          <div key={notification.id} className={`notification notification-${notification.type}`}>
            <span>{notification.message}</span>
            <button onClick={() => setNotifications((prev) => prev.filter((n) => n.id !== notification.id))} aria-label="Dismiss notification">
              ×
            </button>
          </div>
        ))}
      </div>

      {error && (
        <div className="error-banner">
          <span>{error}</span>
          <button onClick={() => setError(null)} aria-label="Dismiss error">×</button>
        </div>
      )}

      <main className="dashboard-main">
        <section className="overview-section">
          <div className="overview-cards">
            <div className="overview-card connected" role="button" tabIndex={0} onClick={() => setFilter('connected')}>
              <CheckCircle size={24} className="animate-pulse" />
              <div className="card-content">
                <h3>{connectedDevices.length}</h3>
                <p>Connected Devices</p>
              </div>
            </div>
            <div className="overview-card disconnected" role="button" tabIndex={0} onClick={() => setFilter('disconnected')}>
              <XCircle size={24} />
              <div className="card-content">
                <h3>{disconnectedDevices.length}</h3>
                <p>Recently Disconnected</p>
              </div>
            </div>
            <div className="overview-card activity">
              <Activity size={24} />
              <div className="card-content">
                <h3>{recentConnections.length}</h3>
                <p>Connections Today</p>
              </div>
            </div>
            <div className="overview-card status">
              <Server size={24} />
              <div className="card-content">
                <h3>{status?.monitoringMethod === 'node-usb-detection' ? 'Native' : 'Polling'}</h3>
                <p>Detection Method</p>
              </div>
            </div>
          </div>
        </section>

        {status && (
          <section className="status-section">
            <StatusPanel status={status} stats={stats} />
          </section>
        )}

        <section className="devices-section">
          <div className="section-header">
            <h2>
              <Monitor size={20} />
              USB Devices ({filteredDevices.length})
            </h2>
          </div>
          {filteredDevices.length === 0 ? (
            <div className="empty-state">
              <Usb size={48} className="empty-icon animate-bounce" />
              <h3>No USB devices detected</h3>
              <p>Connect a USB device or refresh to scan for devices</p>
              <button onClick={refreshDevices} className="btn btn-primary" aria-label="Scan for devices">
                <RefreshCw size={16} />
                Scan for Devices
              </button>
            </div>
          ) : (
            <div className="devices-grid">
              {filteredDevices.map((device) => (
                <DeviceCard key={device.id} device={device} />
              ))}
            </div>
          )}
        </section>

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