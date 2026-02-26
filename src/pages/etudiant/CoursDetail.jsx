import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { coursService } from '../../services/api';
import { getUser } from '../../utils/auth';
import Navbar from '../../components/layout/Navbar';
import Card from '../../components/common/Card';

// 🎨 PALETTE COULEURS MÉDICALES
const MEDICAL_COLORS = {
  primary: '#0066CC',
  secondary: '#00A86B',
  accent: '#DC143C',
  purple: '#8B5CF6',
  teal: '#14B8A6',
  orange: '#F97316',
  
  bgBlue: '#EFF6FF',
  bgGreen: '#F0FDF4',
  bgPurple: '#F5F3FF',
  
  gray50: '#F9FAFB',
  gray100: '#F3F4F6',
  gray200: '#E5E7EB',
  gray600: '#4B5563',
  gray700: '#374151',
  gray800: '#1F2937',
  gray900: '#111827',
};

// 🎨 ICÔNES MATIÈRES
const SUBJECT_ICONS = {
  'Anatomie': '🫀', 'Biochimie': '🧬', 'Physiologie': '⚛️',
  'Français': '📗', 'Anglais': '📘', 'Pharmacologie': '💊',
  'Cardiologie': '💓', 'Chirurgie': '🔪', 'default': '📚'
};

const AVATAR_COLORS = [
  '#0066CC','#00A86B','#DC143C','#7C3AED',
  '#D97706','#0891B2','#059669','#DB2777','#9333EA','#EA580C',
];

function getSubjectIcon(titre = '') {
  const key = Object.keys(SUBJECT_ICONS).find(k => titre.toLowerCase().includes(k.toLowerCase()));
  return SUBJECT_ICONS[key] || SUBJECT_ICONS.default;
}

function getAvatarColor(name = '') {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash += name.charCodeAt(i);
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
}

