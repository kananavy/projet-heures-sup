import Enseignant from "../models/Enseignant.js";
import Cours from "../models/Cours.js";

export const getAll = async (req, res) => {
  const enseignants = await Enseignant.findAll({ include: Cours });
  res.json(enseignants);
};

export const create = async (req, res) => {
  const enseignant = await Enseignant.create(req.body);
  res.json(enseignant);
};

export const addCours = async (req, res) => {
  const { enseignantId } = req.params;
  const cours = await Cours.create({ ...req.body, EnseignantId: enseignantId });
  res.json(cours);
};

export const calculHeures = async (req, res) => {
  const enseignants = await Enseignant.findAll({ include: Cours });
  enseignants.forEach(async (ens) => {
    const total = ens.Cours.reduce((sum, c) => sum + c.heures, 0);
    const supp = total > 24 ? total - 24 : 0;
    await ens.update({ totalHeures: total, heuresNormales: total - supp, heuresSupplementaires: supp });
  });
  res.json({ message: "Heures calculées" });
};
