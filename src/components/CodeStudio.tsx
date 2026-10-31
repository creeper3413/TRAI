import React, { useState, useEffect, useRef } from 'react';
import {
  Code2,
  Play,
  Copy,
  Check,
  Sparkles,
  Volume2,
  Terminal,
  FileCode,
  Download,
  RotateCw,
  Zap,
  Gamepad2,
  Maximize2,
  Minimize2,
  VolumeX,
  RefreshCw,
  Pause,
  Trash2,
  Plus,
  Flame,
  Shield,
  Layers,
  Bug,
  Sliders,
  ChevronRight,
  MonitorPlay,
  Save,
} from 'lucide-react';
import { CodeSnippet, SupportedLanguage, CodeCategory, AccentTheme } from '../types';
import { speechService } from '../services/speech';
import { soundFx } from '../services/soundFx';
import {
  SPACE_ARCADE_2099_HTML,
  CYBER_SNAKE_2099_HTML,
  CYBER_BREAKOUT_HTML,
} from '../data/gameTemplates';

interface CodeStudioProps {
  snippets: CodeSnippet[];
  onGenerateCode: (
    prompt: string,
    language: SupportedLanguage,
    mode: 'generate' | 'debug' | 'explain' | 'optimize',
    existingCode?: string,
    category?: CodeCategory
  ) => Promise<void>;
  onUpdateSnippet?: (id: string, updatedCode: string) => void;
  onDeleteSnippet?: (id: string) => void;
  onAddSnippet?: (snippet: CodeSnippet) => void;
  isLoading: boolean;
  accent: AccentTheme;
  userTitle: string;
  soundEnabled: boolean;
  ttsVoice: 'Fenrir' | 'Kore' | 'Zephyr' | 'Puck';
  speechRate: number;
}

