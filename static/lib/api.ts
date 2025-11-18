import { EditorState, ComparisonResult, PreviewResult } from './types';

const API_URL = 'http://localhost:5000';

export async function previewImage(
    file: File,
    state: EditorState
): Promise<PreviewResult> {
    const formData = new FormData();
    formData.append('originalImage', file);
    formData.append('brilho', state.brilho.toString());
    formData.append('contraste', state.contraste.toString());
    formData.append('saturacao', state.saturacao.toString());
    formData.append('rotacao', state.rotacao.toString());
    formData.append('redim', state.redim.toString());

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

export async function compareImages(
    file: File,
    state: EditorState
): Promise<ComparisonResult> {
    const formData = new FormData();
    formData.append('originalImage', file);
    formData.append('brilho', state.brilho.toString());
    formData.append('contraste', state.contraste.toString());
    formData.append('saturacao', state.saturacao.toString());
    formData.append('rotacao', state.rotacao.toString());
    formData.append('redim', state.redim.toString());

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

export async function downloadCSV(): Promise<void> {
    const response = await fetch(`${API_URL}/api/get_csv`);

    if (!response.ok) {
        throw new Error('Nenhum resultado para baixar ainda');
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Ranking_Comparacoes.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
}