from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import os
import cv2 as cv
import pandas as pd
import image_utils as utils
import logging

# Configurar logging
logging.basicConfig(level=logging.DEBUG)

basedir = os.path.abspath(os.path.dirname(__file__))

app = Flask(__name__)
CORS(app)

app.config['MAX_CONTENT_LENGTH'] = 5 * 1024 * 1024
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg'}

UPLOAD_FOLDER = os.path.join(basedir, 'static', 'uploads')
RESULT_FOLDER = os.path.join(basedir, 'static', 'results')

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['RESULT_FOLDER'] = RESULT_FOLDER

# Criar pastas se não existirem
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(RESULT_FOLDER, exist_ok=True)

print(f"UPLOAD_FOLDER: {UPLOAD_FOLDER}")
print(f"RESULT_FOLDER: {RESULT_FOLDER}")
print(f"Pastas existem: {os.path.exists(UPLOAD_FOLDER)} / {os.path.exists(RESULT_FOLDER)}")

all_results = []

def arquivo_permitido(filename):
    return '.' in filename and \
        filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/api/preview', methods=['POST'])
def handle_preview():
    try:
        print("=== INICIANDO PREVIEW ===")
        print("Files recebidos:", request.files)
        print("Form data:", request.form)

        if 'originalImage' not in request.files:
            print("ERRO: Nenhum arquivo 'originalImage' enviado")
            return jsonify({"error": "Nenhum arquivo 'originalImage' enviado"}), 400

        file_original = request.files['originalImage']
        print(f"Arquivo recebido: {file_original.filename}, Tamanho: {len(file_original.read())} bytes")
        file_original.seek(0)  # Voltar ao início do arquivo

        if file_original.filename == '':
            print("ERRO: Nenhum arquivo selecionado")
            return jsonify({"error": "Nenhum arquivo selecionado"}), 400

        if not file_original or not arquivo_permitido(file_original.filename):
            print("ERRO: Formato de arquivo não permitido")
            return jsonify({"error": "Formato de arquivo não permitido"}), 400

        # Obter parâmetros com valores padrão
        brilho = int(request.form.get('brilho', 0))
        contraste = float(request.form.get('contraste', 1.0))
        saturacao = float(request.form.get('saturacao', 1.0))
        rotacao = int(request.form.get('rotacao', 0))
        redim = int(request.form.get('redim', 100))

        print(f"Parâmetros - Brilho: {brilho}, Contraste: {contraste}, Saturação: {saturacao}, Rotação: {rotacao}, Redim: {redim}")

        # Nomes dos arquivos
        nome_preview_original = "preview_original.png"
        nome_preview_editada = "preview_editada.png"

        caminho_original = os.path.join(app.config['UPLOAD_FOLDER'], nome_preview_original)
        caminho_editada = os.path.join(app.config['RESULT_FOLDER'], nome_preview_editada)

        print(f"Salvando arquivo em: {caminho_original}")
        file_original.save(caminho_original)
        print(f"Arquivo salvo. Tamanho: {os.path.getsize(caminho_original)} bytes")

        print("Lendo imagem com OpenCV...")
        img_original = utils.ler_imagem(caminho_original)

        if img_original is None:
            print("ERRO: Não foi possível ler a imagem com OpenCV")
            # Tentar ler de outra forma
            try:
                import numpy as np
                from PIL import Image
                pil_image = Image.open(caminho_original)
                img_original = cv.cvtColor(np.array(pil_image), cv.COLOR_RGB2BGR)
                print("Imagem lida com PIL + OpenCV com sucesso!")
            except Exception as e:
                print(f"ERRO com PIL: {e}")
                return jsonify({"error": "Não foi possível ler a imagem"}), 400

        print(f"Imagem lida com sucesso! Dimensões: {img_original.shape}")

        # Aplicar edições
        img_editada = img_original.copy()
        print("Aplicando brilho/contraste...")
        img_editada = utils.ajustar_brilho_contraste(img_editada, brilho, contraste)

        print("Aplicando saturação...")
        img_editada = utils.ajustar_saturacao(img_editada, saturacao)

        print("Aplicando rotação...")
        img_editada = utils.rotacionar_imagem_skimage(img_editada, rotacao)

        print("Aplicando redimensionamento...")
        img_editada = utils.redimensionar_imagem(img_editada, redim)

        print(f"Dimensões após edição: {img_editada.shape}")

        print("Salvando imagem editada...")
        cv.imwrite(caminho_editada, img_editada)
        print(f"Imagem editada salva em: {caminho_editada}")

        url_editada = f"http://localhost:5000/static/results/{nome_preview_editada}"
        print(f"URL da imagem editada: {url_editada}")

        return jsonify({
            'edited_url': url_editada
        })

    except Exception as e:
        print(f"ERRO GERAL no preview: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({"error": f"Erro interno no servidor: {str(e)}"}), 500

@app.route('/api/compare', methods=['POST'])
def handle_comparison():
    try:
        print("=== INICIANDO COMPARAÇÃO ===")
        print("Files recebidos:", request.files)

        if 'originalImage' not in request.files:
            return jsonify({"error": "Nenhum arquivo 'originalImage' enviado"}), 400

        file_original = request.files['originalImage']
        print(f"Arquivo recebido: {file_original.filename}")
        file_original.seek(0)

        if file_original.filename == '':
            return jsonify({"error": "Nenhum arquivo selecionado"}), 400

        if not file_original or not arquivo_permitido(file_original.filename):
            return jsonify({"error": "Formato de arquivo não permitido"}), 400

        # Obter parâmetros
        brilho = int(request.form.get('brilho', 0))
        contraste = float(request.form.get('contraste', 1.0))
        saturacao = float(request.form.get('saturacao', 1.0))
        rotacao = int(request.form.get('rotacao', 0))
        redim = int(request.form.get('redim', 100))

        print(f"Parâmetros: brilho={brilho}, contraste={contraste}, saturacao={saturacao}, rotacao={rotacao}, redim={redim}")

        nome_original_salvo = file_original.filename
        nome_base_arquivo = "resultado_" + nome_original_salvo
        nome_editada = "editada_" + nome_base_arquivo
        nome_mapa = "mapa_" + nome_base_arquivo

        caminho_original = os.path.join(app.config['UPLOAD_FOLDER'], nome_original_salvo)
        caminho_editada = os.path.join(app.config['RESULT_FOLDER'], nome_editada)
        caminho_mapa = os.path.join(app.config['RESULT_FOLDER'], nome_mapa)

        print(f"Salvando arquivo original em: {caminho_original}")
        file_original.save(caminho_original)

        print("Lendo imagem original...")
        img_original = utils.ler_imagem(caminho_original)

        if img_original is None:
            print("ERRO: Não foi possível ler a imagem original")
            return jsonify({"error": "Não foi possível ler a imagem"}), 400

        print(f"Imagem original lida: {img_original.shape}")

        # Aplicar edições
        img_editada = img_original.copy()
        img_editada = utils.ajustar_brilho_contraste(img_editada, brilho, contraste)
        img_editada = utils.ajustar_saturacao(img_editada, saturacao)
        img_editada = utils.rotacionar_imagem_skimage(img_editada, rotacao)
        img_editada = utils.redimensionar_imagem(img_editada, redim)

        print(f"Imagem editada: {img_editada.shape}")

        # Redimensionar original para comparação
        img_original_redim = utils.redimensionar_imagem(img_original, redim)

        # Calcular métricas
        print("Calculando SSIM...")
        ssim = utils.calcular_ssim(img_original_redim, img_editada)
        print("Calculando diferença média...")
        diff_media = utils.calcular_diferenca_media(img_original_redim, img_editada)

        print(f"Métricas - SSIM: {ssim}, Diff: {diff_media}")

        # Gerar mapa de diferenças
        print("Gerando mapa de diferenças...")
        mapa_dif = utils.diferenciar_imagens_xor(img_original_redim, img_editada)

        # Salvar imagens
        cv.imwrite(caminho_editada, img_editada)
        cv.imwrite(caminho_mapa, mapa_dif)

        # Adicionar aos resultados
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

        url_original = f"http://localhost:5000/static/uploads/{nome_original_salvo}"
        url_editada = f"http://localhost:5000/static/results/{nome_editada}"
        url_mapa = f"http://localhost:5000/static/results/{nome_mapa}"

        print("Comparação concluída com sucesso!")
        return jsonify({
            'ssim_score': ssim,
            'diferenca_media': diff_media,
            'original_url': url_original,
            'edited_url': url_editada,
            'diff_map_url': url_mapa
        })

    except Exception as e:
        print(f"ERRO GERAL na comparação: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({"error": f"Erro interno no servidor: {str(e)}"}), 500

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

@app.route('/static/<path:subpath>/<path:filename>')
def send_static_file(subpath, filename):
    directory = os.path.join(basedir, 'static', subpath)
    file_path = os.path.join(directory, filename)
    print(f"Servindo arquivo estático: {file_path}")
    print(f"Arquivo existe: {os.path.exists(file_path)}")
    return send_file(file_path)

if __name__ == '__main__':
    print("=== INICIANDO SERVIDOR FLASK ===")
    print("Verificando dependências...")
    try:
        import cv2
        print(f"OpenCV version: {cv2.__version__}")
    except ImportError as e:
        print(f"ERRO: OpenCV não instalado: {e}")

    try:
        import skimage
        print(f"scikit-image version: {skimage.__version__}")
    except ImportError as e:
        print(f"ERRO: scikit-image não instalado: {e}")

    app.run(debug=True, port=5000)