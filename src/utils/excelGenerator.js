/**
 * ============================================================
 * excelGenerator.js — Moteur Excel Central MedCampus Bangui
 * Utilise SheetJS (xlsx) : npm install xlsx
 * ============================================================
 */

// ─────────────────────────────────────────────────────────────
// HELPER : charger SheetJS dynamiquement
// ─────────────────────────────────────────────────────────────
async function getXLSX() {
  if (typeof window !== 'undefined' && window.XLSX) {
    return window.XLSX;
  }
  try {
    const XLSX = await import('xlsx');
    return XLSX;
  } catch {
    throw new Error('SheetJS (xlsx) non disponible. Installez-le : npm install xlsx');
  }
}

// ─────────────────────────────────────────────────────────────
// HELPER : construire un workbook avec styles de base
// ─────────────────────────────────────────────────────────────
function buildStyledWorkbook(XLSX, sheetsData) {
  const wb = XLSX.utils.book_new();

  sheetsData.forEach(({ name, data, headers, colWidths }) => {
    // Préparer les données avec en-têtes en première ligne
    const wsData = [headers, ...data];
    const ws = XLSX.utils.aoa_to_sheet(wsData);

    // Largeurs des colonnes
    if (colWidths) {
      ws['!cols'] = colWidths.map(w => ({ wch: w }));
    }

    // Geler la première ligne (en-têtes)
    ws['!freeze'] = { xSplit: 0, ySplit: 1 };

    XLSX.utils.book_append_sheet(wb, ws, name.substring(0, 31));
  });

  return wb;
}

// ─────────────────────────────────────────────────────────────
// HELPER : formater une date
// ─────────────────────────────────────────────────────────────
function formatDate(dateStr) {
  if (!dateStr) return '-';
  try {
    return new Date(dateStr).toLocaleDateString('fr-FR');
  } catch {
    return dateStr;
  }
}

// ─────────────────────────────────────────────────────────────
// HELPER : obtenir statut note
// ─────────────────────────────────────────────────────────────
function getStatutNote(valeur, estRattrape) {
  const v = parseFloat(valeur);
  if (v >= 10) return 'Validé ✓';
  if (estRattrape) return 'Rattrapé ✓';
  return 'En Rattrapage';
}

// ─────────────────────────────────────────────────────────────
// HELPER : mention selon moyenne
// ─────────────────────────────────────────────────────────────
function getMention(moyenne) {
  const m = parseFloat(moyenne);
  if (isNaN(m)) return '-';
  if (m >= 16) return 'Très Bien';
  if (m >= 14) return 'Bien';
  if (m >= 12) return 'Assez Bien';
  if (m >= 10) return 'Passable';
  return 'Insuffisant';
}

// ═════════════════════════════════════════════════════════════
//  1.  LISTE ÉTUDIANTS EXCEL
// ═════════════════════════════════════════════════════════════
/**
 * @param {Array} etudiants  [{ prenom, nom, matricule, email, filiere, niveau, date_naissance, created_at }]
 * @param {Array} notes      (optionnel) pour calculer moyennes par étudiant
 */
