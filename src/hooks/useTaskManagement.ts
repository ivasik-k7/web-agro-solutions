import { useState, useCallback, useMemo } from 'react';
import type { Task, FieldBoundary } from '@/types';

export const useTaskManagement = (fields: FieldBoundary[]) => {
    const [tasks, setTasks] = useState<Task[]>([]);

    // Generate tasks from fields
    const generateFieldTasks = useCallback((field: FieldBoundary): Task[] => {
        const fieldTasks: Task[] = [];
        const today = new Date();

        if (field.plantingDate && field.plantingDate > today) {
            fieldTasks.push({
                id: `plant-${field.id}-${field.plantingDate.getTime()}`,
                title: `Plant ${field.cropType || 'crops'} in ${field.name}`,
                description: `Planting operation for ${field.name}`,
                type: 'planting',
                priority: 'high',
                status: 'pending',
                assignedTo: 'Farm Manager',
                dueDate: field.plantingDate,
                estimatedDuration: field.area ? field.area * 2 : 8,
                fieldId: field.id,
                equipmentNeeded: ['Tractor', 'Seeder'],
                materials: ['Seeds', 'Fertilizer']
            });
        }

        if (field.harvestDate) {
            fieldTasks.push({
                id: `harvest-${field.id}-${field.harvestDate.getTime()}`,
                title: `Harvest ${field.cropType || 'crops'} from ${field.name}`,
                description: `Harvesting operation for ${field.name}`,
                type: 'harvesting',
                priority: 'high',
                status: 'pending',
                assignedTo: 'Harvest Team',
                dueDate: field.harvestDate,
                estimatedDuration: field.area ? field.area * 4 : 16,
                fieldId: field.id,
                equipmentNeeded: ['Harvester', 'Trucks'],
                materials: ['Storage Bins']
            });
        }

        return fieldTasks;
    }, []);

    // Add task
    const addTask = useCallback((task: Omit<Task, 'id'>) => {
        const newTask: Task = {
            ...task,
            id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        };
        setTasks(prev => [...prev, newTask]);
        return newTask;
    }, []);

    // Update task
    const updateTask = useCallback((taskId: string, updates: Partial<Task>) => {
        setTasks(prev => prev.map(task => 
            task.id === taskId ? { ...task, ...updates } : task
        ));
    }, []);

    // Update task status
    const updateTaskStatus = useCallback((taskId: string, status: Task['status'], actualDuration?: number) => {
        setTasks(prev => prev.map(task => 
            task.id === taskId ? { 
                ...task, 
                status,
                completedDate: status === 'completed' ? new Date() : undefined,
                actualDuration
            } : task
        ));
    }, []);

    // Delete task
    const deleteTask = useCallback((taskId: string) => {
        setTasks(prev => prev.filter(task => task.id !== taskId));
    }, []);

    // Generate tasks for all fields
    const generateAllTasks = useCallback(() => {
        const allTasks = fields.flatMap(generateFieldTasks);
        setTasks(allTasks);
        return allTasks;
    }, [fields, generateFieldTasks]);

    // Filtered tasks
    const pendingTasks = useMemo(() => 
        tasks.filter(task => task.status === 'pending'),
        [tasks]
    );

    const completedTasks = useMemo(() => 
        tasks.filter(task => task.status === 'completed'),
        [tasks]
    );

    const overdueTasks = useMemo(() => 
        tasks.filter(task => task.dueDate < new Date() && task.status !== 'completed'),
        [tasks]
    );

    const tasksByField = useMemo(() => 
        fields.reduce((acc, field) => {
            acc[field.id] = tasks.filter(task => task.fieldId === field.id);
            return acc;
        }, {} as Record<string, Task[]>),
        [tasks, fields]
    );

    return {
        // State
        tasks,
        
        // Filtered tasks
        pendingTasks,
        completedTasks,
        overdueTasks,
        tasksByField,
        
        // Task operations
        addTask,
        updateTask,
        updateTaskStatus,
        deleteTask,
        generateAllTasks,
        setTasks
    };
};