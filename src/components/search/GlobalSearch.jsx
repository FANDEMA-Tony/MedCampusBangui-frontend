import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { searchService } from '../../services/api';

// ─── Palette couleurs ─────────────────────────────────────────
const COLORS = {
    primary: '#0066CC',
    secondary: '#00A86B',
    accent: '#DC143C',
    purple: '#8B5CF6',
    orange: '#F97316',
    gray50: '#F9FAFB',
    gray100: '#F3F4F6',
    gray200: '#E5E7EB',
    gray300: '#D1D5DB',
    gray600: '#4B5563',
    gray700: '#374151',
    gray800: '#1F2937',
    gray900: '#111827',
};

// ─── Config types résultats ───────────────────────────────────
const TYPE_CONFIG = {
    etudiant: { icon: '👨‍🎓', color: '#0066CC', bg: '#EFF6FF', label: 'Étudiant' },
    enseignant: { icon: '👨‍🏫', color: '#00A86B', bg: '#F0FDF4', label: 'Enseignant' },
    cours: { icon: '📚', color: '#8B5CF6', bg: '#F5F3FF', label: 'Cours' },
    note: { icon: '📝', color: '#F97316', bg: '#FFF7ED', label: 'Note' },
};

// ─── Filtres disponibles ──────────────────────────────────────
const FILTRES = [
    { value: 'tous', label: 'Tout', icon: '🔍' },
    { value: 'etudiants', label: 'Étudiants', icon: '👨‍🎓' },
    { value: 'enseignants', label: 'Enseignants', icon: '👨‍🏫' },
    { value: 'cours', label: 'Cours', icon: '📚' },
    { value: 'notes', label: 'Notes', icon: '📝' },
];

// ─── Hook debounce ────────────────────────────────────────────
function useDebounce(value, delay) {
    const [debouncedValue, setDebouncedValue] = useState(value);
    useEffect(() => {
        const timer = setTimeout(() => setDebouncedValue(value), delay);
        return () => clearTimeout(timer);
    }, [value, delay]);
    return debouncedValue;
}

