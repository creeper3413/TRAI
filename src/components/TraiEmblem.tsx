import React from 'react';
import { AccentTheme } from '../types';

interface TraiEmblemProps {
  accent: AccentTheme;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  isPulsing?: boolean;
  isDarkMode?: boolean;
}

export const TraiEmblem: React.FC<TraiEmblemProps> = ({
  accent,
  size = 'md',
  isPulsing = false,
  isDarkMode = false,
}) => {
  const colorMap = {
    cyan: {
      primary: '#06b6d4',
      secondary: '#38bdf8',
      gradientStart: '#0284c7',
      gradientEnd: '#06b6d4',
    },
    gold: {
      primary: '#f59e0b',
      secondary: '#fbbf24',
      gradientStart: '#d97706',
      gradientEnd: '#fbbf24',
    },
    emerald: {
      primary: '#10b981',
      secondary: '#34d399',
      gradientStart: '#059669',
      gradientEnd: '#10b981',
    },
    violet: {
      primary: '#8b5cf6',
      secondary: '#a78bfa',
      gradientStart: '#7c3aed',
      gradientEnd: '#8b5cf6',
    },
  }[accent];

  const sizePx = {
    sm: 32,
    md: 40,
    lg: 52,
    xl: 64,
  }[size];

  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 ${
        isPulsing ? 'animate-pulse' : ''
      }`}
      style={{ width: sizePx, height: sizePx }}
    >
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full transition-transform duration-300 hover:scale-105"
      >
        <defs>
          <linearGradient id={`trai-grad-${accent}`} x1="15%" y1="10%" x2="85%" y2="90%">
            <stop offset="0%" stopColor={colorMap.gradientStart} />
            <stop offset="100%" stopColor={colorMap.gradientEnd} />
          </linearGradient>
          <linearGradient id={`trai-subtle-${accent}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={isDarkMode ? '#ffffff' : '#0284c7'} stopOpacity={isDarkMode ? '0.2' : '0.1'} />
            <stop offset="100%" stopColor={isDarkMode ? '#ffffff' : '#0284c7'} stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Minimalist Precision Outer Hexagon */}
        <polygon
          points="50,12 84,31 84,69 50,88 16,69 16,31"
          fill={isDarkMode ? '#0f172a' : '#ffffff'}
          stroke={`url(#trai-grad-${accent})`}
          strokeWidth="3.5"
          strokeLinejoin="round"
        />

        {/* Inner Facet Highlight */}
        <polygon
          points="50,18 78,34 78,66 50,82 22,66 22,34"
          fill="none"
          stroke={`url(#trai-subtle-${accent})`}
          strokeWidth="1.5"
          strokeLinejoin="round"
        />

        {/* Crisp Modern T Glyphic Path for TRAİ */}
        <path
          d="M32 36 H68 M50 36 V68"
          stroke={`url(#trai-grad-${accent})`}
          strokeWidth="6.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Minimalist Tech Dot Accent */}
        <circle cx="68" cy="36" r="3.5" fill={colorMap.gradientEnd} />
      </svg>
    </div>
  );
};

export const JarvisEmblem = TraiEmblem;
