export interface Env {
  DB: D1Database;
  GEMINI_API_KEY: string;
  JWT_SECRET: string;
  ADMIN_EMAIL: string;
  LIMITE_ANALISES_POR_USUARIO_DIA: string;
  LIMITE_ANALISES_GLOBAL_DIA: string;
}

export interface JWTPayload {
  sub: string;       // user id
  email: string;
  role: 'user' | 'admin';
  iat: number;
  exp: number;
}

export interface Usuario {
  id: string;
  email: string;
  senha_hash: string;
  role: 'user' | 'admin';
  criado_em: string;
  analises_hoje: number;
  data_ultima_analise: string | null;
}

export interface Analise {
  id: string;
  usuario_id: string;
  modo: 'correcao' | 'detector_ia';
  criterios: string | null;
  resultado_json: string | null;
  tokens_usados: number;
  criado_em: string;
}

export interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{ text: string }>;
    };
  }>;
  usageMetadata?: {
    totalTokenCount: number;
    promptTokenCount: number;
    candidatesTokenCount: number;
  };
}

export interface ResultadoCorrecao {
  nota_geral: number;
  criterios: Array<{
    nome: string;
    nota: number;
    comentario: string;
    trechos_problematicos: string[];
  }>;
  pontos_fortes: string[];
  sugestoes_melhoria: string[];
  texto_transcrito: string;
}

export interface ResultadoDetectorIA {
  percentual_humano: number;
  percentual_ia: number;
  trechos_suspeitos: Array<{
    trecho: string;
    motivo: string;
    sugestao_humanizacao: string;
  }>;
  veredicto: string;
  explicacao: string;
}
