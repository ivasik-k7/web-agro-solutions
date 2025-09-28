import React from 'react';
import type { ViewMode, DrawingTool, AreaPattern, FieldBoundary } from '@/types';
// import { HealthIndicator } from '@components/HealthIndicator';
import { ToolButton } from '@components/ToolButton';
import { PatternButton } from '@components/PatternButton';
import { ColorPicker } from '@components/ColorPicker';
import { ViewModeTabs } from '@components/ViewModeTabs';

import "@styles/Sidebar.css"
import { getHealthStatus } from '@/utils';

interface SidebarProps {
    position: 'left' | 'right';
    children: React.ReactNode;
    className?: string;
}

const SidebarContainer: React.FC<SidebarProps> = ({ position, children, className = '' }) => {
    return (
        <div className={`sidebar sdb_${position}-sidebar ${className} sdb_slide-in-${position}`}>
            <div className="sdb_sidebar-glow"></div>
            {children}
        </div>
    );
};

interface SidebarHeaderProps {
    title: string;
    subtitle: string;
    icon?: string;
    status?: 'online' | 'offline' | 'syncing';
}

const SidebarHeader: React.FC<SidebarHeaderProps> = ({ title, subtitle, icon = '🌱', status = 'online' }) => {
    return (
        <div className="sdb_sidebar-header">
            <div className="sdb_header-content">
                <div className="sdb_header-icon-container">
                    <div className="sdb_header-icon">{icon}</div>
                    <div className={`sdb_status-indicator sdb_${status}`}></div>
                </div>
                <div className="sdb_header-text">
                    <h2 className="sdb_sidebar-title">{title}</h2>
                    <p className="sdb_sidebar-subtitle">{subtitle}</p>
                </div>
            </div>
            <div className="sdb_header-accent"></div>
        </div>
    );
};

interface SidebarSectionProps {
    title: string;
    icon?: string;
    children: React.ReactNode;
    className?: string;
    collapsible?: boolean;
    defaultOpen?: boolean;
}

const SidebarSection: React.FC<SidebarSectionProps> = ({
    title,
    icon,
    children,
    className = '',
    collapsible = false,
    defaultOpen = true
}) => {
    const [isOpen, setIsOpen] = React.useState(defaultOpen);

    return (
        <div className={`sdb_sidebar-section ${className} ${isOpen ? 'sdb_open' : 'sdb_collapsed'}`}>
            <div className="sdb_section-header" onClick={() => collapsible && setIsOpen(!isOpen)}>
                <h3 className="sdb_section-title">
                    {icon && <span className="sdb_section-icon">{icon}</span>}
                    {title}
                    {collapsible && (
                        <span className="sdb_collapse-indicator">
                            {isOpen ? '▾' : '▸'}
                        </span>
                    )}
                </h3>
            </div>
            {isOpen && (
                <div className="sdb_section-content">
                    {children}
                </div>
            )}
        </div>
    );
};

interface ScrollContainerProps {
    children: React.ReactNode;
}

const ScrollContainer: React.FC<ScrollContainerProps> = ({ children }) => {
    return (
        <div className="sdb_sidebar-scroll-container">
            <div className="sdb_scroll-content">
                {children}
            </div>
            <div className="sdb_scroll-shadow"></div>
        </div>
    );
};

// Tool Configurations
const TOOL_CONFIG = [
    { tool: 'select' as const, label: 'Select', icon: '🎯', description: 'Select and edit fields', shortcut: 'S' },
    { tool: 'rectangle' as const, label: 'Rectangle', icon: '⬜', description: 'Draw rectangular fields', shortcut: 'R' },
    { tool: 'circle' as const, label: 'Circle', icon: '⭕', description: 'Draw circular areas', shortcut: 'C' },
    { tool: 'polygon' as const, label: 'Polygon', icon: '🔷', description: 'Draw custom polygons', shortcut: 'P' },
    { tool: 'freehand' as const, label: 'Freehand', icon: '✏️', description: 'Draw freehand boundaries', shortcut: 'F' },
    { tool: 'pan' as const, label: 'Pan', icon: '✋', description: 'Move around the map', shortcut: 'H' },
    // { tool: 'measure' as const, label: 'Measure', icon: '📏', description: 'Measure distances and areas', shortcut: 'M' },
];

