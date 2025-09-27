import React from 'react';
import type { AreaPattern } from '@/types';

interface PatternButtonProps {
    pattern: AreaPattern;
    selectedPattern: AreaPattern;
    label: string;
    onClick: (pattern: AreaPattern) => void;
    description: string;
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
    description
}) => (
    <button
        className={`pattern-button ${selectedPattern === pattern ? 'active' : ''}`}
        onClick={() => onClick(pattern)}
        title={description}
    >
        <span className="pattern-icon">{getPatternIcon(pattern)}</span>
        <span className="pattern-label">{label}</span>
    </button>
);