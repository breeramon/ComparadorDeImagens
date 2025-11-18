'use client';

import React from 'react';
import { Undo2, Redo2 } from 'lucide-react';
import { EditorState, SLIDER_CONFIGS } from '../lib/types';

interface ImageEditorProps {
    state: EditorState;
    onChange: (key: keyof EditorState, value: number) => void;
    onUndo: () => void;
    onRedo: () => void;
    canUndo: boolean;
    canRedo: boolean;
}

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

    const sliderLabels = {
        brilho: 'Brilho',
        contraste: 'Contraste',
        saturacao: 'Saturação',
        rotacao: 'Rotação',
        redim: 'Escala',
    };

    return (
        <div className="bg-gray-800 rounded-lg p-6 shadow-xl">
            <h3 className="text-xl font-semibold mb-4">2. Edite sua imagem</h3>

            <div className="space-y-5">
                {(Object.keys(state) as Array<keyof EditorState>).map((key) => {
                    const config = SLIDER_CONFIGS[key];
                    return (
                        <div key={key}>
                            <div className="flex justify-between items-center mb-2">
                                <label className="text-sm font-medium text-gray-300">
                                    {sliderLabels[key]}
                                </label>
                                <span className="text-sm font-semibold text-blue-400 bg-gray-700 px-3 py-1 rounded">
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
                                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                            />
                        </div>
                    );
                })}
            </div>

            <div className="flex gap-3 mt-6">
                <button
                    onClick={onUndo}
                    disabled={!canUndo}
                    className="flex-1 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:cursor-not-allowed py-2 px-4 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                    title="Desfazer"
                >
                    <Undo2 size={18} />
                    Desfazer
                </button>
                <button
                    onClick={onRedo}
                    disabled={!canRedo}
                    className="flex-1 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:cursor-not-allowed py-2 px-4 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                    title="Refazer"
                >
                    <Redo2 size={18} />
                    Refazer
                </button>
            </div>
        </div>
    );
}