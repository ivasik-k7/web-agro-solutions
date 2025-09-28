export interface Point {
    x: number;
    y: number;
}

export interface LatLng {
    lat: number;
    lng: number;
}

export interface SoilAnalysis {
    phLevel: number;
    nitrogen: number;
    phosphorus: number;
    potassium: number;
    organicMatter: number;
    salinity: number;
    moisture: number;
}

export interface CropRotation {
    previousCrop: string;
    currentCrop: string;
    nextCrop: string;
    rotationYear: number;
}

export interface IrrigationSchedule {
    frequency: 'daily' | 'weekly' | 'custom';
    duration: number; // minutes
    waterAmount: number; // liters
    lastIrrigation: Date;
    nextIrrigation: Date;
}

export interface FertilizationPlan {
    type: string;
    amount: number; // kg/hectare
    applicationDate: Date;
    method: 'broadcast' | 'foliar' | 'drip';
}

export interface PestManagement {
    pests: string[];
    lastTreatment: Date;
    nextTreatment: Date;
    productsUsed: string[];
    severity: 'low' | 'medium' | 'high';
}

export interface HarvestPlan {
    estimatedDate: Date;
    expectedYield: number; // tons
    equipmentNeeded: string[];
    laborRequired: number; // person-hours
    storageRequirements: string;
}

export interface FieldBoundary {
    id: string;
    name: string;
    type: 'field' | 'irrigation' | 'boundary' | 'crop_area' | 'greenhouse' | 'orchard' | 'pasture';
    points: Point[];
    geoPoints?: LatLng[];
    color: string;
    
    // Basic Information
    cropType?: string;
    variety?: string;
    area?: number;
    notes?: string;
    
    // Temporal Data
    plantingDate?: Date;
    harvestDate?: Date;
    growthStage?: 'germination' | 'vegetative' | 'flowering' | 'fruiting' | 'maturity' | 'planning';
    
    // Soil and Environment
    soilType?: string;
    soilAnalysis?: SoilAnalysis;
    elevation?: number;
    slope?: number;
    
    // Health Metrics
    health?: number;
    ndvi?: number; // Normalized Difference Vegetation Index
    stressLevel?: number;
    
    // Yield and Production
    expectedYield?: number;
    historicalYields?: number[];
    qualityGrade?: 'premium' | 'standard' | 'commercial';
    
    // Management Plans
    irrigation?: IrrigationSchedule;
    fertilization?: FertilizationPlan[];
    pestManagement?: PestManagement;
    harvestPlan?: HarvestPlan;
    cropRotation?: CropRotation;
    
    // Economic Data
    inputCosts?: number;
    expectedRevenue?: number;
    profitMargin?: number;
}

export interface WeatherData {
    temperature: number;
    humidity: number;
    rainfall: number;
    windSpeed: number;
    solarRadiation: number;
    forecast: {
        date: Date;
        condition: 'sunny' | 'cloudy' | 'rainy' | 'stormy';
        tempMin: number;
        tempMax: number;
    }[];
}

export interface ResourceAllocation {
    water: number;
    fertilizer: number;
    labor: number;
    equipment: string[];
    budget: number;
}

export interface Task {
    id: string;
    title: string;
    description: string;
    type: 'planting' | 'harvesting' | 'irrigation' | 'fertilization' | 'pest_control' | 'maintenance';
    priority: 'low' | 'medium' | 'high' | 'critical';
    status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
    assignedTo: string;
    dueDate: Date;
    completedDate?: Date;
    estimatedDuration: number; // hours
    actualDuration?: number;
    dependencies?: string[];
    fieldId: string;
    equipmentNeeded: string[];
    materials?: string[];
    notes?: string;
}

export interface FieldRecord {
    id: string;
    farmName: string;
    season: string;
    timestamp: Date;
    fields: FieldBoundary[];
    center: LatLng;
    zoom: number;
    totalArea: number;
    estimatedYield?: number;
    weather?: WeatherData;
    tasks?: Task[];
}

export type DrawingTool = 'select' | 'rectangle' | 'circle' | 'triangle' | 'polygon' | 'freehand' | 'pan' | 'measure';
export type ViewMode = 'map' | 'analytics' | 'planning';
export type AreaPattern = 'grid' | 'hexagon' | 'contour' | 'radial' | 'parallel';
export type CropStage = 'planning' | 'planted' | 'growing' | 'harvesting' | 'completed';