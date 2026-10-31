import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Mic,
  Volume2,
  Copy,
  Check,
  Terminal,
  Code2,
  FileCode,
  ExternalLink,
} from 'lucide-react';
import { ChatMessage, AccentTheme } from '../types';
import { speechService } from '../services/speech';
import { soundFx } from '../services/soundFx';

interface ChatbotViewProps {
  messages: ChatMessage[];
  onSendMessage: (text: string) => Promise<void>;
  isLoading: boolean;
  accent: AccentTheme;
  userTitle: string;
  soundEnabled: boolean;
  ttsVoice: 'Fenrir' | 'Kore' | 'Zephyr' | 'Puck';
  speechRate: number;
  onOpenVoiceModal: () => void;
  onSendToCodeStudio?: (code: string, language: string) => void;
}

export const ChatbotView: React.FC<ChatbotViewProps> = ({
  messages,
  onSendMessage,
  isLoading,
  accent,
  userTitle,
  soundEnabled,
  ttsVoice,
  speechRate,
  onOpenVoiceModal,
  onSendToCodeStudio,
}) => {
  const [inputValue, setInputValue] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const text = inputValue;
    setInputValue('');
    soundFx.playClick(soundEnabled);
    await onSendMessage(text);
  };

  const handlePlayVoice = async (msg: ChatMessage) => {
    if (playingId === msg.id) {
      speechService.stopSpeaking();
      setPlayingId(null);
      return;
    }

    setPlayingId(msg.id);
    // Remove code blocks before reading aloud so it doesn't read 100 lines of symbols
    const spokenText = msg.content.replace(/```[\s\S]*?```/g, ' [kod bloğu sağlandı] ');
    await speechService.speak(spokenText, ttsVoice, speechRate);
    setPlayingId(null);
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCopyCodeBlock = (codeId: string, code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCodeId(codeId);
    soundFx.playClick(soundEnabled);
    setTimeout(() => setCopiedCodeId(null), 2000);
  };

  const accentSendBtn = {
    cyan: 'bg-cyan-500 hover:bg-cyan-400 text-slate-950',
    gold: 'bg-amber-500 hover:bg-amber-400 text-slate-950',
    emerald: 'bg-emerald-500 hover:bg-emerald-400 text-slate-950',
    violet: 'bg-violet-500 hover:bg-violet-400 text-slate-950',
  }[accent];

  const quickPrompts = [
    `Python ile veri analizi ve grafik scripti yaz`,
    `React fütüristik cam efektli HUD kartı kodla`,
    `Günlük işlerimi ve önceliklerimi organize et`,
    `FastAPI asenkron REST API servisi yaz`,
  ];

  // Helper to parse and render text with markdown code blocks
  const renderMessageContent = (content: string, msgId: string) => {
    const parts = content.split(/(```[\s\S]*?```)/g);

    return parts.map((part, index) => {
      if (part.startsWith('```') && part.endsWith('```')) {
        const firstLineEnd = part.indexOf('\n');
        const lang = firstLineEnd !== -1 ? part.substring(3, firstLineEnd).trim() : '';
        const code = firstLineEnd !== -1 ? part.substring(firstLineEnd + 1, part.length - 3) : part.substring(3, part.length - 3);
        const codeBlockId = `${msgId}-code-${index}`;

        return (
          <div key={index} className="my-3 rounded-xl border border-slate-700/80 bg-slate-950 overflow-hidden shadow-md">
            {/* Code Block Header */}
            <div className="flex items-center justify-between px-3.5 py-2 bg-slate-900 border-b border-slate-800 text-xs font-mono">
              <div className="flex items-center gap-2 text-cyan-400">
                <FileCode className="w-3.5 h-3.5" />
                <span className="uppercase text-[11px] font-semibold">{lang || 'CODE'}</span>
              </div>
              <div className="flex items-center gap-2">
                {onSendToCodeStudio && (
                  <button
                    onClick={() => onSendToCodeStudio(code, lang)}
                    className="text-[11px] text-slate-400 hover:text-cyan-400 flex items-center gap-1 transition-colors cursor-pointer"
                    title="Kod Stüdyosunda Aç"
                  >
                    <ExternalLink className="w-3 h-3" />
                    <span className="hidden sm:inline">Stüdyoda Aç</span>
                  </button>
                )}
                <button
                  onClick={() => handleCopyCodeBlock(codeBlockId, code)}
                  className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
                >
                  {copiedCodeId === codeBlockId ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span className="text-emerald-400">Kopyalandı</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Kopyala</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Code Text with line numbers styling */}
            <div className="p-3.5 overflow-x-auto text-xs font-mono text-cyan-200/90 leading-relaxed max-h-96">
              <pre className="whitespace-pre font-mono">{code}</pre>
            </div>
          </div>
        );
      }

      return (
        <span key={index} className="whitespace-pre-wrap">
          {part}
        </span>
      );
    });
  };

  return (
    <div className="flex flex-col h-[calc(100vh-10rem)] max-w-4xl mx-auto w-full">
      {/* Header bar / Operational Status */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800 text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <Terminal className="w-3.5 h-3.5 text-cyan-400" />
          <span className="font-mono uppercase tracking-wider">TRAİ İletişim & Danışma Hattı</span>
          <span aria-hidden="true">·</span>
          <span>Hitap: {userTitle}</span>
          <span aria-hidden="true">·</span>
          <span className="text-emerald-400 font-mono">ÇEVRİMİÇİ</span>
        </div>
        <button
          onClick={onOpenVoiceModal}
          className="text-cyan-500 hover:text-cyan-400 font-medium flex items-center gap-1 cursor-pointer transition-colors"
        >
          <Mic className="w-3.5 h-3.5" />
          <span>Sesli Arayüzü Aç</span>
        </button>
      </div>

      {/* Message Stream */}
      <div className="flex-1 overflow-y-auto py-6 space-y-6 pr-2">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} max-w-full`}
            >
              {/* Speaker Label */}
              <div className="flex items-center gap-2 mb-1.5 px-1 text-xs text-slate-500 font-mono">
                <span>{isUser ? userTitle : 'TRAİ'}</span>
                <span aria-hidden="true">·</span>
                <span className="tabular-nums">
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>

              {/* Bubble */}
              <div
                className={`group relative rounded-2xl p-4 text-sm leading-relaxed max-w-[95%] md:max-w-[85%] ${
                  isUser
                    ? 'bg-slate-900 text-white border border-slate-800'
                    : 'bg-white dark:bg-slate-900/90 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-800 shadow-sm'
                }`}
              >
                <div>{renderMessageContent(msg.content, msg.id)}</div>

                {/* Assistant Controls: Play TTS & Copy */}
                {!isUser && (
                  <div className="flex items-center gap-3 mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500">
                    <button
                      onClick={() => handlePlayVoice(msg)}
                      className="flex items-center gap-1.5 hover:text-cyan-400 transition-colors cursor-pointer"
                      title="Seslendir"
                    >
                      <Volume2 className={`w-3.5 h-3.5 ${playingId === msg.id ? 'text-cyan-400 animate-pulse' : ''}`} />
                      <span>{playingId === msg.id ? 'Durdur' : 'Sesli Oku'}</span>
                    </button>

                    <button
                      onClick={() => handleCopy(msg.id, msg.content)}
                      className="flex items-center gap-1 hover:text-slate-300 transition-colors cursor-pointer"
                      title="Tüm Yanıtı Kopyala"
                    >
                      {copiedId === msg.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-400">Kopyalandı</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Metni Kopyala</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex flex-col items-start">
            <div className="flex items-center gap-2 mb-1.5 px-1 text-xs text-slate-500 font-mono">
              <span>TRAİ</span>
              <span aria-hidden="true">·</span>
              <span>Kodlanıyor / Düşünülüyor...</span>
            </div>
            <div className="rounded-2xl p-4 bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce" />
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce [animation-delay:0.2s]" />
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce [animation-delay:0.4s]" />
              <span className="text-xs text-slate-400 font-mono ml-2">Nöral çekirdek kodluyor...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Prompts */}
      <div className="py-2 flex items-center gap-2 overflow-x-auto no-scrollbar">
        {quickPrompts.map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => {
              setInputValue(prompt);
            }}
            className="text-xs px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800 whitespace-nowrap transition-colors cursor-pointer shrink-0"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Chat Input Box */}
      <form onSubmit={handleSubmit} className="pt-2">
        <div className="relative flex items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-lg transition-all focus-within:ring-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={`TRAİ'ye kod yazdırın veya bir soru sorun (${userTitle})...`}
            className="w-full py-3.5 pl-4 pr-24 bg-transparent text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 outline-none"
          />

          <div className="absolute right-2 flex items-center gap-1.5">
            <button
              type="button"
              onClick={onOpenVoiceModal}
              title="Sesli Konuş"
              className="p-2 rounded-lg text-slate-400 hover:text-cyan-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <Mic className="w-4 h-4" />
            </button>

            <button
              type="submit"
              disabled={!inputValue.trim() || isLoading}
              className={`p-2 rounded-lg transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${accentSendBtn}`}
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
