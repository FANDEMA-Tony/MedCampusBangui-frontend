const VILLES = ['Bangui', 'Berbérati', 'Carnot', 'Bambari', 'Bouar', 'Bossangoa'];

const COMMUNES_BANGUI = [
  '1er Arrondissement', '2ème Arrondissement', '3ème Arrondissement',
  '4ème Arrondissement', '5ème Arrondissement', '6ème Arrondissement',
  '7ème Arrondissement', '8ème Arrondissement'
];

const PATHOLOGIES = [
  'Paludisme', 'Diarrhée', 'Pneumonie', 'Tuberculose',
  'VIH/SIDA', 'Rougeole', 'Méningite', 'Fièvre typhoïde',
  'Malnutrition', 'Hypertension', 'Diabète'
];

export default function FiltreSanitaire({ filtres, onChange, total }) {
  const handleChange = (name, value) => {
    onChange({ ...filtres, [name]: value });
  };

  const handleReset = () => {
    onChange({
      pathologie: '',
      ville: '',
      commune: '',
      gravite: '',
      tranche_age: '',
      sexe: '',
      en_cours: false,
      graves: false,
    });
  };

  const activeFiltersCount = Object.values(filtres).filter(v => v && v !== '').length;

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800">
          🔍 Filtres
          {activeFiltersCount > 0 && (
            <span className="ml-2 text-sm font-normal text-gray-500">
              ({activeFiltersCount} actif{activeFiltersCount > 1 ? 's' : ''})
            </span>
          )}
        </h3>
        {activeFiltersCount > 0 && (
          <button
            onClick={handleReset}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            ✖️ Réinitialiser
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Pathologie */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Pathologie</label>
          <select
            value={filtres.pathologie}
            onChange={(e) => handleChange('pathologie', e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none"
          >
            <option value="">Toutes</option>
            {PATHOLOGIES.map(p => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>

        {/* Gravité */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Gravité</label>
          <select
            value={filtres.gravite}
            onChange={(e) => handleChange('gravite', e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none"
          >
            <option value="">Toutes</option>
            <option value="leger">🟢 Léger</option>
            <option value="modere">🟡 Modéré</option>
            <option value="grave">🟠 Grave</option>
            <option value="critique">🔴 Critique</option>
          </select>
        </div>

        {/* Ville */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Ville</label>
          <select
            value={filtres.ville}
            onChange={(e) => handleChange('ville', e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none"
          >
            <option value="">Toutes</option>
            {VILLES.map(v => (
              <option key={v} value={v}>{v}</option>
            ))}
          </select>
        </div>

        {/* Commune */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Commune</label>
          <select
            value={filtres.commune}
            onChange={(e) => handleChange('commune', e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none"
          >
            <option value="">Toutes</option>
            {COMMUNES_BANGUI.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {/* Tranche d'âge */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tranche d'âge</label>
          <select
            value={filtres.tranche_age}
            onChange={(e) => handleChange('tranche_age', e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none"
          >
            <option value="">Toutes</option>
            <option value="0-5">0-5 ans</option>
            <option value="6-12">6-12 ans</option>
            <option value="13-18">13-18 ans</option>
            <option value="19-35">19-35 ans</option>
            <option value="36-60">36-60 ans</option>
            <option value="60+">60+ ans</option>
          </select>
        </div>

        {/* Sexe */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Sexe</label>
          <select
            value={filtres.sexe}
            onChange={(e) => handleChange('sexe', e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none"
          >
            <option value="">Tous</option>
            <option value="M">♂️ Masculin</option>
            <option value="F">♀️ Féminin</option>
            <option value="Autre">⚧️ Autre</option>
          </select>
        </div>

        {/* Filtres rapides */}
        <div className="md:col-span-2 flex gap-3">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={filtres.graves}
              onChange={(e) => handleChange('graves', e.target.checked)}
              className="w-5 h-5 rounded"
              style={{ accentColor: '#DC143C' }}
            />
            <span className="text-sm font-medium text-gray-700">
              🔴 Cas graves uniquement
            </span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={filtres.en_cours}
              onChange={(e) => handleChange('en_cours', e.target.checked)}
              className="w-5 h-5 rounded"
              style={{ accentColor: '#0066CC' }}
            />
            <span className="text-sm font-medium text-gray-700">
              ⏳ En cours de traitement
            </span>
          </label>
        </div>
      </div>

      {/* Résultat */}
      <div className="mt-4 pt-4 border-t border-gray-100">
        <p className="text-sm text-gray-600">
          <span className="font-semibold" style={{ color: '#0066CC' }}>
            {total}
          </span> donnée{total > 1 ? 's' : ''} trouvée{total > 1 ? 's' : ''}
        </p>
      </div>
    </div>
  );
}