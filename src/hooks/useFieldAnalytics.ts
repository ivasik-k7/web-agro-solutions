import { useMemo } from 'react';
import type { FieldBoundary } from '@/types';

interface CropDistribution {
    crop: string;
    area: number;
    yield: number;
    fields: number;
    yieldPerAcre: number;
    profitPerAcre?: number;
    efficiencyScore: number;
    trend: 'up' | 'down' | 'stable';
}

interface SoilDistribution {
    soil: string;
    area: number;
    fields: number;
    averageHealth: number;
    qualityScore: number;
    suitability: 'high' | 'medium' | 'low';
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
        efficiency: number;
        color: string;
    };
}

interface PerformanceMetrics {
    overallHealthScore: number;
    yieldEfficiency: number;
    healthyFieldsCount: number;
    totalProductivity: number;
    soilQualityIndex: number;
    economicEfficiency: number;
    sustainabilityScore: number;
    riskAssessment: 'low' | 'medium' | 'high';
}

interface EconomicMetrics {
    totalRevenue: number;
    totalCosts: number;
    profitMargin: number;
    roi: number;
    costPerAcre: number;
    revenuePerAcre: number;
}

interface FieldAnalytics {
    // Basic Metrics
    totalYield: number;
    avgHealth: number;
    totalArea: number;
    totalFields: number;
    
    // Enhanced Distributions
    cropDistribution: CropDistribution[];
    soilDistribution: SoilDistribution[];
    healthDistribution: HealthDistribution;
    fieldTypeDistribution: FieldTypeDistribution;
    
    // Performance Metrics
    performance: PerformanceMetrics;
    economic: EconomicMetrics;
    
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
    bestPerformingSoil?: string;
    
    // Trends and Insights
    trends: {
        health: 'improving' | 'declining' | 'stable';
        yield: 'increasing' | 'decreasing' | 'stable';
        efficiency: 'improving' | 'declining' | 'stable';
    };
    insights: string[];
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

        // Economic Calculations
        const totalRevenue = fields.reduce((sum, field) => sum + (field.expectedRevenue || 0), 0);
        const totalCosts = fields.reduce((sum, field) => sum + (field.inputCosts || 0), 0);
        const profitMargin = totalRevenue > 0 ? ((totalRevenue - totalCosts) / totalRevenue) * 100 : 0;
        const roi = totalCosts > 0 ? ((totalRevenue - totalCosts) / totalCosts) * 100 : 0;

        // Enhanced Crop Distribution
        const cropDistribution = fields.reduce((acc, field) => {
            if (field.cropType) {
                const existing = acc.find(item => item.crop === field.cropType);
                const fieldYield = (field.expectedYield || 0) * (field.area || 0);
                const yieldPerAcre = field.area ? fieldYield / field.area : 0;
                const profitPerAcre = field.area ? ((field.expectedRevenue || 0) - (field.inputCosts || 0)) / field.area : 0;
                const efficiencyScore = calculateCropEfficiency(field);

                if (existing) {
                    existing.area += field.area || 0;
                    existing.yield += fieldYield;
                    existing.fields++;
                    existing.yieldPerAcre = existing.area ? existing.yield / existing.area : 0;
                    existing.profitPerAcre = existing.area ? ((existing.profitPerAcre || 0) + profitPerAcre) / 2 : profitPerAcre;
                    existing.efficiencyScore = (existing.efficiencyScore + efficiencyScore) / 2;
                } else {
                    acc.push({
                        crop: field.cropType,
                        area: field.area || 0,
                        yield: fieldYield,
                        fields: 1,
                        yieldPerAcre,
                        profitPerAcre,
                        efficiencyScore,
                        trend: Math.random() > 0.5 ? 'up' : 'stable' // Mock trend
                    });
                }
            }
            return acc;
        }, [] as CropDistribution[]);

