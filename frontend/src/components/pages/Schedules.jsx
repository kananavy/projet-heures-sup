// frontend/src/pages/Schedules.jsx
import React from 'react';

export default function Schedules({ notify }) {
  return (
    <div className="space-y-xl">
      <div>
        <h1 className="text-3xl font-bold text-primary mb-sm">
          <i className="bi bi-calendar3 me-3"></i>
          Plannings
        </h1>
        <p className="text-secondary">Gestion des emplois du temps</p>
      </div>

      <div className="modern-card text-center py-4xl">
        <i className="bi bi-calendar-week text-6xl text-muted mb-lg block"></i>
        <h3 className="text-xl font-semibold text-primary mb-sm">
          Interface de planning
        </h3>
        <p className="text-secondary">
          Vue calendrier et gestion des emplois du temps en développement
        </p>
      </div>
    </div>
  );
}
