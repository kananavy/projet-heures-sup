import React, { useState, useEffect } from "react";
import axios from "axios";

export default function TeacherDetailModal({ teacher, onClose, onRefresh, apiBase }) {
  const [data, setData] = useState(null);
  const [coursDetails, setCoursDetails] = useState([]);

  // Récupère l'enseignant avec ses cours via la NOUVELLE API
  const fetchTeacherData = async () => {
    try {
      // Récupérer les infos de base de l'enseignant
      const teacherRes = await axios.get(`${apiBase}/enseignants/${teacher.id}`);
      console.log("Données enseignant:", teacherRes.data);
      
      // Récupérer les cours détaillés via la NOUVELLE API cours
      const coursRes = await axios.get(`${apiBase}/cours/enseignant/${teacher.id}`);
      console.log("Données cours détaillées:", coursRes.data);
      
      setData(teacherRes.data);
      setCoursDetails(coursRes.data);
    } catch (err) {
      console.error("Erreur récupération données:", err);
      alert("Erreur récupération données");
    }
  };

  useEffect(() => {
    if (teacher?.id) fetchTeacherData();
  }, [teacher]);

  const deleteCourse = async (id) => {
    if (!confirm("Supprimer ce cours ?")) return;
    try {
      // Utiliser la NOUVELLE API pour supprimer
      await axios.delete(`${apiBase}/cours/${id}`);
      await fetchTeacherData(); // recharge les données après suppression
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error(err);
      alert("Erreur suppression cours");
    }
  };

  if (!data) return (
    <div className="modal show d-block" tabIndex="-1">
      <div className="modal-dialog modal-xl">
        <div className="modal-content">
          <div className="modal-body text-center">
            <div className="spinner-border" role="status">
              <span className="visually-hidden">Chargement...</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="modal show d-block" tabIndex="-1">
      <div className="modal-dialog modal-xl">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Détails — {data.nom}</h5>
            <button className="btn-close" onClick={onClose}></button>
          </div>
          <div className="modal-body">
            {/* Résumé des heures */}
            <div className="row mb-4">
              <div className="col-md-4">
                <div className="card bg-light">
                  <div className="card-body text-center">
                    <h6 className="card-title">Volume prévu</h6>
                    <p className="card-text h4">{data.volumeHoraire}h</p>
                  </div>
                </div>
              </div>
              <div className="col-md-4">
                <div className="card bg-success text-white">
                  <div className="card-body text-center">
                    <h6 className="card-title">Heures normales</h6>
                    <p className="card-text h4">{data.heuresNormales}h</p>
                  </div>
                </div>
              </div>
              <div className="col-md-4">
                <div className="card bg-warning">
                  <div className="card-body text-center">
                    <h6 className="card-title">Heures supplémentaires</h6>
                    <p className="card-text h4">{data.heuresSupplementaires}h</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Liste des cours avec NOUVELLES données */}
            <h6>Liste des cours ({coursDetails.length || 0}) :</h6>
            <div className="table-responsive">
              <table className="table table-sm table-striped">
                <thead className="table-dark">
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
                    <th>Durée</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {coursDetails.length ? coursDetails.map(c => (
                    <tr key={c.id}>
                      <td>
                        <span className={`badge ${
                          c.typeCours === 'Normales' ? 'bg-primary' : 
                          c.typeCours === 'Suppl' ? 'bg-warning' : 
                          c.typeCours === 'Cours' ? 'bg-success' : 'bg-secondary'
                        }`}>
                          {c.typeCours || "Non spécifié"}
                        </span>
                      </td>
                      <td>{c.dateCours || "-"}</td>
                      <td>{c.heureDebut || "-"}</td>
                      <td>{c.heureFin || "-"}</td>
                      <td>{c.mention || "-"}</td>
                      <td>{c.parcours || "-"}</td>
                      <td>{c.niveau || "-"}</td>
                      <td>{c.ue || "-"}</td>
                      <td>{c.ec || "-"}</td>
                      <td><strong>{c.duree}h</strong></td>
                      <td>
                        <button 
                          className="btn btn-sm btn-outline-danger" 
                          onClick={() => deleteCourse(c.id)}
                          title="Supprimer ce cours"
                        >
                          <i className="bi bi-trash"></i>
                        </button>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan="11" className="text-center text-muted py-3">
                        Aucun cours enregistré pour cet enseignant
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={onClose}>Fermer</button>
          </div>
        </div>
      </div>
    </div>
  );
}