import React, { useState, useEffect } from "react";
import axios from "axios";

export default function TeacherDetailModal({ teacher, onClose, onRefresh, apiBase }) {
  const [data, setData] = useState(null);

  // Récupère l’enseignant avec ses cours et heures recalculées
  const fetchTeacher = async () => {
    try {
      const res = await axios.get(`${apiBase}/enseignants/${teacher.id}`);
      setData(res.data);
    } catch (err) {
      console.error(err);
      alert("Erreur récupération données");
    }
  };

  useEffect(() => {
    if (teacher?.id) fetchTeacher();
  }, [teacher]);

  const deleteCourse = async (id) => {
    if (!confirm("Supprimer ce cours ?")) return;
    try {
      await axios.delete(`${apiBase}/enseignants/cours/${id}`);
      await fetchTeacher(); // recharge les données après suppression
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error(err);
      alert("Erreur suppression cours");
    }
  };

  if (!data) return <div>Chargement...</div>;

  return (
    <div className="modal show d-block" tabIndex="-1">
      <div className="modal-dialog modal-xl">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Détails — {data.nom}</h5>
            <button className="btn-close" onClick={onClose}></button>
          </div>
          <div className="modal-body">
            <p>
              <strong>Volume prévu :</strong> {data.volumeHoraire}h —{" "}
              <strong>Normales :</strong> {data.heuresNormales}h —{" "}
              <strong>Suppl. :</strong> {data.heuresSupplementaires}h
            </p>
            <div className="table-responsive">
              <table className="table table-sm">
                <thead>
                  <tr>
                    <th>TYPE</th><th>Date</th><th>Début</th><th>Fin</th><th>Niveau</th>
                    <th>Parcours</th><th>UE</th><th>EC</th><th>Durée</th><th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {data.cours?.length ? data.cours.map(c => (
                    <tr key={c.id}>
                      <td>{c.typeCours}</td><td>{c.dateCours}</td><td>{c.heureDebut}</td><td>{c.heureFin}</td>
                      <td>{c.niveau}</td><td>{c.parcours}</td><td>{c.ue}</td><td>{c.ec}</td><td>{c.duree}</td>
                      <td>
                        <button className="btn btn-sm btn-danger" onClick={() => deleteCourse(c.id)}>
                          <i className="bi bi-trash"></i>
                        </button>
                      </td>
                    </tr>
                  )) : (
                    <tr><td colSpan="10" className="text-center text-muted">Aucun cours</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
          <div className="modal-footer"><button className="btn btn-secondary" onClick={onClose}>Fermer</button></div>
        </div>
      </div>
    </div>
  );
}
