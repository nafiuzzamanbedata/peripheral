import {
    Activity,
    AlertCircle,
    BarChart3,
    CheckCircle,
    Cpu,
    Monitor,
    Server,
    Zap
} from 'lucide-react';

const StatusPanel = ({ status, stats }) => {
    const formatUptime = (seconds) => {
        const days = Math.floor(seconds / (24 * 60 * 60));
        const hours = Math.floor((seconds % (24 * 60 * 60)) / (60 * 60));
        const minutes = Math.floor((seconds % (60 * 60)) / 60);

        if (days > 0) {
            return `${days}d ${hours}h ${minutes}m`;
        } else if (hours > 0) {
            return `${hours}h ${minutes}m`;
        } else {
            return `${minutes}m`;
        }
    };

    const getMonitoringMethodInfo = (method) => {
        switch (method) {
            case 'node-usb-detection':
                return {
                    name: 'Native Detection',
                    description: 'Real-time USB events',
                    quality: 'excellent',
                    icon: <Zap size={16} />
                };
            case 'usb-polling':
                return {
                    name: 'USB Library Polling',
                    description: 'USB library with polling',
                    quality: 'good',
                    icon: <Activity size={16} />
                };
            case 'system-polling':
                return {
                    name: 'System Command Polling',
                    description: 'OS command polling',
                    quality: 'fair',
                    icon: <Monitor size={16} />
                };
            default:
                return {
                    name: 'Unknown',
                    description: 'Detection method unknown',
                    quality: 'unknown',
                    icon: <AlertCircle size={16} />
                };
        }
    };

    const methodInfo = getMonitoringMethodInfo(status?.monitoringMethod);

    if (!status) {
        return (
            <div className="status-panel loading">
                <div className="status-header">
                    <Server size={20} />
                    <h3>Service Status</h3>
                </div>
                <p>Loading status information...</p>
            </div>
        );
    }

    return (
        <div className="status-panel">
            <div className="status-header">
                <Server size={20} />
                <h3>Service Status</h3>
                <div className={`service-status ${status.isMonitoring ? 'active' : 'inactive'}`}>
                    {status.isMonitoring ? (
                        <>
                            <CheckCircle size={16} />
                            <span>Active</span>
                        </>
                    ) : (
                        <>
                            <AlertCircle size={16} />
                            <span>Inactive</span>
                        </>
                    )}
                </div>
            </div>

            <div className="status-grid">
                {/* Monitoring Method */}
                <div className="status-card method">
                    <div className="status-card-header">
                        {methodInfo.icon}
                        <h4>Detection Method</h4>
                    </div>
                    <div className="status-card-content">
                        <div className="method-info">
                            <span className="method-name">{methodInfo.name}</span>
                            <span className="method-description">{methodInfo.description}</span>
                        </div>
                        <div className={`quality-indicator ${methodInfo.quality}`}>
                            <div className="quality-dot"></div>
                            <span className="quality-text">{methodInfo.quality}</span>
                        </div>
                    </div>
                </div>

                {/* System Info */}
                <div className="status-card system">
                    <div className="status-card-header">
                        <Cpu size={16} />
                        <h4>System Info</h4>
                    </div>
                    <div className="status-card-content">
                        <div className="system-details">
                            <div className="system-row">
                                <span className="system-label">Uptime:</span>
                                <span className="system-value">{formatUptime(status.uptime)}</span>
                            </div>
                            <div className="system-row">
                                <span className="system-label">Devices:</span>
                                <span className="system-value">{status.deviceCount}</span>
                            </div>
                            <div className="system-row">
                                <span className="system-label">History:</span>
                                <span className="system-value">{status.historyCount} events</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Library Status */}
                <div className="status-card libraries">
                    <div className="status-card-header">
                        <BarChart3 size={16} />
                        <h4>Libraries</h4>
                    </div>
                    <div className="status-card-content">
                        <div className="library-status">
                            {status.librariesAvailable && (
                                <>
                                    <div className="library-item">
                                        <div className={`library-indicator ${status.librariesAvailable['node-usb-detection'] ? 'available' : 'unavailable'}`}>
                                            <div className="indicator-dot"></div>
                                        </div>
                                        <span className="library-name">node-usb-detection</span>
                                    </div>
                                    <div className="library-item">
                                        <div className={`library-indicator ${status.librariesAvailable['usb'] ? 'available' : 'unavailable'}`}>
                                            <div className="indicator-dot"></div>
                                        </div>
                                        <span className="library-name">usb</span>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Statistics (if available) */}
                {stats && (
                    <div className="status-card stats">
                        <div className="status-card-header">
                            <Activity size={16} />
                            <h4>Statistics</h4>
                        </div>
                        <div className="status-card-content">
                            <div className="stats-grid">
                                <div className="stat-item">
                                    <span className="stat-value">{stats.events?.connects || 0}</span>
                                    <span className="stat-label">Connections</span>
                                </div>
                                <div className="stat-item">
                                    <span className="stat-value">{stats.events?.disconnects || 0}</span>
                                    <span className="stat-label">Disconnections</span>
                                </div>
                            </div>

                            {stats.manufacturers && Object.keys(stats.manufacturers).length > 0 && (
                                <div className="manufacturers">
                                    <h5>Top Manufacturers:</h5>
                                    <div className="manufacturer-list">
                                        {Object.entries(stats.manufacturers)
                                            .sort(([, a], [, b]) => b - a)
                                            .slice(0, 3)
                                            .map(([manufacturer, count]) => (
                                                <div key={manufacturer} className="manufacturer-item">
                                                    <span className="manufacturer-name">{manufacturer}</span>
                                                    <span className="manufacturer-count">{count}</span>
                                                </div>
                                            ))
                                        }
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StatusPanel;