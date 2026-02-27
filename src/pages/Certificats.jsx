import { useState, useEffect } from 'react';
import { getUser } from '../utils/auth';
import Navbar from '../components/layout/Navbar';
import CertificatViewer from '../components/certificats/CertificatViewer';
import { certificatService } from '../services/api';

// 🎨 PALETTE
const COLORS = {
  primary:   '#0066CC',
  secondary: '#00A86B',
  accent:    '#DC143C',
  purple:    '#8B5CF6',
  orange:    '#F97316',
  gold:      '#B8860B',
  gray50:    '#F9FAFB',
  gray100:   '#F3F4F6',
  gray200:   '#E5E7EB',
  gray600:   '#4B5563',
  gray700:   '#374151',
  gray800:   '#1F2937',
  gray900:   '#111827',
};

const MENTION_COLORS = {
  'Très Bien':   { color:'#059669', bg:'#D1FAE5' },
  'Bien':        { color:'#0066CC', bg:'#DBEAFE' },
  'Assez Bien':  { color:'#7C3AED', bg:'#EDE9FE' },
  'Passable':    { color:'#D97706', bg:'#FEF3C7' },
  'Insuffisant': { color:'#DC143C', bg:'#FEE2E2' },
};

export default function Certificats() {
  const user = getUser();
  const role = user?.role;

  const [vue,            setVue]           = useState('liste');    // liste | eligibilite | viewer | signer | tous
  const [certificats,    setCertificats]   = useState([]);
  const [eligibilite,    setEligibilite]   = useState(null);
  const [certSelec,      setCertSelec]     = useState(null);
  const [loading,        setLoading]       = useState(true);
  const [generating,     setGenerating]    = useState(null);
  const [tous,           setTous]          = useState([]);

  // Signature form
  const [signeForm, setSigneForm] = useState({
    nom_responsable:   '',
    titre_responsable: '',
    signature_base64:  '',
  });
  const [signing, setSigning] = useState(false);
  const [signSuccess, setSignSuccess] = useState('');

  useEffect(() => {
    if (role === 'etudiant') {
      fetchMesCertificats();
      fetchEligibilite();
    } else if (role === 'admin') {
      fetchTous();
    }
  }, []);

  // ── Fetch ─────────────────────────────────────────────────────
  const fetchMesCertificats = async () => {
    try {
      setLoading(true);
      const res  = await certificatService.mesCertificats();
      const data = res.data.data || [];
      setCertificats(Array.isArray(data) ? data : Object.values(data));
    } catch (err) {
      console.error('Erreur certificats:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchEligibilite = async () => {
    try {
      const res = await certificatService.eligibilite();
      setEligibilite(res.data.data);
    } catch (err) {
      console.error('Erreur éligibilité:', err);
    }
  };

  const fetchTous = async () => {
    try {
      setLoading(true);
      const res  = await certificatService.tous();
      const data = res.data.data || [];
      setTous(Array.isArray(data) ? data : Object.values(data));
    } catch (err) {
      console.error('Erreur tous certificats:', err);
    } finally {
      setLoading(false);
    }
  };

  // ── Générer certificat ────────────────────────────────────────
  const handleGenerer = async (niveau) => {
    try {
      setGenerating(`${niveau.filiere}_${niveau.niveau}`);
      const res = await certificatService.generer({
        filiere: niveau.filiere,
        niveau:  niveau.niveau,
      });
      await fetchMesCertificats();
      await fetchEligibilite();
      // Ouvrir le viewer automatiquement
      setCertSelec(res.data.data);
      setVue('viewer');
    } catch (err) {
      console.error('Erreur génération:', err);
    } finally {
      setGenerating(null);
    }
  };

  // ── Signer certificat (admin) ─────────────────────────────────
  const handleSigner = async (certId) => {
    if (!signeForm.nom_responsable || !signeForm.titre_responsable) return;
    try {
      setSigning(true);
      await certificatService.signer(certId, signeForm);
      setSignSuccess('Certificat signé avec succès ✅');
      await fetchTous();
      setTimeout(() => {
        setSignSuccess('');
        setVue('tous');
      }, 1500);
    } catch (err) {
      console.error('Erreur signature:', err);
    } finally {
      setSigning(false);
    }
  };

  // ── Upload signature image ─────────────────────────────────────
  const handleSignatureUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setSigneForm(f => ({ ...f, signature_base64: ev.target.result }));
    };
    reader.readAsDataURL(file);
  };

  // ── VIEWER ────────────────────────────────────────────────────
  if (vue === 'viewer' && certSelec) {
    return (
      <CertificatViewer
        certificat={certSelec}
        onClose={() => { setVue('liste'); setCertSelec(null); }}
      />
    );
  }

  // ── SIGNER (admin) ────────────────────────────────────────────
  if (vue === 'signer' && certSelec) {
    const etudiant   = certSelec.etudiant || {};
    const nomComplet = `${etudiant.prenom || ''} ${etudiant.nom || ''}`.trim();
    return (
      <div className="min-h-screen" style={{ backgroundColor:COLORS.gray50 }}>
        <Navbar />
        <div className="max-w-2xl mx-auto px-4 py-8">
          <style>{`@keyframes fadeInUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}.anim{animation:fadeInUp 0.3s ease both}`}</style>

          {/* Header */}
          <div className="flex items-center gap-3 mb-6 anim">
            <button onClick={() => setVue('tous')}
              className="w-10 h-10 rounded-xl flex items-center justify-center hover:opacity-80"
              style={{ backgroundColor:COLORS.gray100, color:COLORS.gray700 }}>←</button>
            <div>
              <h2 className="text-xl font-bold" style={{ color:COLORS.gray900 }}>✍️ Signer le certificat</h2>
              <p className="text-sm" style={{ color:COLORS.gray600 }}>{nomComplet} — {certSelec.niveau_valide}</p>
            </div>
          </div>

          {signSuccess && (
            <div className="mb-4 p-4 rounded-xl text-center font-bold anim"
                 style={{ backgroundColor:'#F0FDF4', color:COLORS.secondary, border:'1px solid #BBF7D0' }}>
              {signSuccess}
            </div>
          )}

          <div className="bg-white rounded-2xl p-6 anim" style={{ border:`1px solid ${COLORS.gray200}`, animationDelay:'60ms' }}>
            <p style={{ fontSize:'0.75rem', fontWeight:'700', color:'#9CA3AF', textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:'20px' }}>
              📋 Informations du responsable
            </p>

            <div className="space-y-4">
              {/* Nom responsable */}
              <div>
                <label className="block text-sm font-semibold mb-1.5" style={{ color:COLORS.gray700 }}>
                  Nom complet du responsable *
                </label>
                <input type="text"
                  value={signeForm.nom_responsable}
                  onChange={e => setSigneForm(f => ({ ...f, nom_responsable:e.target.value }))}
                  placeholder="Ex: Pr. Jean-Pierre MANDABA"
                  className="w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none"
                  style={{ borderColor:COLORS.gray200 }}
                />
              </div>

              {/* Titre */}
              <div>
                <label className="block text-sm font-semibold mb-1.5" style={{ color:COLORS.gray700 }}>
                  Titre / Fonction *
                </label>
                <input type="text"
                  value={signeForm.titre_responsable}
                  onChange={e => setSigneForm(f => ({ ...f, titre_responsable:e.target.value }))}
                  placeholder="Ex: Doyen de la Faculté de Médecine"
                  className="w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none"
                  style={{ borderColor:COLORS.gray200 }}
                />
              </div>

              {/* Upload signature */}
              <div>
                <label className="block text-sm font-semibold mb-1.5" style={{ color:COLORS.gray700 }}>
                  Signature (image PNG/JPG) — optionnel
                </label>
                <input type="file" accept="image/*"
                  onChange={handleSignatureUpload}
                  className="w-full px-4 py-2.5 rounded-xl border text-sm"
                  style={{ borderColor:COLORS.gray200 }}
                />
                {signeForm.signature_base64 && (
                  <div className="mt-3 p-3 rounded-xl text-center" style={{ backgroundColor:COLORS.gray50, border:`1px solid ${COLORS.gray200}` }}>
                    <img src={signeForm.signature_base64} alt="Aperçu signature"
                         style={{ maxHeight:'60px', maxWidth:'200px', objectFit:'contain', margin:'0 auto' }} />
                    <p className="text-xs mt-1" style={{ color:COLORS.gray600 }}>Aperçu signature</p>
                  </div>
                )}
              </div>

              {/* Bouton signer */}
              <button onClick={() => handleSigner(certSelec.id_certificat)}
                disabled={signing || !signeForm.nom_responsable || !signeForm.titre_responsable}
                className="w-full py-3 rounded-xl font-bold hover:opacity-90 transition-all mt-2"
                style={{ background:`linear-gradient(135deg, ${COLORS.gold}, #DAA520)`, color:'white', opacity: signing ? 0.7 : 1 }}>
                {signing ? '⏳ Signature en cours...' : '✍️ Signer officiellement'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── PAGE PRINCIPALE ───────────────────────────────────────────
  return (
    <div className="min-h-screen" style={{ backgroundColor:COLORS.gray50 }}>
      <Navbar />
      <style>{`
        @keyframes fadeInUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
        .anim{animation:fadeInUp 0.3s ease both}
        .cert-card{transition:all 0.2s ease}
        .cert-card:hover{transform:translateY(-3px);box-shadow:0 8px 24px rgba(0,0,0,0.1) !important}
      `}</style>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* ── HEADER ──────────────────────────────────────────── */}
        <div className="anim mb-6">
          <h1 className="text-2xl font-bold" style={{ color:COLORS.gray900 }}>🎓 Certificats</h1>
          <p className="text-sm mt-0.5" style={{ color:COLORS.gray600 }}>
            {role === 'etudiant' ? 'Vos certificats de réussite officiels' : 'Gestion des certificats étudiants'}
          </p>
        </div>

        {/* ── ONGLETS ADMIN ───────────────────────────────────── */}
        {role === 'admin' && (
          <div className="flex gap-1 bg-white rounded-xl p-1 mb-6 anim" style={{ border:`1px solid ${COLORS.gray200}`, animationDelay:'40ms', width:'fit-content' }}>
            {[
              { id:'tous', label:'📋 Tous les certificats' },
            ].map(tab => (
              <button key={tab.id} onClick={() => setVue(tab.id)}
                className="px-4 py-2 rounded-lg text-sm font-semibold transition-all"
                style={{ backgroundColor: vue === tab.id ? COLORS.primary : 'transparent', color: vue === tab.id ? 'white' : COLORS.gray600 }}>
                {tab.label}
              </button>
            ))}
          </div>
        )}

        {/* ── VUE ÉTUDIANT ────────────────────────────────────── */}
        {role === 'etudiant' && (
          <div className="space-y-6">

            {/* ÉLIGIBILITÉ */}
            {eligibilite && eligibilite.niveaux && eligibilite.niveaux.length > 0 && (
              <div className="anim" style={{ animationDelay:'60ms' }}>
                <h2 className="text-lg font-bold mb-4" style={{ color:COLORS.gray800 }}>
                  📊 Vos niveaux
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {eligibilite.niveaux.map((niveau, i) => {
                    const mention   = MENTION_COLORS[niveau.mention] || MENTION_COLORS['Passable'];
                    const isGenerating = generating === `${niveau.filiere}_${niveau.niveau}`;
                    return (
                      <div key={i} className="cert-card bg-white rounded-2xl p-5"
                           style={{ border:`1.5px solid ${niveau.eligible ? '#DAA520' : COLORS.gray200}`, boxShadow: niveau.eligible ? '0 4px 16px rgba(184,134,11,0.15)' : 'none' }}>

                        {/* Bandeau couleur */}
                        <div style={{ height:'4px', borderRadius:'999px', marginBottom:'14px', background: niveau.eligible ? 'linear-gradient(90deg, #B8860B, #DAA520)' : COLORS.gray200 }} />

                        <div className="flex items-start justify-between gap-3 mb-3">
                          <div>
                            <p className="font-bold text-lg" style={{ color:COLORS.gray900, margin:0 }}>
                              {niveau.filiere} — {niveau.niveau}
                            </p>
                            <p style={{ fontSize:'0.8rem', color:COLORS.gray600, margin:'2px 0 0' }}>
                              {niveau.nb_valides}/{niveau.nb_cours} cours validés
                            </p>
                          </div>
                          <span style={{ fontSize:'0.75rem', fontWeight:'800', padding:'4px 10px', borderRadius:'999px', backgroundColor: niveau.eligible ? '#FEF3C7' : COLORS.gray100, color: niveau.eligible ? COLORS.gold : COLORS.gray600, flexShrink:0 }}>
                            {niveau.eligible ? '✅ Éligible' : niveau.tous_valides ? '⏳ En cours' : '❌ Incomplet'}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 mb-4 flex-wrap">
                          <span style={{ fontSize:'0.75rem', fontWeight:'700', padding:'3px 10px', borderRadius:'999px', backgroundColor:mention.bg, color:mention.color }}>
                            {niveau.mention}
                          </span>
                          <span style={{ fontSize:'0.75rem', fontWeight:'700', padding:'3px 10px', borderRadius:'999px', backgroundColor:'#EFF6FF', color:COLORS.primary }}>
                            Moy. {niveau.moyenne}/20
                          </span>
                          <span style={{ fontSize:'0.75rem', fontWeight:'700', padding:'3px 10px', borderRadius:'999px', backgroundColor:'#F0FDF4', color:COLORS.secondary }}>
                            → {niveau.niveau_suivant}
                          </span>
                        </div>

                        {/* Bouton */}
                        {niveau.eligible && !niveau.deja_genere && (
                          <button onClick={() => handleGenerer(niveau)} disabled={isGenerating}
                            className="w-full py-2.5 rounded-xl font-bold hover:opacity-90 transition-all"
                            style={{ background:'linear-gradient(135deg, #B8860B, #DAA520)', color:'white', opacity:isGenerating?0.7:1 }}>
                            {isGenerating ? '⏳ Génération...' : '🎓 Générer mon certificat'}
                          </button>
                        )}
                        {niveau.deja_genere && (
                          <div className="w-full py-2.5 rounded-xl font-bold text-center"
                               style={{ backgroundColor:'#F0FDF4', color:COLORS.secondary, border:'1px solid #BBF7D0' }}>
                            ✅ Certificat déjà généré
                          </div>
                        )}
                        {!niveau.eligible && (
                          <div className="w-full py-2 rounded-xl text-center text-sm"
                               style={{ backgroundColor:COLORS.gray50, color:COLORS.gray600 }}>
                            {niveau.tous_valides ? 'Moyenne insuffisante' : `${niveau.nb_cours - niveau.nb_valides} cours non validé(s)`}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* MES CERTIFICATS */}
            <div className="anim" style={{ animationDelay:'100ms' }}>
              <h2 className="text-lg font-bold mb-4" style={{ color:COLORS.gray800 }}>
                🏅 Mes certificats ({certificats.length})
              </h2>

              {loading ? (
                <div className="text-center py-12">
                  <div style={{ width:'40px', height:'40px', margin:'0 auto', borderRadius:'50%', border:'4px solid #E5EBF5', borderTop:`4px solid ${COLORS.gold}`, animation:'spin 0.9s linear infinite' }} />
                  <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
                </div>
              ) : certificats.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-2xl" style={{ border:`1px solid ${COLORS.gray200}` }}>
                  <span className="text-6xl">🎓</span>
                  <p className="mt-4 font-bold text-lg" style={{ color:COLORS.gray800 }}>Aucun certificat encore</p>
                  <p className="text-sm mt-1" style={{ color:COLORS.gray600 }}>Validez un niveau complet pour générer votre certificat</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {certificats.map((cert, i) => {
                    const mention = MENTION_COLORS[cert.mention] || MENTION_COLORS['Passable'];
                    return (
                      <div key={cert.id_certificat} className="cert-card bg-white rounded-2xl overflow-hidden"
                           style={{ border:'1.5px solid #DAA520', boxShadow:'0 4px 16px rgba(184,134,11,0.12)' }}>
                        <div style={{ height:'5px', background:'linear-gradient(90deg, #B8860B, #DAA520)' }} />
                        <div className="p-5">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <p className="font-bold text-lg" style={{ color:COLORS.gray900, margin:0 }}>
                                {cert.filiere} — {cert.niveau_valide}
                              </p>
                              <p style={{ fontSize:'0.78rem', color:COLORS.gray600, margin:'2px 0 0' }}>
                                {cert.annee_academique}
                              </p>
                            </div>
                            <span style={{ fontSize:'1.8rem' }}>🎓</span>
                          </div>
                          <div className="flex gap-2 mb-4 flex-wrap">
                            <span style={{ fontSize:'0.75rem', fontWeight:'700', padding:'3px 10px', borderRadius:'999px', backgroundColor:mention.bg, color:mention.color }}>
                              {cert.mention}
                            </span>
                            <span style={{ fontSize:'0.75rem', fontWeight:'700', padding:'3px 10px', borderRadius:'999px', backgroundColor:'#EFF6FF', color:COLORS.primary }}>
                              {cert.moyenne_generale}/20
                            </span>
                            <span style={{ fontSize:'0.75rem', fontWeight:'700', padding:'3px 10px', borderRadius:'999px', backgroundColor: cert.est_signe ? '#F0FDF4' : COLORS.gray100, color: cert.est_signe ? COLORS.secondary : COLORS.gray600 }}>
                              {cert.est_signe ? '✅ Signé' : '⏳ Non signé'}
                            </span>
                          </div>
                          <button onClick={() => { setCertSelec(cert); setVue('viewer'); }}
                            className="w-full py-2.5 rounded-xl font-bold hover:opacity-90 transition-all"
                            style={{ background:'linear-gradient(135deg, #B8860B, #DAA520)', color:'white' }}>
                            👁 Voir & Télécharger
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── VUE ADMIN — TOUS LES CERTIFICATS ────────────────── */}
        {role === 'admin' && (
          <div className="anim" style={{ animationDelay:'60ms' }}>
            {loading ? (
              <div className="text-center py-12">
                <div style={{ width:'40px', height:'40px', margin:'0 auto', borderRadius:'50%', border:'4px solid #E5EBF5', borderTop:`4px solid ${COLORS.gold}`, animation:'spin 0.9s linear infinite' }} />
                <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
              </div>
            ) : tous.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl" style={{ border:`1px solid ${COLORS.gray200}` }}>
                <span className="text-6xl">📋</span>
                <p className="mt-4 font-bold text-lg" style={{ color:COLORS.gray800 }}>Aucun certificat généré</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {tous.map((cert, i) => {
                  const etudiant   = cert.etudiant || {};
                  const nomComplet = `${etudiant.prenom || ''} ${etudiant.nom || ''}`.trim();
                  const mention    = MENTION_COLORS[cert.mention] || MENTION_COLORS['Passable'];
                  return (
                    <div key={cert.id_certificat} className="cert-card bg-white rounded-2xl overflow-hidden"
                         style={{ border:'1.5px solid #DAA520', boxShadow:'0 2px 8px rgba(184,134,11,0.1)' }}>
                      <div style={{ height:'4px', background:'linear-gradient(90deg, #B8860B, #DAA520)' }} />
                      <div className="p-4">
                        <div className="flex items-start justify-between gap-2 mb-3">
                          <div>
                            <p className="font-bold" style={{ color:COLORS.gray900, margin:0 }}>{nomComplet}</p>
                            <p style={{ fontSize:'0.75rem', color:COLORS.gray600, margin:'1px 0 0' }}>
                              {cert.filiere} — {cert.niveau_valide} • {cert.annee_academique}
                            </p>
                          </div>
                          <span style={{ fontSize:'0.7rem', fontWeight:'700', padding:'3px 8px', borderRadius:'999px', backgroundColor: cert.est_signe ? '#F0FDF4' : '#FEF3C7', color: cert.est_signe ? COLORS.secondary : COLORS.gold, flexShrink:0 }}>
                            {cert.est_signe ? '✅ Signé' : '⏳ À signer'}
                          </span>
                        </div>
                        <div className="flex gap-2 mb-3 flex-wrap">
                          <span style={{ fontSize:'0.72rem', fontWeight:'700', padding:'2px 8px', borderRadius:'999px', backgroundColor:mention.bg, color:mention.color }}>
                            {cert.mention}
                          </span>
                          <span style={{ fontSize:'0.72rem', fontWeight:'700', padding:'2px 8px', borderRadius:'999px', backgroundColor:'#EFF6FF', color:COLORS.primary }}>
                            {cert.moyenne_generale}/20
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => { setCertSelec(cert); setVue('viewer'); }}
                            className="flex-1 py-2 rounded-xl text-xs font-bold hover:opacity-90 transition-all"
                            style={{ background:'linear-gradient(135deg, #B8860B, #DAA520)', color:'white' }}>
                            👁 Voir
                          </button>
                          {!cert.est_signe && (
                            <button onClick={() => { setCertSelec(cert); setVue('signer'); }}
                              className="flex-1 py-2 rounded-xl text-xs font-bold hover:opacity-80 transition-all"
                              style={{ backgroundColor:'#F0FDF4', color:COLORS.secondary, border:'1px solid #BBF7D0' }}>
                              ✍️ Signer
                            </button>
                          )}
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
  );
}