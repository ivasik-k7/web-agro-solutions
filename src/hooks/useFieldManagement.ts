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
    (fieldData: Partial<FieldBoundary>) => {
      const newField: FieldBoundary = {
        id: `field_${Date.now()}_${Math.random()
          .toString(36)
          .substr(2, 9)}`,
        name: fieldData.name || `Field ${fields.length + 1}`,
        type: fieldData.type || "field",
        points: fieldData.points || [],
        color: fieldData.color || "#00c853",

        cropType: fieldData.cropType,
        variety: fieldData.variety,
        notes: fieldData.notes,
        area:
          fieldData.area ||
          (fieldData.points ? calculateArea(fieldData.points) : 0),

        plantingDate: fieldData.plantingDate,
        harvestDate: fieldData.harvestDate,
        growthStage: fieldData.growthStage,

        // Soil
        soilType: fieldData.soilType,
        soilAnalysis: fieldData.soilAnalysis,
        elevation: fieldData.elevation,
        slope: fieldData.slope,

        health: fieldData.health || Math.floor(Math.random() * 40) + 60,
        ndvi: fieldData.ndvi,
        stressLevel: fieldData.stressLevel,

        expectedYield:
          fieldData.expectedYield ||
          parseFloat((Math.random() * 5 + 2).toFixed(1)),
        historicalYields: fieldData.historicalYields,
        qualityGrade: fieldData.qualityGrade,

        irrigation: fieldData.irrigation,
        fertilization: fieldData.fertilization,
        pestManagement: fieldData.pestManagement,
        harvestPlan: fieldData.harvestPlan,
        cropRotation: fieldData.cropRotation,

        inputCosts: fieldData.inputCosts,
        expectedRevenue: fieldData.expectedRevenue,
        profitMargin: fieldData.profitMargin,
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
    },
    [selectedFieldId]
  );

  const duplicateField = useCallback(
    (fieldId: string) => {
      const originalField = fields.find((f) => f.id === fieldId);
      if (!originalField) return;

      const duplicatedField: Partial<FieldBoundary> = {
        ...originalField,
        id: `field_${Date.now()}_${Math.random()
          .toString(36)
          .substr(2, 9)}`,
        name: `${originalField.name} Copy`,
        points: originalField.points.map((point) => ({
          x: point.x + 50,
          y: point.y + 50,
        })),
      };

      addField(duplicatedField);
    },
    [fields, addField]
  );

  return {
    // State
    fields,
    tasks,
    selectedFieldId,
    selectedField,

    // Computed values
    totalFarmArea,
    estimatedTotalYield,

    // Field operations
    addField,
    updateField,
    deleteField,
    duplicateField,
    setSelectedFieldId,
    setFields,
    setTasks,
  };
};
