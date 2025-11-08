// models/Cours.js
import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const Cours = sequelize.define("Cours", {
  typeCours: { 
    type: DataTypes.STRING, 
    allowNull: false,
    field: 'TYPE'
  },
  dateCours: { 
    type: DataTypes.DATEONLY,
    field: 'Date'
  },
  heureDebut: { 
    type: DataTypes.STRING, // CHANGÉ DE TIME À STRING
    field: 'Heure début'
  },
  heureFin: { 
    type: DataTypes.STRING, // CHANGÉ DE TIME À STRING
    field: 'Heure fin'
  },
  mention: { 
    type: DataTypes.STRING,
    field: 'Mention'
  },
  parcours: { 
    type: DataTypes.STRING,
    field: 'Parcours'
  },
  niveau: { 
    type: DataTypes.STRING,
    field: 'Niveau'
  },
  ue: { 
    type: DataTypes.STRING,
    field: 'UE'
  },
  ec: { 
    type: DataTypes.STRING,
    field: 'EC'
  },
  duree: { 
    type: DataTypes.FLOAT,
    field: 'Durée'
  },
  enseignantName: { 
    type: DataTypes.STRING,
    field: 'Enseignant'
  },
  statutSaisie: {
    type: DataTypes.STRING,
    field: 'Saisie',
    defaultValue: 'Saisie'
  }
}, {
  tableName: 'Cours',
  timestamps: false
});

export default Cours;