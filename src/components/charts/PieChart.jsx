import { PieChart as RechartsPie, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { MEDICAL_COLORS, CHART_DEFAULTS } from '../../utils/chartConfig';

/**
 * 🍰 Composant PieChart - Graphique circulaire
 * Usage : Répartition en pourcentages
 */
export default function PieChart({ 
  data, 
  dataKey, 
  nameKey, 
  title, 
  colors = null,
  height = 300,
  showPercentage = true,
  innerRadius = 0, // Pour donut chart
  showLegend = true 
}) {
  
  if (!data || data.length === 0) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        {title && <h3 className="text-lg font-bold mb-4 text-gray-800">{title}</h3>}
        <div className="flex items-center justify-center h-64 text-gray-400">
          <div className="text-center">
            <span className="text-4xl mb-2 block">🍰</span>
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

  const pieColors = colors || defaultColors;

  // Calcul du total pour les pourcentages
  const total = data.reduce((sum, entry) => sum + entry[dataKey], 0);

  const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    if (!showPercentage) return null;
    
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * Math.PI / 180);
    const y = cy + radius * Math.sin(-midAngle * Math.PI / 180);

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        className="font-bold text-sm"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
      {title && (
        <h3 className="text-lg font-bold mb-4 text-gray-800 flex items-center gap-2">
          <span className="text-2xl">🍰</span>
          {title}
        </h3>
      )}
      <ResponsiveContainer width="100%" height={height}>
        <RechartsPie>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderCustomLabel}
            outerRadius={100}
            innerRadius={innerRadius}
            fill="#8884d8"
            dataKey={dataKey}
            animationDuration={CHART_DEFAULTS.animation.duration}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={CHART_DEFAULTS.tooltip.contentStyle}
            formatter={(value) => `${value} (${((value / total) * 100).toFixed(1)}%)`}
          />
          {showLegend && <Legend />}
        </RechartsPie>
      </ResponsiveContainer>
    </div>
  );
}