import cv2 as cv
import numpy as np
from skimage.metrics import structural_similarity
from skimage.transform import rotate

def ler_imagem(caminho_arquivo):
    return cv.imread(caminho_arquivo)

def converter_para_cinza(imagem):
    if len(imagem.shape) == 3 and imagem.shape[2] == 3:
        return cv.cvtColor(imagem, cv.COLOR_BGR2GRAY)
    return imagem

def calcular_diferenca_media(img1, img2):
    if img1.shape != img2.shape:
        img2 = cv.resize(img2, (img1.shape[1], img1.shape[0]))

    diferenca = cv.absdiff(img1.astype("float"), img2.astype("float"))
    media_diferenca = np.mean(diferenca)
    return media_diferenca

def calcular_ssim(img1, img2):
    img1_cinza = converter_para_cinza(img1)
    img2_cinza = converter_para_cinza(img2)

    if img1_cinza.shape != img2_cinza.shape:
        img2_cinza = cv.resize(img2_cinza, (img1_cinza.shape[1], img1_cinza.shape[0]))

    (score, diff_map_url) = structural_similarity(img1_cinza, img2_cinza, full=True, data_range=255)

    return score

def diferenciar_imagens_xor(img1, img2):
    if img1.shape != img2.shape:
        print("Aviso: Imagens com tamanhos diferentes. Redimensionando para comparação.")
        img2 = cv.resize(img2, (img1.shape[1], img1.shape[0]))
        
    if (len(img1.shape) == 2 and len(img2.shape) == 3):
        img1 = cv.cvtColor(img1, cv.COLOR_GRAY2BGR)
    if (len(img2.shape) == 2 and len(img1.shape) == 3):
        img2 = cv.cvtColor(img2, cv.COLOR_GRAY2BGR)

    return cv.bitwise_xor(img1, img2)

def ajustar_brilho_contraste(imagem, brilho=0, contraste=1.0):
    if imagem is None:
        return None
    return cv.convertScaleAbs(imagem, alpha=contraste, beta=brilho)

def ajustar_saturacao(imagem, valor=1.0):
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
        return imagem
    
def redimensionar_imagem(imagem, escala_percent=100):
    if imagem is None or escala_percent == 100:
        return imagem
    fator = escala_percent / 100.0
    nova_largura = int(imagem.shape[1] * fator)
    nova_altura = int(imagem.shape[0] * fator)
    dimensoes = (nova_largura, nova_altura)
    return cv.resize(imagem, dimensoes, interpolation=cv.INTER_AREA)

def rotacionar_imagem_skimage(imagem, angulo):
    if imagem is None or angulo == 0:
        return imagem
    return rotate(imagem, angulo, resize=True, mode='constant', cval=0, preserve_range=True).astype(imagem.dtype)
