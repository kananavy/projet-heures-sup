import Enseignant from "../models/Enseignant.js";
import Cours from "../models/Cours.js";

// Liste tous les enseignants avec leurs cours
export const getAll = async (req, res) => {
  const enseignants = await Enseignant.findAll({ include: Cours });
  res.json(enseignants);
};

// Créer un enseignant
export const create = async (req, res) => {
  const enseignant = await Enseignant.create(req.body);
  res.json(enseignant);
};

// Mettre à jour un enseignant
export const update = async (req, res) => {
  const enseignant = await Enseignant.findByPk(req.params.id);
  if (!enseignant) return res.status(404).json({ message: "Introuvable" });
  await enseignant.update(req.body);
  res.json(enseignant);
};

// Supprimer un enseignant
export const remove = async (req, res) => {
  const enseignant = await Enseignant.findByPk(req.params.id);
  if (!enseignant) return res.status(404).json({ message: "Introuvable" });
  await enseignant.destroy();
  res.json({ message: "Supprimé" });
};

// Ajouter un cours à un enseignant + calcul heures sup
export const addCours = async (req, res) => {
  const { enseignantId } = req.params;
  const cours = await Cours.create({ ...req.body, EnseignantId: enseignantId });

  // Recalcul dynamique des heures
  const enseignant = await Enseignant.findByPk(enseignantId, { include: Cours });
  const total = enseignant.Cours.reduce((sum, c) => sum + c.heures, 0);
  const sup = total > enseignant.totalHeures ? total - enseignant.totalHeures : 0;
  const normales = total - sup;

  await enseignant.update({
    heuresNormales: normales,
    heuresSupplementaires: sup
  });

  res.json({ cours, enseignant });
};
