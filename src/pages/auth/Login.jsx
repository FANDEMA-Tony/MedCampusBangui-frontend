import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/api';
import { saveAuth } from '../../utils/auth';

export default function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', mot_de_passe: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [focused, setFocused] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setTimeout(() => setMounted(true), 50);
  }, []);

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
      const response = await authService.login(formData);
      if (response.data.success || response.data.access_token) {
        const token = response.data.access_token;
        setMessage({ type: 'success', text: 'Connexion réussie !' });
        localStorage.setItem('token', token);
        try {
          const userResponse = await authService.getMe();
          const user = userResponse.data?.data || userResponse.data?.utilisateur || userResponse.data;
          localStorage.setItem('user', JSON.stringify(user));
          if (user && user.role) {
            setTimeout(() => {
              switch (user.role) {
                case 'admin': window.location.href = '/admin/dashboard'; break;
                case 'enseignant': window.location.href = '/enseignant/dashboard'; break;
                case 'etudiant': window.location.href = '/etudiant/dashboard'; break;
                default: window.location.href = '/';
              }
            }, 600);
          } else {
            setTimeout(() => { window.location.href = '/etudiant/dashboard'; }, 600);
          }
        } catch {
          setTimeout(() => { window.location.href = '/etudiant/dashboard'; }, 600);
        }
      }
    } catch (error) {
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      } else {
        setMessage({ type: 'error', text: error.response?.data?.message || 'Email ou mot de passe incorrect' });
      }
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    { value: '1,200+', label: 'Étudiants inscrits', icon: '👨‍🎓' },
    { value: '85+', label: 'Enseignants experts', icon: '👨‍⚕️' },
    { value: '240+', label: 'Cours disponibles', icon: '📚' },
    { value: '98%', label: 'Taux de satisfaction', icon: '⭐' },
  ];

  return (
    <div style={{ minHeight: '100vh', display: 'flex', fontFamily: "'Sora', 'Segoe UI', sans-serif", overflow: 'hidden' }}>

      {/* ── PANNEAU GAUCHE ── */}
      <div style={{
        flex: '0 0 55%',
        background: 'linear-gradient(135deg, #0A1628 0%, #0D2137 40%, #0A3352 70%, #0066CC 100%)',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '60px 70px',
        overflow: 'hidden',
      }}>

        {/* Cercles décoratifs */}
        <div style={{
          position: 'absolute', top: '-80px', right: '-80px',
          width: '380px', height: '380px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(0,102,204,0.25) 0%, transparent 70%)',
          animation: 'pulse 4s ease-in-out infinite',
        }} />
        <div style={{
          position: 'absolute', bottom: '-60px', left: '-60px',
          width: '280px', height: '280px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(0,168,107,0.2) 0%, transparent 70%)',
          animation: 'pulse 5s ease-in-out infinite reverse',
        }} />
        <div style={{
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '600px', height: '600px', borderRadius: '50%',
          border: '1px solid rgba(255,255,255,0.03)',
        }} />

        {/* Grille de points */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'radial-gradient(rgba(255,255,255,0.04) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }} />

        {/* Logo + Nom */}
        <div style={{
          position: 'relative', zIndex: 2,
          opacity: mounted ? 1 : 0, transform: mounted ? 'translateY(0)' : 'translateY(30px)',
          transition: 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '40px' }}>
            <div style={{
              width: '56px', height: '56px', borderRadius: '16px',
              background: 'linear-gradient(135deg, #0066CC, #00A86B)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '26px', boxShadow: '0 8px 32px rgba(0,102,204,0.4)',
            }}>🏥</div>
            <div>
              <div style={{ color: 'white', fontWeight: '800', fontSize: '22px', letterSpacing: '-0.5px' }}>
                MedCampus
              </div>
              <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px', fontWeight: '500' }}>
                Bangui — République Centrafricaine
              </div>
            </div>
          </div>

          <h1 style={{
            color: 'white', fontSize: '44px', fontWeight: '800',
            lineHeight: '1.1', letterSpacing: '-1.5px', marginBottom: '20px',
          }}>
            La plateforme<br />
            <span style={{
              background: 'linear-gradient(90deg, #4DA6FF, #00E5A0)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>médicale officielle</span>
          </h1>

          <p style={{
            color: 'rgba(255,255,255,0.6)', fontSize: '16px',
            lineHeight: '1.7', maxWidth: '380px', marginBottom: '50px',
          }}>
            Gérez vos cours, notes, ressources médicales et communications en toute sécurité depuis une seule plateforme.
          </p>
        </div>

        {/* Stats */}
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px',
          position: 'relative', zIndex: 2, maxWidth: '420px',
          opacity: mounted ? 1 : 0, transform: mounted ? 'translateY(0)' : 'translateY(40px)',
          transition: 'all 0.9s cubic-bezier(0.16, 1, 0.3, 1) 0.15s',
        }}>
          {stats.map((s, i) => (
            <div key={i} style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '16px', padding: '20px',
              backdropFilter: 'blur(10px)',
              transition: 'all 0.3s ease',
            }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.09)'; e.currentTarget.style.borderColor = 'rgba(77,166,255,0.3)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; }}
            >
              <div style={{ fontSize: '24px', marginBottom: '8px' }}>{s.icon}</div>
              <div style={{ color: 'white', fontWeight: '800', fontSize: '22px', letterSpacing: '-0.5px' }}>{s.value}</div>
              <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: '12px', marginTop: '2px' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Badges sécurité */}
        <div style={{
          display: 'flex', gap: '12px', marginTop: '40px',
          position: 'relative', zIndex: 2,
          opacity: mounted ? 1 : 0,
          transition: 'all 1s cubic-bezier(0.16, 1, 0.3, 1) 0.3s',
        }}>
          {['🔒 Données sécurisées', '✅ JWT Auth', '🏥 FOSA Certifié'].map((badge, i) => (
            <div key={i} style={{
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '100px', padding: '6px 14px',
              color: 'rgba(255,255,255,0.6)', fontSize: '11px', fontWeight: '600',
            }}>{badge}</div>
          ))}
        </div>
      </div>

      {/* ── PANNEAU DROIT ── */}
      <div style={{
        flex: 1,
        background: '#F0F4F8',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '40px',
        position: 'relative',
      }}>

        {/* Fond subtil */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'radial-gradient(rgba(0,102,204,0.04) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }} />

        <div style={{
          width: '100%', maxWidth: '400px',
          position: 'relative', zIndex: 1,
          opacity: mounted ? 1 : 0, transform: mounted ? 'translateX(0)' : 'translateX(40px)',
          transition: 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.1s',
        }}>

          {/* Card principale */}
          <div style={{
            background: 'white',
            borderRadius: '24px',
            padding: '44px 40px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.04), 0 20px 60px rgba(0,0,0,0.08)',
            border: '1px solid rgba(0,0,0,0.06)',
          }}>

            <h2 style={{
              color: '#0D1B2A', fontWeight: '800', fontSize: '26px',
              letterSpacing: '-0.8px', marginBottom: '6px',
            }}>Bon retour ! 👋</h2>
            <p style={{ color: '#6B7A90', fontSize: '14px', marginBottom: '32px' }}>
              Connectez-vous à votre espace MedCampus
            </p>

            {/* Message feedback */}
            {message.text && (
              <div style={{
                padding: '12px 16px', borderRadius: '12px', marginBottom: '20px',
                fontSize: '13px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px',
                background: message.type === 'success' ? '#E6F7EF' : '#FEF0EF',
                color: message.type === 'success' ? '#00A86B' : '#DC143C',
                border: `1px solid ${message.type === 'success' ? '#B3E8D0' : '#F9C4C0'}`,
              }}>
                {message.type === 'success' ? '✅' : '❌'} {message.text}
              </div>
            )}

            <form onSubmit={handleSubmit}>

              {/* Champ Email */}
              <div style={{ marginBottom: '18px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#3D4A5C', marginBottom: '8px' }}>
                  Adresse email
                </label>
                <div style={{ position: 'relative' }}>
                  <span style={{
                    position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)',
                    fontSize: '16px', opacity: 0.5,
                  }}>✉️</span>
                  <input
                    type="email" name="email"
                    value={formData.email} onChange={handleChange}
                    onFocus={() => setFocused('email')} onBlur={() => setFocused('')}
                    placeholder="votre.email@medcampus.cf"
                    required
                    style={{
                      width: '100%', padding: '13px 16px 13px 42px',
                      border: `2px solid ${errors.email ? '#DC143C' : focused === 'email' ? '#0066CC' : '#E2E8F0'}`,
                      borderRadius: '12px', fontSize: '14px', outline: 'none',
                      background: focused === 'email' ? '#F8FEFF' : 'white',
                      color: '#0D1B2A', transition: 'all 0.2s ease',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
                {errors.email && <p style={{ color: '#DC143C', fontSize: '12px', marginTop: '4px' }}>{errors.email[0]}</p>}
              </div>

              {/* Champ Mot de passe */}
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#3D4A5C', marginBottom: '8px' }}>
                  Mot de passe
                </label>
                <div style={{ position: 'relative' }}>
                  <span style={{
                    position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)',
                    fontSize: '16px', opacity: 0.5,
                  }}>🔐</span>
                  <input
                    type={showPassword ? 'text' : 'password'} name="mot_de_passe"
                    value={formData.mot_de_passe} onChange={handleChange}
                    onFocus={() => setFocused('password')} onBlur={() => setFocused('')}
                    placeholder="••••••••"
                    required
                    style={{
                      width: '100%', padding: '13px 44px 13px 42px',
                      border: `2px solid ${errors.mot_de_passe ? '#DC143C' : focused === 'password' ? '#0066CC' : '#E2E8F0'}`,
                      borderRadius: '12px', fontSize: '14px', outline: 'none',
                      background: focused === 'password' ? '#F8FEFF' : 'white',
                      color: '#0D1B2A', transition: 'all 0.2s ease',
                      boxSizing: 'border-box',
                    }}
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} style={{
                    position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px', opacity: 0.5,
                  }}>{showPassword ? '🙈' : '👁️'}</button>
                </div>
                {errors.mot_de_passe && <p style={{ color: '#DC143C', fontSize: '12px', marginTop: '4px' }}>{errors.mot_de_passe[0]}</p>}
              </div>

              {/* Bouton connexion */}
              <button
                type="submit" disabled={loading}
                style={{
                  width: '100%', padding: '14px',
                  background: loading
                    ? '#93C5FD'
                    : 'linear-gradient(135deg, #0066CC 0%, #0052A3 100%)',
                  color: 'white', border: 'none', borderRadius: '12px',
                  fontSize: '15px', fontWeight: '700', cursor: loading ? 'not-allowed' : 'pointer',
                  boxShadow: loading ? 'none' : '0 4px 20px rgba(0,102,204,0.35)',
                  transition: 'all 0.2s ease',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                }}
                onMouseEnter={e => { if (!loading) e.currentTarget.style.transform = 'translateY(-1px)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; }}
              >
                {loading ? (
                  <>
                    <span style={{
                      width: '18px', height: '18px', border: '2px solid white',
                      borderTopColor: 'transparent', borderRadius: '50%',
                      display: 'inline-block', animation: 'spin 0.8s linear infinite',
                    }} />
                    Connexion en cours...
                  </>
                ) : '→ Se connecter'}
              </button>
            </form>

            <div style={{ textAlign: 'center', marginTop: '24px' }}>
              <span style={{ color: '#6B7A90', fontSize: '13px' }}>Pas encore de compte ? </span>
              <a href="/register" style={{ color: '#0066CC', fontWeight: '700', fontSize: '13px', textDecoration: 'none' }}>
                S'inscrire gratuitement
              </a>
            </div>
          </div>

          {/* Footer */}
          <p style={{ textAlign: 'center', color: '#9AA5B4', fontSize: '11px', marginTop: '20px' }}>
            © 2026 MedCampus Bangui · Faculté des Sciences de la Santé de Bangui
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