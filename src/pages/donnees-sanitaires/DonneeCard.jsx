import { useState } from 'react';
import { donneeSanitaireService } from '../../services/api';
import EditDonneeModal from './EditDonneeModal';

const GRAVITE_CONFIG = {
  leger: { icon: '🟢', color: '#00A86B', bg: '#E6F7F0', borderColor: '#00A86B', label: 'Léger', gradient: 'linear-gradient(135deg, #E6F7F0, #CCF0E0)' },
  modere: { icon: '🟡', color: '#D97706', bg: '#FFF7ED', borderColor: '#FF6B35', label: 'Modéré', gradient: 'linear-gradient(135deg, #FFF7ED, #FFE8D0)' },
  grave: { icon: '🟠', color: '#DC143C', bg: '#FFE6EC', borderColor: '#DC143C', label: 'Grave', gradient: 'linear-gradient(135deg, #FFE6EC, #FFD0DB)' },
  critique: { icon: '🔴', color: '#991B1B', bg: '#FEE2E2', borderColor: '#991B1B', label: 'Critique', gradient: 'linear-gradient(135deg, #FEE2E2, #FECACA)' },
};

const STATUT_CONFIG = {
  en_cours: { icon: '⏳', color: '#0066CC', bg: '#EBF5FF', label: 'En cours' },
  guerison: { icon: '✅', color: '#00A86B', bg: '#E6F7F0', label: 'Guérison' },
  decede: { icon: '💀', color: '#991B1B', bg: '#FEE2E2', label: 'Décédé' },
  suivi_perdu: { icon: '❓', color: '#6B7280', bg: '#F3F4F6', label: 'Suivi perdu' },
};

// Avatar couleurs pour collecteur
const AVATAR_COLORS = [
  '#0066CC', '#00A86B', '#DC143C', '#7C3AED',
  '#D97706', '#0891B2', '#059669', '#DB2777',
  '#9333EA', '#EA580C',
];

function getAvatarColor(name = '') {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash += name.charCodeAt(i);
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
}

function getInitials(prenom = '', nom = '') {
  return `${prenom.charAt(0)}${nom.charAt(0)}`.toUpperCase() || '?';
}

