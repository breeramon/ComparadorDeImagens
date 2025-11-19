'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Settings, ArrowLeft, ArrowRight, Eye, RotateCw } from 'lucide-react';
import ImageEditor from '../../components/ImageEditor';
import { EditorState, DEFAULT_STATE } from '../../lib/types';
import { previewImage } from '../../lib/api';

interface ImageData {
    file: File;
    previewUrl: string;
    name: string;
    size: number;
}

export default function EditPage() {
    const router = useRouter();
    const [imageData, setImageData] = useState<ImageData | null>(null);
    const [editorState, setEditorState] = useState<EditorState>(DEFAULT_STATE);
    const [editedUrl, setEditedUrl] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string>('');
    const [status, setStatus] = useState<string>('');

    const [editHistory, setEditHistory] = useState<EditorState[]>([DEFAULT_STATE]);
    const [redoStack, setRedoStack] = useState<EditorState[]>([]);
    const [historyIndex, setHistoryIndex] = useState<number>(0);
    const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null);

    // Carregar imagem do sessionStorage
    useEffect(() => {
        const savedImage = sessionStorage.getItem('currentImage');
        if (!savedImage) {
            router.push('/');
            return;
        }

        const parsedData: ImageData = JSON.parse(savedImage);

        // Recriar o objeto File a partir dos dados salvos
        const file = new File([parsedData.file], parsedData.name, {
            type: parsedData.file.type,
            lastModified: new Date().getTime()
        });

        const imageDataWithFile: ImageData = {
            ...parsedData,
            file: file
        };

        setImageData(imageDataWithFile);
        setEditedUrl(parsedData.previewUrl);
        setStatus('✅ Imagem carregada! Ajuste os parâmetros abaixo.');
    }, [router]);

    const updatePreview = useCallback(
        async (state: EditorState) => {
            if (!imageData) return;

            setIsLoading(true);
            setStatus('🔄 Processando alterações...');

            try {
                console.log('Chamando previewImage com arquivo:', imageData.file);
                const result = await previewImage(imageData.file, state);
                setEditedUrl(`${result.edited_url}?t=${Date.now()}`);
                setStatus('✅ Preview atualizado!');
            } catch (err: any) {
                console.error('Erro no preview:', err);
                setError(`❌ ${err.message}`);
                setStatus('❌ Erro ao processar imagem');
            } finally {
                setIsLoading(false);
            }
        },
        [imageData]
    );

    const handleEditorChange = (key: keyof EditorState, value: number) => {
        const newState = { ...editorState, [key]: value };
        setEditorState(newState);

        // Limpar timer anterior
        if (debounceTimer) {
            clearTimeout(debounceTimer);
        }

        // Criar novo timer para debounce
        const timer = setTimeout(() => {
            const newHistory = editHistory.slice(0, historyIndex + 1);
            newHistory.push(newState);
            setEditHistory(newHistory);
            setHistoryIndex(newHistory.length - 1);
            setRedoStack([]);
            updatePreview(newState);
        }, 800); // Aumentei para 800ms para dar mais tempo

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

    const handleCompare = () => {
        if (!imageData) {
            setError('❌ Nenhuma imagem carregada');
            return;
        }

        // Salvar estado atual para usar na página de resultados
        const editData = {
            imageData: {
                ...imageData,
                file: imageData.file // Já é um File object válido
            },
            editorState,
            editedUrl
        };

        sessionStorage.setItem('editData', JSON.stringify(editData));
        router.push('/results');
    };

    const handleBack = () => {
        router.push('/');
    };

    // Cleanup do timer
    useEffect(() => {
        return () => {
            if (debounceTimer) {
                clearTimeout(debounceTimer);
            }
        };
    }, [debounceTimer]);

    if (!imageData) {
        return (
            <div className="flex items-center justify-center min-h-96">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                <span className="ml-3 text-gray-600">Carregando imagem...</span>
            </div>
        );
    }

    return (
        <div className="fade-in">
            {/* Header */}
            <header className="app-header">
                <h1 className="app-title">Editar Imagem</h1>
                <p className="app-subtitle">
                    Ajuste os parâmetros da imagem e visualize as alterações em tempo real
                </p>
            </header>

            {/* Progress Steps */}
            <div className="progress-steps">
                <div className="step completed">
                    <div className="step-number">1</div>
                    <div className="step-label">Upload da Imagem</div>
                    <div className="step-connector"></div>
                </div>
                <div className="step active">
                    <div className="step-number">2</div>
                    <div className="step-label">Edição</div>
                    <div className="step-connector"></div>
                </div>
                <div className="step">
                    <div className="step-number">3</div>
                    <div className="step-label">Resultados</div>
                </div>
            </div>

            {/* Status e Erros */}
            <div className="space-y-4 mb-6">
                {status && (
                    <div className={`status-message ${error ? 'status-error' : 'status-info'} fade-in`}>
                        {status}
                    </div>
                )}
            </div>

            {/* Editor Layout */}
            <div className="editor-layout">
                {/* Sidebar - Editor Controls */}
                <div className="editor-sidebar">
                    <div className="card-header">
                        <div className="card-icon">
                            <Settings size={24} />
                        </div>
                        <div>
                            <h2 className="card-title">Controles de Edição</h2>
                            <p className="card-description">
                                Ajuste os parâmetros abaixo
                            </p>
                        </div>
                    </div>

                    <ImageEditor
                        state={editorState}
                        onChange={handleEditorChange}
                        onUndo={handleUndo}
                        onRedo={handleRedo}
                        canUndo={historyIndex > 0}
                        canRedo={redoStack.length > 0}
                    />
                </div>

                {/* Main Content - Preview */}
                <div className="editor-main">
                    <div className="card-header">
                        <div className="card-icon">
                            <Eye size={24} />
                        </div>
                        <div>
                            <h2 className="card-title">Pré-visualização</h2>
                            <p className="card-description">
                                Visualize as alterações em tempo real
                            </p>
                        </div>
                        {isLoading && (
                            <RotateCw size={20} className="animate-spin text-blue-500" />
                        )}
                    </div>

                    <div className="preview-section">
                        <div className="preview-image-container">
                            <img
                                src={editedUrl || imageData.previewUrl}
                                alt="Imagem editada"
                                className="preview-image"
                                onError={(e) => {
                                    console.error('Erro ao carregar imagem:', e);
                                    setError('❌ Erro ao carregar a imagem editada');
                                }}
                            />
                            {isLoading && (
                                <div className="absolute inset-0 bg-white bg-opacity-80 flex items-center justify-center rounded-lg">
                                    <div className="text-center">
                                        <RotateCw size={32} className="animate-spin text-blue-500 mx-auto mb-2" />
                                        <p className="text-sm text-gray-600">Processando alterações...</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Info da Imagem */}
                        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                            <p className="text-sm text-gray-600">
                                <strong>Arquivo:</strong> {imageData.name}
                                ({Math.round(imageData.size / 1024)} KB)
                            </p>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="btn-group">
                        <button onClick={handleBack} className="btn btn-secondary">
                            <ArrowLeft size={20} />
                            Voltar
                        </button>
                        <button
                            onClick={handleCompare}
                            className="btn btn-primary"
                            disabled={isLoading}
                        >
                            Ver Resultados
                            <ArrowRight size={20} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}