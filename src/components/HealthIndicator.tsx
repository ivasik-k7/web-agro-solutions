import React from 'react';
import { getHealthStatus } from "@/utils"

interface HealthIndicatorProps {
    health: number;
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    showValue?: boolean;
    showStatus?: boolean;
    showIcon?: boolean;
    animated?: boolean;
    compact?: boolean;
    className?: string;
}

export const HealthIndicator: React.FC<HealthIndicatorProps> = ({
    health,
    size = 'md',
    showValue = true,
    showStatus = true,
    showIcon = true,
    animated = true,
    compact = false,
    className = ''
}) => {
    const status = getHealthStatus(health);
    const statusLower = status.toLowerCase();

    const getStatusIcon = () => {
        switch (statusLower) {
            case 'excellent': return '💎';
            case 'good': return '✅';
            case 'average': return '⚠️';
            case 'poor': return '🔻';
            case 'critical': return '🚨';
            default: return '❓';
        }
    };

    const getStatusColor = () => {
        switch (statusLower) {
            case 'excellent': return 'var(--health-excellent)';
            case 'good': return 'var(--health-good)';
            case 'average': return 'var(--health-average)';
            case 'poor': return 'var(--health-poor)';
            case 'critical': return 'var(--health-critical)';
            default: return 'var(--agro-secondary)';
        }
    };

    return (
        <div
            className={`
                health-indicator 
                size-${size} 
                status-${statusLower}
                ${animated ? 'animated' : ''}
                ${compact ? 'compact' : ''}
                ${className}
            `}
            data-health={health}
            data-status={statusLower}
        >
            {/* Background Effects */}
            <div className="health-background">
                <div className="health-glow"></div>
                <div className="health-pulse"></div>
                <div className="health-grid"></div>
            </div>

            {/* Main Content */}
            <div className="health-content">
                {/* Icon Section */}
                {showIcon && (
                    <div className="health-icon-container">
                        <div className="health-icon-wrapper">
                            <span className="health-icon">{getStatusIcon()}</span>
                            <div className="icon-glow"></div>
                            {animated && <div className="icon-pulse"></div>}
                        </div>
                    </div>
                )}

                {/* Info Section */}
                <div className="health-info">
                    {/* Status and Value */}
                    {(showStatus || showValue) && (
                        <div className="health-header">
                            {showStatus && (
                                <span className="health-status">
                                    {status.toUpperCase()}
                                </span>
                            )}
                            {showValue && (
                                <span className="health-value">
                                    {health}%
                                </span>
                            )}
                        </div>
                    )}

                    {/* Health Bar */}
                    <div className="health-visualization">
                        <div className="health-bar-container">
                            <div className="health-bar-background">
                                <div className="bar-glow"></div>
                            </div>
                            <div
                                className="health-fill"
                                style={{
                                    width: `${health}%`,
                                    background: getStatusColor()
                                }}
                            >
                                <div className="fill-shine"></div>
                                <div className="fill-particles"></div>
                                {animated && <div className="fill-wave"></div>}
                            </div>

                            {/* Progress Markers */}
                            <div className="health-markers">
                                <div className="marker" style={{ left: '20%' }}></div>
                                <div className="marker" style={{ left: '40%' }}></div>
                                <div className="marker" style={{ left: '60%' }}></div>
                                <div className="marker" style={{ left: '80%' }}></div>
                            </div>
                        </div>

                        {/* Health Level Indicator */}
                        <div className="health-level">
                            <div
                                className="level-indicator"
                                style={{ left: `${health}%` }}
                            >
                                <div className="indicator-dot"></div>
                                <div className="indicator-glow"></div>
                            </div>
                        </div>
                    </div>

                    {/* Additional Metrics (for larger sizes) */}
                    {(size === 'lg' || size === 'xl') && !compact && (
                        <div className="health-metrics">
                            <div className="metric">
                                <span className="metric-label">TREND</span>
                                <span className="metric-value">+2.1%</span>
                            </div>
                            <div className="metric">
                                <span className="metric-label">LAST CHECK</span>
                                <span className="metric-value">2h ago</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Status Badge */}
            {!compact && (
                <div className="health-badge">
                    <div className="badge-content">
                        {statusLower}
                    </div>
                </div>
            )}

            {/* Tooltip */}
            <div className="health-tooltip">
                <div className="tooltip-content">
                    <strong>Field Health: {health}%</strong>
                    <br />
                    Status: {status}
                    <br />
                    Last updated: Just now
                </div>
            </div>
        </div>
    );
};