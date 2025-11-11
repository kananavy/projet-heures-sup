import React from 'react';

export default function Loading({ text = "Chargement...", size = "md" }) {
  const spinnerSizes = {
    sm: { width: '1rem', height: '1rem' },
    md: { width: '2rem', height: '2rem' },
    lg: { width: '3rem', height: '3rem' }
  };

  return (
    <div className="loading-container">
      <div 
        className="loading-spinner" 
        style={spinnerSizes[size]}
      ></div>
      {text && <p className="loading-text">{text}</p>}
    </div>
  );
}

export function LoadingSpinner({ size = "md" }) {
  const spinnerSizes = {
    sm: { width: '1rem', height: '1rem' },
    md: { width: '1.5rem', height: '1.5rem' },
    lg: { width: '2rem', height: '2rem' }
  };

  return (
    <div 
      className="loading-spinner" 
      style={spinnerSizes[size]}
    ></div>
  );
}