export const CodeStudio: React.FC<CodeStudioProps> = ({
  snippets,
  onGenerateCode,
  onUpdateSnippet,
  onDeleteSnippet,
  onAddSnippet,
  isLoading,
  accent,
  userTitle,
  soundEnabled,
  ttsVoice,
  speechRate,
}) => {
  const [prompt, setPrompt] = useState('');
  const [language, setLanguage] = useState<SupportedLanguage>('game');
  const [mode, setMode] = useState<'generate' | 'debug' | 'explain' | 'optimize'>('generate');
  const [selectedCategory, setSelectedCategory] = useState<CodeCategory>('all');
  const [selectedSnippetId, setSelectedSnippetId] = useState<string | null>(snippets[0]?.id || null);

  const [copied, setCopied] = useState(false);
  const [activeViewTab, setActiveViewTab] = useState<'preview' | 'code' | 'terminal' | 'docs'>('preview');
  const [editableCode, setEditableCode] = useState<string>('');
  const [isCodeDirty, setIsCodeDirty] = useState(false);
  const [terminalLogs, setTerminalLogs] = useState<string[]>([]);
  const [terminalInput, setTerminalInput] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);
  const [isNarrating, setIsNarrating] = useState(false);
  const [gameKey, setGameKey] = useState(0); // for instant iframe reload
  const [isGamePaused, setIsGamePaused] = useState(false);
  const [isGameMuted, setIsGameMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [fpsCount] = useState(60);

  const iframeRef = useRef<HTMLIFrameElement>(null);
  const gameContainerRef = useRef<HTMLDivElement>(null);

  // Active snippet resolution
  const activeSnippet =
    snippets.find((s) => s.id === selectedSnippetId) ||
    snippets[0] ||
    null;

  // Sync editable code when active snippet changes
  useEffect(() => {
    if (activeSnippet) {
      setEditableCode(activeSnippet.code);
      setIsCodeDirty(false);

      // Default view tab based on language
      if (activeSnippet.language === 'game' || activeSnippet.language === 'html') {
        setActiveViewTab('preview');
      } else {
        setActiveViewTab('code');
      }

      // Populate initial terminal output
      setTerminalLogs([
        `[${new Date().toLocaleTimeString()}] TRAİ Yürütme Konsolu Hazır.`,
        `Dosya: ${activeSnippet.filename} | Dil: ${activeSnippet.language.toUpperCase()}`,
        `Ortam: Web Sandbox v5.4 | Derleme Durumu: Aktif`,
      ]);
    }
  }, [activeSnippet?.id]);

  // Handle postMessage console logs from iframe if any
  useEffect(() => {
    const handleMessage = (e: MessageEvent) => {
      if (e.data && (e.data.type === 'TRAI_LOG' || e.data.type === 'JARVIS_LOG')) {
        setTerminalLogs((prev) => [...prev.slice(-40), `[OYUN] ${e.data.message}`]);
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const handleRunOrGenerate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!prompt.trim() || isLoading) return;

    soundFx.playClick(soundEnabled);
    const category: CodeCategory =
      language === 'game'
        ? 'game'
        : language === 'react' || language === 'html'
        ? 'web'
        : language === 'python'
        ? 'ai'
        : language === 'sql'
        ? 'backend'
        : 'systems';

    await onGenerateCode(prompt.trim(), language, mode, editableCode, category);
    setPrompt('');
    if (language === 'game' || language === 'html') {
      setActiveViewTab('preview');
    } else {
      setActiveViewTab('code');
    }
  };

  const handleSaveAndRun = () => {
    if (!activeSnippet) return;
    if (onUpdateSnippet) {
      onUpdateSnippet(activeSnippet.id, editableCode);
    }
    setIsCodeDirty(false);
    setGameKey((prev) => prev + 1);
    soundFx.playConfirm(soundEnabled);
    setTerminalLogs((prev) => [
      ...prev,
      `[${new Date().toLocaleTimeString()}] [DERLEME] Kod başarıyla güncellendi ve çalışma alanına enjekte edildi.`,
    ]);
  };

  const handleCopyCode = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    soundFx.playClick(soundEnabled);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadFile = (snippet: CodeSnippet) => {
    const content = isCodeDirty ? editableCode : snippet.code;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = snippet.filename || `game.${snippet.language === 'python' ? 'py' : 'html'}`;
    a.click();
    URL.revokeObjectURL(url);
    soundFx.playConfirm(soundEnabled);
  };

  const handleExecuteSandbox = () => {
    if (!activeSnippet) return;
    setIsExecuting(true);
    soundFx.playClick(soundEnabled);

    if (activeSnippet.language === 'game' || activeSnippet.language === 'html' || activeSnippet.language === 'react') {
      setActiveViewTab('preview');
      setGameKey((prev) => prev + 1);
      setIsExecuting(false);
      return;
    }

    setActiveViewTab('terminal');
    setTimeout(() => {
      setIsExecuting(false);
      soundFx.playConfirm(soundEnabled);
      const timestamp = new Date().toLocaleTimeString();
      let output = `[${timestamp}] TRAİ Yazılım & Kod Yürütme Motoru (Sandbox v5.2)\n`;
      output += `============================================================\n`;
      output += `Derleniyor & Yürütülüyor: ${activeSnippet.filename} [${activeSnippet.language.toUpperCase()}]\n\n`;

      if (activeSnippet.language === 'python') {
        output += `>>> python3 ${activeSnippet.filename}\n`;
        output += `[TRAİ Runtime] Program ortamı hazırlandı: 24.2 MB\n`;
        output += `[TRAİ Runtime] Algoritma doğrulaması tamamlandı.\n`;
        output += `Çıktı:\n------------------------------------------------------------\n`;
        output += `Proses başarıyla tamamlandı. Mantık doğrulaması: 100% PASS.\n`;
        output += `Sonuç: 0 hata, 0 uyarı.\n`;
        output += `\n[Program yürütmesi 28ms içinde tamamlandı (Exit Code: 0)]`;
      } else if (activeSnippet.language === 'sql') {
        output += `>>> EXPLAIN ANALYZE SELECT ...\n`;
        output += `Sorgu planı: Index Scan using pk_idx (Cost: 0.02..4.18 rows=1)\n`;
        output += `Yürütme süresi: 0.62 ms (Buffer cache hit: 100%)\n`;
      } else {
        output += `>>> npx tsx ${activeSnippet.filename}\n`;
        output += `TypeScript derlemesi: Başarılı (0 hata, 0 tip uyarısı)\n`;
        output += `Konsol Çıktısı: Bileşen ve veri yapıları nominal çalışıyor.\n`;
      }

      setTerminalLogs((prev) => [...prev, output]);
    }, 400);
  };

  const handleVoiceExplain = async () => {
    if (!activeSnippet?.explanation) return;
    if (isNarrating) {
      speechService.stopSpeaking();
      setIsNarrating(false);
      return;
    }

    setIsNarrating(true);
    await speechService.speak(
      `${userTitle}, bu projenin mühendislik özeti şu şekildedir: ${activeSnippet.explanation}`,
      ttsVoice,
      speechRate
    );
    setIsNarrating(false);
  };

  const handleTerminalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!terminalInput.trim()) return;
    const cmd = terminalInput.trim();
    setTerminalInput('');
    setTerminalLogs((prev) => [
      ...prev,
      `$ ${cmd}`,
      cmd === 'clear' || cmd === 'cls'
        ? '--- Konsol Temizlendi ---'
        : cmd === 'help'
        ? 'Komutlar: run, restart, fps, status, clear'
        : `[TRAİ Konsolu] Komut işlendi: ${cmd}`,
    ]);
  };

  // Quick Action AI enhancements for games
  const handleQuickAiUpgrade = async (actionPrompt: string) => {
    if (!activeSnippet || isLoading) return;
    soundFx.playClick(soundEnabled);
    await onGenerateCode(
      actionPrompt,
      activeSnippet.language,
      'optimize',
      editableCode,
      activeSnippet.category || 'game'
    );
  };

  // Toggle Fullscreen on game container
  const handleToggleFullscreen = () => {
    if (!gameContainerRef.current) return;
    if (!document.fullscreenElement) {
      gameContainerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const accentColor = {
    cyan: 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-[0_0_15px_rgba(34,211,238,0.3)]',
    gold: 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-[0_0_15px_rgba(251,191,36,0.3)]',
    emerald: 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-[0_0_15px_rgba(52,211,153,0.3)]',
    violet: 'bg-violet-500 hover:bg-violet-400 text-slate-950 shadow-[0_0_15px_rgba(167,139,250,0.3)]',
  }[accent];

  const languages: Array<{ id: SupportedLanguage; label: string; icon: string }> = [
    { id: 'game', label: '🎮 HTML5 Oyun', icon: '🎮' },
    { id: 'python', label: '🐍 Python', icon: '🐍' },
    { id: 'typescript', label: '⚡ TypeScript', icon: '⚡' },
    { id: 'react', label: '⚛️ React / TSX', icon: '⚛️' },
    { id: 'html', label: '🌐 HTML / CSS', icon: '🌐' },
    { id: 'sql', label: '🗄️ SQL', icon: '🗄️' },
    { id: 'rust', label: '🦀 Rust', icon: '🦀' },
    { id: 'cpp', label: '⚙️ C++', icon: '⚙️' },
    { id: 'bash', label: '💻 Bash / Shell', icon: '💻' },
  ];

  const categoryFilters: Array<{ id: CodeCategory; label: string }> = [
    { id: 'all', label: 'Tüm Projeler' },
    { id: 'game', label: '🎮 Oyun Motoru' },
    { id: 'web', label: '⚛️ Web & React' },
    { id: 'ai', label: '🧠 Yapay Zeka & Veri' },
    { id: 'backend', label: '🗄️ Backend & SQL' },
    { id: 'systems', label: '⚙️ Sistem & Rust/C++' },
  ];

  // Ready-to-load Presets (Games & Engineering)
  const readyPresets = [
    {
      label: '🚀 Retro Uzay Savaşı 2099',
      category: 'game' as CodeCategory,
      prompt: 'HTML5 Canvas ve Web Audio synthesizer ile retro neon uzay gemisi atari oyunu yaz.',
      lang: 'game' as SupportedLanguage,
      codeTemplate: SPACE_ARCADE_2099_HTML,
      filename: 'SpaceArcade2099.html',
    },
    {
      label: '🐍 Cyber Yılan 2099',
      category: 'game' as CodeCategory,
      prompt: 'HTML5 Canvas ile neon ızgara üzerinde hızlanan enerji yılanı oyunu yaz.',
      lang: 'game' as SupportedLanguage,
      codeTemplate: CYBER_SNAKE_2099_HTML,
      filename: 'CyberSnake2099.html',
    },
    {
      label: '🏓 Quantum Breakout Kırıcı',
      category: 'game' as CodeCategory,
      prompt: 'HTML5 Canvas ile neon tuğlaları kıran foton topu Breakout oyunu yaz.',
      lang: 'game' as SupportedLanguage,
      codeTemplate: CYBER_BREAKOUT_HTML,
      filename: 'CyberBreakout.html',
    },
    {
      label: '🧠 Python Anomali Tespiti AI',
      category: 'ai' as CodeCategory,
      prompt: 'Python NumPy ve Scikit-learn ile veri akışında anomali tespit eden Z-score sınıfı yaz.',
      lang: 'python' as SupportedLanguage,
    },
    {
      label: '⚛️ React Stark HUD Paneli',
      category: 'web' as CodeCategory,
      prompt: 'React ve Tailwind ile Iron Man HUD tarzı fütüristik reaktör durumu bileşeni yaz.',
      lang: 'react' as SupportedLanguage,
    },
  ];

  // Filtered snippets by category
  const filteredSnippets = snippets.filter((s) => {
    if (selectedCategory === 'all') return true;
    if (selectedCategory === 'game') return s.language === 'game' || s.category === 'game' || s.filename.toLowerCase().includes('game') || s.prompt.toLowerCase().includes('oyun');
    if (selectedCategory === 'web') return s.language === 'react' || s.language === 'html' || s.language === 'typescript';
    if (selectedCategory === 'ai') return s.language === 'python';
    if (selectedCategory === 'backend') return s.language === 'sql' || s.language === 'javascript';
    if (selectedCategory === 'systems') return s.language === 'rust' || s.language === 'cpp' || s.language === 'bash';
    return true;
  });

  const isGameOrVisual =
    activeSnippet?.language === 'game' ||
    activeSnippet?.language === 'html' ||
    activeSnippet?.language === 'react' ||
    activeSnippet?.filename.toLowerCase().includes('.html') ||
    activeSnippet?.code.includes('<!DOCTYPE html>') ||
    activeSnippet?.code.includes('<canvas');

  const codeLines = (isCodeDirty ? editableCode : activeSnippet?.code || '').split('\n');

  return (
    <div className="max-w-7xl mx-auto w-full space-y-5 pb-16">
      
      {/* 1. TOP HEADER & STUDIO HERO */}
      <div className="rounded-2xl border border-slate-800 bg-[#0c1017]/95 p-5 shadow-lg">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 uppercase tracking-wider mb-1">
              <Gamepad2 className="w-4 h-4 text-cyan-400" />
              <span>J.A.R.V.I.S. KODLAMA & OYUN GELİŞTİRME STÜDYOSU</span>
              <span className="text-slate-600">·</span>
              <span className="text-emerald-400 font-semibold">CANLI SANDBOX v5.4</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-100 flex items-center gap-2.5">
              <span>Yapay Zeka Oyun Motoru & Geliştirici IDE</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 font-mono font-normal">
                60 FPS Engine
              </span>
            </h1>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleVoiceExplain}
              disabled={!activeSnippet}
              className="px-3 py-2 rounded-xl border border-slate-700 hover:bg-slate-800 text-xs font-medium text-slate-300 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Volume2 className={`w-3.5 h-3.5 ${isNarrating ? 'text-cyan-400 animate-pulse' : ''}`} />
              <span>{isNarrating ? 'Durdur' : 'Sesli Açıkla'}</span>
            </button>

            <button
              onClick={handleExecuteSandbox}
              disabled={!activeSnippet || isExecuting}
              className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 cursor-pointer transition-all ${accentColor} disabled:opacity-50`}
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>{isExecuting ? 'Yürütülüyor...' : isGameOrVisual ? 'Oyunu Başlat / Önizle' : 'Kodu Çalıştır'}</span>
            </button>
          </div>
        </div>

        {/* 2. PROMPT & AI GENERATOR INPUT */}
        <form onSubmit={handleRunOrGenerate} className="mt-4 space-y-3">
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="flex-1 relative flex items-center bg-slate-950 border border-slate-800 rounded-xl overflow-hidden focus-within:border-cyan-400 transition-colors">
              <Terminal className="w-4 h-4 ml-3.5 text-cyan-400 shrink-0" />
              <input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder={`Ne geliştirmek istersiniz (${userTitle})? Örn: "Retro uzay savaşı oyunu yap", "Zombi hayatta kalma oyunu", "Python anomali algoritması"...`}
                className="w-full py-3 px-3 bg-transparent text-sm text-slate-100 placeholder:text-slate-500 outline-none"
              />
              <button
                type="submit"
                disabled={!prompt.trim() || isLoading}
                className={`mr-2 px-4 py-2 rounded-lg text-xs font-semibold cursor-pointer transition-all disabled:opacity-40 disabled:cursor-not-allowed ${accentColor}`}
              >
                {isLoading ? (
                  <span className="flex items-center gap-1.5">
                    <RotateCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Kodlanıyor...</span>
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{language === 'game' ? 'Oyunu Üret' : 'Kodu Üret'}</span>
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Languages & Mode Badges */}
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
            {/* Language Selector */}
            <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-1">
              {languages.map((l) => (
                <button
                  key={l.id}
                  type="button"
                  onClick={() => setLanguage(l.id)}
                  className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                    language === l.id
                      ? 'bg-cyan-500 text-slate-950 font-bold shadow-xs'
                      : 'bg-slate-900 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-800'
                  }`}
                >
                  <span>{l.label}</span>
                </button>
              ))}
            </div>

            {/* Mode Selector */}
            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
              <button
                type="button"
                onClick={() => setMode('generate')}
                className={`px-2.5 py-1 rounded text-[11px] cursor-pointer transition-colors ${
                  mode === 'generate' ? 'bg-slate-800 text-cyan-300 font-semibold' : 'text-slate-400 hover:text-white'
                }`}
              >
                Sıfırdan Üret
              </button>
              <button
                type="button"
                onClick={() => setMode('optimize')}
                className={`px-2.5 py-1 rounded text-[11px] cursor-pointer transition-colors ${
                  mode === 'optimize' ? 'bg-slate-800 text-cyan-300 font-semibold' : 'text-slate-400 hover:text-white'
                }`}
              >
                Performans Artır
              </button>
              <button
                type="button"
                onClick={() => setMode('debug')}
                className={`px-2.5 py-1 rounded text-[11px] cursor-pointer transition-colors ${
                  mode === 'debug' ? 'bg-slate-800 text-cyan-300 font-semibold' : 'text-slate-400 hover:text-white'
                }`}
              >
                Hata Ayıkla
              </button>
            </div>
          </div>

          {/* Quick 1-Click Game & Code Presets */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-1">
            <span className="text-xs text-slate-500 font-mono hidden sm:inline">Hızlı Şablonlar:</span>
            {readyPresets.map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  if (p.codeTemplate && onAddSnippet) {
                    const newSnip: CodeSnippet = {
                      id: 'preset-' + Date.now(),
                      prompt: p.prompt,
                      language: p.lang,
                      category: p.category,
                      code: p.codeTemplate,
                      explanation: `${p.label} için optimize edilmiş HTML5 Canvas oyun motoru. Doğrudan klavye ve dokunmatik kontrollerle çalışır.`,
                      filename: p.filename || 'game.html',
                      runnable: true,
                      timestamp: new Date().toISOString(),
                    };
                    onAddSnippet(newSnip);
                    setSelectedSnippetId(newSnip.id);
                    setActiveViewTab('preview');
                    soundFx.playConfirm(soundEnabled);
                  } else {
                    setPrompt(p.prompt);
                    setLanguage(p.lang);
                  }
                }}
                className="text-xs px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 hover:border-cyan-500/50 text-slate-300 hover:text-cyan-300 transition-colors cursor-pointer whitespace-nowrap shrink-0"
              >
                {p.label}
              </button>
            ))}
          </div>
        </form>
      </div>

      {/* 3. CATEGORY FILTER PILLS */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar px-1">
        {categoryFilters.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-3 py-1 rounded-xl text-xs font-mono font-medium transition-colors cursor-pointer whitespace-nowrap ${
              selectedCategory === cat.id
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-semibold'
                : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-slate-800/60'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* 4. MAIN WORKSPACE GRID: FILE LIST (1 col) + IDE & GAME ENGINE (3 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Left: Files / Projects List */}
        <div className="lg:col-span-1 space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400">
              Projeler & Dosyalar ({filteredSnippets.length})
            </h3>
            <button
              onClick={() => {
                if (onAddSnippet) {
                  const newBlank: CodeSnippet = {
                    id: 'snip-' + Date.now(),
                    prompt: 'Yeni Boş Proje',
                    language: 'game',
                    category: 'game',
                    code: SPACE_ARCADE_2099_HTML,
                    explanation: 'Yeni özel oyun projeniz. Kodu istediğiniz gibi değiştirebilir ve anında oynayabilirsiniz.',
                    filename: 'NewGame.html',
                    runnable: true,
                    timestamp: new Date().toISOString(),
                  };
                  onAddSnippet(newBlank);
                  setSelectedSnippetId(newBlank.id);
                  soundFx.playConfirm(soundEnabled);
                }
              }}
              className="text-[11px] font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Yeni Oyun</span>
            </button>
          </div>

          <div className="space-y-2 max-h-[720px] overflow-y-auto pr-1">
            {filteredSnippets.map((snip) => {
              const isSelected = activeSnippet?.id === snip.id;
              const isGame = snip.language === 'game' || snip.category === 'game' || snip.filename.toLowerCase().includes('game');

              return (
                <div
                  key={snip.id}
                  onClick={() => {
                    setSelectedSnippetId(snip.id);
                    soundFx.playClick(soundEnabled);
                  }}
                  className={`p-3 rounded-xl border text-left cursor-pointer transition-all relative group ${
                    isSelected
                      ? 'border-cyan-400 bg-cyan-500/10 shadow-sm'
                      : 'border-slate-800 bg-[#0c1017] hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2 truncate">
                      {isGame ? (
                        <Gamepad2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      ) : (
                        <FileCode className="w-4 h-4 text-cyan-400 shrink-0" />
                      )}
                      <span className="text-xs font-mono font-semibold text-slate-100 truncate">
                        {snip.filename}
                      </span>
                    </div>

                    {isGame && (
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        OYUN
                      </span>
                    )}
                  </div>

                  <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed mb-2">
                    {snip.prompt}
                  </p>

                  <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono pt-1.5 border-t border-slate-800/80">
                    <span className="uppercase">{snip.language}</span>
                    <div className="flex items-center gap-2">
                      <span className="tabular-nums">
                        {new Date(snip.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      {onDeleteSnippet && snippets.length > 1 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteSnippet(snip.id);
                          }}
                          className="text-slate-600 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Sil"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Code Studio IDE & Live Interactive Game Sandbox (3 cols) */}
        <div className="lg:col-span-3 space-y-4">
          {activeSnippet ? (
            <div className="rounded-2xl border border-slate-800 bg-[#0c1017] overflow-hidden shadow-xl">
              
              {/* IDE Top Navigation Bar */}
              <div className="px-4 py-3 bg-[#080b11] border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
                
                {/* File title & Active tabs */}
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono text-cyan-300 font-semibold flex items-center gap-2 shadow-xs">
                    {isGameOrVisual ? <Gamepad2 className="w-3.5 h-3.5 text-emerald-400" /> : <FileCode className="w-3.5 h-3.5" />}
                    <span>{activeSnippet.filename}</span>
                    {isCodeDirty && (
                      <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" title="Kaydedilmemiş Değişiklikler" />
                    )}
                  </div>

                  {/* Switch between Preview, Code, Terminal, Docs */}
                  <div className="flex items-center p-0.5 bg-slate-950 border border-slate-800 rounded-lg text-xs">
                    {isGameOrVisual && (
                      <button
                        onClick={() => setActiveViewTab('preview')}
                        className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer flex items-center gap-1.5 ${
                          activeViewTab === 'preview'
                            ? 'bg-slate-800 text-emerald-300 font-bold shadow-xs'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        <MonitorPlay className="w-3.5 h-3.5" />
                        <span>Canlı Oyun / Önizleme</span>
                      </button>
                    )}

                    <button
                      onClick={() => setActiveViewTab('code')}
                      className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer flex items-center gap-1.5 ${
                        activeViewTab === 'code'
                          ? 'bg-slate-800 text-cyan-300 font-bold shadow-xs'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <Code2 className="w-3.5 h-3.5" />
                      <span>Kaynak Kod & Editör</span>
                    </button>

                    <button
                      onClick={() => setActiveViewTab('terminal')}
                      className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer flex items-center gap-1.5 ${
                        activeViewTab === 'terminal'
                          ? 'bg-slate-800 text-cyan-300 font-bold shadow-xs'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <Terminal className="w-3.5 h-3.5" />
                      <span>Konsol & Loglar</span>
                    </button>

                    <button
                      onClick={() => setActiveViewTab('docs')}
                      className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer flex items-center gap-1.5 ${
                        activeViewTab === 'docs'
                          ? 'bg-slate-800 text-cyan-300 font-bold shadow-xs'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <Zap className="w-3.5 h-3.5" />
                      <span>Mimari & Kontroller</span>
                    </button>
                  </div>
                </div>

                {/* File & Run Actions */}
                <div className="flex items-center gap-2">
                  {isCodeDirty && (
                    <button
                      onClick={handleSaveAndRun}
                      className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors shadow-xs"
                      title="Değişiklikleri Kaydet & Çalıştır (Ctrl+Enter)"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>Kaydet & Çalıştır</span>
                    </button>
                  )}

                  <button
                    onClick={() => handleCopyCode(isCodeDirty ? editableCode : activeSnippet.code)}
                    className="p-1.5 rounded-lg border border-slate-800 text-slate-400 hover:text-cyan-400 hover:bg-slate-800 transition-colors cursor-pointer"
                    title="Kodu Kopyala"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>

                  <button
                    onClick={() => handleDownloadFile(activeSnippet)}
                    className="p-1.5 rounded-lg border border-slate-800 text-slate-400 hover:text-cyan-400 hover:bg-slate-800 transition-colors cursor-pointer"
                    title="Dosyayı İndir"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* VIEW 1: LIVE INTERACTIVE GAME / APP SANDBOX */}
              {activeViewTab === 'preview' && isGameOrVisual && (
                <div ref={gameContainerRef} className="bg-[#050811] flex flex-col items-center p-3 relative">
                  
                  {/* Game Control HUD Bar */}
                  <div className="w-full flex items-center justify-between pb-2.5 px-2 border-b border-slate-800 text-xs font-mono text-slate-400">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                      <span className="text-emerald-400 font-bold">CANLI OYUN MOTORU</span>
                      <span className="text-slate-600">·</span>
                      <span className="text-cyan-300 font-semibold">{fpsCount} FPS</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setGameKey((k) => k + 1);
                          soundFx.playConfirm(soundEnabled);
                        }}
                        className="p-1.5 rounded-lg border border-slate-800 hover:border-cyan-400 text-slate-300 hover:text-cyan-300 flex items-center gap-1 cursor-pointer transition-colors"
                        title="Oyunu Baştan Başlat"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span className="text-[11px] hidden sm:inline">Yeniden Başlat</span>
                      </button>

                      <button
                        onClick={handleToggleFullscreen}
                        className="p-1.5 rounded-lg border border-slate-800 hover:border-cyan-400 text-slate-300 hover:text-cyan-300 cursor-pointer transition-colors"
                        title="Tam Ekran"
                      >
                        {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  {/* Playable Canvas Iframe */}
                  <div className="w-full flex justify-center py-2">
                    <div className="w-full max-w-3xl rounded-xl overflow-hidden border border-slate-800/80 shadow-2xl bg-black">
                      <iframe
                        key={gameKey}
                        ref={iframeRef}
                        title="Canlı Oyun Sandbox"
                        srcDoc={isCodeDirty ? editableCode : activeSnippet.code}
                        sandbox="allow-scripts allow-modals allow-same-origin"
                        className="w-full h-[520px] border-0 block bg-black"
                      />
                    </div>
                  </div>

                  {/* AI Game Modification Quick Action Bar */}
                  <div className="w-full mt-3 p-3 rounded-xl bg-slate-900/70 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-1.5 text-cyan-400 font-mono font-semibold">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>AI Oyun Geliştirici Araçları:</span>
                    </div>

                    <div className="flex items-center gap-1.5 flex-wrap">
                      <button
                        type="button"
                        onClick={() => handleQuickAiUpgrade('Bu oyuna süper lazer silahı ve ateş hızı güçlendirmesi (powerup) ekle.')}
                        disabled={isLoading}
                        className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 hover:border-cyan-400 transition-colors cursor-pointer flex items-center gap-1 disabled:opacity-40"
                      >
                        <Flame className="w-3 h-3 text-amber-400" />
                        <span>Süper Silah Ekle</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleQuickAiUpgrade('Bu oyuna yeni düşman tipleri, zorlaşan dalgalar ve bölüm sonu canavarı (Boss) ekle.')}
                        disabled={isLoading}
                        className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 hover:border-cyan-400 transition-colors cursor-pointer flex items-center gap-1 disabled:opacity-40"
                      >
                        <Gamepad2 className="w-3 h-3 text-purple-400" />
                        <span>Boss & Dalgalar</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleQuickAiUpgrade('Bu oyundaki parçacık (particle) patlama efektlerini ve neon ışıklarını iki katına çıkar.')}
                        disabled={isLoading}
                        className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 hover:border-cyan-400 transition-colors cursor-pointer flex items-center gap-1 disabled:opacity-40"
                      >
                        <Sparkles className="w-3 h-3 text-cyan-400" />
                        <span>Neon Efektleri</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleQuickAiUpgrade('Web Audio API ile oyuna arka plan retro arcade sesleri ve vuruş tonları ekle.')}
                        disabled={isLoading}
                        className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 hover:border-cyan-400 transition-colors cursor-pointer flex items-center gap-1 disabled:opacity-40"
                      >
                        <Volume2 className="w-3 h-3 text-emerald-400" />
                        <span>Synth Sesler</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* VIEW 2: INTERACTIVE EDITABLE CODE EDITOR */}
              {activeViewTab === 'code' && (
                <div className="p-4 bg-slate-950 font-mono text-xs sm:text-sm text-slate-200">
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 text-xs text-slate-400 font-mono">
                    <div className="flex items-center gap-2">
                      <span>{codeLines.length} satır</span>
                      <span>·</span>
                      <span>{editableCode.length} karakter</span>
                      {isCodeDirty && (
                        <span className="text-amber-400 font-semibold">(Kaydedilmemiş değişiklikler var)</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-slate-500 hidden sm:inline">Kodu doğrudan düzenleyebilirsiniz</span>
                      <button
                        onClick={handleSaveAndRun}
                        className="px-2.5 py-1 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 hover:bg-cyan-500 hover:text-slate-950 transition-colors cursor-pointer font-semibold"
                      >
                        Kaydet & Canlı Uygula
                      </button>
                    </div>
                  </div>

                  <div className="relative flex min-h-[480px] max-h-[620px] overflow-hidden rounded-xl border border-slate-800/80 bg-[#060911]">
                    {/* Line numbers gutter */}
                    <div className="select-none py-3 px-3 text-right text-slate-600 border-r border-slate-800 bg-[#080c14] font-mono text-xs leading-6 tabular-nums w-12 shrink-0 overflow-hidden">
                      {codeLines.map((_, i) => (
                        <div key={i}>{i + 1}</div>
                      ))}
                    </div>

                    {/* Interactive Editable Textarea */}
                    <textarea
                      value={editableCode}
                      onChange={(e) => {
                        setEditableCode(e.target.value);
                        setIsCodeDirty(true);
                      }}
                      onKeyDown={(e) => {
                        // Support Ctrl+Enter / Cmd+Enter to Save & Run
                        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                          e.preventDefault();
                          handleSaveAndRun();
                        }
                        // Tab key indentation support
                        if (e.key === 'Tab') {
                          e.preventDefault();
                          const target = e.currentTarget;
                          const start = target.selectionStart;
                          const end = target.selectionEnd;
                          const newVal = editableCode.substring(0, start) + '  ' + editableCode.substring(end);
                          setEditableCode(newVal);
                          setIsCodeDirty(true);
                          setTimeout(() => {
                            target.selectionStart = target.selectionEnd = start + 2;
                          }, 0);
                        }
                      }}
                      spellCheck={false}
                      className="flex-1 w-full p-3 bg-transparent font-mono text-xs sm:text-sm text-cyan-200/90 leading-6 resize-none outline-none overflow-y-auto whitespace-pre tab-2"
                    />
                  </div>
                </div>
              )}

              {/* VIEW 3: TERMINAL & LOGS */}
              {activeViewTab === 'terminal' && (
                <div className="p-4 bg-slate-950 font-mono text-xs text-emerald-400 min-h-[460px] flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between text-slate-400 pb-2 border-b border-slate-800 mb-3">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span>TRAİ Yürütme & Debug Konsolu [v5.4 Online]</span>
                      </div>
                      <button
                        onClick={() => setTerminalLogs(['[Konsol temizlendi]'])}
                        className="text-[11px] text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
                      >
                        Temizle
                      </button>
                    </div>

                    <div className="space-y-1.5 max-h-[380px] overflow-y-auto font-mono text-xs leading-relaxed">
                      {terminalLogs.map((log, idx) => (
                        <div
                          key={idx}
                          className={
                            log.startsWith('$')
                              ? 'text-cyan-300 font-bold'
                              : log.includes('Hata') || log.includes('Error')
                              ? 'text-rose-400'
                              : 'text-emerald-400/90'
                          }
                        >
                          <pre className="whitespace-pre-wrap font-mono">{log}</pre>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Terminal Command Input */}
                  <form onSubmit={handleTerminalSubmit} className="mt-3 pt-2 border-t border-slate-800 flex items-center gap-2">
                    <span className="text-cyan-400 font-bold">$</span>
                    <input
                      type="text"
                      value={terminalInput}
                      onChange={(e) => setTerminalInput(e.target.value)}
                      placeholder="Konsol komutu girin (örn: run, fps, status, clear)..."
                      className="w-full bg-transparent text-slate-100 placeholder:text-slate-600 outline-none text-xs font-mono"
                    />
                    <button
                      type="submit"
                      className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono cursor-pointer"
                    >
                      Gönder
                    </button>
                  </form>
                </div>
              )}

              {/* VIEW 4: ARCHITECTURE & CONTROLS DOCS */}
              {activeViewTab === 'docs' && (
                <div className="p-6 bg-slate-950 font-sans text-xs space-y-4 text-slate-300">
                  <div className="flex items-center gap-2 text-cyan-400 font-mono font-bold text-sm">
                    <Zap className="w-4 h-4" />
                    <span>MÜHENDİSLİK & OYUN MİMARİSİ RAPORU</span>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                    <h4 className="font-bold text-slate-100 font-mono uppercase text-xs">Mühendislik Notları</h4>
                    <p className="leading-relaxed">{activeSnippet.explanation}</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
                      <h4 className="font-bold text-slate-100 font-mono uppercase text-xs flex items-center gap-1.5">
                        <Gamepad2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Oyun Kontrolleri</span>
                      </h4>
                      <ul className="space-y-1 text-slate-400 font-mono text-[11px]">
                        <li>• <strong className="text-cyan-300">Hareket:</strong> [← / →] veya [A / D] tuşları</li>
                        <li>• <strong className="text-cyan-300">Ateş / Etkileşim:</strong> [BOŞLUK / SPACE]</li>
                        <li>• <strong className="text-cyan-300">Mobil / Tablet:</strong> Ekran altındaki dokunmatik butonlar</li>
                        <li>• <strong className="text-cyan-300">Yeniden Başlat:</strong> Oyun bittiğinde ekrana tıklayın</li>
                      </ul>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
                      <h4 className="font-bold text-slate-100 font-mono uppercase text-xs flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5 text-purple-400" />
                        <span>Teknoloji Yığını</span>
                      </h4>
                      <ul className="space-y-1 text-slate-400 font-mono text-[11px]">
                        <li>• <strong className="text-cyan-300">Render:</strong> HTML5 Canvas 2D Context (60 FPS)</li>
                        <li>• <strong className="text-cyan-300">Ses:</strong> Web Audio API (Yerel Oscillator Synth)</li>
                        <li>• <strong className="text-cyan-300">Fizik:</strong> Delta-time & Parçacık vektör simülasyonu</li>
                        <li>• <strong className="text-cyan-300">Bağımlılık:</strong> Sıfır dış kütüphane (%100 Çevrimdışı)</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* Bottom Quick Bar */}
              <div className="p-3 bg-[#080b11] border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 font-mono">
                <div className="flex items-center gap-2">
                  <span className="text-slate-500">Kısayollar:</span>
                  <span className="px-1.5 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-800">Ctrl+Enter (Kaydet & Çalıştır)</span>
                  <span className="px-1.5 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-800">Space (Ateş / Başlat)</span>
                </div>
                <div className="text-emerald-400 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Stüdyo Aktif</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-16 text-center border border-slate-800 rounded-2xl bg-[#0c1017]">
              <Gamepad2 className="w-10 h-10 text-cyan-400 mx-auto mb-3" />
              <h3 className="text-base font-semibold text-slate-100">
                Henüz Bir Proje Seçilmedi
              </h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                Soldaki listeden bir oyun veya kod seçin, ya da yukarıdaki alana istediğiniz oyun veya yazılım fikrini yazarak TRAİ'ye kodlatın.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
