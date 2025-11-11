// frontend/src/components/ui/QuickActions.jsx
import React from 'react';

const QuickActions = ({ actions }) => {
  return (
    <div className="grid grid-cols-1 gap-md">
      {actions.map((action, index) => (
        <button
          key={index}
          onClick={action.action}
          className={`flex items-center gap-md p-md rounded-lg border border-primary bg-secondary hover:bg-tertiary transition-all`}
        >
          <div className={`w-12 h-12 rounded-lg bg-${action.color}-100 flex items-center justify-center`}>
            <i className={`${action.icon} text-xl text-${action.color}-600`}></i>
          </div>
          <div className="flex-1 text-left">
            <h4 className="font-semibold text-primary">{action.title}</h4>
            <p className="text-secondary text-sm">{action.description}</p>
          </div>
          <i className="bi bi-chevron-right text-muted"></i>
        </button>
      ))}
    </div>
  );
};

export default QuickActions;
