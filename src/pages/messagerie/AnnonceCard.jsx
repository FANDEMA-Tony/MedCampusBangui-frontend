import { useState, useEffect } from 'react';
import { messageService } from '../../services/api';

// 🎨 COULEURS AVATARS
const AVATAR_COLORS = [
  '#0066CC', '#00A86B', '#DC143C', '#FF6B35', '#8B5CF6', 
  '#EC4899', '#F59E0B', '#10B981', '#3B82F6', '#6366F1'
];

const getAvatarColor = (name) => {
  if (!name) return AVATAR_COLORS[0];
  const index = name.charCodeAt(0) % AVATAR_COLORS.length;
  return AVATAR_COLORS[index];
};

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

  const expediteur = annonce.expediteur;
  const initials = `${expediteur?.prenom?.charAt(0) || '?'}${expediteur?.nom?.charAt(0) || '?'}`;
  const avatarColor = getAvatarColor(expediteur?.nom);

  return (
    <div 
      className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border-2"
      style={
        annonce.est_epingle 
          ? { borderColor: '#FF6B35', borderLeftWidth: '6px' }
          : { borderColor: '#E5E7EB' }
      }
    >
      <div className="p-6">
        {/* 🎨 EN-TÊTE AVEC AVATAR */}
        <div className="flex items-start justify-between mb-5">
          <div className="flex items-start gap-4 flex-1">
            {/* Icône mégaphone */}
            <div 
              className="w-14 h-14 rounded-xl flex items-center justify-center shadow-md flex-shrink-0"
              style={{ backgroundColor: '#FFF7ED' }}
            >
              <span className="text-3xl">📢</span>
            </div>
            
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <h3 className="text-xl font-bold" style={{ color: '#0066CC' }}>
                  {annonce.sujet || 'Annonce'}
                </h3>
                {annonce.est_epingle && (
                  <span 
                    className="px-3 py-1 rounded-full text-xs font-bold text-white shadow-sm animate-pulse"
                    style={{ backgroundColor: '#FF6B35' }}
                  >
                    📌 Épinglé
                  </span>
                )}
              </div>
              
              {/* Auteur avec avatar */}
              <div className="flex items-center gap-2">
                <div 
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs shadow-sm"
                  style={{ backgroundColor: avatarColor }}
                >
                  {initials}
                </div>
                <p className="text-sm text-gray-600">
                  <span className="font-semibold">{expediteur?.prenom} {expediteur?.nom}</span>
                  <span className="mx-2">•</span>
                  <span>{formatDate(annonce.created_at)}</span>
                </p>
              </div>
            </div>
          </div>

          {/* Badge visibilité */}
          <span 
            className="px-4 py-2 rounded-full text-xs font-bold shadow-sm flex-shrink-0"
            style={{ backgroundColor: '#E6F2FF', color: '#0066CC' }}
          >
            {getVisibiliteLabel(annonce.visibilite)}
          </span>
        </div>

        {/* Badge cours (si applicable) */}
        {annonce.cours && (
          <div 
            className="mb-5 p-4 rounded-xl border-l-4"
            style={{ backgroundColor: '#E6F7F0', borderLeftColor: '#00A86B' }}
          >
            <p className="text-sm font-bold flex items-center gap-2" style={{ color: '#00A86B' }}>
              <span>📚</span>
              {annonce.cours.code} - {annonce.cours.titre}
            </p>
          </div>
        )}

        {/* Contenu */}
        <div className="mb-5">
          <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
            {annonce.contenu}
          </p>
        </div>

        {/* 🎨 FOOTER MODERNE */}
        <div className="flex items-center justify-between pt-5 border-t-2 border-gray-100">
          {/* Compteurs */}
          <div className="flex items-center gap-5">
            <div 
              className="flex items-center gap-2 px-3 py-2 rounded-lg"
              style={{ backgroundColor: '#F3F4F6' }}
            >
              <span className="text-lg">👁️</span>
              <span className="text-sm font-semibold text-gray-700">{vues}</span>
              <span className="text-xs text-gray-500">vues</span>
            </div>
            
            <button 
              onClick={handleLike}
              className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-green-50 transition-all"
              style={{ backgroundColor: '#F3F4F6' }}
            >
              <span className="text-lg">👍</span>
              <span className="text-sm font-semibold text-gray-700">{likes}</span>
              <span className="text-xs text-gray-500">j'aime</span>
            </button>
          </div>

          {/* Bouton épingler (admin) */}
          {currentUser.role === 'admin' && (
            <button
              onClick={() => onToggleEpingle(annonce.id_message)}
              className="px-4 py-2 rounded-lg hover:shadow-md transition-all text-sm font-bold"
              style={{ 
                backgroundColor: annonce.est_epingle ? '#FFF7ED' : '#F3F4F6',
                color: '#FF6B35' 
              }}
            >
              {annonce.est_epingle ? '📌 Désépingler' : '📌 Épingler'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}