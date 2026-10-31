import React from 'react';
import { SpeechState } from '../services/speech';
import { AccentTheme } from '../types';

interface ArcReactorOrbProps {
  state: SpeechState;
  accent: AccentTheme;
  onClick?: () => void;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const ArcReactorOrb: React.FC<ArcReactorOrbProps> = ({
  state,
  accent,
  onClick,
  size = 'md',
  className = '',
}) => {
  // Theme color maps
  const colorMap = {
    cyan: {
      ring: 'border-cyan-400',
      glow: 'shadow-[0_0_50px_rgba(34,211,238,0.5)]',
      bgGlow: 'from-cyan-500/20 via-sky-500/10 to-transparent',
      text: 'text-cyan-400',
      pulse: 'bg-cyan-400',
      accentHex: '#06b6d4',
    },
    gold: {
      ring: 'border-amber-400',
      glow: 'shadow-[0_0_50px_rgba(251,191,36,0.5)]',
      bgGlow: 'from-amber-500/20 via-orange-500/10 to-transparent',
      text: 'text-amber-400',
      pulse: 'bg-amber-400',
      accentHex: '#f59e0b',
    },
    emerald: {
      ring: 'border-emerald-400',
      glow: 'shadow-[0_0_50px_rgba(52,211,153,0.5)]',
      bgGlow: 'from-emerald-500/20 via-teal-500/10 to-transparent',
      text: 'text-emerald-400',
      pulse: 'bg-emerald-400',
      accentHex: '#10b981',
    },
    violet: {
      ring: 'border-violet-400',
      glow: 'shadow-[0_0_50px_rgba(167,139,250,0.5)]',
      bgGlow: 'from-violet-500/20 via-indigo-500/10 to-transparent',
      text: 'text-violet-400',
      pulse: 'bg-violet-400',
      accentHex: '#8b5cf6',
    },
  }[accent];

  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-32 h-32 md:w-36 md:h-36',
    lg: 'w-48 h-48 md:w-56 md:h-56',
  }[size];

  const isListening = state === 'listening';
  const isProcessing = state === 'processing';
  const isSpeaking = state === 'speaking';

  return (
    <div
      onClick={onClick}
      role="button"
      tabIndex={0}
      aria-label={`TRAİ Akıllı Çekirdek - Durum: ${state}`}
      className={`relative flex items-center justify-center cursor-pointer select-none group transition-transform duration-300 hover:scale-105 active:scale-95 ${sizeClasses} ${className}`}
    >
      {/* Outer ambient glow */}
      <div
        className={`absolute inset-0 rounded-full bg-gradient-radial ${colorMap.bgGlow} transition-all duration-700 ${
          isSpeaking || isListening ? 'scale-125 opacity-100' : 'scale-100 opacity-60 group-hover:opacity-90'
        }`}
      />

      {/* Outer rotating mechanical reticle ring */}
      <div
        className={`absolute inset-0 rounded-full border border-dashed ${colorMap.ring} opacity-40 transition-all ${
          isProcessing
            ? 'animate-spin'
            : isSpeaking
            ? 'animate-[spin_4s_linear_infinite]'
            : 'animate-[spin_12s_linear_infinite]'
        }`}
      />

      {/* Middle energy conduit ring */}
      <div
        className={`absolute inset-2 md:inset-3 rounded-full border ${colorMap.ring} opacity-70 transition-all duration-300 ${
          isListening
            ? 'animate-ping opacity-60'
            : isSpeaking
            ? 'scale-105 shadow-[0_0_20px_currentColor]'
            : ''
        }`}
      />

      {/* Core Iris graphic container */}
      <div
        className={`relative w-4/5 h-4/5 rounded-full overflow-hidden border-2 ${colorMap.ring} ${colorMap.glow} bg-gray-950 flex items-center justify-center`}
      >
        <img
          src="/src/assets/images/jarvis_arc_reactor_1792092883443.jpg"
          alt="TRAİ Akıllı Çekirdek"
          referrerPolicy="no-referrer"
          className={`w-full h-full object-cover transition-transform duration-500 ${
            isSpeaking ? 'scale-110' : isListening ? 'scale-105' : 'scale-100'
          }`}
        />

        {/* Dynamic center light flare overlay */}
        <div
          className={`absolute inset-0 bg-radial from-white/30 via-transparent to-black/60 mix-blend-screen transition-opacity ${
            isSpeaking || isListening ? 'opacity-90' : 'opacity-40 group-hover:opacity-75'
          }`}
        />

        {/* Audio frequency bars when speaking / listening */}
        {(isSpeaking || isListening) && (
          <div className="absolute inset-0 flex items-center justify-center gap-1 pointer-events-none bg-black/40 backdrop-blur-[1px]">
            <span className={`w-1 bg-white rounded-full animate-[pulse_0.4s_ease-in-out_infinite] h-4`} />
            <span className={`w-1 bg-white rounded-full animate-[pulse_0.6s_ease-in-out_infinite] h-8`} />
            <span className={`w-1 bg-white rounded-full animate-[pulse_0.3s_ease-in-out_infinite] h-6`} />
            <span className={`w-1 bg-white rounded-full animate-[pulse_0.5s_ease-in-out_infinite] h-9`} />
            <span className={`w-1 bg-white rounded-full animate-[pulse_0.4s_ease-in-out_infinite] h-5`} />
          </div>
        )}
      </div>

      {/* State Badge on hover / active */}
      <div className="absolute -bottom-7 whitespace-nowrap text-[11px] font-mono tracking-wider uppercase opacity-80 group-hover:opacity-100">
        <span className={colorMap.text}>
          {isListening && 'Dinliyor...'}
          {isProcessing && 'İşleniyor...'}
          {isSpeaking && 'Yanıtlıyor...'}
          {state === 'idle' && 'J.A.R.V.I.S. Hazır'}
        </span>
      </div>
    </div>
  );
};
