import { ImageEdits, ComparisonResult, PreviewResult } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export async function compareImages(file: File, edits: ImageEdits): Promise<ComparisonResult> {
    const formData = new FormData();
    formData.append('originalImage', file);
    formData.append('brilho', edits.brilho.toString());
    formData.append('contraste', edits.contraste.toString());
    formData.append('saturacao', edits.saturacao.toString());
    formData.append('rotacao', edits.rotacao.toString());
    formData.append('redim', edits.redim.toString());

    const response = await fetch(`${API_URL}/api/compare`, {
        method: 'POST',
        body: formData,
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao comparar imagens');
    }

    return response.json();
}

export async function previewImage(file: File, edits: ImageEdits): Promise<PreviewResult> {
    const formData = new FormData();
    formData.append('originalImage', file);
    formData.append('brilho', edits.brilho.toString());
    formData.append('contraste', edits.contraste.toString());
    formData.append('saturacao', edits.saturacao.toString());
    formData.append('rotacao', edits.rotacao.toString());
    formData.append('redim', edits.redim.toString());

    const response = await fetch(`${API_URL}/api/preview`, {
        method: 'POST',
        body: formData,
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao gerar preview');
    }

    return response.json();
}

export function getImageUrl(path: string): string {
    return `${API_URL}${path}`;
}

export function downloadCSV(): string {
    return `${API_URL}/api/get_csv`;
}