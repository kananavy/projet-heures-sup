import express from "express";
import * as ctrl from "../controllers/coursController.js";

const router = express.Router();

// Routes pour les cours
router.get("/", ctrl.list);
router.get("/stats", ctrl.getStats);
router.get("/global-stats", ctrl.getGlobalStats);
router.get("/enseignant/:enseignantId", ctrl.getByEnseignant);
router.get("/:id", ctrl.getOne);
router.post("/", ctrl.create);
router.put("/:id", ctrl.update);
router.delete("/:id", ctrl.remove);

export default router;