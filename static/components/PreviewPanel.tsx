'use client';

import React, { useState } from 'react';
import { Eye, Loader2 } from 'lucide-react';

interface PreviewPanelProps {
    originalUrl: string;
    editedUrl: string;
    isLoading: boolean;
}

export default function PreviewPanel({ originalUrl, editedUrl, isLoading }: PreviewPanelProps) {
    const [showComparison, setShowComparison] = useState(false);

    if (!originalUrl) {
        return (
            <div className="glass rounded-2xl p-12 shadow-2xl">
                <div className="text-center text-gray-400 space-y-4">
                    <div className="inline-flex p-6 bg-gray-700/30 rounded-full">
                        <Eye size={64} className="opacity-30" />
                    </div>
                    <p className="text-lg font-medium">Aguardando upload da imagem...</p>
                    <p className="text-sm text-gray-500">Faça upload de uma imagem para começar</p>
                </div>
            </div>
        );
    }

    return (
        <div className="glass rounded-2xl p-6 shadow-2xl card-hover">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="bg-gradient-to-br from-green-500 to-teal-600 p-2.5 rounded-xl">
                        <Eye size={24} className="text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-white">Preview em Tempo Real</h3>
                </div>

                {/* Toggle de Comparação */}
                <button
                    onClick={() => setShowComparison(!showComparison)}
                    className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-300 ${
                        showComparison
                            ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                            : 'glass-light text-gray-300 hover:text-white'
                    }`}
                >
                    {showComparison ? '🔀 Lado a Lado' : '👁️ Apenas Editada'}
                </button>
            </div>

            {/* Loading Overlay */}
            {isLoading && (
                <div className="absolute inset-0 glass-light rounded-2xl flex items-center justify-center z-10 animate-fade-in">
                    <div className="text-center space-y-3">
                        <Loader2 size={48} className="animate-spin text-blue-400 mx-auto" />
                        <p className="text-white font-semibold">Processando...</p>
                    </div>
                </div>
            )}

            {/* Preview Grid */}
            <div className={`grid gap-6 ${showComparison ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'}`}>
                {showComparison && (
                    <div className="space-y-3 animate-slide-in-left">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-3 h-3 rounded-full bg-gray-400"></div>
                            <h4 className="text-sm font-bold text-gray-300 uppercase tracking-wide">Original</h4>
                        </div>
                        <div className="glass-light rounded-xl overflow-hidden aspect-video flex items-center justify-center group relative">
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            <img
                                src={originalUrl}
                                alt="Original"
                                className="max-h-full max-w-full object-contain image-zoom"
                            />
                        </div>
                    </div>
                )}

                <div className={`space-y-3 ${showComparison ? 'animate-slide-in-right' : 'animate-scale-in'}`}>
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-3 h-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-600"></div>
                        <h4 className="text-sm font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 uppercase tracking-wide">
                            {showComparison ? 'Editada' : 'Preview Editado'}
                        </h4>
                    </div>
                    <div className="glass-light rounded-xl overflow-hidden aspect-video flex items-center justify-center group relative shine-effect">
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <img
                            src={editedUrl}
                            alt="Editada"
                            className="max-h-full max-w-full object-contain image-zoom"
                        />
                    </div>
                </div>
            </div>

            {/* Info Footer */}
            <div className="mt-6 p-4 glass-light rounded-lg flex items-center justify-center gap-2">
                <span className="text-xs text-gray-400">
                    💡 <span className="text-gray-300 font-medium">Dica:</span> Ajuste os controles para ver as mudanças em tempo real
                </span>
            </div>
        </div>
    );
}