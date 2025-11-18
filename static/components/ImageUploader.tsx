'use client';

import React from 'react';
import { Upload } from 'lucide-react';
import { ALLOWED_EXTENSIONS, MAX_FILE_SIZE_BYTES, MAX_FILE_SIZE_MB } from '../lib/types';

interface ImageUploaderProps {
    onImageSelect: (file: File, previewUrl: string) => void;
    onError: (error: string) => void;
}

export default function ImageUploader({ onImageSelect, onError }: ImageUploaderProps) {
    const [fileName, setFileName] = React.useState<string>('Nenhum arquivo selecionado');

    const validateFile = (file: File): string | null => {
        const fileName = file.name.toLowerCase();
        const validExtension = ALLOWED_EXTENSIONS.some(ext => fileName.endsWith(ext));

        if (!validExtension) {
            return `Formato inválido. Use apenas ${ALLOWED_EXTENSIONS.join(', ')}`;
        }

        if (file.size > MAX_FILE_SIZE_BYTES) {
            return `Arquivo muito grande. Máximo: ${MAX_FILE_SIZE_MB}MB`;
        }

        return null;
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];

        if (!file) {
            setFileName('Nenhum arquivo selecionado');
            return;
        }

        const error = validateFile(file);
        if (error) {
            onError(error);
            setFileName('Arquivo inválido');
            e.target.value = '';
            return;
        }

        setFileName(file.name);
        const previewUrl = URL.createObjectURL(file);
        onImageSelect(file, previewUrl);
        onError('');
    };

    return (
        <div className="bg-gray-800 rounded-lg p-6 shadow-xl">
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Upload size={24} />
                1. Envie sua imagem
            </h3>

            <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-600 rounded-lg cursor-pointer hover:border-blue-500 transition-all duration-300">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <svg className="w-16 h-16 mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="text-sm text-gray-300 font-medium mb-1">
                        {fileName}
                    </p>
                    <p className="text-xs text-gray-500">
                        PNG, JPG, JPEG (Máx: {MAX_FILE_SIZE_MB}MB)
                    </p>
                </div>
                <input
                    type="file"
                    className="hidden"
                    accept={ALLOWED_EXTENSIONS.join(',')}
                    onChange={handleFileChange}
                />
            </label>
        </div>
    );
}