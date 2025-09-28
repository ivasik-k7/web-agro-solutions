import { useState, useCallback, useMemo } from "react";
import type { FieldBoundary, Task } from "@/types";
import { calculateArea } from "@/utils";

export const useFieldManagement = (initialFields: FieldBoundary[] = []) => {
  const [fields, setFields] = useState<FieldBoundary[]>(initialFields);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);

  const selectedField = useMemo(
    () => fields.find((field) => field.id === selectedFieldId) || null,
    [fields, selectedFieldId]
  );

  const totalFarmArea = useMemo(
    () => fields.reduce((total, field) => total + (field.area || 0), 0),
    [fields]
  );

  const estimatedTotalYield = useMemo(
    () =>
      fields.reduce(
        (total, field) =>
          total + (field.expectedYield || 0) * (field.area || 0),
        0
      ),
    [fields]
  );

  const addField = useCallback(
    (fieldData: Partial<FieldBoundary> | Omit<FieldBoundary, 'id'>) => {
      // Handle both Partial<FieldBoundary> and Omit<FieldBoundary, 'id'> types
      const newField: FieldBoundary = {
        id: `field_${Date.now()}_${Math.random()
          .toString(36)
          .substr(2, 9)}`,
        name: fieldData.name || `Field ${fields.length + 1}`,
        type: fieldData.type || "field",
        points: fieldData.points || [],
        color: fieldData.color || "#4CAF50",

        // Basic Information
        cropType: fieldData.cropType,
        variety: fieldData.variety,
        notes: fieldData.notes,
        area:
          fieldData.area ||
          (fieldData.points && fieldData.points.length >= 3 
            ? calculateArea(fieldData.points) 
            : 0),

        // Temporal Data
        plantingDate: fieldData.plantingDate,
        harvestDate: fieldData.harvestDate,
        growthStage: fieldData.growthStage || 'planning',

        // Soil and Environment
        soilType: fieldData.soilType,
        soilAnalysis: fieldData.soilAnalysis,
        elevation: fieldData.elevation,
        slope: fieldData.slope,

        // Health Metrics - provide defaults for new fields
        health: fieldData.health ?? Math.floor(Math.random() * 25) + 75, // 75-100
        ndvi: fieldData.ndvi,
        stressLevel: fieldData.stressLevel ?? Math.floor(Math.random() * 20) + 5, // 5-25

        // Yield and Production
        expectedYield: fieldData.expectedYield ?? 
          parseFloat((Math.random() * 3 + 2.5).toFixed(1)), // 2.5-5.5 tons/ha
        historicalYields: fieldData.historicalYields || [],
        qualityGrade: fieldData.qualityGrade || 'standard',

        // Management Plans
        irrigation: fieldData.irrigation,
        fertilization: fieldData.fertilization,
        pestManagement: fieldData.pestManagement,
        harvestPlan: fieldData.harvestPlan,
        cropRotation: fieldData.cropRotation,

        // Economic Data
        inputCosts: fieldData.inputCosts,
        expectedRevenue: fieldData.expectedRevenue,
        profitMargin: fieldData.profitMargin,

        // Optional fields that might be missing
        geoPoints: fieldData.geoPoints,
      };

      setFields((prev) => [...prev, newField]);
      return newField;
    },
    [fields.length]
  );

  const updateField = useCallback(
    (fieldId: string, updates: Partial<FieldBoundary>) => {
      setFields((prev) =>
        prev.map((field) => {
          if (field.id === fieldId) {
            const updatedField = { ...field, ...updates };

            // Recalculate area if points changed
            if (updates.points && updates.points.length >= 3) {
              updatedField.area = calculateArea(updates.points);
            }

            return updatedField;
          }
          return field;
        })
      );
    },
    []
  );

  const deleteField = useCallback(
    (fieldId: string) => {
      setFields((prev) => prev.filter((field) => field.id !== fieldId));
      if (selectedFieldId === fieldId) {
        setSelectedFieldId(null);
      }
      
      // Also remove related tasks
      setTasks((prev) => prev.filter((task) => task.fieldId !== fieldId));
    },
    [selectedFieldId]
  );

  const duplicateField = useCallback(
    (fieldId: string) => {
      const originalField = fields.find((f) => f.id === fieldId);
      if (!originalField) return null;

      const duplicatedField: Omit<FieldBoundary, 'id'> = {
        ...originalField,
        name: `${originalField.name} Copy`,
        points: originalField.points.map((point) => ({
          x: point.x + 50,
          y: point.y + 50,
        })),
      };

      return addField(duplicatedField);
    },
    [fields, addField]
  );

  const clearAllFields = useCallback(() => {
    setFields([]);
    setSelectedFieldId(null);
    setTasks([]);
  }, []);

  // Field selection helpers
  const selectNextField = useCallback(() => {
    if (fields.length === 0) return;
    
    const currentIndex = fields.findIndex(f => f.id === selectedFieldId);
    const nextIndex = (currentIndex + 1) % fields.length;
    setSelectedFieldId(fields[nextIndex].id);
  }, [fields, selectedFieldId]);

  const selectPreviousField = useCallback(() => {
    if (fields.length === 0) return;
    
    const currentIndex = fields.findIndex(f => f.id === selectedFieldId);
    const prevIndex = currentIndex <= 0 ? fields.length - 1 : currentIndex - 1;
    setSelectedFieldId(fields[prevIndex].id);
  }, [fields, selectedFieldId]);

  // Bulk operations
  const updateMultipleFields = useCallback(
    (fieldIds: string[], updates: Partial<FieldBoundary>) => {
      setFields((prev) =>
        prev.map((field) => {
          if (fieldIds.includes(field.id)) {
            const updatedField = { ...field, ...updates };
            
            // Recalculate area if points changed
            if (updates.points && updates.points.length >= 3) {
              updatedField.area = calculateArea(updates.points);
            }
            
            return updatedField;
          }
          return field;
        })
      );
    },
    []
  );

  const deleteMultipleFields = useCallback(
    (fieldIds: string[]) => {
      setFields((prev) => prev.filter((field) => !fieldIds.includes(field.id)));
      
      if (selectedFieldId && fieldIds.includes(selectedFieldId)) {
        setSelectedFieldId(null);
      }
      
      // Remove related tasks
      setTasks((prev) => prev.filter((task) => !fieldIds.includes(task.fieldId)));
    },
    [selectedFieldId]
  );

  // Field statistics
  const fieldStats = useMemo(() => {
    return {
      totalFields: fields.length,
      totalArea: totalFarmArea,
      averageArea: fields.length > 0 ? totalFarmArea / fields.length : 0,
      totalExpectedYield: estimatedTotalYield,
      averageHealth: fields.length > 0 
        ? fields.reduce((sum, field) => sum + (field.health || 0), 0) / fields.length 
        : 0,
      fieldsByType: fields.reduce((acc, field) => {
        acc[field.type] = (acc[field.type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      fieldsByCrop: fields.reduce((acc, field) => {
        if (field.cropType) {
          acc[field.cropType] = (acc[field.cropType] || 0) + 1;
        }
        return acc;
      }, {} as Record<string, number>)
    };
  }, [fields, totalFarmArea, estimatedTotalYield]);

  return {
    // State
    fields,
    tasks,
    selectedFieldId,
    selectedField,

    // Computed values
    totalFarmArea,
    estimatedTotalYield,
    fieldStats,

    // Field operations
    addField,
    updateField,
    deleteField,
    duplicateField,
    clearAllFields,
    
    setSelectedFieldId,
    selectNextField,
    selectPreviousField,
    
    // Bulk operations
    updateMultipleFields,
    deleteMultipleFields,
    
    // State setters
    setFields,
    setTasks,
  };
};