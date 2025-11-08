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
 * import teachers from Excel with mapping - CORRIGÉ
 * Gère les enseignants avec même nom mais infos différentes
 */
export const importTeachers = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "Fichier requis" });
    const map = req.body.mapping ? JSON.parse(req.body.mapping) : {};
    const rows = sheetToJson(req.file.path);
    const created = [];
    const updated = [];
    const skipped = [];
    
    console.log(`Importing ${rows.length} rows for teachers...`);
    
    for (const [index, r] of rows.entries()) {
      try {
        const nom = (r[map.enseignantCol] || r["Enseignants"] || r["Enseignant"] || "").toString().trim();
        if (!nom) {
          skipped.push({ reason: "Nom vide", row: index + 1 });
          continue;
        }
        
        const mention = (r[map.mentionCol] || r["Mention"] || "").toString().trim();
        const parcours = (r[map.parcoursCol] || r["Parcours"] || "").toString().trim();
        const niveau = (r[map.niveauCol] || r["Niveau"] || "").toString().trim();
        const ue = (r[map.ueCol] || r["UE"] || "").toString().trim();
        const ec = (r[map.ecCol] || r["EC"] || "").toString().trim();
        const volumeRaw = r[map.volumeCol] || r["Volume oraire"] || r["Volume horaire"] || r["Volume"] || 0;
        const volumeHoraire = parseFloat(String(volumeRaw).replace(",",".").replace(/[^\d.-]/g,"")) || 24;

        // STRATÉGIE: Créer un identifiant unique basé sur nom + contexte
        const contextKey = `${nom}_${mention}_${parcours}_${niveau}_${ue}_${ec}`;
        
        // Chercher d'abord un enseignant avec exactement le même contexte
        let existing = await Enseignant.findOne({
          where: {
            nom,
            mention: mention || null,
            parcours: parcours || null,
            niveau: niveau || null,
            ue: ue || null,
            ec: ec || null
          }
        });

        if (existing) {
          // Mettre à jour seulement le volume horaire si nécessaire
          if (existing.volumeHoraire !== volumeHoraire) {
            await existing.update({ volumeHoraire });
            updated.push({ 
              updated: true, 
              nom, 
              mention, 
              parcours, 
              niveau,
              volumeHoraire,
              changes: `Volume horaire: ${existing.volumeHoraire} → ${volumeHoraire}`
            });
          } else {
            skipped.push({ 
              reason: "Aucun changement", 
              nom, 
              mention, 
              parcours, 
              niveau 
            });
          }
        } else {
          // Chercher si un enseignant avec le même nom existe mais contexte différent
          const sameName = await Enseignant.findOne({
            where: { nom }
          });

          if (sameName) {
            // C'est un enseignant existant avec un nouveau contexte → CRÉER un nouvel enregistrement
            const newEns = await Enseignant.create({ 
              nom, 
              mention: mention || null, 
              parcours: parcours || null, 
              niveau: niveau || null, 
              ue: ue || null, 
              ec: ec || null, 
              volumeHoraire 
            });
            created.push({ 
              created: true, 
              nom, 
              mention, 
              parcours, 
              niveau,
              ue,
              ec,
              volumeHoraire,
              note: "Nouveau contexte pour enseignant existant"
            });
          } else {
            // Nouvel enseignant complètement nouveau
            const ens = await Enseignant.create({ 
              nom, 
              mention: mention || null, 
              parcours: parcours || null, 
              niveau: niveau || null, 
              ue: ue || null, 
              ec: ec || null, 
              volumeHoraire 
            });
            created.push({ 
              created: true, 
              nom, 
              mention, 
              parcours, 
              niveau,
              ue,
              ec,
              volumeHoraire,
              note: "Nouvel enseignant"
            });
          }
        }
      } catch (rowError) {
        console.error(`Erreur ligne ${index + 1}:`, rowError);
        skipped.push({ 
          reason: "Erreur traitement", 
          row: index + 1,
          error: rowError.message 
        });
      }
    }
    
    fs.unlinkSync(req.file.path);
    
    const result = {
      totalRows: rows.length,
      createdCount: created.length,
      updatedCount: updated.length,
      skippedCount: skipped.length,
      created: created.slice(0, 50),
      updated: updated.slice(0, 20),
      skipped: skipped.slice(0, 20),
      summary: `Import terminé: ${created.length} créés, ${updated.length} mis à jour, ${skipped.length} ignorés sur ${rows.length} lignes`
    };
    
    console.log(result.summary);
    res.json(result);
    
  } catch (err) { 
    console.error("Erreur importTeachers:", err);
    res.status(500).json({ error: err.message }); 
  }
};

