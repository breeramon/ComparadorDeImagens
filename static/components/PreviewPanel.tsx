// PreviewPanel.tsx
'use client';

import React from 'react';

interface PreviewPanelProps {
    originalUrl: string;
    editedUrl: string;
    isLoading: boolean;
}

export default function PreviewPanel({ originalUrl, editedUrl, isLoading }: PreviewPanelProps) {
    return (
        <div className="bg-gray-800 rounded-lg p-6 shadow-xl">
            <h3 className="text-xl font-semibold mb-4">Pré-visualização</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <h4 className="text-sm font-medium text-gray-400 mb-3">Original</h4>
                    <div className="bg-gray-700 rounded-lg h-64 flex items-center justify-center overflow-hidden relative">
                        {originalUrl ? (
                            <img
                                src={originalUrl}
                                alt="Original"
                                className="max-h-full max-w-full object-contain"
                            />
                        ) : (
                            <p className="text-gray-500 text-sm">Nenhuma imagem carregada</p>
                        )}
                    </div>
                </div>

                <div>
                    <h4 className="text-sm font-medium text-gray-400 mb-3">
                        Edição ao Vivo
                        {isLoading && <span className="text-blue-400 ml-2">(Processando...)</span>}
                    </h4>
                    <div className="bg-gray-700 rounded-lg h-64 flex items-center justify-center overflow-hidden relative">
                        {isLoading && (
                            <div className="absolute inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-10">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                            </div>
                        )}
                        {editedUrl ? (
                            <img
                                src={editedUrl}
                                alt="Editada"
                                className="max-h-full max-w-full object-contain"
                            />
                        ) : (
                            <p className="text-gray-500 text-sm">Aguardando edições</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}