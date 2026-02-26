// 🎨 CONFIGURATION DES TYPES
const TYPE_CONFIG = {
  cours: { icon: '📖', color: '#0066CC', bg: '#E6F2FF', label: 'Cours' },
  livre: { icon: '📚', color: '#00A86B', bg: '#E6F7F0', label: 'Livre' },
  video: { icon: '🎬', color: '#FF6B35', bg: '#FFF0E6', label: 'Vidéo' },
  article: { icon: '📄', color: '#DC143C', bg: '#FFE6EC', label: 'Article' },
  autre: { icon: '📁', color: '#6B7280', bg: '#F3F4F6', label: 'Autre' },
};

// 🎨 ICÔNES CATÉGORIES
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

// 🎨 COULEURS AVATARS AUTEUR
const AVATAR_COLORS = [
  '#0066CC', '#00A86B', '#DC143C', '#FF6B35', '#8B5CF6', 
  '#EC4899', '#F59E0B', '#10B981', '#3B82F6', '#6366F1'
];

const getAvatarColor = (name) => {
  if (!name) return AVATAR_COLORS[0];
  const index = name.charCodeAt(0) % AVATAR_COLORS.length;
  return AVATAR_COLORS[index];
};

export default function RessourceCard({ ressource, currentUser, onClick }) {
  const config = TYPE_CONFIG[ressource.type] || TYPE_CONFIG.autre;
  const categorieIcon = CATEGORIE_ICONS[ressource.categorie] || '📄';
  
  // Avatar auteur
  const auteurNom = ressource.utilisateur 
    ? `${ressource.utilisateur.prenom} ${ressource.utilisateur.nom}`
    : ressource.auteur || 'Anonyme';
  const initials = auteurNom.split(' ').map(n => n.charAt(0)).join('').substring(0, 2).toUpperCase();
  const avatarColor = getAvatarColor(auteurNom);

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 cursor-pointer overflow-hidden group border-2 border-gray-100 hover:border-blue-200"
      style={{ 
        transform: 'translateY(0)',
        transition: 'all 0.3s ease'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-8px)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
      }}
    >
      {/* 🎨 HEADER COLORÉ AMÉLIORÉ */}
      <div
        className="p-8 flex items-center justify-center relative overflow-hidden"
        style={{ 
          background: `linear-gradient(135deg, ${config.bg} 0%, ${config.bg}DD 100%)`,
          minHeight: '140px'
        }}
      >
        {/* Icône principale avec animation */}
        <span className="text-6xl group-hover:scale-125 transition-transform duration-300 relative z-10">
          {config.icon}
        </span>
        
        {/* Effet cercle décoratif */}
        <div 
          className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-20"
          style={{ 
            background: config.color,
            transform: 'translate(30%, -30%)'
          }}
        ></div>
      </div>

      {/* 🎨 CONTENU AMÉLIORÉ */}
      <div className="p-5">
        {/* Badge type + Catégorie */}
        <div className="flex items-center justify-between mb-3">
          <span
            className="text-xs font-bold px-3 py-1.5 rounded-full shadow-sm"
            style={{ backgroundColor: config.bg, color: config.color }}
          >
            {config.icon} {config.label}
          </span>
          {ressource.categorie && (
            <span 
              className="text-xs font-semibold px-2 py-1 rounded-full"
              style={{ backgroundColor: '#F3F4F6', color: '#6B7280' }}
            >
              {categorieIcon} {ressource.categorie}
            </span>
          )}
        </div>

        {/* Titre avec meilleur contraste */}
        <h3 className="font-bold text-gray-900 mb-2 line-clamp-2 text-base leading-6 min-h-[3rem]">
          {ressource.titre}
        </h3>

        {/* Description */}
        {ressource.description && (
          <p className="text-sm text-gray-600 line-clamp-2 mb-3 leading-relaxed">
            {ressource.description}
          </p>
        )}

        {/* Niveau */}
        {ressource.niveau && (
          <div className="mb-4">
            <span className="text-xs px-3 py-1.5 rounded-full font-bold shadow-sm" style={{ backgroundColor: '#F3E8FF', color: '#9333EA' }}>
              🎓 {ressource.niveau}
            </span>
          </div>
        )}

        {/* 🎨 STATS MODERNES */}
        <div className="flex items-center justify-between text-sm mb-4 pt-3 border-t-2 border-gray-100">
          <div className="flex items-center gap-1 text-gray-600" title="Vues">
            <span className="text-base">👁️</span>
            <span className="font-semibold">{ressource.nombre_vues || 0}</span>
          </div>
          
          <div className="flex items-center gap-1 text-gray-600" title="Téléchargements">
            <span className="text-base">⬇️</span>
            <span className="font-semibold">{ressource.nombre_telechargements || 0}</span>
          </div>
          
          <div 
            className="flex items-center gap-1" 
            title="Likes"
            style={{ color: ressource.est_like_par_moi ? '#DC143C' : '#9CA3AF' }}
          >
            <span className="text-base">{ressource.est_like_par_moi ? '❤️' : '🤍'}</span>
            <span className="font-semibold">{ressource.nombre_likes || 0}</span>
          </div>
          
          <div className="flex items-center gap-1 text-gray-600" title={ressource.est_public ? 'Public' : 'Privé'}>
            <span className="text-base">{ressource.est_public ? '🌍' : '🔒'}</span>
          </div>
        </div>

        {/* 🎨 AUTEUR AVEC AVATAR */}
        <div className="flex items-center gap-3 pt-3 border-t-2 border-gray-100">
          {/* Avatar coloré */}
          <div 
            className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md flex-shrink-0"
            style={{ backgroundColor: avatarColor }}
          >
            {initials}
          </div>
          
          {/* Infos auteur */}
          <div className="flex-1 min-w-0">
            {/* Nom auteur */}
            {ressource.auteur && (
              <p className="text-xs font-semibold text-gray-800 truncate">
                ✍️ {ressource.auteur}
              </p>
            )}
            
            {/* Ajouté par */}
            {ressource.utilisateur && (
              <p className="text-xs text-gray-500 truncate">
                Par {ressource.utilisateur.prenom} {ressource.utilisateur.nom}
              </p>
            )}
            
            {/* Si pas d'info */}
            {!ressource.auteur && !ressource.utilisateur && (
              <p className="text-xs text-gray-500">
                Auteur anonyme
              </p>
            )}
          </div>
        </div>
      </div>

      {/* 🎨 BADGE "CLIQUER POUR VOIR" AU HOVER */}
      <div 
        className="absolute bottom-0 left-0 right-0 py-2 text-center text-sm font-bold text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{ 
          background: 'linear-gradient(to top, rgba(0,102,204,0.9), transparent)'
        }}
      >
        👉 Cliquer pour voir les détails
      </div>
    </div>
  );
}