import { useState, useEffect } from 'react';
import { messageService } from '../../services/api';

export default function AnnonceCard({ annonce, currentUser, onToggleEpingle }) {
  const [vues, setVues] = useState(annonce.nombre_vues || 0);
  const [likes, setLikes] = useState(annonce.nombre_likes || 0);
  const [viewed, setViewed] = useState(false);

  // ✅ Incrémenter vues au chargement (1 seule fois)
  useEffect(() => {
    if (!viewed) {
      messageService.getOne(annonce.id_message)
        .then(() => {
          setVues(prev => prev + 1);
          setViewed(true);
        })
        .catch(err => console.error('Erreur incrémentation vues:', err));
    }
  }, []);

  const handleLike = async () => {
    try {
      const response = await messageService.like(annonce.id_message);
      setLikes(response.data.data.nombre_likes);
    } catch (err) {
      console.error('Erreur like:', err);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getVisibiliteLabel = (visibilite) => {
    switch (visibilite) {
      case 'tous': return '🌍 Tous';
      case 'enseignants': return '👨‍🏫 Enseignants';
      case 'etudiants': return '👨‍🎓 Étudiants';
      case 'cours': return '📚 Cours spécifique';
      default: return visibilite;
    }
  };

  return (
    <div 
      className="bg-white rounded-lg shadow-md overflow-hidden"
      style={
        annonce.est_epingle 
          ? { borderLeft: '4px solid #FF6B35' }
          : {}
      }
    >
      <div className="p-6">
        {/* En-tête */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <span className="text-3xl">📢</span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold" style={{ color: '#0066CC' }}>
                  {annonce.sujet || 'Annonce'}
                </h3>
                {annonce.est_epingle && (
                  <span 
                    className="px-2 py-1 rounded text-xs font-semibold text-white"
                    style={{ backgroundColor: '#FF6B35' }}
                  >
                    📌 Épinglé
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-600 mt-1">
                Par {annonce.expediteur?.prenom} {annonce.expediteur?.nom} • {formatDate(annonce.created_at)}
              </p>
            </div>
          </div>

          <span 
            className="px-3 py-1 rounded-full text-xs font-semibold"
            style={{ backgroundColor: '#E6F2FF', color: '#0066CC' }}
          >
            {getVisibiliteLabel(annonce.visibilite)}
          </span>
        </div>

        {annonce.cours && (
          <div 
            className="mb-4 p-3 rounded-lg"
            style={{ backgroundColor: '#E6F7F0' }}
          >
            <p className="text-sm font-semibold" style={{ color: '#00A86B' }}>
              📚 {annonce.cours.code} - {annonce.cours.titre}
            </p>
          </div>
        )}

        <div className="mb-4">
          <p className="text-gray-700 whitespace-pre-wrap">
            {annonce.contenu}
          </p>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span>👁️ {vues} vues</span>
            <button 
              onClick={handleLike}
              className="flex items-center gap-1 hover:text-green-600 transition-colors"
            >
              👍 {likes}
            </button>
          </div>

          {currentUser.role === 'admin' && (
            <button
              onClick={() => onToggleEpingle(annonce.id_message)}
              className="px-3 py-1 rounded hover:bg-gray-100 transition-colors text-sm font-medium"
              style={{ color: '#FF6B35' }}
            >
              {annonce.est_epingle ? '📌 Désépingler' : '📌 Épingler'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}