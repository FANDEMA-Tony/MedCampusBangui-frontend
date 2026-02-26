/**
 * ============================================================
 * pdfGenerator.js — Moteur PDF Central MedCampus Bangui
 * Utilise jsPDF (CDN ou npm : npm install jspdf)
 * ============================================================
 */

// ─────────────────────────────────────────────────────────────
// CONSTANTES VISUELLES
// ─────────────────────────────────────────────────────────────
const COLORS_PDF = {
  primary:    [0,   102, 204],   // #0066CC
  secondary:  [0,   168,  107],  // #00A86B
  accent:     [220,  20,  60],   // #DC143C
  purple:     [139,  92, 246],   // #8B5CF6
  orange:     [249, 115,  22],   // #F97316
  teal:       [20,  184, 166],   // #14B8A6
  gray900:    [17,   24,  39],   // #111827
  gray700:    [55,   65,  81],   // #374151
  gray600:    [75,   85,  99],   // #4B5563
  gray400:    [156, 163, 175],   // #9CA3AF
  gray200:    [229, 231, 235],   // #E5E7EB
  gray100:    [243, 244, 246],   // #F3F4F6
  white:      [255, 255, 255],
  bgBlue:     [239, 246, 255],   // #EFF6FF
  bgGreen:    [240, 253, 244],   // #F0FDF4
  gold:       [217, 119,   6],   // #D97706
};

// ─────────────────────────────────────────────────────────────
// HELPER : charger jsPDF dynamiquement si pas importé
// ─────────────────────────────────────────────────────────────
async function getJsPDF() {
  if (typeof window !== 'undefined' && window.jspdf) {
    return window.jspdf.jsPDF;
  }
  try {
    const { jsPDF } = await import('jspdf');
    return jsPDF;
  } catch {
    throw new Error(
      'jsPDF non disponible. Installez-le : npm install jspdf'
    );
  }
}

// ─────────────────────────────────────────────────────────────
// HELPER : dessiner un rectangle arrondi (simulation)
// ─────────────────────────────────────────────────────────────
function roundedRect(doc, x, y, w, h, r, fillColor, strokeColor) {
  if (fillColor) {
    doc.setFillColor(...fillColor);
  }
  if (strokeColor) {
    doc.setDrawColor(...strokeColor);
  } else {
    doc.setDrawColor(...COLORS_PDF.gray200);
  }
  doc.roundedRect(x, y, w, h, r, r, fillColor ? (strokeColor ? 'FD' : 'F') : 'S');
}

// ─────────────────────────────────────────────────────────────
// HELPER : en-tête institutionnel commun
// ─────────────────────────────────────────────────────────────
function drawHeader(doc, pageWidth, title, subtitle) {
  // Bandeau gradient simulé (rectangle bleu)
  doc.setFillColor(...COLORS_PDF.primary);
  doc.rect(0, 0, pageWidth, 38, 'F');

  // Accent gauche coloré
  doc.setFillColor(...COLORS_PDF.secondary);
  doc.rect(0, 0, 6, 38, 'F');

  // Logo / Emoji université (cercle blanc)
  doc.setFillColor(...COLORS_PDF.white);
  doc.circle(22, 19, 10, 'F');
  doc.setFontSize(14);
  doc.text('🏥', 17, 23);

  // Nom université
  doc.setTextColor(...COLORS_PDF.white);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.text('MedCampus Bangui', 38, 13);

  // Sous-titre université
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(200, 220, 255);
  doc.text('Faculté des Sciences de la Santé — République Centrafricaine', 38, 20);

  // Titre du document
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...COLORS_PDF.white);
  doc.text(title.toUpperCase(), 38, 30);

  if (subtitle) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(200, 220, 255);
    // Aligné à droite
    const subW = doc.getTextWidth(subtitle);
    doc.text(subtitle, pageWidth - subW - 8, 30);
  }
}

// ─────────────────────────────────────────────────────────────
// HELPER : pied de page commun
// ─────────────────────────────────────────────────────────────
function drawFooter(doc, pageWidth, pageHeight, pageNum, totalPages) {
  const y = pageHeight - 14;

  // Ligne séparatrice
  doc.setDrawColor(...COLORS_PDF.gray200);
  doc.setLineWidth(0.5);
  doc.line(14, y - 3, pageWidth - 14, y - 3);

  // Texte gauche
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(...COLORS_PDF.gray400);
  doc.text(
    `MedCampus Bangui — Document généré le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`,
    14,
    y + 2
  );

  // Numéro de page (droite)
  const pageText = `Page ${pageNum} / ${totalPages}`;
  const pageW = doc.getTextWidth(pageText);
  doc.text(pageText, pageWidth - pageW - 14, y + 2);
}

