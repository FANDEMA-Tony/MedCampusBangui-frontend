/**
 * ============================================================
 * ExportButton.jsx — Bouton Export Réutilisable MedCampus
 * ============================================================
 * Props :
 *   onClick  : async function → appelée au clic
 *   label    : string  → texte affiché
 *   icon     : string  → emoji ou icône
 *   variant  : 'pdf' | 'excel' | 'primary' | 'secondary'
 *   size     : 'sm' | 'md' | 'lg'
 *   disabled : bool
 *   className: string supplémentaire
 * ============================================================
 */
import { useState } from 'react';

const VARIANT_STYLES = {
  pdf: {
    base:    { backgroundColor: '#DC143C', color: 'white', border: 'none' },
    hover:   { backgroundColor: '#B01030' },
    loading: { backgroundColor: '#E85070' },
    success: { backgroundColor: '#00A86B' },
    error:   { backgroundColor: '#DC143C' },
  },
  excel: {
    base:    { backgroundColor: '#00A86B', color: 'white', border: 'none' },
    hover:   { backgroundColor: '#008055' },
    loading: { backgroundColor: '#40C88D' },
    success: { backgroundColor: '#00A86B' },
    error:   { backgroundColor: '#DC143C' },
  },
  primary: {
    base:    { backgroundColor: '#0066CC', color: 'white', border: 'none' },
    hover:   { backgroundColor: '#0052A3' },
    loading: { backgroundColor: '#4090DD' },
    success: { backgroundColor: '#00A86B' },
    error:   { backgroundColor: '#DC143C' },
  },
  secondary: {
    base:    { backgroundColor: '#EFF6FF', color: '#0066CC', border: '1.5px solid #BFDBFE' },
    hover:   { backgroundColor: '#DBEAFE' },
    loading: { backgroundColor: '#EFF6FF' },
    success: { backgroundColor: '#F0FDF4', color: '#00A86B', border: '1.5px solid #BBF7D0' },
    error:   { backgroundColor: '#FEE2E2', color: '#DC143C', border: '1.5px solid #FCA5A5' },
  },
};

const SIZE_STYLES = {
  sm: { padding: '5px 12px', fontSize: '0.78rem', borderRadius: '8px', gap: '5px' },
  md: { padding: '8px 16px', fontSize: '0.85rem', borderRadius: '10px', gap: '6px' },
  lg: { padding: '11px 22px', fontSize: '0.95rem', borderRadius: '12px', gap: '8px' },
};

// Icônes par défaut selon variant
const DEFAULT_ICONS = {
  pdf:       '📄',
  excel:     '📊',
  primary:   '⬇️',
  secondary: '⬇️',
};

// Labels states
const STATE_ICONS = {
  loading: '⏳',
  success: '✅',
  error:   '❌',
};

