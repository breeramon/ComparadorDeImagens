'use client';

import { ResultData } from '@/types';

interface ResultsTableProps {
    results: ResultData[];
}

export default function ResultsTable({ results }: ResultsTableProps) {
    if (results.length === 0) {
        return (
            <div className="text-center py-8 text-gray-500">
                <p>Nenhum resultado ainda.</p>
                <p className="text-sm mt-2">Faça comparações para ver o histórico aqui.</p>
            </div>
        );
    }

    const sortedResults = [...results].sort((a, b) => b.ssim_score - a.ssim_score);

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rank</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Imagem</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">SSIM</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Dif. Média</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Brilho</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contraste</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Saturação</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rotação</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Redim %</th>
                </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                {sortedResults.map((result, index) => (
                    <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{index + 1}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{result.imagem_original}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 font-semibold">{result.ssim_score.toFixed(4)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-semibold">{result.diferenca_media.toFixed(2)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{result.brilho}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{result.contraste.toFixed(2)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{result.saturacao.toFixed(2)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{result.rotacao}°</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{result['redimensionamento_%']}%</td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
}