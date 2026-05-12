import { Link } from 'react-router-dom';

const features = [
  { icon: '📝', title: 'Correção por IA', desc: 'Envie a foto da redação e receba notas detalhadas, comentários e sugestões de melhoria em segundos.' },
  { icon: '🔍', title: 'Detector de IA', desc: 'Descubra se uma redação foi escrita por humano ou gerada com IA, com análise de trechos suspeitos.' },
  { icon: '📸', title: 'Foto direto do celular', desc: 'Tire uma foto da redação manuscrita e a IA transcreve e analisa automaticamente via OCR nativo.' },
  { icon: '🎙️', title: 'Critérios por voz', desc: 'Grave os critérios de correção pelo microfone — sem precisar digitar nada.' },
];

const plans = [
  { name: 'Gratuito', price: 'R$ 0', desc: 'Perfeito para experimentar', features: ['5 análises por dia', 'Correção e Detector IA', 'Histórico de análises', 'PWA — use no celular'], highlight: false },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-cream">
      {/* Header */}
      <header className="navbar px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-3xl">✒️</span>
          <span className="font-display text-2xl font-bold text-amber-200">Thaya</span>
        </div>
        <Link to="/auth" className="btn-primary px-5 py-2 text-sm">
          Entrar / Cadastrar
        </Link>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="paper-card folded inline-block px-8 py-12 mb-8 w-full max-w-2xl">
            {/* Ruled lines decoration */}
            <div className="lined-paper rounded p-6 mb-6 text-left">
              <h1 className="font-display text-3xl md:text-5xl font-bold text-pen-blue leading-tight mb-4">
                Corrija redações com a<br />
                <span className="text-caramel italic">inteligência da IA</span>
              </h1>
              <p className="font-body text-ink-light text-lg leading-relaxed">
                Tire uma foto da redação, defina os critérios e receba análise completa em segundos.
                Também detectamos se o texto foi escrito por humano ou gerado por IA.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link to="/auth" className="btn-primary px-8 py-3 text-base">
                ✒️ Começar agora — é grátis
              </Link>
            </div>
          </div>

          {/* Mini stats */}
          <div className="flex flex-wrap justify-center gap-6 mt-8 text-center">
            {[['~400', 'análises/dia disponíveis'], ['2 modos', 'Correção + Detector IA'], ['100% na nuvem', 'Cloudflare + Gemini']].map(([n, l]) => (
              <div key={n} className="paper-card px-6 py-4">
                <div className="font-display text-2xl font-bold text-caramel">{n}</div>
                <div className="font-body text-sm text-ink-light">{l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-6 bg-parchment/40">
        <div className="max-w-5xl mx-auto">
          <h2 className="font-display text-3xl font-bold text-center text-pen-blue mb-12">
            Tudo que você precisa para corrigir redações
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f) => (
              <div key={f.title} className="paper-card folded p-6 hover:shadow-paper-lg transition-shadow">
                <div className="text-4xl mb-4">{f.icon}</div>
                <h3 className="font-display text-lg font-semibold text-pen-blue mb-2">{f.title}</h3>
                <p className="font-body text-sm text-ink-light leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 px-6">
        <div className="max-w-3xl mx-auto">
          <h2 className="font-display text-3xl font-bold text-center text-pen-blue mb-12">Como funciona</h2>
          <div className="space-y-6">
            {[
              { n: '1', t: 'Defina os critérios', d: 'Digite ou grave pelo microfone os critérios de correção. Use templates prontos: ENEM, Fuvest, Concurso Público ou personalize.' },
              { n: '2', t: 'Tire uma foto da redação', d: 'Use a câmera do celular para fotografar a redação manuscrita ou impressa. O Gemini transcreve via OCR nativo.' },
              { n: '3', t: 'Escolha o modo e analise', d: 'Modo Correção para notas e comentários, ou Modo Detector IA para verificar a autoria. Resultado em segundos.' },
            ].map((s) => (
              <div key={s.n} className="paper-card flex gap-4 p-6">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-pen-blue text-white flex items-center justify-center font-display font-bold text-lg">{s.n}</div>
                <div>
                  <h3 className="font-display font-semibold text-pen-blue text-lg">{s.t}</h3>
                  <p className="font-body text-sm text-ink-light mt-1 leading-relaxed">{s.d}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Plans */}
      <section className="py-16 px-6 bg-parchment/40">
        <div className="max-w-sm mx-auto text-center">
          <h2 className="font-display text-3xl font-bold text-pen-blue mb-8">Planos</h2>
          {plans.map((p) => (
            <div key={p.name} className="paper-card folded p-8">
              <div className="font-display text-4xl font-bold text-caramel mb-1">{p.price}</div>
              <div className="font-display text-xl font-semibold text-pen-blue mb-1">{p.name}</div>
              <div className="font-body text-sm text-ink-light mb-6">{p.desc}</div>
              <ul className="text-left space-y-2 mb-8">
                {p.features.map((f) => (
                  <li key={f} className="font-body text-sm text-ink flex items-center gap-2">
                    <span className="text-green-600">✓</span> {f}
                  </li>
                ))}
              </ul>
              <Link to="/auth" className="btn-primary w-full justify-center px-6 py-3 block text-center">
                Começar grátis
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="navbar py-6 text-center">
        <p className="font-body text-amber-400/60 text-sm">
          © 2025 Thaya · Construído com Cloudflare Workers + Gemini 2.5 Flash
        </p>
      </footer>
    </div>
  );
}
