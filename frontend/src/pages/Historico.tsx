import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useApi } from '../hooks/useAuth';
import type { Analise } from '../types';

type FilterMode = 'todos' | 'correcao' | 'detector_ia';

export default function Historico() {
  const apiFetch = useApi();
  const [analises, setAnalises] = useState<Analise[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterMode>('todos');

  useEffect(() => {
    const params = filter !== 'todos' ? `?modo=${filter}` : '';
    apiFetch(`/api/historico${params}`)
      .then((d) => setAnalises(d.analises || []))
      .catch(() => setAnalises([]))
      .finally(() => setLoading(false));
  }, [apiFetch, filter]);

  return (
    <div className="min-h-screen bg-cream py-8 px-4 page-enter">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-display text-2xl font-bold text-pen-blue">Histórico de Análises</h1>
          <Link to="/nova-analise" className="btn-primary px-4 py-2 text-sm">+ Nova</Link>
        </div>

        {/* Filter */}
        <div className="toggle-wrapper w-full max-w-xs mb-6">
          {(['todos', 'correcao', 'detector_ia'] as FilterMode[]).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={`toggle-option flex-1 text-center text-xs ${filter === f ? 'active' : ''}`}
            >
              {f === 'todos' ? 'Todos' : f === 'correcao' ? 'Correção' : 'Detector IA'}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-16">
            <span className="loading-pen text-4xl">✒️</span>
            <p className="font-body text-caramel mt-3">Carregando histórico...</p>
          </div>
        ) : analises.length === 0 ? (
          <div className="paper-card p-12 text-center">
            <div className="text-5xl mb-4">📂</div>
            <h2 className="font-display text-xl text-pen-blue mb-2">Nenhuma análise ainda</h2>
            <p className="font-body text-sm text-ink-light mb-6">Faça sua primeira análise de redação!</p>
            <Link to="/nova-analise" className="btn-primary px-6 py-2.5 inline-flex">✒️ Começar agora</Link>
          </div>
        ) : (
          <div className="space-y-3">
            {analises.map((a) => (
              <Link
                key={a.id}
                to={`/resultado/${a.id}`}
                className="paper-card folded p-5 flex items-center gap-4 hover:shadow-paper-lg transition-all block no-underline group"
              >
                <div className="text-3xl flex-shrink-0">
                  {a.modo === 'correcao' ? '📝' : '🔍'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs font-body px-2 py-0.5 rounded-full font-medium ${
                      a.modo === 'correcao'
                        ? 'bg-blue-100 text-pen-blue'
                        : 'bg-red-100 text-correction-red'
                    }`}>
                      {a.modo === 'correcao' ? 'Correção' : 'Detector IA'}
                    </span>
                    <span className="font-body text-xs text-ink-light">
                      {new Date(a.criado_em).toLocaleString('pt-BR')}
                    </span>
                  </div>
                  <p className="font-body text-sm text-ink truncate">
                    {a.criterios ? a.criterios.slice(0, 80) + '...' : 'Critérios gerais'}
                  </p>
                </div>
                <div className="flex-shrink-0 text-caramel group-hover:text-ink transition-colors">→</div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
