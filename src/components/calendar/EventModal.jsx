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
const TYPES_EVENEMENT = [
  { value: 'cours',     label: 'Cours',      icon: '📚', color: '#0066CC' },
  { value: 'examen',    label: 'Examen',     icon: '📝', color: '#DC143C' },
  { value: 'evenement', label: 'Événement',  icon: '🎉', color: '#00A86B' },
  { value: 'conge',     label: 'Congé',      icon: '🏖️', color: '#F97316' },
  { value: 'reunion',   label: 'Réunion',    icon: '👥', color: '#8B5CF6' },
];

// ─── Couleurs prédéfinies ─────────────────────────────────────
const COULEURS_PREDEFINIES = [
  '#0066CC', '#00A86B', '#DC143C', '#8B5CF6',
  '#F97316', '#EC4899', '#14B8A6', '#F59E0B',
];

// ─── Visibilités ─────────────────────────────────────────────
const VISIBILITES = [
  { value: 'tous',    label: 'Tout le monde',      icon: '🌍' },
  { value: 'filiere', label: 'Une filière',         icon: '🎓' },
  { value: 'niveau',  label: 'Une filière + niveau', icon: '📊' },
];

const FILIERES = [
  'Médecine', 'Pharmacie', 'Sciences-Biomédicale',
  'Chirurgie', 'Pédiatrie', 'Gynécologie',
];

const NIVEAUX = ['L1', 'L2', 'L3', 'M1', 'M2', 'Doctorat'];

// ─── Formulaire initial ───────────────────────────────────────
const FORM_INITIAL = {
  titre:        '',
  description:  '',
  type:         'evenement',
  date_debut:   '',
  heure_debut:  '08:00',
  date_fin:     '',
  heure_fin:    '09:00',
  lieu:         '',
  couleur:      '#0066CC',
  visibilite:   'tous',
  filiere:      '',
  niveau:       '',
  est_important: false,
};

