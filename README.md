# App de Controle Financeiro

Aplicação web para controle financeiro pessoal desenvolvida com React, TypeScript, Tailwind CSS, Shadcn/UI, Node.js e SQLite.

## Funcionalidades

- ✅ Registro de receitas e despesas
- ✅ Dashboard com resumo financeiro mensal
- ✅ Lista de transações separadas por tipo (receita/despesa)
- ✅ Categorização de transações com subcategorias
- ✅ Filtro por mês/ano
- ✅ Cálculo automático de saldo

## Tecnologias

- **Frontend**: React 19 + TypeScript + Vite
- **UI**: Tailwind CSS + Shadcn/UI
- **Backend**: Node.js + Express
- **Banco de Dados**: SQLite (via better-sqlite3)
- **Containerização**: Docker + Docker Compose

## Como Rodar

### Desenvolvimento Local

1. **Instalar dependências**:
```bash
npm install
```

2. **Rodar frontend e backend**:
```bash
# Terminal 1: Frontend
npm run dev

# Terminal 2: Backend
npm run server
```

O frontend estará em `http://localhost:5173` e o backend em `http://localhost:4173`.

### Produção com Docker

1. **Buildar e iniciar**:
```bash
docker compose up -d
```

2. **Acessar**:
O app estará disponível em `http://localhost:4173`

Para mais detalhes sobre Docker, veja [README-DOCKER.md](README-DOCKER.md).

## Estrutura do Projeto

```
├── backend/              # Backend Node.js + Express
│   ├── db.js            # Configuração SQLite e schema
│   └── server.js        # Servidor Express + API REST
├── src/
│   ├── components/      # Componentes React
│   ├── contexts/        # Contextos (Auth, Period)
│   ├── lib/             # Utilitários (API client)
│   ├── pages/           # Páginas (Dashboard, Transactions, Categories)
│   └── App.tsx          # Componente raiz
├── Dockerfile           # Build multi-stage
├── docker-compose.yml   # Orquestração Docker
└── package.json        # Dependências e scripts
```

## Scripts Disponíveis

- `npm run dev` - Inicia o servidor de desenvolvimento (frontend)
- `npm run server` - Inicia o servidor backend
- `npm run build` - Cria build de produção
- `npm run docker:build` - Builda a imagem Docker
- `npm run docker:up` - Inicia com docker-compose
- `npm run docker:down` - Para docker-compose
- `npm run lint` - Executa o linter

## Banco de Dados

O banco SQLite é criado automaticamente em `data/financas.db` quando o backend inicia pela primeira vez.

**Importante**: Faça backup regular do arquivo `data/financas.db` se estiver usando Docker (volume persistente).

## Arquitetura

- **Frontend**: SPA React servida como arquivos estáticos pelo backend
- **Backend**: Express serve arquivos estáticos + API REST (`/api/*`)
- **Banco**: SQLite local, sem necessidade de servidor de banco separado
- **Autenticação**: Não requerida (uso pessoal)

## Deploy em CasaOS/VPS

Veja instruções detalhadas em [README-DOCKER.md](README-DOCKER.md).
