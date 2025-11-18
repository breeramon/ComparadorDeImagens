// types.ts - Definições de tipos para o projeto

export interface EditorState {
    brilho: number;
    contraste: number;
    saturacao: number;
    rotacao: number;
    redim: number;
}

export interface ComparisonResult {
    ssim_score: number;
    diferenca_media: number;
    original_url: string;
    edited_url: string;
    diff_map_url: string;
}

export interface PreviewResult {
    edited_url: string;
}

export const DEFAULT_STATE: EditorState = {
    brilho: 0,
    contraste: 1.0,
    saturacao: 1.0,
    rotacao: 0,
    redim: 100,
};

export const SLIDER_CONFIGS = {
    brilho: { min: -100, max: 100, step: 1, unit: '' },
    contraste: { min: 0.5, max: 3.0, step: 0.1, unit: '' },
    saturacao: { min: 0.0, max: 3.0, step: 0.1, unit: '' },
    rotacao: { min: 0, max: 360, step: 1, unit: '°' },
    redim: { min: 10, max: 200, step: 5, unit: '%' },
};

export const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png'];
export const MAX_FILE_SIZE_MB = 5;
export const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;