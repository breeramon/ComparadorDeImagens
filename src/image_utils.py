import cv2 as cv
import numpy as np
from skimage.metrics import structural_similarity
from skimage.transform import rotate
import logging

def ler_imagem(caminho_arquivo):
    """
    Lê uma imagem do caminho especificado
    """
    print(f"Tentando ler imagem: {caminho_arquivo}")
    imagem = cv.imread(caminho_arquivo)

    if imagem is None:
        print(f"ERRO: cv2.imread retornou None para {caminho_arquivo}")
        # Tentar métodos alternativos
        try:
            # Tentar ler com diferentes flags
            imagem = cv.imread(caminho_arquivo, cv.IMREAD_COLOR)
            if imagem is None:
                imagem = cv.imread(caminho_arquivo, cv.IMREAD_UNCHANGED)
            if imagem is None:
                imagem = cv.imread(caminho_arquivo, cv.IMREAD_GRAYSCALE)
        except Exception as e:
            print(f"ERRO ao tentar métodos alternativos: {e}")

    if imagem is not None:
        print(f"Imagem lida com sucesso! Dimensões: {imagem.shape}, Tipo: {imagem.dtype}")
    else:
        print("ERRO: Todos os métodos de leitura falharam")

    return imagem

def converter_para_cinza(imagem):
    if len(imagem.shape) == 3 and imagem.shape[2] == 3:
        return cv.cvtColor(imagem, cv.COLOR_BGR2GRAY)
    return imagem

def calcular_diferenca_media(img1, img2):
    print("Calculando diferença média...")
    if img1.shape != img2.shape:
        print(f"Redimensionando img2 de {img2.shape} para {img1.shape}")
        img2 = cv.resize(img2, (img1.shape[1], img1.shape[0]))

    diferenca = cv.absdiff(img1.astype("float"), img2.astype("float"))
    media_diferenca = np.mean(diferenca)
    print(f"Diferença média calculada: {media_diferenca}")
    return media_diferenca

def calcular_ssim(img1, img2):
    print("Calculando SSIM...")
    img1_cinza = converter_para_cinza(img1)
    img2_cinza = converter_para_cinza(img2)

    if img1_cinza.shape != img2_cinza.shape:
        print(f"Redimensionando para SSIM: {img2_cinza.shape} -> {img1_cinza.shape}")
        img2_cinza = cv.resize(img2_cinza, (img1_cinza.shape[1], img1_cinza.shape[0]))

    try:
        (score, diff_map) = structural_similarity(img1_cinza, img2_cinza, full=True, data_range=255)
        print(f"SSIM calculado: {score}")
        return score
    except Exception as e:
        print(f"ERRO no cálculo SSIM: {e}")
        return 0.0

def diferenciar_imagens_xor(img1, img2):
    print("Gerando mapa XOR...")

    if img1.shape != img2.shape:
        print(f"Redimensionando para XOR: {img2.shape} -> {img1.shape}")
        img2 = cv.resize(img2, (img1.shape[1], img1.shape[0]))

    if (len(img1.shape) == 2 and len(img2.shape) == 3):
        img1 = cv.cvtColor(img1, cv.COLOR_GRAY2BGR)
    if (len(img2.shape) == 2 and len(img1.shape) == 3):
        img2 = cv.cvtColor(img2, cv.COLOR_GRAY2BGR)

    resultado = cv.bitwise_xor(img1, img2)
    print("Mapa XOR gerado com sucesso")
    return resultado

def ajustar_brilho_contraste(imagem, brilho=0, contraste=1.0):
    if imagem is None:
        return None
    print(f"Ajustando brilho: {brilho}, contraste: {contraste}")
    return cv.convertScaleAbs(imagem, alpha=contraste, beta=brilho)

def ajustar_saturacao(imagem, valor=1.0):
    if imagem is None:
        return None

    print(f"Ajustando saturação: {valor}")
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
    except cv.error as e:
        print(f"ERRO ao ajustar saturação: {e}")
        return imagem

def redimensionar_imagem(imagem, escala_percent=100):
    if imagem is None or escala_percent == 100:
        return imagem

    print(f"Redimensionando para: {escala_percent}%")
    fator = escala_percent / 100.0
    nova_largura = int(imagem.shape[1] * fator)
    nova_altura = int(imagem.shape[0] * fator)
    dimensoes = (nova_largura, nova_altura)
    print(f"Novas dimensões: {dimensoes}")
    return cv.resize(imagem, dimensoes, interpolation=cv.INTER_AREA)

def rotacionar_imagem_skimage(imagem, angulo):
    if imagem is None or angulo == 0:
        return imagem

    print(f"Rotacionando: {angulo} graus")
    try:
        return rotate(imagem, angulo, resize=True, mode='constant', cval=0, preserve_range=True).astype(imagem.dtype)
    except Exception as e:
        print(f"ERRO na rotação: {e}")
        return imagem