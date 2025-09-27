import { useState, useCallback, useRef } from 'react';
import type { DrawingTool, FieldBoundary, Point } from '@/types';

interface UseMapNavigationProps {
    containerRef: React.RefObject<HTMLDivElement | null>;
    selectedTool: DrawingTool;
    fields: FieldBoundary[];
    onFieldSelect: (fieldId: string | null) => void;
}

export const useMapNavigation = ({
    containerRef,
    selectedTool,
    fields,
    onFieldSelect
}: UseMapNavigationProps) => {
    const [mapCenter, setMapCenter] = useState<Point>({ x: 600, y: 400 });
    const [mapZoom, setMapZoom] = useState(1);
    const [isDragging, setIsDragging] = useState(false);
    const dragStartRef = useRef<Point>({ x: 0, y: 0 });

    // Transform coordinates
    const transformPointToScreen = useCallback((point: Point): Point => {
        const container = containerRef.current;
        const width = container?.clientWidth || 1200;
        const height = container?.clientHeight || 800;
        
        return {
            x: (point.x - mapCenter.x) * mapZoom + width / 2,
            y: (point.y - mapCenter.y) * mapZoom + height / 2
        };
    }, [mapCenter, mapZoom, containerRef]);

    const transformPointToWorld = useCallback((point: Point): Point => {
        const container = containerRef.current;
        const width = container?.clientWidth || 1200;
        const height = container?.clientHeight || 800;
        
        return {
            x: (point.x - width / 2) / mapZoom + mapCenter.x,
            y: (point.y - height / 2) / mapZoom + mapCenter.y
        };
    }, [mapCenter, mapZoom, containerRef]);

    // Zoom functions
    const zoomIn = useCallback(() => {
        setMapZoom(prev => Math.min(prev * 1.2, 5));
    }, []);

    const zoomOut = useCallback(() => {
        setMapZoom(prev => Math.max(prev / 1.2, 0.2));
    }, []);

    const resetView = useCallback(() => {
        setMapCenter({ x: 600, y: 400 });
        setMapZoom(1);
    }, []);

    const setZoom = useCallback((zoom: number) => {
        setMapZoom(Math.max(0.2, Math.min(5, zoom)));
    }, []);

    // Panning
    const startPanning = useCallback((screenPoint: Point) => {
        if (selectedTool !== 'pan') return;
        
        setIsDragging(true);
        dragStartRef.current = screenPoint;
    }, [selectedTool]);

    const continuePanning = useCallback((screenPoint: Point) => {
        if (!isDragging || selectedTool !== 'pan') return;

        const dx = (screenPoint.x - dragStartRef.current.x) / mapZoom;
        const dy = (screenPoint.y - dragStartRef.current.y) / mapZoom;
        
        setMapCenter(prev => ({
            x: prev.x - dx,
            y: prev.y - dy
        }));
        
        dragStartRef.current = screenPoint;
    }, [isDragging, selectedTool, mapZoom]);

    const stopPanning = useCallback(() => {
        setIsDragging(false);
    }, []);

    // Field selection
    const selectFieldAtPoint = useCallback((screenPoint: Point) => {
        if (selectedTool !== 'select') return;

        const worldPoint = transformPointToWorld(screenPoint);
        
        // Simple point-in-polygon check (simplified for demo)
        const clickedField = fields.find(field => {
            if (field.points.length < 3) return false;
            
            // Basic bounding box check first for performance
            const xs = field.points.map(p => p.x);
            const ys = field.points.map(p => p.y);
            const minX = Math.min(...xs);
            const maxX = Math.max(...xs);
            const minY = Math.min(...ys);
            const maxY = Math.max(...ys);
            
            if (worldPoint.x < minX || worldPoint.x > maxX || worldPoint.y < minY || worldPoint.y > maxY) {
                return false;
            }
            
            // Simple center distance check (replace with proper point-in-polygon in real implementation)
            const centerX = xs.reduce((a, b) => a + b) / xs.length;
            const centerY = ys.reduce((a, b) => a + b) / ys.length;
            const distance = Math.sqrt(
                Math.pow(worldPoint.x - centerX, 2) + Math.pow(worldPoint.y - centerY, 2)
            );
            
            return distance < 100; // Arbitrary threshold
        });

        onFieldSelect(clickedField?.id || null);
    }, [selectedTool, fields, transformPointToWorld, onFieldSelect]);

    // Event handlers
    const handleCanvasMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
        const canvas = e.currentTarget;
        const rect = canvas.getBoundingClientRect();
        const point = {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };

        if (selectedTool === 'pan') {
            startPanning(point);
        } else if (selectedTool === 'select') {
            selectFieldAtPoint(point);
        }
        // Add other tool handlers here
    }, [selectedTool, startPanning, selectFieldAtPoint]);

    const handleCanvasMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
        const canvas = e.currentTarget;
        const rect = canvas.getBoundingClientRect();
        const point = {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };

        if (isDragging) {
            continuePanning(point);
        }
        // Add other tool handlers here
    }, [isDragging, continuePanning]);

    const handleCanvasMouseUp = useCallback(() => {
        if (isDragging) {
            stopPanning();
        }
    }, [isDragging, stopPanning]);

    return {
        // State
        mapCenter,
        mapZoom,
        isDragging,
        
        // Transform functions
        transformPoint: transformPointToScreen,
        inverseTransformPoint: transformPointToWorld,
        
        // Zoom controls
        zoomIn,
        zoomOut,
        resetView,
        setZoom,
        
        // Event handlers
        handleCanvasMouseDown,
        handleCanvasMouseMove,
        handleCanvasMouseUp,
        
        // Direct setters
        setMapCenter,
        setMapZoom
    };
};