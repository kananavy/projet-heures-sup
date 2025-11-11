import React from 'react';

const getIcon = (type) => {
  switch (type) {
    case 'success':
      return '✅';
    case 'error':
      return '❌';
    case 'warning':
      return '⚠️';
    default:
      return 'ℹ️';
  }
};

const Notification = ({ notification, onClose }) => {
  return (
    <div className={`notification ${notification.type}`}>
      <span className="text-lg">{getIcon(notification.type)}</span>
      <div className="flex-1">
        <p className="font-medium text-sm">{notification.message}</p>
      </div>
      <button
        onClick={() => onClose(notification.id)}
        className="btn-ghost btn-sm p-1"
        style={{ minHeight: 'auto', padding: '0.25rem' }}
      >
        <i className="bi bi-x-lg"></i>
      </button>
    </div>
  );
};

export default function NotificationSystem({ notifications, onRemove }) {
  if (!notifications || notifications.length === 0) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 'var(--space-lg)',
      right: 'var(--space-lg)',
      zIndex: 1100,
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--space-sm)',
      maxWidth: '400px'
    }}>
      {notifications.map(notification => (
        <Notification
          key={notification.id}
          notification={notification}
          onClose={onRemove}
        />
      ))}
    </div>
  );
}