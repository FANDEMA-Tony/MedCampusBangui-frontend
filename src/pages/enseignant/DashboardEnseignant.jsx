import { useState, useEffect } from 'react';
import { coursService, noteService, etudiantService } from '../../services/api';
import { getUser } from '../../utils/auth';
import Navbar from '../../components/layout/Navbar';
import StatCard from '../../components/common/StatCard';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';

export default function DashboardEnseignant() {
  const user = getUser();

  // 🔹 Loading principal (dashboard)
  const [loading, setLoading] = useState(true);

  // 🔹 Loading spécifique ajout note (séparé = pro)
  const [loadingNote, setLoadingNote] = useState(false);

  const [cours, setCours] = useState([]);
  const [etudiants, setEtudiants] = useState([]);
  const [notes, setNotes] = useState([]);

  const [stats, setStats] = useState({
    totalCours: 0,
    totalNotes: 0,
    moyenneGenerale: 0,
    coursActifs: 0,
  });

  // Modal ajout note
  const [showModalNote, setShowModalNote] = useState(false);

  const [formNote, setFormNote] = useState({
    id_etudiant: '',
    id_cours: '',
    valeur: '',
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

      // 🔹 Récupérer les cours de l'enseignant connecté
      const coursResponse = await coursService.getAll('/mes-cours');
      const mesCours = coursResponse.data.data || [];
      setCours(mesCours);

      // 🔹 Récupérer les étudiants
      try {
        const etudiantsResponse = await etudiantService.getMesEtudiants();
        setEtudiants(etudiantsResponse.data.data || []);
      } catch (err) {
        console.log('Erreur récupération étudiants:', err);
        setEtudiants([]);
      }

      // 🔹 Récupération des notes (pour vraies stats) - 🆕 LOGS AMÉLIORÉS
      try {
        const notesResponse = await noteService.getMesNotes();
        console.log('📊 Réponse notes COMPLÈTE:', JSON.stringify(notesResponse.data, null, 2)); // 🆕 DEBUG AMÉLIORÉ
        
        let toutesLesNotes = [];
        
        // 🔹 Gérer différents formats possibles de l'API
        if (notesResponse.data.success) {
          // 🆕 Essayer plusieurs chemins
          if (notesResponse.data.data?.data) {
            toutesLesNotes = notesResponse.data.data.data;
            console.log('✅ Format: data.data.data'); // 🆕
          } else if (Array.isArray(notesResponse.data.data)) {
            toutesLesNotes = notesResponse.data.data;
            console.log('✅ Format: data.data (array)'); // 🆕
          } else if (notesResponse.data.data && typeof notesResponse.data.data === 'object') {
            // 🆕 Peut-être que c'est un objet avec les notes dedans
            const keys = Object.keys(notesResponse.data.data);
            console.log('📋 Clés disponibles:', keys); // 🆕
            toutesLesNotes = [];
          }
        }
        
        console.log('✅ Notes récupérées:', toutesLesNotes.length); // 🆕
        console.log('📝 Contenu notes:', toutesLesNotes); // 🆕
        setNotes(toutesLesNotes);

        // Calculer la somme des notes
        const somme = toutesLesNotes.reduce(
          (acc, note) => acc + parseFloat(note.valeur || 0),
          0
        );

        // Calculer la moyenne générale
        const moyenne =
          toutesLesNotes.length > 0
            ? (somme / toutesLesNotes.length).toFixed(2)
            : 0;

        // Mettre à jour les statistiques
        setStats({
          totalCours: mesCours.length,
          totalNotes: toutesLesNotes.length,
          moyenneGenerale: moyenne,
          coursActifs: mesCours.length,
        });
      } catch (err) {
        console.error('❌ Erreur récupération notes:', err);
        // Si erreur, mettre les stats par défaut
        setStats({
          totalCours: mesCours.length,
          totalNotes: 0,
          moyenneGenerale: 0,
          coursActifs: mesCours.length,
        });
      }
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChangeNote = (e) => {
    const { name, value } = e.target;
    setFormNote((prev) => ({ ...prev, [name]: value }));

    // Effacer l'erreur du champ modifié
    if (errorsNote[name]) {
      setErrorsNote((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmitNote = async (e) => {
    e.preventDefault();

    // 🔥 Protection anti double clic (pro)
    if (loadingNote) return;

    setMessageNote({ type: '', text: '' });
    setErrorsNote({});

    try {
      setLoadingNote(true);

      const response = await noteService.create(formNote);

      if (response.data.success) {
        // Afficher le message de succès
        setMessageNote({
          type: 'success',
          text: 'Note ajoutée avec succès !',
        });

        // Attendre 1.5s puis fermer le modal
        setTimeout(() => {
          // Réinitialiser le formulaire
          setFormNote({
            id_etudiant: '',
            id_cours: '',
            valeur: '',
            date_evaluation: new Date().toISOString().split('T')[0],
          });

          // Fermer le modal
          setShowModalNote(false);
          
          // Effacer le message
          setMessageNote({ type: '', text: '' });
          
          // Réactiver le bouton
          setLoadingNote(false);

          // Recharger les données
          fetchData();
        }, 1500);
      }
    } catch (error) {
      console.error('Erreur ajout note:', error);
      
      // Gérer les erreurs de validation
      if (error.response?.data?.errors) {
        setErrorsNote(error.response.data.errors);
      } else {
        setMessageNote({
          type: 'error',
          text:
            error.response?.data?.message ||
            "Erreur lors de l'ajout de la note",
        });
      }

      setLoadingNote(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* En-tête */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              Tableau de bord Enseignant
            </h1>
            <p className="text-gray-600 mt-2">
              Bienvenue {user?.prenom} ! Gérez vos cours et vos étudiants.
            </p>
          </div>

          <Button
            variant="primary"
            onClick={() => setShowModalNote(true)}
            className="flex items-center"
          >
            ➕ Ajouter une note
          </Button>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon="📚"
            title="Mes Cours"
            value={stats.totalCours}
            color="blue"
          />
          <StatCard
            icon="📝"
            title="Notes Attribuées"
            value={stats.totalNotes}
            color="green"
          />
          <StatCard
            icon="📊"
            title="Moyenne Générale"
            value={`${stats.moyenneGenerale}/20`}
            color="purple"
          />
          <StatCard
            icon="✅"
            title="Cours Actifs"
            value={stats.coursActifs}
            color="orange"
          />
        </div>

        {/* Liste des cours */}
        <Card title="Mes Cours">
          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="text-gray-600 mt-4">Chargement...</p>
            </div>
          ) : cours.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600 text-lg">📚 Aucun cours pour le moment</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {cours.map((c) => (
                <div
                  key={c.id_cours}
                  className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-6 border border-blue-200 hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-800">
                        {c.titre}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        Code: {c.code}
                      </p>
                    </div>
                    <span className="text-3xl">📖</span>
                  </div>
                  <p className="text-gray-700 text-sm mb-4">
                    {c.description || 'Pas de description'}
                  </p>
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>🎓 Étudiants: -</span>
                    <span>📝 Notes: -</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Modal ajout note */}
      <Modal
        isOpen={showModalNote}
        onClose={() => !loadingNote && setShowModalNote(false)}
        title="Ajouter une note"
      >
        {messageNote.text && (
          <div className={`mb-4 p-4 rounded-lg ${
            messageNote.type === 'success' 
              ? 'bg-green-100 border-l-4 border-green-500 text-green-700' 
              : 'bg-red-100 border-l-4 border-red-500 text-red-700'
          }`}>
            {messageNote.text}
          </div>
        )}

        <form onSubmit={handleSubmitNote}>

          <Select
            label="Cours"
            name="id_cours"
            value={formNote.id_cours}
            onChange={handleChangeNote}
            options={cours.map(c => ({
              value: c.id_cours,
              label: `${c.code} - ${c.titre}`
            }))}
            error={errorsNote.id_cours?.[0]}
            required
          />

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
            <Button
              type="submit"
              variant="primary"
              className="flex-1"
              disabled={loadingNote}
            >
              {loadingNote ? 'Envoi en cours...' : 'Ajouter la note'}
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