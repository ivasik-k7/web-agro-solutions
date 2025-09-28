import React, { useState, useEffect } from 'react';
import type { FieldBoundary } from '@/types';
import { ColorPicker } from '@components/ColorPicker';
import { AREA_TYPES, SOIL_TYPES, GROWTH_STAGES, CROP_TYPES, QUALITY_GRADES } from '@/constants';

import "@styles/FieldDetailsPanel.css"

type GrowthStage = keyof typeof GROWTH_STAGES;

interface FieldDetailsPanelProps {
    field: FieldBoundary | null;
    onUpdate: (field: FieldBoundary) => void;
    onClose: () => void;
}

export const FieldDetailsPanel: React.FC<FieldDetailsPanelProps> = ({
    field,
    onUpdate,
    onClose
}) => {
    const [editedField, setEditedField] = useState<FieldBoundary | null>(field);
    const [activeTab, setActiveTab] = useState<'basic' | 'temporal' | 'soil' | 'management' | 'economic'>('basic');

    useEffect(() => {
        setEditedField(field);
    }, [field]);

    if (!editedField) return null;

    const handleSave = () => {
        if (editedField) {
            onUpdate(editedField);
        }
        onClose();
    };

    const handleChange = (updates: Partial<FieldBoundary>) => {
        setEditedField(prev => prev ? { ...prev, ...updates } : null);
    };

    const handleNestedChange = (section: keyof FieldBoundary, updates: any) => {
        setEditedField(prev => prev ? {
            ...prev,
            [section]: { ...(prev[section] as any), ...updates }
        } : null);
    };

    const formatDate = (date?: Date) => {
        if (!date) return '';
        return date.toISOString().split('T')[0];
    };

    const parseDate = (dateString: string) => {
        if (!dateString) return undefined;
        return new Date(dateString);
    };

    const calculateProfitMargin = () => {
        if (editedField?.inputCosts && editedField?.expectedRevenue) {
            return ((editedField.expectedRevenue - editedField.inputCosts) / editedField.expectedRevenue) * 100;
        }
        return 0;
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="field-details-panel" onClick={(e) => e.stopPropagation()}>
                <div className="panel-header">
                    <div className="header-content">
                        <h3>🌿 FIELD DETAILS</h3>
                        <div className="field-title">
                            <span className="field-name">{editedField.name}</span>
                            <span className="field-type">{editedField.type}</span>
                        </div>
                    </div>
                    <button className="close-button" onClick={onClose}>
                        <span>✕</span>
                    </button>
                </div>

                {/* Tab Navigation */}
                <div className="panel-tabs">
                    <button
                        className={`tab-button ${activeTab === 'basic' ? 'active' : ''}`}
                        onClick={() => setActiveTab('basic')}
                    >
                        <span className="tab-icon">📋</span>
                        BASIC INFO
                    </button>
                    <button
                        className={`tab-button ${activeTab === 'temporal' ? 'active' : ''}`}
                        onClick={() => setActiveTab('temporal')}
                    >
                        <span className="tab-icon">📅</span>
                        TEMPORAL DATA
                    </button>
                    <button
                        className={`tab-button ${activeTab === 'soil' ? 'active' : ''}`}
                        onClick={() => setActiveTab('soil')}
                    >
                        <span className="tab-icon">🌱</span>
                        SOIL & ENV
                    </button>
                    <button
                        className={`tab-button ${activeTab === 'management' ? 'active' : ''}`}
                        onClick={() => setActiveTab('management')}
                    >
                        <span className="tab-icon">⚙️</span>
                        MANAGEMENT
                    </button>
                    <button
                        className={`tab-button ${activeTab === 'economic' ? 'active' : ''}`}
                        onClick={() => setActiveTab('economic')}
                    >
                        <span className="tab-icon">💰</span>
                        ECONOMIC
                    </button>
                </div>

                <div className="panel-content">
                    {/* Basic Information Tab */}
                    {activeTab === 'basic' && (
                        <div className="form-grid">
                            <div className="form-group">
                                <label className="form-label">FIELD NAME</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={editedField.name}
                                    onChange={(e) => handleChange({ name: e.target.value })}
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">AREA TYPE</label>
                                <select
                                    className="form-select"
                                    value={editedField.type}
                                    onChange={(e) => handleChange({ type: e.target.value as any })}
                                >
                                    {AREA_TYPES.map(type => (
                                        <option key={type} value={type}>
                                            {type.toUpperCase().replace('_', ' ')}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label className="form-label">CROP TYPE</label>
                                <select
                                    className="form-select"
                                    value={editedField.cropType || ''}
                                    onChange={(e) => handleChange({ cropType: e.target.value })}
                                >
                                    <option value="">SELECT CROP</option>
                                    {CROP_TYPES.map(crop => (
                                        <option key={crop} value={crop}>{crop.toUpperCase()}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label className="form-label">QUALITY GRADE</label>
                                <select
                                    className="form-select"
                                    value={editedField.qualityGrade || ''}
                                    onChange={(e) => handleChange({ qualityGrade: e.target.value as any })}
                                >
                                    <option value="">SELECT GRADE</option>
                                    {QUALITY_GRADES.map(grade => (
                                        <option key={grade.value} value={grade.value}>
                                            {grade.label.toUpperCase()}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label className="form-label">CROP VARIETY</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={editedField.variety || ''}
                                    onChange={(e) => handleChange({ variety: e.target.value })}
                                    placeholder="ENTER CROP VARIETY"
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">FIELD HEALTH: {editedField.health || 50}%</label>
                                <div className="range-container">
                                    <input
                                        type="range"
                                        className="form-range"
                                        min="0"
                                        max="100"
                                        value={editedField.health || 50}
                                        onChange={(e) => handleChange({ health: Number(e.target.value) })}
                                    />
                                    <div
                                        className="health-indicator"
                                        style={{ width: `${editedField.health || 50}%` }}
                                    ></div>
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="form-label">NDVI INDEX</label>
                                <input
                                    type="number"
                                    className="form-input"
                                    step="0.01"
                                    min="0"
                                    max="1"
                                    value={editedField.ndvi || ''}
                                    onChange={(e) => handleChange({ ndvi: Number(e.target.value) })}
                                    placeholder="0.0 - 1.0"
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">STRESS LEVEL: {editedField.stressLevel || 0}%</label>
                                <div className="range-container">
                                    <input
                                        type="range"
                                        className="form-range"
                                        min="0"
                                        max="100"
                                        value={editedField.stressLevel || 0}
                                        onChange={(e) => handleChange({ stressLevel: Number(e.target.value) })}
                                    />
                                    <div
                                        className="stress-indicator"
                                        style={{ width: `${editedField.stressLevel || 0}%` }}
                                    ></div>
                                </div>
                            </div>

                            <div className="form-group full-width">
                                <label className="form-label">FIELD COLOR</label>
                                <ColorPicker
                                    color={editedField.color}
                                    onChange={(color) => handleChange({ color })}
                                />
                            </div>

                            <div className="form-group full-width">
                                <label className="form-label">NOTES</label>
                                <textarea
                                    className="form-textarea"
                                    value={editedField.notes || ''}
                                    onChange={(e) => handleChange({ notes: e.target.value })}
                                    rows={3}
                                    placeholder="ADDITIONAL NOTES ABOUT THIS FIELD..."
                                />
                            </div>
                        </div>
                    )}

                    {/* Temporal Data Tab */}
                    {activeTab === 'temporal' && (
                        <div className="form-grid">
                            <div className="form-group">
                                <label className="form-label">PLANTING DATE</label>
                                <input
                                    type="date"
                                    className="form-input"
                                    value={formatDate(editedField.plantingDate)}
                                    onChange={(e) => handleChange({ plantingDate: parseDate(e.target.value) })}
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">HARVEST DATE</label>
                                <input
                                    type="date"
                                    className="form-input"
                                    value={formatDate(editedField.harvestDate)}
                                    onChange={(e) => handleChange({ harvestDate: parseDate(e.target.value) })}
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">GROWTH STAGE</label>
                                <select
                                    className="form-select"
                                    value={editedField.growthStage || ''}
                                    onChange={(e) => handleChange({ growthStage: e.target.value as GrowthStage })}
                                >
                                    <option value="">SELECT STAGE</option>
                                    {(Object.keys(GROWTH_STAGES) as GrowthStage[]).map(stage => (
                                        <option key={stage} value={stage}>
                                            {GROWTH_STAGES[stage].toUpperCase()}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label className="form-label">EXPECTED YIELD (TONS/ACRE)</label>
                                <input
                                    type="number"
                                    className="form-input"
                                    step="0.1"
                                    value={editedField.expectedYield || ''}
                                    onChange={(e) => handleChange({ expectedYield: Number(e.target.value) })}
                                />
                            </div>

                            <div className="form-group full-width">
                                <label className="form-label">HISTORICAL YIELDS (TONS/ACRE)</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={editedField.historicalYields?.join(', ') || ''}
                                    onChange={(e) => handleChange({
                                        historicalYields: e.target.value.split(',').map(val => parseFloat(val.trim())).filter(val => !isNaN(val))
                                    })}
                                    placeholder="E.G., 3.2, 3.5, 3.8, 4.1"
                                />
                            </div>
                        </div>
                    )}

                    {/* Soil & Environment Tab */}
                    {activeTab === 'soil' && (
                        <div className="form-grid">
                            <div className="form-group">
                                <label className="form-label">SOIL TYPE</label>
                                <select
                                    className="form-select"
                                    value={editedField.soilType || ''}
                                    onChange={(e) => handleChange({ soilType: e.target.value })}
                                >
                                    <option value="">SELECT SOIL TYPE</option>
                                    {SOIL_TYPES.map(soil => (
                                        <option key={soil} value={soil}>{soil.toUpperCase()}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label className="form-label">ELEVATION (METERS)</label>
                                <input
                                    type="number"
                                    className="form-input"
                                    value={editedField.elevation || ''}
                                    onChange={(e) => handleChange({ elevation: Number(e.target.value) })}
                                    placeholder="ABOVE SEA LEVEL"
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">SLOPE (%)</label>
                                <input
                                    type="number"
                                    className="form-input"
                                    step="0.1"
                                    value={editedField.slope || ''}
                                    onChange={(e) => handleChange({ slope: Number(e.target.value) })}
                                    placeholder="0-100%"
                                />
                            </div>

                            {/* Soil Analysis Subsection */}
                            <div className="form-section-header">
                                <h4>🧪 SOIL ANALYSIS</h4>
                            </div>

                            <div className="form-group">
                                <label className="form-label">PH LEVEL</label>
                                <input
                                    type="number"
                                    className="form-input"
                                    step="0.1"
                                    min="0"
                                    max="14"
                                    value={editedField.soilAnalysis?.phLevel || ''}
                                    onChange={(e) => handleNestedChange('soilAnalysis', { phLevel: Number(e.target.value) })}
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">NITROGEN (PPM)</label>
                                <input
                                    type="number"
                                    className="form-input"
                                    step="1"
                                    value={editedField.soilAnalysis?.nitrogen || ''}
                                    onChange={(e) => handleNestedChange('soilAnalysis', { nitrogen: Number(e.target.value) })}
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">PHOSPHORUS (PPM)</label>
                                <input
                                    type="number"
                                    className="form-input"
                                    step="1"
                                    value={editedField.soilAnalysis?.phosphorus || ''}
                                    onChange={(e) => handleNestedChange('soilAnalysis', { phosphorus: Number(e.target.value) })}
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">POTASSIUM (PPM)</label>
                                <input
                                    type="number"
                                    className="form-input"
                                    step="1"
                                    value={editedField.soilAnalysis?.potassium || ''}
                                    onChange={(e) => handleNestedChange('soilAnalysis', { potassium: Number(e.target.value) })}
                                />
                            </div>
                        </div>
                    )}

                    {/* Management Tab */}
                    {activeTab === 'management' && (
                        <div className="form-grid">
                            {/* Irrigation Subsection */}
                            <div className="form-section-header">
                                <h4>💧 IRRIGATION SCHEDULE</h4>
                            </div>

                            <div className="form-group">
                                <label className="form-label">FREQUENCY</label>
                                <select
                                    className="form-select"
                                    value={editedField.irrigation?.frequency || 'weekly'}
                                    onChange={(e) => handleNestedChange('irrigation', { frequency: e.target.value as any })}
                                >
                                    <option value="daily">DAILY</option>
                                    <option value="weekly">WEEKLY</option>
                                    <option value="custom">CUSTOM</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label className="form-label">DURATION (MINUTES)</label>
                                <input
                                    type="number"
                                    className="form-input"
                                    value={editedField.irrigation?.duration || ''}
                                    onChange={(e) => handleNestedChange('irrigation', { duration: Number(e.target.value) })}
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">WATER AMOUNT (LITERS)</label>
                                <input
                                    type="number"
                                    className="form-input"
                                    value={editedField.irrigation?.waterAmount || ''}
                                    onChange={(e) => handleNestedChange('irrigation', { waterAmount: Number(e.target.value) })}
                                />
                            </div>
                        </div>
                    )}

                    {/* Economic Data Tab */}
                    {activeTab === 'economic' && (
                        <div className="form-grid">
                            <div className="form-group">
                                <label className="form-label">TOTAL INPUT COSTS ($)</label>
                                <input
                                    type="number"
                                    className="form-input"
                                    step="0.01"
                                    value={editedField.inputCosts || ''}
                                    onChange={(e) => handleChange({ inputCosts: Number(e.target.value) })}
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">EXPECTED REVENUE ($)</label>
                                <input
                                    type="number"
                                    className="form-input"
                                    step="0.01"
                                    value={editedField.expectedRevenue || ''}
                                    onChange={(e) => handleChange({ expectedRevenue: Number(e.target.value) })}
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">PROFIT MARGIN</label>
                                <div className="calculated-value">
                                    {calculateProfitMargin().toFixed(1)}%
                                </div>
                            </div>

                            <div className="profit-indicator">
                                <div
                                    className="profit-bar"
                                    style={{ width: `${Math.min(calculateProfitMargin(), 100)}%` }}
                                ></div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="panel-actions">
                    <button className="action-button secondary" onClick={onClose}>
                        <span>⎋</span>
                        CANCEL
                    </button>
                    <button className="action-button primary" onClick={handleSave}>
                        <span>💾</span>
                        SAVE CHANGES
                    </button>
                </div>
            </div>
        </div>
    );
};