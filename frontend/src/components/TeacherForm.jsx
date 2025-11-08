import React, { useState } from "react";
import axios from "axios";

export default function TeacherForm({ onSaved, apiBase }) {
  const [form, setForm] = useState({ nom:"", mention:"", parcours:"", niveau:"", ue:"", ec:"", volumeHoraire:24 });

  const save = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${apiBase}/enseignants`, form);
      setForm({ nom:"", mention:"", parcours:"", niveau:"", ue:"", ec:"", volumeHoraire:24 });
      if (onSaved) onSaved();
    } catch (err) { console.error(err); alert("Erreur"); }
  };

  return (
    <div className="card mb-3">
      <div className="card-body">
        <h5 className="card-title">Nouvel enseignant (détails)</h5>
        <form onSubmit={save} className="row g-2">
          <div className="col-12"><input className="form-control" placeholder="Nom complet" value={form.nom} onChange={e=>setForm({...form, nom:e.target.value})} required/></div>
          <div className="col-md-6"><input className="form-control" placeholder="Mention" value={form.mention} onChange={e=>setForm({...form, mention:e.target.value})}/></div>
          <div className="col-md-6"><input className="form-control" placeholder="Parcours" value={form.parcours} onChange={e=>setForm({...form, parcours:e.target.value})}/></div>
          <div className="col-md-6"><input className="form-control" placeholder="Niveau" value={form.niveau} onChange={e=>setForm({...form, niveau:e.target.value})}/></div>
          <div className="col-md-6"><input className="form-control" placeholder="UE" value={form.ue} onChange={e=>setForm({...form, ue:e.target.value})}/></div>
          <div className="col-md-6"><input className="form-control" placeholder="EC" value={form.ec} onChange={e=>setForm({...form, ec:e.target.value})}/></div>
          <div className="col-md-6 d-flex"><input type="number" className="form-control" placeholder="Volume oraire" value={form.volumeHoraire} onChange={e=>setForm({...form, volumeHoraire:parseFloat(e.target.value)})}/></div>
          <div className="col-12 d-grid"><button className="btn btn-primary">Ajouter enseignant</button></div>
        </form>
      </div>
    </div>
  );
}
