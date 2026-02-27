import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { coursService, noteService } from '../../services/api';
import { getUser } from '../../utils/auth';
import Navbar from '../../components/layout/Navbar';
import Modal from '../../components/common/Modal';
// 🆕 IMPORTS ANALYTICS
import { useAnalytics } from '../../hooks/useAnalytics';
import LineChart from '../../components/charts/LineChart';
import BarChart from '../../components/charts/BarChart';
// ✅ IMPORTS EXPORT PDF
import ExportButton from '../../components/export/ExportButton';
import { generateBulletinPDF, generateCertificatPDF } from '../../utils/pdfGenerator';
// 🆕 IMPORT API pour charger les infos étudiant
import axios from 'axios';

// 🎨 PALETTE COULEURS
const COLORS = {
  primary: '#0066CC',
  secondary: '#00A86B',
  accent: '#DC143C',
  purple: '#8B5CF6',
  teal: '#14B8A6',
  orange: '#F97316',
  pink: '#EC4899',

  bgBlue: '#EFF6FF',
  bgGreen: '#F0FDF4',
  bgPurple: '#F5F3FF',
  bgOrange: '#FFF7ED',
  bgPink: '#FFF0F7',

  gray50: '#F9FAFB',
  gray100: '#F3F4F6',
  gray200: '#E5E7EB',
  gray300: '#D1D5DB',
  gray400: '#9CA3AF',
  gray500: '#6B7280',
  gray600: '#4B5563',
  gray700: '#374151',
  gray800: '#1F2937',
  gray900: '#111827',
};

// 🎨 ICÔNES MATIÈRES
const SUBJECT_ICONS = {
  'Anatomie': '🫀',
  'Biochimie': '🧬',
  'Physiologie': '⚛️',
  'Français': '📗',
  'Anglais': '📘',
  'Pharmacologie': '💊',
  'Cardiologie': '💓',
  'Chirurgie': '🔪',
  'default': '📚'
};

// 🎨 COULEURS FILIÈRES
const FILIERE_COLORS = {
  'Médecine': { color: COLORS.accent, bg: '#FFE6EC', icon: '🩺' },
  'Pharmacie': { color: COLORS.teal, bg: COLORS.bgPurple, icon: '💊' },
  'Sciences-Biomédicale': { color: COLORS.purple, bg: COLORS.bgPurple, icon: '🧬' },
  'Chirurgie': { color: COLORS.pink, bg: COLORS.bgPink, icon: '🔪' },
  'default': { color: COLORS.gray600, bg: COLORS.gray100, icon: '🎓' }
};

// 🎨 COULEURS AVATAR pour cours
const AVATAR_COLORS = [
  '#0066CC', '#00A86B', '#DC143C', '#7C3AED',
  '#D97706', '#0891B2', '#059669', '#DB2777',
  '#9333EA', '#EA580C',
];

function getCourseColor(titre = '') {
  let hash = 0;
  for (let i = 0; i < titre.length; i++) hash += titre.charCodeAt(i);
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
}

function getSubjectIcon(titre = '') {
  const key = Object.keys(SUBJECT_ICONS).find(k =>
    (titre || '').toLowerCase().includes(k.toLowerCase())
  );
  return SUBJECT_ICONS[key] || SUBJECT_ICONS.default;
}

