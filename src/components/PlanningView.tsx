import React, { useMemo, useState } from 'react';
import type { Task, FieldBoundary } from '@/types';
import { TASK_TYPES } from '@/constants';
import "@styles/PlanningView.css"

interface PlanningViewProps {
    fields: FieldBoundary[];
    tasks: Task[];
    onTaskUpdate: (taskId: string, status: Task['status'], actualDuration?: number) => void;
}

export const PlanningView: React.FC<PlanningViewProps> = ({ fields, tasks, onTaskUpdate }) => {
    const [filter, setFilter] = useState<'all' | Task['type']>('all');
    const [timeRange, setTimeRange] = useState<'week' | 'month' | 'season'>('month');

    const filteredTasks = useMemo(() => {
        let filtered = tasks;

        if (filter !== 'all') {
            filtered = filtered.filter(task => task.type === filter);
        }

        const now = new Date();
        const rangeMs = timeRange === 'week' ? 7 * 24 * 60 * 60 * 1000 :
            timeRange === 'month' ? 30 * 24 * 60 * 60 * 1000 : 365 * 24 * 60 * 60 * 1000;

        return filtered.filter(task =>
            Math.abs(task.dueDate.getTime() - now.getTime()) <= rangeMs
        );
    }, [tasks, filter, timeRange]);

    const taskStats = useMemo(() => {
        const stats = {
            total: tasks.length,
            completed: tasks.filter(t => t.status === 'completed').length,
            inProgress: tasks.filter(t => t.status === 'in_progress').length,
            pending: tasks.filter(t => t.status === 'pending').length,
            overdue: tasks.filter(t => t.dueDate < new Date() && t.status !== 'completed').length
        };

        return {
            ...stats,
            completionRate: stats.total > 0 ? (stats.completed / stats.total) * 100 : 0
        };
    }, [tasks]);

    const upcomingTasks = useMemo(() => {
        return tasks
            .filter(task => task.status === 'pending' && task.dueDate >= new Date())
            .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime())
            .slice(0, 10);
    }, [tasks]);

    const handleTaskStatusChange = (taskId: string, newStatus: Task['status']) => {
        onTaskUpdate(taskId, newStatus);
    };

    return (
        <div className="planning-view">
            <div className="planning-header">
                <h2>📋 Farm Planning & Scheduling</h2>
                <p>Task management and resource planning</p>
            </div>

            {/* Statistics Overview */}
            <div className="planning-stats">
                <div className="stat-card">
                    <div className="stat-value">{taskStats.total}</div>
                    <div className="stat-label">Total Tasks</div>
                </div>
                <div className="stat-card">
                    <div className="stat-value">{taskStats.completed}</div>
                    <div className="stat-label">Completed</div>
                </div>
                <div className="stat-card">
                    <div className="stat-value">{taskStats.inProgress}</div>
                    <div className="stat-label">In Progress</div>
                </div>
                <div className="stat-card">
                    <div className="stat-value">{taskStats.overdue}</div>
                    <div className="stat-label">Overdue</div>
                </div>
                <div className="stat-card">
                    <div className="stat-value">{taskStats.completionRate.toFixed(1)}%</div>
                    <div className="stat-label">Completion Rate</div>
                </div>
            </div>

            {/* Filters */}
            <div className="planning-filters">
                <div className="filter-group">
                    <label>Task Type:</label>
                    <select value={filter} onChange={(e) => setFilter(e.target.value as any)}>
                        <option value="all">All Types</option>
                        {Object.entries(TASK_TYPES).map(([type, config]) => (
                            <option key={type} value={type}>
                                {config.icon} {type.replace('_', ' ')}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="filter-group">
                    <label>Time Range:</label>
                    <select value={timeRange} onChange={(e) => setTimeRange(e.target.value as any)}>
                        <option value="week">Next Week</option>
                        <option value="month">Next Month</option>
                        <option value="season">This Season</option>
                    </select>
                </div>
            </div>

            {/* Task List */}
            <div className="task-management">
                <div className="task-section">
                    <h3>📅 Upcoming Tasks ({upcomingTasks.length})</h3>
                    <div className="task-list">
                        {upcomingTasks.map(task => (
                            <div key={task.id} className={`task-item ${task.priority}`}>
                                <div className="task-icon">
                                    {TASK_TYPES[task.type].icon}
                                </div>
                                <div className="task-content">
                                    <div className="task-header">
                                        <div className="task-title">{task.title}</div>
                                        <div className="task-priority-badge">{task.priority}</div>
                                    </div>
                                    <div className="task-details">
                                        <span>Field: {fields.find(f => f.id === task.fieldId)?.name}</span>
                                        <span>Due: {task.dueDate.toLocaleDateString()}</span>
                                        <span>Est: {task.estimatedDuration}h</span>
                                    </div>
                                    <div className="task-actions">
                                        <button
                                            className="action-btn start"
                                            onClick={() => handleTaskStatusChange(task.id, 'in_progress')}
                                        >
                                            Start
                                        </button>
                                        <button
                                            className="action-btn complete"
                                            onClick={() => handleTaskStatusChange(task.id, 'completed')}
                                        >
                                            Complete
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Gantt Chart View */}
                <div className="task-section">
                    <h3>📊 Task Timeline</h3>
                    <div className="gantt-chart">
                        {filteredTasks.map(task => (
                            <div key={task.id} className="gantt-item">
                                <div className="gantt-bar" style={{
                                    width: `${task.estimatedDuration * 10}px`,
                                    backgroundColor: TASK_TYPES[task.type].color
                                }} />
                                <div className="gantt-label">{task.title}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Resource Allocation */}
            <div className="resource-section">
                <h3>💧 Resource Allocation</h3>
                <div className="resource-grid">
                    <div className="resource-card">
                        <div className="resource-icon">💧</div>
                        <div className="resource-info">
                            <div className="resource-value">
                                {(fields.reduce((sum, f) => sum + (f.area || 0), 0) * 1000).toLocaleString()} L
                            </div>
                            <div className="resource-label">Water Required</div>
                        </div>
                    </div>
                    <div className="resource-card">
                        <div className="resource-icon">🧪</div>
                        <div className="resource-info">
                            <div className="resource-value">
                                {(fields.reduce((sum, f) => sum + (f.area || 0), 0) * 50).toLocaleString()} kg
                            </div>
                            <div className="resource-label">Fertilizer</div>
                        </div>
                    </div>
                    <div className="resource-card">
                        <div className="resource-icon">👥</div>
                        <div className="resource-info">
                            <div className="resource-value">
                                {(fields.reduce((sum, f) => sum + (f.area || 0), 0) * 2).toLocaleString()} hours
                            </div>
                            <div className="resource-label">Labor</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};