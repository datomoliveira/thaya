import type { Env, GeminiResponse, ResultadoCorrecao, ResultadoDetectorIA } from '../types';
import { verifyJWT, extractToken } from '../middleware/jwt';

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
  });
}

const PROMPT_CORRECAO = (criterios: string) => `
Analise a redação seguindo estes critérios: ${criterios}
Seja ultra-conciso nos comentários. Não use introduções.
Retorne APENAS um JSON (formato estrito):
{
  "nota_geral": <0-10>,
  "criterios": [{ "nome": "...", "nota": <0-10>, "comentario": "breve comentário" }],
  "pontos_fortes": ["..."],
  "sugestoes_melhoria": ["..."]
}`;

const PROMPT_DETECTOR_IA = `
Analise cuidadosamente se esta redação foi escrita por humano ou gerada/assistida por IA.
Considere: padrões de linguagem, coesão artificial, vocabulário homogêneo, estrutura rígida, ausência de erros naturais, fluxo excessivamente perfeito.

Retorne SOMENTE um JSON válido (sem markdown, sem blocos de código) com esta estrutura exata:
{
  "percentual_humano": <número 0-100>,
  "percentual_ia": <número 0-100>,
  "trechos_suspeitos": [
    {
      "trecho": "<trecho do texto>",
      "motivo": "<motivo da suspeita>",
      "sugestao_humanizacao": "<como reescrever para soar mais humano>"
    }
  ],
  "veredicto": "<Provavelmente Humano|Inconclusivo|Provavelmente IA|Definitivamente IA>",
  "explicacao": "<explicação detalhada da análise>"
}`;

// Fetch with timeout helper — Cloudflare Workers can hit 30s CPU limits
async function fetchWithTimeout(url: string, init: RequestInit, timeoutMs = 28000): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...init, signal: controller.signal });
    return res;
  } finally {
    clearTimeout(timer);
  }
}

async function callGemini(
  apiKey: string,
  imageBase64: string,
  mimeType: string,
  prompt: string,
): Promise<{ text: string; tokensUsados: number }> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
  const body = {
    contents: [{
      role: 'user',
      parts: [
        { text: prompt },
        { inlineData: { mimeType, data: imageBase64 } },
      ],
    }],
    generationConfig: {
      temperature: 0.1,
      maxOutputTokens: 2048,
      response_mime_type: "application/json",
    },
    safetySettings: [
      { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
      { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
      { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
      { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" },
    ],
  };

  let res: Response;
  try {
    res = await fetchWithTimeout(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }, 29000);
  } catch (e: unknown) {
    if (e instanceof Error && e.name === 'AbortError') {
      throw new Error('Tempo limite de resposta da API excedido. Tente novamente.');
    }
    throw new Error(`Falha na conexão com a API de análise: ${e instanceof Error ? e.message : String(e)}`);
  }

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`API de análise retornou erro ${res.status}: ${err}`);
  }

  const data = await res.json() as GeminiResponse;
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
  const tokensUsados = data.usageMetadata?.totalTokenCount ?? 0;
  return { text, tokensUsados };
}

async function transcribeAudio(apiKey: string, audioBase64: string, mimeType: string): Promise<string> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
  const body = {
    contents: [{
      role: 'user',
      parts: [
        { text: 'Transcreva este áudio e extraia os critérios de correção mencionados. Retorne um JSON com a estrutura: { "criterios": ["Critério 1", "Critério 2"] }' },
        { inlineData: { mimeType, data: audioBase64 } },
      ],
    }],
    generationConfig: {
      temperature: 0.1,
      maxOutputTokens: 800,
    },
  };
  try {
    const res = await fetchWithTimeout(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }, 30000);
    const data = await res.json() as GeminiResponse;
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
    try {
      const parsed = JSON.parse(text);
      return Array.isArray(parsed.criterios) ? parsed.criterios.join('\n') : text;
    } catch {
      return text;
    }
  } catch {
    return '';
  }
}

// ===== NEW: Standalone audio transcription endpoint =====
export async function handleTranscribeAudio(request: Request, env: Env): Promise<Response> {
  const token = extractToken(request);
  if (!token) return json({ error: 'Não autenticado.' }, 401);
  const payload = await verifyJWT(token, env.JWT_SECRET);
  if (!payload) return json({ error: 'Token inválido ou expirado.' }, 401);

  let body: { audio_base64: string; audio_mime_type: string };
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Body inválido.' }, 400);
  }

  const { audio_base64, audio_mime_type } = body;
  if (!audio_base64 || !audio_mime_type) {
    return json({ error: 'Campos obrigatórios: audio_base64, audio_mime_type.' }, 400);
  }

  try {
    const transcricao = await transcribeAudio(env.GEMINI_API_KEY, audio_base64, audio_mime_type);
    return json({ transcricao });
  } catch (e) {
    return json({ error: `Erro ao transcrever áudio: ${e instanceof Error ? e.message : 'desconhecido'}` }, 502);
  }
}

