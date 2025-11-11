import React, { useState } from 'react';
import api from '../config/api';
import { LoadingSpinner } from './ui/Loading';

export default function TeacherList({ teachers, onSelect, onRefresh, addNotification }) {
  const [deleting, setDeleting] = useState(null);
  const [filter, setFilter] = useState('');
  const [sortBy, setSortBy] = useState('nom');
  const [sortOrder, setSortOrder] = useState('asc');

  const deleteTeacher = async (teacher) => {
    if (!confirm(`Supprimer l'enseignant "${teacher.nom}" et tous ses cours ?`)) {
      return;
    }

    setDeleting(teacher.id);
    try {
      await api.delete(`/enseignants/${teacher.id}`);
      if (onRefresh) onRefresh();
      addNotification(`Enseignant "${teacher.nom}" supprimé avec succès`, 'success');
    } catch (err) {
      console.error('Erreur suppression:', err);
      addNotification(
        err.response?.data?.message || 'Erreur lors de la suppression', 
        'error'
      );
    } finally {
      setDeleting(null);
    }
  };

  // Filtrage et tri
  const filteredTeachers = React.useMemo(() => {
    let filtered = teachers.filter(teacher => 
      teacher.nom.toLowerCase().includes(filter.toLowerCase()) ||
      (teacher.mention || '').toLowerCase().includes(filter.toLowerCase()) ||
      (teacher.parcours || '').toLowerCase().includes(filter.toLowerCase())
    );

    // Tri
    filtered.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];

      // Gestion des valeurs nulles
      if (aValue == null) aValue = '';
      if (bValue == null) bValue = '';

      // Tri numérique pour certains champs
      if (['volumeHoraire', 'heuresNormales', 'heuresSupplementaires'].includes(sortBy)) {
        aValue = parseFloat(aValue) || 0;
        bValue = parseFloat(bValue) || 0;
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [teachers, filter, sortBy, sortOrder]);

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const getSortIcon = (field) => {
    if (sortBy !== field) return 'bi-arrow-down-up';
    return sortOrder === 'asc' ? 'bi-arrow-up' : 'bi-arrow-down';
  };

  const getBadgeType = (heuresSuppl) => {
    if (heuresSuppl > 10) return 'error';
    if (heuresSuppl > 0) return 'warning';
    return 'success';
  };

  return (
    <div className="modern-card">
      <div className="modern-card-header">
        <div className="flex items-center justify-between">
          <h3 className="modern-card-title">
            <i className="bi bi-people"></i>
            Liste des enseignants ({filteredTeachers.length})
          </h3>
          <button
            onClick={() => onRefresh && onRefresh()}
            className="btn btn-outline btn-sm"
            disabled={deleting}
          >
            <i className="bi bi-arrow-clockwise"></i>
            Actualiser
          </button>
        </div>
      </div>

      <div className="modern-card-body">
        {/* Barre de recherche et tri */}
        <div className="flex gap-md mb-lg">
          <div className="flex-1">
            <input
              type="text"
              className="form-input"
              placeholder="Rechercher par nom, mention ou parcours..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            />
          </div>
          <div>
            <select
              className="form-select"
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [field, order] = e.target.value.split('-');
                setSortBy(field);
                setSortOrder(order);
              }}
            >
              <option value="nom-asc">Nom A→Z</option>
              <option value="nom-desc">Nom Z→A</option>
              <option value="volumeHoraire-desc">Volume décroissant</option>
              <option value="heuresSupplementaires-desc">Plus d'heures suppl.</option>
              <option value="mention-asc">Mention A→Z</option>
            </select>
          </div>
        </div>

        {/* Table des enseignants */}
        {filteredTeachers.length > 0 ? (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th 
                    onClick={() => handleSort('nom')}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="flex items-center gap-sm">
                      Nom
                      <i className={`bi ${getSortIcon('nom')} text-xs`}></i>
                    </div>
                  </th>
                  <th 
                    onClick={() => handleSort('mention')}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="flex items-center gap-sm">
                      Mention
                      <i className={`bi ${getSortIcon('mention')} text-xs`}></i>
                    </div>
                  </th>
                  <th>Parcours</th>
                  <th>Niveau</th>
                  <th 
                    onClick={() => handleSort('volumeHoraire')}
                    style={{ cursor: 'pointer' }}
                    className="text-center"
                  >
                    <div className="flex items-center justify-center gap-sm">
                      Volume
                      <i className={`bi ${getSortIcon('volumeHoraire')} text-xs`}></i>
                    </div>
                  </th>
                  <th className="text-center">Normales</th>
                  <th className="text-center">Suppl.</th>
                  <th className="text-center">Cours</th>
                  <th className="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTeachers.map(teacher => (
                  <tr 
                    key={teacher.id}
                    className={teacher.heuresSupplementaires > 0 ? 'bg-warning-50' : ''}
                  >
                    <td>
                      <div className="font-semibold">{teacher.nom}</div>
                      {teacher.contextes && teacher.contextes.length > 1 && (
                        <span className="badge badge-primary text-xs mt-xs">
                          {teacher.contextes.length} contextes
                        </span>
                      )}
                    </td>
                    <td>
                      <span className="text-gray-700">
                        {teacher.mention || '-'}
                      </span>
                    </td>
                    <td>
                      <span className="text-gray-700">
                        {teacher.parcours || '-'}
                      </span>
                    </td>
                    <td>
                      <span className="text-gray-700">
                        {teacher.niveau || '-'}
                      </span>
                    </td>
                    <td className="text-center">
                      <span className="font-bold text-primary">
                        {teacher.volumeHoraire || 0}h
                      </span>
                    </td>
                    <td className="text-center">
                      <span className="text-success font-medium">
                        {teacher.heuresNormales || 0}h
                      </span>
                    </td>
                    <td className="text-center">
                      <span 
                        className={`badge ${
                          teacher.heuresSupplementaires > 10 ? 'badge-error' :
                          teacher.heuresSupplementaires > 0 ? 'badge-warning' : 'badge-success'
                        }`}
                      >
                        {teacher.heuresSupplementaires || 0}h
                      </span>
                    </td>
                    <td className="text-center">
                      <span className="badge badge-gray">
                        {teacher.cours?.length || 0}
                      </span>
                    </td>
                    <td className="text-center">
                      <div className="flex items-center justify-center gap-xs">
                        <button
                          onClick={() => onSelect(teacher)}
                          className="btn btn-ghost btn-sm"
                          title="Voir les détails"
                        >
                          <i className="bi bi-eye"></i>
                        </button>
                        <button
                          onClick={() => deleteTeacher(teacher)}
                          className="btn btn-ghost btn-sm text-error"
                          title="Supprimer"
                          disabled={deleting === teacher.id}
                        >
                          {deleting === teacher.id ? (
                            <LoadingSpinner size="sm" />
                          ) : (
                            <i className="bi bi-trash"></i>
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-3xl">
            <div className="text-6xl mb-lg">👨‍🏫</div>
            <h4 className="text-lg font-semibold text-gray-700 mb-sm">
              {filter ? 'Aucun résultat' : 'Aucun enseignant'}
            </h4>
            <p className="text-gray-500">
              {filter 
                ? `Aucun enseignant ne correspond à "${filter}"`
                : 'Commencez par ajouter des enseignants'
              }
            </p>
            {filter && (
              <button
                onClick={() => setFilter('')}
                className="btn btn-outline btn-sm mt-md"
              >
                Effacer la recherche
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}