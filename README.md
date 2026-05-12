# Thaya — Correção de Redação com IA

## Estrutura do projeto

```
thaya/
├── .github/workflows/deploy.yml   # CI/CD GitHub Actions
├── worker/src/                    # Cloudflare Worker (TypeScript)
│   ├── index.ts                   # Router principal
│   ├── types.ts                   # Tipos TS
│   ├── middleware/jwt.ts          # JWT + hash de senha (Web Crypto)
│   └── handlers/                  
│       ├── auth.ts                # Register/Login + rate limit
│       ├── analise.ts             # Integração Gemini 2.5 Flash
│       ├── historico.ts           # Histórico + stats do usuário
│       └── admin.ts               # Painel admin
├── frontend/src/                  # React + Vite + Tailwind
│   ├── pages/                     # Landing, Auth, Dashboard, etc.
│   ├── hooks/useAuth.tsx          # Auth context + useApi hook
│   └── index.css                  # Design system skeuomórfico
├── migrations/0001_init.sql       # Schema D1
└── wrangler.toml                  # Configuração Cloudflare
```

## Configuração inicial

### 1. Instalar dependências
```bash
# Raiz (Worker)
npm install

# Frontend
cd frontend && npm install
```

### 2. Rodar localmente
```bash
# Terminal 1 — Worker
npm run dev:worker

# Terminal 2 — Frontend
cd frontend && npm run dev
```

### 3. Executar migration D1 local
```bash
npm run db:migrate
```

## Deploy — Secrets do GitHub Actions

Configure os seguintes secrets em **Settings → Secrets → Actions** do repositório:

| Secret | Descrição |
|--------|-----------|
| `CLOUDFLARE_API_TOKEN` | Token da Cloudflare (já criado ✓) |
| `CLOUDFLARE_ACCOUNT_ID` | ID da conta Cloudflare (Painel → lado direito) |
| `GEMINI_API_KEY` | Chave da API do Google Gemini |
| `JWT_SECRET` | String aleatória longa (ex: `openssl rand -hex 32`) |
| `ADMIN_EMAIL` | Email do usuário que será admin (ex: `seu@email.com`) |
| `VITE_API_URL` | URL do Worker deployed (ex: `https://thaya-worker.SEU.workers.dev`) |

## Primeiro deploy manual (antes do Actions)

```bash
# 1. Login Cloudflare
npx wrangler login

# 2. Criar o banco D1 (já existe: c3f832a1-fba1-4fcd-b303-d8138bb44a1b)
# Rodar migration remota
npm run db:migrate:remote

# 3. Configurar secrets no Worker
npx wrangler secret put GEMINI_API_KEY
npx wrangler secret put JWT_SECRET
npx wrangler secret put ADMIN_EMAIL

# 4. Deploy do Worker
npm run deploy:worker

# 5. Criar projeto Pages na Cloudflare (primeira vez)
cd frontend
npm run build
npx wrangler pages project create thaya
npx wrangler pages deploy dist --project-name=thaya
```

## Variáveis de ambiente do Frontend

Criar arquivo `frontend/.env.local` para desenvolvimento:
```
VITE_API_URL=http://localhost:8787
```

Para produção (GitHub Actions), usar o secret `VITE_API_URL` com a URL do Worker.

## Limits do plano free

- **Gemini**: ~400 análises/dia (~2.500 tokens cada)
- **D1**: 5GB storage, 5M rows lidos/dia
- **Workers**: 100.000 req/dia
- **Pages**: builds ilimitados
