import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';

const Header = ({ 
  activeSection, 
  setIsMobileOpen, 
  isMobileOpen,
  user = { name: 'Administrateur', role: 'Admin' }
}) => {
  const { isDark, toggleTheme } = useTheme();

  const getSectionTitle = (section) => {
    const titles = {
      dashboard: 'Tableau de bord',
      stats: 'Statistiques détaillées', 
      teachers: 'Gestion des enseignants',
      courses: 'Gestion des cours',
      schedules: 'Plannings',
      import: 'Importation de données',
      export: 'Exportation de données',
      reports: 'Rapports et analyses'
    };
    return titles[section] || 'Gestion des heures d\'enseignement';
  };

  const getSectionDescription = (section) => {
    const descriptions = {
      dashboard: 'Vue d\'ensemble et actions rapides',
      stats: 'Analyses et métriques détaillées',
      teachers: 'Ajouter, modifier et gérer les enseignants',
      courses: 'Planifier et organiser les cours',
      schedules: 'Gestion des emplois du temps',
      import: 'Importer des données depuis Excel',
      export: 'Exporter les données et rapports',
      reports: 'Générer des rapports personnalisés'
    };
    return descriptions[section] || 'Système de gestion universitaire';
  };

  return (
    <header className="header">
      {/* Côté gauche - Menu mobile et titre */}
      <div className="flex items-center gap-lg">
        {/* Menu burger pour mobile */}
        <button
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="btn btn-ghost btn-sm lg:hidden"
          aria-label="Menu"
        >
          <i className="bi bi-list text-xl"></i>
        </button>

        {/* Titre et description */}
        <div>
          <h1 className="text-xl font-bold text-primary">
            {getSectionTitle(activeSection)}
          </h1>
          <p className="text-sm text-secondary hidden sm:block">
            {getSectionDescription(activeSection)}
          </p>
        </div>
      </div>

      {/* Côté droit - Actions et utilisateur */}
      <div className="flex items-center gap-md">
        {/* Notifications */}
        <button className="btn btn-ghost btn-sm relative">
          <i className="bi bi-bell"></i>
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-error-500 rounded-full"></span>
        </button>

        {/* Toggle thème (visible sur desktop seulement) */}
        <button
          onClick={toggleTheme}
          className="btn btn-ghost btn-sm hidden lg:flex"
          title={isDark ? 'Passer en mode clair' : 'Passer en mode sombre'}
        >
          <i className={`bi ${isDark ? 'bi-sun' : 'bi-moon'}`}></i>
        </button>

        {/* Recherche rapide */}
        <button className="btn btn-ghost btn-sm hidden md:flex">
          <i className="bi bi-search"></i>
        </button>

        {/* Menu utilisateur */}
        <div className="flex items-center gap-sm">
          <div className="hidden md:block text-right">
            <div className="text-sm font-medium text-primary">
              {user.name}
            </div>
            <div className="text-xs text-secondary">
              {user.role} • ILC
            </div>
          </div>
          
          <button className="btn btn-ghost btn-sm">
            <div className="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center">
              <span className="text-white font-semibold text-sm">
                {user.name.charAt(0)}
              </span>
            </div>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;