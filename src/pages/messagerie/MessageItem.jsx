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

export default function MessageItem({ message, type, onClick }) {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const diffDays = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return `Aujourd'hui ${date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`;
    } else if (diffDays === 1) {
      return 'Hier';
    } else if (diffDays < 7) {
      return `Il y a ${diffDays} jour${diffDays > 1 ? 's' : ''}`;
    } else {
      return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
    }
  };

  const isReceived = type === 'recus';
  const contact = isReceived ? message.expediteur : message.destinataire;
  const initials = `${contact?.prenom?.charAt(0) || '?'}${contact?.nom?.charAt(0) || '?'}`;
  const avatarColor = getAvatarColor(contact?.nom);

  return (
    <div
      onClick={onClick}
      className="p-4 rounded-xl hover:shadow-lg transition-all duration-300 cursor-pointer border border-transparent hover:border-blue-200"
      style={{
        backgroundColor: isReceived && !message.est_lu ? '#EFF6FF' : 'white',
      }}
    >
      <div className="flex items-start gap-4">
        {/* 🎨 AVATAR COLORÉ */}
        <div 
          className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0 shadow-md"
          style={{ backgroundColor: avatarColor }}
        >
          {initials}
        </div>

        {/* CONTENU */}
        <div className="flex-1 min-w-0">
          {/* EN-TÊTE */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900 truncate text-base">
                {isReceived ? '' : 'À : '}
                {contact?.prenom} {contact?.nom}
              </p>
              <p className="text-sm font-medium text-gray-600 truncate mt-0.5">
                {message.sujet || '(Sans sujet)'}
              </p>
            </div>
            
            {/* 🎨 BADGES MODERNES */}
            <div className="ml-3 flex items-center gap-2 flex-shrink-0">
              {isReceived && !message.est_lu && (
                <span 
                  className="px-3 py-1.5 rounded-full text-xs font-bold text-white shadow-sm animate-pulse"
                  style={{ backgroundColor: '#DC143C' }}
                >
                  🔴 Nouveau
                </span>
              )}
              
              {!isReceived && message.est_lu && (
                <span 
                  className="px-3 py-1.5 rounded-full text-xs font-semibold"
                  style={{ backgroundColor: '#E6F7F0', color: '#00A86B' }}
                >
                  ✓ Lu
                </span>
              )}
            </div>
          </div>
          
          {/* APERÇU MESSAGE */}
          <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed mb-2">
            {message.contenu}
          </p>

          {/* DATE */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400">
              📅 {formatDate(message.created_at)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}