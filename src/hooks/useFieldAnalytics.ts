import { useMemo } from 'react';
import type { FieldBoundary } from '@/types';

interface CropDistribution {
    crop: string;
    area: number;
    yield: number;
    fields: number;
    yieldPerAcre: number;
}

interface SoilDistribution {
    soil: string;
    area: number;
    fields: number;
    averageHealth: number;
}

interface HealthDistribution {
    excellent: number;
    good: number;
    average: number;
    poor: number;
    critical: number;
}

interface FieldTypeDistribution {
    [key: string]: {
        area: number;
        fields: number;
        averageYield: number;
        averageHealth: number;
    };
}

interface PerformanceMetrics {
    overallHealthScore: number;
    yieldEfficiency: number; // tons per acre
    healthyFieldsCount: number;
    totalProductivity: number; // yield per unit area
    soilQualityIndex: number;
}

interface FieldAnalytics {
    // Basic Metrics
    totalYield: number;
    avgHealth: number;
    totalArea: number;
    totalFields: number;
    
    // Distributions
    cropDistribution: CropDistribution[];
    soilDistribution: SoilDistribution[];
    healthDistribution: HealthDistribution;
    fieldTypeDistribution: FieldTypeDistribution;
    
    // Performance Metrics
    performance: PerformanceMetrics;
    
    // Derived Calculations
    averageYieldPerAcre: number;
    healthPercentage: {
        excellent: number;
        good: number;
        average: number;
        poor: number;
        critical: number;
    };
    mostProductiveCrop?: string;
    largestFieldType?: string;
}

