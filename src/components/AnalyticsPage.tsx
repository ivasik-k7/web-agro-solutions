// components/AnalyticsView.tsx
import React, { useEffect, useRef } from 'react';
import "@styles/AnalyticsPage.css"
import { useFieldAnalytics, useHealthAnalytics, usePerformanceAnalytics } from '@/hooks/useFieldAnalytics';
import { useAgroDataManager } from '@/hooks/useAgroDataManager';

export const AnalyticsView: React.FC = () => {
    const agroData = useAgroDataManager();
    const fields = agroData.fields;
    const analytics = useFieldAnalytics(fields);
    const healthAnalytics = useHealthAnalytics(fields);
    const performanceAnalytics = usePerformanceAnalytics(fields);

    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const createParticle = () => {
            const particle = document.createElement('div');
            particle.style.cssText = `
                position: fixed;
                width: 2px;
                height: 2px;
                background: var(--agro-primary);
                border-radius: 50%;
                pointer-events: none;
                z-index: 1;
            `;

            const startX = Math.random() * window.innerWidth;
            const startY = Math.random() * window.innerHeight;

            particle.style.left = `${startX}px`;
            particle.style.top = `${startY}px`;
            particle.style.boxShadow = '0 0 10px var(--agro-primary)';

            container.appendChild(particle);

            const animation = particle.animate([
                {
                    transform: 'translateY(0px)',
                    opacity: 1
                },
                {
                    transform: `translateY(${Math.random() * 100 - 50}px) translateX(${Math.random() * 100 - 50}px)`,
                    opacity: 0
                }
            ], {
                duration: 2000 + Math.random() * 3000,
                easing: 'cubic-bezier(0.4, 0, 0.2, 1)'
            });

            animation.onfinish = () => {
                particle.remove();
                createParticle();
            };
        };

        // Create initial particles
        for (let i = 0; i < 15; i++) {
            setTimeout(createParticle, i * 200);
        }
    }, []);

    const getHealthColor = (health: number) => {
        if (health >= 90) return 'var(--health-excellent)';
        if (health >= 75) return 'var(--health-good)';
        if (health >= 60) return 'var(--health-average)';
        if (health >= 40) return 'var(--health-poor)';
        return 'var(--health-critical)';
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

    const formatNumber = (num: number) => {
        if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
        if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
        return num.toFixed(1);
    };

    return (
        <div className="analytics-container" ref={containerRef}>
            {/* Left Sidebar */}
            <div className="analytics-sidebar left-sidebar">
                <div className="sidebar-section">
                    <h3>🌡️ REAL-TIME SENSORS</h3>
                    <div className="real-time-metrics">
                        <div className="metric-item">
                            <span className="metric-label">Field Activity</span>
                            <span className="metric-value active">ACTIVE</span>
                        </div>
                        <div className="metric-item">
                            <span className="metric-label">Last Update</span>
                            <span className="metric-value">JUST NOW</span>
                        </div>
                        <div className="metric-item">
                            <span className="metric-label">Data Points</span>
                            <span className="metric-value">{fields.length * 12}</span>
                        </div>
                        <div className="metric-item">
                            <span className="metric-label">AI Processing</span>
                            <span className="metric-value active">ONLINE</span>
                        </div>
                    </div>
                </div>

                <div className="sidebar-section">
                    <h3>🚨 CRITICAL ALERTS</h3>
                    <div className="alerts-list">
                        {performanceAnalytics.recommendations.slice(0, 3).map((rec, index) => (
                            <div key={index} className="alert-item">
                                <div className="alert-indicator"></div>
                                <span className="alert-text">{rec}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="sidebar-section">
                    <h3>⚡ SYSTEM STATUS</h3>
                    <div className="real-time-metrics">
                        <div className="metric-item">
                            <span className="metric-label">AI Models</span>
                            <span className="metric-value active">OPTIMAL</span>
                        </div>
                        <div className="metric-item">
                            <span className="metric-label">Data Stream</span>
                            <span className="metric-value active">STABLE</span>
                        </div>
                        <div className="metric-item">
                            <span className="metric-label">Predictions</span>
                            <span className="metric-value">94.7% ACC</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="analytics-main">
                <div className="analytics-header">
                    <div className="header-content">
                        <h1>🌿 AGRO INTELLIGENCE PLATFORM</h1>
                        <p>Real-time Agricultural Analytics & Predictive Insights</p>
                    </div>
                    <div className="header-stats">
                        <div className="header-stat">
                            <span className="stat-number">{analytics.totalFields}</span>
                            <span className="stat-label">ACTIVE FIELDS</span>
                        </div>
                        <div className="header-stat">
                            <span className="stat-number">{analytics.totalArea.toFixed(0)}</span>
                            <span className="stat-label">TOTAL ACRES</span>
                        </div>
                        <div className="header-stat">
                            <span className="stat-number">{analytics.avgHealth.toFixed(0)}%</span>
                            <span className="stat-label">AVG HEALTH</span>
                        </div>
                    </div>
                </div>

                {/* Key Performance Indicators */}
                <div className="kpi-grid">
                    <div className="kpi-card">
                        <div className="kpi-header">
                            <div className="kpi-icon">🌾</div>
                            <div className="kpi-trend up">+5.2%</div>
                        </div>
                        <div className="kpi-value">{formatNumber(analytics.totalYield)}T</div>
                        <div className="kpi-label">TOTAL YIELD</div>
                        <div className="kpi-progress">
                            <div className="progress-bar">
                                <div className="progress-fill" style={{ width: '78%' }}></div>
                            </div>
                        </div>
                    </div>

                    <div className="kpi-card">
                        <div className="kpi-header">
                            <div className="kpi-icon">💚</div>
                            <div className="kpi-trend up">+2.1%</div>
                        </div>
                        <div className="kpi-value">{analytics.avgHealth.toFixed(1)}%</div>
                        <div className="kpi-label">FIELD HEALTH</div>
                        <div className="kpi-progress">
                            <div className="progress-bar">
                                <div
                                    className="progress-fill"
                                    style={{
                                        width: `${analytics.avgHealth}%`,
                                        background: getHealthColor(analytics.avgHealth)
                                    }}
                                ></div>
                            </div>
                        </div>
                    </div>

                    <div className="kpi-card">
                        <div className="kpi-header">
                            <div className="kpi-icon">📈</div>
                            <div className="kpi-trend up">+8.7%</div>
                        </div>
                        <div className="kpi-value">{analytics.averageYieldPerAcre.toFixed(1)}</div>
                        <div className="kpi-label">YIELD/ACRE</div>
                        <div className="kpi-progress">
                            <div className="progress-bar">
                                <div className="progress-fill" style={{ width: '65%' }}></div>
                            </div>
                        </div>
                    </div>

                    <div className="kpi-card">
                        <div className="kpi-header">
                            <div className="kpi-icon">💰</div>
                            <div className="kpi-trend up">+12.3%</div>
                        </div>
                        <div className="kpi-value">${formatNumber(analytics.totalYield * 180)}</div>
                        <div className="kpi-label">EST. REVENUE</div>
                        <div className="kpi-progress">
                            <div className="progress-bar">
                                <div className="progress-fill" style={{ width: '82%' }}></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Analytics Grid */}
                <div className="analytics-grid">
                    {/* Crop Distribution */}
                    <div className="analytics-card wide">
                        <div className="card-header">
                            <h3>🌽 CROP DISTRIBUTION ANALYSIS</h3>
                            <div className="card-actions">
                                <button className="card-action">📊</button>
                                <button className="card-action">⤢</button>
                            </div>
                        </div>
                        <div className="crop-distribution">
                            {analytics.cropDistribution.map((crop) => (
                                <div key={crop.crop} className="crop-item">
                                    <div className="crop-info">
                                        <div className="crop-name">{crop.crop}</div>
                                        <div className="crop-metrics">
                                            <div className="metric">
                                                <span className="metric-value">{crop.area.toFixed(1)}</span>
                                                <span className="metric-label">acres</span>
                                            </div>
                                            <div className="metric">
                                                <span className="metric-value">{crop.yield.toFixed(1)}</span>
                                                <span className="metric-label">tons</span>
                                            </div>
                                            <div className="metric">
                                                <span className="metric-value">{crop.yieldPerAcre.toFixed(1)}</span>
                                                <span className="metric-label">t/ac</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="crop-visualization">
                                        <div
                                            className="crop-bar"
                                            style={{
                                                width: `${(crop.area / analytics.totalArea) * 100}%`,
                                                background: `linear-gradient(90deg, ${getHealthColor(crop.yieldPerAcre * 20)} 0%, ${getHealthColor(crop.yieldPerAcre * 15)} 100%)`
                                            }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Health Overview */}
                    <div className="analytics-card">
                        <div className="card-header">
                            <h3>💊 HEALTH MATRIX</h3>
                            <span className="card-score">{healthAnalytics.overallScore.toFixed(1)}%</span>
                        </div>
                        <div className="health-radar">
                            {Object.entries(analytics.healthDistribution).map(([status, count]) => (
                                <div key={status} className="health-sector">
                                    <div className="sector-info">
                                        <div
                                            className="sector-indicator"
                                            style={{ background: getHealthStatusColor(status) }}
                                        ></div>
                                        <span className="sector-name">{status}</span>
                                        <span className="sector-value">{count}</span>
                                    </div>
                                    <div className="sector-bar">
                                        <div
                                            className="sector-fill"
                                            style={{
                                                height: `${healthAnalytics.percentages[status as keyof typeof healthAnalytics.percentages]}%`,
                                                background: getHealthStatusColor(status)
                                            }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Soil Analysis */}
                    <div className="analytics-card">
                        <div className="card-header">
                            <h3>🌱 SOIL INTELLIGENCE</h3>
                            <span className="card-score">{analytics.performance.soilQualityIndex.toFixed(1)}</span>
                        </div>
                        <div className="soil-composition">
                            {analytics.soilDistribution.map((soil) => (
                                <div key={soil.soil} className="soil-element">
                                    <div className="element-header">
                                        <span className="element-name">{soil.soil}</span>
                                        <span className="element-percentage">
                                            {((soil.area / analytics.totalArea) * 100).toFixed(1)}%
                                        </span>
                                    </div>
                                    <div className="element-stats">
                                        <span className="element-health" style={{ color: getHealthColor(soil.averageHealth) }}>
                                            {soil.averageHealth.toFixed(1)}% health
                                        </span>
                                    </div>
                                    <div className="element-visualization">
                                        <div
                                            className="element-bar"
                                            style={{
                                                width: `${(soil.area / analytics.totalArea) * 100}%`,
                                                background: `linear-gradient(90deg, ${getHealthColor(soil.averageHealth)} 0%, ${getHealthColor(soil.averageHealth - 10)} 100%)`
                                            }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Performance Metrics */}
                    <div className="analytics-card">
                        <div className="card-header">
                            <h3>📈 PERFORMANCE CORE</h3>
                            <div className="trend-indicators">
                                <span className={`trend ${performanceAnalytics.trends.health}`}>H</span>
                                <span className={`trend ${performanceAnalytics.trends.yield}`}>Y</span>
                                <span className={`trend ${performanceAnalytics.trends.efficiency}`}>E</span>
                            </div>
                        </div>
                        <div className="performance-metrics">
                            <div className="performance-metric">
                                <span className="metric-name">Health Score</span>
                                <span
                                    className="metric-value"
                                    style={{ color: getHealthColor(analytics.performance.overallHealthScore) }}
                                >
                                    {analytics.performance.overallHealthScore.toFixed(1)}%
                                </span>
                            </div>
                            <div className="performance-metric">
                                <span className="metric-name">Yield Efficiency</span>
                                <span
                                    className="metric-value"
                                    style={{ color: getHealthColor(analytics.performance.yieldEfficiency * 20) }}
                                >
                                    {analytics.performance.yieldEfficiency.toFixed(1)} t/ac
                                </span>
                            </div>
                            <div className="performance-metric">
                                <span className="metric-name">Healthy Fields</span>
                                <span
                                    className="metric-value"
                                    style={{ color: getHealthColor((analytics.performance.healthyFieldsCount / analytics.totalFields) * 100) }}
                                >
                                    {analytics.performance.healthyFieldsCount}
                                </span>
                            </div>
                            <div className="performance-metric">
                                <span className="metric-name">Soil Quality</span>
                                <span
                                    className="metric-value"
                                    style={{ color: getHealthColor(analytics.performance.soilQualityIndex) }}
                                >
                                    {analytics.performance.soilQualityIndex.toFixed(1)}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Sidebar */}
            <div className="analytics-sidebar right-sidebar">
                <div className="sidebar-section">
                    <h3>🎯 FIELD ARCHETYPES</h3>
                    <div className="field-types">
                        {Object.entries(analytics.fieldTypeDistribution).map(([type, data]) => (
                            <div key={type} className="field-type-item">
                                <div className="type-icon">
                                    {type === 'field' && '🌾'}
                                    {type === 'irrigation' && '💧'}
                                    {type === 'greenhouse' && '🏭'}
                                    {type === 'orchard' && '🌳'}
                                    {type === 'pasture' && '🐄'}
                                    {type === 'boundary' && '📐'}
                                    {type === 'crop_area' && '🌱'}
                                </div>
                                <div className="type-details">
                                    <span className="type-name">{type.replace('_', ' ')}</span>
                                    <span className="type-area">{data.area.toFixed(1)} acres</span>
                                </div>
                                <div
                                    className="type-health"
                                    style={{ color: getHealthColor(data.averageHealth) }}
                                >
                                    {data.averageHealth.toFixed(0)}%
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="sidebar-section">
                    <h3>🚀 AI OPTIMIZATION</h3>
                    <div className="optimization-tips">
                        {performanceAnalytics.recommendations.slice(0, 2).map((rec, index) => (
                            <div key={index} className="tip-card">
                                <div className="tip-icon">⚡</div>
                                <div className="tip-content">
                                    <p>{rec}</p>
                                    <span className="tip-priority high">HIGH IMPACT</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="sidebar-section">
                    <h3>📊 DATA INTEGRITY</h3>
                    <div className="data-quality">
                        <div className="quality-metric">
                            <span className="quality-label">Completeness</span>
                            <div className="quality-bar">
                                <div className="quality-fill" style={{ width: '92%' }}></div>
                            </div>
                            <span className="quality-value">92%</span>
                        </div>
                        <div className="quality-metric">
                            <span className="quality-label">Accuracy</span>
                            <div className="quality-bar">
                                <div className="quality-fill" style={{ width: '88%' }}></div>
                            </div>
                            <span className="quality-value">88%</span>
                        </div>
                        <div className="quality-metric">
                            <span className="quality-label">Timeliness</span>
                            <div className="quality-bar">
                                <div className="quality-fill" style={{ width: '95%' }}></div>
                            </div>
                            <span className="quality-value">95%</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};