export default function ExportButton({
  onClick,
  label     = 'Exporter',
  icon,
  variant   = 'primary',
  size      = 'md',
  disabled  = false,
  className = '',
  tooltip   = '',
}) {
  const [state, setState] = useState('idle'); // 'idle' | 'loading' | 'success' | 'error'
  const [isHovered, setIsHovered] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const variantStyle = VARIANT_STYLES[variant] || VARIANT_STYLES.primary;
  const sizeStyle    = SIZE_STYLES[size]        || SIZE_STYLES.md;

  const isLoading = state === 'loading';
  const isSuccess = state === 'success';
  const isError   = state === 'error';

  // Couleur de fond selon état
  let bgStyle = variantStyle.base;
  if (isLoading) bgStyle = { ...variantStyle.base, ...variantStyle.loading };
  if (isSuccess) bgStyle = { ...variantStyle.base, ...variantStyle.success };
  if (isError)   bgStyle = { ...variantStyle.base, ...variantStyle.error };
  if (isHovered && !isLoading) bgStyle = { ...bgStyle, ...variantStyle.hover };

  const handleClick = async () => {
    if (isLoading || disabled || !onClick) return;

    setState('loading');
    setErrorMsg('');

    try {
      await onClick();
      setState('success');
      // Retour à idle après 2 secondes
      setTimeout(() => setState('idle'), 2000);
    } catch (err) {
      console.error('ExportButton error:', err);
      setErrorMsg(err?.message || 'Erreur lors de l\'export');
      setState('error');
      setTimeout(() => setState('idle'), 3000);
    }
  };

  // Icône affichée
  const displayIcon = isLoading
    ? STATE_ICONS.loading
    : isSuccess
      ? STATE_ICONS.success
      : isError
        ? STATE_ICONS.error
        : (icon || DEFAULT_ICONS[variant] || '⬇️');

  // Label affiché
  const displayLabel = isLoading
    ? 'Export en cours...'
    : isSuccess
      ? 'Téléchargé !'
      : isError
        ? (errorMsg || 'Erreur')
        : label;

  return (
    <div style={{ display: 'inline-block', position: 'relative' }}>
      <button
        onClick={handleClick}
        disabled={disabled || isLoading}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        title={tooltip || label}
        className={className}
        style={{
          display:      'inline-flex',
          alignItems:   'center',
          justifyContent: 'center',
          cursor:        disabled || isLoading ? 'not-allowed' : 'pointer',
          fontWeight:    '700',
          fontFamily:    'inherit',
          transition:    'all 0.2s ease',
          outline:       'none',
          opacity:       disabled ? 0.55 : 1,
          whiteSpace:    'nowrap',
          boxShadow:     isHovered && !isLoading
            ? '0 4px 12px rgba(0,0,0,0.15)'
            : '0 2px 6px rgba(0,0,0,0.08)',
          transform:     isHovered && !isLoading ? 'translateY(-1px)' : 'none',
          ...bgStyle,
          ...sizeStyle,
        }}
      >
        {/* Spinner si loading */}
        {isLoading ? (
          <span
            style={{
              display:     'inline-block',
              width:        '14px',
              height:       '14px',
              border:       '2px solid rgba(255,255,255,0.3)',
              borderTop:    '2px solid white',
              borderRadius: '50%',
              animation:    'exportSpin 0.7s linear infinite',
              marginRight:  sizeStyle.gap,
            }}
          />
        ) : (
          <span style={{ fontSize: size === 'sm' ? '0.85rem' : '1rem', lineHeight: 1 }}>
            {displayIcon}
          </span>
        )}
        <span>{displayLabel}</span>
      </button>

      {/* Keyframe animation inlined */}
      <style>{`
        @keyframes exportSpin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}


// ─────────────────────────────────────────────────────────────
// GROUPE DE BOUTONS D'EXPORT (composant pratique)
// ─────────────────────────────────────────────────────────────
/**
 * ExportButtonGroup — Affiche PDF + Excel côte à côte
 * Props :
 *   onPDF    : async function
 *   onExcel  : async function
 *   labelPDF   : string
 *   labelExcel : string
 *   size     : 'sm' | 'md' | 'lg'
 *   disabled : bool
 */
export function ExportButtonGroup({
  onPDF,
  onExcel,
  labelPDF   = 'PDF',
  labelExcel = 'Excel',
  size       = 'sm',
  disabled   = false,
}) {
  return (
    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
      {onPDF && (
        <ExportButton
          onClick={onPDF}
          label={labelPDF}
          icon="📄"
          variant="pdf"
          size={size}
          disabled={disabled}
          tooltip={`Télécharger ${labelPDF} en PDF`}
        />
      )}
      {onExcel && (
        <ExportButton
          onClick={onExcel}
          label={labelExcel}
          icon="📊"
          variant="excel"
          size={size}
          disabled={disabled}
          tooltip={`Télécharger ${labelExcel} en Excel`}
        />
      )}
    </div>
  );
}