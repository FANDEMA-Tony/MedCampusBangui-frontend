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

// 🎨 CONFIGURATION SEMESTRES
const SEMESTRES_CONFIG = {
  'S1': { icon: '📅', color: '#3B82F6', bg: '#EFF6FF', label: 'Semestre 1' },
  'S2': { icon: '📅', color: '#10B981', bg: '#F0FDF4', label: 'Semestre 2' },
  'S3': { icon: '📅', color: '#F59E0B', bg: '#FFF7ED', label: 'Semestre 3' },
  'S4': { icon: '📅', color: '#EF4444', bg: '#FEE2E2', label: 'Semestre 4' },
  'S5': { icon: '📅', color: '#8B5CF6', bg: '#F5F3FF', label: 'Semestre 5' },
  'S6': { icon: '📅', color: '#EC4899', bg: '#FDF2F8', label: 'Semestre 6' },
};

export default function DashboardAdmin() {
  const user = getUser();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  // Données
  const [enseignants, setEnseignants] = useState([]);
  const [enseignantsGrouped, setEnseignantsGrouped] = useState([]); // 🆕 AJOUTÉ
  const [etudiantsGrouped, setEtudiantsGrouped] = useState([]);
  const [etudiants, setEtudiants] = useState([]);
  const [coursGrouped, setCoursGrouped] = useState([]);
  const [cours, setCours] = useState([]);
  const [notes, setNotes] = useState([]);
  const [notesGrouped, setNotesGrouped] = useState([]); // 🆕 Notes hiérarchiques

  // États accordéons
  const [expandedFilieres, setExpandedFilieres] = useState({});
  const [expandedNiveaux, setExpandedNiveaux] = useState({});
  const [expandedFilieresC, setExpandedFilieresC] = useState({});
  const [expandedNiveauxC, setExpandedNiveauxC] = useState({});

  // 🆕 États accordéons ENSEIGNANTS
  const [expandedSpecialites, setExpandedSpecialites] = useState({});

  // 🆕 États accordéons NOTES
  const [expandedFilieresN, setExpandedFilieresN] = useState({});
  const [expandedNiveauxN, setExpandedNiveauxN] = useState({});
  const [expandedSemestresN, setExpandedSemestresN] = useState({});

  // Recherche
  const [searchTerm, setSearchTerm] = useState('');
  const [searchCourseTerm, setSearchCourseTerm] = useState('');

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
    code: '', titre: '', description: '', id_enseignant: '', filiere: '', niveau: '',
  });
  const [errorsCours, setErrorsCours] = useState({});
  const [messageCours, setMessageCours] = useState({ type: '', text: '' });

  // 🆕 GESTION NOTES (AVEC SEMESTRE)
  const [showModalNote, setShowModalNote] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [loadingNote, setLoadingNote] = useState(false);
  const [formNote, setFormNote] = useState({
    filiere_note: '', // 🆕
    niveau_note: '',  // 🆕
    id_etudiant: '',
    id_cours: '',
    valeur: '',
    semestre: '',
    date_evaluation: new Date().toISOString().split('T')[0],
  });
  const [errorsNote, setErrorsNote] = useState({});
  const [messageNote, setMessageNote] = useState({ type: '', text: '' });

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
      let allCoursGrouped = [];
      let allNotes = [];
      let allNotesGrouped = []; // 🆕

      try {
        // 🆕 Récupérer enseignants groupés
        const enseignantsGroupedResponse = await enseignantService.getGrouped();
        const allEnseignantsGrouped = enseignantsGroupedResponse.data.data || [];
        setEnseignantsGrouped(allEnseignantsGrouped);

        // Liste plate pour stats
        const enseignantsResponse = await enseignantService.getAll();
        allEnseignants = enseignantsResponse.data.data?.data || enseignantsResponse.data.data || [];
        setEnseignants(allEnseignants);
      } catch (err) {
        console.error('Erreur enseignants:', err);
      }

      try {
        const etudiantsGroupedResponse = await etudiantService.getGrouped();
        allEtudiantsGrouped = etudiantsGroupedResponse.data.data || [];
        setEtudiantsGrouped(allEtudiantsGrouped);

        const etudiantsResponse = await etudiantService.getAll();
        allEtudiants = etudiantsResponse.data.data?.data || etudiantsResponse.data.data || [];
        setEtudiants(allEtudiants);
      } catch (err) {
        console.error('Erreur étudiants:', err);
      }

      try {
        const coursGroupedResponse = await coursService.getGrouped();
        allCoursGrouped = coursGroupedResponse.data.data || [];
        setCoursGrouped(allCoursGrouped);

        const coursResponse = await coursService.getAll();
        allCours = coursResponse.data.data?.data || coursResponse.data.data || [];
        setCours(allCours);
      } catch (err) {
        console.error('Erreur cours:', err);
      }

      try {
        // 🆕 Récupérer notes hiérarchiques
        const notesGroupedResponse = await noteService.getGrouped();
        allNotesGrouped = notesGroupedResponse.data.data || [];
        setNotesGrouped(allNotesGrouped);

        // Liste plate pour stats
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

  // 🆕 TOGGLE ACCORDÉONS ENSEIGNANTS
  const toggleSpecialite = (specialite) => {
    setExpandedSpecialites(prev => ({ ...prev, [specialite]: !prev[specialite] }));
  };

  // TOGGLE ACCORDÉONS ÉTUDIANTS
  const toggleFiliere = (filiere) => {
    setExpandedFilieres(prev => ({ ...prev, [filiere]: !prev[filiere] }));
  };

  const toggleNiveau = (filiere, niveau) => {
    const key = `${filiere}-${niveau}`;
    setExpandedNiveaux(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // TOGGLE ACCORDÉONS COURS
  const toggleFiliereC = (filiere) => {
    setExpandedFilieresC(prev => ({ ...prev, [filiere]: !prev[filiere] }));
  };

  const toggleNiveauC = (filiere, niveau) => {
    const key = `${filiere}-${niveau}`;
    setExpandedNiveauxC(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // 🆕 TOGGLE ACCORDÉONS NOTES
  const toggleFiliereN = (filiere) => {
    setExpandedFilieresN(prev => ({ ...prev, [filiere]: !prev[filiere] }));
  };

  const toggleNiveauN = (filiere, niveau) => {
    const key = `${filiere}-${niveau}`;
    setExpandedNiveauxN(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleSemestreN = (filiere, niveau, semestre) => {
    const key = `${filiere}-${niveau}-${semestre}`;
    setExpandedSemestresN(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // FILTRER ÉTUDIANTS PAR RECHERCHE
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

  // FILTRER COURS PAR RECHERCHE
  const filteredCoursGrouped = coursGrouped.map(filiereGroup => ({
    ...filiereGroup,
    niveaux: filiereGroup.niveaux.map(niveauGroup => ({
      ...niveauGroup,
      cours: niveauGroup.cours.filter(c => {
        const searchLower = searchCourseTerm.toLowerCase();
        return (
          c.code.toLowerCase().includes(searchLower) ||
          c.titre.toLowerCase().includes(searchLower) ||
          (c.enseignant && `${c.enseignant.prenom} ${c.enseignant.nom}`.toLowerCase().includes(searchLower))
        );
      })
    })).filter(niveauGroup => niveauGroup.cours.length > 0)
  })).filter(filiereGroup => filiereGroup.niveaux.length > 0);

  // === HANDLERS ENSEIGNANTS ===
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

  // === HANDLERS ÉTUDIANTS ===
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
        code: cours.code, titre: cours.titre, description: cours.description || '',
        id_enseignant: cours.id_enseignant || '',
        filiere: cours.filiere || '',
        niveau: cours.niveau || '',
      });
    } else {
      setEditingCours(null);
      setFormCours({ code: '', titre: '', description: '', id_enseignant: '', filiere: '', niveau: '' });
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

      // 🔥 CORRECTION : Envoyer filiere et niveau
      const dataToSend = {
        code: formCours.code,
        titre: formCours.titre,
        description: formCours.description,
        id_enseignant: formCours.id_enseignant,
        filiere: formCours.filiere || null,  // 🆕 AJOUTÉ
        niveau: formCours.niveau || null,    // 🆕 AJOUTÉ
      };

      if (editingCours) {
        response = await coursService.update(editingCours.id_cours, dataToSend);
      } else {
        response = await coursService.create(dataToSend);
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
        filiere_note: note.etudiant?.filiere || '', // 🆕
        niveau_note: note.etudiant?.niveau || '',   // 🆕
        id_etudiant: note.id_etudiant,
        id_cours: note.id_cours,
        valeur: note.valeur,
        semestre: note.semestre || '', // 🆕
        date_evaluation: note.date_evaluation || new Date().toISOString().split('T')[0],
      });
    } else {
      setEditingNote(null);
      setFormNote({
        filiere_note: '',  // 🆕
        niveau_note: '',   // 🆕
        id_etudiant: '',
        id_cours: '',
        valeur: '',
        semestre: '', // 🆕
        date_evaluation: new Date().toISOString().split('T')[0],
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
                  className={`py-4 px-6 text-sm font-medium transition-colors ${activeTab === tab.id ? 'border-b-2' : ''
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
            {/* 🆕 VUE D'ENSEMBLE PROFESSIONNELLE AMÉLIORÉE */}
            {activeTab === 'overview' && (
              <div className="space-y-6">

                {/* 🎯 SECTION RAPIDE - ACTIVITÉ RÉCENTE */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                        <span className="text-2xl">⚡</span>
                      </div>
                      <div>
                        <h2 className="text-xl font-bold" style={{ color: MEDICAL_COLORS.gray900 }}>
                          Activité Récente
                        </h2>
                        <p className="text-sm" style={{ color: MEDICAL_COLORS.gray600 }}>
                          Vue d'ensemble des dernières actions
                        </p>
                      </div>
                    </div>
                    <div className="text-sm px-4 py-2 bg-white rounded-lg shadow-sm border" style={{ borderColor: MEDICAL_COLORS.gray200 }}>
                      <span style={{ color: MEDICAL_COLORS.gray600 }}>Aujourd'hui</span>
                      <span className="ml-2 font-bold" style={{ color: MEDICAL_COLORS.primary }}>
                        {new Date().toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                  </div>

                  {/* MINI STATS EN LIGNE */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    <div className="bg-white rounded-xl p-4 border hover:shadow-md transition-shadow" style={{ borderColor: MEDICAL_COLORS.gray200 }}>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs font-medium mb-1" style={{ color: MEDICAL_COLORS.gray600 }}>
                            Nouveaux Étudiants
                          </p>
                          <p className="text-2xl font-bold" style={{ color: MEDICAL_COLORS.secondary }}>
                            +{etudiants.filter(e => {
                              const created = new Date(e.created_at);
                              const today = new Date();
                              return created.toDateString() === today.toDateString();
                            }).length}
                          </p>
                        </div>
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                          <span className="text-xl">👨‍🎓</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white rounded-xl p-4 border hover:shadow-md transition-shadow" style={{ borderColor: MEDICAL_COLORS.gray200 }}>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs font-medium mb-1" style={{ color: MEDICAL_COLORS.gray600 }}>
                            Notes Ajoutées
                          </p>
                          <p className="text-2xl font-bold" style={{ color: MEDICAL_COLORS.orange }}>
                            +{notes.filter(n => {
                              const created = new Date(n.created_at);
                              const today = new Date();
                              return created.toDateString() === today.toDateString();
                            }).length}
                          </p>
                        </div>
                        <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                          <span className="text-xl">📝</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white rounded-xl p-4 border hover:shadow-md transition-shadow" style={{ borderColor: MEDICAL_COLORS.gray200 }}>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs font-medium mb-1" style={{ color: MEDICAL_COLORS.gray600 }}>
                            Taux de Réussite
                          </p>
                          <p className="text-2xl font-bold" style={{ color: MEDICAL_COLORS.secondary }}>
                            {notes.length > 0 ? Math.round((notes.filter(n => n.valeur >= 10).length / notes.length) * 100) : 0}%
                          </p>
                        </div>
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                          <span className="text-xl">🎯</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white rounded-xl p-4 border hover:shadow-md transition-shadow" style={{ borderColor: MEDICAL_COLORS.gray200 }}>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs font-medium mb-1" style={{ color: MEDICAL_COLORS.gray600 }}>
                            Cours Actifs
                          </p>
                          <p className="text-2xl font-bold" style={{ color: MEDICAL_COLORS.purple }}>
                            {stats.totalCours}
                          </p>
                        </div>
                        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                          <span className="text-xl">📚</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 📊 GRILLE PRINCIPALE */}
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">

                  {/* 👨‍🏫 ENSEIGNANTS - CARD AMÉLIORÉE */}
                  <div className="bg-white rounded-2xl shadow-lg overflow-hidden border hover:shadow-2xl transition-all duration-300" style={{ borderColor: MEDICAL_COLORS.gray200 }}>
                    <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                            <span className="text-3xl">👨‍🏫</span>
                          </div>
                          <div>
                            <h3 className="text-white font-bold text-lg">Enseignants</h3>
                            <p className="text-blue-100 text-sm">Corps enseignant</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-4xl font-bold text-white">{stats.totalEnseignants}</p>
                          <p className="text-blue-100 text-xs">Total</p>
                        </div>
                      </div>

                      {/* BARRE DE PROGRESSION */}
                      <div className="w-full bg-white/20 rounded-full h-2 mb-2">
                        <div
                          className="bg-white rounded-full h-2 transition-all duration-500"
                          style={{ width: `${Math.min((stats.totalEnseignants / 10) * 100, 100)}%` }}
                        />
                      </div>
                      <p className="text-blue-100 text-xs">Objectif: 10 enseignants</p>
                    </div>

                    <div className="p-6">
                      <h4 className="font-semibold mb-4 flex items-center gap-2" style={{ color: MEDICAL_COLORS.gray800 }}>
                        <span className="text-lg">⭐</span>
                        Récemment ajoutés
                      </h4>

                      {enseignants.length === 0 ? (
                        <p className="text-center py-6" style={{ color: MEDICAL_COLORS.gray400 }}>
                          Aucun enseignant
                        </p>
                      ) : (
                        <div className="space-y-3">
                          {enseignants.slice(0, 3).map((ens) => (
                            <div
                              key={ens.id_enseignant}
                              className="flex items-center gap-3 p-3 rounded-xl hover:bg-blue-50 transition-all cursor-pointer group"
                              style={{ border: `1px solid ${MEDICAL_COLORS.gray200}` }}
                            >
                              <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center text-white font-bold flex-shrink-0">
                                {ens.prenom.charAt(0)}{ens.nom.charAt(0)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold text-sm truncate group-hover:text-blue-600 transition-colors" style={{ color: MEDICAL_COLORS.gray900 }}>
                                  {ens.prenom} {ens.nom}
                                </p>
                                <p className="text-xs truncate" style={{ color: MEDICAL_COLORS.gray600 }}>
                                  {ens.specialite || 'Aucune spécialité'}
                                </p>
                              </div>
                              <span className="text-xs px-2 py-1 bg-blue-100 text-blue-600 rounded-full font-medium">
                                {ens.cours?.length || 0} cours
                              </span>
                            </div>
                          ))}
                        </div>
                      )}

                      <button
                        onClick={() => setActiveTab('enseignants')}
                        className="w-full mt-4 py-2.5 rounded-lg font-medium text-sm hover:opacity-90 transition-all flex items-center justify-center gap-2"
                        style={{ backgroundColor: MEDICAL_COLORS.bgBlue, color: MEDICAL_COLORS.primary }}
                      >
                        Voir tous les enseignants
                        <span>→</span>
                      </button>
                    </div>
                  </div>

                  {/* 👨‍🎓 ÉTUDIANTS - CARD AMÉLIORÉE */}
                  <div className="bg-white rounded-2xl shadow-lg overflow-hidden border hover:shadow-2xl transition-all duration-300" style={{ borderColor: MEDICAL_COLORS.gray200 }}>
                    <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                            <span className="text-3xl">👨‍🎓</span>
                          </div>
                          <div>
                            <h3 className="text-white font-bold text-lg">Étudiants</h3>
                            <p className="text-green-100 text-sm">Apprenants inscrits</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-4xl font-bold text-white">{stats.totalEtudiants}</p>
                          <p className="text-green-100 text-xs">Total</p>
                        </div>
                      </div>

                      {/* BARRE DE PROGRESSION */}
                      <div className="w-full bg-white/20 rounded-full h-2 mb-2">
                        <div
                          className="bg-white rounded-full h-2 transition-all duration-500"
                          style={{ width: `${Math.min((stats.totalEtudiants / 50) * 100, 100)}%` }}
                        />
                      </div>
                      <p className="text-green-100 text-xs">Capacité: 50 étudiants</p>
                    </div>

                    <div className="p-6">
                      <h4 className="font-semibold mb-4 flex items-center gap-2" style={{ color: MEDICAL_COLORS.gray800 }}>
                        <span className="text-lg">🎓</span>
                        Top performers
                      </h4>

                      {etudiants.length === 0 ? (
                        <p className="text-center py-6" style={{ color: MEDICAL_COLORS.gray400 }}>
                          Aucun étudiant
                        </p>
                      ) : (
                        <div className="space-y-3">
                          {etudiants.slice(0, 3).map((etu, index) => (
                            <div
                              key={etu.id_etudiant}
                              className="flex items-center gap-3 p-3 rounded-xl hover:bg-green-50 transition-all cursor-pointer group"
                              style={{ border: `1px solid ${MEDICAL_COLORS.gray200}` }}
                            >
                              <div className="relative">
                                <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-emerald-600 rounded-lg flex items-center justify-center text-white font-bold flex-shrink-0">
                                  {etu.prenom.charAt(0)}{etu.nom.charAt(0)}
                                </div>
                                {index === 0 && (
                                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-400 rounded-full flex items-center justify-center text-xs">
                                    🏆
                                  </div>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold text-sm truncate group-hover:text-green-600 transition-colors" style={{ color: MEDICAL_COLORS.gray900 }}>
                                  {etu.prenom} {etu.nom}
                                </p>
                                <p className="text-xs truncate" style={{ color: MEDICAL_COLORS.gray600 }}>
                                  {etu.matricule} • {etu.niveau}
                                </p>
                              </div>
                              <span className="text-xs px-2 py-1 bg-green-100 text-green-600 rounded-full font-medium">
                                {etu.filiere}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}

                      <button
                        onClick={() => setActiveTab('etudiants')}
                        className="w-full mt-4 py-2.5 rounded-lg font-medium text-sm hover:opacity-90 transition-all flex items-center justify-center gap-2"
                        style={{ backgroundColor: MEDICAL_COLORS.bgGreen, color: MEDICAL_COLORS.secondary }}
                      >
                        Voir tous les étudiants
                        <span>→</span>
                      </button>
                    </div>
                  </div>

                  {/* 📚 COURS - CARD AMÉLIORÉE */}
                  <div className="bg-white rounded-2xl shadow-lg overflow-hidden border hover:shadow-2xl transition-all duration-300" style={{ borderColor: MEDICAL_COLORS.gray200 }}>
                    <div className="bg-gradient-to-r from-purple-500 to-violet-600 p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                            <span className="text-3xl">📚</span>
                          </div>
                          <div>
                            <h3 className="text-white font-bold text-lg">Cours</h3>
                            <p className="text-purple-100 text-sm">Programmes actifs</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-4xl font-bold text-white">{stats.totalCours}</p>
                          <p className="text-purple-100 text-xs">Total</p>
                        </div>
                      </div>

                      {/* BARRE DE PROGRESSION */}
                      <div className="w-full bg-white/20 rounded-full h-2 mb-2">
                        <div
                          className="bg-white rounded-full h-2 transition-all duration-500"
                          style={{ width: `${Math.min((stats.totalCours / 20) * 100, 100)}%` }}
                        />
                      </div>
                      <p className="text-purple-100 text-xs">Objectif: 20 cours</p>
                    </div>

                    <div className="p-6">
                      <h4 className="font-semibold mb-4 flex items-center gap-2" style={{ color: MEDICAL_COLORS.gray800 }}>
                        <span className="text-lg">📖</span>
                        Cours populaires
                      </h4>

                      {cours.length === 0 ? (
                        <p className="text-center py-6" style={{ color: MEDICAL_COLORS.gray400 }}>
                          Aucun cours
                        </p>
                      ) : (
                        <div className="space-y-3">
                          {cours.slice(0, 3).map((c) => (
                            <div
                              key={c.id_cours}
                              className="flex items-start gap-3 p-3 rounded-xl hover:bg-purple-50 transition-all cursor-pointer group"
                              style={{ border: `1px solid ${MEDICAL_COLORS.gray200}` }}
                            >
                              <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-violet-600 rounded-lg flex items-center justify-center flex-shrink-0">
                                <span className="text-white text-sm font-bold">{c.code?.substring(0, 3) || '📚'}</span>
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold text-sm truncate group-hover:text-purple-600 transition-colors" style={{ color: MEDICAL_COLORS.gray900 }}>
                                  {c.titre}
                                </p>
                                <p className="text-xs" style={{ color: MEDICAL_COLORS.gray600 }}>
                                  Code: {c.code}
                                </p>
                                {c.enseignant && (
                                  <p className="text-xs mt-1 flex items-center gap-1" style={{ color: MEDICAL_COLORS.gray500 }}>
                                    <span>👨‍🏫</span>
                                    {c.enseignant.prenom} {c.enseignant.nom}
                                  </p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      <button
                        onClick={() => setActiveTab('cours')}
                        className="w-full mt-4 py-2.5 rounded-lg font-medium text-sm hover:opacity-90 transition-all flex items-center justify-center gap-2"
                        style={{ backgroundColor: MEDICAL_COLORS.bgPurple, color: MEDICAL_COLORS.purple }}
                      >
                        Voir tous les cours
                        <span>→</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* 📊 STATISTIQUES DÉTAILLÉES */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                  {/* PERFORMANCE ACADÉMIQUE */}
                  <div className="bg-white rounded-2xl shadow-lg p-6 border" style={{ borderColor: MEDICAL_COLORS.gray200 }}>
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-red-500 rounded-xl flex items-center justify-center">
                          <span className="text-2xl">📊</span>
                        </div>
                        <div>
                          <h3 className="font-bold text-lg" style={{ color: MEDICAL_COLORS.gray900 }}>
                            Performance Académique
                          </h3>
                          <p className="text-sm" style={{ color: MEDICAL_COLORS.gray600 }}>
                            Vue d'ensemble des résultats
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 rounded-xl" style={{ backgroundColor: MEDICAL_COLORS.gray50 }}>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-600 rounded-lg flex items-center justify-center">
                            <span className="text-white text-xl">✓</span>
                          </div>
                          <div>
                            <p className="text-sm font-medium" style={{ color: MEDICAL_COLORS.gray700 }}>
                              Notes ≥ 10/20
                            </p>
                            <p className="text-xs" style={{ color: MEDICAL_COLORS.gray500 }}>
                              Étudiants validés
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold" style={{ color: MEDICAL_COLORS.secondary }}>
                            {notes.filter(n => n.valeur >= 10).length}
                          </p>
                          <p className="text-xs" style={{ color: MEDICAL_COLORS.gray500 }}>
                            / {notes.length} notes
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-4 rounded-xl" style={{ backgroundColor: MEDICAL_COLORS.gray50 }}>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-red-400 to-red-600 rounded-lg flex items-center justify-center">
                            <span className="text-white text-xl">✗</span>
                          </div>
                          <div>
                            <p className="text-sm font-medium" style={{ color: MEDICAL_COLORS.gray700 }}>
                              Notes {"<"} 10/20
                            </p>
                            <p className="text-xs" style={{ color: MEDICAL_COLORS.gray500 }}>
                              En rattrapage
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold" style={{ color: MEDICAL_COLORS.accent }}>
                            {notes.filter(n => n.valeur < 10).length}
                          </p>
                          <p className="text-xs" style={{ color: MEDICAL_COLORS.gray500 }}>
                            / {notes.length} notes
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-4 rounded-xl" style={{ backgroundColor: MEDICAL_COLORS.bgBlue }}>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center">
                            <span className="text-white text-xl">📈</span>
                          </div>
                          <div>
                            <p className="text-sm font-medium" style={{ color: MEDICAL_COLORS.gray700 }}>
                              Moyenne Générale
                            </p>
                            <p className="text-xs" style={{ color: MEDICAL_COLORS.gray500 }}>
                              Tous les étudiants
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-3xl font-bold" style={{ color: MEDICAL_COLORS.primary }}>
                            {stats.moyenneGenerale}/20
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* RÉPARTITION PAR FILIÈRE */}
                  <div className="bg-white rounded-2xl shadow-lg p-6 border" style={{ borderColor: MEDICAL_COLORS.gray200 }}>
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-xl flex items-center justify-center">
                          <span className="text-2xl">🎯</span>
                        </div>
                        <div>
                          <h3 className="font-bold text-lg" style={{ color: MEDICAL_COLORS.gray900 }}>
                            Répartition par Filière
                          </h3>
                          <p className="text-sm" style={{ color: MEDICAL_COLORS.gray600 }}>
                            Distribution des étudiants
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {etudiantsGrouped.slice(0, 5).map((filiereGroup) => {
                        const filiereConfig = FILIERES_CONFIG[filiereGroup.filiere] || FILIERES_CONFIG.default;
                        const percentage = Math.round((filiereGroup.total / stats.totalEtudiants) * 100);

                        return (
                          <div key={filiereGroup.filiere} className="space-y-2">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="text-lg">{filiereConfig.icon}</span>
                                <span className="text-sm font-medium" style={{ color: MEDICAL_COLORS.gray700 }}>
                                  {filiereGroup.filiere}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-bold" style={{ color: filiereConfig.color }}>
                                  {filiereGroup.total}
                                </span>
                                <span className="text-xs" style={{ color: MEDICAL_COLORS.gray500 }}>
                                  ({percentage}%)
                                </span>
                              </div>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="h-2 rounded-full transition-all duration-500"
                                style={{
                                  width: `${percentage}%`,
                                  backgroundColor: filiereConfig.color
                                }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ENSEIGNANTS - CODE INCHANGÉ (TON CODE ACTUEL) */}
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

                {enseignantsGrouped.length === 0 ? (
                  <Card>
                    <p className="text-center py-8" style={{ color: MEDICAL_COLORS.gray600 }}>Aucun enseignant</p>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {enseignantsGrouped.map((specialiteGroup) => {
                      const isExpandedSpecialite = expandedSpecialites[specialiteGroup.specialite];

                      // 🎨 Couleur basée sur la spécialité
                      const specialiteColors = {
                        'Cardiologie': { color: MEDICAL_COLORS.accent, bg: '#FFE6EC' },
                        'Pneumologie': { color: MEDICAL_COLORS.teal, bg: MEDICAL_COLORS.bgTeal },
                        'Neurologie': { color: MEDICAL_COLORS.purple, bg: MEDICAL_COLORS.bgPurple },
                        'Gynécologie': { color: MEDICAL_COLORS.pink, bg: MEDICAL_COLORS.bgPink },
                        'Pédiatrie': { color: MEDICAL_COLORS.orange, bg: MEDICAL_COLORS.bgOrange },
                        'Médecin': { color: MEDICAL_COLORS.primary, bg: MEDICAL_COLORS.bgBlue },
                        'default': { color: MEDICAL_COLORS.gray600, bg: MEDICAL_COLORS.gray100 }
                      };

                      const specialiteConfig = specialiteColors[specialiteGroup.specialite] || specialiteColors.default;

                      return (
                        <div key={specialiteGroup.specialite} className="bg-white rounded-xl shadow-sm overflow-hidden">
                          {/* HEADER SPÉCIALITÉ */}
                          <button
                            onClick={() => toggleSpecialite(specialiteGroup.specialite)}
                            className="w-full px-6 py-4 flex items-center justify-between hover:opacity-90 transition-all"
                            style={{ backgroundColor: specialiteConfig.bg }}
                          >
                            <div className="flex items-center gap-3">
                              <span className="text-3xl">👨‍🏫</span>
                              <div className="text-left">
                                <h3 className="text-xl font-bold" style={{ color: specialiteConfig.color }}>
                                  {specialiteGroup.specialite}
                                </h3>
                                <p className="text-sm" style={{ color: MEDICAL_COLORS.gray600 }}>
                                  {specialiteGroup.total} enseignant{specialiteGroup.total > 1 ? 's' : ''}
                                </p>
                              </div>
                            </div>
                            <span className="text-2xl" style={{ color: specialiteConfig.color }}>
                              {isExpandedSpecialite ? '▼' : '▶'}
                            </span>
                          </button>

                          {/* CARDS ENSEIGNANTS */}
                          {isExpandedSpecialite && (
                            <div className="p-6">
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {specialiteGroup.enseignants.map((ens) => (
                                  <div
                                    key={ens.id_enseignant}
                                    className="group border rounded-xl p-4 hover:shadow-xl transition-all duration-300 cursor-pointer relative overflow-hidden"
                                    style={{ borderColor: MEDICAL_COLORS.gray200 }}
                                  >
                                    {/* CARD PRINCIPALE */}
                                    <div className="relative z-10">
                                      <div className="flex items-start justify-between mb-3">
                                        <span className="text-4xl">👨‍🏫</span>
                                        <span
                                          className="text-xs font-bold px-2 py-1 rounded-full"
                                          style={{ backgroundColor: specialiteConfig.bg, color: specialiteConfig.color }}
                                        >
                                          {ens.matricule}
                                        </span>
                                      </div>

                                      <h4 className="font-bold text-lg mb-1" style={{ color: MEDICAL_COLORS.gray900 }}>
                                        {ens.prenom} {ens.nom}
                                      </h4>

                                      <p className="text-sm font-semibold mb-3" style={{ color: specialiteConfig.color }}>
                                        {ens.specialite || 'Non spécifiée'}
                                      </p>

                                      {/* INFOS VISIBLES */}
                                      <div className="space-y-2 mb-4">
                                        <div className="flex items-center gap-2">
                                          <span className="text-sm">📧</span>
                                          <p className="text-xs truncate" style={{ color: MEDICAL_COLORS.gray600 }}>
                                            {ens.email}
                                          </p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                          <span className="text-sm">📚</span>
                                          <p className="text-xs" style={{ color: MEDICAL_COLORS.gray600 }}>
                                            {ens.cours_count || 0} cours actif{(ens.cours_count || 0) > 1 ? 's' : ''}
                                          </p>
                                        </div>
                                      </div>

                                      {/* INFOS HOVER (masquées par défaut) */}
                                      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 space-y-2 mb-4">
                                        {ens.date_naissance && (
                                          <div className="flex items-center gap-2">
                                            <span className="text-sm">📅</span>
                                            <p className="text-xs" style={{ color: MEDICAL_COLORS.gray600 }}>
                                              Né le {new Date(ens.date_naissance).toLocaleDateString('fr-FR')}
                                            </p>
                                          </div>
                                        )}
                                        <div className="flex items-center gap-2">
                                          <span className="text-sm">👤</span>
                                          <p className="text-xs" style={{ color: MEDICAL_COLORS.gray600 }}>
                                            Statut: {ens.statut || 'Actif'}
                                          </p>
                                        </div>
                                      </div>

                                      {/* BOUTONS D'ACTION */}
                                      <div className="flex gap-2">
                                        <button
                                          onClick={() => handleOpenModalEnseignant(ens)}
                                          className="flex-1 py-2 px-3 rounded-lg text-xs font-semibold hover:opacity-80 transition-all"
                                          style={{ backgroundColor: MEDICAL_COLORS.bgBlue, color: MEDICAL_COLORS.primary }}
                                        >
                                          ✏️ Modifier
                                        </button>
                                        <button
                                          onClick={() => handleDeleteEnseignant(ens.id_enseignant)}
                                          className="py-2 px-3 rounded-lg text-xs font-semibold hover:opacity-80 transition-all"
                                          style={{ backgroundColor: '#FFE6EC', color: MEDICAL_COLORS.accent }}
                                        >
                                          🗑️ Supprimer
                                        </button>
                                      </div>
                                    </div>

                                    {/* EFFET HOVER BACKGROUND */}
                                    <div
                                      className="absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-300"
                                      style={{ backgroundColor: specialiteConfig.color }}
                                    />
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* ÉTUDIANTS HIÉRARCHIQUE */}
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

                          {isExpandedFiliere && (
                            <div className="px-6 pb-4 space-y-3">
                              {filiereGroup.niveaux.map((niveauGroup) => {
                                const niveauConfig = NIVEAUX_CONFIG[niveauGroup.niveau] || NIVEAUX_CONFIG['L1'];
                                const isExpandedNiveau = expandedNiveaux[`${filiereGroup.filiere}-${niveauGroup.niveau}`];

                                return (
                                  <div key={niveauGroup.niveau} className="border rounded-lg overflow-hidden" style={{ borderColor: MEDICAL_COLORS.gray200 }}>
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
            )}

            {/* 🆕 COURS HIÉRARCHIQUE AVEC CARDS */}
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

                {/* 🔍 BARRE DE RECHERCHE COURS */}
                <div className="mb-6">
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl">🔍</span>
                    <input
                      type="text"
                      placeholder="Rechercher un cours (code, titre, enseignant)..."
                      value={searchCourseTerm}
                      onChange={(e) => setSearchCourseTerm(e.target.value)}
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

                {filteredCoursGrouped.length === 0 ? (
                  <Card>
                    <p className="text-center py-8" style={{ color: MEDICAL_COLORS.gray600 }}>
                      {searchCourseTerm ? `Aucun résultat pour "${searchCourseTerm}"` : 'Aucun cours'}
                    </p>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {filteredCoursGrouped.map((filiereGroup) => {
                      const filiereConfig = FILIERES_CONFIG[filiereGroup.filiere] || FILIERES_CONFIG.default;
                      const isExpandedFiliereC = expandedFilieresC[filiereGroup.filiere];

                      return (
                        <div key={filiereGroup.filiere} className="bg-white rounded-xl shadow-sm overflow-hidden">
                          <button
                            onClick={() => toggleFiliereC(filiereGroup.filiere)}
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
                                  {filiereGroup.total} cours
                                </p>
                              </div>
                            </div>
                            <span className="text-2xl" style={{ color: filiereConfig.color }}>
                              {isExpandedFiliereC ? '▼' : '▶'}
                            </span>
                          </button>

                          {isExpandedFiliereC && (
                            <div className="px-6 pb-4 space-y-3">
                              {filiereGroup.niveaux.map((niveauGroup) => {
                                const niveauConfig = NIVEAUX_CONFIG[niveauGroup.niveau] || NIVEAUX_CONFIG['L1'];
                                const isExpandedNiveauC = expandedNiveauxC[`${filiereGroup.filiere}-${niveauGroup.niveau}`];

                                return (
                                  <div key={niveauGroup.niveau} className="border rounded-lg overflow-hidden" style={{ borderColor: MEDICAL_COLORS.gray200 }}>
                                    <button
                                      onClick={() => toggleNiveauC(filiereGroup.filiere, niveauGroup.niveau)}
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
                                            {niveauGroup.count} cours
                                          </p>
                                        </div>
                                      </div>
                                      <span className="text-lg" style={{ color: niveauConfig.color }}>
                                        {isExpandedNiveauC ? '▼' : '▶'}
                                      </span>
                                    </button>

                                    {/* 🆕 GRILLE DE CARDS */}
                                    {isExpandedNiveauC && (
                                      <div className="p-4 bg-white">
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                          {niveauGroup.cours.map((c) => (
                                            <div
                                              key={c.id_cours}
                                              className="border rounded-xl p-4 hover:shadow-lg transition-all"
                                              style={{ borderColor: MEDICAL_COLORS.gray200 }}
                                            >
                                              <div className="flex items-start justify-between mb-3">
                                                <span className="text-3xl">📚</span>
                                                <span
                                                  className="text-xs font-bold px-2 py-1 rounded-full"
                                                  style={{ backgroundColor: niveauConfig.bg, color: niveauConfig.color }}
                                                >
                                                  {c.code}
                                                </span>
                                              </div>

                                              <h4 className="font-bold text-sm mb-2" style={{ color: MEDICAL_COLORS.gray900 }}>
                                                {c.titre}
                                              </h4>

                                              {c.description && (
                                                <p className="text-xs mb-3 line-clamp-2" style={{ color: MEDICAL_COLORS.gray600 }}>
                                                  {c.description}
                                                </p>
                                              )}

                                              {c.enseignant && (
                                                <div className="flex items-center gap-2 mb-3 p-2 rounded-lg" style={{ backgroundColor: MEDICAL_COLORS.gray50 }}>
                                                  <span className="text-lg">👨‍🏫</span>
                                                  <p className="text-xs font-medium" style={{ color: MEDICAL_COLORS.gray700 }}>
                                                    {c.enseignant.prenom} {c.enseignant.nom}
                                                  </p>
                                                </div>
                                              )}

                                              <div className="flex gap-2">
                                                <button
                                                  onClick={() => handleOpenModalCours(c)}
                                                  className="flex-1 py-2 px-3 rounded-lg text-xs font-semibold hover:opacity-80 transition-all"
                                                  style={{ backgroundColor: MEDICAL_COLORS.bgBlue, color: MEDICAL_COLORS.primary }}
                                                >
                                                  ✏️ Modifier
                                                </button>
                                                <button
                                                  onClick={() => handleDeleteCours(c.id_cours)}
                                                  className="py-2 px-3 rounded-lg text-xs font-semibold hover:opacity-80 transition-all"
                                                  style={{ backgroundColor: '#FFE6EC', color: MEDICAL_COLORS.accent }}
                                                >
                                                  🗑️
                                                </button>
                                              </div>
                                            </div>

                                          ))}
                                        </div>
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
            )}

            {/* 🆕 NOTES HIÉRARCHIQUES - NOUVEAU CODE */}
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

                {notesGrouped.length === 0 ? (
                  <Card>
                    <p className="text-center py-8" style={{ color: MEDICAL_COLORS.gray600 }}>Aucune note</p>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {notesGrouped.map((filiereGroup) => {
                      const filiereConfig = FILIERES_CONFIG[filiereGroup.filiere] || FILIERES_CONFIG.default;
                      const isExpandedFiliereN = expandedFilieresN[filiereGroup.filiere];

                      return (
                        <div key={filiereGroup.filiere} className="bg-white rounded-xl shadow-sm overflow-hidden">
                          {/* FILIÈRE */}
                          <button
                            onClick={() => toggleFiliereN(filiereGroup.filiere)}
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
                                  {filiereGroup.total} note{filiereGroup.total > 1 ? 's' : ''}
                                </p>
                              </div>
                            </div>
                            <span className="text-2xl" style={{ color: filiereConfig.color }}>
                              {isExpandedFiliereN ? '▼' : '▶'}
                            </span>
                          </button>

                          {/* NIVEAUX */}
                          {isExpandedFiliereN && (
                            <div className="px-6 pb-4 space-y-3">
                              {filiereGroup.niveaux.map((niveauGroup) => {
                                const niveauConfig = NIVEAUX_CONFIG[niveauGroup.niveau] || NIVEAUX_CONFIG['L1'];
                                const isExpandedNiveauN = expandedNiveauxN[`${filiereGroup.filiere}-${niveauGroup.niveau}`];

                                return (
                                  <div key={niveauGroup.niveau} className="border rounded-lg overflow-hidden" style={{ borderColor: MEDICAL_COLORS.gray200 }}>
                                    {/* NIVEAU */}
                                    <button
                                      onClick={() => toggleNiveauN(filiereGroup.filiere, niveauGroup.niveau)}
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
                                            {niveauGroup.count} note{niveauGroup.count > 1 ? 's' : ''}
                                          </p>
                                        </div>
                                      </div>
                                      <span className="text-lg" style={{ color: niveauConfig.color }}>
                                        {isExpandedNiveauN ? '▼' : '▶'}
                                      </span>
                                    </button>

                                    {/* SEMESTRES */}
                                    {isExpandedNiveauN && (
                                      <div className="p-4 space-y-3" style={{ backgroundColor: MEDICAL_COLORS.gray50 }}>
                                        {niveauGroup.semestres.map((semestreGroup) => {
                                          const semestreConfig = SEMESTRES_CONFIG[semestreGroup.semestre] || SEMESTRES_CONFIG['S1'];
                                          const isExpandedSemestreN = expandedSemestresN[`${filiereGroup.filiere}-${niveauGroup.niveau}-${semestreGroup.semestre}`];

                                          return (
                                            <div key={semestreGroup.semestre} className="border rounded-lg overflow-hidden bg-white" style={{ borderColor: MEDICAL_COLORS.gray200 }}>
                                              {/* SEMESTRE */}
                                              <button
                                                onClick={() => toggleSemestreN(filiereGroup.filiere, niveauGroup.niveau, semestreGroup.semestre)}
                                                className="w-full px-4 py-2 flex items-center justify-between hover:opacity-90"
                                                style={{ backgroundColor: semestreConfig.bg }}
                                              >
                                                <div className="flex items-center gap-2">
                                                  <span className="text-xl">{semestreConfig.icon}</span>
                                                  <div className="text-left">
                                                    <p className="font-medium text-sm" style={{ color: semestreConfig.color }}>
                                                      {semestreConfig.label}
                                                    </p>
                                                    <p className="text-xs" style={{ color: MEDICAL_COLORS.gray600 }}>
                                                      {semestreGroup.count} note{semestreGroup.count > 1 ? 's' : ''}
                                                    </p>
                                                  </div>
                                                </div>
                                                <span className="text-sm" style={{ color: semestreConfig.color }}>
                                                  {isExpandedSemestreN ? '▼' : '▶'}
                                                </span>
                                              </button>

                                              {/* SESSIONS (NORMALE + RATTRAPAGE) */}
                                              {isExpandedSemestreN && (
                                                <div className="p-3 space-y-3">
                                                  {semestreGroup.sessions.map((sessionGroup) => {
                                                    const isNormale = sessionGroup.session === 'normale';

                                                    return (
                                                      <div key={sessionGroup.session}>
                                                        {/* HEADER SESSION */}
                                                        <div
                                                          className="px-3 py-2 rounded-lg flex items-center justify-between mb-2"
                                                          style={{
                                                            backgroundColor: isNormale ? MEDICAL_COLORS.bgGreen : '#FEF3C7',
                                                            borderLeft: `4px solid ${isNormale ? MEDICAL_COLORS.secondary : MEDICAL_COLORS.orange}`
                                                          }}
                                                        >
                                                          <div className="flex items-center gap-2">
                                                            <span className="text-lg">{isNormale ? '✅' : '🔄'}</span>
                                                            <span className="font-semibold text-sm" style={{ color: isNormale ? MEDICAL_COLORS.secondary : MEDICAL_COLORS.orange }}>
                                                              {isNormale ? 'Session Normale' : 'Session Rattrapage'}
                                                            </span>
                                                          </div>
                                                          <span className="text-xs font-bold px-2 py-1 rounded-full" style={{
                                                            backgroundColor: 'white',
                                                            color: isNormale ? MEDICAL_COLORS.secondary : MEDICAL_COLORS.orange
                                                          }}>
                                                            {sessionGroup.count}
                                                          </span>
                                                        </div>

                                                        {/* LISTE DES NOTES */}
                                                        <div className="space-y-2">
                                                          {sessionGroup.notes.map((note) => (
                                                            <div
                                                              key={note.id_note}
                                                              className="p-3 rounded-lg border hover:shadow-md transition-all"
                                                              style={{ borderColor: MEDICAL_COLORS.gray200, backgroundColor: 'white' }}
                                                            >
                                                              <div className="flex items-start justify-between">
                                                                {/* INFOS ÉTUDIANT + COURS */}
                                                                <div className="flex-1">
                                                                  <div className="flex items-center gap-2 mb-1">
                                                                    <span className="text-lg">👨‍🎓</span>
                                                                    <p className="font-semibold text-sm" style={{ color: MEDICAL_COLORS.gray900 }}>
                                                                      {note.etudiant?.prenom} {note.etudiant?.nom}
                                                                    </p>
                                                                  </div>

                                                                  <div className="flex items-center gap-2 mb-2">
                                                                    <span className="text-sm">📚</span>
                                                                    <p className="text-xs" style={{ color: MEDICAL_COLORS.gray600 }}>
                                                                      {note.cours?.code} - {note.cours?.titre}
                                                                    </p>
                                                                  </div>

                                                                  <div className="flex items-center gap-3">
                                                                    {/* NOTE */}
                                                                    <span
                                                                      className="px-3 py-1 rounded-full text-sm font-bold"
                                                                      style={{
                                                                        backgroundColor: note.valeur >= 10 ? MEDICAL_COLORS.bgGreen : '#FEE2E2',
                                                                        color: note.valeur >= 10 ? MEDICAL_COLORS.secondary : MEDICAL_COLORS.accent,
                                                                      }}
                                                                    >
                                                                      {note.valeur}/20
                                                                    </span>

                                                                    {/* BADGE RATTRAPÉ */}
                                                                    {note.est_rattrape && (
                                                                      <span
                                                                        className="px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1"
                                                                        style={{ backgroundColor: '#DBEAFE', color: MEDICAL_COLORS.primary }}
                                                                      >
                                                                        🎓 Rattrapé
                                                                      </span>
                                                                    )}

                                                                    {/* DATE */}
                                                                    <span className="text-xs" style={{ color: MEDICAL_COLORS.gray500 }}>
                                                                      📅 {new Date(note.date_evaluation).toLocaleDateString('fr-FR')}
                                                                    </span>
                                                                  </div>
                                                                </div>

                                                                {/* ACTIONS */}
                                                                <div className="flex gap-2 ml-3">
                                                                  <button
                                                                    onClick={() => handleOpenModalNote(note)}
                                                                    className="px-3 py-1 rounded-lg text-xs font-semibold hover:opacity-80 transition-all"
                                                                    style={{ backgroundColor: MEDICAL_COLORS.bgBlue, color: MEDICAL_COLORS.primary }}
                                                                  >
                                                                    ✏️
                                                                  </button>
                                                                  <button
                                                                    onClick={() => handleDeleteNote(note.id_note)}
                                                                    className="px-3 py-1 rounded-lg text-xs font-semibold hover:opacity-80 transition-all"
                                                                    style={{ backgroundColor: '#FFE6EC', color: MEDICAL_COLORS.accent }}
                                                                  >
                                                                    🗑️
                                                                  </button>
                                                                </div>
                                                              </div>
                                                            </div>
                                                          ))}
                                                        </div>
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
          <Input label="Nom" type="text" name="nom" value={formEnseignant.nom} onChange={handleChangeEnseignant} error={errorsEnseignant.nom?.[0]} required placeholder="Dupont" />
          <Input label="Prénom" type="text" name="prenom" value={formEnseignant.prenom} onChange={handleChangeEnseignant} error={errorsEnseignant.prenom?.[0]} required placeholder="Jean" />
          <Input label="Email" type="email" name="email" value={formEnseignant.email} onChange={handleChangeEnseignant} error={errorsEnseignant.email?.[0]} required placeholder="jean.dupont@medcampus.cf" />
          <Input label={editingEnseignant ? 'Nouveau mot de passe (laisser vide pour ne pas changer)' : 'Mot de passe'} type="password" name="mot_de_passe" value={formEnseignant.mot_de_passe} onChange={handleChangeEnseignant} error={errorsEnseignant.mot_de_passe?.[0]} required={!editingEnseignant} placeholder="••••••••" />
          <Input label="Date de naissance" type="date" name="date_naissance" value={formEnseignant.date_naissance} onChange={handleChangeEnseignant} error={errorsEnseignant.date_naissance?.[0]} required />
          <Input label="Spécialité" type="text" name="specialite" value={formEnseignant.specialite} onChange={handleChangeEnseignant} error={errorsEnseignant.specialite?.[0]} placeholder="Cardiologie" />

          <div className="flex gap-4 mt-6">
            <Button type="submit" variant="primary" className="flex-1" disabled={loadingEnseignant}>
              {loadingEnseignant ? 'Envoi...' : editingEnseignant ? 'Modifier' : 'Créer'}
            </Button>
            <Button type="button" variant="secondary" onClick={() => setShowModalEnseignant(false)} className="flex-1" disabled={loadingEnseignant}>
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
          <Input label="Nom" type="text" name="nom" value={formEtudiant.nom} onChange={handleChangeEtudiant} error={errorsEtudiant.nom?.[0]} required placeholder="Kamara" />
          <Input label="Prénom" type="text" name="prenom" value={formEtudiant.prenom} onChange={handleChangeEtudiant} error={errorsEtudiant.prenom?.[0]} required placeholder="Sophie" />
          <Input label="Email" type="email" name="email" value={formEtudiant.email} onChange={handleChangeEtudiant} error={errorsEtudiant.email?.[0]} required placeholder="sophie.kamara@medcampus.cf" />
          <Input label={editingEtudiant ? 'Nouveau mot de passe (laisser vide pour ne pas changer)' : 'Mot de passe'} type="password" name="mot_de_passe" value={formEtudiant.mot_de_passe} onChange={handleChangeEtudiant} error={errorsEtudiant.mot_de_passe?.[0]} required={!editingEtudiant} placeholder="••••••••" />
          <Input label="Date de naissance" type="date" name="date_naissance" value={formEtudiant.date_naissance} onChange={handleChangeEtudiant} error={errorsEtudiant.date_naissance?.[0]} required />

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
            <Button type="button" variant="secondary" onClick={() => setShowModalEtudiant(false)} className="flex-1" disabled={loadingEtudiant}>
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
          <Input label="Code" type="text" name="code" value={formCours.code} onChange={handleChangeCours} error={errorsCours.code?.[0]} required placeholder="CARD101" />
          <Input label="Titre" type="text" name="titre" value={formCours.titre} onChange={handleChangeCours} error={errorsCours.titre?.[0]} required placeholder="Cardiologie Générale" />

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
              Filière
            </label>
            <select
              name="filiere"
              value={formCours.filiere}
              onChange={handleChangeCours}
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
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2" style={{ color: MEDICAL_COLORS.gray700 }}>
              Niveau
            </label>
            <select
              name="niveau"
              value={formCours.niveau}
              onChange={handleChangeCours}
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
            <Button type="button" variant="secondary" onClick={() => setShowModalCours(false)} className="flex-1" disabled={loadingCours}>
              Annuler
            </Button>
          </div>
        </form>
      </Modal>

      {/* 🆕 MODAL NOTE (AVEC SEMESTRE) */}
      {/* 🆕 MODAL NOTE AVEC FILTRES EN CASCADE */}
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
          {/* 🆕 ÉTAPE 1 : FILIÈRE */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2" style={{ color: MEDICAL_COLORS.gray700 }}>
              Filière <span style={{ color: MEDICAL_COLORS.accent }}>*</span>
            </label>
            <select
              name="filiere_note"
              value={formNote.filiere_note || ''}
              onChange={(e) => {
                const filiere = e.target.value;
                setFormNote(prev => ({
                  ...prev,
                  filiere_note: filiere,
                  niveau_note: '', // Reset niveau
                  id_etudiant: '', // Reset étudiant
                  id_cours: '', // Reset cours
                  semestre: '' // Reset semestre
                }));
              }}
              required
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
          </div>

          {/* 🆕 ÉTAPE 2 : NIVEAU (si filière choisie) */}
          {formNote.filiere_note && (
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2" style={{ color: MEDICAL_COLORS.gray700 }}>
                Niveau <span style={{ color: MEDICAL_COLORS.accent }}>*</span>
              </label>
              <select
                name="niveau_note"
                value={formNote.niveau_note || ''}
                onChange={(e) => {
                  const niveau = e.target.value;
                  setFormNote(prev => ({
                    ...prev,
                    niveau_note: niveau,
                    id_etudiant: '', // Reset étudiant
                    id_cours: '', // Reset cours
                    semestre: '' // Reset semestre
                  }));
                }}
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
            </div>
          )}

          {/* 🆕 ÉTAPE 3 : COURS (filtré par filière + niveau) */}
          {formNote.niveau_note && (
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
                {cours
                  .filter(c =>
                    (!c.filiere || c.filiere === formNote.filiere_note) &&
                    (!c.niveau || c.niveau === formNote.niveau_note)
                  )
                  .map((c) => (
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
          )}

          {/* 🆕 ÉTAPE 4 : ÉTUDIANT (filtré par filière + niveau) */}
          {formNote.niveau_note && (
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
                {etudiants
                  .filter(etu =>
                    etu.filiere === formNote.filiere_note &&
                    etu.niveau === formNote.niveau_note
                  )
                  .map((etu) => (
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
          )}

          {/* 🆕 ÉTAPE 5 : SEMESTRE (adapté au niveau) */}
          {formNote.niveau_note && (
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2" style={{ color: MEDICAL_COLORS.gray700 }}>
                Semestre <span style={{ color: MEDICAL_COLORS.accent }}>*</span>
              </label>
              <select
                name="semestre"
                value={formNote.semestre}
                onChange={handleChangeNote}
                required
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:outline-none"
                style={{ borderColor: MEDICAL_COLORS.gray300 }}
              >
                <option value="">-- Sélectionner un semestre --</option>
                {/* L1, L2, L3 : S1 à S6 */}
                {['L1', 'L2', 'L3'].includes(formNote.niveau_note) && (
                  <>
                    <option value="S1">📅 S1 - Semestre 1</option>
                    <option value="S2">📅 S2 - Semestre 2</option>
                    <option value="S3">📅 S3 - Semestre 3</option>
                    <option value="S4">📅 S4 - Semestre 4</option>
                    <option value="S5">📅 S5 - Semestre 5</option>
                    <option value="S6">📅 S6 - Semestre 6</option>
                  </>
                )}
                {/* M1, M2 : S1 à S4 */}
                {['M1', 'M2'].includes(formNote.niveau_note) && (
                  <>
                    <option value="S1">📅 S1 - Semestre 1</option>
                    <option value="S2">📅 S2 - Semestre 2</option>
                    <option value="S3">📅 S3 - Semestre 3</option>
                    <option value="S4">📅 S4 - Semestre 4</option>
                  </>
                )}
                {/* Doctorat : S1 et S2 */}
                {formNote.niveau_note === 'Doctorat' && (
                  <>
                    <option value="S1">📅 S1 - Semestre 1</option>
                    <option value="S2">📅 S2 - Semestre 2</option>
                  </>
                )}
              </select>
              {errorsNote.semestre && (
                <p className="text-sm mt-1" style={{ color: MEDICAL_COLORS.accent }}>
                  {errorsNote.semestre[0]}
                </p>
              )}
            </div>
          )}

          {/* NOTE */}
          {formNote.semestre && (
            <>
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
            </>
          )}

          <div className="flex gap-4 mt-6">
            <Button type="submit" variant="primary" className="flex-1" disabled={loadingNote}>
              {loadingNote ? 'Envoi...' : editingNote ? 'Modifier' : 'Créer'}
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