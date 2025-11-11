import React from 'react';

const StatsCard = ({ 
  title, 
  value, 
  subtitle, 
  icon, 
  type = 'primary',
  trend = null,
  className = '',
  onClick = null 
}) => {
  return (
    <div 
      className={`stat-card ${type} ${className} ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
    >
      <div className="stat-header">
        <h3 className="stat-title">{title}</h3>
        {icon && <span className="stat-icon">{icon}</span>}
      </div>
      
      <div className="flex items-end justify-between">
        <div className="flex-1">
          <p className="stat-value">{value}</p>
          {subtitle && <p className="stat-subtitle">{subtitle}</p>}
        </div>
        
        {trend && (
          <div className={`flex items-center gap-sm text-xs ${
            trend.type === 'up' ? 'text-success-600' : 
            trend.type === 'down' ? 'text-error-600' : 'text-secondary'
          }`}>
            {trend.type !== 'right' && (
              <i className={`bi bi-arrow-${
                trend.type === 'up' ? 'up' : 
                trend.type === 'down' ? 'down' : 'right'
              }`}></i>
            )}
            <span className="font-medium">{trend.value}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default StatsCard;