// ─────────────────────────────────────────────────────────────
// HELPER : badge coloré (petit rectangle arrondi avec texte)
// ─────────────────────────────────────────────────────────────
function drawBadge(doc, text, x, y, bgColor, textColor) {
  const tw = doc.getTextWidth(text);
  const padX = 4;
  const padY = 2;
  doc.setFillColor(...bgColor);
  doc.roundedRect(x, y - padY - 1, tw + padX * 2, 7, 1.5, 1.5, 'F');
  doc.setTextColor(...textColor);
  doc.text(text, x + padX, y + 2);
  return tw + padX * 2 + 3; // largeur totale + marge
}

// ─────────────────────────────────────────────────────────────
// HELPER : ligne de séparation de section
// ─────────────────────────────────────────────────────────────
function drawSectionTitle(doc, text, y, pageWidth, color) {
  const c = color || COLORS_PDF.primary;
  doc.setFillColor(...c);
  doc.rect(14, y, 4, 6, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...c);
  doc.text(text, 21, y + 5);
  doc.setDrawColor(...COLORS_PDF.gray200);
  doc.setLineWidth(0.3);
  doc.line(21 + doc.getTextWidth(text) + 4, y + 3, pageWidth - 14, y + 3);
  return y + 10;
}

// ═════════════════════════════════════════════════════════════
//  1.  BULLETIN DE NOTES ÉTUDIANT
// ═════════════════════════════════════════════════════════════
/**
 * @param {Object} etudiant   { prenom, nom, matricule, filiere, niveau, email }
 * @param {Array}  notes      [{ cours: { titre, code }, valeur, semestre, session, date_evaluation, est_rattrape }]
 * @param {Object} statsData  { moyenne, meilleureNote, tauxReussite, totalNotes }
 */
