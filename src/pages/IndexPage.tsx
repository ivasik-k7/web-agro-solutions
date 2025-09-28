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
// import { useTaskManagement } from '@/hooks/useTaskManagement';

const IndexPage: React.FC = () => {
    // Refs
    const containerRef = useRef<HTMLDivElement>(null!);
    const canvasRef = useRef<HTMLCanvasElement>(null!);
    const backgroundRef = useRef<HTMLDivElement>(null!);

    // Custom Hooks
    const {
        fields,
        // setFields,
        selectedFieldId,
        setSelectedFieldId,
        addField,
        updateField,
        deleteField,
        clearAllFields,
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

    // Create field handler for the map navigation hook
    const handleFieldCreate = (fieldData: Omit<FieldBoundary, 'id'>) => {
        const newField = addField(fieldData);
        // Optionally select the newly created field
        if (newField) {
            setSelectedFieldId(newField.id);
        }
    };

    const {
        mapCenter,
        mapZoom,
        isDragging,
        // Add these new properties from the enhanced hook
        isDrawing,
        currentPath,
        transformPoint,
        // inverseTransformPoint,
        zoomIn,
        zoomOut,
        resetView,
        handleCanvasMouseDown,
        handleCanvasMouseMove,
        handleCanvasMouseUp,
        // Add double-click handler for polygon completion
        handleCanvasDoubleClick,
        // setMapCenter,
        // setMapZoom
    } = useMapNavigation({
        containerRef,
        selectedTool,
        fields,
        onFieldSelect: setSelectedFieldId,
        onFieldCreate: handleFieldCreate // Pass the field creation handler
    });

    // UI State
    const [viewMode, setViewMode] = useState<ViewMode>('map');
    const [farmName, setFarmName] = useState('My Farm');
    const [season, setSeason] = useState('Spring 2024');
    const [editingField, setEditingField] = useState<FieldBoundary | null>(null);
    const [showFieldDetails, setShowFieldDetails] = useState(false);

    // Enhanced field operations
    const handleSaveRecord = () => {
        const record = {
            farmName,
            season,
            fields,
            totalArea: totalFarmArea,
            estimatedYield: estimatedTotalYield,
            timestamp: new Date(),
            mapCenter,
            mapZoom
        };

        console.log('Saving farm record:', record);
        // Here you could save to localStorage, send to API, etc.
        alert('Farm record saved successfully!');
    };

    const handleDeleteSelectedField = () => {
        if (selectedFieldId) {
            deleteField(selectedFieldId);
        }
    };

    const renderCurrentView = () => {
        switch (viewMode) {
            case 'analytics':
                return <AnalyticsView fields={fields} />;
            case 'planning':
                return (
                    <PlanningView
                        fields={fields}
                        tasks={[]} // Add tasks when ready
                        onTaskUpdate={() => { }} // Add task update handler
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
                        // Add new props for drawing state
                        isDrawing={isDrawing}
                        currentPath={currentPath}
                        isDragging={isDragging}
                        transformPoint={transformPoint}
                        onZoomIn={zoomIn}
                        onZoomOut={zoomOut}
                        onReset={resetView}
                        onMouseDown={handleCanvasMouseDown}
                        onMouseMove={handleCanvasMouseMove}
                        onMouseUp={handleCanvasMouseUp}
                        onMouseLeave={handleCanvasMouseUp}
                        onDoubleClick={handleCanvasDoubleClick}
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
                onSaveRecord={handleSaveRecord}
                onDeleteSelectedField={handleDeleteSelectedField}
                onClearAllFields={clearAllFields}
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
                            setEditingField(null);
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