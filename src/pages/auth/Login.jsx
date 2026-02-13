import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/api';
import { saveAuth } from '../../utils/auth';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';

export default function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    mot_de_passe: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Effacer l'erreur du champ modifié
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });
    setErrors({});

    try {
      const response = await authService.login(formData);
      
      if (response.data.success) {
        // Sauvegarder le token
        saveAuth(response.data.access_token, response.data.utilisateur || {});
        
        setMessage({ type: 'success', text: 'Connexion réussie !' });
        
        // Récupérer les infos utilisateur
        const userResponse = await authService.getMe();
        const user = userResponse.data.data;
        
        // Mettre à jour les infos utilisateur
        localStorage.setItem('user', JSON.stringify(user));
        
        // Redirection selon le rôle
        setTimeout(() => {
          switch (user.role) {
            case 'admin':
              navigate('/admin/dashboard');
              break;
            case 'enseignant':
              navigate('/enseignant/dashboard');
              break;
            case 'etudiant':
              navigate('/etudiant/dashboard');
              break;
            default:
              navigate('/');
          }
        }, 1000);
      }
    } catch (error) {
      console.error('Erreur login:', error);
      
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      } else {
        setMessage({ 
          type: 'error', 
          text: error.response?.data?.message || 'Email ou mot de passe incorrect' 
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🏥</div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            MedCampus Bangui
          </h1>
          <p className="text-gray-600">Connexion à votre compte</p>
        </div>

        {/* Messages */}
        {message.text && (
          <div className={`mb-6 p-4 rounded-lg ${
            message.type === 'success' 
              ? 'bg-green-100 border-l-4 border-green-500 text-green-700' 
              : 'bg-red-100 border-l-4 border-red-500 text-red-700'
          }`}>
            {message.text}
          </div>
        )}

        {/* Formulaire */}
        <form onSubmit={handleSubmit}>
          <Input
            label="Email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            error={errors.email?.[0]}
            required
            placeholder="votre.email@medcampus.cf"
          />

          <Input
            label="Mot de passe"
            type="password"
            name="mot_de_passe"
            value={formData.mot_de_passe}
            onChange={handleChange}
            error={errors.mot_de_passe?.[0]}
            required
            placeholder="••••••••"
          />

          <Button
            type="submit"
            variant="primary"
            disabled={loading}
            className="w-full mt-6"
          >
            {loading ? 'Connexion...' : 'Se connecter'}
          </Button>
        </form>

        {/* Lien vers inscription */}
        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Pas encore de compte ?{' '}
            <a href="/register" className="text-blue-600 hover:text-blue-700 font-semibold">
              S'inscrire
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}