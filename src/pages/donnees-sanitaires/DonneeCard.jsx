import { useState } from 'react';
import { donneeSanitaireService } from '../../services/api';

const GRAVITE_CONFIG = {
  leger: { icon: '🟢', color: '#00A86B', bg: '#E6F7F0', label: 'Léger' },
  modere: { icon: '🟡', color: '#FF6B35', bg: '#FFF0E6', label: 'Modéré' },
  grave: { icon: '🟠', color: '#DC143C', bg: '#FFE6EC', label: 'Grave' },
  critique: { icon: '🔴', color: '#991B1B', bg: '#FEE2E2', label: 'Critique' },
};

const STATUT_CONFIG = {
  en_cours: { icon: '⏳', color: '#0066CC', label: 'En cours' },
  guerison: { icon: '✅', color: '#00A86B', label: 'Guérison' },
  decede: { icon: '💀', color: '#991B1B', label: 'Décédé' },
  suivi_perdu: { icon: '❓', color: '#6B7280', label: 'Suivi perdu' },
};

export default function DonneeCard({ donnee, currentUser, onDeleteSuccess }) {
  const [expanded, setExpanded] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const graviteConfig = GRAVITE_CONFIG[donnee.gravite] || GRAVITE_CONFIG.modere;
  const statutConfig = STATUT_CONFIG[donnee.statut] || STATUT_CONFIG.en_cours;

  const canDelete = currentUser?.role === 'admin' || donnee.collecte_par === currentUser?.id;

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  const handleDelete = async () => {
    if (!window.confirm('Supprimer cette donnée ?')) return;

    try {
      setDeleting(true);
      await donneeSanitaireService.delete(donnee.id_donnee);
      alert('Donnée supprimée !');
      onDeleteSuccess();
    } catch (err) {
      alert(err.response?.data?.message || 'Erreur lors de la suppression');
      setDeleting(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-all overflow-hidden border border-gray-100">
      {/* Header */}
      <div
        className="p-4 border-l-4"
        style={{ borderLeftColor: graviteConfig.color }}
      >
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="font-bold text-gray-800 text-lg">
              {donnee.pathologie}
            </h3>
            <p className="text-xs text-gray-500">
              Code: {donnee.code_patient}
            </p>
          </div>
          <span
            className="text-xs font-bold px-3 py-1 rounded-full"
            style={{ backgroundColor: graviteConfig.bg, color: graviteConfig.color }}
          >
            {graviteConfig.icon} {graviteConfig.label}
          </span>
        </div>

        {/* Infos rapides */}
        <div className="flex gap-2 flex-wrap mt-3">
          {donnee.sexe && (
            <span className="text-xs px-2 py-1 rounded-full bg-blue-50 text-blue-600">
              {donnee.sexe === 'M' ? '♂️ Homme' : donnee.sexe === 'F' ? '♀️ Femme' : '⚧️ Autre'}
            </span>
          )}
          {donnee.age && (
            <span className="text-xs px-2 py-1 rounded-full bg-purple-50 text-purple-600">
              🎂 {donnee.age} ans
            </span>
          )}
          {donnee.commune && (
            <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600">
              📍 {donnee.commune}
            </span>
          )}
        </div>
      </div>

      {/* Contenu */}
      <div className="p-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Statut</span>
          <span className="font-medium" style={{ color: statutConfig.color }}>
            {statutConfig.icon} {statutConfig.label}
          </span>
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Consultation</span>
          <span className="font-medium text-gray-700">
            {formatDate(donnee.date_consultation)}
          </span>
        </div>

        {donnee.diagnostic && (
          <div className="text-sm">
            <span className="text-gray-500">Diagnostic:</span>
            <p className="text-gray-700 mt-1 line-clamp-2">{donnee.diagnostic}</p>
          </div>
        )}

        {/* Bouton Détails */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full mt-3 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
        >
          {expanded ? '🔼 Masquer détails' : '🔽 Voir détails'}
        </button>

        {/* Détails étendus */}
        {expanded && (
          <div className="mt-3 pt-3 border-t border-gray-100 space-y-2 text-sm">
            {donnee.symptomes && (
              <div>
                <span className="font-medium text-gray-700">Symptômes:</span>
                <p className="text-gray-600 mt-1">{donnee.symptomes}</p>
              </div>
            )}
            {donnee.traitement_prescrit && (
              <div>
                <span className="font-medium text-gray-700">Traitement:</span>
                <p className="text-gray-600 mt-1">{donnee.traitement_prescrit}</p>
              </div>
            )}
            {donnee.antecedents_medicaux && donnee.antecedents_details && (
              <div>
                <span className="font-medium text-gray-700">Antécédents:</span>
                <p className="text-gray-600 mt-1">{donnee.antecedents_details}</p>
              </div>
            )}
            {donnee.collecteur && (
              <div className="text-xs text-gray-400 mt-2">
                Collecté par: {donnee.collecteur.prenom} {donnee.collecteur.nom}
              </div>
            )}

            {/* Bouton Supprimer */}
            {canDelete && (
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="w-full mt-2 py-2 text-sm font-medium text-white rounded-lg transition-all"
                style={{ backgroundColor: '#DC143C' }}
              >
                {deleting ? '⏳ Suppression...' : '🗑️ Supprimer'}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}