import React, { useState, useEffect, useCallback } from 'react';
import { Header, ActiveTab } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { BottomBar } from './components/BottomBar';
import { MobileNav } from './components/MobileNav';
import { CommandCenterView } from './components/CommandCenterView';
import { ChatbotView } from './components/ChatbotView';
import { DailyOrganizer } from './components/DailyOrganizer';
import { CodeStudio } from './components/CodeStudio';
import { ResearchStudio } from './components/ResearchStudio';
import { VisionStudio } from './components/VisionStudio';
import { VaultSyncModal } from './components/VaultSyncModal';
import { VoiceAssistantModal } from './components/VoiceAssistantModal';
import { SettingsModal } from './components/SettingsModal';
import { LoginScreen } from './components/LoginScreen';

import {
  Task,
  DailyPlan,
  ChatMessage,
  ResearchReport,
  VisionAnalysis,
  CodeSnippet,
  SupportedLanguage,
  CodeCategory,
  AppSettings,
  PairedDevice,
} from './types';
import {
  SPACE_ARCADE_2099_HTML,
  CYBER_SNAKE_2099_HTML,
  CYBER_BREAKOUT_HTML,
} from './data/gameTemplates';
import { getClientPlatform, generateSyncId } from './services/platform';
import { speechService, SpeechState } from './services/speech';
import { soundFx } from './services/soundFx';

// Default initial settings
const DEFAULT_SETTINGS: AppSettings = {
  isDarkMode: false,
  accentTheme: 'cyan',
  userTitle: 'Ali Asker Bey',
  soundEnabled: true,
  autoSpeak: true,
  ttsVoice: 'Fenrir',
  wakeWordEnabled: false,
  speechRate: 1.0,
  compactMode: false,
  syncId: 'TRAI-SYNC-2026',
  lastSyncedAt: new Date().toISOString(),
};

// Initial welcome tasks
const INITIAL_TASKS: Task[] = [
  {
    id: 't-1',
    title: 'Günlük İş Planı ve Önceliklerin Belirlenmesi',
    time: '09:30',
    date: new Date().toISOString().split('T')[0],
    priority: 'high',
    category: 'deep_work',
    completed: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 't-2',
    title: 'Çoklu Cihaz Senkronizasyonu (iPhone, Android & Windows)',
    time: '12:00',
    date: new Date().toISOString().split('T')[0],
    priority: 'high',
    category: 'routine',
    completed: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 't-3',
    title: 'Yazılım & Oyun Geliştirme İncelemesi',
    time: '14:00',
    date: new Date().toISOString().split('T')[0],
    priority: 'medium',
    category: 'deep_work',
    completed: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 't-4',
    title: 'Teknoloji Araştırması ve Günün Değerlendirmesi',
    time: '16:30',
    date: new Date().toISOString().split('T')[0],
    priority: 'high',
    category: 'urgent',
    completed: false,
    createdAt: new Date().toISOString(),
  },
];

// Initial pre-configured plan
const INITIAL_PLAN: DailyPlan = {
  date: new Date().toISOString().split('T')[0],
  briefing:
    'Merhaba Ali Asker Bey! Çalışma alanınız hazır. Günlük görevlerinizi ve önceliklerinizi düzenledim; matematiksel hesaplamalarınız, kod ve oyun stüdyonuz ile araştırma araçlarınız emrinize amade. Bugün nasıl ilerlemek istersiniz?',
  focusRecommendation: 'En önemli işlerinize odaklanarak günü huzurlu ve verimli şekilde tamamlamak.',
  energyStrategy: 'Öğleden sonraki derin odaklanma öncesinde 15-20 dakikalık bir kahve ve dinlenme molası iyi gelecektir.',
  schedule: [
    {
      time: '09:30 - 10:30',
      title: 'İş Planı & Hedef Belirleme',
      category: 'deep_work',
      priority: 'high',
      note: 'Günün en kritik işlerine odaklanma zamanı.',
    },
    {
      time: '12:00 - 13:00',
      title: 'Cihaz Senkronizasyonu & İletişim',
      category: 'routine',
      priority: 'high',
      note: 'Mobil ve masaüstü cihazlar arasındaki veri akışı kontrolü.',
    },
    {
      time: '14:00 - 15:30',
      title: 'Kod & Oyun Stüdyosu Çalışması',
      category: 'deep_work',
      priority: 'medium',
      note: 'Yeni yazılım veya oyun projelerini test etme.',
    },
    {
      time: '16:30 - 17:30',
      title: 'Stratejik İnceleme & Raporlama',
      category: 'urgent',
      priority: 'high',
      note: 'Günün özetini çıkarma ve yarını planlama.',
    },
  ],
  updatedAt: new Date().toISOString(),
};

// Initial welcome chat messages
const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: 'm-1',
    role: 'assistant',
    content:
      'Merhaba Ali Asker Bey! Ben TRAİ, kişisel yapay zeka asistanınız ve çalışma ortağınızım. Matematiksel işlemlerden HTML5 oyunlarına, Python/React yazılımlarından günlük ajandanıza ve derin araştırmalara kadar her konuda size bir insan titizliği ve samimiyetiyle yardımcı olmak için buradayım.\n\nBugün ne yapmak istersiniz?',
    timestamp: new Date().toISOString(),
  },
];

