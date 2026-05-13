import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { useApi } from '../hooks/useAuth';
import type { ResultadoCorrecao, ResultadoDetectorIA, Analise } from '../types';

function gradeColor(nota: number): string {
  if (nota >= 8) return 'success';
  if (nota >= 6) return 'warning';
  return 'danger';
}

function ProgressBar({ value, max = 10 }: { value: number; max?: number }) {
  const pct = Math.round((value / max) * 100);
  const cls = gradeColor(value);
  return (
    <div className="progress-track">
      <div className={`progress-fill ${cls}`} style={{ width: `${pct}%` }} />
    </div>
  );
}

function ResultadoCorrecaoView({ resultado }: { resultado: ResultadoCorrecao }) {
  return (
    <div className="space-y-6">
      {/* Grade stamp */}
      <div className="flex items-start gap-6 flex-wrap">
        <div className="flex-shrink-0">
          <div className="stamp">{resultado.nota_geral.toFixed(1)}</div>
        </div>
        <div className="flex-1 min-w-48">
          <h3 className="font-display text-2xl font-bold text-pen-blue">Nota Geral</h3>
          <p className="font-body text-ink-light mt-1">
            {resultado.nota_geral >= 8 ? '🌟 Excelente!' : resultado.nota_geral >= 6 ? '👍 Bom!' : resultado.nota_geral >= 4 ? '📝 Regular' : '⚠️ Precisa melhorar'}
          </p>
        </div>
      </div>

      {/* Criteria table */}
      <div className="paper-card p-5">
        <h4 className="font-display text-lg font-semibold text-pen-blue mb-4">Avaliação por Critério</h4>
        <div className="space-y-4">
          {(resultado.criterios || []).map((c) => (
            <div key={c.nome}>
              <div className="flex justify-between items-center mb-1">
                <span className="font-body text-sm font-medium text-ink">{c.nome}</span>
                <span className={`font-display font-bold text-sm ${c.nota >= 8 ? 'text-green-700' : c.nota >= 6 ? 'text-yellow-700' : 'text-correction-red'}`}>
                  {c.nota}/10
                </span>
              </div>
              <ProgressBar value={c.nota} />
              <p className="font-body text-sm text-ink-light mt-1 italic">{c.comentario}</p>
              {c.trechos_problematicos && c.trechos_problematicos.length > 0 && (
                <div className="mt-2 space-y-1">
                  {c.trechos_problematicos.map((t, i) => (
                    <div key={i} className="red-mark font-body text-xs bg-red-50 px-2 py-1 rounded">
                      "{t}"
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Strengths */}
      {resultado.pontos_fortes && resultado.pontos_fortes.length > 0 && (
        <div className="paper-card p-5 border-l-4 border-green-500">
          <h4 className="font-display text-lg font-semibold text-green-700 mb-3">✅ Pontos Fortes</h4>
          <ul className="space-y-2">
            {resultado.pontos_fortes.map((p, i) => (
              <li key={i} className="font-body text-sm text-ink flex items-start gap-2">
                <span className="text-green-600 mt-0.5">•</span> {p}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Suggestions */}
      {resultado.sugestoes_melhoria && resultado.sugestoes_melhoria.length > 0 && (
        <div className="paper-card p-5 border-l-4 border-correction-red">
          <h4 className="font-display text-lg font-semibold text-correction-red mb-3">🖊️ Sugestões de Melhoria</h4>
          <ul className="space-y-2">
            {resultado.sugestoes_melhoria.map((s, i) => (
              <li key={i} className="font-body text-sm text-ink flex items-start gap-2">
                <span className="text-correction-red mt-0.5">•</span> {s}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Transcribed text */}
      {resultado.texto_transcrito && (
        <div className="paper-card p-5">
          <h4 className="font-display text-lg font-semibold text-pen-blue mb-3">📄 Texto Transcrito (OCR)</h4>
          <div className="lined-paper px-4 py-3 rounded font-body text-sm text-ink leading-8 whitespace-pre-wrap">
            {resultado.texto_transcrito}
          </div>
        </div>
      )}
    </div>
  );
}

function ResultadoDetectorView({ resultado }: { resultado: ResultadoDetectorIA }) {
  const pieData = [
    { name: 'Humano', value: resultado.percentual_humano, color: '#27AE60' },
    { name: 'IA', value: resultado.percentual_ia, color: '#C0392B' },
  ];

  const veredictoStyle = resultado.veredicto.includes('Humano')
    ? 'border-green-500 text-green-700'
    : resultado.veredicto.includes('Inconclusivo')
      ? 'border-yellow-500 text-yellow-700'
      : 'border-correction-red text-correction-red';

  return (
    <div className="space-y-6">
      {/* Veredicto */}
      <div className={`paper-card p-6 border-l-4 ${veredictoStyle} flex items-center gap-4 flex-wrap`}>
        <div className="text-4xl">{resultado.veredicto.includes('Humano') ? '👤' : resultado.veredicto.includes('Inconclusivo') ? '🤔' : '🤖'}</div>
        <div>
          <div className="font-display text-2xl font-bold">{resultado.veredicto}</div>
          <p className="font-body text-sm text-ink-light mt-1 max-w-md">{resultado.explicacao}</p>
        </div>
      </div>

      {/* Pie chart */}
      <div className="paper-card p-5">
        <h4 className="font-display text-lg font-semibold text-pen-blue mb-4 text-center">Distribuição Humano vs IA</h4>
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <ResponsiveContainer width={180} height={180}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" outerRadius={80} dataKey="value">
                {pieData.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(v: number) => `${v}%`} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 rounded-full bg-green-500 flex-shrink-0" />
              <div>
                <div className="font-display font-bold text-2xl text-green-700">{resultado.percentual_humano}%</div>
                <div className="font-body text-sm text-ink-light">Escrita Humana</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 rounded-full bg-correction-red flex-shrink-0" />
              <div>
                <div className="font-display font-bold text-2xl text-correction-red">{resultado.percentual_ia}%</div>
                <div className="font-body text-sm text-ink-light">Gerado por IA</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Suspect excerpts */}
      {resultado.trechos_suspeitos.length > 0 && (
        <div className="space-y-4">
          <h4 className="font-display text-lg font-semibold text-pen-blue">⚠️ Trechos Suspeitos</h4>
          {resultado.trechos_suspeitos.map((t, i) => (
            <div key={i} className="highlight-suspect p-4 space-y-2 pr-8">
              <p className="font-body text-sm font-medium text-ink">
                <span className="bg-yellow-300 px-1 rounded">{t.trecho}</span>
              </p>
              <p className="font-body text-xs text-amber-800">
                <strong>Motivo:</strong> {t.motivo}
              </p>
              <p className="font-body text-xs text-pen-blue">
                <strong>Sugestão:</strong> {t.sugestao_humanizacao}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Resultado() {
  const { id } = useParams<{ id: string }>();
  const apiFetch = useApi();
  const navigate = useNavigate();
  const [analise, setAnalise] = useState<Analise | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [aba, setAba] = useState<'resultado' | 'transcricao'>('resultado');

  useEffect(() => {
    if (!id) return;
    apiFetch(`/api/analise/${id}`)
      .then(setAnalise)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id, apiFetch]);

  if (loading) return (
    <div className="min-h-screen notebook-layout notebook-lines-bg flex items-center justify-center">
      <div className="text-center">
        <span className="loading-pen text-5xl">✒️</span>
        <p className="font-body text-caramel mt-4">Carregando resultado...</p>
      </div>
    </div>
  );

  if (error || !analise) return (
    <div className="min-h-screen notebook-layout notebook-lines-bg flex items-center justify-center px-4">
      <div className="paper-card p-8 text-center max-w-sm">
        <div className="text-4xl mb-4">❌</div>
        <h2 className="font-display text-xl text-correction-red mb-2">Erro ao carregar</h2>
        <p className="font-body text-sm text-ink-light mb-4">{error || 'Análise não encontrada.'}</p>
        <button onClick={() => navigate('/dashboard')} className="btn-primary px-6 py-2">← Voltar</button>
      </div>
    </div>
  );

  let resultado;
  try {
    resultado = JSON.parse(analise.resultado_json || '{}');
  } catch {
    resultado = { error: 'Dados corrompidos' };
  }
  const isCorrecao = analise.modo === 'correcao';

  return (
    <div className="min-h-screen notebook-layout notebook-lines-bg py-8 px-4 page-enter">
      <div className="max-w-3xl mx-auto">
        {/* Header letterhead */}
        <div className="paper-card p-6 mb-6 text-center border-b-4 border-pen-blue">
          <div className="font-body text-xs text-ink-light uppercase tracking-widest mb-1">Thaya — Correção com IA</div>
          <h1 className="font-display text-2xl font-bold text-pen-blue">
            {isCorrecao ? 'Laudo de Correção' : 'Relatório Detector IA'}
          </h1>
          <div className="font-body text-xs text-ink-light mt-1">
            {new Date(analise.criado_em).toLocaleString('pt-BR')} · {analise.tokens_usados} tokens
          </div>
        </div>

        {/* Tabs for correction mode */}
        {isCorrecao && (
          <div className="toggle-wrapper w-full max-w-xs mb-6">
            <button type="button" onClick={() => setAba('resultado')} className={`toggle-option flex-1 text-center ${aba === 'resultado' ? 'active' : ''}`}>Resultado</button>
            <button type="button" onClick={() => setAba('transcricao')} className={`toggle-option flex-1 text-center ${aba === 'transcricao' ? 'active' : ''}`}>Transcrição</button>
          </div>
        )}

        {/* Content */}
        {isCorrecao && aba === 'resultado' && <ResultadoCorrecaoView resultado={resultado as ResultadoCorrecao} />}
        {isCorrecao && aba === 'transcricao' && (
          <div className="paper-card p-5">
            <h4 className="font-display text-lg font-semibold text-pen-blue mb-3">📄 Texto Transcrito</h4>
            <div className="lined-paper px-4 py-3 rounded font-body text-sm text-ink leading-8 whitespace-pre-wrap">
              {(resultado as ResultadoCorrecao).texto_transcrito}
            </div>
          </div>
        )}
        {!isCorrecao && <ResultadoDetectorView resultado={resultado as ResultadoDetectorIA} />}

        {/* Actions */}
        <div className="flex gap-3 mt-8">
          <button onClick={() => navigate('/historico')} className="btn-secondary px-5 py-2 text-sm">← Histórico</button>
          <button onClick={() => navigate('/nova-analise')} className="btn-primary px-5 py-2 text-sm">✒️ Nova Análise</button>
        </div>
      </div>
    </div>
  );
}
