const uploader = document.getElementById('imageUploader');
const uploadZone = document.getElementById('upload-zone');
const compareButton = document.getElementById('compare-button');
const statusDiv = document.getElementById('status');
const sidebar = document.getElementById('sidebar-controls');
const uploadErrorDiv = document.getElementById('upload-error');
const fileInfoContainer = document.getElementById('file-info-container');
const downloadCsv = document.getElementById('download-csv');
const resetButton = document.getElementById('reset-button');

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

const undoButton = document.getElementById('undo-button');
const redoButton = document.getElementById('redo-button');

const imgPreviewOriginal = document.getElementById('img-preview-original');
const imgPreviewEdited = document.getElementById('img-preview-edited');
const resultImgOriginal = document.getElementById('result-img-original');
const resultImgEdited = document.getElementById('result-img-edited');
const resultImgMap = document.getElementById('result-img-map');

const ssimScoreEl = document.getElementById('ssim-score');
const diffMediaEl = document.getElementById('diff-media');

const sections = {
    upload: document.getElementById('section-upload'),
    preview: document.getElementById('section-preview'),
    analysis: document.getElementById('section-analysis')
};

const goToAnalysisBtn = document.getElementById('go-to-analysis');

const TAMANHO_MAX_BYTES = 5 * 1024 * 1024;
const TAMANHO_MAX_MB = 5;
const EXTENSOES_PERMITIDAS = ['.jpg', '.jpeg', '.png'];

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

function goToPhase(phase) {
    Object.values(sections).forEach(section => {
        if (section) {
            section.classList.remove('active');
        }
    });

    if (sections[phase]) {
        sections[phase].classList.add('active');
    }
}

document.addEventListener('DOMContentLoaded', function() {
    goToPhase('upload');
});

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

    sidebar.classList.add('visible');
    goToPhase('preview');
    compareButton.disabled = false;
    downloadCsv.disabled = false;

    const reader = new FileReader();
    reader.onload = (e) => {
        const dataUrl = e.target.result;
        imgPreviewOriginal.src = dataUrl;
        imgPreviewOriginal.style.display = 'block';
        imgPreviewOriginal.parentElement.querySelector('.preview-placeholder').style.display = 'none';

        imgPreviewEdited.src = dataUrl;
        imgPreviewEdited.style.display = 'block';
        imgPreviewEdited.parentElement.querySelector('.preview-placeholder').style.display = 'none';

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

function updatePreview() {
    if (!currentFile || !imgPreviewOriginal.src) return;

    const state = getCurrentState();

    const img = new Image();
    img.onload = function() {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        ctx.filter = `brightness(${100 + state.brilho}%) contrast(${state.contraste * 100}%) saturate(${state.saturacao * 100}%)`;

        if (state.rotacao !== 0) {
            ctx.save();
            ctx.translate(canvas.width / 2, canvas.height / 2);
            ctx.rotate(state.rotacao * Math.PI / 180);
            ctx.translate(-canvas.width / 2, -canvas.height / 2);
        }

        const scale = state.redim / 100;
        const scaledWidth = canvas.width * scale;
        const scaledHeight = canvas.height * scale;
        const offsetX = (canvas.width - scaledWidth) / 2;
        const offsetY = (canvas.height - scaledHeight) / 2;

        ctx.drawImage(img, offsetX, offsetY, scaledWidth, scaledHeight);

        if (state.rotacao !== 0) {
            ctx.restore();
        }

        imgPreviewEdited.src = canvas.toDataURL();
    };
    img.src = imgPreviewOriginal.src;
}

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

resetButton.addEventListener('click', () => {
    applyState(defaultState);
    saveState();
    updatePreview();
});

function updateButtonStates() {
    undoButton.disabled = editHistory.length < 2;
    redoButton.disabled = redoStack.length === 0;
}

if (goToAnalysisBtn) {
    goToAnalysisBtn.addEventListener('click', () => {
        goToPhase('analysis');
    });
}

compareButton.addEventListener('click', async () => {
    if (!currentFile) {
        showError('Por favor, selecione uma imagem primeiro.');
        return;
    }

    compareButton.disabled = true;
    compareButton.innerHTML = '<span class="loading-spinner"></span> Analisando...';

    statusDiv.innerHTML = "";

    const formData = new FormData();
    formData.append('originalImage', currentFile);

    const state = getCurrentState();
    formData.append('brilho', state.brilho);
    formData.append('contraste', state.contraste);
    formData.append('saturacao', state.saturacao);
    formData.append('rotacao', state.rotacao);
    formData.append('redim', state.redim);

    try {
        const response = await fetch('/api/compare', {
            method: 'POST',
            body: formData
        });

        const results = await response.json();

        if (!response.ok) {
            throw new Error(results.error || 'Erro no processamento do servidor.');
        }

        showStatus('Análise concluída com sucesso!', 'info');

        ssimScoreEl.textContent = parseFloat(results.ssim_score).toFixed(4);
        diffMediaEl.textContent = parseFloat(results.diferenca_media).toFixed(4);

        const timestamp = new Date().getTime();

        resultImgOriginal.src = results.original_url + '?t=' + timestamp;
        resultImgOriginal.style.display = 'block';
        const placeholderOriginal = resultImgOriginal.parentElement.querySelector('.preview-placeholder');
        if(placeholderOriginal) placeholderOriginal.style.display = 'none';

        resultImgEdited.src = results.edited_url + '?t=' + timestamp;
        resultImgEdited.style.display = 'block';
        const placeholderEdited = resultImgEdited.parentElement.querySelector('.preview-placeholder');
        if(placeholderEdited) placeholderEdited.style.display = 'none';

        resultImgMap.src = results.diff_map_url + '?t=' + timestamp;
        resultImgMap.style.display = 'block';
        const placeholderMap = resultImgMap.parentElement.querySelector('.preview-placeholder');
        if(placeholderMap) placeholderMap.style.display = 'none';

        goToPhase('analysis');

    } catch (error) {
        console.error("Erro:", error);
        showError(`Erro ao conectar com o servidor: ${error.message}`);
    } finally {
        compareButton.disabled = false;
        compareButton.innerHTML = '<i class="fas fa-chart-line"></i> Analisar Diferenças';
    }
});

downloadCsv.addEventListener('click', () => {
    window.location.href = '/api/get_csv';
});

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
