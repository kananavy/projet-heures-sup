import React, { useState, useEffect } from 'react';
import api from '../config/api';
import Modal from './ui/Modal';
import Loading from './ui/Loading';
import StatsCard from './StatsCard';

export default function TeacherDetailModal({ teacher, onClose, onRefresh, addNotification }) {
  const [data, setData] = useState(null);
  const [coursDetails, setCoursDetails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);

  const fetchTeacherData = async () => {
    try {
      setLoading(true);
      
      // Récupérer les infos de base de l'enseignant
      const teacherRes = await api.get(`/enseignants/${teacher.id}`);
      console.log("Données enseignant:", teacherRes.data);
      
      // Récupérer les cours détaillés
      const coursRes = await api.get(`/cours/enseignant/${teacher.id}`);
      console.log("Données cours détaillées:", coursRes.data);
      
      setData(teacherRes.data);
      setCoursDetails(coursRes.data);
    } catch (err) {
      console.error("Erreur récupération données:", err);
      addNotification("Erreur lors de la récupération des données", 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (teacher?.id) {
      fetchTeacherData();
    }
  }, [teacher]);

  const deleteCourse = async (course) => {
    if (!confirm(`Supprimer le cours du ${course.dateCours} ?`)) {
      return;
    }

    setDeleting(course.id);
    try {
      await api.delete(`/cours/${course.id}`);
      await fetchTeacherData(); // Recharger les données
      if (onRefresh) onRefresh();
      addNotification('Cours supprimé avec succès', 'success');
    } catch (err) {
      console.error('Erreur suppression cours:', err);
      addNotification('Erreur lors de la suppression du cours', 'error');
    } finally {
      setDeleting(null);
    }
  };

  const getTypeBadgeClass = (type) => {
    switch (type) {
      case 'Normales':
        return 'badge-primary';
      case 'Suppl':
        return 'badge-warning';
      case 'Cours':
        return 'badge-success';
      case 'TD':
        return 'badge-primary';
      case 'TP':
        return 'badge-primary';
      default:
        return 'badge-gray';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <Modal isOpen={true} onClose={onClose} title="Chargement..." size="lg">
        <Loading text="Chargement des détails de l'enseignant..." />
      </Modal>
    );
  }

  if (!data) {
    return (
      <Modal isOpen={true} onClose={onClose} title="Erreur" size="md">
        <div className="text-center py-xl">
          <div className="text-4xl mb-lg">❌</div>
          <p className="text-gray-600">Impossible de charger les données de l'enseignant</p>
        </div>
      </Modal>
    );
  }

  const stats = [
    {
      title: "Volume prévu",
      value: `${data.volumeHoraire}h`,
      subtitle: "heures planifiées",
      icon: "📋",
      type: "primary"
    },
    {
      title: "Heures normales",
      value: `${data.heuresNormales || 0}h`,
      subtitle: "dans le volume",
      icon: "✅",
      type: "success"
    },
    {
      title: "Heures supplémentaires",
      value: `${data.heuresSupplementaires || 0}h`,
      subtitle: "au-delà du volume",
      icon: data.heuresSupplementaires > 0 ? "⚠️" : "✅",
      type: data.heuresSupplementaires > 0 ? "warning" : "success"
    },
    {
      title: "Total cours",
      value: coursDetails.length,
      subtitle: "cours enregistrés",
      icon: "📚",
      type: "primary"
    }
  ];

  return (
 <Modal 
  isOpen={true} 
  onClose={onClose} 
  title={`Détails — ${data.nom}`} 
  size="full" // occupe toute la largeur sur mobile, taille XL sur desktop
>
  <div className="space-y-lg md:space-y-xl">

    {/* Statistiques */}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <StatsCard
          key={index}
          title={stat.title}
          value={stat.value}
          subtitle={stat.subtitle}
          icon={stat.icon}
          type={stat.type}
          className="text-center"
        />
      ))}
    </div>

    {/* Informations académiques */}
    {(data.mention || data.parcours || data.niveau || data.ue || data.ec) && (
      <div className="modern-card">
        <div className="modern-card-header">
          <h4 className="modern-card-title">
            <i className="bi bi-info-circle"></i>
            Informations académiques
          </h4>
        </div>
        <div className="modern-card-body">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.mention && (
              <div>
                <label className="form-label text-xs">Mention</label>
                <p className="font-medium">{data.mention}</p>
              </div>
            )}
            {data.parcours && (
              <div>
                <label className="form-label text-xs">Parcours</label>
                <p className="font-medium">{data.parcours}</p>
              </div>
            )}
            {data.niveau && (
              <div>
                <label className="form-label text-xs">Niveau</label>
                <p className="font-medium">{data.niveau}</p>
              </div>
            )}
            {data.ue && (
              <div>
                <label className="form-label text-xs">UE</label>
                <p className="font-medium">{data.ue}</p>
              </div>
            )}
            {data.ec && (
              <div>
                <label className="form-label text-xs">EC</label>
                <p className="font-medium">{data.ec}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    )}

    {/* Liste des cours */}
    <div className="modern-card">
      <div className="modern-card-header">
        <h4 className="modern-card-title">
          <i className="bi bi-calendar-event"></i>
          Liste des cours ({coursDetails.length})
        </h4>
      </div>
      <div className="modern-card-body overflow-x-auto">
        {coursDetails.length > 0 ? (
          <table className="table table-striped w-full min-w-[600px]">
            <thead>
              <tr>
                <th>Type</th>
                <th>Date</th>
                <th>Début</th>
                <th>Fin</th>
                <th>Mention</th>
                <th>Parcours</th>
                <th>Niveau</th>
                <th>UE</th>
                <th>EC</th>
                <th className="text-center">Durée</th>
                <th className="text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {coursDetails.map(cours => (
                <tr key={cours.id}>
                  <td>
                    <span className={`badge ${getTypeBadgeClass(cours.typeCours)}`}>
                      {cours.typeCours || "Non spécifié"}
                    </span>
                  </td>
                  <td>{formatDate(cours.dateCours)}</td>
                  <td>{cours.heureDebut || '-'}</td>
                  <td>{cours.heureFin || '-'}</td>
                  <td>{cours.mention || '-'}</td>
                  <td>{cours.parcours || '-'}</td>
                  <td>{cours.niveau || '-'}</td>
                  <td>{cours.ue || '-'}</td>
                  <td>{cours.ec || '-'}</td>
                  <td className="text-center">{cours.duree}h</td>
                  <td className="text-center">
                    <button
                      onClick={() => deleteCourse(cours)}
                      className="btn btn-ghost btn-sm text-error"
                      disabled={deleting === cours.id}
                    >
                      {deleting === cours.id ? (
                        <div className="loading-spinner w-4 h-4"></div>
                      ) : (
                        <i className="bi bi-trash"></i>
                      )}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="text-center py-8">
            <div className="text-4xl mb-4">📅</div>
            <h5 className="font-semibold text-gray-700 mb-2">Aucun cours enregistré</h5>
            <p className="text-gray-500">Cet enseignant n'a pas encore de cours planifié</p>
          </div>
        )}
      </div>
    </div>

  </div>
</Modal>

  );
}