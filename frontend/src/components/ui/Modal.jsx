import React, { useEffect } from 'react';

export default function Modal({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  size = 'md',
  footer,
  closeOnOverlayClick = true 
}) {
  // Gestion de la touche Escape
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: { maxWidth: '400px' },
    md: { maxWidth: '600px' },
    lg: { maxWidth: '800px' },
    xl: { maxWidth: '1200px' },
    full: { maxWidth: '95vw', width: '95vw' }
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget && closeOnOverlayClick) {
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div 
        className="modal-content"
        style={sizeClasses[size]}
      >
        <div className="modal-header">
          <h2 className="modal-title">{title}</h2>
          <button
            onClick={onClose}
            className="btn btn-ghost btn-sm"
            style={{ padding: '0.5rem', minHeight: 'auto' }}
          >
            <i className="bi bi-x-lg"></i>
          </button>
        </div>
        
        <div className="modal-body">
          {children}
        </div>
        
        {footer && (
          <div className="modal-footer">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}