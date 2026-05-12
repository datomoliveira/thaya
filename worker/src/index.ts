import { handleRegister, handleLogin } from './handlers/auth';
import { handleNovaAnalise, handleGetAnalise } from './handlers/analise';
import { handleHistorico, handleUserStats } from './handlers/historico';
import { handleAdminStats, handleAdminApprove, handleAdminRevoke, handleAdminReset } from './handlers/admin';
import type { Env } from './types';

function cors(response: Response): Response {
  const headers = new Headers(response.headers);
  headers.set('Access-Control-Allow-Origin', '*');
  headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
}

function notFound(): Response {
  return cors(new Response(JSON.stringify({ error: 'Rota não encontrada.' }), {
    status: 404,
    headers: { 'Content-Type': 'application/json' },
  }));
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          'Access-Control-Max-Age': '86400',
        },
      });
    }

    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;

    try {
      // Auth
      if (path === '/api/auth/register' && method === 'POST') return cors(await handleRegister(request, env));
      if (path === '/api/auth/login' && method === 'POST') return cors(await handleLogin(request, env));

      // Analysis
      if (path === '/api/analise' && method === 'POST') return cors(await handleNovaAnalise(request, env));
      const analiseMatch = path.match(/^\/api\/analise\/([a-f0-9-]+)$/);
      if (analiseMatch && method === 'GET') return cors(await handleGetAnalise(request, env, analiseMatch[1]));

      // History & stats
      if (path === '/api/historico' && method === 'GET') return cors(await handleHistorico(request, env));
      if (path === '/api/stats' && method === 'GET') return cors(await handleUserStats(request, env));

      // Admin
      if (path === '/api/admin/stats' && method === 'GET') return cors(await handleAdminStats(request, env));
      if (path === '/api/admin/reset' && method === 'POST') return cors(await handleAdminReset(request, env));

      // Admin — approve / revoke user
      const approveMatch = path.match(/^\/api\/admin\/approve\/([a-f0-9-]+)$/);
      if (approveMatch && method === 'POST') return cors(await handleAdminApprove(request, env, approveMatch[1]));

      const revokeMatch = path.match(/^\/api\/admin\/revoke\/([a-f0-9-]+)$/);
      if (revokeMatch && method === 'POST') return cors(await handleAdminRevoke(request, env, revokeMatch[1]));

      return notFound();
    } catch (e) {
      console.error('Worker error:', e);
      return cors(new Response(JSON.stringify({ error: 'Erro interno do servidor.' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }));
    }
  },
} satisfies ExportedHandler<Env>;
