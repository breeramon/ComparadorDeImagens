'use client';

import React, { useState } from 'react';
import { Upload, ArrowRight, CheckCircle, FileText } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { ALLOWED_EXTENSIONS, MAX_FILE_SIZE_BYTES, MAX_FILE_SIZE_MB } from '../lib/types';

export default function UploadPage() {
    const router = useRouter();
    const [file, setFile] = useState<File | null>(null);
    const [fileName, setFileName] = useState<string>('');
    const [fileSize, setFileSize] = useState<string>('');
    const [isDragOver, setIsDragOver] = useState(false);
    const [error, setError] = useState<string>('');

    const validateFile = (file: File): string | null => {
        const fileName = file.name.toLowerCase();
        const validExtension = ALLOWED_EXTENSIONS.some(ext => fileName.endsWith(ext));

        if (!validExtension) {
            return `Formato não suportado. Use: ${ALLOWED_EXTENSIONS.join(', ')}`;
        }

        if (file.size > MAX_FILE_SIZE_BYTES) {
            return `Arquivo muito grande. Máximo permitido: ${MAX_FILE_SIZE_MB}MB`;
        }

        return null;
    };

    const formatFileSize = (bytes: number): string => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const handleFileSelect = (selectedFile: File) => {
        const error = validateFile(selectedFile);
        if (error) {
            setError(error);
            setFile(null);
            setFileName('');
            setFileSize('');
            return;
        }

        setFile(selectedFile);
        setFileName(selectedFile.name);
        setFileSize(formatFileSize(selectedFile.size));
        setError('');
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            handleFileSelect(selectedFile);
        }
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragOver(true);
    };

    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragOver(false);
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragOver(false);
        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile) {
            handleFileSelect(droppedFile);
        }
    };

    const handleContinue = () => {
        if (!file) {
            setError('Selecione uma imagem para continuar');
            return;
        }

        // Criar preview URL
        const previewUrl = URL.createObjectURL(file);

        // Salvar a imagem no sessionStorage para usar na próxima página
        const imageData = {
            file: file, // File object completo
            previewUrl: previewUrl,
            name: file.name,
            size: file.size,
            type: file.type
        };

        sessionStorage.setItem('currentImage', JSON.stringify(imageData));
        router.push('/edit');
    };

    return (
        <div className="fade-in">
            {/* Header */}
            <header className="app-header">
                <h1 className="app-title">ImagePro</h1>
                <p className="app-subtitle">
                    Sistema profissional de comparação e edição de imagens com métricas avançadas
                </p>
            </header>

            {/* Progress Steps */}
            <div className="progress-steps">
                <div className="step active">
                    <div className="step-number">1</div>
                    <div className="step-label">Upload da Imagem</div>
                    <div className="step-connector"></div>
                </div>
                <div className="step">
                    <div className="step-number">2</div>
                    <div className="step-label">Edição</div>
                    <div className="step-connector"></div>
                </div>
                <div className="step">
                    <div className="step-number">3</div>
                    <div className="step-label">Resultados</div>
                </div>
            </div>

            {/* Upload Card */}
            <div className="card">
                <div className="card-header">
                    <div className="card-icon">
                        <Upload size={24} />
                    </div>
                    <div>
                        <h2 className="card-title">Upload da Imagem</h2>
                        <p className="card-description">
                            Faça upload da imagem que deseja editar e comparar
                        </p>
                    </div>
                </div>

                {/* Upload Area */}
                <div className="upload-container">
                    <input
                        type="file"
                        className="hidden"
                        accept={ALLOWED_EXTENSIONS.join(',')}
                        onChange={handleFileChange}
                        id="file-upload"
                    />

                    <label htmlFor="file-upload">
                        <div
                            className={`upload-area ${isDragOver ? 'drag-over' : ''} ${
                                file ? 'border-green-400 bg-green-50' : ''
                            }`}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                        >
                            {file ? (
                                <div className="upload-content">
                                    <div className="upload-icon">
                                        <CheckCircle size={64} className="text-green-500" />
                                    </div>
                                    <div className="upload-text">
                                        <h3>Imagem Carregada com Sucesso!</h3>
                                        <p>Clique ou arraste para alterar a imagem</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="upload-content">
                                    <div className="upload-icon">
                                        <Upload size={64} />
                                    </div>
                                    <div className="upload-text">
                                        <h3>Arraste e solte sua imagem aqui</h3>
                                        <p>ou clique para selecionar</p>
                                    </div>
                                    <div className="upload-requirements">
                                        <p>Formatos suportados: {ALLOWED_EXTENSIONS.join(', ').toUpperCase()}</p>
                                        <p>Tamanho máximo: {MAX_FILE_SIZE_MB}MB</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </label>

                    {file && (
                        <div className="file-info">
                            <div className="file-name">
                                <FileText size={16} />
                                {fileName}
                            </div>
                            <div className="file-size">{fileSize}</div>
                        </div>
                    )}
                </div>

                {/* Error Message */}
                {error && (
                    <div className="status-message status-error">
                        {error}
                    </div>
                )}

                {/* Action Buttons */}
                <div className="btn-group">
                    <button
                        onClick={handleContinue}
                        disabled={!file}
                        className="btn btn-primary"
                    >
                        Continuar para Edição
                        <ArrowRight size={20} />
                    </button>
                </div>
            </div>
        </div>
    );
}