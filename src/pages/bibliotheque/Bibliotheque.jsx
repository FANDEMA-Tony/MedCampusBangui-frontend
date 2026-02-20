import { useState, useEffect } from 'react';
import { ressourceService } from '../../services/api';
import { getUser } from '../../utils/auth';
import Navbar from '../../components/layout/Navbar';
import RessourceCard from './RessourceCard';
import UploadModal from './UploadModal';
import RessourceDetailModal from './RessourceDetailModal';

const COLORS = {
  primary: '#0066CC',
  primaryLight: '#E6F2FF',
  success: '#00A86B',
  danger: '#DC143C',
  warning: '#FF6B35',
  background: '#F8FAFB',
};

const CATEGORIES = [
  { value: '', label: 'Toutes', icon: '📚' },
  { value: 'Anatomie', label: 'Anatomie', icon: '🦴' },
  { value: 'Pharmacologie', label: 'Pharmacologie', icon: '💊' },
  { value: 'Physiologie', label: 'Physiologie', icon: '🫀' },
  { value: 'Pathologie', label: 'Pathologie', icon: '🔬' },
  { value: 'Chirurgie', label: 'Chirurgie', icon: '🩺' },
  { value: 'Pédiatrie', label: 'Pédiatrie', icon: '👶' },
  { value: 'Gynécologie', label: 'Gynécologie', icon: '🌸' },
  { value: 'Cardiologie', label: 'Cardiologie', icon: '❤️' },
  { value: 'Neurologie', label: 'Neurologie', icon: '🧠' },
];

