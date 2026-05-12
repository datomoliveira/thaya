import type { Env } from '../types';
import { verifyJWT, extractToken } from '../middleware/jwt';

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
  });
}

export async function handleHistorico(request: Request, env: Env): Promise<Response> {
  const token = extractToken(request);
  if (!token) return json({ error: 'Não autenticado.' }, 401);
  const payload = await verifyJWT(token, env.JWT_SECRET);
  if (!payload) return json({ error: 'Token inválido.' }, 401);

  const url = new URL(request.url);
  const modo = url.searchParams.get('modo'); // 'correcao' | 'detector_ia' | null

  let query = 'SELECT id, modo, criterios, tokens_usados, criado_em FROM analises WHERE usuario_id = ?';
  const params: (string)[] = [payload.sub];

  if (modo && ['correcao', 'detector_ia'].includes(modo)) {
    query += ' AND modo = ?';
    params.push(modo);
  }

  query += ' ORDER BY criado_em DESC LIMIT 50';

  const { results } = await env.DB.prepare(query).bind(...params).all();
  return json({ analises: results });
}

export async function handleUserStats(request: Request, env: Env): Promise<Response> {
  const token = extractToken(request);
  if (!token) return json({ error: 'Não autenticado.' }, 401);
  const payload = await verifyJWT(token, env.JWT_SECRET);
  if (!payload) return json({ error: 'Token inválido.' }, 401);

  const today = new Date().toISOString().slice(0, 10);
  const usuario = await env.DB.prepare(
    'SELECT analises_hoje, data_ultima_analise FROM usuarios WHERE id = ?',
  ).bind(payload.sub).first<{ analises_hoje: number; data_ultima_analise: string | null }>();

  const isNewDay = usuario?.data_ultima_analise?.slice(0, 10) !== today;
  const analisesHoje = isNewDay ? 0 : (usuario?.analises_hoje ?? 0);
  const limite = parseInt(env.LIMITE_ANALISES_POR_USUARIO_DIA || '5');

  return json({ analises_hoje: analisesHoje, limite_diario: limite, restantes: Math.max(0, limite - analisesHoje) });
}
