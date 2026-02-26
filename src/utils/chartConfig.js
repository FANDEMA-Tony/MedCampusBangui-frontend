// 🎨 Configuration globale des graphiques pour MedCampus
// Couleurs cohérentes avec le design médical existant

export const MEDICAL_COLORS = {
  primary: '#0066CC',
  secondary: '#00A86B',
  accent: '#DC143C',
  purple: '#8B5CF6',
  teal: '#14B8A6',
  orange: '#F97316',
  pink: '#EC4899',
  
  // Couleurs graphiques
  chart1: '#0066CC',
  chart2: '#00A86B',
  chart3: '#8B5CF6',
  chart4: '#F97316',
  chart5: '#14B8A6',
  chart6: '#EC4899',
};

export const CHART_DEFAULTS = {
  margin: { top: 20, right: 30, left: 20, bottom: 5 },
  animation: {
    duration: 500,
    easing: 'ease-in-out'
  },
  grid: {
    strokeDasharray: '3 3',
    stroke: '#E5E7EB'
  },
  tooltip: {
    contentStyle: {
      backgroundColor: 'white',
      border: '1px solid #E5E7EB',
      borderRadius: '8px',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
    }
  }
};

// Formatage des valeurs pour les tooltips
export const formatters = {
  number: (value) => Number(value).toFixed(2),
  percentage: (value) => `${Number(value).toFixed(1)}%`,
  date: (value) => new Date(value).toLocaleDateString('fr-FR'),
};

// Configuration responsive
export const RESPONSIVE_CONFIG = {
  desktop: { width: '100%', height: 400 },
  tablet: { width: '100%', height: 300 },
  mobile: { width: '100%', height: 250 }
};