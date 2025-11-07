import express from "express";
import { getAll, create, addCours, calculHeures } from "../controllers/enseignantController.js";

const router = express.Router();

router.get("/", getAll);
router.post("/", create);
router.post("/:enseignantId/cours", addCours);
router.get("/calcul", calculHeures);

export default router;
