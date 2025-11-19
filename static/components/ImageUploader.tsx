'use client';

import React from 'react';
import { Upload, Image as ImageIcon, CheckCircle, FileText } from 'lucide-react';
import { ALLOWED_EXTENSIONS, MAX_FILE_SIZE_BYTES, MAX_FILE_SIZE_MB } from '../lib/types';

interface ImageUploaderProps {
    onImageSelect: (file: File, previewUrl: string) => void;
    onError: (error: string) => void;
}

export default function ImageUploader({ onImageSelect, onError }: ImageUploaderProps) {
    const [fileName, setFileName] = React.useState<string>('');
    const [fileSize, setFileSize] = React.useState<string>('');
    const [isDragOver, setIsDragOver] = React.useState(false);
    const [hasImage, setHasImage] = React.useState(false);

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

    const handleFileSelect = (file: File) => {
        const error = validateFile(file);
        if (error) {
            onError(error);
            setFileName('');
            setFileSize('');
            setHasImage(false);
            return;
        }

        setFileName(file.name);
        setFileSize(formatFileSize(file.size));
        setHasImage(true);
        const previewUrl = URL.createObjectURL(file);
        onImageSelect(file, previewUrl);
        onError('');
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            handleFileSelect(file);
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
        const file = e.dataTransfer.files[0];
        if (file) {
            handleFileSelect(file);
        }
    };

    return (
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
                        hasImage ? 'border-green-400 bg-green-50' : ''
                    }`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                >
                    {hasImage ? (
                        <div className="upload-content">
                            <div className="upload-icon">
                                <CheckCircle size={64} className="text-green-500" />
                            </div>
                            <div className="upload-text">
                                <h3>Imagem Carregada!</h3>
                                <p>Clique ou arraste para alterar</p>
                            </div>
                        </div>
                    ) : (
                        <div className="upload-content">
                            <div className="upload-icon">
                                <ImageIcon size={64} />
                            </div>
                            <div className="upload-text">
                                <h3>Arraste e solte sua imagem aqui</h3>
                                <p>ou clique para selecionar</p>
                            </div>
                            <div className="upload-requirements">
                                <p>Formatos: {ALLOWED_EXTENSIONS.join(', ').toUpperCase()}</p>
                                <p>Tamanho máximo: {MAX_FILE_SIZE_MB}MB</p>
                            </div>
                        </div>
                    )}
                </div>
            </label>

            {hasImage && (
                <div className="file-info">
                    <div className="file-name">
                        <FileText size={16} />
                        {fileName}
                    </div>
                    <div className="file-size">{fileSize}</div>
                </div>
            )}
        </div>
    );
}