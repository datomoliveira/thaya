import type { Env } from '../types';
import { verifyJWT, extractToken } from '../middleware/jwt';

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
  });
}

async function requireAdmin(request: Request, env: Env) {
  const token = extractToken(request);
  if (!token) return null;
  const payload = await verifyJWT(token, env.JWT_SECRET);
  if (!payload || payload.role !== 'admin') return null;
  return payload;
}

export async function handleAdminStats(request: Request, env: Env): Promise<Response> {
  const admin = await requireAdmin(request, env);
  if (!admin) return json({ error: 'Acesso negado.' }, 403);

  const today = new Date().toISOString().slice(0, 10);

  const usoDiario = await env.DB.prepare('SELECT * FROM uso_diario WHERE data = ?').bind(today).first<{
    data: string; total_analises: number; total_tokens: number;
  }>();

  const ultimos7Dias = await env.DB.prepare(`
    SELECT data, total_analises, total_tokens FROM uso_diario
    WHERE data >= date('now', '-7 days') ORDER BY data ASC
  `).all();

  const usuarios = await env.DB.prepare(`
    SELECT id, email, role, aprovado, criado_em, analises_hoje, data_ultima_analise, limite_diario
    FROM usuarios ORDER BY criado_em DESC
  `).all();

  const pendentes = await env.DB.prepare(`
    SELECT id, email, criado_em FROM usuarios WHERE aprovado = 0 ORDER BY criado_em ASC
  `).all();

  const topUsers = await env.DB.prepare(`
    SELECT u.email, COUNT(a.id) as total
    FROM analises a JOIN usuarios u ON a.usuario_id = u.id
    WHERE date(a.criado_em) = ?
    GROUP BY u.id ORDER BY total DESC LIMIT 10
  `).bind(today).all();

  const limiteGlobal = parseInt(env.LIMITE_ANALISES_GLOBAL_DIA || '380');
  const totalHoje = usoDiario?.total_analises ?? 0;
  const tokensHoje = usoDiario?.total_tokens ?? 0;
  const TOKENS_LIMITE = 1_000_000;

  return json({
    hoje: {
      total_analises: totalHoje,
      total_tokens: tokensHoje,
      analises_restantes: Math.max(0, limiteGlobal - totalHoje),
      tokens_restantes: Math.max(0, TOKENS_LIMITE - tokensHoje),
      limite_analises: limiteGlobal,
      limite_tokens: TOKENS_LIMITE,
      percentual_analises: ((totalHoje / limiteGlobal) * 100).toFixed(1),
      percentual_tokens: ((tokensHoje / TOKENS_LIMITE) * 100).toFixed(1),
    },
    ultimos_7_dias: ultimos7Dias.results,
    usuarios: usuarios.results,
    pendentes: pendentes.results,
    top_usuarios_hoje: topUsers.results,
  });
}

export async function handleAdminApprove(request: Request, env: Env, userId: string): Promise<Response> {
  const admin = await requireAdmin(request, env);
  if (!admin) return json({ error: 'Acesso negado.' }, 403);

  let limiteDiario = 5;
  try {
    const body = await request.json() as { limite_diario?: number };
    if (body.limite_diario !== undefined) {
      limiteDiario = body.limite_diario;
    }
  } catch (e) {}

  const user = await env.DB.prepare('SELECT id, email FROM usuarios WHERE id = ?').bind(userId).first<{ id: string; email: string }>();
  if (!user) return json({ error: 'Usuário não encontrado.' }, 404);

  await env.DB.prepare('UPDATE usuarios SET aprovado = 1, limite_diario = ? WHERE id = ?').bind(limiteDiario, userId).run();
  return json({ success: true, message: `Usuário ${user.email} aprovado com limite de ${limiteDiario} análises.` });
}

export async function handleAdminRevoke(request: Request, env: Env, userId: string): Promise<Response> {
  const admin = await requireAdmin(request, env);
  if (!admin) return json({ error: 'Acesso negado.' }, 403);

  // Can't revoke yourself
  const payload = (await verifyJWT(extractToken(request)!, env.JWT_SECRET))!;
  if (payload.sub === userId) return json({ error: 'Você não pode revogar seu próprio acesso.' }, 400);

  await env.DB.prepare('UPDATE usuarios SET aprovado = 0 WHERE id = ?').bind(userId).run();
  return json({ success: true, message: 'Acesso revogado.' });
}

export async function handleAdminReset(request: Request, env: Env): Promise<Response> {
  const admin = await requireAdmin(request, env);
  if (!admin) return json({ error: 'Acesso negado.' }, 403);

  const today = new Date().toISOString().slice(0, 10);
  await env.DB.prepare('UPDATE uso_diario SET total_analises = 0, total_tokens = 0 WHERE data = ?').bind(today).run();
  await env.DB.prepare('UPDATE usuarios SET analises_hoje = 0').run();

  return json({ success: true, message: 'Contadores resetados com sucesso.' });
}
