import express from "express";
import * as ctrl from "../controllers/enseignantController.js";

const router = express.Router();

// Routes principales enseignants
router.get("/", ctrl.list);
router.post("/", ctrl.create);
router.get("/:id", ctrl.getOne);
router.put("/:id", ctrl.update);
router.delete("/:id", ctrl.remove);

// Routes pour gérer les cours
router.post("/:enseignantId/cours", ctrl.addCours);
router.delete("/cours/:id", ctrl.deleteCours);

export default router;