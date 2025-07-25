import {
  Calendar,
  CheckCircle,
  Clock,
  Filter,
  Hash,
  Usb,
  XCircle
} from 'lucide-react';
import { useState } from 'react';

const ConnectionHistory = ({ history }) => {
  const [filter, setFilter] = useState('all'); // all, connect, disconnect
  const [timeFilter, setTimeFilter] = useState('all'); // all, today, week

  // Filter history based on selected filters
  const filteredHistory = history.filter(entry => {
    // Event type filter
    if (filter !== 'all' && entry.eventType !== filter) {
      return false;
    }

    // Time filter
    const entryTime = new Date(entry.timestamp);
    const now = new Date();

    if (timeFilter === 'today') {
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      if (entryTime < today) return false;
    } else if (timeFilter === 'week') {
      const weekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);
      if (entryTime < weekAgo) return false;
    }

    return true;
  });

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString();
  };

  const formatFullTime = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  const getEventIcon = (eventType) => {
    return eventType === 'connect' ? (
      <CheckCircle size={16} className="event-icon connect" />
    ) : (
      <XCircle size={16} className="event-icon disconnect" />
    );
  };

  const getEventText = (eventType) => {
    return eventType === 'connect' ? 'Connected' : 'Disconnected';
  };

  if (!history || history.length === 0) {
    return (
      <div className="history-empty">
        <Clock size={48} className="empty-icon" />
        <h3>No connection history</h3>
        <p>Device connection events will appear here</p>
      </div>
    );
  }

  return (
    <div className="connection-history">
      {/* Filters */}
      <div className="history-filters">
        <div className="filter-group">
          <Filter size={16} />
          <label>Event Type:</label>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Events</option>
            <option value="connect">Connections</option>
            <option value="disconnect">Disconnections</option>
          </select>
        </div>

        <div className="filter-group">
          <Calendar size={16} />
          <label>Time Range:</label>
          <select
            value={timeFilter}
            onChange={(e) => setTimeFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
          </select>
        </div>

        <div className="history-stats">
          <span className="stat">
            {filteredHistory.length} events
          </span>
        </div>
      </div>

      {/* History List */}
      <div className="history-list">
        {filteredHistory.length === 0 ? (
          <div className="no-results">
            <p>No events match the selected filters</p>
          </div>
        ) : (
          filteredHistory.map((entry) => (
            <div
              key={entry.id}
              className={`history-item ${entry.eventType}`}
              title={formatFullTime(entry.timestamp)}
            >
              {/* Event Icon & Type */}
              <div className="history-icon">
                {getEventIcon(entry.eventType)}
              </div>

              {/* Device Info */}
              <div className="history-content">
                <div className="history-main">
                  <div className="device-info">
                    <Usb size={14} className="device-icon" />
                    <span className="device-name">
                      {entry.device.productName || 'Unknown Device'}
                    </span>
                    <span className="event-type">
                      {getEventText(entry.eventType)}
                    </span>
                  </div>

                  <div className="device-details">
                    <span className="manufacturer">
                      {entry.device.manufacturer}
                    </span>
                    {entry.device.vendorId && entry.device.productId && (
                      <span className="device-ids">
                        <Hash size={12} />
                        {entry.device.vendorId.toString(16).padStart(4, '0')}:
                        {entry.device.productId.toString(16).padStart(4, '0')}
                      </span>
                    )}
                  </div>
                </div>

                {/* Timestamp */}
                <div className="history-time">
                  <Clock size={12} />
                  <span className="time-ago">{formatTime(entry.timestamp)}</span>
                  <span className="full-time">{formatFullTime(entry.timestamp)}</span>
                </div>
              </div>

              {/* Status Indicator */}
              <div className={`history-status ${entry.eventType}`}>
                <div className="status-dot"></div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Load More (if needed) */}
      {history.length > 20 && (
        <div className="history-footer">
          <button className="btn btn-secondary">
            Load More History
          </button>
        </div>
      )}
    </div>
  );
};

export default ConnectionHistory;