export default function GlobalSearch({ placeholder = 'Rechercher...', className = '' }) {
    const navigate = useNavigate();
    const inputRef = useRef(null);
    const dropdownRef = useRef(null);

    const [query, setQuery] = useState('');
    const [filtre, setFiltre] = useState('tous');
    const [results, setResults] = useState(null);
    const [loading, setLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [highlighted, setHighlighted] = useState(-1);

    const debouncedQuery = useDebounce(query, 350);

    // ─── Lancer la recherche automatiquement ─────────────────────
    useEffect(() => {
        if (debouncedQuery.length >= 2) {
            doSearch(debouncedQuery, filtre);
        } else {
            setResults(null);
            setIsOpen(false);
        }
    }, [debouncedQuery, filtre]);

    // ─── Fermer dropdown si clic extérieur ───────────────────────
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (
                dropdownRef.current && !dropdownRef.current.contains(e.target) &&
                inputRef.current && !inputRef.current.contains(e.target)
            ) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // ─── Recherche API ────────────────────────────────────────────
    const doSearch = useCallback(async (q, type) => {
        try {
            setLoading(true);
            const res = await searchService.search(q, type);
            setResults(res.data.data || null);
            setIsOpen(true);
            setHighlighted(-1);
        } catch (err) {
            console.error('Erreur recherche:', err);
            setResults(null);
        } finally {
            setLoading(false);
        }
    }, []);

    // ─── Tous les résultats à plat pour la navigation clavier ────
    const allResults = results
        ? [
            ...(results.etudiants || []),
            ...(results.enseignants || []),
            ...(results.cours || []),
            ...(results.notes || []),
        ]
        : [];

    // ─── Navigation clavier ───────────────────────────────────────
    const handleKeyDown = (e) => {
        if (!isOpen) return;

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setHighlighted(h => Math.min(h + 1, allResults.length - 1));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setHighlighted(h => Math.max(h - 1, 0));
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (highlighted >= 0 && allResults[highlighted]) {
                handleSelectResult(allResults[highlighted]);
            } else if (query.length >= 2) {
                // ✅ Aller sur la page résultats complète
                setIsOpen(false);
                navigate(`/search?q=${encodeURIComponent(query)}&type=${filtre}`);
            }
        } else if (e.key === 'Escape') {
            setIsOpen(false);
            inputRef.current?.blur();
        }
    };

    // ─── Sélection d'un résultat ──────────────────────────────────
    const handleSelectResult = (result) => {
        setIsOpen(false);
        setQuery('');
        // Navigation selon le type
        switch (result.type) {
            case 'etudiant':
                navigate(`/etudiant/${result.id}`);
                break;
            case 'enseignant':
                navigate(`/enseignant/${result.id}`);
                break;
            case 'cours':
                navigate(`/cours/${result.id}`);
                break;
            default:
                break;
        }
    };

    // ─── Effacer la recherche ─────────────────────────────────────
    const handleClear = () => {
        setQuery('');
        setResults(null);
        setIsOpen(false);
        inputRef.current?.focus();
    };

    // ─── Rendu d'un groupe de résultats ──────────────────────────
    const renderGroup = (items, typeKey, globalIndex) => {
        if (!items || items.length === 0) return null;
        const cfg = TYPE_CONFIG[typeKey] || TYPE_CONFIG.cours;

        return (
            <div key={typeKey}>
                {/* Header groupe */}
                <div className="px-4 py-2 flex items-center gap-2"
                    style={{ backgroundColor: COLORS.gray50, borderTop: `1px solid ${COLORS.gray100}` }}>
                    <span className="text-sm">{cfg.icon}</span>
                    <span className="text-xs font-bold uppercase tracking-wide" style={{ color: COLORS.gray600 }}>
                        {cfg.label}s
                    </span>
                    <span className="ml-auto text-xs px-2 py-0.5 rounded-full font-medium"
                        style={{ backgroundColor: cfg.bg, color: cfg.color }}>
                        {items.length}
                    </span>
                </div>

                {/* Items */}
                {items.map((item, idx) => {
                    const itemIndex = globalIndex + idx;
                    const isHighlighted = highlighted === itemIndex;

                    return (
                        <div
                            key={item.id}
                            onMouseDown={() => handleSelectResult(item)}
                            onMouseEnter={() => setHighlighted(itemIndex)}
                            className="px-4 py-3 flex items-start gap-3 cursor-pointer transition-all"
                            style={{
                                backgroundColor: isHighlighted ? cfg.bg : 'white',
                                borderLeft: isHighlighted ? `3px solid ${cfg.color}` : '3px solid transparent',
                            }}
                        >
                            {/* Icône */}
                            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                                style={{ backgroundColor: cfg.bg }}>
                                {cfg.icon}
                            </div>

                            {/* Infos */}
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold truncate" style={{ color: COLORS.gray900 }}>
                                    {item.titre}
                                </p>
                                <p className="text-xs truncate mt-0.5" style={{ color: COLORS.gray600 }}>
                                    {item.sous_titre}
                                </p>
                                {item.detail && (
                                    <p className="text-xs truncate mt-0.5" style={{ color: COLORS.gray600 }}>
                                        {item.detail}
                                    </p>
                                )}
                            </div>

                            {/* Badge type */}
                            <span className="text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0"
                                style={{ backgroundColor: cfg.bg, color: cfg.color }}>
                                {cfg.label}
                            </span>
                        </div>
                    );
                })}
            </div>
        );
    };

    // ─── Calcul index global pour navigation clavier ─────────────
    let globalIdx = 0;
    const etudiants = results?.etudiants || [];
    const enseignants = results?.enseignants || [];
    const cours = results?.cours || [];
    const notes = results?.notes || [];

    const idxEtudiants = globalIdx; globalIdx += etudiants.length;
    const idxEnseignants = globalIdx; globalIdx += enseignants.length;
    const idxCours = globalIdx; globalIdx += cours.length;
    const idxNotes = globalIdx;

    return (
        <div className={`relative ${className}`}>

            {/* ── BARRE DE RECHERCHE ─────────────────────────────── */}
            <div className="flex items-center gap-2">

                {/* Input */}
                <div className="relative flex-1">
                    <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                        {loading
                            ? <div className="w-4 h-4 rounded-full border-2 border-t-transparent animate-spin"
                                style={{ borderColor: COLORS.primary, borderTopColor: 'transparent' }} />
                            : <span className="text-gray-400 text-sm">🔍</span>
                        }
                    </div>

                    <input
                        ref={inputRef}
                        type="text"
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                        onFocus={() => results && setIsOpen(true)}
                        onKeyDown={handleKeyDown}
                        placeholder={placeholder}
                        className="w-full pl-10 pr-10 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 transition-all"
                        style={{
                            borderColor: isOpen ? COLORS.primary : COLORS.gray300,
                            focusRingColor: COLORS.primary,
                            backgroundColor: 'white',
                        }}
                    />

                    {/* Bouton effacer */}
                    {query && (
                        <button
                            onMouseDown={handleClear}
                            className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600"
                        >
                            ✕
                        </button>
                    )}
                </div>
            </div>

            {/* ── DROPDOWN RÉSULTATS ─────────────────────────────── */}
            {isOpen && (
                <div
                    ref={dropdownRef}
                    className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl overflow-hidden z-50"
                    style={{ border: `1px solid ${COLORS.gray200}`, maxHeight: '480px', overflowY: 'auto' }}
                >
                    {/* Header dropdown */}
                    <div className="px-4 py-3 flex items-center justify-between"
                        style={{ borderBottom: `1px solid ${COLORS.gray100}` }}>
                        <p className="text-xs font-semibold" style={{ color: COLORS.gray600 }}>
                            {results?.total > 0
                                ? `${results.total} résultat${results.total > 1 ? 's' : ''} pour "${query}"`
                                : `Aucun résultat pour "${query}"`
                            }
                        </p>
                        {/* Filtres */}
                        <div className="flex items-center gap-1">
                            {FILTRES.map(f => (
                                <button
                                    key={f.value}
                                    onMouseDown={() => setFiltre(f.value)}
                                    className="px-2.5 py-1 rounded-lg text-xs font-medium transition-all"
                                    style={{
                                        backgroundColor: filtre === f.value ? COLORS.primary : COLORS.gray100,
                                        color: filtre === f.value ? 'white' : COLORS.gray600,
                                    }}
                                >
                                    {f.icon} {f.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Aucun résultat */}
                    {results?.total === 0 && (
                        <div className="text-center py-12">
                            <span className="text-5xl">🔍</span>
                            <p className="mt-3 font-medium" style={{ color: COLORS.gray700 }}>
                                Aucun résultat trouvé
                            </p>
                            <p className="text-sm mt-1" style={{ color: COLORS.gray600 }}>
                                Essayez avec d'autres mots-clés
                            </p>
                        </div>
                    )}

                    {/* Groupes de résultats */}
                    {results && results.total > 0 && (
                        <>
                            {renderGroup(etudiants, 'etudiant', idxEtudiants)}
                            {renderGroup(enseignants, 'enseignant', idxEnseignants)}
                            {renderGroup(cours, 'cours', idxCours)}
                            {renderGroup(notes, 'note', idxNotes)}
                        </>
                    )}

                    {/* Footer */}
                    {results?.total > 0 && (
                        <div className="px-4 py-2 text-center"
                            style={{ borderTop: `1px solid ${COLORS.gray100}`, backgroundColor: COLORS.gray50 }}>
                            <p className="text-xs" style={{ color: COLORS.gray600 }}>
                                ↑↓ Naviguer • Entrée Sélectionner • Échap Fermer
                            </p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}