export async function exportEtudiantsExcel(etudiants, notes = []) {
  const XLSX = await getXLSX();

  // ── FEUILLE 1 : Liste complète ──
  const headers1 = [
    'N°', 'Matricule', 'Nom', 'Prénom', 'Email',
    'Filière', 'Niveau', 'Date de Naissance', 'Date Inscription',
    'Nb Notes', 'Moyenne', 'Meilleure Note', 'Taux Réussite', 'Mention',
  ];

  const data1 = etudiants.map((etu, idx) => {
    const notesEtu = notes.filter(n =>
      n.id_etudiant === etu.id_etudiant ||
      (n.etudiant && n.etudiant.id_etudiant === etu.id_etudiant)
    );
    const nbNotes    = notesEtu.length;
    const somme      = notesEtu.reduce((acc, n) => acc + parseFloat(n.valeur || 0), 0);
    const moyenne    = nbNotes > 0 ? (somme / nbNotes).toFixed(2) : '-';
    const meilleure  = nbNotes > 0 ? Math.max(...notesEtu.map(n => parseFloat(n.valeur || 0))) : '-';
    const tauxR      = nbNotes > 0
      ? Math.round((notesEtu.filter(n => parseFloat(n.valeur) >= 10).length / nbNotes) * 100) + '%'
      : '-';

    return [
      idx + 1,
      etu.matricule || '-',
      (etu.nom || '').toUpperCase(),
      etu.prenom || '-',
      etu.email || '-',
      etu.filiere || '-',
      etu.niveau || '-',
      formatDate(etu.date_naissance),
      formatDate(etu.created_at),
      nbNotes,
      moyenne !== '-' ? `${moyenne}/20` : '-',
      meilleure !== '-' ? `${meilleure}/20` : '-',
      tauxR,
      moyenne !== '-' ? getMention(moyenne) : '-',
    ];
  });

  // ── FEUILLE 2 : Répartition par filière ──
  const byFiliere = etudiants.reduce((acc, etu) => {
    const f = etu.filiere || 'Non défini';
    if (!acc[f]) acc[f] = { total: 0, niveaux: {} };
    acc[f].total++;
    const niv = etu.niveau || 'Non défini';
    if (!acc[f].niveaux[niv]) acc[f].niveaux[niv] = 0;
    acc[f].niveaux[niv]++;
    return acc;
  }, {});

  const headers2 = ['Filière', 'Niveau', 'Nombre d\'Étudiants', '% du Total'];
  const data2 = [];
  Object.entries(byFiliere).forEach(([filiere, info]) => {
    Object.entries(info.niveaux).forEach(([niveau, count]) => {
      data2.push([
        filiere,
        niveau,
        count,
        `${Math.round((count / etudiants.length) * 100)}%`,
      ]);
    });
  });

  // ── FEUILLE 3 : Résumé statistique ──
  const totalAvecNotes = etudiants.filter(etu => {
    return notes.some(n =>
      n.id_etudiant === etu.id_etudiant ||
      (n.etudiant && n.etudiant.id_etudiant === etu.id_etudiant)
    );
  }).length;

  const headers3 = ['Indicateur', 'Valeur'];
  const data3 = [
    ['Total Étudiants inscrits',    etudiants.length],
    ['Étudiants avec des notes',    totalAvecNotes],
    ['Étudiants sans notes',        etudiants.length - totalAvecNotes],
    ['Nombre total de filières',    Object.keys(byFiliere).length],
    ['Date d\'export',              new Date().toLocaleString('fr-FR')],
  ];

  const wb = buildStyledWorkbook(XLSX, [
    {
      name: 'Liste Étudiants',
      data: data1,
      headers: headers1,
      colWidths: [5, 16, 18, 18, 30, 22, 10, 18, 18, 10, 14, 14, 14, 16],
    },
    {
      name: 'Par Filière',
      data: data2,
      headers: headers2,
      colWidths: [22, 14, 20, 12],
    },
    {
      name: 'Résumé',
      data: data3,
      headers: headers3,
      colWidths: [30, 20],
    },
  ]);

  const filename = `etudiants_medcampus_${Date.now()}.xlsx`;
  XLSX.writeFile(wb, filename);
  return filename;
}


// ═════════════════════════════════════════════════════════════
//  2.  NOTES COMPLÈTES EXCEL
// ═════════════════════════════════════════════════════════════
/**
 * @param {Array} notes  [{ etudiant, cours, valeur, semestre, session, date_evaluation, est_rattrape }]
 */
