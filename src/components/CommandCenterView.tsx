import React, { useState } from 'react';
import {
  Cpu,
  Activity,
  CheckCircle2,
  Clock,
  Sparkles,
  Calendar,
  Code2,
  Search,
  Image,
  ShieldCheck,
  Zap,
  Radio,
  ArrowRight,
  Database,
  Layers,
  ChevronRight,
  Send,
  Mic,
  Copy,
  Check,
  Play,
  FileCode,
  Terminal,
} from 'lucide-react';
import { HolographicGlobe } from './HolographicGlobe';
import { Task, DailyPlan, AccentTheme, SupportedLanguage } from '../types';
import { ActiveTab } from './Header';
import { soundFx } from '../services/soundFx';
import { AgentModal } from './AgentModal';

interface CommandCenterViewProps {
  accent: AccentTheme;
  userTitle: string;
  tasks: Task[];
  dailyPlan: DailyPlan | null;
  onNavigateTab: (tab: ActiveTab) => void;
  onToggleVoice: () => void;
  isVoiceActive: boolean;
  onPlayBriefing: () => void;
  onQuickCommand?: (command: string) => Promise<string | void>;
  onSendToCodeStudio?: (code: string, language: SupportedLanguage, filename: string) => void;
  soundEnabled?: boolean;
  ttsVoice?: 'Fenrir' | 'Kore' | 'Zephyr' | 'Puck';
  speechRate?: number;
  isDarkMode?: boolean;
}

