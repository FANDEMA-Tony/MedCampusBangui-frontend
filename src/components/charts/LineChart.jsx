import { LineChart as RechartsLine, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { MEDICAL_COLORS, CHART_DEFAULTS, formatters } from '../../utils/chartConfig';

/**
 * 📈 Composant LineChart - Graphique en ligne
 * Usage : Évolution dans le temps (notes, inscriptions, etc.)
 */
export default function LineChart({ 
  data, 
  dataKey, 
  xKey, 
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
            <span className="text-4xl mb-2 block">📊</span>
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
          <span className="text-2xl">📈</span>
          {title}
        </h3>
      )}
      <ResponsiveContainer width="100%" height={height}>
        <RechartsLine 
          data={data} 
          margin={CHART_DEFAULTS.margin}
        >
          <CartesianGrid 
            strokeDasharray={CHART_DEFAULTS.grid.strokeDasharray}
            stroke={CHART_DEFAULTS.grid.stroke}
          />
          <XAxis 
            dataKey={xKey}
            tick={{ fill: '#6B7280', fontSize: 12 }}
            axisLine={{ stroke: '#E5E7EB' }}
          />
          <YAxis 
            tick={{ fill: '#6B7280', fontSize: 12 }}
            axisLine={{ stroke: '#E5E7EB' }}
          />
          <Tooltip 
            contentStyle={CHART_DEFAULTS.tooltip.contentStyle}
            formatter={formatter}
          />
          {showLegend && <Legend wrapperStyle={{ paddingTop: '20px' }} />}
          <Line 
            type="monotone" 
            dataKey={dataKey} 
            stroke={color} 
            strokeWidth={3}
            dot={{ fill: color, r: 5 }}
            activeDot={{ r: 7 }}
            animationDuration={CHART_DEFAULTS.animation.duration}
          />
        </RechartsLine>
      </ResponsiveContainer>
    </div>
  );
}