export async function exportNotesExcel(notes) {
  const XLSX = await getXLSX();

  // ── FEUILLE 1 : Toutes les notes ──
  const headers1 = [
    'N°', 'Matricule', 'Nom', 'Prénom',
    'Filière', 'Niveau', 'Cours', 'Code Cours',
    'Note /20', 'Semestre', 'Session', 'Date Évaluation', 'Statut',
  ];

  const data1 = notes.map((note, idx) => [
    idx + 1,
    note.etudiant?.matricule || '-',
    (note.etudiant?.nom || '').toUpperCase(),
    note.etudiant?.prenom || '-',
    note.etudiant?.filiere || '-',
    note.etudiant?.niveau  || '-',
    note.cours?.titre       || '-',
    note.cours?.code        || '-',
    parseFloat(note.valeur || 0),
    note.semestre            || '-',
    note.session             || 'normale',
    formatDate(note.date_evaluation),
    getStatutNote(note.valeur, note.est_rattrape),
  ]);

  // ── FEUILLE 2 : Moyennes par étudiant ──
  const byEtudiant = notes.reduce((acc, n) => {
    const id = n.etudiant?.matricule || n.id_etudiant || 'inconnu';
    if (!acc[id]) {
      acc[id] = {
        matricule: n.etudiant?.matricule || '-',
        nom:       (n.etudiant?.nom  || '').toUpperCase(),
        prenom:    n.etudiant?.prenom || '-',
        filiere:   n.etudiant?.filiere || '-',
        niveau:    n.etudiant?.niveau  || '-',
        notes:     [],
      };
    }
    acc[id].notes.push(n);
    return acc;
  }, {});

  const headers2 = ['Matricule', 'Nom', 'Prénom', 'Filière', 'Niveau', 'Nb Notes', 'Moyenne /20', 'Meilleure Note', 'Taux Réussite', 'Mention'];
  const data2 = Object.values(byEtudiant).map(etu => {
    const nb   = etu.notes.length;
    const somm = etu.notes.reduce((a, n) => a + parseFloat(n.valeur || 0), 0);
    const moy  = nb > 0 ? (somm / nb).toFixed(2) : 0;
    const best = nb > 0 ? Math.max(...etu.notes.map(n => parseFloat(n.valeur || 0))) : 0;
    const taux = nb > 0 ? Math.round((etu.notes.filter(n => parseFloat(n.valeur) >= 10).length / nb) * 100) : 0;
    return [
      etu.matricule, etu.nom, etu.prenom, etu.filiere, etu.niveau,
      nb, parseFloat(moy), best, `${taux}%`, getMention(moy),
    ];
  });

  // ── FEUILLE 3 : Moyennes par cours ──
  const byCours = notes.reduce((acc, n) => {
    const id = n.cours?.code || n.id_cours || 'inconnu';
    if (!acc[id]) {
      acc[id] = { titre: n.cours?.titre || '-', code: n.cours?.code || '-', notes: [] };
    }
    acc[id].notes.push(n);
    return acc;
  }, {});

  const headers3 = ['Code', 'Cours', 'Nb Notes', 'Moyenne /20', 'Note Min', 'Note Max', 'Taux Réussite'];
  const data3 = Object.values(byCours).map(c => {
    const nb   = c.notes.length;
    const somm = c.notes.reduce((a, n) => a + parseFloat(n.valeur || 0), 0);
    const moy  = nb > 0 ? (somm / nb).toFixed(2) : 0;
    const min  = nb > 0 ? Math.min(...c.notes.map(n => parseFloat(n.valeur || 0))) : 0;
    const max  = nb > 0 ? Math.max(...c.notes.map(n => parseFloat(n.valeur || 0))) : 0;
    const taux = nb > 0 ? Math.round((c.notes.filter(n => parseFloat(n.valeur) >= 10).length / nb) * 100) : 0;
    return [c.code, c.titre, nb, parseFloat(moy), min, max, `${taux}%`];
  });

  const wb = buildStyledWorkbook(XLSX, [
    {
      name: 'Toutes les Notes',
      data: data1,
      headers: headers1,
      colWidths: [5, 16, 18, 18, 20, 10, 30, 12, 10, 10, 12, 18, 18],
    },
    {
      name: 'Moyennes Étudiants',
      data: data2,
      headers: headers2,
      colWidths: [16, 18, 18, 20, 10, 10, 14, 14, 14, 16],
    },
    {
      name: 'Moyennes Cours',
      data: data3,
      headers: headers3,
      colWidths: [14, 30, 10, 14, 12, 12, 14],
    },
  ]);

  const filename = `notes_medcampus_${Date.now()}.xlsx`;
  XLSX.writeFile(wb, filename);
  return filename;
}


// ═════════════════════════════════════════════════════════════
//  3.  LISTE COURS EXCEL
// ═════════════════════════════════════════════════════════════
/**
 * @param {Array} cours  [{ code, titre, filiere, niveau, description, enseignant }]
 */
export async function exportCoursExcel(cours) {
  const XLSX = await getXLSX();

  const headers1 = ['N°', 'Code', 'Titre', 'Filière', 'Niveau', 'Enseignant', 'Spécialité', 'Description'];
  const data1 = cours.map((c, idx) => [
    idx + 1,
    c.code  || '-',
    c.titre || '-',
    c.filiere || '-',
    c.niveau  || '-',
    c.enseignant ? `${c.enseignant.prenom || ''} ${c.enseignant.nom || ''}`.trim() : '-',
    c.enseignant?.specialite || '-',
    c.description || '-',
  ]);

  // Répartition par filière
  const byFil = cours.reduce((acc, c) => {
    const f = c.filiere || 'Non défini';
    if (!acc[f]) acc[f] = 0;
    acc[f]++;
    return acc;
  }, {});

  const headers2 = ['Filière', 'Nombre de Cours', '% du Total'];
  const data2 = Object.entries(byFil).map(([f, count]) => [
    f, count, `${Math.round((count / cours.length) * 100)}%`,
  ]);

  const wb = buildStyledWorkbook(XLSX, [
    {
      name: 'Liste des Cours',
      data: data1,
      headers: headers1,
      colWidths: [5, 14, 32, 22, 10, 22, 18, 40],
    },
    {
      name: 'Par Filière',
      data: data2,
      headers: headers2,
      colWidths: [22, 18, 12],
    },
  ]);

  const filename = `cours_medcampus_${Date.now()}.xlsx`;
  XLSX.writeFile(wb, filename);
  return filename;
}