export const CommandCenterView: React.FC<CommandCenterViewProps> = ({
  accent,
  userTitle,
  tasks,
  dailyPlan,
  onNavigateTab,
  onToggleVoice,
  isVoiceActive,
  onPlayBriefing,
  onQuickCommand,
  onSendToCodeStudio,
  soundEnabled = true,
  ttsVoice = 'Fenrir',
  speechRate = 1.0,
  isDarkMode = false,
}) => {
  const [quickInput, setQuickInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [liveResponse, setLiveResponse] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isAgentModalOpen, setIsAgentModalOpen] = useState(false);
  const [agentModalCommand, setAgentModalCommand] = useState('');

  const completedTasks = tasks.filter((t) => t.completed).length;

  const handleCommandSubmit = (e?: React.FormEvent, customCmd?: string) => {
    if (e) e.preventDefault();
    const cmd = (customCmd || quickInput).trim();
    if (!cmd) return;

    setQuickInput('');
    setAgentModalCommand(cmd);
    setIsAgentModalOpen(true);
    soundFx.playClick(soundEnabled);
  };

  const handleCopyResponse = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 pb-24 max-w-[1500px] mx-auto w-full">
      
      {/* 1. TOP HERO SECTION: AI Core Overview + Holographic Globe + Live Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        
        {/* Left: AI Core Overview (3 cols) */}
        <div className={`lg:col-span-3 rounded-2xl p-5 flex flex-col justify-between border transition-colors ${
          isDarkMode
            ? 'bg-[#0c1017]/95 border-slate-800/80 shadow-lg text-slate-100'
            : 'bg-white border-slate-200/90 shadow-xs text-slate-900'
        }`}>
          <div className={`flex items-center justify-between border-b pb-3 ${
            isDarkMode ? 'border-slate-800/80 text-slate-300' : 'border-slate-200 text-slate-800 font-bold'
          }`}>
            <span className="text-xs font-semibold tracking-wider uppercase">
              TRAİ Sistem Durumu
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
          </div>

          <div className="space-y-2.5 py-4 text-xs font-sans">
            {/* The Target Element: AI Core Row - Fully interactive and clickable */}
            <div
              onClick={() => onNavigateTab('chat')}
              role="button"
              tabIndex={0}
              className={`flex items-center justify-between p-2.5 rounded-xl border transition-all cursor-pointer group active:scale-[0.98] ${
                isDarkMode
                  ? 'bg-slate-900/80 border-slate-800 hover:border-slate-700 hover:bg-slate-800/60 text-slate-200 group-hover:text-white'
                  : 'bg-slate-50 border-slate-200 hover:border-cyan-300 hover:bg-cyan-50/50 text-slate-800 shadow-2xs'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Cpu className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                <span className="font-semibold">TRAİ Asistan & Sohbet</span>
              </div>
              <span className={`text-[11px] px-2 py-0.5 rounded-md flex items-center gap-1 font-medium transition-colors ${
                isDarkMode
                  ? 'text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 group-hover:bg-cyan-500 group-hover:text-slate-950'
                  : 'text-cyan-700 bg-cyan-100 border border-cyan-200 group-hover:bg-cyan-600 group-hover:text-white'
              }`}>
                <span>Başlat &gt;</span>
              </span>
            </div>

            {/* Memory / Sync Row */}
            <div
              onClick={() => onNavigateTab('vault')}
              role="button"
              tabIndex={0}
              className={`flex items-center justify-between p-2.5 rounded-xl border transition-all cursor-pointer group ${
                isDarkMode
                  ? 'bg-slate-900/50 border-slate-800/80 hover:border-slate-700 text-slate-300'
                  : 'bg-slate-50/70 border-slate-200 hover:border-slate-300 text-slate-700'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Database className="w-4 h-4 text-sky-500" />
                <span>Bulut Senkronizasyonu</span>
              </div>
              <span className="font-mono text-[11px] text-slate-500">Aktif & Senkron</span>
            </div>

            {/* Voice Pipeline Row */}
            <div
              onClick={onToggleVoice}
              role="button"
              tabIndex={0}
              className={`flex items-center justify-between p-2.5 rounded-xl border transition-all cursor-pointer group ${
                isDarkMode
                  ? 'bg-slate-900/50 border-slate-800/80 hover:border-slate-700 text-slate-300'
                  : 'bg-slate-50/70 border-slate-200 hover:border-slate-300 text-slate-700'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Radio className="w-4 h-4 text-emerald-500" />
                <span>Ses Hattı</span>
              </div>
              <span className="font-medium text-[11px] flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                <span className={`w-1.5 h-1.5 rounded-full ${isVoiceActive ? 'bg-rose-500 animate-ping' : 'bg-emerald-500'}`} />
                {isVoiceActive ? 'Dinliyor' : 'Çevrimiçi'}
              </span>
            </div>

            {/* Active Agents Row */}
            <div
              onClick={() => onNavigateTab('code')}
              role="button"
              tabIndex={0}
              className={`flex items-center justify-between p-2.5 rounded-xl border transition-all cursor-pointer group ${
                isDarkMode
                  ? 'bg-slate-900/50 border-slate-800/80 hover:border-slate-700 text-slate-300'
                  : 'bg-slate-50/70 border-slate-200 hover:border-slate-300 text-slate-700'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Layers className="w-4 h-4 text-violet-500" />
                <span>Kod Stüdyosu Motoru</span>
              </div>
              <span className="font-mono text-[11px] text-slate-500">Hazır</span>
            </div>

            {/* LLM Engine Row */}
            <div
              onClick={() => onNavigateTab('code')}
              role="button"
              tabIndex={0}
              className={`flex items-center justify-between p-2.5 rounded-xl border transition-all cursor-pointer group ${
                isDarkMode
                  ? 'bg-slate-900/50 border-slate-800/80 hover:border-slate-700 text-slate-300'
                  : 'bg-slate-50/70 border-slate-200 hover:border-slate-300 text-slate-700'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>Yapay Zeka Modeli</span>
              </div>
              <span className="font-medium text-[11px] text-amber-600 dark:text-amber-400">Gemini 3.8</span>
            </div>

            {/* Security Row */}
            <div
              onClick={() => onNavigateTab('vault')}
              role="button"
              tabIndex={0}
              className={`flex items-center justify-between p-2.5 rounded-xl border transition-all cursor-pointer group ${
                isDarkMode
                  ? 'bg-slate-900/50 border-slate-800/80 hover:border-slate-700 text-slate-300'
                  : 'bg-slate-50/70 border-slate-200 hover:border-slate-300 text-slate-700'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>Güvenlik</span>
              </div>
              <span className="font-medium text-[11px] text-emerald-600 dark:text-emerald-400">Tam Korumalı</span>
            </div>
          </div>

          <button
            onClick={() => onNavigateTab('chat')}
            className={`w-full py-2.5 text-xs font-semibold rounded-xl border flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs ${
              isDarkMode
                ? 'border-slate-800 bg-slate-900/80 hover:bg-slate-800 text-slate-200'
                : 'border-slate-200 bg-slate-100 hover:bg-slate-200 text-slate-800'
            }`}
          >
            <span>TRAİ ile Sohbet Başlat</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Center: Holographic Celestial Globe + Live Interactive Command Console (6 cols) */}
        <div className={`lg:col-span-6 rounded-2xl p-5 flex flex-col items-center justify-between relative overflow-hidden border transition-colors ${
          isDarkMode
            ? 'bg-[#0c1017]/95 border-slate-800/80 shadow-lg'
            : 'bg-white border-slate-200/90 shadow-xs'
        }`}>
          {/* Holographic 3D Globe */}
          <HolographicGlobe
            accent={accent}
            isListening={isVoiceActive}
            isSpeaking={false}
            onClick={onToggleVoice}
            isDarkMode={isDarkMode}
          />

          {/* Interactive Live Command Input Bar directly in Command Center */}
          <div className="w-full mt-2 relative z-10 space-y-2">
            <form onSubmit={handleCommandSubmit} className={`relative flex items-center border rounded-xl overflow-hidden shadow-xs transition-colors ${
              isDarkMode
                ? 'bg-slate-950/80 border-slate-800 focus-within:border-cyan-500/70'
                : 'bg-slate-50 border-slate-200 focus-within:border-cyan-500 focus-within:bg-white'
            }`}>
              <Terminal className="w-4 h-4 ml-3.5 text-cyan-600 dark:text-cyan-400 shrink-0" />
              <input
                type="text"
                value={quickInput}
                onChange={(e) => setQuickInput(e.target.value)}
                placeholder={`TRAİ'ye bir şey sorun, matematik işlemi yazın veya oyun yaptırın (${userTitle})...`}
                className={`w-full py-3 px-3 bg-transparent text-sm outline-none ${
                  isDarkMode
                    ? 'text-slate-100 placeholder:text-slate-500'
                    : 'text-slate-900 placeholder:text-slate-400 font-medium'
                }`}
              />
              <div className="flex items-center gap-1 mr-2">
                <button
                  type="button"
                  onClick={onToggleVoice}
                  title="Sesli Konuş"
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    isDarkMode
                      ? 'text-slate-400 hover:text-cyan-400 hover:bg-slate-900'
                      : 'text-slate-500 hover:text-cyan-700 hover:bg-slate-200/70'
                  }`}
                >
                  <Mic className="w-4 h-4" />
                </button>
                <button
                  type="submit"
                  disabled={!quickInput.trim() || isProcessing}
                  className="px-3.5 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-40 shadow-xs"
                >
                  {isProcessing ? 'İşleniyor...' : 'Çalıştır'}
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>

            {/* Quick Prompt Presets */}
            <div className="flex items-center justify-center gap-2 overflow-x-auto no-scrollbar text-xs">
              {[
                '15 * 8 - 40 / 2 kaç eder?',
                'Retro uzay savaşı oyunu yap',
                'Python ile asal sayı fonksiyonu yaz',
                'Günün özetini çıkar',
                'React kartı kodla',
              ].map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    handleCommandSubmit(undefined, p);
                  }}
                  className={`px-2.5 py-1 rounded-lg border transition-colors cursor-pointer whitespace-nowrap text-[11px] ${
                    isDarkMode
                      ? 'bg-slate-900/80 border-cyan-500/20 hover:border-cyan-400 text-slate-300 hover:text-white'
                      : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700 hover:text-slate-900 shadow-2xs'
                  }`}
                >
                  "{p}"
                </button>
              ))}
            </div>

            {/* Live Response Box if available */}
            {liveResponse && (
              <div className={`p-3.5 rounded-xl border text-xs relative group max-h-48 overflow-y-auto ${
                isDarkMode
                  ? 'bg-slate-950 border-cyan-500/30 text-slate-200'
                  : 'bg-white border-cyan-400/80 text-slate-900 shadow-md'
              }`}>
                <div className="flex items-center justify-between font-mono text-[11px] mb-1 font-bold text-cyan-600 dark:text-cyan-400">
                  <span>TRAİ YANITI</span>
                  <div className="flex items-center gap-2 font-normal">
                    <button
                      onClick={() => handleCopyResponse(liveResponse)}
                      className="text-slate-500 hover:text-slate-800 dark:hover:text-white flex items-center gap-1 cursor-pointer"
                    >
                      {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                      <span>{copied ? 'Kopyalandı' : 'Kopyala'}</span>
                    </button>
                    <button
                      onClick={() => setLiveResponse(null)}
                      className="text-slate-400 hover:text-red-500 cursor-pointer ml-1"
                    >
                      Kapat
                    </button>
                  </div>
                </div>
                <div className="whitespace-pre-wrap leading-relaxed">{liveResponse}</div>
              </div>
            )}
          </div>
        </div>

        {/* Right: Live Intelligence Feed (3 cols) */}
        <div className={`lg:col-span-3 rounded-2xl p-5 flex flex-col justify-between border transition-colors ${
          isDarkMode
            ? 'bg-gradient-to-b from-[#081222]/90 to-[#040814]/90 border-cyan-500/25 shadow-[0_0_20px_rgba(6,182,212,0.08)]'
            : 'bg-white border-slate-200/90 shadow-xs'
        }`}>
          <div className={`flex items-center justify-between border-b pb-3 ${
            isDarkMode ? 'border-cyan-500/15' : 'border-slate-200'
          }`}>
            <span className={`text-xs font-mono font-bold tracking-widest uppercase ${
              isDarkMode ? 'text-cyan-400' : 'text-cyan-700'
            }`}>
              TRAİ CANLI AKIŞ
            </span>
            <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 rounded-full font-semibold">
              AKTİF
            </span>
          </div>

          <div className="space-y-2 py-3 overflow-y-auto max-h-[300px]">
            {/* Feed Item 1 */}
            <div
              onClick={() => onNavigateTab('organizer')}
              className="p-2.5 rounded-xl bg-slate-900/60 border border-cyan-500/15 hover:border-cyan-400/50 transition-colors cursor-pointer group"
            >
              <div className="flex items-center justify-between text-[11px] font-mono text-cyan-300 font-semibold mb-1">
                <span>Operasyonel Ajanda</span>
                <span className="text-[9px] bg-cyan-500/20 text-cyan-300 px-1.5 py-0.2 rounded">INFO</span>
              </div>
              <p className="text-xs text-slate-300 line-clamp-1">
                {dailyPlan?.focusRecommendation || 'Günlük iş planı hazırlandı.'}
              </p>
            </div>

            {/* Feed Item 2 */}
            <div
              onClick={() => onNavigateTab('code')}
              className="p-2.5 rounded-xl bg-slate-900/60 border border-cyan-500/15 hover:border-cyan-400/50 transition-colors cursor-pointer group"
            >
              <div className="flex items-center justify-between text-[11px] font-mono text-cyan-300 font-semibold mb-1">
                <span>Kod Stüdyosu Hazır</span>
                <span className="text-[9px] bg-sky-500/20 text-sky-300 px-1.5 py-0.2 rounded">DEV</span>
              </div>
              <p className="text-xs text-slate-300">
                Python, React, TypeScript ve SQL derleme ortamı aktif.
              </p>
            </div>

            {/* Feed Item 3 */}
            <div
              onClick={() => onNavigateTab('vault')}
              className="p-2.5 rounded-xl bg-slate-900/60 border border-cyan-500/15 hover:border-cyan-400/50 transition-colors cursor-pointer group"
            >
              <div className="flex items-center justify-between text-[11px] font-mono text-cyan-300 font-semibold mb-1">
                <span>Bulut Senkronizasyonu</span>
                <span className="text-[9px] bg-cyan-500/20 text-cyan-300 px-1.5 py-0.2 rounded">SYNC</span>
              </div>
              <p className="text-xs text-slate-300">
                Otomatik bulut senkronizasyonu aktif. Tüm cihazlar eşitlendi.
              </p>
            </div>

            {/* Feed Item 4 */}
            <div className="p-2.5 rounded-xl bg-slate-900/60 border border-cyan-500/15">
              <div className="flex items-center justify-between text-[11px] font-mono text-amber-300 font-semibold mb-1">
                <span>Sistem Yükü</span>
                <span className="text-[9px] bg-amber-500/20 text-amber-300 px-1.5 py-0.2 rounded">NOMINAL</span>
              </div>
              <p className="text-xs text-slate-300">
                CPU: %15 · RAM: %54 · Gecikme süresi &lt; 20ms
              </p>
            </div>
          </div>

          <button
            onClick={() => onNavigateTab('organizer')}
            className="w-full py-2 text-xs font-mono font-medium rounded-lg border border-cyan-500/30 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <span>Tüm İstihbaratı Gör</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 2. MIDDLE ROW: ACTIVE AGENTS + MISSION TIMELINE + QUICK COMMANDS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Left: Active Agents (6 cols) */}
        <div className={`lg:col-span-6 rounded-2xl border p-5 transition-colors ${
          isDarkMode
            ? 'bg-gradient-to-b from-[#081222]/90 to-[#040814]/90 border-cyan-500/25 shadow-sm text-slate-100'
            : 'bg-white border-slate-200/90 shadow-xs text-slate-900'
        }`}>
          <div className={`flex items-center justify-between border-b pb-3 mb-4 ${
            isDarkMode ? 'border-cyan-500/15' : 'border-slate-200'
          }`}>
            <span className={`text-xs font-mono font-bold tracking-widest uppercase ${
              isDarkMode ? 'text-cyan-400' : 'text-cyan-700'
            }`}>
              AKTİF AJANLAR & MODÜLLER
            </span>
            <span className="text-xs font-mono text-slate-400">5 Modül</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            {/* Coding Agent */}
            <div
              onClick={() => onNavigateTab('code')}
              className={`p-3 rounded-xl border transition-all cursor-pointer group ${
                isDarkMode
                  ? 'bg-slate-900/80 border-cyan-500/20 hover:border-cyan-400 text-slate-100'
                  : 'bg-slate-50 border-slate-200 hover:border-cyan-400 hover:bg-slate-100/80 text-slate-800'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 font-mono font-bold">
                  <Code2 className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                  <span>Kod & Oyun Ajanı</span>
                </div>
                <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Aktif
                </span>
              </div>
              <div className="h-4 flex items-center gap-1">
                {[4, 10, 16, 8, 14, 18, 6, 12].map((h, i) => (
                  <span
                    key={i}
                    style={{ height: `${h}px` }}
                    className="w-1 bg-cyan-500/80 rounded-full animate-pulse"
                  />
                ))}
              </div>
            </div>

            {/* Research Agent */}
            <div
              onClick={() => onNavigateTab('research')}
              className={`p-3 rounded-xl border transition-all cursor-pointer group ${
                isDarkMode
                  ? 'bg-slate-900/80 border-cyan-500/20 hover:border-cyan-400 text-slate-100'
                  : 'bg-slate-50 border-slate-200 hover:border-sky-400 hover:bg-slate-100/80 text-slate-800'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 font-mono font-bold">
                  <Search className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                  <span>Araştırma Ajanı</span>
                </div>
                <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Aktif
                </span>
              </div>
              <div className="h-4 flex items-center gap-1">
                {[6, 14, 8, 18, 12, 10, 16, 5].map((h, i) => (
                  <span
                    key={i}
                    style={{ height: `${h}px` }}
                    className="w-1 bg-sky-500/80 rounded-full animate-pulse"
                  />
                ))}
              </div>
            </div>

            {/* Vision Agent */}
            <div
              onClick={() => onNavigateTab('vision')}
              className={`p-3 rounded-xl border transition-all cursor-pointer group ${
                isDarkMode
                  ? 'bg-slate-900/80 border-cyan-500/20 hover:border-cyan-400 text-slate-100'
                  : 'bg-slate-50 border-slate-200 hover:border-amber-400 hover:bg-slate-100/80 text-slate-800'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 font-mono font-bold">
                  <Image className="w-4 h-4 text-amber-500" />
                  <span>Görsel Analiz Ajanı</span>
                </div>
                <span className="text-[10px] font-mono text-cyan-600 dark:text-cyan-300 font-semibold">Hazır</span>
              </div>
              <p className="text-[11px] text-slate-500">Fotoğraf ve teknik şema analizine hazır.</p>
            </div>

            {/* Security Vault Agent */}
            <div
              onClick={() => onNavigateTab('vault')}
              className={`p-3 rounded-xl border transition-all cursor-pointer group ${
                isDarkMode
                  ? 'bg-slate-900/80 border-cyan-500/20 hover:border-cyan-400 text-slate-100'
                  : 'bg-slate-50 border-slate-200 hover:border-emerald-400 hover:bg-slate-100/80 text-slate-800'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 font-mono font-bold">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  <span>Bulut Eşitleme</span>
                </div>
                <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold">Senkron</span>
              </div>
              <p className="text-[11px] text-slate-500">iPhone, Android ve PC ile anlık senkronizasyon.</p>
            </div>
          </div>
        </div>

        {/* Center-Right: Mission Timeline (3 cols) */}
        <div className={`lg:col-span-3 rounded-2xl border p-5 shadow-xs flex flex-col justify-between transition-colors ${
          isDarkMode
            ? 'bg-gradient-to-b from-[#081222]/90 to-[#040814]/90 border-cyan-500/25 text-slate-100'
            : 'bg-white border-slate-200/90 text-slate-900'
        }`}>
          <div>
            <div className={`flex items-center justify-between border-b pb-3 mb-3 ${
              isDarkMode ? 'border-cyan-500/15' : 'border-slate-200'
            }`}>
              <span className={`text-xs font-mono font-bold tracking-widest uppercase ${
                isDarkMode ? 'text-cyan-400' : 'text-cyan-700'
              }`}>
                AJANDA & GÖREVLER
              </span>
              <span className="text-[10px] font-mono text-cyan-600 dark:text-cyan-400 font-semibold">Bugün</span>
            </div>

            <div className="space-y-3 relative before:absolute before:top-2 before:bottom-2 before:left-3 before:w-px before:bg-cyan-500/20">
              {tasks.slice(0, 4).map((task) => (
                <div
                  key={task.id}
                  onClick={() => onNavigateTab('organizer')}
                  className="relative pl-7 text-xs cursor-pointer group"
                >
                  <span
                    className={`absolute left-2 top-1.5 w-2 h-2 rounded-full ${
                      task.completed ? 'bg-emerald-500' : 'bg-cyan-500 animate-pulse'
                    }`}
                  />
                  <div className="flex items-center justify-between text-[11px] font-mono">
                    <span className="text-cyan-600 dark:text-cyan-400 font-semibold tabular-nums">{task.time || '10:00'}</span>
                    <span className={task.completed ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}>
                      {task.completed ? 'Tamamlandı' : 'Bekliyor'}
                    </span>
                  </div>
                  <p className="font-semibold truncate mt-0.5 group-hover:text-cyan-600 dark:group-hover:text-cyan-300 transition-colors">
                    {task.title}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => onNavigateTab('organizer')}
            className={`w-full mt-3 py-1.5 text-xs font-mono flex items-center justify-center gap-1 cursor-pointer font-semibold ${
              isDarkMode ? 'text-cyan-400 hover:text-cyan-300' : 'text-cyan-700 hover:text-cyan-800'
            }`}
          >
            <span>Tüm Ajandayı Gör &gt;</span>
          </button>
        </div>

        {/* Right: Quick Commands (3 cols) */}
        <div className={`lg:col-span-3 rounded-2xl border p-5 shadow-xs flex flex-col justify-between transition-colors ${
          isDarkMode
            ? 'bg-gradient-to-b from-[#081222]/90 to-[#040814]/90 border-cyan-500/25 text-slate-100'
            : 'bg-white border-slate-200/90 text-slate-900'
        }`}>
          <div className={`flex items-center justify-between border-b pb-3 mb-3 ${
            isDarkMode ? 'border-cyan-500/15' : 'border-slate-200'
          }`}>
            <span className={`text-xs font-mono font-bold tracking-widest uppercase ${
              isDarkMode ? 'text-cyan-400' : 'text-cyan-700'
            }`}>
              HIZLI İŞLEMLER
            </span>
            <Zap className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
          </div>

          <div className="space-y-2 text-xs">
            <button
              onClick={() => onNavigateTab('organizer')}
              className={`w-full p-2.5 rounded-xl border text-left flex items-center gap-2.5 transition-colors cursor-pointer ${
                isDarkMode
                  ? 'border-cyan-500/20 hover:border-cyan-400 bg-slate-900/60 hover:bg-slate-800/80 text-slate-200'
                  : 'border-slate-200 hover:border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-800'
              }`}
            >
              <Calendar className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
              <span>Yeni Görev / Ajanda Planla</span>
            </button>

            <button
              onClick={() => onNavigateTab('code')}
              className={`w-full p-2.5 rounded-xl border text-left flex items-center gap-2.5 transition-colors cursor-pointer ${
                isDarkMode
                  ? 'border-cyan-500/20 hover:border-cyan-400 bg-slate-900/60 hover:bg-slate-800/80 text-slate-200'
                  : 'border-slate-200 hover:border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-800'
              }`}
            >
              <Code2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Kod & Oyun Motorunu Aç</span>
            </button>

            <button
              onClick={onToggleVoice}
              className={`w-full p-2.5 rounded-xl border text-left flex items-center gap-2.5 transition-colors cursor-pointer ${
                isDarkMode
                  ? 'border-cyan-500/20 hover:border-cyan-400 bg-slate-900/60 hover:bg-slate-800/80 text-slate-200'
                  : 'border-slate-200 hover:border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-800'
              }`}
            >
              <Radio className="w-4 h-4 text-amber-500" />
              <span>Sesli İletişimi Başlat</span>
            </button>

            <button
              onClick={() => onNavigateTab('research')}
              className={`w-full p-2.5 rounded-xl border text-left flex items-center gap-2.5 transition-colors cursor-pointer ${
                isDarkMode
                  ? 'border-cyan-500/20 hover:border-cyan-400 bg-slate-900/60 hover:bg-slate-800/80 text-slate-200'
                  : 'border-slate-200 hover:border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-800'
              }`}
            >
              <Search className="w-4 h-4 text-sky-600 dark:text-sky-400" />
              <span>Derin Araştırma Yürüt</span>
            </button>
          </div>

          <div className="pt-2">
            <button
              onClick={onPlayBriefing}
              className={`w-full py-2 rounded-xl border font-mono text-xs flex items-center justify-center gap-2 transition-all cursor-pointer font-semibold ${
                isDarkMode
                  ? 'bg-gradient-to-r from-cyan-500/20 to-sky-500/20 border-cyan-400/50 text-cyan-300 hover:brightness-110'
                  : 'bg-cyan-50 hover:bg-cyan-100 border-cyan-300 text-cyan-900 shadow-2xs'
              }`}
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Sabah Brifingi Oku</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. LOWER SECTION: SYSTEM MONITORS & HARDWARE TELEMETRY */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* System Monitor (Circular Gauges) - 4 cols */}
        <div className={`lg:col-span-4 rounded-2xl border p-5 shadow-xs transition-colors ${
          isDarkMode
            ? 'bg-gradient-to-b from-[#081222]/90 to-[#040814]/90 border-cyan-500/25 text-slate-100'
            : 'bg-white border-slate-200/90 text-slate-900'
        }`}>
          <div className={`flex items-center justify-between border-b pb-3 mb-4 ${
            isDarkMode ? 'border-cyan-500/15' : 'border-slate-200'
          }`}>
            <span className={`text-xs font-mono font-bold tracking-widest uppercase ${
              isDarkMode ? 'text-cyan-400' : 'text-cyan-700'
            }`}>
              SİSTEM PERFORMANS MONİTÖRÜ
            </span>
            <Activity className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
          </div>

          <div className="grid grid-cols-3 gap-3 text-center">
            {/* CPU Gauge */}
            <div className="flex flex-col items-center">
              <div className="relative w-20 h-20 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                  <path
                    className={isDarkMode ? 'text-slate-800' : 'text-slate-200'}
                    strokeWidth="3"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="text-cyan-500"
                    strokeDasharray="15, 100"
                    strokeWidth="3"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <span className={`absolute font-mono text-xs font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>15%</span>
              </div>
              <span className="text-[11px] font-mono text-slate-500 mt-1 font-medium">CPU Yükü</span>
            </div>

            {/* RAM Gauge */}
            <div className="flex flex-col items-center">
              <div className="relative w-20 h-20 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                  <path
                    className={isDarkMode ? 'text-slate-800' : 'text-slate-200'}
                    strokeWidth="3"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="text-cyan-500"
                    strokeDasharray="54, 100"
                    strokeWidth="3"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <span className={`absolute font-mono text-xs font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>54%</span>
              </div>
              <span className="text-[11px] font-mono text-slate-500 mt-1 font-medium">RAM Bellek</span>
            </div>

            {/* Disk Gauge */}
            <div className="flex flex-col items-center">
              <div className="relative w-20 h-20 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                  <path
                    className={isDarkMode ? 'text-slate-800' : 'text-slate-200'}
                    strokeWidth="3"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="text-cyan-500"
                    strokeDasharray="40, 100"
                    strokeWidth="3"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <span className={`absolute font-mono text-xs font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>40%</span>
              </div>
              <span className="text-[11px] font-mono text-slate-500 mt-1 font-medium">Bulut Eşitleme</span>
            </div>
          </div>
        </div>

        {/* Neural Memory Insights (Constellation Graph) - 4 cols */}
        <div className={`lg:col-span-4 rounded-2xl border p-5 shadow-xs transition-colors ${
          isDarkMode
            ? 'bg-gradient-to-b from-[#081222]/90 to-[#040814]/90 border-cyan-500/25 text-slate-100'
            : 'bg-white border-slate-200/90 text-slate-900'
        }`}>
          <div className={`flex items-center justify-between border-b pb-3 mb-3 ${
            isDarkMode ? 'border-cyan-500/15' : 'border-slate-200'
          }`}>
            <span className={`text-xs font-mono font-bold tracking-widest uppercase ${
              isDarkMode ? 'text-cyan-400' : 'text-cyan-700'
            }`}>
              HAFIZA & BİLGİ GRAFİĞİ
            </span>
            <span className="text-xs font-mono text-cyan-600 dark:text-cyan-400 font-semibold">3,380 Düğüm</span>
          </div>

          <div className="flex items-center justify-between">
            {/* SVG Constellation Graphic */}
            <div className="w-36 h-24 relative">
              <svg className="w-full h-full" viewBox="0 0 140 90">
                <line x1="20" y1="50" x2="50" y2="25" stroke={isDarkMode ? '#22d3ee' : '#0284c7'} strokeWidth="1" strokeOpacity="0.4" />
                <line x1="50" y1="25" x2="85" y2="40" stroke={isDarkMode ? '#22d3ee' : '#0284c7'} strokeWidth="1" strokeOpacity="0.4" />
                <line x1="85" y1="40" x2="120" y2="20" stroke={isDarkMode ? '#22d3ee' : '#0284c7'} strokeWidth="1" strokeOpacity="0.4" />
                <line x1="50" y1="25" x2="65" y2="70" stroke={isDarkMode ? '#22d3ee' : '#0284c7'} strokeWidth="1" strokeOpacity="0.4" />
                <line x1="85" y1="40" x2="110" y2="65" stroke={isDarkMode ? '#22d3ee' : '#0284c7'} strokeWidth="1" strokeOpacity="0.4" />

                <circle cx="20" cy="50" r="3" fill="#0284c7" />
                <circle cx="50" cy="25" r="4" fill={isDarkMode ? '#ffffff' : '#0369a1'} />
                <circle cx="85" cy="40" r="3.5" fill="#0284c7" />
                <circle cx="120" cy="20" r="3" fill="#0284c7" />
                <circle cx="65" cy="70" r="2.5" fill="#38bdf8" />
                <circle cx="110" cy="65" r="3" fill="#38bdf8" />
              </svg>
            </div>

            <div className="space-y-1 text-right text-xs font-mono">
              <div className="text-slate-500">
                Hafıza: <span className={`font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>3,380</span>
              </div>
              <div className="text-slate-500">
                Oturum: <span className={`font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>22</span>
              </div>
              <div className="text-slate-500">
                Araç Çağrısı: <span className={`font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>14</span>
              </div>
              <button
                onClick={() => onNavigateTab('vault')}
                className={`text-[11px] font-semibold cursor-pointer ${
                  isDarkMode ? 'text-cyan-400 hover:text-cyan-300' : 'text-cyan-700 hover:text-cyan-800'
                }`}
              >
                Hafızayı Yönet &gt;
              </button>
            </div>
          </div>
        </div>

        {/* LLM & Cloud Connectivity Status - 4 cols */}
        <div className={`lg:col-span-4 rounded-2xl border p-5 shadow-xs transition-colors ${
          isDarkMode
            ? 'bg-gradient-to-b from-[#081222]/90 to-[#040814]/90 border-cyan-500/25 text-slate-100'
            : 'bg-white border-slate-200/90 text-slate-900'
        }`}>
          <div className={`flex items-center justify-between border-b pb-3 mb-3 ${
            isDarkMode ? 'border-cyan-500/15' : 'border-slate-200'
          }`}>
            <span className={`text-xs font-mono font-bold tracking-widest uppercase ${
              isDarkMode ? 'text-cyan-400' : 'text-cyan-700'
            }`}>
              BAĞLI CİHAZLAR & BULUT
            </span>
            <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400 font-semibold">4 Bağlı</span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs font-mono">
            <div
              onClick={() => onNavigateTab('chat')}
              className={`p-2 rounded-lg border transition-colors cursor-pointer ${
                isDarkMode
                  ? 'bg-slate-900/60 border-cyan-500/20 hover:border-cyan-400'
                  : 'bg-slate-50 border-slate-200 hover:border-slate-300'
              }`}
            >
              <span className={`block font-semibold ${isDarkMode ? 'text-slate-300' : 'text-slate-800'}`}>Gemini 3.8</span>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400">Nöral Motor</span>
            </div>

            <div
              onClick={() => onNavigateTab('vault')}
              className={`p-2 rounded-lg border transition-colors cursor-pointer ${
                isDarkMode
                  ? 'bg-slate-900/60 border-cyan-500/20 hover:border-cyan-400'
                  : 'bg-slate-50 border-slate-200 hover:border-slate-300'
              }`}
            >
              <span className={`block font-semibold ${isDarkMode ? 'text-slate-300' : 'text-slate-800'}`}>Windows 11</span>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400">Workstation</span>
            </div>

            <div
              onClick={() => onNavigateTab('vault')}
              className={`p-2 rounded-lg border transition-colors cursor-pointer ${
                isDarkMode
                  ? 'bg-slate-900/60 border-cyan-500/20 hover:border-cyan-400'
                  : 'bg-slate-50 border-slate-200 hover:border-slate-300'
              }`}
            >
              <span className={`block font-semibold ${isDarkMode ? 'text-slate-300' : 'text-slate-800'}`}>iPhone 16 Pro</span>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400">iOS Mobil</span>
            </div>

            <div
              onClick={() => onNavigateTab('vault')}
              className={`p-2 rounded-lg border transition-colors cursor-pointer ${
                isDarkMode
                  ? 'bg-slate-900/60 border-cyan-500/20 hover:border-cyan-400'
                  : 'bg-slate-50 border-slate-200 hover:border-slate-300'
              }`}
            >
              <span className={`block font-semibold ${isDarkMode ? 'text-slate-300' : 'text-slate-800'}`}>Android Tablet</span>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400">Galaxy Tab</span>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive AI Agent Terminal Modal */}
      <AgentModal
        isOpen={isAgentModalOpen}
        onClose={() => setIsAgentModalOpen(false)}
        initialCommand={agentModalCommand}
        userTitle={userTitle}
        accent={accent}
        soundEnabled={soundEnabled}
        ttsVoice={ttsVoice}
        speechRate={speechRate}
        onNavigateToCodeStudio={(code, lang, filename) => {
          if (onSendToCodeStudio) {
            onSendToCodeStudio(code, lang, filename);
          } else {
            onNavigateTab('code');
          }
        }}
      />
    </div>
  );
};
