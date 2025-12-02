# Docker - App de Finanças

Este documento explica como rodar o app usando Docker (com SQLite embutido).

## Pré-requisitos

- Docker instalado
- Docker Compose instalado (geralmente vem com Docker Desktop)

## Como Rodar

### Opção 1: Docker Compose (Recomendado)

```bash
# Buildar e iniciar o container
docker compose up -d

# Ver logs
docker compose logs -f

# Parar o container
docker compose down
```

O app estará disponível em `http://localhost:4173`

### Opção 2: Docker Build Manual

```bash
# Buildar a imagem
docker build -t financas-app .

# Rodar o container
docker run -d \
  --name financas-app \
  -p 4173:4173 \
  -v ./data:/app/data \
  financas-app

# Ver logs
docker logs -f financas-app

# Parar e remover
docker stop financas-app
docker rm financas-app
```

## Estrutura de Dados

- O banco SQLite é criado automaticamente em `./data/financas.db`
- Este arquivo é persistido via volume Docker
- **Importante**: Faça backup regular do arquivo `data/financas.db`

## Rodar em CasaOS/VPS

### No CasaOS:

1. Acesse o CasaOS
2. Vá em "App Store" ou "Docker"
3. Clique em "Add Container" ou "Custom App"
4. Configure:
   - **Name**: `financas-app`
   - **Image**: `financas-app:latest` (ou use o build local)
   - **Port**: `4173:4173`
   - **Volume**: `/caminho/para/data:/app/data`
   - **Restart Policy**: `unless-stopped`

5. Ou use o docker-compose.yml:
   - No CasaOS, você pode fazer upload do `docker-compose.yml`
   - Ou usar via terminal SSH: `docker compose up -d`

### Backup do Banco

```bash
# Copiar o arquivo do banco
cp ./data/financas.db ./backups/financas-$(date +%Y%m%d).db
```

## Variáveis de Ambiente

Você pode configurar via `docker-compose.yml` ou ao rodar:

```bash
docker run -e PORT=8080 -p 8080:8080 financas-app
```

## Desenvolvimento Local (sem Docker)

Se quiser rodar localmente para desenvolvimento:

```bash
# Terminal 1: Frontend
npm run dev

# Terminal 2: Backend
npm run server
```

## Troubleshooting

### Erro: "Port 4173 already in use"
- Mude a porta no `docker-compose.yml` ou use `-p 8080:4173`

### Erro: "Permission denied" no volume
- No Linux, ajuste permissões: `chmod -R 777 ./data`

### Banco de dados não persiste
- Verifique se o volume está mapeado corretamente
- Confirme que `./data` existe e tem permissões de escrita

### Container não inicia
- Verifique os logs: `docker compose logs`
- Confirme que o build foi feito: `docker compose build`