export async function generateBulletinPDF(etudiant, notes, statsData = {}) {
  const JsPDF = await getJsPDF();
  const doc = new JsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageWidth  = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // ── EN-TÊTE ──
  drawHeader(
    doc,
    pageWidth,
    'Bulletin de Notes Officiel',
    `Année ${new Date().getFullYear() - 1}/${new Date().getFullYear()}`
  );

  let y = 46;

  // ── CARTE IDENTITÉ ÉTUDIANT ──
  roundedRect(doc, 14, y, pageWidth - 28, 32, 3, COLORS_PDF.bgBlue, COLORS_PDF.primary);

  // Avatar initial
  doc.setFillColor(...COLORS_PDF.primary);
  doc.circle(26, y + 16, 9, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(...COLORS_PDF.white);
  const initials = `${(etudiant.prenom || '?')[0]}${(etudiant.nom || '?')[0]}`.toUpperCase();
  doc.text(initials, 26 - doc.getTextWidth(initials) / 2, y + 20);

  // Infos étudiant
  doc.setTextColor(...COLORS_PDF.gray900);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text(`${etudiant.prenom || ''} ${etudiant.nom || ''}`, 40, y + 11);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...COLORS_PDF.gray600);
  doc.text(`Matricule : ${etudiant.matricule || 'N/A'}`, 40, y + 18);
  doc.text(`Email : ${etudiant.email || 'N/A'}`, 40, y + 24);

  // Badges filière + niveau
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  let bx = 40;
  bx += drawBadge(doc, etudiant.filiere || 'N/A', bx, y + 30, COLORS_PDF.primary, COLORS_PDF.white);
  drawBadge(doc, etudiant.niveau || 'N/A', bx, y + 30, COLORS_PDF.secondary, COLORS_PDF.white);

  y += 38;

  // ── STATISTIQUES RÉSUMÉ ──
  const statBoxes = [
    { label: 'Moyenne Générale', value: `${statsData.moyenne || '0.00'}/20`, color: COLORS_PDF.primary, bg: COLORS_PDF.bgBlue },
    { label: 'Meilleure Note',   value: `${statsData.meilleureNote || 0}/20`, color: COLORS_PDF.secondary, bg: COLORS_PDF.bgGreen },
    { label: 'Total Notes',      value: `${notes.length}`,                     color: COLORS_PDF.purple,    bg: [245, 243, 255] },
    { label: 'Taux de Réussite', value: `${statsData.tauxReussite || 0}%`,     color: COLORS_PDF.orange,    bg: [255, 247, 237] },
  ];

  const boxW = (pageWidth - 28 - 9) / 4;
  statBoxes.forEach((sb, i) => {
    const bx2 = 14 + i * (boxW + 3);
    roundedRect(doc, bx2, y, boxW, 22, 2.5, sb.bg, sb.color);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(...sb.color);
    const vw = doc.getTextWidth(sb.value);
    doc.text(sb.value, bx2 + boxW / 2 - vw / 2, y + 12);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(...COLORS_PDF.gray600);
    const lw = doc.getTextWidth(sb.label);
    doc.text(sb.label, bx2 + boxW / 2 - lw / 2, y + 19);
  });

  y += 28;

  // ── NOTES PAR SEMESTRE ──
  const notesBySemestre = notes.reduce((acc, n) => {
    const s = n.semestre || 'S1';
    if (!acc[s]) acc[s] = [];
    acc[s].push(n);
    return acc;
  }, {});

  const semestres = Object.keys(notesBySemestre).sort();

  for (const semestre of semestres) {
    // Vérifier espace restant pour la section
    if (y > pageHeight - 60) {
      doc.addPage();
      drawHeader(doc, pageWidth, 'Bulletin de Notes Officiel (suite)', '');
      drawFooter(doc, pageWidth, pageHeight, doc.internal.getNumberOfPages() - 1, '?');
      y = 46;
    }

    y = drawSectionTitle(doc, `Semestre ${semestre}`, y, pageWidth, COLORS_PDF.primary);

    const notesSem = notesBySemestre[semestre];
    const sommeSem = notesSem.reduce((acc, n) => acc + parseFloat(n.valeur || 0), 0);
    const moyenneSem = (sommeSem / notesSem.length).toFixed(2);

    // En-tête tableau
    const cols = { matiere: 14, code: 100, note: 128, statut: 152, date: 170 };
    const rowH = 8;

    // Header ligne
    doc.setFillColor(...COLORS_PDF.primary);
    doc.rect(14, y, pageWidth - 28, rowH, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(...COLORS_PDF.white);
    doc.text('Matière', cols.matiere + 2, y + 5.5);
    doc.text('Code', cols.code, y + 5.5);
    doc.text('Note', cols.note, y + 5.5);
    doc.text('Statut', cols.statut, y + 5.5);
    doc.text('Date', cols.date, y + 5.5);
    y += rowH;

    // Lignes notes
    notesSem.forEach((note, idx) => {
      if (y > pageHeight - 30) {
        doc.addPage();
        drawHeader(doc, pageWidth, 'Bulletin de Notes Officiel (suite)', '');
        y = 46;
      }

      const isValidated = parseFloat(note.valeur) >= 10;
      const bg = idx % 2 === 0 ? COLORS_PDF.white : COLORS_PDF.gray100;
      doc.setFillColor(...bg);
      doc.rect(14, y, pageWidth - 28, rowH, 'F');

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(...COLORS_PDF.gray700);

      const titre = note.cours?.titre || 'Cours inconnu';
      const titreTrunc = titre.length > 36 ? titre.substring(0, 33) + '...' : titre;
      doc.text(titreTrunc, cols.matiere + 2, y + 5.5);
      doc.text(note.cours?.code || '-', cols.code, y + 5.5);

      // Note colorée
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(...(isValidated ? COLORS_PDF.secondary : COLORS_PDF.accent));
      doc.text(`${note.valeur}/20`, cols.note, y + 5.5);

      // Statut badge
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6.5);
      if (isValidated) {
        doc.setTextColor(...COLORS_PDF.secondary);
        doc.text('✓ Validé', cols.statut, y + 5.5);
      } else if (note.est_rattrape) {
        doc.setTextColor(...COLORS_PDF.primary);
        doc.text('✓ Rattrapé', cols.statut, y + 5.5);
      } else {
        doc.setTextColor(...COLORS_PDF.orange);
        doc.text('⚠ Rattrapage', cols.statut, y + 5.5);
      }

      // Date
      doc.setTextColor(...COLORS_PDF.gray600);
      const dateStr = note.date_evaluation
        ? new Date(note.date_evaluation).toLocaleDateString('fr-FR')
        : '-';
      doc.text(dateStr, cols.date, y + 5.5);

      // Bordure bas ligne
      doc.setDrawColor(...COLORS_PDF.gray200);
      doc.setLineWidth(0.2);
      doc.line(14, y + rowH, pageWidth - 14, y + rowH);

      y += rowH;
    });

    // Ligne récap semestre
    doc.setFillColor(...(parseFloat(moyenneSem) >= 10 ? COLORS_PDF.bgGreen : [255, 247, 237]));
    doc.rect(14, y, pageWidth - 28, 8, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(...(parseFloat(moyenneSem) >= 10 ? COLORS_PDF.secondary : COLORS_PDF.orange));
    doc.text(`Moyenne ${semestre} : ${moyenneSem}/20`, cols.matiere + 2, y + 5.5);
    const reussiteSem = notesSem.filter(n => parseFloat(n.valeur) >= 10).length;
    doc.text(
      `${reussiteSem}/${notesSem.length} matières validées`,
      pageWidth - 14 - doc.getTextWidth(`${reussiteSem}/${notesSem.length} matières validées`) - 2,
      y + 5.5
    );
    y += 14;
  }

  // ── MENTION FINALE ──
  if (y > pageHeight - 50) {
    doc.addPage();
    y = 46;
  }

  const moyenneFinale = parseFloat(statsData.moyenne || 0);
  let mention = 'Insuffisant';
  let mentionColor = COLORS_PDF.accent;
  if (moyenneFinale >= 16)      { mention = 'Très Bien';   mentionColor = COLORS_PDF.secondary; }
  else if (moyenneFinale >= 14) { mention = 'Bien';        mentionColor = COLORS_PDF.secondary; }
  else if (moyenneFinale >= 12) { mention = 'Assez Bien';  mentionColor = COLORS_PDF.primary;   }
  else if (moyenneFinale >= 10) { mention = 'Passable';    mentionColor = COLORS_PDF.orange;    }

  roundedRect(doc, 14, y, pageWidth - 28, 22, 3,
    moyenneFinale >= 10 ? COLORS_PDF.bgGreen : [255, 247, 237],
    mentionColor
  );
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...mentionColor);
  const mentionText = `Mention : ${mention}`;
  doc.text(mentionText, pageWidth / 2 - doc.getTextWidth(mentionText) / 2, y + 9);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...COLORS_PDF.gray600);
  const avgText = `Moyenne générale : ${statsData.moyenne || '0.00'}/20`;
  doc.text(avgText, pageWidth / 2 - doc.getTextWidth(avgText) / 2, y + 16);

  y += 28;

  // ── SIGNATURE ──
  doc.setDrawColor(...COLORS_PDF.gray200);
  doc.setLineWidth(0.4);
  doc.line(pageWidth - 80, y + 18, pageWidth - 14, y + 18);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(...COLORS_PDF.gray600);
  doc.text("Le Directeur des Études", pageWidth - 80, y + 24);

  // ── FOOTER toutes les pages ──
  const totalPages = doc.internal.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    drawFooter(doc, pageWidth, pageHeight, p, totalPages);
  }

  // ── SAUVEGARDER ──
  const filename = `bulletin_${etudiant.matricule || 'etudiant'}_${Date.now()}.pdf`;
  doc.save(filename);
  return filename;
}


