import { useState, useEffect } from 'react';
import { quizService } from '../../services/api';
import { getUser } from '../../utils/auth';

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

function getDifficulteLabel(note) {
  if (note >= 16) return { label: 'Difficile',  color: '#DC143C', bg: '#FEE2E2' };
  if (note >= 12) return { label: 'Moyen',      color: '#D97706', bg: '#FEF3C7' };
  return                  { label: 'Facile',    color: '#00A86B', bg: '#F0FDF4' };
}

export default function QuizList({ onSelect, onNew, onStats }) {
  const user = getUser();
  const role = user?.role;

  const [quiz,     setQuiz]     = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState('');
  const [filtrePub, setFiltrePub] = useState('tous'); // tous | publies | brouillons
  const [deleting, setDeleting] = useState(null);

  useEffect(() => { fetchQuiz(); }, []);

  const fetchQuiz = async () => {
    try {
      setLoading(true);
      const res = await quizService.getAll();
      const data = res.data.data || [];
      setQuiz(Array.isArray(data) ? data : Object.values(data));
    } catch (err) {
      console.error('Erreur quiz:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePublie = async (q) => {
    try {
      await quizService.togglePublie(q.id_quiz);
      fetchQuiz();
    } catch (err) {
      console.error('Erreur toggle:', err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer ce quiz définitivement ?')) return;
    try {
      setDeleting(id);
      await quizService.delete(id);
      fetchQuiz();
    } catch (err) {
      console.error('Erreur suppression:', err);
    } finally {
      setDeleting(null);
    }
  };

  // ── Filtrage ───────────────────────────────────────────────────
  const quizFiltres = quiz.filter(q => {
    const matchSearch = q.titre.toLowerCase().includes(search.toLowerCase())
      || (q.filiere || '').toLowerCase().includes(search.toLowerCase());
    const matchPub =
      filtrePub === 'tous'      ? true :
      filtrePub === 'publies'   ? q.est_publie :
                                  !q.est_publie;
    return matchSearch && matchPub;
  });

  if (loading) {
    return (
      <div className="text-center py-20">
        <div style={{
          width:'48px', height:'48px', margin:'0 auto',
          borderRadius:'50%', border:'4px solid #E5EBF5',
          borderTop:`4px solid ${COLORS.primary}`,
          animation:'spin 0.9s linear infinite',
        }} />
        <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
        <p className="mt-3 text-sm font-medium" style={{ color:COLORS.gray600 }}>Chargement des quiz...</p>
      </div>
    );
  }

  return (
    <div>
      <style>{`
        @keyframes fadeInUp { from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)} }
        .quiz-card { animation: fadeInUp 0.3s ease both; transition: all 0.2s ease; }
        .quiz-card:hover { transform:translateY(-3px); box-shadow:0 8px 24px rgba(0,0,0,0.1) !important; }
      `}</style>

      {/* ── HEADER ─────────────────────────────────────────────── */}
      <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold" style={{ color:COLORS.gray900 }}>
            📝 Quiz
          </h2>
          <p className="text-sm mt-0.5" style={{ color:COLORS.gray600 }}>
            {quiz.length} quiz disponible{quiz.length > 1 ? 's' : ''}
          </p>
        </div>
        {(role === 'admin' || role === 'enseignant') && (
          <button
            onClick={onNew}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold hover:opacity-90 transition-all"
            style={{ background:`linear-gradient(135deg, ${COLORS.primary}, #0052A3)`, color:'white' }}>
            + Nouveau quiz
          </button>
        )}
      </div>

      {/* ── FILTRES ────────────────────────────────────────────── */}
      <div className="flex items-center gap-3 flex-wrap mb-6">
        {/* Recherche */}
        <div className="relative flex-1 min-w-48">
          <span className="absolute inset-y-0 left-3 flex items-center text-gray-400">🔍</span>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher un quiz..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border text-sm focus:outline-none"
            style={{ borderColor:COLORS.gray200, backgroundColor:'white' }}
          />
        </div>

        {/* Filtre publication (admin/enseignant) */}
        {(role === 'admin' || role === 'enseignant') && (
          <div className="flex items-center gap-1 bg-white rounded-xl p-1" style={{ border:`1px solid ${COLORS.gray200}` }}>
            {[
              { value:'tous',      label:'Tous'       },
              { value:'publies',   label:'✅ Publiés'  },
              { value:'brouillons',label:'📝 Brouillons'},
            ].map(f => (
              <button key={f.value} onClick={() => setFiltrePub(f.value)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                style={{
                  backgroundColor: filtrePub === f.value ? COLORS.primary : 'transparent',
                  color:           filtrePub === f.value ? 'white' : COLORS.gray600,
                }}>
                {f.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── LISTE VIDE ─────────────────────────────────────────── */}
      {quizFiltres.length === 0 && (
        <div className="text-center py-20 bg-white rounded-2xl" style={{ border:`1px solid ${COLORS.gray200}` }}>
          <span className="text-6xl">📝</span>
          <p className="mt-4 font-bold text-lg" style={{ color:COLORS.gray800 }}>
            {search ? 'Aucun quiz trouvé' : 'Aucun quiz disponible'}
          </p>
          <p className="text-sm mt-1" style={{ color:COLORS.gray600 }}>
            {(role === 'admin' || role === 'enseignant')
              ? 'Créez votre premier quiz en cliquant sur "+ Nouveau quiz"'
              : 'Aucun quiz publié pour le moment'}
          </p>
        </div>
      )}

      {/* ── GRILLE QUIZ ────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {quizFiltres.map((q, i) => {
          const color      = getColor(q.titre);
          const difficulte = getDifficulteLabel(q.note_passage);
          const deja_passe = q.deja_passe || false;
          const tentative  = q.ma_tentative || null;

          return (
            <div key={q.id_quiz} className="quiz-card bg-white rounded-2xl overflow-hidden"
                 style={{ animationDelay:`${i * 40}ms`, border:`1px solid ${COLORS.gray200}`, boxShadow:'0 2px 8px rgba(0,0,0,0.06)' }}>

              {/* Bandeau couleur */}
              <div style={{ height:'6px', background:`linear-gradient(90deg, ${color}, ${color}99)` }} />

              <div className="p-5">
                {/* Header carte */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div style={{
                      width:'44px', height:'44px', borderRadius:'12px', flexShrink:0,
                      background:`${color}15`, display:'flex', alignItems:'center',
                      justifyContent:'center', fontSize:'1.4rem',
                    }}>
                      📝
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold truncate" style={{ color:COLORS.gray900, margin:0 }}>
                        {q.titre}
                      </p>
                      {q.filiere && (
                        <p style={{ fontSize:'0.75rem', color:COLORS.gray600, margin:0 }}>
                          🎓 {q.filiere} {q.niveau && `• ${q.niveau}`}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Badge publié/brouillon */}
                  {(role === 'admin' || role === 'enseignant') && (
                    <span style={{
                      fontSize:'0.7rem', fontWeight:'700', padding:'3px 8px',
                      borderRadius:'999px', flexShrink:0,
                      backgroundColor: q.est_publie ? '#F0FDF4' : COLORS.gray100,
                      color:           q.est_publie ? COLORS.secondary : COLORS.gray600,
                    }}>
                      {q.est_publie ? '✅ Publié' : '📝 Brouillon'}
                    </span>
                  )}
                </div>

                {/* Description */}
                {q.description && (
                  <p style={{ fontSize:'0.8rem', color:COLORS.gray600, margin:'0 0 12px', display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' }}>
                    {q.description}
                  </p>
                )}

                {/* Infos */}
                <div className="flex items-center gap-2 flex-wrap mb-4">
                  <span style={{ fontSize:'0.75rem', fontWeight:'600', padding:'3px 10px', borderRadius:'999px', backgroundColor:`${color}15`, color }}>
                    ⏱ {q.duree_minutes} min
                  </span>
                  <span style={{ fontSize:'0.75rem', fontWeight:'600', padding:'3px 10px', borderRadius:'999px', backgroundColor:COLORS.gray100, color:COLORS.gray700 }}>
                    ❓ {q.questions_count || 0} question{(q.questions_count || 0) > 1 ? 's' : ''}
                  </span>
                  <span style={{ fontSize:'0.75rem', fontWeight:'600', padding:'3px 10px', borderRadius:'999px', backgroundColor:difficulte.bg, color:difficulte.color }}>
                    {difficulte.label}
                  </span>
                </div>

                {/* Résultat étudiant si déjà passé */}
                {role === 'etudiant' && deja_passe && tentative && (
                  <div className="mb-4 p-3 rounded-xl" style={{
                    backgroundColor: tentative.est_reussi ? '#F0FDF4' : '#FFF7ED',
                    border:`1px solid ${tentative.est_reussi ? '#BBF7D0' : '#FED7AA'}`,
                  }}>
                    <div className="flex items-center justify-between">
                      <span style={{ fontSize:'0.8rem', fontWeight:'700', color:COLORS.gray700 }}>
                        {tentative.est_reussi ? '✅ Réussi' : '🔄 Non réussi'}
                      </span>
                      <span style={{ fontSize:'1rem', fontWeight:'900', color: tentative.est_reussi ? COLORS.secondary : COLORS.orange }}>
                        {tentative.note_sur_20}/20
                      </span>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-2">
                  {/* Étudiant → Passer le quiz */}
                  {role === 'etudiant' && (
                    <button onClick={() => onSelect(q)}
                      className="flex-1 py-2 rounded-xl text-sm font-bold hover:opacity-90 transition-all"
                      style={{ background:`linear-gradient(135deg, ${color}, ${color}CC)`, color:'white' }}>
                      {deja_passe ? '🔄 Repasser' : '▶ Commencer'}
                    </button>
                  )}

                  {/* Admin/Enseignant → Actions */}
                  {(role === 'admin' || role === 'enseignant') && (
                    <>
                      <button onClick={() => onSelect(q)}
                        className="flex-1 py-2 rounded-xl text-sm font-bold hover:opacity-90 transition-all"
                        style={{ background:`linear-gradient(135deg, ${color}, ${color}CC)`, color:'white' }}>
                        ✏️ Modifier
                      </button>
                      <button onClick={() => onStats(q)}
                        className="px-3 py-2 rounded-xl text-sm font-bold hover:opacity-80 transition-all"
                        style={{ backgroundColor:'#F5F3FF', color:COLORS.purple }}>
                        📊
                      </button>
                      <button onClick={() => handleTogglePublie(q)}
                        className="px-3 py-2 rounded-xl text-sm font-bold hover:opacity-80 transition-all"
                        style={{ backgroundColor: q.est_publie ? '#FEF3C7' : '#F0FDF4', color: q.est_publie ? '#D97706' : COLORS.secondary }}>
                        {q.est_publie ? '⏸' : '▶'}
                      </button>
                      <button onClick={() => handleDelete(q.id_quiz)}
                        disabled={deleting === q.id_quiz}
                        className="px-3 py-2 rounded-xl text-sm font-bold hover:opacity-80 transition-all"
                        style={{ backgroundColor:'#FEE2E2', color:COLORS.accent }}>
                        {deleting === q.id_quiz ? '...' : '🗑'}
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}