import { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

type Modo = 'correcao' | 'detector_ia';
type Step = 1 | 2 | 3;

const TEMPLATES: Record<string, string> = {
  enem: `ENEM — 5 Competências (0-200 cada, total 0-1000):
1. Domínio da norma culta da língua escrita
2. Compreensão da proposta e aplicação de conceitos das áreas de conhecimento
3. Seleção, relação, organização e interpretação de informações, fatos e argumentos
4. Conhecimento dos mecanismos linguísticos para a construção da argumentação
5. Proposta de intervenção detalhada, respeitando os direitos humanos`,
  fuvest: `Fuvest — Critérios (nota 0-10):
- Desenvolvimento do tema proposto
- Coerência e coesão textual
- Repertório cultural e argumentação
- Norma culta e ausência de erros graves
- Originalidade e criatividade`,
  concurso: `Concurso Público — Critérios:
- Adequação ao tema (0-5 pontos)
- Estrutura e organização textual (0-5 pontos)
- Coesão e coerência (0-5 pontos)
- Correção gramatical e vocabulário (0-5 pontos)
- Clareza e objetividade (0-5 pontos)`,
  personalizado: '',
};

export default function NovaAnalise() {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [step, setStep] = useState<Step>(1);
  const [criterios, setCriterios] = useState('');
  const [imagem, setImagem] = useState<string | null>(null);
  const [imagemMime, setImagemMime] = useState('image/jpeg');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [modo, setModo] = useState<Modo>('correcao');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [gravando, setGravando] = useState(false);
  const [audioBase64, setAudioBase64] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const API_BASE = import.meta.env.VITE_API_URL || '';

  // Photo capture
  const handleFile = useCallback((file: File) => {
    const mime = file.type || 'image/jpeg';
    setImagemMime(mime);
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setPreviewUrl(dataUrl);
      // Extract base64 part only
      setImagem(dataUrl.split(',')[1]);
    };
    reader.readAsDataURL(file);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  // Audio recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      chunksRef.current = [];
      mr.ondataavailable = (e) => chunksRef.current.push(e.data);
      mr.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.onload = (ev) => {
          const b64 = (ev.target?.result as string).split(',')[1];
          setAudioBase64(b64);
        };
        reader.readAsDataURL(blob);
        stream.getTracks().forEach((t) => t.stop());
      };
      mr.start();
      mediaRecorderRef.current = mr;
      setGravando(true);
    } catch {
      setError('Não foi possível acessar o microfone.');
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setGravando(false);
  };

  // Submit
  const handleAnalise = async () => {
    if (!imagem) { setError('Adicione a foto da redação.'); return; }
    setLoading(true);
    setError('');
    try {
      const body: Record<string, unknown> = {
        imagem_base64: imagem,
        mime_type: imagemMime,
        criterios,
        modo,
      };
      if (audioBase64) {
        body.audio_base64 = audioBase64;
        body.audio_mime_type = 'audio/webm';
      }

      const res = await fetch(`${API_BASE}/api/analise`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro ao analisar.');
      navigate(`/resultado/${data.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro desconhecido.');
    } finally {
      setLoading(false);
    }
  };

  const WizardSteps = () => (
    <div className="flex items-center mb-8 max-w-sm mx-auto">
      {[1, 2, 3].map((n, i) => (
        <div key={n} className="flex items-center" style={{ flex: n < 3 ? 1 : 'none' }}>
          <div className={`wizard-step-circle ${step === n ? 'active' : step > n ? 'done' : ''}`}>
            {step > n ? '✓' : n}
          </div>
          {i < 2 && <div className={`wizard-step-line ${step > n ? 'done' : ''}`} />}
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-cream py-8 px-4 page-enter">
      <div className="max-w-2xl mx-auto">
        <h1 className="font-display text-2xl font-bold text-pen-blue mb-6 text-center">Nova Análise</h1>
        <WizardSteps />

        {/* Step 1 — Critérios */}
        {step === 1 && (
          <div className="paper-card folded p-6 space-y-5">
            <h2 className="font-display text-xl font-semibold text-pen-blue">Etapa 1 — Critérios de Correção</h2>

            {/* Templates */}
            <div>
              <p className="font-body text-sm text-ink-light mb-2">Templates prontos:</p>
              <div className="flex flex-wrap gap-2">
                {Object.keys(TEMPLATES).map((k) => (
                  <button key={k} type="button" onClick={() => setCriterios(TEMPLATES[k])} className="btn-secondary px-3 py-1 text-xs capitalize">
                    {k === 'enem' ? 'ENEM' : k === 'fuvest' ? 'Fuvest' : k === 'concurso' ? 'Concurso' : 'Personalizado'}
                  </button>
                ))}
              </div>
            </div>

            {/* Text area */}
            <div>
              <label className="block font-body text-sm text-ink-light mb-1.5">Critérios (ou deixe em branco para critérios gerais)</label>
              <textarea
                value={criterios}
                onChange={(e) => setCriterios(e.target.value)}
                rows={8}
                placeholder="Descreva os critérios de correção..."
                className="input-notebook lined-paper px-4 py-2 text-sm resize-none"
              />
            </div>

            {/* Audio */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onMouseDown={startRecording}
                onMouseUp={stopRecording}
                onTouchStart={startRecording}
                onTouchEnd={stopRecording}
                className={`btn-secondary px-4 py-2 text-sm ${gravando ? 'bg-red-100 border-red-300' : ''}`}
              >
                {gravando ? '🔴 Gravando... (solte para parar)' : '🎙️ Gravar critérios (segure)'}
              </button>
              {audioBase64 && <span className="font-body text-xs text-green-700">✓ Áudio gravado</span>}
            </div>

            <button onClick={() => setStep(2)} className="btn-primary w-full justify-center px-6 py-3">
              Próximo: Enviar Redação →
            </button>
          </div>
        )}

        {/* Step 2 — Capturar foto */}
        {step === 2 && (
          <div className="paper-card folded p-6 space-y-5">
            <h2 className="font-display text-xl font-semibold text-pen-blue">Etapa 2 — Foto da Redação</h2>

            {previewUrl ? (
              <div className="relative">
                <img src={previewUrl} alt="Redação capturada" className="w-full rounded-lg border-2 border-parchment shadow-paper object-contain max-h-80" />
                <div className="absolute top-2 left-2 bg-white/80 backdrop-blur text-xs font-body px-2 py-1 rounded">📄 Redação capturada</div>
              </div>
            ) : (
              <div
                className="border-2 border-dashed border-parchment rounded-lg p-12 text-center cursor-pointer hover:border-caramel transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="text-5xl mb-3">📷</div>
                <p className="font-display text-lg font-semibold text-pen-blue">Tirar foto ou enviar imagem</p>
                <p className="font-body text-sm text-ink-light mt-1">Toque para abrir a câmera ou galeria</p>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={handleFileChange}
            />

            <div className="flex gap-3">
              {previewUrl && (
                <button
                  type="button"
                  onClick={() => { setImagem(null); setPreviewUrl(null); fileInputRef.current?.click(); }}
                  className="btn-secondary px-4 py-2 text-sm flex-1 justify-center"
                >
                  🔄 Refazer foto
                </button>
              )}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="btn-secondary px-4 py-2 text-sm flex-1 justify-center"
              >
                📷 {previewUrl ? 'Trocar imagem' : 'Tirar foto'}
              </button>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setStep(1)} className="btn-secondary px-4 py-2 text-sm flex-1 justify-center">← Voltar</button>
              <button onClick={() => imagem && setStep(3)} disabled={!imagem} className="btn-primary px-4 py-2 text-sm flex-1 justify-center disabled:opacity-50">
                Próximo: Analisar →
              </button>
            </div>
          </div>
        )}

        {/* Step 3 — Modo e análise */}
        {step === 3 && (
          <div className="paper-card folded p-6 space-y-6">
            <h2 className="font-display text-xl font-semibold text-pen-blue">Etapa 3 — Selecionar Modo</h2>

            {/* Mode toggle */}
            <div>
              <p className="font-body text-sm text-ink-light mb-3 text-center">Escolha o tipo de análise:</p>
              <div className="toggle-wrapper w-full max-w-xs mx-auto">
                <button
                  type="button"
                  onClick={() => setModo('correcao')}
                  className={`toggle-option flex-1 text-center ${modo === 'correcao' ? 'active' : ''}`}
                >
                  ✏️ Correção
                </button>
                <button
                  type="button"
                  onClick={() => setModo('detector_ia')}
                  className={`toggle-option flex-1 text-center ${modo === 'detector_ia' ? 'active' : ''}`}
                >
                  🔍 Detector IA
                </button>
              </div>
            </div>

            {/* Summary */}
            <div className="paper-card bg-parchment/50 p-4 space-y-2">
              <p className="font-body text-sm text-ink-light"><strong>Modo:</strong> {modo === 'correcao' ? 'Correção de Redação' : 'Detector de IA'}</p>
              <p className="font-body text-sm text-ink-light"><strong>Critérios:</strong> {criterios ? criterios.slice(0, 60) + '...' : 'Critérios gerais'}</p>
              <p className="font-body text-sm text-ink-light"><strong>Imagem:</strong> ✓ Capturada</p>
              {audioBase64 && <p className="font-body text-sm text-ink-light"><strong>Áudio:</strong> ✓ Gravado</p>}
            </div>

            {error && (
              <div className="paper-card bg-red-50 border-red-200 p-3 text-correction-red font-body text-sm">⚠️ {error}</div>
            )}

            {loading ? (
              <div className="text-center py-8">
                <div className="loading-pen text-4xl">✒️</div>
                <p className="font-display text-lg font-semibold text-pen-blue mt-4">Analisando redação...</p>
                <p className="font-body text-sm text-ink-light mt-1">O Gemini está lendo e avaliando. Aguarde.</p>
              </div>
            ) : (
              <div className="flex gap-3">
                <button onClick={() => setStep(2)} className="btn-secondary px-4 py-2 text-sm flex-1 justify-center">← Voltar</button>
                <button onClick={handleAnalise} className="btn-primary px-4 py-3 text-base flex-1 justify-center font-bold">
                  ✒️ Analisar Redação
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
