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
    transformPoint: (point: Point) => Point;
    onZoomIn: () => void;
    onZoomOut: () => void;
    onReset: () => void;
    onMouseDown: (e: React.MouseEvent<HTMLCanvasElement>) => void;
    onMouseMove: (e: React.MouseEvent<HTMLCanvasElement>) => void;
    onMouseUp: (e: React.MouseEvent<HTMLCanvasElement>) => void;
    onMouseLeave: (e: React.MouseEvent<HTMLCanvasElement>) => void;
}

export const AgroMap: React.FC<AgroMapProps> = ({
    backgroundRef,
    canvasRef,
    selectedTool,
    mapZoom,
    fields,
    selectedFieldId,
    drawingColor,
    transformPoint,
    onZoomIn,
    onZoomOut,
    onReset,
    onMouseDown,
    onMouseMove,
    onMouseUp,
    onMouseLeave

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

        // Draw each field
        fields.forEach(field => {
            if (field.points.length < 3) return;

            const isSelected = field.id === selectedFieldId;

            // Transform field points to screen coordinates
            const screenPoints = field.points.map(transformPoint);

            // Draw field polygon
            ctx.beginPath();
            ctx.moveTo(screenPoints[0].x, screenPoints[0].y);

            for (let i = 1; i < screenPoints.length; i++) {
                ctx.lineTo(screenPoints[i].x, screenPoints[i].y);
            }
            ctx.closePath();

            // Fill field
            ctx.fillStyle = field.color + '80'; // Add transparency
            ctx.fill();

            // Draw border
            ctx.strokeStyle = isSelected ? '#ff0000' : field.color;
            ctx.lineWidth = isSelected ? 3 : 2;
            ctx.stroke();

            // Draw field name in the center
            if (screenPoints.length > 0) {
                const centerX = screenPoints.reduce((sum, point) => sum + point.x, 0) / screenPoints.length;
                const centerY = screenPoints.reduce((sum, point) => sum + point.y, 0) / screenPoints.length;

                ctx.fillStyle = isSelected ? '#000000' : '#333333';
                ctx.font = '12px Arial';
                ctx.textAlign = 'center';
                ctx.fillText(field.name, centerX, centerY);

                // Draw area info
                if (field.area) {
                    ctx.font = '10px Arial';
                    ctx.fillText(`${field.area.toFixed(1)} ha`, centerX, centerY + 15);
                }
            }
        });

        // Draw grid (optional)
        drawGrid(ctx, canvas.width, canvas.height, mapZoom);

    }, [fields, selectedFieldId, mapZoom, transformPoint, canvasRef, backgroundRef]);

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
                onMouseDown={onMouseDown}
                onMouseMove={onMouseMove}
                onMouseUp={onMouseUp}
                onMouseLeave={onMouseLeave}
            />
            <ZoomControls
                zoom={mapZoom}
                onZoomIn={onZoomIn}
                onZoomOut={onZoomOut}
                onReset={onReset}
            />
        </div>
    );
};