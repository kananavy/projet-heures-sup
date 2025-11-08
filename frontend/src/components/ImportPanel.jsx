import React, { useState } from "react";
import axios from "axios";
import MappingModal from "./MappingModal";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8080/api";

export default function ImportPanel({ onImported }) {
  const [mode, setMode] = useState("teachers");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [createMissing, setCreateMissing] = useState(true);
  const [importResult, setImportResult] = useState(null);

 const targetFieldsByMode = {
  teachers: [
    { key: "enseignantCol", label: "Enseignants (nom)" },
    { key: "mentionCol", label: "Mention" },
    { key: "parcoursCol", label: "Parcours" },
    { key: "niveauCol", label: "Niveau" },
    { key: "ueCol", label: "UE" },
    { key: "ecCol", label: "EC" },
    { key: "volumeCol", label: "Volume oraire" }
  ],
  courses: [
    { key: "typeCol", label: "TYPE" },
    { key: "dateCol", label: "Date (jj/mm/aaaa)" },
    { key: "startCol", label: "Heure début (hh:mm)" },
    { key: "endCol", label: "Heure fin (hh:mm)" },
    { key: "mentionCol", label: "Mention" },
    { key: "parcoursCol", label: "Parcours" },
    { key: "niveauCol", label: "Niveau" },
    { key: "ueCol", label: "UE" },
    { key: "ecCol", label: "EC" },
    { key: "enseignantCol", label: "Enseignant (nom)" },
    { key: "dureeCol", label: "Durée (heures)" }
  ]
};

  const handlePreview = async () => {
    if (!file) return alert("Choisir un fichier");
    const fd = new FormData(); 
    fd.append("file", file);
    try {
      const res = await axios.post(`${API_BASE}/import/${mode}/preview`, fd, { 
        headers: { "Content-Type": "multipart/form-data" } 
      });
      setPreview(res.data);
      setShowModal(true);
    } catch (err) {
      console.error(err);
      alert("Erreur preview");
    }
  };

  const handleImport = async (mapping) => {
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("mapping", JSON.stringify(mapping));
      if (mode === "courses") fd.append("createMissing", createMissing ? "true" : "false");
      
      const res = await axios.post(`${API_BASE}/import/${mode}`, fd, { 
        headers: { "Content-Type": "multipart/form-data" } 
      });
      
      setImportResult(res.data);
      setShowModal(false); 
      setFile(null); 
      setPreview(null);
      if (onImported) onImported();
      
    } catch (err) {
      console.error(err);
      alert("Erreur import");
    }
  };

  const closeResult = () => {
    setImportResult(null);
  };

  return (
    <div className="card mb-3">
      <div className="card-body">
        <h5 className="card-title">Importer Excel</h5>
        <div className="row g-2 align-items-center">
          <div className="col-md-3">
            <select className="form-select" value={mode} onChange={e => setMode(e.target.value)}>
              <option value="teachers">Enseignants</option>
              <option value="courses">Cours</option>
            </select>
          </div>
          <div className="col-md-6">
            <input type="file" accept=".xls,.xlsx" className="form-control" onChange={e => setFile(e.target.files[0])} />
          </div>
          <div className="col-md-3 d-flex gap-2">
            <button className="btn btn-primary w-100" onClick={handlePreview} disabled={!file}>
              Aperçu & Mapper
            </button>
          </div>

          {mode === "courses" && (
            <div className="col-12 mt-2">
              <label className="form-check-label">
                <input type="checkbox" className="form-check-input me-2" checked={createMissing} onChange={e => setCreateMissing(e.target.checked)} />
                Créer enseignants manquants
              </label>
            </div>
          )}
        </div>

        {/* Affichage des résultats d'importation */}
        {importResult && (
          <div className="mt-3 p-3 border rounded bg-light">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <h6 className="mb-0">Résultat de l'importation</h6>
              <button className="btn btn-sm btn-outline-secondary" onClick={closeResult}>×</button>
            </div>
            <p className="mb-2"><strong>{importResult.summary}</strong></p>
            
            {mode === "teachers" && (
              <div className="small">
                <div>Lignes traitées: {importResult.totalRows}</div>
                <div className="text-success">Enseignants créés: {importResult.createdCount}</div>
                <div className="text-warning">Enseignants mis à jour: {importResult.updatedCount}</div>
                <div className="text-muted">Lignes ignorées: {importResult.skippedCount}</div>
              </div>
            )}
            
            {mode === "courses" && (
              <div className="small">
                <div>Lignes traitées: {importResult.totalRows}</div>
                <div className="text-success">Cours créés: {importResult.createdCount}</div>
                <div className="text-danger">Erreurs: {importResult.errorCount}</div>
              </div>
            )}
          </div>
        )}
      </div>

      {preview && showModal && (
        <MappingModal
          show={showModal}
          headers={preview.headers}
          sampleRows={preview.rows}
          targetFields={targetFieldsByMode[mode]}
          onCancel={() => setShowModal(false)}
          onConfirm={handleImport}
        />
      )}
    </div>
  );
}