// ═════════════════════════════════════════════════════════════
//  2.  CERTIFICAT DE SCOLARITÉ
// ═════════════════════════════════════════════════════════════
/**
 * @param {Object} etudiant { prenom, nom, matricule, filiere, niveau, email, date_naissance }
 */
export async function generateCertificatPDF(etudiant) {
  const JsPDF = await getJsPDF();
  const doc = new JsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageWidth  = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Bordure décorative extérieure
  doc.setDrawColor(...COLORS_PDF.primary);
  doc.setLineWidth(3);
  doc.rect(8, 8, pageWidth - 16, pageHeight - 16);
  doc.setDrawColor(...COLORS_PDF.secondary);
  doc.setLineWidth(1);
  doc.rect(11, 11, pageWidth - 22, pageHeight - 22);

  // ── EN-TÊTE ──
  drawHeader(doc, pageWidth, 'Certificat de Scolarité', '');

  let y = 52;

  // Titre central décoratif
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...COLORS_PDF.primary);
  const titre = 'CERTIFICAT DE SCOLARITÉ';
  doc.text(titre, pageWidth / 2 - doc.getTextWidth(titre) / 2, y);
  y += 8;

  // Ligne décorative
  doc.setDrawColor(...COLORS_PDF.gold);
  doc.setLineWidth(1.5);
  doc.line(40, y, pageWidth - 40, y);
  y += 14;

  // Sous-titre
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...COLORS_PDF.gray600);
  const anneeText = `Année Académique ${new Date().getFullYear() - 1} — ${new Date().getFullYear()}`;
  doc.text(anneeText, pageWidth / 2 - doc.getTextWidth(anneeText) / 2, y);
  y += 16;

  // Corps du certificat
  const bodyText = [
    "Le Directeur des Études de la Faculté des Sciences de la Santé",
    "de MedCampus Bangui, République Centrafricaine,",
    "",
    "CERTIFIE QUE :",
  ];

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.setTextColor(...COLORS_PDF.gray700);
  bodyText.forEach(line => {
    doc.text(line, pageWidth / 2 - doc.getTextWidth(line) / 2, y);
    y += 7;
  });

  y += 4;

  // Encadré étudiant
  roundedRect(doc, 30, y, pageWidth - 60, 52, 4, COLORS_PDF.bgBlue, COLORS_PDF.primary);

  // Avatar cercle
  doc.setFillColor(...COLORS_PDF.primary);
  doc.circle(pageWidth / 2, y + 14, 10, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(...COLORS_PDF.white);
  const init = `${(etudiant.prenom || '?')[0]}${(etudiant.nom || '?')[0]}`.toUpperCase();
  doc.text(init, pageWidth / 2 - doc.getTextWidth(init) / 2, y + 18);

  y += 28;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(...COLORS_PDF.gray900);
  const fullName = `${(etudiant.prenom || '').toUpperCase()} ${(etudiant.nom || '').toUpperCase()}`;
  doc.text(fullName, pageWidth / 2 - doc.getTextWidth(fullName) / 2, y);
  y += 8;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...COLORS_PDF.gray600);
  const mat = `Matricule : ${etudiant.matricule || 'N/A'}`;
  doc.text(mat, pageWidth / 2 - doc.getTextWidth(mat) / 2, y);
  y += 7;

  // Badges
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  const filText = `Filière : ${etudiant.filiere || 'N/A'}`;
  const nivText = `Niveau : ${etudiant.niveau || 'N/A'}`;
  const totalBadgeW = doc.getTextWidth(filText) + 20 + doc.getTextWidth(nivText) + 20 + 6;
  let bx = pageWidth / 2 - totalBadgeW / 2;
  bx += drawBadge(doc, filText, bx, y, COLORS_PDF.primary, COLORS_PDF.white);
  drawBadge(doc, nivText, bx, y, COLORS_PDF.secondary, COLORS_PDF.white);
  y += 20;

  // Texte suite
  const suiteTexts = [
    `est régulièrement inscrit(e) à la Faculté des Sciences de la Santé`,
    `de MedCampus Bangui pour l'année académique ${new Date().getFullYear() - 1}/${new Date().getFullYear()}.`,
    "",
    "Ce certificat est délivré à l'intéressé(e) pour servir et valoir ce que de droit.",
  ];

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...COLORS_PDF.gray700);
  suiteTexts.forEach(line => {
    doc.text(line, pageWidth / 2 - doc.getTextWidth(line) / 2, y);
    y += 7;
  });

  y += 10;

  // Date et lieu
  const dateDoc = `Bangui, le ${new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}`;
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(10);
  doc.setTextColor(...COLORS_PDF.gray600);
  doc.text(dateDoc, pageWidth / 2 - doc.getTextWidth(dateDoc) / 2, y);
  y += 20;

  // Zone signature
  const sigX = pageWidth - 80;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...COLORS_PDF.gray700);
  doc.text("Le Directeur des Études", sigX, y);
  y += 18;
  doc.setDrawColor(...COLORS_PDF.gray400);
  doc.setLineWidth(0.5);
  doc.line(sigX, y, pageWidth - 14, y);
  y += 6;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...COLORS_PDF.gray400);
  doc.text("Signature et cachet", sigX, y);

  // Numéro de référence
  const refNum = `REF-${Date.now().toString().slice(-8)}`;
  doc.setFontSize(7);
  doc.setTextColor(...COLORS_PDF.gray400);
  doc.text(`Référence : ${refNum}`, 14, pageHeight - 20);

  // Footer
  drawFooter(doc, pageWidth, pageHeight, 1, 1);

  const filename = `certificat_scolarite_${etudiant.matricule || 'etudiant'}_${Date.now()}.pdf`;
  doc.save(filename);
  return filename;
}


