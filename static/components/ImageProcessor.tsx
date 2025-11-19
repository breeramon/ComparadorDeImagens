'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { previewImage, compareImages } from '../lib/api';
import PreviewPanel from './PreviewPanel';
import ImageEditor from './ImageEditor';
import { EditorState, DEFAULT_STATE } from '../lib/types';

export default function ImageProcessor() {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [editorState, setEditorState] = useState<EditorState>(DEFAULT_STATE);
    const [editedUrl, setEditedUrl] = useState<string>('');
    const [originalUrl, setOriginalUrl] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);

    // Histórico para undo/redo
    const [editHistory, setEditHistory] = useState<EditorState[]>([DEFAULT_STATE]);
    const [redoStack, setRedoStack] = useState<EditorState[]>([]);
    const [historyIndex, setHistoryIndex] = useState<number>(0);
    const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            const objectUrl = URL.createObjectURL(file);
            setOriginalUrl(objectUrl);
            setEditedUrl('');
            // Resetar estado do editor
            setEditorState(DEFAULT_STATE);
            setEditHistory([DEFAULT_STATE]);
            setRedoStack([]);
            setHistoryIndex(0);
        }
    };

    const updatePreview = useCallback(async (state: EditorState) => {
        if (!selectedFile) return;

        setIsLoading(true);
        try {
            const result = await previewImage(selectedFile, state);
            setEditedUrl(result.edited_url);
        } catch (error) {
            console.error('Erro ao gerar preview:', error);
            alert(error instanceof Error ? error.message : 'Erro ao gerar preview');
        } finally {
            setIsLoading(false);
        }
    }, [selectedFile]);

    const handleEditorChange = (key: keyof EditorState, value: number) => {
        const newState = { ...editorState, [key]: value };
        setEditorState(newState);

        // Debounce para evitar muitas requisições
        if (debounceTimer) {
            clearTimeout(debounceTimer);
        }

        const timer = setTimeout(() => {
            // Adicionar ao histórico
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
        if (!selectedFile) {
            alert('Por favor, selecione uma imagem primeiro');
            return;
        }

        setIsLoading(true);
        try {
            const result = await compareImages(selectedFile, editorState);
            console.log('Resultado da comparação:', result);
            alert(`SSIM: ${(result.ssim_score * 100).toFixed(2)}%\nDiferença Média: ${result.diferenca_media.toFixed(4)}`);
        } catch (error) {
            console.error('Erro ao comparar imagens:', error);
            alert(error instanceof Error ? error.message : 'Erro ao comparar imagens');
        } finally {
            setIsLoading(false);
        }
    };

    // Cleanup do debounce timer
    useEffect(() => {
        return () => {
            if (debounceTimer) {
                clearTimeout(debounceTimer);
            }
        };
    }, [debounceTimer]);

    return (
        <div className="max-w-6xl mx-auto p-6 space-y-6">
            {/* Upload de Arquivo */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Upload da Imagem</h2>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Selecione uma imagem
                        </label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                        />
                    </div>
                    {selectedFile && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                            <p className="text-sm text-blue-700">
                                <strong>Arquivo selecionado:</strong> {selectedFile.name}
                                ({(selectedFile.size / 1024).toFixed(2)} KB)
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Botões de Ação */}
            <div className="flex gap-4">
                <button
                    onClick={handleCompare}
                    disabled={!selectedFile || isLoading}
                    className="bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2"
                >
                    {isLoading ? (
                        <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Processando...
                        </>
                    ) : (
                        'Comparar Imagens'
                    )}
                </button>
            </div>

            {/* Preview e Editor */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <PreviewPanel
                        originalUrl={originalUrl}
                        editedUrl={editedUrl}
                        isLoading={isLoading}
                    />
                </div>

                <div className="lg:col-span-1">
                    <ImageEditor
                        state={editorState}
                        onChange={handleEditorChange}
                        onUndo={handleUndo}
                        onRedo={handleRedo}
                        canUndo={historyIndex > 0}
                        canRedo={redoStack.length > 0}
                    />
                </div>
            </div>
        </div>
    );
}