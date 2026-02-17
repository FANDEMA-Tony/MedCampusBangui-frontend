import { useState, useEffect } from 'react';
import { donneeSanitaireService } from '../../services/api';
import { getUser } from '../../utils/auth';
import Navbar from '../../components/layout/Navbar';
import DonneeCard from './DonneeCard';
import CollecteModal from './CollecteModal';
import StatistiquesPanel from './StatistiquesPanel';
import FiltreSanitaire from './FiltreSanitaire';

const COLORS = {
  primary: '#0066CC',
  success: '#00A86B',
  danger: '#DC143C',
  warning: '#FF6B35',
  background: '#F8FAFB',
};

export default function DonneesSanitaires() {
  const currentUser = getUser();
  const [activeTab, setActiveTab] = useState('donnees'); // donnees, statistiques
  const [loading, setLoading] = useState(true);
  const [donnees, setDonnees] = useState([]);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  const [filtres, setFiltres] = useState({
    pathologie: '',
    ville: '',
    commune: '',
    gravite: '',
    tranche_age: '',
    sexe: '',
    en_cours: false,
    graves: false,
  });

  const [showCollecteModal, setShowCollecteModal] = useState(false);

  useEffect(() => {
    if (activeTab === 'donnees') {
      fetchDonnees();
    }
  }, [activeTab, filtres, currentPage]);

  const fetchDonnees = async () => {
    try {
      setLoading(true);
      const params = { page: currentPage };
      
      Object.keys(filtres).forEach(key => {
        if (filtres[key]) params[key] = filtres[key];
      });

      const response = await donneeSanitaireService.getAll(params);
      const data = response.data;

      setDonnees(data.data || []);
      setTotal(data.total || 0);
    } catch (err) {
      console.error('Erreur données sanitaires:', err);
      setDonnees([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCollecteSuccess = () => {
    setShowCollecteModal(false);
    fetchDonnees();
  };

  const handleDeleteSuccess = () => {
    fetchDonnees();
  };

  const handleFiltreChange = (newFiltres) => {
    setFiltres(newFiltres);
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: COLORS.background }}>
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* EN-TÊTE */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold" style={{ color: COLORS.primary }}>
              🏥 Données Sanitaires
            </h1>
            <p className="text-gray-600 mt-1">
              Collecte et analyse des données de santé publique
            </p>
          </div>

          <button
            onClick={() => setShowCollecteModal(true)}
            className="flex items-center gap-2 px-6 py-3 rounded-xl text-white font-semibold shadow-lg hover:opacity-90 transition-all"
            style={{ backgroundColor: COLORS.success }}
          >
            ➕ Collecter une donnée
          </button>
        </div>

        {/* ONGLETS */}
        <div className="bg-white rounded-2xl shadow-sm mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              {[
                { id: 'donnees', label: `📋 Données collectées (${total})`, icon: '📋' },
                { id: 'statistiques', label: '📊 Statistiques & Analyses', icon: '📊' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-6 text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'border-b-2'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                  style={
                    activeTab === tab.id
                      ? { borderBottomColor: COLORS.primary, color: COLORS.primary }
                      : {}
                  }
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* CONTENU */}
        {activeTab === 'donnees' ? (
          <>
            {/* FILTRES */}
            <FiltreSanitaire
              filtres={filtres}
              onChange={handleFiltreChange}
              total={total}
            />

            {/* LISTE DONNÉES */}
            {loading ? (
              <div className="text-center py-16">
                <div
                  className="inline-block animate-spin rounded-full h-12 w-12 border-b-2"
                  style={{ borderColor: COLORS.primary }}
                ></div>
                <p className="text-gray-500 mt-4">Chargement...</p>
              </div>
            ) : donnees.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl shadow-sm">
                <p className="text-5xl mb-4">🏥</p>
                <p className="text-xl font-semibold text-gray-700">Aucune donnée trouvée</p>
                <p className="text-gray-500 mt-2">
                  Soyez le premier à collecter une donnée !
                </p>
                <button
                  onClick={() => setShowCollecteModal(true)}
                  className="mt-6 px-6 py-3 rounded-xl text-white font-semibold"
                  style={{ backgroundColor: COLORS.success }}
                >
                  ➕ Collecter une donnée
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {donnees.map((donnee) => (
                  <DonneeCard
                    key={donnee.id_donnee}
                    donnee={donnee}
                    currentUser={currentUser}
                    onDeleteSuccess={handleDeleteSuccess}
                  />
                ))}
              </div>
            )}
          </>
        ) : (
          <StatistiquesPanel />
        )}
      </div>

      {/* MODAL COLLECTE */}
      {showCollecteModal && (
        <CollecteModal
          isOpen={showCollecteModal}
          onClose={() => setShowCollecteModal(false)}
          onSuccess={handleCollecteSuccess}
        />
      )}
    </div>
  );
}