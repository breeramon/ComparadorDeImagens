export interface ImageEdits {
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

export interface ResultData {
    imagem_original: string;
    ssim_score: number;
    diferenca_media: number;
    brilho: number;
    contraste: number;
    saturacao: number;
    rotacao: number;
    'redimensionamento_%': number;
}