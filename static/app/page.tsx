// page.tsx
'use client';

import React, { useState, useCallback, useEffect } from 'react';
import ImageUploader from './components/ImageUploader';
import ImageEditor from './components/ImageEditor';
import PreviewPanel from './components/PreviewPanel';
import ComparisonResults from './components/ComparisonResults';
import { EditorState, DEFAULT_STATE, ComparisonResult } from './lib/types';
import { previewImage, compareImages, downloadCSV } from './lib/api';

export default function Home() {
    const [currentFile, setCurrentFile] = useState<File | null>(null);
    const [originalUrl, setOriginalUrl] = useState<string>('');
    const [editedUrl, setEditedUrl] = useState<string>('');
    const [editorState, setEditorState] = useState<EditorState>(DEFAULT_STATE);
    const [results, setResults] = useState<ComparisonResult | null>(null);

    const [editHistory, setEditHistory] = useState<EditorState[]>([DEFAULT_STATE]);
    const [redoStack, setRedoStack] = useState<EditorState[]>([]);
    const [historyIndex, setHistoryIndex] = useState<number>(0);

    const [isLoading, setIsLoading] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);
    const [error, setError] = useState<string>('');
    const [status, setStatus] = useState<string>('');

    // Debounce para preview automático
    const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null);

    const handleImageSelect = (file: File, previewUrl: string) => {
        setCurrentFile(file);
        setOriginalUrl(previewUrl);
        setEditedUrl(previewUrl);
        setEditorState(DEFAULT_STATE);
        setEditHistory([DEFAULT_STATE]);
        setRedoStack([]);
        setHistoryIndex(0);
        setResults(null);
        setStatus('Imagem carregada. Ajuste os parâmetros.');
    };

    const updatePreview = useCallback(
        async (state: EditorState) => {
            if (!currentFile) return;

            setIsLoading(true);
            setStatus('Atualizando preview...');

            try {
                const result = await previewImage(currentFile, state);
                setEditedUrl(`${result.edited_url}?t=${Date.now()}`);
                setStatus('Preview atualizado');
            } catch (err: any) {
                setError(err.message);
                setStatus('Erro no preview');
            } finally {
                setIsLoading(false);
            }
        },
        [currentFile]
    );

    const handleEditorChange = (key: keyof EditorState, value: number) => {
        const newState = { ...editorState, [key]: value };
        setEditorState(newState);

        // Limpar timer anterior
        if (debounceTimer) {
            clearTimeout(debounceTimer);
        }

        // Criar novo timer para debounce (500ms)
        const timer = setTimeout(() => {
            // Salvar no histórico
            const newHistory = editHistory.slice(0, historyIndex + 1);
            newHistory.push(newState);
            setEditHistory(newHistory);
            setHistoryIndex(newHistory.length - 1);
            setRedoStack([]);

            // Atualizar preview
            updatePreview(newState);
        }, 500);

        setDebounceTimer(timer);
    };

    const handleUndo = () => {
        if (historyIndex <= 0) return;

        const newIndex = historyIndex - 1;
        const stateToApply = editHistory[newIndex];

        setRedoStack([editorState, ...redoStack]);
        setEditorState(stateToApply);
        setHistoryIndex(newIndex);
        updatePreview(stateToApply);
    };

    const handleRedo = () => {
        if (redoStack.length === 0) return;

        const [stateToApply, ...newRedoStack] = redoStack;
        const newHistory = [...editHistory.slice(0, historyIndex + 1), stateToApply];

        setEditHistory(newHistory);
        setHistoryIndex(newHistory.length - 1);
        setEditorState(stateToApply);
        setRedoStack(newRedoStack);
        updatePreview(stateToApply);
    };

    const handleCompare = async () => {
        if (!currentFile) {
            setError('Selecione uma imagem primeiro');
            return;
        }

        setIsLoading(true);
        setStatus('Processando comparação final...');
        setError('');

        try {
            const result = await compareImages(currentFile, editorState);
            setResults(result);
            setStatus('Comparação concluída!');
        } catch (err: any) {
            setError(err.message);
            setStatus('Erro na comparação');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDownloadCSV = async () => {
        setIsDownloading(true);
        setError('');

        try {
            await downloadCSV();
            setStatus('Ranking baixado com sucesso!');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsDownloading(false);
        }
    };

    // Cleanup do debounce
    useEffect(() => {
        return () => {
            if (debounceTimer) {
                clearTimeout(debounceTimer);
            }
        };
    }, [debounceTimer]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 text-white p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <header className="text-center mb-12">
                    <h1 className="text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
                        Comparador de Imagens
                    </h1>
                    <p className="text-gray-300 text-lg">
                        Ajuste parâmetros e compare imagens com métricas avançadas
                    </p>
                </header>

                {/* Status e Erros */}
                {status && (
                    <div className="bg-blue-900 border border-blue-700 text-blue-200 px-4 py-3 rounded mb-6">
                        {status}
                    </div>
                )}
                {error && (
                    <div className="bg-red-900 border border-red-700 text-red-200 px-4 py-3 rounded mb-6">
                        {error}
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Sidebar - Upload e Editor */}
                    <div className="lg:col-span-1 space-y-6">
                        <ImageUploader onImageSelect={handleImageSelect} onError={setError} />

                        {currentFile && (
                            <ImageEditor
                                state={editorState}
                                onChange={handleEditorChange}
                                onUndo={handleUndo}
                                onRedo={handleRedo}
                                canUndo={historyIndex > 0}
                                canRedo={redoStack.length > 0}
                            />
                        )}
                    </div>

                    {/* Main Content - Preview e Resultados */}
                    <div className="lg:col-span-2 space-y-6">
                        <PreviewPanel
                            originalUrl={originalUrl}
                            editedUrl={editedUrl}
                            isLoading={isLoading}
                        />

                        {currentFile && (
                            <button
                                onClick={handleCompare}
                                disabled={isLoading}
                                className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed py-3 px-6 rounded-lg font-semibold text-lg transition-colors"
                            >
                                {isLoading ? 'Processando...' : '3. Comparar Imagem Editada'}
                            </button>
                        )}

                        <ComparisonResults
                            results={results}
                            onDownloadCSV={handleDownloadCSV}
                            isDownloading={isDownloading}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}