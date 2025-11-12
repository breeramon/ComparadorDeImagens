# app.py

# Imports que ESTE ARQUIVO precisa
from flask import Flask, request, jsonify, send_from_directory, render_template, send_file
import os
import cv2 as cv # Precisamos do cv.imwrite
import pandas as pd
# IMPORTA O NOSSO OUTRO ARQUIVO
import image_utils as utils 

# --- Configuração do Servidor ---
app = Flask(__name__)
# Define o tamanho máximo de upload (5MB), como você pediu
app.config['MAX_CONTENT_LENGTH'] = 5 * 1024 * 1024 
# Extensões permitidas
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg'}

# Pastas (caminhos)
UPLOAD_FOLDER = os.path.join('../static', 'uploads')
RESULT_FOLDER = os.path.join('../static', 'results')
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['RESULT_FOLDER'] = RESULT_FOLDER

# Garante que as pastas existam
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(RESULT_FOLDER, exist_ok=True)

# --- 2. LISTA GLOBAL PARA GUARDAR RESULTADOS ---
all_results = []

# Função auxiliar para checar extensão
def arquivo_permitido(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# --- Nossas Rotas (Endpoints) ---

@app.route('/')
def index():
    # Por enquanto, só um teste. Depois, isso servirá o index.html
    return render_template('index.html')

@app.route('/api/compare', methods=['POST'])
def handle_comparison():
    
    # --- 1. Validação da Imagem Original ---
    if 'originalImage' not in request.files:
        return jsonify({"error": "Nenhum arquivo 'originalImage' enviado"}), 400
        
    file_original = request.files['originalImage']
    
    if file_original.filename == '':
        return jsonify({"error": "Nenhum arquivo selecionado"}), 400

    if not file_original or not arquivo_permitido(file_original.filename):
        return jsonify({"error": "Formato de arquivo não permitido"}), 400
        
    # --- 2. Receber Parâmetros de Edição ---
    # Recebe os valores dos sliders (com valores padrão)
    brilho = int(request.form.get('brilho', 0))
    contraste = float(request.form.get('contraste', 1.0))
    saturacao = float(request.form.get('saturacao', 1.0))
    rotacao = int(request.form.get('rotacao', 0))
    redim = int(request.form.get('redim', 100))

    # --- 3. Processamento (Usando image_utils.py) ---
    
    # Salva o arquivo original temporariamente
    caminho_original = os.path.join(app.config['UPLOAD_FOLDER'], file_original.filename)
    file_original.save(caminho_original)

    # Lê a imagem usando NOSSA função
    img_original = utils.ler_imagem(caminho_original)
    
    if img_original is None:
        return jsonify({"error": "Não foi possível ler a imagem"}), 400

    # Aplica edições usando NOSSAS funções
    img_editada = img_original.copy()
    img_editada = utils.ajustar_brilho_contraste(img_editada, brilho, contraste)
    img_editada = utils.ajustar_saturacao(img_editada, saturacao)
    img_editada = utils.rotacionar_imagem_skimage(img_editada, rotacao)
    img_editada = utils.redimensionar_imagem(img_editada, redim)
    
    # Gera o mapa de diferença usando NOSSA função
    # (Temos que redimensionar a original caso a edição tenha mudado o tamanho)
    img_original_redim = utils.redimensionar_imagem(img_original, redim)
    mapa_dif = utils.diferenciar_imagens_xor(img_original_redim, img_editada)

    # Calcula métricas usando NOSSAS funções
    ssim = utils.calcular_ssim(img_original_redim, img_editada)
    diff_media = utils.calcular_diferenca_media(img_original_redim, img_editada)
    
    # --- 4. Salvar Resultados ---
    nome_base_arquivo = "resultado_" + file_original.filename
    caminho_editada = os.path.join(app.config['RESULT_FOLDER'], "editada_" + nome_base_arquivo)
    caminho_mapa = os.path.join(app.config['RESULT_FOLDER'], "mapa_" + nome_base_arquivo)

    cv.imwrite(caminho_editada, img_editada)
    cv.imwrite(caminho_mapa, mapa_dif)

    global all_results
    result_data = {
        'imagem_original': file_original.filename,
        'ssim_score': ssim,
        'diferenca_media': diff_media,
        'brilho': brilho,
        'contraste': contraste,
        'saturacao': saturacao,
        'rotacao': rotacao,
        'redimensionamento_%': redim
    }
    all_results.append(result_data)

    # --- 5. Devolver Resposta para o Front-end ---
    return jsonify({
        'ssim_score': ssim,
        'diferenca_media': diff_media,
        'original_url': caminho_original, # O front-end vai ler de /static/...
        'edited_url': caminho_editada,
        'diff_map_url': caminho_mapa
    })

@app.route('/api/preview', methods=['POST'])
def handle_preview():
    # 1. Validação (copiado do 'compare')
    if 'originalImage' not in request.files:
        return jsonify({"error": "Nenhum arquivo 'originalImage' enviado"}), 400
        
    file_original = request.files['originalImage']
    
    if file_original.filename == '':
        return jsonify({"error": "Nenhum arquivo selecionado"}), 400

    if not file_original or not arquivo_permitido(file_original.filename):
        return jsonify({"error": "Formato de arquivo não permitido"}), 400
        
    # 2. Receber Parâmetros de Edição
    brilho = int(request.form.get('brilho', 0))
    contraste = float(request.form.get('contraste', 1.0))
    saturacao = float(request.form.get('saturacao', 1.0))
    rotacao = int(request.form.get('rotacao', 0))
    redim = int(request.form.get('redim', 100))

    # 3. Processamento (Usando image_utils.py)
    
    # Salva o arquivo original temporariamente
    # (Usamos um nome diferente para não conflitar com a 'comparação')
    nome_preview_original = "preview_original.png" 
    caminho_original = os.path.join(app.config['UPLOAD_FOLDER'], nome_preview_original)
    file_original.save(caminho_original)

    img_original = utils.ler_imagem(caminho_original)
    
    if img_original is None:
        return jsonify({"error": "Não foi possível ler a imagem"}), 400

    # Aplica edições
    img_editada = img_original.copy()
    img_editada = utils.ajustar_brilho_contraste(img_editada, brilho, contraste)
    img_editada = utils.ajustar_saturacao(img_editada, saturacao)
    img_editada = utils.rotacionar_imagem_skimage(img_editada, rotacao)
    img_editada = utils.redimensionar_imagem(img_editada, redim)
    
    # --- Diferença Principal: NÃO comparamos ---
    
    # 4. Salvar Resultado (Apenas a imagem editada)
    nome_preview_editada = "preview_editada.png"
    caminho_editada = os.path.join(app.config['RESULT_FOLDER'], nome_preview_editada)
    cv.imwrite(caminho_editada, img_editada)

    # 5. Devolver Resposta (Apenas a URL da imagem editada)
    return jsonify({
        'edited_url': caminho_editada
    })
# --- FIM DA NOVA ROTA ---

# --- 4. NOVA ROTA PARA GERAR O CSV ---
@app.route('/api/get_csv')
def get_csv():
    global all_results
    if not all_results:
        return jsonify({"error": "Nenhum resultado para rankear ainda."}), 400
    
    # 1. Converte a lista de resultados em um DataFrame do Pandas
    df = pd.DataFrame(all_results)
    
    # 2. Cria o ranking (Tarefa 5)
    #    Vamos rankear pelo SSIM (quanto maior, melhor)
    df_ranking = df.sort_values(by="ssim_score", ascending=False)
    
    # 3. Adiciona a coluna de Ranking
    df_ranking['Ranking_Qualidade'] = range(1, len(df_ranking) + 1)
    
    # 4. Salva o arquivo CSV temporariamente (Tarefa 4)
    csv_path = os.path.join(app.config['RESULT_FOLDER'], 'ranking_resultados.csv')
    df_ranking.to_csv(csv_path, index=False, sep=';', decimal=',') # (Use ; e , para Excel BR)
    
    # 5. Envia o arquivo para o usuário fazer o download
    return send_file(
        csv_path,
        as_attachment=True,
        download_name='Ranking_Comparacoes.csv', # Nome que o usuário verá
        mimetype='text/csv'
    )

# --- Rota para servir as imagens salvas ---
@app.route('/static/<path:path>')
def send_static_file(path):
    return send_from_directory('../static', path)


# --- Código para Rodar o Servidor ---
if __name__ == '__main__':
    # debug=True faz o servidor reiniciar automaticamente quando você salva o arquivo
    app.run(debug=True)