// ═════════════════════════════════════════════════════════════
//  3.  RAPPORT PERFORMANCE ENSEIGNANT
// ═════════════════════════════════════════════════════════════
/**
 * @param {Object} enseignant   { prenom, nom, email, specialite }
 * @param {Array}  performanceCours  [{ titre, code, moyenne, taux_reussite, nb_notes }]
 * @param {Object} statsGenerales    { nb_cours, nb_etudiants_total, nb_notes_total, moyenne_generale }
 * @param {Array}  distributionNotes [{ tranche, nb_notes }]
 */
export async function generateRapportEnseignantPDF(enseignant, performanceCours, statsGenerales, distributionNotes) {
  const JsPDF = await getJsPDF();
  const doc = new JsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageWidth  = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  drawHeader(doc, pageWidth, 'Rapport de Performance Pédagogique', `Généré le ${new Date().toLocaleDateString('fr-FR')}`);

  let y = 46;

  // ── INFOS ENSEIGNANT ──
  roundedRect(doc, 14, y, pageWidth - 28, 26, 3, COLORS_PDF.bgBlue, COLORS_PDF.primary);

  doc.setFillColor(...COLORS_PDF.primary);
  doc.circle(26, y + 13, 8, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...COLORS_PDF.white);
  const ensInit = `${(enseignant.prenom || '?')[0]}${(enseignant.nom || '?')[0]}`.toUpperCase();
  doc.text(ensInit, 26 - doc.getTextWidth(ensInit) / 2, y + 17);

  doc.setTextColor(...COLORS_PDF.gray900);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text(`${enseignant.prenom || ''} ${enseignant.nom || ''}`, 40, y + 11);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...COLORS_PDF.gray600);
  doc.text(`Spécialité : ${enseignant.specialite || 'N/A'}`, 40, y + 18);
  doc.text(`Email : ${enseignant.email || 'N/A'}`, 40, y + 24);

  y += 32;

  // ── STATS GÉNÉRALES ──
  y = drawSectionTitle(doc, 'Vue d\'ensemble', y, pageWidth, COLORS_PDF.primary);

  if (statsGenerales) {
    const sg = statsGenerales;
    const boxes2 = [
      { label: 'Cours Enseignés',    value: `${sg.nb_cours || 0}`,                color: COLORS_PDF.primary,   bg: COLORS_PDF.bgBlue  },
      { label: 'Étudiants Notés',    value: `${sg.nb_etudiants_total || 0}`,       color: COLORS_PDF.secondary, bg: COLORS_PDF.bgGreen },
      { label: 'Notes Attribuées',   value: `${sg.nb_notes_total || 0}`,           color: COLORS_PDF.purple,    bg: [245, 243, 255]    },
      { label: 'Moyenne Générale',   value: `${sg.moyenne_generale || '0.00'}/20`, color: COLORS_PDF.orange,    bg: [255, 247, 237]    },
    ];

    const bW = (pageWidth - 28 - 9) / 4;
    boxes2.forEach((sb, i) => {
      const bx2 = 14 + i * (bW + 3);
      roundedRect(doc, bx2, y, bW, 20, 2, sb.bg, sb.color);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(13);
      doc.setTextColor(...sb.color);
      const vw2 = doc.getTextWidth(sb.value);
      doc.text(sb.value, bx2 + bW / 2 - vw2 / 2, y + 10);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6);
      doc.setTextColor(...COLORS_PDF.gray600);
      const lw2 = doc.getTextWidth(sb.label);
      doc.text(sb.label, bx2 + bW / 2 - lw2 / 2, y + 17);
    });
    y += 26;
  }

  // ── PERFORMANCE PAR COURS ──
  y = drawSectionTitle(doc, 'Performance par Cours', y, pageWidth, COLORS_PDF.teal);

  if (performanceCours && performanceCours.length > 0) {
    // En-tête tableau
    const colsP = { titre: 16, code: 100, moy: 126, taux: 152, notes: 174 };
    const rH = 8;

    doc.setFillColor(...COLORS_PDF.teal);
    doc.rect(14, y, pageWidth - 28, rH, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(...COLORS_PDF.white);
    doc.text('Cours', colsP.titre, y + 5.5);
    doc.text('Code', colsP.code, y + 5.5);
    doc.text('Moyenne', colsP.moy, y + 5.5);
    doc.text('Réussite', colsP.taux, y + 5.5);
    doc.text('Notes', colsP.notes, y + 5.5);
    y += rH;

    performanceCours.forEach((c, idx) => {
      if (y > pageHeight - 30) {
        doc.addPage();
        drawHeader(doc, pageWidth, 'Rapport de Performance (suite)', '');
        y = 46;
      }

      const bg = idx % 2 === 0 ? COLORS_PDF.white : COLORS_PDF.gray100;
      doc.setFillColor(...bg);
      doc.rect(14, y, pageWidth - 28, rH, 'F');

      const taux = parseFloat(c.taux_reussite || 0);
      const moy  = parseFloat(c.moyenne || 0);
      const tauxColor = taux >= 75 ? COLORS_PDF.secondary : taux >= 50 ? COLORS_PDF.orange : COLORS_PDF.accent;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(...COLORS_PDF.gray700);
      const titreTrunc = (c.titre || '').length > 34 ? (c.titre || '').substring(0, 31) + '...' : (c.titre || '');
      doc.text(titreTrunc, colsP.titre, y + 5.5);
      doc.text(c.code || '-', colsP.code, y + 5.5);

      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...(moy >= 10 ? COLORS_PDF.secondary : COLORS_PDF.accent));
      doc.text(`${c.moyenne}/20`, colsP.moy, y + 5.5);

      doc.setTextColor(...tauxColor);
      doc.text(`${c.taux_reussite}%`, colsP.taux, y + 5.5);

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...COLORS_PDF.gray600);
      doc.text(`${c.nb_notes}`, colsP.notes, y + 5.5);

      // Barre progression taux
      const barX = colsP.taux + 14;
      const barW = 22;
      doc.setFillColor(...COLORS_PDF.gray200);
      doc.roundedRect(barX, y + 2, barW, 3, 1, 1, 'F');
      doc.setFillColor(...tauxColor);
      doc.roundedRect(barX, y + 2, Math.max(1, barW * taux / 100), 3, 1, 1, 'F');

      doc.setDrawColor(...COLORS_PDF.gray200);
      doc.setLineWidth(0.2);
      doc.line(14, y + rH, pageWidth - 14, y + rH);
      y += rH;
    });

    y += 8;
  }

  // ── DISTRIBUTION DES NOTES ──
  if (distributionNotes && distributionNotes.length > 0) {
    if (y > pageHeight - 70) {
      doc.addPage();
      drawHeader(doc, pageWidth, 'Rapport de Performance (suite)', '');
      y = 46;
    }

    y = drawSectionTitle(doc, 'Distribution des Notes', y, pageWidth, COLORS_PDF.purple);

    const maxNotes = Math.max(...distributionNotes.map(d => d.nb_notes || 0), 1);
    const barColors = [COLORS_PDF.accent, COLORS_PDF.orange, COLORS_PDF.secondary, COLORS_PDF.primary, COLORS_PDF.purple];

    distributionNotes.forEach((d, idx) => {
      if (y > pageHeight - 20) {
        doc.addPage();
        y = 46;
      }
      const barW = Math.max(4, ((d.nb_notes || 0) / maxNotes) * (pageWidth - 80));
      const color = barColors[idx % barColors.length];

      doc.setFillColor(...COLORS_PDF.gray100);
      doc.rect(14, y, pageWidth - 28, 8, 'F');

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(...COLORS_PDF.gray700);
      doc.text(d.tranche || '-', 16, y + 5.5);

      doc.setFillColor(...color);
      doc.roundedRect(60, y + 1.5, barW, 5, 1, 1, 'F');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7);
      doc.setTextColor(...color);
      doc.text(`${d.nb_notes || 0}`, 60 + barW + 3, y + 5.5);

      y += 10;
    });
  }

  // ── FOOTER ──
  const totalPages = doc.internal.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    drawFooter(doc, pageWidth, pageHeight, p, totalPages);
  }

  const filename = `rapport_enseignant_${Date.now()}.pdf`;
  doc.save(filename);
  return filename;
}


