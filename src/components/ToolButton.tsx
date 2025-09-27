import React from 'react';
import type { DrawingTool } from '@/types';

interface ToolButtonProps {
    tool: DrawingTool;
    selectedTool: DrawingTool;
    icon: string;
    label: string;
    onClick: (tool: DrawingTool) => void;
    description?: string;
}

export const ToolButton: React.FC<ToolButtonProps> = ({
    tool,
    selectedTool,
    icon,
    label,
    onClick,
    description
}) => (
    <button
        className={`tool-button ${selectedTool === tool ? 'active' : ''}`}
        onClick={() => onClick(tool)}
        title={description}
    >
        <div className="tool-icon-wrapper">
            <span className="tool-icon">{icon}</span>
        </div>
        <span className="tool-label">{label}</span>
    </button>
);