// ═════════════════════════════════════════════════════════════
//  4.  NOTES D'UN ENSEIGNANT (pour dashboard enseignant)
// ═════════════════════════════════════════════════════════════
/**
 * @param {Object} enseignant { prenom, nom, email, specialite }
 * @param {Array}  notes  tableau complet de ses notes
 */
export async function exportNotesEnseignantExcel(enseignant, notes) {
  const XLSX = await getXLSX();

  const headers1 = [
    'N°', 'Matricule', 'Nom Étudiant', 'Prénom Étudiant',
    'Filière', 'Niveau', 'Cours', 'Code Cours',
    'Note /20', 'Semestre', 'Session', 'Date Évaluation', 'Statut',
  ];

  const data1 = notes.map((note, idx) => [
    idx + 1,
    note.etudiant?.matricule || '-',
    (note.etudiant?.nom || '').toUpperCase(),
    note.etudiant?.prenom    || '-',
    note.etudiant?.filiere   || '-',
    note.etudiant?.niveau    || '-',
    note.cours?.titre         || '-',
    note.cours?.code          || '-',
    parseFloat(note.valeur || 0),
    note.semestre              || '-',
    note.session               || 'normale',
    formatDate(note.date_evaluation),
    getStatutNote(note.valeur, note.est_rattrape),
  ]);
  

  // Stats par cours
  const byCours = notes.reduce((acc, n) => {
    const id = n.cours?.code || 'inconnu';
    if (!acc[id]) acc[id] = { titre: n.cours?.titre || '-', code: n.cours?.code || '-', notes: [] };
    acc[id].notes.push(n);
    return acc;
  }, {});

  const headers2 = ['Code', 'Cours', 'Nb Notes', 'Moyenne /20', 'Taux Réussite', 'Min', 'Max'];
  const data2 = Object.values(byCours).map(c => {
    const nb   = c.notes.length;
    const somm = c.notes.reduce((a, n) => a + parseFloat(n.valeur || 0), 0);
    const moy  = nb > 0 ? (somm / nb).toFixed(2) : 0;
    const min  = nb > 0 ? Math.min(...c.notes.map(n => parseFloat(n.valeur || 0))) : 0;
    const max2 = nb > 0 ? Math.max(...c.notes.map(n => parseFloat(n.valeur || 0))) : 0;
    const taux = nb > 0 ? Math.round((c.notes.filter(n => parseFloat(n.valeur) >= 10).length / nb) * 100) : 0;
    return [c.code, c.titre, nb, parseFloat(moy), `${taux}%`, min, max2];
  });

  // Résumé
  const nb     = notes.length;
  const somme  = notes.reduce((a, n) => a + parseFloat(n.valeur || 0), 0);
  const moy    = nb > 0 ? (somme / nb).toFixed(2) : 0;
  const taux   = nb > 0 ? Math.round((notes.filter(n => parseFloat(n.valeur) >= 10).length / nb) * 100) : 0;

  const headers3 = ['Indicateur', 'Valeur'];
  const data3 = [
    ['Enseignant',           `${enseignant.prenom || ''} ${enseignant.nom || ''}`],
    ['Spécialité',            enseignant.specialite || '-'],
    ['Total Notes Attribuées', nb],
    ['Moyenne Générale',      `${moy}/20`],
    ['Taux de Réussite',      `${taux}%`],
    ['Date d\'export',         new Date().toLocaleString('fr-FR')],
  ];

  const wb = buildStyledWorkbook(XLSX, [
    {
      name: 'Mes Notes',
      data: data1,
      headers: headers1,
      colWidths: [5, 16, 18, 18, 20, 10, 30, 12, 10, 10, 12, 18, 18],
    },
    {
      name: 'Stats par Cours',
      data: data2,
      headers: headers2,
      colWidths: [14, 30, 10, 14, 14, 10, 10],
    },
    {
      name: 'Résumé',
      data: data3,
      headers: headers3,
      colWidths: [28, 22],
    },
  ]);

  const filename = `notes_${enseignant.nom || 'enseignant'}_${Date.now()}.xlsx`;
  XLSX.writeFile(wb, filename);
  return filename;
}

