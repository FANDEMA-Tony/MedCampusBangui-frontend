import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { searchService } from '../../services/api';
import GlobalSearch from './GlobalSearch';

// ─── Palette couleurs ─────────────────────────────────────────
const COLORS = {
  primary:   '#0066CC',
  secondary: '#00A86B',
  accent:    '#DC143C',
  purple:    '#8B5CF6',
  orange:    '#F97316',
  gray50:    '#F9FAFB',
  gray100:   '#F3F4F6',
  gray200:   '#E5E7EB',
  gray300:   '#D1D5DB',
  gray600:   '#4B5563',
  gray700:   '#374151',
  gray800:   '#1F2937',
  gray900:   '#111827',
};

// ─── Config types ─────────────────────────────────────────────
const TYPE_CONFIG = {
  etudiant:   { icon: '👨‍🎓', color: '#0066CC', bg: '#EFF6FF', label: 'Étudiant'   },
  enseignant: { icon: '👨‍🏫', color: '#00A86B', bg: '#F0FDF4', label: 'Enseignant' },
  cours:      { icon: '📚',  color: '#8B5CF6', bg: '#F5F3FF', label: 'Cours'      },
  note:       { icon: '📝',  color: '#F97316', bg: '#FFF7ED', label: 'Note'       },
};

// ─── Filtres ──────────────────────────────────────────────────
const FILTRES = [
  { value: 'tous',        label: 'Tout',        icon: '🔍' },
  { value: 'etudiants',   label: 'Étudiants',   icon: '👨‍🎓' },
  { value: 'enseignants', label: 'Enseignants', icon: '👨‍🏫' },
  { value: 'cours',       label: 'Cours',       icon: '📚' },
  { value: 'notes',       label: 'Notes',       icon: '📝' },
];

// ─── Carte résultat ───────────────────────────────────────────
function ResultCard({ item, onSelect }) {
  const cfg = TYPE_CONFIG[item.type] || TYPE_CONFIG.cours;

  return (
    <div
      onClick={() => onSelect(item)}
      className="bg-white rounded-2xl p-5 cursor-pointer hover:shadow-md transition-all group"
      style={{ border: `1px solid ${COLORS.gray200}` }}
    >
      <div className="flex items-start gap-4">
        {/* Icône */}
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 group-hover:scale-110 transition-transform"
          style={{ backgroundColor: cfg.bg }}
        >
          {cfg.icon}
        </div>

        {/* Contenu */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <p className="font-bold text-base truncate" style={{ color: COLORS.gray900 }}>
              {item.titre}
            </p>
            <span
              className="text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0"
              style={{ backgroundColor: cfg.bg, color: cfg.color }}
            >
              {cfg.label}
            </span>
          </div>
          <p className="text-sm truncate" style={{ color: COLORS.gray600 }}>
            {item.sous_titre}
          </p>
          {item.detail && (
            <p className="text-xs mt-1 truncate" style={{ color: COLORS.gray600 }}>
              {item.detail}
            </p>
          )}
        </div>

        {/* Flèche */}
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ backgroundColor: cfg.bg, color: cfg.color }}
        >
          →
        </div>
      </div>
    </div>
  );
}

