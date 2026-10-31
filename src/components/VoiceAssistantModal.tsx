import React, { useEffect, useState } from 'react';
import { X, Mic, Volume2, Sparkles, CheckCircle2 } from 'lucide-react';
import { ArcReactorOrb } from './ArcReactorOrb';
import { SpeechState, speechService } from '../services/speech';
import { AccentTheme } from '../types';
import { soundFx } from '../services/soundFx';

interface VoiceAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  accent: AccentTheme;
  userTitle: string;
  onVoiceCommandSubmit: (transcript: string) => Promise<string | void>;
  soundEnabled: boolean;
  ttsVoice: 'Fenrir' | 'Kore' | 'Zephyr' | 'Puck';
  speechRate: number;
}

export const VoiceAssistantModal: React.FC<VoiceAssistantModalProps> = ({
  isOpen,
  onClose,
  accent,
  userTitle,
  onVoiceCommandSubmit,
  soundEnabled,
  ttsVoice,
  speechRate,
}) => {
  const [speechState, setSpeechState] = useState<SpeechState>('idle');
  const [liveTranscript, setLiveTranscript] = useState('');
  const [lastResponse, setLastResponse] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const unsub = speechService.subscribeState((state) => {
      setSpeechState(state);
    });
    return unsub;
  }, []);

  useEffect(() => {
    if (isOpen) {
      soundFx.playTraiWake(soundEnabled);
      startVoiceSession();
    } else {
      speechService.stopListening();
      speechService.stopSpeaking();
    }
    return () => {
      speechService.stopListening();
      speechService.stopSpeaking();
    };
  }, [isOpen]);

  const startVoiceSession = () => {
    setLiveTranscript('');
    speechService.startListening(
      async (text, isFinal) => {
        setLiveTranscript(text);
        if (isFinal && text.trim().length > 2) {
          await handleCommand(text);
        }
      },
      () => {
        soundFx.playClick(soundEnabled);
      },
      (err) => {
        console.warn('Voice error:', err);
      }
    );
  };

  const handleCommand = async (command: string) => {
    if (isProcessing) return;
    setIsProcessing(true);
    speechService.stopListening();
    soundFx.playConfirm(soundEnabled);

    try {
      const response = await onVoiceCommandSubmit(command);
      if (response) {
        setLastResponse(response);
        await speechService.speak(response, ttsVoice, speechRate);
      }
    } catch (e: any) {
      setLastResponse('Bir hata oluştu: ' + (e?.message || 'Bilinmiyor'));
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  const quickPrompts = [
    'Bugünkü ajandamı özetle',
    'Saat 16:00 için yeni görev ekle',
    'Bugün için odaklanma planı çıkar',
    'Kuantum bilişim hakkında hızlı brifing ver',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-950/90 backdrop-blur-xl animate-in fade-in duration-300">
      {/* Background HUD concentric radial lines */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden opacity-25">
        <div className="w-[600px] h-[600px] rounded-full border border-cyan-500/20 animate-[spin_60s_linear_infinite]" />
        <div className="w-[450px] h-[450px] rounded-full border border-dashed border-cyan-500/30" />
        <div className="w-[300px] h-[300px] rounded-full border border-cyan-500/15" />
      </div>

      {/* Main Dialog Card */}
      <div className="relative w-full max-w-xl bg-slate-900/90 border border-slate-700/80 rounded-2xl shadow-2xl p-6 sm:p-8 flex flex-col items-center text-center">
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Kapat"
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Top Kicker */}
        <div className="flex items-center gap-2 text-xs font-mono tracking-wider text-slate-400 mb-6">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>TRAİ SESLİ İLETİŞİM MERKEZİ</span>
          <span aria-hidden="true">·</span>
          <span>CANLI SES HATTI AKTİF</span>
        </div>

        {/* Glowing Arc Reactor Visualizer */}
        <div className="my-2">
          <ArcReactorOrb
            size="lg"
            state={isProcessing ? 'processing' : speechState}
            accent={accent}
            onClick={() => {
              if (speechState === 'listening') {
                speechService.stopListening();
              } else {
                startVoiceSession();
              }
            }}
          />
        </div>

        {/* Status Prompt */}
        <div className="mt-8 mb-4 min-h-[50px] flex flex-col items-center justify-center">
          {speechState === 'listening' && (
            <p className="text-lg font-medium text-slate-100 animate-pulse">
              {liveTranscript || `Sizi dinliyorum, ${userTitle}...`}
            </p>
          )}
          {isProcessing && (
            <p className="text-sm font-sans text-cyan-400 animate-pulse">
              İsteğinizi inceliyorum, hemen hazırlıyorum...
            </p>
          )}
          {speechState === 'speaking' && (
            <div className="flex items-center gap-2 text-emerald-400 font-medium text-sm">
              <Volume2 className="w-4 h-4 animate-bounce" />
              <span>Yanıt seslendiriliyor...</span>
            </div>
          )}
          {speechState === 'idle' && !isProcessing && (
            <p className="text-sm text-slate-400">
              Konuşmak için mikrofona dokunun veya doğrudan konuşun.
            </p>
          )}
        </div>

        {/* Response Box if available */}
        {lastResponse && (
          <div className="w-full mt-2 p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 text-left text-sm text-slate-300 max-h-40 overflow-y-auto font-sans leading-relaxed">
            <span className="font-mono text-xs text-cyan-400 block mb-1">TRAİ:</span>
            {lastResponse}
          </div>
        )}

        {/* Quick Voice Suggestions */}
        <div className="w-full mt-6 pt-4 border-t border-slate-800/80">
          <p className="text-xs text-slate-500 mb-2 font-mono">ÖRNEK SESLİ KOMUTLAR</p>
          <div className="flex flex-wrap justify-center gap-2">
            {quickPrompts.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setLiveTranscript(prompt);
                  handleCommand(prompt);
                }}
                className="text-xs px-3 py-1.5 rounded-lg bg-slate-800/70 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/50 transition-colors cursor-pointer"
              >
                "{prompt}"
              </button>
            ))}
          </div>
        </div>

        {/* Manual Mic Toggle */}
        <div className="mt-6 flex items-center gap-3">
          <button
            onClick={() => {
              if (speechState === 'listening') {
                speechService.stopListening();
              } else {
                startVoiceSession();
              }
            }}
            className={`px-5 py-2.5 rounded-xl font-medium text-sm flex items-center gap-2 cursor-pointer transition-all ${
              speechState === 'listening'
                ? 'bg-red-500 hover:bg-red-600 text-white shadow-[0_0_15px_rgba(239,68,68,0.4)]'
                : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-[0_0_15px_rgba(34,211,238,0.4)]'
            }`}
          >
            <Mic className="w-4 h-4" />
            <span>{speechState === 'listening' ? 'Dinlemeyi Durdur' : 'Dinlemeyi Başlat'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
