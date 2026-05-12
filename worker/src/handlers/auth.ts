import type { Env } from '../types';
import { hashPassword, verifyPassword, signJWT } from '../middleware/jwt';

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
  });
}

// Rate limit: max 5 login attempts per IP per hour
async function checkLoginRateLimit(db: D1Database, ip: string): Promise<boolean> {
  const now = new Date().toISOString();
  const row = await db.prepare('SELECT * FROM rate_limit_login WHERE ip = ?').bind(ip).first<{
    ip: string; tentativas: number; janela_inicio: string;
  }>();

  if (!row) {
    await db.prepare('INSERT INTO rate_limit_login (ip, tentativas, janela_inicio) VALUES (?, 1, ?)')
      .bind(ip, now).run();
    return true;
  }

  const windowStart = new Date(row.janela_inicio);
  const hourAgo = new Date(Date.now() - 3600 * 1000);

  if (windowStart < hourAgo) {
    await db.prepare('UPDATE rate_limit_login SET tentativas = 1, janela_inicio = ? WHERE ip = ?')
      .bind(now, ip).run();
    return true;
  }

  if (row.tentativas >= 5) return false;

  await db.prepare('UPDATE rate_limit_login SET tentativas = tentativas + 1 WHERE ip = ?')
    .bind(ip).run();
  return true;
}

export async function handleRegister(request: Request, env: Env): Promise<Response> {
  try {
    const { email, senha } = await request.json<{ email: string; senha: string }>();
    if (!email || !senha || senha.length < 6) {
      return json({ error: 'Email e senha (mín. 6 caracteres) são obrigatórios.' }, 400);
    }

    const existing = await env.DB.prepare('SELECT id FROM usuarios WHERE email = ?').bind(email).first();
    if (existing) return json({ error: 'Email já cadastrado.' }, 409);

    const id = crypto.randomUUID();
    const senha_hash = await hashPassword(senha);
    const isAdmin = email.toLowerCase() === (env.ADMIN_EMAIL || '').toLowerCase();
    const role = isAdmin ? 'admin' : 'user';
    // Admin is auto-approved; others wait for admin approval
    const aprovado = isAdmin ? 1 : 0;

    await env.DB.prepare(
      'INSERT INTO usuarios (id, email, senha_hash, role, aprovado) VALUES (?, ?, ?, ?, ?)',
    ).bind(id, email, senha_hash, role, aprovado).run();

    if (isAdmin) {
      // Admin logs in immediately after register
      const token = await signJWT({ sub: id, email, role }, env.JWT_SECRET);
      return json({ token, user: { id, email, role }, aprovado: true }, 201);
    }

    // Non-admin: registered but needs approval
    return json({
      aguardando_aprovacao: true,
      message: 'Cadastro realizado! Aguarde a aprovação do administrador para acessar o sistema.',
    }, 201);
  } catch (e) {
    return json({ error: 'Erro ao cadastrar. Tente novamente.' }, 500);
  }
}

export async function handleLogin(request: Request, env: Env): Promise<Response> {
  const ip = request.headers.get('CF-Connecting-IP') || '0.0.0.0';

  const allowed = await checkLoginRateLimit(env.DB, ip);
  if (!allowed) {
    return json({ error: 'Muitas tentativas de login. Aguarde 1 hora.' }, 429);
  }

  try {
    const { email, senha } = await request.json<{ email: string; senha: string }>();
    if (!email || !senha) return json({ error: 'Email e senha são obrigatórios.' }, 400);

    const user = await env.DB.prepare('SELECT * FROM usuarios WHERE email = ?').bind(email).first<{
      id: string; email: string; senha_hash: string; role: 'user' | 'admin'; aprovado: number;
    }>();

    if (!user) return json({ error: 'Credenciais inválidas.' }, 401);

    const valid = await verifyPassword(senha, user.senha_hash);
    if (!valid) return json({ error: 'Credenciais inválidas.' }, 401);

    // Check approval
    if (!user.aprovado) {
      return json({
        error: 'Sua conta ainda não foi aprovada pelo administrador.',
        aguardando_aprovacao: true,
      }, 403);
    }

    const token = await signJWT({ sub: user.id, email: user.email, role: user.role }, env.JWT_SECRET);
    return json({ token, user: { id: user.id, email: user.email, role: user.role } });
  } catch {
    return json({ error: 'Erro ao fazer login.' }, 500);
  }
}
