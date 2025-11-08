import React from "react";
import axios from "axios";

export default function TeacherList({ teachers, onSelect, onRefresh, apiBase }) {
  const deleteTeacher = async (id) => {
    if (!confirm("Supprimer cet enseignant et tous ses cours ?")) return;
    try {
      await axios.delete(`${apiBase}/enseignants/${id}`);
      if (onRefresh) onRefresh();
      alert("Enseignant supprimé avec succès");
    } catch (err) {
      console.error(err);
      alert("Erreur lors de la suppression");
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="m-0">Liste des Enseignants ({teachers.length})</h5>
        <button className="btn btn-outline-secondary btn-sm" onClick={() => onRefresh && onRefresh()}>
          <i className="bi bi-arrow-clockwise me-1"></i>
          Actualiser
        </button>
      </div>

      <div className="table-responsive">
        <table className="table table-hover align-middle">
          <thead className="table-dark">
            <tr>
              <th>Nom</th>
              <th>Mention</th>
              <th>Parcours</th>
              <th>Niveau</th>
              <th>Volume</th>
              <th>Normales</th>
              <th>Suppl.</th>
              <th>#Cours</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {teachers.map(t => (
              <tr key={t.id} className={t.heuresSupplementaires > 0 ? "table-warning" : ""}>
                <td>
                  <strong>{t.nom}</strong>
                  {t.contextes && t.contextes.length > 1 && (
                    <span className="badge bg-info ms-1" title="Multi-contextes">
                      {t.contextes.length}
                    </span>
                  )}
                </td>
                <td>{t.mention || "-"}</td>
                <td>{t.parcours || "-"}</td>
                <td>{t.niveau || "-"}</td>
                <td><strong>{t.volumeHoraire}h</strong></td>
                <td>{t.heuresNormales}h</td>
                <td>
                  {t.heuresSupplementaires > 0 ? (
                    <span className="badge bg-warning text-dark">{t.heuresSupplementaires}h</span>
                  ) : (
                    <span className="badge bg-success">0h</span>
                  )}
                </td>
                <td>
                  <span className="badge bg-secondary">{t.cours?.length || 0}</span>
                </td>
                <td>
                  <div className="btn-group btn-group-sm">
                    <button 
                      className="btn btn-outline-primary" 
                      onClick={() => onSelect(t)}
                      title="Voir les détails"
                    >
                      <i className="bi bi-eye"></i>
                    </button>
                    <button 
                      className="btn btn-outline-danger" 
                      onClick={() => deleteTeacher(t.id)}
                      title="Supprimer"
                    >
                      <i className="bi bi-trash"></i>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {teachers.length === 0 && (
              <tr>
                <td colSpan="9" className="text-center text-muted py-4">
                  <i className="bi bi-person-x fs-1 d-block mb-2"></i>
                  Aucun enseignant trouvé
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}