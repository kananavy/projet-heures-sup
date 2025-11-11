import { useState, useCallback } from 'react';

export const useNotifications = () => {
  const [notifications, setNotifications] = useState([]);

  const addNotification = useCallback((message, type = 'info', duration = 5000) => {
    const id = Date.now() + Math.random();
    const notification = { id, message, type };
    
    setNotifications(prev => [...prev, notification]);

    if (duration > 0) {
      setTimeout(() => {
        removeNotification(id);
      }, duration);
    }

    return id;
  }, []);

  const removeNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  // Méthodes de convenance
  const success = useCallback((message, duration) => addNotification(message, 'success', duration), [addNotification]);
  const error = useCallback((message, duration) => addNotification(message, 'error', duration), [addNotification]);
  const warning = useCallback((message, duration) => addNotification(message, 'warning', duration), [addNotification]);
  const info = useCallback((message, duration) => addNotification(message, 'info', duration), [addNotification]);

  return {
    notifications,
    addNotification,
    removeNotification,
    clearNotifications,
    success,
    error,
    warning,
    info
  };
};