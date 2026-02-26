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
  const [composeType, setComposeType] = useState('prive');
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
    setMessagesRecus(prev => 
      prev.map(m => 
        m.id_message === messageId 
          ? { ...m, est_lu: true } 
          : m
      )
    );
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

  const handleReplyToForum = (message) => {
    setComposeType('forum');
    setShowComposeModal(true);
    console.log('Répondre à:', message.sujet);
  };

  // Compteur messages non lus
  const messagesNonLus = messagesRecus.filter(m => !m.est_lu).length;

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F8FAFB' }}>
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* 🎨 EN-TÊTE AMÉLIORÉ */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            {/* Titre */}
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div 
                  className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg"
                  style={{ 
                    background: 'linear-gradient(135deg, #0066CC 0%, #0052A3 100%)'
                  }}
                >
                  <span className="text-3xl">📧</span>
                </div>
                <div>
                  <h1 className="text-3xl font-bold" style={{ color: '#0066CC' }}>
                    Messagerie
                  </h1>
                  <p className="text-sm text-gray-600 mt-1">
                    Messages privés, annonces et forum de discussion
                  </p>
                </div>
              </div>
            </div>

            {/* 🎨 BOUTONS CTA MODERNES */}
            <div className="flex flex-wrap gap-3">
              {/* Message Privé */}
              <button
                onClick={() => handleOpenCompose('prive')}
                className="flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-white shadow-lg hover:shadow-xl transition-all"
                style={{ 
                  background: 'linear-gradient(135deg, #0066CC 0%, #0052A3 100%)'
                }}
              >
                <span className="text-lg">✉️</span>
                <span>Message privé</span>
              </button>

              {/* Annonce (Admin + Enseignant) */}
              {(currentUser.role === 'admin' || currentUser.role === 'enseignant') && (
                <button
                  onClick={() => handleOpenCompose('annonce')}
                  className="flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-white shadow-lg hover:shadow-xl transition-all"
                  style={{ 
                    background: 'linear-gradient(135deg, #00A86B 0%, #008755 100%)'
                  }}
                >
                  <span className="text-lg">📢</span>
                  <span>Annonce</span>
                </button>
              )}

              {/* Forum */}
              <button
                onClick={() => handleOpenCompose('forum')}
                className="flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-white shadow-lg hover:shadow-xl transition-all"
                style={{ 
                  background: 'linear-gradient(135deg, #FF6B35 0%, #E55A2B 100%)'
                }}
              >
                <span className="text-lg">💬</span>
                <span>Post forum</span>
              </button>
            </div>
          </div>
        </div>

        {/* 🎨 ONGLETS MODERNES */}
        <div className="bg-white rounded-2xl shadow-lg mb-6 overflow-hidden">
          <div className="border-b-2 border-gray-100">
            <nav className="flex -mb-0.5">
              {[
                { key: 'recus', icon: '📥', label: 'Messages reçus', count: messagesRecus.length, badge: messagesNonLus },
                { key: 'envoyes', icon: '📤', label: 'Messages envoyés', count: messagesEnvoyes.length },
                { key: 'annonces', icon: '📢', label: 'Annonces', count: annonces.length },
                { key: 'forum', icon: '💬', label: 'Forum', count: forumMessages.length }
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex-1 py-4 px-4 text-sm font-bold transition-all relative ${
                    activeTab === tab.key
                      ? 'border-b-4'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }`}
                  style={
                    activeTab === tab.key
                      ? { 
                          borderBottomColor: '#0066CC', 
                          color: '#0066CC',
                          backgroundColor: '#F0F9FF'
                        }
                      : {}
                  }
                >
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-lg">{tab.icon}</span>
                    <span className="hidden sm:inline">{tab.label}</span>
                    <span className="sm:hidden">{tab.key === 'recus' ? 'Reçus' : tab.key === 'envoyes' ? 'Envoyés' : tab.label}</span>
                    <span 
                      className="px-2 py-0.5 rounded-full text-xs font-bold"
                      style={{ 
                        backgroundColor: activeTab === tab.key ? '#0066CC' : '#E5E7EB',
                        color: activeTab === tab.key ? 'white' : '#6B7280'
                      }}
                    >
                      {tab.count}
                    </span>
                    {/* Badge non lus */}
                    {tab.badge > 0 && (
                      <span 
                        className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-white animate-pulse"
                        style={{ backgroundColor: '#DC143C' }}
                      >
                        {tab.badge}
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* CONTENU */}
        {loading ? (
          <div className="text-center py-16">
            <div 
              className="inline-block animate-spin rounded-full h-16 w-16 border-b-4 mb-4"
              style={{ borderColor: '#0066CC' }}
            ></div>
            <p className="text-lg font-semibold text-gray-700">Chargement de vos messages...</p>
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
                    <div className="text-center py-16">
                      <div className="w-20 h-20 bg-gradient-to-br from-orange-100 to-orange-200 rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner">
                        <span className="text-4xl">📢</span>
                      </div>
                      <p className="text-lg font-semibold text-gray-700 mb-2">Aucune annonce</p>
                      <p className="text-sm text-gray-500">Les annonces apparaîtront ici</p>
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
                    <div className="text-center py-16">
                      <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-purple-200 rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner">
                        <span className="text-4xl">💬</span>
                      </div>
                      <p className="text-lg font-semibold text-gray-700 mb-2">Aucun message dans le forum</p>
                      <p className="text-sm text-gray-500">Démarrez une discussion !</p>
                    </div>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {forumMessages.map((message) => (
                      <ForumThread
                        key={message.id_message}
                        message={message}
                        currentUser={currentUser}
                        onDelete={fetchData} 
                        onReply={handleReplyToForum}
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