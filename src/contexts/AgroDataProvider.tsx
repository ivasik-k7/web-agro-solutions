// contexts/AgroDataProvider.tsx
import React, { createContext, useContext, useReducer, useEffect } from 'react';
import type {
  FieldBoundary,
  ViewMode,
  DrawingTool,
  AreaPattern,
  Task,
  FieldRecord,
  Point,
  LatLng
} from '@/types';

interface AgroDataState {
  // Farm Information
  farmName: string;
  season: string;

  // Core Data
  fields: FieldBoundary[];
  tasks: Task[];

  // UI State
  viewMode: ViewMode;
  selectedFieldId: string | null;
  editingField: FieldBoundary | null;
  showFieldDetails: boolean;

  // Map State
  mapCenter: [number, number];
  mapZoom: number;

  // Drawing Tools
  selectedTool: DrawingTool;
  selectedPattern: AreaPattern;
  drawingColor: string;

  // History & Records
  farmRecords: FieldRecord[];
  currentRecordId: string | null;
}

// Export/Import data interface
interface ExportData {
  farmName: string;
  season: string;
  fields: FieldBoundary[];
  tasks: Task[];
  farmRecords: FieldRecord[];
  exportDate: string;
  version: string;
}

type AgroDataAction =
  // Farm Configuration
  | { type: 'SET_FARM_NAME'; payload: string }
  | { type: 'SET_SEASON'; payload: string }

  // View Management
  | { type: 'SET_VIEW_MODE'; payload: ViewMode }

  // Field Selection & Editing
  | { type: 'SET_SELECTED_FIELD_ID'; payload: string | null }
  | { type: 'SET_EDITING_FIELD'; payload: FieldBoundary | null }
  | { type: 'SET_SHOW_FIELD_DETAILS'; payload: boolean }

  // Map Navigation
  | { type: 'SET_MAP_CENTER'; payload: [number, number] }
  | { type: 'SET_MAP_ZOOM'; payload: number }

  // Drawing Tools
  | { type: 'SET_SELECTED_TOOL'; payload: DrawingTool }
  | { type: 'SET_SELECTED_PATTERN'; payload: AreaPattern }
  | { type: 'SET_DRAWING_COLOR'; payload: string }

  // Field Management
  | { type: 'ADD_FIELD'; payload: FieldBoundary }
  | { type: 'UPDATE_FIELD'; payload: { id: string; updates: Partial<FieldBoundary> } }
  | { type: 'DELETE_FIELD'; payload: string }
  | { type: 'CLEAR_ALL_FIELDS' }

  // Task Management
  | { type: 'ADD_TASK'; payload: Task }
  | { type: 'UPDATE_TASK'; payload: { id: string; updates: Partial<Task> } }
  | { type: 'DELETE_TASK'; payload: string }

  // Records Management
  | { type: 'SAVE_FARM_RECORD'; payload: FieldRecord }
  | { type: 'LOAD_FARM_RECORD'; payload: string } // record id
  | { type: 'DELETE_FARM_RECORD'; payload: string } // record id

  // Bulk Operations
  | { type: 'RESET_STATE' }
  | { type: 'LOAD_STATE'; payload: Partial<AgroDataState> }
  | { type: 'IMPORT_DATA'; payload: ExportData };

const initialState: AgroDataState = {
  farmName: 'My Farm',
  season: 'Spring 2024',
  fields: [],
  tasks: [],
  viewMode: 'map',
  selectedFieldId: null,
  editingField: null,
  showFieldDetails: false,
  mapCenter: [0, 0],
  mapZoom: 1,
  selectedTool: 'select',
  selectedPattern: 'grid',
  drawingColor: '#00a86b',
  farmRecords: [],
  currentRecordId: null
};

