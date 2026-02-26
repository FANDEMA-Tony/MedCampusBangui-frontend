import { useState, useEffect } from 'react';
import { messageService, etudiantService, enseignantService, coursService } from '../../services/api';
import { getUser } from '../../utils/auth';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';

export default function ComposeModal({ isOpen, onClose, onMessageSent, type = 'prive' }) {
  const currentUser = getUser();
  const [loading, setLoading] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingCours, setLoadingCours] = useState(false);
  
  const [utilisateurs, setUtilisateurs] = useState([]);
  const [coursList, setCoursList] = useState([]);
  
  const [formData, setFormData] = useState({
    type: type,
    destinataire_id: '',
    visibilite: 'tous',
    id_cours: '',
    sujet: '',
    contenu: '',
  });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    if (isOpen) {
      setFormData(prev => ({ ...prev, type: type }));
      
      if (type === 'prive') {
        fetchUtilisateurs();
      }
      
      if (type === 'annonce' && currentUser.role === 'enseignant') {
        fetchCours();
      }
    }
  }, [isOpen, type]);

  const fetchUtilisateurs = async () => {
    try {
      setLoadingUsers(true);
      let allUsers = [];

      // Récupérer enseignants
      try {
        const enseignantsResponse = await enseignantService.getAll();
        const enseignants = enseignantsResponse.data.data?.data || enseignantsResponse.data.data || [];
        
        enseignants.forEach(ens => {
          const userId = ens.id_utilisateur || ens.utilisateur?.id_utilisateur;
          
          if (userId && userId !== currentUser.id_utilisateur) {
            allUsers.push({
              id_utilisateur: userId,
              nom_complet: `${ens.prenom} ${ens.nom}`,
              role: 'Enseignant',
              email: ens.email,
              specialite: ens.specialite || ''
            });
          }
        });
      } catch (err) {
        console.error('Erreur enseignants:', err);
      }

      // Étudiants (admin/enseignant uniquement)
      if (currentUser.role === 'admin' || currentUser.role === 'enseignant') {
        try {
          const etudiantsResponse = await etudiantService.getAll();
          const etudiants = etudiantsResponse.data.data?.data || etudiantsResponse.data.data || [];
          
          etudiants.forEach(etu => {
            const userId = etu.id_utilisateur || etu.utilisateur?.id_utilisateur;
            
            if (userId && userId !== currentUser.id_utilisateur) {
              allUsers.push({
                id_utilisateur: userId,
                nom_complet: `${etu.prenom} ${etu.nom}`,
                role: 'Étudiant',
                email: etu.email,
                filiere: etu.filiere || ''
              });
            }
          });
        } catch (err) {
          console.error('Erreur étudiants:', err);
        }
      }

      // Trier
      allUsers.sort((a, b) => {
        if (a.role !== b.role) {
          return a.role.localeCompare(b.role);
        }
        return a.nom_complet.localeCompare(b.nom_complet);
      });

      setUtilisateurs(allUsers);
      setLoadingUsers(false);
    } catch (error) {
      console.error('Erreur récupération utilisateurs:', error);
      setLoadingUsers(false);
    }
  };

  const fetchCours = async () => {
    try {
      setLoadingCours(true);
      const response = await coursService.getMesCours();
      const coursData = response.data.data || [];
      setCoursList(coursData);
      setLoadingCours(false);
    } catch (err) {
      console.error('Erreur cours:', err);
      setLoadingCours(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    
    setMessage({ type: '', text: '' });
    setErrors({});

    try {
      setLoading(true);
      const response = await messageService.send(formData);

      if (response.data.success || response.status === 200 || response.status === 201) {
        setMessage({
          type: 'success',
          text: type === 'prive' ? 'Message envoyé !' : type === 'annonce' ? 'Annonce publiée !' : 'Message posté !',
        });

        setTimeout(() => {
          resetForm();
          setLoading(false);
          onMessageSent();
        }, 1500);
      }
    } catch (error) {
      console.error('❌ Erreur envoi:', error);
      
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      } else {
        setMessage({
          type: 'error',
          text: error.response?.data?.message || "Erreur lors de l'envoi",
        });
      }
      
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      type: type,
      destinataire_id: '',
      visibilite: 'tous',
      id_cours: '',
      sujet: '',
      contenu: '',
    });
    setErrors({});
    setMessage({ type: '', text: '' });
  };

  const handleClose = () => {
    if (!loading) {
      resetForm();
      onClose();
    }
  };

  const getModalTitle = () => {
    switch (type) {
      case 'prive': return '✉️ Nouveau message privé';
      case 'annonce': return '📢 Nouvelle annonce';
      case 'forum': return '💬 Nouveau post forum';
      default: return '✉️ Nouveau message';
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={getModalTitle()}>
      {/* 🎨 MESSAGE SUCCÈS/ERREUR MODERNE */}
      {message.text && (
        <div 
          className={`mb-6 p-4 rounded-xl border-l-4 shadow-sm animate-fade-in`}
          style={{
            backgroundColor: message.type === 'success' ? '#E6F7F0' : '#FFE6EC',
            borderLeftColor: message.type === 'success' ? '#00A86B' : '#DC143C',
          }}
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">
              {message.type === 'success' ? '✅' : '❌'}
            </span>
            <p className="font-semibold" style={{ color: message.type === 'success' ? '#00A86B' : '#DC143C' }}>
              {message.text}
            </p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        
        {/* 🎨 DESTINATAIRE (Messages privés) */}
        {type === 'prive' && (
          <div className="mb-5">
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Destinataire <span style={{ color: '#DC143C' }}>*</span>
            </label>
            
            {loadingUsers ? (
              <div className="text-center py-6 bg-gray-50 rounded-xl">
                <div 
                  className="inline-block animate-spin rounded-full h-8 w-8 border-b-2"
                  style={{ borderColor: '#0066CC' }}
                ></div>
                <p className="text-sm text-gray-500 mt-3">Chargement des contacts...</p>
              </div>
            ) : (
              <>
                <select
                  name="destinataire_id"
                  value={formData.destinataire_id}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  style={{ outline: 'none' }}
                >
                  <option value="">-- Sélectionner un destinataire --</option>
                  
                  {utilisateurs.filter(u => u.role === 'Enseignant').length > 0 && (
                    <optgroup label="👨‍🏫 Enseignants">
                      {utilisateurs
                        .filter(u => u.role === 'Enseignant')
                        .map(user => (
                          <option key={user.id_utilisateur} value={user.id_utilisateur}>
                            {user.nom_complet} ({user.email})
                          </option>
                        ))
                      }
                    </optgroup>
                  )}
                  
                  {utilisateurs.filter(u => u.role === 'Étudiant').length > 0 && (
                    <optgroup label="👨‍🎓 Étudiants">
                      {utilisateurs
                        .filter(u => u.role === 'Étudiant')
                        .map(user => (
                          <option key={user.id_utilisateur} value={user.id_utilisateur}>
                            {user.nom_complet} ({user.email})
                          </option>
                        ))
                      }
                    </optgroup>
                  )}
                </select>

                {/* Note pour étudiants */}
                {currentUser.role === 'etudiant' && (
                  <div 
                    className="mt-3 p-4 rounded-xl text-sm border-l-4"
                    style={{ backgroundColor: '#E6F2FF', borderLeftColor: '#0066CC' }}
                  >
                    <p className="flex items-start gap-2">
                      <span className="text-lg flex-shrink-0">ℹ️</span>
                      <span>
                        <strong>Note :</strong> Vous pouvez envoyer des messages aux enseignants uniquement. 
                        Pour échanger avec d'autres étudiants, utilisez le <strong>Forum</strong>.
                      </span>
                    </p>
                  </div>
                )}
              </>
            )}
            
            {errors.destinataire_id && (
              <p className="text-sm mt-2 flex items-center gap-2" style={{ color: '#DC143C' }}>
                <span>⚠️</span>
                {errors.destinataire_id[0]}
              </p>
            )}
          </div>
        )}

        {/* 🎨 VISIBILITÉ (Annonces) */}
        {type === 'annonce' && (
          <>
            <div className="mb-5">
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Visibilité <span style={{ color: '#DC143C' }}>*</span>
              </label>
              <select
                name="visibilite"
                value={formData.visibilite}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                style={{ outline: 'none' }}
              >
                <option value="tous">🌍 Tous les utilisateurs</option>
                <option value="enseignants">👨‍🏫 Enseignants uniquement</option>
                <option value="etudiants">👨‍🎓 Étudiants uniquement</option>
                <option value="cours">📚 Cours spécifique</option>
              </select>
              {errors.visibilite && (
                <p className="text-sm mt-2 flex items-center gap-2" style={{ color: '#DC143C' }}>
                  <span>⚠️</span>
                  {errors.visibilite[0]}
                </p>
              )}
            </div>

            {/* COURS (si visibilité = cours) */}
            {formData.visibilite === 'cours' && (
              <div className="mb-5">
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Cours concerné <span style={{ color: '#DC143C' }}>*</span>
                </label>
                
                {loadingCours ? (
                  <div className="text-center py-4 bg-gray-50 rounded-xl">
                    <div 
                      className="inline-block animate-spin rounded-full h-6 w-6 border-b-2"
                      style={{ borderColor: '#00A86B' }}
                    ></div>
                  </div>
                ) : (
                  <select
                    name="id_cours"
                    value={formData.id_cours}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                    style={{ outline: 'none' }}
                  >
                    <option value="">-- Sélectionner un cours --</option>
                    {coursList.map(cours => (
                      <option key={cours.id_cours} value={cours.id_cours}>
                        {cours.code} - {cours.titre}
                      </option>
                    ))}
                  </select>
                )}
                
                {errors.id_cours && (
                  <p className="text-sm mt-2 flex items-center gap-2" style={{ color: '#DC143C' }}>
                    <span>⚠️</span>
                    {errors.id_cours[0]}
                  </p>
                )}
              </div>
            )}
          </>
        )}

        {/* 🎨 SUJET */}
        <div className="mb-5">
          <label className="block text-sm font-bold text-gray-700 mb-2">
            Sujet {(type === 'annonce' || type === 'forum') && <span style={{ color: '#DC143C' }}>*</span>}
          </label>
          <input
            type="text"
            name="sujet"
            value={formData.sujet}
            onChange={handleChange}
            required={type === 'annonce' || type === 'forum'}
            placeholder={type === 'forum' ? 'Titre de votre discussion' : 'Objet du message'}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            style={{ outline: 'none' }}
          />
          {errors.sujet && (
            <p className="text-sm mt-2 flex items-center gap-2" style={{ color: '#DC143C' }}>
              <span>⚠️</span>
              {errors.sujet[0]}
            </p>
          )}
        </div>

        {/* 🎨 CONTENU */}
        <div className="mb-6">
          <label className="block text-sm font-bold text-gray-700 mb-2">
            Message <span style={{ color: '#DC143C' }}>*</span>
          </label>
          <textarea
            name="contenu"
            value={formData.contenu}
            onChange={handleChange}
            required
            rows={type === 'forum' ? '8' : '6'}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            style={{ outline: 'none', resize: 'vertical' }}
            placeholder={
              type === 'prive' ? 'Écrivez votre message...' :
              type === 'annonce' ? 'Rédigez votre annonce...' :
              'Partagez votre question ou réflexion...'
            }
          />
          {errors.contenu && (
            <p className="text-sm mt-2 flex items-center gap-2" style={{ color: '#DC143C' }}>
              <span>⚠️</span>
              {errors.contenu[0]}
            </p>
          )}
        </div>

        {/* 🎨 BOUTONS CTA DIFFÉRENCIÉS */}
        <div className="flex gap-3">
          <Button
            type="submit"
            variant="primary"
            className="flex-1 py-3 font-bold text-base shadow-lg hover:shadow-xl transition-all"
            disabled={loading || loadingUsers || loadingCours}
            style={{
              backgroundColor: type === 'prive' ? '#0066CC' : type === 'annonce' ? '#00A86B' : '#FF6B35',
              borderColor: type === 'prive' ? '#0066CC' : type === 'annonce' ? '#00A86B' : '#FF6B35'
            }}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="animate-spin">⏳</span>
                Envoi en cours...
              </span>
            ) : (
              <>
                {type === 'prive' ? '📤 Envoyer' : 
                 type === 'annonce' ? '📢 Publier l\'annonce' : 
                 '💬 Poster sur le forum'}
              </>
            )}
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={handleClose}
            className="flex-1 py-3 font-semibold text-base"
            disabled={loading}
          >
            Annuler
          </Button>
        </div>
      </form>
    </Modal>
  );
}