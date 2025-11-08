import React from "react";
import axios from "axios";

export default function TeacherList({ teachers, onSelect, onRefresh, apiBase }) {
  const deleteTeacher = async (id) => {
    if (!confirm("Supprimer cet enseignant ?")) return;
    try {
      await axios.delete(`${apiBase}/enseignants/${id}`);
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error(err);
      alert("Erreur suppression");
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="m-0">Enseignants</h5>
        <button className="btn btn-outline-secondary btn-sm" onClick={() => onRefresh && onRefresh()}>Actualiser</button>
      </div>

      <div className="table-responsive">
        <table className="table table-hover align-middle">
          <thead>
            <tr>
              <th>Nom</th><th>Mention</th><th>Parcours</th><th>Niveau</th>
              <th>Volume</th><th>Normales</th><th>Suppl.</th><th>#Cours</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {teachers.map(t => (
              <tr key={t.id}>
                <td>{t.nom}</td>
                <td>{t.mention}</td>
                <td>{t.parcours}</td>
                <td>{t.niveau}</td>
                <td>{t.volumeHoraire}</td>
                <td>{t.heuresNormales}</td>
                <td>{t.heuresSupplementaires > 0 ? <span className="badge badge-sup">{t.heuresSupplementaires}</span> : <span className="badge badge-ok">0</span>}</td>
                <td>{t.cours?.length || 0}</td>
                <td>
                  <button className="btn btn-sm btn-info me-1" onClick={() => onSelect(t)}><i className="bi bi-eye"></i></button>
                  <button className="btn btn-sm btn-danger" onClick={() => deleteTeacher(t.id)}><i className="bi bi-trash"></i></button>
                </td>
              </tr>
            ))}
            {teachers.length === 0 && <tr><td colSpan="9" className="text-center text-muted">Aucun enseignant</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
