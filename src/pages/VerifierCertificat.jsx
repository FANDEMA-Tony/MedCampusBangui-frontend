import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { certificatService } from '../services/api';

const MENTION_COLORS = {
  'Très Bien':   { color:'#059669', bg:'#D1FAE5' },
  'Bien':        { color:'#0066CC', bg:'#DBEAFE' },
  'Assez Bien':  { color:'#7C3AED', bg:'#EDE9FE' },
  'Passable':    { color:'#D97706', bg:'#FEF3C7' },
  'Insuffisant': { color:'#DC143C', bg:'#FEE2E2' },
};

export default function VerifierCertificat() {
  const { code } = useParams();
  const [loading, setLoading]   = useState(true);
  const [resultat, setResultat] = useState(null);
  const [erreur,   setErreur]   = useState(false);

  useEffect(() => { verifier(); }, [code]);

  const verifier = async () => {
    try {
      setLoading(true);
      const res = await certificatService.verifier(code);
      setResultat(res.data.data);
    } catch {
      setErreur(true);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor:'#F9FAFB' }}>
        <div className="text-center">
          <div style={{ width:'56px', height:'56px', margin:'0 auto', borderRadius:'50%', border:'4px solid #E5EBF5', borderTop:'4px solid #B8860B', animation:'spin 0.9s linear infinite' }} />
          <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
          <p className="mt-4 font-medium text-gray-600">Vérification en cours...</p>
        </div>
      </div>
    );
  }

  if (erreur || !resultat) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor:'#F9FAFB' }}>
        <div className="bg-white rounded-2xl p-10 text-center max-w-md w-full shadow-lg" style={{ border:'2px solid #FCA5A5' }}>
          <span className="text-6xl">❌</span>
          <h2 className="mt-4 text-2xl font-bold text-red-600">Certificat invalide</h2>
          <p className="mt-2 text-gray-600">Ce certificat est introuvable ou a été falsifié.</p>
          <p className="mt-1 text-sm text-gray-400 font-mono">{code}</p>
        </div>
      </div>
    );
  }

  const mention = MENTION_COLORS[resultat.mention] || MENTION_COLORS['Passable'];

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor:'#F9FAFB' }}>
      <style>{`@keyframes fadeIn{from{opacity:0;transform:scale(0.97)}to{opacity:1;transform:scale(1)}}.anim{animation:fadeIn 0.35s ease both}`}</style>

      <div className="anim bg-white rounded-2xl overflow-hidden max-w-lg w-full shadow-xl" style={{ border:'2px solid #DAA520' }}>

        {/* Bandeau vert */}
        <div style={{ background:'linear-gradient(135deg, #059669, #047857)', padding:'24px', textAlign:'center' }}>
          <div style={{ width:'70px', height:'70px', borderRadius:'50%', backgroundColor:'rgba(255,255,255,0.2)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 12px', fontSize:'2rem' }}>
            ✅
          </div>
          <h1 style={{ color:'white', fontSize:'1.4rem', fontWeight:'900', margin:'0 0 4px' }}>
            Certificat Authentique
          </h1>
          <p style={{ color:'rgba(255,255,255,0.85)', fontSize:'0.85rem', margin:0 }}>
            Ce document est officiellement reconnu
          </p>
        </div>

        <div style={{ padding:'28px' }}>

          {/* Nom étudiant */}
          <div className="text-center mb-6" style={{ padding:'16px', backgroundColor:'#FFFBEB', borderRadius:'12px', border:'1px solid #FCD34D' }}>
            <p style={{ fontSize:'0.75rem', fontWeight:'700', color:'#B8860B', textTransform:'uppercase', letterSpacing:'0.05em', margin:'0 0 4px' }}>
              Étudiant certifié
            </p>
            <p style={{ fontSize:'1.4rem', fontWeight:'900', color:'#1F2937', margin:0 }}>
              {resultat.nom_etudiant}
            </p>
            <p style={{ fontSize:'0.8rem', color:'#6B7280', margin:'4px 0 0' }}>
              Matricule : {resultat.matricule}
            </p>
          </div>

          {/* Infos */}
          <div className="space-y-3 mb-6">
            {[
              { icon:'🎓', label:'Filière',          value:resultat.filiere                },
              { icon:'📊', label:'Niveau validé',    value:resultat.niveau_valide          },
              { icon:'➡️', label:'Passage en',       value:resultat.niveau_suivant         },
              { icon:'📅', label:'Année académique', value:resultat.annee_academique       },
              { icon:'📆', label:'Date d\'émission', value:resultat.date_emission          },
            ].map((item, i) => (
              <div key={i} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px 14px', borderRadius:'10px', backgroundColor:'#F9FAFB', border:'1px solid #F3F4F6' }}>
                <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
                  <span>{item.icon}</span>
                  <span style={{ fontSize:'0.8rem', fontWeight:'600', color:'#6B7280' }}>{item.label}</span>
                </div>
                <span style={{ fontSize:'0.85rem', fontWeight:'800', color:'#1F2937' }}>{item.value}</span>
              </div>
            ))}
          </div>

          {/* Mention + Moyenne */}
          <div style={{ display:'flex', gap:'12px', marginBottom:'20px' }}>
            <div style={{ flex:1, textAlign:'center', padding:'12px', borderRadius:'12px', backgroundColor:mention.bg }}>
              <p style={{ fontSize:'0.7rem', fontWeight:'700', color:mention.color, textTransform:'uppercase', margin:'0 0 2px' }}>Mention</p>
              <p style={{ fontSize:'1rem', fontWeight:'900', color:mention.color, margin:0 }}>{resultat.mention}</p>
            </div>
            <div style={{ flex:1, textAlign:'center', padding:'12px', borderRadius:'12px', backgroundColor:'#EFF6FF' }}>
              <p style={{ fontSize:'0.7rem', fontWeight:'700', color:'#0066CC', textTransform:'uppercase', margin:'0 0 2px' }}>Moyenne</p>
              <p style={{ fontSize:'1rem', fontWeight:'900', color:'#0066CC', margin:0 }}>{resultat.moyenne_generale}/20</p>
            </div>
          </div>

          {/* Responsable */}
          {resultat.est_signe && (
            <div style={{ textAlign:'center', padding:'14px', borderRadius:'12px', backgroundColor:'#F0FDF4', border:'1px solid #BBF7D0', marginBottom:'16px' }}>
              <p style={{ fontSize:'0.75rem', fontWeight:'700', color:'#059669', textTransform:'uppercase', letterSpacing:'0.05em', margin:'0 0 6px' }}>
                ✍️ Signé par
              </p>
              <p style={{ fontSize:'1rem', fontWeight:'800', color:'#1F2937', margin:'0 0 2px' }}>
                {resultat.nom_responsable}
              </p>
              <p style={{ fontSize:'0.8rem', color:'#6B7280', margin:0, fontStyle:'italic' }}>
                {resultat.titre_responsable}
              </p>
            </div>
          )}

          {/* Code vérification */}
          <div style={{ textAlign:'center', padding:'10px', borderRadius:'10px', backgroundColor:'#F9FAFB', border:'1px solid #E5E7EB' }}>
            <p style={{ fontSize:'0.7rem', color:'#9CA3AF', margin:'0 0 2px' }}>Code de vérification</p>
            <p style={{ fontSize:'0.75rem', fontWeight:'700', color:'#374151', fontFamily:'monospace', margin:0, wordBreak:'break-all' }}>
              {resultat.code_verification}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}