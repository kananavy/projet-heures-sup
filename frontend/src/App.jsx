import React, { useEffect, useState } from "react";
import api, { API_BASE } from "./api";

import ImportPanel from "./components/ImportPanel";
import TeacherForm from "./components/TeacherForm";
import CourseForm from "./components/CourseForm";
import TeacherList from "./components/TeacherList";
import TeacherDetailModal from "./components/TeacherDetailModal";

export default function App(){
  const [teachers, setTeachers] = useState([]);
  const [selected, setSelected] = useState(null);

  const fetchTeachers = async ()=> {
    try {
      const res = await api.get("/enseignants");
      setTeachers(res.data);
    } catch (err) {
      console.error(err);
      alert("Erreur connexion backend");
    }
  };

  useEffect(()=> { fetchTeachers(); }, []);

  return (
    <div className="container py-4">
      <header className="text-center mb-4">
        <h1 className="header-title">Gestion Heures — ILC</h1>
        <p className="text-muted">Import Excel, CRUD, calcul automatique des heures supplémentaires</p>
      </header>

      <div className="row g-4">
        <div className="col-lg-4">
          <ImportPanel onImported={fetchTeachers} apiBase={API_BASE}/>
          <TeacherForm onSaved={fetchTeachers} apiBase={API_BASE}/>
          <CourseForm teachers={teachers} onSaved={fetchTeachers} apiBase={API_BASE}/>
        </div>

        <div className="col-lg-8">
          <div className="card shadow-sm">
            <div className="card-body">
              <TeacherList teachers={teachers} onSelect={t => setSelected(t)} onRefresh={fetchTeachers} apiBase={API_BASE}/>
            </div>
          </div>
        </div>
      </div>

      {selected && <TeacherDetailModal teacher={selected} onClose={() => setSelected(null)} onRefresh={fetchTeachers} apiBase={API_BASE}/>}
    </div>
  );
}
