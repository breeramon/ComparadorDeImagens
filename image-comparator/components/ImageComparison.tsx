'use client';

import { ComparisonResult } from '@/types';
import { getImageUrl } from '@/lib/api';

interface ImageComparisonProps {
    result: ComparisonResult | null;
}

export default function ImageComparison({ result }: ImageComparisonProps) {
    if (!result) {
        return (
            <div className="text-center py-12 text-gray-500">
                <p>Nenhuma comparação realizada ainda.</p>
                <p className="text-sm mt-2">Faça upload de uma imagem e clique em "Comparar Imagens"</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-700">SSIM Score</h4>
                    <p className="text-2xl font-bold text-blue-600 mt-1">
                        {result.ssim_score.toFixed(4)}
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                        (Quanto maior, mais similar)
                    </p>
                </div>

                <div className="bg-green-50 p-4 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-700">Diferença Média</h4>
                    <p className="text-2xl font-bold text-green-600 mt-1">
                        {result.diferenca_media.toFixed(2)}
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                        (Quanto menor, mais similar)
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Original</h4>
                    <img
                        src={getImageUrl(result.original_url)}
                        alt="Original"
                        className="w-full h-48 object-contain bg-gray-100 rounded-lg border"
                    />
                </div>

                <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Editada</h4>
                    <img
                        src={getImageUrl(result.edited_url)}
                        alt="Editada"
                        className="w-full h-48 object-contain bg-gray-100 rounded-lg border"
                    />
                </div>

                <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Mapa de Diferença</h4>
                    <img
                        src={getImageUrl(result.diff_map_url)}
                        alt="Diferença"
                        className="w-full h-48 object-contain bg-gray-100 rounded-lg border"
                    />
                </div>
            </div>
        </div>
    );
}