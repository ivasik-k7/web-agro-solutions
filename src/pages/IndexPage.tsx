import React, { useRef, useState } from 'react';
import type { FieldBoundary, ViewMode } from '@/types';

import { PlanningView } from '@components/PlanningView'
import { LeftSidebar, RightSidebar } from "@components/Sidebar"
import { AnalyticsView } from "@components/AnalyticsView"
import { FieldDetailsPanel } from '@components/FieldDetailsPanel';
import { AgroMap } from '@/components/AgroMap';

import { useFieldManagement } from '@/hooks/useFieldManagement';
import { useDrawingTools } from '@hooks/useDrawingTools';
import { useMapNavigation } from '@hooks/useMapNavigation';
import { useTaskManagement } from '@/hooks/useTaskManagement';

const IndexPage: React.FC = () => {
    // Refs
    const containerRef = useRef<HTMLDivElement>(null!);
    const canvasRef = useRef<HTMLCanvasElement>(null!);
    const backgroundRef = useRef<HTMLDivElement>(null!);

    // Custom Hooks
    const {
        fields,
        setFields,
        selectedFieldId,
        setSelectedFieldId,
        addField,
        updateField,
        deleteField,
        totalFarmArea,
        estimatedTotalYield
    } = useFieldManagement([]);

    const {
        selectedTool,
        selectedPattern,
        drawingColor,
        setSelectedTool,
        setSelectedPattern,
        setDrawingColor
    } = useDrawingTools();

    const {
        tasks,
        updateTaskStatus
    } = useTaskManagement(fields);

    const {
        mapCenter,
        mapZoom,
        isDragging,
        transformPoint,
        inverseTransformPoint,
        zoomIn,
        zoomOut,
        resetView,
        handleCanvasMouseDown,
        handleCanvasMouseMove,
        handleCanvasMouseUp,
        setMapCenter,
        setMapZoom
    } = useMapNavigation({
        containerRef,
        selectedTool,
        fields,
        onFieldSelect: setSelectedFieldId
    });

    // UI State
    const [viewMode, setViewMode] = useState<ViewMode>('map');
    const [farmName, setFarmName] = useState('');
    const [season, setSeason] = useState('');
    const [editingField, setEditingField] = useState<FieldBoundary | null>(null);
    const [showFieldDetails, setShowFieldDetails] = useState(false);

    const renderCurrentView = () => {
        switch (viewMode) {
            case 'analytics':
                return <AnalyticsView fields={fields} />;
            case 'planning':
                return (
                    <PlanningView
                        fields={fields}
                        tasks={tasks}
                        onTaskUpdate={updateTaskStatus}
                    />
                );
            case 'map':
            default:
                return (
                    <AgroMap
                        backgroundRef={backgroundRef}
                        canvasRef={canvasRef}
                        selectedTool={selectedTool}
                        mapZoom={mapZoom}
                        fields={fields}
                        selectedFieldId={selectedFieldId}
                        drawingColor={drawingColor}
                        transformPoint={transformPoint}
                        onZoomIn={zoomIn}
                        onZoomOut={zoomOut}
                        onReset={resetView}
                        onMouseDown={handleCanvasMouseDown}
                        onMouseMove={handleCanvasMouseMove}
                        onMouseUp={handleCanvasMouseUp}
                        onMouseLeave={handleCanvasMouseUp}
                    />
                );
        }
    };

    return (
        <div className="field-map-app">
            {/* Left Sidebar */}
            <LeftSidebar
                viewMode={viewMode}
                selectedTool={selectedTool}
                selectedPattern={selectedPattern}
                drawingColor={drawingColor}
                farmName={farmName}
                season={season}
                fields={fields}
                totalFarmArea={totalFarmArea}
                estimatedTotalYield={estimatedTotalYield}
                onViewModeChange={setViewMode}
                onToolSelect={setSelectedTool}
                onPatternSelect={setSelectedPattern}
                onColorChange={setDrawingColor}
                onFarmNameChange={setFarmName}
                onSeasonChange={setSeason}
                onSaveRecord={() => {/* Implement save logic */ }}
                onDeleteSelectedField={() => selectedFieldId && deleteField(selectedFieldId)}
                onClearAllFields={() => setFields([])}
                selectedField={selectedFieldId}
            />

            {/* Main Content */}
            <div className="main-content" ref={containerRef}>
                {renderCurrentView()}
            </div>

            {/* Right Sidebar */}
            <RightSidebar
                fields={fields}
                selectedField={selectedFieldId}
                onFieldSelect={setSelectedFieldId}
                onFieldEdit={(field) => {
                    setEditingField(field);
                    setShowFieldDetails(true);
                }}
            />

            {/* Field Details Modal */}
            {showFieldDetails && editingField && (
                <div className="modal-overlay">
                    <FieldDetailsPanel
                        field={editingField}
                        onUpdate={(updatedField) => {
                            updateField(updatedField.id, updatedField);
                            setShowFieldDetails(false);
                        }}
                        onClose={() => {
                            setShowFieldDetails(false);
                            setEditingField(null);
                        }}
                    />
                </div>
            )}
        </div>
    );
}

export default IndexPage;