import React, { useEffect } from 'react';
import type { DrawingTool, FieldBoundary, Point } from '@/types';
import { ZoomControls } from '@components/ZoomControls';

import "@styles/AgroMap.css"

interface AgroMapProps {
    backgroundRef: React.RefObject<HTMLDivElement>;
    canvasRef: React.RefObject<HTMLCanvasElement>;
    selectedTool: DrawingTool;
    mapZoom: number;
    fields: FieldBoundary[];
    selectedFieldId: string | null;
    drawingColor: string;
    isDrawing?: boolean;
    currentPath?: Point[];
    isDragging?: boolean;
    transformPoint: (point: Point) => Point;
    onZoomIn: () => void;
    onZoomOut: () => void;
    onReset: () => void;
    onMouseDown: (e: React.MouseEvent<HTMLCanvasElement>) => void;
    onMouseMove: (e: React.MouseEvent<HTMLCanvasElement>) => void;
    onMouseUp: (e: React.MouseEvent<HTMLCanvasElement>) => void;
    onMouseLeave: (e: React.MouseEvent<HTMLCanvasElement>) => void;
    onDoubleClick?: (e: React.MouseEvent<HTMLCanvasElement>) => void;
}

export const AgroMap: React.FC<AgroMapProps> = ({
    backgroundRef,
    canvasRef,
    selectedTool,
    mapZoom,
    fields,
    selectedFieldId,
    drawingColor,
    isDrawing = false,
    currentPath = [],
    isDragging = false,
    transformPoint,
    onZoomIn,
    onZoomOut,
    onReset,
    onMouseDown,
    onMouseMove,
    onMouseUp,
    onMouseLeave,
    onDoubleClick
}) => {
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Set canvas size to match container
        const container = backgroundRef.current;
        if (container) {
            canvas.width = container.clientWidth;
            canvas.height = container.clientHeight;
        }

        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw grid first (behind everything)
        drawGrid(ctx, canvas.width, canvas.height, mapZoom);

        // Draw existing fields
        fields.forEach(field => {
            drawField(ctx, field, field.id === selectedFieldId, transformPoint);
        });

        // Draw current drawing path if actively drawing
        if (isDrawing && currentPath.length > 0) {
            drawCurrentPath(ctx, currentPath, drawingColor, transformPoint, selectedTool);
        }

        // Draw tool cursor hints
        drawToolHints(ctx, selectedTool, canvas.width, canvas.height, fields.length);

    }, [fields, selectedFieldId, mapZoom, transformPoint, canvasRef, backgroundRef, isDrawing, currentPath, drawingColor, selectedTool]);

    const drawGrid = (ctx: CanvasRenderingContext2D, width: number, height: number, zoom: number) => {
        const gridSize = 50 * zoom;
        const offsetX = width / 2 % gridSize;
        const offsetY = height / 2 % gridSize;

        ctx.strokeStyle = '#e0e0e0';
        ctx.lineWidth = 0.5;

        // Vertical lines
        for (let x = offsetX; x < width; x += gridSize) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, height);
            ctx.stroke();
        }

        // Horizontal lines
        for (let y = offsetY; y < height; y += gridSize) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(width, y);
            ctx.stroke();
        }
    };

    const drawField = (
        ctx: CanvasRenderingContext2D,
        field: FieldBoundary,
        isSelected: boolean,
        transformPoint: (point: Point) => Point
    ) => {
        if (field.points.length < 3) return;

        // Transform field points to screen coordinates
        const screenPoints = field.points.map(transformPoint);

        // Draw field polygon
        ctx.beginPath();
        ctx.moveTo(screenPoints[0].x, screenPoints[0].y);

        for (let i = 1; i < screenPoints.length; i++) {
            ctx.lineTo(screenPoints[i].x, screenPoints[i].y);
        }
        ctx.closePath();

        // Fill field with transparency
        ctx.fillStyle = field.color + '40'; // Add transparency
        ctx.fill();

        // Draw border
        ctx.strokeStyle = isSelected ? '#ff4444' : field.color;
        ctx.lineWidth = isSelected ? 3 : 2;
        ctx.stroke();

        // Draw selection handles for selected field
        if (isSelected) {
            ctx.fillStyle = '#ff4444';
            screenPoints.forEach(point => {
                ctx.beginPath();
                ctx.arc(point.x, point.y, 4, 0, 2 * Math.PI);
                ctx.fill();
            });
        }

        // Draw field label with background
        const centerX = screenPoints.reduce((sum, point) => sum + point.x, 0) / screenPoints.length;
        const centerY = screenPoints.reduce((sum, point) => sum + point.y, 0) / screenPoints.length;

        // Background for text readability
        const textWidth = field.name.length * 7 + 10;
        const textHeight = field.area ? 35 : 20;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.fillRect(centerX - textWidth / 2, centerY - textHeight / 2, textWidth, textHeight);
        ctx.strokeStyle = isSelected ? '#ff4444' : '#cccccc';
        ctx.lineWidth = 1;
        ctx.strokeRect(centerX - textWidth / 2, centerY - textHeight / 2, textWidth, textHeight);

        // Field name
        ctx.fillStyle = isSelected ? '#ff4444' : '#333333';
        ctx.font = 'bold 12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(field.name, centerX, centerY - 2);

        // Field area
        if (field.area) {
            ctx.font = '10px Arial';
            ctx.fillStyle = '#666666';
            ctx.fillText(`${field.area.toFixed(1)} ha`, centerX, centerY + 12);
        }
    };

    const drawCurrentPath = (
        ctx: CanvasRenderingContext2D,
        path: Point[],
        color: string,
        transformPoint: (point: Point) => Point,
        tool: DrawingTool
    ) => {
        if (path.length === 0) return;

        const screenPoints = path.map(transformPoint);

        // Set drawing style for preview
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]); // Dashed line for preview
        ctx.globalAlpha = 0.8;

        // Draw based on tool type
        if (tool === 'freehand' && screenPoints.length > 1) {
            ctx.beginPath();
            ctx.moveTo(screenPoints[0].x, screenPoints[0].y);
            for (let i = 1; i < screenPoints.length; i++) {
                ctx.lineTo(screenPoints[i].x, screenPoints[i].y);
            }
            ctx.stroke();
        } else if (tool === 'polygon' && screenPoints.length > 0) {
            if (screenPoints.length > 1) {
                ctx.beginPath();
                ctx.moveTo(screenPoints[0].x, screenPoints[0].y);
                for (let i = 1; i < screenPoints.length; i++) {
                    ctx.lineTo(screenPoints[i].x, screenPoints[i].y);
                }
                // Show closing line preview if we have enough points
                if (screenPoints.length > 2) {
                    ctx.setLineDash([2, 2]);
                    ctx.globalAlpha = 0.5;
                    ctx.lineTo(screenPoints[0].x, screenPoints[0].y);
                }
                ctx.stroke();
            }
        } else if ((tool === 'rectangle' || tool === 'circle') && screenPoints.length > 1) {
            // These tools create complete shapes during mouse movement
            ctx.beginPath();
            ctx.moveTo(screenPoints[0].x, screenPoints[0].y);
            for (let i = 1; i < screenPoints.length; i++) {
                ctx.lineTo(screenPoints[i].x, screenPoints[i].y);
            }
            ctx.closePath();
            ctx.stroke();

            // Show preview fill
            ctx.setLineDash([]);
            ctx.fillStyle = color + '20';
            ctx.fill();
        }

        // Reset line dash and draw points
        ctx.setLineDash([]);
        ctx.globalAlpha = 1;

        // Draw vertex points
        ctx.fillStyle = color;
        screenPoints.forEach((point, index) => {
            ctx.beginPath();
            ctx.arc(point.x, point.y, 3, 0, 2 * Math.PI);
            ctx.fill();

            // Number the points for polygon tool
            if (tool === 'polygon' && screenPoints.length > 1) {
                ctx.fillStyle = 'white';
                ctx.font = '10px Arial';
                ctx.textAlign = 'center';
                ctx.fillText((index + 1).toString(), point.x, point.y + 3);
                ctx.fillStyle = color;
            }
        });
    };

    const drawToolHints = (ctx: CanvasRenderingContext2D, tool: DrawingTool, width: number, height: number, fieldCount: number) => {
        // Tool instruction at bottom
        let hintText = '';
        switch (tool) {
            case 'select':
                hintText = 'Click field to select • Drag empty area to pan';
                break;
            case 'pan':
                hintText = 'Drag to pan the map';
                break;
            case 'rectangle':
                hintText = 'Click and drag to draw rectangular field';
                break;
            case 'circle':
                hintText = 'Click and drag to draw circular field';
                break;
            case 'polygon':
                hintText = isDrawing ? 'Double-click or press Enter to finish polygon' : 'Click to start polygon • Click to add points';
                break;
            case 'freehand':
                hintText = 'Click and drag to draw freehand field';
                break;
            case 'measure':
                hintText = 'Click to measure distances and areas';
                break;
        }

        if (hintText) {
            const textWidth = hintText.length * 6.5 + 20;
            ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
            ctx.fillRect((width - textWidth) / 2, height - 35, textWidth, 25);

            ctx.fillStyle = '#ffffff';
            ctx.font = '12px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(hintText, width / 2, height - 18);
        }

        // Field count in top-right corner
        const statsText = `Fields: ${fieldCount}`;
        const statsWidth = 80;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.fillRect(width - statsWidth - 10, 10, statsWidth, 25);
        ctx.strokeStyle = '#cccccc';
        ctx.lineWidth = 1;
        ctx.strokeRect(width - statsWidth - 10, 10, statsWidth, 25);

        ctx.fillStyle = '#333333';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(statsText, width - statsWidth / 2 - 10, 27);
    };

    // Get cursor style based on selected tool
    const getCursorStyle = (): string => {
        switch (selectedTool) {
            case 'pan':
                return isDragging ? 'grabbing' : 'grab';
            case 'select':
                return 'pointer';
            case 'rectangle':
            case 'circle':
            case 'polygon':
            case 'freehand':
                return 'crosshair';
            case 'measure':
                return 'help';
            default:
                return 'default';
        }
    };

    return (
        <div className="agro-map-container">
            <div
                ref={backgroundRef}
                className="map-background"
            />
            <canvas
                ref={canvasRef}
                className="drawing-canvas"
                data-tool={selectedTool}
                style={{ cursor: getCursorStyle() }}
                onMouseDown={onMouseDown}
                onMouseMove={onMouseMove}
                onMouseUp={onMouseUp}
                onMouseLeave={onMouseLeave}
                onDoubleClick={onDoubleClick}
            />
            <ZoomControls
                zoom={mapZoom}
                onZoomIn={onZoomIn}
                onZoomOut={onZoomOut}
                onReset={onReset}
            />

            {/* Drawing status overlay for polygon tool */}
            {selectedTool === 'polygon' && isDrawing && currentPath.length > 0 && (
                <div
                    style={{
                        position: 'absolute',
                        top: '50px',
                        left: '20px',
                        background: 'rgba(0, 0, 0, 0.8)',
                        color: 'white',
                        padding: '8px 12px',
                        borderRadius: '6px',
                        fontSize: '12px',
                        zIndex: 20,
                        pointerEvents: 'none'
                    }}
                >
                    Points: {currentPath.length} • Double-click to finish
                </div>
            )}
        </div>
    );
};