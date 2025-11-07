import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const Enseignant = sequelize.define("Enseignant", {
  nom: { type: DataTypes.STRING, allowNull: false },
  totalHeures: { type: DataTypes.FLOAT, defaultValue: 0 },
  heuresNormales: { type: DataTypes.FLOAT, defaultValue: 0 },
  heuresSupplementaires: { type: DataTypes.FLOAT, defaultValue: 0 },
});

export default Enseignant;
