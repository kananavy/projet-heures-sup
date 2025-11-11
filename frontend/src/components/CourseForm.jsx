import React, { useState } from 'react';
import api from '../config/api';
import { LoadingSpinner } from './ui/Loading';

export default function CourseForm({ teachers, onSaved, addNotification }) {
  const [form, setForm] = useState({
    typeCours: 'Normales',
    dateCours: '',
    heureDebut: '',
    heureFin: '',
    mention: '',
    parcours: '',
    niveau: '',
    ue: '',
    ec: '',
    enseignantId: '',
    duree: 0
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!form.enseignantId) {
      addNotification('Veuillez sélectionner un enseignant', 'error');
      return;
    }

    if (!form.dateCours) {
      addNotification('La date du cours est requise', 'error');
      return;
    }

    if (!form.duree || form.duree <= 0) {
      addNotification('La durée du cours doit être supérieure à 0', 'error');
      return;
    }

    setLoading(true);
    try {
      await api.post(`/enseignants/${form.enseignantId}/cours`, {
        typeCours: form.typeCours,
        dateCours: form.dateCours,
        heureDebut: form.heureDebut,
        heureFin: form.heureFin,
        mention: form.mention,
        parcours: form.parcours,
        niveau: form.niveau,
        ue: form.ue,
        ec: form.ec,
        duree: parseFloat(form.duree) || 0
      });
      
      // Reset form
      setForm({
        typeCours: 'Normales',
        dateCours: '',
        heureDebut: '',
        heureFin: '',
        mention: '',
        parcours: '',
        niveau: '',
        ue: '',
        ec: '',
        enseignantId: '',
        duree: 0
      });
      
      if (onSaved) onSaved();
      addNotification('Cours ajouté avec succès !', 'success');
      
    } catch (err) {
      console.error('Erreur ajout cours:', err);
      addNotification(
        err.response?.data?.message || 'Erreur lors de l\'ajout du cours', 
        'error'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const typeCoursOptions = [
    { value: 'Normales', label: 'Heures normales', icon: '⏰' },
    { value: 'Suppl', label: 'Heures supplémentaires', icon: '⚡' },
    { value: 'Cours', label: 'Cours magistral', icon: '👨‍🏫' },
    { value: 'TD', label: 'Travaux dirigés', icon: '📝' },
    { value: 'TP', label: 'Travaux pratiques', icon: '💻' }
  ];

  return (
    <div className="modern-card">
      <div className="modern-card-header">
        <h3 className="modern-card-title">
          <i className="bi bi-calendar-plus"></i>
          Ajouter un cours
        </h3>
      </div>
      
      <div className="modern-card-body">
        <form onSubmit={handleSubmit} className="space-y-lg">
          {/* Sélection enseignant */}
          <div className="form-group">
            <label className="form-label">
              Enseignant *
            </label>
            <select
              className="form-select"
              value={form.enseignantId}
              onChange={(e) => handleChange('enseignantId', e.target.value)}
              required
              disabled={loading}
            >
              <option value="">Choisir un enseignant</option>
              {teachers.map(teacher => (
                <option key={teacher.id} value={teacher.id}>
                  {teacher.nom}
                  {teacher.mention && ` - ${teacher.mention}`}
                </option>
              ))}
            </select>
          </div>

          {/* Type de cours et date */}
          <div className="form-grid form-grid-2">
            <div className="form-group">
              <label className="form-label">Type de cours</label>
              <select
                className="form-select"
                value={form.typeCours}
                onChange={(e) => handleChange('typeCours', e.target.value)}
                disabled={loading}
              >
                {typeCoursOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.icon} {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Date du cours *</label>
              <input
                type="date"
                className="form-input"
                value={form.dateCours}
                onChange={(e) => handleChange('dateCours', e.target.value)}
                required
                disabled={loading}
              />
            </div>
          </div>

          {/* Heures */}
          <div className="form-grid form-grid-3">
            <div className="form-group">
              <label className="form-label">Heure début</label>
              <input
                type="time"
                className="form-input"
                value={form.heureDebut}
                onChange={(e) => handleChange('heureDebut', e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Heure fin</label>
              <input
                type="time"
                className="form-input"
                value={form.heureFin}
                onChange={(e) => handleChange('heureFin', e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                Durée (heures) *
              </label>
              <input
                type="number"
                className="form-input"
                step="0.5"
                min="0"
                placeholder="ex: 2.0"
                value={form.duree}
                onChange={(e) => handleChange('duree', e.target.value)}
                required
                disabled={loading}
              />
            </div>
          </div>

          {/* Informations académiques */}
          <div className="form-grid form-grid-2">
            <div className="form-group">
              <label className="form-label">Mention</label>
              <input
                type="text"
                className="form-input"
                placeholder="ex: Informatique"
                value={form.mention}
                onChange={(e) => handleChange('mention', e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Parcours</label>
              <input
                type="text"
                className="form-input"
                placeholder="ex: Génie Logiciel"
                value={form.parcours}
                onChange={(e) => handleChange('parcours', e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          <div className="form-grid form-grid-3">
            <div className="form-group">
              <label className="form-label">Niveau</label>
              <input
                type="text"
                className="form-input"
                placeholder="ex: L3, M1, M2"
                value={form.niveau}
                onChange={(e) => handleChange('niveau', e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label className="form-label">UE</label>
              <input
                type="text"
                className="form-input"
                placeholder="Unité d'enseignement"
                value={form.ue}
                onChange={(e) => handleChange('ue', e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label className="form-label">EC</label>
              <input
                type="text"
                className="form-input"
                placeholder="Élément constitutif"
                value={form.ec}
                onChange={(e) => handleChange('ec', e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          {/* Bouton de soumission */}
          <button
            type="submit"
            className="btn btn-success w-full"
            disabled={loading || !form.enseignantId || !form.dateCours || !form.duree}
          >
            {loading ? (
              <>
                <LoadingSpinner size="sm" />
                Ajout en cours...
              </>
            ) : (
              <>
                <i className="bi bi-plus-circle"></i>
                Ajouter le cours
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}