// ═════════════════════════════════════════════════════════════
//  4.  RAPPORT GLOBAL ADMIN
// ═════════════════════════════════════════════════════════════
/**
 * @param {Object} stats    { totalEnseignants, totalEtudiants, totalCours, totalNotes, moyenneGenerale }
 * @param {Array}  etudiants tableau complet
 * @param {Array}  enseignants tableau complet
 * @param {Array}  cours tableau complet
 * @param {Array}  notes tableau complet
 */
export async function generateRapportAdminPDF(stats, etudiants, enseignants, cours, notes) {
  const JsPDF = await getJsPDF();
  const doc = new JsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageWidth  = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  drawHeader(
    doc,
    pageWidth,
    'Rapport Général de l\'Établissement',
    `${new Date().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}`
  );

  let y = 46;

  // ── STATS GLOBALES ──
  y = drawSectionTitle(doc, 'Indicateurs Clés', y, pageWidth, COLORS_PDF.primary);

  const kpis = [
    { label: 'Enseignants',     value: stats.totalEnseignants,   color: COLORS_PDF.primary,   bg: COLORS_PDF.bgBlue  },
    { label: 'Étudiants',       value: stats.totalEtudiants,     color: COLORS_PDF.secondary, bg: COLORS_PDF.bgGreen },
    { label: 'Cours',           value: stats.totalCours,         color: COLORS_PDF.purple,    bg: [245, 243, 255]    },
    { label: 'Notes',           value: stats.totalNotes,         color: COLORS_PDF.orange,    bg: [255, 247, 237]    },
    { label: 'Moy. Générale',   value: `${stats.moyenneGenerale}/20`, color: COLORS_PDF.teal, bg: [240, 253, 250]    },
  ];

  const kpiW = (pageWidth - 28 - 12) / 5;
  kpis.forEach((k, i) => {
    const kx = 14 + i * (kpiW + 3);
    roundedRect(doc, kx, y, kpiW, 20, 2, k.bg, k.color);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(...k.color);
    const vw3 = doc.getTextWidth(String(k.value));
    doc.text(String(k.value), kx + kpiW / 2 - vw3 / 2, y + 10);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6);
    doc.setTextColor(...COLORS_PDF.gray600);
    const lw3 = doc.getTextWidth(k.label);
    doc.text(k.label, kx + kpiW / 2 - lw3 / 2, y + 17);
  });

  y += 26;

  // ── PERFORMANCE ACADÉMIQUE ──
  y = drawSectionTitle(doc, 'Performance Académique', y, pageWidth, COLORS_PDF.secondary);

  const notesValides = notes.filter(n => parseFloat(n.valeur) >= 10).length;
  const notesMoins   = notes.filter(n => parseFloat(n.valeur) < 10).length;
  const tauxReussite = notes.length > 0 ? Math.round((notesValides / notes.length) * 100) : 0;

  const perfRows = [
    { label: 'Notes validées (≥ 10/20)', value: notesValides, pct: tauxReussite,       color: COLORS_PDF.secondary },
    { label: 'Notes en rattrapage (< 10/20)', value: notesMoins, pct: 100 - tauxReussite, color: COLORS_PDF.accent   },
    { label: 'Taux de réussite global',    value: `${tauxReussite}%`, pct: tauxReussite, color: COLORS_PDF.primary  },
  ];

  perfRows.forEach(row => {
    roundedRect(doc, 14, y, pageWidth - 28, 12, 2, COLORS_PDF.gray100, COLORS_PDF.gray200);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...COLORS_PDF.gray700);
    doc.text(row.label, 18, y + 8);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(...row.color);
    const valStr = String(row.value);
    doc.text(valStr, pageWidth - 14 - doc.getTextWidth(valStr) - 2, y + 8);

    // Mini barre
    const barW2 = 60;
    doc.setFillColor(...COLORS_PDF.gray200);
    doc.roundedRect(pageWidth - 80, y + 3, barW2, 4, 1, 1, 'F');
    doc.setFillColor(...row.color);
    doc.roundedRect(pageWidth - 80, y + 3, Math.max(2, barW2 * Math.min(row.pct, 100) / 100), 4, 1, 1, 'F');

    y += 15;
  });

  y += 4;

  // ── TOP COURS ──
  if (cours.length > 0) {
    if (y > pageHeight - 70) { doc.addPage(); drawHeader(doc, pageWidth, 'Rapport Général (suite)', ''); y = 46; }
    y = drawSectionTitle(doc, `Liste des Cours (${cours.length} cours)`, y, pageWidth, COLORS_PDF.teal);

    const rH2 = 7;
    doc.setFillColor(...COLORS_PDF.teal);
    doc.rect(14, y, pageWidth - 28, rH2, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(...COLORS_PDF.white);
    doc.text('Titre', 16, y + 5);
    doc.text('Code', 110, y + 5);
    doc.text('Filière', 130, y + 5);
    doc.text('Niveau', 160, y + 5);
    doc.text('Enseignant', 178, y + 5);
    y += rH2;

    cours.slice(0, 20).forEach((c, idx) => {
      if (y > pageHeight - 20) { doc.addPage(); y = 46; }
      const bg = idx % 2 === 0 ? COLORS_PDF.white : COLORS_PDF.gray100;
      doc.setFillColor(...bg);
      doc.rect(14, y, pageWidth - 28, rH2, 'F');
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.setTextColor(...COLORS_PDF.gray700);
      const t = (c.titre || '').length > 32 ? (c.titre || '').substring(0, 29) + '...' : (c.titre || '');
      doc.text(t, 16, y + 5);
      doc.text(c.code || '-', 110, y + 5);
      doc.text(c.filiere || '-', 130, y + 5);
      doc.text(c.niveau || '-', 160, y + 5);
      const ensName = c.enseignant ? `${c.enseignant.prenom || ''} ${c.enseignant.nom || ''}`.trim() : '-';
      doc.text(ensName.length > 18 ? ensName.substring(0, 15) + '...' : ensName, 178, y + 5);
      doc.setDrawColor(...COLORS_PDF.gray200);
      doc.setLineWidth(0.2);
      doc.line(14, y + rH2, pageWidth - 14, y + rH2);
      y += rH2;
    });

    if (cours.length > 20) {
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(7);
      doc.setTextColor(...COLORS_PDF.gray400);
      doc.text(`... et ${cours.length - 20} autres cours`, 14, y + 6);
      y += 10;
    }
  }

  // ── FOOTER ──
  const totalPages = doc.internal.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    drawFooter(doc, pageWidth, pageHeight, p, totalPages);
  }

  const filename = `rapport_admin_${Date.now()}.pdf`;
  doc.save(filename);
  return filename;
}