export default function ReponseItem({ reponse }) {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const diffMinutes = Math.floor(diff / (1000 * 60));
    const diffHours = Math.floor(diff / (1000 * 60 * 60));

    if (diffMinutes < 60) {
      return `${diffMinutes}min`;
    } else if (diffHours < 24) {
      return `${diffHours}h`;
    } else {
      return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
    }
  };

  return (
    <div className="flex gap-3 py-3 pl-12">
      {/* Avatar */}
      <div 
        className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
        style={{ backgroundColor: '#6B7280' }}
      >
        {reponse.utilisateur?.prenom?.charAt(0)}{reponse.utilisateur?.nom?.charAt(0)}
      </div>

      {/* Contenu */}
      <div className="flex-1">
        <div 
          className="inline-block px-3 py-2 rounded-2xl"
          style={{ backgroundColor: '#F3F4F6' }}
        >
          <p className="text-sm font-semibold text-gray-900">
            {reponse.utilisateur?.prenom} {reponse.utilisateur?.nom}
          </p>
          <p className="text-sm text-gray-700 mt-1">
            {reponse.contenu}
          </p>
        </div>
        <div className="flex gap-3 mt-1 px-3">
          <span className="text-xs text-gray-500">{formatDate(reponse.created_at)}</span>
        </div>
      </div>
    </div>
  );
}