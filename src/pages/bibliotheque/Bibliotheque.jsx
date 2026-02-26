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

  const handleOpenDetail = async (ressource) => {
    try {
      setLoadingDetail(true);
      
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

  const handleLikeSuccess = () => {
    fetchRessources();
  };

  const canUpload = currentUser?.role === 'admin' || currentUser?.role === 'enseignant';

  return (
    <div className="min-h-screen" style={{ backgroundColor: COLORS.background }}>
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* 🎨 EN-TÊTE MODERNE AMÉLIORÉ */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            {/* Titre avec icône gradient */}
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div 
                  className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg"
                  style={{ 
                    background: 'linear-gradient(135deg, #0066CC 0%, #0052A3 100%)'
                  }}
                >
                  <span className="text-3xl">📚</span>
                </div>
                <div>
                  <h1 className="text-3xl font-bold" style={{ color: COLORS.primary }}>
                    Bibliothèque Médicale
                  </h1>
                  <div className="flex items-center gap-2 mt-1">
                    <span 
                      className="px-3 py-1 rounded-full text-sm font-bold"
                      style={{ backgroundColor: COLORS.primaryLight, color: COLORS.primary }}
                    >
                      {total} ressource{total > 1 ? 's' : ''}
                    </span>
                    <span className="text-sm text-gray-500">
                      disponible{total > 1 ? 's' : ''}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bouton ajouter moderne */}
            {canUpload && (
              <button
                onClick={() => setShowUploadModal(true)}
                className="flex items-center gap-2 px-6 py-3 rounded-xl text-white font-bold shadow-lg hover:shadow-xl transition-all"
                style={{ 
                  background: 'linear-gradient(135deg, #00A86B 0%, #008755 100%)'
                }}
              >
                <span className="text-lg">📤</span>
                <span>Ajouter une ressource</span>
              </button>
            )}
          </div>
        </div>

        {/* 🎨 BARRE DE RECHERCHE MODERNE */}
        <div className="bg-white rounded-2xl shadow-lg p-5 mb-6 border-2 border-gray-100">
          <div className="flex gap-4 flex-wrap">
            {/* Search input amélioré */}
            <div className="flex-1 min-w-64 relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2">
                <span className="text-xl">🔍</span>
              </div>
              <input
                type="text"
                placeholder="Rechercher une ressource par titre, auteur, catégorie..."
                value={recherche}
                onChange={(e) => setRecherche(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
                style={{ backgroundColor: '#F9FAFB' }}
              />
            </div>

            {/* Select type moderne */}
            <select
              value={typeActive}
              onChange={(e) => { setTypeActive(e.target.value); setCurrentPage(1); }}
              className="px-5 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold text-sm cursor-pointer transition-all"
              style={{ backgroundColor: '#F9FAFB', minWidth: '180px' }}
            >
              <option value="">📋 Tous les types</option>
              <option value="cours">📖 Cours</option>
              <option value="livre">📚 Livres</option>
              <option value="video">🎬 Vidéos</option>
              <option value="article">📄 Articles</option>
              <option value="autre">📁 Autre</option>
            </select>
          </div>

          {/* Texte aide recherche */}
          {recherche && (
            <div className="mt-3 text-sm text-gray-500 flex items-center gap-2">
              <span>🔎</span>
              <span>Recherche : <strong className="text-gray-700">{recherche}</strong></span>
              <button
                onClick={() => setRecherche('')}
                className="ml-2 text-red-500 hover:text-red-700 font-semibold"
              >
                ✕ Effacer
              </button>
            </div>
          )}
        </div>

        {/* 🎨 FILTRES CATÉGORIES MODERNES */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-sm font-bold text-gray-700">Filtrer par catégorie :</span>
          </div>
          <div className="flex gap-3 flex-wrap">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                onClick={() => { setCategorieActive(cat.value); setCurrentPage(1); }}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-sm hover:shadow-md"
                style={
                  categorieActive === cat.value
                    ? { 
                        background: 'linear-gradient(135deg, #0066CC 0%, #0052A3 100%)',
                        color: 'white',
                        transform: 'scale(1.05)'
                      }
                    : { 
                        backgroundColor: 'white', 
                        color: '#374151', 
                        border: '2px solid #e5e7eb' 
                      }
                }
              >
                <span className="text-lg">{cat.icon}</span>
                <span>{cat.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 🎨 GRILLE RESSOURCES */}
        {loading ? (
          <div className="text-center py-20">
            <div
              className="inline-block animate-spin rounded-full h-16 w-16 border-b-4 mb-4"
              style={{ borderColor: COLORS.primary }}
            ></div>
            <p className="text-lg font-semibold text-gray-700">Chargement des ressources...</p>
            <p className="text-sm text-gray-500 mt-2">Veuillez patienter</p>
          </div>
        ) : ressources.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl shadow-lg border-2 border-gray-100">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner">
              <span className="text-5xl">📭</span>
            </div>
            <p className="text-2xl font-bold text-gray-800 mb-2">Aucune ressource trouvée</p>
            <p className="text-gray-600 mb-6">
              {recherche 
                ? `Aucun résultat pour "${recherche}". Essayez avec d'autres mots-clés.` 
                : 'Soyez le premier à ajouter une ressource !'}
            </p>
            {canUpload && (
              <button
                onClick={() => setShowUploadModal(true)}
                className="px-8 py-3 rounded-xl text-white font-bold shadow-lg hover:shadow-xl transition-all"
                style={{ 
                  background: 'linear-gradient(135deg, #00A86B 0%, #008755 100%)'
                }}
              >
                <span className="text-lg">📤</span> Ajouter la première ressource
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Compteur résultats */}
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm text-gray-600">
                <span className="font-semibold text-gray-800">{ressources.length}</span> ressource{ressources.length > 1 ? 's' : ''} affichée{ressources.length > 1 ? 's' : ''}
                {(categorieActive || typeActive || recherche) && (
                  <span className="ml-2">
                    • <button
                      onClick={() => {
                        setCategorieActive('');
                        setTypeActive('');
                        setRecherche('');
                        setCurrentPage(1);
                      }}
                      className="text-blue-600 hover:text-blue-800 font-semibold underline"
                    >
                      Réinitialiser les filtres
                    </button>
                  </span>
                )}
              </p>
            </div>

            {/* Grille */}
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
          </>
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

      {/* 🎨 LOADING OVERLAY MODERNE */}
      {loadingDetail && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm" 
          style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}
        >
          <div className="bg-white rounded-2xl p-8 shadow-2xl border-2 border-gray-100 text-center">
            <div
              className="inline-block animate-spin rounded-full h-16 w-16 border-b-4 mx-auto mb-4"
              style={{ borderColor: COLORS.primary }}
            ></div>
            <p className="text-lg font-semibold text-gray-800">Chargement de la ressource...</p>
            <p className="text-sm text-gray-500 mt-1">Veuillez patienter</p>
          </div>
        </div>
      )}
    </div>
  );
}