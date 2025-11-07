import React, { useEffect, useState } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";

const API = "http://localhost:8080/api/enseignants";

function App() {
  const [enseignants, setEnseignants] = useState([]);
  const [nom, setNom] = useState("");
  const [selectedId, setSelectedId] = useState(null);
  const [cours, setCours] = useState({
    niveau: "",
    parcours: "",
    mention: "",
    jour: "",
    typeCours: "ET",
    heures: ""
  });

  // Charger enseignants
  const fetchEnseignants = async () => {
    const res = await axios.get(API);
    setEnseignants(res.data);
  };

  useEffect(() => {
    fetchEnseignants();
  }, []);

  // Ajouter enseignant
  const addEnseignant = async (e) => {
    e.preventDefault();
    await axios.post(API, { nom });
    setNom("");
    fetchEnseignants();
  };

  // Ajouter cours à un enseignant sélectionné
  const addCours = async (e) => {
    e.preventDefault();
    if (!selectedId) {
      alert("Veuillez sélectionner un enseignant !");
      return;
    }
    await axios.post(`${API}/${selectedId}/cours`, cours);
    setCours({ niveau: "", parcours: "", mention: "", jour: "", typeCours: "ET", heures: "" });
    fetchEnseignants();
  };

  // Calcul heures
  const calculHeures = async () => {
    await axios.get(`${API}/calcul`);
    fetchEnseignants();
  };

  return (
    <div className="container mt-4">
      <h2 className="text-center text-primary mb-4">🧮 Suivi des Heures Enseignées</h2>

      {/* FORMULAIRE AJOUT ENSEIGNANT */}
      <div className="card p-3 mb-4 shadow">
        <h5>Ajouter un enseignant</h5>
        <form onSubmit={addEnseignant} className="d-flex gap-2">
          <input
            type="text"
            className="form-control"
            placeholder="Nom de l'enseignant"
            value={nom}
            onChange={(e) => setNom(e.target.value)}
            required
          />
          <button className="btn btn-success">Ajouter</button>
        </form>
      </div>

      {/* FORMULAIRE AJOUT COURS */}
      <div className="card p-3 mb-4 shadow">
        <h5>Ajouter un cours</h5>
        <form onSubmit={addCours} className="row g-2">
          <div className="col-md-2">
            <select
              className="form-select"
              value={selectedId || ""}
              onChange={(e) => setSelectedId(e.target.value)}
              required
            >
              <option value="">Choisir enseignant</option>
              {enseignants.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.nom}
                </option>
              ))}
            </select>
          </div>

          <div className="col-md-2">
            <input
              type="text"
              className="form-control"
              placeholder="Niveau"
              value={cours.niveau}
              onChange={(e) => setCours({ ...cours, niveau: e.target.value })}
              required
            />
          </div>

          <div className="col-md-2">
            <input
              type="text"
              className="form-control"
              placeholder="Parcours"
              value={cours.parcours}
              onChange={(e) => setCours({ ...cours, parcours: e.target.value })}
              required
            />
          </div>

          <div className="col-md-2">
            <input
              type="text"
              className="form-control"
              placeholder="Mention"
              value={cours.mention}
              onChange={(e) => setCours({ ...cours, mention: e.target.value })}
            />
          </div>

          <div className="col-md-1">
            <input
              type="text"
              className="form-control"
              placeholder="Jour"
              value={cours.jour}
              onChange={(e) => setCours({ ...cours, jour: e.target.value })}
            />
          </div>

          <div className="col-md-1">
            <select
              className="form-select"
              value={cours.typeCours}
              onChange={(e) => setCours({ ...cours, typeCours: e.target.value })}
            >
              <option value="ET">ET</option>
              <option value="EP">EP</option>
            </select>
          </div>

          <div className="col-md-1">
            <input
              type="number"
              className="form-control"
              placeholder="Heures"
              value={cours.heures}
              onChange={(e) => setCours({ ...cours, heures: e.target.value })}
              required
            />
          </div>

          <div className="col-md-1 d-grid">
            <button className="btn btn-primary">+ Cours</button>
          </div>
        </form>
      </div>

      {/* TABLEAU DES ENSEIGNANTS */}
      <div className="card p-3 shadow">
        <div className="d-flex justify-content-between align-items-center mb-2">
          <h5>Liste des enseignants</h5>
          <button onClick={calculHeures} className="btn btn-outline-primary btn-sm">
            🔁 Calculer les heures
          </button>
        </div>
        <table className="table table-bordered table-hover text-center">
          <thead className="table-primary">
            <tr>
              <th>Nom</th>
              <th>Heures normales</th>
              <th>Supplémentaires</th>
              <th>Total</th>
              <th>Détails</th>
            </tr>
          </thead>
          <tbody>
            {enseignants.map((e) => (
              <tr key={e.id}>
                <td>{e.nom}</td>
                <td>{e.heuresNormales}</td>
                <td>{e.heuresSupplementaires}</td>
                <td>{e.totalHeures}</td>
                <td>
                  {e.Cours?.length > 0 ? (
                    <ul className="list-unstyled">
                      {e.Cours.map((c, i) => (
                        <li key={i}>
                          {c.jour} - {c.niveau} ({c.typeCours}) : {c.heures}h
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <em>Aucun cours</em>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default App;
