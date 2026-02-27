import { useState, useEffect } from 'react';
import { getUser } from '../utils/auth';
import { coursService, calendrierService } from '../services/api';
import Navbar from '../components/layout/Navbar';
import CalendarView from '../components/calendar/CalendarView';
import EmploiDuTemps from '../components/calendar/EmploiDuTemps';
import EventModal from '../components/calendar/EventModal';

// ─── Palette couleurs ─────────────────────────────────────────
const COLORS = {
  primary:   '#0066CC',
  secondary: '#00A86B',
  accent:    '#DC143C',
  purple:    '#8B5CF6',
  orange:    '#F97316',
  gray50:    '#F9FAFB',
  gray100:   '#F3F4F6',
  gray200:   '#E5E7EB',
  gray600:   '#4B5563',
  gray700:   '#374151',
  gray800:   '#1F2937',
  gray900:   '#111827',
};

// ─── Onglets disponibles ──────────────────────────────────────
const TABS = [
  { id: 'calendrier',  label: 'Calendrier',      icon: '📅' },
  { id: 'emploi',      label: 'Emploi du temps', icon: '📋' },
];

export default function Calendrier() {
  const user = getUser();
  const role = user?.role || 'etudiant';

  // Droits selon rôle
  const canEdit  = role === 'admin' || role === 'enseignant';
  const filiere  = role === 'etudiant' ? user?.filiere : null;
  const niveau   = role === 'etudiant' ? user?.niveau  : null;

  const [activeTab,     setActiveTab]     = useState('calendrier');
  const [cours,         setCours]         = useState([]);
  const [showModal,     setShowModal]     = useState(false);
  const [eventToEdit,   setEventToEdit]   = useState(null);
  const [defaultDate,   setDefaultDate]   = useState(null);
  const [refreshKey,    setRefreshKey]    = useState(0);
  const [prochainEvenements, setProchainEvenements] = useState([]);
  const [loadingStats,  setLoadingStats]  = useState(false);

  // ─── Charger les cours (pour le modal emploi du temps) ────────
  useEffect(() => {
    fetchCours();
    fetchProchainEvenements();
  }, []);

  const fetchCours = async () => {
  // Les cours ne sont chargés que pour admin et enseignant
  // L'étudiant n'a pas besoin de cette liste (pas de création de créneaux)
  if (role === 'etudiant') return;
  try {
    const res = await coursService.getAll();
    setCours(res.data.data?.data || res.data.data || []);
  } catch (err) {
    console.error('Erreur cours:', err);
  }
};

  const fetchProchainEvenements = async () => {
    try {
      setLoadingStats(true);
      const now   = new Date();
      const res   = await calendrierService.getDonneesMois(
        now.getFullYear(),
        now.getMonth() + 1,
        filiere,
        niveau
      );
      const events = res.data.data?.events || [];
      // Garder uniquement les événements à venir (aujourd'hui inclus)
      const aVenir = events
        .filter(ev => new Date(ev.start) >= new Date(now.toDateString()))
        .slice(0, 5);
      setProchainEvenements(aVenir);
    } catch (err) {
      console.error('Erreur prochain événements:', err);
    } finally {
      setLoadingStats(false);
    }
  };

  // ─── Handlers événements ──────────────────────────────────────
  const handleAddEvent = (date = null) => {
    setEventToEdit(null);
    setDefaultDate(date);
    setShowModal(true);
  };

  const handleEditEvent = (event) => {
    setEventToEdit(event);
    setDefaultDate(null);
    setShowModal(true);
  };

  const handleDeleteEvent = async (event) => {
    if (!window.confirm(`Supprimer "${event.title}" ?`)) return;
    try {
      const id = event.raw?.id_evenement || event.id?.replace('ev_', '');
      await calendrierService.deleteEvenement(id);
      setRefreshKey(k => k + 1);
      fetchProchainEvenements();
    } catch (err) {
      alert('Erreur lors de la suppression.');
    }
  };

  const handleModalSuccess = () => {
    setRefreshKey(k => k + 1);
    fetchProchainEvenements();
  };

  // ─── Config type événement ────────────────────────────────────
  const TYPE_CONFIG = {
    cours:      { icon: '📚', color: '#0066CC', bg: '#EFF6FF' },
    examen:     { icon: '📝', color: '#DC143C', bg: '#FEE2E2' },
    evenement:  { icon: '🎉', color: '#00A86B', bg: '#F0FDF4' },
    conge:      { icon: '🏖️', color: '#F97316', bg: '#FFF7ED' },
    reunion:    { icon: '👥', color: '#8B5CF6', bg: '#F5F3FF' },
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: COLORS.gray50 }}>
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* ── EN-TÊTE PAGE ─────────────────────────────────── */}
        <div className="mb-8 flex items-start justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold" style={{ color: COLORS.gray900 }}>
              Calendrier Académique
            </h1>
            <p className="mt-2 text-sm" style={{ color: COLORS.gray600 }}>
              {role === 'admin'      && 'Gérez les événements, examens et emplois du temps de toute la plateforme.'}
              {role === 'enseignant' && 'Consultez et gérez vos cours, examens et événements.'}
              {role === 'etudiant'   && `Votre calendrier — ${user?.filiere || ''} ${user?.niveau || ''}`}
            </p>
          </div>

          {canEdit && (
            <button
              onClick={() => handleAddEvent()}
              className="px-5 py-2.5 rounded-xl font-semibold text-sm hover:opacity-90 transition-all flex items-center gap-2 shadow-sm"
              style={{ backgroundColor: COLORS.primary, color: 'white' }}
            >
              ➕ Nouvel événement
            </button>
          )}
        </div>

        {/* ── CARDS STATS RAPIDES ──────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">

          {/* Événements à venir */}
          <div className="bg-white rounded-2xl p-5 shadow-sm"
               style={{ border: `1px solid ${COLORS.gray200}` }}>
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                   style={{ backgroundColor: '#EFF6FF' }}>
                📅
              </div>
              <span className="text-2xl font-bold" style={{ color: COLORS.primary }}>
                {prochainEvenements.length}
              </span>
            </div>
            <p className="text-sm font-medium" style={{ color: COLORS.gray700 }}>
              Événements à venir
            </p>
            <p className="text-xs mt-0.5" style={{ color: COLORS.gray600 }}>
              Ce mois-ci
            </p>
          </div>

          {/* Examens */}
          <div className="bg-white rounded-2xl p-5 shadow-sm"
               style={{ border: `1px solid ${COLORS.gray200}` }}>
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                   style={{ backgroundColor: '#FEE2E2' }}>
                📝
              </div>
              <span className="text-2xl font-bold" style={{ color: COLORS.accent }}>
                {prochainEvenements.filter(e => e.type === 'examen').length}
              </span>
            </div>
            <p className="text-sm font-medium" style={{ color: COLORS.gray700 }}>
              Examens
            </p>
            <p className="text-xs mt-0.5" style={{ color: COLORS.gray600 }}>
              Ce mois-ci
            </p>
          </div>

          {/* Cours */}
          <div className="bg-white rounded-2xl p-5 shadow-sm"
               style={{ border: `1px solid ${COLORS.gray200}` }}>
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                   style={{ backgroundColor: '#F0FDF4' }}>
                📚
              </div>
              <span className="text-2xl font-bold" style={{ color: COLORS.secondary }}>
                {prochainEvenements.filter(e => e.type === 'cours').length}
              </span>
            </div>
            <p className="text-sm font-medium" style={{ color: COLORS.gray700 }}>
              Cours planifiés
            </p>
            <p className="text-xs mt-0.5" style={{ color: COLORS.gray600 }}>
              Ce mois-ci
            </p>
          </div>

          {/* Congés / Réunions */}
          <div className="bg-white rounded-2xl p-5 shadow-sm"
               style={{ border: `1px solid ${COLORS.gray200}` }}>
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                   style={{ backgroundColor: '#FFF7ED' }}>
                🎉
              </div>
              <span className="text-2xl font-bold" style={{ color: COLORS.orange }}>
                {prochainEvenements.filter(e => ['evenement','conge','reunion'].includes(e.type)).length}
              </span>
            </div>
            <p className="text-sm font-medium" style={{ color: COLORS.gray700 }}>
              Autres événements
            </p>
            <p className="text-xs mt-0.5" style={{ color: COLORS.gray600 }}>
              Ce mois-ci
            </p>
          </div>
        </div>

        {/* ── LAYOUT PRINCIPAL ─────────────────────────────── */}
        <div className="flex flex-col xl:flex-row gap-6">

          {/* Contenu principal */}
          <div className="flex-1 min-w-0">

            {/* Onglets */}
            <div className="bg-white rounded-2xl shadow-sm mb-6"
                 style={{ border: `1px solid ${COLORS.gray200}` }}>
              <div className="flex" style={{ borderBottom: `1px solid ${COLORS.gray200}` }}>
                {TABS.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className="flex items-center gap-2 px-6 py-4 text-sm font-medium transition-all"
                    style={{
                      borderBottom:    activeTab === tab.id ? `2px solid ${COLORS.primary}` : '2px solid transparent',
                      color:           activeTab === tab.id ? COLORS.primary : COLORS.gray600,
                      backgroundColor: 'transparent',
                    }}
                  >
                    <span>{tab.icon}</span>
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Vue Calendrier */}
            {activeTab === 'calendrier' && (
              <CalendarView
                key={refreshKey}
                filiere={filiere}
                niveau={niveau}
                canEdit={canEdit}
                onAddEvent={handleAddEvent}
                onEditEvent={handleEditEvent}
                onDeleteEvent={handleDeleteEvent}
              />
            )}

            {/* Vue Emploi du Temps */}
            {activeTab === 'emploi' && (
              <EmploiDuTemps
                cours={cours}
                canEdit={canEdit}
                filiere={filiere}
                niveau={niveau}
              />
            )}
          </div>

          {/* ── SIDEBAR — Prochains événements ─────────────── */}
          <div className="xl:w-80 flex-shrink-0">
            <div className="bg-white rounded-2xl shadow-sm sticky top-6"
                 style={{ border: `1px solid ${COLORS.gray200}` }}>

              {/* Header sidebar */}
              <div className="px-5 py-4"
                   style={{ borderBottom: `1px solid ${COLORS.gray200}` }}>
                <h3 className="font-bold" style={{ color: COLORS.gray900 }}>
                  ⚡ Prochains événements
                </h3>
                <p className="text-xs mt-0.5" style={{ color: COLORS.gray600 }}>
                  Ce mois-ci
                </p>
              </div>

              <div className="p-4">
                {loadingStats ? (
                  <div className="text-center py-8">
                    <div className="inline-block w-8 h-8 rounded-full border-4 border-t-transparent animate-spin"
                         style={{ borderColor: COLORS.primary, borderTopColor: 'transparent' }} />
                  </div>
                ) : prochainEvenements.length === 0 ? (
                  <div className="text-center py-8">
                    <span className="text-4xl">📭</span>
                    <p className="mt-2 text-sm" style={{ color: COLORS.gray600 }}>
                      Aucun événement à venir
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {prochainEvenements.map((ev, idx) => {
                      const cfg    = TYPE_CONFIG[ev.type] || TYPE_CONFIG.evenement;
                      const evDate = new Date(ev.start);
                      const isToday = evDate.toDateString() === new Date().toDateString();
                      const isTomorrow = evDate.toDateString() === new Date(Date.now() + 86400000).toDateString();

                      return (
                        <div
                          key={idx}
                          className="flex items-start gap-3 p-3 rounded-xl transition-all hover:shadow-sm cursor-pointer"
                          style={{ backgroundColor: cfg.bg, border: `1px solid ${cfg.color}20` }}
                        >
                          {/* Badge date */}
                          <div className="flex-shrink-0 w-10 text-center">
                            <p className="text-xs font-bold uppercase" style={{ color: cfg.color }}>
                              {isToday ? 'Auj.' : isTomorrow ? 'Dem.' : evDate.toLocaleDateString('fr-FR', { weekday: 'short' })}
                            </p>
                            <p className="text-lg font-bold leading-none" style={{ color: cfg.color }}>
                              {evDate.getDate()}
                            </p>
                          </div>

                          {/* Infos */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 mb-0.5">
                              <span className="text-sm">{cfg.icon}</span>
                              <p className="font-semibold text-xs truncate" style={{ color: COLORS.gray900 }}>
                                {ev.title}
                              </p>
                            </div>
                            <p className="text-xs" style={{ color: COLORS.gray600 }}>
                              🕐 {evDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                            </p>
                            {ev.lieu && (
                              <p className="text-xs mt-0.5 truncate" style={{ color: COLORS.gray600 }}>
                                📍 {ev.lieu}
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Bouton voir tout */}
                {prochainEvenements.length > 0 && (
                  <button
                    onClick={() => setActiveTab('calendrier')}
                    className="w-full mt-4 py-2.5 rounded-xl text-sm font-medium hover:opacity-80 transition-all"
                    style={{ backgroundColor: COLORS.gray100, color: COLORS.gray700 }}
                  >
                    Voir le calendrier complet →
                  </button>
                )}
              </div>

              {/* ── AIDE RAPIDE (admin/enseignant) ─────────── */}
              {canEdit && (
                <div className="px-5 pb-5">
                  <div className="p-4 rounded-xl"
                       style={{ backgroundColor: '#EFF6FF', border: `1px solid ${COLORS.primary}20` }}>
                    <p className="text-xs font-bold mb-2" style={{ color: COLORS.primary }}>
                      💡 Actions rapides
                    </p>
                    <div className="space-y-2">
                      <button
                        onClick={() => handleAddEvent()}
                        className="w-full text-left text-xs py-1.5 px-2 rounded-lg hover:opacity-80 transition-all"
                        style={{ backgroundColor: 'white', color: COLORS.gray700 }}
                      >
                        ➕ Créer un événement
                      </button>
                      <button
                        onClick={() => setActiveTab('emploi')}
                        className="w-full text-left text-xs py-1.5 px-2 rounded-lg hover:opacity-80 transition-all"
                        style={{ backgroundColor: 'white', color: COLORS.gray700 }}
                      >
                        📋 Gérer l'emploi du temps
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── MODAL ÉVÉNEMENT ──────────────────────────────────── */}
      <EventModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSuccess={handleModalSuccess}
        eventToEdit={eventToEdit}
        defaultDate={defaultDate}
      />
    </div>
  );
}