import { useState, useEffect, useRef, useCallback } from 'react';
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

function formatTemps(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export default function QuizPassage({ quiz: quizMeta, onTermine, onAnnuler }) {
  const color = getColor(quizMeta?.titre || '');

  // ── States ────────────────────────────────────────────────────
  const [quiz,          setQuiz]         = useState(null);
  const [loading,       setLoading]      = useState(true);
  const [questionIdx,   setQuestionIdx]  = useState(0);
  const [reponses,      setReponses]     = useState({});
  const [tempsRestant,  setTempsRestant] = useState(0);
  const [tempsPris,     setTempsPris]    = useState(0);
  const [soumis,        setSoumis]       = useState(false);
  const [soumission,    setSoumission]   = useState(null);
  const [submitting,    setSubmitting]   = useState(false);
  const [confirmer,     setConfirmer]    = useState(false);
  const [libreTexte,    setLibreTexte]   = useState({});

  const timerRef    = useRef(null);
  const debutRef    = useRef(Date.now());

  // ── Charger quiz complet ──────────────────────────────────────
  useEffect(() => {
    fetchQuiz();
    return () => clearInterval(timerRef.current);
  }, []);

  const fetchQuiz = async () => {
    try {
      setLoading(true);
      const res = await quizService.getOne(quizMeta.id_quiz);
      const data = res.data.data;
      setQuiz(data);
      setTempsRestant((data.duree_minutes || 30) * 60);
      debutRef.current = Date.now();
    } catch (err) {
      console.error('Erreur chargement quiz:', err);
    } finally {
      setLoading(false);
    }
  };

  // ── Timer ─────────────────────────────────────────────────────
  useEffect(() => {
    if (!quiz || soumis) return;

    timerRef.current = setInterval(() => {
      setTempsRestant(t => {
        if (t <= 1) {
          clearInterval(timerRef.current);
          handleSoumettre(true); // auto-soumission
          return 0;
        }
        return t - 1;
      });
      setTempsPris(Math.floor((Date.now() - debutRef.current) / 1000));
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [quiz, soumis]);

  // ── Répondre à une question ───────────────────────────────────
  const handleReponse = (idQuestion, valeur) => {
    setReponses(r => ({ ...r, [idQuestion]: valeur }));
  };

  const handleLibreChange = (idQuestion, texte) => {
    setLibreTexte(t => ({ ...t, [idQuestion]: texte }));
    setReponses(r => ({ ...r, [idQuestion]: texte }));
  };

  // ── Soumettre ─────────────────────────────────────────────────
  const handleSoumettre = useCallback(async (autoSoumis = false) => {
    if (submitting) return;
    clearInterval(timerRef.current);

    try {
      setSubmitting(true);
      const res = await quizService.soumettre(quizMeta.id_quiz, {
        reponses:   reponses,
        temps_pris: tempsPris,
      });
      setSoumission(res.data.data);
      setSoumis(true);
    } catch (err) {
      console.error('Erreur soumission:', err);
    } finally {
      setSubmitting(false);
      setConfirmer(false);
    }
  }, [reponses, tempsPris, submitting]);

  // ── Calculs progression ───────────────────────────────────────
  const totalQuestions  = quiz?.questions?.length || 0;
  const nbRepondus      = Object.keys(reponses).length;
  const progression     = totalQuestions > 0 ? (nbRepondus / totalQuestions) * 100 : 0;
  const questionActuelle = quiz?.questions?.[questionIdx];
  const dureeTotal       = (quiz?.duree_minutes || 30) * 60;
  const timerPourcentage = dureeTotal > 0 ? (tempsRestant / dureeTotal) * 100 : 0;
  const timerCritique    = tempsRestant <= 60;
  const timerAvertissement = tempsRestant <= 300 && tempsRestant > 60;

  // ── ÉCRAN RÉSULTAT ────────────────────────────────────────────
  if (soumis && soumission) {
    const { note_sur_20, score, points_max, est_reussi, detail, quiz: quizInfo } = soumission;

    return (
      <div className="min-h-screen flex items-center justify-center p-4"
           style={{ backgroundColor: COLORS.gray50 }}>
        <style>{`
          @keyframes fadeInUp { from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)} }
          @keyframes scaleIn  { from{opacity:0;transform:scale(0.8)}to{opacity:1;transform:scale(1)} }
          .anim { animation: fadeInUp 0.4s ease both; }
          .scale-in { animation: scaleIn 0.5s ease both; }
        `}</style>

        <div className="w-full max-w-2xl">

          {/* Cercle résultat */}
          <div className="text-center mb-8 scale-in">
            <div style={{
              width:'140px', height:'140px', borderRadius:'50%', margin:'0 auto',
              background: est_reussi
                ? 'linear-gradient(135deg, #16A34A, #15803D)'
                : 'linear-gradient(135deg, #DC2626, #B91C1C)',
              display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
              boxShadow: est_reussi
                ? '0 12px 40px rgba(22,163,74,0.5)'
                : '0 12px 40px rgba(220,38,38,0.5)',
            }}>
              <span style={{ fontSize:'2.5rem', fontWeight:'900', color:'white', lineHeight:1 }}>
                {note_sur_20}
              </span>
              <span style={{ color:'rgba(255,255,255,0.8)', fontSize:'1rem', fontWeight:'600' }}>/20</span>
            </div>

            <h2 className="mt-4 text-2xl font-bold" style={{ color:COLORS.gray900 }}>
              {est_reussi ? '🎉 Félicitations !' : '😔 Pas encore réussi'}
            </h2>
            <p className="mt-1" style={{ color:COLORS.gray600 }}>
              {est_reussi
                ? `Vous avez réussi avec ${note_sur_20}/20`
                : `Note de passage : ${quizInfo?.note_passage}/20`}
            </p>
          </div>

          {/* Stats résultat */}
          <div className="grid grid-cols-3 gap-4 mb-6 anim" style={{ animationDelay:'100ms' }}>
            {[
              { icon:'🎯', label:'Score',    value:`${score}/${points_max}`, color:COLORS.primary,   bg:'#EFF6FF' },
              { icon:'⏱',  label:'Temps',   value:formatTemps(tempsPris),   color:COLORS.purple,    bg:'#F5F3FF' },
              { icon:'✅', label:'Correctes',value:`${Object.values(detail||{}).filter(d=>d.correct).length}/${totalQuestions}`, color:COLORS.secondary, bg:'#F0FDF4' },
            ].map((s, i) => (
              <div key={i} className="anim bg-white rounded-2xl p-4 text-center"
                   style={{ animationDelay:`${150+i*50}ms`, border:`1px solid ${COLORS.gray200}` }}>
                <div style={{ fontSize:'1.5rem', marginBottom:'4px' }}>{s.icon}</div>
                <div style={{ fontSize:'1.2rem', fontWeight:'900', color:s.color }}>{s.value}</div>
                <div style={{ fontSize:'0.72rem', fontWeight:'600', color:COLORS.gray600 }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Détail par question */}
          <div className="anim bg-white rounded-2xl overflow-hidden mb-6"
               style={{ animationDelay:'300ms', border:`1px solid ${COLORS.gray200}` }}>
            <div className="px-5 py-3" style={{ borderBottom:`1px solid ${COLORS.gray100}`, backgroundColor:COLORS.gray50 }}>
              <p style={{ fontSize:'0.75rem', fontWeight:'700', color:'#9CA3AF', textTransform:'uppercase', letterSpacing:'0.05em', margin:0 }}>
                📋 Détail des réponses
              </p>
            </div>
            <div className="divide-y" style={{ maxHeight:'300px', overflowY:'auto' }}>
              {quiz?.questions?.map((q, i) => {
                const d = detail?.[q.id_question];
                if (!d) return null;
                return (
                  <div key={q.id_question} className="px-5 py-3">
                    <div className="flex items-start gap-3">
                      <span style={{
                        width:'24px', height:'24px', borderRadius:'50%', flexShrink:0,
                        backgroundColor: d.correct ? '#F0FDF4' : '#FEE2E2',
                        color: d.correct ? COLORS.secondary : COLORS.accent,
                        display:'flex', alignItems:'center', justifyContent:'center',
                        fontSize:'0.75rem', fontWeight:'800',
                      }}>
                        {d.correct ? '✓' : '✗'}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold" style={{ color:COLORS.gray800, margin:'0 0 2px' }}>
                          {i+1}. {q.question}
                        </p>
                        <p style={{ fontSize:'0.75rem', color:COLORS.gray600, margin:0 }}>
                          Votre réponse : <span style={{ color: d.correct ? COLORS.secondary : COLORS.accent, fontWeight:'700' }}>
                            {d.reponse_etudiant || '—'}
                          </span>
                          {!d.correct && q.type !== 'libre' && (
                            <> &nbsp;•&nbsp; Correcte : <span style={{ color:COLORS.secondary, fontWeight:'700' }}>{d.reponse_correcte}</span></>
                          )}
                        </p>
                      </div>
                      <span style={{ fontSize:'0.72rem', fontWeight:'800', flexShrink:0, color: d.correct ? COLORS.secondary : COLORS.accent }}>
                        +{d.points_obtenus}/{d.points_max}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Bouton terminer */}
          <div className="anim text-center" style={{ animationDelay:'400ms' }}>
            <button onClick={() => onTermine(soumission)}
              className="px-8 py-3 rounded-xl font-bold hover:opacity-90 transition-all"
              style={{ background:`linear-gradient(135deg, ${color}, ${color}CC)`, color:'white' }}>
              ← Retour aux quiz
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── CHARGEMENT ────────────────────────────────────────────────
  if (loading || !quiz) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor:COLORS.gray50 }}>
        <div className="text-center">
          <div style={{ width:'56px', height:'56px', margin:'0 auto', borderRadius:'50%', border:'4px solid #E5EBF5', borderTop:`4px solid ${color}`, animation:'spin 0.9s linear infinite' }} />
          <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
          <p className="mt-4 font-medium" style={{ color:COLORS.gray600 }}>Chargement du quiz...</p>
        </div>
      </div>
    );
  }

  // ── MODAL CONFIRMATION SOUMISSION ────────────────────────────
  if (confirmer) {
    const nonRepondus = totalQuestions - nbRepondus;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
           style={{ backgroundColor:'rgba(0,0,0,0.5)' }}>
        <div className="bg-white rounded-2xl p-8 w-full max-w-md text-center shadow-2xl">
          <span className="text-5xl">📤</span>
          <h3 className="mt-4 text-xl font-bold" style={{ color:COLORS.gray900 }}>
            Soumettre le quiz ?
          </h3>
          {nonRepondus > 0 && (
            <div className="mt-3 p-3 rounded-xl" style={{ backgroundColor:'#FFF7ED', border:'1px solid #FED7AA' }}>
              <p className="text-sm font-semibold" style={{ color:COLORS.orange }}>
                ⚠️ {nonRepondus} question{nonRepondus > 1 ? 's' : ''} sans réponse
              </p>
            </div>
          )}
          <p className="mt-3 text-sm" style={{ color:COLORS.gray600 }}>
            Cette action est irréversible.
          </p>
          <div className="flex gap-3 mt-6">
            <button onClick={() => setConfirmer(false)}
              className="flex-1 py-3 rounded-xl font-bold hover:opacity-80"
              style={{ backgroundColor:COLORS.gray100, color:COLORS.gray700 }}>
              Annuler
            </button>
            <button onClick={() => handleSoumettre(false)} disabled={submitting}
              className="flex-1 py-3 rounded-xl font-bold hover:opacity-90"
              style={{ background:`linear-gradient(135deg, ${COLORS.primary}, #0052A3)`, color:'white', opacity:submitting?0.7:1 }}>
              {submitting ? '⏳...' : '✅ Confirmer'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── PASSAGE DU QUIZ ───────────────────────────────────────────
  return (
    <div className="min-h-screen" style={{ backgroundColor:COLORS.gray50 }}>
      <style>{`
        @keyframes fadeIn { from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)} }
        .question-anim { animation: fadeIn 0.25s ease both; }
        .option-btn { transition: all 0.15s ease; }
        .option-btn:hover { transform:translateX(4px); }
      `}</style>

      {/* ── BARRE SUPÉRIEURE ───────────────────────────────────── */}
      <div className="sticky top-0 z-10 bg-white shadow-sm">
        <div className="max-w-3xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4">

            {/* Titre quiz */}
            <div className="flex items-center gap-3 min-w-0">
              <div style={{ width:'36px', height:'36px', borderRadius:'10px', backgroundColor:`${color}15`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.1rem', flexShrink:0 }}>
                📝
              </div>
              <p className="font-bold text-sm truncate" style={{ color:COLORS.gray900, margin:0 }}>
                {quiz.titre}
              </p>
            </div>

            {/* Timer */}
            <div className="flex items-center gap-2 flex-shrink-0 px-4 py-2 rounded-xl"
                 style={{
                   backgroundColor: timerCritique ? '#FEE2E2' : timerAvertissement ? '#FFF7ED' : COLORS.gray100,
                   border:`1px solid ${timerCritique ? '#FCA5A5' : timerAvertissement ? '#FED7AA' : COLORS.gray200}`,
                 }}>
              <span style={{ fontSize:'1rem' }}>
                {timerCritique ? '🚨' : timerAvertissement ? '⚠️' : '⏱'}
              </span>
              <span style={{
                fontFamily:'monospace', fontSize:'1.1rem', fontWeight:'900',
                color: timerCritique ? COLORS.accent : timerAvertissement ? COLORS.orange : COLORS.gray800,
              }}>
                {formatTemps(tempsRestant)}
              </span>
            </div>

            {/* Bouton quitter */}
            <button onClick={onAnnuler}
              className="px-3 py-2 rounded-xl text-sm font-semibold hover:opacity-80 flex-shrink-0"
              style={{ backgroundColor:COLORS.gray100, color:COLORS.gray600 }}>
              ✕
            </button>
          </div>

          {/* Barre progression timer */}
          <div className="mt-2 rounded-full overflow-hidden" style={{ height:'4px', backgroundColor:COLORS.gray200 }}>
            <div style={{
              height:'100%', borderRadius:'999px',
              width:`${timerPourcentage}%`,
              backgroundColor: timerCritique ? COLORS.accent : timerAvertissement ? COLORS.orange : color,
              transition:'width 1s linear',
            }} />
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6">

        {/* ── PROGRESSION QUESTIONS ──────────────────────────── */}
        <div className="flex items-center gap-2 mb-6 flex-wrap">
          {quiz.questions.map((q, i) => {
            const repond = reponses[q.id_question] !== undefined;
            const active = i === questionIdx;
            return (
              <button key={i} onClick={() => setQuestionIdx(i)}
                style={{
                  width:'36px', height:'36px', borderRadius:'10px',
                  border:`2px solid ${active ? color : repond ? COLORS.secondary : COLORS.gray300}`,
                  backgroundColor: active ? color : repond ? '#F0FDF4' : 'white',
                  color: active ? 'white' : repond ? COLORS.secondary : COLORS.gray600,
                  fontWeight:'800', fontSize:'0.8rem', cursor:'pointer',
                  transition:'all 0.15s ease',
                }}>
                {i + 1}
              </button>
            );
          })}

          {/* Badge progression */}
          <span className="ml-auto text-sm font-bold" style={{ color:COLORS.gray600 }}>
            {nbRepondus}/{totalQuestions} répondu{nbRepondus > 1 ? 's' : ''}
          </span>
        </div>

        {/* Barre progression globale */}
        <div className="mb-6 rounded-full overflow-hidden" style={{ height:'6px', backgroundColor:COLORS.gray200 }}>
          <div style={{ height:'100%', borderRadius:'999px', width:`${progression}%`, backgroundColor:COLORS.secondary, transition:'width 0.3s ease' }} />
        </div>

        {/* ── QUESTION ACTIVE ────────────────────────────────── */}
        {questionActuelle && (
          <div key={questionIdx} className="question-anim bg-white rounded-2xl p-6 mb-6"
               style={{ border:`1px solid ${COLORS.gray200}`, boxShadow:'0 2px 12px rgba(0,0,0,0.06)' }}>

            {/* Header question */}
            <div className="flex items-start gap-3 mb-6">
              <div style={{ width:'36px', height:'36px', borderRadius:'10px', backgroundColor:`${color}15`, color, display:'flex', alignItems:'center', justifyContent:'center', fontWeight:'900', fontSize:'0.9rem', flexShrink:0 }}>
                {questionIdx + 1}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <span style={{ fontSize:'0.7rem', fontWeight:'700', padding:'2px 8px', borderRadius:'999px', backgroundColor: questionActuelle.type === 'qcm' ? '#EFF6FF' : questionActuelle.type === 'vrai_faux' ? '#F0FDF4' : '#FFF7ED', color: questionActuelle.type === 'qcm' ? COLORS.primary : questionActuelle.type === 'vrai_faux' ? COLORS.secondary : COLORS.orange }}>
                    {questionActuelle.type === 'qcm' ? 'QCM' : questionActuelle.type === 'vrai_faux' ? 'Vrai / Faux' : 'Réponse libre'}
                  </span>
                  <span style={{ fontSize:'0.7rem', fontWeight:'700', padding:'2px 8px', borderRadius:'999px', backgroundColor:'#F5F3FF', color:COLORS.purple }}>
                    {questionActuelle.points} pt{questionActuelle.points > 1 ? 's' : ''}
                  </span>
                </div>
                <p className="text-base font-bold" style={{ color:COLORS.gray900, margin:0 }}>
                  {questionActuelle.question}
                </p>
              </div>
            </div>

            {/* ── QCM ─────────────────────────────────────────── */}
            {questionActuelle.type === 'qcm' && (
              <div className="space-y-3">
                {(questionActuelle.options || []).filter(o => o).map((opt, i) => {
                  const selected = reponses[questionActuelle.id_question] === opt;
                  return (
                    <button key={i} onClick={() => handleReponse(questionActuelle.id_question, opt)}
                      className="option-btn w-full text-left px-5 py-3.5 rounded-xl font-semibold transition-all"
                      style={{
                        border:`2px solid ${selected ? color : COLORS.gray200}`,
                        backgroundColor: selected ? `${color}10` : 'white',
                        color: selected ? color : COLORS.gray700,
                      }}>
                      <div className="flex items-center gap-3">
                        <span style={{ width:'28px', height:'28px', borderRadius:'50%', border:`2px solid ${selected ? color : COLORS.gray300}`, backgroundColor: selected ? color : 'white', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, color:'white', fontSize:'0.75rem', fontWeight:'800' }}>
                          {selected && '✓'}
                        </span>
                        {opt}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {/* ── VRAI / FAUX ──────────────────────────────────── */}
            {questionActuelle.type === 'vrai_faux' && (
              <div className="flex gap-4">
                {['Vrai', 'Faux'].map(val => {
                  const selected = reponses[questionActuelle.id_question] === val;
                  return (
                    <button key={val} onClick={() => handleReponse(questionActuelle.id_question, val)}
                      className="flex-1 py-5 rounded-2xl font-bold text-lg transition-all hover:opacity-90"
                      style={{
                        border:`2px solid ${selected ? (val === 'Vrai' ? COLORS.secondary : COLORS.accent) : COLORS.gray200}`,
                        backgroundColor: selected ? (val === 'Vrai' ? '#F0FDF4' : '#FEE2E2') : 'white',
                        color: selected ? (val === 'Vrai' ? COLORS.secondary : COLORS.accent) : COLORS.gray600,
                        transform: selected ? 'scale(1.02)' : 'scale(1)',
                      }}>
                      {val === 'Vrai' ? '✅ Vrai' : '❌ Faux'}
                    </button>
                  );
                })}
              </div>
            )}

            {/* ── RÉPONSE LIBRE ────────────────────────────────── */}
            {questionActuelle.type === 'libre' && (
              <div>
                <textarea
                  value={libreTexte[questionActuelle.id_question] || ''}
                  onChange={e => handleLibreChange(questionActuelle.id_question, e.target.value)}
                  placeholder="Écrivez votre réponse ici..."
                  rows={5}
                  className="w-full px-4 py-3 rounded-xl border text-sm resize-none focus:outline-none"
                  style={{ borderColor: reponses[questionActuelle.id_question] ? color : COLORS.gray300, focusBorderColor:color }}
                />
                <p className="text-xs mt-1" style={{ color:COLORS.gray600 }}>
                  ℹ️ Les réponses libres sont acceptées automatiquement
                </p>
              </div>
            )}
          </div>
        )}

        {/* ── NAVIGATION ─────────────────────────────────────── */}
        <div className="flex items-center justify-between gap-4">
          <button
            onClick={() => setQuestionIdx(i => Math.max(0, i - 1))}
            disabled={questionIdx === 0}
            className="px-5 py-2.5 rounded-xl font-bold hover:opacity-80 transition-all"
            style={{ backgroundColor:COLORS.gray100, color:COLORS.gray700, opacity: questionIdx === 0 ? 0.4 : 1 }}>
            ← Précédent
          </button>

          <span style={{ fontSize:'0.85rem', fontWeight:'600', color:COLORS.gray600 }}>
            {questionIdx + 1} / {totalQuestions}
          </span>

          {questionIdx < totalQuestions - 1 ? (
            <button
              onClick={() => setQuestionIdx(i => Math.min(totalQuestions - 1, i + 1))}
              className="px-5 py-2.5 rounded-xl font-bold hover:opacity-90 transition-all"
              style={{ background:`linear-gradient(135deg, ${color}, ${color}CC)`, color:'white' }}>
              Suivant →
            </button>
          ) : (
            <button
              onClick={() => setConfirmer(true)}
              disabled={submitting}
              className="px-6 py-2.5 rounded-xl font-bold hover:opacity-90 transition-all"
              style={{ background:`linear-gradient(135deg, ${COLORS.primary}, #0052A3)`, color:'white' }}>
              📤 Soumettre
            </button>
          )}
        </div>
      </div>
    </div>
  );
}