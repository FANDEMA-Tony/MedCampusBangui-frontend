export default function ForumThread({ message, currentUser }) {
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
        {/* En-tête */}
        <div className="flex items-start gap-4 mb-4">
          {/* Avatar */}
          <div 
            className="w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold text-white"
            style={{ backgroundColor: '#0066CC' }}
          >
            {message.expediteur?.prenom?.charAt(0)}{message.expediteur?.nom?.charAt(0)}
          </div>

          {/* Infos */}
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

          {/* Stats */}
          <div className="text-right">
            <p className="text-sm text-gray-500">
              👁️ {message.nombre_vues || 0} vues
            </p>
          </div>
        </div>

        {/* Sujet */}
        {message.sujet && (
          <h3 className="text-lg font-bold mb-3" style={{ color: '#0066CC' }}>
            {message.sujet}
          </h3>
        )}

        {/* Contenu */}
        <div className="mb-4">
          <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
            {message.contenu}
          </p>
        </div>

        {/* Footer */}
        <div className="flex items-center gap-4 pt-4 border-t border-gray-200">
          <button 
            className="text-sm font-medium hover:underline"
            style={{ color: '#0066CC' }}
          >
            💬 Répondre
          </button>
          <button 
            className="text-sm font-medium hover:underline"
            style={{ color: '#00A86B' }}
          >
            👍 J'aime
          </button>
          {message.expediteur_id === currentUser.id_utilisateur && (
            <button 
              className="text-sm font-medium hover:underline ml-auto"
              style={{ color: '#DC143C' }}
            >
              🗑️ Supprimer
            </button>
          )}
        </div>
      </div>
    </div>
  );
}