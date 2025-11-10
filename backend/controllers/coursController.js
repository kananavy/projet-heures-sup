import Cours from "../models/Cours.js";
import Enseignant from "../models/Enseignant.js";
import { Op } from "sequelize";
import sequelize from "../config/db.js";

// Lister tous les cours avec filtres
export const list = async (req, res) => {
  try {
    const { startDate, endDate, mention, parcours, niveau, enseignantId, typeCours } = req.query;
    const where = {};
    
    // Filtres optionnels
    if (startDate && endDate) {
      where.dateCours = { [Op.between]: [startDate, endDate] };
    } else if (startDate) {
      where.dateCours = { [Op.gte]: startDate };
    }
    if (mention) where.mention = mention;
    if (parcours) where.parcours = parcours;
    if (niveau) where.niveau = niveau;
    if (enseignantId) where.enseignantId = enseignantId;
    if (typeCours) where.typeCours = typeCours;
    
    const cours = await Cours.findAll({
      where,
      include: { 
        model: Enseignant, 
        as: "enseignant",
        attributes: ['id', 'nom', 'volumeHoraire', 'mention', 'parcours', 'niveau']
      },
      order: [["dateCours", "DESC"], ["heureDebut", "ASC"]]
    });
    
    // Formater la réponse pour inclure typeCours
    const formattedCours = cours.map(c => ({
      id: c.id,
      typeCours: c.typeCours || 'Normales',
      dateCours: c.dateCours,
      heureDebut: c.heureDebut,
      heureFin: c.heureFin,
      mention: c.mention,
      parcours: c.parcours,
      niveau: c.niveau,
      ue: c.ue,
      ec: c.ec,
      duree: c.duree,
      enseignantName: c.enseignantName,
      enseignant: c.enseignant,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt
    }));
    
    res.json(formattedCours);
  } catch (err) {
    console.error("Erreur list cours:", err);
    res.status(500).json({ error: err.message });
  }
};

// Récupérer un cours par ID
export const getOne = async (req, res) => {
  try {
    const cours = await Cours.findByPk(req.params.id, {
      include: { 
        model: Enseignant, 
        as: "enseignant",
        attributes: ['id', 'nom', 'volumeHoraire', 'mention', 'parcours', 'niveau']
      }
    });
    if (!cours) return res.status(404).json({ error: "Cours introuvable" });
    
    // Formater la réponse
    const formattedCours = {
      ...cours.toJSON(),
      typeCours: cours.typeCours || 'Normales'
    };
    
    res.json(formattedCours);
  } catch (err) {
    console.error("Erreur getOne cours:", err);
    res.status(500).json({ error: err.message });
  }
};

// Créer un cours
export const create = async (req, res) => {
  try {
    // S'assurer que typeCours a une valeur par défaut
    const coursData = {
      ...req.body,
      typeCours: req.body.typeCours || 'Normales'
    };
    
    const cours = await Cours.create(coursData);
    const coursWithEnseignant = await Cours.findByPk(cours.id, {
      include: { 
        model: Enseignant, 
        as: "enseignant",
        attributes: ['id', 'nom', 'volumeHoraire', 'mention', 'parcours', 'niveau']
      }
    });
    
    res.status(201).json(coursWithEnseignant);
  } catch (err) {
    console.error("Erreur create cours:", err);
    res.status(500).json({ error: err.message });
  }
};

// Mettre à jour un cours
export const update = async (req, res) => {
  try {
    const cours = await Cours.findByPk(req.params.id);
    if (!cours) return res.status(404).json({ error: "Cours introuvable" });
    
    await cours.update(req.body);
    const coursWithEnseignant = await Cours.findByPk(cours.id, {
      include: { 
        model: Enseignant, 
        as: "enseignant",
        attributes: ['id', 'nom', 'volumeHoraire', 'mention', 'parcours', 'niveau']
      }
    });
    res.json(coursWithEnseignant);
  } catch (err) {
    console.error("Erreur update cours:", err);
    res.status(500).json({ error: err.message });
  }
};

// Supprimer un cours
export const remove = async (req, res) => {
  try {
    const cours = await Cours.findByPk(req.params.id);
    if (!cours) return res.status(404).json({ error: "Cours introuvable" });
    
    await cours.destroy();
    res.json({ message: "Cours supprimé avec succès" });
  } catch (err) {
    console.error("Erreur remove cours:", err);
    res.status(500).json({ error: err.message });
  }
};

// CORRECTION ICI : Récupérer les cours par enseignant avec filtrage par contexte
export const getByEnseignant = async (req, res) => {
  try {
    const { enseignantId } = req.params;
    
    // Récupérer l'enseignant pour obtenir son contexte
    const enseignant = await Enseignant.findByPk(enseignantId);
    if (!enseignant) {
      return res.status(404).json({ error: "Enseignant introuvable" });
    }
    
    // Construire le filtre WHERE avec le contexte de l'enseignant
    const where = { enseignantId };
    
    // CORRECTION : Filtrer par le contexte spécifique de l'enseignant
    if (enseignant.mention) where.mention = enseignant.mention;
    if (enseignant.parcours) where.parcours = enseignant.parcours;
    if (enseignant.niveau) where.niveau = enseignant.niveau;
    
    const cours = await Cours.findAll({
      where,
      include: { 
        model: Enseignant, 
        as: "enseignant",
        attributes: ['id', 'nom', 'volumeHoraire', 'mention', 'parcours', 'niveau']
      },
      order: [["dateCours", "DESC"], ["heureDebut", "ASC"]]
    });
    
    // Formater la réponse
    const formattedCours = cours.map(c => ({
      ...c.toJSON(),
      typeCours: c.typeCours || 'Normales'
    }));
    
    res.json(formattedCours);
  } catch (err) {
    console.error("Erreur getByEnseignant:", err);
    res.status(500).json({ error: err.message });
  }
};

// Statistiques des cours
export const getStats = async (req, res) => {
  try {
    const stats = await Cours.findAll({
      attributes: [
        'typeCours',
        [sequelize.fn('COUNT', sequelize.col('id')), 'nombreCours'],
        [sequelize.fn('SUM', sequelize.col('duree')), 'totalHeures']
      ],
      group: ['typeCours'],
      order: [[sequelize.fn('SUM', sequelize.col('duree')), 'DESC']]
    });
    
    res.json(stats);
  } catch (err) {
    console.error("Erreur getStats cours:", err);
    res.status(500).json({ error: err.message });
  }
};

// Statistiques globales (enseignants + cours)
export const getGlobalStats = async (req, res) => {
  try {
    const totalEnseignants = await Enseignant.count();
    const totalCours = await Cours.count();
    const totalHeures = await Cours.sum('duree');
    
    const statsParType = await Cours.findAll({
      attributes: [
        'typeCours',
        [sequelize.fn('COUNT', sequelize.col('id')), 'nombreCours'],
        [sequelize.fn('SUM', sequelize.col('duree')), 'totalHeures']
      ],
      group: ['typeCours']
    });
    
    res.json({
      totalEnseignants,
      totalCours,
      totalHeures: totalHeures || 0,
      statsParType
    });
  } catch (err) {
    console.error("Erreur getGlobalStats:", err);
    res.status(500).json({ error: err.message });
  }
};