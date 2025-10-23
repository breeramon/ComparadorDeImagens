# Comparacao-de-Imagens-Simples
Projeto para a matéria de Processamentos de Imagens de C Gráfica

## 1. Descrição do Projeto

Este é um projeto acadêmico desenvolvido para a disciplina de Processamento de Imagens, do curso de Ciência da Computação da Universidade Tiradentes (UNIT).

O objetivo principal do nosso grupo (Grupo 6) é implementar um sistema em Python para comparar imagens originais com suas versões pré-processadas. O sistema é capaz de identificar e analisar as diferenças entre as imagens, gerando tanto métricas quantitativas (como Diferença Média e SSIM) quanto um mapa visual que destaca as áreas de divergência.

## 2. Funcionalidades Principais

O nosso projeto implementa as seguintes tarefas:

* **Implementação dos Imports:** Utiliza as funções e bibliotecas base propostas na documentação da Unidade I.
* **Cálculo de Métricas:** Compara imagens usando Diferença Média e SSIM (Structural Similarity Index).
* **Análise de Ruído:** Calcula o índice de ruído residual (Pendente de definição).
* **Mapa Visual de Diferenças:** Gera um mapa que destaca visualmente as áreas onde as imagens mais divergem.
* **Ranking de Qualidade:** Cria um ranking automático de qualidade de pré-processamento entre as imagens analisadas.
* **Exportação de Resultados:** Registra todos os resultados e o ranking em um arquivo `.csv`.

## 3. Tecnologias Utilizadas

* **Linguagem:** Python
* **Ambiente:** Google Colab / Visual Studio
* **Bibliotecas Principais:**
    * **OpenCV (`cv2`)** : Para leitura e manipulação de imagens (leitura, `cvtColor`, `bitwise_xor`).
    * **NumPy**: Para computação numérica e manipulação de arrays.
    * **Matplotlib**: Para exibição de imagens.
    * **Scikit-image (`skimage`)** : Para funções específicas como `rotate` e `structural_similarity` (SSIM).
    * **Pandas**: Para criação do ranking e exportação para `.csv`.
 
## 4. Atualizações para as próximas semanas

* **Adicionar o input para que o usuário possa selecionar a imagem e editar ela.**
* **Verificação do tipo de imagem, só podendo ser nos tipos que foram especificados no documento.**
* **Melhorar o front do projeto.**
* **Adição do botão de download da imagem editada.**
* **Registrar resultados iniciais.**
* **Inserir prints e tabelas de comparação.**
* **Adicionar uma descrição técnica aqui no README**

## 5. Equipe (Grupo 6) e Responsabilidades

* **Bernardo Rafael Castro Rezende** - Implementação das funções de edição.
* **Breno Ramon Santana dos Santos** - Testes de usabilidade e correção de bugs.
* **Christiano Brito Mota** - Integração entre módulos e bibliotecas.
* **Pedro Felipe Pereira Santos** - Documentação técnica e revisão textual.
* **Raphael Vinícius Batista Uchoa Dias** - Design e layout da interface.
* **Vinicius Américo Damasceno Feitoza** - Coordenação e supervisão geral do projeto.

## 6. Professora

* **Layse Santos Souza** 
