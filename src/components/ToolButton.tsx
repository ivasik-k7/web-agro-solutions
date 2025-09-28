import React from 'react';
import type { DrawingTool } from '@/types';
import "@styles/ToolButton.css"

interface ToolButtonProps {
    tool: DrawingTool;
    selectedTool: DrawingTool;
    icon: string;
    label: string;
    onClick: (tool: DrawingTool) => void;
    description?: string;
    shortcut?: string;
}

export const ToolButton: React.FC<ToolButtonProps> = ({
    tool,
    selectedTool,
    icon,
    label,
    onClick,
    description,
    shortcut
}) => {
    const isActive = selectedTool === tool;

    return (
        <button
            className={`tool-button ${isActive ? 'active' : ''}`}
            onClick={() => onClick(tool)}
            title={description}
            data-tool={tool}
        >
            <div className="tool-background">
                <div className="tool-glow"></div>
                <div className="tool-border"></div>
            </div>

            <div className="tool-content">
                <div className="tool-icon-container">
                    <span className="tool-icon">{icon}</span>
                    {isActive && <div className="active-indicator"></div>}
                </div>

                <div className="tool-info">
                    <span className="tool-label">{label}</span>
                    {shortcut && (
                        <span className="tool-shortcut">{shortcut}</span>
                    )}
                </div>
            </div>

            {description && (
                <div className="tool-tooltip">
                    {description}
                </div>
            )}
        </button>
    );
};