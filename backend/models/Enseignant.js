import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import Cours from "./Cours.js";

const Enseignant = sequelize.define("Enseignant", {
  nom: { type: DataTypes.STRING, allowNull: false },
  mention: { type: DataTypes.STRING },
  parcours: { type: DataTypes.STRING },
  niveau: { type: DataTypes.STRING },
  ue: { type: DataTypes.STRING },
  ec: { type: DataTypes.STRING },
  volumeHoraire: { type: DataTypes.FLOAT },
  heuresNormales: { type: DataTypes.FLOAT, defaultValue: 0 },
  heuresSupplementaires: { type: DataTypes.FLOAT, defaultValue: 0 },
});

// Association explicite
Enseignant.hasMany(Cours, { as: "cours", foreignKey: "enseignantId" });
Cours.belongsTo(Enseignant, { as: "enseignant", foreignKey: "enseignantId" });

export default Enseignant;
