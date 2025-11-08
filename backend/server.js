import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";
import sequelize from "./config/db.js";

import enseignantRoutes from "./routes/enseignantRoutes.js";
import importRoutes from "./routes/importRoutes.js";

dotenv.config();
const app = express();
app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));

app.use("/api/enseignants", enseignantRoutes);
app.use("/api/import", importRoutes);

// simple root
app.get("/", (req,res)=> res.json({ ok: true }));

const PORT = process.env.PORT || 8080;
sequelize.sync({ alter: true }).then(()=> {
  console.log("DB synced");
  app.listen(PORT, ()=> console.log("Server listening on", PORT));
}).catch(err => {
  console.error("DB error", err);
});
