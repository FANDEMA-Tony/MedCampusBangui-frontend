import { useState, useEffect } from 'react';
import { messageService } from '../../services/api';
import { getUser } from '../../utils/auth';
import Navbar from '../../components/layout/Navbar';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import MessageList from './MessageList';
import ComposeModal from './ComposeModal';
import ConversationModal from './ConversationModal';
import AnnonceCard from './AnnonceCard';
import ForumThread from './ForumThread';

export default function Messagerie() {
  const currentUser = getUser();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('recus');
  
  // Données
  const [messagesRecus, setMessagesRecus] = useState([]);
  const [messagesEnvoyes, setMessagesEnvoyes] = useState([]);
  const [annonces, setAnnonces] = useState([]);
  const [forumMessages, setForumMessages] = useState([]);
  
  // Modals
  const [showComposeModal, setShowComposeModal] = useState(false);
  const [composeType, setComposeType] = useState('prive'); // prive, annonce, forum
  const [showConversationModal, setShowConversationModal] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Messages privés reçus
      try {
        const recusResponse = await messageService.getBoiteReception();
        const recus = recusResponse.data.data || [];
        setMessagesRecus(recus);
      } catch (err) {
        console.error('Erreur messages reçus:', err);
        setMessagesRecus([]);
      }

      // Messages privés envoyés
      try {
        const envoyesResponse = await messageService.getBoiteEnvoi();
        const envoyes = envoyesResponse.data.data || [];
        setMessagesEnvoyes(envoyes);
      } catch (err) {
        console.error('Erreur messages envoyés:', err);
        setMessagesEnvoyes([]);
      }

      // Annonces
      try {
        const annoncesResponse = await messageService.getAnnonces();
        const annoncesData = annoncesResponse.data.data || [];
        setAnnonces(annoncesData);
      } catch (err) {
        console.error('Erreur annonces:', err);
        setAnnonces([]);
      }

      // Forum
      try {
        const forumResponse = await messageService.getForum();
        const forumData = forumResponse.data.data || [];
        setForumMessages(forumData);
      } catch (err) {
        console.error('Erreur forum:', err);
        setForumMessages([]);
      }

    } catch (error) {
      console.error('Erreur globale:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenMessage = (message) => {
    setSelectedMessage(message);
    setShowConversationModal(true);
  };

  const handleOpenCompose = (type = 'prive') => {
    setComposeType(type);
    setShowComposeModal(true);
  };

  const handleMessageSent = () => {
    setShowComposeModal(false);
    fetchData();
  };

  const handleMessageDeleted = () => {
    setShowConversationModal(false);
    fetchData();
  };

  const handleMessageRead = (messageId) => {
    // ✅ ÉTAPE 1 : Mettre à jour localement (badge de l'onglet)
    setMessagesRecus(prev => 
      prev.map(m => 
        m.id_message === messageId 
          ? { ...m, est_lu: true } 
          : m
      )
    );

    // ✅ ÉTAPE 2 : Notifier Navbar pour rafraîchir le badge rouge
    window.dispatchEvent(new Event('refreshMessageBadge'));
  };

  const handleToggleEpingle = async (annonceId) => {
    try {
      await messageService.toggleEpingle(annonceId);
      fetchData();
    } catch (err) {
      console.error('Erreur épinglage:', err);
      alert('Erreur lors de l\'épinglage');
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F8FAFB' }}>
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* En-tête */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold" style={{ color: '#0066CC' }}>
              📧 Messagerie
            </h1>
            <p className="text-gray-600 mt-2">
              Messages privés, annonces et forum de discussion
            </p>
          </div>

          <div className="flex gap-3">
            {/* Bouton Message Privé */}
            <Button
              variant="primary"
              onClick={() => handleOpenCompose('prive')}
              className="flex items-center"
              style={{ backgroundColor: '#0066CC', borderColor: '#0066CC' }}
            >
              ✉️ Message privé
            </Button>

            {/* Bouton Annonce (Admin + Enseignant) */}
            {(currentUser.role === 'admin' || currentUser.role === 'enseignant') && (
              <Button
                variant="primary"
                onClick={() => handleOpenCompose('annonce')}
                className="flex items-center"
                style={{ backgroundColor: '#00A86B', borderColor: '#00A86B' }}
              >
                📢 Annonce
              </Button>
            )}

            {/* Bouton Forum */}
            <Button
              variant="primary"
              onClick={() => handleOpenCompose('forum')}
              className="flex items-center"
              style={{ backgroundColor: '#FF6B35', borderColor: '#FF6B35' }}
            >
              💬 Post forum
            </Button>
          </div>
        </div>

        {/* Onglets */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              {['recus', 'envoyes', 'annonces', 'forum'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-4 px-6 text-sm font-medium transition-colors ${
                    activeTab === tab
                      ? 'border-b-2'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                  style={
                    activeTab === tab
                      ? { borderBottomColor: '#0066CC', color: '#0066CC' }
                      : {}
                  }
                >
                  {tab === 'recus' && `📥 Messages reçus (${messagesRecus.length})`}
                  {tab === 'envoyes' && `📤 Messages envoyés (${messagesEnvoyes.length})`}
                  {tab === 'annonces' && `📢 Annonces (${annonces.length})`}
                  {tab === 'forum' && `💬 Forum (${forumMessages.length})`}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Contenu */}
        {loading ? (
          <div className="text-center py-12">
            <div 
              className="inline-block animate-spin rounded-full h-12 w-12 border-b-2"
              style={{ borderColor: '#0066CC' }}
            ></div>
            <p className="text-gray-600 mt-4">Chargement...</p>
          </div>
        ) : (
          <>
            {/* MESSAGES REÇUS */}
            {activeTab === 'recus' && (
              <Card>
                <MessageList
                  messages={messagesRecus}
                  type="recus"
                  onMessageClick={handleOpenMessage}
                  emptyIcon="📭"
                  emptyText="Aucun message reçu"
                />
              </Card>
            )}

            {/* MESSAGES ENVOYÉS */}
            {activeTab === 'envoyes' && (
              <Card>
                <MessageList
                  messages={messagesEnvoyes}
                  type="envoyes"
                  onMessageClick={handleOpenMessage}
                  emptyIcon="📤"
                  emptyText="Aucun message envoyé"
                />
              </Card>
            )}

            {/* ANNONCES */}
            {activeTab === 'annonces' && (
              <div>
                {annonces.length === 0 ? (
                  <Card>
                    <div className="text-center py-12">
                      <p className="text-3xl mb-4">📢</p>
                      <p className="text-gray-500">Aucune annonce</p>
                    </div>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {annonces.map((annonce) => (
                      <AnnonceCard
                        key={annonce.id_message}
                        annonce={annonce}
                        currentUser={currentUser}
                        onToggleEpingle={handleToggleEpingle}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* FORUM */}
            {activeTab === 'forum' && (
              <div>
                {forumMessages.length === 0 ? (
                  <Card>
                    <div className="text-center py-12">
                      <p className="text-3xl mb-4">💬</p>
                      <p className="text-gray-500">Aucun message dans le forum</p>
                    </div>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {forumMessages.map((message) => (
                      <ForumThread
                        key={message.id_message}
                        message={message}
                        currentUser={currentUser}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Modals */}
      <ComposeModal
        isOpen={showComposeModal}
        onClose={() => setShowComposeModal(false)}
        onMessageSent={handleMessageSent}
        type={composeType}
      />

      <ConversationModal
        isOpen={showConversationModal}
        onClose={() => setShowConversationModal(false)}
        message={selectedMessage}
        onMessageDeleted={handleMessageDeleted}
        onMessageRead={handleMessageRead}
      />
    </div>
  );
}