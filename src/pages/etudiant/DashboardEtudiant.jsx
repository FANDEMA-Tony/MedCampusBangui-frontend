import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { coursService, noteService } from '../../services/api';
import { getUser } from '../../utils/auth';
import Navbar from '../../components/layout/Navbar';
import Modal from '../../components/common/Modal';

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

export default function DashboardEtudiant() {
  const user = getUser();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [loadingCours, setLoadingCours] = useState(false);
  const [loadingNotes, setLoadingNotes] = useState(false);

  const [notes, setNotes] = useState([]);
  const [cours, setCours] = useState([]);
  const [etudiantInfo, setEtudiantInfo] = useState(null);

  const [stats, setStats] = useState({
    totalNotes: 0,
    moyenne: 0,
    meilleureNote: 0,
    coursActifs: 0,
  });

  // Modals
  const [showModalCours, setShowModalCours] = useState(false);
  const [showModalNotes, setShowModalNotes] = useState(false);

  // Accordéons notes
  const [expandedSemestres, setExpandedSemestres] = useState({});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Récupérer notes
      const notesResponse = await noteService.getMesNotes();
      
      if (notesResponse.data.success) {
        const mesNotes = notesResponse.data.data || [];
        setNotes(mesNotes);
        
        // Calculer statistiques
        if (mesNotes.length > 0) {
          const total = mesNotes.length;
          const somme = mesNotes.reduce((acc, note) => acc + parseFloat(note.valeur || 0), 0);
          const moyenne = (somme / total).toFixed(2);
          const meilleure = Math.max(...mesNotes.map(n => parseFloat(n.valeur || 0)));
          
          setStats({
            totalNotes: total,
            moyenne: moyenne,
            meilleureNote: meilleure,
            coursActifs: 0, // Sera mis à jour après chargement cours
          });
        }
      }
    } catch (error) {
      console.error('❌ Erreur chargement données:', error);
    } finally {
      setLoading(false);
    }
  };

  // 🆕 CHARGER COURS (Modal)
  const handleVoirCours = async () => {
    try {
      setLoadingCours(true);
      setShowModalCours(true);
      
      const response = await coursService.getMesCoursEtudiant();
      
      if (response.data.success) {
        setCours(response.data.data.cours || []);
        setEtudiantInfo(response.data.data.etudiant || null);
        
        // Mettre à jour stats
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

  // 🆕 CHARGER NOTES GROUPÉES (Modal)
  const handleVoirNotes = () => {
    setShowModalNotes(true);
  };

  // 🆕 NAVIGATION VERS DÉTAIL COURS
  const handleVoirDetailsCours = (idCours) => {
    navigate(`/etudiant/cours/${idCours}`);
  };

  // 🆕 TOGGLE ACCORDÉONS
  const toggleSemestre = (semestre) => {
    setExpandedSemestres(prev => ({ ...prev, [semestre]: !prev[semestre] }));
  };

  // 🎨 HELPERS
  const getSubjectIcon = (titre) => {
    const key = Object.keys(SUBJECT_ICONS).find(k => titre?.toLowerCase().includes(k.toLowerCase()));
    return SUBJECT_ICONS[key] || SUBJECT_ICONS.default;
  };

  const getFiliereConfig = (filiere) => {
    return FILIERE_COLORS[filiere] || FILIERE_COLORS.default;
  };

  // 🔥 GROUPER NOTES PAR SEMESTRE
  const notesParSemestre = notes.reduce((acc, note) => {
    const semestre = note.semestre || 'S1';
    if (!acc[semestre]) {
      acc[semestre] = [];
    }
    acc[semestre].push(note);
    return acc;
  }, {});

  // Calculer moyenne par semestre
  const getMoyenneSemestre = (notesSemestre) => {
    if (notesSemestre.length === 0) return '0.00';
    const somme = notesSemestre.reduce((acc, n) => acc + parseFloat(n.valeur || 0), 0);
    return (somme / notesSemestre.length).toFixed(2);
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: COLORS.gray50 }}>
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* 🎯 HEADER INTELLIGENT */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
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
            </div>
          </div>
        </div>

        {/* 📊 STATISTIQUES CLIQUABLES */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* TOTAL NOTES - CLIQUABLE */}
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

          {/* COURS EN COURS - CLIQUABLE */}
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

        {/* 📝 TABLEAU MES NOTES */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border" style={{ borderColor: COLORS.gray200 }}>
          <div className="flex items-center justify-between mb-6">
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
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: COLORS.primary }}></div>
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
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cours
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Note
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Semestre
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Statut
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {notes.slice(0, 10).map((note) => (
                    <tr key={note.id_note} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{getSubjectIcon(note.cours?.titre)}</span>
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {note.cours?.titre || 'Cours inconnu'}
                            </div>
                            <div className="text-sm text-gray-500">
                              {note.cours?.code || '-'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`text-lg font-bold ${
                          parseFloat(note.valeur) >= 10 
                            ? 'text-green-600' 
                            : 'text-red-600'
                        }`}>
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
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            ✅ Validé
                          </span>
                        ) : note.est_rattrape ? (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                            🎓 Rattrapé
                          </span>
                        ) : (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-orange-100 text-orange-800">
                            🔄 Rattrapage
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* 🆕 MODAL COURS EN COURS */}
      <Modal
        isOpen={showModalCours}
        onClose={() => setShowModalCours(false)}
        title={`📖 Mes Cours${etudiantInfo ? ` (${etudiantInfo.filiere} - ${etudiantInfo.niveau})` : ''}`}
      >
        {loadingCours ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: COLORS.primary }}></div>
            <p className="mt-4" style={{ color: COLORS.gray600 }}>Chargement des cours...</p>
          </div>
        ) : cours.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">📚</span>
            </div>
            <p className="text-lg font-semibold mb-2" style={{ color: COLORS.gray700 }}>Aucun cours disponible</p>
            <p className="text-sm" style={{ color: COLORS.gray500 }}>Vos cours apparaîtront ici</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[70vh] overflow-y-auto">
            {cours.map((c) => (
              <div
                key={c.id_cours}
                className="bg-white rounded-xl border-2 hover:shadow-lg transition-all duration-300 overflow-hidden cursor-pointer"
                style={{ borderColor: COLORS.gray200 }}
                onClick={() => handleVoirDetailsCours(c.id_cours)}
              >
                {/* Header */}
                <div className="bg-gradient-to-br from-blue-400 to-indigo-600 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-white bg-white/20 backdrop-blur-sm px-2 py-1 rounded-full">
                      {c.code}
                    </span>
                    <span className="text-3xl">{getSubjectIcon(c.titre)}</span>
                  </div>
                  <h3 className="text-lg font-bold text-white line-clamp-2">{c.titre}</h3>
                </div>

                {/* Content */}
                <div className="p-4">
                  {/* Enseignant */}
                  <div className="flex items-center gap-2 mb-3 p-2 rounded-lg" style={{ backgroundColor: COLORS.gray50 }}>
                    <span>👨‍🏫</span>
                    <div>
                      <p className="text-xs font-semibold" style={{ color: COLORS.gray900 }}>
                        {c.enseignant?.prenom} {c.enseignant?.nom}
                      </p>
                      <p className="text-xs" style={{ color: COLORS.gray500 }}>
                        {c.enseignant?.specialite || 'Enseignant'}
                      </p>
                    </div>
                  </div>

                  {/* Note */}
                  {c.ma_note ? (
                    <div className="flex items-center justify-between p-3 rounded-lg mb-3" style={{ backgroundColor: parseFloat(c.ma_note) >= 10 ? '#F0FDF4' : '#FFF7ED' }}>
                      <span className="text-sm font-medium" style={{ color: COLORS.gray700 }}>Ma note :</span>
                      <span className={`text-lg font-bold ${parseFloat(c.ma_note) >= 10 ? 'text-green-600' : 'text-orange-600'}`}>
                        {c.ma_note}/20 {parseFloat(c.ma_note) >= 10 ? '✅' : '🔄'}
                      </span>
                    </div>
                  ) : (
                    <div className="p-3 rounded-lg mb-3 text-center" style={{ backgroundColor: COLORS.gray50 }}>
                      <span className="text-sm" style={{ color: COLORS.gray500 }}>⏳ Pas encore de note</span>
                    </div>
                  )}

                  {/* Bouton */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleVoirDetailsCours(c.id_cours);
                    }}
                    className="w-full py-2 rounded-lg text-sm font-semibold hover:opacity-90 transition-all"
                    style={{ backgroundColor: COLORS.bgBlue, color: COLORS.primary }}
                  >
                    Voir détails →
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Modal>

      {/* 🆕 MODAL MES NOTES GROUPÉES */}
      <Modal
        isOpen={showModalNotes}
        onClose={() => setShowModalNotes(false)}
        title={`📝 Mes Notes (${notes.length} notes)`}
      >
        {notes.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">📝</span>
            </div>
            <p className="text-lg font-semibold mb-2" style={{ color: COLORS.gray700 }}>Aucune note</p>
          </div>
        ) : (
          <div className="space-y-4 max-h-[70vh] overflow-y-auto">
            {Object.keys(notesParSemestre).sort().map((semestre) => {
              const notesSemestre = notesParSemestre[semestre];
              const isExpanded = expandedSemestres[semestre];
              const moyenne = getMoyenneSemestre(notesSemestre);

              return (
                <div key={semestre} className="border rounded-xl overflow-hidden" style={{ borderColor: COLORS.gray200 }}>
                  {/* Header Semestre */}
                  <button
                    onClick={() => toggleSemestre(semestre)}
                    className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                    style={{ backgroundColor: COLORS.bgBlue }}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">📅</span>
                      <div className="text-left">
                        <p className="font-bold" style={{ color: COLORS.primary }}>
                          {semestre} - Semestre {semestre.replace('S', '')}
                        </p>
                        <p className="text-xs" style={{ color: COLORS.gray600 }}>
                          {notesSemestre.length} note{notesSemestre.length > 1 ? 's' : ''} • Moyenne : {moyenne}/20
                        </p>
                      </div>
                    </div>
                    <span className="text-xl" style={{ color: COLORS.primary }}>
                      {isExpanded ? '▼' : '▶'}
                    </span>
                  </button>

                  {/* Notes du semestre */}
                  {isExpanded && (
                    <div className="p-4 space-y-2">
                      {notesSemestre.map((note) => (
                        <div
                          key={note.id_note}
                          className="p-4 rounded-lg border hover:shadow-md transition-all"
                          style={{ borderColor: COLORS.gray200, backgroundColor: COLORS.gray50 }}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-3">
                              <span className="text-3xl">{getSubjectIcon(note.cours?.titre)}</span>
                              <div>
                                <p className="font-semibold text-sm" style={{ color: COLORS.gray900 }}>
                                  {note.cours?.titre}
                                </p>
                                <p className="text-xs" style={{ color: COLORS.gray600 }}>
                                  {note.cours?.code}
                                </p>
                              </div>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                              parseFloat(note.valeur) >= 10 ? 'bg-green-100 text-green-700' : 
                              note.est_rattrape ? 'bg-blue-100 text-blue-700' :
                              'bg-orange-100 text-orange-700'
                            }`}>
                              {note.valeur}/20 {note.est_rattrape ? '🎓' : parseFloat(note.valeur) >= 10 ? '✅' : '🔄'}
                            </span>
                          </div>

                          <div className="grid grid-cols-2 gap-2 text-xs" style={{ color: COLORS.gray600 }}>
                            <div>
                              <span className="font-medium">📅 Date:</span> {new Date(note.date_evaluation).toLocaleDateString('fr-FR')}
                            </div>
                            <div>
                              <span className="font-medium">📌 Session:</span> {note.session}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </Modal>
    </div>
  );
}
