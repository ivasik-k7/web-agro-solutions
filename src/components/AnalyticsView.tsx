import React from 'react';
import "@styles/AnalyticsView.css"
import type { FieldBoundary } from '@/types';
import { useFieldAnalytics, useCropAnalytics, useHealthAnalytics, usePerformanceAnalytics } from '@/hooks/useFieldAnalytics';

interface AnalyticsViewProps {
    fields: FieldBoundary[];
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ fields }) => {
    const analytics = useFieldAnalytics(fields);
    const cropAnalytics = useCropAnalytics(fields);
    const healthAnalytics = useHealthAnalytics(fields);
    const performanceAnalytics = usePerformanceAnalytics(fields);

    const getHealthColor = (health: number) => {
        if (health >= 90) return 'var(--success)';
        if (health >= 75) return 'var(--health-good)';
        if (health >= 60) return 'var(--health-average)';
        if (health >= 40) return 'var(--health-poor)';
        return 'var(--error)';
    };

    const getHealthStatusColor = (status: string) => {
        switch (status) {
            case 'excellent': return 'var(--health-excellent)';
            case 'good': return 'var(--health-good)';
            case 'average': return 'var(--health-average)';
            case 'poor': return 'var(--health-poor)';
            case 'critical': return 'var(--health-critical)';
            default: return 'var(--agro-secondary)';
        }
    };

    return (
        <div className="analytics-view">
            <div className="analytics-header">
                <h2>📊 Farm Analytics Dashboard</h2>
                <p>Comprehensive insights and performance metrics</p>
            </div>

            {/* Key Metrics Grid */}
            <div className="analytics-stats">
                <div className="stat-card primary">
                    <div className="stat-icon">🌾</div>
                    <div className="stat-content">
                        <div className="stat-value">{analytics.totalYield.toFixed(1)}</div>
                        <div className="stat-label">Total Yield (tons)</div>
                    </div>
                </div>

                <div className="stat-card success">
                    <div className="stat-icon">💚</div>
                    <div className="stat-content">
                        <div className="stat-value">{analytics.avgHealth.toFixed(1)}%</div>
                        <div className="stat-label">Average Health</div>
                    </div>
                </div>

                <div className="stat-card info">
                    <div className="stat-icon">📐</div>
                    <div className="stat-content">
                        <div className="stat-value">{analytics.totalArea.toFixed(1)}</div>
                        <div className="stat-label">Total Area (acres)</div>
                    </div>
                </div>

                <div className="stat-card warning">
                    <div className="stat-icon">🌱</div>
                    <div className="stat-content">
                        <div className="stat-value">{analytics.totalFields}</div>
                        <div className="stat-label">Active Fields</div>
                    </div>
                </div>
            </div>

            {/* Performance Recommendations */}
            {performanceAnalytics.recommendations.length > 0 && (
                <div className="recommendations-section">
                    <h3>💡 Recommendations</h3>
                    <div className="recommendations-grid">
                        {performanceAnalytics.recommendations.map((recommendation, index) => (
                            <div key={index} className="recommendation-card">
                                <div className="recommendation-icon">💡</div>
                                <div className="recommendation-text">{recommendation}</div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Main Analytics Grid */}
            <div className="analytics-grid">
                {/* Crop Distribution */}
                <div className="analytics-card">
                    <div className="card-header">
                        <h3>🌽 Crop Distribution</h3>
                        <span className="card-subtitle">
                            {cropAnalytics.mostProductive && `Most productive: ${cropAnalytics.mostProductive}`}
                        </span>
                    </div>
                    <div className="crop-distribution">
                        {analytics.cropDistribution.map((crop) => (
                            <div key={crop.crop} className="crop-item">
                                <div className="crop-info">
                                    <div className="crop-name">{crop.crop}</div>
                                    <div className="crop-stats">
                                        <span>{crop.area.toFixed(1)} acres</span>
                                        <span>{crop.yield.toFixed(1)} tons</span>
                                        <span>{crop.yieldPerAcre.toFixed(1)} t/ac</span>
                                    </div>
                                </div>
                                <div className="crop-visualization">
                                    <div
                                        className="crop-bar"
                                        style={{
                                            width: `${(crop.area / analytics.totalArea) * 100}%`,
                                            background: getHealthColor(crop.yieldPerAcre * 20)
                                        }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Health Distribution */}
                <div className="analytics-card">
                    <div className="card-header">
                        <h3>💊 Field Health Overview</h3>
                        <span className="card-subtitle">Overall score: {healthAnalytics.overallScore.toFixed(1)}%</span>
                    </div>
                    <div className="health-distribution">
                        {Object.entries(analytics.healthDistribution).map(([status, count]) => (
                            <div key={status} className="health-item">
                                <div className="health-status-info">
                                    <span
                                        className="health-status"
                                        style={{ color: getHealthStatusColor(status) }}
                                    >
                                        {status.toUpperCase()}
                                    </span>
                                    <span className="health-count">
                                        {count} fields ({healthAnalytics.percentages[status as keyof typeof healthAnalytics.percentages].toFixed(1)}%)
                                    </span>
                                </div>
                                <div className="health-bar-container">
                                    <div
                                        className="health-bar"
                                        style={{
                                            width: `${healthAnalytics.percentages[status as keyof typeof healthAnalytics.percentages]}%`,
                                            background: getHealthStatusColor(status)
                                        }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Soil Type Distribution */}
                <div className="analytics-card">
                    <div className="card-header">
                        <h3>🌱 Soil Type Analysis</h3>
                        <span className="card-subtitle">Quality index: {analytics.performance.soilQualityIndex.toFixed(1)}</span>
                    </div>
                    <div className="soil-distribution">
                        {analytics.soilDistribution.map((soil) => (
                            <div key={soil.soil} className="soil-item">
                                <div className="soil-info">
                                    <span className="soil-type">{soil.soil}</span>
                                    <div className="soil-stats">
                                        <span>{soil.area.toFixed(1)} acres</span>
                                        <span>{soil.averageHealth.toFixed(1)}% health</span>
                                    </div>
                                </div>
                                <div className="soil-visualization">
                                    <div
                                        className="soil-bar"
                                        style={{
                                            width: `${(soil.area / analytics.totalArea) * 100}%`,
                                            background: getHealthColor(soil.averageHealth)
                                        }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Field Type Distribution */}
                <div className="analytics-card">
                    <div className="card-header">
                        <h3>🏞️ Field Type Overview</h3>
                        <span className="card-subtitle">
                            {analytics.largestFieldType && `Largest type: ${analytics.largestFieldType}`}
                        </span>
                    </div>
                    <div className="field-type-distribution">
                        {Object.entries(analytics.fieldTypeDistribution).map(([type, data]) => (
                            <div key={type} className="field-type-item">
                                <div className="type-info">
                                    <span className="type-name">{type.replace('_', ' ')}</span>
                                    <div className="type-stats">
                                        <span>{((data.area / analytics.totalArea) * 100).toFixed(1)}%</span>
                                        <span>{data.averageYield.toFixed(1)} t/ac</span>
                                    </div>
                                </div>
                                <div className="type-visualization">
                                    <div
                                        className="type-bar"
                                        style={{
                                            width: `${(data.area / analytics.totalArea) * 100}%`,
                                            background: getHealthColor(data.averageHealth)
                                        }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Performance Indicators */}
            <div className="performance-section">
                <div className="performance-header">
                    <h3>📈 Performance Indicators</h3>
                    <div className="performance-trends">
                        <span className={`trend-indicator ${performanceAnalytics.trends.health}`}>
                            Health: {performanceAnalytics.trends.health}
                        </span>
                        <span className={`trend-indicator ${performanceAnalytics.trends.yield}`}>
                            Yield: {performanceAnalytics.trends.yield}
                        </span>
                        <span className={`trend-indicator ${performanceAnalytics.trends.efficiency}`}>
                            Efficiency: {performanceAnalytics.trends.efficiency}
                        </span>
                    </div>
                </div>
                <div className="performance-grid">
                    <div className="performance-card">
                        <div className="performance-value" style={{ color: getHealthColor(analytics.performance.overallHealthScore) }}>
                            {analytics.performance.overallHealthScore.toFixed(1)}%
                        </div>
                        <div className="performance-label">Overall Health Score</div>
                        <div className="performance-description">
                            Weighted average based on field area and health metrics
                        </div>
                    </div>

                    <div className="performance-card">
                        <div className="performance-value" style={{ color: getHealthColor(analytics.performance.yieldEfficiency * 20) }}>
                            {analytics.performance.yieldEfficiency.toFixed(1)}
                        </div>
                        <div className="performance-label">Yield Efficiency (t/ac)</div>
                        <div className="performance-description">
                            Average yield per acre across all fields
                        </div>
                    </div>

                    <div className="performance-card">
                        <div className="performance-value" style={{ color: getHealthColor((analytics.performance.healthyFieldsCount / analytics.totalFields) * 100) }}>
                            {analytics.performance.healthyFieldsCount}
                        </div>
                        <div className="performance-label">Healthy Fields</div>
                        <div className="performance-description">
                            Fields with good or excellent health status
                        </div>
                    </div>

                    <div className="performance-card">
                        <div className="performance-value" style={{ color: getHealthColor(analytics.performance.soilQualityIndex) }}>
                            {analytics.performance.soilQualityIndex.toFixed(1)}
                        </div>
                        <div className="performance-label">Soil Quality Index</div>
                        <div className="performance-description">
                            Overall soil health assessment score
                        </div>
                    </div>
                </div>
            </div>

            {/* Additional Insights */}
            <div className="insights-section">
                <h3>🔍 Key Insights</h3>
                <div className="insights-grid">
                    <div className="insight-card">
                        <h4>Top Performing Crop</h4>
                        <p>{cropAnalytics.mostProductive || 'No data'}</p>
                        <span>Highest yield per acre</span>
                    </div>

                    <div className="insight-card">
                        <h4>Field Health Distribution</h4>
                        <p>{healthAnalytics.healthyFields} healthy fields</p>
                        <span>{((healthAnalytics.healthyFields / analytics.totalFields) * 100).toFixed(1)}% of total</span>
                    </div>

                    <div className="insight-card">
                        <h4>Productivity</h4>
                        <p>{analytics.averageYieldPerAcre.toFixed(1)} tons/acre</p>
                        <span>Average yield efficiency</span>
                    </div>

                    <div className="insight-card">
                        <h4>Soil Quality</h4>
                        <p>{analytics.performance.soilQualityIndex.toFixed(1)}/100</p>
                        <span>Overall soil health score</span>
                    </div>
                </div>
            </div>
        </div>
    );
};