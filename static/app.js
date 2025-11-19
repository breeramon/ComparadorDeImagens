const uploader = document.getElementById('imageUploader');
const uploadZone = document.getElementById('upload-zone');
const compareButton = document.getElementById('compare-button');
const statusDiv = document.getElementById('status');
const sidebar = document.getElementById('sidebar-controls');
const uploadErrorDiv = document.getElementById('upload-error');
const fileInfoContainer = document.getElementById('file-info-container');
const downloadCsv = document.getElementById('download-csv');
const resetButton = document.getElementById('reset-button');

// Sliders
const sliders = {
    brilho: document.getElementById('slider-brilho'),
    contraste: document.getElementById('slider-contraste'),
    saturacao: document.getElementById('slider-saturacao'),
    rotacao: document.getElementById('slider-rotacao'),
    redim: document.getElementById('slider-redim')
};

const sliderValues = {
    brilho: document.getElementById('value-brilho'),
    contraste: document.getElementById('value-contraste'),
    saturacao: document.getElementById('value-saturacao'),
    rotacao: document.getElementById('value-rotacao'),
    redim: document.getElementById('value-redim')
};

// Botões
const undoButton = document.getElementById('undo-button');
const redoButton = document.getElementById('redo-button');

// Imagens
const imgPreviewOriginal = document.getElementById('img-preview-original');
const imgPreviewEdited = document.getElementById('img-preview-edited');
const resultImgOriginal = document.getElementById('result-img-original');
const resultImgEdited = document.getElementById('result-img-edited');
const resultImgMap = document.getElementById('result-img-map');

// Métricas
const ssimScoreEl = document.getElementById('ssim-score');
const diffMediaEl = document.getElementById('diff-media');

// Seções
const sections = {
    upload: document.getElementById('section-upload'),
    preview: document.getElementById('section-preview'),
    analysis: document.getElementById('section-analysis')
};

// Botão para ir para análise
const goToAnalysisBtn = document.getElementById('go-to-analysis');

// Configurações
const TAMANHO_MAX_BYTES = 5 * 1024 * 1024;
const TAMANHO_MAX_MB = 5;
const EXTENSOES_PERMITIDAS = ['.jpg', '.jpeg', '.png'];

// Estado
let editHistory = [];
let redoStack = [];
let currentFile = null;
let canvas = document.createElement('canvas');
let ctx = canvas.getContext('2d');

const defaultState = {
    brilho: 0,
    contraste: 1.0,
    saturacao: 1.0,
    rotacao: 0,
    redim: 100
};

// Função para mudar de fase
function goToPhase(phase) {
    // Oculta todas as seções
    Object.values(sections).forEach(section => {
        if (section) {
            section.classList.remove('active');
        }
    });

    // Mostra a seção desejada
    if (sections[phase]) {
        sections[phase].classList.add('active');
    }
}

// Inicialização - mostra apenas o upload
document.addEventListener('DOMContentLoaded', function() {
    goToPhase('upload');
});

// Drag and Drop
uploadZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadZone.classList.add('drag-over');
});

uploadZone.addEventListener('dragleave', () => {
    uploadZone.classList.remove('drag-over');
});

uploadZone.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadZone.classList.remove('drag-over');

    const files = e.dataTransfer.files;
    if (files.length > 0) {
        uploader.files = files;
        handleFileUpload(files[0]);
    }
});

// Upload de arquivo
uploader.addEventListener('change', () => {
    const file = uploader.files[0];
    if (file) {
        handleFileUpload(file);
    }
});

