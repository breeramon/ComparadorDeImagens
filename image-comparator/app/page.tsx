'use client';

import { useState } from 'react';
import ImageUploader from '@/components/ImageUploader';
import ImageEditor from '@/components/ImageEditor';
import ImageComparison from '@/components/ImageComparison';
import { ImageEdits, ComparisonResult } from '@/types';
import { compareImages, previewImage, getImageUrl, downloadCSV } from '@/lib/api';
import { Download } from 'lucide-react';

export default function Home() {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [edits, setEdits] = useState<ImageEdits>({
        brilho: 0,
        contraste: 1.0,
        saturacao: 1.0,
        rotacao: 0,
        redim: 100,
    });
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [comparisonResult, setComparisonResult] = useState<ComparisonResult | null>(null);
    const [isLoadingPreview, setIsLoadingPreview] = useState(false);
    const [isLoadingComparison, setIsLoadingComparison] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handlePreview = async () => {
        if (!selectedFile) {
            setError('Por favor, selecione uma imagem primeiro');
            return;
        }

        setIsLoadingPreview(true);
        setError(null);

        try {
            const result = await previewImage(selectedFile, edits);
            setPreviewUrl(getImageUrl(result.edited_url));
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erro ao gerar preview');
        } finally {
            setIsLoadingPreview(false);
        }
    };

    const handleCompare = async () => {
        if (!selectedFile) {
            setError('Por favor, selecione uma imagem primeiro');
            return;
        }

        setIsLoadingComparison(true);
        setError(null);

        try {
            const result = await compareImages(selectedFile, edits);
            setComparisonResult(result);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erro ao comparar imagens');
        } finally {
            setIsLoadingComparison(false);
        }
    };

    const handleReset = () => {
        setEdits({
            brilho: 0,
            contraste: 1.0,
            saturacao: 1.0,
            rotacao: 0,
            redim: 100,
        });
        setPreviewUrl(null);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
            <div className="container mx-auto px-4 py-8">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-gray-800 mb-2">
                        Comparador de Imagens
                    </h1>
                    <p className="text-gray-600">
                        Edite e compare imagens com métricas de similaridade
                    </p>
                </div>
                
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                        {error}
                    </div>
                )}

                {/* Grid principal */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                    {/* Coluna 1: Upload */}
                    <div className="bg-white rounded-lg shadow-lg p-6">
                        <ImageUploader
                            onImageSelect={setSelectedFile}
                            selectedFile={selectedFile}
                        />
                    </div>

                    <div className="bg-white rounded-lg shadow-lg p-6">
                        <ImageEditor
                            edits={edits}
                            onChange={setEdits}
                            onPreview={handlePreview}
                            previewUrl={previewUrl}
                            isLoadingPreview={isLoadingPreview}
                        />

                        <div className="mt-4 space-y-2">
                            <button
                                onClick={handleReset}
                                className="w-full bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600 transition-colors"
                            >
                                Resetar Ajustes
                            </button>
                        </div>
                    </div>
                    
                    <div className="bg-white rounded-lg shadow-lg p-6 flex flex-col justify-between">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-800 mb-4">Ações</h3>

                            <button
                                onClick={handleCompare}
                                disabled={!selectedFile || isLoadingComparison}
                                className="w-full bg-green-500 text-white py-3 px-4 rounded-lg hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-semibold mb-4"
                            >
                                {isLoadingComparison ? 'Comparando...' : '🔍 Comparar Imagens'}
                            </button>

                            <a
                                href={downloadCSV()}
                                download
                                className="w-full bg-indigo-500 text-white py-3 px-4 rounded-lg hover:bg-indigo-600 transition-colors font-semibold flex items-center justify-center gap-2"
                            >
                                <Download size={20} />
                                Baixar CSV (Ranking)
                            </a>
                        </div>

                        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                            <h4 className="text-sm font-semibold text-gray-700 mb-2">Como usar:</h4>
                            <ol className="text-xs text-gray-600 space-y-1 list-decimal list-inside">
                                <li>Faça upload de uma imagem</li>
                                <li>Ajuste os parâmetros de edição</li>
                                <li>Clique em "Ver Preview" para visualizar</li>
                                <li>Clique em "Comparar" para gerar métricas</li>
                                <li>Baixe o CSV para ver o ranking</li>
                            </ol>
                        </div>
                    </div>
                </div>
                
                <div className="bg-white rounded-lg shadow-lg p-6">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">
                        Resultados da Comparação
                    </h2>
                    <ImageComparison result={comparisonResult} />
                </div>
            </div>
        </div>
    );
}