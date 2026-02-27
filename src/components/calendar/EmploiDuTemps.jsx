import { useState, useEffect } from 'react';
import { calendrierService } from '../../services/api';

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
  gray300:   '#D1D5DB',
  gray600:   '#4B5563',
  gray700:   '#374151',
  gray800:   '#1F2937',
  gray900:   '#111827',
};

// ─── Config jours ─────────────────────────────────────────────
const JOURS = [
  { key: 'lundi',    label: 'Lundi',    icon: '📅' },
  { key: 'mardi',    label: 'Mardi',    icon: '📅' },
  { key: 'mercredi', label: 'Mercredi', icon: '📅' },
  { key: 'jeudi',    label: 'Jeudi',    icon: '📅' },
  { key: 'vendredi', label: 'Vendredi', icon: '📅' },
  { key: 'samedi',   label: 'Samedi',   icon: '📅' },
];

// ─── Couleurs par filière ─────────────────────────────────────
const FILIERE_COLORS = [
  '#0066CC', '#00A86B', '#8B5CF6', '#F97316',
  '#EC4899', '#14B8A6', '#F59E0B', '#DC143C',
];

// ─── Formulaire initial créneau ───────────────────────────────
const FORM_INITIAL = {
  id_cours:     '',
  jour_semaine: 'lundi',
  heure_debut:  '08:00',
  heure_fin:    '10:00',
  salle:        '',
  filiere:      '',
  niveau:       '',
  semestre:     'S1',
};

const FILIERES  = ['Médecine','Pharmacie','Sciences-Biomédicale','Chirurgie','Pédiatrie','Gynécologie'];
const NIVEAUX   = ['L1','L2','L3','M1','M2','Doctorat'];
const SEMESTRES = ['S1','S2','S3','S4','S5','S6'];

