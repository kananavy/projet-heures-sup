// Fichier: src/components/Courses.jsx

import React, { useState, useEffect, useMemo } from 'react';
import api from "../../api";
import CourseForm from '../CourseForm';
import { LoadingSpinner } from '../ui/Loading';
import TeacherDetailModal from '../TeacherDetailModal';
import QuickExportButtons from '../ui/QuickExportButtons';
import Pagination from '../ui/Pagination';

export default function Courses({ notify }) {
  const [teachers, setTeachers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [filter, setFilter] = useState('');
  const [sortBy, setSortBy] = useState('dateCours');
  const [sortOrder, setSortOrder] = useState('desc');

  // Fetch teachers et courses
  const fetchData = async () => {
    setLoading(true);
    try {
      const teachersRes = await api.get('/enseignants');
      setTeachers(teachersRes.data);

      const coursesRes = await api.get('/cours');
      setCourses(coursesRes.data);
    } catch (err) {
      console.error(err);
      notify('Erreur lors du chargement des données', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRefresh = () => fetchData();
  const handleTeacherClick = (teacher) => setSelectedTeacher(teacher);

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  // Filtrage et tri
  const filteredCourses = useMemo(() => {
    let filtered = courses.filter(course =>
      (course.enseignant?.nom || '').toLowerCase().includes(filter.toLowerCase()) ||
      (course.typeCours || '').toLowerCase().includes(filter.toLowerCase()) ||
      (course.mention || '').toLowerCase().includes(filter.toLowerCase()) ||
      (course.parcours || '').toLowerCase().includes(filter.toLowerCase()) ||
      (course.ue || '').toLowerCase().includes(filter.toLowerCase()) ||
      (course.ec || '').toLowerCase().includes(filter.toLowerCase())
    );

    filtered.sort((a, b) => {
      let aValue = a[sortBy] ?? '';
      let bValue = b[sortBy] ?? '';

      if (sortBy === 'dateCours') {
        aValue = new Date(aValue) || new Date(0);
        bValue = new Date(bValue) || new Date(0);
      } else if (['duree'].includes(sortBy)) {
        aValue = parseFloat(aValue) || 0;
        bValue = parseFloat(bValue) || 0;
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [courses, filter, sortBy, sortOrder]);

  // Pagination
  const totalPages = Math.ceil(filteredCourses.length / itemsPerPage);
  const paginatedCourses = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredCourses.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredCourses, currentPage, itemsPerPage]);

  // Réinitialiser à la page 1 quand le filtre change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [filter, sortBy, sortOrder]);

  // Statistiques rapides pour l'affichage
  const getCoursesStats = () => {
    const today = new Date().toDateString();
    const thisWeek = courses.filter(course => {
      const courseDate = new Date(course.dateCours);
      const startOfWeek = new Date();
      startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
      return courseDate >= startOfWeek;
    });

    return {
      total: courses.length,
      today: courses.filter(course => new Date(course.dateCours).toDateString() === today).length,
      thisWeek: thisWeek.length,
      totalHours: courses.reduce((sum, course) => sum + (course.duree || 0), 0)
    };
  };

  const handleSort = (field) => {
    if (sortBy === field) setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    else { setSortBy(field); setSortOrder('asc'); }
  };

  const getSortIcon = (field) => {
    if (sortBy !== field) return 'bi-arrow-down-up';
    return sortOrder === 'asc' ? 'bi-arrow-up' : 'bi-arrow-down';
  };

  if (loading) {
    return (
      <div className="text-center py-4xl">
        <LoadingSpinner size="lg" />
        <p className="mt-md text-secondary">Chargement des enseignants et cours...</p>
      </div>
    );
  }

  const stats = getCoursesStats();

  return (
    <div className="space-y-xl">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-lg">
        <div>
          <h1 className="text-3xl font-bold text-primary mb-sm">
            <i className="bi bi-calendar-event me-3"></i>
            Gestion des cours
          </h1>
          <p className="text-secondary">Planifier et organiser les cours</p>
        </div>
        <div className="flex gap-md">
          <QuickExportButtons 
            data={filteredCourses}
            type="courses"
            notify={notify}
            size="md"
          />
          
          <button
            className="btn btn-primary"
            onClick={() => setShowForm(!showForm)}
          >
            <i className="bi bi-plus-circle"></i> Nouveau cours
          </button>
        </div>
      </div>

      {/* Dashboard avec statistiques */}
      {courses.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-lg">
          <div className="col-span-1 md:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-md">
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-600 font-medium">Total cours</p>
                  <p className="text-2xl font-bold text-blue-700">{stats.total}</p>
                </div>
                <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                  <i className="bi bi-calendar-check text-white text-xl"></i>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-green-50 to-green-100 border border-green-200 rounded-lg p-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-600 font-medium">Cette semaine</p>
                  <p className="text-2xl font-bold text-green-700">{stats.thisWeek}</p>
                </div>
                <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
                  <i className="bi bi-calendar-week text-white text-xl"></i>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-purple-50 to-purple-100 border border-purple-200 rounded-lg p-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-purple-600 font-medium">Total heures</p>
                  <p className="text-2xl font-bold text-purple-700">{stats.totalHours}h</p>
                </div>
                <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center">
                  <i className="bi bi-clock text-white text-xl"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Formulaire toggle */}
      {showForm && (
        <CourseForm
          teachers={teachers}
          onSaved={handleRefresh}
          addNotification={notify}
        />
      )}

      {/* Liste des cours */}
      <div className="modern-card">
        <div className="modern-card-header">
          <div className="flex items-center justify-between flex-wrap gap-md">
            <h4 className="modern-card-title">
              <i className="bi bi-calendar-week"></i> Liste des cours ({filteredCourses.length})
            </h4>
            
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
                <option value="dateCours-desc">Date décroissante</option>
                <option value="dateCours-asc">Date croissante</option>
                <option value="duree-desc">Durée décroissante</option>
                <option value="typeCours-asc">Type A→Z</option>
              </select>

              {courses.length > 0 && (
                <QuickExportButtons 
                  data={filteredCourses}
                  type="courses"
                  notify={notify}
                  size="sm"
                />
              )}
            </div>
          </div>
        </div>
        <div className="modern-card-body overflow-x-auto">
          {courses.length === 0 ? (
            <div className="text-center py-4xl">
              <div className="text-6xl mb-lg">📅</div>
              <h4 className="text-xl font-semibold text-primary mb-sm">
                Aucun cours enregistré
              </h4>
              <p className="text-secondary">Commencez par ajouter un cours ci-dessus</p>
            </div>
          ) : filteredCourses.length === 0 ? (
            <div className="text-center py-4xl">
              <div className="text-6xl mb-lg">🔍</div>
              <h4 className="text-xl font-semibold text-primary mb-sm">Aucun résultat</h4>
              <p className="text-secondary">Aucun cours ne correspond à votre recherche</p>
              <button onClick={() => setFilter('')} className="btn btn-outline btn-sm mt-md">Effacer la recherche</button>
            </div>
          ) : (
            <>
              <table className="table table-striped w-full">
                <thead>
                  <tr>
                    <th onClick={() => handleSort('enseignant')} className="cursor-pointer">
                      Enseignant <i className={`bi ${getSortIcon('enseignant')} text-xs`}></i>
                    </th>
                    <th>Type</th>
                    <th onClick={() => handleSort('dateCours')} className="cursor-pointer">
                      Date <i className={`bi ${getSortIcon('dateCours')} text-xs`}></i>
                    </th>
                    <th>Début</th>
                    <th>Fin</th>
                    <th onClick={() => handleSort('duree')} className="cursor-pointer">
                      Durée <i className={`bi ${getSortIcon('duree')} text-xs`}></i>
                    </th>
                    <th>Mention</th>
                    <th>Parcours</th>
                    <th>Niveau</th>
                    <th>UE</th>
                    <th>EC</th>
                    <th className="text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedCourses.map((c) => (
                    <tr key={c.id}>
                      <td className="cursor-pointer hover:text-primary" onClick={() => handleTeacherClick(c.enseignant)}>
                        {c.enseignant?.nom || '-'}
                      </td>
                      <td>{c.typeCours}</td>
                      <td>{formatDate(c.dateCours)}</td>
                      <td>{c.heureDebut || '-'}</td>
                      <td>{c.heureFin || '-'}</td>
                      <td>{c.duree}h</td>
                      <td>{c.mention || '-'}</td>
                      <td>{c.parcours || '-'}</td>
                      <td>{c.niveau || '-'}</td>
                      <td>{c.ue || '-'}</td>
                      <td>{c.ec || '-'}</td>
                      <td className="text-center">
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={async () => {
                            if (confirm('Supprimer ce cours ?')) {
                              try {
                                await api.delete(`/cours/${c.id}`);
                                notify('Cours supprimé', 'success');
                                handleRefresh();
                              } catch (err) {
                                notify('Erreur suppression cours', 'error');
                              }
                            }
                          }}
                        >
                          <i className="bi bi-trash"></i>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                itemsPerPage={itemsPerPage}
                onItemsPerPageChange={setItemsPerPage}
                totalItems={filteredCourses.length}
              />
            </>
          )}
        </div>
      </div>

      {/* Modal détail enseignant */}
      {selectedTeacher && (
        <TeacherDetailModal
          teacher={selectedTeacher}
          onClose={() => setSelectedTeacher(null)}
          onRefresh={handleRefresh}
          addNotification={notify}
        />
      )}
    </div>
  );
}