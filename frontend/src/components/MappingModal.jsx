import React, { useEffect, useState } from "react";

export default function MappingModal({ show, headers = [], sampleRows = [], targetFields = [], onCancel, onConfirm }) {
  const [mapping, setMapping] = useState({});

  useEffect(() => {
    const init = {};
    targetFields.forEach(f => init[f.key] = "");
    setMapping(init);
  }, [headers, targetFields, show]);

  if (!show) return null;
  return (
    <div className="modal show d-block" tabIndex="-1">
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Mapper les colonnes</h5>
            <button className="btn-close" onClick={onCancel}></button>
          </div>
          <div className="modal-body">
            <div className="row g-2 mb-3">
              {targetFields.map(tf => (
                <div key={tf.key} className="col-md-6">
                  <label className="form-label">{tf.label}</label>
                  <select className="form-select" value={mapping[tf.key]||""} onChange={e => setMapping({...mapping, [tf.key]: e.target.value})}>
                    <option value="">-- ne pas mapper --</option>
                    {headers.map(h => <option key={h} value={h}>{h}</option>)}
                  </select>
                </div>
              ))}
            </div>

            <h6>Aperçu (5 premières lignes)</h6>
            <div style={{ maxHeight: 240, overflow: "auto" }}>
              <table className="table table-sm table-bordered">
                <thead><tr>{headers.map(h => <th key={h}>{h}</th>)}</tr></thead>
                <tbody>
                  {sampleRows.map((r,i) => (<tr key={i}>{headers.map(h => <td key={h}>{String(r[h] ?? "")}</td>)}</tr>))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={onCancel}>Annuler</button>
            <button className="btn btn-primary" onClick={() => onConfirm(mapping)}>Importer</button>
          </div>
        </div>
      </div>
    </div>
  );
}
