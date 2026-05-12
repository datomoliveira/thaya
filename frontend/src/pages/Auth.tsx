import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

type Mode = 'login' | 'register';

export default function Auth() {
  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [aguardando, setAguardando] = useState(false);
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (mode === 'login') {
        await login(email, senha);
        navigate('/dashboard');
      } else {
        const result = await register(email, senha);
        if (result?.aguardando_aprovacao) {
          setAguardando(true);
        } else {
          navigate('/dashboard');
        }
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro desconhecido.';
      if (msg.includes('aguardando') || msg.includes('aprovada')) {
        setAguardando(true);
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  // Waiting approval screen
  if (aguardando) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm page-enter">
          <div className="paper-card folded p-10 text-center">
            <div className="text-6xl mb-5">⏳</div>
            <h2 className="font-display text-2xl font-bold text-pen-blue mb-3">
              Cadastro enviado!
            </h2>
            <p className="font-body text-sm text-ink-light leading-relaxed mb-6">
              Seu cadastro com o email <strong className="text-ink">{email}</strong> foi registrado com sucesso.
              O administrador precisa aprovar sua conta antes que você possa acessar o sistema.
            </p>
            <div className="paper-card bg-amber-50 border-amber-200 border-l-4 border-caramel p-4 text-left mb-6">
              <p className="font-body text-xs text-ink-light">
                ✉️ Assim que for aprovado, volte aqui e faça login normalmente com seu email e senha.
              </p>
            </div>
            <button
              onClick={() => { setAguardando(false); setMode('login'); }}
              className="btn-secondary w-full justify-center px-6 py-2.5"
            >
              ← Voltar para login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm page-enter">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">✒️</div>
          <h1 className="font-display text-3xl font-bold text-pen-blue">Thaya</h1>
          <p className="font-body text-ink-light text-sm mt-1">Correção de Redação com IA</p>
        </div>

        {/* Card */}
        <div className="paper-card folded p-8">
          {/* Mode tabs */}
          <div className="toggle-wrapper mb-8 w-full">
            <button
              type="button"
              onClick={() => { setMode('login'); setError(''); }}
              className={`toggle-option flex-1 text-center ${mode === 'login' ? 'active' : ''}`}
            >
              Entrar
            </button>
            <button
              type="button"
              onClick={() => { setMode('register'); setError(''); }}
              className={`toggle-option flex-1 text-center ${mode === 'register' ? 'active' : ''}`}
            >
              Cadastrar
            </button>
          </div>

          {mode === 'register' && (
            <div className="paper-card bg-blue-50 border-blue-200 p-3 mb-5">
              <p className="font-body text-xs text-pen-blue leading-relaxed">
                ℹ️ Novos cadastros precisam de aprovação do administrador antes de acessar o sistema.
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block font-body text-sm text-ink-light mb-1.5">E-mail</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="seu@email.com"
                className="input-notebook px-4 py-2.5 text-sm"
              />
            </div>
            <div>
              <label className="block font-body text-sm text-ink-light mb-1.5">
                Senha {mode === 'register' && <span className="text-xs">(mín. 6 caracteres)</span>}
              </label>
              <input
                type="password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                required
                minLength={6}
                placeholder="••••••••"
                className="input-notebook px-4 py-2.5 text-sm"
              />
            </div>

            {error && (
              <div className="paper-card bg-red-50 border-red-200 p-3 text-correction-red font-body text-sm">
                ⚠️ {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full justify-center px-6 py-3 text-base mt-2"
            >
              {loading ? (
                <><span className="loading-pen" style={{ fontSize: '1rem' }}>✒️</span> Aguarde...</>
              ) : (
                mode === 'login' ? '→ Entrar' : '→ Solicitar acesso'
              )}
            </button>
          </form>
        </div>

        <p className="text-center font-body text-xs text-ink-light mt-6">
          Ao continuar, você concorda com os termos de uso do Thaya.
        </p>
      </div>
    </div>
  );
}
