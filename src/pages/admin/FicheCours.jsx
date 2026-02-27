import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { coursService } from '../../services/api';
import { getUser } from '../../utils/auth';
import Navbar from '../../components/layout/Navbar';

// 🎨 PALETTE COULEURS MÉDICALES
const MEDICAL_COLORS = {
  primary:   '#0066CC',
  secondary: '#00A86B',
  accent:    '#DC143C',
  purple:    '#8B5CF6',
  teal:      '#14B8A6',
  orange:    '#F97316',
  bgBlue:    '#EFF6FF',
  bgGreen:   '#F0FDF4',
  bgPurple:  '#F5F3FF',
  gray50:    '#F9FAFB',
  gray100:   '#F3F4F6',
  gray200:   '#E5E7EB',
  gray600:   '#4B5563',
  gray700:   '#374151',
  gray800:   '#1F2937',
  gray900:   '#111827',
};

const AVATAR_COLORS = [
  '#0066CC','#00A86B','#DC143C','#7C3AED',
  '#D97706','#0891B2','#059669','#DB2777','#9333EA','#EA580C',
];

const SUBJECT_ICONS = {
  'anatomie':      '🫀', 'biochimie':    '🧬', 'physiologie': '⚛️',
  'pharmacologie': '💊', 'cardiologie':  '💓', 'chirurgie':   '🔪',
  'pédiatrie':     '👶', 'gynécologie':  '🩺', 'neurologie':  '🧠',
  'français':      '📗', 'anglais':      '📘', 'default':     '📚',
};

function getSubjectIcon(titre = '') {
  const key = Object.keys(SUBJECT_ICONS).find(k =>
    titre.toLowerCase().includes(k.toLowerCase())
  );
  return SUBJECT_ICONS[key] || SUBJECT_ICONS.default;
}

function getAvatarColor(name = '') {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash += name.charCodeAt(i);
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
}

function getInitiales(prenom = '', nom = '') {
  return `${prenom[0] || ''}${nom[0] || ''}`.toUpperCase() || '?';
}

function getMention(moyenne) {
  if (moyenne >= 16) return { label: 'Très Bien',   color: '#059669', bg: '#D1FAE5' };
  if (moyenne >= 14) return { label: 'Bien',         color: '#0066CC', bg: '#DBEAFE' };
  if (moyenne >= 12) return { label: 'Assez Bien',   color: '#7C3AED', bg: '#EDE9FE' };
  if (moyenne >= 10) return { label: 'Passable',     color: '#D97706', bg: '#FEF3C7' };
  return                     { label: 'Insuffisant', color: '#DC143C', bg: '#FEE2E2' };
}

