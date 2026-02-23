import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { coursService } from '../../services/api';
import { getUser } from '../../utils/auth';
import Navbar from '../../components/layout/Navbar';
import Card from '../../components/common/Card';

// 🎨 PALETTE COULEURS MÉDICALES
const MEDICAL_COLORS = {
  primary: '#0066CC',
  secondary: '#00A86B',
  accent: '#DC143C',
  purple: '#8B5CF6',
  teal: '#14B8A6',
  orange: '#F97316',
  
  bgBlue: '#EFF6FF',
  bgGreen: '#F0FDF4',
  bgPurple: '#F5F3FF',
  
  gray50: '#F9FAFB',
  gray100: '#F3F4F6',
  gray200: '#E5E7EB',
  gray600: '#4B5563',
  gray700: '#374151',
  gray800: '#1F2937',
  gray900: '#111827',
};

export default function CoursDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = getUser();
  
  const [loading, setLoading] = useState(true);
  const [cours, setCours] = useState(null);
  const [maNote, setMaNote] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCoursDetail();
  }, [id]);

  const fetchCoursDetail = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await coursService.getDetailCoursEtudiant(id);
      
      if (response.data.success) {
        setCours(response.data.data.cours);
        setMaNote(response.data.data.ma_note);
      }
    } catch (error) {
      console.error('Erreur:', error);
      setError(error.response?.data?.message || 'Erreur lors du chargement du cours');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: MEDICAL_COLORS.gray50 }}>
        <Navbar />
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: MEDICAL_COLORS.primary }}></div>
            <p className="mt-4" style={{ color: MEDICAL_COLORS.gray600 }}>Chargement...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: MEDICAL_COLORS.gray50 }}>
        <Navbar />
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card>
            <div className="text-center py-8">
              <span className="text-6xl">⚠️</span>
              <p className="mt-4 text-lg font-semibold" style={{ color: MEDICAL_COLORS.accent }}>{error}</p>
              <button
                onClick={() => navigate('/etudiant/dashboard')}
                className="mt-4 px-4 py-2 rounded-lg"
                style={{ backgroundColor: MEDICAL_COLORS.primary, color: 'white' }}
              >
                ← Retour au dashboard
              </button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: MEDICAL_COLORS.gray50 }}>
      <Navbar />
      
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* BREADCRUMB + RETOUR */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/etudiant/dashboard')}
            className="flex items-center gap-2 text-sm font-medium hover:opacity-80 transition-opacity"
            style={{ color: MEDICAL_COLORS.primary }}
          >
            <span>←</span>
            <span>Retour au dashboard</span>
          </button>
        </div>

        {/* EN-TÊTE COURS */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-4xl">📖</span>
                <div>
                  <h1 className="text-2xl font-bold" style={{ color: MEDICAL_COLORS.gray900 }}>
                    {cours.titre}
                  </h1>
                  <p className="text-sm" style={{ color: MEDICAL_COLORS.gray600 }}>
                    Code: {cours.code} • {cours.filiere} • {cours.niveau}
                  </p>
                </div>
              </div>
            </div>
            
            {/* BADGE CODE */}
            <span
              className="text-xs font-bold px-3 py-2 rounded-full"
              style={{ backgroundColor: MEDICAL_COLORS.bgBlue, color: MEDICAL_COLORS.primary }}
            >
              {cours.code}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* COLONNE PRINCIPALE */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* DESCRIPTION */}
            {cours.description && (
              <Card title="📋 Description du cours">
                <p className="text-sm leading-relaxed" style={{ color: MEDICAL_COLORS.gray700 }}>
                  {cours.description}
                </p>
              </Card>
            )}

            {/* MES RÉSULTATS */}
            <Card title="📊 Mes Résultats">
              {maNote ? (
                <div className="space-y-4">
                  {/* NOTE */}
                  <div
                    className="p-4 rounded-lg border-l-4"
                    style={{
                      backgroundColor: maNote.valeur >= 10 ? MEDICAL_COLORS.bgGreen : '#FEE2E2',
                      borderLeftColor: maNote.valeur >= 10 ? MEDICAL_COLORS.secondary : MEDICAL_COLORS.accent
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium" style={{ color: MEDICAL_COLORS.gray700 }}>
                        Note obtenue
                      </span>
                      <span className={`text-3xl font-bold ${
                        maNote.valeur >= 10 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {maNote.valeur}/20
                      </span>
                    </div>
                  </div>

                  {/* DÉTAILS */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 rounded-lg" style={{ backgroundColor: MEDICAL_COLORS.gray50 }}>
                      <p className="text-xs font-medium mb-1" style={{ color: MEDICAL_COLORS.gray600 }}>
                        Session
                      </p>
                      <p className="text-sm font-bold" style={{ color: MEDICAL_COLORS.gray900 }}>
                        {maNote.session === 'normale' ? '✅ Normale' : '🔄 Rattrapage'}
                      </p>
                    </div>

                    <div className="p-3 rounded-lg" style={{ backgroundColor: MEDICAL_COLORS.gray50 }}>
                      <p className="text-xs font-medium mb-1" style={{ color: MEDICAL_COLORS.gray600 }}>
                        Semestre
                      </p>
                      <p className="text-sm font-bold" style={{ color: MEDICAL_COLORS.gray900 }}>
                        📅 {maNote.semestre}
                      </p>
                    </div>

                    <div className="p-3 rounded-lg col-span-2" style={{ backgroundColor: MEDICAL_COLORS.gray50 }}>
                      <p className="text-xs font-medium mb-1" style={{ color: MEDICAL_COLORS.gray600 }}>
                        Date d'évaluation
                      </p>
                      <p className="text-sm font-bold" style={{ color: MEDICAL_COLORS.gray900 }}>
                        📆 {new Date(maNote.date).toLocaleDateString('fr-FR', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>

                  {/* BADGE RATTRAPÉ */}
                  {maNote.est_rattrape && (
                    <div
                      className="p-3 rounded-lg flex items-center gap-2"
                      style={{ backgroundColor: MEDICAL_COLORS.bgBlue, color: MEDICAL_COLORS.primary }}
                    >
                      <span className="text-xl">🎓</span>
                      <span className="text-sm font-semibold">
                        Validé en session de rattrapage
                      </span>
                    </div>
                  )}

                  {/* STATUT */}
                  {maNote.valeur >= 10 ? (
                    <div className="p-3 rounded-lg text-center" style={{ backgroundColor: MEDICAL_COLORS.bgGreen }}>
                      <span className="text-lg font-bold" style={{ color: MEDICAL_COLORS.secondary }}>
                        ✅ Cours validé
                      </span>
                    </div>
                  ) : (
                    <div className="p-3 rounded-lg text-center" style={{ backgroundColor: '#FEE2E2' }}>
                      <span className="text-lg font-bold" style={{ color: MEDICAL_COLORS.accent }}>
                        ❌ Cours non validé - Rattrapage nécessaire
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <span className="text-6xl mb-4 block">⏳</span>
                  <p className="text-lg font-semibold mb-2" style={{ color: MEDICAL_COLORS.orange }}>
                    Aucune note disponible
                  </p>
                  <p className="text-sm" style={{ color: MEDICAL_COLORS.gray600 }}>
                    Vous n'avez pas encore été évalué pour ce cours
                  </p>
                </div>
              )}
            </Card>
          </div>

          {/* COLONNE LATÉRALE */}
          <div className="space-y-6">
            
            {/* ENSEIGNANT */}
            {cours.enseignant && (
              <Card title="👨‍🏫 Enseignant">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">👨‍🏫</span>
                    <div>
                      <p className="font-bold" style={{ color: MEDICAL_COLORS.gray900 }}>
                        {cours.enseignant.prenom} {cours.enseignant.nom}
                      </p>
                      <p className="text-xs" style={{ color: MEDICAL_COLORS.gray600 }}>
                        {cours.enseignant.specialite || 'Enseignant'}
                      </p>
                    </div>
                  </div>

                  <div className="pt-3 border-t" style={{ borderColor: MEDICAL_COLORS.gray200 }}>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm">📧</span>
                      <p className="text-xs" style={{ color: MEDICAL_COLORS.gray600 }}>
                        {cours.enseignant.email}
                      </p>
                    </div>
                    
                    {cours.enseignant.matricule && (
                      <div className="flex items-center gap-2">
                        <span className="text-sm">🆔</span>
                        <p className="text-xs" style={{ color: MEDICAL_COLORS.gray600 }}>
                          {cours.enseignant.matricule}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            )}

            {/* INFORMATIONS COMPLÉMENTAIRES */}
            <Card title="ℹ️ Informations">
              <div className="space-y-3">
                <div className="flex items-center justify-between p-2 rounded" style={{ backgroundColor: MEDICAL_COLORS.gray50 }}>
                  <span className="text-xs font-medium" style={{ color: MEDICAL_COLORS.gray600 }}>
                    Filière
                  </span>
                  <span className="text-sm font-bold" style={{ color: MEDICAL_COLORS.primary }}>
                    {cours.filiere || '-'}
                  </span>
                </div>

                <div className="flex items-center justify-between p-2 rounded" style={{ backgroundColor: MEDICAL_COLORS.gray50 }}>
                  <span className="text-xs font-medium" style={{ color: MEDICAL_COLORS.gray600 }}>
                    Niveau
                  </span>
                  <span className="text-sm font-bold" style={{ color: MEDICAL_COLORS.purple }}>
                    {cours.niveau || '-'}
                  </span>
                </div>

                <div className="flex items-center justify-between p-2 rounded" style={{ backgroundColor: MEDICAL_COLORS.gray50 }}>
                  <span className="text-xs font-medium" style={{ color: MEDICAL_COLORS.gray600 }}>
                    Code cours
                  </span>
                  <span className="text-sm font-bold" style={{ color: MEDICAL_COLORS.gray900 }}>
                    {cours.code}
                  </span>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* BOUTON RETOUR BAS DE PAGE */}
        <div className="mt-8 text-center">
          <button
            onClick={() => navigate('/etudiant/dashboard')}
            className="px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity"
            style={{ backgroundColor: MEDICAL_COLORS.primary, color: 'white' }}
          >
            ← Retour à mes cours
          </button>
        </div>
      </div>
    </div>
  );
}