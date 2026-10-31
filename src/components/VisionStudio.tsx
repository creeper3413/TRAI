import React, { useState, useRef } from 'react';
import { Camera, Upload, Sparkles, Volume2, Copy, Check, FileText, Cpu, Eye, Image as ImageIcon } from 'lucide-react';
import { VisionAnalysis, AccentTheme } from '../types';
import { speechService } from '../services/speech';
import { soundFx } from '../services/soundFx';

interface VisionStudioProps {
  analyses: VisionAnalysis[];
  onAnalyzePhoto: (
    imageBase64: string,
    mimeType: string,
    prompt: string,
    mode: 'general' | 'document' | 'technical'
  ) => Promise<void>;
  isLoading: boolean;
  accent: AccentTheme;
  userTitle: string;
  soundEnabled: boolean;
  ttsVoice: 'Fenrir' | 'Kore' | 'Zephyr' | 'Puck';
  speechRate: number;
}

export const VisionStudio: React.FC<VisionStudioProps> = ({
  analyses,
  onAnalyzePhoto,
  isLoading,
  accent,
  userTitle,
  soundEnabled,
  ttsVoice,
  speechRate,
}) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string>('image/jpeg');
  const [mode, setMode] = useState<'general' | 'document' | 'technical'>('general');
  const [customPrompt, setCustomPrompt] = useState('');
  const [copied, setCopied] = useState(false);
  const [isNarrating, setIsNarrating] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const activeAnalysis = analyses[0] || null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setMimeType(file.type || 'image/jpeg');
    const reader = new FileReader();
    reader.onload = (event) => {
      setSelectedImage(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRunAnalysis = async () => {
    if (!selectedImage || isLoading) return;
    soundFx.playClick(soundEnabled);
    await onAnalyzePhoto(selectedImage, mimeType, customPrompt, mode);
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

  // Quick preset sample images if user wants to test immediately
  const sampleImages = [
    {
      name: 'TRAİ Çekirdek Güç Ünitesi',
      url: '/src/assets/images/jarvis_arc_reactor_1792092883443.jpg',
      mode: 'technical' as const,
      prompt: 'Bu reaktör çekirdeğinin mekanik parçalarını ve enerji akış hatlarını analiz et.',
    },
  ];

  return (
    <div className="max-w-5xl mx-auto w-full space-y-6 pb-16">
      {/* Header */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 p-6 shadow-sm">
        <div className="flex items-center gap-2 text-xs font-mono text-slate-500 uppercase tracking-wider mb-2">
          <Eye className="w-3.5 h-3.5 text-cyan-400" />
          <span>TRAİ GÖRSEL ANALİZ STÜDYOSU</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100">
          Fotoğraf, Şema & Belge Analizi
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
          {userTitle}, incelemek istediğiniz bir fotoğrafı yükleyin veya kameradan aktarın. Optik sinir ağım
          nesneleri, diyagramları, metinleri ve teknik detayları anında çözecektir.
        </p>

        {/* Mode selector */}
        <div className="mt-5 flex flex-wrap items-center gap-2 text-xs">
          <button
            type="button"
            onClick={() => setMode('general')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 cursor-pointer transition-colors ${
              mode === 'general'
                ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-medium'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>Genel Görsel İnceleme</span>
          </button>
          <button
            type="button"
            onClick={() => setMode('document')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 cursor-pointer transition-colors ${
              mode === 'document'
                ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-medium'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Belge & Metin Çıkarımı (OCR)</span>
          </button>
          <button
            type="button"
            onClick={() => setMode('technical')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 cursor-pointer transition-colors ${
              mode === 'technical'
                ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-medium'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>Teknik Şema & Mimari Analizi</span>
          </button>
        </div>
      </div>

      {/* Upload and Workspace Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left Side: Upload & Image Preview */}
        <div className="space-y-4">
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-300 dark:border-slate-800 hover:border-cyan-400/50 rounded-2xl p-6 text-center cursor-pointer transition-all bg-white dark:bg-slate-900/60 min-h-[260px] flex flex-col items-center justify-center relative overflow-hidden group"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />

            {selectedImage ? (
              <div className="relative w-full h-64 rounded-xl overflow-hidden">
                <img
                  src={selectedImage}
                  alt="Analiz Edilecek Görsel"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-contain bg-slate-950/20"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-xs text-white font-medium">
                  Görseli Değiştirmek İçin Tıklayın
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-500 group-hover:text-cyan-400 transition-colors">
                  <Upload className="w-6 h-6" />
                </div>
                <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                  Fotoğraf Yükleyin veya Sürükleyin
                </p>
                <p className="text-xs text-slate-500">
                  PNG, JPG, WEBP formatları desteklenmektedir (Maksimum 20MB)
                </p>
              </div>
            )}
          </div>

          {/* Quick Preset Samples */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-500 font-mono">Hazır Numune:</span>
            {sampleImages.map((s, idx) => (
              <button
                key={idx}
                type="button"
                onClick={async () => {
                  try {
                    const res = await fetch(s.url);
                    const blob = await res.blob();
                    const reader = new FileReader();
                    reader.onloadend = () => {
                      setSelectedImage(reader.result as string);
                      setMimeType(blob.type || 'image/jpeg');
                      setMode(s.mode);
                      setCustomPrompt(s.prompt);
                    };
                    reader.readAsDataURL(blob);
                  } catch (e) {
                    setSelectedImage(s.url);
                  }
                }}
                className="px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
              >
                {s.name}
              </button>
            ))}
          </div>

          {/* Optional Prompt Input & Run Button */}
          <div className="space-y-2">
            <label className="text-xs font-mono text-slate-500 uppercase tracking-wide block">
              Özel İnceleme Sorusu (İsteğe Bağlı)
            </label>
            <input
              type="text"
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder="Örn: Bu görseldeki cihazın çalışma prensibini açıkla..."
              className="w-full text-sm p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 outline-none focus:border-cyan-400"
            />
            <button
              onClick={handleRunAnalysis}
              disabled={!selectedImage || isLoading}
              className={`w-full py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-40 disabled:cursor-not-allowed ${accentColor}`}
            >
              <Sparkles className="w-4 h-4" />
              <span>{isLoading ? 'Optik Çekirdek İnceliyor...' : 'Görseli Analiz Et'}</span>
            </button>
          </div>
        </div>

        {/* Right Side: Analysis Results */}
        <div>
          {activeAnalysis ? (
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-6 space-y-4 shadow-sm min-h-[360px]">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2 text-xs font-mono text-cyan-400">
                  <span>ANALİZ RAPORU</span>
                  <span aria-hidden="true">·</span>
                  <span>{activeAnalysis.mode.toUpperCase()}</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleNarrate(activeAnalysis.analysis)}
                    className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 hover:text-cyan-400 flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <Volume2 className={`w-3.5 h-3.5 ${isNarrating ? 'text-cyan-400 animate-pulse' : ''}`} />
                    <span>{isNarrating ? 'Durdur' : 'Sesli Oku'}</span>
                  </button>

                  <button
                    onClick={() => handleCopy(activeAnalysis.analysis)}
                    className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 hover:text-cyan-400 flex items-center gap-1 transition-colors cursor-pointer"
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

              <div className="whitespace-pre-wrap text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-sans max-h-[460px] overflow-y-auto pr-1">
                {activeAnalysis.analysis}
              </div>
            </div>
          ) : (
            <div className="h-full min-h-[320px] rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/40 p-8 flex flex-col items-center justify-center text-center">
              <Eye className="w-10 h-10 text-cyan-400/50 mb-3" />
              <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                Görsel Raporu Hazır Değil
              </h3>
              <p className="text-xs text-slate-500 mt-1 max-w-xs leading-relaxed">
                Sol taraftan bir fotoğraf veya şema yükleyip "Görseli Analiz Et" butonuna tıklayarak sonuçları görebilirsiniz.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
