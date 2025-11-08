import Enseignant from "../models/Enseignant.js";
import Cours from "../models/Cours.js";
import { Op } from "sequelize";

// Fonction pour regrouper les cours par mention/parcours/niveau
function groupCoursByContext(cours) {
  const grouped = {};
  
  cours.forEach(c => {
    const key = `${c.mention || 'N/A'}_${c.parcours || 'N/A'}_${c.niveau || 'N/A'}`;
    if (!grouped[key]) {
      grouped[key] = {
        mention: c.mention,
        parcours: c.parcours,
        niveau: c.niveau,
        cours: [],
        totalHeures: 0
      };
    }
    grouped[key].cours.push(c);
    grouped[key].totalHeures += parseFloat(c.duree) || 0;
  });
  
  return Object.values(grouped);
}

// Fonction pour recalculer les heures et renvoyer un objet détaillé
function recalcJSON(enseignant) {
  const total = enseignant.cours?.reduce((s, c) => s + (parseFloat(c.duree) || 0), 0) || 0;
  const sup = total > (enseignant.volumeHoraire || 0) ? total - (enseignant.volumeHoraire || 0) : 0;
  
  // Récupérer toutes les mentions/parcours/niveaux uniques où l'enseignant enseigne
  const contexts = new Set();
  enseignant.cours?.forEach(c => {
    if (c.mention || c.parcours || c.niveau) {
      contexts.add(JSON.stringify({
        mention: c.mention,
        parcours: c.parcours,
        niveau: c.niveau
      }));
    }
  });
  
  const uniqueContexts = Array.from(contexts).map(c => JSON.parse(c));
  
  // Grouper les cours par contexte
  const coursParContext = groupCoursByContext(enseignant.cours || []);
  
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
    totalHeures: total,
    // Informations sur les différents contextes d'enseignement
    contextes: uniqueContexts,
    nombreContextes: uniqueContexts.length,
    // Cours regroupés par mention/parcours/niveau
    coursParContext: coursParContext,
    // Tous les cours (liste complète)
    cours: enseignant.cours?.map(c => ({
      id: c.id,
      typeCours: c.typeCours || 'Normales', // Garantir une valeur
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

// Lister tous les enseignants avec filtres optionnels
export const list = async (req, res) => {
  try {
    const { mention, parcours, niveau, search } = req.query;
    const where = {};
    
    // Filtres sur les enseignants
    if (search) {
      where.nom = { [Op.like]: `%${search}%` };
    }
    
    // Pour filtrer par mention/parcours/niveau, on doit passer par les cours
    const coursWhere = {};
    if (mention) coursWhere.mention = mention;
    if (parcours) coursWhere.parcours = parcours;
    if (niveau) coursWhere.niveau = niveau;
    
    const enseignants = await Enseignant.findAll({
      where,
      include: { 
        model: Cours, 
        as: "cours",
        where: Object.keys(coursWhere).length > 0 ? coursWhere : undefined,
        required: Object.keys(coursWhere).length > 0, // INNER JOIN si filtres
      },
      order: [["nom", "ASC"]]
    });
    
    res.json(enseignants.map(e => recalcJSON(e)));
  } catch (err) {
    console.error("Erreur list enseignants:", err);
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
    console.error("Erreur create enseignant:", err);
    res.status(500).json({ error: err.message });
  }
};

// Récupérer un enseignant spécifique avec tous ses contextes
export const getOne = async (req, res) => {
  try {
    const ens = await Enseignant.findByPk(req.params.id, { 
      include: { 
        model: Cours, 
        as: "cours",
      } 
    });
    if (!ens) return res.status(404).json({ error: "Enseignant introuvable" });
    res.json(recalcJSON(ens));
  } catch (err) {
    console.error("Erreur getOne enseignant:", err);
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
    console.error("Erreur update enseignant:", err);
    res.status(500).json({ error: err.message });
  }
};

// Supprimer un enseignant (supprime aussi ses cours en cascade)
export const remove = async (req, res) => {
  try {
    const enseignant = await Enseignant.findByPk(req.params.id, {
      include: { model: Cours, as: "cours" }
    });
    if (!enseignant) return res.status(404).json({ error: "Enseignant introuvable" });
    
    const nbCours = enseignant.cours?.length || 0;
    
    // Supprimer tous les cours associés d'abord
    if (nbCours > 0) {
      await Cours.destroy({ where: { enseignantId: enseignant.id } });
    }
    
    await enseignant.destroy();
    res.json({ 
      message: "Enseignant supprimé avec succès",
      coursSupprimes: nbCours
    });
  } catch (err) {
    console.error("Erreur remove enseignant:", err);
    res.status(500).json({ error: err.message });
  }
};

// Ajouter un cours à un enseignant et recalculer
export const addCours = async (req, res) => {
  try {
    const enseignant = await Enseignant.findByPk(req.params.enseignantId);
    if (!enseignant) return res.status(404).json({ error: "Enseignant introuvable" });
    
    // Créer le cours avec les infos de l'enseignant
    const coursData = { 
      ...req.body, 
      enseignantId: enseignant.id, 
      enseignantName: enseignant.nom
    };
    
    await Cours.create(coursData);
    
    // Récupérer l'enseignant avec tous ses cours pour recalculer
    const ens = await Enseignant.findByPk(enseignant.id, { 
      include: { model: Cours, as: "cours" } 
    });
    res.status(201).json(recalcJSON(ens));
  } catch (err) {
    console.error("Erreur addCours:", err);
    res.status(500).json({ error: err.message });
  }
};

// Supprimer un cours et recalculer les heures de l'enseignant
export const deleteCours = async (req, res) => {
  try {
    const c = await Cours.findByPk(req.params.id);
    if (!c) return res.status(404).json({ error: "Cours introuvable" });
    
    const enseignantId = c.enseignantId;
    await c.destroy();
    
    // Récupérer l'enseignant avec ses cours restants
    const ens = await Enseignant.findByPk(enseignantId, { 
      include: { model: Cours, as: "cours" } 
    });
    
    if (!ens) return res.status(404).json({ error: "Enseignant introuvable" });
    res.json(recalcJSON(ens));
  } catch (err) {
    console.error("Erreur deleteCours:", err);
    res.status(500).json({ error: err.message });
  }
};