// Helper function to generate unique IDs
const generateId = (): string => `field_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

// Date serialization helpers for localStorage
const serializeState = (state: AgroDataState) => {
  return JSON.stringify(state, (_, value) => {
    if (value instanceof Date) {
      return { __type: 'Date', value: value.toISOString() };
    }
    return value;
  });
};

const deserializeState = (stateStr: string): AgroDataState => {
  return JSON.parse(stateStr, (key, value) => {
    if (value && value.__type === 'Date') {
      return new Date(value.value);
    }
    return value;
  });
};

const agroDataReducer = (state: AgroDataState, action: AgroDataAction): AgroDataState => {
  switch (action.type) {
    // Farm Configuration
    case 'SET_FARM_NAME':
      return { ...state, farmName: action.payload };

    case 'SET_SEASON':
      return { ...state, season: action.payload };

    // View Management
    case 'SET_VIEW_MODE':
      return { ...state, viewMode: action.payload };

    // Field Selection & Editing
    case 'SET_SELECTED_FIELD_ID':
      return { ...state, selectedFieldId: action.payload };

    case 'SET_EDITING_FIELD':
      return { ...state, editingField: action.payload };

    case 'SET_SHOW_FIELD_DETAILS':
      return { ...state, showFieldDetails: action.payload };

    // Map Navigation
    case 'SET_MAP_CENTER':
      return { ...state, mapCenter: action.payload };

    case 'SET_MAP_ZOOM':
      return { ...state, mapZoom: action.payload };

    // Drawing Tools
    case 'SET_SELECTED_TOOL':
      return { ...state, selectedTool: action.payload };

    case 'SET_SELECTED_PATTERN':
      return { ...state, selectedPattern: action.payload };

    case 'SET_DRAWING_COLOR':
      return { ...state, drawingColor: action.payload };

    // Field Management
    case 'ADD_FIELD':
      return { ...state, fields: [...state.fields, action.payload] };

    case 'UPDATE_FIELD':
      return {
        ...state,
        fields: state.fields.map(field =>
          field.id === action.payload.id
            ? { ...field, ...action.payload.updates }
            : field
        )
      };

    case 'DELETE_FIELD':
      return {
        ...state,
        fields: state.fields.filter(field => field.id !== action.payload),
        selectedFieldId: state.selectedFieldId === action.payload ? null : state.selectedFieldId,
        editingField: state.editingField?.id === action.payload ? null : state.editingField
      };

    case 'CLEAR_ALL_FIELDS':
      return {
        ...state,
        fields: [],
        selectedFieldId: null,
        editingField: null,
        showFieldDetails: false
      };

    // Task Management
    case 'ADD_TASK':
      return { ...state, tasks: [...state.tasks, action.payload] };

    case 'UPDATE_TASK':
      return {
        ...state,
        tasks: state.tasks.map(task =>
          task.id === action.payload.id
            ? { ...task, ...action.payload.updates }
            : task
        )
      };

    case 'DELETE_TASK':
      return {
        ...state,
        tasks: state.tasks.filter(task => task.id !== action.payload)
      };

    // Records Management
    case 'SAVE_FARM_RECORD': {
      const newRecords = state.farmRecords.filter(record => record.id !== action.payload.id);
      return {
        ...state,
        farmRecords: [...newRecords, action.payload],
        currentRecordId: action.payload.id
      };
    }

    case 'LOAD_FARM_RECORD': {
      const record = state.farmRecords.find(r => r.id === action.payload);
      if (!record) return state;

      return {
        ...state,
        farmName: record.farmName,
        season: record.season,
        fields: record.fields,
        mapCenter: [record.center.lat, record.center.lng],
        mapZoom: record.zoom,
        currentRecordId: record.id
      };
    }

    case 'DELETE_FARM_RECORD':
      return {
        ...state,
        farmRecords: state.farmRecords.filter(record => record.id !== action.payload),
        currentRecordId: state.currentRecordId === action.payload ? null : state.currentRecordId
      };

    // Bulk Operations
    case 'RESET_STATE':
      return initialState;

    case 'LOAD_STATE':
      return { ...state, ...action.payload };

    case 'IMPORT_DATA':
      return {
        ...state,
        farmName: action.payload.farmName,
        season: action.payload.season,
        fields: action.payload.fields,
        tasks: action.payload.tasks,
        farmRecords: action.payload.farmRecords
      };

    default:
      return state;
  }
};

interface AgroDataContextType {
  state: AgroDataState;
  dispatch: React.Dispatch<AgroDataAction>;

  // Computed values
  totalFarmArea: number;
  estimatedTotalYield: number;
  selectedField: FieldBoundary | null;
  currentFarmRecord: FieldRecord | null;

  // Helper methods
  createField: (fieldData: Omit<FieldBoundary, 'id'>) => FieldBoundary;
  createTask: (taskData: Omit<Task, 'id'>) => Task;
  saveCurrentFarmRecord: () => FieldRecord;
  exportData: () => string;
  importData: (data: string) => void;
}

const AgroDataContext = createContext<AgroDataContextType | undefined>(undefined);

export const AgroDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(agroDataReducer, initialState);

  // Load state from localStorage on mount
  useEffect(() => {
    const savedState = localStorage.getItem('agro-data-state');
    if (savedState) {
      try {
        const parsedState = deserializeState(savedState);
        dispatch({ type: 'LOAD_STATE', payload: parsedState });
      } catch (error) {
        console.error('Failed to load state from localStorage:', error);
      }
    }
  }, []);

  // Save state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('agro-data-state', serializeState(state));
  }, [state]);

  // Computed values
  const totalFarmArea = state.fields.reduce((total, field) => total + (field.area || 0), 0);
  const estimatedTotalYield = state.fields.reduce((total, field) => total + (field.expectedYield || 0), 0);
  const selectedField = state.fields.find(field => field.id === state.selectedFieldId) || null;
  const currentFarmRecord = state.farmRecords.find(record => record.id === state.currentRecordId) || null;

  // Helper methods
  const createField = (fieldData: Omit<FieldBoundary, 'id'>): FieldBoundary => {
    const newField: FieldBoundary = {
      ...fieldData,
      id: generateId()
    };
    dispatch({ type: 'ADD_FIELD', payload: newField });
    return newField;
  };

  const createTask = (taskData: Omit<Task, 'id'>): Task => {
    const newTask: Task = {
      ...taskData,
      id: generateId()
    };
    dispatch({ type: 'ADD_TASK', payload: newTask });
    return newTask;
  };

  const saveCurrentFarmRecord = (): FieldRecord => {
    const record: FieldRecord = {
      id: generateId(),
      farmName: state.farmName,
      season: state.season,
      timestamp: new Date(),
      fields: state.fields,
      center: { lat: state.mapCenter[0], lng: state.mapCenter[1] },
      zoom: state.mapZoom,
      totalArea: totalFarmArea,
      estimatedYield: estimatedTotalYield,
      tasks: state.tasks
    };

    dispatch({ type: 'SAVE_FARM_RECORD', payload: record });
    return record;
  };

  const exportData = (): string => {
    const exportData: ExportData = {
      farmName: state.farmName,
      season: state.season,
      fields: state.fields,
      tasks: state.tasks,
      farmRecords: state.farmRecords,
      exportDate: new Date().toISOString(),
      version: '1.0'
    };
    return JSON.stringify(exportData, null, 2);
  };

  const importData = (data: string): void => {
    try {
      const importedData: ExportData = JSON.parse(data);
      dispatch({ type: 'IMPORT_DATA', payload: importedData });
    } catch (error) {
      console.error('Failed to import data:', error);
      throw new Error('Invalid data format');
    }
  };

  const value: AgroDataContextType = {
    state,
    dispatch,
    totalFarmArea,
    estimatedTotalYield,
    selectedField,
    currentFarmRecord,
    createField,
    createTask,
    saveCurrentFarmRecord,
    exportData,
    importData
  };

  return (
    <AgroDataContext.Provider value={value}>
      {children}
    </AgroDataContext.Provider>
  );
};

export const useAgroData = (): AgroDataContextType => {
  const context = useContext(AgroDataContext);
  if (context === undefined) {
    throw new Error('useAgroData must be used within an AgroDataProvider');
  }
  return context;
};