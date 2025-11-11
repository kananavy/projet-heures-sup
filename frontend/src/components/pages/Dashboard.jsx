import React from 'react';
import StatsCard from '../StatsCard';
import QuickActions from '../ui/QuickActions';

const Dashboard = ({ teachers, stats, onQuickExport, notify, refreshAll }) => {
  
  const dashboardStats = [
    {
      title: 'Enseignants',
      value: stats.totalTeachers,
      subtitle: 'enseignants actifs',
      icon: '👨‍🏫',
      type: 'primary',
      trend: { type: 'right', value: '+0' }
    },
    {
      title: 'Heures normales',
      value: `${stats.totalHeuresNormales}h`,
      subtitle: 'heures dans le volume',
      icon: '✅',
      type: 'success'
    },
    {
      title: 'Heures supplémentaires',
      value: `${stats.totalHeuresSuppl}h`,
      subtitle: `${stats.teachersWithOvertime} enseignant(s)`,
      icon: stats.totalHeuresSuppl > 0 ? '⚠️' : '✅',
      type: stats.totalHeuresSuppl > 0 ? 'warning' : 'success',
      trend: stats.totalHeuresSuppl > 0 ? { type: 'up', value: `+${stats.totalHeuresSuppl}h` } : null
    },
    {
      title: 'Total cours',
      value: stats.totalCourses,
      subtitle: 'cours enregistrés',
      icon: '📚',
      type: 'primary'
    }
  ];

  const quickActions = [
    {
      title: 'Ajouter un enseignant',
      description: 'Créer un nouveau profil enseignant',
      icon: 'bi-person-plus',
      color: 'primary',
      action: () => notify.info('Fonctionnalité à venir')
    },
    {
      title: 'Planifier un cours',
      description: 'Ajouter un nouveau cours au planning',
      icon: 'bi-calendar-plus',
      color: 'success',
      action: () => notify.info('Fonctionnalité à venir')
    },
    {
      title: 'Importer Excel',
      description: 'Importer des données depuis un fichier',
      icon: 'bi-file-earmark-excel',
      color: 'warning',
      action: () => notify.info('Fonctionnalité à venir')
    },
    {
      title: 'Export rapide',
      description: 'Exporter toutes les données',
      icon: 'bi-download',
      color: 'info',
      action: () => onQuickExport('comprehensive')
    }
  ];

  const recentTeachers = teachers
    .slice(0, 5)
    .map(teacher => ({
      name: teacher.nom,
      mention: teacher.mention || 'Non spécifiée',
      heuresSuppl: teacher.heuresSupplementaires || 0,
      totalCours: teacher.cours?.length || 0
    }));

  const alertes = [
    ...(stats.teachersWithOvertime > 0 ? [{
      type: 'warning',
      title: 'Heures supplémentaires détectées',
      message: `${stats.teachersWithOvertime} enseignant(s) ont des heures supplémentaires`,
      action: 'Voir détails'
    }] : []),
    ...(stats.totalTeachers === 0 ? [{
      type: 'info',
      title: 'Aucun enseignant',
      message: 'Commencez par ajouter des enseignants à votre base de données',
      action: 'Ajouter'
    }] : [])
  ];

  return (
    <div className="space-y-xl">
      {/* En-tête avec actions rapides */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-lg">
        <div>
          <h1 className="text-3xl font-bold text-primary mb-sm">
            Tableau de bord
          </h1>
          <p className="text-secondary">
            Vue d'ensemble de la gestion des heures d'enseignement
          </p>
        </div>
        
        <div className="flex gap-md">
          <button
            onClick={refreshAll}
            className="btn btn-outline"
          >
            <i className="bi bi-arrow-clockwise"></i>
            Actualiser
          </button>
          <button
            onClick={() => onQuickExport('stats')}
            className="btn btn-primary"
          >
            <i className="bi bi-download"></i>
            Export rapide
          </button>
        </div>
      </div>

      {/* Alertes */}
      {alertes.length > 0 && (
        <div className="space-y-md">
          {alertes.map((alerte, index) => (
            <div
              key={index}
              className={`card border-l-4 ${
                alerte.type === 'warning' ? 'border-l-warning-500 bg-warning-50' :
                alerte.type === 'error' ? 'border-l-error-500 bg-error-50' :
                'border-l-primary-500 bg-primary-50'
              }`}
            >
              <div className="card-body flex items-center justify-between">
                <div className="flex items-center gap-md">
                  <i className={`bi ${
                    alerte.type === 'warning' ? 'bi-exclamation-triangle text-warning-600' :
                    alerte.type === 'error' ? 'bi-x-circle text-error-600' :
                    'bi-info-circle text-primary-600'
                  } text-xl`}></i>
                  <div>
                    <h4 className="font-semibold text-primary">
                      {alerte.title}
                    </h4>
                    <p className="text-secondary text-sm">
                      {alerte.message}
                    </p>
                  </div>
                </div>
                <button className="btn btn-sm btn-outline">
                  {alerte.action}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Statistiques principales */}
      <div className="stats-grid">
        {dashboardStats.map((stat, index) => (
          <StatsCard
            key={index}
            title={stat.title}
            value={stat.value}
            subtitle={stat.subtitle}
            icon={stat.icon}
            type={stat.type}
            trend={stat.trend}
          />
        ))}
      </div>

      {/* Actions rapides et aperçu */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-xl">
        {/* Actions rapides */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              <i className="bi bi-lightning-charge"></i>
              Actions rapides
            </h3>
          </div>
          <div className="card-body">
            <div className="grid grid-cols-1 gap-md">
              {quickActions.map((action, index) => (
                <button
                  key={index}
                  onClick={action.action}
                  className="flex items-center gap-md p-md rounded-lg border border-primary bg-secondary hover:bg-tertiary transition-all"
                >
                  <div className={`w-12 h-12 rounded-lg bg-${action.color}-100 flex items-center justify-center`}>
                    <i className={`${action.icon} text-xl text-${action.color}-600`}></i>
                  </div>
                  <div className="flex-1 text-left">
                    <h4 className="font-semibold text-primary">
                      {action.title}
                    </h4>
                    <p className="text-secondary text-sm">
                      {action.description}
                    </p>
                  </div>
                  <i className="bi bi-chevron-right text-muted"></i>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Aperçu enseignants récents */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              <i className="bi bi-people"></i>
              Enseignants récents
            </h3>
          </div>
          <div className="card-body">
            {recentTeachers.length > 0 ? (
              <div className="space-y-md">
                {recentTeachers.map((teacher, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-md rounded-lg bg-secondary"
                  >
                    <div className="flex items-center gap-md">
                      <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                        <span className="font-semibold text-primary-700">
                          {teacher.name.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <h4 className="font-medium text-primary">
                          {teacher.name}
                        </h4>
                        <p className="text-sm text-secondary">
                          {teacher.mention}
                        </p>
                      </div>
                    </div>
                    <div className="text-right text-sm">
                      <div className="text-primary font-medium">
                        {teacher.totalCours} cours
                      </div>
                      {teacher.heuresSuppl > 0 && (
                        <div className="text-warning-600">
                          +{teacher.heuresSuppl}h suppl.
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-lg">
                <div className="text-6xl mb-md">👨‍🏫</div>
                <p className="text-secondary">
                  Aucun enseignant enregistré
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Graphique de progression (placeholder) */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">
            <i className="bi bi-graph-up"></i>
            Évolution des heures d'enseignement
          </h3>
        </div>
        <div className="card-body">
          <div className="h-64 flex items-center justify-center bg-secondary rounded-lg">
            <div className="text-center">
              <i className="bi bi-bar-chart text-4xl text-muted mb-md block"></i>
              <p className="text-secondary">
                Graphique à venir - Évolution par mois
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;