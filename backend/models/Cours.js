import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import Enseignant from "./Enseignant.js";

const Cours = sequelize.define("Cours", {
  niveau: { type: DataTypes.STRING },
  parcours: { type: DataTypes.STRING },
  mention: { type: DataTypes.STRING },
  jour: { type: DataTypes.STRING },
  typeCours: { type: DataTypes.ENUM("ET", "EP") },
  heures: { type: DataTypes.FLOAT },
});

Enseignant.hasMany(Cours, { onDelete: "CASCADE" });
Cours.belongsTo(Enseignant);

export default Cours;
