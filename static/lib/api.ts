import { EditorState } from './types';

const API_BASE_URL = 'http://localhost:5000';

export async function previewImage(file: File, state: EditorState): Promise<{ edited_url: string }> {
    const formData = new FormData();

    // Adicionar o arquivo com o nome exato que o Flask espera
    formData.append('originalImage', file);

    // Adicionar os parâmetros como strings
    formData.append('brilho', state.brilho.toString());
    formData.append('contraste', state.contraste.toString());
    formData.append('saturacao', state.saturacao.toString());
    formData.append('rotacao', state.rotacao.toString());
    formData.append('redim', state.redim.toString());

    console.log('📤 Enviando para preview:', {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        brilho: state.brilho,
        contraste: state.contraste,
        saturacao: state.saturacao,
        rotacao: state.rotacao,
        redim: state.redim
    });

    try {
        const response = await fetch(`${API_BASE_URL}/api/preview`, {
            method: 'POST',
            body: formData,
        });

        console.log('📥 Status da resposta:', response.status);
        console.log('📥 Headers:', response.headers);

        const responseText = await response.text();
        console.log('📥 Resposta bruta:', responseText);

        if (!response.ok) {
            let errorMessage = `Erro ${response.status} ao gerar preview`;
            try {
                const errorData = JSON.parse(responseText);
                errorMessage = errorData.error || errorMessage;
                console.error('❌ Erro da API:', errorData);
            } catch (e) {
                errorMessage = responseText || errorMessage;
            }
            throw new Error(errorMessage);
        }

        const result = JSON.parse(responseText);
        console.log('✅ Preview gerado com sucesso:', result);
        return result;
    } catch (error) {
        console.error('❌ Erro na requisição:', error);
        throw error;
    }
}

export async function compareImages(file: File, state: EditorState): Promise<any> {
    const formData = new FormData();

    formData.append('originalImage', file);
    formData.append('brilho', state.brilho.toString());
    formData.append('contraste', state.contraste.toString());
    formData.append('saturacao', state.saturacao.toString());
    formData.append('rotacao', state.rotacao.toString());
    formData.append('redim', state.redim.toString());

    console.log('📤 Enviando para comparação:', {
        fileName: file.name,
        fileSize: file.size,
        brilho: state.brilho,
        contraste: state.contraste,
        saturacao: state.saturacao,
        rotacao: state.rotacao,
        redim: state.redim
    });

    try {
        const response = await fetch(`${API_BASE_URL}/api/compare`, {
            method: 'POST',
            body: formData,
        });

        console.log('📥 Status da resposta:', response.status);

        const responseText = await response.text();
        console.log('📥 Resposta bruta:', responseText);

        if (!response.ok) {
            let errorMessage = `Erro ${response.status} ao comparar imagens`;
            try {
                const errorData = JSON.parse(responseText);
                errorMessage = errorData.error || errorMessage;
                console.error('❌ Erro da API:', errorData);
            } catch (e) {
                errorMessage = responseText || errorMessage;
            }
            throw new Error(errorMessage);
        }

        const result = JSON.parse(responseText);
        console.log('✅ Comparação realizada com sucesso:', result);
        return result;
    } catch (error) {
        console.error('❌ Erro na requisição:', error);
        throw error;
    }
}

export async function downloadCSV(): Promise<void> {
    try {
        const response = await fetch(`${API_BASE_URL}/api/get_csv`);

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Erro ao baixar CSV');
        }

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = 'Ranking_Comparacoes.csv';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
    } catch (error) {
        console.error('Erro ao baixar CSV:', error);
        throw error;
    }
}