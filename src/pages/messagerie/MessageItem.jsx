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
      return `Il y a ${diffDays} jours`;
    } else {
      return date.toLocaleDateString('fr-FR');
    }
  };

  const isReceived = type === 'recus';
  const contact = isReceived ? message.expediteur : message.destinataire;

  return (
    <div
      onClick={onClick}
      className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
      style={
        isReceived && !message.est_lu
          ? { backgroundColor: '#E6F2FF' }
          : {}
      }
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">👤</span>
            <div className="flex-1">
              <p className="font-semibold text-gray-900">
                {isReceived ? '' : 'À : '}
                {contact?.prenom} {contact?.nom}
              </p>
              <p className="text-sm text-gray-600">
                {message.sujet || '(Sans sujet)'}
              </p>
            </div>
            
            {/* Badge */}
            {isReceived && !message.est_lu && (
              <span 
                className="px-3 py-1 rounded-full text-xs font-semibold text-white"
                style={{ backgroundColor: '#DC143C' }}
              >
                Nouveau
              </span>
            )}
            
            {!isReceived && message.est_lu && (
              <span 
                className="px-3 py-1 rounded-full text-xs font-semibold"
                style={{ backgroundColor: '#E6F7F0', color: '#00A86B' }}
              >
                ✓ Lu
              </span>
            )}
          </div>
          
          <p className="text-sm text-gray-500 line-clamp-2">
            {message.contenu}
          </p>
        </div>
        
        <div className="ml-4 text-right">
          <p className="text-xs text-gray-500">
            {formatDate(message.created_at)}
          </p>
        </div>
      </div>
    </div>
  );
}