export default function CoursDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = getUser();
  
  const [loading, setLoading] = useState(true);
  const [cours, setCours] = useState(null);
  const [maNote, setMaNote] = useState(null);
  // 🆕 Toutes les notes par semestre
  const [toutesNotes, setToutesNotes] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCoursDetail();
  }, [id]);

  const fetchCoursDetail = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await coursService.getDetailCoursEtudiant(id);
      
      if (response.data.success) {
        setCours(response.data.data.cours);
        setMaNote(response.data.data.ma_note);
        // 🆕 Récupérer toutes les notes si disponibles
        setToutesNotes(response.data.data.toutes_notes || []);
      }
    } catch (error) {
      console.error('Erreur:', error);
      setError(error.response?.data?.message || 'Erreur lors du chargement du cours');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: MEDICAL_COLORS.gray50 }}>
        <Navbar />
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-20">
            <div style={{
              width: '56px', height: '56px', margin: '0 auto',
              borderRadius: '50%',
              border: '4px solid #E5EBF5',
              borderTop: `4px solid ${MEDICAL_COLORS.primary}`,
              animation: 'spin 0.9s linear infinite',
            }} />
            <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
            <p className="mt-4 font-medium" style={{ color: MEDICAL_COLORS.gray600 }}>Chargement du cours...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: MEDICAL_COLORS.gray50 }}>
        <Navbar />
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card>
            <div className="text-center py-8">
              <span className="text-6xl">⚠️</span>
              <p className="mt-4 text-lg font-semibold" style={{ color: MEDICAL_COLORS.accent }}>{error}</p>
              <button
                onClick={() => navigate('/etudiant/dashboard')}
                className="mt-4 px-4 py-2 rounded-lg"
                style={{ backgroundColor: MEDICAL_COLORS.primary, color: 'white' }}
              >
                ← Retour au dashboard
              </button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  const enseignantNom = `${cours?.enseignant?.prenom || ''} ${cours?.enseignant?.nom || ''}`.trim();
  const avatarColor = getAvatarColor(enseignantNom);
  const initiales = enseignantNom ? enseignantNom.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : '?';
  const courseColor = getAvatarColor(cours?.titre || '');

  // 🆕 Calculer si le cours est validé (au moins une note >= 10)
  const coursValide = maNote && parseFloat(maNote.valeur) >= 10;
  const coursRattrapage = maNote && parseFloat(maNote.valeur) < 10 && !maNote.est_rattrape;

  return (
    <div className="min-h-screen" style={{ backgroundColor: MEDICAL_COLORS.gray50 }}>
      <Navbar />

      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .anim { animation: fadeInUp 0.35s ease both; }
        .back-btn:hover { background: #DBEAFE !important; transform: translateX(-2px); }
        .back-btn { transition: all 0.2s ease; }
        .note-semestre-card { transition: all 0.2s ease; }
        .note-semestre-card:hover { transform: translateY(-2px); box-shadow: 0 6px 16px rgba(0,0,0,0.1) !important; }
      `}</style>
      
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* BREADCRUMB + RETOUR */}
        <div className="mb-6 anim" style={{ animationDelay: '0ms' }}>
          <button
            onClick={() => navigate('/etudiant/dashboard')}
            className="back-btn flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-xl"
            style={{ color: MEDICAL_COLORS.primary, background: MEDICAL_COLORS.bgBlue, border: '1px solid #BFDBFE' }}
          >
            <span>←</span>
            <span>Retour au dashboard</span>
          </button>
        </div>

        {/* ═══════════════ EN-TÊTE COURS AMÉLIORÉ ═══════════════ */}
        <div className="anim" style={{ animationDelay: '60ms' }}>
          <div className="rounded-2xl overflow-hidden shadow-lg mb-6" style={{
            background: `linear-gradient(135deg, ${courseColor} 0%, ${courseColor}CC 100%)`,
          }}>
            <div style={{ position: 'relative', overflow: 'hidden' }}>
              {/* Cercles déco */}
              <div style={{ position: 'absolute', top: '-30px', right: '-30px', width: '160px', height: '160px', borderRadius: '50%', background: 'rgba(255,255,255,0.08)', pointerEvents: 'none' }} />
              <div style={{ position: 'absolute', bottom: '-20px', right: '60px', width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', pointerEvents: 'none' }} />

              <div className="p-6" style={{ position: 'relative', zIndex: 1 }}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-4">
                    {/* Icône cours */}
                    <div style={{
                      width: '70px', height: '70px', borderRadius: '18px', flexShrink: 0,
                      background: 'rgba(255,255,255,0.18)',
                      backdropFilter: 'blur(8px)',
                      border: '1px solid rgba(255,255,255,0.3)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '2rem',
                      boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
                    }}>
                      {getSubjectIcon(cours?.titre)}
                    </div>
                    <div>
                      <h1 style={{ fontSize: '1.6rem', fontWeight: '800', color: 'white', margin: '0 0 4px', letterSpacing: '-0.5px' }}>
                        {cours?.titre}
                      </h1>
                      <p style={{ color: 'rgba(255,255,255,0.8)', margin: 0, fontSize: '0.9rem' }}>
                        {cours?.filiere} • {cours?.niveau}
                      </p>
                    </div>
                  </div>

                  {/* Badge code cours */}
                  <span style={{
                    background: 'rgba(255,255,255,0.2)',
                    backdropFilter: 'blur(5px)',
                    border: '1px solid rgba(255,255,255,0.3)',
                    borderRadius: '10px',
                    padding: '6px 14px',
                    color: 'white', fontSize: '0.85rem', fontWeight: '800',
                    fontFamily: 'monospace', flexShrink: 0,
                  }}>
                    {cours?.code}
                  </span>
                </div>

                {/* Badges filière + niveau + statut note */}
                <div style={{ display: 'flex', gap: '8px', marginTop: '16px', flexWrap: 'wrap' }}>
                  <span style={{
                    background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)',
                    borderRadius: '999px', padding: '3px 12px', color: 'white', fontSize: '0.8rem', fontWeight: '600',
                  }}>
                    🎓 {cours?.filiere || 'Filière non spécifiée'}
                  </span>
                  <span style={{
                    background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)',
                    borderRadius: '999px', padding: '3px 12px', color: 'white', fontSize: '0.8rem', fontWeight: '600',
                  }}>
                    📚 {cours?.niveau || 'Niveau non spécifié'}
                  </span>
                  {maNote && (
                    <span style={{
                      background: coursValide ? 'rgba(0,168,107,0.3)' : 'rgba(220,20,60,0.3)',
                      border: `1px solid ${coursValide ? 'rgba(0,168,107,0.5)' : 'rgba(220,20,60,0.5)'}`,
                      borderRadius: '999px', padding: '3px 12px', color: 'white', fontSize: '0.8rem', fontWeight: '700',
                    }}>
                      {coursValide ? '✅ Validé' : coursRattrapage ? '🔄 Rattrapage' : '🎓 Rattrapé'}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* COLONNE PRINCIPALE */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* DESCRIPTION */}
            {cours?.description && (
              <div className="anim bg-white rounded-2xl shadow-sm p-6" style={{ animationDelay: '100ms', border: '1px solid #E5EBF5' }}>
                <p style={{ fontSize: '0.75rem', fontWeight: '700', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px' }}>
                  📋 Description du cours
                </p>
                <p className="text-sm leading-relaxed" style={{ color: MEDICAL_COLORS.gray700 }}>
                  {cours.description}
                </p>
              </div>
            )}

            {/* ═══════════ MES RÉSULTATS AMÉLIORÉ ═══════════ */}
            <div className="anim bg-white rounded-2xl shadow-sm p-6" style={{ animationDelay: '140ms', border: '1px solid #E5EBF5' }}>
              <p style={{ fontSize: '0.75rem', fontWeight: '700', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '16px' }}>
                📊 Mes Résultats
              </p>

              {maNote ? (
                <div className="space-y-4">
                  {/* NOTE PRINCIPALE en grand cercle */}
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: '20px',
                    padding: '20px', borderRadius: '16px',
                    background: coursValide
                      ? 'linear-gradient(135deg, #F0FDF4, #DCFCE7)'
                      : 'linear-gradient(135deg, #FFF7ED, #FEE2E2)',
                    border: `1.5px solid ${coursValide ? '#BBF7D0' : '#FED7AA'}`,
                    borderLeft: `4px solid ${coursValide ? MEDICAL_COLORS.secondary : MEDICAL_COLORS.accent}`,
                  }}>
                    {/* Cercle note */}
                    <div style={{
                      width: '80px', height: '80px', borderRadius: '50%', flexShrink: 0,
                      background: coursValide
                        ? 'linear-gradient(135deg, #16A34A, #15803D)'
                        : 'linear-gradient(135deg, #DC2626, #B91C1C)',
                      display: 'flex', flexDirection: 'column',
                      alignItems: 'center', justifyContent: 'center',
                      boxShadow: coursValide
                        ? '0 6px 20px rgba(22,163,74,0.4)'
                        : '0 6px 20px rgba(220,38,38,0.4)',
                    }}>
                      <span style={{ color: 'white', fontWeight: '900', fontSize: '1.4rem', lineHeight: 1 }}>
                        {maNote.valeur}
                      </span>
                      <span style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.7rem', fontWeight: '600' }}>/20</span>
                    </div>

                    <div>
                      <p style={{ fontWeight: '800', fontSize: '1.1rem', color: MEDICAL_COLORS.gray900, margin: '0 0 4px' }}>
                        {coursValide ? '✅ Cours validé !' : coursRattrapage ? '🔄 Rattrapage requis' : '🎓 Validé en rattrapage'}
                      </p>
                      <p style={{ fontSize: '0.85rem', color: MEDICAL_COLORS.gray600, margin: 0 }}>
                        Session : <strong>{maNote.session === 'normale' ? 'Normale' : 'Rattrapage'}</strong>
                        {maNote.semestre && <> • Semestre : <strong>{maNote.semestre}</strong></>}
                      </p>
                      {maNote.date && (
                        <p style={{ fontSize: '0.8rem', color: MEDICAL_COLORS.gray600, margin: '4px 0 0' }}>
                          📅 {new Date(maNote.date).toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                        </p>
                      )}
                      {maNote.est_rattrape && (
                        <span style={{
                          display: 'inline-block', marginTop: '8px',
                          fontSize: '0.72rem', fontWeight: '800', padding: '3px 10px', borderRadius: '999px',
                          background: '#EFF6FF', color: MEDICAL_COLORS.primary,
                        }}>
                          🎓 Validé en session de rattrapage
                        </span>
                      )}
                    </div>
                  </div>

                  {/* 🆕 TOUTES LES NOTES PAR SEMESTRE (si plusieurs notes) */}
                  {toutesNotes.length > 1 && (
                    <div>
                      <p style={{ fontSize: '0.75rem', fontWeight: '700', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 10px' }}>
                        📅 Détail par semestre
                      </p>
                      <div style={{ display: 'grid', gap: '8px' }}>
                        {toutesNotes.map((note, index) => {
                          const valeur = parseFloat(note.valeur);
                          const isOk = valeur >= 10;
                          return (
                            <div key={note.id_note || index} className="note-semestre-card" style={{
                              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                              padding: '12px 16px', borderRadius: '12px',
                              border: `1.5px solid ${isOk ? '#BBF7D0' : '#FED7AA'}`,
                              borderLeft: `4px solid ${isOk ? MEDICAL_COLORS.secondary : MEDICAL_COLORS.accent}`,
                              background: isOk ? '#F0FDF4' : '#FFF7ED',
                            }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <div style={{
                                  width: '36px', height: '36px', borderRadius: '8px',
                                  background: isOk ? 'linear-gradient(135deg, #16A34A, #15803D)' : 'linear-gradient(135deg, #DC2626, #B91C1C)',
                                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                                  color: 'white', fontWeight: '900', fontSize: '0.85rem',
                                }}>
                                  {note.valeur}
                                </div>
                                <div>
                                  <p style={{ margin: 0, fontWeight: '700', fontSize: '0.85rem', color: MEDICAL_COLORS.gray900 }}>
                                    Semestre {note.semestre}
                                  </p>
                                  <p style={{ margin: 0, fontSize: '0.75rem', color: MEDICAL_COLORS.gray600 }}>
                                    Session : {note.session === 'normale' ? 'Normale' : 'Rattrapage'}
                                    {note.date_evaluation && ` • ${new Date(note.date_evaluation).toLocaleDateString('fr-FR')}`}
                                  </p>
                                </div>
                              </div>
                              <span style={{
                                fontSize: '0.72rem', fontWeight: '800', padding: '3px 10px', borderRadius: '999px',
                                background: isOk ? '#DCFCE7' : note.est_rattrape ? '#EFF6FF' : '#FEE2E2',
                                color: isOk ? '#16A34A' : note.est_rattrape ? MEDICAL_COLORS.primary : '#DC2626',
                              }}>
                                {isOk ? '✅ Validé' : note.est_rattrape ? '🎓 Rattrapé' : '🔄 Rattrapage'}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-10">
                  <div style={{
                    width: '72px', height: '72px', margin: '0 auto 16px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #FFF7ED, #FED7AA)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '2rem',
                  }}>
                    ⏳
                  </div>
                  <p style={{ fontSize: '1rem', fontWeight: '700', color: MEDICAL_COLORS.orange, margin: '0 0 4px' }}>
                    Aucune note disponible
                  </p>
                  <p style={{ fontSize: '0.85rem', color: MEDICAL_COLORS.gray600, margin: 0 }}>
                    Vous n'avez pas encore été évalué pour ce cours
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* COLONNE LATÉRALE */}
          <div className="space-y-6">
            
            {/* ENSEIGNANT AMÉLIORÉ */}
            {cours?.enseignant && (
              <div className="anim bg-white rounded-2xl shadow-sm p-5" style={{ animationDelay: '160ms', border: '1px solid #E5EBF5' }}>
                <p style={{ fontSize: '0.75rem', fontWeight: '700', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '14px' }}>
                  👨‍🏫 Enseignant
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
                  {/* Avatar enseignant */}
                  <div style={{
                    width: '50px', height: '50px', borderRadius: '50%', flexShrink: 0,
                    background: `linear-gradient(135deg, ${avatarColor}, ${avatarColor}CC)`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'white', fontWeight: '800', fontSize: '1rem',
                    boxShadow: `0 4px 12px ${avatarColor}40`,
                  }}>
                    {initiales}
                  </div>
                  <div>
                    <p style={{ fontWeight: '800', color: MEDICAL_COLORS.gray900, margin: 0, fontSize: '0.95rem' }}>
                      {cours.enseignant.prenom} {cours.enseignant.nom}
                    </p>
                    <p style={{ fontSize: '0.78rem', color: MEDICAL_COLORS.gray600, margin: '2px 0 0' }}>
                      {cours.enseignant.specialite || 'Enseignant'}
                    </p>
                  </div>
                </div>

                <div style={{ borderTop: `1px solid ${MEDICAL_COLORS.gray200}`, paddingTop: '12px', display: 'grid', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 10px', borderRadius: '8px', background: MEDICAL_COLORS.gray50 }}>
                    <span style={{ fontSize: '0.9rem' }}>📧</span>
                    <p style={{ fontSize: '0.78rem', color: MEDICAL_COLORS.gray600, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {cours.enseignant.email}
                    </p>
                  </div>
                  {cours.enseignant.matricule && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 10px', borderRadius: '8px', background: MEDICAL_COLORS.gray50 }}>
                      <span style={{ fontSize: '0.9rem' }}>🆔</span>
                      <p style={{ fontSize: '0.78rem', color: MEDICAL_COLORS.gray600, margin: 0 }}>
                        {cours.enseignant.matricule}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* INFORMATIONS COURS AMÉLIORÉ */}
            <div className="anim bg-white rounded-2xl shadow-sm p-5" style={{ animationDelay: '200ms', border: '1px solid #E5EBF5' }}>
              <p style={{ fontSize: '0.75rem', fontWeight: '700', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '14px' }}>
                ℹ️ Informations
              </p>
              <div style={{ display: 'grid', gap: '8px' }}>
                {[
                  { label: 'Filière', value: cours?.filiere || '-', color: MEDICAL_COLORS.primary, icon: '🎓' },
                  { label: 'Niveau', value: cours?.niveau || '-', color: MEDICAL_COLORS.purple, icon: '📚' },
                  { label: 'Code cours', value: cours?.code, color: MEDICAL_COLORS.gray800, icon: '🔑', mono: true },
                ].map((item) => (
                  <div key={item.label} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '10px 12px', borderRadius: '10px', background: MEDICAL_COLORS.gray50,
                    border: '1px solid #F3F4F6',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontSize: '0.9rem' }}>{item.icon}</span>
                      <span style={{ fontSize: '0.78rem', fontWeight: '600', color: MEDICAL_COLORS.gray600 }}>{item.label}</span>
                    </div>
                    <span style={{
                      fontSize: '0.82rem', fontWeight: '800', color: item.color,
                      fontFamily: item.mono ? 'monospace' : 'inherit',
                    }}>
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* 🆕 RÉCAPITULATIF NOTES */}
            {toutesNotes.length > 0 && (
              <div className="anim bg-white rounded-2xl shadow-sm p-5" style={{ animationDelay: '240ms', border: '1px solid #E5EBF5' }}>
                <p style={{ fontSize: '0.75rem', fontWeight: '700', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '14px' }}>
                  📊 Récapitulatif
                </p>
                <div style={{ display: 'grid', gap: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', borderRadius: '10px', background: '#EFF6FF' }}>
                    <span style={{ fontSize: '0.78rem', fontWeight: '600', color: MEDICAL_COLORS.gray600 }}>Total évaluations</span>
                    <span style={{ fontWeight: '800', color: MEDICAL_COLORS.primary }}>{toutesNotes.length}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', borderRadius: '10px', background: '#F0FDF4' }}>
                    <span style={{ fontSize: '0.78rem', fontWeight: '600', color: MEDICAL_COLORS.gray600 }}>Semestres validés</span>
                    <span style={{ fontWeight: '800', color: MEDICAL_COLORS.secondary }}>
                      {toutesNotes.filter(n => parseFloat(n.valeur) >= 10).length}/{toutesNotes.length}
                    </span>
                  </div>
                  {toutesNotes.length > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', borderRadius: '10px', background: MEDICAL_COLORS.gray50 }}>
                      <span style={{ fontSize: '0.78rem', fontWeight: '600', color: MEDICAL_COLORS.gray600 }}>Moyenne cours</span>
                      <span style={{
                        fontWeight: '800',
                        color: (toutesNotes.reduce((s, n) => s + parseFloat(n.valeur), 0) / toutesNotes.length) >= 10
                          ? MEDICAL_COLORS.secondary : MEDICAL_COLORS.accent
                      }}>
                        {(toutesNotes.reduce((s, n) => s + parseFloat(n.valeur), 0) / toutesNotes.length).toFixed(2)}/20
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* BOUTON RETOUR BAS DE PAGE */}
        <div className="mt-8 text-center anim" style={{ animationDelay: '280ms' }}>
          <button
            onClick={() => navigate('/etudiant/dashboard')}
            className="back-btn px-6 py-3 rounded-xl font-bold hover:opacity-90 transition-opacity"
            style={{ background: `linear-gradient(135deg, ${MEDICAL_COLORS.primary}, #0052A3)`, color: 'white', border: 'none', cursor: 'pointer' }}
          >
            ← Retour à mes cours
          </button>
        </div>
      </div>
    </div>
  );
}
