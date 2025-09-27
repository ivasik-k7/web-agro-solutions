import React, { useState, useEffect } from 'react';
import type { FieldBoundary } from '@/types';
import { ColorPicker } from '@components/ColorPicker';
import { AREA_TYPES, SOIL_TYPES, GROWTH_STAGES, CROP_TYPES, QUALITY_GRADES } from '@/constants';

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
        onUpdate(editedField);
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

    return (
        <div className="field-details-panel">
            <div className="panel-header">
                <h3>Field Details - {editedField.name}</h3>
                <button className="close-button" onClick={onClose}>×</button>
            </div>

            {/* Tab Navigation */}
            <div className="panel-tabs">
                <button
                    className={`tab-button ${activeTab === 'basic' ? 'active' : ''}`}
                    onClick={() => setActiveTab('basic')}
                >
                    📋 Basic Info
                </button>
                <button
                    className={`tab-button ${activeTab === 'temporal' ? 'active' : ''}`}
                    onClick={() => setActiveTab('temporal')}
                >
                    📅 Temporal Data
                </button>
                <button
                    className={`tab-button ${activeTab === 'soil' ? 'active' : ''}`}
                    onClick={() => setActiveTab('soil')}
                >
                    🌱 Soil & Environment
                </button>
                <button
                    className={`tab-button ${activeTab === 'management' ? 'active' : ''}`}
                    onClick={() => setActiveTab('management')}
                >
                    ⚙️ Management
                </button>
                <button
                    className={`tab-button ${activeTab === 'economic' ? 'active' : ''}`}
                    onClick={() => setActiveTab('economic')}
                >
                    💰 Economic Data
                </button>
            </div>

            <div className="panel-content">
                {/* Basic Information Tab */}
                {activeTab === 'basic' && (
                    <div className="form-grid">
                        <div className="form-group">
                            <label>Field Name</label>
                            <input
                                type="text"
                                value={editedField.name}
                                onChange={(e) => handleChange({ name: e.target.value })}
                            />
                        </div>

                        <div className="form-group">
                            <label>Area Type</label>
                            <select
                                value={editedField.type}
                                onChange={(e) => handleChange({ type: e.target.value as any })}
                            >
                                {AREA_TYPES.map(type => (
                                    <option key={type} value={type}>
                                        {type.replace('_', ' ')}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Crop Type</label>
                            <select
                                value={editedField.cropType || ''}
                                onChange={(e) => handleChange({ cropType: e.target.value })}
                            >
                                <option value="">Select crop</option>
                                {CROP_TYPES.map(crop => (
                                    <option key={crop} value={crop}>{crop}</option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Quality Grade</label>
                            <select
                                value={editedField.qualityGrade || ''}
                                onChange={(e) => handleChange({ qualityGrade: e.target.value as any })}
                            >
                                <option value="">Select quality grade</option>
                                {QUALITY_GRADES.map(grade => (
                                    <option key={grade.value} value={grade.value}>
                                        {grade.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Crop Variety</label>
                            <input
                                type="text"
                                value={editedField.variety || ''}
                                onChange={(e) => handleChange({ variety: e.target.value })}
                                placeholder="Enter crop variety"
                            />
                        </div>

                        <div className="form-group">
                            <label>Field Health (0-100)</label>
                            <input
                                type="range"
                                min="0"
                                max="100"
                                value={editedField.health || 50}
                                onChange={(e) => handleChange({ health: Number(e.target.value) })}
                            />
                            <span className="range-value">{editedField.health || 50}%</span>
                        </div>

                        <div className="form-group">
                            <label>NDVI Index</label>
                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                max="1"
                                value={editedField.ndvi || ''}
                                onChange={(e) => handleChange({ ndvi: Number(e.target.value) })}
                                placeholder="0.0 - 1.0"
                            />
                        </div>

                        <div className="form-group">
                            <label>Stress Level (0-100)</label>
                            <input
                                type="range"
                                min="0"
                                max="100"
                                value={editedField.stressLevel || 0}
                                onChange={(e) => handleChange({ stressLevel: Number(e.target.value) })}
                            />
                            <span className="range-value">{editedField.stressLevel || 0}%</span>
                        </div>

                        <div className="form-group full-width">
                            <label>Field Color</label>
                            <ColorPicker
                                color={editedField.color}
                                onChange={(color) => handleChange({ color })}
                            />
                        </div>

                        <div className="form-group full-width">
                            <label>Notes</label>
                            <textarea
                                value={editedField.notes || ''}
                                onChange={(e) => handleChange({ notes: e.target.value })}
                                rows={3}
                                placeholder="Additional notes about this field..."
                            />
                        </div>
                    </div>
                )}

                {/* Temporal Data Tab */}
                {activeTab === 'temporal' && (
                    <div className="form-grid">
                        <div className="form-group">
                            <label>Planting Date</label>
                            <input
                                type="date"
                                value={formatDate(editedField.plantingDate)}
                                onChange={(e) => handleChange({ plantingDate: parseDate(e.target.value) })}
                            />
                        </div>

                        <div className="form-group">
                            <label>Harvest Date</label>
                            <input
                                type="date"
                                value={formatDate(editedField.harvestDate)}
                                onChange={(e) => handleChange({ harvestDate: parseDate(e.target.value) })}
                            />
                        </div>
                        <div className="form-group">
                            <label>Growth Stage</label>
                            <select
                                value={editedField.growthStage || ''}
                                onChange={(e) => handleChange({ growthStage: e.target.value as GrowthStage })}
                            >
                                <option value="">Select growth stage</option>
                                {(Object.keys(GROWTH_STAGES) as GrowthStage[]).map(stage => (
                                    <option key={stage} value={stage}>
                                        {GROWTH_STAGES[stage]}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Expected Yield (tons/acre)</label>
                            <input
                                type="number"
                                step="0.1"
                                value={editedField.expectedYield || ''}
                                onChange={(e) => handleChange({ expectedYield: Number(e.target.value) })}
                            />
                        </div>

                        <div className="form-group">
                            <label>Quality Grade</label>
                            <select
                                value={editedField.qualityGrade || ''}
                                onChange={(e) => handleChange({ qualityGrade: e.target.value as any })}
                            >
                                <option value="">Select quality grade</option>
                                <option value="premium">⭐ Premium</option>
                                <option value="standard">✅ Standard</option>
                                <option value="commercial">📦 Commercial</option>
                            </select>
                        </div>

                        <div className="form-group full-width">
                            <label>Historical Yields (comma-separated, tons/acre)</label>
                            <input
                                type="text"
                                value={editedField.historicalYields?.join(', ') || ''}
                                onChange={(e) => handleChange({
                                    historicalYields: e.target.value.split(',').map(val => parseFloat(val.trim())).filter(val => !isNaN(val))
                                })}
                                placeholder="e.g., 3.2, 3.5, 3.8, 4.1"
                            />
                        </div>
                    </div>
                )}

                {/* Soil & Environment Tab */}
                {activeTab === 'soil' && (
                    <div className="form-grid">
                        <div className="form-group">
                            <label>Soil Type</label>
                            <select
                                value={editedField.soilType || ''}
                                onChange={(e) => handleChange({ soilType: e.target.value })}
                            >
                                <option value="">Select soil type</option>
                                {SOIL_TYPES.map(soil => (
                                    <option key={soil} value={soil}>{soil}</option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Elevation (meters)</label>
                            <input
                                type="number"
                                value={editedField.elevation || ''}
                                onChange={(e) => handleChange({ elevation: Number(e.target.value) })}
                                placeholder="Above sea level"
                            />
                        </div>

                        <div className="form-group">
                            <label>Slope (%)</label>
                            <input
                                type="number"
                                step="0.1"
                                value={editedField.slope || ''}
                                onChange={(e) => handleChange({ slope: Number(e.target.value) })}
                                placeholder="0-100%"
                            />
                        </div>

                        {/* Soil Analysis Subsection */}
                        <div className="form-section-header">
                            <h4>Soil Analysis</h4>
                        </div>

                        <div className="form-group">
                            <label>pH Level</label>
                            <input
                                type="number"
                                step="0.1"
                                min="0"
                                max="14"
                                value={editedField.soilAnalysis?.phLevel || ''}
                                onChange={(e) => handleNestedChange('soilAnalysis', { phLevel: Number(e.target.value) })}
                            />
                        </div>

                        <div className="form-group">
                            <label>Nitrogen (ppm)</label>
                            <input
                                type="number"
                                step="1"
                                value={editedField.soilAnalysis?.nitrogen || ''}
                                onChange={(e) => handleNestedChange('soilAnalysis', { nitrogen: Number(e.target.value) })}
                            />
                        </div>

                        <div className="form-group">
                            <label>Phosphorus (ppm)</label>
                            <input
                                type="number"
                                step="1"
                                value={editedField.soilAnalysis?.phosphorus || ''}
                                onChange={(e) => handleNestedChange('soilAnalysis', { phosphorus: Number(e.target.value) })}
                            />
                        </div>

                        <div className="form-group">
                            <label>Potassium (ppm)</label>
                            <input
                                type="number"
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
                            <h4>Irrigation Schedule</h4>
                        </div>

                        <div className="form-group">
                            <label>Frequency</label>
                            <select
                                value={editedField.irrigation?.frequency || 'weekly'}
                                onChange={(e) => handleNestedChange('irrigation', { frequency: e.target.value as any })}
                            >
                                <option value="daily">Daily</option>
                                <option value="weekly">Weekly</option>
                                <option value="custom">Custom</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Duration (minutes)</label>
                            <input
                                type="number"
                                value={editedField.irrigation?.duration || ''}
                                onChange={(e) => handleNestedChange('irrigation', { duration: Number(e.target.value) })}
                            />
                        </div>

                        <div className="form-group">
                            <label>Water Amount (liters)</label>
                            <input
                                type="number"
                                value={editedField.irrigation?.waterAmount || ''}
                                onChange={(e) => handleNestedChange('irrigation', { waterAmount: Number(e.target.value) })}
                            />
                        </div>

                        {/* Basic Economic Data */}
                        <div className="form-section-header">
                            <h4>Economic Data</h4>
                        </div>

                        <div className="form-group">
                            <label>Input Costs ($/acre)</label>
                            <input
                                type="number"
                                step="0.01"
                                value={editedField.inputCosts || ''}
                                onChange={(e) => handleChange({ inputCosts: Number(e.target.value) })}
                            />
                        </div>

                        <div className="form-group">
                            <label>Expected Revenue ($/acre)</label>
                            <input
                                type="number"
                                step="0.01"
                                value={editedField.expectedRevenue || ''}
                                onChange={(e) => handleChange({ expectedRevenue: Number(e.target.value) })}
                            />
                        </div>

                        <div className="form-group">
                            <label>Profit Margin (%)</label>
                            <input
                                type="number"
                                step="0.1"
                                value={editedField.profitMargin || ''}
                                onChange={(e) => handleChange({ profitMargin: Number(e.target.value) })}
                                readOnly={!!(editedField.inputCosts && editedField.expectedRevenue)}
                            />
                        </div>
                    </div>
                )}

                {/* Economic Data Tab */}
                {activeTab === 'economic' && (
                    <div className="form-grid">
                        <div className="form-group">
                            <label>Total Input Costs ($)</label>
                            <input
                                type="number"
                                step="0.01"
                                value={editedField.inputCosts || ''}
                                onChange={(e) => handleChange({ inputCosts: Number(e.target.value) })}
                            />
                        </div>

                        <div className="form-group">
                            <label>Expected Revenue ($)</label>
                            <input
                                type="number"
                                step="0.01"
                                value={editedField.expectedRevenue || ''}
                                onChange={(e) => handleChange({ expectedRevenue: Number(e.target.value) })}
                            />
                        </div>

                        <div className="form-group">
                            <label>Profit Margin (%)</label>
                            <div className="calculated-value">
                                {editedField.inputCosts && editedField.expectedRevenue
                                    ? (((editedField.expectedRevenue - editedField.inputCosts) / editedField.expectedRevenue) * 100).toFixed(1)
                                    : '0.0'
                                }%
                            </div>
                        </div>

                        <div className="form-group full-width">
                            <label>Additional Economic Notes</label>
                            <textarea
                                value={editedField.notes || ''}
                                onChange={(e) => handleChange({ notes: e.target.value })}
                                rows={3}
                                placeholder="Additional economic considerations..."
                            />
                        </div>
                    </div>
                )}
            </div>

            <div className="form-actions">
                <button className="save-button" onClick={handleSave}>
                    💾 Save Changes
                </button>
                <button className="cancel-button" onClick={onClose}>
                    ⎋ Cancel
                </button>
            </div>
        </div>
    );
};