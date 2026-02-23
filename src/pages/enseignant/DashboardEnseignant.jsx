import { useState, useEffect } from 'react';
import { coursService, noteService, etudiantService } from '../../services/api';
import { getUser } from '../../utils/auth';
import Navbar from '../../components/layout/Navbar';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';

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
  gray600: '#4B5563',
  gray700: '#374151',
  gray800: '#1F2937',
  gray900: '#111827',
};

// 🎨 CONFIGURATION MATIÈRES
const SUBJECT_COLORS = {
  'Anatomie': { gradient: 'from-red-400 to-pink-600', icon: '🫀', bg: '#FFF0F0' },
  'Français': { gradient: 'from-blue-400 to-indigo-600', icon: '📘', bg: '#EFF6FF' },
  'Cardiologie': { gradient: 'from-red-500 to-rose-700', icon: '💓', bg: '#FFE6EC' },
  'Anglais': { gradient: 'from-green-400 to-emerald-600', icon: '📗', bg: '#F0FDF4' },
  'Biochimie': { gradient: 'from-purple-400 to-violet-600', icon: '🧬', bg: '#F5F3FF' },
  'Physique': { gradient: 'from-orange-400 to-amber-600', icon: '⚛️', bg: '#FFF7ED' },
  'default': { gradient: 'from-gray-400 to-gray-600', icon: '📚', bg: '#F3F4F6' }
};

// 🎨 COULEURS FILIÈRES
const FILIERE_COLORS = {
  'Médecine': { color: COLORS.accent, bg: '#FFE6EC', icon: '🩺' },
  'Pharmacie': { color: COLORS.teal, bg: COLORS.bgPurple, icon: '💊' },
  'Sciences-Biomédicale': { color: COLORS.purple, bg: COLORS.bgPurple, icon: '🧬' },
  'Chirurgie': { color: COLORS.pink, bg: COLORS.bgPink, icon: '🔪' },
  'default': { color: COLORS.gray600, bg: COLORS.gray100, icon: '🎓' }
};