// ─── Composant principal ──────────────────────────────────────
export default function SearchResults() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const queryParam  = searchParams.get('q')    || '';
  const typeParam   = searchParams.get('type') || 'tous';

  const [results,  setResults]  = useState(null);
  const [loading,  setLoading]  = useState(false);
  const [filtre,   setFiltre]   = useState(typeParam);

  // ─── Lancer recherche quand query/filtre change ───────────
  useEffect(() => {
    if (queryParam.length >= 2) {
      fetchResults(queryParam, filtre);
    } else {
      setResults(null);
    }
  }, [queryParam, filtre]);

  const fetchResults = async (q, type) => {
    try {
      setLoading(true);
      const res = await searchService.search(q, type);
      setResults(res.data.data || null);
    } catch (err) {
      console.error('Erreur recherche:', err);
    } finally {
      setLoading(false);
    }
  };

  // ─── Changer filtre → mettre à jour URL ──────────────────
  const handleFiltreChange = (newFiltre) => {
    setFiltre(newFiltre);
    setSearchParams({ q: queryParam, type: newFiltre });
  };

  // ─── Navigation vers la fiche ─────────────────────────────
  const handleSelect = (item) => {
    switch (item.type) {
      case 'etudiant':   navigate(`/etudiant/${item.id}`);   break;
      case 'enseignant': navigate(`/enseignant/${item.id}`); break;
      case 'cours':      navigate(`/cours/${item.id}`);      break;
      default: break;
    }
  };

  // ─── Données groupées ─────────────────────────────────────
  const etudiants   = results?.etudiants   || [];
  const enseignants = results?.enseignants || [];
  const cours       = results?.cours       || [];
  const notes       = results?.notes       || [];
  const total       = results?.total       || 0;

  return (
    <div className="min-h-screen" style={{ backgroundColor: COLORS.gray50 }}>

      {/* ── EN-TÊTE ───────────────────────────────────────── */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">

            {/* Bouton retour */}
            <button
              onClick={() => navigate(-1)}
              className="w-10 h-10 rounded-xl flex items-center justify-center hover:opacity-80 transition-all flex-shrink-0"
              style={{ backgroundColor: COLORS.gray100, color: COLORS.gray700 }}
            >
              ←
            </button>

            {/* Barre de recherche réutilisée */}
            <div className="flex-1">
              <GlobalSearch
                placeholder="Rechercher..."
                defaultQuery={queryParam}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">

        {/* ── RÉSUMÉ + FILTRES ──────────────────────────── */}
        <div className="flex items-center justify-between flex-wrap gap-4 mb-6">

          {/* Résumé */}
          <div>
            {queryParam && (
              <h1 className="text-xl font-bold" style={{ color: COLORS.gray900 }}>
                {loading
                  ? 'Recherche en cours...'
                  : total > 0
                    ? `${total} résultat${total > 1 ? 's' : ''} pour "${queryParam}"`
                    : `Aucun résultat pour "${queryParam}"`
                }
              </h1>
            )}
          </div>

          {/* Filtres */}
          <div className="flex items-center gap-2 flex-wrap">
            {FILTRES.map(f => (
              <button
                key={f.value}
                onClick={() => handleFiltreChange(f.value)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all hover:opacity-80"
                style={{
                  backgroundColor: filtre === f.value ? COLORS.primary : 'white',
                  color:           filtre === f.value ? 'white' : COLORS.gray600,
                  border:          `1px solid ${filtre === f.value ? COLORS.primary : COLORS.gray200}`,
                }}
              >
                <span>{f.icon}</span>
                {f.label}
                {/* Compteur par filtre */}
                {results && f.value !== 'tous' && (() => {
                  const map = {
                    etudiants:   etudiants.length,
                    enseignants: enseignants.length,
                    cours:       cours.length,
                    notes:       notes.length,
                  };
                  const count = map[f.value] || 0;
                  return count > 0 ? (
                    <span
                      className="ml-1 px-1.5 py-0.5 rounded-full text-xs font-bold"
                      style={{
                        backgroundColor: filtre === f.value ? 'rgba(255,255,255,0.3)' : COLORS.gray100,
                        color:           filtre === f.value ? 'white' : COLORS.gray600,
                      }}
                    >
                      {count}
                    </span>
                  ) : null;
                })()}
              </button>
            ))}
          </div>
        </div>

        {/* ── ÉTAT CHARGEMENT ───────────────────────────── */}
        {loading && (
          <div className="text-center py-20">
            <div
              className="inline-block w-12 h-12 rounded-full border-4 border-t-transparent animate-spin"
              style={{ borderColor: COLORS.primary, borderTopColor: 'transparent' }}
            />
            <p className="mt-4 font-medium" style={{ color: COLORS.gray600 }}>
              Recherche en cours...
            </p>
          </div>
        )}

        {/* ── AUCUN RÉSULTAT ────────────────────────────── */}
        {!loading && results && total === 0 && (
          <div className="text-center py-20">
            <span className="text-6xl">🔍</span>
            <h2 className="mt-4 text-xl font-bold" style={{ color: COLORS.gray800 }}>
              Aucun résultat trouvé
            </h2>
            <p className="mt-2 text-sm" style={{ color: COLORS.gray600 }}>
              Essayez avec d'autres mots-clés ou changez le filtre
            </p>
          </div>
        )}

        {/* ── RÉSULTATS ─────────────────────────────────── */}
        {!loading && results && total > 0 && (
          <div className="space-y-8">

            {/* Étudiants */}
            {etudiants.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-xl">👨‍🎓</span>
                  <h2 className="font-bold text-lg" style={{ color: COLORS.gray900 }}>
                    Étudiants
                  </h2>
                  <span
                    className="px-2.5 py-0.5 rounded-full text-sm font-bold"
                    style={{ backgroundColor: '#EFF6FF', color: COLORS.primary }}
                  >
                    {etudiants.length}
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {etudiants.map(item => (
                    <ResultCard key={item.id} item={item} onSelect={handleSelect} />
                  ))}
                </div>
              </section>
            )}

            {/* Enseignants */}
            {enseignants.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-xl">👨‍🏫</span>
                  <h2 className="font-bold text-lg" style={{ color: COLORS.gray900 }}>
                    Enseignants
                  </h2>
                  <span
                    className="px-2.5 py-0.5 rounded-full text-sm font-bold"
                    style={{ backgroundColor: '#F0FDF4', color: COLORS.secondary }}
                  >
                    {enseignants.length}
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {enseignants.map(item => (
                    <ResultCard key={item.id} item={item} onSelect={handleSelect} />
                  ))}
                </div>
              </section>
            )}

            {/* Cours */}
            {cours.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-xl">📚</span>
                  <h2 className="font-bold text-lg" style={{ color: COLORS.gray900 }}>
                    Cours
                  </h2>
                  <span
                    className="px-2.5 py-0.5 rounded-full text-sm font-bold"
                    style={{ backgroundColor: '#F5F3FF', color: COLORS.purple }}
                  >
                    {cours.length}
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {cours.map(item => (
                    <ResultCard key={item.id} item={item} onSelect={handleSelect} />
                  ))}
                </div>
              </section>
            )}

            {/* Notes */}
            {notes.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-xl">📝</span>
                  <h2 className="font-bold text-lg" style={{ color: COLORS.gray900 }}>
                    Notes
                  </h2>
                  <span
                    className="px-2.5 py-0.5 rounded-full text-sm font-bold"
                    style={{ backgroundColor: '#FFF7ED', color: COLORS.orange }}
                  >
                    {notes.length}
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {notes.map(item => (
                    <ResultCard key={item.id} item={item} onSelect={handleSelect} />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}

        {/* ── ÉTAT INITIAL — pas encore de recherche ────── */}
        {!loading && !results && !queryParam && (
          <div className="text-center py-20">
            <span className="text-6xl">🔍</span>
            <h2 className="mt-4 text-xl font-bold" style={{ color: COLORS.gray800 }}>
              Lancez une recherche
            </h2>
            <p className="mt-2 text-sm" style={{ color: COLORS.gray600 }}>
              Recherchez des étudiants, enseignants, cours ou notes
            </p>
          </div>
        )}
      </div>
    </div>
  );
}