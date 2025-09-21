import React from 'react';

type StatusIndicatorProps = {
  status: 'online' | 'offline';
  size?: 'sm' | 'md' | 'lg';
};

const StatusIndicator: React.FC<StatusIndicatorProps> = ({ status }) => (
  <span className={`status-indicator ${status}`}>{status === 'online' ? '🟢 Online' : '⚪ Offline'}</span>
);

export default StatusIndicator; 