        // Enhanced Soil Distribution
        const soilDistribution = fields.reduce((acc, field) => {
            if (field.soilType) {
                const existing = acc.find(item => item.soil === field.soilType);
                const soilFields = fields.filter(f => f.soilType === field.soilType);
                const averageHealth = soilFields.reduce((sum, f) => sum + (f.health || 0), 0) / soilFields.length;
                const qualityScore = calculateSoilQualityScore(field.soilType);
                const suitability = calculateSoilSuitability(qualityScore, averageHealth);

                if (existing) {
                    existing.area += field.area || 0;
                    existing.fields++;
                    existing.averageHealth = averageHealth;
                    existing.qualityScore = qualityScore;
                    existing.suitability = suitability;
                } else {
                    acc.push({
                        soil: field.soilType,
                        area: field.area || 0,
                        fields: soilFields.length,
                        averageHealth,
                        qualityScore,
                        suitability
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

        // Enhanced Field Type Distribution
        const fieldTypeDistribution = fields.reduce((acc, field) => {
            const type = field.type;
            const typeFields = fields.filter(f => f.type === type);
            
            if (!acc[type]) {
                acc[type] = {
                    area: 0,
                    fields: 0,
                    averageYield: 0,
                    averageHealth: 0,
                    efficiency: 0,
                    color: field.color || getDefaultColor(type)
                };
            }
            
            acc[type].area += field.area || 0;
            acc[type].fields++;
            acc[type].averageYield = typeFields.reduce((sum, f) => sum + (f.expectedYield || 0), 0) / typeFields.length;
            acc[type].averageHealth = typeFields.reduce((sum, f) => sum + (f.health || 0), 0) / typeFields.length;
            acc[type].efficiency = calculateFieldTypeEfficiency(typeFields);
            
            return acc;
        }, {} as FieldTypeDistribution);

        // Performance Metrics
        const performance = calculatePerformanceMetrics(fields, healthDistribution, totalYield, totalArea, totalRevenue, totalCosts);

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
            }, { type: '', data: { area: 0, fields: 0, averageYield: 0, averageHealth: 0, efficiency: 0, color: '' } }).type
            : undefined;

        const bestPerformingSoil = soilDistribution.length > 0
            ? soilDistribution.reduce((best, soil) => soil.averageHealth > best.averageHealth ? soil : best).soil
            : undefined;

        const trends = calculatePerformanceTrends(fields, performance);
        const insights = generateAdvancedInsights(fields, performance, cropDistribution, soilDistribution);

          return {
            totalYield,
            avgHealth,
            totalArea,
            totalFields,
            cropDistribution: cropDistribution.sort((a, b) => b.yieldPerAcre - a.yieldPerAcre),
            soilDistribution: soilDistribution.sort((a, b) => b.qualityScore - a.qualityScore),
            healthDistribution,
            fieldTypeDistribution,
            performance,
            economic: {
                totalRevenue,
                totalCosts,
                profitMargin,
                roi,
                costPerAcre: totalArea > 0 ? totalCosts / totalArea : 0,
                revenuePerAcre: totalArea > 0 ? totalRevenue / totalArea : 0
            },
            averageYieldPerAcre,
            healthPercentage,
            mostProductiveCrop,
            largestFieldType,
            bestPerformingSoil,
            trends,
            insights
        };
    }, [fields]);
};

// Enhanced helper functions
const calculateCropEfficiency = (field: FieldBoundary): number => {
    const baseScore = field.health || 50;
    const yieldScore = (field.expectedYield || 0) * 10;
    const soilScore = calculateSoilQualityScore(field.soilType);
    return (baseScore + yieldScore + soilScore) / 3;
};

const calculateSoilSuitability = (qualityScore: number, health: number): 'high' | 'medium' | 'low' => {
    const score = (qualityScore + health) / 2;
    if (score >= 80) return 'high';
    if (score >= 60) return 'medium';
    return 'low';
};

const calculateFieldTypeEfficiency = (fields: FieldBoundary[]): number => {
    if (fields.length === 0) return 0;
    
    const totalEfficiency = fields.reduce((sum, field) => {
        const healthEfficiency = field.health || 0;
        const yieldEfficiency = (field.expectedYield || 0) * 10;
        const soilEfficiency = calculateSoilQualityScore(field.soilType);
        return sum + (healthEfficiency + yieldEfficiency + soilEfficiency) / 3;
    }, 0);
    
    return totalEfficiency / fields.length;
};

const calculatePerformanceMetrics = (
    fields: FieldBoundary[], 
    healthDistribution: HealthDistribution, 
    totalYield: number, 
    totalArea: number,
    totalRevenue: number,
    totalCosts: number
): PerformanceMetrics => {
    const healthyFieldsCount = healthDistribution.excellent + healthDistribution.good;
    
    // Overall Health Score (weighted average)
    const healthScore = fields.reduce((sum, field) => {
        const health = field.health || 0;
        const weight = field.area || 1;
        return sum + (health * weight);
    }, 0) / Math.max(totalArea, 1);

    // Yield Efficiency
    const yieldEfficiency = totalArea > 0 ? totalYield / totalArea : 0;

    // Soil Quality Index
    const soilQualityIndex = fields.reduce((sum, field) => {
        const soilScore = calculateSoilQualityScore(field.soilType);
        return sum + soilScore;
    }, 0) / fields.length;

    // Economic Efficiency
    const economicEfficiency = totalCosts > 0 ? (totalRevenue - totalCosts) / totalCosts : 0;

    // Sustainability Score
    const sustainabilityScore = calculateSustainabilityScore(fields);

    // Risk Assessment
    const riskLevel = calculateRiskAssessment(fields, healthDistribution);

    // Total Productivity
    const totalProductivity = yieldEfficiency * (healthScore / 100);

    return {
        overallHealthScore: Math.min(healthScore, 100),
        yieldEfficiency,
        healthyFieldsCount,
        totalProductivity,
        soilQualityIndex,
        economicEfficiency: economicEfficiency * 100,
        sustainabilityScore,
        riskAssessment: riskLevel
    };
};

const calculateSustainabilityScore = (fields: FieldBoundary[]): number => {
    const scores = fields.map(field => {
        let score = field.health || 50;
        
        // Bonus for good soil practices
        if (field.soilAnalysis?.organicMatter && field.soilAnalysis.organicMatter > 3) score += 10;
        if (field.soilAnalysis?.phLevel && field.soilAnalysis.phLevel >= 6 && field.soilAnalysis.phLevel <= 7) score += 5;
        
        // Penalty for high stress
        if (field.stressLevel && field.stressLevel > 50) score -= 10;
        
        return Math.max(0, Math.min(100, score));
    });
    
    return scores.reduce((sum, score) => sum + score, 0) / scores.length;
};

const calculateRiskAssessment = (fields: FieldBoundary[], healthDistribution: HealthDistribution): 'low' | 'medium' | 'high' => {
    const criticalPercentage = (healthDistribution.critical / fields.length) * 100;
    const poorPercentage = (healthDistribution.poor / fields.length) * 100;
    
    if (criticalPercentage > 20 || poorPercentage > 40) return 'high';
    if (criticalPercentage > 10 || poorPercentage > 20) return 'medium';
    return 'low';
};

const calculateSoilQualityScore = (soilType?: string): number => {
    const soilScores: Record<string, number> = {
        'Loam': 90,
        'Silt Loam': 85,
        'Clay Loam': 75,
        'Sandy Loam': 70,
        'Silt': 80,
        'Clay': 70,
        'Sandy': 60,
        'Mixed': 65,
        'Rocky': 50,
        'Peat': 85
    };
    
    return soilType ? soilScores[soilType] || 50 : 50;
};

const getDefaultColor = (fieldType: string): string => {
    const colors: Record<string, string> = {
        'field': '#00a86b',
        'irrigation': '#00b8d4',
        'boundary': '#ffab00',
        'crop_area': '#7c4dff',
        'greenhouse': '#00e676',
        'orchard': '#ff9100',
        'pasture': '#29b6f6'
    };
    return colors[fieldType] || '#666666';
};

const calculatePerformanceTrends = (
    _fields: FieldBoundary[], 
    performance: PerformanceMetrics
): {
    health: 'improving' | 'declining' | 'stable';
    yield: 'increasing' | 'decreasing' | 'stable';
    efficiency: 'improving' | 'declining' | 'stable';
} => {
    return {
        health: performance.overallHealthScore > 75 ? 'improving' : performance.overallHealthScore > 50 ? 'stable' : 'declining',
        yield: performance.yieldEfficiency > 3 ? 'increasing' : performance.yieldEfficiency > 1.5 ? 'stable' : 'decreasing',
        efficiency: performance.economicEfficiency > 20 ? 'improving' : 'stable'
    };
};
const generateAdvancedInsights = (
    _fields: FieldBoundary[], 
    performance: PerformanceMetrics,
    crops: CropDistribution[],
    soils: SoilDistribution[]
): string[] => {
    const insights: string[] = [];
    
    if (performance.overallHealthScore < 60) {
        insights.push('🔴 Overall field health is below optimal. Consider soil amendments and improved irrigation.');
    }
    
    if (performance.yieldEfficiency < 2) {
        insights.push('🟡 Yield efficiency can be improved. Review fertilization and crop rotation strategies.');
    }
    
    if (performance.riskAssessment === 'high') {
        insights.push('🚨 High-risk fields detected. Immediate intervention recommended for critical areas.');
    }
    
    const bestCrop = crops.length > 0 ? crops[0] : null;
    const worstCrop = crops.length > 0 ? crops[crops.length - 1] : null;
    
    if (bestCrop && worstCrop && bestCrop.yieldPerAcre > worstCrop.yieldPerAcre * 2) {
        insights.push(`📊 Significant performance gap between ${bestCrop.crop} and ${worstCrop.crop}. Consider reallocating resources.`);
    }
    
    const lowSuitabilitySoils = soils.filter(soil => soil.suitability === 'low');
    if (lowSuitabilitySoils.length > 0) {
        insights.push(`🌱 ${lowSuitabilitySoils.length} soil types have low suitability. Consider soil improvement or crop changes.`);
    }
    
    if (performance.economicEfficiency > 25) {
        insights.push('💰 Excellent economic efficiency! Current practices are highly profitable.');
    }
    
    if (insights.length === 0) {
        insights.push('✅ All systems operating optimally. Maintain current agricultural practices.');
    }
    
    return insights.slice(0, 5); // Limit to 5 insights
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
        soilQualityIndex: 0,
        economicEfficiency: 0,
        sustainabilityScore: 0,
        riskAssessment: 'low'
    },
    economic: {
        totalRevenue: 0,
        totalCosts: 0,
        profitMargin: 0,
        roi: 0,
        costPerAcre: 0,
        revenuePerAcre: 0
    },
    averageYieldPerAcre: 0,
    healthPercentage: {
        excellent: 0,
        good: 0,
        average: 0,
        poor: 0,
        critical: 0
    },
    trends: {
        health: 'stable',
        yield: 'stable',
        efficiency: 'stable'
    },
    insights: ['No field data available. Start by creating fields to see analytics.']
});

