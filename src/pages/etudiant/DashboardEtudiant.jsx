import { useState, useEffect } from 'react';
import { etudiantService, noteService } from '../../services/api';
import { getUser } from '../../utils/auth';
import Navbar from '../../components/layout/Navbar';
import StatCard from '../../components/common/StatCard';
import Card from '../../components/common/Card';

export default function DashboardEtudiant() {
  const user = getUser();
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState([]);
  const [stats, setStats] = useState({
    totalNotes: 0,
    moyenne: 0,
    meilleureNote: 0,
    coursEnCours: 0,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Récupérer les notes de l'étudiant
      // Note: On récupère l'ID étudiant depuis l'utilisateur connecté
      const notesResponse = await noteService.getMesNotes(); // ✅ BON APPEL
      
      if (notesResponse.data.success) {
        const mesNotes = notesResponse.data.data || [];
        setNotes(mesNotes);
        
        // Calculer les statistiques
        if (mesNotes.length > 0) {
          const total = mesNotes.length;
          const somme = mesNotes.reduce((acc, note) => acc + parseFloat(note.valeur || 0), 0);
          const moyenne = (somme / total).toFixed(2);
          const meilleure = Math.max(...mesNotes.map(n => parseFloat(n.valeur || 0)));
          
          setStats({
            totalNotes: total,
            moyenne: moyenne,
            meilleureNote: meilleure,
            coursEnCours: total,
          });
        }
      }
    } catch (error) {
      console.error('Erreur:', error);
      console.error('Détails:', error.response?.data); // ✅ LOG L'ERREUR EXACTE
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* En-tête */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">
            Tableau de bord
          </h1>
          <p className="text-gray-600 mt-2">
            Bienvenue {user?.prenom} ! Voici un aperçu de votre parcours académique.
          </p>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon="📚"
            title="Total Notes"
            value={stats.totalNotes}
            color="blue"
          />
          <StatCard
            icon="📊"
            title="Moyenne Générale"
            value={`${stats.moyenne}/20`}
            color="green"
          />
          <StatCard
            icon="🏆"
            title="Meilleure Note"
            value={`${stats.meilleureNote}/20`}
            color="purple"
          />
          <StatCard
            icon="📖"
            title="Cours en cours"
            value={stats.coursEnCours}
            color="orange"
          />
        </div>

        {/* Liste des notes */}
        <Card title="Mes Notes">
          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="text-gray-600 mt-4">Chargement...</p>
            </div>
          ) : notes.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600 text-lg">📝 Aucune note disponible pour le moment</p>
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
                      Statut
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {notes.map((note) => (
                    <tr key={note.id_note} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {note.cours?.titre || 'Cours inconnu'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {note.cours?.code || '-'}
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
                        {new Date(note.date_attribution || note.created_at).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {parseFloat(note.valeur) >= 10 ? (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            ✅ Validé
                          </span>
                        ) : (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                            ❌ Non validé
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}