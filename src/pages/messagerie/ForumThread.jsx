import { useState, useEffect } from 'react';
import { messageService } from '../../services/api';
import ReponseItem from './ReponseItem';

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
        className="px-2 py-1 rounded-full text-xs font-semibold"
        style={{ backgroundColor: badge.bg, color: badge.color }}
      >
        {badge.icon} {badge.text}
      </span>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
      <div className="p-6">
        {/* EN-TÊTE */}
        <div className="flex items-start gap-4 mb-4">
          <div 
            className="w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold text-white"
            style={{ backgroundColor: '#0066CC' }}
          >
            {message.expediteur?.prenom?.charAt(0)}{message.expediteur?.nom?.charAt(0)}
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <p className="font-semibold text-gray-900">
                {message.expediteur?.prenom} {message.expediteur?.nom}
              </p>
              {getRoleBadge(message.expediteur?.role)}
            </div>
            <p className="text-sm text-gray-500">
              {formatDate(message.created_at)}
            </p>
          </div>

          <div className="text-right">
            <p className="text-sm text-gray-500">
              👁️ {vues} vues
            </p>
          </div>
        </div>

        {/* SUJET */}
        {message.sujet && (
          <h3 className="text-lg font-bold mb-3" style={{ color: '#0066CC' }}>
            {message.sujet}
          </h3>
        )}

        {/* CONTENU */}
        <div className="mb-4">
          <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
            {message.contenu}
          </p>
        </div>

        {/* FOOTER */}
        <div className="flex items-center gap-4 pt-4 border-t border-gray-200">
          <button 
            onClick={() => setShowReplyInput(!showReplyInput)}
            className="text-sm font-medium hover:underline"
            style={{ color: '#0066CC' }}
          >
            💬 Répondre
          </button>

          <button 
            onClick={handleLike}
            className="text-sm font-medium hover:underline"
            style={{ color: liked ? '#00A86B' : '#6B7280' }}
          >
            👍 J'aime ({likes})
          </button>
          
          {message.expediteur_id === currentUser.id_utilisateur && (
            <button 
              onClick={handleDelete}
              className="text-sm font-medium hover:underline ml-auto"
              style={{ color: '#DC143C' }}
            >
              🗑️ Supprimer
            </button>
          )}
        </div>

        {/* INPUT RÉPONSE */}
        {showReplyInput && (
          <div className="mt-4 flex gap-3 pl-12">
            <div 
              className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
              style={{ backgroundColor: '#0066CC' }}
            >
              {currentUser.prenom?.charAt(0)}{currentUser.nom?.charAt(0)}
            </div>
            <div className="flex-1">
              <input
                type="text"
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Écrivez une réponse..."
                className="w-full px-4 py-2 border border-gray-200 rounded-full focus:outline-none focus:border-blue-500"
                onKeyPress={(e) => e.key === 'Enter' && handleReplySubmit()}
              />
              <div className="flex gap-2 mt-2">
                <button
                  onClick={handleReplySubmit}
                  disabled={loadingReply || !replyText.trim()}
                  className="px-4 py-1 rounded-full text-sm font-medium text-white"
                  style={{ backgroundColor: loadingReply ? '#93c5fd' : '#0066CC' }}
                >
                  {loadingReply ? 'Envoi...' : 'Envoyer'}
                </button>
                <button
                  onClick={() => { setShowReplyInput(false); setReplyText(''); }}
                  className="px-4 py-1 rounded-full text-sm font-medium text-gray-600 hover:bg-gray-100"
                >
                  Annuler
                </button>
              </div>
            </div>
          </div>
        )}

        {/* LISTE RÉPONSES */}
        {reponses.length > 0 && (
          <div className="mt-4">
            {showReponses && reponses.slice(0, 3).map((reponse) => (
              <ReponseItem key={reponse.id_reponse} reponse={reponse} />
            ))}

            {reponses.length > 3 && (
              <button
                onClick={() => setShowReponses(!showReponses)}
                className="ml-12 mt-2 text-sm font-medium hover:underline"
                style={{ color: '#0066CC' }}
              >
                {showReponses 
                  ? `📖 Voir ${reponses.length - 3} autres réponse${reponses.length - 3 > 1 ? 's' : ''}...`
                  : '▲ Masquer les réponses'
                }
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}