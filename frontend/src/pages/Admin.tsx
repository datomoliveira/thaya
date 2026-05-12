import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useApi, useAuth } from '../hooks/useAuth';

interface AdminStats {
  hoje: {
    total_analises: number;
    total_tokens: number;
    analises_restantes: number;
    tokens_restantes: number;
    limite_analises: number;
    limite_tokens: number;
    percentual_analises: string;
    percentual_tokens: string;
  };
  ultimos_7_dias: Array<{ data: string; total_analises: number; total_tokens: number }>;
  usuarios: Array<{ id: string; email: string; role: string; aprovado: number; criado_em: string; analises_hoje: number; limite_diario: number }>;
  pendentes: Array<{ id: string; email: string; criado_em: string }>;
  top_usuarios_hoje: Array<{ email: string; total: number }>;
}

export default function Admin() {
  const apiFetch = useApi();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [resetting, setResetting] = useState(false);
  const [actionMsg, setActionMsg] = useState('');
  const API_BASE = import.meta.env.VITE_API_URL || '';
  const { token } = useAuth();

  const loadStats = async () => {
    const fresh = await apiFetch('/api/admin/stats');
    setStats(fresh);
  };

  const [pendingLimits, setPendingLimits] = useState<Record<string, number>>({});

  useEffect(() => {
    if (user?.role !== 'admin') { navigate('/dashboard'); return; }
    loadStats().finally(() => setLoading(false));
  }, [user, navigate]);

  const handleApprove = async (userId: string, email: string) => {
    const limit = pendingLimits[userId] || 5;
    try {
      const res = await fetch(`${API_BASE}/api/admin/approve/${userId}`, {
        method: 'POST',
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ limite_diario: limit })
      });
      const data = await res.json();
      setActionMsg(data.message || `${email} aprovado!`);
      await loadStats();
    } catch { setActionMsg('Erro ao aprovar.'); }
    setTimeout(() => setActionMsg(''), 4000);
  };

  const handleRevoke = async (userId: string, email: string) => {
    if (!confirm(`Revogar acesso de ${email}?`)) return;
    try {
      const res = await fetch(`${API_BASE}/api/admin/revoke/${userId}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setActionMsg(data.message || `Acesso de ${email} revogado.`);
      await loadStats();
    } catch { setActionMsg('Erro ao revogar.'); }
    setTimeout(() => setActionMsg(''), 4000);
  };

  const handleReset = async () => {
    if (!confirm('Resetar todos os contadores do dia?')) return;
    setResetting(true);
    try {
      await apiFetch('/api/admin/reset', { method: 'POST' });
      setActionMsg('✓ Contadores resetados!');
      await loadStats();
    } catch { setActionMsg('Erro ao resetar.'); }
    setResetting(false);
    setTimeout(() => setActionMsg(''), 4000);
  };

  if (loading) return (
    <div className="min-h-screen bg-cream flex items-center justify-center">
      <span className="loading-pen text-4xl">✒️</span>
    </div>
  );
  if (!stats) return null;

  const { hoje, ultimos_7_dias, usuarios, pendentes, top_usuarios_hoje } = stats;

  return (
    <div className="min-h-screen bg-cream py-8 px-4 page-enter">
      <div className="max-w-5xl mx-auto">
        <h1 className="font-display text-3xl font-bold text-pen-blue mb-8">⚙️ Painel Admin</h1>

        {actionMsg && (
          <div className="paper-card bg-green-50 border-green-300 border-l-4 border-green-500 p-4 mb-6 font-body text-sm text-green-700">
            ✓ {actionMsg}
          </div>
        )}

        {/* Pending approval — TOP PRIORITY */}
        {pendentes.length > 0 && (
          <div className="paper-card p-5 border-l-4 border-caramel mb-6">
            <h3 className="font-display text-lg font-semibold text-caramel mb-4 flex items-center gap-2">
              ⏳ Aguardando Aprovação
              <span className="bg-caramel text-white text-xs font-bold px-2 py-0.5 rounded-full">{pendentes.length}</span>
            </h3>
            <div className="space-y-3">
              {pendentes.map((p) => (
                <div key={p.id} className="flex items-center justify-between gap-3 flex-wrap">
                  <div>
                    <div className="font-body text-sm font-medium text-ink">{p.email}</div>
                    <div className="font-body text-xs text-ink-light">
                      Cadastrado em {new Date(p.criado_em).toLocaleString('pt-BR')}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      <span className="font-body text-xs text-ink-light">Limite:</span>
                      <input 
                        type="number" 
                        min="1" 
                        max="1000"
                        value={pendingLimits[p.id] || 5}
                        onChange={(e) => setPendingLimits({...pendingLimits, [p.id]: parseInt(e.target.value)})}
                        className="input-notebook w-16 px-2 py-1 text-xs"
                      />
                    </div>
                    <button
                      onClick={() => handleApprove(p.id, p.email)}
                      className="btn-primary px-4 py-1.5 text-sm"
                    >
                      ✓ Aprovar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Today stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Análises hoje', val: hoje.total_analises, sub: `de ${hoje.limite_analises}` },
            { label: 'Restantes', val: hoje.analises_restantes, sub: `${hoje.percentual_analises}% usado` },
            { label: 'Tokens hoje', val: hoje.total_tokens.toLocaleString(), sub: 'de 1.000.000' },
            { label: 'Tokens restantes', val: hoje.tokens_restantes.toLocaleString(), sub: `${hoje.percentual_tokens}% usado` },
          ].map((s) => (
            <div key={s.label} className="paper-card folded p-4 text-center">
              <div className="font-display text-2xl font-bold text-caramel">{s.val}</div>
              <div className="font-body text-xs text-pen-blue font-medium mt-1">{s.label}</div>
              <div className="font-body text-xs text-ink-light">{s.sub}</div>
            </div>
          ))}
        </div>

        {/* Usage bars */}
        <div className="paper-card p-5 mb-6">
          <div className="flex justify-between mb-2">
            <h3 className="font-display font-semibold text-pen-blue">Uso de Análises (hoje)</h3>
            <span className="font-body text-sm text-ink-light">{hoje.percentual_analises}%</span>
          </div>
          <div className="progress-track mb-4">
            <div className={`progress-fill ${parseFloat(hoje.percentual_analises) >= 80 ? 'danger' : parseFloat(hoje.percentual_analises) >= 50 ? 'warning' : 'success'}`}
              style={{ width: `${hoje.percentual_analises}%` }} />
          </div>
          <div className="flex justify-between mb-2">
            <h3 className="font-display font-semibold text-pen-blue">Tokens Gemini (hoje)</h3>
            <span className="font-body text-sm text-ink-light">{hoje.percentual_tokens}%</span>
          </div>
          <div className="progress-track">
            <div className={`progress-fill ${parseFloat(hoje.percentual_tokens) >= 80 ? 'danger' : parseFloat(hoje.percentual_tokens) >= 50 ? 'warning' : 'success'}`}
              style={{ width: `${hoje.percentual_tokens}%` }} />
          </div>
        </div>

        {/* 7-day chart */}
        {ultimos_7_dias.length > 0 && (
          <div className="paper-card p-5 mb-6">
            <h3 className="font-display text-lg font-semibold text-pen-blue mb-4">Análises nos últimos 7 dias</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={ultimos_7_dias}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E8DFC8" />
                <XAxis dataKey="data" tick={{ fontSize: 11, fontFamily: 'Lora' }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="total_analises" fill="#1A3A5C" radius={[3, 3, 0, 0]} name="Análises" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Top users today */}
        {top_usuarios_hoje.length > 0 && (
          <div className="paper-card p-5 mb-6">
            <h3 className="font-display text-lg font-semibold text-pen-blue mb-4">Top usuários hoje</h3>
            <div className="space-y-2">
              {top_usuarios_hoje.map((u, i) => (
                <div key={u.email} className="flex items-center gap-3">
                  <span className="font-display font-bold text-caramel w-6">{i + 1}.</span>
                  <span className="font-body text-sm text-ink flex-1">{u.email}</span>
                  <span className="font-display font-bold text-pen-blue">{u.total}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* All users */}
        <div className="paper-card p-5 mb-6">
          <h3 className="font-display text-lg font-semibold text-pen-blue mb-4">
            Todos os usuários ({usuarios.length})
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm font-body">
              <thead>
                <tr className="border-b border-parchment text-ink-light">
                  <th className="text-left pb-2 font-medium">E-mail</th>
                  <th className="text-left pb-2 font-medium">Role</th>
                  <th className="text-left pb-2 font-medium">Status</th>
                  <th className="text-left pb-2 font-medium">Uso Hoje</th>
                  <th className="text-left pb-2 font-medium">Ações</th>
                </tr>
              </thead>
              <tbody>
                {usuarios.map((u) => (
                  <tr key={u.id} className="border-b border-parchment/50">
                    <td className="py-2 text-ink">{u.email}</td>
                    <td className="py-2">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${u.role === 'admin' ? 'bg-caramel/20 text-caramel' : 'bg-blue-100 text-pen-blue'}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="py-2">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${u.aprovado ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                        {u.aprovado ? '✓ Aprovado' : '⏳ Pendente'}
                      </span>
                    </td>
                    <td className="py-2 text-ink">
                      {u.role === 'admin' ? '∞' : `${u.analises_hoje} / ${u.limite_diario || 5}`}
                    </td>
                    <td className="py-2">
                      {u.role !== 'admin' && (
                        u.aprovado ? (
                          <button onClick={() => handleRevoke(u.id, u.email)}
                            className="text-xs text-correction-red hover:underline font-body">
                            Revogar
                          </button>
                        ) : (
                          <button onClick={() => handleApprove(u.id, u.email)}
                            className="text-xs text-green-700 hover:underline font-body font-medium">
                            Aprovar
                          </button>
                        )
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Reset */}
        <div className="paper-card p-5 border-l-4 border-correction-red">
          <h3 className="font-display text-lg font-semibold text-correction-red mb-2">⚠️ Ações Administrativas</h3>
          <p className="font-body text-sm text-ink-light mb-4">Reseta os contadores de análises de todos os usuários para o dia atual.</p>
          <button onClick={handleReset} disabled={resetting} className="btn-danger px-5 py-2 text-sm">
            {resetting ? '⏳ Resetando...' : '🔄 Resetar Contadores do Dia'}
          </button>
        </div>
      </div>
    </div>
  );
}