export default function EventModal({
  isOpen,
  onClose,
  onSuccess,
  eventToEdit = null,   // null = création, objet = modification
  defaultDate = null,   // date pré-remplie à l'ouverture
}) {
  const [form,    setForm]    = useState(FORM_INITIAL);
  const [errors,  setErrors]  = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // ─── Remplir le formulaire selon le mode ─────────────────────
  useEffect(() => {
    if (!isOpen) return;

    if (eventToEdit) {
      // Mode modification — remplir avec les données existantes
      const raw = eventToEdit.raw || eventToEdit;
      const start = new Date(eventToEdit.start || raw.date_debut);
      const end   = eventToEdit.end ? new Date(eventToEdit.end) : new Date(start.getTime() + 3600000);

      setForm({
        titre:         raw.titre        || eventToEdit.title || '',
        description:   raw.description  || '',
        type:          raw.type         || eventToEdit.type || 'evenement',
        date_debut:    start.toISOString().split('T')[0],
        heure_debut:   start.toTimeString().slice(0, 5),
        date_fin:      end.toISOString().split('T')[0],
        heure_fin:     end.toTimeString().slice(0, 5),
        lieu:          raw.lieu         || eventToEdit.lieu || '',
        couleur:       raw.couleur      || eventToEdit.color || '#0066CC',
        visibilite:    raw.visibilite   || 'tous',
        filiere:       raw.filiere      || '',
        niveau:        raw.niveau       || '',
        est_important: raw.est_important ?? eventToEdit.est_important ?? false,
      });
    } else {
      // Mode création — date pré-remplie si fournie
      const date = defaultDate ? new Date(defaultDate) : new Date();
      const dateStr = date.toISOString().split('T')[0];
      setForm({
        ...FORM_INITIAL,
        date_debut: dateStr,
        date_fin:   dateStr,
      });
    }

    setErrors({});
    setMessage({ type: '', text: '' });
  }, [isOpen, eventToEdit, defaultDate]);

  // ─── Handler changement champs ────────────────────────────────
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  // ─── Sélection type → couleur auto ───────────────────────────
  const handleTypeChange = (typeValue) => {
    const typeConfig = TYPES_EVENEMENT.find(t => t.value === typeValue);
    setForm(prev => ({
      ...prev,
      type:    typeValue,
      couleur: typeConfig?.color || prev.couleur,
    }));
  };

  // ─── Validation ───────────────────────────────────────────────
  const validate = () => {
    const newErrors = {};
    if (!form.titre.trim())    newErrors.titre      = 'Le titre est obligatoire.';
    if (!form.date_debut)      newErrors.date_debut = 'La date de début est obligatoire.';
    if (!form.date_fin)        newErrors.date_fin   = 'La date de fin est obligatoire.';
    if (form.visibilite === 'filiere' && !form.filiere)
      newErrors.filiere = 'La filière est obligatoire.';
    if (form.visibilite === 'niveau' && !form.filiere)
      newErrors.filiere = 'La filière est obligatoire.';
    if (form.visibilite === 'niveau' && !form.niveau)
      newErrors.niveau  = 'Le niveau est obligatoire.';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ─── Soumission ───────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate() || loading) return;

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const payload = {
        titre:         form.titre,
        description:   form.description || null,
        type:          form.type,
        date_debut:    `${form.date_debut} ${form.heure_debut}:00`,
        date_fin:      `${form.date_fin} ${form.heure_fin}:00`,
        lieu:          form.lieu || null,
        couleur:       form.couleur,
        visibilite:    form.visibilite,
        filiere:       ['filiere', 'niveau'].includes(form.visibilite) ? form.filiere : null,
        niveau:        form.visibilite === 'niveau' ? form.niveau : null,
        est_important: form.est_important,
      };

      if (eventToEdit) {
        const id = eventToEdit.raw?.id_evenement || eventToEdit.id?.replace('ev_', '');
        await calendrierService.updateEvenement(id, payload);
        setMessage({ type: 'success', text: 'Événement modifié avec succès !' });
      } else {
        await calendrierService.createEvenement(payload);
        setMessage({ type: 'success', text: 'Événement créé avec succès !' });
      }

      setTimeout(() => {
        onSuccess?.();
        onClose();
      }, 1200);

    } catch (err) {
      console.error(err);
      if (err.response?.data?.errors) {
        setErrors(err.response.data.errors);
      } else {
        setMessage({
          type: 'error',
          text: err.response?.data?.message || 'Une erreur est survenue.',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const selectedType = TYPES_EVENEMENT.find(t => t.value === form.type);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* ── EN-TÊTE ─────────────────────────────────────── */}
        <div className="sticky top-0 bg-white px-6 py-4 flex items-center justify-between rounded-t-2xl z-10"
             style={{ borderBottom: `1px solid ${COLORS.gray200}` }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                 style={{ backgroundColor: selectedType?.color + '20' || COLORS.gray100 }}>
              {selectedType?.icon || '📅'}
            </div>
            <h2 className="text-lg font-bold" style={{ color: COLORS.gray900 }}>
              {eventToEdit ? 'Modifier l\'événement' : 'Nouvel événement'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center hover:opacity-80 transition-all"
            style={{ backgroundColor: COLORS.gray100, color: COLORS.gray600 }}
          >
            ✕
          </button>
        </div>

        {/* ── MESSAGE FEEDBACK ────────────────────────────── */}
        {message.text && (
          <div className="mx-6 mt-4 p-3 rounded-xl border-l-4 text-sm font-medium"
               style={{
                 backgroundColor: message.type === 'success' ? '#F0FDF4' : '#FEE2E2',
                 borderLeftColor: message.type === 'success' ? COLORS.secondary : COLORS.accent,
                 color:           message.type === 'success' ? COLORS.secondary : COLORS.accent,
               }}>
            {message.text}
          </div>
        )}

        {/* ── FORMULAIRE ──────────────────────────────────── */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">

          {/* TITRE */}
          <div>
            <label className="block text-sm font-semibold mb-1.5" style={{ color: COLORS.gray700 }}>
              Titre <span style={{ color: COLORS.accent }}>*</span>
            </label>
            <input
              type="text"
              name="titre"
              value={form.titre}
              onChange={handleChange}
              placeholder="Ex: Cours de Cardiologie"
              className="w-full px-4 py-2.5 rounded-xl border focus:outline-none focus:ring-2 text-sm"
              style={{
                borderColor: errors.titre ? COLORS.accent : COLORS.gray300,
                focusRingColor: COLORS.primary,
              }}
            />
            {errors.titre && <p className="text-xs mt-1" style={{ color: COLORS.accent }}>{errors.titre}</p>}
          </div>

          {/* TYPE */}
          <div>
            <label className="block text-sm font-semibold mb-1.5" style={{ color: COLORS.gray700 }}>
              Type <span style={{ color: COLORS.accent }}>*</span>
            </label>
            <div className="grid grid-cols-5 gap-2">
              {TYPES_EVENEMENT.map(t => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => handleTypeChange(t.value)}
                  className="flex flex-col items-center gap-1 p-2 rounded-xl border-2 transition-all hover:opacity-80"
                  style={{
                    borderColor:     form.type === t.value ? t.color : COLORS.gray200,
                    backgroundColor: form.type === t.value ? t.color + '15' : 'white',
                  }}
                >
                  <span className="text-xl">{t.icon}</span>
                  <span className="text-xs font-medium" style={{ color: form.type === t.value ? t.color : COLORS.gray600 }}>
                    {t.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* DATES */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-1.5" style={{ color: COLORS.gray700 }}>
                Date début <span style={{ color: COLORS.accent }}>*</span>
              </label>
              <input
                type="date"
                name="date_debut"
                value={form.date_debut}
                onChange={handleChange}
                className="w-full px-3 py-2.5 rounded-xl border focus:outline-none text-sm"
                style={{ borderColor: errors.date_debut ? COLORS.accent : COLORS.gray300 }}
              />
              {errors.date_debut && <p className="text-xs mt-1" style={{ color: COLORS.accent }}>{errors.date_debut}</p>}
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1.5" style={{ color: COLORS.gray700 }}>
                Heure début
              </label>
              <input
                type="time"
                name="heure_debut"
                value={form.heure_debut}
                onChange={handleChange}
                className="w-full px-3 py-2.5 rounded-xl border focus:outline-none text-sm"
                style={{ borderColor: COLORS.gray300 }}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-1.5" style={{ color: COLORS.gray700 }}>
                Date fin <span style={{ color: COLORS.accent }}>*</span>
              </label>
              <input
                type="date"
                name="date_fin"
                value={form.date_fin}
                onChange={handleChange}
                className="w-full px-3 py-2.5 rounded-xl border focus:outline-none text-sm"
                style={{ borderColor: errors.date_fin ? COLORS.accent : COLORS.gray300 }}
              />
              {errors.date_fin && <p className="text-xs mt-1" style={{ color: COLORS.accent }}>{errors.date_fin}</p>}
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1.5" style={{ color: COLORS.gray700 }}>
                Heure fin
              </label>
              <input
                type="time"
                name="heure_fin"
                value={form.heure_fin}
                onChange={handleChange}
                className="w-full px-3 py-2.5 rounded-xl border focus:outline-none text-sm"
                style={{ borderColor: COLORS.gray300 }}
              />
            </div>
          </div>

          {/* LIEU */}
          <div>
            <label className="block text-sm font-semibold mb-1.5" style={{ color: COLORS.gray700 }}>
              Lieu
            </label>
            <input
              type="text"
              name="lieu"
              value={form.lieu}
              onChange={handleChange}
              placeholder="Ex: Amphi A, Salle 101..."
              className="w-full px-4 py-2.5 rounded-xl border focus:outline-none text-sm"
              style={{ borderColor: COLORS.gray300 }}
            />
          </div>

          {/* DESCRIPTION */}
          <div>
            <label className="block text-sm font-semibold mb-1.5" style={{ color: COLORS.gray700 }}>
              Description
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={3}
              placeholder="Description de l'événement..."
              className="w-full px-4 py-2.5 rounded-xl border focus:outline-none text-sm resize-none"
              style={{ borderColor: COLORS.gray300 }}
            />
          </div>

          {/* VISIBILITÉ */}
          <div>
            <label className="block text-sm font-semibold mb-1.5" style={{ color: COLORS.gray700 }}>
              Visibilité <span style={{ color: COLORS.accent }}>*</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {VISIBILITES.map(v => (
                <button
                  key={v.value}
                  type="button"
                  onClick={() => setForm(prev => ({ ...prev, visibilite: v.value, filiere: '', niveau: '' }))}
                  className="flex flex-col items-center gap-1 p-2.5 rounded-xl border-2 transition-all hover:opacity-80 text-center"
                  style={{
                    borderColor:     form.visibilite === v.value ? COLORS.primary : COLORS.gray200,
                    backgroundColor: form.visibilite === v.value ? '#EFF6FF' : 'white',
                  }}
                >
                  <span className="text-lg">{v.icon}</span>
                  <span className="text-xs font-medium" style={{ color: form.visibilite === v.value ? COLORS.primary : COLORS.gray600 }}>
                    {v.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* FILIÈRE (si visibilité filière ou niveau) */}
          {['filiere', 'niveau'].includes(form.visibilite) && (
            <div>
              <label className="block text-sm font-semibold mb-1.5" style={{ color: COLORS.gray700 }}>
                Filière <span style={{ color: COLORS.accent }}>*</span>
              </label>
              <select
                name="filiere"
                value={form.filiere}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl border focus:outline-none text-sm"
                style={{ borderColor: errors.filiere ? COLORS.accent : COLORS.gray300 }}
              >
                <option value="">-- Sélectionner --</option>
                {FILIERES.map(f => <option key={f} value={f}>{f}</option>)}
              </select>
              {errors.filiere && <p className="text-xs mt-1" style={{ color: COLORS.accent }}>{errors.filiere}</p>}
            </div>
          )}

          {/* NIVEAU (si visibilité niveau) */}
          {form.visibilite === 'niveau' && (
            <div>
              <label className="block text-sm font-semibold mb-1.5" style={{ color: COLORS.gray700 }}>
                Niveau <span style={{ color: COLORS.accent }}>*</span>
              </label>
              <select
                name="niveau"
                value={form.niveau}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl border focus:outline-none text-sm"
                style={{ borderColor: errors.niveau ? COLORS.accent : COLORS.gray300 }}
              >
                <option value="">-- Sélectionner --</option>
                {NIVEAUX.map(n => <option key={n} value={n}>{n}</option>)}
              </select>
              {errors.niveau && <p className="text-xs mt-1" style={{ color: COLORS.accent }}>{errors.niveau}</p>}
            </div>
          )}

          {/* COULEUR */}
          <div>
            <label className="block text-sm font-semibold mb-1.5" style={{ color: COLORS.gray700 }}>
              Couleur
            </label>
            <div className="flex items-center gap-3 flex-wrap">
              {COULEURS_PREDEFINIES.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setForm(prev => ({ ...prev, couleur: c }))}
                  className="w-8 h-8 rounded-full border-4 transition-all hover:scale-110"
                  style={{
                    backgroundColor: c,
                    borderColor: form.couleur === c ? COLORS.gray800 : 'transparent',
                  }}
                />
              ))}
              <input
                type="color"
                name="couleur"
                value={form.couleur}
                onChange={handleChange}
                className="w-8 h-8 rounded-full cursor-pointer border-0"
                title="Couleur personnalisée"
              />
            </div>
          </div>

          {/* IMPORTANT */}
          <div className="flex items-center gap-3 p-3 rounded-xl"
               style={{ backgroundColor: form.est_important ? '#FEF3C7' : COLORS.gray50 }}>
            <input
              type="checkbox"
              id="est_important"
              name="est_important"
              checked={form.est_important}
              onChange={handleChange}
              className="w-4 h-4 rounded cursor-pointer"
            />
            <label htmlFor="est_important" className="text-sm font-medium cursor-pointer select-none"
                   style={{ color: form.est_important ? '#D97706' : COLORS.gray700 }}>
              ⭐ Marquer comme événement important
            </label>
          </div>

          {/* BOUTONS */}
          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 rounded-xl font-semibold text-sm hover:opacity-90 transition-all disabled:opacity-60"
              style={{ backgroundColor: COLORS.primary, color: 'white' }}
            >
              {loading
                ? '⏳ Enregistrement...'
                : eventToEdit ? '✅ Modifier' : '➕ Créer l\'événement'
              }
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-6 py-3 rounded-xl font-semibold text-sm hover:opacity-80 transition-all"
              style={{ backgroundColor: COLORS.gray100, color: COLORS.gray700 }}
            >
              Annuler
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}