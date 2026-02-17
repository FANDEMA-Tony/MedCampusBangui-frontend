import { useState } from 'react';
import { ressourceService } from '../../services/api';

const TYPE_CONFIG = {
  cours: { icon: '📖', color: '#0066CC', bg: '#E6F2FF' },
  livre: { icon: '📚', color: '#00A86B', bg: '#E6F7F0' },
  video: { icon: '🎬', color: '#FF6B35', bg: '#FFF0E6' },
  article: { icon: '📄', color: '#DC143C', bg: '#FFE6EC' },
  autre: { icon: '📁', color: '#6B7280', bg: '#F3F4F6' },
};

const CATEGORIE_ICONS = {
  'Anatomie': '🦴',
  'Pharmacologie': '💊',
  'Physiologie': '🫀',
  'Pathologie': '🔬',
  'Chirurgie': '🩺',
  'Pédiatrie': '👶',
  'Gynécologie': '🌸',
  'Cardiologie': '❤️',
  'Neurologie': '🧠',
};

export default function RessourceDetailModal({ isOpen, onClose, ressource, currentUser, onDeleteSuccess }) {
  const [downloading, setDownloading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  if (!isOpen || !ressource) return null;

  const config = TYPE_CONFIG[ressource.type] || TYPE_CONFIG.autre;
  const categorieIcon = CATEGORIE_ICONS[ressource.categorie] || '📄';
  const canDelete = currentUser?.role === 'admin' || ressource.ajoute_par === currentUser?.id;

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit', month: 'long', year: 'numeric'
    });
  };

  const formatSize = (bytes) => {
    if (!bytes) return 'N/A';
    if (bytes < 1024) return bytes + ' octets';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' Ko';
    return (bytes / 1048576).toFixed(1) + ' Mo';
  };

  const handleDownload = async () => {
    try {
      setDownloading(true);
      const response = await ressourceService.download(ressource.id_ressource);
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', ressource.nom_fichier || ressource.titre);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert('Erreur lors du téléchargement');
    } finally {
      setDownloading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Supprimer "${ressource.titre}" ?`)) return;

    try {
      setDeleting(true);
      await ressourceService.delete(ressource.id_ressource);
      alert('Ressource supprimée !');
      onDeleteSuccess();
    } catch (err) {
      alert(err.response?.data?.message || 'Erreur lors de la suppression');
      setDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        
        {/* Header coloré */}
        <div
          className="p-8 rounded-t-2xl flex items-center justify-center relative"
          style={{ backgroundColor: config.bg }}
        >
          <span className="text-6xl">{config.icon}</span>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl"
          >×</button>
        </div>

        {/* Contenu */}
        <div className="p-6">
          {/* Titre + Badges */}
          <div className="mb-4">
            <h2 className="text-2xl font-bold text-gray-800 mb-3">{ressource.titre}</h2>
            <div className="flex gap-2 flex-wrap">
              <span
                className="text-xs font-bold px-3 py-1 rounded-full"
                style={{ backgroundColor: config.bg, color: config.color }}
              >
                {config.icon} {ressource.type?.toUpperCase()}
              </span>
              {ressource.categorie && (
                <span className="text-xs px-3 py-1 rounded-full bg-gray-100 text-gray-600">
                  {categorieIcon} {ressource.categorie}
                </span>
              )}
              {ressource.niveau && (
                <span className="text-xs px-3 py-1 rounded-full bg-purple-50 text-purple-600">
                  🎓 {ressource.niveau}
                </span>
              )}
              <span
                className="text-xs px-3 py-1 rounded-full"
                style={{
                  backgroundColor: ressource.est_public ? '#E6F7F0' : '#FFE6EC',
                  color: ressource.est_public ? '#00A86B' : '#DC143C',
                }}
              >
                {ressource.est_public ? '🌍 Public' : '🔒 Privé'}
              </span>
            </div>
          </div>

          {/* Description */}
          {ressource.description && (
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">📝 Description</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                {ressource.description}
              </p>
            </div>
          )}

          {/* Infos */}
          <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-gray-50 rounded-xl text-sm">
            {ressource.auteur && (
              <div>
                <p className="text-gray-400 text-xs">✍️ Auteur</p>
                <p className="font-medium text-gray-700">{ressource.auteur}</p>
              </div>
            )}
            {ressource.utilisateur && (
              <div>
                <p className="text-gray-400 text-xs">📤 Ajouté par</p>
                <p className="font-medium text-gray-700">
                  {ressource.utilisateur.prenom} {ressource.utilisateur.nom}
                </p>
              </div>
            )}
            <div>
              <p className="text-gray-400 text-xs">📅 Date</p>
              <p className="font-medium text-gray-700">{formatDate(ressource.created_at)}</p>
            </div>
            <div>
              <p className="text-gray-400 text-xs">📊 Taille</p>
              <p className="font-medium text-gray-700">{formatSize(ressource.taille_fichier)}</p>
            </div>
            <div>
              <p className="text-gray-400 text-xs">📄 Fichier</p>
              <p className="font-medium text-gray-700 truncate">{ressource.nom_fichier}</p>
            </div>
            <div>
              <p className="text-gray-400 text-xs">📎 Extension</p>
              <p className="font-medium text-gray-700">.{ressource.type_fichier}</p>
            </div>
            <div>
              <p className="text-gray-400 text-xs">👁️ Vues</p>
              <p className="font-medium text-gray-700">{ressource.nombre_vues || 0}</p>
            </div>
            <div>
              <p className="text-gray-400 text-xs">⬇️ Téléchargements</p>
              <p className="font-medium text-gray-700">{ressource.nombre_telechargements || 0}</p>
            </div>
          </div>

          {/* Boutons d'action */}
          <div className="flex gap-3">
            {/* Télécharger */}
            <button
              onClick={handleDownload}
              disabled={downloading}
              className="flex-1 py-3 rounded-xl text-white font-semibold transition-all hover:opacity-90"
              style={{ backgroundColor: downloading ? '#93c5fd' : '#0066CC' }}
            >
              {downloading ? '⏳ Téléchargement...' : '⬇️ Télécharger'}
            </button>

            {/* Supprimer (si autorisé) */}
            {canDelete && (
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="px-4 py-3 rounded-xl font-semibold transition-all hover:opacity-90"
                style={{ backgroundColor: '#FFE6EC', color: '#DC143C' }}
              >
                {deleting ? '⏳' : '🗑️'}
              </button>
            )}

            {/* Fermer */}
            <button
              onClick={onClose}
              className="px-6 py-3 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 font-semibold"
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}