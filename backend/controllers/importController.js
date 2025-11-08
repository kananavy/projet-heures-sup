import fs from "fs";
import XLSX from "xlsx";
import Enseignant from "../models/Enseignant.js";
import Cours from "../models/Cours.js";

/** utils */
function sheetToJson(path) {
  const wb = XLSX.readFile(path, { cellDates: true });
  const name = wb.SheetNames[0];
  const ws = wb.Sheets[name];
  const json = XLSX.utils.sheet_to_json(ws, { defval: "" });
  return json;
}
function preview(path, max=5) {
  const arr = sheetToJson(path);
  const headers = arr.length ? Object.keys(arr[0]) : [];
  return { headers, rows: arr.slice(0, max) };
}

/** preview endpoint */
export const previewExcel = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "Fichier requis" });
    const p = preview(req.file.path);
    fs.unlinkSync(req.file.path);
    res.json(p);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

/**
 * import teachers from Excel with mapping
 * mapping example:
 * { enseignantCol: "Enseignants", mentionCol: "Mention", parcoursCol: "Parcours", niveauCol: "Niveau", ueCol:"UE", ecCol:"EC", volumeCol:"Volume oraire" }
 */
export const importTeachers = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "Fichier requis" });
    const map = req.body.mapping ? JSON.parse(req.body.mapping) : {};
    const rows = sheetToJson(req.file.path);
    const created = [];
    for (const r of rows) {
      const nom = (r[map.enseignantCol] || r["Enseignants"] || r["Enseignant"] || "").toString().trim();
      if (!nom) continue;
      const mention = r[map.mentionCol] || r["Mention"] || "";
      const parcours = r[map.parcoursCol] || r["Parcours"] || "";
      const niveau = r[map.niveauCol] || r["Niveau"] || "";
      const ue = r[map.ueCol] || r["UE"] || "";
      const ec = r[map.ecCol] || r["EC"] || "";
      const volumeRaw = r[map.volumeCol] || r["Volume oraire"] || r["Volume horaire"] || r["Volume"] || 0;
      const volumeHoraire = parseFloat(String(volumeRaw).replace(",",".").replace(/[^\d.-]/g,"")) || 0;

      const existing = await Enseignant.findOne({ where: { nom } });
      if (existing) {
        await existing.update({ mention, parcours, niveau, ue, ec, volumeHoraire });
        created.push({ updated: true, nom });
      } else {
        const ens = await Enseignant.create({ nom, mention, parcours, niveau, ue, ec, volumeHoraire });
        created.push({ created: true, nom });
      }
    }
    fs.unlinkSync(req.file.path);
    res.json({ createdCount: created.length, details: created.slice(0,50) });
  } catch (err) { console.error(err); res.status(500).json({ error: err.message }); }
};

/**
 * import courses from Excel with mapping
 * mapping: map keys like:
 * { typeCol: "TYPE", dateCol:"Date (jj/mm/aaaa)", startCol:"Heure début (hh:mm)", endCol:"Heure fin (hh:mm)", mentionCol:"Mention", parcoursCol:"Parcours", niveauCol:"Niveau", ueCol:"UE", ecCol:"EC", enseignantCol:"Enseignant", dureeCol:"Durée" }
 * createMissing flag: create missing enseignants with volumeHoraire default 24
 */
export const importCourses = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "Fichier requis" });
    const map = req.body.mapping ? JSON.parse(req.body.mapping) : {};
    const createMissing = req.body.createMissing === "true";
    const rows = sheetToJson(req.file.path);
    const created = [];
    for (const r of rows) {
      const typeCours = r[map.typeCol] || r["TYPE"] || "";
      const dateRaw = r[map.dateCol] || r["Date (jj/mm/aaaa)"] || r["Date"] || "";
      // normalize date: Excel might give Date objects or strings. Try to parse.
      let dateCours = null;
      if (dateRaw instanceof Date) dateCours = dateRaw.toISOString().slice(0,10);
      else if (typeof dateRaw === "string" && dateRaw.trim()) {
        // expect dd/mm/yyyy
        const m = dateRaw.trim().match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
        if (m) dateCours = `${m[3]}-${m[2].padStart(2,'0')}-${m[1].padStart(2,'0')}`;
        else dateCours = dateRaw;
      }

      const heureDebut = r[map.startCol] || r["Heure début (hh:mm)"] || "";
      const heureFin = r[map.endCol] || r["Heure fin (hh:mm)"] || "";
      const mention = r[map.mentionCol] || r["Mention"] || "";
      const parcours = r[map.parcoursCol] || r["Parcours"] || "";
      const niveau = r[map.niveauCol] || r["Niveau"] || "";
      const ue = r[map.ueCol] || r["UE"] || "";
      const ec = r[map.ecCol] || r["EC"] || "";
      const enseignantName = (r[map.enseignantCol] || r["Enseignant"] || r["Enseignants"] || "").toString().trim();
      const dureeRaw = r[map.dureeCol] || r["Durée"] || r["Duree"] || "";
      const duree = parseFloat(String(dureeRaw).replace(",",".").replace(/[^\d.-]/g,"")) || 0;

      if (!enseignantName && !createMissing) {
        // skip row if no enseignant and not allowed to create
        continue;
      }

      // find or create enseignant
      let ens = await Enseignant.findOne({ where: { nom: enseignantName } });
      if (!ens && createMissing) {
        ens = await Enseignant.create({ nom: enseignantName, volumeHoraire: 24 });
      }
      // create course
      const cours = await Cours.create({
        typeCours, dateCours, heureDebut, heureFin, mention, parcours, niveau, ue, ec, duree, enseignantName,
        EnseignantId: ens ? ens.id : null
      });
      // recalc if linked
      if (ens) {
        const withCourses = await Enseignant.findByPk(ens.id, { include: { model: Cours, as: "cours" }});
        const total = withCourses.cours.reduce((s, c) => s + (parseFloat(c.duree) || 0), 0);
        const sup = total > (withCourses.volumeHoraire || 0) ? total - (withCourses.volumeHoraire || 0) : 0;
        await withCourses.update({ heuresNormales: Math.max(0, total - sup), heuresSupplementaires: sup });
      }
      created.push({ coursId: cours.id, enseignant: enseignantName });
    }
    fs.unlinkSync(req.file.path);
    res.json({ createdCount: created.length, sample: created.slice(0,50) });
  } catch (err) { console.error(err); res.status(500).json({ error: err.message }); }
};
