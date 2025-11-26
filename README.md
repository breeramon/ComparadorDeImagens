# 🖼️ Comparação de Imagens Simples

> Projeto acadêmico para a disciplina de Processamento de Imagens de Computação Gráfica 
> **Ciência da Computação - Universidade Tiradentes (UNIT)**

[![Python](https://img.shields.io/badge/Python-3.8+-blue.svg)](https://www.python.org/)
[![Flask](https://img.shields.io/badge/Flask-3.1.2-green.svg)](https://flask.palletsprojects.com/)
[![OpenCV](https://img.shields.io/badge/OpenCV-4.12.0-red.svg)](https://opencv.org/)

---

## 📋 Introdução

- [Descrição do Projeto](#descrição-do-projeto)
- [Funcionalidades Principais](#funcionalidades-principais)
- [Arquitetura do Sistema](#arquitetura-do-sistema)
- [Tecnologias Utilizadas](#tecnologias-utilizadas)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Instalação e Configuração](#instalação-e-configuração)
- [Como Usar](#como-usar)
- [Detalhamento Técnico](#detalhamento-técnico)
- [Equipe](#equipe)
- [Galeria](#galeria)

---

## 📖 Descrição do Projeto

Este é um projeto acadêmico desenvolvido para a disciplina de Processamento de Imagens, do curso de Ciência da Computação da Universidade Tiradentes (UNIT).

O objetivo principal do nosso grupo (Grupo 6) é implementar um **sistema Web** em Python sobre o tópico de **Comparação de Imagem Simples**, que consiste comparar imagens originais com suas versões pré-processadas. O sistema é capaz de identificar e analisar as diferenças entre as imagens, gerando tanto **métricas quantitativas** (como Diferença Média e SSIM) quanto um **mapa visual** que destaca as áreas de divergência.

### 🎯 Objetivos Específicos

- Implementar um editor de imagens com ajustes em tempo real
- Calcular métricas de similaridade estrutural (SSIM) e diferença média
- Gerar mapas visuais de diferenças usando operações bitwise (XOR)
- Criar um sistema de ranking de qualidade de pré-processamento
- Fornecer uma interface web intuitiva e moderna para análise de imagens

---

## ⚡ Funcionalidades Principais

O nosso projeto implementa as seguintes funcionalidades:

### 1. 📤 Upload de Imagens
- **Formatos suportados:** JPG, JPEG, PNG
- **Tamanho máximo:** 5 MB por arquivo
- **Drag & Drop:** Interface com arrastar e soltar
- **Validação:** Verificação automática de formato e tamanho

### 2. ✏️ Edição de Imagens em Tempo Real
- **Ajuste de Brilho:** -100 a +100
- **Ajuste de Contraste:** 0.0 a 3.0
- **Ajuste de Saturação:** 0.0 a 3.0
- **Rotação:** -180° a +180°
- **Redimensionamento:** 10% a 200%
- **Histórico:** Desfazer (Undo) e Refazer (Redo)
- **Preview ao Vivo:** Visualização instantânea das alterações

### 3. 📊 Análise Comparativa
- **SSIM (Structural Similarity Index):** Métrica de similaridade estrutural entre 0 e 1
- **Diferença Média:** Cálculo da diferença absoluta média entre pixels
- **Mapa de Diferenças:** Visualização das áreas alteradas usando operação XOR bitwise

### 4. 📈 Ranking e Exportação
- **Ranking Automático:** Ordenação por qualidade (baseado em SSIM)
- **Exportação CSV:** Download de relatório completo com todas as métricas
- **Histórico de Comparações:** Armazenamento de múltiplas análises

---

## 🏗️ Arquitetura do Sistema

O projeto segue uma arquitetura **Cliente-Servidor** com separação clara entre frontend e backend:

```
┌─────────────────────┐
│   Frontend (Web)    │
│  HTML + CSS + JS    │
└──────────┬──────────┘
           │ HTTP/REST
           ▼
┌─────────────────────┐
│  Backend (Flask)    │
│  Python + OpenCV    │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Processamento de   │
│      Imagens        │
│  (image_utils.py)   │
└─────────────────────┘
```

---

## 🛠️ Tecnologias Utilizadas

### Backend
- **Linguagem:** Python 3.8+
- **Framework Web:** Flask 3.1.2
- **Processamento de Imagens:**
  - **OpenCV (`cv2`) 4.12.0:** Leitura, manipulação e operações de imagem (`cvtColor`, `bitwise_xor`, `resize`, `convertScaleAbs`)
  - **Scikit-image 0.25.2:** Métricas avançadas (`structural_similarity`, `rotate`)
  - **Pillow 12.0.0:** Suporte adicional para formatos de imagem
- **Computação Numérica:**
  - **NumPy 2.2.6:** Operações matriciais e cálculos numéricos
  - **SciPy 1.16.2:** Algoritmos científicos avançados
- **Análise de Dados:**
  - **Pandas:** Criação de rankings e exportação para CSV

### Frontend
- **HTML5:** Estrutura semântica da interface
- **CSS3:** Estilização moderna com gradientes e animações
- **JavaScript (Vanilla):** Interatividade e comunicação com API
- **Font Awesome 5.15.4:** Ícones da interface
- **Google Fonts (Inter):** Tipografia moderna

### Ambiente de Desenvolvimento
- **Google Colab / Visual Studio Code**
- **Git:** Controle de versão

---

## 📁 Estrutura do Projeto

```
Processamento_de_Imagens_E02_Grupo6/
│
├── src/                          # Código-fonte do backend
│   ├── app.py                    # Aplicação Flask principal (API REST)
│   ├── image_utils.py            # Funções de processamento de imagens
│   └── requirements.txt          # Dependências Python
│
├── templates/                    # Templates HTML
│   └── index.html                # Interface web principal
│
├── static/                       # Arquivos estáticos
│   ├── style.css                 # Estilos CSS personalizados
│   ├── app.js                    # Lógica JavaScript do frontend
│   ├── uploads/                  # Imagens enviadas pelo usuário
│   └── results/                  # Imagens processadas e mapas de diferença
│
├── imagens/                      # Imagens de exemplo para testes
│   ├── avenida.jpg
│   ├── flores.png
│   ├── fotoFlor.jpg
│   ├── fotos_legais_131.jpg
│   └── original.jpg
│
├── docs/                         # Documentação do projeto
│   ├── Artigo.pdf
│   ├── Documento - Unidade II - Semana 4.pdf
│   └── Semana 03.docx
│
├── demo/                         # Vídeos demonstrativos
│   ├── teste1Projeto.mp4
│   ├── Video 1.mp4
│   └── VIDEO 2.mp4
│
├── requirements.txt              # Dependências globais
└── README.md                     # Este arquivo
```

---

## 🚀 Instalação e Configuração

### Pré-requisitos

- Python 3.8 ou superior
- pip (gerenciador de pacotes Python)
- Navegador web moderno (Chrome, Firefox, Edge)

### Passo a Passo

1. **Clone o repositório:**
```bash
git clone <url-do-repositorio>
cd Processamento_de_Imagens_E02_Grupo6-main
```

2. **Crie um ambiente virtual (recomendado):**
```bash
python -m venv venv
```

3. **Ative o ambiente virtual:**

Windows:
```bash
venv\Scripts\activate
```

Linux/Mac:
```bash
source venv/bin/activate
```

4. **Instale as dependências:**
```bash
pip install -r requirements.txt
```

5. **Execute a aplicação:**
```bash
cd src
python app.py
```

6. **Acesse no navegador:**
```
http://localhost:5000
```

---

## 📖 Como Usar

### 1️⃣ Upload da Imagem

1. Clique na área de upload ou arraste uma imagem
2. Formatos aceitos: JPG, JPEG, PNG (máx. 5MB)
3. Aguarde a confirmação do carregamento

### 2️⃣ Edição em Tempo Real

1. Use os controles deslizantes na barra lateral:
   - **Brilho:** Aumenta ou diminui a luminosidade
   - **Contraste:** Ajusta a diferença entre tons claros e escuros
   - **Saturação:** Modifica a intensidade das cores
   - **Rotação:** Gira a imagem no ângulo desejado
   - **Redimensionamento:** Altera o tamanho da imagem

2. Visualize as alterações em tempo real
3. Use os botões de Desfazer/Refazer para navegar no histórico
4. Clique em "Redefinir" para voltar aos valores padrão

### 3️⃣ Análise e Comparação

1. Clique em "Continuar para Análise"
2. Clique em "Analisar Diferenças"
3. Visualize os resultados:
   - **SSIM Score:** Valor entre 0 e 1 (quanto mais próximo de 1, mais similar)
   - **Diferença Média:** Valor em pixels da diferença absoluta
   - **Imagens:** Original, Editada e Mapa de Diferenças

### 4️⃣ Exportação

1. Realize múltiplas comparações
2. Clique em "Baixar Ranking (CSV)"
3. Analise o arquivo com todas as métricas e parâmetros utilizados

---

## 🔬 Detalhamento Técnico

### Métricas Implementadas

#### SSIM (Structural Similarity Index)

O SSIM é uma métrica perceptual que quantifica a similaridade estrutural entre duas imagens. Valores:
- **1.0:** Imagens idênticas
- **0.8 - 0.99:** Alta similaridade
- **0.5 - 0.79:** Similaridade moderada
- **< 0.5:** Baixa similaridade

**Implementação:**
```python
from skimage.metrics import structural_similarity
score = structural_similarity(img1_cinza, img2_cinza, full=True, data_range=255)
```

#### Diferença Média

Calcula a média das diferenças absolutas entre todos os pixels:
```python
diferenca = cv.absdiff(img1.astype("float"), img2.astype("float"))
media_diferenca = np.mean(diferenca)
```

#### Mapa de Diferenças (XOR Bitwise)

Usa a operação XOR para destacar áreas diferentes:
```python
mapa_diferenca = cv.bitwise_xor(img1, img2)
```

### API REST Endpoints

| Endpoint | Método | Descrição |
|----------|--------|-----------|
| `/` | GET | Retorna a interface web |
| `/api/compare` | POST | Realiza comparação completa e retorna métricas |
| `/api/preview` | POST | Gera preview da imagem editada |
| `/api/get_csv` | GET | Baixa o arquivo CSV com ranking |

### Processamento de Imagens

**Funções principais em `image_utils.py`:**

- `ler_imagem()`: Carrega imagem do disco
- `converter_para_cinza()`: Conversão para escala de cinza
- `ajustar_brilho_contraste()`: Aplica transformação linear
- `ajustar_saturacao()`: Manipula canal S no espaço HSV
- `rotacionar_imagem_skimage()`: Rotação com preservação de qualidade
- `redimensionar_imagem()`: Redimensionamento com interpolação
- `diferenciar_imagens_xor()`: Gera mapa de diferenças
- `calcular_ssim()`: Calcula índice de similaridade estrutural
- `calcular_diferenca_media()`: Calcula diferença pixel a pixel

---

## ✅ Funcionalidades Implementadas

- Upload de imagens com validação
- Edição em tempo real (brilho, contraste, saturação, rotação, redimensionamento)
- Cálculo de SSIM e Diferença Média
- Mapa visual de diferenças
- Interface web moderna e responsiva
- Sistema de ranking
- Exportação para CSV

---

## 👥 Equipe (Grupo 6)

### Membros e Responsabilidades

| Membro | Responsabilidade |
|--------|------------------|
| **Bernardo Rafael Castro Rezende** | Implementação das funções de edição de imagens |
| **Breno Ramon Santana dos Santos** | Testes de usabilidade e correção de bugs |
| **Christiano Brito Mota** | Integração entre módulos e bibliotecas |
| **Pedro Felipe Pereira Santos** | Documentação técnica e revisão textual |
| **Raphael Vinícius Batista Uchoa Dias** | Design e layout da interface web |
| **Vinicius Américo Damasceno Feitoza** | Coordenação e supervisão geral do projeto |

### 👩‍🏫 Professora Orientadora

**Layse Santos Souza**  
Disciplina: Processamento de Imagens  
Universidade Tiradentes (UNIT)

---

## 📸 Galeria - Interface do Projeto

### Tela Principal - Upload de Imagem

<img width="3839" height="2159" alt="Tela de Upload - Interface inicial para seleção de imagem" src="https://github.com/user-attachments/assets/d1893334-6964-4dc0-89b8-5a0e4abe053e" />

### Controles de Edição

<img width="3834" height="2159" alt="Painel lateral com controles de edição (Brilho, Contraste, Saturação, Rotação, Redimensionamento)" src="https://github.com/user-attachments/assets/aafb109a-aeee-4499-ab8c-3211ff569f86" />

### Pré-visualização em Tempo Real

<img width="3839" height="1933" alt="Visualização simultânea da imagem original e editada em tempo real" src="https://github.com/user-attachments/assets/e769d369-0550-44c9-85b4-fab8e3537453" />

### Análise de Diferenças - Métricas SSIM

<img width="3839" height="2159" alt="Exibição das métricas SSIM e Diferença Média após análise" src="https://github.com/user-attachments/assets/008584e5-bcef-4707-b5d9-c2c5ed17c08c" />

### Mapa Visual de Diferenças

<img width="3834" height="2159" alt="Mapa de diferenças gerado pela operação XOR entre imagens" src="https://github.com/user-attachments/assets/9bf74987-63e9-40f3-8ef3-03d91448f694" />

### Comparação Lado a Lado

<img width="3839" height="2159" alt="Visualização comparativa: Original, Editada e Mapa de Diferenças" src="https://github.com/user-attachments/assets/8afc7db8-39f4-4fb9-8098-e73d86f091b3" />

### Interface Responsiva

<img width="3826" height="2159" alt="Design responsivo da interface web" src="https://github.com/user-attachments/assets/0d1ce0fd-a375-4829-8576-4b175984e705" />

### Exportação de Resultados

<img width="997" height="618" alt="Funcionalidade de exportação de ranking em formato CSV" src="https://github.com/user-attachments/assets/f58ee81f-ed93-46bd-a454-1b2a213a21fc" />

### Imagens do Projeto com o front reformulado

<img width="3827" height="2094" alt="image" src="https://github.com/user-attachments/assets/95a31dfe-b7ae-407b-bc55-9140244c01dd" />

<img width="3838" height="2100" alt="image" src="https://github.com/user-attachments/assets/59096b04-cd92-4fec-8383-c02dfd82fbbe" />

<img width="3836" height="2098" alt="image" src="https://github.com/user-attachments/assets/e1706545-3be3-496d-ac09-8178af86b34d" />

<img width="3834" height="2101" alt="image" src="https://github.com/user-attachments/assets/0ca10e38-6692-4113-83da-2a18e2357b0f" />

<img width="3837" height="2098" alt="image" src="https://github.com/user-attachments/assets/50a2be54-1775-4cef-8ef3-430a99769a2b" />

<img width="3831" height="2100" alt="image" src="https://github.com/user-attachments/assets/e2a2e517-70f7-4243-8aef-2e8f9d98061b" />