export default function DonneeCard({ donnee, currentUser, onDeleteSuccess, onUpdateSuccess = onDeleteSuccess }) {
  const [expanded, setExpanded] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [hovered, setHovered] = useState(false);

  const graviteConfig = GRAVITE_CONFIG[donnee.gravite] || GRAVITE_CONFIG.modere;
  const statutConfig = STATUT_CONFIG[donnee.statut] || STATUT_CONFIG.en_cours;

  // ✅ CORRECTION : user.id au lieu de user.id_utilisateur
  const canEdit = currentUser?.role === 'admin' || donnee.collecte_par === currentUser?.id;
  const canDelete = currentUser?.role === 'admin' || donnee.collecte_par === currentUser?.id;

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  const handleDelete = async () => {
    if (!window.confirm('Supprimer définitivement cette donnée ?')) return;
    try {
      setDeleting(true);
      await donneeSanitaireService.delete(donnee.id_donnee);
      alert('✅ Donnée supprimée !');
      onDeleteSuccess();
    } catch (err) {
      alert(err.response?.data?.message || '❌ Erreur lors de la suppression');
      setDeleting(false);
    }
  };

  const handleEditSuccess = () => {
    setShowEditModal(false);
    onUpdateSuccess();
  };

  const collecteurPrenom = donnee.collecteur?.prenom || '';
  const collecteurNom = donnee.collecteur?.nom || '';
  const avatarColor = getAvatarColor(collecteurPrenom + collecteurNom);
  const initiales = getInitials(collecteurPrenom, collecteurNom);

  return (
    <>
      <style>{`
        .donnee-card {
          transition: transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease;
        }
        .donnee-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 20px 40px rgba(0,0,0,0.12) !important;
          border-color: #93C5FD !important;
        }
        .btn-details {
          transition: all 0.2s ease;
        }
        .btn-details:hover {
          background: #EBF5FF !important;
          transform: scale(1.02);
        }
        .btn-modifier:hover {
          opacity: 0.88;
          transform: translateY(-1px);
          box-shadow: 0 4px 15px rgba(0,102,204,0.35);
        }
        .btn-supprimer:hover {
          opacity: 0.88;
          transform: translateY(-1px);
          box-shadow: 0 4px 15px rgba(220,20,60,0.35);
        }
        .btn-modifier, .btn-supprimer { transition: all 0.2s ease; }
        .info-chip { transition: all 0.2s ease; }
        .info-chip:hover { transform: scale(1.05); }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .details-panel { animation: slideDown 0.25s ease; }
      `}</style>

      <div
        className="donnee-card bg-white rounded-2xl overflow-hidden"
        style={{
          border: '1.5px solid #E5EBF5',
          boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >

        {/* ═══════════ HEADER COLORÉ PAR GRAVITÉ ═══════════ */}
        <div style={{
          borderLeft: `4px solid ${graviteConfig.borderColor}`,
          background: graviteConfig.gradient,
          padding: '16px',
          position: 'relative',
          overflow: 'hidden',
        }}>
          {/* Cercle déco background */}
          <div style={{
            position: 'absolute', top: '-20px', right: '-20px',
            width: '80px', height: '80px', borderRadius: '50%',
            background: `${graviteConfig.color}10`,
            pointerEvents: 'none',
          }} />

          <div className="flex justify-between items-start">
            <div className="flex-1">
              {/* NOM PATIENT (si non anonyme) */}
              {!donnee.est_anonyme && (donnee.nom_patient || donnee.prenom_patient) && (
                <div style={{ marginBottom: '8px' }}>
                  <h2 style={{
                    fontWeight: '800', color: '#111827', fontSize: '1.1rem',
                    margin: '0 0 2px 0', display: 'flex', alignItems: 'center', gap: '6px',
                  }}>
                    👤 {donnee.prenom_patient || ''} {donnee.nom_patient || ''}
                  </h2>
                  {donnee.telephone_patient && (
                    <p style={{ fontSize: '0.8rem', color: '#6B7280', margin: 0 }}>
                      📞 {donnee.telephone_patient}
                    </p>
                  )}
                </div>
              )}

              {/* PATHOLOGIE */}
              <h3 style={{
                fontWeight: '800', color: '#111827', fontSize: '1.05rem',
                margin: '0 0 8px 0',
              }}>
                {donnee.pathologie}
              </h3>

              {/* CODE PATIENT */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <span style={{
                  fontFamily: 'monospace', fontSize: '0.75rem', fontWeight: '700',
                  padding: '3px 10px', borderRadius: '6px',
                  background: 'rgba(0,102,204,0.1)', color: '#0066CC',
                  border: '1px solid rgba(0,102,204,0.2)',
                }}>
                  🔑 {donnee.code_patient}
                </span>
                {donnee.est_anonyme && (
                  <span style={{
                    fontSize: '0.7rem', padding: '3px 10px', borderRadius: '6px',
                    background: 'rgba(107,114,128,0.1)', color: '#6B7280',
                    border: '1px solid rgba(107,114,128,0.2)',
                  }}>
                    🔒 Anonyme
                  </span>
                )}
              </div>
            </div>

            {/* BADGE GRAVITÉ */}
            <span style={{
              fontSize: '0.72rem', fontWeight: '800',
              padding: '5px 12px', borderRadius: '999px',
              background: graviteConfig.bg,
              color: graviteConfig.color,
              border: `1px solid ${graviteConfig.color}30`,
              boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
              whiteSpace: 'nowrap', flexShrink: 0, marginLeft: '8px',
            }}>
              {graviteConfig.icon} {graviteConfig.label}
            </span>
          </div>

          {/* CHIPS INFOS RAPIDES */}
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '12px' }}>
            {donnee.sexe && (
              <span className="info-chip" style={{
                fontSize: '0.75rem', padding: '4px 10px', borderRadius: '999px',
                background: 'rgba(37,99,235,0.1)', color: '#1D4ED8',
                border: '1px solid rgba(37,99,235,0.2)', fontWeight: '600',
              }}>
                {donnee.sexe === 'M' ? '♂️ Homme' : donnee.sexe === 'F' ? '♀️ Femme' : '⚧️ Autre'}
              </span>
            )}
            {donnee.age && (
              <span className="info-chip" style={{
                fontSize: '0.75rem', padding: '4px 10px', borderRadius: '999px',
                background: 'rgba(124,58,237,0.1)', color: '#6D28D9',
                border: '1px solid rgba(124,58,237,0.2)', fontWeight: '600',
              }}>
                🎂 {donnee.age} ans
              </span>
            )}
            {donnee.commune && (
              <span className="info-chip" style={{
                fontSize: '0.75rem', padding: '4px 10px', borderRadius: '999px',
                background: 'rgba(107,114,128,0.1)', color: '#374151',
                border: '1px solid rgba(107,114,128,0.2)', fontWeight: '600',
              }}>
                📍 {donnee.commune}
              </span>
            )}
            {donnee.quartier && (
              <span className="info-chip" style={{
                fontSize: '0.75rem', padding: '4px 10px', borderRadius: '999px',
                background: 'rgba(5,150,105,0.1)', color: '#065F46',
                border: '1px solid rgba(5,150,105,0.2)', fontWeight: '600',
              }}>
                🏘️ {donnee.quartier}
              </span>
            )}
          </div>
        </div>

        {/* ═══════════ CORPS DE LA CARD ═══════════ */}
        <div style={{ padding: '16px' }}>

          {/* Statut + Date */}
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            marginBottom: '10px',
          }}>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: '5px',
              fontSize: '0.8rem', fontWeight: '700',
              padding: '4px 12px', borderRadius: '999px',
              background: statutConfig.bg, color: statutConfig.color,
              border: `1px solid ${statutConfig.color}25`,
            }}>
              {statutConfig.icon} {statutConfig.label}
            </span>
            <span style={{
              fontSize: '0.78rem', color: '#9CA3AF',
              display: 'flex', alignItems: 'center', gap: '4px', fontWeight: '500',
            }}>
              📅 {formatDate(donnee.date_consultation)}
            </span>
          </div>

          {/* Diagnostic */}
          {donnee.diagnostic && (
            <div style={{
              padding: '10px 12px', borderRadius: '10px',
              background: '#F9FAFB', border: '1px solid #E5E7EB',
              marginBottom: '12px',
            }}>
              <p style={{ fontSize: '0.72rem', color: '#9CA3AF', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.04em', margin: '0 0 4px' }}>
                Diagnostic
              </p>
              <p style={{ fontSize: '0.85rem', color: '#374151', margin: 0, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                {donnee.diagnostic}
              </p>
            </div>
          )}

          {/* Collecteur avec avatar */}
          {donnee.collecteur && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              padding: '10px 12px', borderRadius: '10px',
              background: '#F9FAFB', border: '1px solid #E5E7EB',
              marginBottom: '12px',
            }}>
              <div style={{
                width: '36px', height: '36px', borderRadius: '50%', flexShrink: 0,
                background: `linear-gradient(135deg, ${avatarColor}, ${avatarColor}BB)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'white', fontWeight: '800', fontSize: '0.75rem',
                boxShadow: `0 3px 8px ${avatarColor}40`,
              }}>
                {initiales}
              </div>
              <div style={{ overflow: 'hidden' }}>
                <p style={{ fontSize: '0.7rem', color: '#9CA3AF', margin: '0 0 1px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.03em' }}>✍️ Collecteur</p>
                <p style={{ fontSize: '0.85rem', color: '#374151', margin: 0, fontWeight: '700', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {collecteurPrenom} {collecteurNom}
                </p>
              </div>
              <div style={{ marginLeft: 'auto', flexShrink: 0 }}>
                <p style={{ fontSize: '0.72rem', color: '#9CA3AF', margin: 0, textAlign: 'right' }}>
                  {formatDate(donnee.created_at)}
                </p>
              </div>
            </div>
          )}

          {/* ═══════ BOUTON VOIR DÉTAILS ═══════ */}
          <button
            onClick={() => setExpanded(!expanded)}
            className="btn-details w-full py-2 rounded-xl font-semibold"
            style={{
              background: '#F3F4F6',
              border: '1.5px solid #E5E7EB',
              color: '#0066CC',
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
            }}
          >
            {expanded ? '🔼 Masquer les détails' : '🔽 Voir les détails'}
          </button>

          {/* ═══════ DÉTAILS ÉTENDUS ═══════ */}
          {expanded && (
            <div className="details-panel" style={{ marginTop: '14px', borderTop: '2px solid #F3F4F6', paddingTop: '14px' }}>

              {/* Informations personnelles complètes */}
              {!donnee.est_anonyme && (donnee.nom_patient || donnee.prenom_patient) && (
                <div style={{
                  padding: '12px', borderRadius: '12px', marginBottom: '10px',
                  background: 'linear-gradient(135deg, #EBF5FF, #DBEAFE)',
                  border: '1px solid rgba(0,102,204,0.15)',
                }}>
                  <p style={{ fontWeight: '800', color: '#1E3A5F', margin: '0 0 8px', fontSize: '0.85rem' }}>
                    👤 Informations Patient
                  </p>
                  <div style={{ fontSize: '0.82rem', color: '#374151', display: 'grid', gap: '4px' }}>
                    <p style={{ margin: 0 }}><span style={{ fontWeight: '700' }}>Nom complet :</span> {donnee.prenom_patient || ''} {donnee.nom_patient || ''}</p>
                    {donnee.telephone_patient && (
                      <p style={{ margin: 0 }}><span style={{ fontWeight: '700' }}>Téléphone :</span> {donnee.telephone_patient}</p>
                    )}
                    {donnee.sexe && (
                      <p style={{ margin: 0 }}><span style={{ fontWeight: '700' }}>Sexe :</span> {donnee.sexe === 'M' ? 'Masculin' : donnee.sexe === 'F' ? 'Féminin' : 'Autre'}</p>
                    )}
                    {donnee.age && (
                      <p style={{ margin: 0 }}><span style={{ fontWeight: '700' }}>Âge :</span> {donnee.age} ans {donnee.tranche_age && `(${donnee.tranche_age})`}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Grille de détails */}
              <div style={{ display: 'grid', gap: '8px', fontSize: '0.82rem' }}>

                {(donnee.ville || donnee.commune || donnee.quartier) && (
                  <DetailRow
                    label="📍 Localisation"
                    value={[donnee.quartier, donnee.commune, donnee.ville].filter(Boolean).join(', ')}
                  />
                )}

                {donnee.symptomes && (
                  <DetailRow label="🩺 Symptômes" value={donnee.symptomes} multiline />
                )}

                {donnee.traitement_prescrit && (
                  <DetailRow label="💊 Traitement" value={donnee.traitement_prescrit} multiline />
                )}

                {donnee.date_debut_symptomes && (
                  <DetailRow label="📅 Début symptômes" value={formatDate(donnee.date_debut_symptomes)} />
                )}

                {donnee.antecedents_medicaux && donnee.antecedents_details && (
                  <DetailRow label="📋 Antécédents" value={donnee.antecedents_details} multiline />
                )}

                {donnee.vaccination_a_jour !== null && (
                  <div style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '8px 12px', borderRadius: '8px', background: '#F9FAFB',
                  }}>
                    <span style={{ color: '#6B7280', fontWeight: '600' }}>💉 Vaccination</span>
                    <span style={{
                      fontWeight: '700',
                      color: donnee.vaccination_a_jour ? '#00A86B' : '#DC143C',
                    }}>
                      {donnee.vaccination_a_jour ? '✅ À jour' : '❌ Non à jour'}
                    </span>
                  </div>
                )}

                {donnee.notes && (
                  <DetailRow label="📝 Notes" value={donnee.notes} multiline />
                )}
              </div>

              {/* ═══════ BOUTONS MODIFIER + SUPPRIMER ═══════ */}
              {(canEdit || canDelete) && (
                <div style={{ display: 'flex', gap: '8px', marginTop: '14px' }}>
                  {canEdit && (
                    <button
                      onClick={() => setShowEditModal(true)}
                      className="btn-modifier flex-1 py-2 rounded-xl text-white font-bold text-sm"
                      style={{
                        background: 'linear-gradient(135deg, #0066CC, #0052A3)',
                        border: 'none', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px',
                      }}
                    >
                      ✏️ Modifier
                    </button>
                  )}
                  {canDelete && (
                    <button
                      onClick={handleDelete}
                      disabled={deleting}
                      className="btn-supprimer flex-1 py-2 rounded-xl text-white font-bold text-sm"
                      style={{
                        background: deleting ? '#9CA3AF' : 'linear-gradient(135deg, #DC143C, #B01030)',
                        border: 'none',
                        cursor: deleting ? 'not-allowed' : 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px',
                      }}
                    >
                      {deleting ? '⏳ Suppression...' : '🗑️ Supprimer'}
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* MODAL DE MODIFICATION */}
      {showEditModal && (
        <EditDonneeModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          donnee={donnee}
          onSuccess={handleEditSuccess}
        />
      )}
    </>
  );
}

// ═══════ COMPOSANT DETAIL ROW ═══════
function DetailRow({ label, value, multiline = false }) {
  return (
    <div style={{
      padding: '8px 12px', borderRadius: '8px',
      background: '#F9FAFB', border: '1px solid #F3F4F6',
    }}>
      <span style={{ color: '#6B7280', fontWeight: '700', display: 'block', marginBottom: multiline ? '4px' : '0' }}>
        {label}
      </span>
      {multiline ? (
        <p style={{ color: '#374151', margin: 0, lineHeight: '1.5' }}>{value}</p>
      ) : (
        <span style={{ color: '#111827', fontWeight: '600', float: 'right', marginTop: multiline ? 0 : '-20px' }}>
          {value}
        </span>
      )}
    </div>
  );
}