// Initial pre-configured code snippets with interactive Games
const INITIAL_SNIPPETS: CodeSnippet[] = [
  {
    id: 'snip-game-1',
    prompt: 'HTML5 Canvas ve Web Audio API ile Retro Neon Uzay Gemisi Savaşı (Space Arcade 2099)',
    language: 'game',
    category: 'game',
    code: SPACE_ARCADE_2099_HTML,
    explanation: 'Çift plazma lazerli uzay gemisi, gelen meteoroidler ve düşman insansız hava araçları, partikül patlama efektleri, kalkan göstergesi ve Web Audio yerel synth ses efektleri ile tam teşekküllü 60 FPS HTML5 Canvas arcade oyunu.',
    filename: 'SpaceArcade2099.html',
    runnable: true,
    timestamp: new Date().toISOString(),
  },
  {
    id: 'snip-game-2',
    prompt: 'HTML5 Canvas ile Neon Izgara Üzerinde Hızlanan Cyber Yılan Oyunu',
    language: 'game',
    category: 'game',
    code: CYBER_SNAKE_2099_HTML,
    explanation: 'Neon ızgarada enerji orblarını toplayarak uzayan siber yılan oyunu. Süper altın meyveler, partikül izleri, en yüksek skor takibi ve klavye/dokunmatik kontroller içerir.',
    filename: 'CyberSnake2099.html',
    runnable: true,
    timestamp: new Date().toISOString(),
  },
  {
    id: 'snip-game-3',
    prompt: 'HTML5 Canvas ile Kuantum Foton Topu Tuğla Kırıcı (Cyber Breakout)',
    language: 'game',
    category: 'game',
    code: CYBER_BREAKOUT_HTML,
    explanation: 'Renkli neon siber tuğlalar, raket açı fiziği, foton enerji topu ve tuğla parçalanma partikülleri ile donatılmış klasik Breakout oyunu.',
    filename: 'CyberBreakout.html',
    runnable: true,
    timestamp: new Date().toISOString(),
  },
  {
    id: 'snip-1',
    prompt: 'Python ile Makine Öğrenimi Anomali Tespiti ve Veri Filtreleme',
    language: 'python',
    category: 'ai',
    code: `import numpy as np
import time

class TraiDataFilter:
    """TRAİ Anomali Tespit & Veri Filtreleme Modülü"""
    def __init__(self, threshold: float = 2.5):
        self.threshold = threshold
        self.history = []
        print("[TRAİ] Veri filtresi hazırlandı.")

    def analyze_stream(self, data_points: list[float]) -> dict:
        arr = np.array(data_points)
        mean = np.mean(arr)
        std = np.std(arr) or 1.0
        z_scores = (arr - mean) / std
        anomalies = np.where(np.abs(z_scores) > self.threshold)[0]
        
        return {
            "mean": round(float(mean), 4),
            "std_dev": round(float(std), 4),
            "anomaly_indices": anomalies.tolist(),
            "status": "NOMINAL" if len(anomalies) == 0 else "WARNING"
        }

if __name__ == "__main__":
    detector = TraiDataFilter(threshold=2.0)
    sample_stream = [10.2, 10.5, 10.1, 10.4, 28.7, 10.3, 9.9, 10.2]
    report = detector.analyze_stream(sample_stream)
    print("Veri Analiz Raporu:", report)`,
    explanation: 'Z-score istatistiksel modeli ile telemetri akışında anomali tespit eden optimize edilmiş Python sınıfı. Sıfıra bölme koruması ve JSON uyumlu çıktı içerir.',
    filename: 'veri_filtreleme.py',
    runnable: true,
    timestamp: new Date().toISOString(),
  },
  {
    id: 'snip-2',
    prompt: 'Canlı Önizlemeli Stark Arc HUD Paneli',
    language: 'html',
    category: 'web',
    code: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    @keyframes spin-slow { 100% { transform: rotate(360deg); } }
    .spin-slow { animation: spin-slow 12s linear infinite; }
  </style>
</head>
<body class="bg-gray-950 text-cyan-400 p-8 flex items-center justify-center min-h-[360px]">
  <div class="relative p-6 rounded-2xl border border-cyan-500/40 bg-gray-900/90 shadow-[0_0_30px_rgba(6,182,212,0.3)] w-80 text-center">
    <div class="w-24 h-24 mx-auto mb-4 relative flex items-center justify-center">
      <div class="absolute inset-0 rounded-full border-2 border-dashed border-cyan-400 spin-slow"></div>
      <div class="w-16 h-16 rounded-full bg-cyan-500/20 flex items-center justify-center border border-cyan-300">
        <span class="font-mono text-xs font-bold text-white">CORE</span>
      </div>
    </div>
    <h3 class="text-sm font-mono tracking-widest uppercase mb-1">STARK TELEMETRY</h3>
    <p class="text-xs text-slate-400 mb-3">Reaktör Çekirdeği: %99.8 Stabilite</p>
    <div class="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
      <div class="bg-cyan-400 h-full w-[94%]"></div>
    </div>
  </div>
</body>
</html>`,
    explanation: 'Canlı çalıştırılabilir HTML ve Tailwind CSS fütüristik Stark Arc HUD telemetri paneli.',
    filename: 'StarkHUD.html',
    runnable: true,
    timestamp: new Date().toISOString(),
  },
];

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem('trai_session_active') === 'true' || sessionStorage.getItem('jarvis_session_active') === 'true';
    } catch {
      return false;
    }
  });

  const [operatorProfile, setOperatorProfile] = useState<{ email: string; name: string; title: string }>(() => {
    try {
      const stored = localStorage.getItem('trai_operator') || localStorage.getItem('jarvis_operator');
      return stored
        ? JSON.parse(stored)
        : { email: 'aliaskervuran13@gmail.com', name: 'Ali Asker Vuran', title: 'Ali' };
    } catch {
      return { email: 'aliaskervuran13@gmail.com', name: 'Ali Asker Vuran', title: 'Ali' };
    }
  });

  const handleLogin = (data: { email: string; name: string; title: string }) => {
    setIsAuthenticated(true);
    const updated = {
      email: data.email,
      name: data.name,
      title: data.title || 'Ali',
    };
    setOperatorProfile(updated);
    try {
      sessionStorage.setItem('trai_session_active', 'true');
      localStorage.setItem('trai_operator', JSON.stringify(updated));
    } catch (e) {
      console.warn(e);
    }
    soundFx.playConfirm(settings.soundEnabled);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    try {
      sessionStorage.removeItem('trai_session_active');
      sessionStorage.removeItem('jarvis_session_active');
    } catch (e) {
      console.warn(e);
    }
    soundFx.playClick(settings.soundEnabled);
  };

  const [activeTab, setActiveTab] = useState<ActiveTab>('command');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isFocusMode, setIsFocusMode] = useState(false);

  const [settings, setSettings] = useState<AppSettings>(() => {
    try {
      const stored = localStorage.getItem('trai_settings') || localStorage.getItem('jarvis_settings');
      if (stored) {
        const parsed = JSON.parse(stored);
        // User requested white decor, default isDarkMode to false
        return { ...DEFAULT_SETTINGS, ...parsed, isDarkMode: parsed.isDarkMode === true ? false : false };
      }
      return DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  const [tasks, setTasks] = useState<Task[]>(() => {
    try {
      const stored = localStorage.getItem('trai_tasks') || localStorage.getItem('jarvis_tasks');
      return stored ? JSON.parse(stored) : INITIAL_TASKS;
    } catch {
      return INITIAL_TASKS;
    }
  });

  const [dailyPlan, setDailyPlan] = useState<DailyPlan | null>(() => {
    try {
      const stored = localStorage.getItem('trai_plan') || localStorage.getItem('jarvis_plan');
      return stored ? JSON.parse(stored) : INITIAL_PLAN;
    } catch {
      return INITIAL_PLAN;
    }
  });

  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const stored = localStorage.getItem('trai_messages') || localStorage.getItem('jarvis_messages');
      return stored ? JSON.parse(stored) : INITIAL_MESSAGES;
    } catch {
      return INITIAL_MESSAGES;
    }
  });

  const [snippets, setSnippets] = useState<CodeSnippet[]>(() => {
    try {
      const stored = localStorage.getItem('trai_snippets') || localStorage.getItem('jarvis_snippets');
      return stored ? JSON.parse(stored) : INITIAL_SNIPPETS;
    } catch {
      return INITIAL_SNIPPETS;
    }
  });

  const [reports, setReports] = useState<ResearchReport[]>(() => {
    try {
      const stored = localStorage.getItem('trai_reports') || localStorage.getItem('jarvis_reports');
      return stored
        ? JSON.parse(stored)
        : [
            {
              id: 'rep-1',
              query: 'Yapay Zeka Destekli Otonom Kodlama ve Büyük Dil Modelleri Mimarisi',
              depth: 'standard' as const,
              report:
                '### 1. Yönetici Özeti (Executive Briefing)\nYapay zeka modellerinin kodlama ve mantık yürütme yetenekleri, yazılım geliştirme süreçlerini kökten dönüştürmektedir. 2026 yılı itibarıyla yapay zeka asistanları yalnızca kod tamamlamakla kalmayıp, karmaşık mimarileri tasarlamakta ve sıfırdan güvenilir yazılım modülleri üretebilmektedir.\n\n### 2. Temel Bulgular ve Kritik Analiz\n- Gelişmiş bağlam pencereleri ve akıl yürütme modelleri sayesinde çok dosyalı projelerde hata tespiti ve performans optimizasyonu dakikalar içinde tamamlanmaktadır.\n- Python, TypeScript ve Rust gibi modern dillerde kod kalitesi insan uzman standartlarına yaklaşmıştır.\n\n### 3. Somut Eylem Planı & Öneriler\n- Tekrarlayan algoritmik görevleri ve API entegrasyonlarını yapay zeka kodlama stüdyosuna devredin.\n- Canlı çalışma alanı (sandbox) ortamlarında üretilen kodları otomatik testlerden geçirin.',
              timestamp: new Date().toISOString(),
            },
          ];
    } catch {
      return [];
    }
  });

  const [analyses, setAnalyses] = useState<VisionAnalysis[]>([]);
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [isCodeLoading, setIsCodeLoading] = useState(false);
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);
  const [isResearchLoading, setIsResearchLoading] = useState(false);
  const [isVisionLoading, setIsVisionLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [speechState, setSpeechState] = useState<SpeechState>('idle');
  const [isPlayingBriefing, setIsPlayingBriefing] = useState(false);

  const [pairedDevices, setPairedDevices] = useState<PairedDevice[]>([
    {
      id: 'dev-current',
      name: `Bu Cihaz (${getClientPlatform().toUpperCase()})`,
      type: getClientPlatform(),
      lastSeen: new Date().toISOString(),
      isCurrent: true,
    },
    {
      id: 'dev-iphone',
      name: 'iPhone 16 Pro (Ali)',
      type: 'ios',
      lastSeen: new Date(Date.now() - 1000 * 60 * 14).toISOString(),
    },
    {
      id: 'dev-windows',
      name: 'Windows 11 Workstation (Stark Lab)',
      type: 'windows',
      lastSeen: new Date(Date.now() - 1000 * 60 * 42).toISOString(),
    },
    {
      id: 'dev-android',
      name: 'Samsung Galaxy Tab S9',
      type: 'android',
      lastSeen: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
    },
  ]);

  // Synchronize HTML dark mode class
  useEffect(() => {
    const root = document.documentElement;
    if (settings.isDarkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [settings.isDarkMode]);

  // Save settings to localStorage
  useEffect(() => {
    localStorage.setItem('trai_settings', JSON.stringify(settings));
    localStorage.setItem('jarvis_settings', JSON.stringify(settings));
  }, [settings]);

  // Save tasks, plan, messages, snippets to localStorage
  useEffect(() => {
    localStorage.setItem('trai_tasks', JSON.stringify(tasks));
    localStorage.setItem('jarvis_tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    if (dailyPlan) {
      localStorage.setItem('trai_plan', JSON.stringify(dailyPlan));
      localStorage.setItem('jarvis_plan', JSON.stringify(dailyPlan));
    }
  }, [dailyPlan]);

  useEffect(() => {
    localStorage.setItem('trai_messages', JSON.stringify(messages));
    localStorage.setItem('jarvis_messages', JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    localStorage.setItem('trai_snippets', JSON.stringify(snippets));
    localStorage.setItem('jarvis_snippets', JSON.stringify(snippets));
  }, [snippets]);

  useEffect(() => {
    localStorage.setItem('trai_reports', JSON.stringify(reports));
    localStorage.setItem('jarvis_reports', JSON.stringify(reports));
  }, [reports]);

  // Speech state subscription
  useEffect(() => {
    return speechService.subscribeState((st) => setSpeechState(st));
  }, []);

  // Cloud Sync function: Synchronizes tasks, plans, snippets, reports across devices
  const performCloudSync = useCallback(async () => {
    setIsSyncing(true);

    try {
      const payload = {
        tasks,
        dailyPlan,
        messages: messages.slice(-20),
        snippets,
        reports,
        updatedAt: new Date().toISOString(),
      };

      const res = await fetch('/api/sync/vault/push', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          syncId: settings.syncId,
          data: payload,
          deviceId: 'dev-' + getClientPlatform(),
          deviceName: `${getClientPlatform().toUpperCase()} Cihazı`,
          deviceType: getClientPlatform(),
        }),
      });

      if (res.ok) {
        setSettings((prev) => ({ ...prev, lastSyncedAt: new Date().toISOString() }));
      }
    } catch (e) {
      console.warn('Sync failed:', e);
    } finally {
      setIsSyncing(false);
    }
  }, [tasks, dailyPlan, messages, snippets, reports, settings.syncId]);

  // Continuous Wake Word listening if enabled
  useEffect(() => {
    if (settings.wakeWordEnabled && !isVoiceModalOpen) {
      speechService.startListening(
        (text) => {
          const lower = text.toLowerCase();
          if (lower.includes('trai') || lower.includes('hey trai') || lower.includes('merhaba trai') || lower.includes('jarvis') || lower.includes('hey jarvis')) {
            soundFx.playTraiWake(settings.soundEnabled);
            setIsVoiceModalOpen(true);
          }
        },
        () => {
          soundFx.playTraiWake(settings.soundEnabled);
          setIsVoiceModalOpen(true);
        }
      );
    }
    return () => {
      if (!isVoiceModalOpen) {
        speechService.stopListening();
      }
    };
  }, [settings.wakeWordEnabled, isVoiceModalOpen, settings.soundEnabled]);

  // Send message to TRAİ
  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return;

    const userMsg: ChatMessage = {
      id: 'm-' + Date.now(),
      role: 'user',
      content: text,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsChatLoading(true);

    try {
      const res = await fetch('/api/trai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          conversationHistory: messages.slice(-6),
          userTitle: settings.userTitle,
          systemContext: {
            activeTasksCount: tasks.filter((t) => !t.completed).length,
            time: new Date().toLocaleTimeString(),
          },
        }),
      });

      const data = await res.json();
      const replyText = data.reply || `${settings.userTitle}, komutunuz işlendi.`;

      const assistantMsg: ChatMessage = {
        id: 'm-' + (Date.now() + 1),
        role: 'assistant',
        content: replyText,
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, assistantMsg]);

      if (settings.autoSpeak) {
        const cleanSpoken = replyText.replace(/```[\s\S]*?```/g, ' [kod bloğu üretildi] ');
        speechService.speak(cleanSpoken, settings.ttsVoice, settings.speechRate);
      }
    } catch (e: any) {
      const errMsg: ChatMessage = {
        id: 'm-' + (Date.now() + 1),
        role: 'assistant',
        content: `${settings.userTitle}, iletişim protokolünde bir kesinti yaşandı: ${e?.message || 'Bağlantı hatası'}.`,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setIsChatLoading(false);
    }
  };

  // Generate Code & Game Handler
  const handleGenerateCode = async (
    prompt: string,
    language: SupportedLanguage,
    mode: 'generate' | 'debug' | 'explain' | 'optimize',
    existingCode?: string,
    category?: CodeCategory
  ) => {
    setIsCodeLoading(true);
    soundFx.playClick(settings.soundEnabled);
    try {
      const isGame = category === 'game' || language === 'game' || prompt.toLowerCase().includes('oyun') || prompt.toLowerCase().includes('game');
      const effCategory = category || (isGame ? 'game' : 'general');
      const effLang = isGame ? 'game' : language;

      const res = await fetch('/api/trai/code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          language: effLang,
          mode,
          category: effCategory,
          existingCode,
          userTitle: settings.userTitle,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const newSnippet: CodeSnippet = {
          id: 'snip-' + Date.now(),
          prompt,
          language: data.language || effLang,
          category: data.category || effCategory,
          code: data.code || '// Kod üretilemedi',
          explanation: data.explanation || (isGame ? 'HTML5 Canvas oyun motoru derlendi.' : 'Kod başarıyla oluşturuldu.'),
          filename: data.filename || (isGame ? 'CyberGame.html' : `script.${language === 'python' ? 'py' : 'ts'}`),
          runnable: data.runnable ?? true,
          timestamp: new Date().toISOString(),
        };

        setSnippets((prev) => [newSnippet, ...prev]);
        soundFx.playConfirm(settings.soundEnabled);

        if (settings.autoSpeak) {
          const typeName = isGame ? 'oyun motoru projesi' : `${language} kodu`;
          speechService.speak(
            `${settings.userTitle}, istediğiniz ${typeName} stüdyoya aktarıldı.`,
            settings.ttsVoice,
            settings.speechRate
          );
        }
      }
    } catch (e) {
      console.warn('Code generation failed:', e);
    } finally {
      setIsCodeLoading(false);
    }
  };

  const handleUpdateSnippet = (id: string, updatedCode: string) => {
    setSnippets((prev) =>
      prev.map((s) => (s.id === id ? { ...s, code: updatedCode } : s))
    );
  };

  const handleDeleteSnippet = (id: string) => {
    setSnippets((prev) => prev.filter((s) => s.id !== id));
    soundFx.playClick(settings.soundEnabled);
  };

  const handleAddSnippet = (newSnippet: CodeSnippet) => {
    setSnippets((prev) => [newSnippet, ...prev]);
    soundFx.playConfirm(settings.soundEnabled);
  };

  // Voice Command Dispatcher
  const handleVoiceCommand = async (command: string): Promise<string> => {
    const lower = command.toLowerCase();

    // Research request
    if (lower.includes('araştır') || lower.includes('araştırma') || lower.includes('istihbarat') || lower.includes('bilgi topla') || lower.includes('rapor')) {
      setActiveTab('research');
      const cleanTopic = command
        .replace(/trai|jarvis/gi, '')
        .replace(/araştırma yap/gi, '')
        .replace(/araştır/gi, '')
        .replace(/hakkında bilgi topla/gi, '')
        .trim() || 'Yapay Zeka ve Geleceğin Teknolojileri';
      await handleExecuteResearch(cleanTopic, 'standard');
      return `${settings.userTitle}, "${cleanTopic}" konusundaki araştırma raporunuz hazırlandı ve stüdyoya aktarıldı.`;
    }

    // Coding & Game request
    if (lower.includes('oyun') || lower.includes('game') || lower.includes('kod') || lower.includes('yazılım') || lower.includes('script') || lower.includes('python') || lower.includes('react') || lower.includes('html') || lower.includes('fonksiyon') || lower.includes('algoritma')) {
      setActiveTab('code');
      const isGame = lower.includes('oyun') || lower.includes('game');
      const cleanPrompt = command.replace(/trai|jarvis/gi, '').trim() || (isGame ? 'HTML5 Canvas Retro Arcade Uzay Oyunu' : 'Python Veri Analizi Scripti');
      let lang: SupportedLanguage = isGame ? 'game' : 'python';
      if (!isGame) {
        if (lower.includes('react') || lower.includes('tsx') || lower.includes('jsx')) lang = 'react';
        else if (lower.includes('html') || lower.includes('css')) lang = 'html';
        else if (lower.includes('typescript') || lower.includes('ts')) lang = 'typescript';
        else if (lower.includes('sql') || lower.includes('veritabanı')) lang = 'sql';
      }
      await handleGenerateCode(cleanPrompt, lang, 'generate', undefined, isGame ? 'game' : 'general');
      return `${settings.userTitle}, kod & oyun stüdyosuna geçiş yaptık ve istediğiniz ${isGame ? 'oyun projesini' : lang + ' yazılımını'} hazırladım.`;
    }

    // Task request
    if (lower.includes('ekle') || lower.includes('görev')) {
      const newTask: Task = {
        id: 't-' + Date.now(),
        title: command.replace(/trai|jarvis/gi, '').replace(/görev ekle/gi, '').trim() || 'Yeni Sesli Görev',
        date: new Date().toISOString().split('T')[0],
        priority: 'high',
        category: 'deep_work',
        completed: false,
        createdAt: new Date().toISOString(),
      };
      setTasks((prev) => [newTask, ...prev]);
      soundFx.playConfirm(settings.soundEnabled);
      return `${settings.userTitle}, "${newTask.title}" görevinizi ajandanıza memnuniyetle kaydettim.`;
    }

    // General chat
    const res = await fetch('/api/trai/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: command,
        conversationHistory: messages.slice(-4),
        userTitle: settings.userTitle,
      }),
    });

    const data = await res.json();
    const reply = data.reply || `${settings.userTitle}, komutunuz yerine getirildi.`;

    const assistantMsg: ChatMessage = {
      id: 'm-' + Date.now(),
      role: 'assistant',
      content: reply,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, assistantMsg]);

    return reply;
  };

  // Play Briefing
  const handlePlayBriefing = async () => {
    if (!dailyPlan?.briefing) return;
    if (isPlayingBriefing) {
      speechService.stopSpeaking();
      setIsPlayingBriefing(false);
      return;
    }

    setIsPlayingBriefing(true);
    await speechService.speak(dailyPlan.briefing, settings.ttsVoice, settings.speechRate);
    setIsPlayingBriefing(false);
  };

  // Generate AI Day Plan
  const handleGeneratePlan = async () => {
    setIsGeneratingPlan(true);
    soundFx.playClick(settings.soundEnabled);

    try {
      const res = await fetch('/api/trai/organize-day', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tasks,
          preferences: { tone: 'executive', breaks: 'frequent' },
          userTitle: settings.userTitle,
        }),
      });

      if (res.ok) {
        const planData = await res.json();
        const newPlan: DailyPlan = {
          date: new Date().toISOString().split('T')[0],
          briefing: planData.briefing || 'Gününüz optimize edildi efendim.',
          focusRecommendation: planData.focusRecommendation || 'En yüksek öncelikli görevlere odaklanın.',
          energyStrategy: planData.energyStrategy || 'Düzenli aralıklarla mola verin.',
          schedule: planData.schedule || [],
          updatedAt: new Date().toISOString(),
        };
        setDailyPlan(newPlan);
        soundFx.playConfirm(settings.soundEnabled);

        if (settings.autoSpeak && newPlan.briefing) {
          speechService.speak(newPlan.briefing, settings.ttsVoice, settings.speechRate);
        }
      }
    } catch (e) {
      console.warn('Failed to organize day:', e);
    } finally {
      setIsGeneratingPlan(false);
    }
  };

  // Execute Deep Research
  const handleExecuteResearch = async (query: string, depth: 'summary' | 'standard' | 'comprehensive') => {
    setIsResearchLoading(true);

    try {
      const res = await fetch('/api/trai/research', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query,
          depth,
          userTitle: settings.userTitle,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const newReport: ResearchReport = {
          id: 'rep-' + Date.now(),
          query,
          depth,
          report: data.report || 'Rapor oluşturulamadı.',
          timestamp: new Date().toISOString(),
        };
        setReports((prev) => [newReport, ...prev]);
        soundFx.playConfirm(settings.soundEnabled);

        if (settings.autoSpeak) {
          speechService.speak(
            `${settings.userTitle}, "${query}" konulu araştırma raporunuz tamamlandı.`,
            settings.ttsVoice,
            settings.speechRate
          );
        }
      }
    } catch (e) {
      console.warn('Research failed:', e);
    } finally {
      setIsResearchLoading(false);
    }
  };

  // Analyze Photo
  const handleAnalyzePhoto = async (
    imageBase64: string,
    mimeType: string,
    prompt: string,
    mode: 'general' | 'document' | 'technical'
  ) => {
    setIsVisionLoading(true);

    try {
      const res = await fetch('/api/trai/analyze-photo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64,
          mimeType,
          prompt,
          mode,
          userTitle: settings.userTitle,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const newAnalysis: VisionAnalysis = {
          id: 'vis-' + Date.now(),
          imageUrl: imageBase64,
          prompt,
          mode,
          analysis: data.analysis || 'Görsel analizi tamamlandı.',
          timestamp: new Date().toISOString(),
        };
        setAnalyses((prev) => [newAnalysis, ...prev]);
        soundFx.playConfirm(settings.soundEnabled);

        if (settings.autoSpeak) {
          speechService.speak(
            `${settings.userTitle}, görsel incelemesi tamamlandı. Sonuçları ekranda görebilirsiniz.`,
            settings.ttsVoice,
            settings.speechRate
          );
        }
      }
    } catch (e) {
      console.warn('Vision failed:', e);
    } finally {
      setIsVisionLoading(false);
    }
  };

  // Pair new sync from another device
  const handlePairNewSync = async (syncId: string): Promise<boolean> => {
    try {
      const res = await fetch(`/api/sync/vault/pull?syncId=${encodeURIComponent(syncId)}`);
      if (!res.ok) return false;

      const data = await res.json();
      const content = data.data || data.vault;
      if (!content) return false;

      if (content.tasks) setTasks(content.tasks);
      if (content.dailyPlan) setDailyPlan(content.dailyPlan);
      if (content.messages) setMessages(content.messages);
      if (content.snippets) setSnippets(content.snippets);
      if (content.reports) setReports(content.reports);

      setSettings((prev) => ({
        ...prev,
        syncId,
        lastSyncedAt: new Date().toISOString(),
      }));

      if (data.pairedDevices) {
        setPairedDevices(data.pairedDevices);
      }
      return true;
    } catch (err) {
      console.error('Pairing failed:', err);
      return false;
    }
  };

  // Export JSON backup file
  const handleExportBackup = () => {
    const payload = { tasks, dailyPlan, messages, snippets, reports, exportedAt: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `TRAI_Yedek_${settings.syncId}.json`;
    a.click();
    URL.revokeObjectURL(url);
    soundFx.playConfirm(settings.soundEnabled);
  };

  // Import JSON backup file
  const handleImportBackup = async (file: File): Promise<boolean> => {
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      if (parsed) {
        if (parsed.tasks) setTasks(parsed.tasks);
        if (parsed.dailyPlan) setDailyPlan(parsed.dailyPlan);
        if (parsed.messages) setMessages(parsed.messages);
        if (parsed.snippets) setSnippets(parsed.snippets);
        if (parsed.reports) setReports(parsed.reports);
        soundFx.playConfirm(settings.soundEnabled);
        return true;
      }
      return false;
    } catch (e) {
      alert('Yedek dosyası okunamadı. Geçerli bir JSON dosyası seçiniz.');
      return false;
    }
  };

  if (!isAuthenticated) {
    return (
      <LoginScreen
        onLogin={handleLogin}
        accent={settings.accentTheme}
        initialEmail={operatorProfile.email}
        initialTitle={operatorProfile.title}
        soundEnabled={settings.soundEnabled}
      />
    );
  }

  return (
    <div className={`min-h-screen ${settings.isDarkMode ? 'bg-[#07090e] text-slate-100' : 'bg-slate-50 text-slate-900'} flex font-sans antialiased selection:bg-cyan-500/25 selection:text-cyan-800 transition-colors`}>
      
      {/* 1. Left HUD Sidebar (Command Center Style) */}
      <Sidebar
        activeTab={activeTab}
        onTabChange={(tab) => {
          soundFx.playClick(settings.soundEnabled);
          setActiveTab(tab);
        }}
        accent={settings.accentTheme}
        isVoiceActive={isVoiceModalOpen || speechState === 'listening'}
        onToggleVoice={() => {
          soundFx.playTraiWake(settings.soundEnabled);
          setIsVoiceModalOpen(!isVoiceModalOpen);
        }}
        activeTasksCount={tasks.filter((t) => !t.completed).length}
        isOpenMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
        onToggleFocusMode={() => setIsFocusMode(!isFocusMode)}
        isFocusMode={isFocusMode}
        isDarkMode={settings.isDarkMode}
      />

      {/* 2. Main Center & Right Body */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top HUD Header with Digital Seconds Clock & Operator Profile */}
        <Header
          activeTab={activeTab}
          onTabChange={(tab) => {
            soundFx.playClick(settings.soundEnabled);
            setActiveTab(tab);
          }}
          accent={settings.accentTheme}
          isDarkMode={settings.isDarkMode}
          onToggleDarkMode={() => {
            soundFx.playClick(settings.soundEnabled);
            setSettings((prev) => ({ ...prev, isDarkMode: !prev.isDarkMode }));
          }}
          onOpenSettings={() => {
            soundFx.playClick(settings.soundEnabled);
            setIsSettingsOpen(true);
          }}
          isVoiceActive={isVoiceModalOpen || speechState === 'listening'}
          onToggleVoice={() => {
            soundFx.playTraiWake(settings.soundEnabled);
            setIsVoiceModalOpen(!isVoiceModalOpen);
          }}
          userTitle={settings.userTitle}
          userName={operatorProfile.name}
          userEmail={operatorProfile.email}
          onOpenMobileMenu={() => setIsMobileSidebarOpen(true)}
          onLogout={handleLogout}
        />

        {/* View Content Viewport */}
        <main className="flex-1 p-4 sm:p-6 pb-28 overflow-y-auto">
          {activeTab === 'command' && (
            <CommandCenterView
              accent={settings.accentTheme}
              userTitle={settings.userTitle}
              tasks={tasks}
              dailyPlan={dailyPlan}
              onNavigateTab={(tab) => {
                soundFx.playClick(settings.soundEnabled);
                setActiveTab(tab);
              }}
              onToggleVoice={() => {
                soundFx.playTraiWake(settings.soundEnabled);
                setIsVoiceModalOpen(!isVoiceModalOpen);
              }}
              isVoiceActive={isVoiceModalOpen || speechState === 'listening'}
              onPlayBriefing={handlePlayBriefing}
              onQuickCommand={handleVoiceCommand}
              onSendToCodeStudio={(code, lang, filename) => {
                setActiveTab('code');
                const newSnip: CodeSnippet = {
                  id: 'snip-' + Date.now(),
                  prompt: 'Ajan Terminalinden Aktarılan Kod',
                  language: lang || 'python',
                  category: lang === 'game' ? 'game' : 'general',
                  code,
                  explanation: 'TRAİ Ajan Terminalinden doğrudan stüdyoya aktarıldı.',
                  filename: filename || (lang === 'game' ? 'CyberGame.html' : 'script.py'),
                  runnable: true,
                  timestamp: new Date().toISOString(),
                };
                setSnippets((prev) => [newSnip, ...prev]);
                soundFx.playConfirm(settings.soundEnabled);
              }}
              soundEnabled={settings.soundEnabled}
              ttsVoice={settings.ttsVoice}
              speechRate={settings.speechRate}
              isDarkMode={settings.isDarkMode}
            />
          )}

          {activeTab === 'chat' && (
            <div className="relative">
              <ChatbotView
                messages={messages}
                onSendMessage={handleSendMessage}
                isLoading={isChatLoading}
                accent={settings.accentTheme}
                userTitle={settings.userTitle}
                soundEnabled={settings.soundEnabled}
                ttsVoice={settings.ttsVoice}
                speechRate={settings.speechRate}
                onOpenVoiceModal={() => setIsVoiceModalOpen(true)}
                onSendToCodeStudio={(code, lang) => {
                  setActiveTab('code');
                  const newSnip: CodeSnippet = {
                    id: 'snip-' + Date.now(),
                    prompt: 'Sohbetten Aktarılan Kod',
                    language: (lang as SupportedLanguage) || 'python',
                    code,
                    explanation: 'TRAİ sohbet akışından doğrudan kod stüdyosuna aktarıldı.',
                    filename: `snippet.${lang === 'python' ? 'py' : lang === 'react' ? 'tsx' : 'ts'}`,
                    runnable: true,
                    timestamp: new Date().toISOString(),
                  };
                  setSnippets((prev) => [newSnip, ...prev]);
                  soundFx.playConfirm(settings.soundEnabled);
                }}
              />
            </div>
          )}

          {activeTab === 'code' && (
            <CodeStudio
              snippets={snippets}
              onGenerateCode={handleGenerateCode}
              onUpdateSnippet={handleUpdateSnippet}
              onDeleteSnippet={handleDeleteSnippet}
              onAddSnippet={handleAddSnippet}
              isLoading={isCodeLoading}
              accent={settings.accentTheme}
              userTitle={settings.userTitle}
              soundEnabled={settings.soundEnabled}
              ttsVoice={settings.ttsVoice}
              speechRate={settings.speechRate}
            />
          )}

          {activeTab === 'organizer' && (
            <DailyOrganizer
              tasks={tasks}
              onAddTask={(task) => {
                setTasks((prev) => [
                  {
                    ...task,
                    id: 't-' + Date.now(),
                    createdAt: new Date().toISOString(),
                  },
                  ...prev,
                ]);
              }}
              onToggleTask={(id) => {
                setTasks((prev) =>
                  prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
                );
                soundFx.playClick(settings.soundEnabled);
              }}
              onDeleteTask={(id) => {
                setTasks((prev) => prev.filter((t) => t.id !== id));
                soundFx.playClick(settings.soundEnabled);
              }}
              dailyPlan={dailyPlan}
              onGeneratePlan={handleGeneratePlan}
              isGeneratingPlan={isGeneratingPlan}
              accent={settings.accentTheme}
              userTitle={settings.userTitle}
              soundEnabled={settings.soundEnabled}
              ttsVoice={settings.ttsVoice}
              speechRate={settings.speechRate}
            />
          )}

          {activeTab === 'research' && (
            <ResearchStudio
              reports={reports}
              onExecuteResearch={handleExecuteResearch}
              isLoading={isResearchLoading}
              accent={settings.accentTheme}
              userTitle={settings.userTitle}
              soundEnabled={settings.soundEnabled}
              ttsVoice={settings.ttsVoice}
              speechRate={settings.speechRate}
            />
          )}

          {activeTab === 'vision' && (
            <VisionStudio
              analyses={analyses}
              onAnalyzePhoto={handleAnalyzePhoto}
              isLoading={isVisionLoading}
              accent={settings.accentTheme}
              userTitle={settings.userTitle}
              soundEnabled={settings.soundEnabled}
              ttsVoice={settings.ttsVoice}
              speechRate={settings.speechRate}
            />
          )}

          {activeTab === 'vault' && (
            <VaultSyncModal
              settings={settings}
              pairedDevices={pairedDevices}
              onSyncNow={performCloudSync}
              onPairNewSync={handlePairNewSync}
              onExportBackup={handleExportBackup}
              onImportBackup={handleImportBackup}
              isSyncing={isSyncing}
              accent={settings.accentTheme}
              userTitle={settings.userTitle}
              soundEnabled={settings.soundEnabled}
            />
          )}
        </main>

        {/* 3. Bottom HUD Control Deck (matching screenshot) */}
        <BottomBar
          accent={settings.accentTheme}
          isVoiceActive={isVoiceModalOpen || speechState === 'listening'}
          onToggleVoice={() => {
            soundFx.playTraiWake(settings.soundEnabled);
            setIsVoiceModalOpen(!isVoiceModalOpen);
          }}
          onPlayBriefing={handlePlayBriefing}
          isPlayingBriefing={isPlayingBriefing}
          isDarkMode={settings.isDarkMode}
        />
      </div>

      {/* Voice Assistant HUD Modal */}
      <VoiceAssistantModal
        isOpen={isVoiceModalOpen}
        onClose={() => setIsVoiceModalOpen(false)}
        accent={settings.accentTheme}
        userTitle={settings.userTitle}
        onVoiceCommandSubmit={handleVoiceCommand}
        soundEnabled={settings.soundEnabled}
        ttsVoice={settings.ttsVoice}
        speechRate={settings.speechRate}
      />

      {/* System & Interface Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onUpdateSettings={(updated) => setSettings((prev) => ({ ...prev, ...updated }))}
        soundEnabled={settings.soundEnabled}
      />
    </div>
  );
}
