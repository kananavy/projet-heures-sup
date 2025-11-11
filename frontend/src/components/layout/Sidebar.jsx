import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';

const Sidebar = ({ 
  isCollapsed, 
  setIsCollapsed, 
  activeSection, 
  setActiveSection, 
  stats = {},
  isMobileOpen = false,
  setIsMobileOpen 
}) => {
  const { isDark, toggleTheme } = useTheme();

  const menuSections = [
    {
      title: 'Principal',
      items: [
        {
          id: 'dashboard',
          label: 'Tableau de bord',
          icon: 'bi-speedometer2',
          badge: null
        },
        {
          id: 'stats',
          label: 'Statistiques',
          icon: 'bi-bar-chart',
          badge: null
        }
      ]
    },
    {
      title: 'Gestion',
      items: [
        {
          id: 'teachers',
          label: 'Enseignants',
          icon: 'bi-people',
          badge: stats.totalTeachers || 0
        },
        {
          id: 'courses',
          label: 'Cours',
          icon: 'bi-calendar-event',
          badge: stats.totalCourses || 0
        },
        {
          id: 'schedules',
          label: 'Plannings',
          icon: 'bi-calendar3',
          badge: null
        }
      ]
    },
    {
      title: 'Outils',
      items: [
        {
          id: 'import',
          label: 'Importation',
          icon: 'bi-file-earmark-excel',
          badge: null
        },
        {
          id: 'export',
          label: 'Exportation',
          icon: 'bi-download',
          badge: null
        },
        {
          id: 'reports',
          label: 'Rapports',
          icon: 'bi-file-earmark-text',
          badge: null
        }
      ]
    }
  ];

  const handleItemClick = (itemId) => {
    setActiveSection(itemId);
    if (window.innerWidth <= 1024) {
      setIsMobileOpen(false);
    }
  };

  const toggleSidebar = () => {
    if (window.innerWidth <= 1024) {
      setIsMobileOpen(!isMobileOpen);
    } else {
      setIsCollapsed(!isCollapsed);
    }
  };

  return (
    <>
      {/* Overlay pour mobile */}
      <div 
        className={`sidebar-overlay ${isMobileOpen ? 'show' : ''}`}
        onClick={() => setIsMobileOpen(false)}
      />
      
      {/* Sidebar */}
      <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''} ${isMobileOpen ? 'mobile-open' : ''}`}>
        {/* Header de la sidebar */}
        <div className="sidebar-header">
          <div className="sidebar-brand">
            <span className="sidebar-brand-icon">🎓</span>
            {!isCollapsed && (
              <div className="sidebar-brand-text">
                <div className="font-bold">Gestion ILC</div>
                <div className="text-xs text-muted">Heures d'enseignement</div>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          {menuSections.map((section) => (
            <div key={section.title} className="sidebar-section">
              {!isCollapsed && (
                <div className="sidebar-section-title">
                  <span>{section.title}</span>
                </div>
              )}
              
              {section.items.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleItemClick(item.id)}
                  className={`sidebar-item ${activeSection === item.id ? 'active' : ''}`}
                  title={isCollapsed ? item.label : ''}
                >
                  <i className={`${item.icon} sidebar-item-icon`}></i>
                  {!isCollapsed && (
                    <>
                      <span className="sidebar-item-text">{item.label}</span>
                      {item.badge !== null && item.badge > 0 && (
                        <span className="sidebar-item-badge">{item.badge}</span>
                      )}
                    </>
                  )}
                </button>
              ))}
            </div>
          ))}
        </nav>

        {/* Footer de la sidebar */}
        <div className="sidebar-footer">
          {/* Toggle sidebar */}
          <button
            onClick={toggleSidebar}
            className="btn btn-ghost w-full justify-start"
            title={isCollapsed ? 'Étendre le menu' : 'Réduire le menu'}
          >
            <i className={`bi ${isCollapsed ? 'bi-chevron-right' : 'bi-chevron-left'}`}></i>
            {!isCollapsed && <span>Réduire</span>}
          </button>

          {/* Toggle thème */}
          {!isCollapsed && (
            <div className="flex items-center justify-between mt-md">
              <span className="text-sm font-medium">Mode sombre</span>
              <button
                onClick={toggleTheme}
                className="theme-toggle"
                title={isDark ? 'Passer en mode clair' : 'Passer en mode sombre'}
              >
                <i className={`bi ${isDark ? 'bi-sun' : 'bi-moon'}`}></i>
              </button>
            </div>
          )}
          
          {isCollapsed && (
            <button
              onClick={toggleTheme}
              className="btn btn-ghost w-full justify-center"
              title={isDark ? 'Mode clair' : 'Mode sombre'}
            >
              <i className={`bi ${isDark ? 'bi-sun' : 'bi-moon'}`}></i>
            </button>
          )}
        </div>
      </aside>
    </>
  );
};

export default Sidebar;