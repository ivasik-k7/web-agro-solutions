import React from 'react';
import type { ViewMode } from '@/types';
import { Link } from 'react-router-dom';

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
        <Link to="/analytics" className={`tab-button ${mode === 'analytics' ? 'active' : ''}`}>
            📊 Analytics
        </Link>

        {/* <button
            className={`tab-button ${mode === 'analytics' ? 'active' : ''}`}
            onClick={() => onChange('analytics')}
        >
            📊 Analytics
        </button> */}
        <Link to="/planning" className={`tab-button ${mode === 'planning' ? 'active' : ''}`}>
            📋 Planning
        </Link>

    </div>
);