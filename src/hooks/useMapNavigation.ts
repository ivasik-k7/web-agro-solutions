import { useState, useCallback, useRef } from 'react';
import type { DrawingTool, FieldBoundary, Point } from '@/types';

interface UseMapNavigationProps {
    containerRef: React.RefObject<HTMLDivElement | null>;
    selectedTool: DrawingTool;
    fields: FieldBoundary[];
    onFieldSelect: (fieldId: string | null) => void;
    onFieldCreate?: (field: Omit<FieldBoundary, 'id'>) => void;
}

export const useMapNavigation = ({
    containerRef,
    selectedTool,
    fields,
    onFieldSelect,
    onFieldCreate
}: UseMapNavigationProps) => {
    const [mapCenter, setMapCenter] = useState<Point>({ x: 600, y: 400 });
    const [mapZoom, setMapZoom] = useState(1);
    const [isDragging, setIsDragging] = useState(false);
    const dragStartRef = useRef<Point>({ x: 0, y: 0 });

    // Drawing state
    const [isDrawing, setIsDrawing] = useState(false);
    const [currentPath, setCurrentPath] = useState<Point[]>([]);
    const drawingStartRef = useRef<Point | null>(null);

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

    // Utility functions
    const calculatePolygonArea = useCallback((points: Point[]): number => {
        if (points.length < 3) return 0;
        
        let area = 0;
        for (let i = 0; i < points.length; i++) {
            const j = (i + 1) % points.length;
            area += points[i].x * points[j].y;
            area -= points[j].x * points[i].y;
        }
        
        // Convert to approximate hectares (very rough conversion)
        const pixelArea = Math.abs(area) / 2;
        return Math.max(pixelArea * 0.0001 / (mapZoom * mapZoom), 0.1);
    }, [mapZoom]);

    const generateFieldColor = useCallback((): string => {
        const colors = ['#4CAF50', '#2196F3', '#FF9800', '#9C27B0', '#F44336', '#00BCD4', '#8BC34A'];
        return colors[fields.length % colors.length];
    }, [fields.length]);

    // Point-in-polygon test
    const isPointInPolygon = useCallback((point: Point, polygon: Point[]): boolean => {
        let inside = false;
        for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
            const xi = polygon[i].x, yi = polygon[i].y;
            const xj = polygon[j].x, yj = polygon[j].y;
            
            if (((yi > point.y) !== (yj > point.y)) &&
                (point.x < (xj - xi) * (point.y - yi) / (yj - yi) + xi)) {
                inside = !inside;
            }
        }
        return inside;
    }, []);

    // Create field from drawn path
    const createFieldFromPath = useCallback((worldPoints: Point[]) => {
        if (!onFieldCreate || worldPoints.length < 3) return;

        const area = calculatePolygonArea(worldPoints);
        const fieldCount = fields.filter(f => f.type === 'field').length;
        
        const newField: Omit<FieldBoundary, 'id'> = {
            name: `Field ${fieldCount + 1}`,
            type: 'field',
            points: worldPoints,
            color: generateFieldColor(),
            area,
            cropType: 'Not specified',
            health: Math.floor(Math.random() * 25) + 75,
            expectedYield: parseFloat((Math.random() * 3 + 2.5).toFixed(1)),
            notes: 'Newly created field',
            growthStage: 'planning'
        };

        onFieldCreate(newField);
    }, [onFieldCreate, calculatePolygonArea, generateFieldColor, fields]);

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

    // Panning functions
    const startPanning = useCallback((screenPoint: Point) => {
        setIsDragging(true);
        dragStartRef.current = screenPoint;
    }, []);

    const continuePanning = useCallback((screenPoint: Point) => {
        if (!isDragging) return;

        const dx = (screenPoint.x - dragStartRef.current.x) / mapZoom;
        const dy = (screenPoint.y - dragStartRef.current.y) / mapZoom;
        
        setMapCenter(prev => ({
            x: prev.x - dx,
            y: prev.y - dy
        }));
        
        dragStartRef.current = screenPoint;
    }, [isDragging, mapZoom]);

    const stopPanning = useCallback(() => {
        setIsDragging(false);
    }, []);

    // Field selection
    const selectFieldAtPoint = useCallback((screenPoint: Point) => {
        const clickedField = fields.find(field => {
            if (field.points.length < 3) return false;
            const screenPoints = field.points.map(transformPointToScreen);
            return isPointInPolygon(screenPoint, screenPoints);
        });

        onFieldSelect(clickedField?.id || null);
        return !!clickedField;
    }, [fields, transformPointToScreen, isPointInPolygon, onFieldSelect]);

    // Drawing functions
    const startDrawing = useCallback((screenPoint: Point) => {
        const worldPoint = transformPointToWorld(screenPoint);
        setIsDrawing(true);
        setCurrentPath([worldPoint]);
        drawingStartRef.current = worldPoint;
    }, [transformPointToWorld]);

    const continueDrawing = useCallback((screenPoint: Point) => {
        if (!isDrawing || !drawingStartRef.current) return;

        const worldPoint = transformPointToWorld(screenPoint);

        if (selectedTool === 'freehand') {
            setCurrentPath(prev => [...prev, worldPoint]);
        } else if (selectedTool === 'rectangle') {
            const start = drawingStartRef.current;
            const rectPoints = [
                start,
                { x: worldPoint.x, y: start.y },
                worldPoint,
                { x: start.x, y: worldPoint.y }
            ];
            setCurrentPath(rectPoints);
        } else if (selectedTool === 'circle') {
            const center = drawingStartRef.current;
            const radius = Math.sqrt(
                Math.pow(worldPoint.x - center.x, 2) + 
                Math.pow(worldPoint.y - center.y, 2)
            );
            
            const circlePoints: Point[] = [];
            const segments = 32;
            for (let i = 0; i < segments; i++) {
                const angle = (i / segments) * 2 * Math.PI;
                circlePoints.push({
                    x: center.x + Math.cos(angle) * radius,
                    y: center.y + Math.sin(angle) * radius
                });
            }
            setCurrentPath(circlePoints);
        }
    }, [isDrawing, selectedTool, transformPointToWorld]);

    const addPolygonPoint = useCallback((screenPoint: Point) => {
        if (selectedTool !== 'polygon' || !isDrawing) return;
        
        const worldPoint = transformPointToWorld(screenPoint);
        setCurrentPath(prev => [...prev, worldPoint]);
    }, [selectedTool, isDrawing, transformPointToWorld]);

    const finishDrawing = useCallback(() => {
        if (!isDrawing) return;

        if (currentPath.length >= 3) {
            createFieldFromPath(currentPath);
        }

        setIsDrawing(false);
        setCurrentPath([]);
        drawingStartRef.current = null;
    }, [isDrawing, currentPath, createFieldFromPath]);

    // Event handlers
    const handleCanvasMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
        const canvas = e.currentTarget;
        const rect = canvas.getBoundingClientRect();
        const screenPoint = {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };

        if (selectedTool === 'select') {
            const fieldSelected = selectFieldAtPoint(screenPoint);
            if (!fieldSelected) {
                // Start panning if no field was clicked
                startPanning(screenPoint);
            }
        } else if (selectedTool === 'pan') {
            startPanning(screenPoint);
        } else if (selectedTool === 'polygon') {
            if (!isDrawing) {
                startDrawing(screenPoint);
            } else {
                addPolygonPoint(screenPoint);
            }
        } else if (['rectangle', 'circle', 'freehand'].includes(selectedTool)) {
            startDrawing(screenPoint);
        }
    }, [selectedTool, selectFieldAtPoint, startPanning, startDrawing, addPolygonPoint, isDrawing]);

    const handleCanvasMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
        const canvas = e.currentTarget;
        const rect = canvas.getBoundingClientRect();
        const screenPoint = {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };

        if (isDragging) {
            continuePanning(screenPoint);
        } else if (isDrawing && selectedTool !== 'polygon') {
            continueDrawing(screenPoint);
        }
    }, [isDragging, isDrawing, selectedTool, continuePanning, continueDrawing]);

    const handleCanvasMouseUp = useCallback(() => {
        if (isDragging) {
            stopPanning();
        } else if (isDrawing && selectedTool !== 'polygon') {
            finishDrawing();
        }
    }, [isDragging, isDrawing, selectedTool, stopPanning, finishDrawing]);

    const handleCanvasDoubleClick = useCallback(() => {
        if (selectedTool === 'polygon' && isDrawing) {
            finishDrawing();
        }
    }, [selectedTool, isDrawing, finishDrawing]);

    return {
        // State
        mapCenter,
        mapZoom,
        isDragging,
        isDrawing,
        currentPath,
        
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
        handleCanvasDoubleClick,
        
        // Direct setters
        setMapCenter,
        setMapZoom,
        
        // Drawing utilities
        finishPolygon: finishDrawing
    };
};