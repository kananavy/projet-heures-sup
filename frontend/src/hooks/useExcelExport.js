import { saveAs } from "file-saver";
import * as XLSX from "xlsx";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

export const useExcelExport = () => {

  // ----------------- STYLES -----------------
  const styleHeader = {
    font: { bold: true, color: { rgb: "FFFFFF" } },
    fill: { fgColor: { rgb: "444444" } },
    alignment: { horizontal: "center", vertical: "center" },
    border: {
      top: { style: "thin" },
      bottom: { style: "thin" },
      left: { style: "thin" },
      right: { style: "thin" }
    }
  };

  const styleBlue = {
    font: { bold: true, color: { rgb: "000000" } },
    fill: { fgColor: { rgb: "ADD8E6" } },
    alignment: { horizontal: "center", vertical: "center" },
    border: {
      top: { style: "thin" },
      bottom: { style: "thin" },
      left: { style: "thin" },
      right: { style: "thin" }
    }
  };

  // ----------------- UTILITAIRES -----------------
  const autoFitColumns = (ws, data) => {
    const cols = Object.keys(data[0]).map((col) => ({
      wch: Math.max(col.length, ...data.map((d) => (d[col] ? d[col].toString().length : 0))) + 3
    }));
    ws["!cols"] = cols;
  };

  const mergeTitleRow = (ws, title, colCount) => {
    ws["!merges"] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: colCount - 1 } }];
    ws["A1"] = {
      t: "s",
      v: title,
      s: {
        font: { bold: true, sz: 16 },
        alignment: { horizontal: "center", vertical: "center" }
      }
    };
  };

  // ----------------- EXPORT COURS -----------------
  const exportCoursesToExcel = (courses, filename = null) => {
    try {
      const formatted = courses.map(c => ({
        TYPE: c.typeCours || "",
        Date: c.dateCours ? format(new Date(c.dateCours), "EEEE d MMMM yyyy", { locale: fr }) : "",
        "Heure début": c.heureDebut || "",
        "Heure fin": c.heureFin || "",
        Mention: c.mention || "",
        Parcours: c.parcours || "",
        Niveau: c.niveau || "",
        UE: c.ue || "",
        EC: c.ec || "",
        Enseignant: c.enseignant?.nom || "",
        Durée: c.duree || 0,
        Saisie: c.createdAt ? format(new Date(c.createdAt), "EEEE d MMMM yyyy", { locale: fr }) : ""
      }));

      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet([]);

      mergeTitleRow(ws, "COURS — PROGRAMME", Object.keys(formatted[0]).length);
      XLSX.utils.sheet_add_json(ws, formatted, { origin: "A2" });

      // Style en-têtes
      const cols = Object.keys(formatted[0]);
      cols.forEach((col, index) => {
        const cell = ws[String.fromCharCode(65 + index) + "2"];
        if (!cell.s) cell.s = {};
        cell.s = col === "TYPE" ? styleBlue : styleHeader;
      });

      autoFitColumns(ws, formatted);
      XLSX.utils.book_append_sheet(wb, ws, "Cours");

      const finalFilename = filename || `cours_${format(new Date(), "yyyy-MM-dd_HH-mm")}.xlsx`;
      const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
      saveAs(new Blob([wbout]), finalFilename);

      return { success: true, filename: finalFilename };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // ----------------- EXPORT ENSEIGNANTS -----------------
  const exportTeachersToExcel = (teachers, filename = null) => {
    try {
      const formatted = teachers.map(t => ({
        Mention: t.mention || "",
        Parcours: t.parcours || "",
        Niveau: t.niveau || "",
        UE: t.ue || "",
        EC: t.ec || "",
        "Volume horaire": t.volumeHoraire || 0,
        Enseignant: t.nom || ""
      }));

      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet([]);

      mergeTitleRow(ws, "PROGRAMME D'ENSEIGNEMENT 2022-2023", Object.keys(formatted[0]).length);
      XLSX.utils.sheet_add_json(ws, formatted, { origin: "A2" });

      // Style en-têtes
      Object.keys(formatted[0]).forEach((col, index) => {
        const cell = ws[String.fromCharCode(65 + index) + "2"];
        cell.s = styleHeader;
      });

      autoFitColumns(ws, formatted);
      XLSX.utils.book_append_sheet(wb, ws, "Enseignants");

      const finalFilename = filename || `enseignants_${format(new Date(), "yyyy-MM-dd_HH-mm")}.xlsx`;
      const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
      saveAs(new Blob([wbout]), finalFilename);

      return { success: true, filename: finalFilename };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // ----------------- PLACEHOLDERS POUR STATS ET RAPPORT -----------------
  const exportStatsToExcel = () => {};
  const exportComprehensiveReport = () => {};

  return {
    exportTeachersToExcel,
    exportCoursesToExcel,
    exportStatsToExcel,
    exportComprehensiveReport
  };
};
