import React, { useState } from 'react';
import { DEFAULT_COLORS } from "@/constants"

interface ColorPickerProps {
    color: string;
    onChange: (color: string) => void;
}

export const ColorPicker: React.FC<ColorPickerProps> = ({ color, onChange }) => {
    const [showPicker, setShowPicker] = useState(false);

    return (
        <div className="color-picker-container">
            <button
                className="color-preview"
                style={{ backgroundColor: color }}
                onClick={() => setShowPicker(!showPicker)}
            />
            {showPicker && (
                <div className="color-picker-popup">
                    <div className="default-colors">
                        {DEFAULT_COLORS.map(defaultColor => (
                            <button
                                key={defaultColor}
                                className="default-color-swatch"
                                style={{ backgroundColor: defaultColor }}
                                onClick={() => {
                                    onChange(defaultColor);
                                    setShowPicker(false);
                                }}
                            />
                        ))}
                    </div>
                    <input
                        type="color"
                        value={color}
                        onChange={(e) => onChange(e.target.value)}
                        className="color-input"
                    />
                    <div className="color-value">{color}</div>
                </div>
            )}
        </div>
    );
};