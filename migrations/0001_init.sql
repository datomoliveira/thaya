-- Thaya D1 Schema — execute este SQL no console do Cloudflare D1
-- Painel: Workers & Pages → D1 → thaya-db → Console

CREATE TABLE IF NOT EXISTS usuarios (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  senha_hash TEXT NOT NULL,
  role TEXT DEFAULT 'user',
  aprovado INTEGER DEFAULT 0,
  criado_em TEXT DEFAULT (datetime('now')),
  analises_hoje INTEGER DEFAULT 0,
  data_ultima_analise TEXT
);

CREATE TABLE IF NOT EXISTS analises (
  id TEXT PRIMARY KEY,
  usuario_id TEXT NOT NULL,
  modo TEXT NOT NULL,
  criterios TEXT,
  resultado_json TEXT,
  tokens_usados INTEGER DEFAULT 0,
  criado_em TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);

CREATE TABLE IF NOT EXISTS uso_diario (
  data TEXT PRIMARY KEY,
  total_analises INTEGER DEFAULT 0,
  total_tokens INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS rate_limit_login (
  ip TEXT NOT NULL,
  tentativas INTEGER DEFAULT 0,
  janela_inicio TEXT DEFAULT (datetime('now')),
  PRIMARY KEY (ip)
);
