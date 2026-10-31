import React from 'react';
import {
  LayoutDashboard,
  Cpu,
  Code2,
  CalendarCheck,
  Search,
  Image,
  ShieldCheck,
  Mic,
  MicOff,
  Zap,
} from 'lucide-react';
import { ActiveTab } from './Header';
import { AccentTheme } from '../types';
import { TraiEmblem } from './TraiEmblem';

interface SidebarProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  accent: AccentTheme;
  isVoiceActive: boolean;
  onToggleVoice: () => void;
  activeTasksCount: number;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  onToggleFocusMode?: () => void;
  isFocusMode?: boolean;
  isDarkMode?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  accent,
  isVoiceActive,
  onToggleVoice,
  activeTasksCount,
  isOpenMobile,
  onCloseMobile,
  onToggleFocusMode,
  isFocusMode,
  isDarkMode = false,
}) => {
  const navItems: Array<{
    id: ActiveTab;
    label: string;
    icon: any;
    badge?: number | string;
  }> = [
    { id: 'command', label: 'Komuta Merkezi', icon: LayoutDashboard },
    { id: 'chat', label: 'AI Asistan & Sohbet', icon: Cpu },
    { id: 'code', label: 'Kod & Oyun Stüdyosu', icon: Code2, badge: 'IDE' },
    { id: 'organizer', label: 'Görevler & Ajanda', icon: CalendarCheck, badge: activeTasksCount },
    { id: 'research', label: 'Derin Araştırma', icon: Search },
    { id: 'vision', label: 'Görsel Analiz', icon: Image },
    { id: 'vault', label: 'Bulut Senkronizasyonu', icon: ShieldCheck },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpenMobile && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
        />
      )}

      <aside
        className={`fixed lg:sticky top-0 left-0 z-50 h-screen w-64 xl:w-68 border-r flex flex-col justify-between transition-transform duration-300 ${
          isDarkMode
            ? 'bg-[#0a0d14] border-slate-800/80 text-white'
            : 'bg-white border-slate-200 text-slate-800 shadow-sm'
        }`}
      >
        {/* Brand Header */}
        <div>
          <div className={`p-4 sm:p-5 flex items-center gap-3 border-b ${
            isDarkMode ? 'border-slate-800/80' : 'border-slate-200/90'
          }`}>
            <TraiEmblem accent={accent} size="md" isPulsing={isVoiceActive} isDarkMode={isDarkMode} />
            <div className="min-w-0">
              <div className="text-sm font-semibold tracking-tight flex items-center gap-1.5">
                <span className={isDarkMode ? 'text-white' : 'text-slate-900 font-bold'}>TRAİ</span>
                <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded border ${
                  isDarkMode
                    ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20'
                    : 'bg-cyan-50 text-cyan-700 border-cyan-200 font-semibold'
                }`}>
                  PRO
                </span>
              </div>
              <div className={`text-[11px] truncate ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                Akıllı Danışman & Stüdyo
              </div>
            </div>
          </div>

          {/* Navigation Menu */}
          <nav className="p-3 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onTabChange(item.id);
                    onCloseMobile();
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer border ${
                    isActive
                      ? isDarkMode
                        ? 'bg-slate-800/90 text-white border-slate-700/70 shadow-sm'
                        : 'bg-cyan-50/90 text-cyan-950 border-cyan-200 shadow-xs font-semibold'
                      : isDarkMode
                      ? 'border-transparent text-slate-400 hover:text-slate-100 hover:bg-slate-800/40'
                      : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${
                      isActive
                        ? isDarkMode ? 'text-cyan-400' : 'text-cyan-600'
                        : isDarkMode ? 'text-slate-400' : 'text-slate-500'
                    }`} />
                    <span className="truncate">{item.label}</span>
                  </div>

                  {item.badge !== undefined && (typeof item.badge === 'number' ? item.badge > 0 : Boolean(item.badge)) && (
                    <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full border ${
                      isDarkMode
                        ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
                        : 'bg-cyan-100 text-cyan-800 border-cyan-200 font-semibold'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Voice Status & Quick Controls */}
        <div className={`p-3.5 m-3 rounded-xl border ${
          isDarkMode
            ? 'bg-slate-900/60 border-slate-800/80'
            : 'bg-slate-50 border-slate-200/90'
        }`}>
          <div className="flex items-center justify-between text-[11px] mb-2">
            <span className={`font-medium ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>Sesli Asistan</span>
            <span className="flex items-center gap-1.5 text-[10px] font-mono">
              <span className={`w-1.5 h-1.5 rounded-full ${isVoiceActive ? 'bg-rose-400 animate-ping' : 'bg-emerald-400'}`} />
              <span className={isVoiceActive ? 'text-rose-500' : isDarkMode ? 'text-emerald-400' : 'text-emerald-600 font-medium'}>
                {isVoiceActive ? 'Dinliyor' : 'Hazır'}
              </span>
            </span>
          </div>

          {/* Waveform representation */}
          <div className="h-5 flex items-center justify-center gap-1 my-1 px-2 overflow-hidden">
            {[4, 8, 14, 20, 12, 18, 22, 16, 20, 10, 14, 8, 4].map((h, i) => (
              <span
                key={i}
                style={{
                  height: isVoiceActive ? `${Math.max(4, (h * 1.2) % 20)}px` : `${Math.max(3, h * 0.3)}px`,
                }}
                className={`w-1 rounded-full transition-all duration-150 ${
                  isVoiceActive
                    ? 'bg-cyan-500 animate-pulse'
                    : isDarkMode ? 'bg-slate-700' : 'bg-slate-300'
                }`}
              />
            ))}
          </div>

          {/* Voice toggle button */}
          <button
            onClick={onToggleVoice}
            className={`w-full mt-2 py-2 px-3 rounded-lg flex items-center justify-center gap-2 text-xs font-medium transition-all cursor-pointer ${
              isVoiceActive
                ? 'bg-rose-500 text-white hover:bg-rose-600 shadow-sm'
                : isDarkMode
                ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/60'
                : 'bg-slate-200/80 hover:bg-slate-300/80 text-slate-800 border border-slate-300/80 shadow-xs'
            }`}
          >
            {isVoiceActive ? (
              <>
                <MicOff className="w-3.5 h-3.5" />
                <span>Dinlemeyi Durdur</span>
              </>
            ) : (
              <>
                <Mic className={`w-3.5 h-3.5 ${isDarkMode ? 'text-cyan-400' : 'text-cyan-600'}`} />
                <span>Sesli Komut Ver</span>
              </>
            )}
          </button>

          {/* Focus Mode button */}
          {onToggleFocusMode && (
            <button
              onClick={onToggleFocusMode}
              className={`w-full mt-2 py-1.5 px-3 rounded-lg text-[11px] font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                isDarkMode
                  ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <Zap className="w-3 h-3 text-amber-500" />
              <span>{isFocusMode ? 'Normal Görünüm' : 'Odaklanma Modu'}</span>
            </button>
          )}
        </div>
      </aside>
    </>
  );
};
