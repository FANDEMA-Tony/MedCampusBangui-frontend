import { useState, useEffect } from 'react';
import { donneeSanitaireService } from '../../services/api';

const COLORS = {
  primary: '#0066CC',
  success: '#00A86B',
  danger: '#DC143C',
  warning: '#FF6B35',
  purple: '#7C3AED',
  yellow: '#FCD34D',
};

export default function StatistiquesPanel() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetchStatistiques();
  }, []);

  const fetchStatistiques = async () => {
    try {
      setLoading(true);
      const response = await donneeSanitaireService.getStatistiques();
      setStats(response.data.data);
    } catch (err) {
      console.error('Erreur stats:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-16">
        <div
          className="inline-block animate-spin rounded-full h-12 w-12 border-b-2"
          style={{ borderColor: COLORS.primary }}
        ></div>
        <p className="text-gray-500 mt-4">Chargement des statistiques...</p>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-16 bg-white rounded-2xl shadow-sm">
        <p className="text-5xl mb-4">📊</p>
        <p className="text-xl font-semibold text-gray-700">Aucune statistique disponible</p>
      </div>
    );
  }

  const calculatePercentage = (value, total) => {
    if (total === 0) return 0;
    return Math.round((value / total) * 100);
  };

  return (
    <div className="space-y-6">
      
      {/* ===== CARTES RÉCAPITULATIVES ===== */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon="📊"
          label="Total cas"
          value={stats.total_cas}
          color={COLORS.primary}
        />
        <StatCard
          icon="⏳"
          label="En cours"
          value={stats.cas_en_cours}
          color={COLORS.warning}
        />
        <StatCard
          icon="✅"
          label="Guérisons"
          value={stats.cas_gueris}
          color={COLORS.success}
        />
        <StatCard
          icon="🔴"
          label="Cas graves"
          value={stats.cas_graves}
          color={COLORS.danger}
        />
      </div>

      {/* ===== PAR GRAVITÉ ===== */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4">
          📈 Répartition par gravité
        </h3>
        <div className="space-y-3">
          {stats.par_gravite?.map((item) => {
            const config = {
              leger: { icon: '🟢', color: COLORS.success, label: 'Léger' },
              modere: { icon: '🟡', color: COLORS.warning, label: 'Modéré' },
              grave: { icon: '🟠', color: '#F97316', label: 'Grave' },
              critique: { icon: '🔴', color: COLORS.danger, label: 'Critique' },
            }[item.gravite];

            const percentage = calculatePercentage(item.total, stats.total_cas);

            return (
              <div key={item.gravite}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium text-gray-700">
                    {config?.icon} {config?.label}
                  </span>
                  <span className="text-sm font-bold" style={{ color: config?.color }}>
                    {item.total} ({percentage}%)
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="h-2 rounded-full transition-all"
                    style={{
                      width: `${percentage}%`,
                      backgroundColor: config?.color
                    }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* ===== TOP PATHOLOGIES ===== */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">
            🦠 Top 10 pathologies
          </h3>
          <div className="space-y-2">
            {stats.top_pathologies?.slice(0, 10).map((item, index) => {
              const percentage = calculatePercentage(item.total, stats.total_cas);
              const colors = [
                COLORS.danger, COLORS.warning, COLORS.primary,
                COLORS.success, COLORS.purple, '#6B7280'
              ];
              const color = colors[index % colors.length];

              return (
                <div key={index} className="flex items-center gap-3">
                  <span
                    className="w-8 h-8 flex items-center justify-center rounded-full text-white text-sm font-bold"
                    style={{ backgroundColor: color }}
                  >
                    {index + 1}
                  </span>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-700">{item.pathologie}</p>
                    <div className="w-full bg-gray-100 rounded-full h-1.5 mt-1">
                      <div
                        className="h-1.5 rounded-full"
                        style={{
                          width: `${percentage}%`,
                          backgroundColor: color
                        }}
                      ></div>
                    </div>
                  </div>
                  <span className="text-sm font-bold text-gray-600">
                    {item.total}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* ===== PAR SEXE ===== */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">
            ⚧️ Répartition par sexe
          </h3>
          <div className="space-y-4">
            {stats.par_sexe?.map((item) => {
              const config = {
                M: { icon: '♂️', label: 'Masculin', color: '#0066CC' },
                F: { icon: '♀️', label: 'Féminin', color: '#EC4899' },
                Autre: { icon: '⚧️', label: 'Autre', color: '#7C3AED' },
              }[item.sexe];

              const percentage = calculatePercentage(item.total, stats.total_cas);

              return (
                <div key={item.sexe}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">
                      {config?.icon} {config?.label}
                    </span>
                    <span className="text-sm font-bold" style={{ color: config?.color }}>
                      {item.total} ({percentage}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="h-3 rounded-full transition-all"
                      style={{
                        width: `${percentage}%`,
                        backgroundColor: config?.color
                      }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* ===== PAR TRANCHE D'ÂGE ===== */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">
            🎂 Répartition par âge
          </h3>
          <div className="space-y-3">
            {stats.par_tranche_age?.map((item) => {
              const percentage = calculatePercentage(item.total, stats.total_cas);

              return (
                <div key={item.tranche_age}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium text-gray-700">
                      {item.tranche_age} ans
                    </span>
                    <span className="text-sm font-bold text-gray-600">
                      {item.total} ({percentage}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="h-2 rounded-full"
                      style={{
                        width: `${percentage}%`,
                        backgroundColor: COLORS.primary
                      }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ===== PAR COMMUNE ===== */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">
            📍 Top 5 communes
          </h3>
          <div className="space-y-3">
            {stats.par_commune?.map((item, index) => {
              const percentage = calculatePercentage(item.total, stats.total_cas);
              const colors = [COLORS.danger, COLORS.warning, COLORS.primary, COLORS.success, COLORS.purple];

              return (
                <div key={index}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium text-gray-700">
                      {item.commune}
                    </span>
                    <span className="text-sm font-bold" style={{ color: colors[index] }}>
                      {item.total} ({percentage}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="h-2 rounded-full"
                      style={{
                        width: `${percentage}%`,
                        backgroundColor: colors[index]
                      }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ===== BOUTON RAFRAÎCHIR ===== */}
      <div className="text-center">
        <button
          onClick={fetchStatistiques}
          className="px-6 py-3 rounded-xl text-white font-semibold shadow-lg hover:opacity-90 transition-all"
          style={{ backgroundColor: COLORS.primary }}
        >
          🔄 Rafraîchir les statistiques
        </button>
      </div>
    </div>
  );
}

// Composant carte statistique
function StatCard({ icon, label, value, color }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 border-l-4" style={{ borderLeftColor: color }}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500 mb-1">{label}</p>
          <p className="text-3xl font-bold" style={{ color }}>
            {value}
          </p>
        </div>
        <span className="text-4xl">{icon}</span>
      </div>
    </div>
  );
}