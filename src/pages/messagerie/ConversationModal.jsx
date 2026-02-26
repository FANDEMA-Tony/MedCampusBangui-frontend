import { useEffect } from 'react';
import { getUser } from '../../utils/auth';
import { messageService } from '../../services/api';
import Modal from '../../components/common/Modal';
import Button from '../../components/common/Button';

// 🎨 COULEURS AVATARS
const AVATAR_COLORS = [
  '#0066CC', '#00A86B', '#DC143C', '#FF6B35', '#8B5CF6', 
  '#EC4899', '#F59E0B', '#10B981', '#3B82F6', '#6366F1'
];

const getAvatarColor = (name) => {
  if (!name) return AVATAR_COLORS[0];
  const index = name.charCodeAt(0) % AVATAR_COLORS.length;
  return AVATAR_COLORS[index];
};

export default function ConversationModal({ 
  isOpen, 
  onClose, 
  message, 
  onMessageDeleted, 
  onMessageRead 
}) {
  const user = getUser();

  useEffect(() => {
    if (isOpen && message) {
      
      // ✅ CORRECTION : Debug complet
      const destinataireId = Number(message.destinataire_id);
      const userId = Number(user.id);
      
      console.log('📧 === DEBUG MESSAGE NON LU ===');
      console.log('Message complet:', message);
      console.log('User complet:', user);
      console.log('destinataire_id (message):', message.destinataire_id, typeof message.destinataire_id);
      console.log('destinataireId (Number):', destinataireId, typeof destinataireId);
      console.log('user.id:', user.id, typeof user.id);
      console.log('userId (Number):', userId, typeof userId);
      console.log('est_lu:', message.est_lu, typeof message.est_lu);
      console.log('Comparaison:', destinataireId === userId);
      console.log('Condition finale:', destinataireId === userId && !message.est_lu);
      
      if (destinataireId === userId && !message.est_lu) {
        console.log('🔥 MARQUAGE COMME LU...');
        // ✅ Appeler l'API show() pour marquer comme lu en BASE
        messageService.getOne(message.id_message)
          .then((response) => {
            console.log('✅ Réponse API:', response.data);
            console.log('✅ Message marqué comme lu en base !');
            // ✅ Mettre à jour local + badge Navbar
            onMessageRead(message.id_message);
          })
          .catch(err => {
            console.error('❌ Erreur marquage lu:', err);
            // Même en erreur, mettre à jour localement
            onMessageRead(message.id_message);
          });
      } else {
        console.log('⏭️ Message déjà lu ou pas pour cet utilisateur');
      }
    }
  }, [isOpen, message]);

  const handleDelete = async () => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce message ?')) {
      return;
    }

    try {
      const response = await messageService.delete(message.id_message);
      
      if (response.data?.success || response.status === 200 || response.status === 204) {
        alert('Message supprimé avec succès !');
        onMessageDeleted();
      }
    } catch (error) {
      console.error('Erreur suppression:', error);
      alert(error.response?.data?.message || 'Erreur lors de la suppression');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!message) return null;

  const expediteur = message.expediteur;
  const initials = `${expediteur?.prenom?.charAt(0) || '?'}${expediteur?.nom?.charAt(0) || '?'}`;
  const avatarColor = getAvatarColor(expediteur?.nom);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="📧 Message">
      <div>
        {/* 🎨 HEADER AVEC AVATAR */}
        <div className="mb-6 pb-6 border-b border-gray-200">
          <div className="flex items-center gap-4 mb-4">
            {/* Avatar coloré */}
            <div 
              className="w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg flex-shrink-0"
              style={{ backgroundColor: avatarColor }}
            >
              {initials}
            </div>
            
            <div className="flex-1">
              <p className="font-bold text-gray-900 text-lg">
                {expediteur?.prenom} {expediteur?.nom}
              </p>
              <p className="text-sm text-gray-500 flex items-center gap-2 mt-1">
                <span>📅</span>
                {formatDate(message.created_at)}
              </p>
            </div>
          </div>
          
          {/* Sujet */}
          <div 
            className="mt-4 p-4 rounded-lg"
            style={{ backgroundColor: '#EFF6FF' }}
          >
            <p className="text-xs font-semibold text-gray-500 mb-1">SUJET</p>
            <p className="text-lg font-semibold" style={{ color: '#0066CC' }}>
              {message.sujet || '(Sans sujet)'}
            </p>
          </div>
        </div>

        {/* 🎨 CONTENU MESSAGE */}
        <div className="mb-6">
          <p className="text-xs font-semibold text-gray-500 mb-3">MESSAGE</p>
          <div 
            className="p-4 rounded-lg border"
            style={{ backgroundColor: '#F9FAFB', borderColor: '#E5E7EB' }}
          >
            <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
              {message.contenu}
            </p>
          </div>
        </div>

        {/* 🎨 BOUTONS MODERNES */}
        <div className="flex gap-3">
          <Button
            variant="danger"
            onClick={handleDelete}
            className="flex-1 py-3 font-semibold"
            style={{ 
              backgroundColor: '#DC143C', 
              borderColor: '#DC143C',
              boxShadow: '0 4px 6px -1px rgba(220, 20, 60, 0.2)'
            }}
          >
            🗑️ Supprimer
          </Button>
          <Button
            variant="secondary"
            onClick={onClose}
            className="flex-1 py-3 font-semibold"
          >
            Fermer
          </Button>
        </div>
      </div>
    </Modal>
  );
}