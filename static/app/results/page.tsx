'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { BarChart3, Download, ArrowLeft, Award, TrendingUp } from 'lucide-react';
import ComparisonResults from '../../components/ComparisonResults';
import { ComparisonResult, EditorState } from '../../lib/types';
import { compareImages, downloadCSV } from '../../lib/api';

interface EditData {
    imageData: {
        file: File;
        previewUrl: string;
        name: string;
        size: number;
    };
    editorState: EditorState;
    editedUrl: string;
}

export default function ResultsPage() {
    const router = useRouter();
    const [editData, setEditData] = useState<EditData | null>(null);
    const [results, setResults] = useState<ComparisonResult | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isDownloading, setIsDownloading] = useState(false);
    const [error, setError] = useState<string>('');

    // Carregar dados da edição
    useEffect(() => {
        const savedEditData = sessionStorage.getItem('editData');
        if (!savedEditData) {
            router.push('/');
            return;
        }

        const editData: EditData = JSON.parse(savedEditData);
        setEditData(editData);

        // Executar comparação automaticamente
        handleCompare(editData);
    }, [router]);

    const handleCompare = async (editData: EditData) => {
        setIsLoading(true);
        setError('');

        try {
            const result = await compareImages(editData.imageData.file, editData.editorState);
            setResults(result);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDownloadCSV = async () => {
        setIsDownloading(true);
        setError('');

        try {
            await downloadCSV();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsDownloading(false);
        }
    };

    const handleBack = () => {
        router.push('/edit');
    };

    if (!editData) {
        return (
            <div className="flex items-center justify-center min-h-96">
                <div className="loading-spinner"></div>
                <span className="ml-2">Carregando...</span>
            </div>
        );
    }

    return (
        <div className="fade-in">
            {/* Header */}
            <header className="app-header">
                <h1 className="app-title">Resultados da Análise</h1>
                <p className="app-subtitle">
                    Veja as métricas detalhadas da comparação entre as imagens
                </p>
            </header>

            {/* Progress Steps */}
            <div className="progress-steps">
                <div className="step completed">
                    <div className="step-number">1</div>
                    <div className="step-label">Upload da Imagem</div>
                    <div className="step-connector"></div>
                </div>
                <div className="step completed">
                    <div className="step-number">2</div>
                    <div className="step-label">Edição</div>
                    <div className="step-connector"></div>
                </div>
                <div className="step active">
                    <div className="step-number">3</div>
                    <div className="step-label">Resultados</div>
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="status-message status-error">
                    {error}
                </div>
            )}

            {/* Loading State */}
            {isLoading && (
                <div className="card text-center py-16">
                    <div className="loading-spinner mx-auto mb-4"></div>
                    <h3 className="text-xl font-semibold mb-2">Analisando Imagens</h3>
                    <p className="text-gray-600">Calculando métricas de comparação...</p>
                </div>
            )}

            {/* Results */}
            {!isLoading && results && (
                <ComparisonResults
                    results={results}
                    onDownloadCSV={handleDownloadCSV}
                    isDownloading={isDownloading}
                />
            )}

            {/* Action Buttons */}
            <div className="btn-group">
                <button onClick={handleBack} className="btn btn-secondary">
                    <ArrowLeft size={20} />
                    Voltar para Edição
                </button>
                <button
                    onClick={() => router.push('/')}
                    className="btn btn-primary"
                >
                    Nova Análise
                </button>
            </div>
        </div>
    );
}