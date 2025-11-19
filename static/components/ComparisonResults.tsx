'use client';

import React from 'react';
import { Download, BarChart3, Image as ImageIcon, Edit3, Diff, Award, TrendingUp } from 'lucide-react';
import { ComparisonResult } from '../lib/types';

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
        return null;
    }

    const ssimPercentage = (results.ssim_score * 100);
    const ssimColor = ssimPercentage >= 80 ? 'text-green-500' :
        ssimPercentage >= 60 ? 'text-yellow-500' : 'text-red-500';

    const ssimQuality = ssimPercentage >= 80 ? 'Excelente' :
        ssimPercentage >= 60 ? 'Boa' : 'Baixa';

    const diffColor = results.diferenca_media < 0.1 ? 'text-green-500' :
        results.diferenca_media < 0.3 ? 'text-yellow-500' : 'text-red-500';

    return (
        <div className="space-y-6">
            {/* Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="card">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                            <Award size={24} className="text-green-600" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900">Similaridade Estrutural</h3>
                            <p className="text-gray-600">Índice SSIM</p>
                        </div>
                    </div>
                    <div className="text-center">
                        <div className={`text-4xl font-bold ${ssimColor} mb-2`}>
                            {ssimPercentage.toFixed(1)}%
                        </div>
                        <div className="text-gray-600">
                            Qualidade: <span className="font-semibold">{ssimQuality}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
                            <div
                                className="bg-green-500 h-2 rounded-full transition-all duration-1000"
                                style={{ width: `${ssimPercentage}%` }}
                            ></div>
                        </div>
                    </div>
                </div>

                <div className="card">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                            <TrendingUp size={24} className="text-blue-600" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900">Diferença Média</h3>
                            <p className="text-gray-600">Distância entre pixels</p>
                        </div>
                    </div>
                    <div className="text-center">
                        <div className={`text-4xl font-bold ${diffColor} mb-2`}>
                            {results.diferenca_media.toFixed(4)}
                        </div>
                        <div className="text-gray-600">
                            Quanto menor, mais similar
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
                            <div
                                className="bg-blue-500 h-2 rounded-full transition-all duration-1000"
                                style={{ width: `${Math.min(results.diferenca_media * 100, 100)}%` }}
                            ></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Images Comparison */}
            <div className="card">
                <h3 className="text-xl font-semibold mb-6 text-center">Comparação Visual</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center">
                        <div className="flex items-center justify-center gap-2 mb-4">
                            <ImageIcon size={20} className="text-blue-500" />
                            <h4 className="font-semibold text-gray-900">Original</h4>
                        </div>
                        <div className="bg-gray-50 rounded-xl p-4 border-2 border-gray-200">
                            <img
                                src={`${results.original_url}?t=${Date.now()}`}
                                alt="Original"
                                className="w-full h-48 object-contain rounded-lg"
                            />
                        </div>
                    </div>

                    <div className="text-center">
                        <div className="flex items-center justify-center gap-2 mb-4">
                            <Edit3 size={20} className="text-purple-500" />
                            <h4 className="font-semibold text-gray-900">Editada</h4>
                        </div>
                        <div className="bg-gray-50 rounded-xl p-4 border-2 border-gray-200">
                            <img
                                src={`${results.edited_url}?t=${Date.now()}`}
                                alt="Editada"
                                className="w-full h-48 object-contain rounded-lg"
                            />
                        </div>
                    </div>

                    <div className="text-center">
                        <div className="flex items-center justify-center gap-2 mb-4">
                            <Diff size={20} className="text-red-500" />
                            <h4 className="font-semibold text-gray-900">Diferenças</h4>
                        </div>
                        <div className="bg-gray-50 rounded-xl p-4 border-2 border-gray-200">
                            <img
                                src={`${results.diff_map_url}?t=${Date.now()}`}
                                alt="Diferenças"
                                className="w-full h-48 object-contain rounded-lg"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Download Button */}
            <div className="text-center">
                <button
                    onClick={onDownloadCSV}
                    disabled={isDownloading}
                    className="btn btn-success"
                >
                    <Download size={20} />
                    {isDownloading ? (
                        <>
                            <div className="loading-spinner"></div>
                            Gerando Relatório...
                        </>
                    ) : (
                        'Exportar Ranking Completo (CSV)'
                    )}
                </button>
            </div>
        </div>
    );
}