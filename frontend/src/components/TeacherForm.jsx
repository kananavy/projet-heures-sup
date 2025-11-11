import React, { useState } from 'react';
import api from '../config/api';
import { LoadingSpinner } from './ui/Loading';

export default function TeacherForm({ onSaved, addNotification }) {
  const [form, setForm] = useState({
    nom: '',
    mention: '',
    parcours: '',
    niveau: '',
    ue: '',
    ec: '',
    volumeHoraire: 24
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!form.nom.trim()) {
      addNotification('Le nom de l\'enseignant est requis', 'error');
      return;
    }

    setLoading(true);
    try {
      await api.post('/enseignants', form);
      
      // Reset form
      setForm({
        nom: '',
        mention: '',
        parcours: '',
        niveau: '',
        ue: '',
        ec: '',
        volumeHoraire: 24
      });
      
      if (onSaved) onSaved();
      addNotification('Enseignant ajouté avec succès !', 'success');
      
    } catch (err) {
      console.error('Erreur ajout enseignant:', err);
      addNotification(
        err.response?.data?.message || 'Erreur lors de l\'ajout de l\'enseignant', 
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

  return (
    <div className="modern-card">
      <div className="modern-card-header">
        <h3 className="modern-card-title">
          <i className="bi bi-person-plus"></i>
          Nouvel enseignant
        </h3>
      </div>
      
      <div className="modern-card-body">
        <form onSubmit={handleSubmit} className="space-y-lg">
          {/* Nom complet */}
          <div className="form-group">
            <label className="form-label">
              Nom complet *
            </label>
            <input
              type="text"
              className="form-input"
              placeholder="Nom et prénom de l'enseignant"
              value={form.nom}
              onChange={(e) => handleChange('nom', e.target.value)}
              required
              disabled={loading}
            />
          </div>

          {/* Grille des champs académiques */}
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

          {/* Volume horaire */}
          <div className="form-group">
            <label className="form-label">
              Volume horaire prévu
              <span className="text-gray-500 font-normal ml-sm">(heures)</span>
            </label>
            <input
              type="number"
              className="form-input"
              min="0"
              step="0.5"
              value={form.volumeHoraire}
              onChange={(e) => handleChange('volumeHoraire', parseFloat(e.target.value) || 0)}
              disabled={loading}
            />
          </div>

          {/* Bouton de soumission */}
          <button
            type="submit"
            className="btn btn-primary w-full"
            disabled={loading || !form.nom.trim()}
          >
            {loading ? (
              <>
                <LoadingSpinner size="sm" />
                Ajout en cours...
              </>
            ) : (
              <>
                <i className="bi bi-plus-circle"></i>
                Ajouter l'enseignant
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}