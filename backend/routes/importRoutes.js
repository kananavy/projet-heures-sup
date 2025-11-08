import express from "express";
import multer from "multer";
import { previewExcel, importTeachers, importCourses } from "../controllers/importController.js";

const upload = multer({ dest: "uploads/" });
const r = express.Router();

r.post("/teachers/preview", upload.single("file"), previewExcel);
r.post("/courses/preview", upload.single("file"), previewExcel);

r.post("/teachers", upload.single("file"), importTeachers);
r.post("/courses", upload.single("file"), importCourses);

export default r;
