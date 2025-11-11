// frontend/src/components/pages/Statistics.jsx
import React, { useState, useEffect } from 'react';
import api from '../../api'; // Chemin corrigé
import { LoadingSpinner } from '../ui/Loading';

export default function Statistics({ notify }) {
  const [teachers, setTeachers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const teachersRes = await api.get('/enseignants');
      setTeachers(teachersRes.data);

      const statsRes = await api.get('/stats');
      setStats(statsRes.data);
    } catch (err) {
      console.error(err);
      notify('Erreur lors du chargement des statistiques', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="text-center py-4xl">
        <LoadingSpinner size="lg" />
        <p className="mt-md text-secondary">Chargement des statistiques...</p>
      </div>
    );
  }

  return (
    <div className="space-y-xl">
      <div>
        <h1 className="text-3xl font-bold text-primary mb-sm">
          <i className="bi bi-bar-chart me-3"></i>
          Statistiques détaillées
        </h1>
        <p className="text-secondary">Analyses et métriques approfondies</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
        {/* Exemple cartes statistiques */}
        <div className="modern-card text-center py-4xl">
          <i className="bi bi-people text-6xl text-muted mb-lg block"></i>
          <h3 className="text-xl font-semibold text-primary mb-sm">
            Nombre d'enseignants
          </h3>
          <p className="text-secondary text-lg">{teachers.length}</p>
        </div>

        <div className="modern-card text-center py-4xl">
          <i className="bi bi-calendar2-week text-6xl text-muted mb-lg block"></i>
          <h3 className="text-xl font-semibold text-primary mb-sm">
            Nombre de cours
          </h3>
          <p className="text-secondary text-lg">{stats?.totalCours || 0}</p>
        </div>

        <div className="modern-card text-center py-4xl col-span-1 md:col-span-2">
          <i className="bi bi-bar-chart-line text-6xl text-muted mb-lg block"></i>
          <h3 className="text-xl font-semibold text-primary mb-sm">
            Analyses avancées
          </h3>
          <p className="text-secondary">
            Graphiques, tendances et analyses prédictives en cours de développement
          </p>
        </div>
      </div>
    </div>
  );
}
