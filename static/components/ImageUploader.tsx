'use client';

import React from 'react';
import { Upload, Image as ImageIcon, CheckCircle } from 'lucide-react';
import { ALLOWED_EXTENSIONS, MAX_FILE_SIZE_BYTES, MAX_FILE_SIZE_MB } from '../lib/types';

interface ImageUploaderProps {
    onImageSelect: (file: File, previewUrl: string) => void;
    onError: (error: string) => void;
}

export default function ImageUploader({ onImageSelect, onError }: ImageUploaderProps) {
    const [fileName, setFileName] = React.useState<string>('');
    const [isFileSelected, setIsFileSelected] = React.useState(false);

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
            setFileName('');
            setIsFileSelected(false);
            return;
        }

        const error = validateFile(file);
        if (error) {
            onError(error);
            setFileName('');
            setIsFileSelected(false);
            e.target.value = '';
            return;
        }

        setFileName(file.name);
        setIsFileSelected(true);
        const previewUrl = URL.createObjectURL(file);
        onImageSelect(file, previewUrl);
        onError('');
    };

    return (
        <div className="glass rounded-2xl p-6 shadow-2xl card-hover">
            <div className="flex items-center gap-3 mb-6">
                <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-2.5 rounded-xl">
                    <Upload size={24} className="text-white" />
                </div>
                <h3 className="text-xl font-bold text-white">1. Envie sua imagem</h3>
            </div>

            <label className="flex flex-col items-center justify-center w-full min-h-[200px] border-2 border-dashed border-gray-600 rounded-xl cursor-pointer hover:border-blue-500 transition-all duration-300 group relative overflow-hidden">
                {/* Efeito de brilho no hover */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-500/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>

                <div className="flex flex-col items-center justify-center pt-5 pb-6 relative z-10">
                    {isFileSelected ? (
                        <>
                            <div className="bg-green-500/20 p-4 rounded-full mb-4 animate-scale-in">
                                <CheckCircle className="text-green-400" size={48} />
                            </div>
                            <p className="text-base text-green-400 font-semibold mb-2 animate-fade-in">
                                ✓ Arquivo carregado
                            </p>
                            <p className="text-sm text-gray-300 font-medium px-4 text-center break-all">
                                {fileName}
                            </p>
                            <p className="text-xs text-gray-500 mt-3">
                                Clique para selecionar outra imagem
                            </p>
                        </>
                    ) : (
                        <>
                            <div className="bg-gray-700/50 p-4 rounded-full mb-4 group-hover:scale-110 transition-transform duration-300">
                                <ImageIcon className="text-blue-400 group-hover:text-blue-300" size={48} />
                            </div>
                            <p className="text-base text-gray-200 font-semibold mb-2">
                                Clique ou arraste sua imagem
                            </p>
                            <p className="text-sm text-gray-400 mb-1">
                                PNG, JPG, JPEG
                            </p>
                            <p className="text-xs text-gray-500">
                                Tamanho máximo: {MAX_FILE_SIZE_MB}MB
                            </p>
                        </>
                    )}
                </div>
                <input
                    type="file"
                    className="hidden"
                    accept={ALLOWED_EXTENSIONS.join(',')}
                    onChange={handleFileChange}
                />
            </label>

            {/* Informação adicional */}
            <div className="mt-4 p-3 glass-light rounded-lg">
                <p className="text-xs text-gray-400 text-center">
                    💡 <span className="text-gray-300">Dica:</span> Escolha imagens claras para melhores resultados
                </p>
            </div>
        </div>
    );
}