// Enhanced utility hooks
export const useCropAnalytics = (fields: FieldBoundary[]) => {
    const analytics = useFieldAnalytics(fields);
    
    return useMemo(() => ({
        crops: analytics.cropDistribution,
        mostProductive: analytics.mostProductiveCrop,
        totalYield: analytics.totalYield,
        averageYieldPerAcre: analytics.averageYieldPerAcre,
        economicMetrics: analytics.economic
    }), [analytics]);
};

export const useSoilAnalytics = (fields: FieldBoundary[]) => {
    const analytics = useFieldAnalytics(fields);
    
    return useMemo(() => ({
        soils: analytics.soilDistribution,
        qualityIndex: analytics.performance.soilQualityIndex,
        bestPerformingSoil: analytics.bestPerformingSoil,
        suitabilityAnalysis: analytics.soilDistribution.map(soil => ({
            soil: soil.soil,
            suitability: soil.suitability,
            recommendation: getSoilRecommendation(soil)
        }))
    }), [analytics]);
};

export const useHealthAnalytics = (fields: FieldBoundary[]) => {
    const analytics = useFieldAnalytics(fields);
    
    return useMemo(() => ({
        distribution: analytics.healthDistribution,
        percentages: analytics.healthPercentage,
        overallScore: analytics.performance.overallHealthScore,
        healthyFields: analytics.performance.healthyFieldsCount,
        riskLevel: analytics.performance.riskAssessment,
        trends: analytics.trends.health
    }), [analytics]);
};

