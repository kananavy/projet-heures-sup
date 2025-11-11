// Fichier: src/components/Teachers.jsx

import React, { useState, useMemo } from 'react';
import api from '../../config/api';
import TeacherDetailModal from "../TeacherDetailModal";
import QuickExportButtons from '../ui/QuickExportButtons';
import Pagination from '../ui/Pagination';

const Teachers = ({ teachers, refreshTeachers, notify }) => {
  const [showForm, setShowForm] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('');
  const [sortBy, setSortBy] = useState('nom');
  const [sortOrder, setSortOrder] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [form, setForm] = useState({
    nom: '',
    mention: '',
    parcours: '',
    niveau: '',
    ue: '',
    ec: '',
    volumeHoraire: 24
  });

  // Filtrage et tri
  const filteredTeachers = useMemo(() => {
    let filtered = teachers.filter(teacher =>
      teacher.nom.toLowerCase().includes(filter.toLowerCase()) ||
      (teacher.mention || '').toLowerCase().includes(filter.toLowerCase()) ||
      (teacher.parcours || '').toLowerCase().includes(filter.toLowerCase())
    );

    filtered.sort((a, b) => {
      let aValue = a[sortBy] ?? '';
      let bValue = b[sortBy] ?? '';

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

  // Pagination
  const totalPages = Math.ceil(filteredTeachers.length / itemsPerPage);
  const paginatedTeachers = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredTeachers.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredTeachers, currentPage, itemsPerPage]);

  // Réinitialiser à la page 1 quand le filtre change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [filter, sortBy, sortOrder]);

  // Ajouter un enseignant
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.nom.trim()) return notify.error('Le nom est requis');

    setLoading(true);
    try {
      await api.post('/enseignants', form);
      setForm({ nom: '', mention: '', parcours: '', niveau: '', ue: '', ec: '', volumeHoraire: 24 });
      await refreshTeachers();
      setShowForm(false);
      notify.success('Enseignant ajouté avec succès !');
    } catch (err) {
      console.error(err);
      notify.error(err.response?.data?.message || 'Erreur lors de l\'ajout');
    } finally {
      setLoading(false);
    }
  };

  // Supprimer un enseignant
  const deleteTeacher = async (teacher) => {
    if (!confirm(`Supprimer l'enseignant "${teacher.nom}" et tous ses cours ?`)) return;
    try {
      await api.delete(`/enseignants/${teacher.id}`);
      await refreshTeachers();
      notify.success(`Enseignant "${teacher.nom}" supprimé`);
    } catch (err) {
      console.error(err);
      notify.error(err.response?.data?.message || 'Erreur lors de la suppression');
    }
  };

  const handleSort = (field) => {
    if (sortBy === field) setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    else { setSortBy(field); setSortOrder('asc'); }
  };

  const getSortIcon = (field) => {
    if (sortBy !== field) return 'bi-arrow-down-up';
    return sortOrder === 'asc' ? 'bi-arrow-up' : 'bi-arrow-down';
  };

  return (
    <div className="space-y-xl">
      {/* En-tête */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-lg">
        <div>
          <h1 className="text-3xl font-bold text-primary mb-sm">
            <i className="bi bi-people me-3"></i> Gestion des enseignants
          </h1>
          <p className="text-secondary">
            Ajouter, modifier et gérer les enseignants et leurs informations
          </p>
        </div>
        <div className="flex gap-md">
          <button onClick={refreshTeachers} className="btn btn-outline">
            <i className="bi bi-arrow-clockwise"></i> Actualiser
          </button>
          
          <QuickExportButtons 
            data={filteredTeachers}
            type="teachers"
            notify={notify}
            size="md"
          />
          
          <button onClick={() => setShowForm(!showForm)} className="btn btn-primary">
            <i className="bi bi-person-plus"></i> Nouvel enseignant
          </button>
        </div>
      </div>

      {/* Formulaire d'ajout */}
      {showForm && (
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              <i className="bi bi-person-plus"></i> Ajouter un nouvel enseignant
            </h3>
          </div>
          <div className="card-body">
            <form onSubmit={handleSubmit} className="space-y-lg">
              <div className="form-group">
                <label className="form-label">Nom complet *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Nom et prénom"
                  value={form.nom}
                  onChange={(e) => setForm({ ...form, nom: e.target.value })}
                  disabled={loading}
                  required
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-lg">
                {['mention', 'parcours', 'niveau', 'ue', 'ec'].map(field => (
                  <div className="form-group" key={field}>
                    <label className="form-label">{field.charAt(0).toUpperCase() + field.slice(1)}</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder={field}
                      value={form[field]}
                      onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                      disabled={loading}
                    />
                  </div>
                ))}
                <div className="form-group">
                  <label className="form-label">Volume horaire</label>
                  <input
                    type="number"
                    className="form-input"
                    min="0"
                    step="0.5"
                    value={form.volumeHoraire}
                    onChange={(e) => setForm({ ...form, volumeHoraire: parseFloat(e.target.value) || 0 })}
                    disabled={loading}
                  />
                </div>
              </div>
              <div className="flex gap-md">
                <button type="submit" className="btn btn-primary" disabled={loading || !form.nom.trim()}>
                  {loading ? <>Ajout en cours...</> : <>Ajouter</>}
                </button>
                <button type="button" onClick={() => setShowForm(false)} className="btn btn-outline" disabled={loading}>
                  Annuler
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Liste enseignants */}
      <div className="card">
        <div className="card-header flex items-center justify-between">
          <h3 className="card-title">Liste des enseignants ({filteredTeachers.length})</h3>
          <div className="flex gap-md flex-wrap">
            <input
              type="text"
              className="form-input w-64"
              placeholder="Rechercher..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            />
            <select
              className="form-select w-48"
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
        <div className="card-body">
          {filteredTeachers.length > 0 ? (
            <>
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th onClick={() => handleSort('nom')} className="cursor-pointer">
                        Nom <i className={`bi ${getSortIcon('nom')} text-xs`}></i>
                      </th>
                      <th>Mention</th>
                      <th>Parcours</th>
                      <th>Niveau</th>
                      <th className="text-center">Volume</th>
                      <th className="text-center">Normales</th>
                      <th className="text-center">Suppl.</th>
                      <th className="text-center">Cours</th>
                      <th className="text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedTeachers.map(teacher => (
                      <tr key={teacher.id} className={teacher.heuresSupplementaires > 0 ? 'bg-warning-50' : ''}>
                        <td>{teacher.nom}</td>
                        <td>{teacher.mention || '-'}</td>
                        <td>{teacher.parcours || '-'}</td>
                        <td>{teacher.niveau || '-'}</td>
                        <td className="text-center">{teacher.volumeHoraire || 0}h</td>
                        <td className="text-center">{teacher.heuresNormales || 0}h</td>
                        <td className="text-center">{teacher.heuresSupplementaires || 0}h</td>
                        <td className="text-center">{teacher.cours?.length || 0}</td>
                        <td className="text-center flex justify-center gap-xs">
                          <button
                            onClick={() => setSelectedTeacher(teacher)}
                            className="btn btn-ghost btn-sm"
                            title="Voir les détails"
                          >
                            <i className="bi bi-eye"></i>
                          </button>
                          <button
                            onClick={() => deleteTeacher(teacher)}
                            className="btn btn-ghost btn-sm text-error-500"
                            title="Supprimer"
                          >
                            <i className="bi bi-trash"></i>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                itemsPerPage={itemsPerPage}
                onItemsPerPageChange={setItemsPerPage}
                totalItems={filteredTeachers.length}
              />
            </>
          ) : (
            <div className="text-center py-3xl">
              <div className="text-6xl mb-lg">👨‍🏫</div>
              <h4 className="text-lg font-semibold text-primary mb-sm">
                {filter ? 'Aucun résultat' : 'Aucun enseignant'}
              </h4>
              <p className="text-secondary">
                {filter ? `Aucun enseignant ne correspond à "${filter}"` : 'Commencez par ajouter des enseignants'}
              </p>
              {filter && <button onClick={() => setFilter('')} className="btn btn-outline btn-sm mt-md">Effacer la recherche</button>}
            </div>
          )}
        </div>
      </div>

      {/* Modal détails */}
      {selectedTeacher && (
        <TeacherDetailModal
          teacher={selectedTeacher}
          onClose={() => setSelectedTeacher(null)}
          onRefresh={refreshTeachers}
          addNotification={notify}
        />
      )}
    </div>
  );
};

export default Teachers;