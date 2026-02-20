import { useState, useEffect } from 'react';
import { etudiantService, enseignantService, coursService, noteService } from '../../services/api';
import { getUser } from '../../utils/auth';
import Navbar from '../../components/layout/Navbar';
import StatCard from '../../components/common/StatCard';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';

// 🎨 PALETTE COULEURS MÉDICALES
const MEDICAL_COLORS = {
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
  bgTeal: '#F0FDFA',
  bgOrange: '#FFF7ED',
  bgPink: '#FDF2F8',
  
  gray50: '#F9FAFB',
  gray100: '#F3F4F6',
  gray200: '#E5E7EB',
  gray300: '#D1D5DB',
  gray600: '#4B5563',
  gray700: '#374151',
  gray800: '#1F2937',
  gray900: '#111827',
};

// 🎨 CONFIGURATION FILIÈRES
const FILIERES_CONFIG = {
  'Médecine': { icon: '🩺', color: MEDICAL_COLORS.primary, bg: MEDICAL_COLORS.bgBlue },
  'Pharmacie': { icon: '💊', color: MEDICAL_COLORS.purple, bg: MEDICAL_COLORS.bgPurple },
  'Sciences-Biomédicale': { icon: '🧬', color: MEDICAL_COLORS.teal, bg: MEDICAL_COLORS.bgTeal },
  'Chirurgie': { icon: '🔬', color: MEDICAL_COLORS.orange, bg: MEDICAL_COLORS.bgOrange },
  'Pédiatrie': { icon: '👶', color: MEDICAL_COLORS.pink, bg: MEDICAL_COLORS.bgPink },
  'Gynécologie': { icon: '🌸', color: MEDICAL_COLORS.accent, bg: '#FFF0F0' },
  'default': { icon: '📚', color: MEDICAL_COLORS.gray600, bg: MEDICAL_COLORS.gray100 },
};

// 🎨 CONFIGURATION NIVEAUX
const NIVEAUX_CONFIG = {
  'L1': { icon: '📘', color: '#3B82F6', bg: '#DBEAFE', label: 'Licence 1' },
  'L2': { icon: '📗', color: '#10B981', bg: '#D1FAE5', label: 'Licence 2' },
  'L3': { icon: '📙', color: '#F59E0B', bg: '#FEF3C7', label: 'Licence 3' },
  'M1': { icon: '📕', color: '#EF4444', bg: '#FEE2E2', label: 'Master 1' },
  'M2': { icon: '📔', color: '#8B5CF6', bg: '#EDE9FE', label: 'Master 2' },
  'Doctorat': { icon: '🎓', color: '#EC4899', bg: '#FCE7F3', label: 'Doctorat' },
};

