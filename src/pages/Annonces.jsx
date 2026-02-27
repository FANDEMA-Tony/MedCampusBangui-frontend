import { useState, useEffect } from 'react';
import { getUser } from '../utils/auth';
import Navbar from '../components/layout/Navbar';
import api from '../services/api';

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

export default function Annonces() {
  const user = getUser();

  const [form, setForm] = useState({
    sujet:          '',
    contenu:        '',
    destinataires:  'tous',
  });

  const [stats,     setStats]     = useState(null);
  const [sending,   setSending]   = useState(false);
  const [testing,   setTesting]   = useState(false);
  const [success,   setSuccess]   = useState('');
  const [error,     setError]     = useState('');

  useEffect(() => { fetchStats(); }, []);

  const fetchStats = async () => {
    try {
      const res = await api.get('/notifications/stats');
      setStats(res.data.data);
    } catch (err) {
      console.error('Erreur stats:', err);
    }
  };

  const handleSend = async () => {
    if (!form.sujet.trim() || !form.contenu.trim()) {
      setError('Le sujet et le contenu sont requis.');
      return;
    }
    try {
      setSending(true);
      setError('');
      setSuccess('');
      const res = await api.post('/notifications/annonce', form);
      setSuccess(res.data.message);
      setForm({ sujet:'', contenu:'', destinataires:'tous' });
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de l\'envoi');
    } finally {
      setSending(false);
    }
  };

  const handleTest = async () => {
    try {
      setTesting(true);
      setError('');
      setSuccess('');
      const res = await api.post('/notifications/test');
      setSuccess(res.data.message);
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur test email');
    } finally {
      setTesting(false);
    }
  };

  const nbDestinataires = () => {
    if (!stats) return 0;
    if (form.destinataires === 'etudiants')   return stats.nb_etudiants;
    if (form.destinataires === 'enseignants') return stats.nb_enseignants;
    return stats.nb_total;
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor:COLORS.gray50 }}>
      <Navbar />
      <style>{`
        @keyframes fadeInUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
        .anim{animation:fadeInUp 0.3s ease both}
        .input-field:focus{outline:none;border-color:${COLORS.primary} !important;box-shadow:0 0 0 3px rgba(0,102,204,0.15)}
      `}</style>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* ── HEADER ──────────────────────────────────────────── */}
        <div className="anim mb-6">
          <h1 className="text-2xl font-bold" style={{ color:COLORS.gray900 }}>📢 Annonces & Notifications</h1>
          <p className="text-sm mt-0.5" style={{ color:COLORS.gray600 }}>
            Envoyer des emails groupés à tous les utilisateurs
          </p>
        </div>

        {/* ── STATS ───────────────────────────────────────────── */}
        {stats && (
          <div className="grid grid-cols-3 gap-4 mb-6 anim" style={{ animationDelay:'40ms' }}>
            {[
              { icon:'👥', label:'Total',       value:stats.nb_total,       color:COLORS.primary,   bg:'#EFF6FF' },
              { icon:'🎓', label:'Étudiants',   value:stats.nb_etudiants,   color:COLORS.secondary, bg:'#F0FDF4' },
              { icon:'👨‍🏫', label:'Enseignants', value:stats.nb_enseignants, color:COLORS.purple,    bg:'#F5F3FF' },
            ].map((s, i) => (
              <div key={i} className="bg-white rounded-2xl p-4 shadow-sm"
                   style={{ border:`1px solid ${COLORS.gray200}` }}>
                <div className="flex items-center justify-between mb-2">
                  <div style={{ width:'36px', height:'36px', borderRadius:'10px', backgroundColor:s.bg, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.1rem' }}>
                    {s.icon}
                  </div>
                  <span style={{ fontSize:'1.4rem', fontWeight:'900', color:s.color }}>{s.value}</span>
                </div>
                <p style={{ fontSize:'0.75rem', fontWeight:'600', color:COLORS.gray600, margin:0 }}>{s.label}</p>
              </div>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ── FORMULAIRE ──────────────────────────────────────── */}
          <div className="lg:col-span-2 space-y-6">

            {/* Messages succès/erreur */}
            {success && (
              <div className="anim p-4 rounded-xl font-bold text-center"
                   style={{ backgroundColor:'#F0FDF4', color:COLORS.secondary, border:'1px solid #BBF7D0' }}>
                ✅ {success}
              </div>
            )}
            {error && (
              <div className="anim p-4 rounded-xl font-bold text-center"
                   style={{ backgroundColor:'#FEE2E2', color:COLORS.accent, border:'1px solid #FCA5A5' }}>
                ⚠️ {error}
              </div>
            )}

            <div className="anim bg-white rounded-2xl p-6" style={{ animationDelay:'80ms', border:`1px solid ${COLORS.gray200}` }}>
              <p style={{ fontSize:'0.75rem', fontWeight:'700', color:'#9CA3AF', textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:'20px' }}>
                ✍️ Rédiger l'annonce
              </p>

              {/* Destinataires */}
              <div className="mb-4">
                <label className="block text-sm font-semibold mb-2" style={{ color:COLORS.gray700 }}>
                  👥 Destinataires
                </label>
                <div className="flex gap-2">
                  {[
                    { value:'tous',        label:'👥 Tous',          count:stats?.nb_total       },
                    { value:'etudiants',   label:'🎓 Étudiants',     count:stats?.nb_etudiants   },
                    { value:'enseignants', label:'👨‍🏫 Enseignants',   count:stats?.nb_enseignants },
                  ].map(d => (
                    <button key={d.value} onClick={() => setForm(f => ({ ...f, destinataires:d.value }))}
                      className="flex-1 py-2.5 rounded-xl text-xs font-bold transition-all"
                      style={{
                        backgroundColor: form.destinataires === d.value ? COLORS.primary : COLORS.gray100,
                        color:           form.destinataires === d.value ? 'white' : COLORS.gray700,
                        border:          form.destinataires === d.value ? `1px solid ${COLORS.primary}` : `1px solid ${COLORS.gray200}`,
                      }}>
                      {d.label}
                      {d.count !== undefined && (
                        <span style={{ display:'block', fontSize:'0.65rem', opacity:0.8, marginTop:'2px' }}>
                          {d.count} personne{d.count > 1 ? 's' : ''}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sujet */}
              <div className="mb-4">
                <label className="block text-sm font-semibold mb-1.5" style={{ color:COLORS.gray700 }}>
                  📋 Sujet *
                </label>
                <input type="text"
                  value={form.sujet}
                  onChange={e => setForm(f => ({ ...f, sujet:e.target.value }))}
                  placeholder="Ex: Informations importantes — Rentrée académique 2026"
                  className="input-field w-full px-4 py-2.5 rounded-xl border text-sm"
                  style={{ borderColor:COLORS.gray200 }}
                />
              </div>

              {/* Contenu */}
              <div className="mb-6">
                <label className="block text-sm font-semibold mb-1.5" style={{ color:COLORS.gray700 }}>
                  ✏️ Contenu *
                </label>
                <textarea
                  value={form.contenu}
                  onChange={e => setForm(f => ({ ...f, contenu:e.target.value }))}
                  placeholder="Rédigez votre annonce ici..."
                  rows={8}
                  className="input-field w-full px-4 py-3 rounded-xl border text-sm resize-none"
                  style={{ borderColor:COLORS.gray200, lineHeight:'1.7' }}
                />
                <p style={{ fontSize:'0.72rem', color:COLORS.gray600, marginTop:'4px' }}>
                  {form.contenu.length} caractères
                </p>
              </div>

              {/* Bouton envoyer */}
              <button onClick={handleSend} disabled={sending || !form.sujet || !form.contenu}
                className="w-full py-3 rounded-xl font-bold hover:opacity-90 transition-all"
                style={{
                  background: `linear-gradient(135deg, ${COLORS.primary}, #0052A3)`,
                  color: 'white',
                  opacity: sending || !form.sujet || !form.contenu ? 0.6 : 1,
                }}>
                {sending
                  ? '⏳ Envoi en cours...'
                  : `📢 Envoyer à ${nbDestinataires()} personne${nbDestinataires() > 1 ? 's' : ''}`}
              </button>
            </div>
          </div>

          {/* ── COLONNE LATÉRALE ────────────────────────────────── */}
          <div className="space-y-6">

            {/* Test email */}
            <div className="anim bg-white rounded-2xl p-5" style={{ animationDelay:'120ms', border:`1px solid ${COLORS.gray200}` }}>
              <p style={{ fontSize:'0.75rem', fontWeight:'700', color:'#9CA3AF', textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:'14px' }}>
                🧪 Test SMTP
              </p>
              <p className="text-sm mb-4" style={{ color:COLORS.gray600 }}>
                Envoyer un email de test à votre adresse pour vérifier la configuration SMTP.
              </p>
              <button onClick={handleTest} disabled={testing}
                className="w-full py-2.5 rounded-xl font-bold hover:opacity-90 transition-all"
                style={{ backgroundColor:'#F0FDF4', color:COLORS.secondary, border:`1px solid #BBF7D0`, opacity:testing?0.7:1 }}>
                {testing ? '⏳ Envoi...' : '🧪 Tester l\'email'}
              </button>
            </div>

            {/* Conseils */}
            <div className="anim bg-white rounded-2xl p-5" style={{ animationDelay:'160ms', border:`1px solid ${COLORS.gray200}` }}>
              <p style={{ fontSize:'0.75rem', fontWeight:'700', color:'#9CA3AF', textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:'14px' }}>
                💡 Conseils
              </p>
              <div className="space-y-3">
                {[
                  { icon:'✅', text:'Soyez précis dans le sujet pour que l\'email ne soit pas ignoré' },
                  { icon:'📝', text:'Rédigez un contenu clair et concis' },
                  { icon:'👥', text:'Ciblez les bons destinataires pour éviter le spam' },
                  { icon:'🧪', text:'Testez toujours avant d\'envoyer en masse' },
                ].map((item, i) => (
                  <div key={i} style={{ display:'flex', gap:'8px', alignItems:'flex-start' }}>
                    <span style={{ fontSize:'0.9rem', flexShrink:0, marginTop:'1px' }}>{item.icon}</span>
                    <p style={{ fontSize:'0.78rem', color:COLORS.gray600, margin:0, lineHeight:'1.5' }}>{item.text}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Aperçu destinataires */}
            <div className="anim bg-white rounded-2xl p-5" style={{ animationDelay:'200ms', border:`1px solid ${COLORS.gray200}` }}>
              <p style={{ fontSize:'0.75rem', fontWeight:'700', color:'#9CA3AF', textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:'14px' }}>
                📊 Résumé envoi
              </p>
              <div style={{ display:'grid', gap:'8px' }}>
                {[
                  { label:'Destinataires',   value: form.destinataires === 'tous' ? 'Tous' : form.destinataires === 'etudiants' ? 'Étudiants' : 'Enseignants', color:COLORS.primary,   bg:'#EFF6FF' },
                  { label:'Nb emails',        value: nbDestinataires(),                                                                                          color:COLORS.secondary, bg:'#F0FDF4' },
                  { label:'Sujet renseigné',  value: form.sujet ? '✅ Oui' : '❌ Non',                                                                           color: form.sujet ? COLORS.secondary : COLORS.accent, bg: form.sujet ? '#F0FDF4' : '#FEE2E2' },
                  { label:'Contenu renseigné',value: form.contenu ? '✅ Oui' : '❌ Non',                                                                         color: form.contenu ? COLORS.secondary : COLORS.accent, bg: form.contenu ? '#F0FDF4' : '#FEE2E2' },
                ].map((item, i) => (
                  <div key={i} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'8px 12px', borderRadius:'10px', backgroundColor:item.bg }}>
                    <span style={{ fontSize:'0.75rem', fontWeight:'600', color:COLORS.gray600 }}>{item.label}</span>
                    <span style={{ fontWeight:'800', color:item.color, fontSize:'0.82rem' }}>{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}