export const CROP_TYPES = [
    'Corn', 'Wheat', 'Soybeans', 'Rice', 'Cotton', 'Potatoes', 'Tomatoes',
    'Lettuce', 'Carrots', 'Beans', 'Other'
];

export const SOIL_TYPES = [
    'Clay', 'Sandy', 'Loam', 'Silt', 'Rocky', 'Mixed'
];

export const AREA_TYPES = [
    'field', 'irrigation', 'boundary', 'crop_area', 'greenhouse', 'orchard', 'pasture'
];

export const QUALITY_GRADES = [
    { value: 'premium', label: '⭐ Premium' },
    { value: 'standard', label: '✅ Standard' },
    { value: 'commercial', label: '📦 Commercial' }
];
export const DEFAULT_COLORS = [
    '#00c853', // Field Green
    '#00b8d4', // Irrigation Blue
    '#ffab00', // Boundary Orange
    '#7c4dff', // Crop Area Purple
    '#ff4081'  // Measure Pink
];

export const PATTERN_CONFIGS = {
    grid: { points: 4, description: 'Rectangular grid pattern' },
    hexagon: { points: 6, description: 'Hexagonal honeycomb pattern' },
    contour: { points: 8, description: 'Contour following pattern' },
    radial: { points: 12, description: 'Radial circular pattern' },
    parallel: { points: 4, description: 'Parallel line pattern' }
};

export const TASK_TYPES = {
    planting: { icon: '🌱', color: '#4caf50' },
    harvesting: { icon: '🔪', color: '#ff9800' },
    irrigation: { icon: '💧', color: '#2196f3' },
    fertilization: { icon: '🧪', color: '#9c27b0' },
    pest_control: { icon: '🐛', color: '#f44336' },
    maintenance: { icon: '🔧', color: '#607d8b' }
};

export const GROWTH_STAGES = {
    germination: '🌱 Germination',
    vegetative: '🌿 Vegetative', 
    flowering: '🌼 Flowering',
    fruiting: '🍅 Fruiting',
    maturity: '🌾 Maturity'
} as const;