// app.js

// --- 1. Pegando os Elementos do HTML ---
const uploader = document.getElementById('imageUploader');
const compareButton = document.getElementById('compare-button');
const statusDiv = document.getElementById('status');
const sidebar = document.getElementById('sidebar-controls'); // Pega a sidebar
const fileNameDisplay = document.getElementById('file-name-display');
const uploadErrorDiv = document.getElementById('upload-error');

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

// Botões de Undo/Redo
const undoButton = document.getElementById('undo-button');
const redoButton = document.getElementById('redo-button');

// Imagens de Preview (Requests 1 e 2)
const imgPreviewOriginal = document.getElementById('img-preview-original');
const imgPreviewEdited = document.getElementById('img-preview-edited');

// Saídas Finais
const ssimScoreEl = document.getElementById('ssim-score');
const diffMediaEl = document.getElementById('diff-media');

// **** CORREÇÃO FEITA AQUI ****
// Pegamos as 3 imagens da área de resultados
const resultImgOriginal = document.getElementById('result-img-original');
const resultImgEdited = document.getElementById('result-img-edited');
const resultImgMap = document.getElementById('result-img-map');

// Limite de 5MB
const TAMANHO_MAX_BYTES = 5 * 1024 * 1024;
const TAMANHO_MAX_MB = 5; 
const EXTENSOES_PERMITIDAS = ['.jpg', '.jpeg', '.png'];

// --- 2. Histórico de Edição (Request 3) ---
let editHistory = []; // Pilha para Desfazer
let redoStack = [];   // Pilha para Refazer
let currentFile = null; // Para guardar o arquivo selecionado

const defaultState = {
    brilho: 0,
    contraste: 1.0,
    saturacao: 1.0,
    rotacao: 0,
    redim: 100
};

function getCurrentState() {
    return {
        brilho: sliders.brilho.value,
        contraste: sliders.contraste.value,
        saturacao: sliders.saturacao.value,
        rotacao: sliders.rotacao.value,
        redim: sliders.redim.value
    };
}

function applyState(state) {
    sliders.brilho.value = state.brilho;
    sliders.contraste.value = state.contraste;
    sliders.saturacao.value = state.saturacao;
    sliders.rotacao.value = state.rotacao;
    sliders.redim.value = state.redim;

    for (const key in state) {
        if (sliders[key] && sliderValues[key]) {
            // 1. Define a posição do slider
            sliders[key].value = state[key];
            // 2. Define o texto do <span>
            sliderValues[key].textContent = state[key];
        }
    }
}

function saveState() {
    redoStack = []; 
    editHistory.push(getCurrentState());
    updateButtonStates();
}

// --- 3. Lógica Principal ---

// REQUEST 1: Pré-visualização imediata ao selecionar
uploader.addEventListener('change', () => {
    const file = uploader.files[0];

    statusDiv.innerText = "";
    uploadErrorDiv.innerText = "";

    if (!file) {
        fileNameDisplay.textContent = "Nenhum arquivo selecionado";
        return;
    }

    const nomeArquivo = file.name.toLowerCase();
    // Verifica se o nome do arquivo termina com alguma das extensões permitidas
    const extensaoValida = EXTENSOES_PERMITIDAS.some(ext => nomeArquivo.endsWith(ext));

    if (!extensaoValida) {
        uploadErrorDiv.innerText = `Erro: Formato de arquivo inválido. Use apenas ${EXTENSOES_PERMITIDAS.join(', ')}.`;
        fileNameDisplay.textContent = "Formato inválido!";
        uploader.value = ""; 
        sidebar.style.display = 'none'; 
        return; 
    }

    if (file.size > TAMANHO_MAX_BYTES) {
        uploadErrorDiv.innerText = `Erro: O arquivo é maior que o limite de ${TAMANHO_MAX_MB}MB.`;
        fileNameDisplay.textContent = "Arquivo muito grande! Escolha outro.";
        uploader.value = ""; 
        sidebar.style.display = 'none'; 
        return;
    }

    fileNameDisplay.textContent = file.name;
    currentFile = file; 
    statusDiv.innerText = "Imagem carregada. Mova os sliders para editar.";
    sidebar.style.display = 'block'; // **** VERIFICAÇÃO **** MOSTRA a sidebar

    const reader = new FileReader();
    reader.onload = (e) => {
        const dataUrl = e.target.result;
        imgPreviewOriginal.src = dataUrl;
        imgPreviewEdited.src = dataUrl; 
    };
    reader.readAsDataURL(file);

    applyState(defaultState);
    editHistory = []; 
    saveState();
});