export async function handleNovaAnalise(request: Request, env: Env): Promise<Response> {
  // Auth
  const token = extractToken(request);
  if (!token) return json({ error: 'Não autenticado.' }, 401);
  const payload = await verifyJWT(token, env.JWT_SECRET);
  if (!payload) return json({ error: 'Token inválido ou expirado.' }, 401);

  // Check user daily limit
  const today = new Date().toISOString().slice(0, 10);
  const usuario = await env.DB.prepare(
    'SELECT role, analises_hoje, data_ultima_analise, limite_diario FROM usuarios WHERE id = ?',
  ).bind(payload.sub).first<{ role: string; analises_hoje: number; data_ultima_analise: string | null; limite_diario: number }>();

  if (!usuario) return json({ error: 'Usuário não encontrado.' }, 404);

  // Admin has unlimited analyses
  const isAdmin = usuario.role === 'admin';
  const limiteUsuario = usuario.limite_diario ?? parseInt(env.LIMITE_ANALISES_POR_USUARIO_DIA || '5');
  const isNewDay = usuario.data_ultima_analise?.slice(0, 10) !== today;
  const analisesHoje = isNewDay ? 0 : usuario.analises_hoje;

  if (!isAdmin && analisesHoje >= limiteUsuario) {
    return json({
      error: `Você atingiu o seu limite de ${limiteUsuario} análises por dia. Volte amanhã!`,
      limite: limiteUsuario,
      usadas: analisesHoje,
    }, 429);
  }

  // Check global daily limit
  const limiteGlobal = parseInt(env.LIMITE_ANALISES_GLOBAL_DIA || '380');
  const usoDiario = await env.DB.prepare('SELECT total_analises FROM uso_diario WHERE data = ?').bind(today).first<{ total_analises: number }>();
  if (usoDiario && usoDiario.total_analises >= limiteGlobal) {
    return json({ error: 'Limite diário global atingido. Volte amanhã às 00:00 UTC.' }, 429);
  }

  // Parse body
  let body: {
    imagem_base64: string;
    mime_type: string;
    criterios: string;
    modo: 'correcao' | 'detector_ia';
    audio_base64?: string;
    audio_mime_type?: string;
  };
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Body inválido.' }, 400);
  }

  const { imagem_base64, mime_type, criterios: criteriosRaw, modo, audio_base64, audio_mime_type } = body;
  if (!imagem_base64 || !mime_type || !modo) {
    return json({ error: 'Campos obrigatórios: imagem_base64, mime_type, modo.' }, 400);
  }

  // Audio transcription if provided (only if criterios not already filled by frontend preview)
  let criterios = criteriosRaw || '';
  if (audio_base64 && audio_mime_type && !criterios) {
    try {
      criterios = await transcribeAudio(env.GEMINI_API_KEY, audio_base64, audio_mime_type);
    } catch {
      criterios = criteriosRaw || '';
    }
  }

  // Build prompt
  const prompt = modo === 'correcao'
    ? PROMPT_CORRECAO(criterios || 'Critérios gerais de boa escrita: coesão, coerência, gramática, argumentação, clareza.')
    : PROMPT_DETECTOR_IA;

  // Call AI
  let aiText: string;
  let tokensUsados: number;
  try {
    const result = await callGemini(env.GEMINI_API_KEY, imagem_base64, mime_type, prompt);
    aiText = result.text;
    tokensUsados = result.tokensUsados;
  } catch (e) {
    return json({ error: `Erro ao analisar: ${e instanceof Error ? e.message : 'desconhecido'}` }, 502);
  }

  // Parse JSON response — tmskin style cleaning
  let resultadoJson: ResultadoCorrecao | ResultadoDetectorIA;
  try {
    let responseText = aiText;
    // Limpar possíveis blocos de código markdown
    responseText = responseText.replace(/```json\n?/, '').replace(/```\n?/, '').trim();
    
    // Fallback if there's still junk (like my previous index search)
    const startIdx = responseText.indexOf('{');
    const endIdx = responseText.lastIndexOf('}');
    if (startIdx !== -1 && endIdx !== -1) {
      responseText = responseText.substring(startIdx, endIdx + 1);
    }
    
    resultadoJson = JSON.parse(responseText);
  } catch (e) {
    console.error('Falha ao parsear JSON da IA:', aiText);
    return json({ 
      error: 'A análise retornou um formato inesperado. Tente novamente.', 
      raw: aiText.substring(0, 4000)
    }, 502);
  }

  // Save to D1
  const analiseId = crypto.randomUUID();
  await env.DB.prepare(
    'INSERT INTO analises (id, usuario_id, modo, criterios, resultado_json, tokens_usados) VALUES (?, ?, ?, ?, ?, ?)',
  ).bind(analiseId, payload.sub, modo, criterios, JSON.stringify(resultadoJson), tokensUsados).run();

  // Update user counter
  if (isNewDay) {
    await env.DB.prepare(
      'UPDATE usuarios SET analises_hoje = 1, data_ultima_analise = ? WHERE id = ?',
    ).bind(new Date().toISOString(), payload.sub).run();
  } else {
    await env.DB.prepare(
      'UPDATE usuarios SET analises_hoje = analises_hoje + 1, data_ultima_analise = ? WHERE id = ?',
    ).bind(new Date().toISOString(), payload.sub).run();
  }

  // Update global counter
  await env.DB.prepare(`
    INSERT INTO uso_diario (data, total_analises, total_tokens) VALUES (?, 1, ?)
    ON CONFLICT(data) DO UPDATE SET total_analises = total_analises + 1, total_tokens = total_tokens + ?
  `).bind(today, tokensUsados, tokensUsados).run();

  return json({ id: analiseId, resultado: resultadoJson, tokens_usados: tokensUsados, modo }, 201);
}

export async function handleGetAnalise(request: Request, env: Env, id: string): Promise<Response> {
  const token = extractToken(request);
  if (!token) return json({ error: 'Não autenticado.' }, 401);
  const payload = await verifyJWT(token, env.JWT_SECRET);
  if (!payload) return json({ error: 'Token inválido.' }, 401);

  const analise = await env.DB.prepare(
    'SELECT * FROM analises WHERE id = ? AND usuario_id = ?',
  ).bind(id, payload.sub).first();

  if (!analise) return json({ error: 'Análise não encontrada.' }, 404);
  return json(analise);
}
