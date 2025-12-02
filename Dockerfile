# Stage 1: Build do frontend
FROM node:20-alpine AS builder

WORKDIR /app

# Copiar arquivos de dependências
COPY package*.json ./
COPY tsconfig*.json ./
COPY vite.config.ts ./
COPY tailwind.config.js ./
COPY postcss.config.js ./
COPY components.json ./

# Instalar dependências
RUN npm ci

# Copiar código fonte
COPY src ./src
COPY index.html ./
COPY public ./public

# Build do frontend
RUN npm run build

# Stage 2: Imagem final de produção
FROM node:20-alpine

WORKDIR /app

# Copiar package.json para instalar apenas dependências de produção do backend
COPY package*.json ./

# Instalar apenas dependências de produção necessárias para o backend
RUN npm ci --omit=dev

# Copiar código do backend
COPY backend ./backend

# Copiar build do frontend do stage anterior
COPY --from=builder /app/dist ./dist

# Criar diretório para dados do SQLite
RUN mkdir -p /app/data

# Expor porta
EXPOSE 4173

# Variável de ambiente para porta
ENV PORT=4173

# Comando para iniciar o servidor
CMD ["node", "backend/server.js"]

