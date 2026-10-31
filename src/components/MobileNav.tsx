import React from 'react';
import { MessageSquare, CalendarCheck, Code2, Search, Image, ShieldCheck } from 'lucide-react';
import { ActiveTab } from './Header';
import { AccentTheme } from '../types';

interface MobileNavProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  accent: AccentTheme;
}

export const MobileNav: React.FC<MobileNavProps> = ({ activeTab, onTabChange, accent }) => {
  const accentActive = {
    cyan: 'text-cyan-400',
    gold: 'text-amber-400',
    emerald: 'text-emerald-400',
    violet: 'text-violet-400',
  }[accent];

  const tabs: Array<{ id: ActiveTab; label: string; icon: any }> = [
    { id: 'chat', label: 'Asistan', icon: MessageSquare },
    { id: 'organizer', label: 'Ajanda', icon: CalendarCheck },
    { id: 'code', label: 'Kod & Oyun', icon: Code2 },
    { id: 'research', label: 'Araştırma', icon: Search },
    { id: 'vision', label: 'Görsel', icon: Image },
    { id: 'vault', label: 'Bulut', icon: ShieldCheck },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/90 dark:bg-gray-950/90 backdrop-blur-lg border-t border-slate-200 dark:border-slate-800/80 px-2 py-1.5 flex items-center justify-around">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex flex-col items-center justify-center p-1.5 rounded-lg transition-colors cursor-pointer ${
              isActive ? accentActive : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
            }`}
          >
            <Icon className="w-4 h-4 mb-0.5" />
            <span className="text-[10px] font-medium tracking-tight whitespace-nowrap">{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
};
