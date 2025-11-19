FROM python:3.11-slim

WORKDIR /app

# Instala dependências do sistema para OpenCV e processamento de imagens
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    libgl1 \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender-dev \
    ffmpeg \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Copia requirements primeiro (para cache do Docker)
COPY requirements.txt .

# Instala dependências Python
RUN pip install --no-cache-dir -r requirements.txt

# Copia o código da aplicação
COPY . .

# Cria diretórios para uploads e resultados
RUN mkdir -p static/uploads static/results

# Expõe a porta do Flask
EXPOSE 5000

# Comando para rodar o Flask (ajuste conforme seu app)
CMD ["python", "app.py"]