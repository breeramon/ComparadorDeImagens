import cv2 as cv
import numpy as np
from skimage.metrics import structural_similarity
from skimage.transform import rotate

def ler_imagem(caminho_arquivo):
    """Lê uma imagem usando cv.imread()"""
    return cv.imread(caminho_arquivo)

def converter_para_cinza(imagem):
    """Converte a imagem para escala de cinza usando cv.cvtColor()"""
    # Verifica se a imagem já não é cinza
    if len(imagem.shape) == 3 and imagem.shape[2] == 3:
        return cv.cvtColor(imagem, cv.COLOR_BGR2GRAY)
    return imagem

def calcular_diferenca_media(img1, img2):
    """
    Calcula a "diferença média" (Tarefa 2).
    Implementa a "Diferença Absoluta" de forma métrica.
    """
    # Garante que as imagens tenham o mesmo tamanho
    if img1.shape != img2.shape:
        img2 = cv.resize(img2, (img1.shape[1], img1.shape[0]))

    # Calcula a diferença absoluta e depois a média
    diferenca = cv.absdiff(img1.astype("float"), img2.astype("float"))
    media_diferenca = np.mean(diferenca)
    return media_diferenca

def calcular_ssim(img1, img2):
    """Calcula o SSIM (Structural Similarity Index)"""

    # Converte para escala de cinza, pois o SSIM é geralmente calculado em monocromático
    img1_cinza = converter_para_cinza(img1)
    img2_cinza = converter_para_cinza(img2)

    # Garante que as imagens tenham o mesmo tamanho
    if img1_cinza.shape != img2_cinza.shape:
        img2_cinza = cv.resize(img2_cinza, (img1_cinza.shape[1], img1_cinza.shape[0]))

    # O 'data_range' é o intervalo dinâmico da imagem (255 para 8-bit)
    (score, diff_map) = structural_similarity(img1_cinza, img2_cinza, full=True, data_range=255)

    # O diff_map também pode ser usado como mapa visual
    return score

def diferenciar_imagens_xor(img1, img2):
    """
    Gera um mapa de diferença visual usando cv.bitwise_xor().
    Atende à Tarefa 6 do Grupo 6 e ao RF06.
    """
    if img1.shape != img2.shape:
        print("Aviso: Imagens com tamanhos diferentes. Redimensionando para comparação.")
        img2 = cv.resize(img2, (img1.shape[1], img1.shape[0]))
        
    # Garante que ambas as imagens sejam BGR (3 canais) para o XOR funcionar
    # ou ambas sejam cinza (1 canal).
    if (len(img1.shape) == 2 and len(img2.shape) == 3):
        img1 = cv.cvtColor(img1, cv.COLOR_GRAY2BGR)
    if (len(img2.shape) == 2 and len(img1.shape) == 3):
        img2 = cv.cvtColor(img2, cv.COLOR_GRAY2BGR)

    return cv.bitwise_xor(img1, img2)

def ajustar_brilho_contraste(imagem, brilho=0, contraste=1.0):
    """Ajusta o brilho (beta) e o contraste (alpha)."""
    if imagem is None:
        return None
    return cv.convertScaleAbs(imagem, alpha=contraste, beta=brilho)

def ajustar_saturacao(imagem, valor=1.0):
    """Ajusta a saturação de uma imagem (multiplicador)."""
    if imagem is None:
        return None
    try:
        img_hsv = cv.cvtColor(imagem, cv.COLOR_BGR2HSV)
        img_hsv = np.float32(img_hsv)
        h, s, v = cv.split(img_hsv)
        s = s * valor
        s = np.clip(s, 0, 255)
        img_hsv_merged = cv.merge([h, s, v])
        img_hsv_merged = np.uint8(img_hsv_merged)
        img_saturada = cv.cvtColor(img_hsv_merged, cv.COLOR_HSV2BGR)
        return img_saturada
    except cv.error:
        # Erro comum se a imagem for em escala de cinza
        return imagem
    
def redimensionar_imagem(imagem, escala_percent=100):
    """Redimensiona a imagem com base em uma porcentagem."""
    if imagem is None or escala_percent == 100:
        return imagem
    fator = escala_percent / 100.0
    nova_largura = int(imagem.shape[1] * fator)
    nova_altura = int(imagem.shape[0] * fator)
    dimensoes = (nova_largura, nova_altura)
    return cv.resize(imagem, dimensoes, interpolation=cv.INTER_AREA)

def rotacionar_imagem_skimage(imagem, angulo):
    """Rotaciona a imagem usando a função rotate() do skimage"""
    if imagem is None or angulo == 0:
        return imagem
    return rotate(imagem, angulo, resize=True, mode='constant', cval=0, preserve_range=True).astype(imagem.dtype)
