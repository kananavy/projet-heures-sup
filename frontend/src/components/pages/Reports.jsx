// frontend/src/pages/Reports.jsx
import React, { useState } from 'react';

export default function Reports({ notify }) {
  return (
    <div className="space-y-xl">
      <div>
        <h1 className="text-3xl font-bold text-primary mb-sm">
          <i className="bi bi-file-earmark-text me-3"></i>
          Rapports et analyses
        </h1>
        <p className="text-secondary">Générer des rapports personnalisés</p>
      </div>

      <div className="modern-card text-center py-4xl">
        <i className="bi bi-file-text text-6xl text-muted mb-lg block"></i>
        <h3 className="text-xl font-semibold text-primary mb-sm">
          Générateur de rapports
        </h3>
        <p className="text-secondary">
          Rapports PDF et analyses personnalisées à venir
        </p>
      </div>
    </div>
  );
}
