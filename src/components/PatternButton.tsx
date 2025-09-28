import React from 'react';
import type { AreaPattern } from '@/types';
import "@styles/PatternButton.css"

interface PatternButtonProps {
    pattern: AreaPattern;
    selectedPattern: AreaPattern;
    label: string;
    onClick: (pattern: AreaPattern) => void;
    description: string;
    icon?: string;
}

const getPatternIcon = (pattern: AreaPattern): string => {
    switch (pattern) {
        case 'grid': return '⏹️';
        case 'hexagon': return '⬢';
        case 'contour': return '⛰️';
        case 'radial': return '⭕';
        case 'parallel': return '═';
        default: return '▢';
    }
};

export const PatternButton: React.FC<PatternButtonProps> = ({
    pattern,
    selectedPattern,
    label,
    onClick,
    description,
    icon
}) => {
    const isActive = selectedPattern === pattern;
    const patternIcon = icon || getPatternIcon(pattern);

    return (
        <button
            className={`pattern-button ${isActive ? 'active' : ''}`}
            onClick={() => onClick(pattern)}
            title={description}
            data-pattern={pattern}
        >
            <div className="pattern-background">
                <div className="pattern-glow"></div>
                <div className="pattern-border"></div>
                <div className="pattern-grid-overlay"></div>
            </div>

            <div className="pattern-content">
                <div className="pattern-icon-container">
                    <span className="pattern-icon">{patternIcon}</span>
                    {isActive && (
                        <>
                            <div className="active-ring"></div>
                            <div className="active-pulse"></div>
                        </>
                    )}
                </div>

                <div className="pattern-info">
                    <span className="pattern-label">{label}</span>
                    <span className="pattern-description">{description}</span>
                </div>
            </div>

            <div className="pattern-tooltip">
                {description}
            </div>

            {/* Pattern-specific decorative elements */}
            <div className={`pattern-decoration ${pattern}`}></div>
        </button>
    );
};