import { useState } from 'react';
import { donneeSanitaireService } from '../../services/api';
import EditDonneeModal from './EditDonneeModal';

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

export default function DonneeCard({ donnee, currentUser, onDeleteSuccess, onUpdateSuccess = onDeleteSuccess }) {
  const [expanded, setExpanded] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const graviteConfig = GRAVITE_CONFIG[donnee.gravite] || GRAVITE_CONFIG.modere;
  const statutConfig = STATUT_CONFIG[donnee.statut] || STATUT_CONFIG.en_cours;

  // ✅ CORRECTION : user.id au lieu de user.id_utilisateur
  const canEdit = currentUser?.role === 'admin' || donnee.collecte_par === currentUser?.id;
  const canDelete = currentUser?.role === 'admin' || donnee.collecte_par === currentUser?.id;

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  const handleDelete = async () => {
    if (!window.confirm('Supprimer définitivement cette donnée ?')) return;

    try {
      setDeleting(true);
      await donneeSanitaireService.delete(donnee.id_donnee);
      alert('✅ Donnée supprimée !');
      onDeleteSuccess();
    } catch (err) {
      alert(err.response?.data?.message || '❌ Erreur lors de la suppression');
      setDeleting(false);
    }
  };

  const handleEditSuccess = () => {
    setShowEditModal(false);
    onUpdateSuccess();
  };

  return (
    <>
      <div className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-all overflow-hidden border border-gray-100">
        
        {/* ✅ HEADER AVEC IDENTITÉ */}
        <div
          className="p-4 border-l-4"
          style={{ borderLeftColor: graviteConfig.color }}
        >
          <div className="flex justify-between items-start mb-2">
            <div className="flex-1">
              {/* ✅ NOM PATIENT (si non anonyme) */}
              {!donnee.est_anonyme && (donnee.nom_patient || donnee.prenom_patient) && (
                <div className="mb-2">
                  <h2 className="font-bold text-gray-900 text-xl">
                    👤 {donnee.prenom_patient || ''} {donnee.nom_patient || ''}
                  </h2>
                  {donnee.telephone_patient && (
                    <p className="text-sm text-gray-600">
                      📞 {donnee.telephone_patient}
                    </p>
                  )}
                </div>
              )}

              {/* ✅ PATHOLOGIE */}
              <h3 className="font-bold text-gray-800 text-lg">
                {donnee.pathologie}
              </h3>

              {/* ✅ CODE PATIENT */}
              <div className="flex items-center gap-2 mt-1">
                <p className="text-xs font-mono px-2 py-1 rounded" style={{ backgroundColor: '#E6F2FF', color: '#0066CC' }}>
                  🔑 {donnee.code_patient}
                </p>
                {donnee.est_anonyme && (
                  <span className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-600">
                    🔒 Anonyme
                  </span>
                )}
              </div>
            </div>

            {/* ✅ BADGE GRAVITÉ */}
            <span
              className="text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap"
              style={{ backgroundColor: graviteConfig.bg, color: graviteConfig.color }}
            >
              {graviteConfig.icon} {graviteConfig.label}
            </span>
          </div>

          {/* ✅ INFOS RAPIDES */}
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
            {donnee.quartier && (
              <span className="text-xs px-2 py-1 rounded-full bg-green-50 text-green-600">
                🏘️ {donnee.quartier}
              </span>
            )}
          </div>
        </div>

        {/* ✅ CONTENU */}
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

          {/* ✅ BOUTON DÉTAILS */}
          <button
            onClick={() => setExpanded(!expanded)}
            className="w-full mt-3 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          >
            {expanded ? '🔼 Masquer détails' : '🔽 Voir détails'}
          </button>

          {/* ✅ DÉTAILS ÉTENDUS */}
          {expanded && (
            <div className="mt-3 pt-3 border-t border-gray-100 space-y-3 text-sm">
              
              {/* Informations personnelles complètes */}
              {!donnee.est_anonyme && (donnee.nom_patient || donnee.prenom_patient) && (
                <div className="p-3 rounded-lg" style={{ backgroundColor: '#E6F2FF' }}>
                  <p className="font-semibold text-gray-800 mb-2">👤 Informations Patient</p>
                  <div className="space-y-1 text-gray-700">
                    <p><span className="font-medium">Nom complet:</span> {donnee.prenom_patient || ''} {donnee.nom_patient || ''}</p>
                    {donnee.telephone_patient && (
                      <p><span className="font-medium">Téléphone:</span> {donnee.telephone_patient}</p>
                    )}
                    {donnee.sexe && (
                      <p><span className="font-medium">Sexe:</span> {donnee.sexe === 'M' ? 'Masculin' : donnee.sexe === 'F' ? 'Féminin' : 'Autre'}</p>
                    )}
                    {donnee.age && (
                      <p><span className="font-medium">Âge:</span> {donnee.age} ans {donnee.tranche_age && `(${donnee.tranche_age})`}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Localisation */}
              {(donnee.ville || donnee.commune || donnee.quartier) && (
                <div>
                  <span className="font-medium text-gray-700">📍 Localisation:</span>
                  <p className="text-gray-600 mt-1">
                    {[donnee.quartier, donnee.commune, donnee.ville].filter(Boolean).join(', ')}
                  </p>
                </div>
              )}

              {/* Symptômes */}
              {donnee.symptomes && (
                <div>
                  <span className="font-medium text-gray-700">🩺 Symptômes:</span>
                  <p className="text-gray-600 mt-1">{donnee.symptomes}</p>
                </div>
              )}

              {/* Traitement */}
              {donnee.traitement_prescrit && (
                <div>
                  <span className="font-medium text-gray-700">💊 Traitement:</span>
                  <p className="text-gray-600 mt-1">{donnee.traitement_prescrit}</p>
                </div>
              )}

              {/* Dates */}
              {donnee.date_debut_symptomes && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Date début symptômes:</span>
                  <span className="font-medium text-gray-700">{formatDate(donnee.date_debut_symptomes)}</span>
                </div>
              )}

              {/* Antécédents */}
              {donnee.antecedents_medicaux && donnee.antecedents_details && (
                <div>
                  <span className="font-medium text-gray-700">📋 Antécédents:</span>
                  <p className="text-gray-600 mt-1">{donnee.antecedents_details}</p>
                </div>
              )}

              {/* Vaccination */}
              {donnee.vaccination_a_jour !== null && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Vaccination:</span>
                  <span className="font-medium" style={{ color: donnee.vaccination_a_jour ? '#00A86B' : '#DC143C' }}>
                    {donnee.vaccination_a_jour ? '✅ À jour' : '❌ Non à jour'}
                  </span>
                </div>
              )}

              {/* Notes */}
              {donnee.notes && (
                <div>
                  <span className="font-medium text-gray-700">📝 Notes:</span>
                  <p className="text-gray-600 mt-1">{donnee.notes}</p>
                </div>
              )}

              {/* Collecteur */}
              {donnee.collecteur && (
                <div className="text-xs text-gray-400 mt-3 pt-3 border-t border-gray-100">
                  Collecté par: {donnee.collecteur.prenom} {donnee.collecteur.nom}
                  <br />
                  Le {formatDate(donnee.created_at)}
                </div>
              )}

              {/* ✅ BOUTONS MODIFIER + SUPPRIMER */}
              <div className="flex gap-2 mt-4">
                {canEdit && (
                  <button
                    onClick={() => setShowEditModal(true)}
                    className="flex-1 py-2 text-sm font-medium text-white rounded-lg transition-all hover:opacity-90"
                    style={{ backgroundColor: '#0066CC' }}
                  >
                    ✏️ Modifier
                  </button>
                )}
                
                {canDelete && (
                  <button
                    onClick={handleDelete}
                    disabled={deleting}
                    className="flex-1 py-2 text-sm font-medium text-white rounded-lg transition-all hover:opacity-90"
                    style={{ backgroundColor: '#DC143C' }}
                  >
                    {deleting ? '⏳ Suppression...' : '🗑️ Supprimer'}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ✅ MODAL DE MODIFICATION */}
      {showEditModal && (
        <EditDonneeModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          donnee={donnee}
          onSuccess={handleEditSuccess}
        />
      )}
    </>
  );
}