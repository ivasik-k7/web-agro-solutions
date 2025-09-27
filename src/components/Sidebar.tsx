import React from 'react';
import type { ViewMode, DrawingTool, AreaPattern, FieldBoundary } from '@/types';
import { FieldCard } from '@components/FieldCard';
import { HealthIndicator } from '@components/HealthIndicator';
import { ToolButton } from '@components/ToolButton';
import { PatternButton } from '@components/PatternButton';
import { ColorPicker } from '@components/ColorPicker';
import { ViewModeTabs } from '@components/ViewModeTabs';

import "@styles/Sidebar.css"

interface SidebarProps {
    position: 'left' | 'right';
    children: React.ReactNode;
    className?: string;
}

const SidebarContainer: React.FC<SidebarProps> = ({ position, children, className = '' }) => {
    return (
        <div className={`sidebar ${position}-sidebar ${className}`}>
            {children}
        </div>
    );
};

interface SidebarHeaderProps {
    title: string;
    subtitle: string;
    icon?: string;
}

const SidebarHeader: React.FC<SidebarHeaderProps> = ({ title, subtitle, icon = '🌱' }) => {
    return (
        <div className="sidebar-header">
            <div className="header-content">
                <div className="header-icon">{icon}</div>
                <div className="header-text">
                    <h2 className="sidebar-title">{title}</h2>
                    <p className="sidebar-subtitle">{subtitle}</p>
                </div>
            </div>
            <div className="header-glow"></div>
        </div>
    );
};

interface SidebarSectionProps {
    title: string;
    icon?: string;
    children: React.ReactNode;
    className?: string;
}

const SidebarSection: React.FC<SidebarSectionProps> = ({ title, icon, children, className = '' }) => {
    return (
        <div className={`sidebar-section ${className}`}>
            <h3 className="section-title">
                {icon && <span className="section-icon">{icon}</span>}
                {title}
            </h3>
            <div className="section-content">
                {children}
            </div>
        </div>
    );
};

interface ScrollContainerProps {
    children: React.ReactNode;
}

const ScrollContainer: React.FC<ScrollContainerProps> = ({ children }) => {
    return (
        <div className="sidebar-scroll-container">
            <div className="scroll-content">
                {children}
            </div>
        </div>
    );
};

// Left Sidebar Component
interface LeftSidebarProps {
    viewMode: ViewMode;
    selectedTool: DrawingTool;
    selectedPattern: AreaPattern;
    drawingColor: string;
    farmName: string;
    season: string;
    fields: FieldBoundary[];
    totalFarmArea: number;
    estimatedTotalYield: number;
    onViewModeChange: (mode: ViewMode) => void;
    onToolSelect: (tool: DrawingTool) => void;
    onPatternSelect: (pattern: AreaPattern) => void;
    onColorChange: (color: string) => void;
    onFarmNameChange: (name: string) => void;
    onSeasonChange: (season: string) => void;
    onSaveRecord: () => void;
    onDeleteSelectedField: () => void;
    onClearAllFields: () => void;
    selectedField: string | null;
}

const TOOL_CONFIG = [
    { tool: 'select' as const, label: 'Select', icon: '🎯', description: 'Select and edit fields' },
    { tool: 'rectangle' as const, label: 'Rectangle', icon: '⬜', description: 'Draw rectangular fields' },
    { tool: 'circle' as const, label: 'Circle', icon: '⭕', description: 'Draw circular areas' },
    { tool: 'triangle' as const, label: 'Triangle', icon: '🔺', description: 'Draw triangular plots' },
    { tool: 'polygon' as const, label: 'Polygon', icon: '🔷', description: 'Draw custom polygons' },
    { tool: 'freehand' as const, label: 'Freehand', icon: '✏️', description: 'Draw freehand boundaries' },
    { tool: 'pan' as const, label: 'Pan', icon: '✋', description: 'Move around the map' },
    { tool: 'measure' as const, label: 'Measure', icon: '📏', description: 'Measure distances and areas' },
];

const PATTERN_CONFIGS = {
    grid: { points: 4, description: 'Rectangular grid pattern' },
    hexagon: { points: 6, description: 'Hexagonal honeycomb pattern' },
    contour: { points: 8, description: 'Contour following pattern' },
    radial: { points: 12, description: 'Radial circular pattern' },
    parallel: { points: 4, description: 'Parallel line pattern' }
};

