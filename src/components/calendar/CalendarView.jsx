import { useState, useEffect } from 'react';
import { calendrierService } from '../../services/api';

// ─── Palette couleurs cohérente avec le projet ───────────────
const COLORS = {
  primary:   '#0066CC',
  secondary: '#00A86B',
  accent:    '#DC143C',
  purple:    '#8B5CF6',
  orange:    '#F97316',
  gray50:    '#F9FAFB',
  gray100:   '#F3F4F6',
  gray200:   '#E5E7EB',
  gray300:   '#D1D5DB',
  gray600:   '#4B5563',
  gray700:   '#374151',
  gray800:   '#1F2937',
  gray900:   '#111827',
};

// ─── Config types événements ──────────────────────────────────
const TYPE_CONFIG = {
  cours:      { icon: '📚', color: '#0066CC', bg: '#EFF6FF', label: 'Cours' },
  examen:     { icon: '📝', color: '#DC143C', bg: '#FEE2E2', label: 'Examen' },
  evenement:  { icon: '🎉', color: '#00A86B', bg: '#F0FDF4', label: 'Événement' },
  conge:      { icon: '🏖️', color: '#F97316', bg: '#FFF7ED', label: 'Congé' },
  reunion:    { icon: '👥', color: '#8B5CF6', bg: '#F5F3FF', label: 'Réunion' },
};

// ─── Jours et mois en français ────────────────────────────────
const JOURS   = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
const MOIS_FR = [
  'Janvier','Février','Mars','Avril','Mai','Juin',
  'Juillet','Août','Septembre','Octobre','Novembre','Décembre',
];

// ─── Utilitaires ─────────────────────────────────────────────
const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

