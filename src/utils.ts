import type { Point, FieldBoundary, SoilAnalysis, Task } from '@/types';

export const transformPoint = (
    point: Point, 
    mapCenter: Point, 
    mapZoom: number, 
    screenWidth: number, 
    screenHeight: number
): Point => {
    return {
        x: (point.x - mapCenter.x) * mapZoom + screenWidth / 2,
        y: (point.y - mapCenter.y) * mapZoom + screenHeight / 2
    };
};

export const inverseTransformPoint = (
    point: Point, 
    mapCenter: Point, 
    mapZoom: number, 
    screenWidth: number, 
    screenHeight: number
): Point => {
    return {
        x: (point.x - screenWidth / 2) / mapZoom + mapCenter.x,
        y: (point.y - screenHeight / 2) / mapZoom + mapCenter.y
    };
};

export const calculateArea = (points: Point[]): number => {
    if (points.length < 3) return 0;
    
    let area = 0;
    for (let i = 0; i < points.length; i++) {
        const j = (i + 1) % points.length;
        area += points[i].x * points[j].y;
        area -= points[j].x * points[i].y;
    }
    
    return Math.abs(area) / 2;
};

export const generateRectanglePoints = (start: Point, end: Point): Point[] => {
    return [
        start,
        { x: end.x, y: start.y },
        end,
        { x: start.x, y: end.y }
    ];
};

export const generateCirclePoints = (center: Point, radius: number, segments: number = 24): Point[] => {
    const points: Point[] = [];
    for (let i = 0; i < segments; i++) {
        const angle = (i / segments) * 2 * Math.PI;
        points.push({
            x: center.x + radius * Math.cos(angle),
            y: center.y + radius * Math.sin(angle)
        });
    }
    return points;
};

export const generateTrianglePoints = (start: Point, end: Point): Point[] => {
    const width = Math.abs(end.x - start.x);
    const height = Math.abs(end.y - start.y);

    return [
        start,
        { x: start.x + width, y: start.y },
        { x: start.x + width / 2, y: start.y - height }
    ];
};

export const getHealthStatus = (health: number): string => {
    if (health >= 90) return 'Excellent';
    if (health >= 75) return 'Good';
    if (health >= 60) return 'Average';
    if (health >= 40) return 'Poor';
    return 'Critical';
};

export const calculateSoilQuality = (soil: SoilAnalysis): number => {
    const factors = {
        ph: soil.phLevel >= 6.0 && soil.phLevel <= 7.5 ? 1 : 0.5,
        nitrogen: soil.nitrogen > 20 ? 1 : soil.nitrogen > 10 ? 0.7 : 0.3,
        phosphorus: soil.phosphorus > 15 ? 1 : soil.phosphorus > 8 ? 0.7 : 0.3,
        potassium: soil.potassium > 150 ? 1 : soil.potassium > 100 ? 0.7 : 0.3,
        organicMatter: soil.organicMatter > 3 ? 1 : soil.organicMatter > 1.5 ? 0.7 : 0.3
    };
    
    return Object.values(factors).reduce((sum, factor) => sum + factor, 0) / Object.values(factors).length * 100;
};

export const generateTasksFromField = (field: FieldBoundary): Task[] => {
    const tasks: Task[] = [];
    const today = new Date();
    
    if (field.plantingDate && field.plantingDate > today) {
        tasks.push({
            id: `planting-${field.id}`,
            title: `Plant ${field.cropType} in ${field.name}`,
            description: `Planting ${field.cropType} variety ${field.variety} in field ${field.name}`,
            type: 'planting',
            priority: 'high',
            status: 'pending',
            assignedTo: 'Farm Manager',
            dueDate: field.plantingDate,
            estimatedDuration: field.area ? field.area * 2 : 8,
            fieldId: field.id,
            equipmentNeeded: ['Seeder', 'Tractor'],
            materials: ['Seeds', 'Fertilizer']
        });
    }
    
    if (field.harvestDate) {
        tasks.push({
            id: `harvest-${field.id}`,
            title: `Harvest ${field.cropType} from ${field.name}`,
            description: `Harvesting ${field.cropType} from field ${field.name}`,
            type: 'harvesting',
            priority: 'high',
            status: 'pending',
            assignedTo: 'Harvest Team',
            dueDate: field.harvestDate,
            estimatedDuration: field.area ? field.area * 4 : 16,
            fieldId: field.id,
            equipmentNeeded: ['Harvester', 'Trucks'],
            materials: ['Storage Bins']
        });
    }
    
    // Add irrigation tasks
    if (field.irrigation) {
        tasks.push({
            id: `irrigate-${field.id}-${today.getTime()}`,
            title: `Irrigate ${field.name}`,
            description: `Scheduled irrigation for ${field.name}`,
            type: 'irrigation',
            priority: 'medium',
            status: 'pending',
            assignedTo: 'Irrigation Team',
            dueDate: field.irrigation.nextIrrigation,
            estimatedDuration: field.irrigation.duration / 60,
            fieldId: field.id,
            equipmentNeeded: ['Irrigation System'],
            materials: []
        });
    }
    
    return tasks;
};

export const calculateResourceRequirements = (fields: FieldBoundary[]): any => {
    const resources = {
        water: 0,
        fertilizer: 0,
        labor: 0,
        equipment: new Set<string>(),
        budget: 0
    };
    
    fields.forEach(field => {
        if (field.area) {
            resources.water += field.area * 1000; // liters per acre
            resources.fertilizer += field.area * 50; // kg per acre
            resources.labor += field.area * 2; // hours per acre
            resources.budget += field.area * 500; // $ per acre
            
            // if (field.equipmentNeeded) {
            //     field.equipmentNeeded.forEach(equip => resources.equipment.add(equip));
            // }
        }
    });
    
    return {
        ...resources,
        equipment: Array.from(resources.equipment)
    };
};