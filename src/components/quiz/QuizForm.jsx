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
  gray300:   '#D1D5DB',
  gray600:   '#4B5563',
  gray700:   '#374151',
  gray800:   '#1F2937',
  gray900:   '#111827',
};

const FILIERES = ['DFGSM','DFASM','Pharmacie','Odontologie','Sage-femme'];
const NIVEAUX  = ['L1','L2','L3','M1','M2','M3','D1','D2','D3'];

const QUESTION_VIDE = {
  question:         '',
  type:             'qcm',
  options:          ['', '', '', ''],
  reponse_correcte: '',
  points:           1,
};

export default function QuizForm({ quiz = null, onSave, onCancel }) {
  const isEdit = quiz !== null;

  // ── State formulaire principal ────────────────────────────────
  const [form, setForm] = useState({
    titre:         quiz?.titre         || '',
    description:   quiz?.description   || '',
    filiere:       quiz?.filiere        || '',
    niveau:        quiz?.niveau         || '',
    duree_minutes: quiz?.duree_minutes  || 30,
    note_passage:  quiz?.note_passage   || 10,
    est_publie:    quiz?.est_publie     || false,
  });

  // ── State questions ───────────────────────────────────────────
  const [questions,   setQuestions]   = useState([]);
  const [activeQ,     setActiveQ]     = useState(null); // index question active
  const [saving,      setSaving]      = useState(false);
  const [errors,      setErrors]      = useState({});
  const [successMsg,  setSuccessMsg]  = useState('');

  useEffect(() => {
    if (isEdit && quiz.questions) {
      setQuestions(quiz.questions.map(q => ({
        id_question:      q.id_question,
        question:         q.question,
        type:             q.type,
        options:          q.options || ['', '', '', ''],
        reponse_correcte: q.reponse_correcte,
        points:           q.points || 1,
      })));
    }
  }, [quiz]);

  // ── Helpers form ──────────────────────────────────────────────
  const setField = (key, value) => {
    setForm(f => ({ ...f, [key]: value }));
    setErrors(e => ({ ...e, [key]: null }));
  };

  // ── Helpers questions ─────────────────────────────────────────
  const addQuestion = () => {
    const newQ = { ...QUESTION_VIDE, options: ['', '', '', ''] };
    setQuestions(qs => [...qs, newQ]);
    setActiveQ(questions.length);
  };

  const removeQuestion = (idx) => {
    setQuestions(qs => qs.filter((_, i) => i !== idx));
    setActiveQ(null);
  };

  const setQuestionField = (idx, key, value) => {
    setQuestions(qs => qs.map((q, i) =>
      i === idx ? { ...q, [key]: value } : q
    ));
  };

  const setOption = (qIdx, optIdx, value) => {
    setQuestions(qs => qs.map((q, i) => {
      if (i !== qIdx) return q;
      const opts = [...(q.options || [])];
      opts[optIdx] = value;
      return { ...q, options: opts };
    }));
  };

  const addOption = (qIdx) => {
    setQuestions(qs => qs.map((q, i) =>
      i === qIdx ? { ...q, options: [...(q.options || []), ''] } : q
    ));
  };

  const removeOption = (qIdx, optIdx) => {
    setQuestions(qs => qs.map((q, i) => {
      if (i !== qIdx) return q;
      const opts = q.options.filter((_, j) => j !== optIdx);
      return { ...q, options: opts };
    }));
  };

  // ── Validation ────────────────────────────────────────────────
  const validate = () => {
    const e = {};
    if (!form.titre.trim()) e.titre = 'Le titre est requis';
    if (form.duree_minutes < 1) e.duree_minutes = 'Durée invalide';
    if (form.note_passage < 0 || form.note_passage > 20) e.note_passage = 'Note entre 0 et 20';
    questions.forEach((q, i) => {
      if (!q.question.trim()) e[`q_${i}`] = 'Question requise';
      if (q.type === 'qcm' && !q.reponse_correcte) e[`qr_${i}`] = 'Réponse correcte requise';
      if (q.type === 'vrai_faux' && !q.reponse_correcte) e[`qr_${i}`] = 'Réponse correcte requise';
    });
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // ── Sauvegarde ────────────────────────────────────────────────
  const handleSave = async () => {
    if (!validate()) return;
    try {
      setSaving(true);
      const payload = { ...form, questions };
      let res;
      if (isEdit) {
        await quizService.update(quiz.id_quiz, form);
        // Sync questions
        for (const q of questions) {
          if (q.id_question) {
            await quizService.updateQuestion(q.id_question, q);
          } else {
            await quizService.addQuestion(quiz.id_quiz, q);
          }
        }
        res = { data: { message: 'Quiz mis à jour avec succès' } };
      } else {
        res = await quizService.create(payload);
      }
      setSuccessMsg(isEdit ? 'Quiz mis à jour ✅' : 'Quiz créé ✅');
      setTimeout(() => onSave(), 1200);
    } catch (err) {
      console.error('Erreur sauvegarde:', err);
      setErrors({ global: err.response?.data?.message || 'Erreur lors de la sauvegarde' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <style>{`
        .input-field:focus { outline:none; border-color:${COLORS.primary} !important; box-shadow:0 0 0 3px rgba(0,102,204,0.15); }
        .q-card { transition: all 0.2s ease; }
        .q-card:hover { box-shadow:0 4px 12px rgba(0,0,0,0.08) !important; }
      `}</style>

      {/* ── HEADER ───────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold" style={{ color:COLORS.gray900 }}>
            {isEdit ? '✏️ Modifier le quiz' : '📝 Nouveau quiz'}
          </h2>
          <p className="text-sm mt-0.5" style={{ color:COLORS.gray600 }}>
            {isEdit ? `Modification de "${quiz.titre}"` : 'Créez un quiz avec questions'}
          </p>
        </div>
        <button onClick={onCancel}
          className="px-4 py-2 rounded-xl text-sm font-semibold hover:opacity-80 transition-all"
          style={{ backgroundColor:COLORS.gray100, color:COLORS.gray700 }}>
          ✕ Annuler
        </button>
      </div>

      {/* ── MESSAGE SUCCÈS ───────────────────────────────────── */}
      {successMsg && (
        <div className="mb-4 p-4 rounded-xl text-center font-bold"
             style={{ backgroundColor:'#F0FDF4', color:COLORS.secondary, border:'1px solid #BBF7D0' }}>
          {successMsg}
        </div>
      )}

      {/* ── ERREUR GLOBALE ───────────────────────────────────── */}
      {errors.global && (
        <div className="mb-4 p-4 rounded-xl text-center font-bold"
             style={{ backgroundColor:'#FEE2E2', color:COLORS.accent, border:'1px solid #FCA5A5' }}>
          ⚠️ {errors.global}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── COLONNE PRINCIPALE ─────────────────────────────── */}
        <div className="lg:col-span-2 space-y-6">

          {/* INFOS GÉNÉRALES */}
          <div className="bg-white rounded-2xl p-6" style={{ border:`1px solid ${COLORS.gray200}` }}>
            <p style={{ fontSize:'0.75rem', fontWeight:'700', color:'#9CA3AF', textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:'16px' }}>
              📋 Informations générales
            </p>

            {/* Titre */}
            <div className="mb-4">
              <label className="block text-sm font-semibold mb-1.5" style={{ color:COLORS.gray700 }}>
                Titre du quiz *
              </label>
              <input
                type="text"
                value={form.titre}
                onChange={e => setField('titre', e.target.value)}
                placeholder="Ex: Quiz d'anatomie — Semestre 1"
                className="input-field w-full px-4 py-2.5 rounded-xl border text-sm"
                style={{ borderColor: errors.titre ? COLORS.accent : COLORS.gray300 }}
              />
              {errors.titre && <p className="text-xs mt-1" style={{ color:COLORS.accent }}>{errors.titre}</p>}
            </div>

            {/* Description */}
            <div className="mb-4">
              <label className="block text-sm font-semibold mb-1.5" style={{ color:COLORS.gray700 }}>
                Description
              </label>
              <textarea
                value={form.description}
                onChange={e => setField('description', e.target.value)}
                placeholder="Description optionnelle du quiz..."
                rows={3}
                className="input-field w-full px-4 py-2.5 rounded-xl border text-sm resize-none"
                style={{ borderColor:COLORS.gray300 }}
              />
            </div>

            {/* Filière + Niveau */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-1.5" style={{ color:COLORS.gray700 }}>
                  Filière
                </label>
                <select
                  value={form.filiere}
                  onChange={e => setField('filiere', e.target.value)}
                  className="input-field w-full px-4 py-2.5 rounded-xl border text-sm"
                  style={{ borderColor:COLORS.gray300 }}>
                  <option value="">Toutes les filières</option>
                  {FILIERES.map(f => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1.5" style={{ color:COLORS.gray700 }}>
                  Niveau
                </label>
                <select
                  value={form.niveau}
                  onChange={e => setField('niveau', e.target.value)}
                  className="input-field w-full px-4 py-2.5 rounded-xl border text-sm"
                  style={{ borderColor:COLORS.gray300 }}>
                  <option value="">Tous les niveaux</option>
                  {NIVEAUX.map(n => <option key={n} value={n}>{n}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* ── QUESTIONS ──────────────────────────────────────── */}
          <div className="bg-white rounded-2xl p-6" style={{ border:`1px solid ${COLORS.gray200}` }}>
            <div className="flex items-center justify-between mb-4">
              <p style={{ fontSize:'0.75rem', fontWeight:'700', color:'#9CA3AF', textTransform:'uppercase', letterSpacing:'0.05em' }}>
                ❓ Questions ({questions.length})
              </p>
              <button onClick={addQuestion}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold hover:opacity-90 transition-all"
                style={{ backgroundColor:COLORS.primary, color:'white' }}>
                + Ajouter
              </button>
            </div>

            {questions.length === 0 && (
              <div className="text-center py-10 rounded-xl" style={{ backgroundColor:COLORS.gray50, border:`2px dashed ${COLORS.gray300}` }}>
                <span className="text-4xl">❓</span>
                <p className="mt-2 text-sm font-semibold" style={{ color:COLORS.gray600 }}>
                  Aucune question — cliquez sur "+ Ajouter"
                </p>
              </div>
            )}

            <div className="space-y-4">
              {questions.map((q, idx) => (
                <div key={idx} className="q-card rounded-xl overflow-hidden"
                     style={{ border:`1.5px solid ${activeQ === idx ? COLORS.primary : COLORS.gray200}` }}>

                  {/* Header question */}
                  <div
                    className="flex items-center justify-between px-4 py-3 cursor-pointer"
                    style={{ backgroundColor: activeQ === idx ? '#EFF6FF' : COLORS.gray50 }}
                    onClick={() => setActiveQ(activeQ === idx ? null : idx)}>
                    <div className="flex items-center gap-3 min-w-0">
                      <span style={{ width:'24px', height:'24px', borderRadius:'50%', backgroundColor: activeQ === idx ? COLORS.primary : COLORS.gray300, color:'white', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'0.75rem', fontWeight:'800', flexShrink:0 }}>
                        {idx + 1}
                      </span>
                      <p className="text-sm font-semibold truncate" style={{ color:COLORS.gray800, margin:0 }}>
                        {q.question || 'Nouvelle question...'}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span style={{ fontSize:'0.7rem', fontWeight:'700', padding:'2px 8px', borderRadius:'999px', backgroundColor: q.type === 'qcm' ? '#EFF6FF' : q.type === 'vrai_faux' ? '#F0FDF4' : '#FFF7ED', color: q.type === 'qcm' ? COLORS.primary : q.type === 'vrai_faux' ? COLORS.secondary : COLORS.orange }}>
                        {q.type === 'qcm' ? 'QCM' : q.type === 'vrai_faux' ? 'V/F' : 'Libre'}
                      </span>
                      <button onClick={(e) => { e.stopPropagation(); removeQuestion(idx); }}
                        className="w-6 h-6 rounded-lg flex items-center justify-center text-xs hover:opacity-80"
                        style={{ backgroundColor:'#FEE2E2', color:COLORS.accent }}>
                        ✕
                      </button>
                    </div>
                  </div>

                  {/* Corps question (si active) */}
                  {activeQ === idx && (
                    <div className="p-4 space-y-4">

                      {/* Texte question */}
                      <div>
                        <label className="block text-xs font-semibold mb-1" style={{ color:COLORS.gray600 }}>
                          Question *
                        </label>
                        <textarea
                          value={q.question}
                          onChange={e => setQuestionField(idx, 'question', e.target.value)}
                          placeholder="Entrez votre question..."
                          rows={2}
                          className="input-field w-full px-3 py-2 rounded-xl border text-sm resize-none"
                          style={{ borderColor: errors[`q_${idx}`] ? COLORS.accent : COLORS.gray300 }}
                        />
                        {errors[`q_${idx}`] && <p className="text-xs mt-1" style={{ color:COLORS.accent }}>{errors[`q_${idx}`]}</p>}
                      </div>

                      {/* Type + Points */}
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-semibold mb-1" style={{ color:COLORS.gray600 }}>Type</label>
                          <select value={q.type}
                            onChange={e => setQuestionField(idx, 'type', e.target.value)}
                            className="input-field w-full px-3 py-2 rounded-xl border text-sm"
                            style={{ borderColor:COLORS.gray300 }}>
                            <option value="qcm">QCM — Choix multiple</option>
                            <option value="vrai_faux">Vrai / Faux</option>
                            <option value="libre">Réponse libre</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-semibold mb-1" style={{ color:COLORS.gray600 }}>Points</label>
                          <input type="number" min={1} max={10}
                            value={q.points}
                            onChange={e => setQuestionField(idx, 'points', parseInt(e.target.value))}
                            className="input-field w-full px-3 py-2 rounded-xl border text-sm"
                            style={{ borderColor:COLORS.gray300 }}
                          />
                        </div>
                      </div>

                      {/* Options QCM */}
                      {q.type === 'qcm' && (
                        <div>
                          <label className="block text-xs font-semibold mb-2" style={{ color:COLORS.gray600 }}>
                            Options de réponse
                          </label>
                          <div className="space-y-2">
                            {(q.options || []).map((opt, oi) => (
                              <div key={oi} className="flex items-center gap-2">
                                <input
                                  type="radio"
                                  name={`correct_${idx}`}
                                  checked={q.reponse_correcte === opt}
                                  onChange={() => setQuestionField(idx, 'reponse_correcte', opt)}
                                  style={{ accentColor:COLORS.secondary, flexShrink:0 }}
                                />
                                <input type="text"
                                  value={opt}
                                  onChange={e => setOption(idx, oi, e.target.value)}
                                  placeholder={`Option ${oi + 1}`}
                                  className="input-field flex-1 px-3 py-2 rounded-xl border text-sm"
                                  style={{ borderColor: q.reponse_correcte === opt ? COLORS.secondary : COLORS.gray300 }}
                                />
                                {(q.options || []).length > 2 && (
                                  <button onClick={() => removeOption(idx, oi)}
                                    className="w-7 h-7 rounded-lg flex items-center justify-center text-xs hover:opacity-80 flex-shrink-0"
                                    style={{ backgroundColor:'#FEE2E2', color:COLORS.accent }}>
                                    ✕
                                  </button>
                                )}
                              </div>
                            ))}
                            <button onClick={() => addOption(idx)}
                              className="text-xs font-semibold hover:opacity-80"
                              style={{ color:COLORS.primary }}>
                              + Ajouter une option
                            </button>
                          </div>
                          {errors[`qr_${idx}`] && <p className="text-xs mt-1" style={{ color:COLORS.accent }}>{errors[`qr_${idx}`]}</p>}
                        </div>
                      )}

                      {/* Vrai / Faux */}
                      {q.type === 'vrai_faux' && (
                        <div>
                          <label className="block text-xs font-semibold mb-2" style={{ color:COLORS.gray600 }}>
                            Réponse correcte
                          </label>
                          <div className="flex gap-3">
                            {['Vrai', 'Faux'].map(val => (
                              <button key={val}
                                onClick={() => setQuestionField(idx, 'reponse_correcte', val)}
                                className="flex-1 py-2.5 rounded-xl text-sm font-bold transition-all"
                                style={{
                                  backgroundColor: q.reponse_correcte === val
                                    ? (val === 'Vrai' ? COLORS.secondary : COLORS.accent)
                                    : COLORS.gray100,
                                  color: q.reponse_correcte === val ? 'white' : COLORS.gray600,
                                }}>
                                {val === 'Vrai' ? '✅ Vrai' : '❌ Faux'}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Réponse libre */}
                      {q.type === 'libre' && (
                        <div>
                          <label className="block text-xs font-semibold mb-1" style={{ color:COLORS.gray600 }}>
                            Réponse attendue (référence)
                          </label>
                          <textarea
                            value={q.reponse_correcte}
                            onChange={e => setQuestionField(idx, 'reponse_correcte', e.target.value)}
                            placeholder="Réponse de référence..."
                            rows={2}
                            className="input-field w-full px-3 py-2 rounded-xl border text-sm resize-none"
                            style={{ borderColor:COLORS.gray300 }}
                          />
                          <p className="text-xs mt-1" style={{ color:COLORS.orange }}>
                            ℹ️ Les réponses libres sont comptées comme correctes automatiquement
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── COLONNE LATÉRALE ───────────────────────────────── */}
        <div className="space-y-6">

          {/* PARAMÈTRES */}
          <div className="bg-white rounded-2xl p-5" style={{ border:`1px solid ${COLORS.gray200}` }}>
            <p style={{ fontSize:'0.75rem', fontWeight:'700', color:'#9CA3AF', textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:'16px' }}>
              ⚙️ Paramètres
            </p>

            {/* Durée */}
            <div className="mb-4">
              <label className="block text-sm font-semibold mb-1.5" style={{ color:COLORS.gray700 }}>
                ⏱ Durée (minutes)
              </label>
              <input type="number" min={1} max={180}
                value={form.duree_minutes}
                onChange={e => setField('duree_minutes', parseInt(e.target.value))}
                className="input-field w-full px-4 py-2.5 rounded-xl border text-sm"
                style={{ borderColor: errors.duree_minutes ? COLORS.accent : COLORS.gray300 }}
              />
              {errors.duree_minutes && <p className="text-xs mt-1" style={{ color:COLORS.accent }}>{errors.duree_minutes}</p>}
            </div>

            {/* Note de passage */}
            <div className="mb-4">
              <label className="block text-sm font-semibold mb-1.5" style={{ color:COLORS.gray700 }}>
                🎯 Note de passage /20
              </label>
              <input type="number" min={0} max={20} step={0.5}
                value={form.note_passage}
                onChange={e => setField('note_passage', parseFloat(e.target.value))}
                className="input-field w-full px-4 py-2.5 rounded-xl border text-sm"
                style={{ borderColor: errors.note_passage ? COLORS.accent : COLORS.gray300 }}
              />
              {errors.note_passage && <p className="text-xs mt-1" style={{ color:COLORS.accent }}>{errors.note_passage}</p>}
            </div>

            {/* Publier */}
            <div className="flex items-center justify-between p-3 rounded-xl"
                 style={{ backgroundColor: form.est_publie ? '#F0FDF4' : COLORS.gray50, border:`1px solid ${form.est_publie ? '#BBF7D0' : COLORS.gray200}` }}>
              <div>
                <p className="text-sm font-bold" style={{ color:COLORS.gray800, margin:0 }}>
                  {form.est_publie ? '✅ Publié' : '📝 Brouillon'}
                </p>
                <p style={{ fontSize:'0.72rem', color:COLORS.gray600, margin:0 }}>
                  {form.est_publie ? 'Visible par les étudiants' : 'Non visible'}
                </p>
              </div>
              <button
                onClick={() => setField('est_publie', !form.est_publie)}
                style={{
                  width:'44px', height:'24px', borderRadius:'999px', border:'none', cursor:'pointer',
                  backgroundColor: form.est_publie ? COLORS.secondary : COLORS.gray300,
                  position:'relative', transition:'all 0.2s',
                }}>
                <span style={{
                  position:'absolute', top:'2px',
                  left: form.est_publie ? '22px' : '2px',
                  width:'20px', height:'20px', borderRadius:'50%',
                  backgroundColor:'white', transition:'all 0.2s',
                  boxShadow:'0 1px 4px rgba(0,0,0,0.2)',
                }} />
              </button>
            </div>
          </div>

          {/* RÉCAP */}
          <div className="bg-white rounded-2xl p-5" style={{ border:`1px solid ${COLORS.gray200}` }}>
            <p style={{ fontSize:'0.75rem', fontWeight:'700', color:'#9CA3AF', textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:'14px' }}>
              📊 Récapitulatif
            </p>
            <div className="space-y-2">
              {[
                { label:'Questions', value:questions.length,       bg:'#EFF6FF', color:COLORS.primary   },
                { label:'Durée',     value:`${form.duree_minutes} min`, bg:'#F5F3FF', color:COLORS.purple    },
                { label:'Passage',   value:`${form.note_passage}/20`,   bg:'#FFF7ED', color:COLORS.orange    },
                { label:'Points max',value: questions.reduce((s, q) => s + (q.points || 1), 0), bg:'#F0FDF4', color:COLORS.secondary },
              ].map((item, i) => (
                <div key={i} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'8px 12px', borderRadius:'10px', backgroundColor:item.bg }}>
                  <span style={{ fontSize:'0.78rem', fontWeight:'600', color:COLORS.gray600 }}>{item.label}</span>
                  <span style={{ fontWeight:'800', color:item.color }}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ACTIONS */}
          <div className="space-y-3">
            <button onClick={handleSave} disabled={saving}
              className="w-full py-3 rounded-xl font-bold hover:opacity-90 transition-all"
              style={{ background:`linear-gradient(135deg, ${COLORS.primary}, #0052A3)`, color:'white', opacity: saving ? 0.7 : 1 }}>
              {saving ? '⏳ Sauvegarde...' : isEdit ? '💾 Mettre à jour' : '🚀 Créer le quiz'}
            </button>
            <button onClick={onCancel}
              className="w-full py-3 rounded-xl font-bold hover:opacity-80 transition-all"
              style={{ backgroundColor:COLORS.gray100, color:COLORS.gray700 }}>
              Annuler
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}