function handleFileUpload(file) {
    statusDiv.innerHTML = "";
    uploadErrorDiv.innerHTML = "";

    if (!file) {
        fileInfoContainer.innerHTML = "";
        return;
    }

    const nomeArquivo = file.name.toLowerCase();
    const extensaoValida = EXTENSOES_PERMITIDAS.some(ext => nomeArquivo.endsWith(ext));

    if (!extensaoValida) {
        showError(`Formato de arquivo inválido. Use apenas ${EXTENSOES_PERMITIDAS.join(', ')}.`);
        uploader.value = "";
        return;
    }

    if (file.size > TAMANHO_MAX_BYTES) {
        showError(`O arquivo é maior que o limite de ${TAMANHO_MAX_MB}MB.`);
        uploader.value = "";
        return;
    }

    // Mostra info do arquivo
    const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
    fileInfoContainer.innerHTML = `
        <div class="file-info">
            <i class="fas fa-file-image"></i>
            <div class="file-details">
                <div class="file-name">${file.name}</div>
                <div class="file-size">${fileSizeMB} MB</div>
            </div>
        </div>
    `;

    currentFile = file;
    showStatus('Imagem carregada com sucesso! Ajuste os controles para editar.', 'info');

    // Mostra a sidebar e vai para a fase de preview
    sidebar.classList.add('visible');
    goToPhase('preview');
    compareButton.disabled = false;
    downloadCsv.disabled = false;

    // Carrega preview
    const reader = new FileReader();
    reader.onload = (e) => {
        const dataUrl = e.target.result;
        imgPreviewOriginal.src = dataUrl;
        imgPreviewOriginal.style.display = 'block';
        imgPreviewOriginal.parentElement.querySelector('.preview-placeholder').style.display = 'none';

        imgPreviewEdited.src = dataUrl;
        imgPreviewEdited.style.display = 'block';
        imgPreviewEdited.parentElement.querySelector('.preview-placeholder').style.display = 'none';

        // Inicializa o canvas
        const img = new Image();
        img.onload = function() {
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);
        };
        img.src = dataUrl;
    };
    reader.readAsDataURL(file);

    applyState(defaultState);
    editHistory = [getCurrentState()];
    redoStack = [];
    updateButtonStates();
    updatePreview();
}

// Gerenciamento de estado
function getCurrentState() {
    return {
        brilho: parseInt(sliders.brilho.value),
        contraste: parseFloat(sliders.contraste.value),
        saturacao: parseFloat(sliders.saturacao.value),
        rotacao: parseInt(sliders.rotacao.value),
        redim: parseInt(sliders.redim.value)
    };
}

function applyState(state) {
    for (const key in state) {
        if (sliders[key] && sliderValues[key]) {
            sliders[key].value = state[key];
            if (key === 'redim') {
                sliderValues[key].textContent = state[key] + '%';
            } else if (key === 'contraste' || key === 'saturacao') {
                sliderValues[key].textContent = parseFloat(state[key]).toFixed(1);
            } else {
                sliderValues[key].textContent = state[key];
            }
        }
    }
}

function saveState() {
    redoStack = [];
    editHistory.push(getCurrentState());
    updateButtonStates();
}

// Preview em tempo real
function updatePreview() {
    if (!currentFile || !imgPreviewOriginal.src) return;

    const state = getCurrentState();

    // Cria uma nova imagem para aplicar as transformações
    const img = new Image();
    img.onload = function() {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Aplica transformações
        ctx.filter = `brightness(${100 + state.brilho}%) contrast(${state.contraste * 100}%) saturate(${state.saturacao * 100}%)`;

        // Aplica rotação
        if (state.rotacao !== 0) {
            ctx.save();
            ctx.translate(canvas.width / 2, canvas.height / 2);
            ctx.rotate(state.rotacao * Math.PI / 180);
            ctx.translate(-canvas.width / 2, -canvas.height / 2);
        }

        // Aplica redimensionamento
        const scale = state.redim / 100;
        const scaledWidth = canvas.width * scale;
        const scaledHeight = canvas.height * scale;
        const offsetX = (canvas.width - scaledWidth) / 2;
        const offsetY = (canvas.height - scaledHeight) / 2;

        ctx.drawImage(img, offsetX, offsetY, scaledWidth, scaledHeight);

        if (state.rotacao !== 0) {
            ctx.restore();
        }

        // Atualiza a imagem editada
        imgPreviewEdited.src = canvas.toDataURL();
    };
    img.src = imgPreviewOriginal.src;
}

// Configuração dos sliders
Object.keys(sliders).forEach(key => {
    const slider = sliders[key];
    const valueSpan = sliderValues[key];

    slider.addEventListener('input', () => {
        let valor = parseFloat(slider.value);
        if (key === 'redim') {
            valueSpan.textContent = valor + '%';
        } else if (key === 'contraste' || key === 'saturacao') {
            valueSpan.textContent = valor.toFixed(1);
        } else {
            valueSpan.textContent = valor;
        }
        updatePreview();
    });

    slider.addEventListener('change', () => {
        saveState();
    });
});

