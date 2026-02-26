import { BarChart as RechartsBar, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { MEDICAL_COLORS, CHART_DEFAULTS, formatters } from '../../utils/chartConfig';

/**
 * 📊 Composant BarChart - Graphique en barres
 * Usage : Comparaisons entre catégories
 */
export default function BarChart({ 
  data, 
  dataKey, 
  xKey, 
  title, 
  color = MEDICAL_COLORS.primary,
  colors = null, // Tableau de couleurs pour chaque barre
  height = 300,
  formatter = formatters.number,
  showLegend = true,
  horizontal = false 
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

  const defaultColors = [
    MEDICAL_COLORS.chart1,
    MEDICAL_COLORS.chart2,
    MEDICAL_COLORS.chart3,
    MEDICAL_COLORS.chart4,
    MEDICAL_COLORS.chart5,
    MEDICAL_COLORS.chart6,
  ];

  const barColors = colors || defaultColors;

  const ChartComponent = horizontal ? RechartsBar : RechartsBar;

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
      {title && (
        <h3 className="text-lg font-bold mb-4 text-gray-800 flex items-center gap-2">
          <span className="text-2xl">📊</span>
          {title}
        </h3>
      )}
      <ResponsiveContainer width="100%" height={height}>
        <ChartComponent 
          data={data} 
          margin={CHART_DEFAULTS.margin}
          layout={horizontal ? 'vertical' : 'horizontal'}
        >
          <CartesianGrid 
            strokeDasharray={CHART_DEFAULTS.grid.strokeDasharray}
            stroke={CHART_DEFAULTS.grid.stroke}
          />
          {horizontal ? (
            <>
              <XAxis type="number" tick={{ fill: '#6B7280', fontSize: 12 }} />
              <YAxis type="category" dataKey={xKey} tick={{ fill: '#6B7280', fontSize: 12 }} width={100} />
            </>
          ) : (
            <>
              <XAxis dataKey={xKey} tick={{ fill: '#6B7280', fontSize: 12 }} />
              <YAxis tick={{ fill: '#6B7280', fontSize: 12 }} />
            </>
          )}
          <Tooltip 
            contentStyle={CHART_DEFAULTS.tooltip.contentStyle}
            formatter={formatter}
          />
          {showLegend && <Legend wrapperStyle={{ paddingTop: '20px' }} />}
          <Bar 
            dataKey={dataKey} 
            fill={color}
            radius={[8, 8, 0, 0]}
            animationDuration={CHART_DEFAULTS.animation.duration}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={barColors[index % barColors.length]} />
            ))}
          </Bar>
        </ChartComponent>
      </ResponsiveContainer>
    </div>
  );
}