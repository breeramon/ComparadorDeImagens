from flask import Flask, request, jsonify, send_from_directory, render_template, send_file
import os
import cv2 as cv
import pandas as pd
import image_utils as utils 

basedir = os.path.abspath(os.path.dirname(__file__))
root_dir = os.path.abspath(os.path.join(basedir, '..'))

app = Flask(__name__, template_folder=os.path.join(root_dir, 'templates'), static_folder=os.path.join(root_dir, 'static'))
app.config['MAX_CONTENT_LENGTH'] = 5 * 1024 * 1024 
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg'}

UPLOAD_FOLDER = os.path.join(root_dir, 'static', 'uploads')
RESULT_FOLDER = os.path.join(root_dir, 'static', 'results')

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['RESULT_FOLDER'] = RESULT_FOLDER

os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(RESULT_FOLDER, exist_ok=True)

all_results = []

def arquivo_permitido(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/compare', methods=['POST'])
def handle_comparison():
    
    if 'originalImage' not in request.files:
        return jsonify({"error": "Nenhum arquivo 'originalImage' enviado"}), 400
        
    file_original = request.files['originalImage']
    
    if file_original.filename == '':
        return jsonify({"error": "Nenhum arquivo selecionado"}), 400

    if not file_original or not arquivo_permitido(file_original.filename):
        return jsonify({"error": "Formato de arquivo não permitido"}), 400
        

    brilho = int(request.form.get('brilho', 0))
    contraste = float(request.form.get('contraste', 1.0))
    saturacao = float(request.form.get('saturacao', 1.0))
    rotacao = int(request.form.get('rotacao', 0))
    redim = int(request.form.get('redim', 100))

    nome_original_salvo = file_original.filename
    nome_base_arquivo = "resultado_" + nome_original_salvo
    nome_editada = "editada_" + nome_base_arquivo
    nome_mapa = "mapa_" + nome_base_arquivo

    caminho_original = os.path.join(app.config['UPLOAD_FOLDER'], nome_original_salvo)
    caminho_editada = os.path.join(app.config['RESULT_FOLDER'], nome_editada)
    caminho_mapa = os.path.join(app.config['RESULT_FOLDER'], nome_mapa)

    file_original.save(caminho_original)

    img_original = utils.ler_imagem(caminho_original)
    
    if img_original is None:
        return jsonify({"error": "Não foi possível ler a imagem"}), 400

    img_editada = img_original.copy()
    img_editada = utils.ajustar_brilho_contraste(img_editada, brilho, contraste)
    img_editada = utils.ajustar_saturacao(img_editada, saturacao)
    img_editada = utils.rotacionar_imagem_skimage(img_editada, rotacao)
    img_editada = utils.redimensionar_imagem(img_editada, redim)
    
    img_original_redim = utils.redimensionar_imagem(img_original, redim)
    mapa_dif = utils.diferenciar_imagens_xor(img_original_redim, img_editada)

    ssim = utils.calcular_ssim(img_original_redim, img_editada)
    diff_media = utils.calcular_diferenca_media(img_original_redim, img_editada)

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

    url_original = f"static/uploads/{nome_original_salvo}"
    url_editada = f"static/results/{nome_editada}"
    url_mapa = f"static/results/{nome_mapa}"

    return jsonify({
        'ssim_score': ssim,
        'diferenca_media': diff_media,
        'original_url': url_original,
        'edited_url': url_editada,
        'diff_map_url': url_mapa
    })

@app.route('/api/preview', methods=['POST'])
def handle_preview():
    if 'originalImage' not in request.files:
        return jsonify({"error": "Nenhum arquivo 'originalImage' enviado"}), 400
        
    file_original = request.files['originalImage']
    
    if file_original.filename == '':
        return jsonify({"error": "Nenhum arquivo selecionado"}), 400

    if not file_original or not arquivo_permitido(file_original.filename):
        return jsonify({"error": "Formato de arquivo não permitido"}), 400
        
    brilho = int(request.form.get('brilho', 0))
    contraste = float(request.form.get('contraste', 1.0))
    saturacao = float(request.form.get('saturacao', 1.0))
    rotacao = int(request.form.get('rotacao', 0))
    redim = int(request.form.get('redim', 100))

    nome_preview_original = "preview_original.png" 
    nome_preview_editada = "preview_editada.png"

    # 2. Criamos os CAMINHOS ABSOLUTOS (para salvar)
    caminho_original = os.path.join(app.config['UPLOAD_FOLDER'], nome_preview_original)
    caminho_editada = os.path.join(app.config['RESULT_FOLDER'], nome_preview_editada)
    
    file_original.save(caminho_original)

    img_original = utils.ler_imagem(caminho_original)
    
    if img_original is None:
        return jsonify({"error": "Não foi possível ler a imagem"}), 400

    img_editada = img_original.copy()
    img_editada = utils.ajustar_brilho_contraste(img_editada, brilho, contraste)
    img_editada = utils.ajustar_saturacao(img_editada, saturacao)
    img_editada = utils.rotacionar_imagem_skimage(img_editada, rotacao)
    img_editada = utils.redimensionar_imagem(img_editada, redim)
    
    cv.imwrite(caminho_editada, img_editada)

    url_editada = f"static/results/{nome_preview_editada}"

    return jsonify({
        'edited_url': url_editada
    })

@app.route('/api/get_csv')
def get_csv():
    global all_results
    if not all_results:
        return jsonify({"error": "Nenhum resultado para rankear ainda."}), 400
    
    df = pd.DataFrame(all_results)
    
    df_ranking = df.sort_values(by="ssim_score", ascending=False)
    
    df_ranking['Ranking_Qualidade'] = range(1, len(df_ranking) + 1)
    
    csv_path = os.path.join(app.config['RESULT_FOLDER'], 'ranking_resultados.csv')
    df_ranking.to_csv(csv_path, index=False, sep=';', decimal=',')
    
    return send_file(
        csv_path,
        as_attachment=True,
        download_name='Ranking_Comparacoes.csv',
        mimetype='text/csv'
    )

@app.route('/static/<path:path>')
def send_static_file(path):
    return send_from_directory(app.static_folder, path)


if __name__ == '__main__':
    app.run(debug=True)
