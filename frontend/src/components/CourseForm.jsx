import React, { useState } from "react";
import axios from "axios";

export default function CourseForm({ teachers, onSaved, apiBase }) {
  const [form, setForm] = useState({ typeCours:"", dateCours:"", heureDebut:"", heureFin:"", mention:"", parcours:"", niveau:"", ue:"", ec:"", enseignantId:"", duree:0 });

  const submit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${apiBase}/enseignants/${form.enseignantId}/cours`, { 
        typeCours: form.typeCours, dateCours: form.dateCours, heureDebut: form.heureDebut, heureFin: form.heureFin,
        mention: form.mention, parcours: form.parcours, niveau: form.niveau, ue: form.ue, ec: form.ec, duree: parseFloat(form.duree) || 0
      });
      setForm({ typeCours:"", dateCours:"", heureDebut:"", heureFin:"", mention:"", parcours:"", niveau:"", ue:"", ec:"", enseignantId:"", duree:0 });
      if (onSaved) onSaved();
    } catch (err) { console.error(err); alert("Erreur ajout cours"); }
  };

  return (
    <div className="card mb-3">
      <div className="card-body">
        <h5 className="card-title">Ajouter un cours détaillé</h5>
        <form onSubmit={submit} className="row g-2">
          <div className="col-12">
            <select className="form-select" value={form.enseignantId} onChange={e=>setForm({...form, enseignantId:e.target.value})} required>
              <option value="">Choisir enseignant</option>
              {teachers.map(t => <option key={t.id} value={t.id}>{t.nom}</option>)}
            </select>
          </div>
          <div className="col-md-4"><input className="form-control" placeholder="TYPE" value={form.typeCours} onChange={e=>setForm({...form, typeCours:e.target.value})}/></div>
          <div className="col-md-4"><input type="date" className="form-control" value={form.dateCours} onChange={e=>setForm({...form, dateCours:e.target.value})}/></div>
          <div className="col-md-2"><input type="time" className="form-control" value={form.heureDebut} onChange={e=>setForm({...form, heureDebut:e.target.value})}/></div>
          <div className="col-md-2"><input type="time" className="form-control" value={form.heureFin} onChange={e=>setForm({...form, heureFin:e.target.value})}/></div>

          <div className="col-md-4"><input className="form-control" placeholder="Mention" value={form.mention} onChange={e=>setForm({...form, mention:e.target.value})}/></div>
          <div className="col-md-4"><input className="form-control" placeholder="Parcours" value={form.parcours} onChange={e=>setForm({...form, parcours:e.target.value})}/></div>
          <div className="col-md-4"><input className="form-control" placeholder="Niveau" value={form.niveau} onChange={e=>setForm({...form, niveau:e.target.value})}/></div>

          <div className="col-md-4"><input className="form-control" placeholder="UE" value={form.ue} onChange={e=>setForm({...form, ue:e.target.value})}/></div>
          <div className="col-md-4"><input className="form-control" placeholder="EC" value={form.ec} onChange={e=>setForm({...form, ec:e.target.value})}/></div>
          <div className="col-md-4"><input type="number" className="form-control" placeholder="Durée (h)" value={form.duree} onChange={e=>setForm({...form, duree:e.target.value})}/></div>

          <div className="col-12 d-grid"><button className="btn btn-success">Ajouter Cours</button></div>
        </form>
      </div>
    </div>
  );
}