export const useFieldAnalytics = (fields: FieldBoundary[]): FieldAnalytics => {
    return useMemo(() => {
        if (fields.length === 0) {
            return getEmptyAnalytics();
        }

        // Basic Metrics
        const totalYield = fields.reduce((sum, field) => sum + (field.expectedYield || 0) * (field.area || 0), 0);
        const totalArea = fields.reduce((sum, field) => sum + (field.area || 0), 0);
        const totalFields = fields.length;
        const avgHealth = totalFields > 0 ? fields.reduce((sum, field) => sum + (field.health || 0), 0) / totalFields : 0;

        // Crop Distribution with enhanced calculations
        const cropDistribution = fields.reduce((acc, field) => {
            if (field.cropType) {
                const existing = acc.find(item => item.crop === field.cropType);
                const fieldYield = (field.expectedYield || 0) * (field.area || 0);
                const yieldPerAcre = field.area ? fieldYield / field.area : 0;

                if (existing) {
                    existing.area += field.area || 0;
                    existing.yield += fieldYield;
                    existing.fields++;
                    existing.yieldPerAcre = existing.area ? existing.yield / existing.area : 0;
                } else {
                    acc.push({
                        crop: field.cropType,
                        area: field.area || 0,
                        yield: fieldYield,
                        fields: 1,
                        yieldPerAcre
                    });
                }
            }
            return acc;
        }, [] as CropDistribution[]);

        // Soil Distribution with health metrics
        const soilDistribution = fields.reduce((acc, field) => {
            if (field.soilType) {
                const existing = acc.find(item => item.soil === field.soilType);
                
                if (existing) {
                    existing.area += field.area || 0;
                    existing.fields++;
                    // Recalculate average health for this soil type
                    const soilFields = fields.filter(f => f.soilType === field.soilType);
                    existing.averageHealth = soilFields.reduce((sum, f) => sum + (f.health || 0), 0) / soilFields.length;
                } else {
                    const soilFields = fields.filter(f => f.soilType === field.soilType);
                    const averageHealth = soilFields.reduce((sum, f) => sum + (f.health || 0), 0) / soilFields.length;
                    
                    acc.push({
                        soil: field.soilType,
                        area: field.area || 0,
                        fields: 1,
                        averageHealth
                    });
                }
            }
            return acc;
        }, [] as SoilDistribution[]);

        // Health Distribution
        const healthDistribution = {
            excellent: fields.filter(f => (f.health || 0) >= 90).length,
            good: fields.filter(f => (f.health || 0) >= 75 && (f.health || 0) < 90).length,
            average: fields.filter(f => (f.health || 0) >= 60 && (f.health || 0) < 75).length,
            poor: fields.filter(f => (f.health || 0) >= 40 && (f.health || 0) < 60).length,
            critical: fields.filter(f => (f.health || 0) < 40).length
        };

        // Field Type Distribution with enhanced metrics
        const fieldTypeDistribution = fields.reduce((acc, field) => {
            const type = field.type;
            if (!acc[type]) {
                acc[type] = {
                    area: 0,
                    fields: 0,
                    averageYield: 0,
                    averageHealth: 0
                };
            }
            
            acc[type].area += field.area || 0;
            acc[type].fields++;
            
            // Recalculate averages for this type
            const typeFields = fields.filter(f => f.type === type);
            acc[type].averageYield = typeFields.reduce((sum, f) => sum + (f.expectedYield || 0), 0) / typeFields.length;
            acc[type].averageHealth = typeFields.reduce((sum, f) => sum + (f.health || 0), 0) / typeFields.length;
            
            return acc;
        }, {} as FieldTypeDistribution);

        // Performance Metrics
        const performance = calculatePerformanceMetrics(fields, healthDistribution, totalYield, totalArea);

        // Derived Calculations
        const averageYieldPerAcre = totalArea > 0 ? totalYield / totalArea : 0;
        
        const healthPercentage = {
            excellent: (healthDistribution.excellent / totalFields) * 100,
            good: (healthDistribution.good / totalFields) * 100,
            average: (healthDistribution.average / totalFields) * 100,
            poor: (healthDistribution.poor / totalFields) * 100,
            critical: (healthDistribution.critical / totalFields) * 100
        };

        const mostProductiveCrop = cropDistribution.length > 0 
            ? cropDistribution.reduce((max, crop) => crop.yieldPerAcre > max.yieldPerAcre ? crop : max).crop
            : undefined;

        const largestFieldType = Object.entries(fieldTypeDistribution).length > 0
            ? Object.entries(fieldTypeDistribution).reduce((max, [type, data]) => {
                return data.area > max.data.area ? { type, data } : max;
            }, { type: '', data: { area: 0, fields: 0, averageYield: 0, averageHealth: 0 } }).type
            : undefined;

        return {
            totalYield,
            avgHealth,
            totalArea,
            totalFields,
            cropDistribution: cropDistribution.sort((a, b) => b.area - a.area),
            soilDistribution: soilDistribution.sort((a, b) => b.area - a.area),
            healthDistribution,
            fieldTypeDistribution,
            performance,
            averageYieldPerAcre,
            healthPercentage,
            mostProductiveCrop,
            largestFieldType
        };
    }, [fields]);
};

// Helper function to calculate performance metrics
const calculatePerformanceMetrics = (
    fields: FieldBoundary[], 
    healthDistribution: HealthDistribution, 
    totalYield: number, 
    totalArea: number
): PerformanceMetrics => {
    const healthyFieldsCount = healthDistribution.excellent + healthDistribution.good;
    
    // Overall Health Score (weighted average)
    const healthScore = fields.reduce((sum, field) => {
        const health = field.health || 0;
        const weight = field.area || 1; // Weight by area
        return sum + (health * weight);
    }, 0) / Math.max(totalArea, 1);

    // Yield Efficiency
    const yieldEfficiency = totalArea > 0 ? totalYield / totalArea : 0;

    // Soil Quality Index (simplified)
    const soilQualityIndex = fields.reduce((sum, field) => {
        const soilScore = calculateSoilQualityScore(field.soilType);
        return sum + soilScore;
    }, 0) / fields.length;

    // Total Productivity (yield per unit area, normalized)
    const totalProductivity = yieldEfficiency * (healthScore / 100);

    return {
        overallHealthScore: Math.min(healthScore, 100),
        yieldEfficiency,
        healthyFieldsCount,
        totalProductivity,
        soilQualityIndex
    };
};

