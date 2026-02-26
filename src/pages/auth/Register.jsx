import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/api';
import { saveAuth } from '../../utils/auth';

export default function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nom: '', prenom: '', email: '', mot_de_passe: '',
    role: '', filiere: '', specialite: '', date_naissance: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [focused, setFocused] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setTimeout(() => setMounted(true), 50); }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });
    setErrors({});
    try {
      const dataToSend = {
        nom: formData.nom, prenom: formData.prenom, email: formData.email,
        mot_de_passe: formData.mot_de_passe, role: formData.role,
        date_naissance: formData.date_naissance,
      };
      if (formData.role === 'enseignant') dataToSend.specialite = formData.specialite;
      else if (formData.role === 'etudiant') dataToSend.filiere = formData.filiere;

      const response = await authService.register(dataToSend);
      if (response.data.success) {
        setMessage({ type: 'success', text: 'Inscription réussie ! Redirection vers la connexion...' });
        setTimeout(() => navigate('/login'), 2000);
      }
    } catch (error) {
      if (error.response?.data?.errors) setErrors(error.response.data.errors);
      else setMessage({ type: 'error', text: error.response?.data?.message || "Une erreur est survenue lors de l'inscription" });
    } finally {
      setLoading(false);
    }
  };

  const filieres = ['Médecine', 'Pharmacie', 'Sciences-Biomédicale', 'Chirurgie', 'Pédiatrie', 'Gynécologie'];

  const inputStyle = (fieldName) => ({
    width: '100%', padding: '12px 16px 12px 42px',
    border: `2px solid ${errors[fieldName] ? '#DC143C' : focused === fieldName ? '#0066CC' : '#E2E8F0'}`,
    borderRadius: '10px', fontSize: '13px', outline: 'none',
    background: focused === fieldName ? '#F8FEFF' : 'white',
    color: '#0D1B2A', transition: 'all 0.2s ease', boxSizing: 'border-box',
  });

  const labelStyle = {
    display: 'block', fontSize: '12px', fontWeight: '700',
    color: '#3D4A5C', marginBottom: '6px',
  };

  const iconStyle = {
    position: 'absolute', left: '13px', top: '50%',
    transform: 'translateY(-50%)', fontSize: '15px', opacity: 0.45,
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', fontFamily: "'Sora', 'Segoe UI', sans-serif", overflow: 'hidden' }}>

      {/* ── PANNEAU GAUCHE ── */}
      <div style={{
        flex: '0 0 42%',
        background: 'linear-gradient(135deg, #0A1628 0%, #0D2137 40%, #0A3352 70%, #0066CC 100%)',
        position: 'relative',
        display: 'flex', flexDirection: 'column', justifyContent: 'center',
        padding: '60px 55px', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: '-80px', right: '-80px', width: '320px', height: '320px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,102,204,0.3) 0%, transparent 70%)', animation: 'pulse 4s ease-in-out infinite' }} />
        <div style={{ position: 'absolute', bottom: '-40px', left: '-40px', width: '220px', height: '220px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,168,107,0.2) 0%, transparent 70%)', animation: 'pulse 5s ease-in-out infinite reverse' }} />
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(rgba(255,255,255,0.04) 1px, transparent 1px)', backgroundSize: '32px 32px' }} />

        <div style={{
          position: 'relative', zIndex: 2,
          opacity: mounted ? 1 : 0, transform: mounted ? 'translateY(0)' : 'translateY(30px)',
          transition: 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '44px' }}>
            <div style={{ width: '50px', height: '50px', borderRadius: '14px', background: 'linear-gradient(135deg, #0066CC, #00A86B)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', boxShadow: '0 8px 32px rgba(0,102,204,0.4)' }}>🏥</div>
            <div>
              <div style={{ color: 'white', fontWeight: '800', fontSize: '20px', letterSpacing: '-0.5px' }}>MedCampus Bangui</div>
              <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: '12px' }}>République Centrafricaine</div>
            </div>
          </div>

          <h1 style={{ color: 'white', fontSize: '36px', fontWeight: '800', lineHeight: '1.15', letterSpacing: '-1px', marginBottom: '18px' }}>
            Rejoignez la<br />
            <span style={{ background: 'linear-gradient(90deg, #4DA6FF, #00E5A0)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>communauté médicale</span>
          </h1>

          <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '15px', lineHeight: '1.7', marginBottom: '44px' }}>
            Créez votre compte et accédez à tous les services de la plateforme académique médicale.
          </p>

          {/* Étapes */}
          {[
            { n: '01', title: 'Créez votre profil', desc: 'Remplissez vos informations personnelles' },
            { n: '02', title: 'Choisissez votre rôle', desc: 'Étudiant ou Enseignant' },
            { n: '03', title: 'Accédez à la plateforme', desc: 'Cours, notes, bibliothèque et plus' },
          ].map((step, i) => (
            <div key={i} style={{ display: 'flex', gap: '16px', alignItems: 'flex-start', marginBottom: '22px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(77,166,255,0.15)', border: '1px solid rgba(77,166,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4DA6FF', fontWeight: '800', fontSize: '11px', flexShrink: 0 }}>{step.n}</div>
              <div>
                <div style={{ color: 'white', fontWeight: '700', fontSize: '14px' }}>{step.title}</div>
                <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: '12px', marginTop: '2px' }}>{step.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── PANNEAU DROIT ── */}
      <div style={{
        flex: 1, background: '#F0F4F8',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '30px 40px', overflowY: 'auto', position: 'relative',
      }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(rgba(0,102,204,0.04) 1px, transparent 1px)', backgroundSize: '24px 24px' }} />

        <div style={{
          width: '100%', maxWidth: '480px', position: 'relative', zIndex: 1,
          opacity: mounted ? 1 : 0, transform: mounted ? 'translateX(0)' : 'translateX(40px)',
          transition: 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.1s',
        }}>
          <div style={{ background: 'white', borderRadius: '24px', padding: '40px 36px', boxShadow: '0 4px 6px rgba(0,0,0,0.04), 0 20px 60px rgba(0,0,0,0.08)', border: '1px solid rgba(0,0,0,0.06)' }}>

            <h2 style={{ color: '#0D1B2A', fontWeight: '800', fontSize: '24px', letterSpacing: '-0.7px', marginBottom: '4px' }}>Créer un compte ✨</h2>
            <p style={{ color: '#6B7A90', fontSize: '13px', marginBottom: '28px' }}>Rejoignez MedCampus Bangui dès maintenant</p>

            {message.text && (
              <div style={{ padding: '11px 15px', borderRadius: '11px', marginBottom: '18px', fontSize: '13px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px', background: message.type === 'success' ? '#E6F7EF' : '#FEF0EF', color: message.type === 'success' ? '#00A86B' : '#DC143C', border: `1px solid ${message.type === 'success' ? '#B3E8D0' : '#F9C4C0'}` }}>
                {message.type === 'success' ? '✅' : '❌'} {message.text}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {/* Nom + Prénom */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                {[['nom', 'Nom', '👤', 'Dupont'], ['prenom', 'Prénom', '✏️', 'Jean']].map(([name, label, icon, ph]) => (
                  <div key={name}>
                    <label style={labelStyle}>{label} <span style={{ color: '#DC143C' }}>*</span></label>
                    <div style={{ position: 'relative' }}>
                      <span style={iconStyle}>{icon}</span>
                      <input type="text" name={name} value={formData[name]} onChange={handleChange}
                        onFocus={() => setFocused(name)} onBlur={() => setFocused('')}
                        placeholder={ph} required style={inputStyle(name)} />
                    </div>
                    {errors[name] && <p style={{ color: '#DC143C', fontSize: '11px', marginTop: '3px' }}>{errors[name][0]}</p>}
                  </div>
                ))}
              </div>

              {/* Email */}
              <div style={{ marginBottom: '14px' }}>
                <label style={labelStyle}>Email <span style={{ color: '#DC143C' }}>*</span></label>
                <div style={{ position: 'relative' }}>
                  <span style={iconStyle}>✉️</span>
                  <input type="email" name="email" value={formData.email} onChange={handleChange}
                    onFocus={() => setFocused('email')} onBlur={() => setFocused('')}
                    placeholder="jean.dupont@medcampus.cf" required style={inputStyle('email')} />
                </div>
                {errors.email && <p style={{ color: '#DC143C', fontSize: '11px', marginTop: '3px' }}>{errors.email[0]}</p>}
              </div>

              {/* Mot de passe */}
              <div style={{ marginBottom: '14px' }}>
                <label style={labelStyle}>Mot de passe <span style={{ color: '#DC143C' }}>*</span></label>
                <div style={{ position: 'relative' }}>
                  <span style={iconStyle}>🔐</span>
                  <input type={showPassword ? 'text' : 'password'} name="mot_de_passe" value={formData.mot_de_passe} onChange={handleChange}
                    onFocus={() => setFocused('mot_de_passe')} onBlur={() => setFocused('')}
                    placeholder="Minimum 6 caractères" required
                    style={{ ...inputStyle('mot_de_passe'), paddingRight: '44px' }} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '13px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '15px', opacity: 0.45 }}>
                    {showPassword ? '🙈' : '👁️'}
                  </button>
                </div>
                {errors.mot_de_passe && <p style={{ color: '#DC143C', fontSize: '11px', marginTop: '3px' }}>{errors.mot_de_passe[0]}</p>}
              </div>

              {/* Rôle + Date */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                <div>
                  <label style={labelStyle}>Rôle <span style={{ color: '#DC143C' }}>*</span></label>
                  <div style={{ position: 'relative' }}>
                    <span style={iconStyle}>🎓</span>
                    <select name="role" value={formData.role} onChange={handleChange} required
                      style={{ ...inputStyle('role'), appearance: 'none', cursor: 'pointer' }}>
                      <option value="">Choisir...</option>
                      <option value="etudiant">Étudiant</option>
                      <option value="enseignant">Enseignant</option>
                    </select>
                  </div>
                  {errors.role && <p style={{ color: '#DC143C', fontSize: '11px', marginTop: '3px' }}>{errors.role[0]}</p>}
                </div>
                <div>
                  <label style={labelStyle}>Date de naissance <span style={{ color: '#DC143C' }}>*</span></label>
                  <div style={{ position: 'relative' }}>
                    <span style={iconStyle}>📅</span>
                    <input type="date" name="date_naissance" value={formData.date_naissance} onChange={handleChange}
                      onFocus={() => setFocused('date_naissance')} onBlur={() => setFocused('')}
                      required style={inputStyle('date_naissance')} />
                  </div>
                  {errors.date_naissance && <p style={{ color: '#DC143C', fontSize: '11px', marginTop: '3px' }}>{errors.date_naissance[0]}</p>}
                </div>
              </div>

              {/* Filière (étudiant) */}
              {formData.role === 'etudiant' && (
                <div style={{ marginBottom: '14px' }}>
                  <label style={labelStyle}>Filière <span style={{ color: '#DC143C' }}>*</span></label>
                  <div style={{ position: 'relative' }}>
                    <span style={iconStyle}>🩺</span>
                    <select name="filiere" value={formData.filiere} onChange={handleChange} required
                      style={{ ...inputStyle('filiere'), appearance: 'none', cursor: 'pointer' }}>
                      <option value="">Choisir une filière...</option>
                      {filieres.map(f => <option key={f} value={f}>{f}</option>)}
                    </select>
                  </div>
                  {errors.filiere && <p style={{ color: '#DC143C', fontSize: '11px', marginTop: '3px' }}>{errors.filiere[0]}</p>}
                </div>
              )}

              {/* Spécialité (enseignant) */}
              {formData.role === 'enseignant' && (
                <div style={{ marginBottom: '14px' }}>
                  <label style={labelStyle}>Spécialité <span style={{ color: '#DC143C' }}>*</span></label>
                  <div style={{ position: 'relative' }}>
                    <span style={iconStyle}>💊</span>
                    <input type="text" name="specialite" value={formData.specialite} onChange={handleChange}
                      onFocus={() => setFocused('specialite')} onBlur={() => setFocused('')}
                      placeholder="Ex: Cardiologie, Neurologie..." required style={inputStyle('specialite')} />
                  </div>
                  {errors.specialite && <p style={{ color: '#DC143C', fontSize: '11px', marginTop: '3px' }}>{errors.specialite[0]}</p>}
                </div>
              )}

              {/* Bouton */}
              <button type="submit" disabled={loading}
                style={{
                  width: '100%', padding: '14px', marginTop: '8px',
                  background: loading ? '#93C5FD' : 'linear-gradient(135deg, #00A86B 0%, #007A4D 100%)',
                  color: 'white', border: 'none', borderRadius: '12px',
                  fontSize: '15px', fontWeight: '700', cursor: loading ? 'not-allowed' : 'pointer',
                  boxShadow: loading ? 'none' : '0 4px 20px rgba(0,168,107,0.35)',
                  transition: 'all 0.2s ease', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                }}
                onMouseEnter={e => { if (!loading) e.currentTarget.style.transform = 'translateY(-1px)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; }}
              >
                {loading ? (
                  <><span style={{ width: '17px', height: '17px', border: '2px solid white', borderTopColor: 'transparent', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.8s linear infinite' }} /> Inscription...</>
                ) : '→ Créer mon compte'}
              </button>
            </form>

            <div style={{ textAlign: 'center', marginTop: '20px' }}>
              <span style={{ color: '#6B7A90', fontSize: '13px' }}>Déjà un compte ? </span>
              <a href="/login" style={{ color: '#0066CC', fontWeight: '700', fontSize: '13px', textDecoration: 'none' }}>Se connecter</a>
            </div>
          </div>

          <p style={{ textAlign: 'center', color: '#9AA5B4', fontSize: '11px', marginTop: '16px' }}>
            © 2026 MedCampus Bangui · Faculté de Médecine de Bangui
          </p>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&display=swap');
        @keyframes pulse { 0%, 100% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.05); opacity: 0.8; } }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}