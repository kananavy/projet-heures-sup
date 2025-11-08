import express from "express";
import multer from "multer";
import { previewExcel, importTeachers, importCourses } from "../controllers/importController.js";

const upload = multer({ dest: "uploads/" });
const router = express.Router();

router.post("/teachers/preview", upload.single("file"), previewExcel);
router.post("/courses/preview", upload.single("file"), previewExcel);

router.post("/teachers", upload.single("file"), importTeachers);
router.post("/courses", upload.single("file"), importCourses);

export default router;