import {
  Building,
  Calendar,
  CheckCircle,
  Clock,
  Cpu,
  Hash,
  Usb,
  XCircle
} from 'lucide-react';

const DeviceCard = ({ device }) => {
  const formatTime = (timestamp) => {
    if (!timestamp) return 'Unknown';
    return new Date(timestamp).toLocaleString();
  };

  const formatDuration = (connectedAt, disconnectedAt) => {
    if (!connectedAt) return null;

    const start = new Date(connectedAt);
    const end = disconnectedAt ? new Date(disconnectedAt) : new Date();
    const duration = end - start;

    const seconds = Math.floor(duration / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  };

  const getDeviceIcon = (device) => {
    // You can customize this based on device type/vendor
    const vendorId = device.vendorId;

    if (vendorId === 0x05ac) return '🍎'; // Apple
    if (vendorId === 0x046d) return '🖱️'; // Logitech (mouse/keyboard)
    if (vendorId === 0x04d8) return '🔧'; // Microchip
    if (vendorId === 0x413c) return '💻'; // Dell

    return '🔌'; // Default USB icon
  };

  const isConnected = device.status === 'connected';
  const duration = formatDuration(device.connectedAt, device.disconnectedAt);

  return (
    <div className={`device-card ${device.status}`}>
      {/* Card Header */}
      <div className="device-card-header">
        <div className="device-info">
          <div className="device-icon">
            <span className="emoji-icon">{getDeviceIcon(device)}</span>
            <Usb size={16} className="usb-icon" />
          </div>
          <div className="device-name">
            <h3 title={device.productName}>{device.productName || 'Unknown Device'}</h3>
            <p className="manufacturer">{device.manufacturer}</p>
          </div>
        </div>

        <div className={`status-indicator ${device.status}`}>
          {isConnected ? (
            <CheckCircle size={20} className="status-icon connected" />
          ) : (
            <XCircle size={20} className="status-icon disconnected" />
          )}
          <span className="status-text">
            {isConnected ? 'Connected' : 'Disconnected'}
          </span>
        </div>
      </div>

      {/* Card Body */}
      <div className="device-card-body">
        {/* Device Details */}
        <div className="device-details">
          <div className="detail-row">
            <Hash size={14} />
            <span className="detail-label">Device ID:</span>
            <span className="detail-value" title={device.id}>
              {device.id.length > 20 ? `${device.id.substring(0, 20)}...` : device.id}
            </span>
          </div>

          <div className="detail-row">
            <Cpu size={14} />
            <span className="detail-label">Vendor/Product:</span>
            <span className="detail-value">
              {device.vendorId ? `0x${device.vendorId.toString(16).padStart(4, '0')}` : 'N/A'} /
              {device.productId ? `0x${device.productId.toString(16).padStart(4, '0')}` : 'N/A'}
            </span>
          </div>

          {device.serialNumber && (
            <div className="detail-row">
              <Building size={14} />
              <span className="detail-label">Serial:</span>
              <span className="detail-value">{device.serialNumber}</span>
            </div>
          )}
        </div>

        {/* Connection Info */}
        <div className="connection-info">
          {device.connectedAt && (
            <div className="connection-detail">
              <Calendar size={14} />
              <div className="connection-text">
                <span className="connection-label">Connected:</span>
                <span className="connection-time">{formatTime(device.connectedAt)}</span>
              </div>
            </div>
          )}

          {device.disconnectedAt && (
            <div className="connection-detail">
              <XCircle size={14} />
              <div className="connection-text">
                <span className="connection-label">Disconnected:</span>
                <span className="connection-time">{formatTime(device.disconnectedAt)}</span>
              </div>
            </div>
          )}

          {duration && (
            <div className="connection-detail">
              <Clock size={14} />
              <div className="connection-text">
                <span className="connection-label">Duration:</span>
                <span className="connection-duration">{duration}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Card Footer */}
      <div className="device-card-footer">
        <div className="last-seen">
          <span className="last-seen-label">Last seen:</span>
          <span className="last-seen-time">{formatTime(device.lastSeen)}</span>
        </div>

        {device.locationId && (
          <div className="location-info">
            <span className="location-label">Location:</span>
            <span className="location-value">{device.locationId}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default DeviceCard;