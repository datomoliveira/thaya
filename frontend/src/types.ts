export interface User {
  id: string;
  email: string;
  role: 'user' | 'admin';
}

export interface AuthState {
  user: User | null;
  token: string | null;
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

export interface CriterioCorrecao {
  nome: string;
  nota: number;
  comentario: string;
  trechos_problematicos: string[];
}

export interface ResultadoCorrecao {
  nota_geral: number;
  criterios: CriterioCorrecao[];
  pontos_fortes: string[];
  sugestoes_melhoria: string[];
  texto_transcrito: string;
}

export interface TrechoSuspeito {
  trecho: string;
  motivo: string;
  sugestao_humanizacao: string;
}

export interface ResultadoDetectorIA {
  percentual_humano: number;
  percentual_ia: number;
  trechos_suspeitos: TrechoSuspeito[];
  veredicto: string;
  explicacao: string;
}