export default function Bibliotheque() {
  const currentUser = getUser();
  const [loading, setLoading] = useState(true);
  const [ressources, setRessources] = useState([]);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  const [recherche, setRecherche] = useState('');
  const [categorieActive, setCategorieActive] = useState('');
  const [typeActive, setTypeActive] = useState('');

  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedRessource, setSelectedRessource] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  useEffect(() => {
    fetchRessources();
  }, [categorieActive, typeActive, currentPage]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage(1);
      fetchRessources();
    }, 500);
    return () => clearTimeout(timer);
  }, [recherche]);

  const fetchRessources = async () => {
    try {
      setLoading(true);
      const params = { page: currentPage };
      if (recherche) params.recherche = recherche;
      if (categorieActive) params.categorie = categorieActive;
      if (typeActive) params.type = typeActive;

      const response = await ressourceService.getAll(params);
      const data = response.data;

      setRessources(data.data || []);
      setTotal(data.total || 0);
    } catch (err) {
      console.error('Erreur ressources:', err);
      setRessources([]);
    } finally {
      setLoading(false);
    }
  };

  // 🆕 FONCTION POUR OUVRIR LE DÉTAIL (avec appel getOne pour incrémenter les vues)
  const handleOpenDetail = async (ressource) => {
    try {
      setLoadingDetail(true);
      
      // ✅ Appeler getOne() pour incrémenter les vues
      const response = await ressourceService.getOne(ressource.id_ressource);
      const ressourceComplete = response.data.data;
      
      setSelectedRessource(ressourceComplete);
      setShowDetailModal(true);
    } catch (err) {
      console.error('Erreur chargement ressource:', err);
      alert('Erreur lors du chargement de la ressource');
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleUploadSuccess = () => {
    setShowUploadModal(false);
    fetchRessources();
  };

  const handleDeleteSuccess = () => {
    setShowDetailModal(false);
    fetchRessources();
  };

  // 🆕 FONCTION POUR RAFRAÎCHIR APRÈS LIKE
  const handleLikeSuccess = () => {
    fetchRessources(); // Rafraîchir la liste
  };

  const canUpload = currentUser?.role === 'admin' || currentUser?.role === 'enseignant';

  return (
    <div className="min-h-screen" style={{ backgroundColor: COLORS.background }}>
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* EN-TÊTE */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold" style={{ color: COLORS.primary }}>
              📚 Bibliothèque Médicale
            </h1>
            <p className="text-gray-600 mt-1">
              {total} ressource{total > 1 ? 's' : ''} disponible{total > 1 ? 's' : ''}
            </p>
          </div>

          {canUpload && (
            <button
              onClick={() => setShowUploadModal(true)}
              className="flex items-center gap-2 px-6 py-3 rounded-xl text-white font-semibold shadow-lg hover:opacity-90 transition-all"
              style={{ backgroundColor: COLORS.success }}
            >
              📤 Ajouter une ressource
            </button>
          )}
        </div>

        {/* BARRE DE RECHERCHE */}
        <div className="bg-white rounded-2xl shadow-sm p-4 mb-6">
          <div className="flex gap-4 flex-wrap">
            <div className="flex-1 min-w-64 relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
              <input
                type="text"
                placeholder="Rechercher une ressource..."
                value={recherche}
                onChange={(e) => setRecherche(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2"
                style={{ focusRingColor: COLORS.primary }}
                onFocus={(e) => e.target.style.borderColor = COLORS.primary}
                onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
              />
            </div>

            <select
              value={typeActive}
              onChange={(e) => { setTypeActive(e.target.value); setCurrentPage(1); }}
              className="px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none"
              onFocus={(e) => e.target.style.borderColor = COLORS.primary}
              onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
            >
              <option value="">Tous les types</option>
              <option value="cours">📖 Cours</option>
              <option value="livre">📚 Livres</option>
              <option value="video">🎬 Vidéos</option>
              <option value="article">📄 Articles</option>
              <option value="autre">📁 Autre</option>
            </select>
          </div>
        </div>

        {/* FILTRES CATÉGORIES */}
        <div className="flex gap-2 flex-wrap mb-6">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              onClick={() => { setCategorieActive(cat.value); setCurrentPage(1); }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all"
              style={
                categorieActive === cat.value
                  ? { backgroundColor: COLORS.primary, color: 'white' }
                  : { backgroundColor: 'white', color: '#374151', border: '1px solid #e5e7eb' }
              }
            >
              {cat.icon} {cat.label}
            </button>
          ))}
        </div>

        {/* GRILLE RESSOURCES */}
        {loading ? (
          <div className="text-center py-16">
            <div
              className="inline-block animate-spin rounded-full h-12 w-12 border-b-2"
              style={{ borderColor: COLORS.primary }}
            ></div>
            <p className="text-gray-500 mt-4">Chargement...</p>
          </div>
        ) : ressources.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl shadow-sm">
            <p className="text-5xl mb-4">📭</p>
            <p className="text-xl font-semibold text-gray-700">Aucune ressource trouvée</p>
            <p className="text-gray-500 mt-2">
              {recherche ? `Aucun résultat pour "${recherche}"` : 'Soyez le premier à ajouter une ressource !'}
            </p>
            {canUpload && (
              <button
                onClick={() => setShowUploadModal(true)}
                className="mt-6 px-6 py-3 rounded-xl text-white font-semibold"
                style={{ backgroundColor: COLORS.success }}
              >
                📤 Ajouter une ressource
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {ressources.map((ressource) => (
              <RessourceCard
                key={ressource.id_ressource}
                ressource={ressource}
                currentUser={currentUser}
                onClick={() => handleOpenDetail(ressource)}
              />
            ))}
          </div>
        )}
      </div>

      {/* MODAL UPLOAD */}
      {showUploadModal && (
        <UploadModal
          isOpen={showUploadModal}
          onClose={() => setShowUploadModal(false)}
          onSuccess={handleUploadSuccess}
        />
      )}

      {/* MODAL DÉTAIL */}
      {showDetailModal && selectedRessource && (
        <RessourceDetailModal
          isOpen={showDetailModal}
          onClose={() => setShowDetailModal(false)}
          ressource={selectedRessource}
          currentUser={currentUser}
          onDeleteSuccess={handleDeleteSuccess}
          onLikeSuccess={handleLikeSuccess}
        />
      )}

      {/* LOADING OVERLAY */}
      {loadingDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.3)' }}>
          <div className="bg-white rounded-2xl p-6 shadow-2xl">
            <div
              className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 mx-auto"
              style={{ borderColor: COLORS.primary }}
            ></div>
            <p className="text-gray-600 mt-4">Chargement...</p>
          </div>
        </div>
      )}
    </div>
  );
}