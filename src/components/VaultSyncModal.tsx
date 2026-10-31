import React, { useState } from 'react';
import {
  Cloud,
  Smartphone,
  Laptop,
  Globe,
  RefreshCw,
  Download,
  Upload,
  Check,
  Copy,
  Layers,
  ArrowRight,
  Database,
} from 'lucide-react';
import { AppSettings, PairedDevice, AccentTheme } from '../types';
import { soundFx } from '../services/soundFx';

interface VaultSyncModalProps {
  settings: AppSettings;
  pairedDevices: PairedDevice[];
  onSyncNow: () => Promise<void>;
  onPairNewSync: (syncId: string) => Promise<boolean>;
  onExportBackup: () => void;
  onImportBackup: (file: File) => Promise<boolean>;
  isSyncing: boolean;
  accent: AccentTheme;
  userTitle: string;
  soundEnabled: boolean;
}

export const VaultSyncModal: React.FC<VaultSyncModalProps> = ({
  settings,
  pairedDevices,
  onSyncNow,
  onPairNewSync,
  onExportBackup,
  onImportBackup,
  isSyncing,
  accent,
  userTitle,
  soundEnabled,
}) => {
  const [pairingCodeInput, setPairingCodeInput] = useState('');
  const [pairStatus, setPairStatus] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);

  const handlePair = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pairingCodeInput.trim()) return;

    setPairStatus('Cihaz eşleniyor...');
    const ok = await onPairNewSync(pairingCodeInput.trim());
    if (ok) {
      setPairStatus('Cihaz başarıyla bağlandı ve veriler eşitlendi.');
      soundFx.playConfirm(soundEnabled);
      setPairingCodeInput('');
    } else {
      setPairStatus('Hata: Belirtilen eşleme koduna ait veri bulunamadı.');
    }
  };

  const handleCopySyncId = () => {
    navigator.clipboard.writeText(settings.syncId);
    setCopiedCode(true);
    soundFx.playClick(soundEnabled);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const deviceIcons = {
    ios: Smartphone,
    android: Smartphone,
    windows: Laptop,
    mac: Laptop,
    web: Globe,
  };

  return (
    <div className="max-w-5xl mx-auto w-full space-y-6 pb-16">
      {/* Header */}
      <div className="rounded-2xl border border-slate-800/80 bg-[#0c1017]/90 p-6 sm:p-7 shadow-sm backdrop-blur-md">
        <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 uppercase tracking-wider mb-2">
          <Cloud className="w-4 h-4" />
          <span>TRAİ ÇAPRAZ PLATFORM SENKRONİZASYONU</span>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Bulut Senkronizasyonu & Cihazlar
            </h1>
            <p className="text-sm text-slate-400 mt-1 max-w-2xl leading-relaxed">
              {userTitle}, tüm görevleriniz, araştırma raporlarınız, kod parçacıklarınız ve sohbet geçmişiniz iPhone,
              Android ve Windows cihazlarınız arasında anlık ve güvenli olarak senkronize edilir.
            </p>
          </div>

          <button
            onClick={onSyncNow}
            disabled={isSyncing}
            className="px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-medium text-xs flex items-center gap-2 shrink-0 transition-all cursor-pointer shadow-sm disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Eşitleniyor...' : 'Şimdi Eşitle'}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Device Sync & Pairing Card */}
        <div className="rounded-2xl border border-slate-800/80 bg-[#0c1017]/90 p-6 flex flex-col justify-between shadow-sm">
          <div>
            <div className="flex items-center gap-2 text-xs font-medium text-slate-300 uppercase tracking-wider mb-3">
              <Laptop className="w-4 h-4 text-cyan-400" />
              <span>Bu Cihazın Eşleme Kodu</span>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              Diğer telefon veya bilgisayarınızdan aynı verilere erişmek için bu kimlik kodunu kullanabilirsiniz.
            </p>

            <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-950/80 border border-slate-800 font-mono text-xs text-cyan-300">
              <span className="flex-1 font-bold tracking-wider truncate">{settings.syncId}</span>
              <button
                type="button"
                onClick={handleCopySyncId}
                className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
                title="Kodu Kopyala"
              >
                {copiedCode ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>

            {/* Pair Another Device Form */}
            <form onSubmit={handlePair} className="mt-5 space-y-3">
              <label className="text-xs font-medium text-slate-300 block">
                Başka Bir Cihazı / Hesabı Eşle
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={pairingCodeInput}
                  onChange={(e) => setPairingCodeInput(e.target.value)}
                  placeholder="Eşleme Kodu (Örn: TRAI-SYNC-9218)"
                  className="flex-1 py-2 px-3 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder:text-slate-600 outline-none focus:border-cyan-500/70"
                />
                <button
                  type="submit"
                  disabled={!pairingCodeInput.trim() || isSyncing}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-40"
                >
                  <span>Bağla</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
              {pairStatus && (
                <p className="text-xs font-medium text-cyan-400 mt-1">{pairStatus}</p>
              )}
            </form>
          </div>

          <div className="pt-4 border-t border-slate-800/80 mt-6 flex items-center justify-between text-xs text-slate-400">
            <span>Son Başarılı Senkronizasyon:</span>
            <span className="text-slate-200 font-mono">
              {settings.lastSyncedAt
                ? new Date(settings.lastSyncedAt).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
                : 'Az önce'}
            </span>
          </div>
        </div>

        {/* Connected Devices List */}
        <div className="rounded-2xl border border-slate-800/80 bg-[#0c1017]/90 p-6 flex flex-col justify-between shadow-sm">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-xs font-medium text-slate-300 uppercase tracking-wider">
                <Smartphone className="w-4 h-4 text-emerald-400" />
                <span>Bağlı Cihazlar ({pairedDevices.length})</span>
              </div>
              <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>Canlı Bağlantı</span>
              </span>
            </div>

            <div className="space-y-2 mt-4 max-h-56 overflow-y-auto">
              {pairedDevices.map((dev) => {
                const IconComponent = deviceIcons[dev.type] || Globe;
                return (
                  <div
                    key={dev.id}
                    className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-cyan-400">
                        <IconComponent className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-medium text-slate-200 flex items-center gap-2">
                          <span>{dev.name}</span>
                          {dev.isCurrent && (
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                              Bu Cihaz
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-500 capitalize">{dev.type} Platformu</div>
                      </div>
                    </div>
                    <span className="text-[11px] text-slate-400">Aktif</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Backup Download & Upload */}
          <div className="pt-4 border-t border-slate-800/80 mt-6 flex items-center gap-3">
            <button
              onClick={onExportBackup}
              className="flex-1 py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-xs text-slate-200 flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-cyan-400" />
              <span>Yedek İndir (JSON)</span>
            </button>

            <label className="flex-1 py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-xs text-slate-200 flex items-center justify-center gap-2 transition-colors cursor-pointer">
              <Upload className="w-3.5 h-3.5 text-emerald-400" />
              <span>Yedek Yükle</span>
              <input
                type="file"
                accept=".json"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    onImportBackup(file);
                    e.target.value = '';
                  }
                }}
                className="hidden"
              />
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};
