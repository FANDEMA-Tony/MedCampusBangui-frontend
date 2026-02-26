import { useState, useEffect } from 'react';
import { messageService } from '../../services/api';
import ReponseItem from './ReponseItem';

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

export default function ForumThread({ message, currentUser, onDelete }) {
  const [vues, setVues] = useState(message.nombre_vues || 0);
  const [likes, setLikes] = useState(message.nombre_likes || 0);
  const [liked, setLiked] = useState(false);
  const [viewed, setViewed] = useState(false);
  
  // ✅ RÉPONSES
  const [reponses, setReponses] = useState([]);
  const [showReponses, setShowReponses] = useState(true);
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [loadingReply, setLoadingReply] = useState(false);

  useEffect(() => {
    if (!viewed) {
      messageService.getOne(message.id_message)
        .then(() => {
          setVues(prev => prev + 1);
          setViewed(true);
        })
        .catch(err => console.error('Erreur vues:', err));
    }
    
    // ✅ Charger les réponses
    fetchReponses();
  }, []);

  const fetchReponses = async () => {
    try {
      const response = await messageService.getReponses(message.id_message);
      setReponses(response.data.data || []);
    } catch (err) {
      console.error('Erreur réponses:', err);
    }
  };

  const handleLike = async () => {
    try {
      const response = await messageService.like(message.id_message);
      setLikes(response.data.data.nombre_likes);
      setLiked(response.data.data.liked);
    } catch (err) {
      console.error('Erreur like:', err);
    }
  };

  const handleReplySubmit = async () => {
    if (!replyText.trim()) return;
    
    try {
      setLoadingReply(true);
      await messageService.repondre(message.id_message, { contenu: replyText });
      setReplyText('');
      setShowReplyInput(false);
      fetchReponses();
    } catch (err) {
      alert('Erreur lors de l\'envoi de la réponse');
    } finally {
      setLoadingReply(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Supprimer ce message ?')) return;
    
    try {
      await messageService.delete(message.id_message);
      alert('Message supprimé !');
      if (onDelete) onDelete();
    } catch (err) {
      alert('Erreur lors de la suppression');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const diffMinutes = Math.floor(diff / (1000 * 60));
    const diffHours = Math.floor(diff / (1000 * 60 * 60));
    const diffDays = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (diffMinutes < 60) {
      return `Il y a ${diffMinutes} minute${diffMinutes > 1 ? 's' : ''}`;
    } else if (diffHours < 24) {
      return `Il y a ${diffHours} heure${diffHours > 1 ? 's' : ''}`;
    } else if (diffDays < 7) {
      return `Il y a ${diffDays} jour${diffDays > 1 ? 's' : ''}`;
    } else {
      return date.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      });
    }
  };

  const getRoleBadge = (role) => {
    const badges = {
      admin: { icon: '👑', text: 'Admin', color: '#DC143C', bg: '#FFE6EC' },
      enseignant: { icon: '👨‍🏫', text: 'Enseignant', color: '#0066CC', bg: '#E6F2FF' },
      etudiant: { icon: '👨‍🎓', text: 'Étudiant', color: '#00A86B', bg: '#E6F7F0' }
    };
    
    const badge = badges[role] || badges.etudiant;
    
    return (
      <span 
        className="px-3 py-1 rounded-full text-xs font-bold shadow-sm"
        style={{ backgroundColor: badge.bg, color: badge.color }}
      >
        {badge.icon} {badge.text}
      </span>
    );
  };

  const expediteur = message.expediteur;
  const initials = `${expediteur?.prenom?.charAt(0) || '?'}${expediteur?.nom?.charAt(0) || '?'}`;
  const avatarColor = getAvatarColor(expediteur?.nom);
  
  const currentUserInitials = `${currentUser.prenom?.charAt(0) || '?'}${currentUser.nom?.charAt(0) || '?'}`;
  const currentUserColor = getAvatarColor(currentUser.nom);

  return (
    <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border-2 border-gray-200">
      <div className="p-6">
        {/* 🎨 EN-TÊTE AVEC AVATAR COLORÉ */}
        <div className="flex items-start gap-4 mb-5">
          <div 
            className="w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold text-white shadow-md flex-shrink-0"
            style={{ backgroundColor: avatarColor }}
          >
            {initials}
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2 flex-wrap">
              <p className="font-bold text-gray-900 text-lg">
                {expediteur?.prenom} {expediteur?.nom}
              </p>
              {getRoleBadge(expediteur?.role)}
            </div>
            <p className="text-sm text-gray-500 flex items-center gap-2">
              <span>🕒</span>
              {formatDate(message.created_at)}
            </p>
          </div>

          <div 
            className="text-right px-3 py-2 rounded-lg flex-shrink-0"
            style={{ backgroundColor: '#F3F4F6' }}
          >
            <p className="text-xs text-gray-500 mb-1">Vues</p>
            <p className="text-lg font-bold text-gray-700">
              👁️ {vues}
            </p>
          </div>
        </div>

        {/* SUJET */}
        {message.sujet && (
          <div 
            className="mb-4 p-4 rounded-xl border-l-4"
            style={{ backgroundColor: '#EFF6FF', borderLeftColor: '#0066CC' }}
          >
            <h3 className="text-lg font-bold" style={{ color: '#0066CC' }}>
              💬 {message.sujet}
            </h3>
          </div>
        )}

        {/* CONTENU */}
        <div className="mb-5 p-4 rounded-lg" style={{ backgroundColor: '#F9FAFB' }}>
          <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
            {message.contenu}
          </p>
        </div>

        {/* 🎨 FOOTER ACTIONS */}
        <div className="flex items-center gap-4 pt-5 border-t-2 border-gray-100 flex-wrap">
          <button 
            onClick={() => setShowReplyInput(!showReplyInput)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm hover:shadow-md transition-all"
            style={{ backgroundColor: '#E6F2FF', color: '#0066CC' }}
          >
            <span>💬</span> Répondre
          </button>

          <button 
            onClick={handleLike}
            className="flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm hover:shadow-md transition-all"
            style={{ 
              backgroundColor: liked ? '#E6F7F0' : '#F3F4F6',
              color: liked ? '#00A86B' : '#6B7280'
            }}
          >
            <span>👍</span> J'aime ({likes})
          </button>
          
          {message.expediteur_id === currentUser.id_utilisateur && (
            <button 
              onClick={handleDelete}
              className="flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm hover:shadow-md transition-all ml-auto"
              style={{ backgroundColor: '#FFE6EC', color: '#DC143C' }}
            >
              <span>🗑️</span> Supprimer
            </button>
          )}
        </div>

        {/* 🎨 INPUT RÉPONSE MODERNE */}
        {showReplyInput && (
          <div className="mt-6 pl-14">
            <div className="flex gap-3">
              <div 
                className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white shadow-md flex-shrink-0"
                style={{ backgroundColor: currentUserColor }}
              >
                {currentUserInitials}
              </div>
              <div className="flex-1">
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Écrivez une réponse..."
                  rows="3"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 transition-colors"
                  style={{ resize: 'none' }}
                />
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={handleReplySubmit}
                    disabled={loadingReply || !replyText.trim()}
                    className="px-5 py-2 rounded-lg text-sm font-bold text-white shadow-md hover:shadow-lg transition-all disabled:opacity-50"
                    style={{ backgroundColor: loadingReply ? '#93c5fd' : '#0066CC' }}
                  >
                    {loadingReply ? '⏳ Envoi...' : '📤 Envoyer'}
                  </button>
                  <button
                    onClick={() => { setShowReplyInput(false); setReplyText(''); }}
                    className="px-5 py-2 rounded-lg text-sm font-semibold text-gray-600 hover:bg-gray-100 transition-all"
                  >
                    Annuler
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* LISTE RÉPONSES */}
        {reponses.length > 0 && (
          <div className="mt-6 pl-14">
            <div className="border-l-2 border-gray-200 pl-4">
              {/* 🔥 CORRECTION : Afficher selon showReponses */}
              {(showReponses ? reponses : reponses.slice(0, 3)).map((reponse) => (
                <ReponseItem key={reponse.id_reponse} reponse={reponse} />
              ))}

              {reponses.length > 3 && (
                <button
                  onClick={() => setShowReponses(!showReponses)}
                  className="mt-3 text-sm font-semibold hover:underline"
                  style={{ color: '#0066CC' }}
                >
                  {/* 🔥 CORRECTION : Inverser les labels */}
                  {!showReponses 
                    ? `📖 Voir ${reponses.length - 3} autre${reponses.length - 3 > 1 ? 's' : ''} réponse${reponses.length - 3 > 1 ? 's' : ''}...`
                    : '▲ Masquer les réponses'
                  }
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}