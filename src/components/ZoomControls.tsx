import React from 'react';

import "@styles/ZoomControls.css"

interface ZoomControlsProps {
    zoom: number;
    onZoomIn: () => void;
    onZoomOut: () => void;
    onReset: () => void;
}

export const ZoomControls: React.FC<ZoomControlsProps> = ({
    zoom,
    onZoomIn,
    onZoomOut,
    onReset
}) => {
    return (
        <div className="zoom-controls" data-zoom-level={Math.round(zoom * 100)}>
            <div className="zoom-controls-group">
                <button
                    className="zoom-button zoom-in"
                    onClick={onZoomIn}
                    title="Zoom In"
                    aria-label="Zoom In"
                >
                    <span className="zoom-icon">+</span>
                    <div className="button-glow"></div>
                </button>

                <div className="zoom-display">
                    <div className="zoom-level">{Math.round(zoom * 100)}%</div>
                    <div className="zoom-label">Precision View</div>
                </div>

                <button
                    className="zoom-button zoom-out"
                    onClick={onZoomOut}
                    title="Zoom Out"
                    aria-label="Zoom Out"
                >
                    <span className="zoom-icon">−</span>
                    <div className="button-glow"></div>
                </button>
            </div>

            <button
                className="zoom-reset"
                onClick={onReset}
                title="Reset View"
                aria-label="Reset View"
            >
                <span className="reset-icon">⟳</span>
                <span className="reset-text">Reset</span>
                <div className="button-glow"></div>
            </button>
        </div>
    );
};