export default function FicheCours() {
  const { id }   = useParams();
  const navigate = useNavigate();
  const authUser = getUser();

  const [loading,   setLoading]   = useState(true);
  const [cours,     setCours]     = useState(null);
  const [notes,     setNotes]     = useState([]);
  const [error,     setError]     = useState(null);
  const [activeTab, setActiveTab] = useState('etudiants');
  const [searchQ,   setSearchQ]   = useState('');

  useEffect(() => { fetchCours(); }, [id]);

  const fetchCours = async () => {
    try {
      setLoading(true);
      setError(null);
      const [resCours, resNotes] = await Promise.all([
        coursService.getOne(id),
        coursService.getNotes(id),
      ]);
      setCours(resCours.data.data || resCours.data);

      const notesData = resNotes.data.data || resNotes.data || [];
      setNotes(Array.isArray(notesData) ? notesData : Object.values(notesData));
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  // ── Chargement ────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: MEDICAL_COLORS.gray50 }}>
        <Navbar />
        <div className="text-center py-32">
          <div style={{
            width: '56px', height: '56px', margin: '0 auto',
            borderRadius: '50%', border: '4px solid #E5EBF5',
            borderTop: `4px solid ${MEDICAL_COLORS.primary}`,
            animation: 'spin 0.9s linear infinite',
          }} />
          <style>{`@keyframes spin { from{transform:rotate(0deg)}to{transform:rotate(360deg)} }`}</style>
          <p className="mt-4 font-medium" style={{ color: MEDICAL_COLORS.gray600 }}>
            Chargement du cours...
          </p>
        </div>
      </div>
    );
  }

  // ── Erreur ────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: MEDICAL_COLORS.gray50 }}>
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <span className="text-6xl">⚠️</span>
          <p className="mt-4 text-lg font-semibold" style={{ color: MEDICAL_COLORS.accent }}>{error}</p>
          <button onClick={() => navigate(-1)}
            className="mt-4 px-6 py-2 rounded-xl font-bold"
            style={{ backgroundColor: MEDICAL_COLORS.primary, color: 'white' }}>
            ← Retour
          </button>
        </div>
      </div>
    );
  }

  // ── Calculs statistiques ──────────────────────────────────────
  const courseColor    = getAvatarColor(cours?.titre || '');
  const enseignantNom  = `${cours?.enseignant?.prenom || ''} ${cours?.enseignant?.nom || ''}`.trim();
  const avatarColor    = getAvatarColor(enseignantNom);
  const initiales      = getInitiales(cours?.enseignant?.prenom, cours?.enseignant?.nom);

  const moyenne        = notes.length
    ? notes.reduce((s, n) => s + parseFloat(n.valeur || 0), 0) / notes.length
    : null;
  const notesValidees  = notes.filter(n => parseFloat(n.valeur) >= 10).length;
  const tauxReussite   = notes.length ? Math.round((notesValidees / notes.length) * 100) : 0;
  const mention        = moyenne !== null ? getMention(moyenne) : null;

  // Filtrage étudiants par recherche
  const notesFiltrees = notes.filter(n => {
    const nomEtudiant = `${n.etudiant?.prenom || ''} ${n.etudiant?.nom || ''}`.toLowerCase();
    const matricule   = (n.etudiant?.matricule || '').toLowerCase();
    const q = searchQ.toLowerCase();
    return nomEtudiant.includes(q) || matricule.includes(q);
  });

  return (
    <div className="min-h-screen" style={{ backgroundColor: MEDICAL_COLORS.gray50 }}>
      <Navbar />

      <style>{`
        @keyframes fadeInUp {
          from { opacity:0; transform:translateY(16px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes spin { from{transform:rotate(0deg)}to{transform:rotate(360deg)} }
        .anim { animation: fadeInUp 0.35s ease both; }
        .back-btn:hover { background:#DBEAFE !important; transform:translateX(-2px); }
        .back-btn { transition: all 0.2s ease; }
        .etudiant-card { transition: all 0.2s ease; }
        .etudiant-card:hover { transform:translateY(-2px); box-shadow:0 6px 16px rgba(0,0,0,0.1) !important; }
      `}</style>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* RETOUR */}
        <div className="mb-6 anim" style={{ animationDelay: '0ms' }}>
          <button onClick={() => navigate(-1)}
            className="back-btn flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-xl"
            style={{ color: MEDICAL_COLORS.primary, background: MEDICAL_COLORS.bgBlue, border: '1px solid #BFDBFE' }}>
            ← Retour
          </button>
        </div>

        {/* ── EN-TÊTE COURS ────────────────────────────────────── */}
        <div className="anim rounded-2xl overflow-hidden shadow-lg mb-6"
             style={{ animationDelay: '60ms', background: `linear-gradient(135deg, ${courseColor} 0%, ${courseColor}CC 100%)` }}>
          <div style={{ position: 'relative', overflow: 'hidden' }}>
            <div style={{ position:'absolute', top:'-30px', right:'-30px', width:'180px', height:'180px', borderRadius:'50%', background:'rgba(255,255,255,0.08)', pointerEvents:'none' }} />
            <div style={{ position:'absolute', bottom:'-20px', right:'80px', width:'90px', height:'90px', borderRadius:'50%', background:'rgba(255,255,255,0.05)', pointerEvents:'none' }} />

            <div className="p-6" style={{ position: 'relative', zIndex: 1 }}>
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-4">
                  {/* Icône cours */}
                  <div style={{
                    width:'80px', height:'80px', borderRadius:'20px', flexShrink:0,
                    background:'rgba(255,255,255,0.18)', backdropFilter:'blur(8px)',
                    border:'1px solid rgba(255,255,255,0.3)',
                    display:'flex', alignItems:'center', justifyContent:'center',
                    fontSize:'2.2rem', boxShadow:'0 4px 16px rgba(0,0,0,0.15)',
                  }}>
                    {getSubjectIcon(cours?.titre)}
                  </div>
                  <div>
                    <p style={{ fontSize:'0.8rem', color:'rgba(255,255,255,0.7)', margin:'0 0 2px', fontWeight:'600', textTransform:'uppercase', letterSpacing:'0.05em' }}>
                      📚 Cours
                    </p>
                    <h1 style={{ fontSize:'1.7rem', fontWeight:'800', color:'white', margin:'0 0 4px', letterSpacing:'-0.5px' }}>
                      {cours?.titre}
                    </h1>
                    <p style={{ color:'rgba(255,255,255,0.8)', margin:0, fontSize:'0.9rem' }}>
                      {cours?.filiere} • {cours?.niveau}
                    </p>
                  </div>
                </div>
                {/* Badge code */}
                <span style={{
                  background:'rgba(255,255,255,0.2)', backdropFilter:'blur(5px)',
                  border:'1px solid rgba(255,255,255,0.3)', borderRadius:'10px',
                  padding:'6px 14px', color:'white', fontSize:'0.85rem',
                  fontWeight:'800', fontFamily:'monospace', flexShrink:0,
                }}>
                  {cours?.code}
                </span>
              </div>

              {/* Badges */}
              <div style={{ display:'flex', gap:'8px', marginTop:'16px', flexWrap:'wrap' }}>
                <span style={{ background:'rgba(255,255,255,0.15)', border:'1px solid rgba(255,255,255,0.25)', borderRadius:'999px', padding:'3px 12px', color:'white', fontSize:'0.8rem', fontWeight:'600' }}>
                  🎓 {cours?.filiere}
                </span>
                <span style={{ background:'rgba(255,255,255,0.15)', border:'1px solid rgba(255,255,255,0.25)', borderRadius:'999px', padding:'3px 12px', color:'white', fontSize:'0.8rem', fontWeight:'600' }}>
                  📊 {cours?.niveau}
                </span>
                <span style={{ background:'rgba(255,255,255,0.15)', border:'1px solid rgba(255,255,255,0.25)', borderRadius:'999px', padding:'3px 12px', color:'white', fontSize:'0.8rem', fontWeight:'600' }}>
                  👥 {notes.length} étudiant{notes.length > 1 ? 's' : ''}
                </span>
                {mention && (
                  <span style={{ background:'rgba(255,255,255,0.2)', border:'1px solid rgba(255,255,255,0.3)', borderRadius:'999px', padding:'3px 12px', color:'white', fontSize:'0.8rem', fontWeight:'700' }}>
                    📊 Moy. {moyenne?.toFixed(2)}/20
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ── STATS RAPIDES ─────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6 anim" style={{ animationDelay: '100ms' }}>
          {[
            { icon:'👥', label:'Étudiants inscrits', value: notes.length,              color: MEDICAL_COLORS.primary,   bg:'#EFF6FF' },
            { icon:'📊', label:'Moyenne de classe',  value: moyenne ? `${moyenne.toFixed(2)}/20` : 'N/A', color: MEDICAL_COLORS.purple, bg:'#F5F3FF' },
            { icon:'✅', label:'Taux de réussite',   value: `${tauxReussite}%`,         color: MEDICAL_COLORS.secondary, bg:'#F0FDF4' },
            { icon:'🏅', label:'Mention classe',     value: mention?.label || 'N/A',   color: MEDICAL_COLORS.orange,    bg:'#FFF7ED' },
          ].map((stat, i) => (
            <div key={i} className="bg-white rounded-2xl p-4 shadow-sm" style={{ border:'1px solid #E5EBF5' }}>
              <div className="flex items-center justify-between mb-2">
                <div style={{ width:'36px', height:'36px', borderRadius:'10px', backgroundColor:stat.bg, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.1rem' }}>
                  {stat.icon}
                </div>
                <span style={{ fontSize:'1.3rem', fontWeight:'900', color:stat.color }}>
                  {stat.value}
                </span>
              </div>
              <p style={{ fontSize:'0.75rem', fontWeight:'600', color:MEDICAL_COLORS.gray600, margin:0 }}>
                {stat.label}
              </p>
            </div>
          ))}
        </div>

        {/* ── LAYOUT PRINCIPAL ──────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* COLONNE PRINCIPALE */}
          <div className="lg:col-span-2 space-y-6">

            {/* Onglets */}
            <div className="anim bg-white rounded-2xl shadow-sm overflow-hidden" style={{ animationDelay:'140ms', border:'1px solid #E5EBF5' }}>
              <div style={{ borderBottom:'1px solid #E5EBF5', display:'flex' }}>
                {[
                  { id:'etudiants', label:`👥 Étudiants (${notes.length})` },
                  { id:'infos',     label:'ℹ️ Informations'                },
                ].map(tab => (
                  <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                    className="px-6 py-4 text-sm font-semibold transition-all"
                    style={{
                      borderBottom: activeTab === tab.id ? `2px solid ${MEDICAL_COLORS.primary}` : '2px solid transparent',
                      color:        activeTab === tab.id ? MEDICAL_COLORS.primary : MEDICAL_COLORS.gray600,
                    }}>
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="p-6">

                {/* TAB ÉTUDIANTS */}
                {activeTab === 'etudiants' && (
                  <div>
                    {/* Barre de recherche étudiants */}
                    {notes.length > 0 && (
                      <div className="relative mb-4">
                        <span className="absolute inset-y-0 left-3 flex items-center text-gray-400">🔍</span>
                        <input
                          type="text"
                          value={searchQ}
                          onChange={e => setSearchQ(e.target.value)}
                          placeholder="Rechercher un étudiant..."
                          className="w-full pl-9 pr-4 py-2.5 rounded-xl border text-sm focus:outline-none"
                          style={{ borderColor: MEDICAL_COLORS.gray200 }}
                        />
                      </div>
                    )}

                    {notesFiltrees.length === 0 ? (
                      <div className="text-center py-12">
                        <span className="text-5xl">📭</span>
                        <p className="mt-3 font-semibold" style={{ color:MEDICAL_COLORS.gray700 }}>
                          {searchQ ? 'Aucun étudiant trouvé' : 'Aucune note disponible'}
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {notesFiltrees.map((note, i) => {
                          const valeur      = parseFloat(note.valeur);
                          const isOk        = valeur >= 10;
                          const etudiantNom = `${note.etudiant?.prenom || ''} ${note.etudiant?.nom || ''}`.trim();
                          const etudiantAvatarColor = getAvatarColor(etudiantNom);
                          const etudiantInitiales   = getInitiales(note.etudiant?.prenom, note.etudiant?.nom);

                          return (
                            <div
                              key={note.id_note || i}
                              className="etudiant-card rounded-xl p-4 cursor-pointer"
                              style={{ border:`1.5px solid ${isOk ? '#BBF7D0' : '#FED7AA'}`, borderLeft:`4px solid ${isOk ? MEDICAL_COLORS.secondary : MEDICAL_COLORS.accent}`, background: isOk ? '#F0FDF4' : '#FFF7ED' }}
                              onClick={() => navigate(`/etudiant/${note.etudiant?.id_etudiant}`)}
                            >
                              <div className="flex items-center justify-between gap-4">
                                <div className="flex items-center gap-3 min-w-0">
                                  {/* Avatar */}
                                  <div style={{
                                    width:'40px', height:'40px', borderRadius:'50%', flexShrink:0,
                                    background:`linear-gradient(135deg, ${etudiantAvatarColor}, ${etudiantAvatarColor}CC)`,
                                    display:'flex', alignItems:'center', justifyContent:'center',
                                    color:'white', fontWeight:'800', fontSize:'0.85rem',
                                  }}>
                                    {etudiantInitiales}
                                  </div>
                                  <div className="min-w-0">
                                    <p className="font-bold truncate" style={{ color:MEDICAL_COLORS.gray900, margin:0 }}>
                                      {etudiantNom || 'Étudiant inconnu'}
                                    </p>
                                    <p style={{ fontSize:'0.78rem', color:MEDICAL_COLORS.gray600, margin:'2px 0 0' }}>
                                      {note.etudiant?.matricule && <span className="mr-2">🆔 {note.etudiant.matricule}</span>}
                                      {note.semestre && <span>📅 S{note.semestre}</span>}
                                    </p>
                                  </div>
                                </div>

                                {/* Note + badge */}
                                <div className="flex items-center gap-3 flex-shrink-0">
                                  <div style={{
                                    width:'44px', height:'44px', borderRadius:'50%',
                                    background: isOk ? 'linear-gradient(135deg, #16A34A, #15803D)' : 'linear-gradient(135deg, #DC2626, #B91C1C)',
                                    display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
                                    boxShadow: isOk ? '0 4px 12px rgba(22,163,74,0.4)' : '0 4px 12px rgba(220,38,38,0.4)',
                                  }}>
                                    <span style={{ color:'white', fontWeight:'900', fontSize:'0.9rem', lineHeight:1 }}>{note.valeur}</span>
                                    <span style={{ color:'rgba(255,255,255,0.75)', fontSize:'0.55rem' }}>/20</span>
                                  </div>
                                  <span style={{
                                    fontSize:'0.72rem', fontWeight:'800', padding:'4px 10px', borderRadius:'999px',
                                    background: isOk ? '#DCFCE7' : note.est_rattrape ? '#EFF6FF' : '#FEE2E2',
                                    color:      isOk ? '#16A34A' : note.est_rattrape ? MEDICAL_COLORS.primary : '#DC2626',
                                  }}>
                                    {isOk ? '✅ Validé' : note.est_rattrape ? '🎓 Rattrapé' : '🔄 Rattrapage'}
                                  </span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {/* TAB INFOS */}
                {activeTab === 'infos' && (
                  <div className="space-y-3">
                    {[
                      { icon:'📚', label:'Titre',       value: cours?.titre                          },
                      { icon:'🔑', label:'Code',        value: cours?.code,       mono:true           },
                      { icon:'🎓', label:'Filière',     value: cours?.filiere                        },
                      { icon:'📊', label:'Niveau',      value: cours?.niveau                         },
                      { icon:'📋', label:'Description', value: cours?.description || 'Non renseignée'},
                    ].map((item, i) => (
                      <div key={i} style={{
                        display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:'12px',
                        padding:'12px 14px', borderRadius:'12px', background:MEDICAL_COLORS.gray50,
                        border:'1px solid #F3F4F6',
                      }}>
                        <div style={{ display:'flex', alignItems:'center', gap:'8px', flexShrink:0 }}>
                          <span>{item.icon}</span>
                          <span style={{ fontSize:'0.82rem', fontWeight:'600', color:MEDICAL_COLORS.gray600 }}>{item.label}</span>
                        </div>
                        <span style={{ fontSize:'0.85rem', fontWeight:'700', color:MEDICAL_COLORS.gray800, textAlign:'right', fontFamily:item.mono?'monospace':'inherit' }}>
                          {item.value || '—'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* COLONNE LATÉRALE */}
          <div className="space-y-6">

            {/* ENSEIGNANT */}
            {cours?.enseignant && (
              <div className="anim bg-white rounded-2xl shadow-sm p-5" style={{ animationDelay:'160ms', border:'1px solid #E5EBF5' }}>
                <p style={{ fontSize:'0.75rem', fontWeight:'700', color:'#9CA3AF', textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:'14px' }}>
                  👨‍🏫 Enseignant
                </p>
                <div style={{ display:'flex', alignItems:'center', gap:'12px', marginBottom:'14px' }}>
                  <div style={{
                    width:'50px', height:'50px', borderRadius:'50%', flexShrink:0,
                    background:`linear-gradient(135deg, ${avatarColor}, ${avatarColor}CC)`,
                    display:'flex', alignItems:'center', justifyContent:'center',
                    color:'white', fontWeight:'800', fontSize:'1rem',
                    boxShadow:`0 4px 12px ${avatarColor}40`,
                  }}>
                    {initiales}
                  </div>
                  <div>
                    <p style={{ fontWeight:'800', color:MEDICAL_COLORS.gray900, margin:0, fontSize:'0.95rem' }}>
                      {enseignantNom}
                    </p>
                    <p style={{ fontSize:'0.78rem', color:MEDICAL_COLORS.gray600, margin:'2px 0 0' }}>
                      {cours.enseignant.specialite || 'Enseignant'}
                    </p>
                  </div>
                </div>
                <div style={{ borderTop:`1px solid ${MEDICAL_COLORS.gray200}`, paddingTop:'12px', display:'grid', gap:'8px' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:'8px', padding:'8px 10px', borderRadius:'8px', background:MEDICAL_COLORS.gray50 }}>
                    <span>📧</span>
                    <p style={{ fontSize:'0.78rem', color:MEDICAL_COLORS.gray600, margin:0, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                      {cours.enseignant.email}
                    </p>
                  </div>
                  <button
                    onClick={() => navigate(`/enseignant/${cours.enseignant.id_enseignant}`)}
                    className="w-full py-2 rounded-xl text-sm font-semibold hover:opacity-80 transition-all"
                    style={{ backgroundColor: MEDICAL_COLORS.bgGreen, color: MEDICAL_COLORS.secondary, border:`1px solid #A7F3D0` }}>
                    Voir la fiche enseignant →
                  </button>
                </div>
              </div>
            )}

            {/* STATISTIQUES */}
            <div className="anim bg-white rounded-2xl shadow-sm p-5" style={{ animationDelay:'200ms', border:'1px solid #E5EBF5' }}>
              <p style={{ fontSize:'0.75rem', fontWeight:'700', color:'#9CA3AF', textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:'14px' }}>
                📊 Statistiques
              </p>
              <div style={{ display:'grid', gap:'8px' }}>
                {[
                  { label:'Étudiants',     value:notes.length,              bg:'#EFF6FF', color:MEDICAL_COLORS.primary   },
                  { label:'Validés',       value:notesValidees,             bg:'#F0FDF4', color:MEDICAL_COLORS.secondary },
                  { label:'En rattrapage', value:notes.length-notesValidees,bg:'#FEE2E2', color:MEDICAL_COLORS.accent    },
                  { label:'Taux réussite', value:`${tauxReussite}%`,        bg:'#F5F3FF', color:MEDICAL_COLORS.purple    },
                  { label:'Moyenne',       value:moyenne?`${moyenne.toFixed(2)}/20`:'N/A', bg:mention?.bg||'#F9FAFB', color:mention?.color||MEDICAL_COLORS.gray600 },
                ].map((item, i) => (
                  <div key={i} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px 12px', borderRadius:'10px', background:item.bg }}>
                    <span style={{ fontSize:'0.78rem', fontWeight:'600', color:MEDICAL_COLORS.gray600 }}>{item.label}</span>
                    <span style={{ fontWeight:'800', color:item.color }}>{item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* IDENTIFIANT COURS */}
            <div className="anim bg-white rounded-2xl shadow-sm p-5" style={{ animationDelay:'240ms', border:'1px solid #E5EBF5' }}>
              <p style={{ fontSize:'0.75rem', fontWeight:'700', color:'#9CA3AF', textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:'14px' }}>
                🔑 Identification
              </p>
              <div style={{ display:'grid', gap:'8px' }}>
                {[
                  { icon:'🔑', label:'Code',    value:cours?.code,    color:MEDICAL_COLORS.primary, mono:true },
                  { icon:'🎓', label:'Filière', value:cours?.filiere, color:MEDICAL_COLORS.purple   },
                  { icon:'📚', label:'Niveau',  value:cours?.niveau,  color:MEDICAL_COLORS.secondary},
                ].map((item, i) => (
                  <div key={i} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'10px 12px', borderRadius:'10px', background:MEDICAL_COLORS.gray50, border:'1px solid #F3F4F6' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:'6px' }}>
                      <span>{item.icon}</span>
                      <span style={{ fontSize:'0.78rem', fontWeight:'600', color:MEDICAL_COLORS.gray600 }}>{item.label}</span>
                    </div>
                    <span style={{ fontSize:'0.82rem', fontWeight:'800', color:item.color, fontFamily:item.mono?'monospace':'inherit' }}>
                      {item.value || '—'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* BOUTON RETOUR BAS */}
        <div className="mt-8 text-center anim" style={{ animationDelay:'280ms' }}>
          <button onClick={() => navigate(-1)}
            className="px-6 py-3 rounded-xl font-bold hover:opacity-90 transition-opacity"
            style={{ background:`linear-gradient(135deg, ${courseColor}, ${courseColor}CC)`, color:'white', border:'none', cursor:'pointer' }}>
            ← Retour
          </button>
        </div>
      </div>
    </div>
  );
}