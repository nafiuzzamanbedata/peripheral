import { Building, Calendar, CheckCircle, Clock, Cpu, Hash, Usb, XCircle } from 'lucide-react';
import '../styles/DeviceCard.css';

const DeviceCard = ({ device }) => {
	// Only render if device is connected
	if (device.status !== 'connected') {
		return null;
	}

	const formatTime = (timestamp) => (timestamp ? new Date(timestamp).toLocaleString() : 'Unknown');

	const formatDuration = (connectedAt, disconnectedAt) => {
		if (!connectedAt) return null;
		const start = new Date(connectedAt);
		const end = disconnectedAt ? new Date(disconnectedAt) : new Date();
		const duration = end - start;
		const seconds = Math.floor(duration / 1000);
		const minutes = Math.floor(seconds / 60);
		const hours = Math.floor(minutes / 60);
		return hours > 0 ? `${hours}h ${minutes % 60}m` : minutes > 0 ? `${minutes}m ${seconds % 60}s` : `${seconds}s`;
	};

	const getDeviceIcon = (device) => {
		const vendorId = device.vendorId;
		if (vendorId === 0x05ac) return '🍎';
		if (vendorId === 0x046d) return '🖱️';
		if (vendorId === 0x04d8) return '🔧';
		if (vendorId === 0x413c) return '💻';
		return '🔌';
	};

	const copyToClipboard = (text) => {
		navigator.clipboard.writeText(text);
		window.dispatchEvent(new CustomEvent('addNotification', { detail: { message: 'Copied to clipboard!', type: 'info' } }));
	};

	const duration = formatDuration(device.connectedAt, device.disconnectedAt);

	return (
		<div className="device-card connected" role="button" tabIndex={0} onClick={() => alert('Show device details modal')}>
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
				<div className="status-indicator connected" aria-label="Device connected">
					<CheckCircle size={20} className="status-icon connected animate-pulse" />
					<span className="status-text">Connected</span>
				</div>
			</div>

			<div className="device-card-body">
				<div className="device-details">
					<div className="detail-row">
						<Hash size={14} />
						<span className="detail-label">Device ID:</span>
						<span className="detail-value" title={device.id} onClick={() => copyToClipboard(device.id)}>
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
							<span className="detail-value" onClick={() => copyToClipboard(device.serialNumber)}>{device.serialNumber}</span>
						</div>
					)}
				</div>

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