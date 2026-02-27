import { useState, useEffect } from 'react';
import { quizService } from '../../services/api';

// 🎨 PALETTE
const COLORS = {
  primary:   '#0066CC',
  secondary: '#00A86B',
  accent:    '#DC143C',
  purple:    '#8B5CF6',
  orange:    '#F97316',
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
  '#D97706','#0891B2','#059669','#DB2777',
];

function getColor(str = '') {
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash += str.charCodeAt(i);
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
}

function getInitiales(prenom = '', nom = '') {
  return `${prenom[0] || ''}${nom[0] || ''}`.toUpperCase() || '?';
}

function formatTemps(seconds) {
  if (!seconds) return '—';
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}m ${String(s).padStart(2, '0')}s`;
}

function getMention(note) {
  if (note >= 16) return { label:'Très Bien',   color:'#059669', bg:'#D1FAE5' };
  if (note >= 14) return { label:'Bien',         color:'#0066CC', bg:'#DBEAFE' };
  if (note >= 12) return { label:'Assez Bien',   color:'#7C3AED', bg:'#EDE9FE' };
  if (note >= 10) return { label:'Passable',     color:'#D97706', bg:'#FEF3C7' };
  return                  { label:'Insuffisant', color:'#DC143C', bg:'#FEE2E2' };
}

export default function QuizResultat({ quiz: quizMeta, onRetour }) {
  const color = getColor(quizMeta?.titre || '');

  const [stats,    setStats]    = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [activeTab, setActiveTab] = useState('apercu');
  const [search,   setSearch]   = useState('');

  useEffect(() => { fetchStats(); }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await quizService.stats(quizMeta.id_quiz);
      setStats(res.data.data);
    } catch (err) {
      console.error('Erreur stats:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-20">
        <div style={{ width:'48px', height:'48px', margin:'0 auto', borderRadius:'50%', border:'4px solid #E5EBF5', borderTop:`4px solid ${color}`, animation:'spin 0.9s linear infinite' }} />
        <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
        <p className="mt-3 text-sm font-medium" style={{ color:COLORS.gray600 }}>Chargement des statistiques...</p>
      </div>
    );
  }

  if (!stats) return null;

  const { quiz, tentatives, nb_tentatives, nb_reussis, moyenne_note, taux_reussite } = stats;
  const mention = moyenne_note !== null ? getMention(moyenne_note) : null;

  // Distribution des notes
  const distribution = [
    { label:'0-5',   count: tentatives.filter(t => t.note_sur_20 < 5).length,                  color:COLORS.accent,    bg:'#FEE2E2' },
    { label:'5-10',  count: tentatives.filter(t => t.note_sur_20 >= 5 && t.note_sur_20 < 10).length,  color:COLORS.orange,   bg:'#FFF7ED' },
    { label:'10-15', count: tentatives.filter(t => t.note_sur_20 >= 10 && t.note_sur_20 < 15).length, color:COLORS.primary,  bg:'#EFF6FF' },
    { label:'15-20', count: tentatives.filter(t => t.note_sur_20 >= 15).length,                color:COLORS.secondary, bg:'#F0FDF4' },
  ];
  const maxDist = Math.max(...distribution.map(d => d.count), 1);

  // Filtrage tentatives
  const tentativesFiltrees = tentatives.filter(t => {
    const nom = `${t.etudiant?.prenom || ''} ${t.etudiant?.nom || ''}`.toLowerCase();
    return nom.includes(search.toLowerCase()) ||
      (t.etudiant?.matricule || '').toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div>
      <style>{`
        @keyframes fadeInUp { from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)} }
        @keyframes barGrow   { from{width:0}to{width:var(--w)} }
        .anim { animation: fadeInUp 0.3s ease both; }
        .tent-card { transition: all 0.2s ease; }
        .tent-card:hover { transform:translateY(-2px); box-shadow:0 6px 16px rgba(0,0,0,0.08) !important; }
      `}</style>

      {/* ── HEADER ─────────────────────────────────────────────── */}
      <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
        <div className="flex items-center gap-3">
          <button onClick={onRetour}
            className="w-10 h-10 rounded-xl flex items-center justify-center hover:opacity-80 transition-all"
            style={{ backgroundColor:COLORS.gray100, color:COLORS.gray700 }}>
            ←
          </button>
          <div>
            <h2 className="text-xl font-bold" style={{ color:COLORS.gray900 }}>
              📊 Statistiques — {quiz?.titre}
            </h2>
            <p className="text-sm mt-0.5" style={{ color:COLORS.gray600 }}>
              {nb_tentatives} tentative{nb_tentatives > 1 ? 's' : ''}
            </p>
          </div>
        </div>
      </div>

      {/* ── STATS RAPIDES ─────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6 anim">
        {[
          { icon:'👥', label:'Tentatives',   value:nb_tentatives,                               color:COLORS.primary,   bg:'#EFF6FF' },
          { icon:'✅', label:'Réussis',       value:`${nb_reussis}/${nb_tentatives}`,            color:COLORS.secondary, bg:'#F0FDF4' },
          { icon:'📊', label:'Taux réussite', value:`${taux_reussite}%`,                        color:COLORS.purple,    bg:'#F5F3FF' },
          { icon:'🏅', label:'Moyenne',       value:moyenne_note ? `${moyenne_note}/20` : 'N/A', color:mention?.color || COLORS.orange, bg:mention?.bg || '#FFF7ED' },
        ].map((s, i) => (
          <div key={i} className="anim bg-white rounded-2xl p-4 shadow-sm"
               style={{ animationDelay:`${i*50}ms`, border:`1px solid ${COLORS.gray200}` }}>
            <div className="flex items-center justify-between mb-2">
              <div style={{ width:'36px', height:'36px', borderRadius:'10px', backgroundColor:s.bg, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.1rem' }}>
                {s.icon}
              </div>
              <span style={{ fontSize:'1.3rem', fontWeight:'900', color:s.color }}>{s.value}</span>
            </div>
            <p style={{ fontSize:'0.75rem', fontWeight:'600', color:COLORS.gray600, margin:0 }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* ── ONGLETS ────────────────────────────────────────────── */}
      <div className="anim bg-white rounded-2xl overflow-hidden" style={{ animationDelay:'200ms', border:`1px solid ${COLORS.gray200}` }}>
        <div style={{ borderBottom:`1px solid ${COLORS.gray200}`, display:'flex' }}>
          {[
            { id:'apercu',    label:'📈 Aperçu'     },
            { id:'etudiants', label:`👥 Étudiants (${nb_tentatives})` },
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className="px-6 py-4 text-sm font-semibold transition-all"
              style={{
                borderBottom: activeTab === tab.id ? `2px solid ${color}` : '2px solid transparent',
                color:        activeTab === tab.id ? color : COLORS.gray600,
              }}>
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-6">

          {/* ── TAB APERÇU ─────────────────────────────────────── */}
          {activeTab === 'apercu' && (
            <div className="space-y-6">

              {/* Infos quiz */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                {/* Distribution des notes */}
                <div className="bg-white rounded-2xl p-5" style={{ border:`1px solid ${COLORS.gray200}` }}>
                  <p style={{ fontSize:'0.75rem', fontWeight:'700', color:'#9CA3AF', textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:'16px' }}>
                    📊 Distribution des notes
                  </p>
                  {nb_tentatives === 0 ? (
                    <div className="text-center py-8">
                      <span className="text-4xl">📭</span>
                      <p className="mt-2 text-sm" style={{ color:COLORS.gray600 }}>Aucune tentative</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {distribution.map((d, i) => (
                        <div key={i}>
                          <div className="flex items-center justify-between mb-1">
                            <span style={{ fontSize:'0.78rem', fontWeight:'700', color:COLORS.gray700 }}>{d.label}/20</span>
                            <span style={{ fontSize:'0.78rem', fontWeight:'800', color:d.color }}>{d.count} étudiant{d.count > 1 ? 's' : ''}</span>
                          </div>
                          <div style={{ height:'8px', borderRadius:'999px', backgroundColor:COLORS.gray100, overflow:'hidden' }}>
                            <div style={{
                              height:'100%', borderRadius:'999px',
                              backgroundColor:d.color,
                              width:`${nb_tentatives > 0 ? (d.count / nb_tentatives) * 100 : 0}%`,
                              transition:'width 0.6s ease',
                            }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Infos quiz */}
                <div className="bg-white rounded-2xl p-5" style={{ border:`1px solid ${COLORS.gray200}` }}>
                  <p style={{ fontSize:'0.75rem', fontWeight:'700', color:'#9CA3AF', textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:'16px' }}>
                    ℹ️ Informations quiz
                  </p>
                  <div className="space-y-2">
                    {[
                      { icon:'⏱', label:'Durée',         value:`${quiz?.duree_minutes} min`              },
                      { icon:'❓', label:'Questions',      value:`${quiz?.questions_count || 0}`           },
                      { icon:'🎯', label:'Note passage',   value:`${quiz?.note_passage}/20`                },
                      { icon:'🎓', label:'Filière',        value:quiz?.filiere || 'Toutes'                 },
                      { icon:'📚', label:'Niveau',         value:quiz?.niveau  || 'Tous'                   },
                      { icon:'📊', label:'Mention classe', value:mention?.label || 'N/A',
                        color:mention?.color, bg:mention?.bg },
                    ].map((item, i) => (
                      <div key={i} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'8px 12px', borderRadius:'10px', backgroundColor:item.bg || COLORS.gray50 }}>
                        <div style={{ display:'flex', alignItems:'center', gap:'6px' }}>
                          <span style={{ fontSize:'0.9rem' }}>{item.icon}</span>
                          <span style={{ fontSize:'0.78rem', fontWeight:'600', color:COLORS.gray600 }}>{item.label}</span>
                        </div>
                        <span style={{ fontSize:'0.82rem', fontWeight:'800', color:item.color || COLORS.gray800 }}>
                          {item.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Meilleur / Moins bon */}
              {tentatives.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { label:'🏆 Meilleur résultat', t: tentatives.reduce((a, b) => a.note_sur_20 > b.note_sur_20 ? a : b), color:COLORS.secondary, bg:'#F0FDF4' },
                    { label:'📉 Résultat le plus faible', t: tentatives.reduce((a, b) => a.note_sur_20 < b.note_sur_20 ? a : b), color:COLORS.accent, bg:'#FEF2F2' },
                  ].map((item, i) => {
                    const nom = `${item.t.etudiant?.prenom || ''} ${item.t.etudiant?.nom || ''}`.trim();
                    const avatarColor = getColor(nom);
                    return (
                      <div key={i} className="p-4 rounded-2xl" style={{ backgroundColor:item.bg, border:`1px solid ${item.color}30` }}>
                        <p style={{ fontSize:'0.72rem', fontWeight:'700', color:item.color, textTransform:'uppercase', letterSpacing:'0.05em', margin:'0 0 10px' }}>
                          {item.label}
                        </p>
                        <div className="flex items-center gap-3">
                          <div style={{ width:'40px', height:'40px', borderRadius:'50%', background:`linear-gradient(135deg, ${avatarColor}, ${avatarColor}CC)`, display:'flex', alignItems:'center', justifyContent:'center', color:'white', fontWeight:'800', fontSize:'0.85rem', flexShrink:0 }}>
                            {getInitiales(item.t.etudiant?.prenom, item.t.etudiant?.nom)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-bold truncate" style={{ color:COLORS.gray900, margin:0 }}>{nom || 'Inconnu'}</p>
                            <p style={{ fontSize:'0.75rem', color:COLORS.gray600, margin:0 }}>{item.t.etudiant?.matricule}</p>
                          </div>
                          <span style={{ fontSize:'1.4rem', fontWeight:'900', color:item.color, flexShrink:0 }}>
                            {item.t.note_sur_20}/20
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ── TAB ÉTUDIANTS ─────────────────────────────────── */}
          {activeTab === 'etudiants' && (
            <div>
              {/* Recherche */}
              <div className="relative mb-4">
                <span className="absolute inset-y-0 left-3 flex items-center text-gray-400">🔍</span>
                <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                  placeholder="Rechercher un étudiant..."
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border text-sm focus:outline-none"
                  style={{ borderColor:COLORS.gray200 }} />
              </div>

              {tentativesFiltrees.length === 0 ? (
                <div className="text-center py-12">
                  <span className="text-5xl">📭</span>
                  <p className="mt-3 font-semibold" style={{ color:COLORS.gray700 }}>
                    {search ? 'Aucun étudiant trouvé' : 'Aucune tentative'}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {tentativesFiltrees.map((t, i) => {
                    const nom          = `${t.etudiant?.prenom || ''} ${t.etudiant?.nom || ''}`.trim();
                    const avatarColor  = getColor(nom);
                    const initiales    = getInitiales(t.etudiant?.prenom, t.etudiant?.nom);
                    const mention      = getMention(t.note_sur_20);

                    return (
                      <div key={t.id_tentative || i} className="tent-card rounded-xl p-4 bg-white"
                           style={{ border:`1.5px solid ${t.est_reussi ? '#BBF7D0' : '#FED7AA'}`, borderLeft:`4px solid ${t.est_reussi ? COLORS.secondary : COLORS.accent}` }}>
                        <div className="flex items-center gap-3">
                          {/* Avatar */}
                          <div style={{ width:'42px', height:'42px', borderRadius:'50%', background:`linear-gradient(135deg, ${avatarColor}, ${avatarColor}CC)`, display:'flex', alignItems:'center', justifyContent:'center', color:'white', fontWeight:'800', fontSize:'0.85rem', flexShrink:0 }}>
                            {initiales}
                          </div>

                          {/* Infos */}
                          <div className="flex-1 min-w-0">
                            <p className="font-bold truncate" style={{ color:COLORS.gray900, margin:0 }}>
                              {nom || 'Inconnu'}
                            </p>
                            <div className="flex items-center gap-3 flex-wrap">
                              {t.etudiant?.matricule && (
                                <span style={{ fontSize:'0.72rem', color:COLORS.gray600 }}>🆔 {t.etudiant.matricule}</span>
                              )}
                              <span style={{ fontSize:'0.72rem', color:COLORS.gray600 }}>⏱ {formatTemps(t.temps_pris)}</span>
                              <span style={{ fontSize:'0.72rem', color:COLORS.gray600 }}>
                                📅 {new Date(t.created_at).toLocaleDateString('fr-FR')}
                              </span>
                            </div>
                          </div>

                          {/* Note + Mention */}
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <div style={{ textAlign:'right' }}>
                              <p style={{ fontSize:'1.3rem', fontWeight:'900', color:t.est_reussi ? COLORS.secondary : COLORS.accent, margin:0, lineHeight:1 }}>
                                {t.note_sur_20}
                              </p>
                              <p style={{ fontSize:'0.65rem', color:COLORS.gray600, margin:0 }}>/20</p>
                            </div>
                            <span style={{ fontSize:'0.7rem', fontWeight:'800', padding:'3px 8px', borderRadius:'999px', backgroundColor:mention.bg, color:mention.color }}>
                              {mention.label}
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
        </div>
      </div>
    </div>
  );
}