export const usePerformanceAnalytics = (fields: FieldBoundary[]) => {
    const analytics = useFieldAnalytics(fields);
    
    return useMemo(() => ({
        metrics: analytics.performance,
        economic: analytics.economic,
        trends: analytics.trends,
        recommendations: analytics.insights,
        sustainability: analytics.performance.sustainabilityScore
    }), [analytics]);
};

export const useEconomicAnalytics = (fields: FieldBoundary[]) => {
    const analytics = useFieldAnalytics(fields);
    
    return useMemo(() => ({
        ...analytics.economic,
        efficiency: analytics.performance.economicEfficiency,
        bestPerformingCrop: analytics.cropDistribution.length > 0 
            ? analytics.cropDistribution.reduce((best, crop) => 
                (crop.profitPerAcre || 0) > (best.profitPerAcre || 0) ? crop : best
            )
            : null
    }), [analytics]);
};

const getSoilRecommendation = (soil: SoilDistribution): string => {
    switch (soil.suitability) {
        case 'high':
            return 'Ideal soil conditions. Maintain current practices.';
        case 'medium':
            return 'Good soil with room for improvement. Consider organic amendments.';
        case 'low':
            return 'Soil requires significant improvement. Consult agronomist.';
        default:
            return 'Soil assessment needed.';
    }
};