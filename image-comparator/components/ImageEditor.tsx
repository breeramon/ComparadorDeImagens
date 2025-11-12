'use client';

import { ImageEdits } from '@/types';

interface ImageEditorProps {
    edits: ImageEdits;
    onChange: (edits: ImageEdits) => void;
    onPreview: () => void;
    previewUrl: string | null;
    isLoadingPreview: boolean;
}

export default function ImageEditor({
                                        edits,
                                        onChange,
                                        onPreview,
                                        previewUrl,
                                        isLoadingPreview,
                                    }: ImageEditorProps) {

    const handleChange = (key: keyof ImageEdits, value: number) => {
        onChange({ ...edits, [key]: value });
    };

    return (
        <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-800">Ajustes de Edição</h3>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Brilho: {edits.brilho}
                </label>
                <input
                    type="range"
                    min="-100"
                    max="100"
                    value={edits.brilho}
                    onChange={(e) => handleChange('brilho', parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contraste: {edits.contraste.toFixed(2)}
                </label>
                <input
                    type="range"
                    min="0.5"
                    max="3"
                    step="0.1"
                    value={edits.contraste}
                    onChange={(e) => handleChange('contraste', parseFloat(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Saturação: {edits.saturacao.toFixed(2)}
                </label>
                <input
                    type="range"
                    min="0"
                    max="3"
                    step="0.1"
                    value={edits.saturacao}
                    onChange={(e) => handleChange('saturacao', parseFloat(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rotação: {edits.rotacao}°
                </label>
                <input
                    type="range"
                    min="-180"
                    max="180"
                    value={edits.rotacao}
                    onChange={(e) => handleChange('rotacao', parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Redimensionar: {edits.redim}%
                </label>
                <input
                    type="range"
                    min="10"
                    max="200"
                    value={edits.redim}
                    onChange={(e) => handleChange('redim', parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
            </div>

            <button
                onClick={onPreview}
                disabled={isLoadingPreview}
                className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
                {isLoadingPreview ? 'Gerando Preview...' : 'Ver Preview'}
            </button>

            {previewUrl && (
                <div className="mt-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Preview da Edição</h4>
                    <img
                        src={previewUrl}
                        alt="Preview editado"
                        className="w-full h-64 object-contain bg-gray-100 rounded-lg border"
                    />
                </div>
            )}
        </div>
    );
}