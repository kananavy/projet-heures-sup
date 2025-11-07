import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const Enseignant = sequelize.define("Enseignant", {
  nom: { type: DataTypes.STRING, allowNull: false },
  totalHeures: { type: DataTypes.FLOAT, defaultValue: 24 }, // heures normales prévues
  heuresNormales: { type: DataTypes.FLOAT, defaultValue: 0 },
  heuresSupplementaires: { type: DataTypes.FLOAT, defaultValue: 0 },
});

export default Enseignant;
