import { useState, useEffect } from 'react';
import { donneeSanitaireService } from '../../services/api';
import { getUser } from '../../utils/auth';
import Navbar from '../../components/layout/Navbar';
import DonneeCard from './DonneeCard';
import CollecteModal from './CollecteModal';
import StatistiquesPanel from './StatistiquesPanel';
import FiltreSanitaire from './FiltreSanitaire';

const COLORS = {
  primary: '#0066CC',
  success: '#00A86B',
  danger: '#DC143C',
  warning: '#FF6B35',
  background: '#F0F4F8',
};

export default function DonneesSanitaires() {
  const currentUser = getUser();
  const [activeTab, setActiveTab] = useState('donnees');
  const [loading, setLoading] = useState(true);
  const [donnees, setDonnees] = useState([]);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchCode, setSearchCode] = useState('');
  const [searchResult, setSearchResult] = useState(null);

  const [filtres, setFiltres] = useState({
    pathologie: '',
    ville: '',
    commune: '',
    gravite: '',
    tranche_age: '',
    sexe: '',
    nom_patient: '',
    en_cours: false,
    graves: false,
  });

  const [showCollecteModal, setShowCollecteModal] = useState(false);

  useEffect(() => {
    if (activeTab === 'donnees') {
      fetchDonnees();
    }
  }, [activeTab, filtres, currentPage]);

  const fetchDonnees = async () => {
    try {
      setLoading(true);
      const params = { page: currentPage };
      Object.keys(filtres).forEach(key => {
        if (filtres[key]) params[key] = filtres[key];
      });
      const response = await donneeSanitaireService.getAll(params);
      const data = response.data;
      setDonnees(data.data || []);
      setTotal(data.total || 0);
    } catch (err) {
      console.error('Erreur données sanitaires:', err);
      setDonnees([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCollecteSuccess = () => {
    setShowCollecteModal(false);
    fetchDonnees();
  };

  const handleDeleteSuccess = () => {
    fetchDonnees();
  };

  const handleFiltreChange = (newFiltres) => {
    setFiltres(newFiltres);
    setCurrentPage(1);
  };

  const handleSearchCode = async () => {
    if (!searchCode.trim()) return;
    try {
      setLoading(true);
      const response = await donneeSanitaireService.rechercherParCode(searchCode);
      setSearchResult(response.data.data);
      setDonnees([response.data.data]);
      setTotal(1);
    } catch (err) {
      if (err.response?.status === 404) {
        alert('❌ Aucun patient trouvé avec ce code');
      } else {
        alert('❌ Erreur lors de la recherche');
      }
      setDonnees([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  const hasFiltresActifs = Object.values(filtres).some(v => v !== '' && v !== false);

  return (
    <div className="min-h-screen" style={{ backgroundColor: COLORS.background }}>
      <Navbar />

      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse-ring {
          0% { box-shadow: 0 0 0 0 rgba(0, 102, 204, 0.4); }
          70% { box-shadow: 0 0 0 10px rgba(0, 102, 204, 0); }
          100% { box-shadow: 0 0 0 0 rgba(0, 102, 204, 0); }
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .card-anim { animation: fadeInUp 0.4s ease both; }
        .btn-collect:hover { transform: translateY(-2px); box-shadow: 0 8px 25px rgba(0,168,107,0.4) !important; }
        .btn-collect { transition: all 0.25s ease; }
        .tab-btn { position: relative; transition: all 0.25s ease; }
        .tab-btn::after {
          content: '';
          position: absolute;
          bottom: -1px;
          left: 50%;
          width: 0;
          height: 2px;
          background: #0066CC;
          transition: all 0.3s ease;
          transform: translateX(-50%);
        }
        .tab-btn.active::after { width: 100%; }
        .search-input:focus { box-shadow: 0 0 0 3px rgba(0,102,204,0.15); }
        .btn-search:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(0,102,204,0.35) !important; }
        .btn-search { transition: all 0.2s ease; }
        .stat-card { transition: all 0.25s ease; }
        .stat-card:hover { transform: translateY(-3px); }
        .loading-spinner { animation: spin-slow 1s linear infinite; }
      `}</style>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* ═══════════════ EN-TÊTE AMÉLIORÉ ═══════════════ */}
        <div className="mb-8 card-anim" style={{ animationDelay: '0ms' }}>
          <div className="rounded-2xl overflow-hidden shadow-lg" style={{
            background: 'linear-gradient(135deg, #0066CC 0%, #0052A3 50%, #003D7A 100%)',
          }}>
            {/* Cercles décoratifs en background */}
            <div style={{
              position: 'relative',
              overflow: 'hidden',
            }}>
              <div style={{
                position: 'absolute', top: '-40px', right: '-40px',
                width: '200px', height: '200px',
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.05)',
              }} />
              <div style={{
                position: 'absolute', bottom: '-20px', right: '80px',
                width: '100px', height: '100px',
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.07)',
              }} />

              <div className="p-6 flex justify-between items-center" style={{ position: 'relative', zIndex: 1 }}>
                <div className="flex items-center gap-5">
                  {/* Icône gradient */}
                  <div style={{
                    width: '64px', height: '64px',
                    borderRadius: '16px',
                    background: 'rgba(255,255,255,0.15)',
                    backdropFilter: 'blur(10px)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '30px',
                    border: '1px solid rgba(255,255,255,0.2)',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
                  }}>
                    🏥
                  </div>

                  <div>
                    <h1 style={{
                      fontSize: '1.875rem', fontWeight: '800',
                      color: 'white', margin: 0, letterSpacing: '-0.5px',
                    }}>
                      Données Sanitaires
                    </h1>
                    <p style={{ color: 'rgba(255,255,255,0.75)', margin: '4px 0 0 0', fontSize: '0.9rem' }}>
                      Collecte et analyse des données de santé publique
                    </p>
                    {/* Badge compteur */}
                    <div style={{
                      display: 'inline-flex', alignItems: 'center', gap: '6px',
                      marginTop: '8px',
                      background: 'rgba(255,255,255,0.15)',
                      backdropFilter: 'blur(5px)',
                      border: '1px solid rgba(255,255,255,0.25)',
                      borderRadius: '20px',
                      padding: '3px 12px',
                    }}>
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#4ADE80', display: 'inline-block' }} />
                      <span style={{ color: 'white', fontSize: '0.8rem', fontWeight: '600' }}>
                        {total} donnée{total > 1 ? 's' : ''} collectée{total > 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Bouton Collecter amélioré */}
                <button
                  onClick={() => setShowCollecteModal(true)}
                  className="btn-collect flex items-center gap-2 px-6 py-3 rounded-xl text-white font-bold shadow-lg"
                  style={{
                    background: 'linear-gradient(135deg, #00A86B, #008A57)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    fontSize: '0.95rem',
                    cursor: 'pointer',
                  }}
                >
                  <span style={{ fontSize: '1.1rem' }}>➕</span>
                  Collecter une donnée
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ═══════════════ ONGLETS AMÉLIORÉS ═══════════════ */}
        <div className="card-anim" style={{ animationDelay: '60ms' }}>
          <div className="bg-white rounded-2xl shadow-sm mb-6" style={{ border: '1px solid #E5EBF5' }}>
            <div className="border-b border-gray-100">
              <nav className="flex -mb-px px-2">
                {[
                  {
                    id: 'donnees',
                    label: 'Données collectées',
                    icon: '📋',
                    count: total,
                  },
                  {
                    id: 'statistiques',
                    label: 'Statistiques & Analyses',
                    icon: '📊',
                    count: null,
                  }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`tab-btn py-4 px-6 text-sm font-semibold flex items-center gap-2 ${activeTab === tab.id ? 'active' : ''}`}
                    style={{
                      color: activeTab === tab.id ? COLORS.primary : '#6B7280',
                      borderBottom: activeTab === tab.id ? `2px solid ${COLORS.primary}` : '2px solid transparent',
                      background: 'none',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <span style={{ fontSize: '1rem' }}>{tab.icon}</span>
                    {tab.label}
                    {tab.count !== null && (
                      <span style={{
                        background: activeTab === tab.id ? COLORS.primary : '#E5E7EB',
                        color: activeTab === tab.id ? 'white' : '#6B7280',
                        borderRadius: '999px',
                        padding: '1px 8px',
                        fontSize: '0.75rem',
                        fontWeight: '700',
                        transition: 'all 0.2s ease',
                      }}>
                        {tab.count}
                      </span>
                    )}
                  </button>
                ))}
              </nav>
            </div>
          </div>
        </div>

        {/* ═══════════════ RECHERCHE PAR CODE AMÉLIORÉE ═══════════════ */}
        <div className="card-anim" style={{ animationDelay: '120ms' }}>
          <div className="bg-white rounded-2xl shadow-sm p-6 mb-6" style={{ border: '1px solid #E5EBF5' }}>
            <p style={{ fontSize: '0.8rem', fontWeight: '700', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>
              🔎 Recherche rapide par code patient
            </p>
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <span style={{
                  position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)',
                  fontSize: '1.2rem', pointerEvents: 'none',
                }}>🔍</span>
                <input
                  type="text"
                  value={searchCode}
                  onChange={(e) => setSearchCode(e.target.value)}
                  placeholder="Rechercher un patient par code (Ex: PAT-ABC123)"
                  className="search-input w-full rounded-xl border-2 focus:outline-none"
                  style={{
                    paddingLeft: '48px', paddingRight: '16px',
                    paddingTop: '12px', paddingBottom: '12px',
                    borderColor: searchCode ? COLORS.primary : '#E5E7EB',
                    fontSize: '0.95rem',
                    transition: 'border-color 0.2s ease',
                    background: '#F9FAFB',
                  }}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearchCode()}
                />
                {searchCode && (
                  <button
                    onClick={() => { setSearchCode(''); fetchDonnees(); }}
                    style={{
                      position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                      background: '#E5E7EB', border: 'none', borderRadius: '999px',
                      width: '24px', height: '24px', cursor: 'pointer',
                      fontSize: '0.75rem', color: '#6B7280', fontWeight: '700',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}
                  >✕</button>
                )}
              </div>
              <button
                onClick={handleSearchCode}
                disabled={!searchCode.trim()}
                className="btn-search px-6 py-3 rounded-xl text-white font-bold"
                style={{
                  background: searchCode.trim()
                    ? 'linear-gradient(135deg, #0066CC, #0052A3)'
                    : '#CBD5E1',
                  border: 'none', cursor: searchCode.trim() ? 'pointer' : 'not-allowed',
                  fontSize: '0.9rem', whiteSpace: 'nowrap',
                }}
              >
                🔍 Rechercher
              </button>
            </div>
          </div>
        </div>

        {/* ═══════════════ CONTENU PAR ONGLET ═══════════════ */}
        {activeTab === 'donnees' ? (
          <>
            {/* FILTRES */}
            <div className="card-anim" style={{ animationDelay: '180ms' }}>
              <FiltreSanitaire
                filtres={filtres}
                onChange={handleFiltreChange}
                total={total}
              />
            </div>

            {/* Compteur résultats + réinitialiser */}
            {!loading && (
              <div className="flex items-center justify-between mb-4 px-1 card-anim" style={{ animationDelay: '220ms' }}>
                <p style={{ color: '#6B7280', fontSize: '0.9rem', fontWeight: '500' }}>
                  <span style={{ color: COLORS.primary, fontWeight: '700' }}>{total}</span> donnée{total > 1 ? 's' : ''} trouvée{total > 1 ? 's' : ''}
                </p>
                {hasFiltresActifs && (
                  <button
                    onClick={() => handleFiltreChange({
                      pathologie: '', ville: '', commune: '', gravite: '',
                      tranche_age: '', sexe: '', nom_patient: '', en_cours: false, graves: false,
                    })}
                    style={{
                      background: '#FEF2F2', color: '#DC143C', border: '1px solid #FCA5A5',
                      borderRadius: '999px', padding: '4px 14px',
                      fontSize: '0.8rem', fontWeight: '600', cursor: 'pointer',
                    }}
                  >
                    ✕ Réinitialiser les filtres
                  </button>
                )}
              </div>
            )}

            {/* LISTE DONNÉES */}
            {loading ? (
              <div className="text-center py-20">
                <div style={{
                  width: '64px', height: '64px', margin: '0 auto',
                  borderRadius: '50%',
                  border: '4px solid #E5EBF5',
                  borderTop: `4px solid ${COLORS.primary}`,
                  animation: 'spin-slow 0.9s linear infinite',
                }} className="loading-spinner" />
                <p style={{ color: '#9CA3AF', marginTop: '16px', fontWeight: '500' }}>
                  Chargement des données...
                </p>
              </div>
            ) : donnees.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-2xl shadow-sm card-anim" style={{ border: '1px solid #E5EBF5' }}>
                <div style={{
                  width: '80px', height: '80px', margin: '0 auto 16px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #E6F2FF, #CCE4FF)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '2.5rem',
                }}>
                  🏥
                </div>
                <p style={{ fontSize: '1.2rem', fontWeight: '700', color: '#374151', marginBottom: '8px' }}>
                  Aucune donnée trouvée
                </p>
                <p style={{ color: '#9CA3AF', marginBottom: '24px' }}>
                  {hasFiltresActifs ? 'Essayez de modifier vos filtres de recherche' : 'Soyez le premier à collecter une donnée !'}
                </p>
                <button
                  onClick={() => setShowCollecteModal(true)}
                  className="btn-collect px-6 py-3 rounded-xl text-white font-bold"
                  style={{
                    background: 'linear-gradient(135deg, #00A86B, #008A57)',
                    border: 'none', cursor: 'pointer',
                  }}
                >
                  ➕ Collecter une donnée
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {donnees.map((donnee, index) => (
                  <div key={donnee.id_donnee} className="card-anim" style={{ animationDelay: `${index * 60}ms` }}>
                    <DonneeCard
                      donnee={donnee}
                      currentUser={currentUser}
                      onDeleteSuccess={handleDeleteSuccess}
                    />
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          <StatistiquesPanel />
        )}
      </div>

      {/* MODAL COLLECTE */}
      {showCollecteModal && (
        <CollecteModal
          isOpen={showCollecteModal}
          onClose={() => setShowCollecteModal(false)}
          onSuccess={handleCollecteSuccess}
        />
      )}
    </div>
  );
}