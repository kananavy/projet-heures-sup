import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const Cours = sequelize.define("Cours", {
  typeCours: { type: DataTypes.STRING },
  dateCours: { type: DataTypes.DATEONLY },
  heureDebut: { type: DataTypes.TIME },
  heureFin: { type: DataTypes.TIME },
  mention: { type: DataTypes.STRING },
  parcours: { type: DataTypes.STRING },
  niveau: { type: DataTypes.STRING },
  ue: { type: DataTypes.STRING },
  ec: { type: DataTypes.STRING },
  duree: { type: DataTypes.FLOAT },
  enseignantName: { type: DataTypes.STRING },
});

export default Cours;