export default function DashboardAdmin() {
  const user = getUser();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  
  // Données
  const [enseignants, setEnseignants] = useState([]);
  const [etudiantsGrouped, setEtudiantsGrouped] = useState([]); // 🆕 Données groupées
  const [etudiants, setEtudiants] = useState([]); // Pour les modals
  const [cours, setCours] = useState([]);
  const [notes, setNotes] = useState([]);
  
  // 🆕 État accordéons
  const [expandedFilieres, setExpandedFilieres] = useState({});
  const [expandedNiveaux, setExpandedNiveaux] = useState({});
  
  // 🆕 Recherche
  const [searchTerm, setSearchTerm] = useState('');
  
  // Stats
  const [stats, setStats] = useState({
    totalEnseignants: 0,
    totalEtudiants: 0,
    totalCours: 0,
    totalNotes: 0,
    moyenneGenerale: 0,
  });

  // GESTION ENSEIGNANTS
  const [showModalEnseignant, setShowModalEnseignant] = useState(false);
  const [editingEnseignant, setEditingEnseignant] = useState(null);
  const [loadingEnseignant, setLoadingEnseignant] = useState(false);
  const [formEnseignant, setFormEnseignant] = useState({
    nom: '', prenom: '', email: '', mot_de_passe: '', date_naissance: '', specialite: '',
  });
  const [errorsEnseignant, setErrorsEnseignant] = useState({});
  const [messageEnseignant, setMessageEnseignant] = useState({ type: '', text: '' });

  // GESTION ÉTUDIANTS
  const [showModalEtudiant, setShowModalEtudiant] = useState(false);
  const [editingEtudiant, setEditingEtudiant] = useState(null);
  const [loadingEtudiant, setLoadingEtudiant] = useState(false);
  const [formEtudiant, setFormEtudiant] = useState({
    nom: '', prenom: '', email: '', mot_de_passe: '', date_naissance: '', filiere: '', niveau: '',
  });
  const [errorsEtudiant, setErrorsEtudiant] = useState({});
  const [messageEtudiant, setMessageEtudiant] = useState({ type: '', text: '' });

  // GESTION COURS
  const [showModalCours, setShowModalCours] = useState(false);
  const [editingCours, setEditingCours] = useState(null);
  const [loadingCours, setLoadingCours] = useState(false);
  const [formCours, setFormCours] = useState({
    code: '', titre: '', description: '', id_enseignant: '',
  });
  const [errorsCours, setErrorsCours] = useState({});
  const [messageCours, setMessageCours] = useState({ type: '', text: '' });

  // GESTION NOTES
  const [showModalNote, setShowModalNote] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [loadingNote, setLoadingNote] = useState(false);
  const [formNote, setFormNote] = useState({
    id_etudiant: '', id_cours: '', valeur: '', date_evaluation: new Date().toISOString().split('T')[0],
  });
  const [errorsNote, setErrorsNote] = useState({});
  const [messageNote, setMessageNote] = useState({ type: '', text: '' });

  // FILTRES NOTES
  const [filtreCoursNote, setFiltreCoursNote] = useState('');
  const [filtreEtudiantNote, setFiltreEtudiantNote] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      let allEnseignants = [];
      let allEtudiants = [];
      let allEtudiantsGrouped = [];
      let allCours = [];
      let allNotes = [];

      try {
        const enseignantsResponse = await enseignantService.getAll();
        allEnseignants = enseignantsResponse.data.data?.data || enseignantsResponse.data.data || [];
        setEnseignants(allEnseignants);
      } catch (err) {
        console.error('Erreur enseignants:', err);
      }

      try {
        // 🆕 Récupérer données groupées
        const etudiantsGroupedResponse = await etudiantService.getGrouped();
        allEtudiantsGrouped = etudiantsGroupedResponse.data.data || [];
        setEtudiantsGrouped(allEtudiantsGrouped);

        // Récupérer aussi la liste plate pour les modals
        const etudiantsResponse = await etudiantService.getAll();
        allEtudiants = etudiantsResponse.data.data?.data || etudiantsResponse.data.data || [];
        setEtudiants(allEtudiants);
      } catch (err) {
        console.error('Erreur étudiants:', err);
      }

      try {
        const coursResponse = await coursService.getAll();
        allCours = coursResponse.data.data?.data || coursResponse.data.data || [];
        setCours(allCours);
      } catch (err) {
        console.error('Erreur cours:', err);
      }

      try {
        const notesResponse = await noteService.getAll();
        allNotes = notesResponse.data.data?.data || notesResponse.data.data || [];
        setNotes(allNotes);

        let moyenne = 0;
        if (allNotes.length > 0) {
          const somme = allNotes.reduce((acc, note) => acc + parseFloat(note.valeur || 0), 0);
          moyenne = (somme / allNotes.length).toFixed(2);
        }

        setStats({
          totalEnseignants: allEnseignants.length,
          totalEtudiants: allEtudiants.length,
          totalCours: allCours.length,
          totalNotes: allNotes.length,
          moyenneGenerale: moyenne,
        });
      } catch (err) {
        console.error('Erreur notes:', err);
        setStats({
          totalEnseignants: allEnseignants.length,
          totalEtudiants: allEtudiants.length,
          totalCours: allCours.length,
          totalNotes: 0,
          moyenneGenerale: 0,
        });
      }
    } catch (error) {
      console.error('Erreur globale:', error);
    } finally {
      setLoading(false);
    }
  };

  // 🆕 TOGGLE FILIÈRE
  const toggleFiliere = (filiere) => {
    setExpandedFilieres(prev => ({
      ...prev,
      [filiere]: !prev[filiere]
    }));
  };

  // 🆕 TOGGLE NIVEAU
  const toggleNiveau = (filiere, niveau) => {
    const key = `${filiere}-${niveau}`;
    setExpandedNiveaux(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // 🆕 FILTRER ÉTUDIANTS PAR RECHERCHE
  const filteredGrouped = etudiantsGrouped.map(filiereGroup => ({
    ...filiereGroup,
    niveaux: filiereGroup.niveaux.map(niveauGroup => ({
      ...niveauGroup,
      etudiants: niveauGroup.etudiants.filter(etu => {
        const searchLower = searchTerm.toLowerCase();
        return (
          etu.nom.toLowerCase().includes(searchLower) ||
          etu.prenom.toLowerCase().includes(searchLower) ||
          etu.matricule.toLowerCase().includes(searchLower) ||
          etu.email.toLowerCase().includes(searchLower)
        );
      })
    })).filter(niveauGroup => niveauGroup.etudiants.length > 0)
  })).filter(filiereGroup => filiereGroup.niveaux.length > 0);

  // === HANDLERS (suite identique à l'ancien code) ===
  
  const handleOpenModalEnseignant = (enseignant = null) => {
    if (enseignant) {
      setEditingEnseignant(enseignant);
      setFormEnseignant({
        nom: enseignant.nom, prenom: enseignant.prenom, email: enseignant.email,
        mot_de_passe: '', date_naissance: enseignant.date_naissance || '', specialite: enseignant.specialite || '',
      });
    } else {
      setEditingEnseignant(null);
      setFormEnseignant({ nom: '', prenom: '', email: '', mot_de_passe: '', date_naissance: '', specialite: '' });
    }
    setErrorsEnseignant({});
    setMessageEnseignant({ type: '', text: '' });
    setShowModalEnseignant(true);
  };

  const handleChangeEnseignant = (e) => {
    const { name, value } = e.target;
    setFormEnseignant((prev) => ({ ...prev, [name]: value }));
    if (errorsEnseignant[name]) {
      setErrorsEnseignant((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmitEnseignant = async (e) => {
    e.preventDefault();
    if (loadingEnseignant) return;
    
    setMessageEnseignant({ type: '', text: '' });
    setErrorsEnseignant({});

    try {
      setLoadingEnseignant(true);
      let response;
      
      if (editingEnseignant) {
        const dataToUpdate = { ...formEnseignant };
        if (!dataToUpdate.mot_de_passe) delete dataToUpdate.mot_de_passe;
        response = await enseignantService.update(editingEnseignant.id_enseignant, dataToUpdate);
      } else {
        response = await enseignantService.create(formEnseignant);
      }

      if (response.data.success || response.status === 200 || response.status === 201) {
        setMessageEnseignant({
          type: 'success',
          text: editingEnseignant ? 'Enseignant modifié avec succès !' : 'Enseignant créé avec succès !',
        });

        setTimeout(() => {
          setShowModalEnseignant(false);
          setMessageEnseignant({ type: '', text: '' });
          setLoadingEnseignant(false);
          fetchData();
        }, 1500);
      } else {
        throw new Error('Réponse inattendue du serveur');
      }
    } catch (error) {
      console.error('❌ Erreur enseignant:', error);
      
      if (error.response?.data?.errors) {
        setErrorsEnseignant(error.response.data.errors);
      } else {
        setMessageEnseignant({
          type: 'error',
          text: error.response?.data?.message || "Erreur lors de l'opération",
        });
      }
      
      setLoadingEnseignant(false);
    }
  };

  const handleDeleteEnseignant = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cet enseignant ?')) return;

    try {
      const response = await enseignantService.delete(id);
      
      if (response.data?.success || response.status === 200 || response.status === 204) {
        alert('Enseignant supprimé avec succès !');
        fetchData();
      }
    } catch (error) {
      console.error('Erreur suppression:', error);
      alert(error.response?.data?.message || 'Erreur lors de la suppression');
    }
  };

  const handleOpenModalEtudiant = (etudiant = null) => {
    if (etudiant) {
      setEditingEtudiant(etudiant);
      setFormEtudiant({
        nom: etudiant.nom, prenom: etudiant.prenom, email: etudiant.email,
        mot_de_passe: '', date_naissance: etudiant.date_naissance || '',
        filiere: etudiant.filiere || '', niveau: etudiant.niveau || '',
      });
    } else {
      setEditingEtudiant(null);
      setFormEtudiant({
        nom: '', prenom: '', email: '', mot_de_passe: '', date_naissance: '', filiere: '', niveau: '',
      });
    }
    setErrorsEtudiant({});
    setMessageEtudiant({ type: '', text: '' });
    setShowModalEtudiant(true);
  };

  const handleChangeEtudiant = (e) => {
    const { name, value } = e.target;
    setFormEtudiant((prev) => ({ ...prev, [name]: value }));
    if (errorsEtudiant[name]) {
      setErrorsEtudiant((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmitEtudiant = async (e) => {
    e.preventDefault();
    if (loadingEtudiant) return;
    
    setMessageEtudiant({ type: '', text: '' });
    setErrorsEtudiant({});

    try {
      setLoadingEtudiant(true);
      let response;
      
      if (editingEtudiant) {
        const dataToUpdate = { ...formEtudiant };
        if (!dataToUpdate.mot_de_passe) delete dataToUpdate.mot_de_passe;
        response = await etudiantService.update(editingEtudiant.id_etudiant, dataToUpdate);
      } else {
        response = await etudiantService.create(formEtudiant);
      }

      if (response.data.success || response.status === 200 || response.status === 201) {
        setMessageEtudiant({
          type: 'success',
          text: editingEtudiant ? 'Étudiant modifié avec succès !' : 'Étudiant créé avec succès !',
        });

        setTimeout(() => {
          setShowModalEtudiant(false);
          setMessageEtudiant({ type: '', text: '' });
          setLoadingEtudiant(false);
          fetchData();
        }, 1500);
      } else {
        throw new Error('Réponse inattendue du serveur');
      }
    } catch (error) {
      console.error('❌ Erreur étudiant:', error);
      
      if (error.response?.data?.errors) {
        setErrorsEtudiant(error.response.data.errors);
      } else {
        setMessageEtudiant({
          type: 'error',
          text: error.response?.data?.message || "Erreur lors de l'opération",
        });
      }
      
      setLoadingEtudiant(false);
    }
  };

  const handleDeleteEtudiant = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cet étudiant ?')) return;

    try {
      const response = await etudiantService.delete(id);
      
      if (response.data?.success || response.status === 200 || response.status === 204) {
        alert('Étudiant supprimé avec succès !');
        fetchData();
      }
    } catch (error) {
      console.error('Erreur suppression:', error);
      alert(error.response?.data?.message || 'Erreur lors de la suppression');
    }
  };
  // === HANDLERS COURS ===
  const handleOpenModalCours = (cours = null) => {
    if (cours) {
      setEditingCours(cours);
      setFormCours({
        code: cours.code, titre: cours.titre, description: cours.description || '', id_enseignant: cours.id_enseignant || '',
      });
    } else {
      setEditingCours(null);
      setFormCours({ code: '', titre: '', description: '', id_enseignant: '' });
    }
    setErrorsCours({});
    setMessageCours({ type: '', text: '' });
    setShowModalCours(true);
  };

  const handleChangeCours = (e) => {
    const { name, value } = e.target;
    setFormCours((prev) => ({ ...prev, [name]: value }));
    if (errorsCours[name]) {
      setErrorsCours((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmitCours = async (e) => {
    e.preventDefault();
    if (loadingCours) return;
    
    setMessageCours({ type: '', text: '' });
    setErrorsCours({});

    try {
      setLoadingCours(true);
      let response;
      
      if (editingCours) {
        response = await coursService.update(editingCours.id_cours, formCours);
      } else {
        response = await coursService.create(formCours);
      }

      if (response.data.success || response.status === 200 || response.status === 201) {
        setMessageCours({
          type: 'success',
          text: editingCours ? 'Cours modifié avec succès !' : 'Cours créé avec succès !',
        });

        setTimeout(() => {
          setShowModalCours(false);
          setMessageCours({ type: '', text: '' });
          setLoadingCours(false);
          fetchData();
        }, 1500);
      } else {
        throw new Error('Réponse inattendue du serveur');
      }
    } catch (error) {
      console.error('❌ Erreur cours:', error);
      
      if (error.response?.data?.errors) {
        setErrorsCours(error.response.data.errors);
      } else {
        setMessageCours({
          type: 'error',
          text: error.response?.data?.message || "Erreur lors de l'opération",
        });
      }
      
      setLoadingCours(false);
    }
  };

  const handleDeleteCours = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce cours ?')) return;

    try {
      const response = await coursService.delete(id);
      
      if (response.data?.success || response.status === 200 || response.status === 204) {
        alert('Cours supprimé avec succès !');
        fetchData();
      }
    } catch (error) {
      console.error('Erreur suppression:', error);
      alert(error.response?.data?.message || 'Erreur lors de la suppression');
    }
  };

  // === HANDLERS NOTES ===
  const handleOpenModalNote = (note = null) => {
    if (note) {
      setEditingNote(note);
      setFormNote({
        id_etudiant: note.id_etudiant, id_cours: note.id_cours, valeur: note.valeur,
        date_evaluation: note.date_evaluation || new Date().toISOString().split('T')[0],
      });
    } else {
      setEditingNote(null);
      setFormNote({
        id_etudiant: '', id_cours: '', valeur: '', date_evaluation: new Date().toISOString().split('T')[0],
      });
    }
    setErrorsNote({});
    setMessageNote({ type: '', text: '' });
    setShowModalNote(true);
  };

  const handleChangeNote = (e) => {
    const { name, value } = e.target;
    setFormNote((prev) => ({ ...prev, [name]: value }));
    if (errorsNote[name]) {
      setErrorsNote((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmitNote = async (e) => {
    e.preventDefault();
    if (loadingNote) return;
    
    setMessageNote({ type: '', text: '' });
    setErrorsNote({});

    try {
      setLoadingNote(true);
      let response;
      
      if (editingNote) {
        response = await noteService.update(editingNote.id_note, formNote);
      } else {
        response = await noteService.create(formNote);
      }

      if (response.data.success || response.status === 200 || response.status === 201) {
        setMessageNote({
          type: 'success',
          text: editingNote ? 'Note modifiée avec succès !' : 'Note créée avec succès !',
        });

        setTimeout(() => {
          setShowModalNote(false);
          setMessageNote({ type: '', text: '' });
          setLoadingNote(false);
          fetchData();
        }, 1500);
      } else {
        throw new Error('Réponse inattendue du serveur');
      }
    } catch (error) {
      console.error('❌ Erreur note:', error);
      
      if (error.response?.data?.errors) {
        setErrorsNote(error.response.data.errors);
      } else {
        setMessageNote({
          type: 'error',
          text: error.response?.data?.message || "Erreur lors de l'opération",
        });
      }
      
      setLoadingNote(false);
    }
  };

  const handleDeleteNote = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette note ?')) return;

    try {
      const response = await noteService.delete(id);
      
      if (response.data?.success || response.status === 200 || response.status === 204) {
        alert('Note supprimée avec succès !');
        fetchData();
      }
    } catch (error) {
      console.error('Erreur suppression:', error);
      alert(error.response?.data?.message || 'Erreur lors de la suppression');
    }
  };

  const notesFiltrees = notes.filter(note => {
    const matchCours = !filtreCoursNote || note.id_cours === parseInt(filtreCoursNote);
    const matchEtudiant = !filtreEtudiantNote || note.id_etudiant === parseInt(filtreEtudiantNote);
    return matchCours && matchEtudiant;
  });

  return (
    <div className="min-h-screen" style={{ backgroundColor: MEDICAL_COLORS.gray50 }}>
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* EN-TÊTE */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold" style={{ color: MEDICAL_COLORS.gray900 }}>
            Tableau de bord Administrateur
          </h1>
          <p className="mt-2" style={{ color: MEDICAL_COLORS.gray600 }}>
            Bienvenue {user?.prenom} ! Gérez l'ensemble de la plateforme MedCampus.
          </p>
        </div>

        {/* STATISTIQUES */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <StatCard icon="👨‍🏫" title="Enseignants" value={stats.totalEnseignants} color="blue" />
          <StatCard icon="👨‍🎓" title="Étudiants" value={stats.totalEtudiants} color="green" />
          <StatCard icon="📚" title="Cours" value={stats.totalCours} color="purple" />
          <StatCard icon="📝" title="Notes" value={stats.totalNotes} color="orange" />
          <StatCard icon="📊" title="Moyenne" value={`${stats.moyenneGenerale}/20`} color="red" />
        </div>

        {/* ONGLETS */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="border-b" style={{ borderColor: MEDICAL_COLORS.gray200 }}>
            <nav className="flex -mb-px">
              {[
                { id: 'overview', label: '📊 Vue d\'ensemble' },
                { id: 'enseignants', label: '👨‍🏫 Enseignants' },
                { id: 'etudiants', label: '👨‍🎓 Étudiants' },
                { id: 'cours', label: '📚 Cours' },
                { id: 'notes', label: '📝 Notes' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-6 text-sm font-medium transition-colors ${
                    activeTab === tab.id ? 'border-b-2' : ''
                  }`}
                  style={
                    activeTab === tab.id
                      ? { borderBottomColor: MEDICAL_COLORS.primary, color: MEDICAL_COLORS.primary }
                      : { color: MEDICAL_COLORS.gray600 }
                  }
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div
              className="inline-block animate-spin rounded-full h-12 w-12 border-b-2"
              style={{ borderColor: MEDICAL_COLORS.primary }}
            ></div>
            <p className="mt-4" style={{ color: MEDICAL_COLORS.gray600 }}>Chargement...</p>
          </div>
        ) : (
          <>
            {/* VUE D'ENSEMBLE */}
            {activeTab === 'overview' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card title="Derniers Enseignants">
                  {enseignants.length === 0 ? (
                    <p className="text-center py-4" style={{ color: MEDICAL_COLORS.gray600 }}>Aucun enseignant</p>
                  ) : (
                    <div className="space-y-3">
                      {enseignants.slice(0, 5).map((ens) => (
                        <div
                          key={ens.id_enseignant}
                          className="flex items-center justify-between p-3 rounded-lg"
                          style={{ backgroundColor: MEDICAL_COLORS.gray50 }}
                        >
                          <div>
                            <p className="font-medium" style={{ color: MEDICAL_COLORS.gray900 }}>
                              {ens.prenom} {ens.nom}
                            </p>
                            <p className="text-sm" style={{ color: MEDICAL_COLORS.gray600 }}>{ens.email}</p>
                          </div>
                          <span className="text-2xl">👨‍🏫</span>
                        </div>
                      ))}
                    </div>
                  )}
                </Card>

                <Card title="Derniers Étudiants">
                  {etudiants.length === 0 ? (
                    <p className="text-center py-4" style={{ color: MEDICAL_COLORS.gray600 }}>Aucun étudiant</p>
                  ) : (
                    <div className="space-y-3">
                      {etudiants.slice(0, 5).map((etu) => (
                        <div
                          key={etu.id_etudiant}
                          className="flex items-center justify-between p-3 rounded-lg"
                          style={{ backgroundColor: MEDICAL_COLORS.gray50 }}
                        >
                          <div>
                            <p className="font-medium" style={{ color: MEDICAL_COLORS.gray900 }}>
                              {etu.prenom} {etu.nom}
                            </p>
                            <p className="text-sm" style={{ color: MEDICAL_COLORS.gray600 }}>
                              {etu.matricule} {etu.niveau && `• ${etu.niveau}`}
                            </p>
                          </div>
                          <span className="text-2xl">👨‍🎓</span>
                        </div>
                      ))}
                    </div>
                  )}
                </Card>

                <Card title="Cours Actifs">
                  {cours.length === 0 ? (
                    <p className="text-center py-4" style={{ color: MEDICAL_COLORS.gray600 }}>Aucun cours</p>
                  ) : (
                    <div className="space-y-3">
                      {cours.slice(0, 5).map((c) => (
                        <div
                          key={c.id_cours}
                          className="flex items-center justify-between p-3 rounded-lg"
                          style={{ backgroundColor: MEDICAL_COLORS.gray50 }}
                        >
                          <div>
                            <p className="font-medium" style={{ color: MEDICAL_COLORS.gray900 }}>{c.titre}</p>
                            <p className="text-sm" style={{ color: MEDICAL_COLORS.gray600 }}>Code: {c.code}</p>
                          </div>
                          <span className="text-2xl">📚</span>
                        </div>
                      ))}
                    </div>
                  )}
                </Card>

                <Card title="Statistiques Récentes">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span style={{ color: MEDICAL_COLORS.gray600 }}>Total utilisateurs</span>
                      <span className="text-xl font-bold" style={{ color: MEDICAL_COLORS.primary }}>
                        {stats.totalEnseignants + stats.totalEtudiants}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span style={{ color: MEDICAL_COLORS.gray600 }}>Notes attribuées</span>
                      <span className="text-xl font-bold" style={{ color: MEDICAL_COLORS.secondary }}>
                        {stats.totalNotes}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span style={{ color: MEDICAL_COLORS.gray600 }}>Moyenne générale</span>
                      <span className="text-xl font-bold" style={{ color: MEDICAL_COLORS.purple }}>
                        {stats.moyenneGenerale}/20
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span style={{ color: MEDICAL_COLORS.gray600 }}>Cours disponibles</span>
                      <span className="text-xl font-bold" style={{ color: MEDICAL_COLORS.orange }}>
                        {stats.totalCours}
                      </span>
                    </div>
                  </div>
                </Card>
              </div>
            )}

            {/* ENSEIGNANTS */}
            {activeTab === 'enseignants' && (
              <div>
                <div className="mb-6 flex justify-between items-center">
                  <h2 className="text-2xl font-bold" style={{ color: MEDICAL_COLORS.gray800 }}>
                    Gestion des Enseignants
                  </h2>
                  <Button variant="primary" onClick={() => handleOpenModalEnseignant()}>
                    ➕ Ajouter un enseignant
                  </Button>
                </div>

                <Card>
                  {enseignants.length === 0 ? (
                    <p className="text-center py-8" style={{ color: MEDICAL_COLORS.gray600 }}>Aucun enseignant</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y" style={{ borderColor: MEDICAL_COLORS.gray200 }}>
                        <thead style={{ backgroundColor: MEDICAL_COLORS.gray50 }}>
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase" style={{ color: MEDICAL_COLORS.gray600 }}>
                              Enseignant
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase" style={{ color: MEDICAL_COLORS.gray600 }}>
                              Email
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase" style={{ color: MEDICAL_COLORS.gray600 }}>
                              Spécialité
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase" style={{ color: MEDICAL_COLORS.gray600 }}>
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y" style={{ borderColor: MEDICAL_COLORS.gray200 }}>
                          {enseignants.map((ens) => (
                            <tr key={ens.id_enseignant} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <span className="text-2xl mr-3">👨‍🏫</span>
                                  <p className="font-medium" style={{ color: MEDICAL_COLORS.gray900 }}>
                                    {ens.prenom} {ens.nom}
                                  </p>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: MEDICAL_COLORS.gray600 }}>
                                {ens.email}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: MEDICAL_COLORS.gray600 }}>
                                {ens.specialite || '-'}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                <button
                                  onClick={() => handleOpenModalEnseignant(ens)}
                                  className="hover:opacity-80"
                                  style={{ color: MEDICAL_COLORS.primary }}
                                >
                                  ✏️ Modifier
                                </button>
                                <button
                                  onClick={() => handleDeleteEnseignant(ens.id_enseignant)}
                                  className="hover:opacity-80"
                                  style={{ color: MEDICAL_COLORS.accent }}
                                >
                                  🗑️ Supprimer
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </Card>
              </div>
            )}

            {/* 🆕 ÉTUDIANTS HIÉRARCHIQUE */}
            {activeTab === 'etudiants' && (
              <div>
                <div className="mb-6 flex justify-between items-center">
                  <h2 className="text-2xl font-bold" style={{ color: MEDICAL_COLORS.gray800 }}>
                    Gestion des Étudiants
                  </h2>
                  <Button variant="primary" onClick={() => handleOpenModalEtudiant()}>
                    ➕ Ajouter un étudiant
                  </Button>
                </div>

                {/* 🔍 BARRE DE RECHERCHE */}
                <div className="mb-6">
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl">🔍</span>
                    <input
                      type="text"
                      placeholder="Rechercher un étudiant (nom, prénom, matricule, email)..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 rounded-xl border focus:outline-none focus:ring-2"
                      style={{
                        borderColor: MEDICAL_COLORS.gray300,
                        backgroundColor: 'white',
                      }}
                      onFocus={(e) => e.target.style.borderColor = MEDICAL_COLORS.primary}
                      onBlur={(e) => e.target.style.borderColor = MEDICAL_COLORS.gray300}
                    />
                  </div>
                </div>

                {/* 🆕 AFFICHAGE HIÉRARCHIQUE */}
                {filteredGrouped.length === 0 ? (
                  <Card>
                    <p className="text-center py-8" style={{ color: MEDICAL_COLORS.gray600 }}>
                      {searchTerm ? `Aucun résultat pour "${searchTerm}"` : 'Aucun étudiant'}
                    </p>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {filteredGrouped.map((filiereGroup) => {
                      const filiereConfig = FILIERES_CONFIG[filiereGroup.filiere] || FILIERES_CONFIG.default;
                      const isExpandedFiliere = expandedFilieres[filiereGroup.filiere];

                      return (
                        <div key={filiereGroup.filiere} className="bg-white rounded-xl shadow-sm overflow-hidden">
                          {/* HEADER FILIÈRE */}
                          <button
                            onClick={() => toggleFiliere(filiereGroup.filiere)}
                            className="w-full px-6 py-4 flex items-center justify-between hover:opacity-90 transition-all"
                            style={{ backgroundColor: filiereConfig.bg }}
                          >
                            <div className="flex items-center gap-3">
                              <span className="text-3xl">{filiereConfig.icon}</span>
                              <div className="text-left">
                                <h3 className="text-xl font-bold" style={{ color: filiereConfig.color }}>
                                  {filiereGroup.filiere}
                                </h3>
                                <p className="text-sm" style={{ color: MEDICAL_COLORS.gray600 }}>
                                  {filiereGroup.total} étudiant{filiereGroup.total > 1 ? 's' : ''}
                                </p>
                              </div>
                            </div>
                            <span className="text-2xl" style={{ color: filiereConfig.color }}>
                              {isExpandedFiliere ? '▼' : '▶'}
                            </span>
                          </button>

                          {/* NIVEAUX */}
                          {isExpandedFiliere && (
                            <div className="px-6 pb-4 space-y-3">
                              {filiereGroup.niveaux.map((niveauGroup) => {
                                const niveauConfig = NIVEAUX_CONFIG[niveauGroup.niveau] || NIVEAUX_CONFIG['L1'];
                                const isExpandedNiveau = expandedNiveaux[`${filiereGroup.filiere}-${niveauGroup.niveau}`];

                                return (
                                  <div key={niveauGroup.niveau} className="border rounded-lg overflow-hidden" style={{ borderColor: MEDICAL_COLORS.gray200 }}>
                                    {/* HEADER NIVEAU */}
                                    <button
                                      onClick={() => toggleNiveau(filiereGroup.filiere, niveauGroup.niveau)}
                                      className="w-full px-4 py-3 flex items-center justify-between hover:opacity-90 transition-all"
                                      style={{ backgroundColor: niveauConfig.bg }}
                                    >
                                      <div className="flex items-center gap-2">
                                        <span className="text-2xl">{niveauConfig.icon}</span>
                                        <div className="text-left">
                                          <p className="font-semibold" style={{ color: niveauConfig.color }}>
                                            {niveauConfig.label}
                                          </p>
                                          <p className="text-xs" style={{ color: MEDICAL_COLORS.gray600 }}>
                                            {niveauGroup.count} étudiant{niveauGroup.count > 1 ? 's' : ''}
                                          </p>
                                        </div>
                                      </div>
                                      <span className="text-lg" style={{ color: niveauConfig.color }}>
                                        {isExpandedNiveau ? '▼' : '▶'}
                                      </span>
                                    </button>

                                    {/* LISTE ÉTUDIANTS */}
                                    {isExpandedNiveau && (
                                      <div className="bg-white">
                                        <table className="min-w-full divide-y" style={{ borderColor: MEDICAL_COLORS.gray200 }}>
                                          <thead style={{ backgroundColor: MEDICAL_COLORS.gray50 }}>
                                            <tr>
                                              <th className="px-4 py-2 text-left text-xs font-medium uppercase" style={{ color: MEDICAL_COLORS.gray600 }}>
                                                Étudiant
                                              </th>
                                              <th className="px-4 py-2 text-left text-xs font-medium uppercase" style={{ color: MEDICAL_COLORS.gray600 }}>
                                                Matricule
                                              </th>
                                              <th className="px-4 py-2 text-left text-xs font-medium uppercase" style={{ color: MEDICAL_COLORS.gray600 }}>
                                                Email
                                              </th>
                                              <th className="px-4 py-2 text-left text-xs font-medium uppercase" style={{ color: MEDICAL_COLORS.gray600 }}>
                                                Actions
                                              </th>
                                            </tr>
                                          </thead>
                                          <tbody className="divide-y" style={{ borderColor: MEDICAL_COLORS.gray200 }}>
                                            {niveauGroup.etudiants.map((etu) => (
                                              <tr key={etu.id_etudiant} className="hover:bg-gray-50">
                                                <td className="px-4 py-3 whitespace-nowrap">
                                                  <div className="flex items-center">
                                                    <span className="text-xl mr-2">👨‍🎓</span>
                                                    <p className="font-medium text-sm" style={{ color: MEDICAL_COLORS.gray900 }}>
                                                      {etu.prenom} {etu.nom}
                                                    </p>
                                                  </div>
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap text-xs" style={{ color: MEDICAL_COLORS.gray600 }}>
                                                  {etu.matricule}
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap text-xs" style={{ color: MEDICAL_COLORS.gray600 }}>
                                                  {etu.email}
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap text-xs font-medium space-x-2">
                                                  <button
                                                    onClick={() => handleOpenModalEtudiant(etu)}
                                                    className="hover:opacity-80"
                                                    style={{ color: MEDICAL_COLORS.primary }}
                                                  >
                                                    ✏️
                                                  </button>
                                                  <button
                                                    onClick={() => handleDeleteEtudiant(etu.id_etudiant)}
                                                    className="hover:opacity-80"
                                                    style={{ color: MEDICAL_COLORS.accent }}
                                                  >
                                                    🗑️
                                                  </button>
                                                </td>
                                              </tr>
                                            ))}
                                          </tbody>
                                        </table>
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
              </div>
            )}{/* COURS */}
            {activeTab === 'cours' && (
              <div>
                <div className="mb-6 flex justify-between items-center">
                  <h2 className="text-2xl font-bold" style={{ color: MEDICAL_COLORS.gray800 }}>
                    Gestion des Cours
                  </h2>
                  <Button variant="primary" onClick={() => handleOpenModalCours()}>
                    ➕ Ajouter un cours
                  </Button>
                </div>

                <Card>
                  {cours.length === 0 ? (
                    <p className="text-center py-8" style={{ color: MEDICAL_COLORS.gray600 }}>Aucun cours</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y" style={{ borderColor: MEDICAL_COLORS.gray200 }}>
                        <thead style={{ backgroundColor: MEDICAL_COLORS.gray50 }}>
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase" style={{ color: MEDICAL_COLORS.gray600 }}>
                              Code
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase" style={{ color: MEDICAL_COLORS.gray600 }}>
                              Titre
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase" style={{ color: MEDICAL_COLORS.gray600 }}>
                              Enseignant
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase" style={{ color: MEDICAL_COLORS.gray600 }}>
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y" style={{ borderColor: MEDICAL_COLORS.gray200 }}>
                          {cours.map((c) => (
                            <tr key={c.id_cours} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <span className="text-2xl mr-3">📚</span>
                                  <p className="font-medium" style={{ color: MEDICAL_COLORS.gray900 }}>{c.code}</p>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: MEDICAL_COLORS.gray900 }}>
                                {c.titre}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: MEDICAL_COLORS.gray600 }}>
                                {c.enseignant ? `${c.enseignant.prenom} ${c.enseignant.nom}` : '-'}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                <button
                                  onClick={() => handleOpenModalCours(c)}
                                  className="hover:opacity-80"
                                  style={{ color: MEDICAL_COLORS.primary }}
                                >
                                  ✏️ Modifier
                                </button>
                                <button
                                  onClick={() => handleDeleteCours(c.id_cours)}
                                  className="hover:opacity-80"
                                  style={{ color: MEDICAL_COLORS.accent }}
                                >
                                  🗑️ Supprimer
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </Card>
              </div>
            )}

            {/* NOTES */}
            {activeTab === 'notes' && (
              <div>
                <div className="mb-6 flex justify-between items-center">
                  <h2 className="text-2xl font-bold" style={{ color: MEDICAL_COLORS.gray800 }}>
                    Gestion des Notes
                  </h2>
                  <Button variant="primary" onClick={() => handleOpenModalNote()}>
                    ➕ Ajouter une note
                  </Button>
                </div>

                {/* FILTRES */}
                <div className="mb-6 bg-white p-4 rounded-lg shadow flex gap-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium mb-2" style={{ color: MEDICAL_COLORS.gray700 }}>
                      Filtrer par cours
                    </label>
                    <select
                      value={filtreCoursNote}
                      onChange={(e) => setFiltreCoursNote(e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:outline-none"
                      style={{ borderColor: MEDICAL_COLORS.gray300 }}
                    >
                      <option value="">Tous les cours</option>
                      {cours.map((c) => (
                        <option key={c.id_cours} value={c.id_cours}>
                          {c.code} - {c.titre}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex-1">
                    <label className="block text-sm font-medium mb-2" style={{ color: MEDICAL_COLORS.gray700 }}>
                      Filtrer par étudiant
                    </label>
                    <select
                      value={filtreEtudiantNote}
                      onChange={(e) => setFiltreEtudiantNote(e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:outline-none"
                      style={{ borderColor: MEDICAL_COLORS.gray300 }}
                    >
                      <option value="">Tous les étudiants</option>
                      {etudiants.map((etu) => (
                        <option key={etu.id_etudiant} value={etu.id_etudiant}>
                          {etu.prenom} {etu.nom}
                        </option>
                      ))}
                    </select>
                  </div>

                  {(filtreCoursNote || filtreEtudiantNote) && (
                    <div className="flex items-end">
                      <Button
                        variant="secondary"
                        onClick={() => {
                          setFiltreCoursNote('');
                          setFiltreEtudiantNote('');
                        }}
                      >
                        Réinitialiser
                      </Button>
                    </div>
                  )}
                </div>

                <Card>
                  {notesFiltrees.length === 0 ? (
                    <p className="text-center py-8" style={{ color: MEDICAL_COLORS.gray600 }}>Aucune note</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y" style={{ borderColor: MEDICAL_COLORS.gray200 }}>
                        <thead style={{ backgroundColor: MEDICAL_COLORS.gray50 }}>
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase" style={{ color: MEDICAL_COLORS.gray600 }}>
                              Étudiant
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase" style={{ color: MEDICAL_COLORS.gray600 }}>
                              Cours
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase" style={{ color: MEDICAL_COLORS.gray600 }}>
                              Note
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase" style={{ color: MEDICAL_COLORS.gray600 }}>
                              Date
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase" style={{ color: MEDICAL_COLORS.gray600 }}>
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y" style={{ borderColor: MEDICAL_COLORS.gray200 }}>
                          {notesFiltrees.map((note) => (
                            <tr key={note.id_note} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <span className="text-2xl mr-3">👨‍🎓</span>
                                  <p className="font-medium" style={{ color: MEDICAL_COLORS.gray900 }}>
                                    {note.etudiant ? `${note.etudiant.prenom} ${note.etudiant.nom}` : '-'}
                                  </p>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: MEDICAL_COLORS.gray600 }}>
                                {note.cours ? `${note.cours.code} - ${note.cours.titre}` : '-'}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span
                                  className="px-3 py-1 rounded-full text-sm font-semibold"
                                  style={{
                                    backgroundColor: note.valeur >= 10 ? MEDICAL_COLORS.bgGreen : '#FEE2E2',
                                    color: note.valeur >= 10 ? MEDICAL_COLORS.secondary : MEDICAL_COLORS.accent,
                                  }}
                                >
                                  {note.valeur}/20
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: MEDICAL_COLORS.gray600 }}>
                                {new Date(note.date_evaluation).toLocaleDateString('fr-FR')}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                <button
                                  onClick={() => handleOpenModalNote(note)}
                                  className="hover:opacity-80"
                                  style={{ color: MEDICAL_COLORS.primary }}
                                >
                                  ✏️ Modifier
                                </button>
                                <button
                                  onClick={() => handleDeleteNote(note.id_note)}
                                  className="hover:opacity-80"
                                  style={{ color: MEDICAL_COLORS.accent }}
                                >
                                  🗑️ Supprimer
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </Card>
              </div>
            )}
          </>
        )}
      </div>

      {/* ===== MODALS ===== */}

      {/* MODAL ENSEIGNANT */}
      <Modal
        isOpen={showModalEnseignant}
        onClose={() => !loadingEnseignant && setShowModalEnseignant(false)}
        title={editingEnseignant ? 'Modifier un enseignant' : 'Ajouter un enseignant'}
      >
        {messageEnseignant.text && (
          <div
            className={`mb-4 p-4 rounded-lg border-l-4`}
            style={{
              backgroundColor: messageEnseignant.type === 'success' ? MEDICAL_COLORS.bgGreen : '#FEE2E2',
              borderLeftColor: messageEnseignant.type === 'success' ? MEDICAL_COLORS.secondary : MEDICAL_COLORS.accent,
              color: messageEnseignant.type === 'success' ? MEDICAL_COLORS.secondary : MEDICAL_COLORS.accent,
            }}
          >
            {messageEnseignant.text}
          </div>
        )}

        <form onSubmit={handleSubmitEnseignant}>
          <Input
            label="Nom"
            type="text"
            name="nom"
            value={formEnseignant.nom}
            onChange={handleChangeEnseignant}
            error={errorsEnseignant.nom?.[0]}
            required
            placeholder="Dupont"
          />
          <Input
            label="Prénom"
            type="text"
            name="prenom"
            value={formEnseignant.prenom}
            onChange={handleChangeEnseignant}
            error={errorsEnseignant.prenom?.[0]}
            required
            placeholder="Jean"
          />
          <Input
            label="Email"
            type="email"
            name="email"
            value={formEnseignant.email}
            onChange={handleChangeEnseignant}
            error={errorsEnseignant.email?.[0]}
            required
            placeholder="jean.dupont@medcampus.cf"
          />
          <Input
            label={editingEnseignant ? 'Nouveau mot de passe (laisser vide pour ne pas changer)' : 'Mot de passe'}
            type="password"
            name="mot_de_passe"
            value={formEnseignant.mot_de_passe}
            onChange={handleChangeEnseignant}
            error={errorsEnseignant.mot_de_passe?.[0]}
            required={!editingEnseignant}
            placeholder="••••••••"
          />
          <Input
            label="Date de naissance"
            type="date"
            name="date_naissance"
            value={formEnseignant.date_naissance}
            onChange={handleChangeEnseignant}
            error={errorsEnseignant.date_naissance?.[0]}
            required
          />
          <Input
            label="Spécialité"
            type="text"
            name="specialite"
            value={formEnseignant.specialite}
            onChange={handleChangeEnseignant}
            error={errorsEnseignant.specialite?.[0]}
            placeholder="Cardiologie"
          />

          <div className="flex gap-4 mt-6">
            <Button type="submit" variant="primary" className="flex-1" disabled={loadingEnseignant}>
              {loadingEnseignant ? 'Envoi...' : editingEnseignant ? 'Modifier' : 'Créer'}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setShowModalEnseignant(false)}
              className="flex-1"
              disabled={loadingEnseignant}
            >
              Annuler
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL ÉTUDIANT */}
      <Modal
        isOpen={showModalEtudiant}
        onClose={() => !loadingEtudiant && setShowModalEtudiant(false)}
        title={editingEtudiant ? 'Modifier un étudiant' : 'Ajouter un étudiant'}
      >
        {messageEtudiant.text && (
          <div
            className={`mb-4 p-4 rounded-lg border-l-4`}
            style={{
              backgroundColor: messageEtudiant.type === 'success' ? MEDICAL_COLORS.bgGreen : '#FEE2E2',
              borderLeftColor: messageEtudiant.type === 'success' ? MEDICAL_COLORS.secondary : MEDICAL_COLORS.accent,
              color: messageEtudiant.type === 'success' ? MEDICAL_COLORS.secondary : MEDICAL_COLORS.accent,
            }}
          >
            {messageEtudiant.text}
          </div>
        )}

        <form onSubmit={handleSubmitEtudiant}>
          <Input
            label="Nom"
            type="text"
            name="nom"
            value={formEtudiant.nom}
            onChange={handleChangeEtudiant}
            error={errorsEtudiant.nom?.[0]}
            required
            placeholder="Kamara"
          />
          <Input
            label="Prénom"
            type="text"
            name="prenom"
            value={formEtudiant.prenom}
            onChange={handleChangeEtudiant}
            error={errorsEtudiant.prenom?.[0]}
            required
            placeholder="Sophie"
          />
          <Input
            label="Email"
            type="email"
            name="email"
            value={formEtudiant.email}
            onChange={handleChangeEtudiant}
            error={errorsEtudiant.email?.[0]}
            required
            placeholder="sophie.kamara@medcampus.cf"
          />
          <Input
            label={editingEtudiant ? 'Nouveau mot de passe (laisser vide pour ne pas changer)' : 'Mot de passe'}
            type="password"
            name="mot_de_passe"
            value={formEtudiant.mot_de_passe}
            onChange={handleChangeEtudiant}
            error={errorsEtudiant.mot_de_passe?.[0]}
            required={!editingEtudiant}
            placeholder="••••••••"
          />
          <Input
            label="Date de naissance"
            type="date"
            name="date_naissance"
            value={formEtudiant.date_naissance}
            onChange={handleChangeEtudiant}
            error={errorsEtudiant.date_naissance?.[0]}
            required
          />

          {/* FILIÈRE */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2" style={{ color: MEDICAL_COLORS.gray700 }}>
              Filière
            </label>
            <select
              name="filiere"
              value={formEtudiant.filiere}
              onChange={handleChangeEtudiant}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:outline-none"
              style={{ borderColor: MEDICAL_COLORS.gray300 }}
            >
              <option value="">-- Sélectionner une filière --</option>
              <option value="Médecine">🩺 Médecine</option>
              <option value="Pharmacie">💊 Pharmacie</option>
              <option value="Sciences-Biomédicale">🧬 Sciences-Biomédicale</option>
              <option value="Chirurgie">🔬 Chirurgie</option>
              <option value="Pédiatrie">👶 Pédiatrie</option>
              <option value="Gynécologie">🌸 Gynécologie</option>
            </select>
            {errorsEtudiant.filiere && (
              <p className="text-sm mt-1" style={{ color: MEDICAL_COLORS.accent }}>
                {errorsEtudiant.filiere[0]}
              </p>
            )}
          </div>

          {/* NIVEAU */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2" style={{ color: MEDICAL_COLORS.gray700 }}>
              Niveau <span style={{ color: MEDICAL_COLORS.accent }}>*</span>
            </label>
            <select
              name="niveau"
              value={formEtudiant.niveau}
              onChange={handleChangeEtudiant}
              required
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:outline-none"
              style={{ borderColor: MEDICAL_COLORS.gray300 }}
            >
              <option value="">-- Sélectionner un niveau --</option>
              <option value="L1">📘 L1 - Licence 1</option>
              <option value="L2">📗 L2 - Licence 2</option>
              <option value="L3">📙 L3 - Licence 3</option>
              <option value="M1">📕 M1 - Master 1</option>
              <option value="M2">📔 M2 - Master 2</option>
              <option value="Doctorat">🎓 Doctorat</option>
            </select>
            {errorsEtudiant.niveau && (
              <p className="text-sm mt-1" style={{ color: MEDICAL_COLORS.accent }}>
                {errorsEtudiant.niveau[0]}
              </p>
            )}
          </div>

          <div className="flex gap-4 mt-6">
            <Button type="submit" variant="primary" className="flex-1" disabled={loadingEtudiant}>
              {loadingEtudiant ? 'Envoi...' : editingEtudiant ? 'Modifier' : 'Créer'}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setShowModalEtudiant(false)}
              className="flex-1"
              disabled={loadingEtudiant}
            >
              Annuler
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL COURS */}
      <Modal
        isOpen={showModalCours}
        onClose={() => !loadingCours && setShowModalCours(false)}
        title={editingCours ? 'Modifier un cours' : 'Ajouter un cours'}
      >
        {messageCours.text && (
          <div
            className={`mb-4 p-4 rounded-lg border-l-4`}
            style={{
              backgroundColor: messageCours.type === 'success' ? MEDICAL_COLORS.bgGreen : '#FEE2E2',
              borderLeftColor: messageCours.type === 'success' ? MEDICAL_COLORS.secondary : MEDICAL_COLORS.accent,
              color: messageCours.type === 'success' ? MEDICAL_COLORS.secondary : MEDICAL_COLORS.accent,
            }}
          >
            {messageCours.text}
          </div>
        )}

        <form onSubmit={handleSubmitCours}>
          <Input
            label="Code"
            type="text"
            name="code"
            value={formCours.code}
            onChange={handleChangeCours}
            error={errorsCours.code?.[0]}
            required
            placeholder="CARD101"
          />

          <Input
            label="Titre"
            type="text"
            name="titre"
            value={formCours.titre}
            onChange={handleChangeCours}
            error={errorsCours.titre?.[0]}
            required
            placeholder="Cardiologie Générale"
          />

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2" style={{ color: MEDICAL_COLORS.gray700 }}>
              Description
            </label>
            <textarea
              name="description"
              value={formCours.description}
              onChange={handleChangeCours}
              rows="3"
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:outline-none"
              style={{ borderColor: MEDICAL_COLORS.gray300 }}
              placeholder="Description du cours"
            />
            {errorsCours.description && (
              <p className="text-sm mt-1" style={{ color: MEDICAL_COLORS.accent }}>
                {errorsCours.description[0]}
              </p>
            )}
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2" style={{ color: MEDICAL_COLORS.gray700 }}>
              Enseignant <span style={{ color: MEDICAL_COLORS.accent }}>*</span>
            </label>
            <select
              name="id_enseignant"
              value={formCours.id_enseignant}
              onChange={handleChangeCours}
              required
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:outline-none"
              style={{ borderColor: MEDICAL_COLORS.gray300 }}
            >
              <option value="">Sélectionner un enseignant</option>
              {enseignants.map((ens) => (
                <option key={ens.id_enseignant} value={ens.id_enseignant}>
                  {ens.prenom} {ens.nom} ({ens.specialite || 'Pas de spécialité'})
                </option>
              ))}
            </select>
            {errorsCours.id_enseignant && (
              <p className="text-sm mt-1" style={{ color: MEDICAL_COLORS.accent }}>
                {errorsCours.id_enseignant[0]}
              </p>
            )}
          </div>

          <div className="flex gap-4 mt-6">
            <Button type="submit" variant="primary" className="flex-1" disabled={loadingCours}>
              {loadingCours ? 'Envoi...' : editingCours ? 'Modifier' : 'Créer'}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setShowModalCours(false)}
              className="flex-1"
              disabled={loadingCours}
            >
              Annuler
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL NOTE */}
      <Modal
        isOpen={showModalNote}
        onClose={() => !loadingNote && setShowModalNote(false)}
        title={editingNote ? 'Modifier une note' : 'Ajouter une note'}
      >
        {messageNote.text && (
          <div
            className={`mb-4 p-4 rounded-lg border-l-4`}
            style={{
              backgroundColor: messageNote.type === 'success' ? MEDICAL_COLORS.bgGreen : '#FEE2E2',
              borderLeftColor: messageNote.type === 'success' ? MEDICAL_COLORS.secondary : MEDICAL_COLORS.accent,
              color: messageNote.type === 'success' ? MEDICAL_COLORS.secondary : MEDICAL_COLORS.accent,
            }}
          >
            {messageNote.text}
          </div>
        )}

        <form onSubmit={handleSubmitNote}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2" style={{ color: MEDICAL_COLORS.gray700 }}>
              Cours <span style={{ color: MEDICAL_COLORS.accent }}>*</span>
            </label>
            <select
              name="id_cours"
              value={formNote.id_cours}
              onChange={handleChangeNote}
              required
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:outline-none"
              style={{ borderColor: MEDICAL_COLORS.gray300 }}
            >
              <option value="">Sélectionner un cours</option>
              {cours.map((c) => (
                <option key={c.id_cours} value={c.id_cours}>
                  {c.code} - {c.titre}
                </option>
              ))}
            </select>
            {errorsNote.id_cours && (
              <p className="text-sm mt-1" style={{ color: MEDICAL_COLORS.accent }}>
                {errorsNote.id_cours[0]}
              </p>
            )}
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2" style={{ color: MEDICAL_COLORS.gray700 }}>
              Étudiant <span style={{ color: MEDICAL_COLORS.accent }}>*</span>
            </label>
            <select
              name="id_etudiant"
              value={formNote.id_etudiant}
              onChange={handleChangeNote}
              required
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:outline-none"
              style={{ borderColor: MEDICAL_COLORS.gray300 }}
            >
              <option value="">Sélectionner un étudiant</option>
              {etudiants.map((etu) => (
                <option key={etu.id_etudiant} value={etu.id_etudiant}>
                  {etu.prenom} {etu.nom} ({etu.matricule})
                </option>
              ))}
            </select>
            {errorsNote.id_etudiant && (
              <p className="text-sm mt-1" style={{ color: MEDICAL_COLORS.accent }}>
                {errorsNote.id_etudiant[0]}
              </p>
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
            <Button type="submit" variant="primary" className="flex-1" disabled={loadingNote}>
              {loadingNote ? 'Envoi...' : editingNote ? 'Modifier' : 'Créer'}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setShowModalNote(false)}
              className="flex-1"
              disabled={loadingNote}
            >
              Annuler
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}