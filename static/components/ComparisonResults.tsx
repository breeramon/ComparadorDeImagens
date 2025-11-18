// ComparisonResults.tsx
'use client';

import React from 'react';
import { Download } from 'lucide-react';
import { ComparisonResult } from '../lib/types';
import { downloadCSV } from '../lib/api';

interface ComparisonResultsProps {
    results: ComparisonResult | null;
    onDownloadCSV: () => void;
    isDownloading: boolean;
}

export default function ComparisonResults({
                                              results,
                                              onDownloadCSV,
                                              isDownloading,
                                          }: ComparisonResultsProps) {
    if (!results) {
        return (
            <div className="bg-gray-800 rounded-lg p-6 shadow-xl">
                <h3 className="text-xl font-semibold mb-4">Resultados da Comparação</h3>
                <p className="text-gray-500 text-sm text-center py-8">
                    Clique em &quot;Comparar&quot; para gerar os resultados
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Métricas */}
            <div className="bg-gray-800 rounded-lg p-6 shadow-xl">
                <h3 className="text-xl font-semibold mb-4">Métricas de Qualidade</h3>
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-700 rounded-lg p-4">
                        <p className="text-sm text-gray-400 mb-1">SSIM Score</p>
                        <p className="text-3xl font-bold text-blue-400">
                            {(results.ssim_score * 100).toFixed(2)}%
                        </p>
                        <p className="text-xs text-gray-500 mt-1">Similaridade estrutural</p>
                    </div>
                    <div className="bg-gray-700 rounded-lg p-4">
                        <p className="text-sm text-gray-400 mb-1">Diferença Média</p>
                        <p className="text-3xl font-bold text-purple-400">
                            {results.diferenca_media.toFixed(4)}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">Distância entre pixels</p>
                    </div>
                </div>
            </div>

            {/* Imagens de Resultado */}
            <div className="bg-gray-800 rounded-lg p-6 shadow-xl">
                <h3 className="text-xl font-semibold mb-4">Imagens Processadas</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                        <h4 className="text-sm font-medium text-gray-400 mb-3">Original</h4>
                        <div className="bg-gray-700 rounded-lg h-48 flex items-center justify-center overflow-hidden">
                            <img
                                src={`${results.original_url}?t=${Date.now()}`}
                                alt="Original"
                                className="max-h-full max-w-full object-contain"
                            />
                        </div>
                    </div>

                    <div>
                        <h4 className="text-sm font-medium text-gray-400 mb-3">Editada</h4>
                        <div className="bg-gray-700 rounded-lg h-48 flex items-center justify-center overflow-hidden">
                            <img
                                src={`${results.edited_url}?t=${Date.now()}`}
                                alt="Editada"
                                className="max-h-full max-w-full object-contain"
                            />
                        </div>
                    </div>

                    <div>
                        <h4 className="text-sm font-medium text-gray-400 mb-3">Mapa XOR</h4>
                        <div className="bg-gray-700 rounded-lg h-48 flex items-center justify-center overflow-hidden">
                            <img
                                src={`${results.diff_map_url}?t=${Date.now()}`}
                                alt="Diferenças"
                                className="max-h-full max-w-full object-contain"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Botão de Download */}
            <button
                onClick={onDownloadCSV}
                disabled={isDownloading}
                className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed py-3 px-4 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
            >
                <Download size={20} />
                {isDownloading ? 'Baixando...' : 'Baixar Ranking (.csv)'}
            </button>
        </div>
    );
}