// Aliases pour DashboardAdmin.jsx
export const generateListeEtudiantsExcel   = exportEtudiantsExcel;
export const generateListeEnseignantsExcel = (enseignants) => exportEtudiantsExcel(enseignants);
export const generateListeCoursExcel       = exportCoursExcel;
export const generateRapportNotesExcel     = exportNotesExcel;


// ═════════════════════════════════════════════════════════════
//  5.  BULLETIN ÉTUDIANT EXCEL (version tabulaire)
// ═════════════════════════════════════════════════════════════
/**
 * @param {Object} etudiant  { prenom, nom, matricule, filiere, niveau }
 * @param {Array}  notes     tableau de ses notes
 */
export async function exportBulletinExcel(etudiant, notes) {
  const XLSX = await getXLSX();

  const headers1 = [
    'Cours', 'Code', 'Semestre', 'Session', 'Note /20', 'Date Évaluation', 'Statut',
  ];

  const data1 = notes.map(note => [
    note.cours?.titre         || '-',
    note.cours?.code          || '-',
    note.semestre              || '-',
    note.session               || 'normale',
    parseFloat(note.valeur || 0),
    formatDate(note.date_evaluation),
    getStatutNote(note.valeur, note.est_rattrape),
  ]);

  // Stats par semestre
  const bySem = notes.reduce((acc, n) => {
    const s = n.semestre || 'S1';
    if (!acc[s]) acc[s] = [];
    acc[s].push(n);
    return acc;
  }, {});

  const headers2 = ['Semestre', 'Nb Notes', 'Moyenne /20', 'Notes Validées', 'Taux Réussite', 'Mention'];
  const data2 = Object.entries(bySem).sort().map(([sem, ns]) => {
    const nb   = ns.length;
    const somm = ns.reduce((a, n) => a + parseFloat(n.valeur || 0), 0);
    const moy  = nb > 0 ? (somm / nb).toFixed(2) : 0;
    const valid = ns.filter(n => parseFloat(n.valeur) >= 10).length;
    const taux  = nb > 0 ? Math.round((valid / nb) * 100) : 0;
    return [sem, nb, parseFloat(moy), valid, `${taux}%`, getMention(moy)];
  });

  // Résumé global
  const nbTot  = notes.length;
  const sommTot = notes.reduce((a, n) => a + parseFloat(n.valeur || 0), 0);
  const moyTot  = nbTot > 0 ? (sommTot / nbTot).toFixed(2) : 0;
  const tauxTot = nbTot > 0
    ? Math.round((notes.filter(n => parseFloat(n.valeur) >= 10).length / nbTot) * 100)
    : 0;

  const headers3 = ['Indicateur', 'Valeur'];
  const data3 = [
    ['Étudiant',           `${etudiant.prenom || ''} ${etudiant.nom || ''}`],
    ['Matricule',           etudiant.matricule || '-'],
    ['Filière',             etudiant.filiere   || '-'],
    ['Niveau',              etudiant.niveau    || '-'],
    ['Total Notes',         nbTot],
    ['Moyenne Générale',    `${moyTot}/20`],
    ['Taux de Réussite',    `${tauxTot}%`],
    ['Mention Globale',     getMention(moyTot)],
    ['Date d\'export',       new Date().toLocaleString('fr-FR')],
  ];

  const wb = buildStyledWorkbook(XLSX, [
    {
      name: 'Mes Notes',
      data: data1,
      headers: headers1,
      colWidths: [32, 14, 12, 14, 12, 18, 18],
    },
    {
      name: 'Par Semestre',
      data: data2,
      headers: headers2,
      colWidths: [14, 12, 14, 16, 14, 16],
    },
    {
      name: 'Résumé',
      data: data3,
      headers: headers3,
      colWidths: [26, 22],
    },
  ]);

  const filename = `bulletin_${etudiant.matricule || 'etudiant'}_${Date.now()}.xlsx`;
  XLSX.writeFile(wb, filename);
  return filename;
}