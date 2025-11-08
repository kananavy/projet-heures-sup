import express from "express";
import * as ctrl from "../controllers/enseignantController.js";

const router = express.Router();

router.get("/", ctrl.list);
router.get("/:id", ctrl.getOne);
router.post("/", ctrl.create);
router.put("/:id", ctrl.update);
router.delete("/:id", ctrl.remove);

router.post("/:enseignantId/cours", ctrl.addCours);
router.delete("/cours/:id", ctrl.deleteCours);

export default router;
