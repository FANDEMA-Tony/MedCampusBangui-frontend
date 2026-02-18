import { useState } from 'react';
import { donneeSanitaireService } from '../../services/api';

const PATHOLOGIES_COMMUNES = [
  'Paludisme', 'Diarrhée', 'Pneumonie', 'Tuberculose',
  'VIH/SIDA', 'Rougeole', 'Méningite', 'Fièvre typhoïde',
  'Malnutrition', 'Hypertension', 'Diabète', 'Autre'
];

const COMMUNES_BANGUI = [
  '1er Arrondissement', '2ème Arrondissement', '3ème Arrondissement',
  '4ème Arrondissement', '5ème Arrondissement', '6ème Arrondissement',
  '7ème Arrondissement', '8ème Arrondissement'
];

export default function EditDonneeModal({ isOpen, onClose, donnee, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    sexe: donnee.sexe || '',
    age: donnee.age || '',
    quartier: donnee.quartier || '',
    commune: donnee.commune || '',
    pathologie: donnee.pathologie || '',
    symptomes: donnee.symptomes || '',
    gravite: donnee.gravite || 'modere',
    date_debut_symptomes: donnee.date_debut_symptomes?.split('T')[0] || '',
    date_consultation: donnee.date_consultation?.split('T')[0] || '',
    diagnostic: donnee.diagnostic || '',
    traitement_prescrit: donnee.traitement_prescrit || '',
    statut: donnee.statut || 'en_cours',
    antecedents_medicaux: donnee.antecedents_medicaux || false,
    antecedents_details: donnee.antecedents_details || '',
    vaccination_a_jour: donnee.vaccination_a_jour,
    notes: donnee.notes || '',
  });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState({ type: '', text: '' });

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setMessage({ type: '', text: '' });

      await donneeSanitaireService.update(donnee.id_donnee, formData);

      setMessage({ type: 'success', text: '✅ Donnée mise à jour avec succès !' });
      
      setTimeout(() => {
        onSuccess();
      }, 1500);

    } catch (err) {
      setLoading(false);
      if (err.response?.data?.errors) {
        setErrors(err.response.data.errors);
      } else {
        setMessage({ 
          type: 'error', 
          text: err.response?.data?.message || 'Erreur lors de la modification' 
        });
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 sticky top-0 bg-white z-10">
          <h2 className="text-xl font-bold" style={{ color: '#0066CC' }}>
            ✏️ Modifier la Donnée Sanitaire
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">×</button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          
          {/* Message */}
          {message.text && (
            <div
              className="p-4 rounded-xl border-l-4"
              style={{
                backgroundColor: message.type === 'success' ? '#E6F7F0' : '#FFE6EC',
                borderLeftColor: message.type === 'success' ? '#00A86B' : '#DC143C',
                color: message.type === 'success' ? '#00A86B' : '#DC143C',
              }}
            >
              {message.text}
            </div>
          )}

          {/* Code Patient (lecture seule) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Code Patient</label>
            <input
              type="text"
              value={donnee.code_patient}
              disabled
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50 text-gray-500"
            />
          </div>

          {/* SECTION 1 : Informations Patient */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              👤 Informations Patient
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sexe</label>
                <select
                  name="sexe"
                  value={formData.sexe}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none"
                >
                  <option value="">Non spécifié</option>
                  <option value="M">♂️ Masculin</option>
                  <option value="F">♀️ Féminin</option>
                  <option value="Autre">⚧️ Autre</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Âge</label>
                <input
                  type="number"
                  name="age"
                  value={formData.age}
                  onChange={handleChange}
                  min="0"
                  max="150"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Commune</label>
                <select
                  name="commune"
                  value={formData.commune}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none"
                >
                  <option value="">Sélectionner</option>
                  {COMMUNES_BANGUI.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">Quartier</label>
                <input
                  type="text"
                  name="quartier"
                  value={formData.quartier}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* SECTION 2 : Informations Médicales */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              🩺 Informations Médicales
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Pathologie <span style={{ color: '#DC143C' }}>*</span>
                </label>
                <select
                  name="pathologie"
                  value={formData.pathologie}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none"
                >
                  <option value="">Sélectionner</option>
                  {PATHOLOGIES_COMMUNES.map(p => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Gravité <span style={{ color: '#DC143C' }}>*</span>
                </label>
                <select
                  name="gravite"
                  value={formData.gravite}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none"
                >
                  <option value="leger">🟢 Léger</option>
                  <option value="modere">🟡 Modéré</option>
                  <option value="grave">🟠 Grave</option>
                  <option value="critique">🔴 Critique</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date début symptômes
                </label>
                <input
                  type="date"
                  name="date_debut_symptomes"
                  value={formData.date_debut_symptomes}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date consultation <span style={{ color: '#DC143C' }}>*</span>
                </label>
                <input
                  type="date"
                  name="date_consultation"
                  value={formData.date_consultation}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Symptômes</label>
                <textarea
                  name="symptomes"
                  value={formData.symptomes}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none resize-none"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Diagnostic</label>
                <textarea
                  name="diagnostic"
                  value={formData.diagnostic}
                  onChange={handleChange}
                  rows={2}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none resize-none"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Traitement prescrit</label>
                <textarea
                  name="traitement_prescrit"
                  value={formData.traitement_prescrit}
                  onChange={handleChange}
                  rows={2}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
                <select
                  name="statut"
                  value={formData.statut}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none"
                >
                  <option value="en_cours">⏳ En cours</option>
                  <option value="guerison">✅ Guérison</option>
                  <option value="decede">💀 Décédé</option>
                  <option value="suivi_perdu">❓ Suivi perdu</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Vaccination à jour</label>
                <select
                  name="vaccination_a_jour"
                  value={formData.vaccination_a_jour === null ? '' : formData.vaccination_a_jour}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    vaccination_a_jour: e.target.value === '' ? null : e.target.value === 'true'
                  }))}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none"
                >
                  <option value="">Non spécifié</option>
                  <option value="true">✅ Oui</option>
                  <option value="false">❌ Non</option>
                </select>
              </div>
            </div>
          </div>

          {/* SECTION 3 : Antécédents */}
          <div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                name="antecedents_medicaux"
                checked={formData.antecedents_medicaux}
                onChange={handleChange}
                className="w-5 h-5 rounded"
                style={{ accentColor: '#0066CC' }}
              />
              <span className="text-sm font-medium text-gray-700">
                Le patient a des antécédents médicaux
              </span>
            </label>

            {formData.antecedents_medicaux && (
              <div className="mt-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">Détails des antécédents</label>
                <textarea
                  name="antecedents_details"
                  value={formData.antecedents_details}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none resize-none"
                />
              </div>
            )}
          </div>

          {/* SECTION 4 : Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes complémentaires</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={2}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none resize-none"
            />
          </div>

          {/* Boutons */}
          <div className="flex gap-3 pt-4 sticky bottom-0 bg-white pb-2">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 rounded-xl text-white font-semibold transition-all hover:opacity-90"
              style={{ backgroundColor: loading ? '#93c5fd' : '#0066CC' }}
            >
              {loading ? '⏳ Enregistrement...' : '💾 Enregistrer les modifications'}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 py-3 rounded-xl font-semibold border border-gray-200 text-gray-600 hover:bg-gray-50"
            >
              Annuler
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}