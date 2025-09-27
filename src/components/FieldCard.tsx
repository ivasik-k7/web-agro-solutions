import React from "react";
import type { FieldBoundary } from "@/types";
import { HealthIndicator } from "@components/HealthIndicator";
import "@/styles/FieldCard.css";

interface FieldCardProps {
    field: FieldBoundary;
    isSelected: boolean;
    onClick: () => void;
    onEdit: () => void;
}

export const FieldCard: React.FC<FieldCardProps> = ({
    field,
    isSelected,
    onClick,
    onEdit,
}) => {
    return (
        <div
            className={`field-card ${isSelected ? "selected" : ""}`}
            onClick={onClick}
        >
            {/* Color accent strip */}
            <div className="field-accent" style={{ background: field.color }} />

            {/* Header */}
            <div className="field-header">
                <div
                    className="field-badge"
                    style={{ backgroundColor: field.color }}
                >
                    {field.type.charAt(0).toUpperCase()}
                </div>
                <div className="field-info">
                    <div className="field-name">{field.name}</div>
                    <div className="field-type">{field.type.replace("_", " ")}</div>
                </div>
                <button
                    className="edit-button"
                    onClick={(e) => {
                        e.stopPropagation();
                        onEdit();
                    }}
                    title="Edit field"
                >
                    ✎
                </button>
            </div>

            {/* Stats */}
            <div className="field-stats">
                {field.area && (
                    <div className="field-stat">
                        <span className="stat-icon">📐</span>
                        <span>{field.area.toFixed(1)} acres</span>
                    </div>
                )}
                {field.cropType && (
                    <div className="field-stat">
                        <span className="stat-icon">🌱</span>
                        <span>{field.cropType}</span>
                    </div>
                )}
                {field.expectedYield && (
                    <div className="field-stat">
                        <span className="stat-icon">📊</span>
                        <span>{field.expectedYield} t/ha</span>
                    </div>
                )}
                {typeof field.health === "number" && (
                    <div className="field-stat">
                        <HealthIndicator health={field.health} size="sm" />
                    </div>
                )}
            </div>

            {/* Notes preview */}
            {field.notes && (
                <div className="field-notes">
                    {field.notes.length > 60
                        ? field.notes.slice(0, 60) + "..."
                        : field.notes}
                </div>
            )}
        </div>
    );
};