export const LeftSidebar: React.FC<LeftSidebarProps> = ({
    viewMode,
    selectedTool,
    selectedPattern,
    drawingColor,
    farmName,
    season,
    fields,
    totalFarmArea,
    estimatedTotalYield,
    onViewModeChange,
    onToolSelect,
    onPatternSelect,
    onColorChange,
    onFarmNameChange,
    onSeasonChange,
    onSaveRecord,
    onDeleteSelectedField,
    onClearAllFields,
    selectedField
}) => {
    return (
        <SidebarContainer position="left">
            <SidebarHeader
                title="AgroPro"
                subtitle="Precision Agriculture Platform"
                icon="🌱"
            />

            <div className="view-mode-container">
                <ViewModeTabs mode={viewMode} onChange={onViewModeChange} />
            </div>

            <ScrollContainer>
                <div className="sidebar-content">
                    {viewMode === 'map' && (
                        <>
                            <SidebarSection title="Drawing Tools" icon="🛠️">
                                <div className="tool-grid">
                                    {TOOL_CONFIG.map(({ tool, label, icon, description }) => (
                                        <ToolButton
                                            key={tool}
                                            tool={tool}
                                            selectedTool={selectedTool}
                                            icon={icon}
                                            label={label}
                                            description={description}
                                            onClick={onToolSelect}
                                        />
                                    ))}
                                </div>
                            </SidebarSection>

                            <SidebarSection title="Drawing Patterns" icon="🎨">
                                <div className="pattern-grid">
                                    {Object.entries(PATTERN_CONFIGS).map(([pattern, config]) => (
                                        <PatternButton
                                            key={pattern}
                                            pattern={pattern as AreaPattern}
                                            selectedPattern={selectedPattern}
                                            label={pattern.charAt(0).toUpperCase() + pattern.slice(1)}
                                            onClick={onPatternSelect}
                                            description={config.description}
                                        />
                                    ))}
                                </div>
                            </SidebarSection>

                            <SidebarSection title="Field Color" icon="🎨">
                                <div className="color-picker-section">
                                    <ColorPicker color={drawingColor} onChange={onColorChange} />
                                </div>
                            </SidebarSection>
                        </>
                    )}

                    <SidebarSection title="Farm Details" icon="🏠">
                        <div className="input-group">
                            <label className="input-label">Farm Name</label>
                            <input
                                type="text"
                                value={farmName}
                                onChange={(e) => onFarmNameChange(e.target.value)}
                                placeholder="Enter farm name"
                                className="farm-input"
                            />
                        </div>
                        <div className="input-group">
                            <label className="input-label">Season/Year</label>
                            <input
                                type="text"
                                value={season}
                                onChange={(e) => onSeasonChange(e.target.value)}
                                placeholder="e.g., Spring 2024"
                                className="farm-input"
                            />
                        </div>
                    </SidebarSection>

                    <SidebarSection title="Quick Stats" icon="📊">
                        <div className="stats-grid">
                            <div className="stat-card">
                                <div className="stat-value">{fields.length}</div>
                                <div className="stat-label">Fields</div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-value">{totalFarmArea.toFixed(1)}</div>
                                <div className="stat-label">Acres</div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-value">{estimatedTotalYield.toFixed(1)}</div>
                                <div className="stat-label">Tons</div>
                            </div>
                        </div>
                    </SidebarSection>

                    <SidebarSection title="Actions" icon="⚡">
                        <div className="actions-grid">
                            <button
                                className="action-button primary"
                                onClick={onSaveRecord}
                                disabled={fields.length === 0}
                            >
                                <span className="button-icon">💾</span>
                                Save Record
                            </button>
                            <button
                                className="action-button secondary"
                                onClick={onDeleteSelectedField}
                                disabled={!selectedField}
                            >
                                <span className="button-icon">🗑️</span>
                                Delete Field
                            </button>
                            <button
                                className="action-button danger"
                                onClick={onClearAllFields}
                            >
                                <span className="button-icon">🧹</span>
                                Clear All
                            </button>
                        </div>
                    </SidebarSection>
                </div>
            </ScrollContainer>
        </SidebarContainer>
    );
};

// Right Sidebar Component
interface RightSidebarProps {
    fields: FieldBoundary[];
    selectedField: string | null;
    onFieldSelect: (fieldId: string) => void;
    onFieldEdit: (field: FieldBoundary) => void;
}

export const RightSidebar: React.FC<RightSidebarProps> = ({
    fields,
    selectedField,
    onFieldSelect,
    onFieldEdit
}) => {
    const selectedFieldData = fields.find(f => f.id === selectedField);

    return (
        <SidebarContainer position="right">
            <SidebarHeader
                title="Field Manager"
                subtitle="Manage your field boundaries"
                icon="📋"
            />

            <ScrollContainer>
                <div className="sidebar-content">
                    <SidebarSection title={`Fields (${fields.length})`} icon="🌾">
                        <div className="field-list">
                            {fields.map(field => (
                                <FieldCard
                                    key={field.id}
                                    field={field}
                                    isSelected={selectedField === field.id}
                                    onClick={() => onFieldSelect(field.id)}
                                    onEdit={() => onFieldEdit(field)}
                                />
                            ))}
                            {fields.length === 0 && (
                                <div className="empty-state">
                                    <div className="empty-icon">🌱</div>
                                    <div className="empty-text">No fields yet</div>
                                    <div className="empty-subtext">Start drawing to create fields</div>
                                </div>
                            )}
                        </div>
                    </SidebarSection>

                    {selectedFieldData && (
                        <SidebarSection title="Selected Field" icon="⭐">
                            <div className="selected-field-details">
                                <div className="field-summary">
                                    <div className="field-name">{selectedFieldData.name}</div>
                                    <div className="field-type">{selectedFieldData.type}</div>
                                </div>
                                <div className="field-details">
                                    {selectedFieldData.area && (
                                        <div className="field-detail-item">
                                            <span className="detail-label">Area:</span>
                                            <span className="detail-value">{selectedFieldData.area.toFixed(2)} acres</span>
                                        </div>
                                    )}
                                    {selectedFieldData.cropType && (
                                        <div className="field-detail-item">
                                            <span className="detail-label">Crop:</span>
                                            <span className="detail-value">{selectedFieldData.cropType}</span>
                                        </div>
                                    )}
                                    {selectedFieldData.health && (
                                        <div className="field-detail-item">
                                            <span className="detail-label">Health:</span>
                                            <HealthIndicator health={selectedFieldData.health} size="sm" />
                                        </div>
                                    )}
                                </div>
                                <button
                                    className="edit-details-button"
                                    onClick={() => onFieldEdit(selectedFieldData)}
                                >
                                    <span className="button-icon">✏️</span>
                                    Edit Details
                                </button>
                            </div>
                        </SidebarSection>
                    )}
                </div>
            </ScrollContainer>
        </SidebarContainer>
    );
};