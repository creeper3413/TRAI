import React from 'react';
import { X, Moon, Sun, Volume2, Sliders, User, Sparkles, Check } from 'lucide-react';
import { AppSettings, AccentTheme } from '../types';
import { soundFx } from '../services/soundFx';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onUpdateSettings: (newSettings: Partial<AppSettings>) => void;
  soundEnabled: boolean;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  soundEnabled,
}) => {
  if (!isOpen) return null;

  const themes: Array<{ id: AccentTheme; name: string; color: string; desc: string }> = [
    { id: 'cyan', name: 'TRAİ Turkuaz', color: 'bg-cyan-400', desc: 'Canlı modern turkuaz' },
    { id: 'gold', name: 'Altın Amber', color: 'bg-amber-400', desc: 'Zarif sıcak amber sarısı' },
    { id: 'emerald', name: 'Zümrüt Yeşili', color: 'bg-emerald-400', desc: 'Doğal odaklanma yeşili' },
    { id: 'violet', name: 'Kozmik Mor', color: 'bg-violet-400', desc: 'Modern yaratıcı mor' },
  ];

  const userTitles = ['Ali Asker Bey', 'Ali Bey', 'Efendim', 'Ali'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-cyan-400" />
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              TRAİ Arayüz & Sistem Ayarları
            </h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Kapat"
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 1. Theme and Appearance */}
        <div className="space-y-3">
          <label className="text-xs font-mono uppercase tracking-wider text-slate-500 block">
            Arayüz Vurgu Teması
          </label>
          <div className="grid grid-cols-2 gap-3">
            {themes.map((th) => (
              <button
                key={th.id}
                type="button"
                onClick={() => {
                  soundFx.playClick(soundEnabled);
                  onUpdateSettings({ accentTheme: th.id });
                }}
                className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                  settings.accentTheme === th.id
                    ? 'border-cyan-400 bg-cyan-500/10 dark:bg-cyan-500/10'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className={`w-3.5 h-3.5 rounded-full ${th.color} shadow-xs`} />
                  <div>
                    <div className="text-xs font-semibold text-slate-900 dark:text-slate-100">{th.name}</div>
                    <div className="text-[10px] text-slate-500">{th.desc}</div>
                  </div>
                </div>
                {settings.accentTheme === th.id && <Check className="w-4 h-4 text-cyan-400" />}
              </button>
            ))}
          </div>
        </div>

        {/* 2. Dark / Light Mode */}
        <div className="space-y-2">
          <label className="text-xs font-mono uppercase tracking-wider text-slate-500 block">
            Görünüm Modu
          </label>
          <div className="flex items-center gap-2 p-1 bg-slate-100 dark:bg-slate-950 rounded-xl">
            <button
              type="button"
              onClick={() => onUpdateSettings({ isDarkMode: true })}
              className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium flex items-center justify-center gap-2 transition-colors cursor-pointer ${
                settings.isDarkMode
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              <Moon className="w-3.5 h-3.5" />
              <span>Karanlık Mod (Varsayılan)</span>
            </button>
            <button
              type="button"
              onClick={() => onUpdateSettings({ isDarkMode: false })}
              className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium flex items-center justify-center gap-2 transition-colors cursor-pointer ${
                !settings.isDarkMode
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              <Sun className="w-3.5 h-3.5" />
              <span>Aydınlık Mod</span>
            </button>
          </div>
        </div>

        {/* 3. User Title / Salutation */}
        <div className="space-y-2">
          <label className="text-xs font-mono uppercase tracking-wider text-slate-500 block">
            Size Hitap Biçimi
          </label>
          <div className="flex flex-wrap items-center gap-2">
            {userTitles.map((title) => (
              <button
                key={title}
                type="button"
                onClick={() => onUpdateSettings({ userTitle: title })}
                className={`px-3 py-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                  settings.userTitle === title
                    ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-semibold'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                {title}
              </button>
            ))}
            <input
              type="text"
              value={settings.userTitle}
              onChange={(e) => onUpdateSettings({ userTitle: e.target.value })}
              placeholder="Özel hitap..."
              className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-100 outline-none w-28"
            />
          </div>
        </div>

        {/* 4. Voice Engine & Audio Feedback */}
        <div className="space-y-4 pt-2 border-t border-slate-200 dark:border-slate-800">
          <label className="text-xs font-mono uppercase tracking-wider text-slate-500 block">
            Ses Motoru & Geri Bildirim
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-slate-500 block mb-1">TRAİ Ses Karakteri</span>
              <select
                value={settings.ttsVoice}
                onChange={(e) => onUpdateSettings({ ttsVoice: e.target.value as any })}
                className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 outline-none"
              >
                <option value="Fenrir">Fenrir (Klasik İngiliz Asistan / Tok ve Saygılı)</option>
                <option value="Kore">Kore (Berrak ve Akıcı)</option>
                <option value="Zephyr">Zephyr (Sıcak ve Dengeli)</option>
                <option value="Puck">Puck (Dinamik ve Hızlı)</option>
              </select>
            </div>

            <div>
              <span className="text-slate-500 block mb-1">Konuşma Hızı: {settings.speechRate}x</span>
              <input
                type="range"
                min="0.8"
                max="1.4"
                step="0.05"
                value={settings.speechRate}
                onChange={(e) => onUpdateSettings({ speechRate: parseFloat(e.target.value) })}
                className="w-full accent-cyan-400 cursor-pointer mt-2"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 cursor-pointer">
              <span className="text-xs font-medium text-slate-800 dark:text-slate-200">
                Fütüristik Arayüz Ses Efektleri (Web Audio Synthesizer)
              </span>
              <input
                type="checkbox"
                checked={settings.soundEnabled}
                onChange={(e) => onUpdateSettings({ soundEnabled: e.target.checked })}
                className="accent-cyan-400 w-4 h-4 cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 cursor-pointer">
              <span className="text-xs font-medium text-slate-800 dark:text-slate-200">
                Yanıtları Otomatik Seslendir (Auto-TTS)
              </span>
              <input
                type="checkbox"
                checked={settings.autoSpeak}
                onChange={(e) => onUpdateSettings({ autoSpeak: e.target.checked })}
                className="accent-cyan-400 w-4 h-4 cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 cursor-pointer">
              <span className="text-xs font-medium text-slate-800 dark:text-slate-200">
                "Hey Trai" Uyandırma Kelimesi Algılama (Sürekli Dinleme)
              </span>
              <input
                type="checkbox"
                checked={settings.wakeWordEnabled}
                onChange={(e) => onUpdateSettings({ wakeWordEnabled: e.target.checked })}
                className="accent-cyan-400 w-4 h-4 cursor-pointer"
              />
            </label>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-semibold cursor-pointer hover:opacity-90 transition-opacity"
          >
            Tamam
          </button>
        </div>
      </div>
    </div>
  );
};
