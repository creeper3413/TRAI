import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Sliders,
  ShieldCheck,
  Moon,
  Sun,
  Menu,
  User,
  LogOut,
  ChevronDown,
  CheckCircle2,
  Key,
  Laptop,
} from 'lucide-react';
import { AccentTheme } from '../types';

export type ActiveTab = 'command' | 'chat' | 'organizer' | 'code' | 'research' | 'vision' | 'vault';

interface HeaderProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  accent: AccentTheme;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  onOpenSettings: () => void;
  isVoiceActive: boolean;
  onToggleVoice: () => void;
  userTitle: string;
  userName?: string;
  userEmail?: string;
  onOpenMobileMenu?: () => void;
  onLogout?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onTabChange,
  accent,
  isDarkMode,
  onToggleDarkMode,
  onOpenSettings,
  isVoiceActive,
  onToggleVoice,
  userTitle,
  userName = 'Ali Asker Vuran',
  userEmail = 'aliaskervuran13@gmail.com',
  onOpenMobileMenu,
  onLogout,
}) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formattedDate = currentTime.toLocaleDateString('tr-TR', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });

  const formattedClock = currentTime.toLocaleTimeString('tr-TR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });

  // Initials for avatar
  const initials = userName
    ? userName
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'AV';

  return (
    <header className={`sticky top-0 z-30 w-full h-15 backdrop-blur-md border-b px-4 sm:px-6 flex items-center justify-between gap-4 transition-colors ${
      isDarkMode
        ? 'bg-[#07090e]/90 border-slate-800/80 text-white'
        : 'bg-white/95 border-slate-200/90 text-slate-900 shadow-xs'
    }`}>
      
      {/* Left: Mobile Toggle + Subtle Live System Status */}
      <div className="flex items-center gap-3">
        {onOpenMobileMenu && (
          <button
            onClick={onOpenMobileMenu}
            aria-label="Menüyü Aç"
            className={`lg:hidden p-2 rounded-lg border cursor-pointer transition-colors ${
              isDarkMode
                ? 'text-slate-400 hover:text-white border-slate-800 bg-slate-900/60'
                : 'text-slate-600 hover:text-slate-900 border-slate-200 bg-slate-100'
            }`}
          >
            <Menu className="w-4 h-4" />
          </button>
        )}

        <div className={`flex items-center gap-2 px-2.5 py-1 rounded-md border text-xs ${
          isDarkMode
            ? 'bg-slate-900/60 border-slate-800/80'
            : 'bg-slate-100/90 border-slate-200/90'
        }`}>
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span className={`font-bold hidden sm:inline ${isDarkMode ? 'text-slate-300' : 'text-slate-800'}`}>TRAİ v3.2</span>
          <span className="text-slate-400 hidden sm:inline">·</span>
          <span className={`text-[11px] ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Çevrimiçi</span>
        </div>
      </div>

      {/* Center: Clean Digital Clock */}
      <div className="hidden md:flex items-center gap-2 text-xs font-mono">
        <span className={isDarkMode ? 'text-slate-500' : 'text-slate-500'}>{formattedDate}</span>
        <span className={isDarkMode ? 'text-slate-600' : 'text-slate-300'}>·</span>
        <span className={`font-semibold tabular-nums ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>{formattedClock}</span>
      </div>

      {/* Right: Actions + Bespoke User Account Profile Trigger */}
      <div className="flex items-center gap-2 sm:gap-3 relative" ref={profileMenuRef}>
        
        {/* Voice Trigger Button */}
        <button
          onClick={onToggleVoice}
          title={isVoiceActive ? 'Sesli Dinlemeyi Kapat' : 'Sesli Komut Başlat'}
          className={`p-2 rounded-lg border transition-all cursor-pointer ${
            isVoiceActive
              ? 'bg-rose-500/15 border-rose-500/40 text-rose-500'
              : isDarkMode
              ? 'border-slate-800 bg-slate-900/60 text-slate-400 hover:text-slate-200 hover:border-slate-700'
              : 'border-slate-200 bg-slate-100 text-slate-600 hover:text-slate-900 hover:border-slate-300'
          }`}
        >
          {isVoiceActive ? <Mic className="w-4 h-4 animate-pulse" /> : <MicOff className="w-4 h-4" />}
        </button>

        {/* Dark / Light Toggle */}
        <button
          onClick={onToggleDarkMode}
          title="Karanlık / Aydınlık Mod"
          className={`p-2 rounded-lg border transition-colors cursor-pointer ${
            isDarkMode
              ? 'border-slate-800 bg-slate-900/60 text-slate-400 hover:text-slate-200 hover:border-slate-700'
              : 'border-slate-200 bg-slate-100 text-slate-600 hover:text-slate-900 hover:border-slate-300'
          }`}
        >
          {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Settings Button */}
        <button
          onClick={onOpenSettings}
          title="Sistem Ayarları"
          className={`p-2 rounded-lg border transition-colors cursor-pointer ${
            isDarkMode
              ? 'border-slate-800 bg-slate-900/60 text-slate-400 hover:text-slate-200 hover:border-slate-700'
              : 'border-slate-200 bg-slate-100 text-slate-600 hover:text-slate-900 hover:border-slate-300'
          }`}
        >
          <Sliders className="w-4 h-4" />
        </button>

        {/* Targeted User Profile Button */}
        <div
          onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
          role="button"
          tabIndex={0}
          aria-haspopup="true"
          aria-expanded={isProfileMenuOpen}
          className={`flex items-center gap-2 pl-2 sm:pl-3 pr-2 py-1 rounded-xl border transition-all cursor-pointer group select-none ${
            isDarkMode
              ? 'border-slate-800 hover:border-slate-700 bg-slate-900/80 hover:bg-slate-900'
              : 'border-slate-200 hover:border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-900 shadow-xs'
          }`}
        >
          {/* User Name & Role */}
          <div className="text-right leading-tight hidden sm:block">
            <span className={`text-xs font-semibold block truncate max-w-[120px] ${
              isDarkMode ? 'text-slate-200' : 'text-slate-900'
            }`}>
              {userName || userTitle}
            </span>
            <span className={`text-[10px] block ${isDarkMode ? 'text-slate-500' : 'text-slate-500'}`}>
              Yönetici
            </span>
          </div>
          
          {/* Initials Avatar */}
          <div className="relative w-7 h-7 rounded-lg bg-gradient-to-br from-cyan-500/20 to-sky-600/30 border border-cyan-500/30 flex items-center justify-center text-cyan-600 dark:text-cyan-300 font-bold text-xs shadow-inner">
            <span>{initials}</span>
            <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-[#07090e]" />
          </div>

          <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${
            isProfileMenuOpen ? 'rotate-180 text-slate-900 dark:text-slate-300' : 'text-slate-400'
          }`} />
        </div>

        {/* Profile & Session Dropdown Menu */}
        {isProfileMenuOpen && (
          <div className={`absolute right-0 top-12 w-68 border rounded-xl shadow-2xl p-3 z-50 text-xs font-sans animate-in fade-in zoom-in-95 duration-150 ${
            isDarkMode
              ? 'bg-[#0c1017] border-slate-800 text-slate-100'
              : 'bg-white border-slate-200 text-slate-900 shadow-xl'
          }`}>
            {/* Header info */}
            <div className={`p-2.5 rounded-lg border mb-2 ${
              isDarkMode
                ? 'bg-slate-900/80 border-slate-800/80'
                : 'bg-slate-50 border-slate-200'
            }`}>
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-500/30 text-cyan-600 dark:text-cyan-300 flex items-center justify-center font-bold text-xs">
                  {initials}
                </div>
                <div className="min-w-0">
                  <div className={`font-semibold truncate ${isDarkMode ? 'text-slate-100' : 'text-slate-900'}`}>{userName}</div>
                  <div className="text-[11px] text-slate-500 truncate">{userEmail}</div>
                </div>
              </div>
              <div className="mt-2 pt-2 border-t border-slate-200 dark:border-slate-800/60 flex items-center justify-between text-[11px] text-emerald-600 dark:text-emerald-400">
                <div className="flex items-center gap-1.5 font-medium">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Oturum Aktif</span>
                </div>
                <span className="text-[10px] text-slate-500 font-mono">Bulut Eşitlemesi Aktif</span>
              </div>
            </div>

            {/* Menu options */}
            <div className="space-y-0.5">
              <button
                onClick={() => {
                  setIsProfileMenuOpen(false);
                  onOpenSettings();
                }}
                className={`w-full text-left px-2.5 py-2 rounded-lg flex items-center gap-2 transition-colors cursor-pointer ${
                  isDarkMode
                    ? 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                    : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Sliders className="w-3.5 h-3.5 text-slate-400" />
                <span>Tercihler & Arayüz Ayarları</span>
              </button>

              <button
                onClick={() => {
                  setIsProfileMenuOpen(false);
                  onTabChange('vault');
                }}
                className="w-full text-left px-2.5 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800/60 flex items-center gap-2 transition-colors cursor-pointer"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
                <span>Bulut Senkronizasyonu & Cihazlar</span>
              </button>

              <div className="pt-1.5 border-t border-slate-800/80 mt-1.5">
                <button
                  onClick={() => {
                    setIsProfileMenuOpen(false);
                    if (onLogout) onLogout();
                  }}
                  className="w-full text-left px-2.5 py-2 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 flex items-center gap-2 transition-colors cursor-pointer font-medium"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Güvenli Çıkış Yap (Ekranı Kilitle)</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
