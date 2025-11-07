import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import sequelize from "./config/db.js";
import enseignantRoutes from "./routes/enseignantRoutes.js";

dotenv.config();
const app = express();
app.use(cors());
app.use(bodyParser.json());

app.use("/api/enseignants", enseignantRoutes);

sequelize.sync().then(() => {
  console.log("✅ Base de données synchronisée");
  app.listen(process.env.PORT, () =>
    console.log(`🚀 Serveur lancé sur le port ${process.env.PORT}`)
  );
});
