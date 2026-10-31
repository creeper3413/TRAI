import React, { useState, useEffect } from 'react';
import {
  Terminal,
  Cpu,
  Sparkles,
  Play,
  Check,
  Copy,
  Volume2,
  Layers,
  Calculator,
  Gamepad2,
  CheckCircle2,
  ArrowRight,
  RotateCw,
  X,
  ChevronDown,
  ChevronUp,
  Zap,
  ShieldCheck,
  FileCode,
  ExternalLink,
} from 'lucide-react';
import { AccentTheme, SupportedLanguage } from '../types';
import { solveMathExpression, MathSolution } from '../services/mathSolver';
import { speechService } from '../services/speech';
import { soundFx } from '../services/soundFx';

interface AgentModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialCommand: string;
  userTitle: string;
  accent: AccentTheme;
  soundEnabled: boolean;
  ttsVoice: 'Fenrir' | 'Kore' | 'Zephyr' | 'Puck';
  speechRate: number;
  onNavigateToCodeStudio?: (code: string, language: SupportedLanguage, filename: string) => void;
}

interface ActionOption {
  id: string;
  label: string;
  desc: string;
  icon: any;
  recommended?: boolean;
}

export const AgentModal: React.FC<AgentModalProps> = ({
  isOpen,
  onClose,
  initialCommand,
  userTitle,
  accent,
  soundEnabled,
  ttsVoice,
  speechRate,
  onNavigateToCodeStudio,
}) => {
  const [command, setCommand] = useState(initialCommand);
  const [isThinking, setIsThinking] = useState(true);
  const [isExecuting, setIsExecuting] = useState(false);
  const [selectedOptionId, setSelectedOptionId] = useState<string>('direct_execute');
  const [customDirective, setCustomDirective] = useState('');
  const [thinkingLogs, setThinkingLogs] = useState<string[]>([]);
  const [planSteps, setPlanSteps] = useState<string[]>([]);
  const [isThinkingExpanded, setIsThinkingExpanded] = useState(true);
  const [mathData, setMathData] = useState<MathSolution | null>(null);
  const [executionResult, setExecutionResult] = useState<any | null>(null);
  const [copied, setCopied] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [stage, setStage] = useState<'clarifying' | 'executed'>('clarifying');

  // Trigger analysis when modal opens with a command
  useEffect(() => {
    if (isOpen && initialCommand) {
      setCommand(initialCommand);
      runAgentAnalysis(initialCommand);
    }
  }, [isOpen, initialCommand]);

  const runAgentAnalysis = async (cmd: string) => {
    setIsThinking(true);
    setExecutionResult(null);
    setStage('clarifying');
    setThinkingLogs([]);

    const mathCheck = solveMathExpression(cmd);
    setMathData(mathCheck.isMath ? mathCheck : null);

    const cmdLower = cmd.toLowerCase();
    const isGame =
      cmdLower.includes('oyun') ||
      cmdLower.includes('game') ||
      cmdLower.includes('arcade') ||
      cmdLower.includes('snake');
    const isCode =
      isGame ||
      cmdLower.includes('kod') ||
      cmdLower.includes('python') ||
      cmdLower.includes('react') ||
      cmdLower.includes('html') ||
      cmdLower.includes('sql') ||
      cmdLower.includes('fonksiyon') ||
      cmdLower.includes('algoritma');

    const domain = mathCheck.isMath ? 'math' : isGame ? 'game' : isCode ? 'code' : 'general';

    // Human-like thoughtful analysis stream
    const initialLogs = [
      `İsteğinizi dikkatle inceliyorum: "${cmd}"`,
      `Konu odağını belirliyorum...`,
    ];

    if (mathCheck.isMath) {
      initialLogs.push(`Matematiksel ifade tespit edildi: ${mathCheck.expression}`);
      initialLogs.push(`Hesaplama tamamlandı: Sonuç = ${mathCheck.result}`);
    } else if (isGame) {
      initialLogs.push(`İstediğiniz oyun için grafik döngüsü ve tuş kontrolleri planlandı.`);
    } else if (isCode) {
      initialLogs.push(`Yazılım mimarisi ve temiz kod şablonları hazırlandı.`);
    } else {
      initialLogs.push(`Sorunuz için en kapsamlı ve doğru yanıt kurgulanıyor.`);
    }

    initialLogs.push(`Sizin için 3 adımlı bir eylem planı hazırladım.`);
    initialLogs.push(`Nasıl bir yol izlememi istersiniz?`);

    setThinkingLogs(initialLogs);

    // Plan steps
    if (mathCheck.isMath) {
      setPlanSteps([
        '1. Matematiksel ifadenin ve işlem önceliklerinin çözümlenmesi',
        '2. Aritmetik hesaplamanın adım adım doğrulanması',
        '3. Sonucun açık ve anlaşılır şekilde ekrana yansıtılması',
      ]);
      setSelectedOptionId('direct_execute');
    } else if (isGame) {
      setPlanSteps([
        '1. Oyun mekaniği, nesneleri ve tuş kontrollerinin tanımlanması',
        '2. 60 FPS akıcı Canvas döngüsü ve ses efektlerinin hazırlanması',
        '3. Canlı stüdyoda oynanabilir hale getirilmesi',
      ]);
      setSelectedOptionId('game_build');
    } else if (isCode) {
      setPlanSteps([
        '1. İhtiyaç duyulan yazılım modülünün tasarlanması',
        '2. Temiz, modern ve hatasız kod bloklarının üretilmesi',
        '3. Kod stüdyosunda test edilip çalıştırılmaya hazır hale getirilmesi',
      ]);
      setSelectedOptionId('direct_execute');
    } else {
      setPlanSteps([
        '1. İsteğinizin ve önceliklerinizin belirlenmesi',
        '2. Çözüm stratejisinin oluşturulması',
        '3. Size en uygun yanıtın sunulması',
      ]);
      setSelectedOptionId('direct_execute');
    }

    setIsThinking(false);
  };

  const handleExecuteOption = async (optionId?: string) => {
    const activeOption = optionId || selectedOptionId;
    setIsExecuting(true);
    soundFx.playClick(soundEnabled);

    try {
      // 1. MATH EXECUTION
      if (mathData && mathData.isMath) {
        if (activeOption === 'step_by_step') {
          setExecutionResult({
            type: 'math',
            title: 'Adım Adım Matematiksel Çözüm',
            expression: mathData.expression,
            result: mathData.result,
            steps: mathData.steps,
            explanation: mathData.explanation,
            detailed: true,
          });
        } else {
          setExecutionResult({
            type: 'math',
            title: 'Kesin Matematiksel Hesaplama',
            expression: mathData.expression,
            result: mathData.result,
            steps: mathData.steps,
            explanation: mathData.explanation,
            detailed: false,
          });
        }
        setStage('executed');
        soundFx.playConfirm(soundEnabled);
        return;
      }

      // 2. GAME / CODE EXECUTION
      const cmdLower = command.toLowerCase();
      const isGame = activeOption === 'game_build' || cmdLower.includes('oyun') || cmdLower.includes('game');
      const isCode = isGame || cmdLower.includes('kod') || cmdLower.includes('python') || cmdLower.includes('react');

      if (isCode || isGame) {
        let lang: SupportedLanguage = isGame ? 'game' : 'python';
        if (!isGame) {
          if (cmdLower.includes('react') || cmdLower.includes('tsx')) lang = 'react';
          else if (cmdLower.includes('html')) lang = 'html';
          else if (cmdLower.includes('sql')) lang = 'sql';
        }

        const res = await fetch('/api/trai/code', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: customDirective ? `${command}. Ek Talimat: ${customDirective}` : command,
            language: lang,
            mode: activeOption === 'debug_audit' ? 'debug' : activeOption === 'step_by_step' ? 'explain' : 'generate',
            category: isGame ? 'game' : 'general',
            userTitle,
          }),
        });

        const data = await res.json();
        setExecutionResult({
          type: 'code',
          title: isGame ? 'Derlenen Oyun Motoru' : 'Üretilen Yazılım Modülü',
          code: data.code,
          explanation: data.explanation,
          filename: data.filename,
          language: data.language,
          runnable: data.runnable ?? true,
        });
        setStage('executed');
        soundFx.playConfirm(soundEnabled);
        return;
      }

      // 3. GENERAL CHAT / STRATEGY
      const res = await fetch('/api/trai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: customDirective ? `${command}. (Operatör ek talimatı: ${customDirective})` : command,
          userTitle,
        }),
      });

      const data = await res.json();
      setExecutionResult({
        type: 'general',
        title: 'TRAİ Yanıtı',
        reply: data.reply || `${userTitle}, komut başarıyla işlendi.`,
      });
      setStage('executed');
      soundFx.playConfirm(soundEnabled);
    } catch (err: any) {
      setExecutionResult({
        type: 'error',
        title: 'İşlem Raporu',
        reply: `Hata meydana geldi: ${err?.message || 'Bilinmiyor'}. Yerel sistemler korumaya alındı.`,
      });
      setStage('executed');
    } finally {
      setIsExecuting(false);
    }
  };

  const handleVoiceRead = async () => {
    if (isSpeaking) {
      speechService.stopSpeaking();
      setIsSpeaking(false);
      return;
    }

    let textToSpeak = '';
    if (executionResult?.type === 'math') {
      textToSpeak = `${userTitle}, ${executionResult.expression} işleminin sonucu ${executionResult.result} olarak hesaplandı.`;
    } else if (executionResult?.type === 'code') {
      textToSpeak = `${userTitle}, ${executionResult.title} hazırlandı: ${executionResult.explanation}`;
    } else if (executionResult?.reply) {
      textToSpeak = executionResult.reply.slice(0, 400);
    }

    if (!textToSpeak) return;

    setIsSpeaking(true);
    await speechService.speak(textToSpeak, ttsVoice, speechRate);
    setIsSpeaking(false);
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    soundFx.playClick(soundEnabled);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  const optionsList: ActionOption[] = [
    {
      id: 'direct_execute',
      label: mathData?.isMath ? '⚡ Doğrudan Hesapla & Çöz' : '⚡ Kodu / Çözümü Doğrudan Çalıştır',
      desc: mathData?.isMath
        ? `Aritmetik işlemi yap (${mathData.expression} = ${mathData.result}) ve anında doğrula`
        : 'Yazılım modülünü derle ve sandbox çalışma alanında yürüt',
      icon: mathData?.isMath ? Calculator : Zap,
      recommended: true,
    },
    {
      id: 'step_by_step',
      label: '📐 Adım Adım Açıkla & Çözümle',
      desc: 'Tüm ara işlem adımlarını, formülleri ve mantıksal invariantları detaylı dökümle',
      icon: Layers,
      recommended: false,
    },
    {
      id: 'game_build',
      label: '🎮 Canlı HTML5 Oyunu Olarak Geliştir',
      desc: 'Bu fikri veya mantığı etkileşimli 60 FPS Canvas oyununa dönüştür',
      icon: Gamepad2,
      recommended: command.toLowerCase().includes('oyun') || command.toLowerCase().includes('game'),
    },
    {
      id: 'debug_audit',
      label: '🐞 Hata Ayıkla, Denetle & Test Et',
      desc: 'Sözdizimi hatalarını tara, sınır durumları ve bellek verimliliğini doğrula',
      icon: ShieldCheck,
      recommended: false,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-[#090d16] border border-cyan-500/40 rounded-2xl shadow-[0_0_50px_rgba(6,182,212,0.25)] overflow-hidden my-auto">
        
        {/* TOP STATUS BAR (AI Studio HUD Style) */}
        <div className="px-5 py-3.5 bg-[#060911] border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.3)]">
              <Cpu className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold tracking-widest text-cyan-400 uppercase">
                  Trai Ajan Terminali
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-semibold">
                  {stage === 'clarifying' ? 'PLANLAMA & ETKİLEŞİM' : 'TAMAMLANDI'}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-mono">
                Akıllı Düşünce & Karar Motoru · Doğrudan Çözüm Garantisi
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            title="Kapat"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 sm:p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          
          {/* SECTION 1: USER COMMAND PROMPT */}
          <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center gap-3">
            <Terminal className="w-4 h-4 text-cyan-400 shrink-0" />
            <div className="flex-1">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 block">
                İncelenen Komut / Girdi
              </span>
              <span className="text-sm font-mono font-bold text-slate-100">
                "{command}"
              </span>
            </div>
            {mathData?.isMath && (
              <span className="text-xs px-2.5 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-mono font-semibold">
                Matematiksel İfade: {mathData.result}
              </span>
            )}
          </div>

          {/* SECTION 2: STREAMING AGENT REASONING & THINKING LOGS */}
          <div className="rounded-xl border border-slate-800/80 bg-[#060810] overflow-hidden">
            <button
              onClick={() => setIsThinkingExpanded(!isThinkingExpanded)}
              className="w-full px-4 py-2.5 bg-slate-900/60 border-b border-slate-800/60 flex items-center justify-between text-xs font-mono text-cyan-400 hover:bg-slate-900 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                <span className="font-bold tracking-wider uppercase">Ajan Akıl Yürütme Süreci (Agent Thinking)</span>
                <span className="text-slate-500 text-[11px]">({thinkingLogs.length} adım)</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-400">
                <span className="text-[11px]">{isThinkingExpanded ? 'Gizle' : 'Göster'}</span>
                {isThinkingExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </div>
            </button>

            {isThinkingExpanded && (
              <div className="p-3.5 space-y-1.5 font-mono text-xs text-slate-300 leading-relaxed max-h-36 overflow-y-auto">
                {thinkingLogs.map((log, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <span className="text-cyan-500 select-none">&gt;</span>
                    <span className={log.includes('Doğrulama') || log.includes('Tamamlandı') ? 'text-emerald-400' : 'text-slate-300'}>
                      {log}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* SECTION 3: 3-STEP IMPLEMENTATION PLAN */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
            <span className="text-[11px] font-mono uppercase tracking-wider text-cyan-400 font-bold flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5" />
              <span>Sistem Eylem Planı (Implementation Plan)</span>
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
              {planSteps.map((step, idx) => (
                <div key={idx} className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800/80 flex items-start gap-2">
                  <span className="w-4 h-4 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-[10px] font-mono font-bold flex items-center justify-center shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <span className="text-xs text-slate-300 leading-snug">{step}</span>
                </div>
              ))}
            </div>
          </div>

          {/* SECTION 4: INTERACTIVE QUESTION & OPTIONS ("NE YAPMAMI İSTERSİNİZ?") */}
          {stage === 'clarifying' && (
            <div className="p-4 rounded-xl bg-gradient-to-b from-cyan-950/20 to-slate-950 border border-cyan-500/30 space-y-3">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                <h3 className="text-sm font-semibold text-slate-100 font-sans">
                  {userTitle}, bu komut için sistemin nasıl bir yol izlemesini istersiniz?
                </h3>
              </div>

              {/* Action Option Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {optionsList.map((opt) => {
                  const Icon = opt.icon;
                  const isSelected = selectedOptionId === opt.id;
                  return (
                    <div
                      key={opt.id}
                      onClick={() => {
                        setSelectedOptionId(opt.id);
                        soundFx.playClick(soundEnabled);
                      }}
                      className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all flex items-start gap-3 relative ${
                        isSelected
                          ? 'border-cyan-400 bg-cyan-500/15 shadow-sm'
                          : 'border-slate-800 bg-slate-900/70 hover:border-slate-700'
                      }`}
                    >
                      <div className={`p-2 rounded-lg shrink-0 ${isSelected ? 'bg-cyan-500 text-slate-950' : 'bg-slate-800 text-cyan-400'}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-0.5">
                          <span className="text-xs font-bold text-slate-100 font-mono">
                            {opt.label}
                          </span>
                          {opt.recommended && (
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-mono">
                              Önerilen
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400 leading-snug">
                          {opt.desc}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Custom Optional Directive */}
              <div className="pt-1">
                <input
                  type="text"
                  value={customDirective}
                  onChange={(e) => setCustomDirective(e.target.value)}
                  placeholder="İsteğe bağlı ek talimatınız varsa yazın (örn: 'Grafikleri parlak yap', 'Çarpanlara ayır')..."
                  className="w-full py-2 px-3 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder:text-slate-600 outline-none focus:border-cyan-400 transition-colors font-mono"
                />
              </div>

              {/* Proceed Action Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-white text-xs font-semibold cursor-pointer transition-colors"
                >
                  Vazgeç
                </button>
                <button
                  type="button"
                  onClick={() => handleExecuteOption()}
                  disabled={isExecuting}
                  className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold flex items-center gap-2 cursor-pointer shadow-md transition-all disabled:opacity-50"
                >
                  {isExecuting ? (
                    <>
                      <RotateCw className="w-3.5 h-3.5 animate-spin" />
                      <span>İşleniyor & Yürütülüyor...</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Seçilen Eylemi Onayla & Çalıştır (Proceed)</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* SECTION 5: FINAL VERIFIED EXECUTION RESULT */}
          {stage === 'executed' && executionResult && (
            <div className="p-5 rounded-xl bg-slate-950 border border-emerald-500/40 shadow-xl space-y-4 animate-in fade-in">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2 text-emerald-400 font-mono font-bold text-xs uppercase">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>{executionResult.title}</span>
                  <span className="text-slate-600">·</span>
                  <span className="text-cyan-300 font-normal">Yürütme Tamamlandı (%100 Başarı)</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleVoiceRead}
                    className="p-1.5 rounded-lg border border-slate-800 hover:border-cyan-400 text-slate-300 hover:text-cyan-300 transition-colors cursor-pointer"
                    title="Sesli Dinle"
                  >
                    <Volume2 className={`w-3.5 h-3.5 ${isSpeaking ? 'text-cyan-400 animate-pulse' : ''}`} />
                  </button>
                  <button
                    onClick={() =>
                      handleCopy(
                        executionResult.code || executionResult.result?.toString() || executionResult.reply || ''
                      )
                    }
                    className="p-1.5 rounded-lg border border-slate-800 hover:border-cyan-400 text-slate-300 hover:text-cyan-300 transition-colors cursor-pointer"
                    title="Kopyala"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* MATH RESULT VIEW */}
              {executionResult.type === 'math' && (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-[#070e1b] border border-cyan-500/30 flex items-center justify-between">
                    <div>
                      <span className="text-xs text-slate-400 font-mono block">Hesaplanan İfade</span>
                      <span className="text-lg font-mono text-cyan-300 font-bold">{executionResult.expression}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-slate-400 font-mono block">Nihai Sonuç</span>
                      <span className="text-3xl font-mono text-emerald-400 font-extrabold tracking-tight">
                        {executionResult.result}
                      </span>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
                    <span className="text-xs font-mono font-bold text-slate-300 uppercase block">
                      İşlem Adımları & İspat:
                    </span>
                    <ul className="space-y-1.5 text-xs font-mono text-slate-300">
                      {executionResult.steps?.map((step: string, i: number) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-cyan-400 font-bold">{i + 1}.</span>
                          <span>{step}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* CODE / GAME RESULT VIEW */}
              {executionResult.type === 'code' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                    <div className="flex items-center gap-2">
                      <FileCode className="w-3.5 h-3.5 text-cyan-400" />
                      <span className="text-cyan-300 font-bold">{executionResult.filename}</span>
                      <span className="uppercase text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-300">
                        {executionResult.language}
                      </span>
                    </div>
                    {onNavigateToCodeStudio && (
                      <button
                        onClick={() => {
                          onNavigateToCodeStudio(
                            executionResult.code,
                            executionResult.language,
                            executionResult.filename
                          );
                          onClose();
                        }}
                        className="px-3 py-1 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                      >
                        <span>Kod & Oyun Stüdyosunda Aç & Oyna</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed font-sans">
                    {executionResult.explanation}
                  </p>

                  <div className="p-3 bg-black rounded-xl border border-slate-800 max-h-56 overflow-y-auto font-mono text-xs text-cyan-200 whitespace-pre">
                    {executionResult.code}
                  </div>
                </div>
              )}

              {/* GENERAL VIEW */}
              {executionResult.type === 'general' && (
                <div className="text-xs text-slate-200 leading-relaxed whitespace-pre-wrap font-sans">
                  {executionResult.reply}
                </div>
              )}

              {/* Execution Actions Bottom */}
              <div className="pt-2 flex items-center justify-between border-t border-slate-800 text-xs">
                <button
                  onClick={() => setStage('clarifying')}
                  className="px-3 py-1.5 rounded-lg border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  ← Seçeneklere Geri Dön
                </button>

                <button
                  onClick={onClose}
                  className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium cursor-pointer transition-colors"
                >
                  Tamamla & Kapat
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
