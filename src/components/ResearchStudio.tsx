import React, { useState } from 'react';
import { Search, Sparkles, BookOpen, Volume2, Copy, Check, Clock, ChevronRight } from 'lucide-react';
import { ResearchReport, AccentTheme } from '../types';
import { speechService } from '../services/speech';
import { soundFx } from '../services/soundFx';

interface ResearchStudioProps {
  reports: ResearchReport[];
  onExecuteResearch: (query: string, depth: 'summary' | 'standard' | 'comprehensive') => Promise<void>;
  isLoading: boolean;
  accent: AccentTheme;
  userTitle: string;
  soundEnabled: boolean;
  ttsVoice: 'Fenrir' | 'Kore' | 'Zephyr' | 'Puck';
  speechRate: number;
}

export const ResearchStudio: React.FC<ResearchStudioProps> = ({
  reports,
  onExecuteResearch,
  isLoading,
  accent,
  userTitle,
  soundEnabled,
  ttsVoice,
  speechRate,
}) => {
  const [query, setQuery] = useState('');
  const [depth, setDepth] = useState<'summary' | 'standard' | 'comprehensive'>('standard');
  const [selectedReport, setSelectedReport] = useState<ResearchReport | null>(reports[0] || null);
  const [copied, setCopied] = useState(false);
  const [isNarrating, setIsNarrating] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || isLoading) return;

    soundFx.playClick(soundEnabled);
    await onExecuteResearch(query.trim(), depth);
    setQuery('');
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleNarrate = async (text: string) => {
    if (isNarrating) {
      speechService.stopSpeaking();
      setIsNarrating(false);
      return;
    }

    setIsNarrating(true);
    await speechService.speak(text.slice(0, 450), ttsVoice, speechRate);
    setIsNarrating(false);
  };

  const accentColor = {
    cyan: 'bg-cyan-500 hover:bg-cyan-400 text-slate-950',
    gold: 'bg-amber-500 hover:bg-amber-400 text-slate-950',
    emerald: 'bg-emerald-500 hover:bg-emerald-400 text-slate-950',
    violet: 'bg-violet-500 hover:bg-violet-400 text-slate-950',
  }[accent];

  const presets = [
    'Yapay Zeka ve Otonom Sistemlerin 2026-2030 Projeksiyonu',
    'Yeni Nesil Çok Modlu Yapay Zeka Mimarileri ve Robotik',
    'Yüksek Performanslı Zihinsel Odaklanma ve Biyolojik Ritimler',
    'Sıfır Karbon Nükleer Füzyon Teknolojileri İlerleme Raporu',
  ];

  const activeReport = selectedReport || reports[0];

  return (
    <div className="max-w-5xl mx-auto w-full space-y-6 pb-16">
      {/* Header */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 p-6 shadow-sm">
        <div className="flex items-center gap-2 text-xs font-mono text-slate-500 uppercase tracking-wider mb-2">
          <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
          <span>TRAİ DERİN ARAŞTIRMA & İNCELEME MERKEZİ</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100">
          Akademik & Stratejik Araştırma Merkezi
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
          {userTitle}, araştırmak istediğiniz konuyu girin. Çok katmanlı sentezleme algoritmamla yönetici özeti,
          somut bulgular ve eylem planı içeren eksiksiz bir rapor hazırlayayım.
        </p>

        {/* Search input form */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-3">
          <div className="relative flex items-center bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden focus-within:border-cyan-400 transition-colors">
            <Search className="w-5 h-5 ml-4 text-slate-400 shrink-0" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Araştırma konusu, hipotez veya analiz başlığı girin..."
              className="w-full py-3.5 px-3 bg-transparent text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-500 outline-none"
            />
            <button
              type="submit"
              disabled={!query.trim() || isLoading}
              className={`mr-2 px-4 py-2 rounded-lg text-xs font-semibold cursor-pointer transition-all disabled:opacity-40 disabled:cursor-not-allowed ${accentColor}`}
            >
              {isLoading ? 'Araştırılıyor...' : 'Rapor Oluştur'}
            </button>
          </div>

          {/* Depth selection & presets */}
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-950 rounded-lg">
              <span className="text-slate-400 px-2 font-mono">Derinlik:</span>
              <button
                type="button"
                onClick={() => setDepth('summary')}
                className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                  depth === 'summary'
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Hızlı Brifing
              </button>
              <button
                type="button"
                onClick={() => setDepth('standard')}
                className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                  depth === 'standard'
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Standart Sentez
              </button>
              <button
                type="button"
                onClick={() => setDepth('comprehensive')}
                className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                  depth === 'comprehensive'
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Kapsamlı Analiz
              </button>
            </div>

            {/* Presets */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
              <span className="text-slate-500 hidden sm:inline">Örnekler:</span>
              {presets.slice(0, 2).map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setQuery(p)}
                  className="px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-950 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition-colors cursor-pointer truncate max-w-xs"
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        </form>
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Past Reports List */}
        <div className="lg:col-span-1 space-y-3">
          <h3 className="text-xs font-mono uppercase tracking-wider text-slate-500 px-1">
            Geçmiş Raporlar ({reports.length})
          </h3>
          <div className="space-y-2">
            {reports.map((rep) => (
              <div
                key={rep.id}
                onClick={() => setSelectedReport(rep)}
                className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                  activeReport?.id === rep.id
                    ? 'border-cyan-400 bg-cyan-500/10 dark:bg-cyan-500/10'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 line-clamp-2">
                  {rep.query}
                </p>
                <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-mono mt-1">
                  <Clock className="w-3 h-3" />
                  <span className="tabular-nums">
                    {new Date(rep.timestamp).toLocaleDateString('tr-TR')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Report Viewer */}
        <div className="lg:col-span-3">
          {activeReport ? (
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-6 sm:p-8 space-y-6 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
                <div>
                  <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 uppercase tracking-wider mb-1">
                    <span>ARAŞTIRMA RAPORU</span>
                    <span aria-hidden="true">·</span>
                    <span>{activeReport.depth.toUpperCase()} DÜZEY</span>
                  </div>
                  <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100">
                    {activeReport.query}
                  </h2>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleNarrate(activeReport.report)}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Volume2 className={`w-3.5 h-3.5 ${isNarrating ? 'text-cyan-400 animate-pulse' : ''}`} />
                    <span>{isNarrating ? 'Durdur' : 'Seslendir'}</span>
                  </button>

                  <button
                    onClick={() => handleCopy(activeReport.report)}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">Kopyalandı</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Kopyala</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Formatted Markdown-like Content */}
              <div className="prose prose-sm dark:prose-invert max-w-none text-slate-700 dark:text-slate-300 leading-relaxed space-y-4">
                <div className="whitespace-pre-wrap font-sans text-sm sm:text-base">
                  {activeReport.report}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center border border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900">
              <Sparkles className="w-8 h-8 text-cyan-400 mx-auto mb-3" />
              <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                Henüz Araştırma Gerçekleştirilmedi
              </h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Yukarıdaki arama çubuğunu kullanarak veya örnek başlıklardan birini seçerek kapsamlı bir araştırma başlatabilirsiniz.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
