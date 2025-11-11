import React, { useState } from "react";
import * as XLSX from "xlsx";
import { useExcelExport } from "../../hooks/useExcelExport";

export default function Export({ courses, teachers, stats, notify }) {
  const { exportTeachersToExcel, exportCoursesToExcel, exportStatsToExcel, exportComprehensiveReport } = useExcelExport();

  const [selectedOptions, setSelectedOptions] = useState({
    cteachers: true,
    ccourses: true,
    cstats: false,
    creport: false,
  });

  const [selectedData, setSelectedData] = useState({
    cteachers: teachers || [],
    ccourses: courses || [],
    cstats: stats || {},
    creport: {
      teachers: teachers || [],
      courses: courses || [],
      stats: stats || {},
    },
  });

  const options = [
    {
      key: "cteachers",
      label: "Enseignants",
      icon: "bi-person-lines-fill",
      color: "primary",
      exportFunc: () => exportTeachersToExcel(selectedData.cteachers),
    },
    {
      key: "ccourses",
      label: "Cours",
      icon: "bi-journal-bookmark-fill",
      color: "success",
      exportFunc: () => exportCoursesToExcel(selectedData.ccourses),
    },
    {
      key: "cstats",
      label: "Statistiques",
      icon: "bi-bar-chart-line-fill",
      color: "info",
      exportFunc: () => exportStatsToExcel(selectedData.cstats),
    },
    {
      key: "creport",
      label: "Rapport Global",
      icon: "bi-file-earmark-bar-graph-fill",
      color: "warning",
      exportFunc: () =>
        exportComprehensiveReport(
          selectedData.creport.teachers,
          selectedData.creport.courses
        ),
    },
  ];

  const handleExport = (key) => {
    const option = options.find((opt) => opt.key === key);
    if (!option) return;

    const result = option.exportFunc();

    if (result?.success) {
      notify(`Fichier exporté: ${result.filename}`, "success");
    } else {
      notify("Erreur lors de l'export", "danger");
    }
  };

  return (
    <div className="space-y-xl">
      <div>
        <h1 className="text-3xl font-bold text-primary mb-sm">
          <i className="bi bi-file-earmark-excel me-3"></i>
          Exportation des données
        </h1>
        <p className="text-secondary">Exporter en Excel les données essentielles du système</p>
      </div>

      <div className="card p-4 shadow-sm">
        <h4 className="mb-3">Données disponibles</h4>

        <ul className="list-group small mb-4">

          <li className="list-group-item d-flex justify-content-between align-items-center">
            Enseignants
            <span className="badge bg-primary">{teachers?.length || 0}</span>
          </li>

          <li className="list-group-item d-flex justify-content-between align-items-center">
            Cours
            <span className="badge bg-success">{courses?.length || 0}</span>
          </li>

          <li className="list-group-item d-flex justify-content-between align-items-center">
            Statistiques
            <span className="badge bg-info">
              {stats?.totalCourses || 0} cours
            </span>
          </li>

        </ul>

        <h5 className="mt-4 mb-2">Choisir les données à exporter</h5>

        {options.map((option) => (
          <div key={option.key} className="d-flex align-items-center mb-3">

            <input
              type="checkbox"
              checked={selectedOptions[option.key]}
              onChange={() =>
                setSelectedOptions((prev) => ({
                  ...prev,
                  [option.key]: !prev[option.key],
                }))
              }
              className="form-check-input me-3"
            />

            <span className="flex-grow-1">
              <i className={`bi ${option.icon} me-2 text-${option.color}`}></i>
              {option.label}
            </span>

            <button
              className={`btn btn-${option.color} btn-sm`}
              onClick={() => handleExport(option.key)}
              disabled={!selectedOptions[option.key]}
            >
              Exporter
            </button>

          </div>
        ))}
      </div>
    </div>
  );
}
