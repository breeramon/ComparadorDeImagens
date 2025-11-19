'use client';

import React from 'react';
import { Image as ImageIcon, Edit3, Loader2 } from 'lucide-react';

interface PreviewPanelProps {
    originalUrl: string;
    editedUrl: string;
    isLoading: boolean;
}

export default function PreviewPanel({ originalUrl, editedUrl, isLoading }: PreviewPanelProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Imagem Original */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="flex items-center gap-2 mb-3">
                    <ImageIcon size={18} className="text-blue-600" />
                    <h3 className="font-semibold text-gray-800">Imagem Original</h3>
                </div>
                <div className="bg-gray-50 rounded-lg border border-gray-200 min-h-[200px] flex items-center justify-center">
                    {originalUrl ? (
                        <img
                            src={originalUrl}
                            alt="Imagem original"
                            className="max-w-full max-h-64 object-contain rounded"
                        />
                    ) : (
                        <div className="text-center text-gray-500 py-8">
                            <ImageIcon size={32} className="mx-auto mb-2 opacity-50" />
                            <p className="text-sm">Nenhuma imagem carregada</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Imagem Editada */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="flex items-center gap-2 mb-3">
                    <Edit3 size={18} className="text-purple-600" />
                    <h3 className="font-semibold text-gray-800">Imagem Editada</h3>
                    {isLoading && <Loader2 size={16} className="animate-spin text-blue-500 ml-2" />}
                </div>
                <div className="bg-gray-50 rounded-lg border border-gray-200 min-h-[200px] flex items-center justify-center relative">
                    {editedUrl ? (
                        <>
                            <img
                                src={editedUrl}
                                alt="Imagem editada"
                                className="max-w-full max-h-64 object-contain rounded"
                            />
                            {isLoading && (
                                <div className="absolute inset-0 bg-white bg-opacity-80 flex items-center justify-center rounded">
                                    <div className="text-center">
                                        <Loader2 size={24} className="animate-spin text-blue-500 mx-auto mb-2" />
                                        <p className="text-sm text-gray-600">Processando...</p>
                                    </div>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="text-center text-gray-500 py-8">
                            <Edit3 size={32} className="mx-auto mb-2 opacity-50" />
                            <p className="text-sm">Pré-visualização da edição</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}