// REQUEST 2: Edição "em tempo real" (Live Preview)
async function updatePreview() {
    if (!currentFile) {
        statusDiv.innerText = "Erro: Nenhuma imagem selecionada.";
        return;
    }

    statusDiv.innerText = "Atualizando pré-visualização...";
    uploadErrorDiv.innerText = "";

    const formData = new FormData();
    formData.append('originalImage', currentFile);
    
    const state = getCurrentState();
    for (const key in state) {
        formData.append(key, state[key]);
    }

    try {
        const response = await fetch('/api/preview', {
            method: 'POST',
            body: formData
        });
        const results = await response.json();
        if (!response.ok) throw new Error(results.error);
        const timestamp = new Date().getTime(); 
        imgPreviewEdited.src = results.edited_url + '?t=' + timestamp;
        statusDiv.innerText = "Pré-visualização atualizada.";
    } catch (error) {
        statusDiv.innerText = `Erro no preview: ${error.message}`;
    }
}

Object.keys(sliders).forEach(key => {
    const slider = sliders[key];
    const valueSpan = sliderValues[key];

    slider.addEventListener('input', () => {
        let valor = parseFloat(slider.value);
        if (key === 'contraste' || key === 'saturacao') {
             valueSpan.textContent = valor.toFixed(1); 
        } else {
             valueSpan.textContent = valor;
        }
    });

    slider.addEventListener('change', () => {
        saveState();      
        updatePreview();  
    });
});

// REQUEST 3: Botões Desfazer / Refazer
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

function updateButtonStates() {
    undoButton.disabled = editHistory.length < 2;
    redoButton.disabled = redoStack.length === 0;
}
updateButtonStates(); 

// --- FUNÇÃO FINAL: Comparar! ---
compareButton.addEventListener('click', async () => {
    if (!currentFile) {
        statusDiv.innerText = "Erro: Por favor, selecione uma imagem primeiro.";
        return;
    }
    statusDiv.innerText = "Enviando para o back-end... Processando COMPARAÇÃO FINAL...";
    uploadErrorDiv.innerText = "";

    const formData = new FormData();
    formData.append('originalImage', currentFile);
    
    const finalState = getCurrentState();
    for (const key in finalState) {
        formData.append(key, finalState[key]);
    }

    try {
        const response = await fetch('/api/compare', {
            method: 'POST',
            body: formData
        });
        const results = await response.json();
        if (!response.ok) throw new Error(results.error || 'Falha no back-end.');

        statusDiv.innerText = "Processamento concluído!";
        
        const timestamp = new Date().getTime();
        
        // Agora popula as 3 imagens na área dos resultados
        resultImgOriginal.src = results.original_url + '?t=' + timestamp;
        resultImgEdited.src = results.edited_url + '?t=' + timestamp;
        resultImgMap.src = results.diff_map_url + '?t=' + timestamp;
        
        ssimScoreEl.innerText = parseFloat(results.ssim_score).toFixed(4);
        diffMediaEl.innerText = parseFloat(results.diferenca_media).toFixed(4);

    } catch (error) {
        console.error("Erro:", error);
        statusDiv.innerText = `Erro: ${error.message}`;
    }
});