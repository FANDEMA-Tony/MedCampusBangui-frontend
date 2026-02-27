import { useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const MENTION_COLORS = {
  'Très Bien':   { color: '#059669', bg: '#D1FAE5', border: '#6EE7B7' },
  'Bien':        { color: '#0066CC', bg: '#DBEAFE', border: '#93C5FD' },
  'Assez Bien':  { color: '#7C3AED', bg: '#EDE9FE', border: '#C4B5FD' },
  'Passable':    { color: '#D97706', bg: '#FEF3C7', border: '#FCD34D' },
  'Insuffisant': { color: '#DC143C', bg: '#FEE2E2', border: '#FCA5A5' },
};

export default function CertificatViewer({ certificat, onClose }) {
  const certRef = useRef(null);

  const mention     = MENTION_COLORS[certificat.mention] || MENTION_COLORS['Passable'];
  const etudiant    = certificat.etudiant || {};
  const nomComplet  = `${etudiant.prenom || ''} ${etudiant.nom || ''}`.trim();
  const verifyUrl   = `${window.location.origin}/verifier/${certificat.code_verification}`;

  // ── Télécharger en PDF ────────────────────────────────────────
  const handleDownload = async () => {
    const el = certRef.current;
    if (!el) return;

    try {
      const canvas = await html2canvas(el, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf     = new jsPDF({
        orientation: 'portrait',
        unit:        'mm',
        format:      'a4',
      });

      const pdfW  = pdf.internal.pageSize.getWidth();
      const pdfH  = pdf.internal.pageSize.getHeight();
      const ratio = canvas.width / canvas.height;
      const imgH  = pdfW / ratio;
      const yOff  = (pdfH - imgH) / 2;

      pdf.addImage(imgData, 'PNG', 0, yOff > 0 ? yOff : 0, pdfW, imgH);
      pdf.save(`Certificat_${nomComplet}_${certificat.niveau_valide}.pdf`);
    } catch (err) {
      console.error('Erreur génération PDF:', err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-start overflow-y-auto p-4"
         style={{ backgroundColor: 'rgba(0,0,0,0.75)' }}>
      <style>{`
        @keyframes fadeIn { from{opacity:0;transform:scale(0.97)}to{opacity:1;transform:scale(1)} }
        .cert-anim { animation: fadeIn 0.35s ease both; }
        @media print { .no-print { display:none !important; } }
      `}</style>

      {/* Boutons actions */}
      <div className="no-print flex items-center gap-3 mb-4 mt-2 cert-anim">
        <button onClick={handleDownload}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold hover:opacity-90 transition-all"
          style={{ background:'linear-gradient(135deg, #0066CC, #0052A3)', color:'white' }}>
          ⬇️ Télécharger PDF
        </button>
        <button onClick={onClose}
          className="px-5 py-2.5 rounded-xl font-bold hover:opacity-80 transition-all"
          style={{ backgroundColor:'#374151', color:'white' }}>
          ✕ Fermer
        </button>
      </div>

      {/* ── CERTIFICAT ─────────────────────────────────────────── */}
      <div ref={certRef} className="cert-anim bg-white"
           style={{ width:'794px', minHeight:'1123px', position:'relative', fontFamily:'Georgia, serif' }}>

        {/* Bordure décorative externe */}
        <div style={{ position:'absolute', inset:'12px', border:'3px solid #B8860B', pointerEvents:'none', zIndex:1 }} />
        <div style={{ position:'absolute', inset:'18px', border:'1px solid #DAA520', pointerEvents:'none', zIndex:1 }} />

        {/* Coins décoratifs */}
        {[
          { top:'8px',  left:'8px',  borderTop:'4px solid #B8860B', borderLeft:'4px solid #B8860B'   },
          { top:'8px',  right:'8px', borderTop:'4px solid #B8860B', borderRight:'4px solid #B8860B'  },
          { bottom:'8px', left:'8px', borderBottom:'4px solid #B8860B', borderLeft:'4px solid #B8860B' },
          { bottom:'8px', right:'8px', borderBottom:'4px solid #B8860B', borderRight:'4px solid #B8860B' },
        ].map((style, i) => (
          <div key={i} style={{ position:'absolute', width:'40px', height:'40px', zIndex:2, ...style }} />
        ))}

        {/* Contenu principal */}
        <div style={{ padding:'60px 70px', position:'relative', zIndex:3 }}>

          {/* ── EN-TÊTE ──────────────────────────────────────── */}
          <div style={{ textAlign:'center', marginBottom:'32px' }}>
            {/* Logo / Emblème */}
            <div style={{
              width:'90px', height:'90px', borderRadius:'50%', margin:'0 auto 16px',
              background:'linear-gradient(135deg, #0066CC, #004499)',
              display:'flex', alignItems:'center', justifyContent:'center',
              boxShadow:'0 4px 20px rgba(0,102,204,0.4)',
              border:'3px solid #DAA520',
              fontSize:'2.5rem',
            }}>
              🏥
            </div>

            <p style={{ fontSize:'13px', fontWeight:'600', color:'#6B7280', letterSpacing:'0.15em', textTransform:'uppercase', margin:'0 0 4px', fontFamily:'Arial, sans-serif' }}>
              République Centrafricaine
            </p>
            <h1 style={{ fontSize:'20px', fontWeight:'900', color:'#1F2937', margin:'0 0 2px', letterSpacing:'0.05em' }}>
              FACULTÉ DE MÉDECINE ET DES SCIENCES DE LA SANTÉ
            </h1>
            <p style={{ fontSize:'13px', color:'#4B5563', margin:'0 0 20px', fontFamily:'Arial, sans-serif' }}>
              Université de Bangui — MedCampus
            </p>

            {/* Ligne décorative */}
            <div style={{ display:'flex', alignItems:'center', gap:'12px', marginBottom:'20px' }}>
              <div style={{ flex:1, height:'2px', background:'linear-gradient(90deg, transparent, #DAA520)' }} />
              <span style={{ color:'#B8860B', fontSize:'18px' }}>✦</span>
              <div style={{ flex:1, height:'2px', background:'linear-gradient(90deg, #DAA520, transparent)' }} />
            </div>

            <h2 style={{ fontSize:'32px', fontWeight:'900', color:'#B8860B', letterSpacing:'0.08em', textTransform:'uppercase', margin:'0 0 4px', textShadow:'1px 1px 2px rgba(184,134,11,0.3)' }}>
              CERTIFICAT DE RÉUSSITE
            </h2>
            <p style={{ fontSize:'14px', color:'#6B7280', fontStyle:'italic', margin:0, fontFamily:'Arial, sans-serif' }}>
              Attestation officielle de validation de niveau
            </p>
          </div>

          {/* ── CORPS ────────────────────────────────────────── */}
          <div style={{ textAlign:'center', marginBottom:'28px' }}>
            <p style={{ fontSize:'15px', color:'#374151', margin:'0 0 8px', fontFamily:'Arial, sans-serif' }}>
              Le Décanat de la Faculté de Médecine certifie que
            </p>
            <p style={{ fontSize:'13px', color:'#6B7280', margin:'0 0 16px', fontFamily:'Arial, sans-serif' }}>
              l'étudiant(e) dont les informations suivent a satisfait aux exigences académiques
            </p>

            {/* Nom étudiant */}
            <div style={{ margin:'0 0 8px', padding:'16px 32px', background:'linear-gradient(135deg, #F8F4E8, #FFF9E6)', border:'2px solid #DAA520', borderRadius:'12px', display:'inline-block', minWidth:'400px' }}>
              <p style={{ fontSize:'28px', fontWeight:'900', color:'#1F2937', margin:0, letterSpacing:'0.03em' }}>
                {nomComplet}
              </p>
            </div>

            <p style={{ fontSize:'13px', color:'#6B7280', margin:'8px 0 16px', fontFamily:'Arial, sans-serif' }}>
              Matricule : <strong style={{ color:'#374151' }}>{etudiant.matricule || '—'}</strong>
            </p>

            <p style={{ fontSize:'15px', color:'#374151', margin:'0 0 4px', fontFamily:'Arial, sans-serif' }}>
              a validé avec succès le niveau
            </p>
            <p style={{ fontSize:'22px', fontWeight:'900', color:'#0066CC', margin:'0 0 4px' }}>
              {certificat.niveau_valide}
            </p>
            <p style={{ fontSize:'14px', color:'#6B7280', margin:'0 0 16px', fontFamily:'Arial, sans-serif' }}>
              Filière : <strong style={{ color:'#374151' }}>{certificat.filiere}</strong>
              &nbsp;•&nbsp;
              Année académique : <strong style={{ color:'#374151' }}>{certificat.annee_academique}</strong>
            </p>

            {/* Mention + Moyenne */}
            <div style={{ display:'flex', justifyContent:'center', gap:'16px', marginBottom:'24px', flexWrap:'wrap' }}>
              <div style={{ padding:'10px 24px', borderRadius:'999px', backgroundColor:mention.bg, border:`2px solid ${mention.border}` }}>
                <p style={{ fontSize:'12px', fontWeight:'700', color:mention.color, margin:'0 0 2px', textTransform:'uppercase', letterSpacing:'0.05em', fontFamily:'Arial, sans-serif' }}>Mention</p>
                <p style={{ fontSize:'18px', fontWeight:'900', color:mention.color, margin:0 }}>{certificat.mention}</p>
              </div>
              <div style={{ padding:'10px 24px', borderRadius:'999px', backgroundColor:'#EFF6FF', border:'2px solid #93C5FD' }}>
                <p style={{ fontSize:'12px', fontWeight:'700', color:'#0066CC', margin:'0 0 2px', textTransform:'uppercase', letterSpacing:'0.05em', fontFamily:'Arial, sans-serif' }}>Moyenne Générale</p>
                <p style={{ fontSize:'18px', fontWeight:'900', color:'#0066CC', margin:0 }}>{certificat.moyenne_generale}/20</p>
              </div>
              <div style={{ padding:'10px 24px', borderRadius:'999px', backgroundColor:'#F0FDF4', border:'2px solid #6EE7B7' }}>
                <p style={{ fontSize:'12px', fontWeight:'700', color:'#059669', margin:'0 0 2px', textTransform:'uppercase', letterSpacing:'0.05em', fontFamily:'Arial, sans-serif' }}>Passage en</p>
                <p style={{ fontSize:'18px', fontWeight:'900', color:'#059669', margin:0 }}>{certificat.niveau_suivant}</p>
              </div>
            </div>
          </div>

          {/* ── COURS VALIDÉS ─────────────────────────────────── */}
          <div style={{ marginBottom:'28px' }}>
            <p style={{ fontSize:'12px', fontWeight:'700', color:'#9CA3AF', textTransform:'uppercase', letterSpacing:'0.1em', textAlign:'center', marginBottom:'12px', fontFamily:'Arial, sans-serif' }}>
              ── Cours validés ──
            </p>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'6px' }}>
              {(certificat.cours_valides || []).map((cours, i) => (
                <div key={i} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'6px 12px', borderRadius:'8px', backgroundColor:'#F9FAFB', border:'1px solid #E5E7EB' }}>
                  <div>
                    <p style={{ fontSize:'11px', fontWeight:'700', color:'#374151', margin:0, fontFamily:'Arial, sans-serif' }}>
                      {cours.titre}
                    </p>
                    {cours.code && (
                      <p style={{ fontSize:'10px', color:'#9CA3AF', margin:0, fontFamily:'monospace' }}>
                        {cours.code}
                      </p>
                    )}
                  </div>
                  <span style={{ fontSize:'13px', fontWeight:'900', color: parseFloat(cours.note) >= 10 ? '#059669' : '#DC143C', marginLeft:'8px', flexShrink:0 }}>
                    {cours.note}/20
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* ── SIGNATURE + QR CODE ───────────────────────────── */}
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end', marginTop:'32px', paddingTop:'20px', borderTop:'1px solid #E5E7EB' }}>

            {/* Signature responsable */}
            <div style={{ textAlign:'center', minWidth:'220px' }}>
              {certificat.signature_base64 ? (
                <img src={certificat.signature_base64} alt="Signature"
                     style={{ height:'60px', maxWidth:'200px', objectFit:'contain', marginBottom:'8px' }} />
              ) : (
                <div style={{ height:'60px', borderBottom:'1px solid #9CA3AF', marginBottom:'8px', width:'200px' }} />
              )}
              <p style={{ fontSize:'12px', fontWeight:'800', color:'#1F2937', margin:'0 0 2px', fontFamily:'Arial, sans-serif' }}>
                {certificat.nom_responsable || 'Le Responsable'}
              </p>
              <p style={{ fontSize:'11px', color:'#6B7280', margin:0, fontStyle:'italic', fontFamily:'Arial, sans-serif' }}>
                {certificat.titre_responsable || 'Doyen de la Faculté'}
              </p>
              {certificat.est_signe && (
                <span style={{ fontSize:'10px', fontWeight:'700', color:'#059669', backgroundColor:'#F0FDF4', padding:'2px 8px', borderRadius:'999px', border:'1px solid #6EE7B7', display:'inline-block', marginTop:'6px', fontFamily:'Arial, sans-serif' }}>
                  ✅ Signé officiellement
                </span>
              )}
            </div>

            {/* Date */}
            <div style={{ textAlign:'center' }}>
              <p style={{ fontSize:'12px', color:'#6B7280', margin:'0 0 4px', fontFamily:'Arial, sans-serif' }}>
                Délivré le
              </p>
              <p style={{ fontSize:'14px', fontWeight:'800', color:'#374151', margin:0, fontFamily:'Arial, sans-serif' }}>
                {new Date(certificat.created_at).toLocaleDateString('fr-FR', { day:'numeric', month:'long', year:'numeric' })}
              </p>
            </div>

            {/* QR Code */}
            <div style={{ textAlign:'center' }}>
              <div style={{ padding:'8px', backgroundColor:'white', border:'2px solid #E5E7EB', borderRadius:'12px', display:'inline-block' }}>
                <QRCodeSVG value={verifyUrl} size={90} level="H" />
              </div>
              <p style={{ fontSize:'10px', color:'#9CA3AF', margin:'6px 0 0', fontFamily:'Arial, sans-serif' }}>
                Scanner pour vérifier
              </p>
              <p style={{ fontSize:'9px', color:'#B0B7C3', margin:'2px 0 0', fontFamily:'monospace', wordBreak:'break-all', maxWidth:'110px' }}>
                {certificat.code_verification}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}