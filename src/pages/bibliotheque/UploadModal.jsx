import { useState } from 'react';
import { ressourceService } from '../../services/api';

const CATEGORIES = [
  { value: 'Anatomie', label: '🦴 Anatomie' },
  { value: 'Pharmacologie', label: '💊 Pharmacologie' },
  { value: 'Physiologie', label: '🫀 Physiologie' },
  { value: 'Pathologie', label: '🔬 Pathologie' },
  { value: 'Chirurgie', label: '🩺 Chirurgie' },
  { value: 'Pédiatrie', label: '👶 Pédiatrie' },
  { value: 'Gynécologie', label: '🌸 Gynécologie' },
  { value: 'Cardiologie', label: '❤️ Cardiologie' },
  { value: 'Neurologie', label: '🧠 Neurologie' },
];

const NIVEAUX = [
  { value: '', label: 'Non spécifié' },
  { value: 'L1', label: 'L1' },
  { value: 'L2', label: 'L2' },
  { value: 'L3', label: 'L3' },
  { value: 'M1', label: 'M1' },
  { value: 'M2', label: 'M2' },
  { value: 'doctorat', label: 'Doctorat' },
  { value: 'formation_continue', label: 'Formation Continue' },
];

export default function UploadModal({ isOpen, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [progress, setProgress] = useState(0);
  const [formData, setFormData] = useState({
    titre: '',
    description: '',
    auteur: '',
    type: 'cours',
    categorie: '',
    niveau: '',
    est_public: true,
  });
  const [fichier, setFichier] = useState(null);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState({ type: '', text: '' });

  if (!isOpen) return null;

  const handleFileChange = (file) => {
    if (!file) return;
    if (file.size > 104857600) { // 100MB
      setErrors({ fichier: ['Le fichier ne doit pas dépasser 100MB'] });
      return;
    }
    setFichier(file);
    setErrors({});
    if (!formData.titre) {
      const nom = file.name.replace(/\.[^/.]+$/, '');
      setFormData(prev => ({ ...prev, titre: nom }));
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileChange(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!fichier) {
      setErrors({ fichier: ['Veuillez sélectionner un fichier'] });
      return;
    }

    try {
      setLoading(true);
      setProgress(0);

      const data = new FormData();
      data.append('titre', formData.titre);
      data.append('description', formData.description);
      data.append('auteur', formData.auteur);
      data.append('type', formData.type);
      data.append('categorie', formData.categorie);
      data.append('niveau', formData.niveau);
      data.append('est_public', formData.est_public ? '1' : '0');
      data.append('fichier', fichier);

      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      await ressourceService.create(data);

      clearInterval(progressInterval);
      setProgress(100);

      setMessage({ type: 'success', text: '✅ Ressource ajoutée avec succès !' });
      
      setTimeout(() => {
        resetForm();
        onSuccess();
      }, 1500);

    } catch (err) {
      setLoading(false);
      setProgress(0);
      if (err.response?.data?.errors) {
        setErrors(err.response.data.errors);
      } else {
        setMessage({ type: 'error', text: err.response?.data?.message || 'Erreur lors de l\'upload' });
      }
    }
  };

  const resetForm = () => {
    setFormData({ titre: '', description: '', auteur: '', type: 'cours', categorie: '', niveau: '', est_public: true });
    setFichier(null);
    setErrors({});
    setMessage({ type: '', text: '' });
    setLoading(false);
    setProgress(0);
  };

  const formatSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold" style={{ color: '#0066CC' }}>
            📤 Ajouter une ressource
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">×</button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
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

          {/* Zone drag & drop */}
          <div
            onDrop={handleDrop}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            className="border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer"
            style={{
              borderColor: dragOver ? '#0066CC' : fichier ? '#00A86B' : '#d1d5db',
              backgroundColor: dragOver ? '#E6F2FF' : fichier ? '#E6F7F0' : '#f9fafb',
            }}
            onClick={() => document.getElementById('fichier-input').click()}
          >
            {fichier ? (
              <>
                <p className="text-3xl mb-2">✅</p>
                <p className="font-semibold text-gray-700">{fichier.name}</p>
                <p className="text-sm text-gray-500">{formatSize(fichier.size)}</p>
                <p className="text-xs text-gray-400 mt-1">Cliquer pour changer</p>
              </>
            ) : (
              <>
                <p className="text-3xl mb-2">📁</p>
                <p className="font-semibold text-gray-600">
                  {dragOver ? 'Déposez ici !' : 'Glissez-déposez ou cliquez'}
                </p>
                <p className="text-sm text-gray-400 mt-1">PDF, Images, Vidéos, Documents (max 100MB)</p>
              </>
            )}
          </div>
          <input
            id="fichier-input"
            type="file"
            className="hidden"
            onChange={(e) => handleFileChange(e.target.files[0])}
          />
          {errors.fichier && <p className="text-sm" style={{ color: '#DC143C' }}>{errors.fichier[0]}</p>}

          {loading && progress > 0 && (
            <div>
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span>Upload en cours...</span>
                <span>{progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="h-2 rounded-full transition-all"
                  style={{ width: `${progress}%`, backgroundColor: '#0066CC' }}
                ></div>
              </div>
            </div>
          )}

          {/* Titre */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Titre <span style={{ color: '#DC143C' }}>*</span>
            </label>
            <input
              type="text"
              value={formData.titre}
              onChange={(e) => setFormData(prev => ({ ...prev, titre: e.target.value }))}
              required
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none"
              placeholder="Titre de la ressource"
              onFocus={(e) => e.target.style.borderColor = '#0066CC'}
              onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
            />
            {errors.titre && <p className="text-sm mt-1" style={{ color: '#DC143C' }}>{errors.titre[0]}</p>}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none resize-none"
              placeholder="Description optionnelle..."
              onFocus={(e) => e.target.style.borderColor = '#0066CC'}
              onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
            />
          </div>

          {/* Auteur */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Auteur</label>
            <input
              type="text"
              value={formData.auteur}
              onChange={(e) => setFormData(prev => ({ ...prev, auteur: e.target.value }))}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none"
              placeholder="Nom de l'auteur (optionnel)"
              onFocus={(e) => e.target.style.borderColor = '#0066CC'}
              onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
            />
          </div>

          {/* Type + Catégorie */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type <span style={{ color: '#DC143C' }}>*</span>
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                required
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none"
                onFocus={(e) => e.target.style.borderColor = '#0066CC'}
                onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
              >
                <option value="cours">📖 Cours</option>
                <option value="livre">📚 Livre</option>
                <option value="video">🎬 Vidéo</option>
                <option value="article">📄 Article</option>
                <option value="autre">📁 Autre</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>
              <select
                value={formData.categorie}
                onChange={(e) => setFormData(prev => ({ ...prev, categorie: e.target.value }))}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none"
                onFocus={(e) => e.target.style.borderColor = '#0066CC'}
                onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
              >
                <option value="">Non spécifiée</option>
                {CATEGORIES.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Niveau + Visibilité */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Niveau</label>
              <select
                value={formData.niveau}
                onChange={(e) => setFormData(prev => ({ ...prev, niveau: e.target.value }))}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none"
                onFocus={(e) => e.target.style.borderColor = '#0066CC'}
                onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
              >
                {NIVEAUX.map(niv => (
                  <option key={niv.value} value={niv.value}>{niv.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Visibilité</label>
              <select
                value={formData.est_public}
                onChange={(e) => setFormData(prev => ({ ...prev, est_public: e.target.value === 'true' }))}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none"
                onFocus={(e) => e.target.style.borderColor = '#0066CC'}
                onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
              >
                <option value="true">🌍 Public</option>
                <option value="false">🔒 Privé</option>
              </select>
            </div>
          </div>

          {/* Boutons */}
          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 rounded-xl text-white font-semibold transition-all hover:opacity-90"
              style={{ backgroundColor: loading ? '#93c5fd' : '#00A86B' }}
            >
              {loading ? '⏳ Upload...' : '📤 Ajouter'}
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