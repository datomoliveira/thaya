import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth, useApi } from '../hooks/useAuth';

interface Stats { analises_hoje: number; limite_diario: number; restantes: number; }

export default function Dashboard() {
  const { user } = useAuth();
  const apiFetch = useApi();
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    apiFetch('/api/stats').then(setStats).catch(() => {});
  }, [apiFetch]);

  const usedPct = stats ? Math.round((stats.analises_hoje / stats.limite_diario) * 100) : 0;
  const progressClass = usedPct >= 80 ? 'danger' : usedPct >= 50 ? 'warning' : 'success';

  return (
    <div className="min-h-screen notebook-lines-bg py-8 px-4 page-enter" style={{ paddingLeft: 'calc(52px + 24px + 16px)' }}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold text-pen-blue">
            Olá, {user?.email.split('@')[0]} 👋
          </h1>
          <p className="font-body text-ink-light mt-1">Mesa de trabalho — suas análises de redação</p>
        </div>

        {/* Cards grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* Nova Análise */}
          <Link to="/nova-analise" className="paper-card folded p-6 hover:shadow-paper-lg transition-all group block no-underline">
            <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-200">📝</div>
            <h2 className="font-display text-xl font-bold text-pen-blue mb-2">Nova Análise</h2>
            <p className="font-body text-sm text-ink-light">Tire uma foto da redação e receba correção completa ou detecção de IA.</p>
            <div className="mt-4 inline-flex items-center gap-1 text-caramel font-body text-sm font-medium">
              Começar →
            </div>
          </Link>

          {/* Histórico */}
          <Link to="/historico" className="paper-card folded p-6 hover:shadow-paper-lg transition-all group block no-underline">
            <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-200">📚</div>
            <h2 className="font-display text-xl font-bold text-pen-blue mb-2">Histórico</h2>
            <p className="font-body text-sm text-ink-light">Veja e consulte todas as suas análises anteriores salvas na nuvem.</p>
            <div className="mt-4 inline-flex items-center gap-1 text-caramel font-body text-sm font-medium">
              Ver histórico →
            </div>
          </Link>

          {/* Uso do dia */}
          <div className="paper-card folded p-6 sm:col-span-2 lg:col-span-1">
            <div className="text-4xl mb-4">📊</div>
            <h2 className="font-display text-xl font-bold text-pen-blue mb-4">Meu Uso Hoje</h2>
            {stats ? (
              <>
                <div className="flex justify-between font-body text-sm text-ink-light mb-2">
                  <span>{stats.analises_hoje} de {stats.limite_diario} análises</span>
                  <span className="font-medium text-ink">{stats.restantes} restantes</span>
                </div>
                <div className="progress-track mb-3">
                  <div className={`progress-fill ${progressClass}`} style={{ width: `${usedPct}%` }} />
                </div>
                <p className="font-body text-xs text-ink-light">
                  {stats.restantes === 0
                    ? '⚠️ Limite atingido. Volta amanhã às 00:00 UTC!'
                    : `✅ Você ainda pode fazer ${stats.restantes} análise${stats.restantes !== 1 ? 's' : ''} hoje.`}
                </p>
              </>
            ) : (
              <div className="font-body text-sm text-ink-light">Carregando...</div>
            )}
          </div>
        </div>

        {/* Modes explainer */}
        <div className="mt-8 grid sm:grid-cols-2 gap-5">
          <div className="paper-card p-6 border-l-4 border-pen-blue">
            <h3 className="font-display text-lg font-bold text-pen-blue mb-2">🖊️ Modo Correção</h3>
            <p className="font-body text-sm text-ink-light leading-relaxed">
              Analisa a redação com base nos seus critérios e retorna nota geral, avaliação por critério, pontos fortes e sugestões em estilo de laudo.
            </p>
          </div>
          <div className="paper-card p-6 border-l-4 border-correction-red">
            <h3 className="font-display text-lg font-bold text-correction-red mb-2">🔍 Modo Detector IA</h3>
            <p className="font-body text-sm text-ink-light leading-relaxed">
              Verifica se o texto foi escrito por humano ou gerado por IA, mostrando trechos suspeitos com sugestões de humanização.
            </p>
          </div>
        </div>

        {user?.role === 'admin' && (
          <div className="mt-6">
            <Link to="/admin" className="paper-card p-4 border-l-4 border-caramel flex items-center gap-3 hover:shadow-paper-lg transition-all block no-underline">
              <span className="text-2xl">⚙️</span>
              <div>
                <div className="font-display font-semibold text-caramel">Painel Administrativo</div>
                <div className="font-body text-xs text-ink-light">Estatísticas de uso, usuários e tokens de análise</div>
              </div>
              <span className="ml-auto text-caramel">→</span>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
