import React, { useState } from 'react';
import api from "../../api"; // Correct : api.js est à la racine de src

// Modal intégrée pour le mappage des colonnes
const MappingModal = ({ 
  show, 
  headers = [], 
  sampleRows = [], 
  targetFields = [], 
  onCancel, 
  onConfirm,
  loading = false 
}) => {
  const [mapping, setMapping] = useState({});

  React.useEffect(() => {
    if (show && targetFields.length > 0) {
      // Initialiser le mapping
      const init = {};
      targetFields.forEach(field => {
        init[field.key] = "";
      });
      
      // Essayer de mapper automatiquement basé sur les noms
      targetFields.forEach(field => {
        const fieldLower = field.label.toLowerCase();
        const matchingHeader = headers.find(header => {
          const headerLower = header.toLowerCase();
          return (
            headerLower.includes(fieldLower) ||
            fieldLower.includes(headerLower) ||
            (field.key.includes('nom') && headerLower.includes('nom')) ||
            (field.key.includes('date') && headerLower.includes('date')) ||
            (field.key.includes('heure') && headerLower.includes('heure')) ||
            (field.key.includes('mention') && headerLower.includes('mention')) ||
            (field.key.includes('duree') && headerLower.includes('durée'))
          );
        });
        if (matchingHeader) {
          init[field.key] = matchingHeader;
        }
      });
      
      setMapping(init);
    }
  }, [show, headers, targetFields]);

  if (!show) return null;

  const handleMappingChange = (fieldKey, headerValue) => {
    setMapping(prev => ({
      ...prev,
      [fieldKey]: headerValue
    }));
  };

  const getMappingStats = () => {
    const mappedCount = Object.values(mapping).filter(value => value !== "").length;
    const totalCount = targetFields.length;
    return { mappedCount, totalCount };
  };

  const stats = getMappingStats();

  return (
    <div className="modal-overlay" onClick={loading ? undefined : onCancel}>
      <div 
        className="modal-content" 
        style={{ maxWidth: '95vw', width: '1200px' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2 className="modal-title">
            <i className="bi bi-arrow-down-up"></i>
            Mappage des colonnes
          </h2>
          <button
            onClick={onCancel}
            className="btn btn-ghost btn-sm"
            disabled={loading}
          >
            <i className="bi bi-x-lg"></i>
          </button>
        </div>
        
        <div className="modal-body space-y-xl">
          {/* Statistiques de mappage */}
          <div className="card">
            <div className="card-body">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-lg">Configuration du mappage</h4>
                  <p className="text-secondary text-sm mt-sm">
                    Associez chaque champ de destination à une colonne de votre fichier Excel
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-primary">
                    {stats.mappedCount}/{stats.totalCount}
                  </div>
                  <div className="text-sm text-secondary">colonnes mappées</div>
                </div>
              </div>
              
              {/* Barre de progression */}
              <div className="mt-lg">
                <div className="w-full bg-secondary rounded-full h-2">
                  <div
                    className="bg-primary-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(stats.mappedCount / stats.totalCount) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Configuration du mappage */}
          <div className="card">
            <div className="card-header">
              <h4 className="card-title">
                <i className="bi bi-link-45deg"></i>
                Correspondance des colonnes
              </h4>
            </div>
            <div className="card-body">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
                {targetFields.map(targetField => (
                  <div key={targetField.key} className="form-group">
                    <label className="form-label">
                      {targetField.label}
                      {targetField.required && <span className="text-error-500 ml-1">*</span>}
                    </label>
                    <select
                      className="form-select"
                      value={mapping[targetField.key] || ""}
                      onChange={(e) => handleMappingChange(targetField.key, e.target.value)}
                      disabled={loading}
                    >
                      <option value="">-- ne pas mapper --</option>
                      {headers.map(header => (
                        <option key={header} value={header}>
                          {header}
                        </option>
                      ))}
                    </select>
                    {mapping[targetField.key] && (
                      <div className="mt-xs">
                        <span className="badge badge-success text-xs">
                          <i className="bi bi-check-circle"></i>
                          Mappé avec "{mapping[targetField.key]}"
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Aperçu des données */}
          <div className="card">
            <div className="card-header">
              <h4 className="card-title">
                <i className="bi bi-table"></i>
                Aperçu des données (5 premières lignes)
              </h4>
            </div>
            <div className="card-body">
              <div style={{ 
                maxHeight: '300px', 
                overflowY: 'auto',
                overflowX: 'auto'
              }}>
                <table className="table">
                  <thead>
                    <tr>
                      {headers.map(header => (
                        <th key={header} style={{ minWidth: '120px' }}>
                          <div>
                            <div className="font-semibold">{header}</div>
                            {/* Indication si la colonne est mappée */}
                            {Object.values(mapping).includes(header) && (
                              <div className="mt-xs">
                                <span className="badge badge-primary text-xs">
                                  <i className="bi bi-link-45deg"></i>
                                  Mappée
                                </span>
                              </div>
                            )}
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {sampleRows.slice(0, 5).map((row, index) => (
                      <tr key={index}>
                        {headers.map(header => (
                          <td key={header} style={{ maxWidth: '150px' }}>
                            <div className="text-sm" title={String(row[header] ?? "")}>
                              {String(row[header] ?? "").substring(0, 50)}
                              {String(row[header] ?? "").length > 50 && "..."}
                            </div>
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Avertissements */}
          {stats.mappedCount < stats.totalCount && (
            <div className="card border-l-4 border-l-warning-500 bg-warning-50">
              <div className="card-body">
                <div className="flex items-start gap-md">
                  <i className="bi bi-exclamation-triangle text-warning-600 text-lg"></i>
                  <div>
                    <h5 className="font-semibold text-warning-700">Colonnes non mappées</h5>
                    <p className="text-sm text-warning-600 mt-sm">
                      {stats.totalCount - stats.mappedCount} colonne(s) ne sont pas associées. 
                      Ces champs resteront vides lors de l'importation.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button
            onClick={onCancel}
            className="btn btn-outline"
            disabled={loading}
          >
            Annuler
          </button>
          <button
            onClick={() => onConfirm(mapping)}
            className="btn btn-success"
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="loading-spinner w-4 h-4"></div>
                Importation...
              </>
            ) : (
              <>
                <i className="bi bi-upload"></i>
                Importer ({stats.mappedCount}/{stats.totalCount} colonnes)
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// Composant principal Import
export default function Import({ refreshAll, notify }) {
  const [mode, setMode] = useState("teachers");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [createMissing, setCreateMissing] = useState(true);
  const [importResult, setImportResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const targetFieldsByMode = {
    teachers: [
      { key: "enseignantCol", label: "Enseignants (nom)", required: true },
      { key: "mentionCol", label: "Mention" },
      { key: "parcoursCol", label: "Parcours" },
      { key: "niveauCol", label: "Niveau" },
      { key: "ueCol", label: "UE" },
      { key: "ecCol", label: "EC" },
      { key: "volumeCol", label: "Volume horaire" }
    ],
    courses: [
      { key: "typeCol", label: "TYPE" },
      { key: "dateCol", label: "Date (jj/mm/aaaa)", required: true },
      { key: "startCol", label: "Heure début (hh:mm)" },
      { key: "endCol", label: "Heure fin (hh:mm)" },
      { key: "mentionCol", label: "Mention" },
      { key: "parcoursCol", label: "Parcours" },
      { key: "niveauCol", label: "Niveau" },
      { key: "ueCol", label: "UE" },
      { key: "ecCol", label: "EC" },
      { key: "enseignantCol", label: "Enseignant (nom)", required: true },
      { key: "dureeCol", label: "Durée (heures)", required: true }
    ]
  };

  const handlePreview = async () => {
    if (!file) {
      notify.warning("Veuillez choisir un fichier Excel");
      return;
    }

    setLoading(true);
    const fd = new FormData();
    fd.append("file", file);
    
    try {
      const res = await api.post(`/import/${mode}/preview`, fd, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      setPreview(res.data);
      setShowModal(true);
    } catch (err) {
      console.error('Erreur preview:', err);
      notify.error(
        err.response?.data?.message || 'Erreur lors de l\'aperçu du fichier'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async (mapping) => {
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("mapping", JSON.stringify(mapping));
      if (mode === "courses") {
        fd.append("createMissing", createMissing ? "true" : "false");
      }

      const res = await api.post(`/import/${mode}`, fd, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      setImportResult(res.data);
      setShowModal(false);
      setFile(null);
      setPreview(null);
      
      if (refreshAll) refreshAll();
      
      notify.success(
        `✅ Importation réussie: ${res.data.summary}`
      );

    } catch (err) {
      console.error('Erreur import:', err);
      notify.error(
        err.response?.data?.message || 'Erreur lors de l\'importation'
      );
    } finally {
      setLoading(false);
    }
  };

  const closeResult = () => {
    setImportResult(null);
  };

  const modeOptions = [
    { value: 'teachers', label: 'Enseignants', icon: '👨‍🏫' },
    { value: 'courses', label: 'Cours', icon: '📚' }
  ];

  return (
    <div className="space-y-xl">
      {/* En-tête */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-lg">
        <div>
          <h1 className="text-3xl font-bold text-primary mb-sm">
            <i className="bi bi-file-earmark-excel me-3"></i>
            Importation de données
          </h1>
          <p className="text-secondary">
            Importer des enseignants et cours depuis des fichiers Excel avec mappage visuel des colonnes
          </p>
        </div>
        
        <div className="bg-primary-50 border border-primary-200 rounded-lg px-lg py-md">
          <div className="text-sm text-primary-600 font-medium">
            📥 Import Excel
          </div>
          <div className="text-xs text-primary-500">
            Formats supportés: .xls, .xlsx
          </div>
        </div>
      </div>

      {/* Panel d'importation principal */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">
            <i className="bi bi-upload"></i>
            Configuration de l'importation
          </h3>
        </div>

        <div className="card-body">
          <div className="space-y-xl">
            {/* Configuration de base */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
              {/* Sélection du mode */}
              <div className="form-group">
                <label className="form-label">Type d'importation</label>
                <select
                  className="form-select"
                  value={mode}
                  onChange={(e) => setMode(e.target.value)}
                  disabled={loading}
                >
                  {modeOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.icon} {option.label}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-secondary mt-xs">
                  Choisissez le type de données à importer
                </p>
              </div>

              {/* Sélection du fichier */}
              <div className="form-group">
                <label className="form-label">Fichier Excel</label>
                <input
                  type="file"
                  accept=".xls,.xlsx"
                  className="form-input"
                  onChange={(e) => setFile(e.target.files[0])}
                  disabled={loading}
                />
                <p className="text-xs text-secondary mt-xs">
                  Fichier .xls ou .xlsx avec en-têtes en première ligne
                </p>
              </div>
            </div>

            {/* Option spécifique aux cours */}
            {mode === "courses" && (
              <div className="bg-secondary rounded-lg p-lg">
                <label className="flex items-center gap-md">
                  <input
                    type="checkbox"
                    checked={createMissing}
                    onChange={(e) => setCreateMissing(e.target.checked)}
                    disabled={loading}
                    className="w-4 h-4"
                  />
                  <div>
                    <span className="form-label mb-0 font-medium">
                      Créer automatiquement les enseignants manquants
                    </span>
                    <p className="text-xs text-secondary">
                      Si activé, les enseignants non trouvés seront créés automatiquement lors de l'import des cours
                    </p>
                  </div>
                </label>
              </div>
            )}

            {/* Informations sur le fichier sélectionné */}
            {file && (
              <div className="bg-primary-50 border border-primary-200 rounded-lg p-lg">
                <div className="flex items-center gap-md">
                  <i className="bi bi-file-earmark-excel text-primary-600 text-xl"></i>
                  <div>
                    <div className="font-medium text-primary-700">
                      {file.name}
                    </div>
                    <div className="text-sm text-primary-600">
                      {(file.size / 1024 / 1024).toFixed(2)} MB • Prêt pour l'aperçu
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Bouton d'aperçu */}
            <button
              onClick={handlePreview}
              disabled={!file || loading}
              className={`btn w-full ${!file || loading ? 'btn-outline opacity-50' : 'btn-primary'}`}
            >
              {loading ? (
                <>
                  <div className="loading-spinner w-4 h-4"></div>
                  Analyse du fichier en cours...
                </>
              ) : (
                <>
                  <i className="bi bi-eye"></i>
                  Aperçu et mappage des colonnes
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Résultats d'importation */}
      {importResult && (
        <div className="card border-l-4 border-l-success-500 bg-success-50">
          <div className="card-header bg-success-100">
            <div className="flex items-center justify-between">
              <h4 className="card-title text-success-800">
                <i className="bi bi-check-circle text-success-600"></i>
                Résultat de l'importation
              </h4>
              <button
                onClick={closeResult}
                className="btn btn-ghost btn-sm"
              >
                <i className="bi bi-x-lg"></i>
              </button>
            </div>
          </div>
          
          <div className="card-body">
            <div className="space-y-lg">
              <div className="text-lg font-semibold text-success-700">
                {importResult.summary}
              </div>

              {/* Statistiques d'import enseignants */}
              {mode === "teachers" && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-md">
                  <div className="bg-white rounded-lg p-md text-center border border-success-200">
                    <div className="text-2xl font-bold text-success-600">
                      {importResult.createdCount}
                    </div>
                    <div className="text-sm text-success-700">Créés</div>
                  </div>
                  <div className="bg-white rounded-lg p-md text-center border border-warning-200">
                    <div className="text-2xl font-bold text-warning-600">
                      {importResult.updatedCount}
                    </div>
                    <div className="text-sm text-warning-700">Mis à jour</div>
                  </div>
                  <div className="bg-white rounded-lg p-md text-center border border-secondary">
                    <div className="text-2xl font-bold text-secondary">
                      {importResult.skippedCount || 0}
                    </div>
                    <div className="text-sm text-secondary">Ignorés</div>
                  </div>
                </div>
              )}

              {/* Statistiques d'import cours */}
              {mode === "courses" && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-md">
                  <div className="bg-white rounded-lg p-md text-center border border-success-200">
                    <div className="text-2xl font-bold text-success-600">
                      {importResult.createdCount}
                    </div>
                    <div className="text-sm text-success-700">Cours créés</div>
                  </div>
                  {importResult.errorCount > 0 && (
                    <div className="bg-white rounded-lg p-md text-center border border-error-200">
                      <div className="text-2xl font-bold text-error-600">
                        {importResult.errorCount}
                      </div>
                      <div className="text-sm text-error-700">Erreurs</div>
                    </div>
                  )}
                  <div className="bg-white rounded-lg p-md text-center border border-secondary">
                    <div className="text-2xl font-bold text-secondary">
                      {importResult.totalRows}
                    </div>
                    <div className="text-sm text-secondary">Total traité</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Guide d'utilisation */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-xl">
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              <i className="bi bi-info-circle"></i>
              Guide d'importation
            </h3>
          </div>
          <div className="card-body space-y-md">
            <div className="flex gap-md">
              <div className="text-primary-500 mt-xs">
                <i className="bi bi-1-circle"></i>
              </div>
              <div>
                <h5 className="font-medium">Préparer le fichier Excel</h5>
                <p className="text-sm text-secondary">
                  Première ligne = en-têtes, données à partir de la ligne 2
                </p>
              </div>
            </div>
            <div className="flex gap-md">
              <div className="text-primary-500 mt-xs">
                <i className="bi bi-2-circle"></i>
              </div>
              <div>
                <h5 className="font-medium">Choisir le type et le fichier</h5>
                <p className="text-sm text-secondary">
                  Sélectionner enseignants ou cours, puis le fichier .xlsx
                </p>
              </div>
            </div>
            <div className="flex gap-md">
              <div className="text-primary-500 mt-xs">
                <i className="bi bi-3-circle"></i>
              </div>
              <div>
                <h5 className="font-medium">Mapper les colonnes</h5>
                <p className="text-sm text-secondary">
                  Associer chaque colonne Excel aux champs de destination
                </p>
              </div>
            </div>
            <div className="flex gap-md">
              <div className="text-primary-500 mt-xs">
                <i className="bi bi-4-circle"></i>
              </div>
              <div>
                <h5 className="font-medium">Importer</h5>
                <p className="text-sm text-secondary">
                  Lancer l'importation et consulter le rapport de résultats
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              <i className="bi bi-file-earmark-excel"></i>
              Format recommandé
            </h3>
          </div>
          <div className="card-body space-y-md">
            <div>
              <h5 className="font-medium text-primary">Enseignants (.xlsx)</h5>
              <div className="text-sm text-secondary space-y-xs">
                <p>• <strong>Nom</strong> (obligatoire)</p>
                <p>• Mention, Parcours, Niveau</p>
                <p>• UE, EC, Volume horaire</p>
              </div>
            </div>
            <div>
              <h5 className="font-medium text-success">Cours (.xlsx)</h5>
              <div className="text-sm text-secondary space-y-xs">
                <p>• <strong>Date, Enseignant, Durée</strong> (obligatoires)</p>
                <p>• Type, Heures début/fin</p>
                <p>• Mention, Parcours, Niveau, UE, EC</p>
              </div>
            </div>
            <div className="bg-primary-50 border border-primary-200 rounded-lg p-md">
              <h6 className="font-medium text-primary-700 mb-xs">
                💡 Astuce
              </h6>
              <p className="text-sm text-primary-600">
                Le mappage automatique détecte les colonnes similaires aux noms de champs
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de mappage */}
      {preview && showModal && (
        <MappingModal
          show={showModal}
          headers={preview.headers}
          sampleRows={preview.rows}
          targetFields={targetFieldsByMode[mode]}
          onCancel={() => setShowModal(false)}
          onConfirm={handleImport}
          loading={loading}
        />
      )}
    </div>
  );
}