// pages/index.tsx
import React, { useRef } from 'react';
import { useAgroDataManager } from '@/hooks/useAgroDataManager';

import { PlanningView } from '@components/PlanningView';
import { LeftSidebar, RightSidebar } from "@components/Sidebar";
import { AnalyticsView } from "@/components/AnalyticsPage";
import { FieldDetailsPanel } from '@components/FieldDetailsPanel';
import { AgroMap } from '@/components/AgroMap';

import { useDrawingTools } from '@hooks/useDrawingTools';
import { useMapNavigation } from '@hooks/useMapNavigation';
import type { FieldBoundary, Task } from '@/types';

const AppContent: React.FC = () => {
    const containerRef = useRef<HTMLDivElement>(null!);
    const canvasRef = useRef<HTMLCanvasElement>(null!);
    const backgroundRef = useRef<HTMLDivElement>(null!);

    // Use the new data manager
    const agroData = useAgroDataManager();

    // Use existing hooks for drawing and map navigation
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
        const newField = agroData.addField(fieldData);
        // Optionally select the newly created field
        if (newField) {
            agroData.setSelectedFieldId(newField.id);
        }
    };

    const {
        mapCenter,
        mapZoom,
        isDragging,
        isDrawing,
        currentPath,
        transformPoint,
        zoomIn,
        zoomOut,
        resetView,
        handleCanvasMouseDown,
        handleCanvasMouseMove,
        handleCanvasMouseUp,
        handleCanvasDoubleClick,
    } = useMapNavigation({
        containerRef,
        selectedTool,
        fields: agroData.fields,
        onFieldSelect: agroData.setSelectedFieldId,
        onFieldCreate: handleFieldCreate
    });

    // Sync map state with data provider
    // React.useEffect(() => {
    //     agroData.setMapCenter(mapCenter);
    //     agroData.setMapZoom(mapZoom);
    // }, [mapCenter, mapZoom]);

    const handleSaveRecord = () => {
        const record = agroData.saveFarmRecord();
        console.log('Saving farm record:', record);
        alert('Farm record saved successfully!');
    };

    const handleDeleteSelectedField = () => {
        if (agroData.selectedFieldId) {
            agroData.deleteField(agroData.selectedFieldId);
        }
    };

    const renderCurrentView = () => {
        switch (agroData.viewMode) {
            case 'analytics':
            case 'planning':
                return (
                    <PlanningView
                        fields={agroData.fields}
                        tasks={agroData.tasks} onTaskUpdate={function (taskId: string, status: Task['status'], actualDuration?: number): void {
                            throw new Error('Function not implemented.');
                        }}                        // onTaskUpdate={(taskId, updates) => agroData.updateTask(taskId, updates)}
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
                        fields={agroData.fields}
                        selectedFieldId={agroData.selectedFieldId}
                        drawingColor={drawingColor}
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
                viewMode={agroData.viewMode}
                selectedTool={selectedTool}
                selectedPattern={selectedPattern}
                drawingColor={drawingColor}
                farmName={agroData.farmName}
                season={agroData.season}
                fields={agroData.fields}
                totalFarmArea={agroData.totalFarmArea}
                estimatedTotalYield={agroData.estimatedTotalYield}
                onViewModeChange={agroData.setViewMode}
                onToolSelect={setSelectedTool}
                onPatternSelect={setSelectedPattern}
                onColorChange={setDrawingColor}
                onFarmNameChange={agroData.setFarmName}
                onSeasonChange={agroData.setSeason}
                onSaveRecord={handleSaveRecord}
                onDeleteSelectedField={handleDeleteSelectedField}
                onClearAllFields={agroData.clearAllFields}
                selectedField={agroData.selectedFieldId}
            />

            {/* Main Content */}
            <div className="main-content" ref={containerRef}>
                {renderCurrentView()}
            </div>

            {/* Right Sidebar */}
            <RightSidebar
                fields={agroData.fields}
                selectedField={agroData.selectedFieldId}
                onFieldSelect={agroData.setSelectedFieldId}
                onFieldEdit={(field) => {
                    agroData.setEditingField(field);
                    agroData.setShowFieldDetails(true);
                }}
            />

            {/* Field Details Modal */}
            {agroData.showFieldDetails && agroData.editingField && (
                <div className="modal-overlay">
                    <FieldDetailsPanel
                        field={agroData.editingField}
                        onUpdate={(updatedField) => {
                            agroData.updateField(updatedField.id, updatedField);
                            agroData.setShowFieldDetails(false);
                            agroData.setEditingField(null);
                        }}
                        onClose={() => {
                            agroData.setShowFieldDetails(false);
                            agroData.setEditingField(null);
                        }}
                    />
                </div>
            )}
        </div>
    );
};

const IndexPage: React.FC = () => {
    return <AppContent />
};

export default IndexPage;