export default function DashboardEtudiant() {
  const user = getUser();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [loadingCours, setLoadingCours] = useState(false);
  const [loadingNotes, setLoadingNotes] = useState(false);

  const [notes, setNotes] = useState([]);
  const [cours, setCours] = useState([]);
  const [etudiantInfo, setEtudiantInfo] = useState(null);

  // 🆕 AMÉLIORATION — Données complètes de l'étudiant connecté (matricule, filiere, niveau)
  const [etudiantComplet, setEtudiantComplet] = useState(null);

  const [stats, setStats] = useState({
    totalNotes: 0,
    moyenne: 0,
    meilleureNote: 0,
    coursActifs: 0,
  });

  // Modals
  const [showModalCours, setShowModalCours] = useState(false);
  const [showModalNotes, setShowModalNotes] = useState(false);

  // Accordéons notes (logique originale préservée)
  const [expandedSemestres, setExpandedSemestres] = useState({});

  // 🆕 NAVIGATION NOTES : Cours → Semestre → Note
  const [selectedCours, setSelectedCours] = useState(null);
  const [selectedSemestre, setSelectedSemestre] = useState(null);

  // 🆕 STATS GLOBALES COURS
  const [statsGlobales, setStatsGlobales] = useState(null);
  const [refreshingCours, setRefreshingCours] = useState(false);

  // 🆕 HOOK ANALYTICS
  const { data: analyticsData, loading: analyticsLoading } = useAnalytics();

  // 🔍 DEBUG ANALYTICS
  useEffect(() => {
    console.log('📊 Analytics Data:', analyticsData);
    console.log('⏳ Analytics Loading:', analyticsLoading);
  }, [analyticsData, analyticsLoading]);

  useEffect(() => {
    fetchData();
    fetchEtudiantComplet(); // 🆕 AMÉLIORATION — charger les données étudiant au démarrage
  }, []);

  // ─────────────────────────────────────────────
  // 🆕 AMÉLIORATION — FETCH DONNÉES COMPLÈTES ÉTUDIANT
  // Récupère matricule, filiere, niveau depuis la BDD
  // ─────────────────────────────────────────────
  const fetchEtudiantComplet = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'}/api/mes-informations`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.data.success) {
        setEtudiantComplet(response.data.data);
        console.log('✅ Étudiant complet chargé:', response.data.data);
      }
    } catch (error) {
      console.warn('⚠️ Impossible de charger les infos étudiant complètes:', error);
      // Pas bloquant — le certificat utilisera les données de user en fallback
    }
  };

  // ─────────────────────────────────────────────
  // FETCH NOTES
  // ─────────────────────────────────────────────
  const fetchData = async () => {
    try {
      setLoading(true);
      const notesResponse = await noteService.getMesNotes();

      if (notesResponse.data.success) {
        const mesNotes = notesResponse.data.data || [];
        setNotes(mesNotes);

        if (mesNotes.length > 0) {
          const total = mesNotes.length;
          const somme = mesNotes.reduce((acc, note) => acc + parseFloat(note.valeur || 0), 0);
          const moyenne = (somme / total).toFixed(2);
          const meilleure = Math.max(...mesNotes.map(n => parseFloat(n.valeur || 0)));

          setStats({
            totalNotes: total,
            moyenne: moyenne,
            meilleureNote: meilleure,
            coursActifs: 0,
          });
        }
      }
    } catch (error) {
      console.error('❌ Erreur chargement données:', error);
    } finally {
      setLoading(false);
    }
  };

  // ─────────────────────────────────────────────
  // 🆕 CHARGER COURS (Modal) — avec stats globales
  // ─────────────────────────────────────────────
  const handleVoirCours = async () => {
    try {
      setLoadingCours(true);
      setShowModalCours(true);

      const response = await coursService.getMesCoursEtudiant();

      if (response.data.success) {
        setCours(response.data.data.cours || []);
        setEtudiantInfo(response.data.data.etudiant || null);
        setStatsGlobales(response.data.data.statistiques || null);

        setStats(prev => ({
          ...prev,
          coursActifs: response.data.data.cours.length
        }));
      }
    } catch (error) {
      console.error('❌ Erreur chargement cours:', error);
      setCours([]);
    } finally {
      setLoadingCours(false);
    }
  };

  // 🆕 REFRESH COURS (détecter nouveaux cours automatiquement)
  const handleRefreshCours = async () => {
    try {
      setRefreshingCours(true);
      const response = await coursService.getMesCoursEtudiant();
      if (response.data.success) {
        setCours(response.data.data.cours || []);
        setEtudiantInfo(response.data.data.etudiant || null);
        setStatsGlobales(response.data.data.statistiques || null);
        setStats(prev => ({
          ...prev,
          coursActifs: response.data.data.cours.length
        }));
      }
    } catch (error) {
      console.error('❌ Erreur refresh cours:', error);
    } finally {
      setRefreshingCours(false);
    }
  };

  // 🆕 OUVRIR MODAL NOTES — reset navigation
  const handleVoirNotes = () => {
    setSelectedCours(null);
    setSelectedSemestre(null);
    setShowModalNotes(true);
  };

  // 🆕 NAVIGATION VERS DÉTAIL COURS
  const handleVoirDetailsCours = (idCours) => {
    navigate(`/etudiant/cours/${idCours}`);
  };

  // 🆕 TOGGLE ACCORDÉONS (logique originale préservée)
  const toggleSemestre = (semestre) => {
    setExpandedSemestres(prev => ({ ...prev, [semestre]: !prev[semestre] }));
  };

  // ─────────────────────────────────────────────
  // HELPERS CALCUL
  // ─────────────────────────────────────────────

  // Grouper notes par semestre (logique originale)
  const notesParSemestre = notes.reduce((acc, note) => {
    const semestre = note.semestre || 'S1';
    if (!acc[semestre]) acc[semestre] = [];
    acc[semestre].push(note);
    return acc;
  }, {});

  // 🆕 Grouper notes par cours
  const notesParCours = notes.reduce((acc, note) => {
    const idCours = note.cours?.id_cours || note.id_cours || 'inconnu';
    if (!acc[idCours]) {
      acc[idCours] = {
        id: idCours,
        titre: note.cours?.titre || 'Cours inconnu',
        code: note.cours?.code || '-',
        notes: [],
      };
    }
    acc[idCours].notes.push(note);
    return acc;
  }, {});

  const getMoyenneSemestre = (notesSemestre) => {
    if (!notesSemestre || notesSemestre.length === 0) return '0.00';
    const somme = notesSemestre.reduce((acc, n) => acc + parseFloat(n.valeur || 0), 0);
    return (somme / notesSemestre.length).toFixed(2);
  };

  // 🆕 Données du cours sélectionné
  const coursSelectionne = selectedCours ? notesParCours[selectedCours] : null;

  // 🆕 Semestres du cours sélectionné
  const semestresduCours = coursSelectionne
    ? coursSelectionne.notes.reduce((acc, note) => {
        const s = note.semestre || 'S1';
        if (!acc[s]) acc[s] = [];
        acc[s].push(note);
        return acc;
      }, {})
    : {};

  // 🆕 Notes du semestre sélectionné
  const notesDuSemestre = selectedSemestre ? (semestresduCours[selectedSemestre] || []) : [];

  // 🆕 Titre dynamique du modal notes
  const getModalNotesTitle = () => {
    if (selectedSemestre && coursSelectionne) return `📅 ${selectedSemestre} — ${coursSelectionne.titre}`;
    if (selectedCours && coursSelectionne) return `📚 ${coursSelectionne.titre}`;
    return `📝 Mes Notes (${notes.length} notes)`;
  };

  const getFiliereConfig = (filiere) => FILIERE_COLORS[filiere] || FILIERE_COLORS.default;

  // ─────────────────────────────────────────────
  // ✅ HANDLERS EXPORT PDF
  // ─────────────────────────────────────────────
  const handleExportBulletin = async () => {
    const etudiantData = {
      prenom:    user?.prenom    || '',
      nom:       user?.nom       || '',
      matricule: user?.matricule || '',
      email:     user?.email     || '',
      filiere:   etudiantInfo?.filiere || user?.filiere || '',
      niveau:    etudiantInfo?.niveau  || user?.niveau  || '',
    };

    const statsData = {
      moyenne:       stats.moyenne,
      meilleureNote: stats.meilleureNote,
      totalNotes:    stats.totalNotes,
      tauxReussite:  notes.length > 0
        ? Math.round((notes.filter(n => parseFloat(n.valeur) >= 10).length / notes.length) * 100)
        : 0,
    };

    await generateBulletinPDF(etudiantData, notes, statsData);
  };

  // ✅ AMÉLIORATION — handleExportCertificat utilise etudiantComplet (données BDD)
  // au lieu de user (données JWT qui ne contient pas matricule/filiere/niveau)
  const handleExportCertificat = async () => {
    const etudiantData = {
      prenom:         etudiantComplet?.prenom         || user?.prenom         || '',
      nom:            etudiantComplet?.nom             || user?.nom            || '',
      matricule:      etudiantComplet?.matricule       || user?.matricule      || 'N/A',
      email:          etudiantComplet?.email           || user?.email          || '',
      filiere:        etudiantComplet?.filiere         || etudiantInfo?.filiere || user?.filiere || 'N/A',
      niveau:         etudiantComplet?.niveau          || etudiantInfo?.niveau  || user?.niveau  || 'N/A',
      date_naissance: etudiantComplet?.date_naissance  || user?.date_naissance  || '',
    };
    await generateCertificatPDF(etudiantData);
  };

  // ═══════════════════════════════════════════════════════
  // RENDU
  // ═══════════════════════════════════════════════════════
  return (
    <div className="min-h-screen" style={{ backgroundColor: COLORS.gray50 }}>
      <Navbar />

      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateX(16px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes spinAnim {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .nav-anim { animation: fadeSlideIn 0.25s ease both; }
        .item-anim { animation: fadeIn 0.2s ease both; }

        /* ── Modal Cours ── */
        .cours-card-modal { transition: all 0.25s ease; }
        .cours-card-modal:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 28px rgba(0,102,204,0.15) !important;
          border-color: #93C5FD !important;
        }
        .refresh-btn:hover { background: #DBEAFE !important; }
        .refresh-btn { transition: all 0.2s ease; }
        .stat-mini { transition: all 0.2s ease; }
        .stat-mini:hover { transform: scale(1.03); }

        /* ── Modal Notes ── */
        .cours-card-note { transition: all 0.25s ease; }
        .cours-card-note:hover {
          transform: translateY(-3px);
          box-shadow: 0 12px 28px rgba(0,102,204,0.15) !important;
          border-color: #93C5FD !important;
        }
        .semestre-card { transition: all 0.25s ease; }
        .semestre-card:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(0,0,0,0.1) !important; }
        .note-detail-card { transition: all 0.2s ease; }
        .note-detail-card:hover { box-shadow: 0 6px 16px rgba(0,0,0,0.08) !important; }
        .breadcrumb-btn:hover { background: #DBEAFE !important; }
        .breadcrumb-btn { transition: all 0.15s ease; }

        /* ── Bouton voir détails cours modal ── */
        .btn-voir-cours { transition: all 0.2s ease; }
        .btn-voir-cours:hover { background: #0066CC !important; color: white !important; }
      `}</style>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* ══════════════════════════════════════════════
            🎯 HEADER — avec boutons export
        ══════════════════════════════════════════════ */}
        <div className="mb-8">
          <div className="flex items-center justify-between gap-3 mb-2 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-3xl">👨‍🎓</span>
              </div>
              <div>
                <h1 className="text-3xl font-bold" style={{ color: COLORS.gray900 }}>
                  Tableau de bord Étudiant
                </h1>
                <p className="text-sm" style={{ color: COLORS.gray600 }}>
                  Bienvenue <span className="font-semibold" style={{ color: COLORS.primary }}>{user?.prenom}</span> !
                  Voici votre parcours académique.
                </p>
              </div>
            </div>

            {/* ✅ BOUTONS EXPORT PDF */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
              <ExportButton
                onClick={handleExportBulletin}
                label="Bulletin PDF"
                icon="📄"
                variant="pdf"
                size="md"
                disabled={notes.length === 0}
                tooltip={notes.length === 0 ? 'Aucune note disponible' : 'Télécharger votre bulletin de notes'}
              />
              <ExportButton
                onClick={handleExportCertificat}
                label="Certificat"
                icon="🎓"
                variant="secondary"
                size="md"
                tooltip="Télécharger votre certificat de scolarité"
              />
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════════
            📊 STATISTIQUES CLIQUABLES
        ══════════════════════════════════════════════ */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">

          {/* TOTAL NOTES */}
          <div
            onClick={handleVoirNotes}
            className="bg-white rounded-2xl shadow-lg p-6 border hover:shadow-2xl transition-all cursor-pointer group"
            style={{ borderColor: COLORS.gray200 }}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center">
                <span className="text-2xl">📚</span>
              </div>
              <span className="text-3xl font-bold" style={{ color: COLORS.primary }}>{stats.totalNotes}</span>
            </div>
            <p className="text-sm font-medium" style={{ color: COLORS.gray700 }}>Total Notes</p>
            <p className="text-xs mt-1 group-hover:text-blue-600 transition-colors" style={{ color: COLORS.gray500 }}>
              Cliquer pour détails →
            </p>
          </div>

          {/* MOYENNE GÉNÉRALE */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border hover:shadow-xl transition-all" style={{ borderColor: COLORS.gray200 }}>
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-600 rounded-xl flex items-center justify-center">
                <span className="text-2xl">📊</span>
              </div>
              <span className="text-3xl font-bold" style={{ color: COLORS.secondary }}>{stats.moyenne}/20</span>
            </div>
            <p className="text-sm font-medium" style={{ color: COLORS.gray700 }}>Moyenne Générale</p>
            <p className="text-xs mt-1" style={{ color: COLORS.gray500 }}>Toutes matières</p>
          </div>

          {/* MEILLEURE NOTE */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border hover:shadow-xl transition-all" style={{ borderColor: COLORS.gray200 }}>
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-violet-600 rounded-xl flex items-center justify-center">
                <span className="text-2xl">🏆</span>
              </div>
              <span className="text-3xl font-bold" style={{ color: COLORS.purple }}>{stats.meilleureNote}/20</span>
            </div>
            <p className="text-sm font-medium" style={{ color: COLORS.gray700 }}>Meilleure Note</p>
            <p className="text-xs mt-1" style={{ color: COLORS.gray500 }}>Record personnel</p>
          </div>

          {/* COURS EN COURS */}
          <div
            onClick={handleVoirCours}
            className="bg-white rounded-2xl shadow-lg p-6 border hover:shadow-2xl transition-all cursor-pointer group"
            style={{ borderColor: COLORS.gray200 }}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-amber-600 rounded-xl flex items-center justify-center">
                <span className="text-2xl">📖</span>
              </div>
              <span className="text-3xl font-bold" style={{ color: COLORS.orange }}>{stats.coursActifs}</span>
            </div>
            <p className="text-sm font-medium" style={{ color: COLORS.gray700 }}>Cours en cours</p>
            <p className="text-xs mt-1 group-hover:text-orange-600 transition-colors" style={{ color: COLORS.gray500 }}>
              Cliquer pour voir →
            </p>
          </div>
        </div>

        {/* ══════════════════════════════════════════════
            📝 TABLEAU MES NOTES RÉCENTES
        ══════════════════════════════════════════════ */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border" style={{ borderColor: COLORS.gray200 }}>
          <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                <span className="text-2xl">📝</span>
              </div>
              <div>
                <h2 className="text-2xl font-bold" style={{ color: COLORS.gray900 }}>Mes Notes Récentes</h2>
                <p className="text-sm" style={{ color: COLORS.gray600 }}>
                  {notes.length} note{notes.length > 1 ? 's' : ''} • Moyenne : {stats.moyenne}/20
                </p>
              </div>
            </div>

            {/* ✅ BOUTON EXPORT BULLETIN dans la section notes */}
            {notes.length > 0 && (
              <ExportButton
                onClick={handleExportBulletin}
                label="Télécharger Bulletin"
                icon="📄"
                variant="pdf"
                size="sm"
                tooltip="Exporter toutes mes notes en PDF"
              />
            )}
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block rounded-full h-12 w-12 border-b-2" style={{ borderColor: COLORS.primary, animation: 'spinAnim 0.9s linear infinite' }}></div>
              <p className="mt-4" style={{ color: COLORS.gray600 }}>Chargement...</p>
            </div>
          ) : notes.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-5xl">📝</span>
              </div>
              <p className="text-xl font-semibold mb-2" style={{ color: COLORS.gray700 }}>Aucune note disponible</p>
              <p className="text-sm" style={{ color: COLORS.gray500 }}>Vos notes apparaîtront ici</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cours</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Note</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Semestre</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {notes.slice(0, 10).map((note) => (
                    <tr key={note.id_note} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{getSubjectIcon(note.cours?.titre)}</span>
                          <div>
                            <div className="text-sm font-medium text-gray-900">{note.cours?.titre || 'Cours inconnu'}</div>
                            <div className="text-sm text-gray-500">{note.cours?.code || '-'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`text-lg font-bold ${parseFloat(note.valeur) >= 10 ? 'text-green-600' : 'text-red-600'}`}>
                          {note.valeur}/20
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(note.date_evaluation || note.created_at).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs font-semibold rounded-full" style={{ backgroundColor: COLORS.bgBlue, color: COLORS.primary }}>
                          {note.semestre || 'S1'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {parseFloat(note.valeur) >= 10 ? (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">✅ Validé</span>
                        ) : note.est_rattrape ? (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">🎓 Rattrapé</span>
                        ) : (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-orange-100 text-orange-800">🔄 Rattrapage</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ══════════════════════════════════════════════
            📊 SECTION ANALYTICS
        ══════════════════════════════════════════════ */}
        <div className="mt-8 bg-white rounded-2xl shadow-xl p-8 border" style={{ borderColor: COLORS.gray200 }}>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
              <span className="text-2xl">📊</span>
            </div>
            <div>
              <h2 className="text-2xl font-bold" style={{ color: COLORS.gray900 }}>Mes Statistiques</h2>
              <p className="text-sm" style={{ color: COLORS.gray600 }}>Analyse détaillée de votre performance académique</p>
            </div>
          </div>

          {analyticsLoading ? (
            <div className="text-center py-12">
              <div className="inline-block rounded-full h-12 w-12 border-b-2" style={{ borderColor: COLORS.primary, animation: 'spinAnim 0.9s linear infinite' }}></div>
              <p className="mt-4" style={{ color: COLORS.gray600 }}>Chargement des statistiques...</p>
            </div>
          ) : analyticsData ? (
            <div className="space-y-6">
              {analyticsData.evolution_notes && analyticsData.evolution_notes.length > 0 && (
                <LineChart
                  data={analyticsData.evolution_notes}
                  dataKey="moyenne"
                  xKey="semestre"
                  title="📈 Évolution de mes notes par semestre"
                  color={COLORS.primary}
                  height={300}
                />
              )}

              {analyticsData.comparaison_classe && analyticsData.comparaison_classe.length > 0 && (
                <div>
                  <h3 className="text-lg font-bold mb-4 flex items-center gap-2" style={{ color: COLORS.gray800 }}>
                    <span>📊</span> Comparaison avec la moyenne de classe
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {analyticsData.comparaison_classe.map((comp, index) => {
                      const maNoteVal = parseFloat(comp.ma_note);
                      const moyenneClasseVal = parseFloat(comp.moyenne_classe);
                      const difference = maNoteVal - moyenneClasseVal;
                      const estMieux = difference > 0;
                      const estEgal = difference === 0;
                      const estMoins = difference < 0;

                      return (
                        <div key={index} className="border rounded-xl p-4 hover:shadow-lg transition-all" style={{ borderColor: COLORS.gray200 }}>
                          <div className="flex items-center gap-2 mb-3">
                            <span className="text-2xl">{getSubjectIcon(comp.cours)}</span>
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-sm truncate" style={{ color: COLORS.gray900 }}>{comp.cours}</p>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-xs" style={{ color: COLORS.gray600 }}>Ma note :</span>
                              <span className="text-lg font-bold" style={{ color: COLORS.primary }}>{comp.ma_note}/20</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-xs" style={{ color: COLORS.gray600 }}>Moyenne classe :</span>
                              <span className="text-lg font-bold" style={{ color: COLORS.gray500 }}>{comp.moyenne_classe}/20</span>
                            </div>
                            <div className="pt-2 border-t" style={{ borderColor: COLORS.gray200 }}>
                              {estMieux && (
                                <>
                                  <div className="flex items-center justify-center gap-2">
                                    <span className="text-sm font-bold text-green-600">▲ +{difference.toFixed(2)} points</span>
                                    <span className="text-lg">✅</span>
                                  </div>
                                  <p className="text-xs text-center mt-1 text-green-600">Au-dessus de la moyenne</p>
                                </>
                              )}
                              {estEgal && (
                                <>
                                  <div className="flex items-center justify-center gap-2">
                                    <span className="text-sm font-bold text-blue-600">= Dans la moyenne</span>
                                    <span className="text-lg">📊</span>
                                  </div>
                                  <p className="text-xs text-center mt-1 text-blue-600">Exactement à la moyenne de classe</p>
                                </>
                              )}
                              {estMoins && (
                                <>
                                  <div className="flex items-center justify-center gap-2">
                                    <span className="text-sm font-bold text-orange-600">▼ {difference.toFixed(2)} points</span>
                                    <span className="text-lg">📈</span>
                                  </div>
                                  <p className="text-xs text-center mt-1 text-orange-600">Marge de progression</p>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {(!analyticsData.evolution_notes || analyticsData.evolution_notes.length === 0) &&
                (!analyticsData.comparaison_classe || analyticsData.comparaison_classe.length === 0) && (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-3xl">📊</span>
                    </div>
                    <p className="text-lg font-semibold mb-2" style={{ color: COLORS.gray700 }}>Pas encore de statistiques</p>
                    <p className="text-sm" style={{ color: COLORS.gray500 }}>Vos statistiques apparaîtront une fois que vous aurez des notes</p>
                  </div>
                )}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">📊</span>
              </div>
              <p className="text-lg font-semibold mb-2" style={{ color: COLORS.gray700 }}>Statistiques non disponibles</p>
            </div>
          )}
        </div>

      </div>

      {/* ══════════════════════════════════════════════════════════
          🆕 MODAL MES COURS — Filière + Niveau + Stats + Refresh
      ══════════════════════════════════════════════════════════ */}
      <Modal
        isOpen={showModalCours}
        onClose={() => setShowModalCours(false)}
        title=""
      >
        {/* Header custom modal cours */}
        <div style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '6px' }}>
            <div>
              <h2 style={{ fontWeight: '800', fontSize: '1.2rem', color: COLORS.gray900, margin: '0 0 8px' }}>
                📖 Mes Cours
              </h2>
              {etudiantInfo && (
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  <span style={{
                    fontSize: '0.75rem', fontWeight: '700', padding: '3px 12px', borderRadius: '999px',
                    background: '#EFF6FF', color: COLORS.primary, border: '1px solid #BFDBFE',
                  }}>
                    🎓 {etudiantInfo.filiere}
                  </span>
                  <span style={{
                    fontSize: '0.75rem', fontWeight: '700', padding: '3px 12px', borderRadius: '999px',
                    background: '#F5F3FF', color: '#7C3AED', border: '1px solid #DDD6FE',
                  }}>
                    📚 {etudiantInfo.niveau}
                  </span>
                </div>
              )}
            </div>

            {/* Bouton Actualiser */}
            <button
              onClick={handleRefreshCours}
              disabled={refreshingCours}
              className="refresh-btn"
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '8px 14px', borderRadius: '10px',
                border: '1.5px solid #BFDBFE', background: '#EFF6FF',
                color: COLORS.primary, fontSize: '0.8rem', fontWeight: '700',
                cursor: refreshingCours ? 'not-allowed' : 'pointer',
                flexShrink: 0,
              }}
            >
              <span style={{ display: 'inline-block', animation: refreshingCours ? 'spinAnim 0.8s linear infinite' : 'none' }}>
                🔄
              </span>
              {refreshingCours ? 'Actualisation...' : 'Actualiser'}
            </button>
          </div>

          {/* Stats globales */}
          {statsGlobales && cours.length > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', marginTop: '14px' }}>
              {[
                { label: 'Total cours', value: statsGlobales.total_cours, color: COLORS.primary, bg: '#EFF6FF', icon: '📚' },
                { label: 'Notés', value: statsGlobales.cours_avec_note, color: '#7C3AED', bg: '#F5F3FF', icon: '📝' },
                { label: 'Validés', value: statsGlobales.cours_valides, color: COLORS.secondary, bg: '#F0FDF4', icon: '✅' },
                {
                  label: 'Moyenne',
                  value: statsGlobales.moyenne_generale ? `${statsGlobales.moyenne_generale}/20` : 'N/A',
                  color: statsGlobales.moyenne_generale && parseFloat(statsGlobales.moyenne_generale) >= 10 ? COLORS.secondary : COLORS.accent,
                  bg: statsGlobales.moyenne_generale && parseFloat(statsGlobales.moyenne_generale) >= 10 ? '#F0FDF4' : '#FFF7ED',
                  icon: '📊',
                },
              ].map((stat) => (
                <div key={stat.label} className="stat-mini" style={{
                  padding: '10px', borderRadius: '10px', background: stat.bg,
                  textAlign: 'center', border: `1px solid ${stat.color}20`,
                }}>
                  <p style={{ fontSize: '1rem', margin: '0 0 2px' }}>{stat.icon}</p>
                  <p style={{ fontWeight: '900', fontSize: '0.95rem', color: stat.color, margin: '0 0 2px' }}>{stat.value}</p>
                  <p style={{ fontSize: '0.65rem', color: '#9CA3AF', margin: 0, fontWeight: '600' }}>{stat.label}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Contenu du modal cours */}
        {loadingCours ? (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <div style={{
              width: '48px', height: '48px', margin: '0 auto',
              borderRadius: '50%', border: '4px solid #E5EBF5',
              borderTop: `4px solid ${COLORS.primary}`,
              animation: 'spinAnim 0.9s linear infinite',
            }} />
            <p style={{ color: '#9CA3AF', marginTop: '12px', fontWeight: '500' }}>Chargement de vos cours...</p>
          </div>
        ) : cours.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <div style={{
              width: '72px', height: '72px', margin: '0 auto 16px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #EFF6FF, #DBEAFE)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '2rem',
            }}>
              📚
            </div>
            <p style={{ fontSize: '1.05rem', fontWeight: '700', color: COLORS.gray700, margin: '0 0 6px' }}>
              Aucun cours disponible
            </p>
            <p style={{ fontSize: '0.85rem', color: '#9CA3AF', margin: '0 0 16px' }}>
              {etudiantInfo
                ? `Aucun cours trouvé pour ${etudiantInfo.filiere} - ${etudiantInfo.niveau}`
                : 'Vos cours apparaîtront ici'}
            </p>
            <button
              onClick={handleRefreshCours}
              disabled={refreshingCours}
              style={{
                padding: '10px 20px', borderRadius: '10px',
                background: 'linear-gradient(135deg, #0066CC, #0052A3)',
                color: 'white', fontWeight: '700', fontSize: '0.85rem',
                border: 'none', cursor: 'pointer',
              }}
            >
              🔄 Vérifier les nouveaux cours
            </button>
          </div>
        ) : (
          <div style={{ overflowY: 'auto', maxHeight: '60vh' }}>
            <p style={{ fontSize: '0.75rem', color: '#9CA3AF', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>
              {cours.length} cours disponible{cours.length > 1 ? 's' : ''} pour votre filière
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {cours.map((c, index) => (
                <div
                  key={c.id_cours}
                  className="cours-card-modal bg-white rounded-xl overflow-hidden cursor-pointer"
                  style={{
                    border: '1.5px solid #E5E7EB',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                  }}
                  onClick={() => handleVoirDetailsCours(c.id_cours)}
                >
                  {/* Header gradient */}
                  <div className="bg-gradient-to-br from-blue-400 to-indigo-600 p-4" style={{ position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', top: '-15px', right: '-15px', width: '70px', height: '70px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', pointerEvents: 'none' }} />
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span style={{
                        fontSize: '0.7rem', fontWeight: '800', color: 'white',
                        background: 'rgba(255,255,255,0.2)', padding: '2px 8px', borderRadius: '999px',
                        fontFamily: 'monospace',
                      }}>
                        {c.code}
                      </span>
                      <span style={{ fontSize: '1.5rem' }}>{getSubjectIcon(c.titre)}</span>
                    </div>
                    <h3 style={{ fontWeight: '800', color: 'white', fontSize: '0.95rem', margin: 0, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                      {c.titre}
                    </h3>
                  </div>

                  {/* Content */}
                  <div style={{ padding: '14px' }}>
                    {/* Enseignant */}
                    {c.enseignant && (
                      <div style={{
                        display: 'flex', alignItems: 'center', gap: '8px',
                        padding: '8px 10px', borderRadius: '8px',
                        background: COLORS.gray50, marginBottom: '10px',
                      }}>
                        <span style={{ fontSize: '1rem' }}>👨‍🏫</span>
                        <div style={{ overflow: 'hidden' }}>
                          <p style={{ fontWeight: '700', fontSize: '0.8rem', color: COLORS.gray900, margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {c.enseignant?.prenom} {c.enseignant?.nom}
                          </p>
                          <p style={{ fontSize: '0.7rem', color: COLORS.gray500, margin: 0 }}>
                            {c.enseignant?.specialite || 'Enseignant'}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Note */}
                    {c.ma_note ? (
                      <div style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '10px 12px', borderRadius: '10px', marginBottom: '10px',
                        background: parseFloat(c.ma_note) >= 10 ? '#F0FDF4' : '#FFF7ED',
                        border: `1px solid ${parseFloat(c.ma_note) >= 10 ? '#BBF7D0' : '#FED7AA'}`,
                      }}>
                        <span style={{ fontSize: '0.8rem', fontWeight: '600', color: COLORS.gray700 }}>Ma note :</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{
                            fontWeight: '900', fontSize: '1.1rem',
                            color: parseFloat(c.ma_note) >= 10 ? '#16A34A' : '#DC2626',
                          }}>
                            {c.ma_note}/20
                          </span>
                          <span>{parseFloat(c.ma_note) >= 10 ? '✅' : c.est_rattrape ? '🎓' : '🔄'}</span>
                        </div>
                      </div>
                    ) : (
                      <div style={{
                        padding: '10px', borderRadius: '10px', marginBottom: '10px',
                        background: COLORS.gray50, textAlign: 'center',
                      }}>
                        <span style={{ fontSize: '0.8rem', color: COLORS.gray500 }}>⏳ Pas encore de note</span>
                      </div>
                    )}

                    {/* Bouton voir détails */}
                    <button
                      className="btn-voir-cours"
                      onClick={(e) => { e.stopPropagation(); handleVoirDetailsCours(c.id_cours); }}
                      style={{
                        width: '100%', padding: '8px', borderRadius: '8px',
                        background: '#EFF6FF', color: COLORS.primary,
                        fontWeight: '700', fontSize: '0.82rem',
                        border: '1px solid #BFDBFE', cursor: 'pointer',
                      }}
                    >
                      Voir détails →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </Modal>

      {/* ══════════════════════════════════════════════════════════
          🆕 MODAL MES NOTES — Navigation Cours → Semestre → Note
      ══════════════════════════════════════════════════════════ */}
      <Modal
        isOpen={showModalNotes}
        onClose={() => { setShowModalNotes(false); setSelectedCours(null); setSelectedSemestre(null); }}
        title={getModalNotesTitle()}
      >
        {notes.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">📝</span>
            </div>
            <p className="text-lg font-semibold mb-2" style={{ color: COLORS.gray700 }}>Aucune note</p>
          </div>
        ) : (
          <div style={{ maxHeight: '75vh', overflowY: 'auto' }}>

            {/* ── BREADCRUMB navigation ── */}
            {(selectedCours || selectedSemestre) && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }} className="nav-anim">
                <button
                  className="breadcrumb-btn"
                  style={{
                    display: 'flex', alignItems: 'center', gap: '4px',
                    padding: '5px 12px', borderRadius: '8px', fontSize: '0.82rem', fontWeight: '700',
                    background: '#EFF6FF', color: COLORS.primary, border: '1px solid #BFDBFE', cursor: 'pointer',
                  }}
                  onClick={() => { setSelectedCours(null); setSelectedSemestre(null); }}
                >
                  📚 Tous les cours
                </button>

                {selectedCours && (
                  <>
                    <span style={{ color: COLORS.gray300, fontSize: '1.1rem' }}>›</span>
                    <button
                      className="breadcrumb-btn"
                      style={{
                        display: 'flex', alignItems: 'center', gap: '4px',
                        padding: '5px 12px', borderRadius: '8px', fontSize: '0.82rem', fontWeight: '700',
                        background: selectedSemestre ? '#EFF6FF' : COLORS.primary,
                        color: selectedSemestre ? COLORS.primary : 'white',
                        border: selectedSemestre ? '1px solid #BFDBFE' : 'none',
                        cursor: 'pointer',
                      }}
                      onClick={() => setSelectedSemestre(null)}
                    >
                      {getSubjectIcon(coursSelectionne?.titre)} {coursSelectionne?.titre}
                    </button>
                  </>
                )}

                {selectedSemestre && (
                  <>
                    <span style={{ color: COLORS.gray300, fontSize: '1.1rem' }}>›</span>
                    <span style={{
                      padding: '5px 12px', borderRadius: '8px', fontSize: '0.82rem', fontWeight: '800',
                      background: COLORS.primary, color: 'white',
                    }}>
                      📅 {selectedSemestre}
                    </span>
                  </>
                )}
              </div>
            )}

            {/* ══════════════════════════════════════
                NIVEAU 1 — Liste des COURS
            ══════════════════════════════════════ */}
            {!selectedCours && (
              <div className="space-y-3 nav-anim">
                <p style={{ fontSize: '0.78rem', color: COLORS.gray500, fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>
                  {Object.keys(notesParCours).length} cours avec des notes
                </p>

                {Object.values(notesParCours).map((coursItem, index) => {
                  const moyenneCours = getMoyenneSemestre(coursItem.notes);
                  const nbSemestres = Object.keys(
                    coursItem.notes.reduce((acc, n) => { acc[n.semestre || 'S1'] = true; return acc; }, {})
                  ).length;
                  const couleur = getCourseColor(coursItem.titre);
                  const validated = coursItem.notes.every(n => parseFloat(n.valeur) >= 10);
                  const hasRattrapage = coursItem.notes.some(n => parseFloat(n.valeur) < 10 && !n.est_rattrape);

                  return (
                    <div
                      key={coursItem.id}
                      className="cours-card-note item-anim"
                      style={{
                        animationDelay: `${index * 40}ms`,
                        background: 'white',
                        border: '1.5px solid #E5E7EB',
                        borderRadius: '14px',
                        padding: '16px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '14px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                      }}
                      onClick={() => setSelectedCours(coursItem.id)}
                    >
                      {/* Avatar couleur */}
                      <div style={{
                        width: '50px', height: '50px', borderRadius: '12px', flexShrink: 0,
                        background: `linear-gradient(135deg, ${couleur}, ${couleur}BB)`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '1.5rem',
                        boxShadow: `0 4px 12px ${couleur}40`,
                      }}>
                        {getSubjectIcon(coursItem.titre)}
                      </div>

                      {/* Infos cours */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontWeight: '800', color: COLORS.gray900, fontSize: '0.95rem', margin: '0 0 2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {coursItem.titre}
                        </p>
                        <p style={{ fontSize: '0.72rem', color: COLORS.gray500, margin: '0 0 6px', fontFamily: 'monospace' }}>
                          {coursItem.code}
                        </p>
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                          <span style={{ fontSize: '0.7rem', fontWeight: '700', padding: '2px 8px', borderRadius: '999px', background: '#EFF6FF', color: COLORS.primary }}>
                            {coursItem.notes.length} note{coursItem.notes.length > 1 ? 's' : ''}
                          </span>
                          <span style={{ fontSize: '0.7rem', fontWeight: '700', padding: '2px 8px', borderRadius: '999px', background: '#F3F4F6', color: COLORS.gray600 }}>
                            {nbSemestres} semestre{nbSemestres > 1 ? 's' : ''}
                          </span>
                        </div>
                      </div>

                      {/* Moyenne + flèche */}
                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <p style={{
                          fontSize: '1.3rem', fontWeight: '800', margin: '0 0 4px',
                          color: parseFloat(moyenneCours) >= 10 ? '#16A34A' : '#DC2626',
                        }}>
                          {moyenneCours}/20
                        </p>
                        <span style={{
                          fontSize: '0.68rem', fontWeight: '700', padding: '2px 8px', borderRadius: '999px',
                          background: validated ? '#F0FDF4' : hasRattrapage ? '#FFF7ED' : '#F0FDF4',
                          color: validated ? '#16A34A' : hasRattrapage ? '#D97706' : '#16A34A',
                        }}>
                          {validated ? '✅ Validé' : hasRattrapage ? '🔄 Rattrapage' : '🎓 OK'}
                        </span>
                        <p style={{ fontSize: '1rem', color: COLORS.gray300, margin: '6px 0 0', textAlign: 'center' }}>›</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* ══════════════════════════════════════
                NIVEAU 2 — Semestres du cours
            ══════════════════════════════════════ */}
            {selectedCours && !selectedSemestre && coursSelectionne && (
              <div className="space-y-3 nav-anim">
                <p style={{ fontSize: '0.78rem', color: COLORS.gray500, fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>
                  {Object.keys(semestresduCours).length} semestre{Object.keys(semestresduCours).length > 1 ? 's' : ''} disponible{Object.keys(semestresduCours).length > 1 ? 's' : ''}
                </p>

                {Object.keys(semestresduCours).sort().map((semestre, index) => {
                  const notesSem = semestresduCours[semestre];
                  const moyenneSem = getMoyenneSemestre(notesSem);
                  const validated = notesSem.every(n => parseFloat(n.valeur) >= 10);
                  const hasRattrapage = notesSem.some(n => parseFloat(n.valeur) < 10 && !n.est_rattrape);

                  return (
                    <div
                      key={semestre}
                      className="semestre-card item-anim"
                      style={{
                        animationDelay: `${index * 50}ms`,
                        background: 'white',
                        borderRadius: '14px',
                        border: '1.5px solid #E5E7EB',
                        padding: '18px 20px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '16px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                      }}
                      onClick={() => setSelectedSemestre(semestre)}
                    >
                      {/* Badge semestre */}
                      <div style={{
                        width: '54px', height: '54px', borderRadius: '14px', flexShrink: 0,
                        background: 'linear-gradient(135deg, #0066CC, #0052A3)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexDirection: 'column',
                        boxShadow: '0 4px 12px rgba(0,102,204,0.35)',
                      }}>
                        <span style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.8)', fontWeight: '700', textTransform: 'uppercase' }}>SEM</span>
                        <span style={{ fontSize: '1.2rem', color: 'white', fontWeight: '900', lineHeight: 1 }}>{semestre.replace('S', '')}</span>
                      </div>

                      <div style={{ flex: 1 }}>
                        <p style={{ fontWeight: '800', color: COLORS.gray900, fontSize: '1rem', margin: '0 0 4px' }}>
                          Semestre {semestre.replace('S', '')}
                        </p>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <span style={{ fontSize: '0.7rem', fontWeight: '700', padding: '2px 8px', borderRadius: '999px', background: '#EFF6FF', color: COLORS.primary }}>
                            {notesSem.length} note{notesSem.length > 1 ? 's' : ''}
                          </span>
                          <span style={{
                            fontSize: '0.7rem', fontWeight: '700', padding: '2px 8px', borderRadius: '999px',
                            background: validated ? '#F0FDF4' : hasRattrapage ? '#FFF7ED' : '#F0FDF4',
                            color: validated ? '#16A34A' : hasRattrapage ? '#D97706' : '#16A34A',
                          }}>
                            {validated ? '✅ Validé' : hasRattrapage ? '🔄 Rattrapage' : '🎓 OK'}
                          </span>
                        </div>
                      </div>

                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <p style={{ fontSize: '1.5rem', fontWeight: '800', margin: 0, color: parseFloat(moyenneSem) >= 10 ? '#16A34A' : '#DC2626' }}>
                          {moyenneSem}/20
                        </p>
                        <p style={{ fontSize: '0.72rem', color: COLORS.gray400, margin: '2px 0 0' }}>moyenne</p>
                        <p style={{ fontSize: '1rem', color: COLORS.gray300, margin: '4px 0 0', textAlign: 'center' }}>›</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* ══════════════════════════════════════
                NIVEAU 3 — Notes du semestre
            ══════════════════════════════════════ */}
            {selectedCours && selectedSemestre && (
              <div className="space-y-3 nav-anim">
                <p style={{ fontSize: '0.78rem', color: COLORS.gray500, fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>
                  {notesDuSemestre.length} note{notesDuSemestre.length > 1 ? 's' : ''} pour ce semestre
                </p>

                {notesDuSemestre.map((note, index) => {
                  const valeur = parseFloat(note.valeur);
                  const isValidated = valeur >= 10;
                  const isRattrape = note.est_rattrape;

                  return (
                    <div
                      key={note.id_note}
                      className="note-detail-card item-anim"
                      style={{
                        animationDelay: `${index * 50}ms`,
                        background: 'white',
                        border: `1.5px solid ${isValidated ? '#BBF7D0' : '#FED7AA'}`,
                        borderLeft: `4px solid ${isValidated ? '#16A34A' : '#DC2626'}`,
                        borderRadius: '14px',
                        padding: '18px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px' }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                            <span style={{ fontSize: '1.8rem' }}>{getSubjectIcon(note.cours?.titre)}</span>
                            <div>
                              <p style={{ fontWeight: '800', color: COLORS.gray900, fontSize: '0.95rem', margin: 0 }}>
                                {note.cours?.titre || 'Cours inconnu'}
                              </p>
                              <p style={{ fontSize: '0.72rem', color: COLORS.gray500, margin: 0, fontFamily: 'monospace' }}>
                                {note.cours?.code || '-'}
                              </p>
                            </div>
                          </div>

                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                            <div style={{ padding: '8px', borderRadius: '8px', background: '#F9FAFB' }}>
                              <p style={{ fontSize: '0.68rem', color: COLORS.gray500, margin: '0 0 2px', fontWeight: '600' }}>📅 Date évaluation</p>
                              <p style={{ fontSize: '0.82rem', color: COLORS.gray800, margin: 0, fontWeight: '700' }}>
                                {new Date(note.date_evaluation || note.created_at).toLocaleDateString('fr-FR')}
                              </p>
                            </div>
                            <div style={{ padding: '8px', borderRadius: '8px', background: '#F9FAFB' }}>
                              <p style={{ fontSize: '0.68rem', color: COLORS.gray500, margin: '0 0 2px', fontWeight: '600' }}>📌 Session</p>
                              <p style={{ fontSize: '0.82rem', color: COLORS.gray800, margin: 0, fontWeight: '700' }}>
                                {note.session || 'Normale'}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Cercle note */}
                        <div style={{ textAlign: 'center', flexShrink: 0 }}>
                          <div style={{
                            width: '72px', height: '72px', borderRadius: '50%', margin: '0 auto 8px',
                            background: isValidated
                              ? 'linear-gradient(135deg, #16A34A, #15803D)'
                              : 'linear-gradient(135deg, #DC2626, #B91C1C)',
                            display: 'flex', flexDirection: 'column',
                            alignItems: 'center', justifyContent: 'center',
                            boxShadow: isValidated
                              ? '0 6px 16px rgba(22,163,74,0.4)'
                              : '0 6px 16px rgba(220,38,38,0.4)',
                          }}>
                            <span style={{ color: 'white', fontWeight: '900', fontSize: '1.2rem', lineHeight: 1 }}>{note.valeur}</span>
                            <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.62rem', fontWeight: '600' }}>/20</span>
                          </div>
                          <span style={{
                            fontSize: '0.7rem', fontWeight: '800', padding: '3px 10px', borderRadius: '999px',
                            background: isValidated ? '#F0FDF4' : isRattrape ? '#EFF6FF' : '#FFF7ED',
                            color: isValidated ? '#16A34A' : isRattrape ? COLORS.primary : '#D97706',
                          }}>
                            {isValidated ? '✅ Validé' : isRattrape ? '🎓 Rattrapé' : '🔄 Rattrapage'}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

          </div>
        )}
      </Modal>
    </div>
  );
}