// Undo/Redo
undoButton.addEventListener('click', () => {
    if (editHistory.length < 2) return;
    const currentState = editHistory.pop();
    redoStack.push(currentState);
    const stateToApply = editHistory[editHistory.length - 1];
    applyState(stateToApply);
    updatePreview();
    updateButtonStates();
});

redoButton.addEventListener('click', () => {
    if (redoStack.length === 0) return;
    const stateToApply = redoStack.pop();
    editHistory.push(stateToApply);
    applyState(stateToApply);
    updatePreview();
    updateButtonStates();
});

// Reset
resetButton.addEventListener('click', () => {
    applyState(defaultState);
    saveState();
    updatePreview();
});

function updateButtonStates() {
    undoButton.disabled = editHistory.length < 2;
    redoButton.disabled = redoStack.length === 0;
}

// Botão para ir para análise
if (goToAnalysisBtn) {
    goToAnalysisBtn.addEventListener('click', () => {
        goToPhase('analysis');
    });
}

// Comparação final
compareButton.addEventListener('click', async () => {
    if (!currentFile) {
        showError('Por favor, selecione uma imagem primeiro.');
        return;
    }

    compareButton.disabled = true;
    compareButton.innerHTML = '<span class="loading-spinner"></span> Analisando...';

    try {
        // Simula uma análise
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Resultados simulados
        const ssimScore = (0.8 + Math.random() * 0.19).toFixed(4);
        const diffMedia = (Math.random() * 25).toFixed(2);

        showStatus('Análise concluída com sucesso!', 'info');

        // Atualiza as métricas
        ssimScoreEl.textContent = ssimScore;
        diffMediaEl.textContent = diffMedia;

        // Atualiza as imagens de resultado
        resultImgOriginal.src = imgPreviewOriginal.src;
        resultImgOriginal.style.display = 'block';
        resultImgOriginal.parentElement.querySelector('.preview-placeholder').style.display = 'none';

        resultImgEdited.src = imgPreviewEdited.src;
        resultImgEdited.style.display = 'block';
        resultImgEdited.parentElement.querySelector('.preview-placeholder').style.display = 'none';

        // Cria um mapa de diferença simulado
        const diffCanvas = document.createElement('canvas');
        const diffCtx = diffCanvas.getContext('2d');
        diffCanvas.width = canvas.width;
        diffCanvas.height = canvas.height;

        // Gera um mapa de diferença simples
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        for (let i = 0; i < data.length; i += 4) {
            const diff = Math.random() > 0.7 ? 255 : 0;
            data[i] = diff;     // R
            data[i + 1] = 0;    // G
            data[i + 2] = 0;    // B
        }

        diffCtx.putImageData(imageData, 0, 0);
        resultImgMap.src = diffCanvas.toDataURL();
        resultImgMap.style.display = 'block';
        resultImgMap.parentElement.querySelector('.preview-placeholder').style.display = 'none';

    } catch (error) {
        console.error("Erro:", error);
        showError(`Erro: ${error.message}`);
    } finally {
        compareButton.disabled = false;
        compareButton.innerHTML = '<i class="fas fa-chart-line"></i> Analisar Diferenças';
    }
});

// Download CSV
downloadCsv.addEventListener('click', () => {
    const csvContent = "data:text/csv;charset=utf-8,"
        + "Nome,SSIM,Diferença Média\n"
        + "Imagem 1," + ssimScoreEl.textContent + "," + diffMediaEl.textContent;

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "analise_imagens.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
});

// Funções de UI
function showStatus(message, type) {
    statusDiv.innerHTML = `
        <div class="status-message status-${type}">
            <i class="fas fa-${type === 'info' ? 'info-circle' : 'exclamation-triangle'}"></i>
            ${message}
        </div>
    `;
}

function showError(message) {
    uploadErrorDiv.innerHTML = `
        <div class="status-message status-error">
            <i class="fas fa-exclamation-circle"></i>
            ${message}
        </div>
    `;
}