const PATTERN_CONFIGS = {
    grid: { points: 4, description: 'Rectangular grid pattern', icon: '🔲' },
    hexagon: { points: 6, description: 'Hexagonal honeycomb pattern', icon: '🔷' },
    contour: { points: 8, description: 'Contour following pattern', icon: '⛰️' },
    radial: { points: 12, description: 'Radial circular pattern', icon: '🌀' },
    parallel: { points: 4, description: 'Parallel line pattern', icon: '📐' }
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
    const avgHealth = fields.length > 0
        ? fields.reduce((sum, field) => sum + (field.health || 0), 0) / fields.length
        : 0;

    return (
        <SidebarContainer position="left">
            <SidebarHeader
                title="AGRO CONTROL PANEL"
                subtitle="Precision Agriculture Platform"
                icon="🌿"
                status="online"
            />

            {/* View Mode Navigation */}
            <div className="sdb_view-mode-container">
                <ViewModeTabs mode={viewMode} onChange={onViewModeChange} />
            </div>

            <ScrollContainer>
                <div className="sidebar-content">
                    {/* Farm Overview */}
                    <SidebarSection title="FARM OVERVIEW" icon="🏠" collapsible={true}>
                        <div className="sdb_farm-overview">
                            <div className="sdb_farm-input-group">
                                <label className="sdb_input-label">FARM NAME</label>
                                <input
                                    type="text"
                                    value={farmName}
                                    onChange={(e) => onFarmNameChange(e.target.value)}
                                    placeholder="ENTER FARM NAME"
                                    className="sdb_farm-input"
                                />
                            </div>
                            <div className="sdb_farm-input-group">
                                <label className="sdb_input-label">SEASON/YEAR</label>
                                <input
                                    type="text"
                                    value={season}
                                    onChange={(e) => onSeasonChange(e.target.value)}
                                    placeholder="E.G., SPRING 2024"
                                    className="sdb_farm-input"
                                />
                            </div>
                        </div>
                    </SidebarSection>

                    {/* Quick Stats */}
                    <SidebarSection title="OPERATIONAL STATS" icon="📊" collapsible={true}>
                        <div className="sdb_stats-grid">
                            <div className="sdb_stat-card sdb_primary">
                                <div className="sdb_stat-icon">🌾</div>
                                <div className="sdb_stat-content">
                                    <div className="sdb_stat-value">{fields.length}</div>
                                    <div className="sdb_stat-label">ACTIVE FIELDS</div>
                                </div>
                            </div>
                            <div className="sdb_stat-card sdb_success">
                                <div className="sdb_stat-icon">📐</div>
                                <div className="sdb_stat-content">
                                    <div className="sdb_stat-value">{totalFarmArea.toFixed(1)}</div>
                                    <div className="sdb_stat-label">TOTAL ACRES</div>
                                </div>
                            </div>
                            <div className="sdb_stat-card sdb_warning">
                                <div className="sdb_stat-icon">⚖️</div>
                                <div className="sdb_stat-content">
                                    <div className="sdb_stat-value">{estimatedTotalYield.toFixed(1)}</div>
                                    <div className="sdb_stat-label">EST. YIELD (T)</div>
                                </div>
                            </div>
                            <div className="sdb_stat-card sdb_info">
                                <div className="sdb_stat-icon">💚</div>
                                <div className="sdb_stat-content">
                                    <div className="sdb_stat-value">{avgHealth.toFixed(1)}%</div>
                                    <div className="sdb_stat-label">AVG HEALTH</div>
                                </div>
                            </div>
                        </div>
                    </SidebarSection>

                    {viewMode === 'map' && (
                        <>
                            {/* Drawing Tools */}
                            <SidebarSection title="DRAWING TOOLS" icon="🛠️" collapsible={true}>
                                <div className="sdb_tool-grid">
                                    {TOOL_CONFIG.map(({ tool, label, icon, description, shortcut }) => (
                                        <ToolButton
                                            key={tool}
                                            tool={tool}
                                            selectedTool={selectedTool}
                                            icon={icon}
                                            label={label}
                                            description={description}
                                            shortcut={shortcut}
                                            onClick={onToolSelect}
                                        />
                                    ))}
                                </div>
                            </SidebarSection>

                            {/* Drawing Patterns */}
                            <SidebarSection title="PATTERN MATRIX" icon="🎨" collapsible={true}>
                                <div className="sdb_pattern-grid">
                                    {Object.entries(PATTERN_CONFIGS).map(([pattern, config]) => (
                                        <PatternButton
                                            key={pattern}
                                            pattern={pattern as AreaPattern}
                                            selectedPattern={selectedPattern}
                                            label={pattern.toUpperCase()}
                                            icon={config.icon}
                                            onClick={onPatternSelect}
                                            description={config.description}
                                        />
                                    ))}
                                </div>
                            </SidebarSection>

                            {/* Color Picker */}
                            <SidebarSection title="FIELD COLOR" icon="🎨" collapsible={true}>
                                <div className="sdb_color-picker-section">
                                    <ColorPicker color={drawingColor} onChange={onColorChange} />
                                </div>
                            </SidebarSection>
                        </>
                    )}

                    {/* Actions */}
                    <SidebarSection title="QUICK ACTIONS" icon="⚡" collapsible={true}>
                        <div className="sdb_actions-grid">
                            <button
                                className="sdb_action-button sdb_primary"
                                onClick={onSaveRecord}
                                disabled={fields.length === 0}
                            >
                                <span className="sdb_button-icon">💾</span>
                                <span className="sdb_button-text">SAVE RECORD</span>
                                <span className="sdb_button-shortcut">CTRL+S</span>
                            </button>
                            <button
                                className="sdb_action-button sdb_secondary"
                                onClick={onDeleteSelectedField}
                                disabled={!selectedField}
                            >
                                <span className="sdb_button-icon">🗑️</span>
                                <span className="sdb_button-text">DELETE FIELD</span>
                                <span className="sdb_button-shortcut">DEL</span>
                            </button>
                            <button
                                className="sdb_action-button sdb_danger"
                                onClick={onClearAllFields}
                                disabled={fields.length === 0}
                            >
                                <span className="sdb_button-icon">🧹</span>
                                <span className="sdb_button-text">CLEAR ALL</span>
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

    // Calculate field statistics
    const fieldStats = {
        total: fields.length,
        byType: fields.reduce((acc, field) => {
            acc[field.type] = (acc[field.type] || 0) + 1;
            return acc;
        }, {} as Record<string, number>),
        healthyFields: fields.filter(f => (f.health || 0) >= 75).length,
        criticalFields: fields.filter(f => (f.health || 0) < 40).length
    };

    return (
        <SidebarContainer position="right">
            {/* <SidebarHeader
                title="FIELD INTELLIGENCE"
                subtitle="Real-time Field Analytics"
                icon="📡"
                status="syncing"
            /> */}

            <ScrollContainer>
                <div className="sidebar-content">
                    {/* Field Overview */}
                    <SidebarSection title="FIELD OVERVIEW" icon="🌐" collapsible={false}>
                        <div className="sdb_field-overview-stats">
                            <div className="sdb_overview-stat">
                                <div className="sdb_overview-value">{fieldStats.total}</div>
                                <div className="sdb_overview-label">TOTAL FIELDS</div>
                            </div>
                            <div className="sdb_overview-stat">
                                <div className="sdb_overview-value sdb_success">{fieldStats.healthyFields}</div>
                                <div className="sdb_overview-label">HEALTHY</div>
                            </div>
                            <div className="sdb_overview-stat">
                                <div className="sdb_overview-value sdb_warning">{fieldStats.criticalFields}</div>
                                <div className="sdb_overview-label">CRITICAL</div>
                            </div>
                        </div>
                    </SidebarSection>

                    {/* Field Type Distribution */}
                    <SidebarSection title="FIELD TYPE DISTRIBUTION" icon="📊" collapsible={true}>
                        <div className="sdb_type-distribution">
                            {Object.entries(fieldStats.byType).map(([type, count]) => (
                                <div key={type} className="sdb_type-item">
                                    <div className="sdb_type-info">
                                        <span className="sdb_type-name">{type.toUpperCase()}</span>
                                        <span className="sdb_type-count">{count}</span>
                                    </div>
                                    <div className="sdb_type-bar">
                                        <div
                                            className="sdb_type-fill"
                                            style={{
                                                width: `${(count / fieldStats.total) * 100}%`,
                                                background: `var(--${type.replace('_', '-')}-color)`
                                            }}
                                        ></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </SidebarSection>

                    {/* Selected Field Details */}
                    {selectedFieldData ? (
                        <SidebarSection title="ACTIVE FIELD DATA" icon="⭐" collapsible={false}>
                            <div className="sdb_selected-field-details">
                                <div className="sdb_field-header">
                                    <div className="sdb_field-title">
                                        <h4 className="sdb_field-name">{selectedFieldData.name}</h4>
                                        <span
                                            className="sdb_field-type-badge"
                                            style={{ borderColor: selectedFieldData.color }}
                                        >
                                            {selectedFieldData.type.toUpperCase()}
                                        </span>
                                    </div>
                                    <div
                                        className="sdb_field-color-indicator"
                                        style={{ backgroundColor: selectedFieldData.color }}
                                    ></div>
                                </div>

                                <div className="sdb_field-metrics">
                                    <div className="sdb_metric-row">
                                        <div className="sdb_metric-item">
                                            <span className="sdb_metric-label">AREA</span>
                                            <span className="sdb_metric-value">
                                                {selectedFieldData.area?.toFixed(2) || 'N/A'} acres
                                            </span>
                                        </div>
                                        <div className="sdb_metric-item">
                                            <span className="sdb_metric-label">CROP</span>
                                            <span className="sdb_metric-value">
                                                {selectedFieldData.cropType || 'N/A'}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="sdb_metric-row">
                                        <div className="sdb_metric-item">
                                            <span className="sdb_metric-label">HEALTH</span>
                                            <div className="sdb_metric-value sdb_health-compact">
                                                <div className="sdb_health-indicator-compact">
                                                    <div
                                                        className={`sdb_health-dot sdb_${getHealthStatus(selectedFieldData.health || 0).toLowerCase()}`}
                                                    ></div>
                                                    <span className="sdb_health-percentage">
                                                        {selectedFieldData.health || 0}%
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="sdb_metric-item">
                                            <span className="sdb_metric-label">NDVI</span>
                                            <span className="sdb_metric-value">
                                                {selectedFieldData.ndvi?.toFixed(2) || 'N/A'}
                                            </span>
                                        </div>
                                    </div>

                                    {selectedFieldData.growthStage && (
                                        <div className="sdb_metric-row">
                                            <div className="sdb_metric-item sdb_full-width">
                                                <span className="sdb_metric-label">GROWTH STAGE</span>
                                                <span className="sdb_metric-value sdb_stage">
                                                    {selectedFieldData.growthStage.toUpperCase()}
                                                </span>
                                            </div>
                                        </div>
                                    )}

                                    {selectedFieldData.expectedYield && (
                                        <div className="sdb_metric-row">
                                            <div className="sdb_metric-item sdb_full-width">
                                                <span className="sdb_metric-label">EXPECTED YIELD</span>
                                                <span className="sdb_metric-value sdb_yield">
                                                    {selectedFieldData.expectedYield.toFixed(1)} tons
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="sdb_field-actions">
                                    <button
                                        className="sdb_field-action-button sdb_primary"
                                        onClick={() => onFieldEdit(selectedFieldData)}
                                    >
                                        <span className="sdb_button-icon">⚡</span>
                                        EDIT DETAILS
                                    </button>
                                    <button
                                        className="sdb_field-action-button sdb_secondary"
                                        onClick={() => onFieldSelect(selectedFieldData.id)}
                                    >
                                        <span className="sdb_button-icon">🎯</span>
                                        FOCUS VIEW
                                    </button>
                                </div>
                            </div>
                        </SidebarSection>
                    ) : (
                        <SidebarSection title="NO FIELD SELECTED" icon="🔍" collapsible={false}>
                            <div className="sdb_no-selection-state">
                                <div className="sdb_no-selection-icon">🎯</div>
                                <div className="sdb_no-selection-text">SELECT A FIELD</div>
                                <div className="sdb_no-selection-subtext">
                                    Click on any field to view detailed analytics and management options
                                </div>
                            </div>
                        </SidebarSection>
                    )}

                    {/* Quick Field List */}
                    {fields.length > 0 && (
                        <SidebarSection title="QUICK FIELD ACCESS" icon="🚀" collapsible={true}>
                            <div className="sdb_quick-field-list">
                                {fields.slice(0, 5).map(field => (
                                    <div
                                        key={field.id}
                                        className={`sdb_quick-field-item ${selectedField === field.id ? 'sdb_active' : ''}`}
                                        onClick={() => onFieldSelect(field.id)}
                                    >
                                        <div className="sdb_quick-field-main">
                                            <div
                                                className="sdb_field-color-dot"
                                                style={{ backgroundColor: field.color }}
                                            ></div>
                                            <div className="sdb_field-info">
                                                <div className="sdb_field-name-small">{field.name}</div>
                                                <div className="sdb_field-details-small">
                                                    {field.area?.toFixed(1)} acres • {field.cropType || 'No crop'}
                                                </div>
                                            </div>
                                        </div>
                                        {/* <div className="sdb_quick-field-health">
                                            <HealthIndicator
                                                health={field.health || 0}
                                                size="xs"
                                                showValue={false}
                                                showStatus={false}
                                                compact={true}
                                            />
                                            <div className="sdb_health-percentage">
                                                {field.health || 0}%
                                            </div>
                                        </div> */}
                                    </div>
                                ))}
                                {fields.length > 5 && (
                                    <div className="sdb_more-fields-indicator">
                                        +{fields.length - 5} more fields
                                    </div>
                                )}
                            </div>
                        </SidebarSection>
                    )}
                </div>
            </ScrollContainer>
        </SidebarContainer>
    );
};