'use client';

import React from 'react';
import { Undo2, Redo2, Sun, Contrast, Palette, RotateCw, ZoomIn } from 'lucide-react';
import { EditorState, SLIDER_CONFIGS } from '../lib/types';

// Interface das props
interface ImageEditorProps {
    state: EditorState;
    onChange: (key: keyof EditorState, value: number) => void;
    onUndo: () => void;
    onRedo: () => void;
    canUndo: boolean;
    canRedo: boolean;
}

// Configurações dos sliders
const sliderConfigs = {
    brilho: { icon: Sun, label: 'Brilho' },
    contraste: { icon: Contrast, label: 'Contraste' },
    saturacao: { icon: Palette, label: 'Saturação' },
    rotacao: { icon: RotateCw, label: 'Rotação' },
    redim: { icon: ZoomIn, label: 'Escala' },
};

export default function ImageEditor({
                                        state,
                                        onChange,
                                        onUndo,
                                        onRedo,
                                        canUndo,
                                        canRedo,
                                    }: ImageEditorProps) {

    const formatValue = (key: keyof EditorState, value: number): string => {
        const config = SLIDER_CONFIGS[key];
        if (key === 'contraste' || key === 'saturacao') {
            return value.toFixed(1) + config.unit;
        }
        return value.toString() + config.unit;
    };

    const getSliderBackground = (key: keyof EditorState, value: number) => {
        const config = SLIDER_CONFIGS[key];
        const percentage = ((value - config.min) / (config.max - config.min)) * 100;
        return `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${percentage}%, #e5e7eb ${percentage}%, #e5e7eb 100%)`;
    };

    return (
        <div className="space-y-6">
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Ajustes da Imagem</h3>

                {(Object.keys(state) as Array<keyof EditorState>).map((key) => {
                    const config = SLIDER_CONFIGS[key];
                    const { icon: Icon, label } = sliderConfigs[key];

                    return (
                        <div key={key} className="mb-5 last:mb-0">
                            <div className="flex justify-between items-center mb-2">
                                <div className="flex items-center gap-2">
                                    <Icon size={18} className="text-blue-600" />
                                    <span className="text-sm font-medium text-gray-700">{label}</span>
                                </div>
                                <span className="text-sm font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded">
                                    {formatValue(key, state[key])}
                                </span>
                            </div>

                            <input
                                type="range"
                                min={config.min}
                                max={config.max}
                                step={config.step}
                                value={state[key]}
                                onChange={(e) => onChange(key, parseFloat(e.target.value))}
                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                                style={{
                                    background: getSliderBackground(key, state[key])
                                }}
                            />

                            <div className="flex justify-between text-xs text-gray-500 mt-1">
                                <span>{config.min}{config.unit}</span>
                                <span>{config.max}{config.unit}</span>
                            </div>
                        </div>
                    );
                })}

                {/* Controles de Histórico */}
                <div className="flex gap-2 pt-4 mt-4 border-t border-gray-200">
                    <button
                        onClick={onUndo}
                        disabled={!canUndo}
                        className="flex-1 bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed py-2 px-3 rounded text-sm font-medium transition-colors flex items-center justify-center gap-1"
                    >
                        <Undo2 size={16} />
                        Desfazer
                    </button>
                    <button
                        onClick={onRedo}
                        disabled={!canRedo}
                        className="flex-1 bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed py-2 px-3 rounded text-sm font-medium transition-colors flex items-center justify-center gap-1"
                    >
                        <Redo2 size={16} />
                        Refazer
                    </button>
                </div>
            </div>
        </div>
    );
}