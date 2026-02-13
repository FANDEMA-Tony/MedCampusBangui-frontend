import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/api';
import { saveAuth } from '../../utils/auth';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';

export default function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    mot_de_passe: '',
    role: '',
    filiere: '',
    specialite: '',
    date_naissance: '',
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
      const response = await authService.register(formData);
      
      if (response.data.success) {
        // Sauvegarder le token
        saveAuth(response.data.access_token, response.data.utilisateur);
        
        setMessage({ type: 'success', text: 'Inscription réussie ! Redirection...' });
        
        // Redirection vers login après 2 secondes
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      }
    } catch (error) {
      console.error('Erreur inscription:', error);
      
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      } else {
        setMessage({ 
          type: 'error', 
          text: error.response?.data?.message || 'Une erreur est survenue lors de l\'inscription' 
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const roleOptions = [
    { value: 'etudiant', label: 'Étudiant' },
    { value: 'enseignant', label: 'Enseignant' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl p-8 my-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🏥</div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            MedCampus Bangui
          </h1>
          <p className="text-gray-600">Créer un compte</p>
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Nom"
              type="text"
              name="nom"
              value={formData.nom}
              onChange={handleChange}
              error={errors.nom?.[0]}
              required
              placeholder="Dupont"
            />

            <Input
              label="Prénom"
              type="text"
              name="prenom"
              value={formData.prenom}
              onChange={handleChange}
              error={errors.prenom?.[0]}
              required
              placeholder="Jean"
            />
          </div>

          <Input
            label="Email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            error={errors.email?.[0]}
            required
            placeholder="jean.dupont@medcampus.cf"
          />

          <Input
            label="Mot de passe"
            type="password"
            name="mot_de_passe"
            value={formData.mot_de_passe}
            onChange={handleChange}
            error={errors.mot_de_passe?.[0]}
            required
            placeholder="Minimum 6 caractères"
          />

          <Select
            label="Rôle"
            name="role"
            value={formData.role}
            onChange={handleChange}
            options={roleOptions}
            error={errors.role?.[0]}
            required
          />

          <Input
            label="Date de naissance"
            type="date"
            name="date_naissance"
            value={formData.date_naissance}
            onChange={handleChange}
            error={errors.date_naissance?.[0]}
            required
          />

          {formData.role === 'etudiant' && (
            <Input
              label="Filière"
              type="text"
              name="filiere"
              value={formData.filiere}
              onChange={handleChange}
              error={errors.filiere?.[0]}
              required
              placeholder="Médecine"
            />
          )}

          {formData.role === 'enseignant' && (
            <Input
              label="Spécialité"
              type="text"
              name="specialite"
              value={formData.specialite}
              onChange={handleChange}
              error={errors.specialite?.[0]}
              required
              placeholder="Cardiologie"
            />
          )}

          <Button
            type="submit"
            variant="primary"
            disabled={loading}
            className="w-full mt-6"
          >
            {loading ? 'Inscription...' : 'S\'inscrire'}
          </Button>
        </form>

        {/* Lien vers connexion */}
        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Déjà un compte ?{' '}
            <a href="/login" className="text-blue-600 hover:text-blue-700 font-semibold">
              Se connecter
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}