export default function EmploiDuTemps({
  cours    = [],   // liste des cours disponibles (passée depuis la page parent)
  canEdit  = false,
  filiere  = null, // filtre fixe pour étudiant/enseignant
  niveau   = null,
}) {
  const [emplois,         setEmplois]         = useState({});
  const [loading,         setLoading]         = useState(false);
  const [showModal,       setShowModal]       = useState(false);
  const [editingEmploi,   setEditingEmploi]   = useState(null);
  const [form,            setForm]            = useState(FORM_INITIAL);
  const [errors,          setErrors]          = useState({});
  const [loadingForm,     setLoadingForm]     = useState(false);
  const [message,         setMessage]         = useState({ type: '', text: '' });

  // Filtres
  const [filterFiliere,  setFilterFiliere]  = useState(filiere || '');
  const [filterNiveau,   setFilterNiveau]   = useState(niveau  || '');
  const [filterSemestre, setFilterSemestre] = useState('S1');

  useEffect(() => {
    fetchEmplois();
  }, [filterFiliere, filterNiveau, filterSemestre]);

  // ─── Charger l'emploi du temps ───────────────────────────────
  const fetchEmplois = async () => {
    if (!filterFiliere || !filterNiveau) {
      setEmplois({});
      return;
    }
    try {
      setLoading(true);
      const res = await calendrierService.getEmploiDuTemps(
        filterFiliere,
        filterNiveau,
        filterSemestre
      );
      setEmplois(res.data.data || {});
    } catch (err) {
      console.error('Erreur emploi du temps:', err);
      setEmplois({});
    } finally {
      setLoading(false);
    }
  };

  // ─── Ouvrir modal création/modification ───────────────────────
  const handleOpenModal = (emploi = null) => {
    if (emploi) {
      setEditingEmploi(emploi);
      setForm({
        id_cours:     emploi.id_cours,
        jour_semaine: emploi.jour_semaine,
        heure_debut:  emploi.heure_debut?.slice(0, 5) || '08:00',
        heure_fin:    emploi.heure_fin?.slice(0, 5)   || '10:00',
        salle:        emploi.salle        || '',
        filiere:      emploi.filiere      || filterFiliere,
        niveau:       emploi.niveau       || filterNiveau,
        semestre:     emploi.semestre     || filterSemestre,
      });
    } else {
      setEditingEmploi(null);
      setForm({
        ...FORM_INITIAL,
        filiere:  filterFiliere,
        niveau:   filterNiveau,
        semestre: filterSemestre,
      });
    }
    setErrors({});
    setMessage({ type: '', text: '' });
    setShowModal(true);
  };

  // ─── Handler champs formulaire ────────────────────────────────
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  // ─── Validation ───────────────────────────────────────────────
  const validate = () => {
    const e = {};
    if (!form.id_cours)     e.id_cours     = 'Le cours est obligatoire.';
    if (!form.filiere)      e.filiere      = 'La filière est obligatoire.';
    if (!form.niveau)       e.niveau       = 'Le niveau est obligatoire.';
    if (!form.semestre)     e.semestre     = 'Le semestre est obligatoire.';
    if (!form.heure_debut)  e.heure_debut  = 'L\'heure de début est obligatoire.';
    if (!form.heure_fin)    e.heure_fin    = 'L\'heure de fin est obligatoire.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // ─── Soumission formulaire ────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate() || loadingForm) return;

    try {
      setLoadingForm(true);
      if (editingEmploi) {
        await calendrierService.updateEmploi(editingEmploi.id_emploi, form);
        setMessage({ type: 'success', text: 'Créneau modifié avec succès !' });
      } else {
        await calendrierService.createEmploi(form);
        setMessage({ type: 'success', text: 'Créneau ajouté avec succès !' });
      }
      setTimeout(() => {
        setShowModal(false);
        fetchEmplois();
      }, 1200);
    } catch (err) {
      if (err.response?.data?.errors) {
        setErrors(err.response.data.errors);
      } else {
        setMessage({ type: 'error', text: err.response?.data?.message || 'Erreur lors de l\'opération.' });
      }
    } finally {
      setLoadingForm(false);
    }
  };

  // ─── Suppression créneau ─────────────────────────────────────
  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer ce créneau ?')) return;
    try {
      await calendrierService.deleteEmploi(id);
      fetchEmplois();
    } catch (err) {
      alert('Erreur lors de la suppression.');
    }
  };

  // ─── Couleur par cours ────────────────────────────────────────
  const getCourseColor = (idCours) => {
    const idx = (idCours || 0) % FILIERE_COLORS.length;
    return FILIERE_COLORS[idx];
  };

  // ─── Rendu d'un créneau ───────────────────────────────────────
  const renderCreneau = (creneau) => {
    const color = getCourseColor(creneau.id_cours);
    const coursInfo = creneau.cours;

    return (
      <div
        key={creneau.id_emploi}
        className="group relative p-3 rounded-xl mb-2 hover:shadow-md transition-all"
        style={{
          backgroundColor: color + '15',
          border: `1px solid ${color}40`,
          borderLeft: `4px solid ${color}`,
        }}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            {/* Heure */}
            <p className="text-xs font-bold mb-1" style={{ color }}>
              🕐 {creneau.heure_debut?.slice(0, 5)} — {creneau.heure_fin?.slice(0, 5)}
            </p>

            {/* Titre cours */}
            <p className="font-semibold text-sm truncate" style={{ color: COLORS.gray900 }}>
              {coursInfo?.titre || `Cours #${creneau.id_cours}`}
            </p>

            {/* Code cours */}
            {coursInfo?.code && (
              <span
                className="inline-block text-xs font-bold px-2 py-0.5 rounded-full mt-1"
                style={{ backgroundColor: color + '20', color }}
              >
                {coursInfo.code}
              </span>
            )}

            {/* Enseignant */}
            {coursInfo?.enseignant && (
              <p className="text-xs mt-1 flex items-center gap-1" style={{ color: COLORS.gray600 }}>
                <span>👨‍🏫</span>
                {coursInfo.enseignant.prenom} {coursInfo.enseignant.nom}
              </p>
            )}

            {/* Salle */}
            {creneau.salle && (
              <p className="text-xs mt-0.5 flex items-center gap-1" style={{ color: COLORS.gray600 }}>
                <span>📍</span> {creneau.salle}
              </p>
            )}
          </div>

          {/* Actions (admin seulement) */}
          {canEdit && (
            <div className="flex flex-col gap-1 ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => handleOpenModal(creneau)}
                className="p-1.5 rounded-lg text-xs hover:opacity-80 transition-all"
                style={{ backgroundColor: '#EFF6FF', color: COLORS.primary }}
              >
                ✏️
              </button>
              <button
                onClick={() => handleDelete(creneau.id_emploi)}
                className="p-1.5 rounded-lg text-xs hover:opacity-80 transition-all"
                style={{ backgroundColor: '#FEE2E2', color: COLORS.accent }}
              >
                🗑️
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden"
         style={{ border: `1px solid ${COLORS.gray200}` }}>

      {/* ── EN-TÊTE ─────────────────────────────────────────── */}
      <div className="px-6 py-4 flex items-center justify-between flex-wrap gap-3"
           style={{ backgroundColor: COLORS.gray50, borderBottom: `1px solid ${COLORS.gray200}` }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
               style={{ backgroundColor: COLORS.primary + '20' }}>
            📋
          </div>
          <div>
            <h2 className="font-bold text-lg" style={{ color: COLORS.gray900 }}>
              Emploi du Temps
            </h2>
            <p className="text-xs" style={{ color: COLORS.gray600 }}>
              Vue hebdomadaire
            </p>
          </div>
        </div>

        {canEdit && (
          <button
            onClick={() => handleOpenModal()}
            className="px-4 py-2 rounded-xl text-sm font-semibold hover:opacity-80 transition-all flex items-center gap-2"
            style={{ backgroundColor: COLORS.secondary, color: 'white' }}
          >
            ➕ Ajouter un créneau
          </button>
        )}
      </div>

      {/* ── FILTRES ─────────────────────────────────────────── */}
      <div className="px-6 py-4 flex flex-wrap gap-3"
           style={{ borderBottom: `1px solid ${COLORS.gray200}` }}>

        {/* Filière (masqué si fixé par le parent) */}
        {!filiere && (
          <select
            value={filterFiliere}
            onChange={e => setFilterFiliere(e.target.value)}
            className="px-3 py-2 rounded-xl border text-sm focus:outline-none"
            style={{ borderColor: COLORS.gray300 }}
          >
            <option value="">-- Filière --</option>
            {FILIERES.map(f => <option key={f} value={f}>{f}</option>)}
          </select>
        )}

        {/* Niveau (masqué si fixé par le parent) */}
        {!niveau && (
          <select
            value={filterNiveau}
            onChange={e => setFilterNiveau(e.target.value)}
            className="px-3 py-2 rounded-xl border text-sm focus:outline-none"
            style={{ borderColor: COLORS.gray300 }}
          >
            <option value="">-- Niveau --</option>
            {NIVEAUX.map(n => <option key={n} value={n}>{n}</option>)}
          </select>
        )}

        {/* Semestre */}
        <div className="flex rounded-xl overflow-hidden"
             style={{ border: `1px solid ${COLORS.gray200}` }}>
          {SEMESTRES.map(s => (
            <button
              key={s}
              onClick={() => setFilterSemestre(s)}
              className="px-3 py-2 text-sm font-medium transition-all"
              style={{
                backgroundColor: filterSemestre === s ? COLORS.primary : 'white',
                color:           filterSemestre === s ? 'white' : COLORS.gray600,
              }}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* ── GRILLE EMPLOI DU TEMPS ───────────────────────────── */}
      <div className="p-4">
        {!filterFiliere || !filterNiveau ? (
          <div className="text-center py-16">
            <span className="text-5xl">🎓</span>
            <p className="mt-4 font-medium" style={{ color: COLORS.gray600 }}>
              Sélectionnez une filière et un niveau pour afficher l'emploi du temps
            </p>
          </div>
        ) : loading ? (
          <div className="text-center py-16">
            <div className="inline-block w-10 h-10 rounded-full border-4 border-t-transparent animate-spin"
                 style={{ borderColor: COLORS.primary, borderTopColor: 'transparent' }} />
            <p className="mt-4" style={{ color: COLORS.gray600 }}>Chargement...</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {JOURS.map(jour => {
              const creneaux = emplois[jour.key] || [];

              return (
                <div key={jour.key}>
                  {/* Entête jour */}
                  <div
                    className="text-center p-3 rounded-xl mb-3 font-bold text-sm"
                    style={{
                      backgroundColor: creneaux.length > 0 ? COLORS.primary : COLORS.gray100,
                      color:           creneaux.length > 0 ? 'white' : COLORS.gray600,
                    }}
                  >
                    {jour.label}
                    {creneaux.length > 0 && (
                      <span className="ml-1 text-xs opacity-80">
                        ({creneaux.length})
                      </span>
                    )}
                  </div>

                  {/* Créneaux du jour */}
                  {creneaux.length === 0 ? (
                    <div
                      className="text-center py-6 rounded-xl text-xs"
                      style={{ backgroundColor: COLORS.gray50, color: COLORS.gray600 }}
                    >
                      Libre
                    </div>
                  ) : (
                    creneaux.map(c => renderCreneau(c))
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── MODAL CRÉATION / MODIFICATION CRÉNEAU ───────────── */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
          onClick={() => setShowModal(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            {/* Header modal */}
            <div className="sticky top-0 bg-white px-6 py-4 flex items-center justify-between rounded-t-2xl"
                 style={{ borderBottom: `1px solid ${COLORS.gray200}` }}>
              <h3 className="font-bold text-lg" style={{ color: COLORS.gray900 }}>
                {editingEmploi ? '✏️ Modifier le créneau' : '➕ Nouveau créneau'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center hover:opacity-80"
                style={{ backgroundColor: COLORS.gray100, color: COLORS.gray600 }}
              >
                ✕
              </button>
            </div>

            {/* Message feedback */}
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

            <form onSubmit={handleSubmit} className="p-6 space-y-4">

              {/* Cours */}
              <div>
                <label className="block text-sm font-semibold mb-1.5" style={{ color: COLORS.gray700 }}>
                  Cours <span style={{ color: COLORS.accent }}>*</span>
                </label>
                <select
                  name="id_cours"
                  value={form.id_cours}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl border focus:outline-none text-sm"
                  style={{ borderColor: errors.id_cours ? COLORS.accent : COLORS.gray300 }}
                >
                  <option value="">-- Sélectionner un cours --</option>
                  {cours.map(c => (
                    <option key={c.id_cours} value={c.id_cours}>
                      {c.code} — {c.titre}
                    </option>
                  ))}
                </select>
                {errors.id_cours && <p className="text-xs mt-1" style={{ color: COLORS.accent }}>{errors.id_cours}</p>}
              </div>

              {/* Jour */}
              <div>
                <label className="block text-sm font-semibold mb-1.5" style={{ color: COLORS.gray700 }}>
                  Jour <span style={{ color: COLORS.accent }}>*</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {JOURS.map(j => (
                    <button
                      key={j.key}
                      type="button"
                      onClick={() => setForm(prev => ({ ...prev, jour_semaine: j.key }))}
                      className="py-2 px-3 rounded-xl border-2 text-sm font-medium transition-all hover:opacity-80"
                      style={{
                        borderColor:     form.jour_semaine === j.key ? COLORS.primary : COLORS.gray200,
                        backgroundColor: form.jour_semaine === j.key ? '#EFF6FF' : 'white',
                        color:           form.jour_semaine === j.key ? COLORS.primary : COLORS.gray600,
                      }}
                    >
                      {j.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Horaires */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-1.5" style={{ color: COLORS.gray700 }}>
                    Heure début <span style={{ color: COLORS.accent }}>*</span>
                  </label>
                  <input
                    type="time"
                    name="heure_debut"
                    value={form.heure_debut}
                    onChange={handleChange}
                    className="w-full px-3 py-2.5 rounded-xl border focus:outline-none text-sm"
                    style={{ borderColor: errors.heure_debut ? COLORS.accent : COLORS.gray300 }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1.5" style={{ color: COLORS.gray700 }}>
                    Heure fin <span style={{ color: COLORS.accent }}>*</span>
                  </label>
                  <input
                    type="time"
                    name="heure_fin"
                    value={form.heure_fin}
                    onChange={handleChange}
                    className="w-full px-3 py-2.5 rounded-xl border focus:outline-none text-sm"
                    style={{ borderColor: errors.heure_fin ? COLORS.accent : COLORS.gray300 }}
                  />
                </div>
              </div>

              {/* Salle */}
              <div>
                <label className="block text-sm font-semibold mb-1.5" style={{ color: COLORS.gray700 }}>
                  Salle
                </label>
                <input
                  type="text"
                  name="salle"
                  value={form.salle}
                  onChange={handleChange}
                  placeholder="Ex: Amphi A, Salle 101..."
                  className="w-full px-4 py-2.5 rounded-xl border focus:outline-none text-sm"
                  style={{ borderColor: COLORS.gray300 }}
                />
              </div>

              {/* Filière */}
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

              {/* Niveau */}
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

              {/* Semestre */}
              <div>
                <label className="block text-sm font-semibold mb-1.5" style={{ color: COLORS.gray700 }}>
                  Semestre <span style={{ color: COLORS.accent }}>*</span>
                </label>
                <div className="flex gap-2 flex-wrap">
                  {SEMESTRES.map(s => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setForm(prev => ({ ...prev, semestre: s }))}
                      className="px-4 py-2 rounded-xl border-2 text-sm font-medium transition-all hover:opacity-80"
                      style={{
                        borderColor:     form.semestre === s ? COLORS.primary : COLORS.gray200,
                        backgroundColor: form.semestre === s ? '#EFF6FF' : 'white',
                        color:           form.semestre === s ? COLORS.primary : COLORS.gray600,
                      }}
                    >
                      {s}
                    </button>
                  ))}
                </div>
                {errors.semestre && <p className="text-xs mt-1" style={{ color: COLORS.accent }}>{errors.semestre}</p>}
              </div>

              {/* Boutons */}
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={loadingForm}
                  className="flex-1 py-3 rounded-xl font-semibold text-sm hover:opacity-90 transition-all disabled:opacity-60"
                  style={{ backgroundColor: COLORS.primary, color: 'white' }}
                >
                  {loadingForm ? '⏳ Enregistrement...' : editingEmploi ? '✅ Modifier' : '➕ Ajouter'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  disabled={loadingForm}
                  className="px-6 py-3 rounded-xl font-semibold text-sm hover:opacity-80 transition-all"
                  style={{ backgroundColor: COLORS.gray100, color: COLORS.gray700 }}
                >
                  Annuler
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}