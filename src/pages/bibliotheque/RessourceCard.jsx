const TYPE_CONFIG = {
  cours: { icon: '📖', color: '#0066CC', bg: '#E6F2FF', label: 'Cours' },
  livre: { icon: '📚', color: '#00A86B', bg: '#E6F7F0', label: 'Livre' },
  video: { icon: '🎬', color: '#FF6B35', bg: '#FFF0E6', label: 'Vidéo' },
  article: { icon: '📄', color: '#DC143C', bg: '#FFE6EC', label: 'Article' },
  autre: { icon: '📁', color: '#6B7280', bg: '#F3F4F6', label: 'Autre' },
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

export default function RessourceCard({ ressource, currentUser, onClick }) {
  const config = TYPE_CONFIG[ressource.type] || TYPE_CONFIG.autre;
  const categorieIcon = CATEGORIE_ICONS[ressource.categorie] || '📄';

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all cursor-pointer overflow-hidden group"
      style={{ border: '1px solid #e5e7eb' }}
    >
      {/* Header coloré */}
      <div
        className="p-6 flex items-center justify-center"
        style={{ backgroundColor: config.bg, minHeight: '120px' }}
      >
        <span className="text-5xl group-hover:scale-110 transition-transform">
          {config.icon}
        </span>
      </div>

      {/* Contenu */}
      <div className="p-4">
        {/* Badge type + Catégorie */}
        <div className="flex items-center justify-between mb-2">
          <span
            className="text-xs font-bold px-2 py-1 rounded-full"
            style={{ backgroundColor: config.bg, color: config.color }}
          >
            {config.label}
          </span>
          {ressource.categorie && (
            <span className="text-xs text-gray-500">
              {categorieIcon} {ressource.categorie}
            </span>
          )}
        </div>

        {/* Titre */}
        <h3 className="font-semibold text-gray-800 mb-1 line-clamp-2 text-sm leading-5">
          {ressource.titre}
        </h3>

        {/* Description */}
        {ressource.description && (
          <p className="text-xs text-gray-500 line-clamp-2 mb-3">
            {ressource.description}
          </p>
        )}

        {/* Niveau */}
        {ressource.niveau && (
          <div className="mb-3">
            <span className="text-xs px-2 py-1 rounded-full bg-purple-50 text-purple-600 font-medium">
              🎓 {ressource.niveau}
            </span>
          </div>
        )}

        {/* Footer stats */}
        <div className="flex items-center justify-between text-xs text-gray-400 mt-3 pt-3 border-t border-gray-100">
          <span>👁️ {ressource.nombre_vues || 0}</span>
          <span>⬇️ {ressource.nombre_telechargements || 0}</span>
          <span>
            {ressource.est_public ? '🌍 Public' : '🔒 Privé'}
          </span>
        </div>

        {/* Auteur */}
        {ressource.auteur && (
          <div className="mt-2 text-xs text-gray-400">
            ✍️ {ressource.auteur}
          </div>
        )}

        {/* Ajouté par */}
        {ressource.utilisateur && (
          <div className="mt-1 text-xs text-gray-400">
            Par {ressource.utilisateur.prenom} {ressource.utilisateur.nom}
          </div>
        )}
      </div>
    </div>
  );
}