// hooks/useAgroDataManager.ts
import { useAgroData } from '@/contexts/AgroDataProvider';
import type { FieldBoundary, Task, ViewMode, DrawingTool, AreaPattern } from '@/types';

export const useAgroDataManager = () => {
  const { state, dispatch, ...helpers } = useAgroData();

  // Farm Configuration
  const setFarmName = (name: string) => 
    dispatch({ type: 'SET_FARM_NAME', payload: name });
  
  const setSeason = (season: string) => 
    dispatch({ type: 'SET_SEASON', payload: season });

  // View Management
  const setViewMode = (mode: ViewMode) => 
    dispatch({ type: 'SET_VIEW_MODE', payload: mode });

  // Field Selection & Editing
  const setSelectedFieldId = (id: string | null) => 
    dispatch({ type: 'SET_SELECTED_FIELD_ID', payload: id });
  
  const setEditingField = (field: FieldBoundary | null) => 
    dispatch({ type: 'SET_EDITING_FIELD', payload: field });
  
  const setShowFieldDetails = (show: boolean) => 
    dispatch({ type: 'SET_SHOW_FIELD_DETAILS', payload: show });

  // Map Navigation
  const setMapCenter = (center: [number, number]) => 
    dispatch({ type: 'SET_MAP_CENTER', payload: center });
  
  const setMapZoom = (zoom: number) => 
    dispatch({ type: 'SET_MAP_ZOOM', payload: zoom });

  // Drawing Tools
  const setSelectedTool = (tool: DrawingTool) => 
    dispatch({ type: 'SET_SELECTED_TOOL', payload: tool });
  
  const setSelectedPattern = (pattern: AreaPattern) => 
    dispatch({ type: 'SET_SELECTED_PATTERN', payload: pattern });
  
  const setDrawingColor = (color: string) => 
    dispatch({ type: 'SET_DRAWING_COLOR', payload: color });

  // Field Management
  const addField = (fieldData: Omit<FieldBoundary, 'id'>) => 
    helpers.createField(fieldData);
  
  const updateField = (id: string, updates: Partial<FieldBoundary>) => 
    dispatch({ type: 'UPDATE_FIELD', payload: { id, updates } });
  
  const deleteField = (id: string) => 
    dispatch({ type: 'DELETE_FIELD', payload: id });
  
  const clearAllFields = () => 
    dispatch({ type: 'CLEAR_ALL_FIELDS' });

  // Task Management
  const addTask = (taskData: Omit<Task, 'id'>) => 
    helpers.createTask(taskData);
  
  const updateTask = (id: string, updates: Partial<Task>) => 
    dispatch({ type: 'UPDATE_TASK', payload: { id, updates } });
  
  const deleteTask = (id: string) => 
    dispatch({ type: 'DELETE_TASK', payload: id });

  // Records Management
  const saveFarmRecord = () => 
    helpers.saveCurrentFarmRecord();
  
  const loadFarmRecord = (recordId: string) => 
    dispatch({ type: 'LOAD_FARM_RECORD', payload: recordId });
  
  const deleteFarmRecord = (recordId: string) => 
    dispatch({ type: 'DELETE_FARM_RECORD', payload: recordId });

  // Bulk Operations
  const resetState = () => 
    dispatch({ type: 'RESET_STATE' });

  return {
    // State
    ...state,
    
    // Computed values
    totalFarmArea: helpers.totalFarmArea,
    estimatedTotalYield: helpers.estimatedTotalYield,
    selectedField: helpers.selectedField,
    currentFarmRecord: helpers.currentFarmRecord,
    
    // Actions
    setFarmName,
    setSeason,
    setViewMode,
    setSelectedFieldId,
    setEditingField,
    setShowFieldDetails,
    setMapCenter,
    setMapZoom,
    setSelectedTool,
    setSelectedPattern,
    setDrawingColor,
    addField,
    updateField,
    deleteField,
    clearAllFields,
    addTask,
    updateTask,
    deleteTask,
    saveFarmRecord,
    loadFarmRecord,
    deleteFarmRecord,
    resetState,
    
    // Import/Export
    exportData: helpers.exportData,
    importData: helpers.importData
  };
};