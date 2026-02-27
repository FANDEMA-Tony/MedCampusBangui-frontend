import { useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { logout, getUser } from '../../utils/auth';
import { messageService } from '../../services/api';
import Button from '../common/Button';
import GlobalSearch from '../search/GlobalSearch'; // ✅ AJOUT SPRINT 4

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = getUser();
  const [nonLus, setNonLus] = useState(0);

  useEffect(() => {
    fetchNonLus();
    
    // Rafraîchir toutes les 30 secondes
    const interval = setInterval(fetchNonLus, 30000);
    
    return () => clearInterval(interval);
  }, []);

  // Rafraîchir quand on revient sur la page messagerie
  useEffect(() => {
    if (location.pathname === '/messagerie') {
      fetchNonLus();
    }
  }, [location.pathname]);

  // Écouter un événement personnalisé de rafraîchissement
  useEffect(() => {
    const handleRefreshBadge = () => {
      fetchNonLus();
    };

    window.addEventListener('refreshMessageBadge', handleRefreshBadge);
    
    return () => {
      window.removeEventListener('refreshMessageBadge', handleRefreshBadge);
    };
  }, []);

  const fetchNonLus = async () => {
    try {
      const response = await messageService.getNonLus();
      const count = response.data.data?.count || response.data.count || 0;
      setNonLus(count);
    } catch (err) {
      console.error('Erreur compteur messages:', err);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 gap-4">

          {/* Logo */}
          <div className="flex items-center flex-shrink-0">
            <span className="text-3xl mr-3">🏥</span>
            <div>
              <h1 className="text-xl font-bold" style={{ color: '#0066CC' }}>
                MedCampus Bangui
              </h1>
              <p className="text-xs" style={{ color: '#6B7280' }}>
                {user?.role === 'admin'      && 'Administration'}
                {user?.role === 'enseignant' && 'Espace Enseignant'}
                {user?.role === 'etudiant'   && 'Espace Étudiant'}
              </p>
            </div>
          </div>

          {/* ✅ AJOUT SPRINT 4 — Barre de recherche globale (centre) */}
          <div className="flex-1 max-w-md hidden md:block">
            <GlobalSearch placeholder="Rechercher un étudiant, cours, enseignant..." />
          </div>

          {/* Navigation + User info */}
          <div className="flex items-center space-x-4 flex-shrink-0">

            {/* Icône Messagerie avec Badge */}
            <button
              onClick={() => navigate('/messagerie')}
              className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
              title="Messagerie"
            >
              <span className="text-2xl">📧</span>
              {nonLus > 0 && (
                <span
                  className="absolute -top-1 -right-1 min-w-[20px] h-5 flex items-center justify-center rounded-full text-xs font-bold text-white px-1.5"
                  style={{ backgroundColor: '#DC143C' }}
                >
                  {nonLus > 99 ? '99+' : nonLus}
                </span>
              )}
            </button>

            {/* Bibliothèque */}
            <button
              onClick={() => navigate('/bibliotheque')}
              className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
              title="Bibliothèque"
            >
              <span className="text-2xl">📚</span>
            </button>

            {/* Données Sanitaires */}
            <button
              onClick={() => navigate('/donnees-sanitaires')}
              className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
              title="Données Sanitaires"
            >
              <span className="text-2xl">🏥</span>
            </button>

            {/* Calendrier Académique */}
            <button
              onClick={() => navigate('/calendrier')}
              className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
              title="Calendrier Académique"
              style={{
                backgroundColor: location.pathname === '/calendrier' ? '#EFF6FF' : 'transparent',
              }}
            >
              <span className="text-2xl">📅</span>
              {location.pathname === '/calendrier' && (
                <span
                  className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full"
                  style={{ backgroundColor: '#0066CC' }}
                />
              )}
            </button>

            {/* User Info */}
            <div className="text-right">
              <p className="text-sm font-semibold text-gray-800">
                {user?.prenom} {user?.nom}
              </p>
              <p className="text-xs text-gray-500">{user?.email}</p>
            </div>

            {/* Bouton Déconnexion */}
            <Button
              variant="danger"
              onClick={handleLogout}
              className="text-sm"
              style={{ backgroundColor: '#DC143C', borderColor: '#DC143C' }}
            >
              Déconnexion
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}