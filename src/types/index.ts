export type PriorityLevel = 'high' | 'medium' | 'low';

export type TaskCategory = 'deep_work' | 'meeting' | 'routine' | 'health' | 'personal' | 'urgent';

export interface Task {
  id: string;
  title: string;
  description?: string;
  time?: string;
  date: string;
  priority: PriorityLevel;
  category: TaskCategory;
  completed: boolean;
  createdAt: string;
}

export interface ScheduleBlock {
  time: string;
  title: string;
  category: TaskCategory;
  priority: PriorityLevel;
  note?: string;
}

export interface DailyPlan {
  date: string;
  briefing: string;
  focusRecommendation: string;
  energyStrategy: string;
  schedule: ScheduleBlock[];
  updatedAt: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  audioUrl?: string;
  isStreaming?: boolean;
}

export interface ResearchReport {
  id: string;
  query: string;
  depth: 'summary' | 'standard' | 'comprehensive';
  report: string;
  timestamp: string;
}

export interface VisionAnalysis {
  id: string;
  imageUrl: string;
  prompt: string;
  mode: 'general' | 'document' | 'technical';
  analysis: string;
  timestamp: string;
}

export type SupportedLanguage = 'game' | 'python' | 'typescript' | 'javascript' | 'react' | 'html' | 'sql' | 'bash' | 'cpp' | 'rust';

export type CodeCategory = 'all' | 'game' | 'web' | 'ai' | 'backend' | 'systems' | 'devops' | 'general';

export interface CodeSnippet {
  id: string;
  prompt: string;
  language: SupportedLanguage;
  category?: CodeCategory;
  code: string;
  explanation: string;
  filename: string;
  runnable?: boolean;
  timestamp: string;
}

export type AccentTheme = 'cyan' | 'gold' | 'emerald' | 'violet';

export interface AppSettings {
  isDarkMode: boolean;
  accentTheme: AccentTheme;
  userTitle: string;
  soundEnabled: boolean;
  autoSpeak: boolean;
  ttsVoice: 'Fenrir' | 'Kore' | 'Zephyr' | 'Puck';
  wakeWordEnabled: boolean;
  speechRate: number;
  compactMode: boolean;
  syncId: string;
  lastSyncedAt?: string;
}

export interface PairedDevice {
  id: string;
  name: string;
  type: 'ios' | 'android' | 'windows' | 'mac' | 'web';
  lastSeen: string;
  isCurrent?: boolean;
}

export interface SyncPackage {
  syncId: string;
  payload: any;
  updatedAt: string;
  deviceId: string;
  deviceName: string;
  deviceType: 'ios' | 'android' | 'windows' | 'mac' | 'web';
}
