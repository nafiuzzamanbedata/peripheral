import { Calendar, CheckCircle, Clock, Filter, Hash, Usb, XCircle } from 'lucide-react';
import { useState } from 'react';
import '../styles/ConnectionHistory.css';

const ConnectionHistory = ({ history }) => {
  const [filter, setFilter] = useState('all'); // all, connect, disconnect
  const [timeFilter, setTimeFilter] = useState('all'); // all, today, week
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;

  const filteredHistory = history.filter((entry) => {
    if (filter !== 'all' && entry.eventType !== filter) return false;
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

  const paginatedHistory = filteredHistory.slice(0, page * itemsPerPage);

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

  const formatFullTime = (timestamp) => new Date(timestamp).toLocaleString();

  const getEventIcon = (eventType) => (
    eventType === 'connect' ? (
      <CheckCircle size={16} className="event-icon connect" />
    ) : (
      <XCircle size={16} className="event-icon disconnect" />
    )
  );

  const getEventText = (eventType) => (eventType === 'connect' ? 'Connected' : 'Disconnected');

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    window.dispatchEvent(new CustomEvent('addNotification', { detail: { message: 'Device ID copied!', type: 'info' } }));
  };

  const resetFilters = () => {
    setFilter('all');
    setTimeFilter('all');
    setPage(1);
  };

  if (!history || history.length === 0) {
    return (
      <div className="history-empty">
        <Clock size={48} className="empty-icon animate-bounce" />
        <h3>No connection history</h3>
        <p>Device connection events will appear here</p>
      </div>
    );
  }

  return (
    <div className="connection-history">
      <div className="history-filters">
        <div className="filter-group">
          <Filter size={16} />
          <span className="filter-label">Event Type:</span>
          <div className="filter-buttons">
            <button
              className={`btn btn-filter ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
              aria-label="Show all events"
            >
              All
            </button>
            <button
              className={`btn btn-filter ${filter === 'connect' ? 'active' : ''}`}
              onClick={() => setFilter('connect')}
              aria-label="Show connection events"
            >
              Connections
            </button>
            <button
              className={`btn btn-filter ${filter === 'disconnect' ? 'active' : ''}`}
              onClick={() => setFilter('disconnect')}
              aria-label="Show disconnection events"
            >
              Disconnections
            </button>
          </div>
        </div>
        <div className="filter-group">
          <Calendar size={16} />
          <span className="filter-label">Time Range:</span>
          <div className="filter-buttons">
            <button
              className={`btn btn-filter ${timeFilter === 'all' ? 'active' : ''}`}
              onClick={() => setTimeFilter('all')}
              aria-label="Show all time"
            >
              All Time
            </button>
            <button
              className={`btn btn-filter ${timeFilter === 'today' ? 'active' : ''}`}
              onClick={() => setTimeFilter('today')}
              aria-label="Show today"
            >
              Today
            </button>
            <button
              className={`btn btn-filter ${timeFilter === 'week' ? 'active' : ''}`}
              onClick={() => setTimeFilter('week')}
              aria-label="Show this week"
            >
              This Week
            </button>
          </div>
        </div>
        <button className="btn btn-secondary" onClick={resetFilters} aria-label="Reset filters">
          Clear Filters
        </button>
        <div className="history-stats">
          <span className="stat">{filteredHistory.length} events</span>
        </div>
      </div>

      <div className="history-list">
        {paginatedHistory.length === 0 ? (
          <div className="no-results">
            <p>No events match the selected filters</p>
            <button className="btn btn-primary" onClick={resetFilters}>
              Clear Filters
            </button>
          </div>
        ) : (
          paginatedHistory.map((entry) => (
            <div
              key={entry.id}
              className={`history-item ${entry.eventType}`}
              title={formatFullTime(entry.timestamp)}
              role="button"
              tabIndex={0}
              onClick={() => window.dispatchEvent(new CustomEvent('setFilter', { detail: entry.deviceId }))}
            >
              <div className="history-icon">{getEventIcon(entry.eventType)}</div>
              <div className="history-content">
                <div className="history-main">
                  <div className="device-info">
                    <Usb size={14} className="device-icon" />
                    <span className="device-name">{entry.productName || 'Unknown Device'}</span>
                    <span className="event-type">{getEventText(entry.eventType)}</span>
                  </div>
                  <div className="device-details">
                    <span className="manufacturer">{entry.manufacturer || 'Unknown'}</span>
                    {entry.vendorId && entry.productId && (
                      <span className="device-ids" onClick={() => copyToClipboard(`${entry.vendorId}:${entry.productId}`)}>
                        <Hash size={12} />
                        {entry.vendorId.toString(16).padStart(4, '0')}:{entry.productId.toString(16).padStart(4, '0')}
                      </span>
                    )}
                  </div>
                </div>
                <div className="history-time">
                  <Clock size={12} />
                  <span className="time-ago">{formatTime(entry.timestamp)}</span>
                  <span className="full-time">{formatFullTime(entry.timestamp)}</span>
                </div>
              </div>
              <div className={`history-status ${entry.eventType}`}>
                <div className="status-dot"></div>
              </div>
            </div>
          ))
        )}
      </div>

      {filteredHistory.length > paginatedHistory.length && (
        <div className="history-footer">
          <button className="btn btn-primary" onClick={() => setPage(page + 1)} aria-label="Load more history">
            Load More
          </button>
        </div>
      )}
    </div>
  );
};

export default ConnectionHistory;