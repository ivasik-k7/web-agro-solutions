import React from 'react';
import { getHealthStatus } from "@/utils"


interface HealthIndicatorProps {
    health: number;
    size?: 'sm' | 'md' | 'lg';
}

export const HealthIndicator: React.FC<HealthIndicatorProps> = ({ health, size = 'md' }) => {
    const status = getHealthStatus(health);

    return (
        <div className={`health-indicator ${size}`}>
            <div className="health-label">
                <span className="health-status">{status}</span>
                <span className="health-value">{health}%</span>
            </div>
            <div className="health-bar">
                <div
                    className={`health-fill health-${status.toLowerCase()}`}
                    style={{ width: `${health}%` }}
                />
            </div>
        </div>
    );
};