import React from 'react';
import type { ViewMode } from '@/types';

interface ViewModeTabsProps {
    mode: ViewMode;
    onChange: (mode: ViewMode) => void;
}

export const ViewModeTabs: React.FC<ViewModeTabsProps> = ({ mode, onChange }) => (
    <div className="view-mode-tabs">
        <button
            className={`tab-button ${mode === 'map' ? 'active' : ''}`}
            onClick={() => onChange('map')}
        >
            🗺️ Map
        </button>
        <button
            className={`tab-button ${mode === 'analytics' ? 'active' : ''}`}
            onClick={() => onChange('analytics')}
        >
            📊 Analytics
        </button>
        <button
            className={`tab-button ${mode === 'planning' ? 'active' : ''}`}
            onClick={() => onChange('planning')}
        >
            📋 Planning
        </button>
    </div>
);