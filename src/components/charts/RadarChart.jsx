import { RadarChart as RechartsRadar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { MEDICAL_COLORS, CHART_DEFAULTS, formatters } from '../../utils/chartConfig';

/**
 * 🎯 Composant RadarChart - Graphique radar
 * Usage : Comparaison multi-dimensionnelle
 */
export default function RadarChart({ 
  data, 
  dataKey, 
  subjectKey, 
  title, 
  color = MEDICAL_COLORS.primary,
  height = 300,
  formatter = formatters.number,
  showLegend = true 
}) {
  
  if (!data || data.length === 0) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        {title && <h3 className="text-lg font-bold mb-4 text-gray-800">{title}</h3>}
        <div className="flex items-center justify-center h-64 text-gray-400">
          <div className="text-center">
            <span className="text-4xl mb-2 block">🎯</span>
            <p>Aucune donnée disponible</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
      {title && (
        <h3 className="text-lg font-bold mb-4 text-gray-800 flex items-center gap-2">
          <span className="text-2xl">🎯</span>
          {title}
        </h3>
      )}
      <ResponsiveContainer width="100%" height={height}>
        <RechartsRadar data={data}>
          <PolarGrid stroke={CHART_DEFAULTS.grid.stroke} />
          <PolarAngleAxis 
            dataKey={subjectKey}
            tick={{ fill: '#6B7280', fontSize: 12 }}
          />
          <PolarRadiusAxis 
            angle={90}
            tick={{ fill: '#6B7280', fontSize: 12 }}
          />
          <Radar 
            name={dataKey}
            dataKey={dataKey} 
            stroke={color} 
            fill={color} 
            fillOpacity={0.6}
            animationDuration={CHART_DEFAULTS.animation.duration}
          />
          <Tooltip 
            contentStyle={CHART_DEFAULTS.tooltip.contentStyle}
            formatter={formatter}
          />
          {showLegend && <Legend />}
        </RechartsRadar>
      </ResponsiveContainer>
    </div>
  );
}