export default function CalendarView({
  filiere  = null,
  niveau   = null,
  canEdit  = false,
  onAddEvent    = null,
  onEditEvent   = null,
  onDeleteEvent = null,
}) {
  const today = new Date();

  const [currentYear,  setCurrentYear]  = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [events,       setEvents]       = useState([]);
  const [loading,      setLoading]      = useState(false);
  const [selectedDay,  setSelectedDay]  = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [viewMode,     setViewMode]     = useState('month'); // 'month' | 'list'

  // ─── Charger les événements du mois ──────────────────────────
  useEffect(() => {
    fetchEvents();
  }, [currentYear, currentMonth]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const res = await calendrierService.getDonneesMois(
        currentYear,
        currentMonth + 1,
        filiere,
        niveau
      );
      setEvents(res.data.data?.events || []);
    } catch (err) {
      console.error('Erreur calendrier:', err);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  // ─── Navigation mois ─────────────────────────────────────────
  const prevMonth = () => {
    if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(y => y - 1); }
    else setCurrentMonth(m => m - 1);
  };

  const nextMonth = () => {
    if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(y => y + 1); }
    else setCurrentMonth(m => m + 1);
  };

  const goToToday = () => {
    setCurrentYear(today.getFullYear());
    setCurrentMonth(today.getMonth());
    setSelectedDay(today.getDate());
  };

  // ─── Événements d'un jour donné ──────────────────────────────
  const getEventsForDay = (day) => {
    return events.filter(ev => {
      const evDate = new Date(ev.start);
      return (
        evDate.getFullYear() === currentYear &&
        evDate.getMonth()    === currentMonth &&
        evDate.getDate()     === day
      );
    });
  };

  // ─── Événements du jour sélectionné ──────────────────────────
  const selectedDayEvents = selectedDay ? getEventsForDay(selectedDay) : [];

  // ─── Construction grille calendrier ──────────────────────────
  const daysInMonth   = getDaysInMonth(currentYear, currentMonth);
  const firstDayIndex = getFirstDayOfMonth(currentYear, currentMonth);
  const totalCells    = Math.ceil((firstDayIndex + daysInMonth) / 7) * 7;

  const isToday = (day) =>
    day === today.getDate() &&
    currentMonth === today.getMonth() &&
    currentYear  === today.getFullYear();

  // ─── Trier les événements par date pour la vue liste ─────────
  const sortedEvents = [...events].sort((a, b) => new Date(a.start) - new Date(b.start));

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden"
         style={{ border: `1px solid ${COLORS.gray200}` }}>

      {/* ── EN-TÊTE ─────────────────────────────────────────── */}
      <div className="px-6 py-4 flex items-center justify-between flex-wrap gap-3"
           style={{ backgroundColor: COLORS.gray50, borderBottom: `1px solid ${COLORS.gray200}` }}>

        {/* Navigation mois */}
        <div className="flex items-center gap-3">
          <button
            onClick={prevMonth}
            className="w-9 h-9 rounded-lg flex items-center justify-center hover:opacity-80 transition-all"
            style={{ backgroundColor: COLORS.gray200, color: COLORS.gray700 }}
          >
            ◀
          </button>

          <h2 className="text-xl font-bold min-w-[200px] text-center"
              style={{ color: COLORS.gray900 }}>
            {MOIS_FR[currentMonth]} {currentYear}
          </h2>

          <button
            onClick={nextMonth}
            className="w-9 h-9 rounded-lg flex items-center justify-center hover:opacity-80 transition-all"
            style={{ backgroundColor: COLORS.gray200, color: COLORS.gray700 }}
          >
            ▶
          </button>
        </div>

        {/* Contrôles droite */}
        <div className="flex items-center gap-2">
          <button
            onClick={goToToday}
            className="px-4 py-2 rounded-lg text-sm font-medium hover:opacity-80 transition-all"
            style={{ backgroundColor: COLORS.primary, color: 'white' }}
          >
            Aujourd'hui
          </button>

          {/* Toggle vue */}
          <div className="flex rounded-lg overflow-hidden"
               style={{ border: `1px solid ${COLORS.gray200}` }}>
            {['month', 'list'].map(mode => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className="px-4 py-2 text-sm font-medium transition-all"
                style={{
                  backgroundColor: viewMode === mode ? COLORS.primary : 'white',
                  color: viewMode === mode ? 'white' : COLORS.gray600,
                }}
              >
                {mode === 'month' ? '📅 Mois' : '📋 Liste'}
              </button>
            ))}
          </div>

          {/* Bouton ajouter (admin/enseignant) */}
          {canEdit && onAddEvent && (
            <button
              onClick={() => onAddEvent(selectedDay ? new Date(currentYear, currentMonth, selectedDay) : new Date())}
              className="px-4 py-2 rounded-lg text-sm font-medium hover:opacity-80 transition-all flex items-center gap-2"
              style={{ backgroundColor: COLORS.secondary, color: 'white' }}
            >
              ➕ Ajouter
            </button>
          )}
        </div>
      </div>

      {/* ── LÉGENDE TYPES ───────────────────────────────────── */}
      <div className="px-6 py-2 flex items-center gap-4 flex-wrap"
           style={{ borderBottom: `1px solid ${COLORS.gray100}` }}>
        {Object.entries(TYPE_CONFIG).map(([type, cfg]) => (
          <div key={type} className="flex items-center gap-1.5">
            <span className="text-sm">{cfg.icon}</span>
            <span className="text-xs font-medium" style={{ color: COLORS.gray600 }}>
              {cfg.label}
            </span>
          </div>
        ))}
        {loading && (
          <div className="ml-auto flex items-center gap-2">
            <div className="w-4 h-4 rounded-full border-2 border-t-transparent animate-spin"
                 style={{ borderColor: COLORS.primary, borderTopColor: 'transparent' }} />
            <span className="text-xs" style={{ color: COLORS.gray600 }}>Chargement...</span>
          </div>
        )}
      </div>

      <div className="flex flex-col lg:flex-row">

        {/* ── VUE MOIS ──────────────────────────────────────── */}
        {viewMode === 'month' && (
          <div className="flex-1 p-4">

            {/* Entêtes jours */}
            <div className="grid grid-cols-7 mb-2">
              {JOURS.map(j => (
                <div key={j} className="text-center text-xs font-bold py-2 uppercase tracking-wide"
                     style={{ color: COLORS.gray600 }}>
                  {j}
                </div>
              ))}
            </div>

            {/* Grille jours */}
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: totalCells }, (_, i) => {
                const day = i - firstDayIndex + 1;
                const isValid = day >= 1 && day <= daysInMonth;
                const dayEvents = isValid ? getEventsForDay(day) : [];
                const isSelected = selectedDay === day && isValid;
                const isTodayDay = isValid && isToday(day);

                return (
                  <div
                    key={i}
                    onClick={() => isValid && setSelectedDay(day)}
                    className="min-h-[80px] rounded-xl p-1.5 transition-all cursor-pointer"
                    style={{
                      backgroundColor: !isValid
                        ? 'transparent'
                        : isSelected
                          ? '#EFF6FF'
                          : isTodayDay
                            ? '#F0FDF4'
                            : 'white',
                      border: isSelected
                        ? `2px solid ${COLORS.primary}`
                        : isTodayDay
                          ? `2px solid ${COLORS.secondary}`
                          : `1px solid ${COLORS.gray100}`,
                    }}
                  >
                    {isValid && (
                      <>
                        {/* Numéro du jour */}
                        <div className="flex items-center justify-between mb-1">
                          <span
                            className="text-sm font-bold w-7 h-7 flex items-center justify-center rounded-full"
                            style={{
                              backgroundColor: isTodayDay ? COLORS.secondary : 'transparent',
                              color: isTodayDay ? 'white' : isSelected ? COLORS.primary : COLORS.gray800,
                            }}
                          >
                            {day}
                          </span>
                          {dayEvents.length > 0 && (
                            <span className="text-xs font-bold px-1.5 py-0.5 rounded-full"
                                  style={{ backgroundColor: COLORS.primary + '20', color: COLORS.primary }}>
                              {dayEvents.length}
                            </span>
                          )}
                        </div>

                        {/* Événements du jour (max 2 affichés) */}
                        <div className="space-y-0.5">
                          {dayEvents.slice(0, 2).map((ev, idx) => {
                            const cfg = TYPE_CONFIG[ev.type] || TYPE_CONFIG.evenement;
                            return (
                              <div
                                key={idx}
                                onClick={(e) => { e.stopPropagation(); setSelectedEvent(ev); }}
                                className="text-xs px-1.5 py-0.5 rounded truncate cursor-pointer hover:opacity-80"
                                style={{ backgroundColor: cfg.bg, color: cfg.color }}
                                title={ev.title}
                              >
                                {cfg.icon} {ev.title}
                              </div>
                            );
                          })}
                          {dayEvents.length > 2 && (
                            <div className="text-xs text-center"
                                 style={{ color: COLORS.gray600 }}>
                              +{dayEvents.length - 2} autres
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── VUE LISTE ─────────────────────────────────────── */}
        {viewMode === 'list' && (
          <div className="flex-1 p-4">
            {sortedEvents.length === 0 ? (
              <div className="text-center py-16">
                <span className="text-5xl">📅</span>
                <p className="mt-4 font-medium" style={{ color: COLORS.gray600 }}>
                  Aucun événement ce mois-ci
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {sortedEvents.map((ev, idx) => {
                  const cfg = TYPE_CONFIG[ev.type] || TYPE_CONFIG.evenement;
                  const evDate = new Date(ev.start);

                  return (
                    <div
                      key={idx}
                      onClick={() => setSelectedEvent(ev)}
                      className="flex items-start gap-4 p-4 rounded-xl cursor-pointer hover:shadow-md transition-all"
                      style={{ border: `1px solid ${COLORS.gray200}`, backgroundColor: cfg.bg }}
                    >
                      {/* Date badge */}
                      <div className="flex-shrink-0 w-12 text-center p-2 rounded-lg bg-white shadow-sm">
                        <p className="text-xs font-bold uppercase" style={{ color: COLORS.gray600 }}>
                          {JOURS[evDate.getDay()]}
                        </p>
                        <p className="text-xl font-bold" style={{ color: cfg.color }}>
                          {evDate.getDate()}
                        </p>
                      </div>

                      {/* Infos événement */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-lg">{cfg.icon}</span>
                          <p className="font-bold truncate" style={{ color: COLORS.gray900 }}>
                            {ev.title}
                          </p>
                          {ev.est_important && (
                            <span className="text-xs px-2 py-0.5 rounded-full font-bold"
                                  style={{ backgroundColor: '#FEF3C7', color: '#D97706' }}>
                              ⭐ Important
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-4 flex-wrap">
                          <span className="text-xs" style={{ color: COLORS.gray600 }}>
                            🕐 {evDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          {ev.lieu && (
                            <span className="text-xs" style={{ color: COLORS.gray600 }}>
                              📍 {ev.lieu}
                            </span>
                          )}
                          <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                                style={{ backgroundColor: cfg.bg, color: cfg.color, border: `1px solid ${cfg.color}40` }}>
                            {cfg.label}
                          </span>
                        </div>
                        {ev.description && (
                          <p className="text-xs mt-1 truncate" style={{ color: COLORS.gray600 }}>
                            {ev.description}
                          </p>
                        )}
                      </div>

                      {/* Actions */}
                      {canEdit && (
                        <div className="flex gap-2 flex-shrink-0">
                          {onEditEvent && (
                            <button
                              onClick={(e) => { e.stopPropagation(); onEditEvent(ev); }}
                              className="px-3 py-1.5 rounded-lg text-xs font-medium hover:opacity-80 transition-all"
                              style={{ backgroundColor: '#EFF6FF', color: COLORS.primary }}
                            >
                              ✏️
                            </button>
                          )}
                          {onDeleteEvent && (
                            <button
                              onClick={(e) => { e.stopPropagation(); onDeleteEvent(ev); }}
                              className="px-3 py-1.5 rounded-lg text-xs font-medium hover:opacity-80 transition-all"
                              style={{ backgroundColor: '#FEE2E2', color: COLORS.accent }}
                            >
                              🗑️
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── PANNEAU LATÉRAL — Détails du jour sélectionné ── */}
        {viewMode === 'month' && selectedDay && (
          <div className="w-full lg:w-72 border-t lg:border-t-0 lg:border-l p-4"
               style={{ borderColor: COLORS.gray200, backgroundColor: COLORS.gray50 }}>

            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold" style={{ color: COLORS.gray900 }}>
                {selectedDay} {MOIS_FR[currentMonth]}
              </h3>
              {canEdit && onAddEvent && (
                <button
                  onClick={() => onAddEvent(new Date(currentYear, currentMonth, selectedDay))}
                  className="text-xs px-3 py-1.5 rounded-lg font-medium hover:opacity-80 transition-all"
                  style={{ backgroundColor: COLORS.secondary, color: 'white' }}
                >
                  ➕ Ajouter
                </button>
              )}
            </div>

            {selectedDayEvents.length === 0 ? (
              <div className="text-center py-8">
                <span className="text-4xl">📭</span>
                <p className="mt-2 text-sm" style={{ color: COLORS.gray600 }}>
                  Aucun événement
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {selectedDayEvents.map((ev, idx) => {
                  const cfg = TYPE_CONFIG[ev.type] || TYPE_CONFIG.evenement;
                  const evDate = new Date(ev.start);

                  return (
                    <div
                      key={idx}
                      className="p-3 rounded-xl cursor-pointer hover:shadow-md transition-all"
                      style={{ backgroundColor: cfg.bg, border: `1px solid ${cfg.color}30` }}
                      onClick={() => setSelectedEvent(ev)}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span>{cfg.icon}</span>
                        <p className="font-semibold text-sm truncate" style={{ color: cfg.color }}>
                          {ev.title}
                        </p>
                      </div>
                      <p className="text-xs" style={{ color: COLORS.gray600 }}>
                        🕐 {evDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                      {ev.lieu && (
                        <p className="text-xs mt-0.5" style={{ color: COLORS.gray600 }}>
                          📍 {ev.lieu}
                        </p>
                      )}

                      {/* Actions */}
                      {canEdit && (
                        <div className="flex gap-2 mt-2">
                          {onEditEvent && (
                            <button
                              onClick={(e) => { e.stopPropagation(); onEditEvent(ev); }}
                              className="flex-1 py-1 rounded-lg text-xs font-medium hover:opacity-80"
                              style={{ backgroundColor: '#EFF6FF', color: COLORS.primary }}
                            >
                              ✏️ Modifier
                            </button>
                          )}
                          {onDeleteEvent && (
                            <button
                              onClick={(e) => { e.stopPropagation(); onDeleteEvent(ev); }}
                              className="py-1 px-2 rounded-lg text-xs font-medium hover:opacity-80"
                              style={{ backgroundColor: '#FEE2E2', color: COLORS.accent }}
                            >
                              🗑️
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── MODAL DÉTAIL ÉVÉNEMENT ──────────────────────────── */}
      {selectedEvent && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
          onClick={() => setSelectedEvent(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6"
            onClick={e => e.stopPropagation()}
          >
            {(() => {
              const cfg = TYPE_CONFIG[selectedEvent.type] || TYPE_CONFIG.evenement;
              const evStart = new Date(selectedEvent.start);
              const evEnd   = selectedEvent.end ? new Date(selectedEvent.end) : null;

              return (
                <>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                           style={{ backgroundColor: cfg.bg }}>
                        {cfg.icon}
                      </div>
                      <div>
                        <h3 className="font-bold text-lg" style={{ color: COLORS.gray900 }}>
                          {selectedEvent.title}
                        </h3>
                        <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                              style={{ backgroundColor: cfg.bg, color: cfg.color }}>
                          {cfg.label}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedEvent(null)}
                      className="text-gray-400 hover:text-gray-600 text-xl"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 rounded-xl"
                         style={{ backgroundColor: COLORS.gray50 }}>
                      <span>📅</span>
                      <div>
                        <p className="text-xs font-medium" style={{ color: COLORS.gray600 }}>Date</p>
                        <p className="text-sm font-semibold" style={{ color: COLORS.gray900 }}>
                          {evStart.toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 rounded-xl"
                         style={{ backgroundColor: COLORS.gray50 }}>
                      <span>🕐</span>
                      <div>
                        <p className="text-xs font-medium" style={{ color: COLORS.gray600 }}>Horaire</p>
                        <p className="text-sm font-semibold" style={{ color: COLORS.gray900 }}>
                          {evStart.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                          {evEnd && ` → ${evEnd.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`}
                        </p>
                      </div>
                    </div>

                    {selectedEvent.lieu && (
                      <div className="flex items-center gap-3 p-3 rounded-xl"
                           style={{ backgroundColor: COLORS.gray50 }}>
                        <span>📍</span>
                        <div>
                          <p className="text-xs font-medium" style={{ color: COLORS.gray600 }}>Lieu</p>
                          <p className="text-sm font-semibold" style={{ color: COLORS.gray900 }}>
                            {selectedEvent.lieu}
                          </p>
                        </div>
                      </div>
                    )}

                    {selectedEvent.description && (
                      <div className="p-3 rounded-xl" style={{ backgroundColor: COLORS.gray50 }}>
                        <p className="text-xs font-medium mb-1" style={{ color: COLORS.gray600 }}>Description</p>
                        <p className="text-sm" style={{ color: COLORS.gray700 }}>
                          {selectedEvent.description}
                        </p>
                      </div>
                    )}

                    {selectedEvent.est_important && (
                      <div className="flex items-center gap-2 p-3 rounded-xl"
                           style={{ backgroundColor: '#FEF3C7' }}>
                        <span>⭐</span>
                        <p className="text-sm font-semibold" style={{ color: '#D97706' }}>
                          Événement important
                        </p>
                      </div>
                    )}
                  </div>

                  {canEdit && (
                    <div className="flex gap-3 mt-6">
                      {onEditEvent && (
                        <button
                          onClick={() => { onEditEvent(selectedEvent); setSelectedEvent(null); }}
                          className="flex-1 py-2.5 rounded-xl font-medium hover:opacity-80 transition-all"
                          style={{ backgroundColor: '#EFF6FF', color: COLORS.primary }}
                        >
                          ✏️ Modifier
                        </button>
                      )}
                      {onDeleteEvent && (
                        <button
                          onClick={() => { onDeleteEvent(selectedEvent); setSelectedEvent(null); }}
                          className="flex-1 py-2.5 rounded-xl font-medium hover:opacity-80 transition-all"
                          style={{ backgroundColor: '#FEE2E2', color: COLORS.accent }}
                        >
                          🗑️ Supprimer
                        </button>
                      )}
                    </div>
                  )}
                </>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}