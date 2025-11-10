
// ============================================
// models/Enseignant.js
// ============================================
import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import Cours from "./Cours.js";

const Enseignant = sequelize.define("Enseignant", {
  nom: { 
    type: DataTypes.STRING, 
    allowNull: false 
  },
  mention: { 
    type: DataTypes.STRING, 
    allowNull: true 
  },
  parcours: { 
    type: DataTypes.STRING, 
    allowNull: true 
  },
  niveau: { 
    type: DataTypes.STRING, 
    allowNull: true 
  },
  ue: { 
    type: DataTypes.STRING, 
    allowNull: true 
  },
  ec: { 
    type: DataTypes.STRING, 
    allowNull: true 
  },
  volumeHoraire: { 
    type: DataTypes.FLOAT, 
    defaultValue: 24 
  },
  heuresNormales: { 
    type: DataTypes.FLOAT, 
    defaultValue: 0 
  },
  heuresSupplementaires: { 
    type: DataTypes.FLOAT, 
    defaultValue: 0 
  },
});

// Associations
Enseignant.hasMany(Cours, { 
  as: "cours", 
  foreignKey: "enseignantId",
  onDelete: 'CASCADE'
});
Cours.belongsTo(Enseignant, { 
  as: "enseignant", 
  foreignKey: "enseignantId" 
});

export default Enseignant;