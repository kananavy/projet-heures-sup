import express from "express";
import { getAll, create, update, remove, addCours } from "../controllers/enseignantController.js";

const router = express.Router();

router.get("/", getAll);
router.post("/", create);
router.put("/:id", update);
router.delete("/:id", remove);
router.post("/:enseignantId/cours", addCours);

export default router;
