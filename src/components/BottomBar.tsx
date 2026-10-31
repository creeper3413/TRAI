import React from 'react';
import { MapPin, Sun, Wifi, Volume2, Mic, Play } from 'lucide-react';
import { AccentTheme } from '../types';

interface BottomBarProps {
  accent: AccentTheme;
  isVoiceActive: boolean;
  onToggleVoice: () => void;
  onPlayBriefing: () => void;
  isPlayingBriefing?: boolean;
  isDarkMode?: boolean;
}

export const BottomBar: React.FC<BottomBarProps> = ({
  accent,
  isVoiceActive,
  onToggleVoice,
  onPlayBriefing,
  isPlayingBriefing = false,
  isDarkMode = false,
}) => {
  return (
    <footer className={`fixed bottom-0 left-0 right-0 z-30 h-16 backdrop-blur-xl border-t px-4 sm:px-6 flex items-center justify-between gap-4 transition-colors ${
      isDarkMode
        ? 'bg-[#040812]/95 border-cyan-500/25 text-slate-400'
        : 'bg-white/95 border-slate-200/90 text-slate-600 shadow-lg'
    }`}>
      
      {/* Left: Location & System Telemetry */}
      <div className="hidden md:flex items-center gap-4 text-xs font-mono">
        <div className="flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
          <span className="text-slate-700 dark:text-slate-300">Konum: Türkiye</span>
        </div>
        <span aria-hidden="true" className="text-slate-300 dark:text-slate-600">·</span>
        <div className="flex items-center gap-1.5">
          <Sun className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
          <span className="text-slate-700 dark:text-slate-300">22°C Optimal</span>
        </div>
        <span aria-hidden="true" className="text-slate-300 dark:text-slate-600">·</span>
        <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium">
          <Wifi className="w-3.5 h-3.5" />
          <span>TRAİ Çekirdeği: Aktif</span>
        </div>
      </div>

      {/* Center: Massive Glowing "TRAİ İLE KONUŞ" Pill */}
      <button
        onClick={onToggleVoice}
        className={`flex items-center justify-center gap-3 px-6 py-2.5 rounded-full border transition-all cursor-pointer shadow-md ${
          isVoiceActive
            ? 'bg-rose-500/20 border-rose-500 text-rose-700 dark:text-rose-200 shadow-[0_0_25px_rgba(244,63,94,0.4)] animate-pulse'
            : isDarkMode
            ? 'bg-gradient-to-r from-cyan-950/60 via-cyan-900/40 to-cyan-950/60 border-cyan-400/60 text-cyan-200 hover:border-cyan-300 shadow-[0_0_30px_rgba(6,182,212,0.35)]'
            : 'bg-gradient-to-r from-cyan-50 via-sky-50 to-blue-50 border-cyan-300 hover:border-cyan-400 text-cyan-950 hover:bg-cyan-100/60 shadow-[0_2px_12px_rgba(2,132,199,0.15)]'
        }`}
      >
        {/* Left Waveform */}
        <div className="flex items-center gap-0.5">
          {[6, 12, 18, 10, 16].map((h, i) => (
            <span
              key={i}
              style={{ height: `${h}px` }}
              className={`w-0.5 rounded-full ${
                isVoiceActive
                  ? 'bg-rose-500 animate-pulse'
                  : isDarkMode
                  ? 'bg-cyan-400'
                  : 'bg-cyan-600'
              }`}
            />
          ))}
        </div>

        <div className="text-center px-1">
          <div className="text-xs font-bold font-mono tracking-widest uppercase">
            {isVoiceActive ? 'DİNLİYORUM...' : 'TRAİ İLE KONUŞ'}
          </div>
          <div className={`text-[9px] font-mono ${isDarkMode ? 'text-cyan-400/80' : 'text-cyan-700 font-medium'}`}>
            {isVoiceActive ? 'Komutunuz İşleniyor' : 'Sesli İletişim İçin Dokunun'}
          </div>
        </div>

        {/* Right Waveform */}
        <div className="flex items-center gap-0.5">
          {[16, 10, 18, 12, 6].map((h, i) => (
            <span
              key={i}
              style={{ height: `${h}px` }}
              className={`w-0.5 rounded-full ${
                isVoiceActive
                  ? 'bg-rose-500 animate-pulse'
                  : isDarkMode
                  ? 'bg-cyan-400'
                  : 'bg-cyan-600'
              }`}
            />
          ))}
        </div>
      </button>

      {/* Right: Executive Briefing Button */}
      <div className="flex items-center gap-2">
        <button
          onClick={onPlayBriefing}
          className={`px-3.5 py-1.5 rounded-xl border text-xs font-mono font-medium flex items-center gap-2 transition-colors cursor-pointer ${
            isDarkMode
              ? 'border-cyan-500/30 hover:border-cyan-400 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300'
              : 'border-slate-200 hover:border-slate-300 bg-slate-100 hover:bg-slate-200/80 text-slate-800'
          }`}
        >
          <Play className={`w-3.5 h-3.5 fill-current ${isPlayingBriefing ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">Sabah Brifingi Dinle</span>
          <span className="sm:hidden">Brifing</span>
        </button>
      </div>
    </footer>
  );
};
