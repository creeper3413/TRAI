import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  Plus,
  CheckCircle2,
  Circle,
  Sparkles,
  Volume2,
  Trash2,
  Target,
  Zap,
  Filter,
} from 'lucide-react';
import { Task, DailyPlan, PriorityLevel, TaskCategory, AccentTheme } from '../types';
import { speechService } from '../services/speech';
import { soundFx } from '../services/soundFx';

interface DailyOrganizerProps {
  tasks: Task[];
  onAddTask: (task: Omit<Task, 'id' | 'createdAt'>) => void;
  onToggleTask: (id: string) => void;
  onDeleteTask: (id: string) => void;
  dailyPlan: DailyPlan | null;
  onGeneratePlan: () => Promise<void>;
  isGeneratingPlan: boolean;
  accent: AccentTheme;
  userTitle: string;
  soundEnabled: boolean;
  ttsVoice: 'Fenrir' | 'Kore' | 'Zephyr' | 'Puck';
  speechRate: number;
}

export const DailyOrganizer: React.FC<DailyOrganizerProps> = ({
  tasks,
  onAddTask,
  onToggleTask,
  onDeleteTask,
  dailyPlan,
  onGeneratePlan,
  isGeneratingPlan,
  accent,
  userTitle,
  soundEnabled,
  ttsVoice,
  speechRate,
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [title, setTitle] = useState('');
  const [time, setTime] = useState('');
  const [priority, setPriority] = useState<PriorityLevel>('medium');
  const [category, setCategory] = useState<TaskCategory>('deep_work');
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [isPlayingBrief, setIsPlayingBrief] = useState(false);

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onAddTask({
      title: title.trim(),
      time: time || undefined,
      date: new Date().toISOString().split('T')[0],
      priority,
      category,
      completed: false,
    });

    setTitle('');
    setTime('');
    setIsAdding(false);
    soundFx.playConfirm(soundEnabled);
  };

  const handlePlayBriefing = async () => {
    if (!dailyPlan?.briefing) return;
    if (isPlayingBrief) {
      speechService.stopSpeaking();
      setIsPlayingBrief(false);
      return;
    }

    setIsPlayingBrief(true);
    await speechService.speak(dailyPlan.briefing, ttsVoice, speechRate);
    setIsPlayingBrief(false);
  };

  const filteredTasks = tasks.filter((t) => {
    if (filter === 'pending') return !t.completed;
    if (filter === 'completed') return t.completed;
    return true;
  });

  const completedCount = tasks.filter((t) => t.completed).length;
  const progressPercent = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  const accentColor = {
    cyan: 'bg-cyan-500 text-slate-950 hover:bg-cyan-400',
    gold: 'bg-amber-500 text-slate-950 hover:bg-amber-400',
    emerald: 'bg-emerald-500 text-slate-950 hover:bg-emerald-400',
    violet: 'bg-violet-500 text-slate-950 hover:bg-violet-400',
  }[accent];

  const categoryLabels: Record<TaskCategory, string> = {
    deep_work: 'Derin Odaklanma',
    meeting: 'Toplantı / Görüşme',
    routine: 'Rutin İş',
    health: 'Sağlık & Mola',
    personal: 'Kişisel',
    urgent: 'Acil Görev',
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto w-full pb-16">
      {/* Top Banner / AI Operational Briefing */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800/80">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-slate-500 uppercase tracking-wider mb-1">
              <Calendar className="w-3.5 h-3.5 text-cyan-400" />
              <span>GÜNLÜK İŞ & ZAMAN ORGANİZATÖRÜ</span>
              <span aria-hidden="true">·</span>
              <span className="tabular-nums">{new Date().toLocaleDateString('tr-TR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100">
              Operasyonel Brifing & Ajanda
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onGeneratePlan}
              disabled={isGeneratingPlan}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all cursor-pointer ${accentColor} disabled:opacity-50`}
            >
              <Sparkles className="w-4 h-4" />
              <span>{isGeneratingPlan ? 'Optimize Ediliyor...' : 'Günü AI ile Optimize Et'}</span>
            </button>
          </div>
        </div>

        {/* AI Briefing Card */}
        {dailyPlan ? (
          <div className="mt-4 pt-2 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-cyan-400 uppercase tracking-wide">TRAİ Günlük Brifingi</span>
                <button
                  onClick={handlePlayBriefing}
                  className="text-xs text-slate-400 hover:text-cyan-400 flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Volume2 className={`w-3.5 h-3.5 ${isPlayingBrief ? 'text-cyan-400 animate-pulse' : ''}`} />
                  <span>{isPlayingBrief ? 'Durdur' : 'Sesli Dinle'}</span>
                </button>
              </div>
              <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                {dailyPlan.briefing}
              </p>
            </div>

            <div className="space-y-3 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 text-xs">
              <div>
                <div className="flex items-center gap-1.5 text-amber-500 font-medium mb-0.5">
                  <Target className="w-3.5 h-3.5" />
                  <span>Ana Odak Noktası</span>
                </div>
                <p className="text-slate-600 dark:text-slate-400">{dailyPlan.focusRecommendation}</p>
              </div>

              <div>
                <div className="flex items-center gap-1.5 text-emerald-500 font-medium mb-0.5">
                  <Zap className="w-3.5 h-3.5" />
                  <span>Enerji Stratejisi</span>
                </div>
                <p className="text-slate-600 dark:text-slate-400">{dailyPlan.energyStrategy}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-4 py-4 text-center">
            <p className="text-xs text-slate-500">
              Görevlerinize göre optimize edilmiş zaman blokları ve sesli sabah brifingi almak için yukarıdaki butona tıklayın.
            </p>
          </div>
        )}
      </div>

      {/* Progress & Task Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Task List (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                Bugünün Görevleri
              </h2>
              <span className="text-xs font-mono text-slate-500 tabular-nums">
                ({completedCount}/{tasks.length})
              </span>
            </div>

            {/* Segmented Filter Control */}
            <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-900 rounded-lg text-xs">
              <button
                onClick={() => setFilter('all')}
                className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                  filter === 'all'
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Tümü
              </button>
              <button
                onClick={() => setFilter('pending')}
                className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                  filter === 'pending'
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Bekleyen
              </button>
              <button
                onClick={() => setFilter('completed')}
                className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                  filter === 'completed'
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Tamamlanan
              </button>
            </div>
          </div>

          {/* Quick Add Button or Form */}
          {isAdding ? (
            <form
              onSubmit={handleCreateTask}
              className="p-4 rounded-xl border border-cyan-500/40 bg-white dark:bg-slate-900 space-y-3"
            >
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Görev veya hedef başlığı (örn: AR-GE Raporu İncelemesi)..."
                autoFocus
                className="w-full text-sm bg-transparent border-b border-slate-200 dark:border-slate-800 pb-2 text-slate-900 dark:text-slate-100 outline-none focus:border-cyan-400"
              />

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="text-slate-500 block mb-1">Saat / Zaman</label>
                  <input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full p-2 rounded-lg bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 outline-none"
                  />
                </div>

                <div>
                  <label className="text-slate-500 block mb-1">Öncelik</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as PriorityLevel)}
                    className="w-full p-2 rounded-lg bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 outline-none"
                  >
                    <option value="high">Yüksek Öncelik</option>
                    <option value="medium">Orta Öncelik</option>
                    <option value="low">Düşük Öncelik</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-500 block mb-1">Kategori</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as TaskCategory)}
                    className="w-full p-2 rounded-lg bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 outline-none"
                  >
                    <option value="deep_work">Derin Odaklanma</option>
                    <option value="meeting">Toplantı</option>
                    <option value="routine">Rutin İş</option>
                    <option value="urgent">Acil Görev</option>
                    <option value="health">Mola & Sağlık</option>
                    <option value="personal">Kişisel</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 cursor-pointer"
                >
                  Vazgeç
                </button>
                <button
                  type="submit"
                  className={`px-4 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${accentColor}`}
                >
                  Görevi Kaydet
                </button>
              </div>
            </form>
          ) : (
            <button
              onClick={() => setIsAdding(true)}
              className="w-full py-2.5 px-4 rounded-xl border border-dashed border-slate-300 dark:border-slate-800 hover:border-cyan-400/50 text-xs text-slate-500 hover:text-cyan-400 flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Yeni Görev veya Randevu Ekle</span>
            </button>
          )}

          {/* Tasks List */}
          <div className="space-y-2">
            {filteredTasks.length === 0 ? (
              <div className="p-8 text-center border border-slate-200 dark:border-slate-800/80 rounded-xl bg-white/50 dark:bg-slate-900/40">
                <p className="text-sm text-slate-500">
                  {filter === 'completed'
                    ? 'Henüz tamamlanan görev bulunmuyor.'
                    : 'Gününüz temiz görünüyor, yeni bir görev ekleyebilir veya sesli komut verebilirsiniz.'}
                </p>
              </div>
            ) : (
              filteredTasks.map((t) => (
                <div
                  key={t.id}
                  className={`p-3.5 rounded-xl border transition-all flex items-center justify-between gap-3 group ${
                    t.completed
                      ? 'bg-slate-50 dark:bg-slate-950/40 border-slate-200 dark:border-slate-900 opacity-60'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-xs'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <button
                      onClick={() => onToggleTask(t.id)}
                      className="text-slate-400 hover:text-cyan-400 transition-colors cursor-pointer shrink-0"
                    >
                      {t.completed ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      ) : (
                        <Circle className="w-5 h-5" />
                      )}
                    </button>

                    <div className="min-w-0">
                      <p
                        className={`text-sm font-medium truncate ${
                          t.completed
                            ? 'line-through text-slate-400 dark:text-slate-500'
                            : 'text-slate-900 dark:text-slate-100'
                        }`}
                      >
                        {t.title}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                        {t.time && (
                          <span className="flex items-center gap-1 tabular-nums font-mono">
                            <Clock className="w-3 h-3" />
                            {t.time}
                          </span>
                        )}
                        {t.time && <span aria-hidden="true">·</span>}
                        <span>{categoryLabels[t.category]}</span>
                        <span aria-hidden="true">·</span>
                        <span
                          className={
                            t.priority === 'high'
                              ? 'text-red-400'
                              : t.priority === 'medium'
                              ? 'text-amber-400'
                              : 'text-slate-400'
                          }
                        >
                          {t.priority === 'high' ? 'Yüksek' : t.priority === 'medium' ? 'Orta' : 'Düşük'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => onDeleteTask(t.id)}
                    className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-400 hover:text-red-400 rounded-md transition-all cursor-pointer"
                    title="Görevi Sil"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column: AI Time-Blocking Timeline (1 col) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              Optimize Edilmiş Zaman Çizelgesi
            </h2>
            <span className="text-xs font-mono text-slate-500 tabular-nums">
              {progressPercent}% Tamamlandı
            </span>
          </div>

          <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 space-y-4">
            {dailyPlan?.schedule && dailyPlan.schedule.length > 0 ? (
              <div className="space-y-3 relative before:absolute before:top-2 before:bottom-2 before:left-3.5 before:w-px before:bg-slate-200 dark:before:bg-slate-800">
                {dailyPlan.schedule.map((block, i) => (
                  <div key={i} className="relative pl-7 group">
                    <div className="absolute left-2.5 top-1.5 w-2 h-2 rounded-full bg-cyan-400 ring-4 ring-white dark:ring-slate-900" />
                    <div className="text-xs font-mono text-cyan-400 tabular-nums mb-0.5">
                      {block.time}
                    </div>
                    <div className="text-sm font-medium text-slate-800 dark:text-slate-200">
                      {block.title}
                    </div>
                    {block.note && (
                      <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                        {block.note}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-xs text-slate-500">
                <Clock className="w-8 h-8 mx-auto mb-2 opacity-40 text-cyan-400" />
                <p>Zaman bloklu program henüz oluşturulmadı.</p>
                <p className="mt-1 text-slate-400">
                  "Günü AI ile Optimize Et" butonuna basarak akıllı akışı oluşturabilirsiniz.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
