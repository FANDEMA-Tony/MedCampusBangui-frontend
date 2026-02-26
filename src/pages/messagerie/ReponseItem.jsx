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

export default function ReponseItem({ reponse }) {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const diffMinutes = Math.floor(diff / (1000 * 60));
    const diffHours = Math.floor(diff / (1000 * 60 * 60));
    const diffDays = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (diffMinutes < 60) {
      return `${diffMinutes}min`;
    } else if (diffHours < 24) {
      return `${diffHours}h`;
    } else if (diffDays < 7) {
      return `${diffDays}j`;
    } else {
      return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
    }
  };

  const utilisateur = reponse.utilisateur;
  const initials = `${utilisateur?.prenom?.charAt(0) || '?'}${utilisateur?.nom?.charAt(0) || '?'}`;
  const avatarColor = getAvatarColor(utilisateur?.nom);

  return (
    <div className="flex gap-3 py-4 hover:bg-gray-50 rounded-lg transition-colors px-2">
      {/* 🎨 AVATAR COLORÉ */}
      <div 
        className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white shadow-md flex-shrink-0"
        style={{ backgroundColor: avatarColor }}
      >
        {initials}
      </div>

      {/* CONTENU */}
      <div className="flex-1 min-w-0">
        {/* Bulle de réponse */}
        <div 
          className="inline-block px-4 py-3 rounded-2xl shadow-sm max-w-2xl"
          style={{ backgroundColor: '#F3F4F6' }}
        >
          <p className="text-sm font-bold text-gray-900 mb-1">
            {utilisateur?.prenom} {utilisateur?.nom}
          </p>
          <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
            {reponse.contenu}
          </p>
        </div>
        
        {/* Meta info */}
        <div className="flex items-center gap-3 mt-2 px-4">
          <span className="text-xs text-gray-500 flex items-center gap-1">
            <span>🕒</span>
            {formatDate(reponse.created_at)}
          </span>
        </div>
      </div>
    </div>
  );
}