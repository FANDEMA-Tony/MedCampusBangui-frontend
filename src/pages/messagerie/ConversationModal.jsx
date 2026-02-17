import { useEffect } from 'react';
import { getUser } from '../../utils/auth';
import { messageService } from '../../services/api';
import Modal from '../../components/common/Modal';
import Button from '../../components/common/Button';

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
      
      // ✅ Conversion en Number pour éviter "9" !== 9
      const destinataireId = Number(message.destinataire_id);
      const userId = Number(user.id);
      
      console.log('🔍 destinataire_id:', destinataireId, typeof destinataireId);
      console.log('🔍 user.id_utilisateur:', userId, typeof userId);
      console.log('🔍 est_lu:', message.est_lu);
      console.log('🔍 Condition:', destinataireId === userId && !message.est_lu);

      if (destinataireId === userId && !message.est_lu) {
        // ✅ Appeler l'API show() pour marquer comme lu en BASE
        messageService.getOne(message.id_message)
          .then(() => {
            console.log('✅ Message marqué comme lu en base !');
            // ✅ Mettre à jour local + badge Navbar
            onMessageRead(message.id_message);
          })
          .catch(err => {
            console.error('❌ Erreur marquage lu:', err);
            // Même en erreur, mettre à jour localement
            onMessageRead(message.id_message);
          });
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

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="📧 Message">
      <div>
        <div className="mb-6 pb-6 border-b border-gray-200">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-3xl">👤</span>
            <div>
              <p className="font-semibold text-gray-900">
                {message.expediteur?.prenom} {message.expediteur?.nom}
              </p>
              <p className="text-sm text-gray-500">
                {formatDate(message.created_at)}
              </p>
            </div>
          </div>
          
          <p className="text-lg font-semibold mb-2" style={{ color: '#0066CC' }}>
            {message.sujet || '(Sans sujet)'}
          </p>
        </div>

        <div className="mb-6">
          <p className="text-gray-700 whitespace-pre-wrap">
            {message.contenu}
          </p>
        </div>

        <div className="flex gap-4">
          <Button
            variant="danger"
            onClick={handleDelete}
            className="flex-1"
            style={{ backgroundColor: '#DC143C', borderColor: '#DC143C' }}
          >
            🗑️ Supprimer
          </Button>
          <Button
            variant="secondary"
            onClick={onClose}
            className="flex-1"
          >
            Fermer
          </Button>
        </div>
      </div>
    </Modal>
  );
}