/**
 * import courses from Excel with mapping - AMÉLIORÉ
 */
// controllers/importController.js - Fonction importCourses complètement corrigée
export const importCourses = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "Fichier requis" });
    const map = req.body.mapping ? JSON.parse(req.body.mapping) : {};
    const createMissing = req.body.createMissing === "true";
    const rows = sheetToJson(req.file.path);
    const created = [];
    const errors = [];
    
    console.log(`Importing ${rows.length} rows for courses...`);
    
    for (const [index, r] of rows.entries()) {
      try {
        // Récupération des données
        const typeCours = (r[map.typeCol] || r["TYPE"] || "ET").toString().trim();
        const dateRaw = r[map.dateCol] || r["Date (jj/mm/aaaa)"] || r["Date"] || "";
        
        // Normaliser la date
        let dateCours = null;
        if (dateRaw instanceof Date) {
          dateCours = dateRaw.toISOString().split('T')[0];
        } else if (typeof dateRaw === "string" && dateRaw.trim()) {
          if (dateRaw.match(/^\d{4}-\d{2}-\d{2}$/)) {
            dateCours = dateRaw;
          } else {
            const parsedDate = new Date(dateRaw);
            if (!isNaN(parsedDate.getTime())) {
              dateCours = parsedDate.toISOString().split('T')[0];
            } else {
              dateCours = dateRaw;
            }
          }
        }

        // CORRECTION CRITIQUE : Extraction des heures depuis les objets Date
        let heureDebut = "";
        let heureFin = "";
        
        const heureDebutRaw = r[map.startCol] || r["Heure début"] || "";
        const heureFinRaw = r[map.endCol] || r["Heure fin"] || "";
        
        // Fonction pour extraire l'heure d'un objet Date
        const extractTimeFromDate = (dateObj) => {
          if (!dateObj) return "";
          
          if (dateObj instanceof Date) {
            // Extraire l'heure d'un objet Date
            const hours = dateObj.getHours().toString().padStart(2, '0');
            const minutes = dateObj.getMinutes().toString().padStart(2, '0');
            return `${hours}:${minutes}:00`;
          } else if (typeof dateObj === 'string') {
            // Si c'est déjà une string, vérifier le format
            if (dateObj.includes(':')) {
              return dateObj;
            } else if (dateObj.includes('GMT')) {
              // Essayer de parser les strings de date complètes
              try {
                const parsed = new Date(dateObj);
                if (!isNaN(parsed.getTime())) {
                  const hours = parsed.getHours().toString().padStart(2, '0');
                  const minutes = parsed.getMinutes().toString().padStart(2, '0');
                  return `${hours}:${minutes}:00`;
                }
              } catch (e) {
                return "";
              }
            }
          } else if (typeof dateObj === 'number') {
            // Si c'est un nombre (timestamp Excel)
            try {
              const parsed = new Date((dateObj - 25569) * 86400 * 1000);
              if (!isNaN(parsed.getTime())) {
                const hours = parsed.getHours().toString().padStart(2, '0');
                const minutes = parsed.getMinutes().toString().padStart(2, '0');
                return `${hours}:${minutes}:00`;
              }
            } catch (e) {
              return "";
            }
          }
          
          return "";
        };

        // Extraire les heures
        heureDebut = extractTimeFromDate(heureDebutRaw);
        heureFin = extractTimeFromDate(heureFinRaw);

        const mention = (r[map.mentionCol] || r["Mention"] || "").toString().trim();
        const parcours = (r[map.parcoursCol] || r["Parcours"] || "").toString().trim();
        const niveau = (r[map.niveauCol] || r["Niveau"] || "").toString().trim();
        const ue = (r[map.ueCol] || r["UE"] || "").toString().trim();
        const ec = (r[map.ecCol] || r["EC"] || "").toString().trim();
        const enseignantName = (r[map.enseignantCol] || r["Enseignant"] || "").toString().trim();
        const dureeRaw = r[map.dureeCol] || r["Durée"] || "";
        const statutSaisie = (r[map.saisieCol] || r["Saisie"] || "Saisie").toString().trim();

        // CORRECTION : Gestion de la durée
        let duree = 0;
        
        if (typeof dureeRaw === 'number') {
          // Si c'est un nombre énorme comme 3118990000000227, c'est probablement une date Excel mal interprétée
          if (dureeRaw > 1000000) {
            duree = 0;
          } else {
            duree = dureeRaw;
          }
        } else if (typeof dureeRaw === 'string') {
          // Essayer de parser les formats temporels
          const timeMatch = dureeRaw.match(/(\d+):(\d+):(\d+)/);
          if (timeMatch) {
            const hours = parseInt(timeMatch[1]);
            const minutes = parseInt(timeMatch[2]);
            duree = hours + (minutes / 60);
          } else {
            // Essayer de convertir en nombre
            duree = parseFloat(dureeRaw.replace(',', '.')) || 0;
          }
        }

        // Calculer la durée à partir des heures début/fin si disponible
        if ((!duree || duree === 0) && heureDebut && heureFin) {
          try {
            const [startHours, startMinutes] = heureDebut.split(':').map(Number);
            const [endHours, endMinutes] = heureFin.split(':').map(Number);
            
            if (!isNaN(startHours) && !isNaN(endHours)) {
              const startTotal = startHours + (startMinutes / 60);
              const endTotal = endHours + (endMinutes / 60);
              duree = Math.max(0, endTotal - startTotal);
            }
          } catch (timeError) {
            console.warn(`Ligne ${index + 1}: Erreur calcul durée: ${timeError.message}`);
          }
        }

        // Validation des données obligatoires
        if (!dateCours || !enseignantName) {
          errors.push({ 
            row: index + 1, 
            error: "Date ou enseignant manquant",
            date: dateCours,
            enseignant: enseignantName
          });
          continue;
        }

        // Gestion de l'enseignant
        let enseignantId = null;
        if (enseignantName) {
          let ens = await Enseignant.findOne({ 
            where: { nom: enseignantName } 
          });

          if (!ens && createMissing) {
            ens = await Enseignant.create({ 
              nom: enseignantName, 
              volumeHoraire: 24,
              mention: mention || null,
              parcours: parcours || null,
              niveau: niveau || null
            });
            console.log(`Créé enseignant manquant: ${enseignantName}`);
          }

          if (ens) {
            enseignantId = ens.id;
          }
        }

        // Préparer les données du cours
        const coursData = {
          typeCours,
          dateCours,
          heureDebut: heureDebut || null,
          heureFin: heureFin || null,
          mention: mention || null,
          parcours: parcours || null,
          niveau: niveau || null,
          ue: ue || null,
          ec: ec || null,
          duree: duree || 0,
          enseignantName,
          statutSaisie,
          enseignantId
        };

        console.log(`Création cours: ${dateCours} ${heureDebut}-${heureFin} - ${enseignantName}`);

        // Créer le cours
        const cours = await Cours.create(coursData);
        
        created.push({ 
          id: cours.id,
          typeCours,
          dateCours,
          heureDebut,
          heureFin,
          enseignant: enseignantName,
          mention,
          parcours,
          niveau,
          duree: duree.toFixed(2)
        });

      } catch (rowError) {
        console.error(`Erreur ligne ${index + 1}:`, rowError);
        errors.push({ 
          row: index + 1, 
          error: rowError.message,
          data: {
            enseignant: r[map.enseignantCol] || "Inconnu",
            date: r[map.dateCol] || "Date manquante",
            heureDebut: r[map.startCol] || "Heure début manquante",
            heureFin: r[map.endCol] || "Heure fin manquante"
          }
        });
      }
    }
    
    fs.unlinkSync(req.file.path);
    
    const result = {
      totalRows: rows.length,
      createdCount: created.length,
      errorCount: errors.length,
      created: created.slice(0, 30),
      errors: errors.slice(0, 20),
      summary: `Import cours terminé: ${created.length} créés, ${errors.length} erreurs sur ${rows.length} lignes`
    };
    
    console.log(result.summary);
    res.json(result);
    
  } catch (err) { 
    console.error("Erreur importCourses:", err);
    res.status(500).json({ error: err.message }); 
  }
};