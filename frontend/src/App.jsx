import React, { useEffect, useState } from "react";
import axios from "axios";

const API = "http://localhost:8080/api/enseignants";

function App() {
  const [enseignants, setEnseignants] = useState([]);
  const [nom, setNom] = useState("");
  const [totalHeures, setTotalHeures] = useState(24);
  const [selectedId, setSelectedId] = useState(null);
  const [cours, setCours] = useState({
    niveau: "",
    parcours: "",
    mention: "",
    jour: "",
    typeCours: "ET",
    heures: ""
  });
  const [modalEnseignant, setModalEnseignant] = useState(null);

  // Charger tous les enseignants
  const fetchEnseignants = async () => {
    try {
      const res = await axios.get(API);
      setEnseignants(res.data);
    } catch (err) {
      console.error(err);
      alert("Erreur connexion backend");
    }
  };

  useEffect(() => { fetchEnseignants(); }, []);

  // Ajouter un enseignant
  const addEnseignant = async (e) => {
    e.preventDefault();
    await axios.post(API, { nom, totalHeures: parseFloat(totalHeures) });
    setNom(""); setTotalHeures(24);
    fetchEnseignants();
  };

  // Supprimer un enseignant
  const deleteEnseignant = async (id) => {
    if (!window.confirm("Supprimer cet enseignant ?")) return;
    await axios.delete(`${API}/${id}`);
    fetchEnseignants();
  };

  // Ajouter un cours à un enseignant
  const addCours = async (e) => {
    e.preventDefault();
    if (!selectedId) return alert("Sélectionnez un enseignant");
    if (!cours.heures || !cours.niveau || !cours.parcours || !cours.jour) return alert("Remplissez tous les champs !");
    await axios.post(`${API}/${selectedId}/cours`, { ...cours, heures: parseFloat(cours.heures) });
    setCours({ niveau: "", parcours: "", mention: "", jour: "", typeCours: "ET", heures: "" });
    fetchEnseignants();
  };

  // Modal enseignant
  const openModal = (enseignant) => setModalEnseignant(enseignant);
  const closeModal = () => setModalEnseignant(null);

  return (
    <div className="container mt-4">
      <h2 className="text-center text-primary mb-4">🧮 Suivi des Heures Enseignées</h2>

      {/* Ajouter Enseignant */}
      <div className="card p-3 mb-4 shadow">
        <h5>Ajouter un enseignant</h5>
        <form onSubmit={addEnseignant} className="d-flex gap-2 flex-wrap">
          <input className="form-control" placeholder="Nom" value={nom} onChange={e => setNom(e.target.value)} required/>
          <input type="number" className="form-control" placeholder="Heures normales prévues" value={totalHeures} onChange={e => setTotalHeures(e.target.value)} required/>
          <button className="btn btn-success">Ajouter</button>
        </form>
      </div>

      {/* Ajouter Cours */}
      <div className="card p-3 mb-4 shadow">
        <h5>Ajouter un cours</h5>
        <form onSubmit={addCours} className="row g-2">
          <div className="col-md-2">
            <select className="form-select" value={selectedId || ""} onChange={e => setSelectedId(e.target.value)} required>
              <option value="">Choisir enseignant</option>
              {enseignants.map(e => <option key={e.id} value={e.id}>{e.nom}</option>)}
            </select>
          </div>
          <div className="col-md-2"><input className="form-control" placeholder="Niveau" value={cours.niveau} onChange={e => setCours({...cours, niveau:e.target.value})} required/></div>
          <div className="col-md-2"><input className="form-control" placeholder="Parcours" value={cours.parcours} onChange={e => setCours({...cours, parcours:e.target.value})} required/></div>
          <div className="col-md-2"><input className="form-control" placeholder="Mention" value={cours.mention} onChange={e => setCours({...cours, mention:e.target.value})}/></div>
          <div className="col-md-1"><input className="form-control" placeholder="Jour" value={cours.jour} onChange={e => setCours({...cours, jour:e.target.value})} required/></div>
          <div className="col-md-1">
            <select className="form-select" value={cours.typeCours} onChange={e => setCours({...cours, typeCours:e.target.value})}>
              <option value="ET">ET</option>
              <option value="EP">EP</option>
            </select>
          </div>
          <div className="col-md-1"><input type="number" className="form-control" placeholder="Heures" value={cours.heures} onChange={e => setCours({...cours, heures:e.target.value})} required/></div>
          <div className="col-md-1 d-grid"><button className="btn btn-primary">+ Cours</button></div>
        </form>
      </div>

      {/* Tableau enseignants */}
      <div className="card p-3 shadow">
        <h5>Liste des enseignants</h5>
        <table className="table table-bordered table-hover text-center">
          <thead className="table-primary">
            <tr>
              <th>Nom</th><th>Heures normales</th><th>Supplémentaires</th><th>Total prévues</th><th>Détails</th><th>Action</th>
            </tr>
          </thead>
          <tbody>
            {enseignants.map(e => (
              <tr key={e.id}>
                <td>{e.nom}</td>
                <td>{e.heuresNormales}</td>
                <td>{e.heuresSupplementaires}</td>
                <td>{e.totalHeures}</td>
                <td>
                  <button className="btn btn-info btn-sm" onClick={() => openModal(e)}>Détails</button>
                </td>
                <td>
                  <button className="btn btn-danger btn-sm" onClick={()=>deleteEnseignant(e.id)}>Supprimer</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal Détails Enseignant */}
      {modalEnseignant && (
        <div className="modal show d-block" tabIndex="-1">
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Cours de {modalEnseignant.nom}</h5>
                <button type="button" className="btn-close" onClick={closeModal}></button>
              </div>
              <div className="modal-body">
                <p><strong>Heures normales :</strong> {modalEnseignant.heuresNormales}h</p>
                <p><strong>Heures supplémentaires :</strong> {modalEnseignant.heuresSupplementaires}h</p>
                <table className="table table-bordered">
                  <thead>
                    <tr>
                      <th>Jour</th><th>Niveau</th><th>Parcours</th><th>Mention</th><th>Type</th><th>Heures</th>
                    </tr>
                  </thead>
                  <tbody>
                    {modalEnseignant.Cours?.length > 0 ? modalEnseignant.Cours.map((c,i)=>(
                      <tr key={i}>
                        <td>{c.jour}</td>
                        <td>{c.niveau}</td>
                        <td>{c.parcours}</td>
                        <td>{c.mention}</td>
                        <td>{c.typeCours}</td>
                        <td>{c.heures}</td>
                      </tr>
                    )) : <tr><td colSpan="6"><em>Aucun cours</em></td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default App;