export default function DashboardEnseignant() {
  const user = getUser();

  const [loading, setLoading] = useState(true);
  const [loadingNote, setLoadingNote] = useState(false);
  const [loadingEtudiants, setLoadingEtudiants] = useState(false);
  const [loadingNotesGrouped, setLoadingNotesGrouped] = useState(false); // 🆕

  const [cours, setCours] = useState([]);
  const [etudiants, setEtudiants] = useState([]);
  const [notes, setNotes] = useState([]);
  const [notesGrouped, setNotesGrouped] = useState([]); // 🆕

  const [stats, setStats] = useState({
    totalCours: 0,
    totalNotes: 0,
    moyenneGenerale: 0,
    coursActifs: 0,
    tauxReussite: 0,
  });

  // Modal ajout note
  const [showModalNote, setShowModalNote] = useState(false);
  const [formNote, setFormNote] = useState({
    id_etudiant: '',
    id_cours: '',
    valeur: '',
    semestre: '',
    date_evaluation: new Date().toISOString().split('T')[0],
  });
  const [errorsNote, setErrorsNote] = useState({});
  const [messageNote, setMessageNote] = useState({ type: '', text: '' });

  // 🆕 Modal notes attribuées
  const [showModalNotesAttribuees, setShowModalNotesAttribuees] = useState(false);
  const [expandedFilieres, setExpandedFilieres] = useState({});
  const [expandedNiveaux, setExpandedNiveaux] = useState({});

  // Modal détails cours
  const [showModalDetailsCours, setShowModalDetailsCours] = useState(false);
  const [coursSelectionne, setCoursSelectionne] = useState(null);

  // 🆕 Modal modifier note
  const [showModalModifierNote, setShowModalModifierNote] = useState(false);
  const [noteAModifier, setNoteAModifier] = useState(null);
  const [formModifierNote, setFormModifierNote] = useState({
    valeur: '',
    semestre: '',
    date_evaluation: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Récupérer les cours
      const coursResponse = await coursService.getMesCours();
      const mesCours = coursResponse.data.data || [];
      setCours(mesCours);

      // Récupérer les notes
      try {
        const notesResponse = await noteService.getMesNotes();
        let toutesLesNotes = [];
        
        if (notesResponse.data.success) {
          if (notesResponse.data.data?.data) {
            toutesLesNotes = notesResponse.data.data.data;
          } else if (Array.isArray(notesResponse.data.data)) {
            toutesLesNotes = notesResponse.data.data;
          }
        }
        
        setNotes(toutesLesNotes);

        const somme = toutesLesNotes.reduce((acc, note) => acc + parseFloat(note.valeur || 0), 0);
        const moyenne = toutesLesNotes.length > 0 ? (somme / toutesLesNotes.length).toFixed(2) : 0;
        const tauxReussite = toutesLesNotes.length > 0 
          ? Math.round((toutesLesNotes.filter(n => n.valeur >= 10).length / toutesLesNotes.length) * 100)
          : 0;

        setStats({
          totalCours: mesCours.length,
          totalNotes: toutesLesNotes.length,
          moyenneGenerale: moyenne,
          coursActifs: mesCours.length,
          tauxReussite: tauxReussite,
        });
      } catch (err) {
        console.error('❌ Erreur récupération notes:', err);
        setStats({
          totalCours: mesCours.length,
          totalNotes: 0,
          moyenneGenerale: 0,
          coursActifs: mesCours.length,
          tauxReussite: 0,
        });
      }
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  // 🆕 CHARGER NOTES GROUPÉES
  const handleVoirNotesAttribuees = async () => {
    try {
      setLoadingNotesGrouped(true);
      setShowModalNotesAttribuees(true);
      
      const response = await noteService.getGrouped();
      
      if (response.data.success) {
        setNotesGrouped(response.data.data || []);
      }
    } catch (error) {
      console.error('❌ Erreur chargement notes groupées:', error);
      setNotesGrouped([]);
    } finally {
      setLoadingNotesGrouped(false);
    }
  };

  // 🆕 TOGGLE ACCORDÉONS
  const toggleFiliere = (filiere) => {
    setExpandedFilieres(prev => ({ ...prev, [filiere]: !prev[filiere] }));
  };

  const toggleNiveau = (filiereNiveau) => {
    setExpandedNiveaux(prev => ({ ...prev, [filiereNiveau]: !prev[filiereNiveau] }));
  };

  // 🆕 MODIFIER NOTE
  const handleModifierNote = (note) => {
    setNoteAModifier(note);
    setFormModifierNote({
      valeur: note.valeur,
      semestre: note.semestre,
      date_evaluation: note.date_evaluation,
    });
    setShowModalModifierNote(true);
  };

  const handleSubmitModifierNote = async (e) => {
    e.preventDefault();
    if (loadingNote) return;

    try {
      setLoadingNote(true);
      const response = await noteService.update(noteAModifier.id_note, formModifierNote);

      if (response.data.success) {
        setMessageNote({ type: 'success', text: 'Note modifiée avec succès !' });

        setTimeout(() => {
          setShowModalModifierNote(false);
          setNoteAModifier(null);
          setMessageNote({ type: '', text: '' });
          setLoadingNote(false);
          fetchData();
          handleVoirNotesAttribuees(); // Recharger notes groupées
        }, 1500);
      }
    } catch (error) {
      console.error('Erreur modification note:', error);
      setMessageNote({
        type: 'error',
        text: error.response?.data?.message || "Erreur lors de la modification",
      });
      setLoadingNote(false);
    }
  };

  // 🆕 SUPPRIMER NOTE
  const handleSupprimerNote = async (idNote) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette note ?')) return;

    try {
      const response = await noteService.delete(idNote);
      
      if (response.data.success) {
        alert('Note supprimée avec succès !');
        fetchData();
        handleVoirNotesAttribuees(); // Recharger notes groupées
      }
    } catch (error) {
      console.error('Erreur suppression note:', error);
      alert('Erreur lors de la suppression de la note');
    }
  };

  const handleCoursChange = async (e) => {
    const { name, value } = e.target;
    setFormNote((prev) => ({ 
      ...prev, 
      [name]: value,
      id_etudiant: ''
    }));
    
    if (errorsNote[name]) {
      setErrorsNote((prev) => ({ ...prev, [name]: '' }));
    }

    if (value) {
      try {
        setLoadingEtudiants(true);
        const response = await etudiantService.getEtudiantsParCours(value);
        
        if (response.data.success) {
          setEtudiants(response.data.data.etudiants || []);
          const coursInfo = response.data.data.cours;
          console.log(`✅ Étudiants filtrés : ${coursInfo.filiere} - ${coursInfo.niveau}`);
        }
      } catch (error) {
        console.error('❌ Erreur chargement étudiants:', error);
        setEtudiants([]);
        setMessageNote({
          type: 'error',
          text: 'Erreur lors du chargement des étudiants pour ce cours'
        });
      } finally {
        setLoadingEtudiants(false);
      }
    } else {
      setEtudiants([]);
    }
  };

  const handleChangeNote = (e) => {
    const { name, value } = e.target;
    setFormNote((prev) => ({ ...prev, [name]: value }));
    if (errorsNote[name]) {
      setErrorsNote((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleChangeModifierNote = (e) => {
    const { name, value } = e.target;
    setFormModifierNote((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmitNote = async (e) => {
    e.preventDefault();
    if (loadingNote) return;

    setMessageNote({ type: '', text: '' });
    setErrorsNote({});

    try {
      setLoadingNote(true);
      const response = await noteService.create(formNote);

      if (response.data.success) {
        setMessageNote({ type: 'success', text: 'Note ajoutée avec succès !' });

        setTimeout(() => {
          setFormNote({
            id_etudiant: '',
            id_cours: '',
            valeur: '',
            semestre: '',
            date_evaluation: new Date().toISOString().split('T')[0],
          });
          setEtudiants([]);
          setShowModalNote(false);
          setMessageNote({ type: '', text: '' });
          setLoadingNote(false);
          fetchData();
        }, 1500);
      }
    } catch (error) {
      console.error('Erreur ajout note:', error);
      if (error.response?.data?.errors) {
        setErrorsNote(error.response.data.errors);
      } else {
        setMessageNote({
          type: 'error',
          text: error.response?.data?.message || "Erreur lors de l'ajout de la note",
        });
      }
      setLoadingNote(false);
    }
  };

  const handleVoirDetailsCours = (cours) => {
    setCoursSelectionne(cours);
    setShowModalDetailsCours(true);
  };

  const getCourseConfig = (titre) => {
    const key = Object.keys(SUBJECT_COLORS).find(k => titre?.toLowerCase().includes(k.toLowerCase()));
    return SUBJECT_COLORS[key] || SUBJECT_COLORS.default;
  };

  const getFiliereConfig = (filiere) => {
    return FILIERE_COLORS[filiere] || FILIERE_COLORS.default;
  };

  const getNotesParCours = (idCours) => {
    return notes.filter(n => n.id_cours === idCours);
  };

  const getMoyenneCours = (idCours) => {
    const notesCours = getNotesParCours(idCours);
    if (notesCours.length === 0) return '-';
    const somme = notesCours.reduce((acc, n) => acc + parseFloat(n.valeur || 0), 0);
    return (somme / notesCours.length).toFixed(2);
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: COLORS.gray50 }}>
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* EN-TÊTE */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <span className="text-3xl">👨‍🏫</span>
                </div>
                <div>
                  <h1 className="text-3xl font-bold" style={{ color: COLORS.gray900 }}>
                    Tableau de bord Enseignant
                  </h1>
                  <p className="text-sm" style={{ color: COLORS.gray600 }}>
                    Bienvenue <span className="font-semibold" style={{ color: COLORS.primary }}>{user?.prenom}</span> ! Gérez vos cours et vos étudiants.
                  </p>
                </div>
              </div>
            </div>

            <Button
              variant="primary"
              onClick={() => setShowModalNote(true)}
              className="flex items-center gap-2 shadow-lg hover:shadow-xl transition-all"
            >
              <span className="text-lg">➕</span>
              Ajouter une note
            </Button>
          </div>
        </div>

        {/* STATISTIQUES */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6 border hover:shadow-xl transition-all" style={{ borderColor: COLORS.gray200 }}>
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center">
                <span className="text-2xl">📚</span>
              </div>
              <span className="text-3xl font-bold" style={{ color: COLORS.primary }}>{stats.totalCours}</span>
            </div>
            <p className="text-sm font-medium" style={{ color: COLORS.gray700 }}>Mes Cours</p>
            <p className="text-xs mt-1" style={{ color: COLORS.gray500 }}>Cours actifs</p>
          </div>

          {/* 🆕 CARD NOTES ATTRIBUÉES CLIQUABLE */}
          <div 
            onClick={handleVoirNotesAttribuees}
            className="bg-white rounded-2xl shadow-lg p-6 border hover:shadow-2xl transition-all cursor-pointer group"
            style={{ borderColor: COLORS.gray200 }}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-600 rounded-xl flex items-center justify-center">
                <span className="text-2xl">📝</span>
              </div>
              <span className="text-3xl font-bold" style={{ color: COLORS.secondary }}>{stats.totalNotes}</span>
            </div>
            <p className="text-sm font-medium" style={{ color: COLORS.gray700 }}>Notes Attribuées</p>
            <p className="text-xs mt-1 group-hover:text-green-600 transition-colors" style={{ color: COLORS.gray500 }}>
              Cliquer pour détails →
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border hover:shadow-xl transition-all" style={{ borderColor: COLORS.gray200 }}>
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-violet-600 rounded-xl flex items-center justify-center">
                <span className="text-2xl">📊</span>
              </div>
              <span className="text-3xl font-bold" style={{ color: COLORS.purple }}>{stats.moyenneGenerale}/20</span>
            </div>
            <p className="text-sm font-medium" style={{ color: COLORS.gray700 }}>Moyenne Générale</p>
            <p className="text-xs mt-1" style={{ color: COLORS.gray500 }}>Toutes classes</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border hover:shadow-xl transition-all" style={{ borderColor: COLORS.gray200 }}>
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-amber-600 rounded-xl flex items-center justify-center">
                <span className="text-2xl">✅</span>
              </div>
              <span className="text-3xl font-bold" style={{ color: COLORS.orange }}>{stats.tauxReussite}%</span>
            </div>
            <p className="text-sm font-medium" style={{ color: COLORS.gray700 }}>Taux de Réussite</p>
            <p className="text-xs mt-1" style={{ color: COLORS.gray500 }}>Notes ≥ 10/20</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border hover:shadow-xl transition-all" style={{ borderColor: COLORS.gray200 }}>
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 bg-gradient-to-br from-teal-400 to-cyan-600 rounded-xl flex items-center justify-center">
                <span className="text-2xl">👨‍🎓</span>
              </div>
              <span className="text-3xl font-bold" style={{ color: COLORS.teal }}>{etudiants.length}</span>
            </div>
            <p className="text-sm font-medium" style={{ color: COLORS.gray700 }}>Étudiants</p>
            <p className="text-xs mt-1" style={{ color: COLORS.gray500 }}>Cours sélectionné</p>
          </div>
        </div>

        {/* COURS ACTIFS */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border" style={{ borderColor: COLORS.gray200 }}>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                <span className="text-2xl">🔥</span>
              </div>
              <div>
                <h2 className="text-2xl font-bold" style={{ color: COLORS.gray900 }}>Mes Cours Actifs</h2>
                <p className="text-sm" style={{ color: COLORS.gray600 }}>
                  {cours.length} cours • {notes.length} notes attribuées
                </p>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: COLORS.primary }}></div>
              <p className="mt-4" style={{ color: COLORS.gray600 }}>Chargement...</p>
            </div>
          ) : cours.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-5xl">📚</span>
              </div>
              <p className="text-xl font-semibold mb-2" style={{ color: COLORS.gray700 }}>Aucun cours pour le moment</p>
              <p className="text-sm" style={{ color: COLORS.gray500 }}>Les cours qui vous seront assignés apparaîtront ici</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {cours.map((c) => {
                const config = getCourseConfig(c.titre);
                const notesCours = getNotesParCours(c.id_cours);
                const moyenneCours = getMoyenneCours(c.id_cours);

                return (
                  <div
                    key={c.id_cours}
                    className="group relative bg-white rounded-2xl border-2 hover:shadow-2xl transition-all duration-300 overflow-hidden cursor-pointer"
                    style={{ borderColor: COLORS.gray200 }}
                    onClick={() => handleVoirDetailsCours(c)}
                  >
                    <div className={`h-32 bg-gradient-to-br ${config.gradient} p-6 relative overflow-hidden`}>
                      <div className="absolute top-4 right-4 text-5xl opacity-20">{config.icon}</div>
                      <div className="relative z-10">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-bold text-white bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
                            {c.code}
                          </span>
                          <span className="text-3xl">{config.icon}</span>
                        </div>
                        <h3 className="text-xl font-bold text-white mt-2 line-clamp-2">{c.titre}</h3>
                      </div>
                    </div>

                    <div className="p-6">
                      <div className="flex gap-2 mb-4">
                        {c.filiere && (
                          <span className="text-xs font-semibold px-2 py-1 rounded-full" style={{ backgroundColor: COLORS.bgBlue, color: COLORS.primary }}>
                            {c.filiere}
                          </span>
                        )}
                        {c.niveau && (
                          <span className="text-xs font-semibold px-2 py-1 rounded-full" style={{ backgroundColor: COLORS.bgGreen, color: COLORS.secondary }}>
                            {c.niveau}
                          </span>
                        )}
                      </div>

                      <p className="text-sm mb-4 line-clamp-2" style={{ color: COLORS.gray600 }}>
                        {c.description || 'Pas de description'}
                      </p>

                      <div className="space-y-3 mb-4">
                        <div className="flex items-center justify-between p-3 rounded-xl" style={{ backgroundColor: COLORS.gray50 }}>
                          <div className="flex items-center gap-2">
                            <span>📝</span>
                            <span className="text-sm font-medium" style={{ color: COLORS.gray700 }}>Notes</span>
                          </div>
                          <span className="text-sm font-bold" style={{ color: COLORS.secondary }}>{notesCours.length}</span>
                        </div>

                        <div className="flex items-center justify-between p-3 rounded-xl" style={{ backgroundColor: config.bg }}>
                          <div className="flex items-center gap-2">
                            <span>📊</span>
                            <span className="text-sm font-medium" style={{ color: COLORS.gray700 }}>Moyenne</span>
                          </div>
                          <span className="text-lg font-bold" style={{ color: COLORS.purple }}>
                            {moyenneCours !== '-' ? `${moyenneCours}/20` : '-'}
                          </span>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleVoirDetailsCours(c);
                          }}
                          className="flex-1 py-2.5 rounded-lg text-sm font-semibold hover:opacity-90 transition-all flex items-center justify-center gap-2"
                          style={{ backgroundColor: COLORS.bgBlue, color: COLORS.primary }}
                        >
                          <span>📊</span>
                          Détails
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setFormNote(prev => ({ ...prev, id_cours: c.id_cours }));
                            setShowModalNote(true);
                            handleCoursChange({ target: { name: 'id_cours', value: c.id_cours } });
                          }}
                          className="flex-1 py-2.5 rounded-lg text-sm font-semibold hover:opacity-90 transition-all flex items-center justify-center gap-2"
                          style={{ backgroundColor: COLORS.bgGreen, color: COLORS.secondary }}
                        >
                          <span>➕</span>
                          Note
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* 🆕 MODAL NOTES ATTRIBUÉES */}
      <Modal
        isOpen={showModalNotesAttribuees}
        onClose={() => setShowModalNotesAttribuees(false)}
        title={`📝 Mes Notes Attribuées (${stats.totalNotes} notes)`}
      >
        {loadingNotesGrouped ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: COLORS.primary }}></div>
            <p className="mt-4" style={{ color: COLORS.gray600 }}>Chargement des notes...</p>
          </div>
        ) : notesGrouped.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">📝</span>
            </div>
            <p className="text-lg font-semibold mb-2" style={{ color: COLORS.gray700 }}>Aucune note attribuée</p>
            <p className="text-sm" style={{ color: COLORS.gray500 }}>Commencez à noter vos étudiants</p>
          </div>
        ) : (
          <div className="space-y-4 max-h-[70vh] overflow-y-auto">
            {notesGrouped.map((filiereGroup) => {
              const filiereConfig = getFiliereConfig(filiereGroup.filiere);
              const isFilExpanded = expandedFilieres[filiereGroup.filiere];

              return (
                <div key={filiereGroup.filiere} className="border rounded-xl overflow-hidden" style={{ borderColor: COLORS.gray200 }}>
                  {/* HEADER FILIÈRE */}
                  <button
                    onClick={() => toggleFiliere(filiereGroup.filiere)}
                    className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                    style={{ backgroundColor: filiereConfig.bg }}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{filiereConfig.icon}</span>
                      <div className="text-left">
                        <p className="font-bold" style={{ color: filiereConfig.color }}>
                          {filiereGroup.filiere}
                        </p>
                        <p className="text-xs" style={{ color: COLORS.gray600 }}>
                          {filiereGroup.total} note{filiereGroup.total > 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                    <span className="text-xl" style={{ color: filiereConfig.color }}>
                      {isFilExpanded ? '▼' : '▶'}
                    </span>
                  </button>

                  {/* NIVEAUX */}
                  {isFilExpanded && (
                    <div className="p-4 space-y-3">
                      {filiereGroup.niveaux.map((niveauGroup) => {
                        const niveauKey = `${filiereGroup.filiere}-${niveauGroup.niveau}`;
                        const isNivExpanded = expandedNiveaux[niveauKey];

                        return (
                          <div key={niveauGroup.niveau} className="border rounded-lg overflow-hidden" style={{ borderColor: COLORS.gray200 }}>
                            {/* HEADER NIVEAU */}
                            <button
                              onClick={() => toggleNiveau(niveauKey)}
                              className="w-full p-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
                              style={{ backgroundColor: COLORS.gray50 }}
                            >
                              <div className="flex items-center gap-2">
                                <span className="text-lg">📘</span>
                                <div className="text-left">
                                  <p className="font-semibold text-sm" style={{ color: COLORS.gray900 }}>
                                    {niveauGroup.niveau}
                                  </p>
                                  <p className="text-xs" style={{ color: COLORS.gray600 }}>
                                    {niveauGroup.count} note{niveauGroup.count > 1 ? 's' : ''}
                                  </p>
                                </div>
                              </div>
                              <span className="text-sm" style={{ color: COLORS.gray600 }}>
                                {isNivExpanded ? '▼' : '▶'}
                              </span>
                            </button>

                            {/* NOTES */}
                            {isNivExpanded && (
                              <div className="p-3 space-y-2">
                                {niveauGroup.semestres.flatMap(semestreGroup =>
                                  semestreGroup.sessions.flatMap(sessionGroup =>
                                    sessionGroup.notes.map((note) => (
                                      <div
                                        key={note.id_note}
                                        className="p-4 rounded-lg border hover:shadow-md transition-all"
                                        style={{ borderColor: COLORS.gray200, backgroundColor: COLORS.gray50 }}
                                      >
                                        <div className="flex items-start justify-between mb-3">
                                          <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center text-white text-xs font-bold">
                                              {note.etudiant?.prenom?.charAt(0)}{note.etudiant?.nom?.charAt(0)}
                                            </div>
                                            <div>
                                              <p className="font-semibold text-sm" style={{ color: COLORS.gray900 }}>
                                                {note.etudiant?.prenom} {note.etudiant?.nom}
                                              </p>
                                              <p className="text-xs" style={{ color: COLORS.gray600 }}>
                                                {note.etudiant?.matricule}
                                              </p>
                                            </div>
                                          </div>
                                          <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                                            note.valeur >= 10 ? 'bg-green-100 text-green-700' : 
                                            note.est_rattrape ? 'bg-blue-100 text-blue-700' :
                                            'bg-orange-100 text-orange-700'
                                          }`}>
                                            {note.valeur}/20 {note.est_rattrape ? '🎓' : note.valeur >= 10 ? '✅' : '🔄'}
                                          </span>
                                        </div>

                                        <div className="grid grid-cols-2 gap-2 mb-3">
                                          <div className="text-xs" style={{ color: COLORS.gray600 }}>
                                            <span className="font-medium">📚 Cours:</span> {note.cours?.titre}
                                          </div>
                                          <div className="text-xs" style={{ color: COLORS.gray600 }}>
                                            <span className="font-medium">📅 Semestre:</span> {note.semestre}
                                          </div>
                                          <div className="text-xs" style={{ color: COLORS.gray600 }}>
                                            <span className="font-medium">📆 Date:</span> {new Date(note.date_evaluation).toLocaleDateString('fr-FR')}
                                          </div>
                                          <div className="text-xs" style={{ color: COLORS.gray600 }}>
                                            <span className="font-medium">📌 Session:</span> {note.session}
                                          </div>
                                        </div>

                                        <div className="flex gap-2">
                                          <button
                                            onClick={() => handleModifierNote(note)}
                                            className="flex-1 py-2 rounded-lg text-xs font-semibold hover:opacity-90 transition-all flex items-center justify-center gap-1"
                                            style={{ backgroundColor: COLORS.bgBlue, color: COLORS.primary }}
                                          >
                                            <span>✏️</span>
                                            Modifier
                                          </button>
                                          <button
                                            onClick={() => handleSupprimerNote(note.id_note)}
                                            className="flex-1 py-2 rounded-lg text-xs font-semibold hover:opacity-90 transition-all flex items-center justify-center gap-1"
                                            style={{ backgroundColor: '#FEE2E2', color: COLORS.accent }}
                                          >
                                            <span>🗑️</span>
                                            Supprimer
                                          </button>
                                        </div>
                                      </div>
                                    ))
                                  )
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </Modal>

      {/* 🆕 MODAL MODIFIER NOTE */}
      <Modal
        isOpen={showModalModifierNote}
        onClose={() => !loadingNote && setShowModalModifierNote(false)}
        title="✏️ Modifier la note"
      >
        {messageNote.text && (
          <div className={`mb-4 p-4 rounded-lg border-l-4 ${
            messageNote.type === 'success' 
              ? 'bg-green-100 border-green-500 text-green-700' 
              : 'bg-red-100 border-red-500 text-red-700'
          }`}>
            {messageNote.text}
          </div>
        )}

        {noteAModifier && (
          <form onSubmit={handleSubmitModifierNote}>
            {/* INFO ÉTUDIANT */}
            <div className="mb-4 p-4 rounded-lg" style={{ backgroundColor: COLORS.bgBlue }}>
              <p className="text-sm font-semibold" style={{ color: COLORS.primary }}>
                👨‍🎓 {noteAModifier.etudiant?.prenom} {noteAModifier.etudiant?.nom}
              </p>
              <p className="text-xs" style={{ color: COLORS.gray600 }}>
                📚 {noteAModifier.cours?.titre}
              </p>
            </div>

            <Input
              label="Note (sur 20)"
              type="number"
              name="valeur"
              value={formModifierNote.valeur}
              onChange={handleChangeModifierNote}
              required
              placeholder="15.5"
              min="0"
              max="20"
              step="0.5"
            />

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2" style={{ color: COLORS.gray700 }}>
                Semestre <span style={{ color: COLORS.accent }}>*</span>
              </label>
              <select
                name="semestre"
                value={formModifierNote.semestre}
                onChange={handleChangeModifierNote}
                required
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:outline-none"
                style={{ borderColor: COLORS.gray300 }}
              >
                <option value="">-- Sélectionner --</option>
                <option value="S1">📅 S1</option>
                <option value="S2">📅 S2</option>
                <option value="S3">📅 S3</option>
                <option value="S4">📅 S4</option>
                <option value="S5">📅 S5</option>
                <option value="S6">📅 S6</option>
              </select>
            </div>

            <Input
              label="Date d'évaluation"
              type="date"
              name="date_evaluation"
              value={formModifierNote.date_evaluation}
              onChange={handleChangeModifierNote}
              required
            />

            <div className="flex gap-4 mt-6">
              <Button type="submit" variant="primary" className="flex-1" disabled={loadingNote}>
                {loadingNote ? 'Modification...' : 'Enregistrer'}
              </Button>
              <Button type="button" variant="secondary" onClick={() => setShowModalModifierNote(false)} className="flex-1" disabled={loadingNote}>
                Annuler
              </Button>
            </div>
          </form>
        )}
      </Modal>

      {/* MODAL DÉTAILS COURS */}
      <Modal
        isOpen={showModalDetailsCours}
        onClose={() => setShowModalDetailsCours(false)}
        title={`Détails - ${coursSelectionne?.titre || ''}`}
      >
        {coursSelectionne && (
          <div className="space-y-6">
            <div className="flex items-start gap-4 p-4 rounded-xl" style={{ backgroundColor: getCourseConfig(coursSelectionne.titre).bg }}>
              <span className="text-4xl">{getCourseConfig(coursSelectionne.titre).icon}</span>
              <div className="flex-1">
                <h3 className="text-xl font-bold mb-1" style={{ color: COLORS.gray900 }}>{coursSelectionne.titre}</h3>
                <p className="text-sm" style={{ color: COLORS.gray600 }}>Code: {coursSelectionne.code}</p>
                <div className="flex gap-2 mt-2">
                  {coursSelectionne.filiere && (
                    <span className="text-xs font-semibold px-2 py-1 rounded-full" style={{ backgroundColor: COLORS.primary, color: 'white' }}>
                      {coursSelectionne.filiere}
                    </span>
                  )}
                  {coursSelectionne.niveau && (
                    <span className="text-xs font-semibold px-2 py-1 rounded-full" style={{ backgroundColor: COLORS.secondary, color: 'white' }}>
                      {coursSelectionne.niveau}
                    </span>
                  )}
                </div>
                {coursSelectionne.description && (
                  <p className="text-sm mt-2" style={{ color: COLORS.gray700 }}>{coursSelectionne.description}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 rounded-xl" style={{ backgroundColor: COLORS.bgBlue }}>
                <p className="text-3xl font-bold mb-1" style={{ color: COLORS.primary }}>
                  {getNotesParCours(coursSelectionne.id_cours).length}
                </p>
                <p className="text-xs font-medium" style={{ color: COLORS.gray600 }}>Notes</p>
              </div>
              <div className="text-center p-4 rounded-xl" style={{ backgroundColor: COLORS.bgGreen }}>
                <p className="text-3xl font-bold mb-1" style={{ color: COLORS.secondary }}>
                  {getMoyenneCours(coursSelectionne.id_cours)}/20
                </p>
                <p className="text-xs font-medium" style={{ color: COLORS.gray600 }}>Moyenne</p>
              </div>
            </div>

            <Button variant="secondary" onClick={() => setShowModalDetailsCours(false)} className="w-full">
              Fermer
            </Button>
          </div>
        )}
      </Modal>

      {/* MODAL AJOUT NOTE */}
      <Modal
        isOpen={showModalNote}
        onClose={() => !loadingNote && setShowModalNote(false)}
        title="Ajouter une note"
      >
        {messageNote.text && (
          <div className={`mb-4 p-4 rounded-lg border-l-4 ${
            messageNote.type === 'success' 
              ? 'bg-green-100 border-green-500 text-green-700' 
              : 'bg-red-100 border-red-500 text-red-700'
          }`}>
            {messageNote.text}
          </div>
        )}

        <form onSubmit={handleSubmitNote}>
          <Select
            label="Cours"
            name="id_cours"
            value={formNote.id_cours}
            onChange={handleCoursChange}
            options={cours.map(c => ({ 
              value: c.id_cours, 
              label: `${c.code} - ${c.titre}${c.filiere && c.niveau ? ` (${c.filiere} ${c.niveau})` : ''}`
            }))}
            error={errorsNote.id_cours?.[0]}
            required
          />

          {formNote.id_cours && (
            <>
              {loadingEtudiants ? (
                <div className="mb-4 p-4 text-center" style={{ backgroundColor: COLORS.gray50 }}>
                  <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2" style={{ borderColor: COLORS.primary }}></div>
                  <p className="text-sm mt-2" style={{ color: COLORS.gray600 }}>Chargement des étudiants...</p>
                </div>
              ) : etudiants.length === 0 ? (
                <div className="mb-4 p-4 text-center rounded-lg" style={{ backgroundColor: '#FFF7ED', borderLeft: `4px solid ${COLORS.orange}` }}>
                  <p className="text-sm font-semibold" style={{ color: COLORS.orange }}>
                    ⚠️ Aucun étudiant inscrit pour ce cours
                  </p>
                  <p className="text-xs mt-1" style={{ color: COLORS.gray600 }}>
                    (Filière et niveau ne correspondent à aucun étudiant)
                  </p>
                </div>
              ) : (
                <>
                  <div className="mb-4 p-3 rounded-lg" style={{ backgroundColor: COLORS.bgGreen, borderLeft: `4px solid ${COLORS.secondary}` }}>
                    <p className="text-xs font-semibold" style={{ color: COLORS.secondary }}>
                      ✅ {etudiants.length} étudiant{etudiants.length > 1 ? 's' : ''} éligible{etudiants.length > 1 ? 's' : ''}
                    </p>
                  </div>

                  <Select
                    label="Étudiant"
                    name="id_etudiant"
                    value={formNote.id_etudiant}
                    onChange={handleChangeNote}
                    options={etudiants.map(e => ({ 
                      value: e.id_etudiant, 
                      label: `${e.prenom} ${e.nom} (${e.matricule})`
                    }))}
                    error={errorsNote.id_etudiant?.[0]}
                    required
                  />
                </>
              )}
            </>
          )}

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2" style={{ color: COLORS.gray700 }}>
              Semestre <span style={{ color: COLORS.accent }}>*</span>
            </label>
            <select
              name="semestre"
              value={formNote.semestre}
              onChange={handleChangeNote}
              required
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:outline-none"
              style={{ borderColor: COLORS.gray300 }}
            >
              <option value="">-- Sélectionner un semestre --</option>
              <option value="S1">📅 S1 - Semestre 1</option>
              <option value="S2">📅 S2 - Semestre 2</option>
              <option value="S3">📅 S3 - Semestre 3</option>
              <option value="S4">📅 S4 - Semestre 4</option>
              <option value="S5">📅 S5 - Semestre 5</option>
              <option value="S6">📅 S6 - Semestre 6</option>
            </select>
            {errorsNote.semestre && (
              <p className="text-sm mt-1" style={{ color: COLORS.accent }}>{errorsNote.semestre[0]}</p>
            )}
          </div>

          <Input
            label="Note (sur 20)"
            type="number"
            name="valeur"
            value={formNote.valeur}
            onChange={handleChangeNote}
            error={errorsNote.valeur?.[0]}
            required
            placeholder="15.5"
            min="0"
            max="20"
            step="0.5"
          />

          <Input
            label="Date d'évaluation"
            type="date"
            name="date_evaluation"
            value={formNote.date_evaluation}
            onChange={handleChangeNote}
            error={errorsNote.date_evaluation?.[0]}
            required
          />

          <div className="flex gap-4 mt-6">
            <Button type="submit" variant="primary" className="flex-1" disabled={loadingNote || loadingEtudiants}>
              {loadingNote ? 'Envoi...' : 'Ajouter'}
            </Button>
            <Button type="button" variant="secondary" onClick={() => setShowModalNote(false)} className="flex-1" disabled={loadingNote}>
              Annuler
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}