// Helper function to assign soil quality scores
const calculateSoilQualityScore = (soilType?: string): number => {
    const soilScores: Record<string, number> = {
        'Loam': 90,
        'Silt': 80,
        'Clay': 70,
        'Sandy': 60,
        'Mixed': 65,
        'Rocky': 50
    };
    
    return soilType ? soilScores[soilType] || 50 : 50;
};

// Empty state analytics
const getEmptyAnalytics = (): FieldAnalytics => ({
    totalYield: 0,
    avgHealth: 0,
    totalArea: 0,
    totalFields: 0,
    cropDistribution: [],
    soilDistribution: [],
    healthDistribution: {
        excellent: 0,
        good: 0,
        average: 0,
        poor: 0,
        critical: 0
    },
    fieldTypeDistribution: {},
    performance: {
        overallHealthScore: 0,
        yieldEfficiency: 0,
        healthyFieldsCount: 0,
        totalProductivity: 0,
        soilQualityIndex: 0
    },
    averageYieldPerAcre: 0,
    healthPercentage: {
        excellent: 0,
        good: 0,
        average: 0,
        poor: 0,
        critical: 0
    }
});

// Additional utility hooks for specific analytics

export const useCropAnalytics = (fields: FieldBoundary[]) => {
    const analytics = useFieldAnalytics(fields);
    
    return useMemo(() => ({
        crops: analytics.cropDistribution,
        mostProductive: analytics.mostProductiveCrop,
        totalYield: analytics.totalYield,
        averageYieldPerAcre: analytics.averageYieldPerAcre
    }), [analytics]);
};

export const useSoilAnalytics = (fields: FieldBoundary[]) => {
    const analytics = useFieldAnalytics(fields);
    
    return useMemo(() => ({
        soils: analytics.soilDistribution,
        qualityIndex: analytics.performance.soilQualityIndex,
        bestPerformingSoil: analytics.soilDistribution.length > 0 
            ? analytics.soilDistribution.reduce((best, soil) => 
                soil.averageHealth > best.averageHealth ? soil : best
            ).soil
            : undefined
    }), [analytics]);
};

export const useHealthAnalytics = (fields: FieldBoundary[]) => {
    const analytics = useFieldAnalytics(fields);
    
    return useMemo(() => ({
        distribution: analytics.healthDistribution,
        percentages: analytics.healthPercentage,
        overallScore: analytics.performance.overallHealthScore,
        healthyFields: analytics.performance.healthyFieldsCount
    }), [analytics]);
};

export const usePerformanceAnalytics = (fields: FieldBoundary[]) => {
    const analytics = useFieldAnalytics(fields);
    
    return useMemo(() => ({
        metrics: analytics.performance,
        trends: calculatePerformanceTrends(analytics),
        recommendations: generateRecommendations(analytics)
    }), [analytics]);
};

// Trend calculation helper
const calculatePerformanceTrends = (analytics: FieldAnalytics) => {
    // This would typically compare with historical data
    // For now, returning mock trends based on current metrics
    return {
        health: analytics.avgHealth > 75 ? 'improving' : analytics.avgHealth > 50 ? 'stable' : 'declining',
        yield: analytics.averageYieldPerAcre > 3 ? 'high' : analytics.averageYieldPerAcre > 1.5 ? 'moderate' : 'low',
        efficiency: analytics.performance.yieldEfficiency > 2 ? 'excellent' : 'good'
    };
};

// Recommendation engine
const generateRecommendations = (analytics: FieldAnalytics): string[] => {
    const recommendations: string[] = [];
    
    if (analytics.avgHealth < 60) {
        recommendations.push('Consider soil testing and nutrient management for low-health fields');
    }
    
    if (analytics.performance.yieldEfficiency < 1.5) {
        recommendations.push('Review irrigation and fertilization practices to improve yield efficiency');
    }
    
    if (analytics.healthDistribution.critical > 0) {
        recommendations.push(`${analytics.healthDistribution.critical} fields need immediate attention`);
    }
    
    if (analytics.soilDistribution.some(soil => soil.averageHealth < 50)) {
        recommendations.push('Some soil types show poor performance - consider crop rotation');
    }
    
    if (recommendations.length === 0) {
        recommendations.push('All systems operating optimally - maintain current practices');
    }
    
    return recommendations;
};