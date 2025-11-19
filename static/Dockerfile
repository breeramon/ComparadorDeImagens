FROM node:18-alpine

WORKDIR /app

# Copia arquivos de configuração e dependências
COPY package*.json ./
COPY next.config.ts ./
COPY tsconfig.json ./

# Instala dependências
RUN npm ci --only=production

# Copia o restante do código
COPY . .

# Build da aplicação Next.js
RUN npm run build

# Expõe a porta do Next.js
EXPOSE 3000

# Comando para rodar em produção
CMD ["npm", "start"]