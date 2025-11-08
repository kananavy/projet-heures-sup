import Enseignant from "../models/Enseignant.js";
import Cours from "../models/Cours.js";

// Fonction pour recalculer les heures et renvoyer un objet simple
function recalcJSON(enseignant) {
  const total = enseignant.cours?.reduce((s, c) => s + (parseFloat(c.duree) || 0), 0) || 0;
  const sup = total > (enseignant.volumeHoraire || 0) ? total - (enseignant.volumeHoraire || 0) : 0;
  return {
    id: enseignant.id,
    nom: enseignant.nom,
    mention: enseignant.mention,
    parcours: enseignant.parcours,
    niveau: enseignant.niveau,
    ue: enseignant.ue,
    ec: enseignant.ec,
    volumeHoraire: enseignant.volumeHoraire || 0,
    heuresNormales: total - sup,
    heuresSupplementaires: sup,
    cours: enseignant.cours?.map(c => ({
      id: c.id,
      typeCours: c.typeCours,
      dateCours: c.dateCours,
      heureDebut: c.heureDebut,
      heureFin: c.heureFin,
      mention: c.mention,
      parcours: c.parcours,
      niveau: c.niveau,
      ue: c.ue,
      ec: c.ec,
      duree: c.duree,
      enseignantName: c.enseignantName
    })) || []
  };
}

// Lister tous les enseignants
export const list = async (req, res) => {
  try {
    const enseignants = await Enseignant.findAll({
      include: { model: Cours, as: "cours" },
      order: [["createdAt", "DESC"]]
    });
    res.json(enseignants.map(e => recalcJSON(e)));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Créer un nouvel enseignant
export const create = async (req, res) => {
  try {
    const enseignant = await Enseignant.create(req.body);
    const ens = await Enseignant.findByPk(enseignant.id, { 
      include: { model: Cours, as: "cours" } 
    });
    res.status(201).json(recalcJSON(ens));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Récupérer un enseignant
export const getOne = async (req, res) => {
  try {
    const ens = await Enseignant.findByPk(req.params.id, { 
      include: { model: Cours, as: "cours" } 
    });
    if (!ens) return res.status(404).json({ error: "Introuvable" });
    res.json(recalcJSON(ens));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Mettre à jour un enseignant
export const update = async (req, res) => {
  try {
    const enseignant = await Enseignant.findByPk(req.params.id);
    if (!enseignant) return res.status(404).json({ error: "Enseignant introuvable" });
    
    await enseignant.update(req.body);
    const ens = await Enseignant.findByPk(enseignant.id, { 
      include: { model: Cours, as: "cours" } 
    });
    res.json(recalcJSON(ens));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Supprimer un enseignant
export const remove = async (req, res) => {
  try {
    const enseignant = await Enseignant.findByPk(req.params.id);
    if (!enseignant) return res.status(404).json({ error: "Enseignant introuvable" });
    
    await enseignant.destroy();
    res.json({ message: "Enseignant supprimé" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Ajouter un cours et recalculer
export const addCours = async (req, res) => {
  try {
    const enseignant = await Enseignant.findByPk(req.params.enseignantId);
    if (!enseignant) return res.status(404).json({ error: "Enseignant introuvable" });
    
    const c = await Cours.create({ 
      ...req.body, 
      enseignantId: enseignant.id, 
      enseignantName: enseignant.nom 
    });
    
    const ens = await Enseignant.findByPk(enseignant.id, { 
      include: { model: Cours, as: "cours" } 
    });
    res.status(201).json(recalcJSON(ens));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Supprimer un cours et recalculer
export const deleteCours = async (req, res) => {
  try {
    const c = await Cours.findByPk(req.params.id);
    if (!c) return res.status(404).json({ error: "Cours introuvable" });
    
    const enseignantId = c.enseignantId;
    await c.destroy();
    
    const ens = await Enseignant.findByPk(enseignantId, { 
      include: { model: Cours, as: "cours" } 
    });
    res.json(recalcJSON(ens));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};