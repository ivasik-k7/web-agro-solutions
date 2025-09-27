import { useState, useCallback } from 'react';
import type { DrawingTool, AreaPattern } from '@/types';

interface DrawingState {
    isDrawing: boolean;
    currentPoints: { x: number; y: number }[];
    startPoint: { x: number; y: number } | null;
}

export const useDrawingTools = () => {
    const [selectedTool, setSelectedTool] = useState<DrawingTool>('select');
    const [selectedPattern, setSelectedPattern] = useState<AreaPattern>('grid');
    const [drawingColor, setDrawingColor] = useState('#00c853');
    const [drawingState, setDrawingState] = useState<DrawingState>({
        isDrawing: false,
        currentPoints: [],
        startPoint: null
    });

    const startDrawing = useCallback((point: { x: number; y: number }) => {
        if (selectedTool === 'select' || selectedTool === 'pan') return;

        setDrawingState({
            isDrawing: true,
            currentPoints: [point],
            startPoint: point
        });
    }, [selectedTool]);

    const continueDrawing = useCallback((point: { x: number; y: number }) => {
        if (!drawingState.isDrawing) return;

        setDrawingState(prev => ({
            ...prev,
            currentPoints: [...prev.currentPoints, point]
        }));
    }, [drawingState.isDrawing]);

    const finishDrawing = useCallback(() => {
        setDrawingState({
            isDrawing: false,
            currentPoints: [],
            startPoint: null
        });
    }, []);

    const resetDrawing = useCallback(() => {
        setDrawingState({
            isDrawing: false,
            currentPoints: [],
            startPoint: null
        });
    }, []);

    return {
        // State
        selectedTool,
        selectedPattern,
        drawingColor,
        drawingState,
        
        // Setters
        setSelectedTool,
        setSelectedPattern,
        setDrawingColor,
        
        // Drawing actions
        startDrawing,
        continueDrawing,
        finishDrawing,
        resetDrawing
    };
};